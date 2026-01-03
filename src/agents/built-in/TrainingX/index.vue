<template>
  <div class="try-agent" :class="{ 'is-mini': isMini }">
    <!-- 消息区域 -->
    <div class="chat-area">
      <AIWelcome
        v-if="messages.length === 0 && !isInitialLoading"
        v-bind="welcomeConfig"
        @select="handleWelcomeSelect"
        class="content-wrapper"
      />
      
      <ChatSkeleton style="margin-top: 40px;" v-else-if="isInitialLoading && messages.length === 0" class="content-wrapper" />

      <AIHistory 
        v-else
        ref="history"
        :list="messages" 
        :loading="loadingHistory"
        :no-more="allHistoryLoaded"
        :back-button-threshold="50"
        @complete="handleFinish"
        @load-more="handleLoadMore"
        class="history-full-width"
        :ignoreWidgetTypes="['ymform:train_confirm','ymform:train_plan_result','ymform:user_train_finish','ymform:train_cancel','ymform:train_video_process_check']"
      >
        <!-- 自定义 Widget 渲染 -->
        <template #widget="{ info, item, index }">
          <TrainPlanForm
            v-if="info.widgetType === 'ymform:train_plan'"
            :data="info.data"
            :is-history-disabled="index < messages.length - 1" 
            @send-message="handleWidgetSend"
          />

          <UserStudyForm
            v-else-if="info.widgetType === 'ymform:user_study'"
            :data="info.data"
            @learn="handleUserStudyLearn"
          />

          <TrainVideoCard
            v-if="info.widgetType === 'ymform:train_video_upload'"
            :data="info.data"
          />
        </template>

        <template  #footer="{ item, index }" >
          <div style="display: flex; align-items: center; gap: 4px;">
            <!-- 停止任务 ymForm:train_plan_result-->
            <template v-if="item.content.includes('ymform:train_plan_result')" >
              <div 
                class="stop-task" 
                :class="{ 'disabled': item.taskCancelled || item.taskCancelling }"
                @click="handleCancelTask(item)"
              >
                <i class="h-icon-close_f" style="font-size: 24px;"></i>
                <span>{{ item.taskCancelling ? '取消中...' : '取消任务' }}</span>
              </div>
              <span style="padding: 0 4px; color: rgba(0, 0, 0, .1);">|</span>
            </template>

            <template v-else-if="item.content.includes('ymform:user_train_finish')">
              <UserTrainFinish
                :data="item"
                :is-history-disabled="index < messages.length - 1"
                @send-message="handleWidgetSend"
              />
            </template>

            <template v-else-if="item.content.includes('ymform:train_video_process_check')">
              <TrainResultUpload
                :data="item"
              />
            </template>
           
            <BubbleFooter 
              v-show="shouldShowFooter(item)"
              :item="item" 
              :actions="getActions(item)"
              @action="handleAction($event, item, index)"
            >
            </BubbleFooter>
          </div>
          <!-- {{ item }} -->
         
        </template>
      </AIHistory>
    </div>

    <!-- 输入区域 -->
    <div class="footer">
      <div class="content-wrapper">
        <AIInput 
          ref="aiInput"
          v-model="aiInputText"
          :loading="isStreaming || isUploading"
          :showClearButton="false"
          :enable-stop-button="true"
          placeholder="有问题尽管问我~"
          :allowed-types="[]"
          :max-size="200 * 1024 * 1024"
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="asrConfigProvider"
          :button-config="{
            upload: { visible: false, disabled: false },
            clear: { visible: false, disabled: false },
            speech: { visible: true }, // 隐藏语音按钮
          }"
          :send-disabled="sendBtnDisabled"
          @send="handleSend" 
          @stop="handleStop"
          @file-list-change="inputFilesList = $event"
        />

        <p class="footer-text">内容由AI生成，仅供参考</p>
      </div>
    </div>
  </div>
</template>

<script>
import { TrainingXApi } from './api';
import trainingSquareIcon from '@/assets/images/training.png';
import TrainPlanForm from './widgets/TrainPlanForm.vue';
import UserStudyForm from './widgets/UserStudyForm.vue';
import UserTrainFinish from './widgets/UserTrainFinish.vue';
import TrainVideoCard from './widgets/TrainVideoCard.vue';
import TrainResultUpload from './widgets/TrainResultUpload.vue';
import { parseWidgetData } from './widgets/widgetParser';
import { AgentBaseMixin } from '@/mixins/AgentBaseMixin';

export default {
  name: 'TrainingAgent',
  inject: ['sessionApi'],
  mixins: [AgentBaseMixin],
  components: {
    TrainPlanForm,
    UserStudyForm,
    UserTrainFinish,
    TrainVideoCard,
    TrainResultUpload
  },
  props: {
    // 由父组件 (AgentContainer) 传入，指示当前选中的会话 ID
    conversationId: {
      type: String,
      default: ''
    },
    isMini: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      trainingSquareIcon,
      
      welcomeConfig: {
        icon: trainingSquareIcon,
        title: '员工培训助手',
        description: '我可以帮你推荐培训内容、制定员工培训计划、检查培训结果，有培训问题随时找我哦～',
        prompts: [] // 从接口获取
      },
      
      // 白名单用户列表（全局共享）
      whiteUserList: []
    };
  },
  provide() {
    return {
      // 提供获取白名单的方法
      getWhiteUserList: () => this.whiteUserList
    };
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        if (val && !val.startsWith('conv-')) {
          // ...
        } else {
          // 获取推荐的提示词
          this.fetchSuggestions();
        }
      }
    }
  },
  created() {
    // 获取白名单用户列表（全局共享，只调用一次）
    // this.fetchWhiteUserList();
    
    // ========== 临时 Mock 数据（测试用，可随时删除） ==========
    // 在控制台调用：this.$refs.activeAgent.mockTrainPlanForm() 来测试表单
    // 或者取消下面的注释，自动添加测试消息
    // this.mockTrainPlanForm();
    // this.mockUserStudyForm();
    // this.mockUserTrainFinish();
      // this.mockTrainResultUpload();
    },
    methods: {
    /**
     * 提供 API 实例给 Mixin
     */
    getAgentApi() {
      return TrainingXApi;
    },

    /**
     * 新建对话前的钩子，返回 false 可以阻止新建对话
     * @returns {boolean} true-允许新建，false-阻止新建
     */
    beforeNewChat() {
      // // 如果正在流式输出，阻止新建对话
      // if (this.isStreaming) {
      //   this.$message.warning('AI 正在回复中，请稍后再试');
      //   return false;
      // }
      
      // // 如果正在上传文件，阻止新建对话
      // if (this.isUploading) {
      //   this.$message.warning('文件正在上传中，请稍后再试');
      //   return false;
      // }
      
      return true;
    },

    handleCancelTask(item) {
      // 如果已经取消过或正在取消中，直接返回
      if (item.taskCancelled || item.taskCancelling) {
        return;
      }

      // 设置取消中状态，防止重复点击
      this.$set(item, 'taskCancelling', true);

      try {
        const cancelData = parseWidgetData(item, 'ymform:train_plan_result');
        const cancelDataObj = {
          trainCreateKey: cancelData.trainCreateKey
        };
        // // 构造消息格式
        const message = `确认取消 <ymform:train_cancel desc="以下是取消内容">
        ${JSON.stringify(cancelDataObj, null, 2)}
        </ymform:train_cancel>`;

        this.handleWidgetSend(message);
        
        // 标记为已取消，禁用按钮
        this.$set(item, 'taskCancelled', true);
      } finally {
        // 无论成功失败，都清除取消中状态
        this.$set(item, 'taskCancelling', false);
      }
    },
    /**
     * 获取白名单用户列表（全局共享）
     */
    async fetchWhiteUserList() {
      try {
        const { data } = await TrainingXApi.listLearnersByStore(this.$aiClient, { storeId: '' });
        this.whiteUserList = data || [];
      } catch (e) {
        console.error('[TrainingX] Fetch white user list failed:', e);
        this.whiteUserList = [];
      }
    },

    /**
     * 获取智能体推荐的提示词
     */
    async fetchSuggestions() {
      try {
        const res = await TrainingXApi.getSuggestions(this.$aiClient);
        if (res && res.code === 0 && Array.isArray(res.data)) {
          // 将接口返回的字符串数组转换为 prompts 格式
          this.welcomeConfig.prompts = res.data.map(text => ({
            desc: text,
            text: text,
            needsFile: false
          }));
        } 
      } catch (e) {
        console.error('[TrainingX] Fetch suggestions failed:', e);
      }
    },

    getActions(item) {
      // 根据 placement 判断角色：'end' 是用户，'start' 是机器人
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },

    /**
     * 判断是否应该显示 BubbleFooter
     * @param {Object} item - 消息项
     * @returns {boolean} 是否显示 footer
     */
    shouldShowFooter(item) {

      if(item.placement === 'start' && item.role === 'ai') {
        if(!item.msgId) {
          return false
        }
      }

      if (!item || !item.content) {
        return false;
      }

      // 需要隐藏 footer 的 widget 类型列表
      const hideFooterWidgetTypes = [
        'ymform:user_train_finish',
        // 'ymform:train_result_upload'
        // 可以在这里添加更多需要隐藏 footer 的 widget 类型
      ];

      // 检查消息内容中是否包含需要隐藏 footer 的 widget
      return !hideFooterWidgetTypes.some(widgetType => 
        item.content.includes(widgetType)
      );
    },
    
    handleUserStudyLearn(data) {
      // 处理用户学习按钮点击
      // data 包含 courseProjectId, type, detailInfo
      console.log('[TrainingX] User study learn:', data);
      // 可以在这里跳转到学习页面，或者触发其他业务逻辑
      // 例如：window.open(`/training/learn?type=${data.type}&id=${data.courseProjectId}`);
    },

    mockTrainResultUpload() {
      const mockContent = `<ymform:train_video_process_check>
{
  "projectId": "32a0373b23884fd2aca7778db9ce18e4",
  "taskId": "8eceeb944abc479fa1eb0cdbf6f0e711"
}
</ymform:train_video_process_check>`;

      const mockMsg = {
        key: 'mock-train-plan-' + Date.now(),
        role: 'ai',
        content: mockContent,
        attachments: [],
        variant: 'filled',
        placement: 'start',
        time: Date.now()
      };
      
      this.messages.push(mockMsg);
      console.log('[Mock] 已添加测试培训计划表单消息');
    },

    /**
     * 临时 Mock 方法：添加测试培训计划表单消息（可随时删除）
     */
    mockTrainPlanForm() {
      const mockContent = `"根据您的要求汉堡制作培训，匹配您的培训课程。当前课程列表中无直接相关的汉堡制作类课程，但‘炸鸡项目’在食品制作类培训中与汉堡制作同属快餐食品加工范畴，技术流程和操作规范具有较高相似性，可作为替代学习参考。帮您推荐课程如下：<ymform:train_plan>{"courseProjectId":"11ee7b846fbb442ca3e564f82212929f","type":"1","questionId":"","storeId":"","userIds":["08040da51923457aaaf43e4267abcf4e","083360b3255f4a6489e0b159e0be83fe","1681cc62cd7442b1827431d6bada368d","2d5ece66a4b242b0a5914b555046a5af","3f1051db965b470598827d6a600ce9ba","4649d25a7be14f7bb1106219b3bec89c","52b1ff1eebce4424803351c76e1233c7","5d750d152f0e4cd0b66ca3b789251593","63f1a9fa057f4e5d83b0671f199d6a6b","6dda093645b241d5ac7b9a3fb75de9f3","892d117d848d41e4864f14bf98094778","9275b603380e4923aa265c3836f56129","949b8f4e5f2b4d37842aa4a330012839","9bc411a74d424c018d362bd9b12402ac","a1447565e9c24b7aa979b83dba766a16","ccbbca263a6446a4afafa470c5cf1a94","ea6de590832a4e899ad7cc8ef07feb9a","fae79137463c40368a5d746f2d8922a5"]}</ymform:train_plan>






"`;

      const mockMsg = {
        key: 'mock-train-plan-' + Date.now(),
        role: 'ai',
        content: mockContent,
        attachments: [],
        variant: 'filled',
        placement: 'start',
        time: Date.now()
      };
      
      this.messages.push(mockMsg);
      console.log('[Mock] 已添加测试培训计划表单消息');
    },

    /**
     * 临时 Mock 方法：添加测试用户学习表单消息（可随时删除）
     */
    mockUserStudyForm() {
      const mockContent = "您好，yangfucheng6：\n由于您的门店在2025-12-17的检查过程中，发生问题，总部推送您如下内容进行学习，请学习。\n<ymform:user_study desc=\"以下是用户需要学习的内容\">\n {\n    \"courseProjectId\":\"32a0373b23884fd2aca7778db9ce18e4\",\n    \"type\":1\n }\n<ymform:user_study>";

      const mockMsg = {
        key: 'mock-user-study-' + Date.now(),
        role: 'ai',
        content: mockContent,
        attachments: [],
        variant: 'filled',
        placement: 'start',
        time: Date.now()
      };
      
      this.messages.push(mockMsg);
      console.log('[Mock] 已添加测试用户学习表单消息');
    },

    /**
     * 临时 Mock 方法：添加测试用户培训完成（上传视频）消息（可随时删除）
     */
    mockUserTrainFinish() {
      const mockContent = `<ymform:user_train_finish desc="提醒用户上传实操视频">
{
  "projectId": "47823f9efe3047b49fe00027424c46ee",
  "taskIds": ["cf1eb863be8341d9855df12bed57950d", "449f59083d9d461794044b3a1add0514"],
  "storeId": "0250675552214029823f83fede40671e"
}
</ymform:user_train_finish>`;

      const mockMsg = {
        key: 'mock-user-train-finish-' + Date.now(),
        role: 'ai',
        content: mockContent,
        attachments: [],
        variant: 'filled',
        placement: 'start',
        time: Date.now()
      };
      
      this.messages.push(mockMsg);
      console.log('[Mock] 已添加测试用户培训完成（上传视频）消息');
    },
  },
};
</script>

<style lang="scss" scoped>
.try-agent {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  // 小窗模式适配
  &.is-mini {
    .chat-area .content-wrapper,
    .footer .content-wrapper {
      padding: 0 32px;
      max-width: 100%;
    }
  }

  .chat-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    width: 100%;

    .content-wrapper {
      max-width: 960px;
      margin: 0 auto;
      height: 100%;
      padding: 0 32px;

      @media (max-width: 1024px) {
        padding: 0 16px;
      }

      @media (max-width: 768px) {
        max-width: 600px;
        padding: 0 32px;
      }
    }

    .loading-history {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .history-full-width {
      width: 100%;
      height: 100%;
    }

    .stop-task {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      padding: 4px 12px;
      border-radius: 8px;
      background: rgba(255,255,255,1);
      color: rgba($color: #000000, $alpha: .7);
      cursor: pointer;
      transition: opacity 0.2s, color 0.2s;
      &:hover:not(.disabled) {
        color: #666;
      }
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        color: rgba($color: #000000, $alpha: .4);
      }
    }
  }

  .footer {
    flex-shrink: 0;
    width: 100%;
    padding: 16px 0 12px;

    .footer-text {
      font-size: 14px;
      color: rgba($color: #000000, $alpha: .3);
      text-align: center;
      margin-top: 12px;
    }

    .content-wrapper {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 32px;

      @media (max-width: 1024px) {
        padding: 0 16px;
      }

      @media (max-width: 768px) {
        max-width: 600px;
        padding: 0 32px;
      }
    }
  }

  .custom-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: #eee;

    &.user {
      background: #dbefff;
    }

    &.ai {
      background: #e6f7ff;
    }
  }
}
</style>


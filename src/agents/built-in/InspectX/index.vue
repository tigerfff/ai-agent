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
         :ignoreWidgetTypes="['ymform:patrol_plan_delete', 'ymform:patrol_plan_create_result','ymform:patrol_plan_confirm']"
        class="history-full-width"
      >
        <template #widget="{ item, index }">
          <!-- 巡检任务确认表单 -->
          <PatrolPlanForm
            v-if="item.content && item.content.includes('ymform:patrol_plan')"
            :data="parseWidgetData(item, 'ymform:patrol_plan')"
            :is-history-disabled="index < messages.length - 1"
            @send-message="handleWidgetSend"
          />
        </template>

        <template  #footer="{ item, index }" >
          <div style="display: flex; align-items: center; gap: 4px;">
            <!-- 停止任务 ymform:patrol_plan_create_result -->
            <PatrolPlanResult
              v-if="item.content && item.content.includes('ymform:patrol_plan_create_result')"
              :data="parseWidgetData(item, 'ymform:patrol_plan_create_result')"
              @send-message="handleWidgetSend"
            />
            <span 
              v-if="item.content && item.content.includes('ymform:patrol_plan_create_result')" 
              style="padding: 0 4px; color: rgba(0, 0, 0, .1);"
            >|</span>

            <BubbleFooter 
              v-show="shouldShowFooter(item)"
              :item="item" 
              :actions="getActions(item)"
              @action="handleAction($event, item, index)"
            >
            </BubbleFooter>
          </div>
        </template>
      </AIHistory>
    </div>

    <!-- 输入区域 -->
    <div class="footer">
      <div class="content-wrapper">
        <!-- Mock 测试按钮 -->
        <!-- <div style="margin-bottom: 10px; display: flex; gap: 10px;">
          <el-button size="mini" type="warning" plain @click="mockPatrolPlan">测试巡检任务表单</el-button>
        </div> -->

        <AIInput 
          ref="aiInput"
          v-model="aiInputText"
          :loading="isStreaming || isUploading"
          :showClearButton="false"
          :enable-stop-button="true"
          placeholder="有问题尽管问我~"
          :allowed-types="['image']"
          :file-limit="{
            image: { maxSize: 10 * 1024 * 1024, extensions: ['jpg', 'png', 'jpeg'] },
          }"
          :max-size="200 * 1024 * 1024"
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="asrConfigProvider"
          :button-config="{
            upload: { visible: true, disabled: false },
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
import trainingSquareIcon from '@/assets/images/training.png';
import { InspectXApi } from './api';
import PatrolPlanForm from './widgets/PatrolPlanForm.vue';
import PatrolPlanResult from './widgets/PatrolPlanResult.vue';
import { parseWidgetData } from './widgets/widgetParser';
import { AgentBaseMixin } from '@/mixins/AgentBaseMixin';

export default {
  name: 'InspectAgent',
  inject: ['sessionApi'],
  mixins: [AgentBaseMixin],
  components: {
    PatrolPlanForm,
    PatrolPlanResult
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
        title: '智慧巡查',
        description: '我可以帮你推荐培训内容、制定员工培训计划、检查培训结果，有培训问题随时找我哦～',
        prompts: [] // 从接口获取
      },
    };
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        if (val && !val.startsWith('conv-')) {
          // 逻辑已在 Mixin 中处理
        } else {
          // 获取推荐的提示词
          this.fetchSuggestions();
        }
      }
    }
  },
  methods: {
    /**
     * 提供 API 实例给 Mixin
     */
    getAgentApi() {
      return InspectXApi;
    },

    /**
     * 新建对话前的钩子
     */
    beforeNewChat() {
      return true;
    },

    /**
     * 获取智能体推荐的提示词
     */
    async fetchSuggestions() {
      try {
        const res = await InspectXApi.getSuggestions(this.$aiClient);
        if (res && res.code === 0 && Array.isArray(res.data)) {
          this.welcomeConfig.prompts = res.data.map(text => ({
            desc: text,
            text: text,
            needsFile: false
          }));
        } 
      } catch (e) {
        console.error('[InspectX] Fetch suggestions failed:', e);
      }
    },

    getActions(item) {
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },

    /**
     * 判断是否应该显示 BubbleFooter
     */
    shouldShowFooter(item) {
      if (item.placement === 'start' && item.role === 'ai') {
        if (item.loading) return false;
        if (!item.msgId) return false;
        return true
      }
      return !!(item && item.content);
    },

    parseWidgetData(item, type) {
      return parseWidgetData(item, type);
    },

    /**
     * Mock 巡检任务数据测试
     */
    mockPatrolPlan() {
      const mockData = {
        "questions": [
          {
            "groupName": "食品安全问题",
            "itemName": "食材存储温度是否达标",
            "questionName": "检查冷藏冷冻设备中的食材存储温度是否符合标准",
            "questionScore": "",
            "solutionId": "",
            "materialImgUrl": "",
            "sceneIds": ["1", "2"]
          }
        ],
        "templatName": "食品安全智能模板",
        "scopeSearchKey": "全部门店",
        "storeKey": "0",
        "frequency": 2,
        "issueDays": [1,3,5],
        "startDate": "2025-12-03",
        "endDate": "2025-12-30",
        "problemSheetAssignment": 1,
        "patrolTime": {
          "timeType": 1,
          "timeList": [
            {
              "aiStartTime": "08:30:00",
              "aiEndTime": "10:00:00"
            },
            {
              "aiStartTime": "14:00:00",
              "aiEndTime": "16:00:00"
            }
          ]
        },
        "passengerId": ""
      };

      const message = {
        key: Date.now(),
        role: 'ai',
        placement: 'start',
        content: `好的，我已经为您规划好了巡检任务，请确认：\n<ymform:patrol_plan>\n${JSON.stringify(mockData, null, 2)}\n</ymform:patrol_plan>`,
        time: Date.now()
      };

      this.messages.push(message);
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

<template>
  <div class="try-agent" :class="{ 'is-mini': isMini }">
    <!-- 消息区域 -->
    <div class="chat-area">
      <AIWelcome
        v-if="messages.length === 0 && !loadingHistory"
        v-bind="welcomeConfig"
        @select="handleWelcomeSelect"
        class="content-wrapper"
      />
      
      <ChatSkeleton style="margin-top: 40px;" v-else-if="loadingHistory" class="content-wrapper" />

      <AIHistory 
        v-else
        ref="history"
        :list="messages" 
        :back-button-threshold="50"
        @complete="handleFinish"
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
        <div style="margin-bottom: 10px; display: flex; gap: 10px;">
          <el-button size="mini" type="warning" plain @click="mockPatrolPlan">测试巡检任务表单</el-button>
        </div>

        <AIInput 
          ref="aiInput"
          :loading="isStreaming || isUploading"
          :showClearButton="false"
          :enable-stop-button="false"
          placeholder="有问题尽管问我~"
          :allowed-types="['image']"
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
        />

        <p class="footer-text">内容由AI生成，仅供参考</p>
      </div>
    </div>
  </div>
</template>

<script>
import AIWelcome from '@/ai-ui/welcome/AIWelcome.vue';
import ChatSkeleton from '@/ai-ui/skeleton/ChatSkeleton.vue';
import trainingSquareIcon from '@/assets/images/training.png';
import { OssUploader } from '@/utils/oss-uploader.js';
import { TrainingXApi } from './api';
import { formatConversationTime } from '@/utils';
import BubbleFooter from '@/ai-ui/history/BubbleFooter.vue';
import { handleAgentPreUpload } from '@/utils/agent-upload';
import { SpeechRecognizerWrapper } from '@/ai-core/audio/SpeechRecognizer';
import PatrolPlanForm from './widgets/PatrolPlanForm.vue';
import PatrolPlanResult from './widgets/PatrolPlanResult.vue';
import { parseWidgetData } from './widgets/widgetParser';

export default {
  name: 'TryAgent',
  inject: ['sessionApi'],
  components: {
    AIWelcome,
    ChatSkeleton,
    BubbleFooter,
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
      messages: [],
      chatId: '', // 当前会话的真实 chatId，用于 SSE 请求
      isStreaming: false,
      isUploading: false,
      loadingHistory: false,
      abortController: null,
      isCreatingSession: false, // 防止重复创建会话的标志位

      // 操作栏配置
      actionConfig: {
        user: ['copy'],
        bot: ['copy', 'like', 'dislike']
      },

      // 控制什么时候可以发送
      sendBtnDisabled: false,
      
      // OSS 上传器实例
      ossUploader: null,
      
      // 本地会话映射，用于快速查找和状态管理
      conversationsMap: new Map(),

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
        this.fetchConversationList()
        // 如果是真实会话ID（不是临时ID且不为空），则加载历史
        if (val && !val.startsWith('conv-')) {
          // 但为了防止在列表里点击当前会话时重复刷新，加个判断
          if (this.chatId === val) return;

          this.chatId = val;
          // 当外部传入新的会话 ID 时，加载对应的历史记录 
          this.loadHistory();
          
          // 检查未读状态并标记已读
          const conv = this.conversationsMap.get(val);
          if (conv && conv.isUnread) {
            this.markAsRead(val);
          }
        } else {
          // 如果没有 ID 或者是临时ID（conv-开头），则清空消息显示欢迎页
          this.chatId = '';
          this.messages = [];
          // 获取推荐的提示词
          this.fetchSuggestions();
        }
      }
    }
  },
  created() {
    this.initUploader();
    // 主动获取列表并通知父组件更新 Sidebar
    this.fetchConversationList();
    },
    computed: {
      // 创建 ASR 配置提供器
      asrConfigProvider() {
        return SpeechRecognizerWrapper.createConfigProvider(this.$aiClient);
      }
    },
    methods: {
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

    async handleAction(type, payload, index) {
     if (type === 'like' || type === 'dislike' || type === 'cancel-like') {
        const message = this.messages[index];
        if (!message) return;
        // 只有 AI 的消息才能评价（placement === 'start' 表示 AI 消息）
        if (message.placement !== 'start') {
          return;
        }
        // 更新本地点赞状态
        this.$set(message, 'likeStatus', type === 'cancel-like' ? '' : type);
        // 调用评价接口
        if (this.chatId && message.msgId) {
          try {
            if (type === 'cancel-like') {
              const res = await TrainingXApi.evaluateMessage(this.$aiClient, {
                chatId: this.chatId,
                msgId: message.msgId,
                userEvaluation: 'NO_EVAL'
              });
              // 取消评价：可能需要调用接口取消，这里先不调用，保持本地状态
              return;
            }

            const userEvaluation = type === 'like' ? 'UPVOTE' : 'DOWNVOTE';
            const res = await TrainingXApi.evaluateMessage(this.$aiClient, {
              chatId: this.chatId,
              msgId: message.msgId,
              userEvaluation
            });

            if (res.code === 0) {
              if(type === 'like') {
                this.$message.success('点赞成功');
              } else {
                this.$message.success('感谢反馈，我们会继续努力的~');
              }
            } else {
              // 评价失败，回滚本地状态
              this.$set(message, 'likeStatus', 'NO_EVAL');
              this.$message.error('评价失败，请重试');
            }
          } catch (e) {
            // 评价失败，回滚本地状态
            this.$set(message, 'likeStatus', 'NO_EVAL');
            this.$message.error('评价失败，请重试');
          }
        } else {
        }
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
      // 对于 AI 消息（placement === 'start'），需要检查是否还在生成中或是否有 msgId
      if (item.placement === 'start' && item.role === 'ai') {
        // 如果消息还在加载中（正在生成），不显示 footer
        if (item.loading || item.typing) {
          return false;
        }
        // 如果没有 msgId，不显示 footer（因为评价接口需要 msgId）
        if (!item.msgId) {
          return false;
        }
      }
      
      if (!item || !item.content) {
        return false;
      }

      return true;
    },
    initUploader() {
      this.ossUploader = new OssUploader({
        tokenProvider: async () => {
          try {
            const res = await TrainingXApi.getOssToken(this.$aiClient);
            // 适配后端返回结构: { code: 0, data: { ... } }
            if (res.code === 0) {
              return res.data;
            }
            return null;
          } catch (e) {
            console.error('Fetch STS token failed', e);
            return null;
          }
        }
      });
    },

    /**
     * 预上传钩子：在文件进入附件栏前先上传到 OSS
     * 新协议：handlePreUpload(rawFiles, { updateItem })
     *  - rawFiles: 原始 File[]
     *  - updateItem(index, patch): 由 AIInput 提供，用于更新对应附件的 status / percent / url 等
     */
    async handlePreUpload(rawFiles, context = {}) {
      return handleAgentPreUpload(rawFiles, context, this.ossUploader, (val) => {
        this.isUploading = val;
      });
    },

    /**
     * 获取会话列表，emit 给父组件 (AgentContainer)
     */
    async fetchConversationList() {
      try {
        const res = await TrainingXApi.getConversationList(this.$aiClient);
        if (res.code === 0 && Array.isArray(res.data)) {
          const map = new Map();
          
          res.data.forEach(item => {
            const chatId = item.chatId || item.id;
            if (!chatId) return;

            if (!map.has(chatId)) {
              map.set(chatId, {
                id: chatId,
                // 适配后端字段：title -> label
                label: (item.title || item.userText || '新会话').slice(0, 20),
                // 保留原始时间字段，供组件内部自动分组使用
                createTime: item.createTime,
                updateTime: item.updateTime,
                // 保留置顶字段
                top: item.pinned === true || item.pinned === 'true',
                // 适配未读状态
                isUnread: !item.hasRead ,
                // 格式化显示时间（用于 label slot 中显示）
                time: formatConversationTime(item.updateTime)
              });
            }
          });

          this.conversationsMap = map;
          const list = Array.from(map.values());
          this.$emit('update-list', list);
          
          // 如果当前选中的会话有未读，标记为已读
          if (this.chatId && map.has(this.chatId) && map.get(this.chatId).isUnread) {
            this.markAsRead(this.chatId);
          }
        }
      } catch (e) {
        console.error('[TryAgent] fetchConversationList failed', e);
      }
    },
    
    /**
     * 标记会话已读
     */
    async markAsRead(id) {
      if (!id) return;
      try {
        const res = await TrainingXApi.markAsRead(this.$aiClient, { chatId: id });
        if (res.code === 0) {
           const conv = this.conversationsMap.get(id);
           if (conv) {
             conv.isUnread = false;
             // 更新列表 UI
             this.$emit('update-list', Array.from(this.conversationsMap.values()));
           }
        }
      } catch (e) {
        console.error('[TryAgent] markAsRead failed', e);
      }
    },

    /**
     * 置顶/取消置顶会话
     */
    async pinSession(id, pinned) {
      try {
        const res = await TrainingXApi.pinnedChat(this.$aiClient, { chatId: id, pinned });
        if (res.code === 0) {
          this.$message.success(pinned ? '置顶成功' : '已取消置顶');
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[TryAgent] pinSession failed', e);
        this.$message.error('操作失败');
      }
    },

    /**
     * 重命名会话
     */
    async renameSession(id, title) {
      try {
        const res = await TrainingXApi.renameChatTitle(this.$aiClient, { chatId: id, title });
        if (res.code === 0) {
          this.$message.success('重命名成功');
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[TryAgent] renameSession failed', e);
        this.$message.error('重命名失败');
      }
    },

    /**
     * 处理欢迎页选项选择
     * 如果选项需要上传文件（如"图片分析"），则触发文件选择并传递到 AIInput
     */
    async handleWelcomeSelect(data) {
      // 兼容旧协议：如果直接传入字符串，则作为文本处理
      let text = typeof data === 'string' ? data : data.text || data.title;
      // 检查是否需要文件：优先使用配置中的 needsFile，否则根据文本判断
      const needsFile = typeof data === 'object' && data.needsFile !== undefined 
        ? data.needsFile 
        : (text.includes('图片') || text.includes('视频') || text.includes('上传'));
      
      if (needsFile) {
        // 创建一个隐藏的文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jpg,.jpeg,.png,.mp4';
        input.multiple = true;
        input.style.display = 'none';
        
        // 等待用户选择文件
        const files = await new Promise((resolve) => {
          input.onchange = (e) => {
            const selectedFiles = Array.from(e.target.files || []);
            resolve(selectedFiles);
            document.body.removeChild(input);
          };
          input.oncancel = () => {
            resolve([]);
            document.body.removeChild(input);
          };
          document.body.appendChild(input);
          input.click();
        });

        // 如果用户选择了文件，添加到 AIInput
        if (files.length > 0 && this.$refs.aiInput) {
          // 设置输入框文本
          this.$refs.aiInput.setText(text);
          // 添加文件
          await this.$refs.aiInput.addFiles(files);
        } else if (this.$refs.aiInput) {
          // 即使没有选择文件，也设置文本
          this.$refs.aiInput.setText(text);
        }
      } else {
        // 不需要文件，直接发送
        this.handleSend({ text, attachments: [] });
      }
    },

    /**
     * 加载当前 chatId 的历史记录
     */
    async loadHistory() {
      if (!this.chatId) return;

      // 如果是临时会话ID（AgentContainer 生成的），则不加载历史，直接显示欢迎页
      if (this.chatId.startsWith('conv-')) {
        this.messages = [];
        this.loadingHistory = false;
        return;
      }

      this.loadingHistory = true;
      this.messages = [];

      try {
        const res = await TrainingXApi.getHistory(this.$aiClient, this.chatId);

        if (res && res.code === 0 && Array.isArray(res.data)) {
          // 如果后端返回的是按时间倒序的（最新的在前面），需要反转
          // 或者先按 createTime 排序
          const rawList = res.data;
          // 简单的判断：如果第一条比最后一条时间晚，说明是倒序
          if (rawList.length > 1) {
             const t1 = new Date(rawList[0].createTime).getTime();
             const t2 = new Date(rawList[rawList.length - 1].createTime).getTime();
             if (!isNaN(t1) && !isNaN(t2) && t1 > t2) {
                rawList = [...rawList].reverse(); // 创建新数组
              }
          }

          const list = [];
          rawList.forEach(item => {
            const pair = this.adaptMessage(item);

            // 过滤无效的用户消息：有文本或有附件才显示，且 promptVisible 不为 false
            const hasUserText = pair.user.content && pair.user.content.trim();
            const hasUserAttachments = pair.user.attachments && pair.user.attachments.length > 0;
            const shouldShowUserMessage = item.promptVisible !== false; // 默认显示，只有明确为 false 时才隐藏
            if ((hasUserText || hasUserAttachments) && shouldShowUserMessage) {
              list.push(pair.user);
            }

            // 过滤无效的 AI 消息：有文本或有附件才显示
            const hasAiText = pair.ai.content && pair.ai.content.trim();
            const hasAiAttachments = pair.ai.attachments && pair.ai.attachments.length > 0;
            if (hasAiText || hasAiAttachments) {
              list.push(pair.ai);
            }
          });
          this.messages = list;
        } 
      } catch (e) {
        console.error('[TryAgent] loadHistory failed', e);
        this.messages = [];
      } finally {
        this.loadingHistory = false;
      }
    },
    /**
     * 适配历史消息格式
     * 后端数据结构示例：
     * {
     *   chatId: string,
     *   files: { image: [{ url }], video: [{ url }] | null },
     *   userText: string,
     *   assistantText: string,
     *   ...
     * }
     * 目标：拆成「用户一条 + AI 一条」
     */
    adaptMessage(msg) {
      const images = (msg.files && Array.isArray(msg.files.image)) ? msg.files.image : [];
      const videos = (msg.files && Array.isArray(msg.files.video)) ? msg.files.video : [];

      const userAttachments = [];

      images.forEach((item, idx) => {
        if (item && item.url) {
          userAttachments.push({
            type: 'image',
            url: item.url,
            name: `图片${idx + 1}`
          });
        }
      });

      videos.forEach((item, idx) => {
        if (item && item.url) {
          userAttachments.push({
            type: 'video',
            url: item.url,
            name: `视频${idx + 1}`
          });
        }
      });

      const user = {
        key: `${msg.msgId || msg.chatId || 'user'}-u`,
        role: 'user',
        content: msg.userText || '',
        attachments: userAttachments,
        variant: 'filled',
        placement: 'end',
        time: msg.createTime
      };

      // 将后端的 userEvaluation 映射为前端的 likeStatus
      // 后端: "UPVOTE" | "DOWNVOTE" | "NO_EVAL"
      // 前端: "like" | "dislike" | ""
      let likeStatus = '';
      if (msg.userEvaluation === 'UPVOTE') {
        likeStatus = 'like';
      } else if (msg.userEvaluation === 'DOWNVOTE') {
        likeStatus = 'dislike';
      }

      const ai = {
        key: `${msg.msgId || msg.chatId || 'ai'}-a`,
        role: 'ai',
        content: msg.assistantText || '',
        attachments: [], // 目前后端没给出 AI 侧附件，就先留空
        variant: 'filled',
        placement: 'start',
        time: msg.createTime,
        msgId: msg.msgId, // 保存 msgId，用于评价接口
        likeStatus // 保存点赞状态
      };

      return { user, ai };
    },

    /**
     * 发送消息处理
     */
    async handleSend(data) {
      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      if (!data.text && attachments.length === 0) return;

      // 1. 如果当前没有会话ID 或 是临时ID，先创建会话
      if (!this.chatId || this.chatId.startsWith('conv-')) {
        // 防止重复创建会话
        if (this.isCreatingSession) {
          console.log('[TrainingX] 正在创建会话，请稍候...');
          return;
        }
        
        this.isCreatingSession = true;
        try {
          // 创建新会话
          const res = await TrainingXApi.getChatId(this.$aiClient, {
            mineType: 'image'
          });
          if (res.code === 0 && res.data) {
             // 假设返回的是 chatId 字符串或包含 chatId 的对象
             this.chatId = typeof res.data === 'string' ? res.data : res.data.chatId;
             
             // 通知父组件选中新会话（这一步可选，如果 fetchConversationList 能及时更新）
             // 但为了 URL 同步，建议 emit select
             this.$emit('select-conversation', this.chatId);
             
             // 刷新列表，让 Sidebar 出现新会话
             this.fetchConversationList();
          } else {
            this.$message.error('创建会话失败');
            return;
          }
        } catch (e) {
          console.error('[TrainingX] Create session failed', e);
          this.$message.error('创建会话失败，请重试');
          return;
        } finally {
          this.isCreatingSession = false;
        }
      }

      const userMsgKey = Date.now();
      
      // 2. 立即显示用户消息
      const userMsg = {
        key: userMsgKey,
        role: 'user',
        content: data.text,
        attachments: attachments,
        placement: 'end',
        variant: 'filled',
        time: userMsgKey
      };
      this.messages.push(userMsg);

      // 3. 构造请求参数
      let uploadType = 'img'; 
      const imageUrls = attachments
        .filter(a => a.type === 'image' && a.url)
        .map(a => a.url);
      const videoUrls = attachments
        .filter(a => a.type === 'video' && a.url)
        .map(a => a.url);

      if (videoUrls.length > 0) {
        uploadType = 'video';
      }

      // 4. 准备 AI 占位消息
      const aiMsgKey = Date.now() + '_ai';
      const aiMsg = {
        key: aiMsgKey,
        role: 'ai',
        content: '',
        loading: true,
        typing: true,
        placement: 'start',
        variant: 'filled',
        time: Date.now()
      };
      this.messages.push(aiMsg);

      // 5. 发起 SSE 请求
      this.isStreaming = true;
      this.abortController = new AbortController();

      const requestBody = {
        chatId: this.chatId,
        input: {
          prompt: data.text,
          imageList: imageUrls,
          videoList: videoUrls
        }
      };

      try {
        await TrainingXApi.chatStream(this.$aiClient, {
          data: requestBody,
          signal: this.abortController.signal,
          uploadType,
          onMessage: (msgData) => {
            if (!msgData) return;

            if (msgData.text) {
              aiMsg.content += msgData.text;
            }

            // 记录消息 ID，用于点赞评价
            if (msgData.msgId && !aiMsg.msgId) {
              aiMsg.msgId = msgData.msgId;
            }

            // 更新 chatId（如果后端返回了新的 chatId）
            if (msgData.chatId && msgData.chatId !== this.chatId) {
              this.chatId = msgData.chatId;
              // 通知父组件更新会话 ID
              // 快速切换，父组件已经被我的强制Key干掉了。所以这句话就不会发送，而当前会话还能保持
              this.$emit('select-conversation', this.chatId);
            }

            if (msgData.status !== 0) {
              aiMsg.loading = false;
              this.isStreaming = false;
              this.handleFinish({ index: this.messages.indexOf(aiMsg) });
            }
          },
          onComplete: () => {
            aiMsg.loading = false;
            this.isStreaming = false;
            this.handleFinish({ index: this.messages.indexOf(aiMsg) });
          },
          onError: (err) => {
            console.error('SSE Error', err);
            aiMsg.loading = false;
            aiMsg.content += '\n[网络错误，连接断开]';
            this.isStreaming = false;
          }
        });
      } catch (e) {
        console.error('SSE Start Error', e);
        aiMsg.loading = false;
        aiMsg.content = '服务暂时不可用，请稍后再试。';
        this.isStreaming = false;
      }
    },

    /**
     * 删除会话
     * @param {string} id 会话ID
     */
    async deleteSession(id) {
      try {
        const res = await TrainingXApi.deleteHistory(this.$aiClient, { chatId: id });
        if (res.code === 0) {
          // 如果删除的是当前会话，清空显示
          if (id === this.chatId) {
            this.chatId = '';
            this.messages = [];
            // 通知父组件清空选中状态（或由父组件自己处理）
          }
          // 刷新列表
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[TryAgent] Delete session failed', e);
      }
    },

    handleStop() {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      this.isStreaming = false;
      this.isUploading = false;
    },

   


    handleFinish({ index }) {
      if (index === this.messages.length - 1) {
        this.isStreaming = false;
        // 刷新会话列表 (仅对第一条消息或新会话，确保新会话出现在侧边栏)
        if (this.messages.length <= 2) {
          this.fetchConversationList();
        }
      }
    },

    /**
     * 处理 Widget 发送消息
     */
    handleWidgetSend(message) {
      if (!message) return;
      this.handleSend({ text: message, attachments: [] });
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
        "storeKey": "161d3b6e5ae14e3ca676c9564907c0e3",
        "frequency": 2,
        "issueDays": [3],
        "startDate": "2025-12-03",
        "endDate": "2025-12-30",
        "problemSheetAssignment": 1,
        "patrolTimeStr": {
          "timeType": 0,
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
  beforeDestroy() {
  // if (this.abortController) {
    // this.abortController.abort();
  // }
  if (this.ossUploader) {
    this.ossUploader.destroy?.();
  }
}
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


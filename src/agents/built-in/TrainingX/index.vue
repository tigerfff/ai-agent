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
        class="history-full-width"
        :ignoreWidgetTypes="['ymform:train_confirm','ymForm:train_plan_result']"
      >
        <template #avatar="{ item }">
          <div class="custom-avatar" :class="item.role">
            {{ item.role === 'user' ? '👤' : '🤖' }}
          </div>
        </template>

        <!-- 自定义 Widget 渲染 -->
        <template #widget="{ info, item, index }">
          <TrainPlanForm
            v-if="info.widgetType === 'ymform:train_plan'"
            :data="info.data"
            :is-history-disabled="index < messages.length - 1" 
            @send-message="handleWidgetSend"
          />

        </template>

        <template  #footer="{ item, index }" >
          <div style="display: flex; align-items: center; gap: 4px;">
            <div class="stop-task" v-if="item.content.includes('ymForm:train_plan_result')" @click="handleCancelTask(item)">
              <i class="h-icon-close_f"></i>
              <span>停止任务</span>
            </div>
            <span  v-if="item.content.includes('ymForm:train_plan_result')" style="padding: 0 4px; color: rgba(0, 0, 0, .1);">|</span>
            <BubbleFooter 
              :item="item" 
              :actions="getActions(item)"
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
        <!-- 
          mode="file" 开启文件上传支持
          accepts 限制上传类型
        -->
        <AIInput 
          ref="aiInput"
          :loading="isStreaming || isUploading"
          placeholder="有问题尽管问我~"
          :allowed-types="['image', 'video', 'document']"
          :max-size="200 * 1024 * 1024"
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="getAsrConfig"
          :button-config="{
            upload: { visible: true, disabled: false },
            speech: { visible: false }, // 隐藏语音按钮
            send: { disabled: false }
          }"
          :send-disabled="sendBtnDisabled"
          @send="handleSend" 
          @stop="handleStop"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AIWelcome from '@/ai-ui/welcome/AIWelcome.vue';
import ChatSkeleton from '@/ai-ui/skeleton/ChatSkeleton.vue';
import trainingSquareIcon from '@/assets/images/try.png';
import { OssUploader } from '@/utils/oss-uploader.js';
import { TrainingXApi } from './api';
import { formatConversationTime } from '@/utils';
import TrainPlanForm from './widgets/TrainPlanForm.vue';
import BubbleFooter from '@/ai-ui/history/BubbleFooter.vue';

export default {
  name: 'TryAgent',
  inject: ['sessionApi'],
  components: {
    AIWelcome,
    ChatSkeleton,
    TrainPlanForm,
    BubbleFooter
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

      // 操作栏配置
      actionConfig: {
        user: ['edit', 'copy'],
        bot: ['copy', 'like', 'dislike', 'edit']
      },

      // 控制什么时候可以发送
      sendBtnDisabled: false,
      
      // OSS 上传器实例
      ossUploader: null,
      
      // 本地会话映射，用于快速查找和状态管理
      conversationsMap: new Map(),

      welcomeConfig: {
        icon: trainingSquareIcon,
        title: '员工培训助手',
        description: '我可以帮你推荐培训内容、制定员工培训计划、检查培训结果，有培训问题随时找我哦～',
        prompts: [
          { desc: '帮我制定汉堡的培训计划',text: '帮我制定汉堡的培训计划', needsFile: false },
          { desc: '针对315做一个食安培训',text: '针对315做一个食安培训', needsFile: false },
        ]
      }
    };
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        if (val) {
          // 如果当前已有 chatId 且和传入的一样，则不重复加载
          // 注意：首次进入时 this.chatId 是空的，所以即使 val 是一样也会加载
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
          // 如果没有 ID（或者是新会话状态），则清空消息显示欢迎页
          this.chatId = '';
          this.messages = [];
        }
      }
    }
  },
  created() {
    this.initUploader();
    // 主动获取列表并通知父组件更新 Sidebar
    // this.fetchConversationList();
    
    // ========== 临时 Mock 数据（测试用，可随时删除） ==========
    // 在控制台调用：this.$refs.activeAgent.mockTrainPlanForm() 来测试表单
    // 或者取消下面的注释，自动添加测试消息
    this.mockTrainPlanForm();
  },
  methods: {

    getActions(item) {
      // 根据 placement 判断角色：'end' 是用户，'start' 是机器人
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
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
      const { updateItem } = context;

      if (!this.ossUploader) {
        // 没有配置 OSS 上传器时，直接走本地模式，由 AIInput 保留本地文件信息
        if (typeof updateItem === 'function') {
          rawFiles.forEach((file, i) => {
            updateItem(i, {
              type: file.type.startsWith('video') ? 'video' : 'image',
              status: 'done',
              percent: 100
            });
          });
        }
        return;
      }

      this.isUploading = true;
      try {
        await Promise.all(
          rawFiles.map(async (file, index) => {
            // 使用带进度回调的 OSS 上传
            const res = await this.ossUploader.upload(file, (percent) => {
              if (typeof updateItem === 'function') {
                updateItem(index, {
                  status: 'uploading',
                  percent: Math.round(percent * 100)
                });
              }
            });

            if (typeof updateItem === 'function') {
              updateItem(index, {
                url: res.url,
                name: res.name || file.name,
                size: file.size,
                type: file.type.startsWith('video') ? 'video' : 'image',
                rawFile: null,
                status: 'done',
                percent: 100
              });
            }
          })
        );
      } catch (e) {
        console.error('[TryAgent] OSS pre-upload failed:', e);
        // 失败时，将状态标记为 error，但仍保留本地文件，方便用户重试或删除
        if (typeof updateItem === 'function') {
          rawFiles.forEach((file, i) => {
            updateItem(i, {
              status: 'error',
              percent: 0
            });
          });
        }
      } finally {
        this.isUploading = false;
      }
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
                top: item.pinned === true || item.pinned === 'true' || item.top === true || item.top === 'true', // 兼容 pinned 和 top 字段
                // 适配未读状态
                isUnread: item.hasUnread === 'true' || item.hasUnread === true,
                // 格式化显示时间（用于 label slot 中显示）
                time: formatConversationTime(item.createTime)
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
        // 不需要文件，直接设置文本
        if (this.$refs.aiInput) {
          this.$refs.aiInput.setText(text);
          // 聚焦到输入框
          this.$nextTick(() => {
            this.$refs.aiInput.focusInput();
          });
        }
      }
    },

    /**
     * 加载当前 chatId 的历史记录
     */
    async loadHistory() {
      console.log('loadHistory', this.chatId);
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
             if (t1 > t2) {
               rawList.reverse();
             }
          }

          const list = [];
          rawList.forEach(item => {
            const pair = this.adaptMessage(item);
            if (pair && pair.user) list.push(pair.user);
            if (pair && pair.ai) list.push(pair.ai);
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
        placement: 'end'
      };

      const ai = {
        key: `${msg.msgId || msg.chatId || 'ai'}-a`,
        role: 'ai',
        content: msg.assistantText || '',
        attachments: [], // 目前后端没给出 AI 侧附件，就先留空
        variant: 'filled',
        placement: 'start'
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
          console.error('[TryAgent] Create session failed', e);
          return;
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
        variant: 'filled'
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
        variant: 'filled'
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

    /**
     * 获取 ASR 配置（用于语音识别）
     * 调用后端接口获取签名，使用签名方式连接腾讯云 ASR
     */
    async getAsrConfig() {
      // 生产环境：调用后端接口获取签名
      try {
        const res = await TrainingXApi.getAsrSign(this.$aiClient, {});
        
        if (res.code === 0 && res.data) {
          const { appId, sign } = res.data;
          
          if (!appId || !sign) {
            console.error('ASR config missing appId or sign');
            return null;
          }

          // 返回配置，使用签名回调方式
          return {
            appId,
            sign, // 直接使用后端返回的签名
            signCallback: async () => {
              // 如果需要动态获取签名，可以在这里调用后端接口
              const refreshRes = await TrainingXApi.getAsrSign(this.$aiClient, {});
              if (refreshRes.code === 0 && refreshRes.data) {
                return refreshRes.data.sign;
              }
              return sign; // 降级使用初始签名
            },
            engineModelType: '16k_zh' // 默认使用中文16k
          };
        }
        
        console.error('Failed to get ASR config:', res);
        return null;
      } catch (e) {
        console.error('[TrainingX] getAsrConfig failed', e);
        return null;
      }
    },

    handleWidgetSend(text) {
      this.handleSend({ text });
    },

    /**
     * 临时 Mock 方法：添加测试培训计划表单消息（可随时删除）
     */
    mockTrainPlanForm() {
      const mockContent = `<ymform:train_plan>
{
  "courseProjectId": "43dbb90d1ba94f4f844ea71b89b4438a",
  "type": "项目",
  "questionId": "123",
  "storeId": "123",
  "userIds": ["aaaa", "bbbb"]
}
</ymform:train_plan>`;

      const mockMsg = {
        key: 'mock-train-plan-' + Date.now(),
        role: 'ai',
        content: mockContent,
        attachments: [],
        variant: 'filled',
        placement: 'start'
      };
      
      this.messages.push(mockMsg);
      console.log('[Mock] 已添加测试培训计划表单消息');
    },

    handleFinish({ index }) {
      if (index === this.messages.length - 1) {
        this.isStreaming = false;
        // 更新会话标题 (仅对第一条消息或新会话)
        if (this.messages.length <= 2 && this.sessionApi) {
          const userMsg = this.messages.find(m => m.role === 'user');
          if (userMsg && userMsg.content) {
             this.sessionApi.updateCurrentTitle(userMsg.content.slice(0, 10));
          }
        }
      }
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
      padding: 0 16px;
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
      &:hover {
        color: #666;
      }
    }
  }

  .footer {
    flex-shrink: 0;
    width: 100%;
    padding: 16px 0 44px;

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


import { SpeechRecognizerWrapper } from '@/ai-core/audio/SpeechRecognizer';
import { handleAgentPreUpload } from '@/utils/agent-upload';
import { OssUploader } from '@/utils/oss-uploader.js';
import { formatConversationTime } from '@/utils';
import { adaptMessage } from '@/utils/agent-utils';

// 统一引入通用组件
import AIWelcome from '@/ai-ui/welcome/AIWelcome.vue';
import ChatSkeleton from '@/ai-ui/skeleton/ChatSkeleton.vue';
import AIHistory from '@/ai-ui/history/AIHistory.vue';
import AIInput from '@/ai-ui/input/AIInput.vue';
import BubbleFooter from '@/ai-ui/history/BubbleFooter.vue';
import AIIcon from '@/ai-ui/icon/AIIcon.vue';

export const AgentBaseMixin = {
  components: {
    AIWelcome,
    ChatSkeleton,
    AIHistory,
    AIInput,
    BubbleFooter,
    AIIcon
  },
  data() {
    return {
      messages: [],
      chatId: '', // 当前会话的真实 chatId
      isStreaming: false,
      isUploading: false,
      loadingHistory: false,
      isInitialLoading: false, // 是否是初次进入加载
      allHistoryLoaded: false, // 是否已加载全部历史
      pageSize: 20, // 分页大小
      abortController: null,
      isCreatingSession: false,
      aiInputText: '', // 输入框文本
      inputFilesList: [], // 附件列表
      // 操作栏配置
      actionConfig: {
        user: ['copy'],
        bot: ['fresh', 'copy', 'like', 'dislike']
      },
      // OSS 上传器实例
      ossUploader: null,
      // 本地会话映射，用于状态管理
      conversationsMap: new Map()
    };
  },
  computed: {
    // 创建 ASR 配置提供器
    asrConfigProvider() {
      return SpeechRecognizerWrapper.createConfigProvider(this.$aiClient);
    },
    // 计算发送按钮是否禁用
    sendBtnDisabled() {
      // 如果没有消息且没有输入文本或附件，禁用
      // 如果有消息但没有输入文本，禁用
      // 具体的禁用逻辑可以由子类覆盖，这里提供一个基础逻辑
      return Boolean(
        (!this.messages.length && (!this.inputFilesList?.length && !this.aiInputText?.length)) || 
        (this.messages.length && !this.aiInputText?.length)
      );
    }
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        if (typeof this.onConversationIdChange === 'function') {
          this.onConversationIdChange(val);
          return;
        }

        this.fetchConversationList();
        
        if (val && !val.startsWith('conv-')) {
          if (this.chatId === val) return;
          this.chatId = val;
          this.loadHistory();
          
          // 检查未读状态并标记已读
          const conv = this.conversationsMap.get(val);
          if (conv && conv.isUnread) {
            this.markAsRead(val);
          }
        } else {
          this.chatId = '';
          this.messages = [];
          if (typeof this.onNewSession === 'function') {
            this.onNewSession();
          }
        }
      }
    }
  },
  created() {
    this.initUploader();
  },
  beforeDestroy() {
    if (this.ossUploader) {
      this.ossUploader.destroy?.();
    }
  },
  methods: {
    /**
     * 获取智能体 API 实例，需由子类覆盖或提供
     */
    getAgentApi() {
      console.warn('[AgentBaseMixin] getAgentApi is not implemented');
      return null;
    },

    initUploader() {
      const api = this.getAgentApi();
      if (!api) return;

      this.ossUploader = new OssUploader({
        tokenProvider: async () => {
          try {
            const res = await api.getOssToken(this.$aiClient);
            if (res.code === 0) return res.data;
            return null;
          } catch (e) {
            console.error('[AgentBaseMixin] Fetch STS token failed', e);
            return null;
          }
        }
      });
    },

    async handlePreUpload(rawFiles, context = {}) {
      return handleAgentPreUpload(rawFiles, context, this.ossUploader, (val) => {
        this.isUploading = val;
      });
    },

    async fetchConversationList() {
      const api = this.getAgentApi();
      if (!api) return;

      try {
        const res = await api.getConversationList(this.$aiClient);
        if (res.code === 0 && Array.isArray(res.data)) {
          const map = new Map();
          res.data.forEach(item => {
            const chatId = item.chatId || item.id;
            if (!chatId) return;

            if (!map.has(chatId)) {
              map.set(chatId, {
                id: chatId,
                label: (item.title || item.userText || '新会话').slice(0, 20),
                createTime: item.createTime,
                updateTime: item.updateTime,
                top: item.pinned === true || item.pinned === 'true',
                isUnread: !item.hasRead,
                time: formatConversationTime(item.updateTime || item.createTime)
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
        console.error('[AgentBaseMixin] fetchConversationList failed', e);
      }
    },

    async markAsRead(id) {
      if (!id) return;
      const api = this.getAgentApi();
      if (!api || typeof api.markAsRead !== 'function') return;

      try {
        const res = await api.markAsRead(this.$aiClient, { chatId: id });
        if (res.code === 0) {
          const conv = this.conversationsMap.get(id);
          if (conv) {
            conv.isUnread = false;
            this.$emit('update-list', Array.from(this.conversationsMap.values()));
          }
        }
      } catch (e) {
        console.error('[AgentBaseMixin] markAsRead failed', e);
      }
    },

    async loadHistory(isLoadMore = false) {
      if (!this.chatId || this.chatId.startsWith('conv-')) return;

      if (!isLoadMore) {
        this.messages = [];
        this.allHistoryLoaded = false;
        this.isInitialLoading = true;
      }
      this.loadingHistory = true;

      try {
        const api = this.getAgentApi();
        const params = { pageSize: this.pageSize };
        
        if (isLoadMore && this.messages.length > 0) {
          // 找到最旧的一条 AI 消息（包含 msgId 和 time）
          const oldestAiMsg = this.messages.find(m => m.role === 'ai' && m.msgId);
          if (oldestAiMsg) {
            params.key = `${oldestAiMsg.time}_${oldestAiMsg.msgId}`;
          }
        }

        const res = await api.getHistory(this.$aiClient, this.chatId, params);

        if (res && res.code === 0 && Array.isArray(res.data)) {
          let rawList = res.data;
          
          // 判断是否加载完所有历史
          if (rawList.length < this.pageSize) {
            this.allHistoryLoaded = true;
          }

          // 按时间排序 (后端返回的可能是逆序)
          if (rawList.length > 1) {
            const t1 = new Date(rawList[0].createTime).getTime();
            const t2 = new Date(rawList[rawList.length - 1].createTime).getTime();
            if (!isNaN(t1) && !isNaN(t2) && t1 > t2) {
              rawList = [...rawList].reverse();
            }
          }

          const newList = [];
          rawList.forEach(item => {
            const pair = adaptMessage(item);
            // 过滤无效的用户消息
            if ((pair.user.content?.trim() || pair.user.attachments?.length > 0) && item.promptVisible !== false) {
              newList.push(pair.user);
            }
            // 过滤无效的 AI 消息
            if (pair.ai.content?.trim() || pair.ai.attachments?.length > 0) {
              newList.push(pair.ai);
            }
          });

          if (isLoadMore) {
            this.messages = [...newList, ...this.messages];
          } else {
            this.messages = newList;
          }
        }
      } catch (e) {
        console.error('[AgentBaseMixin] loadHistory failed', e);
        if (!isLoadMore) this.messages = [];
      } finally {
        this.loadingHistory = false;
        this.isInitialLoading = false;
      }
    },

    /**
     * 加载更多历史记录 (分页)
     */
    async handleLoadMore() {
      if (this.loadingHistory || this.allHistoryLoaded || this.isStreaming) return;
      // 2. 【核心修复】预判拦截：
      // 如果当前消息数量 > 0 且小于一页的限制 (pageSize)，说明当前已经是第一页且不满一页。
      // 这种情况在逻辑上不可能有“更多更旧”的历史记录，或者是新创建的会话。
      // 直接标记加载完成，避免无效且可能报错的 historyScrolling 请求。
      if (this.messages.length > 0 && this.messages.length < this.pageSize) {
        this.allHistoryLoaded = true;
        return;
      }
      await this.loadHistory(true);
    },

    async handleSend(data) {
      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      if (!data.text && attachments.length === 0) return;

      const api = this.getAgentApi();
      if (!api) return;

      // 1. 如果当前没有会话ID 或 是临时ID，先创建会话
      if (!this.chatId || this.chatId.startsWith('conv-')) {
        if (this.isCreatingSession) return;
        this.isCreatingSession = true;
        try {
          const mineType = attachments[0]?.type || 'image';
          const res = await api.getChatId(this.$aiClient, { mineType });
          if (res.code === 0 && res.data) {
            this.chatId = typeof res.data === 'string' ? res.data : res.data.chatId;
            this.$emit('select-conversation', this.chatId);
            this.fetchConversationList();
          } else {
            this.$message.error('创建会话失败');
            return;
          }
        } catch (e) {
          console.error('[AgentBaseMixin] Create session failed', e);
          this.$message.error('创建会话失败，请重试');
          return;
        } finally {
          this.isCreatingSession = false;
        }
      }

      const userMsgKey = Date.now();
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

      // 准备 AI 占位消息
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

      // 发起 SSE 请求
      this.isStreaming = true;
      this.abortController = new AbortController();

      const imageUrls = attachments.filter(a => a.type === 'image' && a.url).map(a => a.url);
      const videoUrls = attachments.filter(a => a.type === 'video' && a.url).map(a => a.url);
      const uploadType = videoUrls.length > 0 ? 'video' : 'img';

      try {
        await api.chatStream(this.$aiClient, {
          data: {
            chatId: this.chatId,
            input: { prompt: data.text, imageList: imageUrls, videoList: videoUrls }
          },
          signal: this.abortController.signal,
          uploadType,
          onMessage: (msgData) => {
            if (!msgData) return;

            // 处理业务错误码
            if (msgData.code && msgData.code !== 0 && msgData.code !== '0') {
              this.$message.error(msgData.message || '服务异常，请稍后再试');
              aiMsg.loading = false;
              aiMsg.content += `\n[错误: ${msgData.message || '未知错误'}]`;
              this.isStreaming = false;
              return;
            }

            if (msgData.text) aiMsg.content += msgData.text;
            if (msgData.msgId && !aiMsg.msgId) aiMsg.msgId = msgData.msgId;
            if (msgData.chatId && msgData.chatId !== this.chatId) {
              this.chatId = msgData.chatId;
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
            console.log('err', err);
            if (err.name === 'AbortError') return;
            console.error('[AgentBaseMixin] SSE Error', err);
            aiMsg.loading = false;
            aiMsg.content += '\n[网络错误，连接断开]';
            this.isStreaming = false;
          }
        });
      } catch (e) {
        console.error('[AgentBaseMixin] SSE Start Error', e);
        aiMsg.loading = false;
        aiMsg.content = '服务暂时不可用，请稍后再试。';
        this.isStreaming = false;
      }
    },

    handleFinish({ index }) {
      if (index === this.messages.length - 1) {
        this.isStreaming = false;
        if (this.messages.length <= 2) {
          this.fetchConversationList();
        }
      }
    },

    handleStop() {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }

      // 找到最后一条正在加载的 AI 消息并停止其 loading 状态
      const lastMsg = this.messages[this.messages.length - 1];
      if (lastMsg && lastMsg.role === 'ai' && lastMsg.loading) {
        lastMsg.loading = false;
        lastMsg.typing = false;
        
        // 如果此时还没有任何内容产出，补充 [调用已取消]
        if (!lastMsg.content || !lastMsg.content.trim()) {
          lastMsg.content = '[调用已取消]';
        }
      }

      this.isStreaming = false;
      this.isUploading = false;
    },

    async deleteSession(id) {
      const api = this.getAgentApi();
      if (!api) return;
      try {
        const res = await api.deleteHistory(this.$aiClient, { chatId: id });
        if (res.code === 0) {
          if (id === this.chatId) {
            this.chatId = '';
            this.messages = [];
          }
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[AgentBaseMixin] Delete session failed', e);
      }
    },

    async pinSession(id, pinned) {
      const api = this.getAgentApi();
      if (!api) return;
      try {
        const res = await api.pinnedChat(this.$aiClient, { chatId: id, pinned });
        if (res.code === 0) {
          this.$message.success(pinned ? '置顶成功' : '已取消置顶');
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[AgentBaseMixin] pinSession failed', e);
      }
    },

    async renameSession(id, title) {
      const api = this.getAgentApi();
      if (!api) return;
      try {
        const res = await api.renameChatTitle(this.$aiClient, { chatId: id, title });
        if (res.code === 0) {
          this.$message.success('重命名成功');
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[AgentBaseMixin] renameSession failed', e);
      }
    },

    async handleAction(type, payload, index) {
      if (type === 'edit') {
        if (this.messages[index]) {
          this.$set(this.messages[index], 'content', payload.content);
          this.$message.success('内容已更新');
        }
      } else if (type === 'fresh') {
        this.handleRegenerate(payload, index);
      } else if (type === 'like' || type === 'dislike' || type === 'cancel-like') {
        const message = this.messages[index];
        if (!message || message.placement !== 'start') return;

        this.$set(message, 'likeStatus', type === 'cancel-like' ? '' : type);
        
        const api = this.getAgentApi();
        if (api && this.chatId && message.msgId) {
          try {
            const userEvaluation = type === 'like' ? 'UPVOTE' : (type === 'dislike' ? 'DOWNVOTE' : 'NO_EVAL');
            await api.evaluateMessage(this.$aiClient, {
              chatId: this.chatId,
              msgId: message.msgId,
              userEvaluation
            });
            if (type !== 'cancel-like') {
              this.$message.success(type === 'like' ? '点赞成功' : '感谢反馈，我们会继续努力的~');
            }
          } catch (e) {
            console.error('[AgentBaseMixin] Evaluate message failed:', e);
            this.$set(message, 'likeStatus', '');
            this.$message.error('评价失败，请重试');
          }
        }
      }
    },

    /**
     * 重新生成 AI 回答
     * @param {Object} item 当前点击的 AI 消息对象
     * @param {Number} index 消息在 messages 数组中的索引
     */
    async handleRegenerate(item, index) {
      if (this.isStreaming) {
        this.$message.warning('请等待当前回答生成完毕');
        return;
      }

      // 找到前一个用户消息
      const userIndex = index - 1;
      if (userIndex < 0 || !this.messages[userIndex] || this.messages[userIndex].role !== 'user') {
        this.$message.warning('无法重新生成回答');
        return;
      }

      // 保存用户消息
      const userMsg = this.messages[userIndex];

      // 重新触发发送逻辑
      await this.handleSend({
        text: userMsg.content || '',
        attachments: userMsg.attachments || []
      });
    },

    handleWidgetSend(text) {
      this.handleSend({ text });
    },

     
     /**
     * 处理欢迎页推荐词点击
     */
    handleWelcomeSelect(item) {
      if (!item) return;
      // 兼容字符串或对象格式 (item.text 是提示词文本, item.desc 是展示文本)
      const text = typeof item === 'string' ? item : (item.text || item.desc);
      if (text) {
        this.handleSend({ text });
      }
    }
  }
};


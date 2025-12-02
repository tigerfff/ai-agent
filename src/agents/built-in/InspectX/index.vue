<template>
  <div class="inspect-agent">
    <!-- 消息区域 -->
    <div class="chat-area">
      <AIWelcome
        v-if="messages.length === 0 && !loadingHistory"
        v-bind="welcomeConfig"
        @select="handleWelcomeSelect"
      />
      
      <div v-else-if="loadingHistory" class="loading-history">
        加载历史记录中...
      </div>

      <AIHistory 
        v-else
        ref="history"
        :list="messages" 
        :back-button-threshold="50"
        @complete="handleFinish"
      >
        <template #avatar="{ item }">
          <div class="custom-avatar" :class="item.role">
            {{ item.role === 'user' ? '👤' : '🤖' }}
          </div>
        </template>
      </AIHistory>
    </div>

    <!-- 输入区域 -->
    <div class="footer">
      <!-- 
        mode="file" 开启文件上传支持
        accepts 限制上传类型
      -->
      <AIInput 
        :loading="isStreaming || isUploading"
        placeholder="有问题尽管问我~"
        accepts=".jpg,.jpeg,.png,.mp4"
        :max-size="200 * 1024 * 1024"
        :before-add-attachments="handlePreUpload"
        @send="handleSend" 
        @stop="handleStop"
      />
    </div>
  </div>
</template>

<script>
import AIWelcome from '@/ai-ui/welcome/AIWelcome.vue';
import { OssUploader } from '@/utils/oss-uploader.js';
import { InspectApi } from './api';

export default {
  name: 'InspectAgent',
  inject: ['sessionApi'],
  components: {
    AIWelcome
  },
  data() {
    return {
      messages: [],
      chatId: '', // 当前会话的真实 chatId，用于 SSE 请求
      isStreaming: false,
      isUploading: false,
      loadingHistory: false,
      abortController: null,
      
      // OSS 上传器实例
      ossUploader: null,

      welcomeConfig: {
        icon: '🔍',
        title: '云小智 (Inspect Agent)',
        description: '我可以识别图片和视频中的内容，判断是否存在您关注的特定对象或行为。',
        prompts: [
          { icon: '📸', title: '图片分析', desc: '上传图片并询问内容', text: '请帮我分析这张图片' },
          { icon: '🎥', title: '视频检测', desc: '检测视频中的违规行为', text: '视频中是否有违规行为？' }
        ]
      }
    };
  },
  computed: {
  },
  watch: {
  },
  created() {
    this.initUploader();
    // 进入智能体时，直接按「先 list，再取第一个 chatId 调 history」的逻辑加载一次
    this.loadHistory();
  },
  methods: {
    initUploader() {
      this.ossUploader = new OssUploader({
        tokenProvider: async () => {
          try {
            const res = await InspectApi.getOssToken(this.$aiClient);
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
     * 预上传钩子：在文件进入附件栏前先上传到 OSS，返回带 url 的附件信息
     */
    async handlePreUpload(rawFiles) {
      if (!this.ossUploader) {
        // 没有配置 OSS 上传器时，直接走本地模式
        return rawFiles.map(file => ({
          url: '',
          name: file.name,
          size: file.size,
          type: file.type.startsWith('video') ? 'video' : 'image',
          rawFile: file
        }));
      }

      this.isUploading = true;
      try {
        const results = await Promise.all(
          rawFiles.map(async (file) => {
            const res = await this.ossUploader.upload(file);
            return {
              url: res.url,
              name: res.name || file.name,
              size: file.size,
              type: file.type.startsWith('video') ? 'video' : 'image',
              // 预上传完成后，正常情况下不再需要 rawFile；保留 null 即可
              rawFile: null
            };
          })
        );
        return results;
      } catch (e) {
        console.error('[InspectAgent] OSS pre-upload failed:', e);
        // 失败退回本地模式，至少还能在 UI 层看到选中的附件
        return rawFiles.map(file => ({
          url: '',
          name: file.name,
          size: file.size,
          type: file.type.startsWith('video') ? 'video' : 'image',
          rawFile: file
        }));
      } finally {
        this.isUploading = false;
      }
    },

    handleWelcomeSelect(text) {
      // 欢迎页点击不带附件，直接发送文本
      this.handleSend({ text, attachments: [] });
    },

    /**
     * 进入智能体时：先请求列表接口 /list，取第一个 chatId，再用它去调 /history
     */
    async loadHistory() {
      this.loadingHistory = true;
      this.messages = [];

      try {
        // 1. 获取会话列表
        const listRes = await InspectApi.getConversationList(this.$aiClient);
        console.log('[InspectAgent] Conversation list:', listRes);

        if (!(listRes && listRes.code === 0 && Array.isArray(listRes.data) && listRes.data.length > 0)) {
          // 没有历史会话，直接返回空列表（显示欢迎页）
          return;
        }

        const firstChat = listRes.data[0];
        const chatId = firstChat.chatId || firstChat.id;
        this.chatId = chatId || '';

        // 2. 用第一个 chatId 调用 history 接口
        const res = await InspectApi.getHistory(this.$aiClient, chatId);

        if (res && res.code === 0 && Array.isArray(res.data)) {
          const list = [];
          res.data.forEach(item => {
            const pair = this.adaptMessage(item);
            if (pair && pair.user) list.push(pair.user);
            if (pair && pair.ai) list.push(pair.ai);
          });
          this.messages = list;
        } 
      } catch (e) {
        console.error('[InspectAgent] loadHistory failed', e);
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

    async handleSend(data) {
      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      if (!data.text && attachments.length === 0) return;

      const userMsgKey = Date.now();
      
      // 1. 立即显示用户消息（附件已经在 beforeAddAttachments 中完成预上传）
      const userMsg = {
        key: userMsgKey,
        role: 'user',
        content: data.text,
        attachments: attachments,
        placement: 'end',
        variant: 'filled'
      };
      this.messages.push(userMsg);

      // 2. 从附件中提取 OSS URL，构造 imageList / videoList
      let uploadType = 'img'; // 默认为图片，如果有视频则切换
      const imageUrls = attachments
        .filter(a => a.type === 'image' && a.url)
        .map(a => a.url);
      const videoUrls = attachments
        .filter(a => a.type === 'video' && a.url)
        .map(a => a.url);

      if (videoUrls.length > 0) {
        uploadType = 'video';
      }

      // 3. 准备 AI 占位消息
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

      // 4. 发起 SSE 请求
      this.isStreaming = true;
      this.abortController = new AbortController();

      // 构造请求体：chatId 使用 loadHistory 时保存下来的真实 chatId
      const requestBody = {
        chatId: this.chatId,
        input: {
          prompt: data.text,
          imageList: imageUrls,
          videoList: videoUrls
        }
      };

      try {
        await InspectApi.chatStream(this.$aiClient, {
          data: requestBody,
          signal: this.abortController.signal,
          uploadType,
          onMessage: (msgData) => {
            aiMsg.loading = false;

            // 后端 SSE 返回结构示例：
            // { requestId, text, status, sessionId, chatId, msgId }
            if (!msgData) return;

            if (msgData.text) {
              aiMsg.content += msgData.text;
            }

            // status === 0 表示流式中间片段，非 0 视为结束
            if (msgData.status !== 0) {
              this.isStreaming = false;
              this.handleFinish({ index: this.messages.indexOf(aiMsg) });
            }
          },
          onComplete: () => {
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
        // SSE 启动失败 (非流过程中的错误)
        console.error('SSE Start Error', e);
        aiMsg.loading = false;
        aiMsg.content = '服务暂时不可用，请稍后再试。';
        this.isStreaming = false;
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

<style scoped>
.inspect-agent {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.chat-area {
  flex: 1;
  overflow: hidden;
  background: #f9f9f9;
  position: relative;
}

.loading-history {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.footer {
  padding: 16px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
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
}

.custom-avatar.user {
  background: #dbefff;
}

.custom-avatar.ai {
  background: #e6f7ff;
}
</style>


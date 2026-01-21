const fs = require('fs');
const path = require('path');

/**
 * CLI 脚本: 创建新的智能体
 * 用法: node scripts/create-agent.js <AgentName> [type]
 * type: mixin (默认) | standalone
 */

const agentName = process.argv[2];
const type = process.argv[3] || 'mixin';

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

if (!agentName) {
  console.log(`${colors.red}错误: 请提供智能体名称。${colors.reset}`);
  console.log(`${colors.cyan}用法: npm run create-agent <Name> [mixin|standalone]${colors.reset}`);
  process.exit(1);
}

// 目标目录: src/agents/built-in/<AgentName>
const targetDir = path.resolve(__dirname, `../src/agents/built-in/${agentName}`);

if (fs.existsSync(targetDir)) {
  console.log(`${colors.yellow}警告: 智能体 ${agentName} 已存在于 ${targetDir}${colors.reset}`);
  process.exit(1);
}

// 1. 创建文件夹
console.log(`${colors.blue}正在创建目录...${colors.reset}`);
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(path.join(targetDir, 'widgets'), { recursive: true });

// 2. 生成 api.js
const apiTemplate = `
import { buildUrl } from '@/utils/api-prefix';

const AGENT_ID = 'NEW_AGENT_ID'; // 请修改为实际的智能体 ID

export const ${agentName}Api = {
  /**
   * 获取 OSS 上传凭证
   */
  getOssToken(client) {
    return client.send({
      url: buildUrl(client, '/inspect/algorithm/models/upload/ossInfo', 'chain', '/api'),
      method: 'get'
    });
  },

  /**
   * 获取会话列表
   */
  getConversationList(client, data = {}) {
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/list\`, 'chain', '/api'),
      method: 'get',
      data
    });
  },

  /**
   * 获取会话历史记录
   */
  getHistory(client, sessionId, params = {}) {
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/historyScrolling\`, 'chain', '/api'),
      method: 'get',
      data: { chatId: sessionId, ...params }
    });
  },

  /**
   * 删除会话
   */
  deleteHistory(client, data) {
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/delete\`, 'chain', '/api'),
      method: 'delete',
      data
    });
  },

  /**
   * 创建会话
   */
  getChatId(client, data) {
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/add\`, 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 评价消息
   */
  evaluateMessage(client, data) {
    const { chatId, ...body } = data;
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/\${chatId}/userEvaluation\`, 'chain', '/api'),
      method: 'post',
      data: body
    });
  },

  /**
   * 发起流式对话
   */
  chatStream(client, { data, signal, onMessage, onComplete, onError }) {
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/app/stream/completion\`, '', ''),
      method: 'POST',
      data,
      stream: true,
      signal,
      onMessage,
      onComplete,
      onError
    });
  },

  /**
   * 重命名聊天
   */
  renameChatTitle(client, data) {
    const { chatId, ...body } = data;
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/\${chatId}/actions/renameChatTitle\`, 'chain', '/api'),
      method: 'post',
      data: body
    });
  },

  /**
   * 聊天置顶/取消置顶
   */
  pinnedChat(client, data) {
    const { chatId, pinned } = data;
    const url = \`\${buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/\${chatId}/actions/pinned\`, 'chain', '/api')}?pinned=\${pinned}\`;
    return client.send({
      url,
      method: 'put',
      data: {}
    });
  },

  /**
   * 获取智能体推荐的提示词
   */
  getSuggestions(client) {
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/suggestions\`, 'chain', '/api'),
      method: 'get'
    });
  },

  /**
   * 标记聊天已读
   */
  markAsRead(client, data) {
    const { chatId } = data;
    return client.send({
      url: buildUrl(client, \`/inspect/chat/web/agentV2/\${AGENT_ID}/chat/\${chatId}/actions/read\`, 'chain', '/api'),
      method: 'put',
      data: {}
    });
  }
};
`;

console.log(`${colors.blue}正在生成 api.js...${colors.reset}`);
fs.writeFileSync(path.join(targetDir, 'api.js'), apiTemplate.trim());

// 3. 生成 index.vue
const templateHtml = `<template>
  <div class="try-agent \${agentName.toLowerCase()}-agent" :class="{ 'is-mini': isMini }">
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
      >
        <template #widget="{ item, index }">
          <!-- 在这里添加您的自定义业务卡片 (Widget) -->
        </template>

        <template #footer="{ item, index, isLast }">
          <div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <BubbleFooter 
                v-show="shouldShowFooter(item)"
                :item="item" 
                :actions="getActions(item)"
                :is-last="isLast"
                @action="handleAction($event, item, index)"
              />
            </div>

            <AISuggestWidget
              v-if="item.content && item.content.includes('ymform:suggest')"
              :data="parseWidgetData(item, 'ymform:suggest')"
              @select="handleWelcomeSelect"
            />
          </div>
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
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="asrConfigProvider"
          :send-disabled="sendBtnDisabled"
          @send="handleSend" 
          @stop="handleStop"
          @file-list-change="inputFilesList = $event"
        />
        <p class="footer-text">内容由AI生成，仅供参考</p>
      </div>
    </div>
  </div>
</template>`;

const templateStyle = `<style lang="scss" scoped>
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
}
</style>`;

let vueTemplate = '';

if (type === 'standalone') {
  // Standalone 模式: 内联所有逻辑
  vueTemplate = `${templateHtml}

<script>
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
import AISuggestWidget from '@/ai-ui/base-widget/AISuggestWidget.vue';
import { parseWidgetData } from '@/utils/widget-parser';

import { ${agentName}Api } from './api';

export default {
  name: '${agentName}Agent',
  components: {
    AIWelcome,
    ChatSkeleton,
    AIHistory,
    AIInput,
    BubbleFooter,
    AIIcon,
    AISuggestWidget
  },
  props: {
    conversationId: { type: String, default: '' },
    isMini: { type: Boolean, default: false }
  },
  data() {
    return {
      messages: [],
      chatId: '',
      isStreaming: false,
      isUploading: false,
      loadingHistory: false,
      isInitialLoading: false,
      allHistoryLoaded: false,
      pageSize: 20,
      abortController: null,
      isCreatingSession: false,
      aiInputText: '',
      inputFilesList: [],
      actionConfig: {
        user: ['copy'],
        bot: ['fresh', 'copy', 'like', 'dislike']
      },
      ossUploader: null,
      conversationsMap: new Map(),
      welcomeConfig: {
        title: '${agentName}',
        description: '我是您的智能助手，有什么可以帮您的吗？',
        prompts: []
      }
    };
  },
  computed: {
    asrConfigProvider() {
      return SpeechRecognizerWrapper.createConfigProvider(this.$aiClient);
    },
    sendBtnDisabled() {
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
        this.fetchConversationList();
        if (val && !val.startsWith('conv-')) {
          if (this.chatId === val) return;
          this.chatId = val;
          this.loadHistory();
          const conv = this.conversationsMap.get(val);
          if (conv && conv.isUnread) {
            this.markAsRead(val);
          }
        } else {
          this.chatId = '';
          this.messages = [];
          this.fetchSuggestions();
        }
      }
    }
  },
  created() {
    this.initUploader();
  },
  beforeDestroy() {
    if (this.ossUploader) this.ossUploader.destroy?.();
  },
  methods: {
    getAgentApi() { return ${agentName}Api; },
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
            console.error('Fetch STS token failed', e);
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
          this.$emit('update-list', Array.from(map.values()));
        }
      } catch (e) { console.error('fetchConversationList failed', e); }
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
          const oldestAiMsg = this.messages.find(m => m.role === 'ai' && m.msgId);
          if (oldestAiMsg) params.key = \`\${oldestAiMsg.time}_\${oldestAiMsg.msgId}\`;
        }
        const res = await api.getHistory(this.$aiClient, this.chatId, params);
        if (res && res.code === 0 && Array.isArray(res.data)) {
          let rawList = res.data;
          if (rawList.length < this.pageSize) this.allHistoryLoaded = true;
          const newList = [];
          rawList.forEach(item => {
            const pair = adaptMessage(item);
            if (pair.user.content || pair.user.attachments?.length) newList.push(pair.user);
            if (pair.ai.content || pair.ai.attachments?.length) newList.push(pair.ai);
          });
          this.messages = isLoadMore ? [...newList, ...this.messages] : newList;
        }
      } catch (e) { console.error('loadHistory failed', e); }
      finally { this.loadingHistory = false; this.isInitialLoading = false; }
    },
    async handleLoadMore() {
      if (this.loadingHistory || this.allHistoryLoaded || this.isStreaming) return;
      await this.loadHistory(true);
    },
    async handleSend(data) {
      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      if (!data.text && attachments.length === 0) return;
      const api = this.getAgentApi();
      if (!this.chatId || this.chatId.startsWith('conv-')) {
        if (this.isCreatingSession) return;
        this.isCreatingSession = true;
        try {
          const res = await api.getChatId(this.$aiClient, { mineType: attachments[0]?.type || 'image' });
          if (res.code === 0 && res.data) {
            this.chatId = res.data.chatId || res.data;
            this.$emit('select-conversation', this.chatId);
            this.fetchConversationList();
          }
        } finally { this.isCreatingSession = false; }
      }
      const userMsg = { role: 'user', content: data.text, attachments, placement: 'end', time: Date.now() };
      this.messages.push(userMsg);
      const aiMsg = { role: 'ai', content: '', loading: true, placement: 'start', time: Date.now() };
      this.messages.push(aiMsg);
      this.isStreaming = true;
      this.abortController = new AbortController();
      try {
        await api.chatStream(this.$aiClient, {
          data: { chatId: this.chatId, input: { prompt: data.text, imageList: attachments.filter(a => a.type === 'image').map(a => a.url) } },
          signal: this.abortController.signal,
          onMessage: (msgData) => {
            if (msgData.text) aiMsg.content += msgData.text;
            if (msgData.msgId) aiMsg.msgId = msgData.msgId;
            if (msgData.status !== 0) { aiMsg.loading = false; this.isStreaming = false; }
          },
          onComplete: () => { aiMsg.loading = false; this.isStreaming = false; },
          onError: () => { aiMsg.loading = false; this.isStreaming = false; }
        });
      } catch (e) { aiMsg.loading = false; this.isStreaming = false; }
    },
    handleStop() {
      if (this.abortController) this.abortController.abort();
      this.isStreaming = false;
    },
    async fetchSuggestions() {
      const api = this.getAgentApi();
      try {
        const res = await api.getSuggestions(this.$aiClient);
        if (res && res.code === 0 && Array.isArray(res.data)) {
          this.welcomeConfig.prompts = res.data.map(text => ({ desc: text, text: text, needsFile: false }));
        }
      } catch (e) { console.error('Fetch suggestions failed:', e); }
    },
    getActions(item) {
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },
    shouldShowFooter(item) {
      if (item.placement === 'start' && item.role === 'ai') {
        if (item.loading) return false;
        if (!item.msgId) return false;
        return true;
      }
      return !!(item && item.content);
    },
    async markAsRead(id) {
      const api = this.getAgentApi();
      if (!api || typeof api.markAsRead !== 'function') return;
      try { await api.markAsRead(this.$aiClient, { chatId: id }); } catch (e) {}
    },
    handleFinish({ index }) {
      if (index === this.messages.length - 1) {
        this.isStreaming = false;
        if (this.messages.length <= 2) this.fetchConversationList();
      }
    },
    handleAction(type, payload, index) {
      // 基础实现，可参考 AgentBaseMixin
      if (type === 'copy') { /* 复制逻辑 */ }
    },
    handleWelcomeSelect(item) {
      const text = typeof item === 'string' ? item : (item.text || item.desc);
      if (text) this.handleSend({ text });
    }
  }
};
</script>

${templateStyle}`;
} else {
  // Mixin 模式: 结构与 InspectX 一致，移除特定 Widget
  vueTemplate = `${templateHtml}

<script>
import { ${agentName}Api } from './api';
import { AgentBaseMixin } from '@/mixins/AgentBaseMixin';
import AISuggestWidget from '@/ai-ui/base-widget/AISuggestWidget.vue';
import { parseWidgetData } from '@/utils/widget-parser';

export default {
  name: '${agentName}Agent',
  mixins: [AgentBaseMixin],
  components: {
    AISuggestWidget
  },
  props: {
    conversationId: { type: String, default: '' },
    isMini: { type: Boolean, default: false }
  },
  data() {
    return {
      welcomeConfig: {
        title: '${agentName}',
        description: '我是您的智能助手，有什么可以帮您的吗？',
        prompts: []
      }
    };
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        if (!val || val.startsWith('conv-')) {
          this.fetchSuggestions();
        }
      }
    }
  },
  methods: {
    getAgentApi() { return ${agentName}Api; },
    async fetchSuggestions() {
      try {
        const res = await ${agentName}Api.getSuggestions(this.$aiClient);
        if (res && res.code === 0 && Array.isArray(res.data)) {
          this.welcomeConfig.prompts = res.data.map(text => ({
            desc: text,
            text: text,
            needsFile: false
          }));
        } 
      } catch (e) {
        console.error('Fetch suggestions failed:', e);
      }
    },
    getActions(item) {
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },
    shouldShowFooter(item) {
      if (item.placement === 'start' && item.role === 'ai') {
        if (item.loading) return false;
        if (!item.msgId) return false;
        return true
      }
      return !!(item && item.content);
    },
    handleWidgetSend(text) {
      this.handleSend({ text });
    }
  }
};
</script>

${templateStyle}`;
}

console.log(`${colors.blue}正在生成 index.vue (${type} 模式)...${colors.reset}`);
fs.writeFileSync(path.join(targetDir, 'index.vue'), vueTemplate.trim());

// 4. 创建 widgets/.gitkeep 确保目录被 Git 追踪
fs.writeFileSync(path.join(targetDir, 'widgets', '.gitkeep'), '');

console.log(`\n${colors.green}✨ 成功! 智能体 ${agentName} 已创建成功。${colors.reset}`);
console.log(`${colors.cyan}路径: ${targetDir}${colors.reset}`);
console.log(`\n${colors.yellow}下一步建议:${colors.reset}`);
console.log(`1. 在 src/config/agent-config.js 中导入并注册此智能体。`);
console.log(`2. 在 src/agents/built-in/${agentName}/api.js 中修改 AGENT_ID。`);
console.log(`3. 开始在 index.vue 中编写您的业务逻辑！\n`);

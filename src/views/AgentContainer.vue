<template>
  <div class="agent-container-wrapper">
    <AILayout class="ai-agent-container" :class="{ 'is-mini': isMini }" :is-mini="isMini">
    <!-- 左侧导航 -->
    <template #sider>
      <AISidebar 
        v-if="!isHome"
        :agents="allAgents" 
        :current-agent-id="currentAgentId"
        :conversations="filteredConversations"
        :active-conversation-id="currentConversationId"
        :collapsed.sync="isCollapsed"
        :is-mini="isMini"
        @update:activeConversationId="handleSelectConversation"
        @select="handleSelectAgent"
        @new-chat="handleNewChat"
        @conversation-menu-command="handleMenuCommand"
      >
        <template #bottom>
          <slot name="sidebar-bottom"></slot>
        </template>
      </AISidebar>
    </template>

    <!-- 右侧内容 -->
    <template #default>
      <!-- 场景 1: 首页列表 -->
      <Home 
        v-if="isHome" 
        :agents="allAgents"
        :is-mini="isMini"
        @select="handleSelectAgent"
        @toggle-size="toggleWindowSize"
        @close="closeWindow"
      />

      <!-- 场景 2: 具体智能体页面 -->
      <div v-else class="agent-viewport">

        <div class="viewport-header">
          <!-- 左侧：侧边栏收起时显示 -->
          <div class="header-left">
            <div class="toggle-btn" v-if="isCollapsed" @click="isCollapsed = false" title="展开侧边栏">
              <img src="@/assets/svg/history.svg" alt="展开" class="icon-svg" />
            </div>
            <div class="toggle-btn" v-if="isCollapsed" @click="handleNewChat" title="新建会话">
              <img src="@/assets/svg/add.svg" alt="新建会话" class="icon-svg" />
            </div>
          </div>

          <div class="header-title">
            {{ currentConversationTitle }}
          </div>

          <!-- 右侧：窗口控制 -->
          <div class="header-right">
            <div class="toggle-btn" @click="toggleWindowSize" :title="isMini ? '最大化' : '还原'">
              <img v-if="isMini" src="@/assets/svg/expand.svg" alt="最大化" class="icon-svg" />
              <img v-else src="@/assets/svg/collapse.svg" alt="还原" class="icon-svg" />
            </div>
            <div class="toggle-btn" title="关闭" @click="closeWindow">
              <img src="@/assets/svg/close-window.svg" alt="关闭" class="icon-svg" />
            </div>
          </div>
        </div>
       
        <div class="viewport-content">
          <!-- A. 内置智能体 -->
          <component 
            v-if="currentAgent && currentAgent.type === 'built-in'"
            ref="activeAgent"
            :is="currentAgent.component"
            :key="`builtin-${componentKey}`"
            :conversation-id="currentConversationId"
            :is-mini="isMini"
            @update-list="handleUpdateConversationList"
            @select-conversation="handleSelectConversation"
          />

          <!-- B. 外部注入智能体 (Slot) -->
          <div 
            v-else-if="currentAgent && currentAgent.type === 'slot'"
            class="slot-wrapper"
            :key="`slot-${componentKey}`"
          >
            <slot 
              name="agent-view" 
              :agent="currentAgent"
            >
              <div class="empty-tip">
                请在父组件通过 slot="agent-view" 渲染内容<br>
                Agent ID: {{ currentAgent.id }}
              </div>
            </slot>
          </div>
        </div>
      </div>
    </template>
    </AILayout>

    <!-- 重命名对话框 -->
    <el-dialog
      title="修改名称"
      :visible.sync="renameDialogVisible"
      :area="[480,320]"
      :close-on-click-modal="false"
      custom-class="ai-rename-dialog"
      append-to-body
    >
      <el-form
        ref="renameForm"
        :model="renameForm"
        :rules="renameRules"
        label-position="top"
        label-width="80px"
        @submit.native.prevent="handleRenameConfirm"
        style="padding: 50px 16px"
      >
        <el-form-item label="重命名" prop="name" >
          <el-input
            v-model="renameForm.name"
            placeholder="请输入名称"
            maxlength="32"
            show-word-limit
            autofocus
            ref="renameInput"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleRenameCancel">取消</el-button>
        <el-button type="primary" @click="handleRenameConfirm" :loading="renameLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AILayout from '@/ai-ui/layout/AILayout.vue';
import AISidebar from '@/ai-ui/layout/AISidebar.vue';
import Home from './Home.vue';
import { getAgentsByBusinessLine, getCurrentBusinessLine } from '@/config/agent-config';
import { formatConversationTime } from '@/utils';

export default {
  name: 'AIAgentContainer',
  components: {
    AILayout,
    AISidebar,
    Home
  },
  props: {
    // 外部注入的智能体列表
    // 格式: [{ id, name, icon, type: 'slot', ... }]
    extraAgents: {
      type: Array,
      default: () => []
    },
    // 业务线标识（如果不传，会自动检测）
    businessLine: {
      type: String,
      default: null
    },
    // 是否为小窗模式
    isMini: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      sessionApi: {
        updateCurrentTitle: (title) => {
          const chat = this.conversations.find(c => c.id === this.currentConversationId);
          if (chat) chat.label = title;
        },
        deleteCurrentSession: () => {
          this.deleteConversation(this.currentConversationId);
        },
        createNewSession: () => {
          this.handleNewChat();
        },
        getCurrentSessionId: () => this.currentConversationId
      }
    };
  },
  data() {
    return {
      currentAgentId: null, // null 表示首页
      componentKey: 0, // 用于强制刷新组件的 key
      conversations: [],
      currentConversationId: '',
      isCollapsed: false,
      // 重命名对话框相关
      renameDialogVisible: false,
      renameForm: {
        name: ''
      },
      renameRules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur' }
        ]
      },
      currentRenameItem: null,
      renameLoading: false
    };
  },
  computed: {
    // 当前业务线
    currentBusinessLine() {
      return getCurrentBusinessLine();
    },
    // 根据业务线过滤的内置智能体
    builtInAgents() {
      return getAgentsByBusinessLine(this.currentBusinessLine);
    },
    // 合并所有智能体
    allAgents() {
      return [...this.builtInAgents, ...this.extraAgents];
    },
    currentAgent() {
      return this.allAgents.find(a => a.id === this.currentAgentId);
    },
    isHome() {
      return !this.currentAgentId;
    },
    // 根据当前选中的智能体，过滤出对应的会话
    filteredConversations() {
      if (!this.currentAgentId) return [];
      return this.conversations.filter(c => c.agentId === this.currentAgentId);
    },
    currentConversationTitle() {
      const chat = this.conversations.find(c => c.id === this.currentConversationId);
      return chat ? (chat.label || '新会话') : 'AI 助手';
    }
  },
  methods: {
    toggleWindowSize() {
      this.$emit('toggle-size');
    },
    closeWindow() {
      this.$emit('close');
    },
    async handleSelectAgent(agent) {
      this.currentAgentId = agent.id;
      
      // 切换智能体后，尝试选中该智能体的最新会话
      // 如果是 TryAgent，列表可能是空的，等待组件 emit update-list 后再选中
      const firstConv = this.conversations.find(c => c.agentId === agent.id);
      this.currentConversationId = firstConv ? firstConv.id : null;
      this.componentKey++; 
    },
    
    // 由子组件 (TryAgent) 触发，更新会话列表
    handleUpdateConversationList(newList) {
      // 1. 移除当前 Agent 的旧会话
      this.conversations = this.conversations.filter(c => c.agentId !== this.currentAgentId);
      
      // 2. 补全 agentId 并合并新会话
      // 注意：不强制设置 group，让 AIConversations 组件内部自动按时间分组
      const formattedList = newList.map(item => ({
        ...item,
        agentId: this.currentAgentId
        // group 字段由 AIConversations 组件内部根据时间自动计算
      }));
      
      this.conversations = [...this.conversations, ...formattedList];

      // 3. 检查当前选中的 ID 是否在新列表中
      // 注意：如果是临时 ID (conv-开头)，可能不在新列表中，但我们需要保留它
      const currentExists = formattedList.some(item => item.id === this.currentConversationId);
      const isTempId = this.currentConversationId && this.currentConversationId.startsWith('conv-');

      if (!isTempId && (!this.currentConversationId || !currentExists) && formattedList.length > 0) {
        // 如果不是临时 ID，且当前没有选中或选中的 ID 已失效，则选中第一个
        this.currentConversationId = formattedList[0].id;
      } else if (!isTempId && !currentExists && formattedList.length === 0) {
        // 如果列表为空且不是临时 ID，清空选中
        this.currentConversationId = null;
      }
    },

    handleSelectConversation(id) {
      this.currentConversationId = id;
      // this.componentKey++; // 切换会话时不再强制刷新组件，让子组件自己 watch conversationId
    },
    handleNewChat() {
      console.log('User clicked new chat');
      if (!this.currentAgentId) return;

      const newId = 'conv-' + Date.now();
      // 这里对于 TryAgent 应该调接口创建新会话？
      // 暂时只在前端创建，等发消息时后端可能会返回新 ID
      // 但 TryAgent 的逻辑通常是需要先有 chatId (或者发消息时生成)
      // 现有的逻辑里，handleSend 用的是 this.chatId。如果这里的 newId 是前端生成的，传给 API 可能会有问题
      // 除非 API 支持传空 chatId 创建新会话。
      // 先保持前端逻辑：
      const now = new Date().toISOString();
      this.conversations.unshift({
        id: newId,
        agentId: this.currentAgentId,
        label: '新会话',
        createTime: now,
        updateTime: now,
        time: formatConversationTime(now)
      });
      this.currentConversationId = newId;
      this.componentKey++; 
    },
    deleteConversation(id) {
      // 1. 调用子组件的删除方法（如果存在）
      if (this.$refs.activeAgent && typeof this.$refs.activeAgent.deleteSession === 'function') {
        this.$refs.activeAgent.deleteSession(id);
      }
      
      // 2. 更新本地列表
      const index = this.conversations.findIndex(c => c.id === id);
      if (index > -1) {
        this.conversations.splice(index, 1);
        if (this.currentConversationId === id) {
          // 如果删除了当前会话，选中当前智能体的下一个会话
          const nextConv = this.conversations.find(c => c.agentId === this.currentAgentId);
          this.currentConversationId = nextConv ? nextConv.id : null;
          // this.componentKey++; // 不再强制刷新，让子组件自己处理状态
        }
      }
    },
    async handleMenuCommand(command, item) {
      const agent = this.$refs.activeAgent;

      if (command === 'delete') {
        const data = await this.$confirm('确定删除?', {
          message: '该对话内容删除后将无法恢复',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'ai-custom-message-box'
        })
        if (data === 'confirm') {
          this.deleteConversation(item.id);
        }
      } else if (command === 'rename') {
        this.currentRenameItem = item;
        this.renameForm.name = item.label || '';
        this.renameDialogVisible = true;
        this.$nextTick(() => {
          if (this.$refs.renameForm) {
            this.$refs.renameForm.clearValidate();
          }
          // 尝试聚焦输入框
          if (this.$refs.renameInput) {
            this.$refs.renameInput.focus();
          }
        });
      } else if (command === 'pin') {
        if (agent && typeof agent.pinSession === 'function') {
          // Toggle pin state. Note: AIConversations passes processed item, 
          // item.top or item._isTop should be available.
          // Based on AIConversations logic, it preserves original fields.
          // So we should check item.top (boolean).
          agent.pinSession(item.id, !item.top);
        } else {
          // Fallback local toggle
          this.$set(item, 'top', !item.top);
        }
      }
    },
    goHome() {
      // 如果只有一个智能体，不允许返回首页
      if (this.allAgents.length === 1) return;
      this.currentAgentId = null;
    },
    checkSingleAgent() {
      if (this.allAgents.length === 1) {
        this.handleSelectAgent(this.allAgents[0]);
      }
    },
    // 重命名相关方法
    async handleRenameConfirm() {
      if (!this.$refs.renameForm) return;
      
      this.$refs.renameForm.validate(async (valid) => {
        if (!valid) return;
        
        const newName = this.renameForm.name.trim();
        if (!newName) return;
        
        if (!this.currentRenameItem) return;
        
        this.renameLoading = true;
        try {
          const agent = this.$refs.activeAgent;
          if (agent && typeof agent.renameSession === 'function') {
            await agent.renameSession(this.currentRenameItem.id, newName);
          } else {
            // Fallback
            this.currentRenameItem.label = newName;
          }
          this.renameDialogVisible = false;
        } catch (e) {
          console.error('Rename failed:', e);
          // 错误提示由 axios 拦截器或 agent 内部处理，这里也可以兜底
          if (e.message) this.$message.error(e.message);
        } finally {
          this.renameLoading = false;
        }
      });
    },
    handleRenameCancel() {
      this.renameDialogVisible = false;
      this.currentRenameItem = null;
      this.renameForm.name = '';
      if (this.$refs.renameForm) {
        this.$refs.renameForm.clearValidate();
      }
    }
  },
  mounted() {
    this.checkSingleAgent();
  },
  watch: {
    isMini: {
      handler(val) {
        this.isCollapsed = val;
      },
      immediate: true
    },
    allAgents: {
      handler() {
        // 当智能体列表变化时（例如外部注入更新），再次检查
        if (!this.currentAgentId) {
          this.checkSingleAgent();
        }
      },
      deep: true
    }
  }
};
</script>

<style lang="scss" scoped>
.agent-container-wrapper {
  height: 100%;
  width: 100%;
}

.ai-agent-container {
  height: 100%;
  --chat-max-width: 960px; // 默认全屏下的内容宽度限制

  // 小窗模式适配：覆盖 AILayout 的 min-width
  &.is-mini {
    min-width: 0 !important;
    --chat-max-width: 600px; // 小窗模式下的宽度
  }

  .agent-viewport {
    display: flex;
    flex-direction: column;
    height: 100%;

    .viewport-header {
      flex-shrink: 0;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: transparent;
      z-index: 10;
      
      .header-left, .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0; // 防止按钮被标题挤压
      }

      .header-title {
        flex: 1;
        text-align: center;
        font-size: 16px;
        font-weight: 500;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0 16px;
      }

      .toggle-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .icon-svg {
          width: 20px;
          height: 20px;
        }
        
        .icon-text {
          font-size: 18px;
          color: #606266;
          line-height: 1;
        }
      }
    }

    .viewport-content {
      flex: 1;
      overflow: hidden;
      position: relative;
      display: flex;
      width: 100%;

      > * {
        width: 100%;
        height: 100%;
      }
    }
  }

  .empty-tip {
    padding: 40px;
    text-align: center;
    color: #999;
    border: 2px dashed #eee;
    margin: 20px;
    border-radius: 8px;
  }

  .slot-wrapper {
    height: 100%;
  }
}
</style>

<style lang="scss">
.ai-rename-dialog {
  .dialog-footer {
    .el-button--primary {
      background: rgba(56, 142, 255, 1) !important;
      border-color: rgba(56, 142, 255, 1) !important;
      color: #fff !important;
      
      &:hover {
        background: rgba(56, 142, 255, 0.9) !important;
        border-color: rgba(56, 142, 255, 0.9) !important;
      }
      
      &:active,
      &:focus {
        background: rgba(56, 142, 255, 0.8) !important;
        border-color: rgba(56, 142, 255, 0.8) !important;
      }
    }
  }
}
</style>
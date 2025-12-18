<template>
  <div class="agent-container-wrapper ai-component-wrapper">
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
        :hide-conversations="shouldHideConversations"
        @update:activeConversationId="handleSelectConversation"
        @select="handleSelectAgent"
        @new-chat="handleNewChat"
        @conversation-menu-command="handleMenuCommand"
      >
        <template #bottom>
          <slot name="sidebar-bottom">
            <el-popover
              placement="top-start"
              width="auto"
              trigger="hover"
              popper-class="ai-contact-popover"
            >
              <img src="@/assets/images/scan-contact@3x.png" alt="扫码咨询" class="qrcode-img" />
              <div slot="reference" class="contact-btn">
                <img v-if="!isCollapsed" src="@/assets/images/business-contact@3x.png" alt="商务接洽" class="contact-img-full" />
                <img v-else src="@/assets/images/business-contact@3x-1.png" alt="商务接洽" class="contact-img-mini" />
              </div>
            </el-popover>
          </slot>
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
            <div class="toggle-btn" v-show="!shouldHideConversations" v-if="isCollapsed" @click="handleNewChat" title="新建会话">
              <img src="@/assets/svg/add.svg" alt="新建会话" class="icon-svg" />
            </div>
          </div>

          <div class="header-title" v-show="!shouldHideConversations">
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
          <!-- 权限检查中 -->
          <div v-if="checkingPermission" class="permission-checking">
            <ChatSkeleton />
          </div>
        
          <!-- 无权限状态 / 建设中状态 -->
          <AIEmpty
            v-else-if="currentAgent && permissionStatus && permissionStatus.status !== 'has_permission'"
            :type="getEmptyType()"
            :title="getEmptyTitle()"
            :description="getEmptyDescription()"
            :is-mini="isMini"
          />  

          <!-- A. 内置智能体（有权限时显示） -->
          <component 
            v-else-if="currentAgent && currentAgent.type === 'built-in' && (!permissionStatus || permissionStatus.status === 'has_permission')"
            ref="activeAgent"
            :is="currentAgent.component"
            :key="`builtin-${componentKey}`"
            :conversation-id="currentConversationId"
            :is-mini="isMini"
            :businessLine="businessLine"
            @update-list="handleUpdateConversationList"
            @select-conversation="handleSelectConversation"
          />

          <!-- B. 外部注入智能体 (Slot) -->
          <div 
            v-else-if="currentAgent && currentAgent.type === 'slot' && (!permissionStatus || permissionStatus.status === 'has_permission')"
            class="slot-wrapper"
            :key="`slot-${componentKey}`"
          >
            <slot 
              name="agent-view" 
              :agent="currentAgent"
              :is-mini="isMini"
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
import { checkAgentPermission, PERMISSION_STATUS } from '@/utils/permission-checker';
import AIEmpty from '@/ai-ui/empty/AIEmpty.vue';
import ChatSkeleton from '@/ai-ui/skeleton/ChatSkeleton.vue';

export default {
  name: 'AIAgentContainer',
  components: {
    AILayout,
    AISidebar,
    Home,
    AIEmpty,
    ChatSkeleton
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
    },
    // 当前用户 ID (用于权限检查)
    userId: {
      type: String,
      default: ''
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
      renameLoading: false,
      // 权限相关
      permissionStatus: null,      // 当前智能体的权限状态
      checkingPermission: false    // 是否正在检查权限
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
      if (this.currentConversationId && this.currentConversationId.startsWith('conv-')) {
        return '新会话';
      }
      const chat = this.conversations.find(c => c.id === this.currentConversationId);
      return chat ? (chat.label || '新会话') : 'AI 助手';
    },
    /**
     * 是否隐藏会话列表和相关 UI（由智能体配置控制）
     * 场景：自定义 slot 智能体，不需要左侧历史和新建会话按钮
     */
    shouldHideConversations() {
      console.log(this.currentAgent,'this.currentAgent')
      if (!this.currentAgent) return false;
      // 仅当为 slot 类型，且配置了 hideConversations=true 时隐藏
      return this.currentAgent.hideConversations === true;
    }
  },
  methods: {
    toggleWindowSize() {
      this.$emit('toggle-size');
    },
    closeWindow() {
      this.$emit('close');
    },

    /**
     * 初始化状态（支持 Deep Link）
     * @param {Object} params - { agentId, chatId }
     */
    async initializeState(params) {
      const { agentId, chatId } = params || {};

      // 1. 如果没有传参数，或者 agentId 为空 -> 回到首页
      if (!agentId) {
        this.currentAgentId = null;
        this.currentConversationId = null;
        return;
      }

      // 2. 尝试查找目标智能体
      let targetAgent = this.allAgents.find(a => a.id === agentId);
      let targetChatId = chatId;

      // 3. 如果没找到，降级为第一个智能体
      if (!targetAgent) {
        if (this.allAgents.length > 0) {
          targetAgent = this.allAgents[0];
          // 既然 Agent 都不对，传入的 chatId 也就没有意义了，直接丢弃，让 handleSelectAgent 自动选第一个会话
          targetChatId = null; 
        } else {
          // 没有任何智能体，无法操作
          return;
        }
      }

      // 4. 选中智能体
      await this.handleSelectAgent(targetAgent);

      // 5. 如果指定了会话 ID，尝试选中它
      // 注意：handleSelectAgent 会默认选中第一个会话，这里进行覆盖
      if (targetChatId) {
        // 这里不需要判断 chatId 是否在 conversations 列表中
        // 因为 handleUpdateConversationList 会在组件加载后再次校验
        this.currentConversationId = targetChatId;
      }
    },

    async handleSelectAgent(agent) {
      // 如果是外部链接类型，先检查权限再跳转
      if (agent.type === 'external' && agent.getUrl) {
        this.checkingPermission = true;
        try {
          const permissionResult = await checkAgentPermission(this.$aiClient, this.userId, agent);
          if (permissionResult.status !== PERMISSION_STATUS.HAS_PERMISSION) {
            // 无权限，不跳转，显示权限状态
            this.currentAgentId = agent.id;
            this.permissionStatus = permissionResult;
            this.checkingPermission = false;
            return;
          }
        } catch (e) {
          console.error('[AgentContainer] Permission check failed:', e);
          this.checkingPermission = false;
          return;
        }
        this.checkingPermission = false;
        
        // 有权限，新开窗口跳转
        const url = typeof agent.getUrl === 'function' ? agent.getUrl() : agent.getUrl;
        window.open(url, '_blank');
        return;
      }
      
      this.currentAgentId = agent.id;
      this.permissionStatus = null;
      
      // 检查内置智能体权限
      this.checkingPermission = true;
      try {
        const permissionResult = await checkAgentPermission(this.$aiClient, this.userId, agent);
        console.log(permissionResult,'permissionResult')
        this.permissionStatus = permissionResult;
      } catch (e) {
        console.error('[AgentContainer] Permission check failed:', e);
        // 权限检查失败，默认允许访问（降级处理）
        this.permissionStatus = { status: PERMISSION_STATUS.HAS_PERMISSION };
      } finally {
        this.checkingPermission = false;
      }
      
      // 切换智能体后，尝试选中该智能体的最新会话
      // 如果是 TryAgent，列表可能是空的，等待组件 emit update-list 后再选中
      const firstConv = this.conversations.find(c => c.agentId === agent.id);
      this.currentConversationId = firstConv ? firstConv.id : null;
      this.componentKey++; 
    },
    
    /**
     * 获取权限描述信息
     */
    getPermissionDescription() {
      if (!this.currentAgent || !this.permissionStatus) return '';
      
      const { permission } = this.currentAgent;
      if (!permission) return this.permissionStatus.message || '';
      
      // 优先使用 checkAgentPermission 返回的 message
      if (this.permissionStatus.message) {
        return this.permissionStatus.message;
      }
      
      if (this.permissionStatus.status === PERMISSION_STATUS.NO_SERVICE) {
        return `请联系管理员扫码添加销售人员进行购买`;
      } else if (this.permissionStatus.status === PERMISSION_STATUS.NO_PERMISSION) {
        return `请联系管理员开通对应的模块权限`;
      }
      
      return this.permissionStatus.message || '';
    },
    
    /**
     * 获取 AIEmpty 的 type
     */
    getEmptyType() {
      if (!this.permissionStatus) return 'default';
      
      if (this.permissionStatus.status === PERMISSION_STATUS.UNDER_CONSTRUCTION) {
        return 'building';
      } else if (this.permissionStatus.status === PERMISSION_STATUS.NO_SERVICE) {
        return 'no-service';
      }
      return 'default';
    },
    
    /**
     * 获取 AIEmpty 的 title
     */
    getEmptyTitle() {
      if (!this.currentAgent || !this.permissionStatus) return '';
      
      if (this.permissionStatus.status === PERMISSION_STATUS.UNDER_CONSTRUCTION) {
        return this.currentAgent.name || '智能体';
      } else if (this.permissionStatus.status === PERMISSION_STATUS.NO_SERVICE) {
        return `你还未购买「${this.currentAgent?.permission?.serviceName || '该服务'}」`;
      } else if (this.permissionStatus.status === PERMISSION_STATUS.NO_PERMISSION) {
        return `无「${this.currentAgent?.permission?.permissionName || '使用'}」权限`;
      }
      
      return '';
    },
    
    /**
     * 获取 AIEmpty 的 description
     */
    getEmptyDescription() {
      if (!this.permissionStatus) return '';
      
      if (this.permissionStatus.status === PERMISSION_STATUS.UNDER_CONSTRUCTION) {
        return '该智能体正在建设中,敬请期待...';
      }
      
      return this.getPermissionDescription();
    },
    
    // 由子组件 (TryAgent) 触发，更新会话列表
    handleUpdateConversationList(newList) {
      // 1. 移除当前 Agent 的旧会话
      this.conversations = this.conversations.filter(c => c.agentId !== this.currentAgentId);
      
      // 2. 补全 agentId 并合并新会话
      const formattedList = newList.map(item => ({
        ...item,
        agentId: this.currentAgentId
      }));
      
      this.conversations = [...this.conversations, ...formattedList];

      // 3. 检查当前选中的 ID 是否在新列表中
      const currentExists = formattedList.some(item => item.id === this.currentConversationId);
      const isTempId = this.currentConversationId && this.currentConversationId.startsWith('conv-');

      if (!isTempId && (!this.currentConversationId || !currentExists)) {
        if (formattedList.length > 0) {
          // 如果不是临时 ID，且当前没有选中或选中的 ID 已失效，则选中第一个
          this.currentConversationId = formattedList[0].id;
        } else {
          // 如果列表为空，自动进入新建会话状态
          this.handleNewChat();
        }
      }
      // 如果是临时 ID，即使不在列表中也保留选中状态（虚拟会话）
    },

    handleSelectConversation(id) {
      this.currentConversationId = id;
      // this.componentKey++; // 切换会话时不再强制刷新组件，让子组件自己 watch conversationId
    },
    handleNewChat() {
      console.log('User clicked new chat');
      if (!this.currentAgentId) return;

      // 如果当前已经是新会话（虚拟ID），则不再重复创建
      if (this.currentConversationId && this.currentConversationId.startsWith('conv-')) {
        return;
      }

      // 生成新ID，但 *不添加到 conversations 列表*
      // 虚拟会话只在内存中维护，直到发送第一条消息后后端返回真实会话
      const newId = 'conv-' + Date.now();
      
      this.currentConversationId = newId;
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
        // 等待 dialog 完全打开后再操作
        this.$nextTick(() => {
          // 使用双重 nextTick 确保 el-form 已经渲染
          this.$nextTick(() => {
            if (this.$refs.renameForm && typeof this.$refs.renameForm.clearValidate === 'function') {
              this.$refs.renameForm.clearValidate();
            }
            // 尝试聚焦输入框
            if (this.$refs.renameInput && typeof this.$refs.renameInput.focus === 'function') {
              this.$refs.renameInput.focus();
            }
          });
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
      // if (this.allAgents.length === 1) return; // 根据需求，如果只有一个智能体，也允许返回 Home (unselect logic)
      this.currentAgentId = null;
    },
    checkSingleAgent() {
      // 禁用自动选中逻辑，因为需求要求默认显示 Home
      /*
      if (this.allAgents.length === 1) {
        this.handleSelectAgent(this.allAgents[0]);
      }
      */
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
      this.$nextTick(() => {
        if (this.$refs.renameForm && typeof this.$refs.renameForm.clearValidate === 'function') {
          this.$refs.renameForm.clearValidate();
        }
      });
    }
  },
  mounted() {
    // this.checkSingleAgent(); // 移除默认自动选中
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
        /* 移除自动选中
        if (!this.currentAgentId) {
          this.checkSingleAgent();
        }
        */
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

.qrcode-img {
  display: block;
  width: 120px;
  height: 120px;
}

.contact-btn {
  cursor: pointer;
  display: flex;
  justify-content: center;
  
  .contact-img-full {
    height: 56px;
    width: auto;
    max-width: 100%;
  }
  
  .contact-img-mini {
    width: 32px;
    height: 32px;
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

.ai-contact-popover {
  padding: 0 !important;
  border-radius: 8px !important;;
  min-width: 0 !important;
  box-shadow: none !important;
}
</style>
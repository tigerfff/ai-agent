<template>
  <AILayout class="ai-agent-container">
    <!-- 左侧导航 -->
    <template #sider>
      <AISidebar 
        :agents="allAgents" 
        :current-agent-id="currentAgentId"
        :conversations="filteredConversations"
        :active-conversation-id="currentConversationId"
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
        @select="handleSelectAgent" 
      />

      <!-- 场景 2: 具体智能体页面 -->
      <div v-else class="agent-viewport">
        <!-- 顶部简易导航条 (可选) -->
        <div class="viewport-header">
          <span class="back-btn" @click="goHome">🏠 首页</span>
          <span class="divider">/</span>
          <span class="current-title">{{ currentAgent ? currentAgent.name : '' }}</span>
        </div>

        <div class="viewport-content">
          <!-- A. 内置智能体 -->
          <component 
            v-if="currentAgent && currentAgent.type === 'built-in'"
            :is="currentAgent.component"
            :key="`builtin-${componentKey}`"
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
</template>

<script>
import AILayout from '@/ai-ui/layout/AILayout.vue';
import AISidebar from '@/ai-ui/layout/AISidebar.vue';
import Home from './Home.vue';
import TrainingXAgent from '@/agents/built-in/TrainingX.vue';

// 内置智能体配置
const BUILT_IN_AGENTS = [
  {
    id: 'training-x',
    name: 'Training-X',
    icon: '🎓',
    description: '专业的培训助手，帮助你快速学习。',
    type: 'built-in',
    component: TrainingXAgent // 直接引用组件对象
  }
];

const MOCK_CONVERSATIONS = [
  { id: 'conv-1', agentId: 'training-x', label: '如何学习 Python 编程？', group: 'today', time: '15:30' },
  { id: 'conv-2', agentId: 'training-x', label: 'Vue 组件设计最佳实践', group: 'today', time: '14:20' },
  { id: 'conv-3', agentId: 'training-x', label: '前端性能优化方案', group: 'today', time: '10:15' },
  { id: 'conv-4', agentId: 'other-agent', label: 'React vs Vue 对比分析', group: 'yesterday', time: '昨天 18:45' }
];

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
      conversations: [...MOCK_CONVERSATIONS],
      currentConversationId: 'conv-1'
    };
  },
  computed: {
    // 合并所有智能体
    allAgents() {
      return [...BUILT_IN_AGENTS, ...this.extraAgents];
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
    }
  },
  methods: {
    handleSelectAgent(agent) {
      this.currentAgentId = agent.id;
      // 切换智能体后，尝试选中该智能体的最新会话
      const firstConv = this.conversations.find(c => c.agentId === agent.id);
      this.currentConversationId = firstConv ? firstConv.id : null;
      this.componentKey++; 
    },
    handleSelectConversation(id) {
      this.currentConversationId = id;
      this.componentKey++; // 切换会话时刷新组件状态
    },
    handleNewChat() {
      console.log('User clicked new chat');
      if (!this.currentAgentId) return;

      const newId = 'conv-' + Date.now();
      this.conversations.unshift({
        id: newId,
        agentId: this.currentAgentId,
        label: '新会话',
        group: 'today',
        time: '刚刚'
      });
      this.currentConversationId = newId;
      this.componentKey++; 
    },
    deleteConversation(id) {
      const index = this.conversations.findIndex(c => c.id === id);
      if (index > -1) {
        this.conversations.splice(index, 1);
        if (this.currentConversationId === id) {
          // 如果删除了当前会话，选中当前智能体的下一个会话
          const nextConv = this.conversations.find(c => c.agentId === this.currentAgentId);
          this.currentConversationId = nextConv ? nextConv.id : null;
          this.componentKey++;
        }
      }
    },
    handleMenuCommand(command, item) {
      if (command === 'delete') {
        this.deleteConversation(item.id);
      } else if (command === 'rename') {
        // 简单实现重命名
        const newName = prompt('重命名会话', item.label);
        if (newName) {
          item.label = newName;
        }
      }
    },
    goHome() {
      this.currentAgentId = null;
    }
  }
};
</script>

<style scoped>
.ai-agent-container {
  height: 100%;
}

.agent-viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.viewport-header {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  background: #fff;
  font-size: 14px;
}

.back-btn {
  cursor: pointer;
  color: #666;
}

.back-btn:hover {
  color: #1890ff;
}

.divider {
  margin: 0 8px;
  color: #ccc;
}

.current-title {
  font-weight: bold;
  color: #333;
}

.viewport-content {
  flex: 1;
  overflow: hidden;
  position: relative;
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
</style>


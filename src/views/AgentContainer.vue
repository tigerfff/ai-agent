<template>
  <AILayout class="ai-agent-container">
    <!-- 左侧导航 -->
    <template #sider>
      <AISidebar 
        :agents="allAgents" 
        :current-agent-id="currentAgentId"
        @select="handleSelectAgent"
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
          />

          <!-- B. 外部注入智能体 (Slot) -->
          <slot 
            v-else-if="currentAgent && currentAgent.type === 'slot'"
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
  data() {
    return {
      currentAgentId: null // null 表示首页
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
    }
  },
  methods: {
    handleSelectAgent(agent) {
      this.currentAgentId = agent.id;
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
</style>


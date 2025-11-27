<template>
  <div class="ai-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-area" v-if="!isCollapsed">
        <span class="logo-icon">🤖</span>
        <span class="app-name">AI 助手</span>
      </div>
      <div class="toggle-btn" @click="toggleCollapse">
        <!-- 简单图标：展开/收起 -->
        <span v-if="isCollapsed">➡️</span>
        <span v-else>⬅️</span>
      </div>
    </div>

    <!-- Agent List -->
    <div class="agent-list">
      <div 
        v-for="agent in agents" 
        :key="agent.id"
        class="agent-item"
        :class="{ 'active': currentAgentId === agent.id }"
        @click="$emit('select', agent)"
        :title="agent.name"
      >
        <!-- 图标兼容：支持 emoji 或 class -->
        <span class="agent-icon">{{ agent.icon || '🧩' }}</span>
        <span class="agent-name" v-if="!isCollapsed">{{ agent.name }}</span>
      </div>
    </div>

    <!-- Bottom Slot -->
    <div class="sidebar-bottom">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AISidebar',
  props: {
    agents: {
      type: Array,
      default: () => []
    },
    currentAgentId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      isCollapsed: false
    };
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      this.$emit('toggle', this.isCollapsed);
    }
  }
};
</script>

<style scoped>
.ai-sidebar {
  width: 240px;
  height: 100%;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.ai-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;
  border-bottom: 1px solid #ebeef5;
}

.sidebar-header .logo-area {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
}

.toggle-btn {
  cursor: pointer;
  color: #909399;
}

.agent-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.agent-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 4px;
  color: #606266;
  transition: background 0.2s;
}

.agent-item:hover {
  background: #ecf5ff;
}

.agent-item.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

.agent-icon {
  font-size: 18px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapsed .agent-icon {
  margin-right: 0;
}

.agent-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapsed .agent-name {
  display: none;
}

.collapsed .agent-item {
  justify-content: center;
  padding: 10px 0;
}
</style>


<template>
  <div class="ai-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-area" v-if="!isCollapsed">
        <span class="logo-icon">🤖</span>
        <span class="app-name">AI 助手</span>
      </div>
      <div class="toggle-btn" @click="toggleCollapse">
        <span v-if="isCollapsed">➡️</span>
        <span v-else>⬅️</span>
      </div>
    </div>

    <!-- Agent List (智能体选择) -->
    <div class="agent-list" v-if="!isCollapsed">
      <div 
        v-for="agent in agents" 
        :key="agent.id"
        class="agent-item"
        :class="{ 'active': currentAgentId === agent.id }"
        @click="$emit('select', agent)"
        :title="agent.name"
      >
        <span class="agent-icon">{{ agent.icon || '🧩' }}</span>
        <span class="agent-name">{{ agent.name }}</span>
      </div>
    </div>

    <!-- Conversations (会话历史列表) -->
    <div class="conversations-section" v-if="!isCollapsed">
      <div class="section-title">对话列表</div>
      
      <!-- 有数据时显示列表 -->
      <AIConversations
        v-if="displayConversations.length > 0"
        :items="displayConversations"
        :active-key="activeConversationId"
        :groupable="true"
        @update:active-key="handleConversationSelect"
        @change="handleConversationChange"
        @menu-command="handleMenuCommand"
      >
        <template #header>
          <div class="new-chat-wrapper" @click="$emit('new-chat')">
            <div class="new-chat-btn">
              <span class="icon">+</span>
              <span class="text">新建会话</span>
            </div>
          </div>
        </template>
        <template #label="{ item }">
          <div class="conversation-label">
            <span class="label-text">{{ item.label }}</span>
            <span class="label-time" v-if="item.time">{{ item.time }}</span>
          </div>
        </template>
      </AIConversations>

      <!-- 无数据时显示空状态 -->
      <div v-else class="empty-conversations">
        <div class="empty-icon">💬</div>
        <div class="empty-text">暂无对话记录</div>
        <div class="empty-hint">开始新的对话吧~</div>
      </div>
    </div>

    <!-- Bottom Slot (新建对话按钮等) -->
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
    },
    // 会话列表数据
    conversations: {
      type: Array,
      default: () => []
    },
    // 当前激活的会话 ID
    activeConversationId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      isCollapsed: false,
      // 默认测试数据
      defaultConversations: [
        {
          id: 'conv-1',
          label: '如何学习 Python 编程？',
          group: 'today',
          time: '15:30'
        },
        {
          id: 'conv-2',
          label: 'Vue 组件设计最佳实践',
          group: 'today',
          time: '14:20'
        },
        {
          id: 'conv-3',
          label: '前端性能优化方案',
          group: 'today',
          time: '10:15'
        },
        {
          id: 'conv-4',
          label: 'React vs Vue 对比分析',
          group: 'yesterday',
          time: '昨天 18:45'
        },
        {
          id: 'conv-5',
          label: 'TypeScript 类型系统详解',
          group: 'yesterday',
          time: '昨天 16:30'
        },
        {
          id: 'conv-6',
          label: '微前端架构设计',
          group: 'earlier',
          time: '2025/01/15'
        },
        {
          id: 'conv-7',
          label: 'Node.js 后端开发指南',
          group: 'earlier',
          time: '2025/01/10'
        }
      ]
    };
  },
  computed: {
    // 合并外部传入的 conversations 和默认数据
    // 如果外部传入了数据，优先使用外部的；否则使用默认数据
    displayConversations() {
      return this.conversations.length > 0 ? this.conversations : this.defaultConversations;
    }
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      this.$emit('toggle', this.isCollapsed);
    },
    handleConversationSelect(id) {
      this.$emit('update:activeConversationId', id);
    },
    handleConversationChange(item) {
      this.$emit('conversation-change', item);
    },
    handleMenuCommand(command, item) {
      this.$emit('conversation-menu-command', command, item);
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
  flex-shrink: 0;
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
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
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

.agent-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.new-chat-wrapper {
  padding: 10px 12px 0 12px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 36px;
  background: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  font-size: 14px;
}

.new-chat-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

.new-chat-btn .icon {
  margin-right: 4px;
  font-weight: bold;
  font-size: 16px;
}

/* Conversations 区域 */
.conversations-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.section-title {
  padding: 12px 16px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

/* 覆盖 AIConversations 内部样式，使其适配侧边栏 */
.conversations-section :deep(.ai-conversations) {
  height: 100%;
}

.conversations-section :deep(.conversations-list-wrapper) {
  height: 100%;
}

/* 空状态样式 */
.empty-conversations {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  margin-bottom: 4px;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

/* 会话项标签样式 */
.conversation-label {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.label-text {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.label-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.sidebar-bottom {
  padding: 10px;
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
}
</style>

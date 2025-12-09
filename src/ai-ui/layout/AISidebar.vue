<template>
  <div class="ai-sidebar" :class="{ 'collapsed': collapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-area">
        <span class="logo-icon">
          <img src="@/assets/images/IP@3x.png" alt="" width="24px">
        </span>
        <span class="app-name" v-show="!collapsed">云小智</span>
      </div>
      <div class="toggle-btn" v-show="!collapsed" @click="toggleCollapse" :title="collapsed ? '展开' : '折叠'">
        <img src="@/assets/svg/history.svg" alt="menu_leftbar" width="24px">
        <!-- <i class="h-icon-menu_leftbar" :class="{ 'rotate-180': collapsed }"></i> -->
      </div>
    </div>

    <!-- Agent List (智能体选择) -->
    <div class="agent-list">
      <div 
        v-for="agent in agents" 
        :key="agent.id"
        class="agent-item"
        :class="{ 'active': currentAgentId === agent.id }"
        @click="$emit('select', agent)"
        :title="agent.name"
      >
        <span class="agent-icon">
          <img :src="agent.icon" :alt="agent.name" />
        </span>
        <span class="agent-name">{{ collapsed ? agent.miniName : agent.name }}</span>
      </div>
    </div>

    <!-- Conversations (会话历史列表) -->
    <div class="conversations-section">
      <div class="section-header" v-if="!collapsed">
        <div class="section-title">对话列表</div>
      </div>
      
      <!-- 新建会话按钮 (始终显示，折叠时变图标) -->
      <div v-show="!collapsed" class="new-chat-wrapper" :class="{ 'collapsed': collapsed }" @click="$emit('new-chat')">
        <div class="new-chat-btn" :title="collapsed ? '新建会话' : ''">
          <span class="icon">
            <i class="h-icon-add"></i>
          </span>
          <span class="text" v-show="!collapsed">新建会话</span>
        </div>
      </div>

      <!-- 列表内容 (折叠时隐藏) -->
      <div class="conversations-content" v-show="!collapsed">
        <!-- 有数据时显示列表 -->
        <AIConversations
          v-if="displayConversations.length > 0"
          :items="displayConversations"
          :active-key="activeConversationId"
          :groupable="true"
          @update:activeKey="handleConversationSelect"
          @change="handleConversationChange"
          @menu-command="handleMenuCommand"
        >
          <template #label="{ item }">
            <div class="conversation-label">
              <span class="label-text">{{ item.label }}</span>               
              <span class="label-time" >{{ item.time }}</span>
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
    </div>

    <!-- Bottom Slot & Toggle -->
    <div class="sidebar-bottom">
      <slot name="bottom" v-if="!collapsed"></slot>
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
    collapsed: {
      type: Boolean,
      default: false
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
      // isCollapsed: false, // 移除内部状态，改用 props
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
      this.$emit('toggle', !this.collapsed);
      this.$emit('update:collapsed', !this.collapsed);
    },
    handleConversationSelect(id) {
      console.log(id,'id')
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

<style lang="scss" scoped>
.ai-sidebar {
  width: 240px;
  height: 100%;
  background: rgba(246, 249, 253, 1);
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;

  

  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    justify-content: space-between;
    flex-shrink: 0;

    .logo-area {
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      color: rgba(0, 0, 0, 0.9);
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0px;
      display: flex;
      align-items: center;

      .app-name {
        margin-left: 6px;
      }
    }
  }

  .toggle-btn {
    cursor: pointer;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border-radius: 4px;
    transition: all 0.2s;
    font-size: 24px;

    &:hover {
      background: #e6e8eb;
      color: #303133;
    }

    .toggle-text {
      margin-left: 8px;
      font-size: 14px;
    }

    &.rotate-180 {
      transform: rotate(180deg);
    }
  }

  .agent-list {
    padding: 16px 12px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
    transition: padding 0.3s;

    .agent-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      font-size: 14px;
      line-height: 22px;
      margin-bottom: 4px;
      cursor: pointer;
      border-radius: 4px;
      color: rgba(0, 0, 0, 0.9);
      transition: all 0.2s;
      justify-content: flex-start;

      &:hover {
        background: #fff;
        font-weight: bold;
      }

      &.active {
        background: #fff;
        font-weight: bold;
        color: #409eff;
      }

      .agent-icon {
        font-size: 18px;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: margin 0.3s;
        width: 18px;
        height: 18px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .agent-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: opacity 0.3s;
      }
    }
  }

  .new-chat-wrapper {
    padding: 0 12px;
    transition: padding 0.3s;
    margin-bottom: 10px;

    &.collapsed {
      padding: 10px 8px 0 8px;

      .new-chat-btn {
        .icon {
          margin-right: 0;
        }
      }
    }

    .new-chat-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 40px;
      border-radius: 4px;
      cursor: pointer;
      color: #fff;
      transition: all 0.2s;
      font-size: 14px;
      line-height: 22px;
      background: linear-gradient(90deg, rgba(53, 172, 255, 1) 0%, rgba(22, 122, 255, 1) 100%);

      &:hover {
        border-color: #409eff;
        color: #409eff;
        background: #ecf5ff;
      }

      .icon {
        font-weight: bold;
        height: 24px;
        line-height: 24px;
        font-size: 24px;
        margin-right: 4px;
      }
    }
  }

  .conversations-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;

    :deep(.ai-conversations) {
      height: 100%;
    }

    :deep(.conversations-list-wrapper) {
      height: 100%;
    }

    .conversations-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      padding: 12px 16px;
      flex-shrink: 0;

      .section-title {
        font-size: 14px;
        line-height: 22px;
        letter-spacing: 0px;
        text-align: left;
      }
    }

    .empty-conversations {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #909399;

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
    }

    .conversation-label {
      display: flex;
      flex-direction: column;
      width: 100%;

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
    }
  }

  .sidebar-bottom {
    padding: 10px;
    border-top: 1px solid #ebeef5;
    flex-shrink: 0;
  }

  &.collapsed {
    width: 60px;

    .sidebar-header{
      height: 56px;
      padding: 0;;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .agent-list {
      padding: 0px 8px 16px 8px;
    }

    .agent-item {
      flex-direction: column;
      justify-content: center;
      padding: 8px 0;
    }

    .agent-icon {
      margin-right: 0 !important;
    }

    .agent-name {
      font-size: 12px;
      transform: scale(0.85);
      text-align: center;
      width: 100%;
    }
  }
}
</style>

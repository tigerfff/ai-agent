<template>
  <div class="sidebar-wrapper">
    <!-- 遮罩层：mini 模式下展开时显示 -->
    <div 
      v-if="isMini && !collapsed" 
      class="sidebar-backdrop" 
      @click="toggleCollapse"
    ></div>
    
    <div class="ai-sidebar" :class="{ 'collapsed': collapsed, 'is-mini': isMini, 'is-mini-expanded': isMini && !collapsed }">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-area">
        <span class="logo-icon">
          <img src="@/assets/images/IP@3x.png" alt="">
        </span>
        <span class="app-name" v-show="!collapsed">云小智</span>
      </div>
      <div class="toggle-btn" v-show="!collapsed" @click="toggleCollapse" :title="collapsed ? '展开' : '折叠'">
        <img src="@/assets/svg/history.svg" alt="menu_leftbar" width="24px">
        <!-- <i class="h-icon-menu_leftbar" :class="{ 'rotate-180': collapsed }"></i> -->
      </div>
    </div>

    <!-- Agent List (智能体选择) -->
    <div class="agent-list" v-if="agents.length > 1">
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
          <div v-if="agent.hasRedDot" class="sidebar-red-dot"></div>
        </span>
        <span class="agent-name">{{ collapsed ? agent.miniName : agent.name }}</span>
      </div>
    </div>

    <p style="height: 1px; "></p>


    <!-- Conversations (会话历史列表) -->
    <template v-if="!hideConversations">
      <div class="conversations-section">
        <div class="section-header" v-if="!collapsed">
          <div class="section-title">对话列表</div>
        </div>
        
        <!-- 新建会话按钮 (始终显示，折叠时变图标) -->
        <div v-show="!collapsed" class="new-chat-wrapper" :class="{ 'collapsed': collapsed }" @click="$emit('new-chat')">
          <div class="new-chat-btn" :title="collapsed ? '新建会话' : ''">
            <span class="icon">
              <AIIcon :src="addIcon" :size="24" />
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
                <span class="label-text" :title="item.label">{{ item.label }}</span>               
                <span class="label-time" >{{ item.time }}</span>
              </div>
            </template>
          </AIConversations>

          <!-- 无数据时显示空状态 -->
          <div v-else class="empty-conversations">
            <!-- <div class="empty-icon">💬</div> -->
            <div class="empty-text">暂无对话</div>
            <!-- <div class="empty-hint">开始新的对话吧~</div> -->
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <!-- 当会话区域被隐藏时，使用占位元素撑开中间空间，确保底部 slot 固定在底部 -->
      <div class="conversations-spacer"></div>
    </template>

    <!-- Bottom Slot & Toggle -->
    <div class="sidebar-bottom">
      <slot name="bottom"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import AIIcon from '@/ai-ui/icon/AIIcon.vue';
import addIcon from '@svg/add.svg';

export default {
  name: 'AISidebar',
  components: {
    AIIcon
  },
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
    },
    // 是否为小窗模式
    isMini: {
      type: Boolean,
      default: false
    },
    // 是否隐藏会话历史区域（由外部控制）
    hideConversations: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      addIcon
    };
  },
  computed: {
    displayConversations() {
      return this.conversations;
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
.sidebar-wrapper {
  height: 100%;
  position: relative;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ai-sidebar {
  width: 320px;
  height: 100%;
  background: rgba(246, 249, 253, 1);
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: relative;
  z-index: 1;

  

  .sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 16px 0 24px;;
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

      .logo-icon {
        width: 32px; // 展开状态 40px
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: width 0.3s, height 0.3s;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .app-name {
        margin-left: 12px;
      }
    }
  }

  .toggle-btn {
    cursor: pointer;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    font-size: 24px;

    &:hover {
      background: #e6e8eb;
      color: #303133;
      padding: 4px;
    }

    img {
      transform: scaleX(-1); // 水平翻转图标
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
    padding: 0 16px 16px;
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
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        position: relative; // 确保红点定位

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sidebar-red-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 6px;
          height: 6px;
          background-color: #ff4d4f;
          border-radius: 50%;
        }
      }

      .agent-name {
        color: rgba(0,0,0,0.9);
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
      border-radius: 8px;
      cursor: pointer;
      color: #fff;
      transition: all 0.2s;
      font-size: 14px;
      line-height: 22px;
      background: linear-gradient(90deg, rgba(53, 172, 255, 1) 0%, rgba(22, 122, 255, 1) 100%);

      &:hover {
        opacity: 0.8;
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 4px;
        flex-shrink: 0;
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
        color: rgba(0,0,0,0.9);
        font-size: 14px;
        line-height: 22px;
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
        line-height: 22px;
        color: rgba(0,0,0,0.7);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .label-time {
        font-size: 12px;
        color: rgba(0,0,0,0.4);
        line-height: 20px;
        margin-top: 2px;
      }
    }
  }

  // 当会话区域被隐藏时，用于撑开中间空间，保证底部始终在底部
  .conversations-spacer {
    flex: 1;
  }

  .sidebar-bottom {
    background-color: #FFF;
    padding: 12px;
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

      .logo-area {
        .logo-icon {
          width: 32px !important; // 折叠状态 24px
          height: 32px !important;
        }
      }
    }

    .agent-list {
      padding: 0px 8px 16px 8px;
      border-bottom: none;
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

  // Mini 模式下的浮动展开
  &.is-mini {
    // 展开时浮动覆盖内容
    &.is-mini-expanded {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 999;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>

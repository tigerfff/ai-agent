<template>
  <div 
    class="ai-conversation-item"
    :class="{
      'active': active,
      'disabled': item.disabled,
      'hovered': isHovered
    }"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="item-content">
      <!-- Icon (Prefix) -->
      <div v-if="$slots.prefix || item.icon" class="item-prefix">
        <slot name="prefix" :item="item">
          <span v-if="item.icon" class="icon">{{ item.icon }}</span>
        </slot>
      </div>

      <!-- Label -->
      <div class="item-label">
        <slot name="label" :item="item">
          <div class="label-container">
            <el-tooltip
              v-if="showTooltip"
              :content="item.label"
              placement="top"
              effect="dark"
              :disabled="!isTextOverflow"
            >
              <span ref="labelRef" class="label-text">{{ item.label }}</span>
            </el-tooltip>
            <span v-else class="label-text">{{ item.label }}</span>
          </div>
        </slot>
      </div>
      <!-- {{ item }} -->
      <!-- 未读红点（右上角） -->
      <span v-if="item.isUnread" class="unread-dot"></span>

      <!-- Menu / Suffix -->
      <div class="item-menu" v-if="showMenu" @click.stop @mouseenter="menuVisible = true" @mouseleave="handleMenuMouseLeave">
        <el-dropdown trigger="hover" @command="handleCommand" @visible-change="handleDropdownVisibleChange">
          <span class="menu-trigger">
            <slot name="menu-icon">
              <i class="h-icon-more_hori" style="font-size: 24px;"></i>
            </slot>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="pin" icon="el-icon-top">{{ item.top ? '取消置顶' : '置顶' }}</el-dropdown-item>
            <el-dropdown-item command="rename" icon="el-icon-edit">重命名</el-dropdown-item>
            <el-dropdown-item command="delete" icon="el-icon-delete" style="color: #f56c6c">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConversationItem',
  props: {
    item: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isHovered: false,
      isTextOverflow: false,
      menuVisible: false // 菜单是否应该显示（点击后保持显示）
    };
  },
  computed: {
    showMenu() {
      return !this.item.disabled;
    }
  },
  mounted() {
    this.checkOverflow();
  },
  updated() {
    this.checkOverflow();
  },
  methods: {
    handleClick() {
      if (!this.item.disabled) {
        this.$emit('click', this.item);
      }
    },
    handleCommand(command) {
      this.$emit('menu-command', command, this.item);
      // 执行命令后，保持菜单按钮显示一段时间，确保对话框能正常打开
      // 特别是重命名操作，需要保持菜单按钮可见直到对话框打开
      this.menuVisible = true;
      this.$nextTick(() => {
        // 延迟关闭，给对话框时间打开
        setTimeout(() => {
          if (!this.isHovered && !this.active) {
            this.menuVisible = false;
          }
        }, 300);
      });
    },
    handleDropdownVisibleChange(visible) {
      // 当下拉菜单打开时，保持菜单按钮显示
      if (visible) {
        this.menuVisible = true;
      } else {
        // 下拉菜单关闭后，如果不是 active 或 hover 状态，延迟关闭菜单按钮
        setTimeout(() => {
          if (!this.isHovered && !this.active) {
            this.menuVisible = false;
          }
        }, 150);
      }
    },
    handleMenuMouseLeave() {
      // 鼠标离开菜单区域时，如果不是 active 状态，延迟关闭
      // 给用户时间移动到下拉菜单或对话框
      if (!this.active) {
        setTimeout(() => {
          if (!this.isHovered) {
            this.menuVisible = false;
          }
        }, 200);
      }
    },
    checkOverflow() {
      if (!this.showTooltip) return;
      const el = this.$refs.labelRef;
      if (el) {
        this.isTextOverflow = el.scrollWidth > el.clientWidth;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-conversation-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  user-select: none;
  color: rgba(0, 0, 0, 0.7);

  &:hover {
    background: rgba(56, 142, 255, 0.08);
  }

  &.active {
    background: rgba(56, 142, 255, 0.08);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: transparent;
  }

  .item-content {
    display: flex;
    align-items: center;
    width: 100%;

    .item-prefix {
      margin-right: 8px;
      display: flex;
      align-items: center;
    }

    .item-label {
      flex: 1;
      overflow: hidden;
      
      .label-container {
        display: flex;
        align-items: center;
        width: 100%;

        .label-text {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 14px;
        }
      }
    }

    .item-menu {
      margin-left: 8px;
      display: flex;
      align-items: center;
      color: #909399;

      .menu-trigger {
        padding: 2px 6px;
        border-radius: 4px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }
  
  // 未读红点（右上角）
  .unread-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background-color: #f56c6c;
    border-radius: 50%;
    flex-shrink: 0;
    z-index: 1;
  }
}
</style>


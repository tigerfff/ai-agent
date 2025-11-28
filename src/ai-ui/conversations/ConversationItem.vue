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

      <!-- Menu / Suffix -->
      <div class="item-menu" v-if="showMenu" @click.stop>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="menu-trigger">
            <slot name="menu-icon">⋮</slot>
          </span>
          <el-dropdown-menu slot="dropdown">
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
      isTextOverflow: false
    };
  },
  computed: {
    showMenu() {
      return !this.item.disabled && (this.active || this.isHovered);
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

<style scoped>
.ai-conversation-item {
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  user-select: none;
}

.ai-conversation-item:hover {
  background-color: #f5f7fa;
}

.ai-conversation-item.active {
  background-color: #e6f7ff;
  color: #409eff;
}

.ai-conversation-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: transparent;
}

.item-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.item-prefix {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.item-label {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
}

.item-menu {
  margin-left: 8px;
  display: flex;
  align-items: center;
  color: #909399;
}

.menu-trigger {
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-trigger:hover {
  background-color: rgba(0,0,0,0.05);
}
</style>


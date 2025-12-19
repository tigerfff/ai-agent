<template>
  <div class="ai-layout" :class="{ 'is-mini': isMini }">
    <!-- 左侧边栏 -->
    <div class="layout-sider">
      <slot name="sider"></slot>
    </div>

    <!-- 右侧内容区 -->
    <div class="layout-content">
      <!-- 顶部导航 (可选) -->
      <div class="content-header" v-if="$slots.header">
        <slot name="header"></slot>
      </div>

      <!-- 主体 -->
      <div class="content-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AILayout',
  props: {
    isMini: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #E2ECF9;
  min-width: 1280px;
  overflow-x: auto;

  // 小窗模式适配
  &.is-mini {
    min-width: auto;
    overflow-x: visible;
  }

  .layout-sider {
    flex-shrink: 0;
    height: 100%;
    position: relative; // 为 mini 模式下的绝对定位提供定位上下文

    // Mini 模式下，当 sidebar 浮动时，sider 容器不占用空间
    :deep(.ai-sidebar.is-mini.is-mini-expanded) {
      // sidebar 使用绝对定位，不会影响布局
    }
  }

  .layout-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;

    .content-header {
      height: 50px;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      padding: 0 20px;
    }

    .content-body {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
  }
}
</style>


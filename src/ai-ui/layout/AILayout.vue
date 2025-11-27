<template>
  <div class="ai-layout">
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
  name: 'AILayout'
};
</script>

<style scoped>
.ai-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.layout-sider {
  flex-shrink: 0;
  height: 100%;
}

.layout-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

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
</style>


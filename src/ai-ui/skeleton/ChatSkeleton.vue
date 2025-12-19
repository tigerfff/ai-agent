<template>
  <div class="chat-skeleton content-wrapper">
    <div class="skeleton-item right">
      <div class="bubble" style="width: 50%"></div>
    </div>
    <div class="skeleton-item right">
      <div class="bubble" style="width: 80%"></div>
    </div>
    <div class="skeleton-item right">
      <div class="bubble" style="width: 30%"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatSkeleton'
};
</script>

<style lang="scss" scoped>
.chat-skeleton {
  padding: 20px;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  .skeleton-item {
    display: flex;
    margin-bottom: 20px;
    align-items: flex-start;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #FFF;
      flex-shrink: 0;
    }
    
    .bubble {
      height: 40px;
      background-color: #FFF;
      border-radius: 8px;
      margin: 0 12px;
    }
    
    &.left {
      flex-direction: row;
    }
    
    &.right {
      flex-direction: row-reverse;
    }
  }
  
  // 简单的闪烁动画
  .avatar, .bubble {
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }
}

@keyframes skeleton-loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>


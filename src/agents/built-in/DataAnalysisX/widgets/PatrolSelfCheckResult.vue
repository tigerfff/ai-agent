<template>
  <div class="patrol-self-check-result">
    <div 
      class="stop-task" 
      :class="{ 'disabled': taskCancelled || taskCancelling }"
      @click="handleCancelTask"
    >
      <i class="h-icon-close_f" style="font-size: 24px;"></i>
      <span>{{ taskCancelling ? '取消中...' : '取消自检计划' }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PatrolSelfCheckResult',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      taskCancelled: false,
      taskCancelling: false
    };
  },
  methods: {
    handleCancelTask() {
      // 如果已经取消过或正在取消中，直接返回
      if (this.taskCancelled || this.taskCancelling) {
        return;
      }

      // 设置取消中状态，防止重复点击
      this.taskCancelling = true;

      try {
        // 从 data 中获取 configId
        const configId = this.data.configId;
        
        if (!configId) {
          console.warn('[PatrolSelfCheckResult] configId is missing');
          this.taskCancelling = false;
          return;
        }
        
        // 构造取消消息
        const message = `取消自检计划<ymform:patrol_plan_offline_delete>${JSON.stringify({ configId: configId })}</ymform:patrol_plan_offline_delete>`;

        // 发送取消消息
        this.$emit('send-message', message);
        
        // 标记为已取消
        this.taskCancelled = true;
      } catch (error) {
        console.error('[PatrolSelfCheckResult] Cancel self-check plan failed:', error);
      } finally {
        // 无论成功失败，都清除取消中状态
        this.taskCancelling = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.patrol-self-check-result {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stop-task {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: opacity 0.2s, color 0.2s;

  &:hover:not(.disabled) {
    color: #666;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>


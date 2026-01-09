<template>
  <div class="patrol-plan-result">
    <div 
      class="stop-task" 
      :class="{ 'disabled': taskCancelled || taskCancelling }"
      @click="handleCancelTask"
    >
      <i class="h-icon-close_f" style="font-size: 24px;"></i>
      <span>{{ taskCancelling ? '取消中...' : '取消任务' }}</span>
    </div>
  </div>
</template>

<script>
import { parseWidgetData } from './widgetParser';

export default {
  name: 'PatrolPlanResult',
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
        // 从 data 中获取 planConfigId
        const planConfigId = this.data.planConfigId;
        
        if (!planConfigId) {
          console.warn('[PatrolPlanResult] planConfigId is missing');
          this.taskCancelling = false;
          return;
        }
        
        const message = `确认取消`;

        // 发送取消消息
        this.$emit('send-message', message);
        
        // 标记为已取消
        this.taskCancelled = true;
      } catch (error) {
        console.error('[PatrolPlanResult] Cancel task failed:', error);
      } finally {
        // 无论成功失败，都清除取消中状态
        this.taskCancelling = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.patrol-plan-result {
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


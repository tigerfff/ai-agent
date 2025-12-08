<template>
  <div class="demo-form-card">
    <div class="form-header">
      <span class="icon">📝</span>
      <span class="title">Demo 表单</span>
    </div>
    <div class="form-body">
      <div v-if="data" class="form-content">
        <p><strong>ID:</strong> {{ data.id }}</p>
        <p><strong>Name:</strong> {{ data.name }}</p>
        <p><strong>Status:</strong> <span class="tag">Pending</span></p>
      </div>
      <div v-else class="empty">无数据</div>
      
      <div class="form-actions">
        <button class="btn primary">确认</button>
        <button class="btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DemoForm',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  }
};
</script>

<style lang="scss" scoped>
.demo-form-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin: 4px 0;
  max-width: 300px;

  .form-header {
    background: #f5f7fa;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #ebeef5;

    .tag {
      background: #ecf5ff;
      color: #409eff;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  .form-body {
    padding: 16px;

    .form-content {
      p {
        margin: 8px 0;
        font-size: 14px;
        color: #606266;
      }
    }

    .form-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;

      .btn {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        background: #fff;
        cursor: pointer;
        font-size: 12px;

        &.primary {
          background: #409eff;
          color: #fff;
          border-color: #409eff;
        }
      }
    }
  }
}
</style>


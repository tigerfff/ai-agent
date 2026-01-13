<template>
  <div class="patrol-plan-form-container patrol-plan-form is-confirmed is-history-disabled">
    <div class="title">巡检任务已确认</div>

    <div class="form-body">
      <!-- 巡检范围 -->
      <div class="form-item">
        <div class="label">巡检范围</div>
        <div class="content">
          <div class="text-display">{{ data.areaNamesByWeb || '权限下所有门店' }}</div>
        </div>
      </div>

      <!-- 巡检方向 -->
      <div class="form-item">
        <div class="label">巡检方向</div>
        <div class="content">
          <div class="text-display">{{ data.templatName || '智能巡检' }}</div>
        </div>
      </div>

      <!-- 巡检周期 -->
      <div class="form-item">
        <div class="label">巡检周期</div>
        <div class="content">
          <div class="text-display"> {{ issueDaysLabel }}</div>
        </div>
      </div>

      <!-- 巡检时间 -->
      <div class="form-item">
        <div class="label">巡检时间</div>
        <div class="content">
          <AITimeTagPicker
            :value="data.patrolTime ? data.patrolTime.timeList : []"
            :time-type="data.patrolTime ? data.patrolTime.timeType : 0"
            :disabled="true"
          />
        </div>
      </div>

      <!-- 任务有效期 -->
      <div class="form-item">
        <div class="label">任务有效期</div>
        <div class="content">
          <div class="text-display">{{ data.startDate }} ~ {{ data.endDate }}</div>
        </div>
      </div>

      <!-- 门店整改推送 -->
      <div class="form-item align-center">
        <div class="label">整改推送</div>
        <div class="content">
          <div class="text-display">{{ +data.problemSheetAssignment === 1 ? '已开启' : '已关闭' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AIButton from '@/ai-ui/button/AIButton.vue';
import AITimeTagPicker from '@/ai-ui/base-form/AITimeTagPicker.vue';
import sureWhiteIcon from '@/assets/svg/sure.svg';

export default {
  name: 'PatrolPlanConfirm',
  components: {
    AITimeTagPicker,
    AIButton
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      sureWhiteIcon
    };
  },
  computed: {
    issueDaysLabel() {
      const { frequency, issueDays } = this.data;
      if (frequency === 1) return '每天';
      if (!issueDays || issueDays.length === 0) return '-';

      const sortedDays = [...issueDays].sort((a, b) => a - b);
      if (frequency === 2) {
        const weekMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' };
        return '每周' + sortedDays.map(d => weekMap[d] || d).join('，');
      }
      if (frequency === 3) return '每月' + sortedDays.map(d => `${d}号`).join('，');
      return issueDays.join('，');
    }
  }
};
</script>

<style lang="scss" scoped>
.patrol-plan-form {
  background: #fff;
  width: 400px;
  overflow: hidden;
  font-family: var(--ym-ai-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
  position: relative;
  border-radius: 12px;
  pointer-events: none;

  .title {
    color: rgba(0, 0, 0, 0.9);
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 12px;
  }

  .form-body {
    .form-item {
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;

      &.align-center {
        align-items: center;
      }

      .label {
        width: 100px;
        flex-shrink: 0;
        color: rgba(0, 0, 0, 0.4);
        font-size: 14px;
        line-height: 22px;
      }

      .content {
        flex: 1;
        min-width: 0;

        .text-display {
          color: rgba(0, 0, 0, 0.7);
          font-size: 14px;
          line-height: 22px;
        }
      }
    }
  }

  .form-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

<template>
  <div class="patrol-plan-form" style=" --ym-primary: rgba(56,142,255,1)" :class="{ 'is-loading': loading, 'is-history-disabled': isHistoryDisabled }">
    <div class="title">请确认巡检任务</div>

    <div class="form-body">
      <!-- 巡检范围 -->
      <div class="form-item">
        <div class="label">巡检范围</div>
        <div class="content">
          <AreaPickerSelect 
            v-if="!isConfirmed"
            ref="areaPicker"
            :limit="1000"
            :need-clear-all-selection="false"
            @onChecked="handleAreaChecked"
          />
          <div v-else class="text-display">{{ areaNames || '权限下所有门店' }}</div>
        </div>
      </div>

      <!-- 巡检方向 -->
      <div class="form-item">
        <div class="label">巡检方向</div>
        <div class="content">
          <div class="text-display">{{ formData.templatName || '智能巡检' }}</div>
        </div>
      </div>

      <!-- 巡检时间 -->
      <div class="form-item">
        <div class="label">巡检时间</div>
        <div class="content">
          <div class="time-tags">
            <el-tag
              v-for="(time, index) in formData.patrolTimeStr.timeList"
              :key="index"
              size="small"
              class="time-tag"
              :closable="!isConfirmed && !isHistoryDisabled"
              @close="removeTime(index)"
            >
              {{ formatTimeDisplay(time) }}
            </el-tag>
            <div 
              v-if="!isConfirmed && !isHistoryDisabled" 
              class="add-time-btn"
            >
              <i class="h-icon-add"></i>
              <!-- 隐藏的时间选择器，覆盖在 + 号上，点击直接触发面板 -->
              <!-- 时间段选择器 -->
              <el-time-picker
                v-if="formData.patrolTimeStr.timeType === 0"
                ref="timePicker"
                v-model="tempTimeRange"
                is-range
                value-format="HH:mm:ss"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                :unlink="true"
                size="mini"
                @input="handleTimePickerChange"
                class="hidden-picker"
                :append-to-body="true"
              />
              <!-- 时间点选择器 -->
              <el-time-picker
                v-else
                ref="timePicker"
                v-model="tempTime"
                value-format="HH:mm:ss"
                placeholder="选择时间"
                :unlink="true"
                size="mini"
                @input="handleTimePickerChange"
                class="hidden-picker"
                :append-to-body="true"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 任务有效期 -->
      <div class="form-item">
        <div class="label">任务有效期</div>
        <div class="content">
          <div v-if="!isConfirmed" class="date-range-wrapper">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              size="mini"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy/MM/dd"
              value-format="yyyy-MM-dd"
              @change="handleDateRangeChange"
            />
          </div>
          <div v-else class="text-display">{{ formData.startDate }} ~ {{ formData.endDate }}</div>
        </div>
      </div>

      <!-- 门店整改推送 -->
      <div class="form-item align-center">
        <div class="label">门店整改推送</div>
        <div class="content">
          <el-switch
            active-color="rgba(56,142,255,1)"
            v-model="problemSheetAssignmentBool"
            :disabled="isConfirmed || isHistoryDisabled"
            @change="handleSwitchChange"
          />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="form-footer">
      <AIButton
        v-if="!isConfirmed && !isHistoryDisabled"
        :icon="starWhiteIcon"
        text="确认执行"
        :disabled="loading"
        :loading="loading"
        @click="handleConfirm"
      />

      <AIButton
        v-if="isConfirmed"
        :icon="sureWhiteIcon"
        text="已确认"
        :disabled="true"
      />

      <AIButton
        v-if="isHistoryDisabled && !isConfirmed"
        :icon="starWhiteIcon"
        text="确认执行"
        :disabled="true"
      />
    </div>
  </div>
</template>

<script>
import AreaPickerSelect from '@/ai-ui/base-form/AreaPickerSelect/index.vue';
import AIButton from '@/ai-ui/button/AIButton.vue';
import starWhiteIcon from '@/assets/svg/star-white.svg';
import sureWhiteIcon from '@/assets/svg/sure.svg';

export default {
  name: 'PatrolPlanForm',
  components: {
    AreaPickerSelect,
    AIButton
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    isHistoryDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      isConfirmed: false,
      tempTime: null,
      tempTimeRange: [], // 时间段选择器的临时值
      dateRange: [],
      selectedAreas: [],
      originalPrimaryColor: null, // 保存原始的 --ym-primary 值
      formData: {
        questions: [],
        templatName: '',
        scopeSearchKey: '',
        storeKey: '0',
        frequency: 2,
        issueDays: [],
        startDate: '',
        endDate: '',
        problemSheetAssignment: 1,
        patrolTimeStr: {
          timeType: 0,
          timeList: []
        }
      },
      starWhiteIcon,
      sureWhiteIcon
    };
  },
  computed: {
    problemSheetAssignmentBool: {
      get() {
        return this.formData.problemSheetAssignment === 1;
      },
      set(val) {
        this.formData.problemSheetAssignment = val ? 1 : 0;
      }
    },
    areaNames() {
      if (!this.selectedAreas || this.selectedAreas.length === 0) return '';
      return this.selectedAreas.map(a => a.nodeName).join('、');
    }
  },
  watch: {
    data: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.initFormData(newVal);
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    // 保存原始的 CSS 变量值
    const computedStyle = getComputedStyle(document.body);
    this.originalPrimaryColor = computedStyle.getPropertyValue('--ym-primary') || 
                                 document.body.style.getPropertyValue('--ym-primary') || 
                                 '';
    
    // 设置 CSS 变量到 body，确保挂在 body 上的元素也能使用
    document.body.style.setProperty('--ym-primary', 'rgba(56,142,255,1)');
  },
  beforeDestroy() {
    // 组件销毁时恢复原始的 CSS 变量值，避免污染父项目
    if (this.originalPrimaryColor) {
      document.body.style.setProperty('--ym-primary', this.originalPrimaryColor);
    } else {
      document.body.style.removeProperty('--ym-primary');
    }
  },
  methods: {
    initFormData(data) {
      this.formData = {
        ...this.formData,
        ...data,
        patrolTimeStr: data.patrolTimeStr || { timeType: 0, timeList: [] }
      };
      
      if (this.formData.startDate && this.formData.endDate) {
        this.dateRange = [this.formData.startDate, this.formData.endDate];
      }
    },
    handleAreaChecked(areas) {
      this.selectedAreas = areas;
      // 这里根据业务需求，可能需要调用接口获取 storeKey
      // 暂时模拟处理
      this.formData.storeKey = areas.length > 0 ? 'cached_key_' + Date.now() : '0';
    },
    handleDateRangeChange(val) {
      if (val && val.length === 2) {
        this.formData.startDate = val[0];
        this.formData.endDate = val[1];
      } else {
        this.formData.startDate = '';
        this.formData.endDate = '';
      }
    },
    handleSwitchChange(val) {
      this.formData.problemSheetAssignment = val ? 1 : 0;
    },
    formatTimeDisplay(time) {
      // 根据 timeType 判断是时间段还是时间点
      const timeType = this.formData.patrolTimeStr.timeType;
      
      if (timeType === 0) {
        // 时间段：显示开始时间-结束时间
        if (time.aiStartTime && time.aiEndTime) {
          const start = time.aiStartTime.substring(0, 5);
          const end = time.aiEndTime.substring(0, 5);
          return `${start}-${end}`;
        }
      } else {
        // 时间点：只显示开始时间（开始和结束时间相同）
        if (time.aiStartTime) {
          return time.aiStartTime.substring(0, 5);
        }
      }
      return '未知时间';
    },
    removeTime(index) {
      this.formData.patrolTimeStr.timeList.splice(index, 1);
    },
    /**
     * 处理时间选择器选择结果
     */
    handleTimePickerChange(val) {
      const timeType = this.formData.patrolTimeStr.timeType;
      
      if (timeType === 0) {
        // 时间段：val 是数组 [startTime, endTime]
        if (val && Array.isArray(val) && val.length === 2) {
          this.formData.patrolTimeStr.timeList.push({
            aiStartTime: val[0],
            aiEndTime: val[1]
          });
          // 清空临时值，以便下次选择
          this.tempTimeRange = [];
        }
      } else {
        // 时间点：val 是单个时间字符串，开始和结束时间相同
        if (val) {
          this.formData.patrolTimeStr.timeList.push({
            aiStartTime: val,
            aiEndTime: val
          });
          // 清空临时值，以便下次选择
          this.tempTime = null;
        }
      }
    },
    handleConfirm() {
      this.isConfirmed = true;
      
      // 构造确认数据，确保符合后端要求的 XML 标签内容
      const confirmData = {
        ...this.formData,
      };

      const desc = `以下是巡检任务确认结果`;
      const message = `确认执行 <ymform:patrol_confirm desc="${desc}">
${JSON.stringify(confirmData, null, 2)}
</ymform:patrol_confirm>`;

      console.log(message)

      this.$emit('send-message', message);
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


  &.is-history-disabled {
    opacity: 0.7;
    pointer-events: none;
  }

  .title {
    color: rgba(0, 0, 0, 0.9);
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 12px;
  }

  .form-body {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
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
          color: rgba($color: #000000, $alpha: 0.7);
          font-size: 14px;
          line-height: 26px;
        }

        .time-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;

          .time-tag {
            background-color: rgba(232, 246, 255, 1);
            border: none;
            color: rgba(56, 142, 255, 1);
            display: flex;
            align-items: center;
            
            ::v-deep .el-tag__close {
              color: rgba(56, 142, 255, 1) !important;
              font-size: 20px !important;
              width: 20px !important;
              height: 20px !important;
              line-height: 20px !important;
            }
            
            ::v-deep .h-icon-close {
              color: rgba(56, 142, 255, 1) !important;
            }
          }

          .add-time-btn {
            position: relative;
            width: 24px;
            height: 24px;
            border: 1px dashed #dcdfe6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #909399;
            transition: all 0.3s;

            &:hover {
              border-color: #409eff;
              color: #409eff;
            }

            i {
              font-size: 14px;
            }

            // 隐藏内置 input，但保持弹出层功能
            .hidden-picker {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              opacity: 0;
              cursor: pointer;
              z-index: 1;
              
              
              ::v-deep .el-input__inner {
                height: 100% !important;
                cursor: pointer;
                border: none !important;
              }
              
              ::v-deep .el-input__suffix, 
              ::v-deep .el-input__prefix {
                display: none;
              }
            }
          }
        }

        .date-range-wrapper {
          ::v-deep .el-range-editor.el-input__inner {
            background-color: rgba(232, 246, 255, 1);
            border: 1px solid rgba(232, 246, 255, 1);
            height: 24px;
            line-height: 24px;
            width: 180px;

            .el-range-input {
              background-color: transparent;
              color: rgba(56, 142, 255, 1);
              font-size: 12px;
            }

            .el-range-separator {
              color: rgba(56, 142, 255, 1);
              line-height: 24px;
              height: 24px;
            }
          }
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

<!-- 时间选择器弹窗样式（因为使用了 append-to-body，需要使用全局样式） -->
<style lang="scss">
  // 选中的时间项
  .el-time-spinner__item.active {
    color: #fff !important;
    background-color: rgba(56, 142, 255, 1) !important;;
  }
  // 按钮样式
  .el-button {
    &.el-button--primary {
      background-color: rgba(56, 142, 255, 1) !important;
      border-color: rgba(56, 142, 255, 1) !important;
      border-radius: 4px;

      &:hover {
        background-color: rgba(56, 142, 255, 0.8) !important;
        border-color: rgba(56, 142, 255, 0.8) !important;
      }
    }
  }

  // 确认按钮
  .el-time-panel__btn {
    &.el-button--primary {
      background-color: rgba(56, 142, 255, 1) !important;
      border-color: rgba(56, 142, 255, 1) !important;

      &:hover {
        background-color: rgba(56, 142, 255, 0.8) !important;
        border-color: rgba(56, 142, 255, 0.8) !important;
      }
    }
  }

  // 日期选择器样式
  .el-date-table {
    td.start-date,
    td.end-date {
      background-color: rgba(56, 142, 255, 1) !important;
      color: #fff !important;
      
      &:hover {
        background-color: rgba(56, 142, 255, 0.8) !important;
      }
    }
    
    td.today {
      color: #FFF !important;
      
      span {
        color: #fff !important;
      }
    }
  }

  // 日期、月份、年份表格中"今天"的标记
  .el-date-table td.today:after,
  .el-month-table td.today:after,
  .el-year-table td.today:after {
    color: rgba(56, 142, 255, 1) !important;
  }

  // 日期选择器头部标签
  .el-picker-panel__header-label {
    &.active {
      color: #FFF !important;
      background-color: rgba(56, 142, 255, 1) !important;
    }

    &:hover {
      color: #FFF !important;
      background-color: rgba(56, 142, 255, 1) !important;
    }
  }

  // 选中的日期
  .el-date-table {
    td.selected,
    td.current {
      color: #FFF !important;
      background-color: rgba(56, 142, 255, 1) !important;
      
      span {
        color: #FFF !important;
      }
    }
  }

  // 月份和年份表格中的选中和当前项
  .el-month-table,
  .el-year-table {
    td.today {
      background-color: rgba(56, 142, 255, 1) !important;
      color: #FFF !important;
      
      span {
        color: #FFF !important;
      }
    }
    
    td.current {
      color: rgba(56, 142, 255, 1) !important;
      
      span {
        color: rgba(56, 142, 255, 1) !important;
      }
    }
  }

  // 面包屑导航样式（挂在 body 上，需要全局样式）
  // 注意：这个全局样式会影响整个应用，如果父项目也有这个组件，可能会造成样式冲突
  // 建议：如果父项目也需要自定义，可以考虑在父项目中统一设置，或者使用更具体的选择器
  .hik-cloud-eBreadcrumb {
    .touchable {
      --ym-primary: rgba(56, 142, 255, 1) !important;
      color: rgba(56, 142, 255, 1) !important;
    }
  }
</style>


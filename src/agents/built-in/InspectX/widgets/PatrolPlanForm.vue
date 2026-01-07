<template>
  <div class="patrol-plan-form-container patrol-plan-form" style=" --ym-primary: rgba(56,142,255,1)" :class="{ 'is-loading': loading, 'is-history-disabled': isHistoryDisabled, 'is-confirmed': isConfirmed }">
    <div class="title">请确认巡检任务</div>

    <div class="form-body">
      <!-- 巡检范围 -->
      <div class="form-item">
        <div class="label">巡检范围</div>
        <div class="content">
          <AreaPickerSelect 
            v-if="!isConfirmed && !isHistoryDisabled"
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
          <div class="time-tags">
            <el-tag
              v-for="(time, index) in formData.patrolTime.timeList"
              :key="index"
              size="small"
              class="time-tag"
              :class="{ 'is-error': isTimeConflict(time, index) }"
              :closable="!isConfirmed && !isHistoryDisabled"
              @close="removeTime(index)"
            >
              {{ formatTimeDisplay(time) }}
            </el-tag>
            <div 
              v-if="!isConfirmed && !isHistoryDisabled" 
              class="add-time-btn"
              v-show="formData.patrolTime?.timeList?.length < 6"
            >
              <i class="h-icon-add"></i>
              <!-- 隐藏的时间选择器，覆盖在 + 号上，点击直接触发面板 -->
              <!-- 时间段选择器 -->
              <el-time-picker
                v-if="formData.patrolTime.timeType === 0"
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
                popper-class="patrol-plan-picker-popper"
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
                popper-class="patrol-plan-picker-popper"
              />
            </div>
          </div>
          <div v-if="hasTimeConflict && !isHistoryDisabled" class="error-tip">
            <i class="h-icon-info" style="font-size: 18px;"></i> 巡检时间存在重叠或一致，请重新调整
          </div>
          <div v-else-if="!isConfirmed && !isHistoryDisabled && (!formData.patrolTime.timeList || formData.patrolTime.timeList.length === 0)" class="error-tip">
            <i class="h-icon-info" style="font-size: 18px;"></i> 请添加巡检时间
          </div>
        </div>
      </div>

      <!-- 任务有效期 -->
      <div class="form-item">
        <div class="label">任务有效期</div>
        <div class="content">
          <div v-if="!isConfirmed && !isHistoryDisabled" class="date-range-wrapper single-date-mode">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              size="mini"
              placeholder="开始日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :picker-options="startDatePickerOptions"
              popper-class="patrol-plan-picker-popper"
              class="start-date-picker"
            />
            <span class="range-separator">~</span>
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              size="mini"
              placeholder="结束日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              :picker-options="endDatePickerOptions"
              popper-class="patrol-plan-picker-popper"
              class="end-date-picker"
            />
            <div v-if="!formData.startDate || !formData.endDate" class="error-tip">
              <i class="h-icon-info" style="font-size: 18px;"></i> 请选择有效期
            </div>
          </div>
          <div v-else class="text-display">{{ formData.startDate }} ~ {{ formData.endDate }}</div>
        </div>
      </div>

      <!-- 门店整改推送 -->
      <div class="form-item align-center">
        <div class="label">门店整改推送</div>
        <div class="content">
          <el-switch
            v-if="!isConfirmed && !isHistoryDisabled"
            active-color="rgba(56,142,255,1)"
            v-model="problemSheetAssignmentBool"
            @change="handleSwitchChange"
          />
          <div v-else class="text-display">{{ problemSheetAssignmentBool ? '已开启' : '已关闭' }}</div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="form-footer" v-if="!isHistoryDisabled || isConfirmed">
      <AIButton
        v-if="!isConfirmed"
        :icon="starWhiteIcon"
        text="确认执行"
        :disabled="loading || hasTimeConflict || isFormIncomplete"
        :loading="loading"
        @click="handleConfirm"
      />

      <AIButton
        v-if="isConfirmed"
        :icon="sureWhiteIcon"
        text="已确认"
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
import { InspectXApi } from '../api';
import { AreaPickerApi } from '@/ai-ui/base-form/AreaPickerSelect/proxy';

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
      selectedAreas: [],
      lastSelectedIds: '', // 用于记录上次选中的 ID 组合，防止重复调用接口
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
        patrolTime: {
          timeType: 0,
          timeList: []
        }
      },
      peakConfig: [
        { name: '早高峰', start: '07:00:00', end: '09:00:00' },
        { name: '午高峰', start: '11:30:00', end: '13:30:00' },
        { name: '晚高峰', start: '17:00:00', end: '19:00:00' }
      ],
      starWhiteIcon,
      sureWhiteIcon
    };
  },
  computed: {
    problemSheetAssignmentBool: {
      get() {
        return +this.formData.problemSheetAssignment === 1;
      },
      set(val) {
        this.formData.problemSheetAssignment = val ? 1 : 0;
      }
    },
    areaNames() {
      if (!this.selectedAreas || this.selectedAreas.length === 0) return '';
      return this.selectedAreas.map(a => a.nodeName).join('、');
    },
    hasTimeConflict() {
      const list = this.formData.patrolTime.timeList || [];
      if (list.length <= 1) return false;
      
      return list.some((time, index) => this.isTimeConflict(time, index));
    },
    isFormIncomplete() {
      const hasTime = this.formData.patrolTime?.timeList?.length > 0;
      const hasDate = this.formData.startDate && this.formData.endDate;
      return !hasTime || !hasDate;
    },
    issueDaysLabel() {
      const { frequency, issueDays } = this.formData;
      if (frequency === 1) {
        return '每天';
      }
      
      if (!issueDays || issueDays.length === 0) {
        return '-';
      }

      const sortedDays = [...issueDays].sort((a, b) => a - b);

      if (frequency === 2) {
        const weekMap = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' };
        return '每周' + sortedDays.map(d => weekMap[d] || d).join('，');
      }

      if (frequency === 3) {
        return '每月' + sortedDays.map(d => `${d}号`).join('，');
      }

      return issueDays.join('，');
    },
    startDatePickerOptions() {
      return {
        disabledDate: (time) => {
          const now = new Date();
          // 今天 0 点
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          // 一年后的今天
          const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).getTime();
          
          // 1. 基础限制：开始日期不能早于今天，且不能超过一年
          if (time.getTime() < today || time.getTime() > oneYearLater) {
            return true;
          }
          
          // 2. 周期频次限制（周频次）：开始日期只能选周一
          if (this.formData.frequency === 2) {
            const day = time.getDay();
            // 1 表示周一
            return day !== 1;
          }
          
          return false;
        }
      };
    },
    endDatePickerOptions() {
      return {
        disabledDate: (time) => {
          const now = new Date();
          // 今天 0 点
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          // 一年后的今天
          const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).getTime();
          
          let minDate = today;
          if (this.formData.startDate) {
            const start = new Date(this.formData.startDate.replace(/-/g, '/'));
            minDate = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
          }

          // 1. 基础限制：结束日期不能早于 minDate，且不能超过一年
          if (time.getTime() < minDate || time.getTime() > oneYearLater) {
            return true;
          }
          
          // 2. 周期频次限制（周频次）：结束日期必须是周日
          if (this.formData.frequency === 2) {
            const day = time.getDay();
            // 0 表示周日
            return day !== 0;
          }
          
          return false;
        }
      };
    }
  },
  watch: {
    data: {
      handler(newVal) {
        // 使用 JSON 字符串比较，防止父组件重绘导致数据被重置
        const dataStr = JSON.stringify(newVal);
        if (this._lastDataStr === dataStr) return;
        this._lastDataStr = dataStr;

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
    async initFormData(data) {
      console.log('initFormData', data);
      
      this.formData = {
        ...this.formData,
        ...data,
        patrolTime: data.patrolTime || { timeType: 0, timeList: [] }
      };
      
      // 如果有 scopeSearchKey，则使用接口进行模糊查询并反显
      if (data.scopeSearchKey) {
        try {
          const res = await AreaPickerApi.searchAreaListForBusiness(this.$aiClient, { 
            condition: data.scopeSearchKey, 
            limit: 200
          });

          if (res && res.code === 0) {
            const list = res.data || [];
            
            if (list && list.length > 0) {
              // 1. 更新选中的区域（用于页面展示名称）
              this.selectedAreas = list;
              
              // 2. 反显到选择器组件
              // 注意：调用 initParams 会触发组件内部的 popChange 事件，进而调用 handleAreaChecked
              // 所有的 savePatrolScope 逻辑将统一在 handleAreaChecked 中处理
              this.$nextTick(() => {
                if (this.$refs.areaPicker) {
                  this.$refs.areaPicker.initParams(this.selectedAreas);
                }
              });
            }
          }
        } catch (error) {
          console.error('[PatrolPlanForm] initFormData search error:', error);
        }
      }
    },
    async handleAreaChecked(areas) {
      // 1. 生成选中的 ID 组合标识并校验是否发生变化
      const currentIds = (areas || []).map(a => a.nodeId).sort().join(',');
      if (this.lastSelectedIds === currentIds) {
        return; // ID 组合未变，不重复调用接口
      }
      this.lastSelectedIds = currentIds;

      console.log('areas', areas);
      this.selectedAreas = areas;
      
      // 如果未选择任何区域，使用默认值 '0'（表示权限下所有门店）
      if (!areas || areas.length === 0) {
        this.formData.storeKey = '0';
        return;
      }

      // 如果是根目录也返回所有门店
      // 根目录判断：path 只有一级，例如 "/rootId/" (split 后过滤空值长度为 1)
      if(areas.length === 1 && areas[0].nodeType === 0) {
        const pathSegments = (areas[0].path || '').split('/').filter(Boolean);
        if (pathSegments.length === 1) {
          this.formData.storeKey = '0';
          return;
        }
      }

      try {
        // 根据 nodeType 区分区域和门店
        // nodeType === 0 表示区域（area），否则表示门店（store）
        const areaIdList = areas
          .filter(area => area.nodeType === 0)
          .map(area => area.nodeId)
          .filter(Boolean);
        
        const storeIdList = areas
          .filter(area => area.nodeType !== 0)
          .map(area => area.nodeId)
          .filter(Boolean);

        // 调用 API 获取合并后的 id
        const res = await InspectXApi.savePatrolScope(this.$aiClient, {
          areaIdList,
          storeIdList
        });

        // 从 res.data 获取合并后的 id
        if (res && res.code === 0 && res.data) {
          this.formData.storeKey = res.data;
        } 
      } catch (error) {
        // 发生错误时，使用默认值 '0'
        this.formData.storeKey = '0';
        console.error('[PatrolPlanForm] savePatrolScope error:', error);
      }
    },
    handleSwitchChange(val) {
      this.formData.problemSheetAssignment = val ? 1 : 0;
    },
    formatTimeDisplay(time) {
      // 根据 timeType 判断是时间段还是时间点
      const timeType = this.formData.patrolTime.timeType;
      
      if (timeType === 0) {
        // 时间段：显示开始时间-结束时间
        if (time.aiStartTime && time.aiEndTime) {
          const start = time.aiStartTime.substring(0, 5);
          const end = time.aiEndTime.substring(0, 5);
          return `${start}-${end}`;
        }
      } else {
        // 时间点：判断是否在高峰期内
        if (time.aiStartTime) {
          const peak = this.peakConfig.find(p => {
            return time.aiStartTime >= p.start && time.aiStartTime <= p.end;
          });
          
          if (peak) {
            return `${peak.name}${time.aiStartTime.substring(0, 5)}`;
          }
          return time.aiStartTime.substring(0, 5);
        }
      }
      return '未知时间';
    },
    isTimeConflict(time, index) {
      const list = this.formData.patrolTime.timeList || [];
      const timeType = this.formData.patrolTime.timeType;
      
      return list.some((item, i) => {
        if (i === index) return false;
        
        if (timeType === 1) {
          // 时间点冲突：时间一致
          return item.aiStartTime === time.aiStartTime;
        } else {
          // 时间段冲突：存在重叠
          // [s1, e1] 和 [s2, e2] 重叠条件：s1 < e2 && s2 < e1
          return time.aiStartTime < item.aiEndTime && item.aiStartTime < time.aiEndTime;
        }
      });
    },
    removeTime(index) {
      this.formData.patrolTime.timeList.splice(index, 1);
    },
    /**
     * 处理时间选择器选择结果
     */
    handleTimePickerChange(val) {
      const timeType = this.formData.patrolTime.timeType;
      
      if (timeType === 0) {
        // 时间段：val 是数组 [startTime, endTime]
        if (val && Array.isArray(val) && val.length === 2) {
          this.formData.patrolTime.timeList.push({
            aiStartTime: val[0],
            aiEndTime: val[1]
          });
          // 清空临时值，以便下次选择
          this.tempTimeRange = [];
        }
      } else {
        // 时间点：val 是单个时间字符串，开始和结束时间相同
        if (val) {
          this.formData.patrolTime.timeList.push({
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
      const message = `确认执行 <ymform:patrol_plan_confirm desc="${desc}">
${JSON.stringify(confirmData, null, 2)}
</ymform:patrol_plan_confirm>`;

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
    pointer-events: none;

    &:not(.is-confirmed) {
      .form-body {
        border-bottom: none !important;
      }
    }
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
          line-height: 22px;
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
            height: 22px;
            line-height: 22px;
            
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

            &.is-error {
              background-color: rgba(255, 77, 79, 0.1);
              color: #ff4d4f;
              
              ::v-deep .el-tag__close {
                color: #ff4d4f !important;
              }
              
              ::v-deep .h-icon-close {
                color: #ff4d4f !important;
              }
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

          .error-tip {
            display: flex;
            align-items: center;
            color: #ff4d4f;
            font-size: 12px;
            margin-top: 4px;
            display: flex;
            align-items: center;
            
            i {
              margin-right: 4px;
              font-size: 14px;
            }

            &.warning {
              color: #faad14;
              i {
                color: #faad14;
              }
            }
          }

        .date-range-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;

          &.single-date-mode {
            .range-separator {
              color: rgba(0, 0, 0, 0.45);
              font-size: 12px;
            }

            .start-date-picker,
            .end-date-picker {
              width: 105px !important;
              
              ::v-deep .el-input__inner {
                background-color: rgba(232, 246, 255, 1);
                border: 1px solid rgba(232, 246, 255, 1);
                height: 24px !important;
                line-height: 24px !important;
                color: rgba(56, 142, 255, 1);
                font-size: 12px;
                padding: 0 8px 0 8px;
              }

              ::v-deep .el-input__prefix {
                left: 4px;
                .el-input__icon {
                  line-height: 24px;
                  font-size: 12px;
                  color: rgba(56, 142, 255, 1);
                }
              }
            }
          }

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

    // .form-item:last-child {
    //   margin-bottom: 0;
    // }
  }

  .form-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
  }

  // 内部按钮样式，使用 ::v-deep 避免污染全局
  ::v-deep .el-button--primary {
    background-color: rgba(56, 142, 255, 1) !important;
    border-color: rgba(56, 142, 255, 1) !important;
    border-radius: 4px;

    &:hover {
      background-color: rgba(56, 142, 255, 0.8) !important;
      border-color: rgba(56, 142, 255, 0.8) !important;
    }
  }
}
</style>

<!-- 时间/日期选择器弹窗样式（因为使用了 append-to-body，需要使用全局样式，但必须通过 unique class 限制范围） -->
<style lang="scss">
  .patrol-plan-picker-popper {
    // 选中的时间项
    .el-time-spinner__item.active {
      color: #fff !important;
      background-color: rgba(56, 142, 255, 1) !important;
    }

    // 确认按钮
    .el-time-panel__btn.el-button--primary,
    .el-button.el-button--primary {
      background-color: rgba(56, 142, 255, 1) !important;
      border-color: rgba(56, 142, 255, 1) !important;

      &:hover {
        background-color: rgba(56, 142, 255, 0.8) !important;
        border-color: rgba(56, 142, 255, 0.8) !important;
      }
    }

    // 日期选择器样式
    .el-date-table {

      td.today {
        color: rgba(56, 142, 255, 0.8) !important;
        
        span {
          color: rgba(56, 142, 255, 0.8) !important;
        }
      }
      
      td.start-date,
      td.end-date {
        background-color: rgba(56, 142, 255, 1) !important;
        color: #fff !important;
        
        &:hover {
          background-color: rgba(56, 142, 255, 0.8) !important;
        }

        span {
          color: #FFF !important;
        }
      }
      
      

      td.selected,
      td.current {
        color: #FFF !important;
        background-color: rgba(56, 142, 255, 1) !important;
        
        span {
          color: #FFF !important;
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
  }

  // 特殊的全局组件样式，使用父级容器类名限制范围
  .patrol-plan-form-container {
    .hik-cloud-eBreadcrumb {
      .touchable {
        --ym-primary: rgba(56, 142, 255, 1) !important;
        color: rgba(56, 142, 255, 1) !important;
      }
    }
  }

  // 下拉选择器全局样式，应尽量通过 popper-class 限制，此处暂保持但提醒注意
</style>


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
          <div class="text-display">{{ displayData.templatName || '智能巡检' }}</div>
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
            :value="displayData.patrolTime.timeList"
            @input="formData.patrolTime.timeList = $event"
            :time-type="displayData.patrolTime.timeType"
            :disabled="isConfirmed || isHistoryDisabled"
            :peak-config="peakConfig"
            popper-class="patrol-plan-picker-popper"
          />
          <div v-if="hasTimeConflict && !isHistoryDisabled" class="error-tip">
            <i class="h-icon-info" style="font-size: 18px;"></i> 巡检时间存在重叠或一致，请重新调整
          </div>
          <div v-else-if="!isConfirmed && !isHistoryDisabled && (!displayData.patrolTime.timeList || displayData.patrolTime.timeList.length === 0)" class="error-tip">
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
              format="yyyy/MM/dd"
              value-format="yyyy-MM-dd"
              :picker-options="endDatePickerOptions"
              popper-class="patrol-plan-picker-popper"
              class="end-date-picker"
            />
          </div>
          <div v-else class="text-display">{{ displayData.startDate }} ~ {{ displayData.endDate }}</div>
          <div v-if="!displayData.startDate || !displayData.endDate" class="error-tip">
            <i class="h-icon-info" style="font-size: 18px;"></i> 请选择有效期
          </div>
        </div>
      </div>

      <!-- 门店整改推送 -->
      <div class="form-item align-center">
        <div class="label">{{ applicationSceneName }}整改推送</div>
        <div class="content">
          <el-switch
            v-if="!isConfirmed && !isHistoryDisabled"
            active-color="rgba(56,142,255,1)"
            v-model="problemSheetAssignmentBool"
            @change="handleSwitchChange"
          />
          <div v-else class="text-display">{{ +displayData.problemSheetAssignment === 1 ? '已开启' : '已关闭' }}</div>
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
import AITimeTagPicker from '@/ai-ui/base-form/AITimeTagPicker.vue';
import starWhiteIcon from '@/assets/svg/star-white.svg';
import sureWhiteIcon from '@/assets/svg/sure.svg';
import { InspectXApi } from '../api';
import { AreaPickerApi } from '@/ai-ui/base-form/AreaPickerSelect/proxy';

export default {
  name: 'PatrolPlanForm',
  components: {
    AITimeTagPicker,
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
      selectedAreas: [],
      lastSelectedIds: '', // 用于记录上次选中的 ID组合，防止重复调用接口
      originalPrimaryColor: null, // 保存原始的 --ym-primary 值
      initialFormData: null, // 初始数据备份
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
    /**
     * 当前应该展示的数据源
     */
    displayData() {
      // 如果已经确认，或者表单还是活跃状态，显示当前修改中的数据
      if (this.isConfirmed || !this.isHistoryDisabled) {
        return this.formData;
      }
      // 如果是历史记录且未点击确认按钮，显示初始化的备份数据（即 AI 原始生成的数据）
      return this.initialFormData || this.formData;
    },
    problemSheetAssignmentBool: {
      get() {
        return +this.formData.problemSheetAssignment === 1;
      },
      set(val) {
        this.formData.problemSheetAssignment = val ? 1 : 0;
      }
    },
    areaNames() {
      if (this.displayData?.areaNamesByWeb) return this.displayData?.areaNamesByWeb;
      
      // 如果展示的是当前正在编辑的数据，根据选中项计算名称
      if (this.displayData === this.formData) {
        if (!this.selectedAreas || this.selectedAreas.length === 0) return '';
        return this.selectedAreas.map(a => a.nodeName).join('、');
      }
      return '';
    },
    hasTimeConflict() {
      const source = this.displayData;
      const list = source.patrolTime?.timeList || [];
      const timeType = source.patrolTime?.timeType;
      if (list.length <= 1) return false;
      
      return list.some((time, index) => {
        return list.some((item, i) => {
          if (i === index) return false;
          if (timeType === 1) {
            return item.aiStartTime === time.aiStartTime;
          } else {
            return time.aiStartTime < item.aiEndTime && item.aiStartTime < time.aiEndTime;
          }
        });
      });
    },
    isFormIncomplete() {
      const hasTime = this.formData.patrolTime?.timeList?.length > 0;
      const hasDate = this.formData.startDate && this.formData.endDate;
      return !hasTime || !hasDate;
    },
    issueDaysLabel() {
      const { frequency, issueDays } = this.displayData;
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
      
      const initialized = {
        ...this.formData,
        ...data,
        patrolTime: data.patrolTime || { timeType: 0, timeList: [] }
      };

      // 同时记录当前值和备份值 (使用深拷贝)
      this.formData = JSON.parse(JSON.stringify(initialized));
      this.initialFormData = JSON.parse(JSON.stringify(initialized));
      
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
        areaNamesByWeb: this.areaNames
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

               ::v-deep .el-input__suffix {
                .el-input__icon,
                .el-date-editor__icon {
                  color: rgba(56, 142, 255, 1) !important;
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

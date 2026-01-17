<template>
  <div class="ai-time-tag-picker">
    <div class="time-tags">
      <div
        v-for="(time, index) in value"
        :key="index"
        class="time-tag-wrapper"
      >
        <el-tag
          size="small"
          class="time-tag"
          :class="{ 'is-error': isTimeConflict(time, index) }"
          :closable="!disabled"
          @close="removeTime(index)"
          v-show="formatTimeDisplay(time)"
        >
          {{ formatTimeDisplay(time) }}
        </el-tag>
        
        <!-- 覆盖在 Tag 上的编辑选择器 -->
        <el-time-picker
          v-if="!disabled"
          :value="getTimePickerValue(time)"
          :is-range="timeType === 0"
          value-format="HH:mm:ss"
          range-separator="至"
          start-placeholder="开始"
          end-placeholder="结束"
          :unlink="true"
          size="mini"
          @input="handleEditTime(index, $event)"
          class="hidden-picker"
          :append-to-body="true"
          :popper-class="popperClass"
        />
      </div>

      <div 
        v-if="!disabled" 
        class="add-time-btn"
        v-show="value.length < maxCount"
      >
        <i class="h-icon-add"></i>
        <!-- 隐藏的时间选择器，覆盖在 + 号上，点击直接触发面板 -->
        <!-- 时间段选择器 -->
        <el-time-picker
          v-if="timeType === 0"
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
          :popper-class="popperClass"
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
          :popper-class="popperClass"
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * AITimeTagPicker 组件
 * 
 * 用于展示和编辑一组时间点或时间段标签
 */
export default {
  name: 'AITimeTagPicker',
  props: {
    // 时间列表 [{ aiStartTime, aiEndTime }]
    value: {
      type: Array,
      default: () => []
    },
    // 时间类型：0-时间段，1-时间点
    timeType: {
      type: Number,
      default: 0
    },
    // 是否禁用编辑
    disabled: {
      type: Boolean,
      default: false
    },
    // 最大数量限制
    maxCount: {
      type: Number,
      default: 5
    },
    // 高峰期配置，用于格式化显示
    peakConfig: {
      type: Array,
      default: () => [
        { name: '早高峰', start: '07:00:00', end: '09:00:00' },
        { name: '午高峰', start: '11:30:00', end: '13:30:00' },
        { name: '晚高峰', start: '17:00:00', end: '19:00:00' }
      ]
    },
    // 弹窗类名
    popperClass: {
      type: String,
      default: 'ai-time-tag-picker-popper'
    }
  },
  data() {
    return {
      tempTime: null,
      tempTimeRange: []
    };
  },
  methods: {
    formatTimeDisplay(time) {
      if (this.timeType === 0) {
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
      return null;
    },
    isTimeConflict(time, index) {
      const list = this.value || [];
      return list.some((item, i) => {
        if (i === index) return false;
        
        if (this.timeType === 1) {
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
      const newList = [...this.value];
      newList.splice(index, 1);
      this.$emit('input', newList);
      this.$emit('change', newList);
    },
    getTimePickerValue(time) {
      if (this.timeType === 0) {
        return [time.aiStartTime, time.aiEndTime];
      }
      return time.aiStartTime;
    },
    handleEditTime(index, val) {
      if (!val) return;
      const newList = [...this.value];
      
      if (this.timeType === 0) {
        if (Array.isArray(val) && val.length === 2) {
          newList[index] = {
            aiStartTime: val[0],
            aiEndTime: val[1]
          };
        }
      } else {
        newList[index] = {
          aiStartTime: val,
          aiEndTime: val
        };
      }
      this.$emit('input', newList);
      this.$emit('change', newList);
    },
    handleTimePickerChange(val) {
      const newList = [...this.value];
      if (this.timeType === 0) {
        if (val && Array.isArray(val) && val.length === 2) {
          newList.push({
            aiStartTime: val[0],
            aiEndTime: val[1]
          });
          this.tempTimeRange = [];
        }
      } else {
        if (val) {
          newList.push({
            aiStartTime: val,
            aiEndTime: val
          });
          this.tempTime = null;
        }
      }
      this.$emit('input', newList);
      this.$emit('change', newList);
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-time-tag-picker {
  .time-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .time-tag-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      height: 22px;
    }

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
        z-index: 2;
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
    }
  }
}
</style>


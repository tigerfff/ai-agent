<template>
  <transition name="el-zoom-in-bottom" @after-leave="$emit('dodestroy')">
    <div
      v-show="visible"
      :class="popperClass"
      class="el-time-range-picker el-picker-panel el-popper"
    >
      <div class="el-time-range-picker__content">
        <div class="el-time-range-picker__cell">
          <div
            class="el-time-range-picker__header"
            v-text="t('el.datepicker.startTime')"
          />
          <div
            :class="{ 'has-seconds': showSeconds, 'is-arrow': arrowControl }"
            class="el-time-range-picker__body el-time-panel__content"
          >
            <time-spinner
              ref="minSpinner"
              :is-empty="isTimeEmpty"
              :show-seconds="showSeconds"
              :am-pm-mode="amPmMode"
              :arrow-control="arrowControl"
              :date="minDate"
              @change="handleMinChange"
              @select-range="setMinSelectionRange"
            />
          </div>
        </div>
        <div class="el-time-range-picker__cell">
          <div
            class="el-time-range-picker__header"
            v-text="t('el.datepicker.endTime')"
          />
          <div
            :class="{ 'has-seconds': showSeconds, 'is-arrow': arrowControl }"
            class="el-time-range-picker__body el-time-panel__content"
          >
            <time-spinner
              ref="maxSpinner"
              :is-empty="isTimeEmpty"
              :unlink-range="unlinkRange"
              :show-seconds="showSeconds"
              :am-pm-mode="amPmMode"
              :arrow-control="arrowControl"
              :date="maxDate"
              @change="handleMaxChange"
              @select-range="setMaxSelectionRange"
            />
          </div>
        </div>
      </div>
      <div class="el-picker-panel__footer">
        <span
          v-if="!showPrompt || showAbnormalInfo"
          :title="compareTimesFunc ? customErrorInfo : prompt"
          class="el-picker-panel__footer-message is-warning"
          v-text="compareTimesFunc ? customErrorInfo : prompt"
        />
        <span
          v-else-if="minVisibleTime !== '' && maxVisibleTime !== ''"
          class="el-picker-panel__footer-message"
        >
          <span v-text="minVisibleTime" />
          <span v-text="rangeSeparator" />
          <span v-text="maxVisibleTime" />
        </span>
        <span v-else class="el-picker-panel__footer-message" />
        <el-button
          :disabled="showAbnormalInfo || isTimeEmpty"
          type="primary"
          class="el-time-panel__btn confirm"
          @click="handleConfirm()"
          v-text="t('el.datepicker.confirm')"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import {
  limitTimeRange,
  modifyDate,
  clearMilliseconds,
  timeWithinRange,
  now,
  formatDate,
  MIN_TIME,
  MAX_TIME,
  isDate,
  isEmptyDate
} from '../util';
import Locale from 'hui/src/mixins/locale';
import Range from '../mixins/range';
import TimeSpinner from '../basic/time-spinner';
import ElButton from 'hui/packages/button';

const minTimeOfDay = function(date) {
  return modifyDate(
    MIN_TIME,
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

const maxTimeOfDay = function(date) {
  return modifyDate(
    MAX_TIME,
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

// increase time by amount of milliseconds, but within the range of day
const advanceTime = function(date, amount) {
  return new Date(
    Math.min(date.getTime() + amount, maxTimeOfDay(date).getTime())
  );
};

export default {
  components: { TimeSpinner, ElButton },
  mixins: [Locale, Range],
  data() {
    return {
      popperClass: '',
      minDate: now(),
      maxDate: now(),
      value: [],
      defaultValue: null,
      format: 'HH:mm:ss',
      rangeSeparator: '-',
      visible: false,
      selectionRange: [0, 2],
      arrowControl: false,
      isRange: false,
      unlink: true,
      unlinkRange: true,
      selectableRange: [],
      compareTimesFunc: null
    };
  },

  computed: {
    showSeconds() {
      return (this.format || '').indexOf('ss') !== -1;
    },

    offset() {
      return this.showSeconds ? 11 : 8;
    },

    spinner() {
      return this.selectionRange[0] < this.offset
        ? this.$refs.minSpinner
        : this.$refs.maxSpinner;
    },

    showAbnormalInfo() {
      if (this.compareTimesFunc) {
        if (this.value.length === 0) {
          return false;
        } else if (this.compareTimesFunc(this.minDate, this.maxDate) !== true) {
          // 自定义方法中return值是true, 不展示warning span标签
          return true;
        } else {
          // 自定义方法中return值是错误描述, 展示warning span标签
          return false;
        }
      }
      if (this.isTimeEmpty) {
        return false;
      }
      return this.minDate.getTime() > this.maxDate.getTime();
    },
    customErrorInfo() {
      return this.compareTimesFunc(this.minDate, this.maxDate);
    },

    amPmMode() {
      if ((this.format || '').indexOf('A') !== -1) return 'A';
      if ((this.format || '').indexOf('a') !== -1) return 'a';
      return '';
    },

    minVisibleTime() {
      if (!this.isTimeEmpty) {
        return formatDate(this.minDate, this.format);
      }
      return '';
    },

    maxVisibleTime() {
      if (!this.isTimeEmpty) {
        return formatDate(this.maxDate, this.format);
      }
      return '';
    },

    isTimeEmpty() {
      if (!this.isUnlinkRange) {
        return false;
      }
      return isEmptyDate(this.value) && isEmptyDate(this.defaultTime);
    }
  },
  watch: {
    value(value) {
      if (Array.isArray(value)) {
        let defaultDate = now();
        if (!this.unlinkRange) {
          defaultDate = advanceTime(now(), 60 * 60 * 1000);
        }
        this.minDate = isDate(value[0]) ? new Date(value[0]) : defaultDate;
        this.maxDate = isDate(value[1]) ? new Date(value[1]) : defaultDate;
      } else {
        if (Array.isArray(this.defaultValue)) {
          this.minDate = new Date(this.defaultValue[0]);
          this.maxDate = new Date(this.defaultValue[1]);
        } else if (this.defaultValue) {
          this.minDate = new Date(this.defaultValue);
          this.maxDate = advanceTime(
            new Date(this.defaultValue),
            60 * 60 * 1000
          );
        } else {
          this.minDate = now();
          if (!this.unlinkRange) {
            this.maxDate = advanceTime(now(), 60 * 60 * 1000);
          } else {
            this.maxDate = now();
          }
        }
      }
      if (this.isValidValue(value) && !this.unlinkRange) {
        if (this.$refs.minSpinner) {
          this.$refs.minSpinner.selectableRange = [
            [minTimeOfDay(value[0]), value[1]]
          ];
        }
        if (this.$refs.maxSpinner) {
          this.$refs.maxSpinner.selectableRange = [
            [value[0], maxTimeOfDay(value[1])]
          ];
        }
      }
    },

    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.$refs.minSpinner.emitSelectRange('hours');
          this.adjustSpinners();
        });
      }
    },

    selectableRange(val) {
      this.$refs.minSpinner.selectableRange = val;
      this.$refs.maxSpinner.selectableRange = val;
    }
  },
  methods: {
    handleClear() {
      this.$emit('pick', null);
    },

    handleCancel() {
      this.$emit('pick', this.oldValue);
    },

    handleMinChange(date) {
      this.minDate = clearMilliseconds(date);
      this.handleChange();
    },

    handleMaxChange(date) {
      this.maxDate = clearMilliseconds(date);
      this.handleChange();
    },

    handleChange() {
      if (this.isValidValue([this.minDate, this.maxDate])) {
        this.$emit(
          'pick',
          [this.minDate, this.maxDate],
          this.arrowControl || this.isRange ? true : !this.isUnlinkRange
        );
      }
    },

    setMinSelectionRange(start, end) {
      this.$emit('select-range', start, end, 'min');
      this.selectionRange = [start, end];
    },

    setMaxSelectionRange(start, end) {
      this.$emit('select-range', start, end, 'max');
      this.selectionRange = [start + this.offset, end + this.offset];
    },

    handleConfirm(visible = false) {
      const minSelectableRange = this.$refs.minSpinner.selectableRange;
      const maxSelectableRange = this.$refs.maxSpinner.selectableRange;

      this.minDate = limitTimeRange(
        this.minDate,
        minSelectableRange,
        this.format
      );
      this.maxDate = limitTimeRange(
        this.maxDate,
        maxSelectableRange,
        this.format
      );

      this.$emit('pick', [this.minDate, this.maxDate], visible);
    },

    adjustSpinners() {
      this.$refs.minSpinner.adjustSpinners();
      this.$refs.maxSpinner.adjustSpinners();
    },

    adjustCurrentSpinner(type, pos) {
      this.$nextTick(() => {
        if (pos === 'min') {
          this.$refs.minSpinner.adjustCurrentSpinner(type);
        } else {
          this.$refs.maxSpinner.adjustCurrentSpinner(type);
        }
      });
    },

    changeSelectionRange(step) {
      const list = this.showSeconds ? [0, 3, 6, 11, 14, 17] : [0, 3, 8, 11];
      const mapping = ['hours', 'minutes'].concat(
        this.showSeconds ? ['seconds'] : []
      );
      const index = list.indexOf(this.selectionRange[0]);
      const next = (index + step + list.length) % list.length;
      const half = list.length / 2;
      if (next < half) {
        this.$refs.minSpinner.emitSelectRange(mapping[next]);
      } else {
        this.$refs.maxSpinner.emitSelectRange(mapping[next - half]);
      }
    },

    isValidValue(value) {
      return (
        Array.isArray(value) &&
        timeWithinRange(this.minDate, this.$refs.minSpinner.selectableRange) &&
        timeWithinRange(this.maxDate, this.$refs.maxSpinner.selectableRange)
      );
    },

    handleKeydown(event) {
      const keyCode = event.keyCode;
      const mapping = { 38: -1, 40: 1, 37: -1, 39: 1 };

      // Left or Right
      if (keyCode === 37 || keyCode === 39) {
        const step = mapping[keyCode];
        this.changeSelectionRange(step);
        event.preventDefault();
        return;
      }

      // Up or Down
      if (keyCode === 38 || keyCode === 40) {
        const step = mapping[keyCode];
        this.spinner.scrollDown(step);
        event.preventDefault();
      }
    }
  }
};
</script>

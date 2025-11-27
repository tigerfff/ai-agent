<template>
  <transition
    :name="type === 'datetime' ? 'el-zoom-in-bottom' : 'el-zoom-in-top'"
    @after-leave="$emit('dodestroy')"
  >
    <div
      v-show="visible"
      :class="`el-time-panel__${type}${popperClass ? ' ' + popperClass : ''}`"
      class="el-time-panel el-popper"
    >
      <div
        :class="{ 'has-seconds': showSeconds }"
        class="el-time-panel__content"
      >
        <time-spinner
          ref="spinner"
          :unlink-range="unlinkRange"
          :arrow-control="useArrow"
          :show-seconds="showSeconds"
          :am-pm-mode="amPmMode"
          :date="date"
          :is-empty="isEmpty"
          :visible="visible"
          @change="handleChange"
          @select-range="setSelectionRange"
        />
      </div>
      <div v-if="unlink" class="el-time-panel__footer">
        <!-- <el-button
          class="el-time-panel__btn cancel"
          @click="handleCancel"
          v-text="t('el.datepicker.cancel')"
        ></el-button> -->
        <el-button
          :disabled="isEmpty"
          :class="{ confirm: !disabled }"
          type="primary"
          class="el-time-panel__btn"
          @click="handleConfirm"
          v-text="t('el.datepicker.confirm')"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import {
  limitTimeRange,
  clearMilliseconds,
  timeWithinRange,
  now,
  isEmpty,
  toDate,
  isDate
} from '../util';
import Locale from 'hui/src/mixins/locale';
import TimeSpinner from '../basic/time-spinner';
import ElButton from 'hui/packages/button';

export default {
  components: {
    TimeSpinner,
    ElButton
  },
  mixins: [Locale],

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    timeArrowControl: {
      type: Boolean,
      default: false
    },
    unlinkRange: {
      type: Boolean,
      default: true
    },
    unlink: {
      type: Boolean,
      default: true
    },
    timeType: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      popperClass: '',
      format: 'HH:mm:ss',
      value: now(),
      defaultValue: null,
      date: now(),
      selectableRange: [],
      selectionRange: [0, 2],
      disabled: false,
      arrowControl: false,
      needInitAdjust: true,
      type: 'datetime'
    };
  },

  computed: {
    showSeconds() {
      return (this.format || '').indexOf('ss') !== -1;
    },
    useArrow() {
      return this.arrowControl || this.timeArrowControl || false;
    },
    amPmMode() {
      if ((this.format || '').indexOf('A') !== -1) return 'A';
      if ((this.format || '').indexOf('a') !== -1) return 'a';
      return '';
    },
    isEmpty() {
      return !this.defaultValue && isEmpty(this.value);
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => {
          this.adjustSpinners();
          this.$refs.spinner.emitSelectRange('hours');
        });
      } else {
        this.needInitAdjust = true;
        if (isEmpty(this.value)) {
          this.$emit(
            'pick',
            this.isEmpty ? null : this.date,
            false,
            !this.unlink
          );
        }
      }
    },

    value(newVal, oldVal) {
      this.date = this.getTime();
      if (this.visible && this.needInitAdjust) {
        this.needInitAdjust = false;
      }
      this.$nextTick(() => {
        this.adjustChangeSpinners(newVal, oldVal);
      });
    },

    selectableRange(val) {
      this.$refs.spinner.selectableRange = val;
    },

    defaultValue(val) {
      if (isEmpty(this.value)) {
        this.date = toDate(val);
      }
    }
  },

  mounted() {
    this.$emit('mounted');
  },

  methods: {
    adjustChangeSpinners(newVal, oldVal) {
      if (this.adjustCurrentSpinner && isDate(newVal) && isDate(oldVal)) {
        this.changeInput = true;
        if (newVal.getHours() !== oldVal.getHours()) {
          this.adjustCurrentSpinner('hours');
        } else if (newVal.getMinutes() !== oldVal.getMinutes()) {
          this.adjustCurrentSpinner('minutes');
        } else if (newVal.getSeconds() !== oldVal.getSeconds()) {
          this.adjustCurrentSpinner('seconds');
        }
      }
    },

    handleClear() {
      this.date = toDate(this.defaultValue);
      this.$emit('input', null);
      this.$emit('pick', null);
    },

    getDefaultValue() {
      return toDate(this.defaultValue);
    },

    getTime() {
      const value = isDate(this.value) ? this.value : this.getDefaultValue();
      return limitTimeRange(value, this.selectableRange, this.format);
    },

    handleChange(date) {
      // this.visible avoids edge cases, when use scrolls during panel closing animation
      if (this.visible) {
        this.date = clearMilliseconds(date);
        this.$emit('pick', this.date, true, !this.unlink);
      }
    },

    setSelectionRange(start, end) {
      this.$emit('select-range', start, end, this.timeType);
      this.selectionRange = [start, end];
    },

    handleConfirm() {
      const date = clearMilliseconds(
        limitTimeRange(this.date, this.selectableRange, this.format)
      );
      this.$emit('pick', date, false);
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
        this.$refs.spinner.scrollDown(step);
        event.preventDefault();
      }
    },

    isValidValue(date) {
      return timeWithinRange(date, this.selectableRange, this.format);
    },

    adjustSpinners() {
      return this.$refs.spinner.adjustSpinners();
    },

    adjustCurrentSpinner(type) {
      this.$nextTick(() => {
        this.$refs.spinner.adjustCurrentSpinner(type);
      });
    },

    changeSelectionRange(step) {
      const list = [0, 3].concat(this.showSeconds ? [6] : []);
      const mapping = ['hours', 'minutes'].concat(
        this.showSeconds ? ['seconds'] : []
      );
      const index = list.indexOf(this.selectionRange[0]);
      const next = (index + step + list.length) % list.length;
      this.$refs.spinner.emitSelectRange(mapping[next]);
    }
  }
};
</script>

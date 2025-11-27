<template>
  <transition name="el-zoom-in-top" @after-leave="$emit('dodestroy')">
    <div
      v-show="visible"
      :class="[
        {
          'has-sidebar': $slots.sidebar || shortcuts
        },
        popperClass
      ]"
      class="el-picker-panel el-date-range-picker el-popper"
    >
      <div class="el-picker-panel__body-wrapper">
        <slot name="sidebar" class="el-picker-panel__sidebar"></slot>
        <div v-if="shortcuts" class="el-picker-panel__sidebar">
          <button
            v-for="(shortcut, key) in shortcuts"
            :key="key"
            type="button"
            class="el-picker-panel__shortcut"
            @click="handleShortcutClick(shortcut)"
          >
            {{ shortcut.text }}
          </button>
        </div>
        <div class="el-picker-panel__body is-month-range">
          <div
            class="el-picker-panel__content el-date-range-picker__content is-left"
          >
            <p
              class="el-date-range-picker__title"
              v-text="t('el.datepicker.startTime')"
            />
            <div class="el-date-range-picker__header">
              <button
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_left_sm"
                @click="leftPrevYear"
              />
              <span
                :class="[`is-${leftCurrentView}`]"
                class="el-picker-panel__header-label-wrapper"
              >
                <span
                  class="el-picker-panel__header-label"
                  @click="showYearPicker('left')"
                  v-text="leftLabel"
                />
              </span>
              <button
                v-if="unlinkPanels"
                :disabled="!enableYearArrow"
                :class="{ 'is-disabled': !enableYearArrow }"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_right_sm"
                @click="leftNextYear"
              />
            </div>
            <month-table
              v-if="leftCurrentView === 'month'"
              :date="leftDate"
              :default-value="defaultValue"
              :min-date="minDate"
              :max-date="maxDate"
              :value="minDate"
              :range-state="rangeState"
              :disabled-date="disabledDate"
              :unlink-range="isUnlinkRange"
              selection-mode="range"
              table-type="min"
              @changerange="handleChangeRange"
              @pick="handleRangePick"
            >
              <template
                :slot="!!($slots.month || $scopedSlots.month) ? 'month' : null"
                slot-scope="data"
              >
                <slot name="month" v-bind="data" />
              </template>
              <template
                :slot="
                  !!($slots.startMonth || $scopedSlots.startMonth)
                    ? 'startMonth'
                    : null
                "
                slot-scope="data"
              >
                <slot name="startMonth" v-bind="data" />
              </template>
            </month-table>
            <div class="el-picker-panel__content has-modal">
              <year-table
                v-if="leftCurrentView === 'year'"
                ref="leftYearTable"
                :date="leftDate"
                :value="minDate"
                :default-value="defaultValue ? new Date(defaultValue) : null"
                :disabled-date="disabledDate"
                :calendar-type="calendarType"
                @pick="handleLeftYearPick"
              />
            </div>
          </div>
          <div
            class="el-picker-panel__content el-date-range-picker__content is-right"
          >
            <p
              class="el-date-range-picker__title"
              v-text="t('el.datepicker.endTime')"
            />
            <div class="el-date-range-picker__header">
              <button
                v-if="unlinkPanels"
                :disabled="!enableYearArrow"
                :class="{ 'is-disabled': !enableYearArrow }"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_left_sm"
                @click="rightPrevYear"
              />
              <span
                :class="[`is-${rightCurrentView}`]"
                class="el-picker-panel__header-label-wrapper"
              >
                <span
                  class="el-picker-panel__header-label"
                  @click="showYearPicker('right')"
                  v-text="rightLabel"
                />
              </span>
              <button
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_right_sm"
                @click="rightNextYear"
              />
            </div>
            <month-table
              v-if="rightCurrentView === 'month'"
              :date="rightDate"
              :default-value="defaultValue"
              :min-date="minDate"
              :max-date="maxDate"
              :value="maxDate"
              :range-state="rangeState"
              :disabled-date="disabledDate"
              :unlink-range="isUnlinkRange"
              selection-mode="range"
              table-type="max"
              @changerange="handleChangeRange"
              @pick="handleRangePick"
            >
              <template
                :slot="!!($slots.month || $scopedSlots.month) ? 'month' : null"
                slot-scope="data"
              >
                <slot name="month" v-bind="data" />
              </template>
              <template
                :slot="
                  !!($slots.endMonth || $scopedSlots.endMonth)
                    ? 'endMonth'
                    : null
                "
                slot-scope="data"
              >
                <slot name="endMonth" v-bind="data" />
              </template>
            </month-table>
            <div class="el-picker-panel__content has-modal">
              <year-table
                v-if="rightCurrentView === 'year'"
                ref="rightYearTable"
                :date="rightDate"
                :value="maxDate"
                :default-value="defaultValue ? new Date(defaultValue) : null"
                :disabled-date="disabledDate"
                :calendar-type="calendarType"
                @pick="handleRightYearPick"
              />
            </div>
          </div>
        </div>
        <div v-if="unlink" class="el-picker-panel__footer">
          <span
            v-if="!showPrompt || showAbnormalInfo"
            :title="prompt"
            class="el-picker-panel__footer-message is-warning"
            v-text="prompt"
          />
          <span
            v-else-if="minVisibleMonth !== '' && maxVisibleMonth !== ''"
            class="el-picker-panel__footer-message"
          >
            <span v-text="minVisibleMonth" />
            <span v-text="rangeSeparator" />
            <span v-text="maxVisibleMonth" />
          </span>
          <span v-else class="el-picker-panel__footer-message" />
          <el-button
            :disabled="disabledConfirm"
            type="primary"
            class="el-picker-panel__link-btn"
            @click="handleConfirm(false)"
            v-text="t('el.datepicker.confirm')"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import {
  isDate,
  modifyWithTimeString,
  prevYear,
  nextYear,
  nextMonth,
  clearDate,
  formatDate,
  setYear,
  now,
  isEmptyDate,
  toDate,
  getOffset
} from '../util';
import Clickoutside from 'hui/src/utils/clickoutside';
import Locale from 'hui/src/mixins/locale';
import MonthTable from '../basic/month-table';
import YearTable from '../basic/year-table';
import Range from '../mixins/range';

const calcDefaultValue = defaultValue => {
  if (Array.isArray(defaultValue)) {
    return [new Date(defaultValue[0]), new Date(defaultValue[1])];
  } else if (defaultValue) {
    return [new Date(defaultValue), nextMonth(new Date(defaultValue))];
  } else {
    return [now('clearDate'), nextMonth(now('clearDate'))];
  }
};
export default {
  directives: { Clickoutside },
  components: {
    MonthTable,
    YearTable
  },
  mixins: [Locale, Range],
  data() {
    return {
      popperClass: '',
      value: [],
      defaultValue: null,
      defaultTime: null,
      minDate: now('clearDate'),
      maxDate: now('clearDate'),
      leftDate: now('clearDate'),
      rightDate: now('clearDate'),
      rangeState: {
        endDate: null,
        selecting: false,
        row: null,
        column: null
      },
      shortcuts: '',
      visible: '',
      disabledDate: () => {
        return false;
      },
      format: 'yyyy/MM',
      arrowControl: false,
      unlinkPanels: false,
      unlink: true,
      unlinkRange: true,
      rangeSeparator: '-',
      leftCurrentView: 'month',
      rightCurrentView: 'month',
      calendarType: ''
    };
  },
  computed: {
    now: () => now('clearDate'),
    calcMinDate() {
      const minDate = this.minDate || calcDefaultValue(this.defaultValue)[0];
      return toDate(minDate);
    },
    calcMaxDate() {
      const maxDate = this.maxDate || calcDefaultValue(this.defaultValue)[1];
      return toDate(maxDate);
    },
    btnDisabled() {
      return !(
        this.minDate &&
        this.maxDate &&
        !this.selecting &&
        this.isValidValue([this.minDate, this.maxDate])
      );
    },
    leftLabel() {
      return (
        this.leftDate.getFullYear() +
        getOffset(this.calendarType) +
        ' ' +
        this.t('el.datepicker.year')
      );
    },
    rightLabel() {
      return (
        this.rightDate.getFullYear() +
        getOffset(this.calendarType) +
        ' ' +
        this.t('el.datepicker.year')
      );
    },
    leftYear() {
      return this.leftDate.getFullYear();
    },
    rightYear() {
      return this.rightDate.getFullYear() === this.leftDate.getFullYear()
        ? this.leftDate.getFullYear() + 1
        : this.rightDate.getFullYear();
    },
    enableYearArrow() {
      if (!this.unlink) {
        return this.unlinkPanels && this.rightYear > this.leftYear + 1;
      } else {
        return true;
      }
    },
    minVisibleMonth() {
      if (this.minDate) {
        return formatDate(this.minDate, this.format, this.calendarType);
      }
      return '';
    },
    maxVisibleMonth() {
      if (this.maxDate) {
        return formatDate(this.maxDate, this.format, this.calendarType);
      }
      return '';
    },
    showAbnormalInfo() {
      if (this.isUnlinkRange) {
        if (
          this.minDate &&
          this.maxDate &&
          clearDate(this.minDate).getTime() > clearDate(this.maxDate).getTime()
        ) {
          return true;
        }
      }
      return false;
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.leftCurrentView = 'month';
        this.rightCurrentView = 'month';
      }
    },
    value(newVal) {
      if (!newVal) {
        this.minDate = this.now;
        this.maxDate = this.now;
      } else if (Array.isArray(newVal)) {
        this.minDate = toDate(newVal[0]);
        this.maxDate = toDate(newVal[1]);
      }
      this.leftDate = this.calcMinDate;
      this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
    },
    defaultValue(val) {
      if (!Array.isArray(this.value)) {
        const [leftDate, rightDate] = calcDefaultValue(val);
        this.leftDate = leftDate;
        this.rightDate = this.getDefaultRightDate(rightDate);
      }
    }
  },
  methods: {
    getDefaultRightDate(val) {
      const minDateYear = this.calcMinDate.getFullYear();
      const maxDateYear = this.calcMaxDate.getFullYear();
      const toNext = minDateYear === maxDateYear;
      if (!this.isUnlinkRange && toNext) {
        return nextYear(val);
      } else {
        return val;
      }
    },
    handleLeftYearPick(year) {
      this.leftDate = setYear(this.leftDate, year);
      this.leftCurrentView = 'month';
    },
    handleRightYearPick(year) {
      this.rightDate = setYear(this.rightDate, year);
      this.rightCurrentView = 'month';
    },
    showYearPicker(pos) {
      if (this.isUnlinkRange) {
        if (pos === 'left') {
          this.leftCurrentView = 'year';
        } else {
          this.rightCurrentView = 'year';
        }
      }
    },
    handleClear() {
      this.minDate = null;
      this.maxDate = null;
      this.leftDate = this.calcMinDate;
      this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
      this.$emit('pick', null);
    },
    handleChangeRange(val) {
      this.minDate = val.minDate;
      this.maxDate = val.maxDate;
      this.rangeState = val.rangeState;
    },
    handleRangePick(val, { type, cell }) {
      const defaultTime = this.defaultTime || [];
      const minDate = modifyWithTimeString(val.minDate, defaultTime[0]);
      const maxDate = modifyWithTimeString(val.maxDate, defaultTime[1]);
      if (this.isUnlinkRange) {
        if (type === 'min') {
          this.minDate = minDate;
          this.leftDate = minDate;
        } else {
          this.maxDate = maxDate;
          this.rightDate = maxDate;
        }
      } else {
        if (this.maxDate === maxDate && this.minDate === minDate) {
          return;
        }
        this.onPick && this.onPick(val);
        this.maxDate = maxDate;
        this.minDate = minDate;
      }
      this.handleConfirm(!!this.unlink);
    },
    handleShortcutClick(shortcut) {
      if (shortcut.onClick) {
        shortcut.onClick(this);
      }
    },
    // leftPrev*, rightNext* need to take care of `unlinkPanels`
    leftPrevYear() {
      this.leftDate = prevYear(this.leftDate);
      if (!this.unlinkPanels) {
        this.rightDate = prevYear(this.rightDate);
      }
    },
    rightNextYear() {
      if (!this.unlinkPanels) {
        this.leftDate = nextYear(this.leftDate);
      }
      this.rightDate = nextYear(this.rightDate);
    },
    // leftNext*, rightPrev* are called when `unlinkPanels` is true
    leftNextYear() {
      this.leftDate = nextYear(this.leftDate);
    },
    rightPrevYear() {
      this.rightDate = prevYear(this.rightDate);
    },
    handleConfirm(visible = false) {
      if (this.isValidValue([this.minDate, this.maxDate])) {
        this.$emit('pick', [this.minDate, this.maxDate], visible);
      }
    },
    isValidValue(value) {
      return (
        Array.isArray(value) &&
        value &&
        value[0] &&
        value[1] &&
        isDate(value[0]) &&
        isDate(value[1]) &&
        clearDate(value[0]).getTime() <= clearDate(value[1]).getTime() &&
        !this.disabledDate(value[0]) &&
        !this.disabledDate(value[1])
      );
    },
    resetView() {
      this.$nextTick(() => {
        if (isEmptyDate(this.value)) {
          this.minDate = null;
          this.maxDate = null;
          const defaultValue = this.defaultValue;
          if (defaultValue) {
            const [leftDate, rightDate] = calcDefaultValue(defaultValue);
            this.minDate = leftDate;
            this.maxDate = rightDate;
            this.leftDate = leftDate;
            this.rightDate = rightDate;
          }
          this.leftDate = this.calcMinDate;
          this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
        } else {
          this.minDate = toDate(this.value[0]);
          this.maxDate = toDate(this.value[1]);
          this.leftDate = this.calcMinDate;
          this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
        }
      });
    }
  }
};
</script>

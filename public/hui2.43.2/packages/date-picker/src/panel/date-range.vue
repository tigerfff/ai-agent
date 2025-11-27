<template>
  <transition
    name="el-zoom-in-bottom"
    @after-enter="handleEnter"
    @after-leave="handleLeave"
  >
    <div
      v-show="visible"
      :class="[
        {
          'has-sidebar': $slots.sidebar || shortcuts,
          'has-time': showTime
        },
        popperClass
      ]"
      class="el-picker-panel el-date-range-picker el-popper"
    >
      <div class="el-picker-panel__body-wrapper">
        <slot name="sidebar" class="el-picker-panel__sidebar" />
        <div v-if="shortcuts" class="el-picker-panel__sidebar">
          <button
            v-for="(shortcut, key) in shortcuts"
            :key="key"
            type="button"
            class="el-picker-panel__shortcut"
            @click="handleShortcutClick(shortcut)"
            v-text="shortcut.text"
          />
        </div>
        <div class="el-picker-panel__body is-date-range">
          <div
            class="el-picker-panel__content el-date-range-picker__content is-left"
          >
            <p
              class="el-date-range-picker__title"
              v-text="t('el.datepicker.startTime')"
            />
            <div ref="leftPickerHeader" class="el-date-range-picker__header">
              <button
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_left_sm"
                @click="leftPrevYear"
              />
              <button
                v-show="leftCurrentView !== 'year'"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angle_left_sm"
                @click="leftPrevMonth"
              />
              <span
                v-if="isUnlinkRange"
                :class="[`is-${leftCurrentView}`, { 'is-en': isEn }]"
                class="el-picker-panel__header-label-wrapper"
              >
                <span
                  :title="leftYearLabel"
                  role="button"
                  class="el-picker-panel__header-label"
                  @click="showYearPicker('left')"
                  v-text="leftYearLabel"
                />
                <span
                  v-show="
                    leftCurrentView === 'date' || leftCurrentView === 'month'
                  "
                  :title="leftMonthLabel"
                  role="button"
                  class="el-picker-panel__header-label"
                  @click="showMonthPicker('left')"
                  v-text="leftMonthLabel"
                />
              </span>
              <span
                v-else
                class="el-picker-panel__header-label"
                v-text="leftLabel"
              />
              <button
                v-show="leftCurrentView !== 'year'"
                :disabled="!enableMonthArrow"
                :class="{
                  'is-disabled': !enableMonthArrow,
                  'is-hide': !unlinkPanels && leftCurrentView === 'date'
                }"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angle_right_sm"
                @click="leftNextMonth"
              />
              <button
                :disabled="!enableMonthArrow"
                :class="{
                  'is-disabled': !enableMonthArrow,
                  'is-hide': !unlinkPanels && leftCurrentView === 'date'
                }"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_right_sm"
                @click="leftNextYear"
              />
            </div>
            <div class="el-picker-panel__content has-modal">
              <date-table
                :date="leftDate"
                :unlink-range="isUnlinkRange"
                :default-value="defaultValue"
                :min-date="minDate"
                :max-date="maxDate"
                :range-state="rangeState"
                :disabled-date="disabledDate"
                :first-day-of-week="firstDayOfWeek"
                :date-class-render="dateClassRender"
                selection-mode="range"
                table-type="min"
                @changerange="handleChangeRange"
                @pick="handleRangePick"
              >
                <template
                  :slot="!!($slots.date || $scopedSlots.date) ? 'date' : null"
                  slot-scope="data"
                >
                  <slot name="date" v-bind="data" />
                </template>
                <template
                  :slot="
                    !!($slots.startDate || $scopedSlots.startDate)
                      ? 'startDate'
                      : null
                  "
                  slot-scope="data"
                >
                  <slot name="startDate" v-bind="data" />
                </template>
              </date-table>
              <year-table
                v-if="leftCurrentView === 'year'"
                ref="leftYearTable"
                :date="leftDate"
                :value="minDate"
                :default-value="
                  defaultValue ? getDefaultValue(defaultValue) : null
                "
                :disabled-date="disabledDate"
                :calendar-type="calendarType"
                table-type="min"
                @pick="handleLeftYearPick"
              >
                <template
                  :slot="!!($slots.year || $scopedSlots.year) ? 'year' : null"
                  slot-scope="data"
                >
                  <slot name="year" v-bind="data" />
                </template>
                <template
                  :slot="
                    !!($slots.startYear || $scopedSlots.startYear)
                      ? 'startYear'
                      : null
                  "
                  slot-scope="data"
                >
                  <slot name="startYear" v-bind="data" />
                </template>
              </year-table>
              <month-table
                v-if="leftCurrentView === 'month'"
                ref="leftMonthTable"
                :date="leftDate"
                :value="minDate"
                :disabled-date="disabledDate"
                table-type="min"
                @pick="handleLeftMonthPick"
              >
                <template
                  :slot="
                    !!($slots.month || $scopedSlots.month) ? 'month' : null
                  "
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
            </div>
          </div>
          <div
            class="el-picker-panel__content el-date-range-picker__content is-right"
          >
            <p
              class="el-date-range-picker__title"
              v-text="t('el.datepicker.endTime')"
            />
            <div ref="rightPickerHeader" class="el-date-range-picker__header">
              <button
                :disabled="!enableMonthArrow"
                :class="{
                  'is-disabled': !enableMonthArrow,
                  'is-hide': !unlinkPanels && rightCurrentView === 'date'
                }"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_left_sm"
                @click="rightPrevYear"
              />
              <button
                v-show="rightCurrentView !== 'year'"
                :disabled="!enableMonthArrow"
                :class="{
                  'is-disabled': !enableMonthArrow,
                  'is-hide': !unlinkPanels && rightCurrentView === 'date'
                }"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angle_left_sm"
                @click="rightPrevMonth"
              />
              <span
                v-if="isUnlinkRange"
                :class="[`is-${rightCurrentView}`, { 'is-en': isEn }]"
                class="el-picker-panel__header-label-wrapper"
              >
                <span
                  :title="rightYearLabel"
                  role="button"
                  class="el-picker-panel__header-label"
                  @click="showYearPicker('right')"
                  v-text="rightYearLabel"
                />
                <span
                  v-show="
                    rightCurrentView === 'date' || rightCurrentView === 'month'
                  "
                  :title="rightMonthLabel"
                  role="button"
                  class="el-picker-panel__header-label"
                  @click="showMonthPicker('right')"
                  v-text="rightMonthLabel"
                />
              </span>
              <span
                v-else
                class="el-picker-panel__header-label"
                v-text="rightLabel"
              />
              <button
                v-show="rightCurrentView !== 'year'"
                type="button"
                class="el-picker-panel__icon-btn h-icon-angle_right_sm"
                @click="rightNextMonth"
              />
              <button
                type="button"
                class="el-picker-panel__icon-btn h-icon-angles_right_sm"
                @click="rightNextYear"
              />
            </div>
            <div class="el-picker-panel__content has-modal">
              <date-table
                :date="rightDate"
                :unlink-range="isUnlinkRange"
                :default-value="defaultValue"
                :min-date="minDate"
                :max-date="maxDate"
                :range-state="rangeState"
                :disabled-date="disabledDate"
                :first-day-of-week="firstDayOfWeek"
                :date-class-render="dateClassRender"
                selection-mode="range"
                table-type="max"
                @changerange="handleChangeRange"
                @pick="handleRangePick"
              >
                <template
                  :slot="!!($slots.date || $scopedSlots.date) ? 'date' : null"
                  slot-scope="data"
                >
                  <slot name="date" v-bind="data" />
                </template>
                <template
                  :slot="
                    !!($slots.endDate || $scopedSlots.endDate)
                      ? 'endDate'
                      : null
                  "
                  slot-scope="data"
                >
                  <slot name="endDate" v-bind="data" />
                </template>
              </date-table>
              <year-table
                v-if="rightCurrentView === 'year'"
                ref="rightYearTable"
                :date="rightDate"
                :value="maxDate"
                :default-value="
                  defaultValue ? getDefaultValue(defaultValue) : null
                "
                :disabled-date="disabledDate"
                :calendar-type="calendarType"
                table-type="max"
                @pick="handleRightYearPick"
              >
                <template
                  :slot="!!($slots.year || $scopedSlots.year) ? 'year' : null"
                  slot-scope="data"
                >
                  <slot name="year" v-bind="data" />
                </template>
                <template
                  :slot="
                    !!($slots.endYear || $scopedSlots.endYear)
                      ? 'endYear'
                      : null
                  "
                  slot-scope="data"
                >
                  <slot name="endYear" v-bind="data" />
                </template>
              </year-table>
              <month-table
                v-if="rightCurrentView === 'month'"
                ref="rightMonthTable"
                :date="rightDate"
                :value="maxDate"
                :disabled-date="disabledDate"
                table-type="max"
                @pick="handleRightMonthPick"
              >
                <template
                  :slot="
                    !!($slots.month || $scopedSlots.month) ? 'month' : null
                  "
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
            </div>
          </div>
          <div v-if="showTime" class="el-date-range-picker__time-header">
            <span class="el-date-range-picker__editors-wrap is-left">
              <!-- <span class="el-date-range-picker__time-picker-wrap">
                <el-input
                  size="small"
                  :disabled="rangeState.selecting"
                  ref="minInput"
                  :placeholder="t('el.datepicker.startDate')"
                  class="el-date-range-picker__editor"
                  :value="minVisibleDate"
                  @input="val => handleDateInput(val, 'min')"
                  @change="val => handleDateChange(val, 'min')"
                />
              </span> -->
              <span class="el-date-range-picker__time-picker-wrap">
                <span
                  v-clickoutside="{
                    fn: handleMinTimeClose,
                    excludes: $refs.changeToNow ? [$refs.changeToNow.$el] : []
                  }"
                >
                  <el-input
                    ref="minInput"
                    :disabled="rangeState.selecting"
                    :placeholder="t('el.datepicker.startTime')"
                    :value="minVisibleTime"
                    class="el-date-range-picker__editor"
                    maxlength="10"
                    @focus="minTimePickerVisible = true"
                    @blur="handleVisibleTimeBlur('min')"
                    @input="val => handleTimeInput(val, 'min')"
                    @change="val => handleTimeChange(val, 'min')"
                  />
                  <time-picker
                    ref="minTimePicker"
                    :unlink-range="unlink"
                    :unlink="false"
                    :time-arrow-control="arrowControl"
                    :visible="minTimePickerVisible"
                    time-type="min"
                    @pick="handleMinTimePick"
                    @mounted="proxyTimePickerDataProperties('min')"
                    @select-range="setSelectionRange"
                  />
                </span>
              </span>
            </span>
            <!-- <span class="h-icon-angle_right_sm"></span> -->
            <span class="el-date-range-picker__editors-wrap is-right">
              <!-- <span class="el-date-range-picker__time-picker-wrap">
                <el-input
                  size="small"
                  class="el-date-range-picker__editor"
                  :disabled="rangeState.selecting"
                  :placeholder="t('el.datepicker.endDate')"
                  :value="maxVisibleDate"
                  :readonly="!minDate"
                  @input="val => handleDateInput(val, 'max')"
                  @change="val => handleDateChange(val, 'max')"
                />
              </span> -->
              <span class="el-date-range-picker__time-picker-wrap">
                <span
                  v-clickoutside="{
                    fn: handleMaxTimeClose,
                    excludes: $refs.changeToNow ? [$refs.changeToNow.$el] : []
                  }"
                >
                  <el-input
                    ref="maxInput"
                    :disabled="rangeState.selecting"
                    :placeholder="t('el.datepicker.endTime')"
                    :value="maxVisibleTime"
                    class="el-date-range-picker__editor"
                    maxlength="10"
                    @focus="maxTimePickerVisible = true"
                    @blur="handleVisibleTimeBlur('max')"
                    @input="val => handleTimeInput(val, 'max')"
                    @change="val => handleTimeChange(val, 'max')"
                  />
                  <time-picker
                    ref="maxTimePicker"
                    :unlink-range="unlink"
                    :unlink="false"
                    :time-arrow-control="arrowControl"
                    :visible="maxTimePickerVisible"
                    time-type="max"
                    @pick="handleMaxTimePick"
                    @mounted="proxyTimePickerDataProperties('max')"
                    @select-range="setSelectionRange"
                  />
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div v-if="unlink || showTime" class="el-picker-panel__footer">
        <span
          v-if="!showPrompt || showAbnormalInfo"
          :title="prompt"
          class="el-picker-panel__footer-message is-warning"
          v-text="prompt"
        />
        <span
          v-else-if="
            minVisibleDate !== '' &&
              minVisibleTime !== '' &&
              maxVisibleDate !== '' &&
              maxVisibleTime !== ''
          "
          class="el-picker-panel__footer-message"
          :title="
            `${minVisibleDate} ${
              showTime ? minVisibleTime : ''
            } ${rangeSeparator} ${maxVisibleDate} ${
              showTime ? maxVisibleTime : ''
            }`
          "
        >
          <span v-text="minVisibleDate" />
          <span v-if="showTime" v-text="minVisibleTime" />
          <span v-text="rangeSeparator" />
          <span v-text="maxVisibleDate" />
          <span v-if="showTime" v-text="maxVisibleTime" />
        </span>
        <span v-else class="el-picker-panel__footer-message" />
        <el-button
          v-if="!disabledNow"
          ref="changeToNow"
          class="el-picker-panel__link-btn el-picker-panel__now"
          @click="changeToNow"
          v-text="t('el.datepicker.today')"
        />
        <el-button
          :disabled="disabledConfirm"
          type="primary"
          class="el-picker-panel__link-btn"
          @click="handleConfirm(false)"
          v-text="t('el.datepicker.confirm')"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import {
  formatDate,
  parseDate,
  isDate,
  toDate,
  modifyDate,
  modifyTime,
  modifyWithTimeString,
  nextDate,
  prevYear,
  nextYear,
  prevMonth,
  nextMonth,
  extractDateFormat,
  extractTimeFormat,
  clearTime,
  clearMilliseconds,
  setYear,
  setMonth,
  setDate,
  dateMergeTime,
  now,
  MIN_TIME,
  MAX_TIME,
  isEmptyDate,
  isEmpty,
  getOffset
} from '../util';

import Clickoutside from 'hui/src/utils/clickoutside';
import PopupManager from 'hui/src/utils/popup/popup-manager';
import Locale from 'hui/src/mixins/locale';
import TimePicker from './time';
import DateTable from '../basic/date-table';
import ElInput from 'hui/packages/input';
import ElButton from 'hui/packages/button';
import YearTable from '../basic/year-table';
import MonthTable from '../basic/month-table';
import Range from '../mixins/range';

const calcDefaultValue = defaultValue => {
  if (Array.isArray(defaultValue)) {
    return [toDate(defaultValue[0]), toDate(defaultValue[1])];
  } else if (defaultValue) {
    return [toDate(defaultValue), nextDate(toDate(defaultValue), 1)];
  } else {
    return [now(), nextDate(now(), 1)];
  }
};

export default {
  directives: { Clickoutside },
  components: {
    TimePicker,
    DateTable,
    ElInput,
    ElButton,
    YearTable,
    MonthTable
  },
  mixins: [Locale, Range],
  data() {
    return {
      closeOnClickModal: true,
      popperClass: '',
      value: [],
      defaultValue: null,
      defaultTime: null,
      minDate: now(),
      maxDate: now(),
      leftDate: now(),
      rightDate: now(),
      rangeState: {
        endDate: null,
        selecting: false,
        row: null,
        column: null
      },
      showTime: false,
      shortcuts: '',
      visible: '',
      disabledDate: () => {
        return false;
      },
      dateClassRender: null,
      firstDayOfWeek: 1,
      minTimePickerVisible: false,
      maxTimePickerVisible: false,
      format: '',
      arrowControl: false,
      unlinkPanels: false,
      unlink: true,
      unlinkRange: true,
      dateUserInput: {
        min: null,
        max: null
      },
      timeUserInput: {
        min: null,
        max: null
      },
      rangeSeparator: '-',
      startPlaceholder: '',
      endPlaceholder: '',
      leftCurrentView: 'date',
      rightCurrentView: 'date',
      leftFirstVisibleTime: true,
      rightFirstVisibleTime: true,
      selectableRange: [],
      calendarType: ''
    };
  },
  computed: {
    isEn() {
      const reg = /^[a-zA-Z]+$/;
      return reg.test(this.leftMonthLabel) || reg.test(this.rightMonthLabel);
    },
    now: () => now(),
    calcMinDate() {
      const minDate = this.minDate || calcDefaultValue(this.defaultValue)[0];
      return toDate(minDate);
    },
    calcMaxDate() {
      const maxDate = this.maxDate || calcDefaultValue(this.defaultValue)[1];
      return toDate(maxDate);
    },
    disabledNow() {
      const start = dateMergeTime(this.now, MIN_TIME);
      const end = dateMergeTime(this.now, MAX_TIME);
      return this.disabledDate(start) || this.disabledDate(end);
    },
    leftLabel() {
      return (
        this.leftDate.getFullYear() +
        this.offsetYear +
        this.t('el.datepicker.year') +
        ' ' +
        this.t(`el.datepicker.month${this.leftDate.getMonth() + 1}`)
      );
    },
    rightLabel() {
      return (
        this.rightDate.getFullYear() +
        this.offsetYear +
        this.t('el.datepicker.year') +
        ' ' +
        this.t(`el.datepicker.month${this.rightDate.getMonth() + 1}`)
      );
    },
    leftYearLabel() {
      const yearTranslation = this.t('el.datepicker.year');
      if (this.leftCurrentView === 'year') {
        const startYear = Math.floor(this.leftDate.getFullYear() / 10) * 10;
        if (yearTranslation) {
          return (
            startYear +
            this.offsetYear +
            yearTranslation +
            ' - ' +
            (startYear + this.offsetYear + 9) +
            yearTranslation
          );
        }
        return (
          startYear +
          this.offsetYear +
          ' - ' +
          (startYear + this.offsetYear + 9)
        );
      }
      return (
        (this.leftCurrentView === 'year'
          ? this.calcMinDate.getFullYear()
          : this.leftYearVal) +
        this.offsetYear +
        yearTranslation
      );
    },
    leftMonthLabel() {
      return this.t(`el.datepicker.month${this.leftDate.getMonth() + 1}`);
    },
    rightYearLabel() {
      const yearTranslation = this.t('el.datepicker.year');
      if (this.rightCurrentView === 'year') {
        const startYear = Math.floor(this.rightDate.getFullYear() / 10) * 10;
        if (yearTranslation) {
          return (
            startYear +
            this.offsetYear +
            ' ' +
            yearTranslation +
            ' - ' +
            (startYear + this.offsetYear + 9) +
            yearTranslation
          );
        }
        return (
          startYear +
          this.offsetYear +
          ' - ' +
          (startYear + this.offsetYear + 9)
        );
      }
      return (
        (this.rightCurrentView === 'year'
          ? this.calcMaxDate.getFullYear()
          : this.rightYearVal) +
        this.offsetYear +
        yearTranslation
      );
    },
    rightMonthLabel() {
      return this.t(`el.datepicker.month${this.rightDate.getMonth() + 1}`);
    },
    leftYearVal() {
      return this.leftDate.getFullYear();
    },
    leftMonthVal() {
      return this.leftDate.getMonth();
    },
    leftDateVal() {
      return this.leftDate.getDate();
    },
    rightYearVal() {
      return this.rightDate.getFullYear();
    },
    rightMonthVal() {
      return this.rightDate.getMonth();
    },
    rightDateVal() {
      return this.rightDate.getDate();
    },
    minVisibleDate() {
      if (this.dateUserInput.min !== null) {
        return this.dateUserInput.min;
      }
      if (this.minDate) {
        return formatDate(this.minDate, this.dateFormat, this.calendarType);
      }
      return '';
    },
    maxVisibleDate() {
      if (this.dateUserInput.max !== null) {
        return this.dateUserInput.max;
      }
      if (this.maxDate) {
        return formatDate(
          this.maxDate || this.minDate,
          this.dateFormat,
          this.calendarType
        );
      }
      return '';
    },
    minVisibleTime() {
      if (this.timeUserInput.min !== null) {
        return this.timeUserInput.min;
      } else if (
        isEmpty(this.minDate) &&
        this.leftFirstVisibleTime &&
        !this.defaultTime
      ) {
        return '';
      } else if (this.leftDate) {
        return formatDate(this.leftDate, this.timeFormat);
      }
      return '';
    },
    maxVisibleTime() {
      if (this.timeUserInput.max !== null) {
        return this.timeUserInput.max;
      } else if (
        isEmpty(this.maxDate) &&
        this.rightFirstVisibleTime &&
        !this.defaultTime
      ) {
        return '';
      } else if (this.rightDate) {
        return formatDate(this.rightDate, this.timeFormat);
      }
      return '';
    },
    timeFormat() {
      if (this.format) {
        return extractTimeFormat(this.format);
      } else {
        return 'HH:mm:ss';
      }
    },
    dateFormat() {
      if (this.format) {
        return extractDateFormat(this.format);
      } else {
        return 'yyyy/MM/dd';
      }
    },
    enableMonthArrow() {
      if (!this.unlink) {
        const nextMonth = (this.leftMonthVal + (this.unlink ? 0 : 1)) % 12;
        const yearOffset =
          this.leftMonthVal + (this.unlink ? 0 : 1) >= 12 ? 1 : 0;
        return (
          this.isUnlinkRange &&
          toDate(this.leftYearVal + yearOffset, nextMonth) <
            toDate(this.rightYearVal, this.rightMonthVal)
        );
      } else {
        return true;
      }
    },
    enableYearArrow() {
      return (
        (this.isUnlinkRange &&
          this.rightYearVal * 12 +
            this.rightMonthVal -
            (this.leftYearVal * 12 +
              this.leftMonthVal +
              (this.unlink ? 0 : 1)) >=
            12) ||
        this.leftCurrentView === 'year'
      );
    },
    showAbnormalInfo() {
      if (this.isUnlinkRange && this.minDate && this.maxDate) {
        if (this.showTime) {
          return (
            clearMilliseconds(this.leftDate).getTime() >
            clearMilliseconds(this.rightDate).getTime()
          );
        } else {
          return (
            clearTime(this.leftDate).getTime() >
            clearTime(this.rightDate).getTime()
          );
        }
      }
      return false;
    },
    minRefInput() {
      if (this.$refs.minInput.$el) {
        return [].slice.call(
          this.$refs.minInput.$el.querySelectorAll('input')
        )[0];
      }
      return [];
    },
    maxRefInput() {
      if (this.$refs.maxInput.$el) {
        return [].slice.call(
          this.$refs.maxInput.$el.querySelectorAll('input')
        )[0];
      }
      return [];
    },
    minTimeEmpty() {
      if (!this.isUnlinkRange) {
        return false;
      }
      return isEmptyDate(this.value) && isEmptyDate(this.defaultTime);
    },
    maxTimeEmpty() {
      if (!this.isUnlinkRange) {
        return false;
      }
      return isEmptyDate(this.value) && isEmptyDate(this.defaultTime);
    },
    emitDate() {
      return [this.leftDate, this.rightDate];
    },
    offsetYear() {
      return getOffset(this.calendarType);
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.closeModal();
      }
    },
    minDate(val) {
      this.dateUserInput.min = null;
      this.timeUserInput.min = null;
      if (isDate(val) && this.$refs.minTimePicker) {
        this.$refs.minTimePicker.date = val;
        this.$refs.minTimePicker.value = val;
      }
    },
    maxDate(val) {
      this.dateUserInput.max = null;
      this.timeUserInput.max = null;
      if (isDate(val) && this.$refs.maxTimePicker) {
        this.$refs.maxTimePicker.date = val;
        this.$refs.maxTimePicker.value = val;
      }
    },
    minTimePickerVisible(val) {
      if (val) {
        this.$refs.minTimePicker.date = this.minDate || this.leftDate;
        this.$refs.minTimePicker.value = this.minDate || this.leftDate;
        this.$nextTick(() => {
          this.$refs.minTimePicker.adjustSpinners();
          this.openModal(
            this._popupLeftId,
            this.$refs.leftPickerHeader,
            'is-time'
          );
        });
      } else {
        PopupManager.closeModal(this._popupLeftId);
      }
    },
    maxTimePickerVisible(val) {
      if (val) {
        this.$refs.maxTimePicker.date = this.maxDate || this.rightDate;
        this.$refs.maxTimePicker.value = this.maxDate || this.rightDate;
        this.$nextTick(() => {
          this.$refs.maxTimePicker.adjustSpinners();
          this.openModal(
            this._popupRightId,
            this.$refs.rightPickerHeader,
            'is-time'
          );
        });
      } else {
        PopupManager.closeModal(this._popupRightId);
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
  beforeMount() {
    this._popupLeftId = `popup-date-range-left-${this._uid}`;
    this._popupRightId = `popup-date-range-right-${this._uid}`;
    PopupManager.register(this._popupLeftId, this);
    PopupManager.register(this._popupRightId, this);
  },
  beforeDestroy() {
    PopupManager.deregister(this._popupLeftId, this);
    PopupManager.deregister(this._popupRightId, this);
    this.closeModal();
  },
  methods: {
    getDefaultValue(val) {
      return calcDefaultValue(val);
    },
    proxyTimePickerDataProperties(type) {
      const ref = type === 'min' ? 'minTimePicker' : 'maxTimePicker';

      const format = timeFormat => {
        this.$refs[ref].format = timeFormat;
      };
      const selectableRange = selectableRange => {
        this.$refs[ref].selectableRange = selectableRange;
      };

      this.$watch('timeFormat', format);
      this.$watch('selectableRange', selectableRange);

      format(this.timeFormat);
      selectableRange(this.selectableRange);
    },
    getDefaultRightDate(val) {
      const minDateYear = this.calcMinDate.getFullYear();
      const minDateMonth = this.calcMinDate.getMonth();
      const maxDateYear = this.calcMaxDate.getFullYear();
      const maxDateMonth = this.calcMaxDate.getMonth();
      const toNext =
        minDateYear === maxDateYear && minDateMonth === maxDateMonth;
      if (!this.isUnlinkRange && toNext) {
        return nextMonth(val);
      } else {
        return val;
      }
    },
    handleLeftYearPick(year) {
      this.leftDate = setYear(this.leftDate, year);
      this.leftCurrentView = 'date';
      this.setLeftValue();
      this.emit(this.emitDate, true);
      PopupManager.closeModal(this._popupLeftId);
    },
    handleLeftMonthPick(month) {
      this.leftDate = setYear(this.leftDate, this.leftDate.getFullYear());
      this.leftDate = setMonth(this.leftDate, month);
      this.leftCurrentView = 'date';
      this.setLeftValue();
      this.emit(this.emitDate, true);
      PopupManager.closeModal(this._popupLeftId);
    },
    handleRightYearPick(year) {
      this.rightDate = setYear(this.rightDate, year);
      this.rightCurrentView = 'date';
      this.setRightValue();
      this.emit(this.emitDate, true);
      PopupManager.closeModal(this._popupRightId);
    },
    handleRightMonthPick(month) {
      this.rightDate = setYear(this.rightDate, this.rightDate.getFullYear());
      this.rightDate = setMonth(this.rightDate, month);
      this.rightCurrentView = 'date';
      this.setRightValue();
      this.emit(this.emitDate, true);
      PopupManager.closeModal(this._popupRightId);
    },
    openModal(id, dom, cls) {
      PopupManager.openModal({
        id: id,
        zIndex: 10,
        dom: dom,
        modalClass: cls,
        modalFade: true,
        multiModal: true
      });
    },
    closeLeftModal() {
      PopupManager.closeModal(this._popupLeftId);
      this.leftCurrentView = 'date';
    },
    closeRightModal() {
      PopupManager.closeModal(this._popupRightId);
      this.rightCurrentView = 'date';
    },
    closeModal() {
      this.closeLeftModal();
      this.closeRightModal();
    },
    close(id) {
      if (id.indexOf('popup-date-range-left') !== -1) {
        this.leftCurrentView = 'date';
      } else {
        this.rightCurrentView = 'date';
      }
      PopupManager.closeModal(id);
    },
    showYearPicker(pos) {
      if (pos === 'left') {
        this.closeRightModal();
        this.leftCurrentView = 'year';
        this.$nextTick(() => {
          this.openModal(
            this._popupLeftId,
            this.$refs.leftYearTable.$el,
            'is-year'
          );
        });
      } else {
        this.closeLeftModal();
        this.rightCurrentView = 'year';
        this.$nextTick(() => {
          this.openModal(
            this._popupRightId,
            this.$refs.rightYearTable.$el,
            'is-year'
          );
        });
      }
    },
    showMonthPicker(pos) {
      if (pos === 'left') {
        this.closeRightModal();
        this.leftCurrentView = 'month';
        this.$nextTick(() => {
          this.openModal(
            this._popupLeftId,
            this.$refs.leftMonthTable.$el,
            'is-month'
          );
        });
      } else {
        this.closeLeftModal();
        this.rightCurrentView = 'month';
        this.$nextTick(() => {
          this.openModal(
            this._popupRightId,
            this.$refs.rightMonthTable.$el,
            'is-month'
          );
        });
      }
    },
    changeToNow() {
      this.closeModal();
      const start = dateMergeTime(now(), MIN_TIME);
      const end = dateMergeTime(now(), MAX_TIME);
      this.minDate = start;
      this.leftDate = start;
      this.maxDate = end;
      this.rightDate = end;
      this.handleMinTimeClose();
      this.handleMaxTimeClose();
      this.emit([start, end], true);
    },
    // HUI reserved
    handleClear() {
      this.minDate = null;
      this.maxDate = null;
      this.leftDate = this.calcMinDate;
      this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
      this.emit(null);
    },
    handleChangeRange(val) {
      this.minDate = val.minDate;
      this.maxDate = val.maxDate;
      this.rangeState = val.rangeState;
    },
    /**
     * 预留手动输入日期逻辑
     */
    // handleDateInput(value, type) {
    //   this.dateUserInput[type] = value;
    //   const parsedValue = parseDate(value, this.dateFormat);
    //   if (parsedValue) {
    //     if (
    //       typeof this.disabledDate === 'function' &&
    //       this.disabledDate(toDate(parsedValue))
    //     ) {
    //       return;
    //     }
    //     if (type === 'min') {
    //       this.minDate = modifyDate(
    //         this.minDate || toDate(),
    //         parsedValue.getFullYear(),
    //         parsedValue.getMonth(),
    //         parsedValue.getDate()
    //       );
    //       this.leftDate = toDate(parsedValue);
    //       if (!this.isUnlinkRange) {
    //         this.rightDate = this.unlink
    //           ? this.leftDate
    //           : nextMonth(this.leftDate);
    //       }
    //     } else {
    //       this.maxDate = modifyDate(
    //         this.maxDate || toDate(),
    //         parsedValue.getFullYear(),
    //         parsedValue.getMonth(),
    //         parsedValue.getDate()
    //       );
    //       this.rightDate = toDate(parsedValue);
    //       if (!this.isUnlinkRange) {
    //         this.leftDate = prevMonth(parsedValue);
    //       }
    //     }
    //   }
    // },
    // handleDateChange(value, type) {
    //   const parsedValue = parseDate(value, this.dateFormat);
    //   if (parsedValue) {
    //     if (type === 'min') {
    //       this.minDate = modifyDate(
    //         this.minDate,
    //         parsedValue.getFullYear(),
    //         parsedValue.getMonth(),
    //         parsedValue.getDate()
    //       );
    //       if (this.minDate > this.maxDate) {
    //         this.maxDate = this.minDate;
    //       }
    //     } else {
    //       this.maxDate = modifyDate(
    //         this.maxDate,
    //         parsedValue.getFullYear(),
    //         parsedValue.getMonth(),
    //         parsedValue.getDate()
    //       );
    //       if (this.maxDate < this.minDate) {
    //         this.minDate = this.maxDate;
    //       }
    //     }
    //   }
    // },
    handleTimeInput(value, type) {
      const parsedValue = parseDate(value, this.timeFormat);
      if (parsedValue) {
        this.timeUserInput[type] = value;
        if (type === 'min') {
          this.minDate = toDate(this.minDate);
          this.minDate = modifyTime(
            this.minDate,
            parsedValue.getHours(),
            parsedValue.getMinutes(),
            parsedValue.getSeconds()
          );
          this.$nextTick(() => this.$refs.minTimePicker.adjustSpinners());
        } else {
          this.maxDate = toDate(this.maxDate);
          this.maxDate = modifyTime(
            this.maxDate,
            parsedValue.getHours(),
            parsedValue.getMinutes(),
            parsedValue.getSeconds()
          );
          this.$nextTick(() => this.$refs.maxTimePicker.adjustSpinners());
        }
      }
    },
    handleTimeChange(value, type) {
      const parsedValue = parseDate(value, this.timeFormat);
      if (parsedValue) {
        if (type === 'min') {
          this.minDate = toDate(this.minDate);
          this.minDate = modifyTime(
            this.minDate,
            parsedValue.getHours(),
            parsedValue.getMinutes(),
            parsedValue.getSeconds()
          );
          if (!this.isUnlinkRange && this.minDate > this.maxDate) {
            this.maxDate = this.minDate;
          }
          this.$refs.minTimePicker.value = this.minDate;
          this.leftDate = this.minDate;
        } else {
          this.maxDate = toDate(this.maxDate);
          this.maxDate = modifyTime(
            this.maxDate,
            parsedValue.getHours(),
            parsedValue.getMinutes(),
            parsedValue.getSeconds()
          );
          if (!this.isUnlinkRange && this.maxDate < this.minDate) {
            this.minDate = this.maxDate;
          }
          this.$refs.maxTimePicker.value = this.maxDate;
          this.rightDate = this.maxDate;
        }
      }
    },
    handleVisibleTimeBlur(type) {
      this.timeUserInput[type] = null;
    },
    handleRangePick(val, { type, cell }) {
      this.closeModal();
      const defaultTime = this.defaultTime || [];
      this.onPick && this.onPick(val);
      let minDate = modifyWithTimeString(val.minDate, defaultTime[0]);
      let maxDate = modifyWithTimeString(val.maxDate, defaultTime[1]);
      const leftDate = minDate
        ? modifyDate(
            this.leftDate,
            minDate.getFullYear(),
            minDate.getMonth(),
            minDate.getDate()
          )
        : this.leftDate;
      const rightDate = maxDate
        ? modifyDate(
            this.rightDate,
            maxDate.getFullYear(),
            maxDate.getMonth(),
            maxDate.getDate()
          )
        : this.rightDate;
      if (this.isUnlinkRange) {
        this.leftDate = leftDate;
        this.rightDate = rightDate;
        if (type === 'min') {
          if (!this.minTimeEmpty) {
            minDate = dateMergeTime(
              setDate(leftDate, minDate.getDate()),
              leftDate
            );
          } else {
            minDate = setDate(leftDate, minDate.getDate());
          }
          this.minDate = minDate;
          if (defaultTime.length !== 0) {
            this.maxDate = maxDate;
          }
        } else {
          if (!this.maxTimeEmpty) {
            maxDate = dateMergeTime(
              setDate(rightDate, maxDate.getDate()),
              rightDate
            );
          } else {
            maxDate = setDate(rightDate, maxDate.getDate());
          }
          if (defaultTime.length !== 0) {
            this.minDate = minDate;
          }
          this.maxDate = maxDate;
        }
      } else {
        if (this.maxDate === maxDate && this.minDate === minDate) {
          return;
        }
        this.minDate = minDate;
        this.maxDate = maxDate;
      }
      if (!this.isUnlinkRange && this.showTime) {
        return;
      }
      this.handleConfirm(!!this.unlink);
    },
    handleShortcutClick(shortcut) {
      if (shortcut.onClick) {
        shortcut.onClick(this);
      }
    },
    handleMinTimeClose() {
      this.minTimePickerVisible = false;
    },
    handleMinTimePick(value, visible, first) {
      this.leftFirstVisibleTime = false;
      const leftDate = this.minDate || this.leftDate;
      if (value) {
        const newVal = modifyTime(
          leftDate,
          value.getHours(),
          value.getMinutes(),
          value.getSeconds()
        );
        if (this.minDate) {
          this.minDate = newVal;
        }
        this.leftDate = newVal;
      }
      if (!first) {
        this.minTimePickerVisible = visible;
      }
      if (!this.isUnlinkRange) {
        if (
          !this.maxDate ||
          (this.maxDate && this.maxDate.getTime() < this.minDate.getTime())
        ) {
          this.maxDate = toDate(this.minDate);
        }
      }
      if (!this.unlink) {
        this.emit(this.emitDate, true);
      }
    },
    handleMaxTimePick(value, visible, first) {
      this.rightFirstVisibleTime = false;
      const rightDate = this.maxDate || this.rightDate;
      if (value) {
        const newVal = modifyTime(
          rightDate,
          value.getHours(),
          value.getMinutes(),
          value.getSeconds()
        );
        if (this.maxDate) {
          this.maxDate = newVal;
        }
        this.rightDate = newVal;
      }
      if (!first) {
        this.maxTimePickerVisible = visible;
      }
      if (!this.isUnlinkRange) {
        if (
          this.maxDate &&
          this.minDate &&
          this.minDate.getTime() > this.maxDate.getTime()
        ) {
          this.minDate = toDate(this.maxDate);
        }
      }
      if (!this.unlink) {
        this.emit(this.emitDate, true);
      }
    },
    handleMaxTimeClose() {
      this.maxTimePickerVisible = false;
    },
    // leftPrev*, rightNext* need to take care of `unlinkPanels`
    setLeftValue() {
      if (this.minDate) {
        this.minDate = this.leftDate;
      }
    },

    setRightValue() {
      if (this.maxDate) {
        this.maxDate = this.rightDate;
      }
    },

    leftPrevYear() {
      if (this.leftCurrentView === 'year') {
        this.leftDate = prevYear(this.leftDate, 10);
      } else {
        this.leftDate = prevYear(this.leftDate);
        if (!this.isUnlinkRange) {
          this.rightDate = nextMonth(this.leftDate);
        }
      }
      this.setLeftValue();
      this.emit(this.emitDate, true);
    },
    leftPrevMonth() {
      this.leftDate = prevMonth(this.leftDate);
      if (!this.isUnlinkRange) {
        this.rightDate = nextMonth(this.leftDate);
      }
      this.setLeftValue();
      this.emit(this.emitDate, true);
    },
    // leftNext*, rightPrev* are called when `unlinkPanels` is true
    leftNextYear() {
      if (this.leftCurrentView === 'year') {
        this.leftDate = nextYear(this.leftDate, 10);
      } else {
        this.leftDate = nextYear(this.leftDate);
      }
      if (!this.isUnlinkRange) {
        this.setLeftValue();
        this.emit(this.emitDate, true);
      }
    },
    leftNextMonth() {
      this.leftDate = nextMonth(this.leftDate);

      if (!this.isUnlinkRange) {
        this.setLeftValue();
        this.emit(this.emitDate, true);
      }
    },
    rightNextYear() {
      if (this.rightCurrentView === 'year') {
        this.rightDate = nextYear(this.rightDate, 10);
      } else {
        if (!this.isUnlinkRange) {
          this.leftDate = nextYear(this.leftDate);
          this.rightDate = nextMonth(this.leftDate);
        } else {
          this.rightDate = nextYear(this.rightDate);
          this.setRightValue();
          this.emit(this.emitDate, true);
        }
      }
    },
    rightNextMonth() {
      if (!this.isUnlinkRange) {
        this.leftDate = nextMonth(this.leftDate);
        this.rightDate = nextMonth(this.leftDate);
      } else {
        this.rightDate = nextMonth(this.rightDate);
        this.setRightValue();
        this.emit(this.emitDate, true);
      }
    },
    rightPrevYear() {
      if (this.rightCurrentView === 'year') {
        this.rightDate = prevYear(this.rightDate, 10);
      } else {
        this.rightDate = prevYear(this.rightDate);
        this.setRightValue();
        this.emit(this.emitDate, true);
      }
    },
    rightPrevMonth() {
      this.rightDate = prevMonth(this.rightDate);
      this.setRightValue();
      this.emit(this.emitDate, true);
    },
    handleConfirm(visible = false) {
      let date = [this.leftDate, this.rightDate];
      if (this.unlink) date = [this.minDate, this.maxDate];

      if (this.isValidValue(date)) {
        this.$emit('pick', date, visible);
      } else {
        this.$emit('pick', date, visible, false);
      }
    },
    emit(value, ...args) {
      if (!isEmptyDate(this.value)) {
        if (isEmptyDate(value)) {
          this.$emit('pick', null);
        } else {
          this.$emit('pick', value, ...args);
        }
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
        (this.showTime
          ? clearMilliseconds(value[0]).getTime() <=
            clearMilliseconds(value[1]).getTime()
          : clearTime(value[0]).getTime() <= clearTime(value[1]).getTime()) &&
        !this.disabledDate(value[0]) &&
        !this.disabledDate(value[1])
      );
    },
    resetView() {
      this.leftFirstVisibleTime = true;
      this.rightFirstVisibleTime = true;
      if (this.minDate && this.maxDate === null) {
        this.rangeState.selecting = false;
      }
      this.$nextTick(() => {
        if (isEmptyDate(this.value)) {
          // remove with bug 1111
          // this.minDate = null;
          // this.maxDate = null;
          const defaultValue = this.defaultValue;
          const defaultTime = this.defaultTime;
          if (defaultValue) {
            const [leftDate, rightDate] = calcDefaultValue(defaultValue);
            this.minDate = leftDate;
            this.maxDate = rightDate;
            this.leftDate = leftDate;
            this.rightDate = rightDate;
          }
          this.leftDate = this.calcMinDate;
          this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
          if (defaultTime) {
            this.leftDate = modifyWithTimeString(this.leftDate, defaultTime[0]);
            this.rightDate = modifyWithTimeString(
              this.rightDate,
              defaultTime[1]
            );
            this.minDate = modifyWithTimeString(this.minDate, defaultTime[0]);
            this.maxDate = modifyWithTimeString(this.maxDate, defaultTime[1]);
          }
        } else {
          this.minDate = toDate(this.value[0]);
          this.maxDate = toDate(this.value[1]);
          this.leftDate = this.calcMinDate;
          this.rightDate = this.getDefaultRightDate(this.calcMaxDate);
        }
      });
    },
    handleEnter() {
      document.body.addEventListener('keydown', this.handleKeydown);
    },
    handleLeave() {
      this.$emit('dodestroy');
      document.body.removeEventListener('keydown', this.handleKeydown);
    },
    handleKeydown(event) {
      if (this.showTime) {
        if (this.minTimePickerVisible) {
          this.$refs.minTimePicker.handleKeydown(event);
        }
        if (this.maxTimePickerVisible) {
          this.$refs.maxTimePicker.handleKeydown(event);
        }
      }
    },
    setSelectionRange(start, end, pos) {
      if (pos === 'min') {
        this.minRefInput.setSelectionRange(start, end);
        this.minRefInput.focus();
      } else {
        this.maxRefInput.setSelectionRange(start, end);
        this.maxRefInput.focus();
      }
    }
  }
};
</script>

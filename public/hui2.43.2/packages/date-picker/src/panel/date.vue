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
          'has-sidebar': hasSidebar,
          'has-time': showTime
        },
        popperClass
      ]"
      class="el-picker-panel el-date-picker el-popper"
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
        <div class="el-picker-panel__body">
          <div
            v-if="currentView !== 'time'"
            ref="pickerHeader"
            :class="{
              'el-date-picker__header--bordered':
                currentView === 'year' || currentView === 'month'
            }"
            class="el-date-picker__header"
          >
            <button
              :aria-label="t(`el.datepicker.prevYear`)"
              type="button"
              class="el-picker-panel__icon-btn el-date-picker__prev-btn h-icon-angles_left_sm"
              @click="prevYear"
            />
            <button
              v-show="currentView === 'date' || currentView === 'month'"
              :aria-label="t(`el.datepicker.prevMonth`)"
              type="button"
              class="el-picker-panel__icon-btn el-date-picker__prev-btn h-icon-angle_left_sm"
              @click="prevMonth"
            />
            <span
              :class="[`is-${currentView}`, { 'is-en': isEn }]"
              class="el-picker-panel__header-label-wrapper"
            >
              <span
                :class="{ active: currentView === 'year' }"
                :title="yearLabel"
                role="button"
                class="el-picker-panel__header-label"
                @click="showYearPicker"
                v-text="yearLabel"
              />
              <span
                v-show="currentView === 'date' || currentView === 'month'"
                :class="{ active: currentView === 'month' }"
                :title="monthLabel"
                role="button"
                class="el-picker-panel__header-label"
                @click="showMonthPicker"
                v-text="monthLabel"
              />
            </span>
            <button
              v-show="currentView === 'date' || currentView === 'month'"
              :aria-label="t(`el.datepicker.nextMonth`)"
              type="button"
              class="el-picker-panel__icon-btn el-date-picker__next-btn h-icon-angle_right_sm"
              @click="nextMonth"
            />
            <button
              :aria-label="t(`el.datepicker.nextYear`)"
              type="button"
              class="el-picker-panel__icon-btn el-date-picker__next-btn h-icon-angles_right_sm"
              @click="nextYear"
            />
          </div>
          <div
            :class="{
              'has-modal': visibleDateTable,
              'is-time-picker': timePickerVisible
            }"
            class="el-picker-panel__content"
          >
            <date-table
              v-if="visibleDateTable"
              ref="dateTable"
              :unlink="unlink"
              :selection-mode="selectionMode"
              :first-day-of-week="firstDayOfWeek"
              :date-class-render="dateClassRender"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :disabled-date="disabledDate"
              @pick="handleDatePick"
            >
              <template
                :slot="!!($slots.date || $scopedSlots.date) ? 'date' : null"
                slot-scope="data"
              >
                <slot name="date" v-bind="data" />
              </template>
            </date-table>
            <year-table
              v-if="currentView === 'year'"
              ref="yearTable"
              :unlink="unlink"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :disabled-date="disabledDate"
              :calendar-type="calendarType"
              @pick="handleYearPick"
            >
              <template
                :slot="!!($slots.year || $scopedSlots.year) ? 'year' : null"
                slot-scope="data"
              >
                <slot name="year" v-bind="data" />
              </template>
            </year-table>
            <month-table
              v-if="currentView === 'month'"
              ref="monthTable"
              :unlink="unlink"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :disabled-date="disabledDate"
              @pick="handleMonthPick"
            >
              <template
                :slot="!!($slots.month || $scopedSlots.month) ? 'month' : null"
                slot-scope="data"
              >
                <slot name="month" v-bind="data" />
              </template>
            </month-table>
            <div v-if="showTime" class="el-date-picker__time-header">
              <!-- <span class="el-date-picker__editor-wrap">
                <el-input
                  :placeholder="t('el.datepicker.selectDate')"
                  :value="visibleDate"
                  size="small"
                  @input="val => (userInputDate = val)"
                  @change="handleVisibleDateChange"
                />
              </span> -->
              <span class="el-date-picker__editor-wrap">
                <span
                  v-clickoutside="{
                    fn: handleTimePickClose,
                    excludes: $refs.changeToNow ? [$refs.changeToNow.$el] : []
                  }"
                >
                  <el-input
                    ref="input"
                    :placeholder="t('el.datepicker.selectTime')"
                    :value="visibleTime"
                    maxlength="10"
                    @focus="timePickerVisible = true"
                    @blur="handleVisibleTimeBlur"
                    @input="val => (userInputTime = val)"
                    @change="handleVisibleTimeChange"
                  />
                  <time-picker
                    ref="timepicker"
                    :time-arrow-control="arrowControl"
                    :visible="timePickerVisible"
                    :unlink="false"
                    @pick="handleTimePick"
                    @mounted="proxyTimePickerDataProperties"
                    @select-range="setSelectionRange"
                  />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="visibleFooter" class="el-picker-panel__footer">
        <span v-if="hasSidebar" class="el-picker-panel__footer-message">
          <span v-text="visibleDate" />
          <span v-if="showTime" v-text="visibleTime" />
        </span>
        <span
          v-if="(selectionMode === 'dates' || disabledNow) && !hasSidebar"
          class="el-picker-panel__footer-message"
        />
        <el-button
          v-if="selectionMode !== 'dates' && !disabledNow"
          ref="changeToNow"
          :class="{
            'el-picker-panel-btn__today': !hasSidebar
          }"
          class="el-picker-panel__link-btn el-picker-panel__now"
          @click="changeToNow"
          v-text="t(nowI18nKey)"
        />
        <el-button
          :disabled="btnDisabled"
          type="primary"
          class="el-picker-panel__link-btn"
          @click="confirm"
          v-text="t('el.datepicker.confirm')"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import {
  parseDate,
  getWeekNumber,
  isDate,
  modifyDate,
  modifyTime,
  modifyWithTimeString,
  clearMilliseconds,
  clearTime,
  prevYear,
  nextYear,
  prevMonth,
  nextMonth,
  extractDateFormat,
  extractTimeFormat,
  timeWithinRange,
  formatAsFormatAndType,
  now,
  isEmpty,
  dateMergeTime,
  toDate,
  setYear,
  setMonth,
  setDate,
  prevDate,
  getOffset
} from '../util';
import Clickoutside from 'hui/src/utils/clickoutside';
import Locale from 'hui/src/mixins/locale';
import PopupManager from 'hui/src/utils/popup/popup-manager';
import ElInput from 'hui/packages/input';
import ElButton from 'hui/packages/button';
import TimePicker from './time';
import YearTable from '../basic/year-table';
import MonthTable from '../basic/month-table';
import DateTable from '../basic/date-table';

export default {
  directives: { Clickoutside },
  components: {
    TimePicker,
    YearTable,
    MonthTable,
    DateTable,
    ElInput,
    ElButton
  },
  mixins: [Locale],
  data() {
    return {
      closeOnClickModal: true,
      popperClass: '',
      date: now(),
      time: null,
      value: '',
      defaultValue: null, // use getDefaultValue() for time computation
      defaultTime: null,
      showTime: false,
      selectionMode: 'day',
      type: '',
      shortcuts: '',
      visible: false,
      currentView: 'date',
      disabledDate: () => {
        return false;
      },
      dateClassRender: null,
      selectableRange: [],
      firstDayOfWeek: 1,
      showWeekNumber: false,
      timePickerVisible: false,
      format: '',
      arrowControl: false,
      userInputDate: null,
      userInputTime: null,
      unlink: true,
      displayValue: '',
      calendarType: ''
    };
  },
  computed: {
    isEn() {
      const reg = /^[a-zA-Z]+$/;
      return reg.test(this.monthLabel);
    },
    btnDisabled() {
      if (!!this.value && this.disabledDate(this.value)) {
        return true;
      }
      return !this.value;
    },
    transitionName() {
      return false;
    },
    nowI18nKey() {
      switch (this.selectionMode) {
        case 'year':
          return 'el.datepicker.currentYear';
        case 'month':
          return 'el.datepicker.currentMonth';
        case 'week':
          return 'el.datepicker.currentWeek';
        case 'day':
          if (this.type === 'datetime') {
            return 'el.datepicker.now';
          } else {
            return 'el.datepicker.today';
          }
        default:
          return 'el.datepicker.now';
      }
    },

    hasSidebar() {
      return this.$slots.sidebar || this.shortcuts;
    },

    visibleFooter() {
      return this.unlink || this.showTime;
    },

    year() {
      return this.date.getFullYear();
    },

    month() {
      return this.date.getMonth();
    },

    week() {
      return getWeekNumber(this.date);
    },

    monthDate() {
      return this.date.getDate();
    },

    visibleDateTable() {
      return (
        this.currentView === 'date' ||
        this.selectionMode === 'day' ||
        this.selectionMode === 'dates' ||
        this.selectionMode === 'week'
      );
    },

    visibleTime() {
      if (this.userInputTime !== null) {
        return this.userInputTime;
      }
      const time = toDate(this.time);
      if (this.time) {
        return formatAsFormatAndType(time, this.timeFormat, this.type);
      } else {
        return this.defaultTime || '';
      }
    },

    visibleDate() {
      if (this.userInputDate !== null) {
        return this.userInputDate;
      } else {
        return formatAsFormatAndType(
          this.value || this.defaultValue,
          this.dateFormat,
          this.type
        );
      }
    },
    yearLabel() {
      const yearTranslation = this.t('el.datepicker.year');
      if (this.currentView === 'year') {
        const startYear = Math.floor(this.year / 10) * 10;
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
      return this.year + this.offsetYear + yearTranslation;
    },
    monthLabel() {
      return this.t(`el.datepicker.month${this.month + 1}`);
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
    refInput() {
      if (this.$refs.input.$el) {
        return [].slice.call(this.$refs.input.$el.querySelectorAll('input'))[0];
      }
      return [];
    },
    disabledNow() {
      return !(
        (!this.disabledDate || !this.disabledDate(now())) &&
        this.checkDateWithinRange(now())
      );
    },
    weekOffsetDay() {
      const week = this.firstDayOfWeek;
      return week > this.date.getDay() ? 7 - week : -week;
    },
    offsetYear() {
      return getOffset(this.calendarType);
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.closeModal();
      } else {
        if (this.selectionMode === 'month') {
          this.currentView = 'month';
        } else if (this.selectionMode === 'year') {
          this.currentView = 'year';
        } else {
          this.currentView = 'date';
        }
      }
    },
    showTime(val) {
      /* istanbul ignore if */
      if (!val) return;
      this.$nextTick(() => {
        const inputElm = this.$refs.input.$el;
        if (inputElm) {
          this.pickerWidth = inputElm.getBoundingClientRect().width + 10;
        }
      });
    },

    value(newVal, oldVal) {
      if (this.selectionMode === 'dates' && this.value) return;
      if (isDate(newVal)) {
        this.date =
          this.type === 'datetime' ? new Date(newVal) : clearTime(newVal);
        if (this.$refs.timepicker && isDate(oldVal)) {
          this.$refs.timepicker.adjustCurrentSpinner('hours');
          this.$refs.timepicker.adjustCurrentSpinner('minutes');
          this.$refs.timepicker.adjustCurrentSpinner('seconds');
        }
      } else {
        this.date = this.getDefaultValue();
      }
      this.time = newVal;
    },

    defaultValue(val) {
      if (!isDate(this.value)) {
        this.resetView();
      }
    },

    defaultTime(val) {
      if (!isDate(this.value)) {
        this.resetView();
      }
    },

    timePickerVisible(val) {
      if (val) {
        if (this.defaultTime) {
          this.time = this.getTime();
        }
        this.$nextTick(() => this.$refs.timepicker.adjustSpinners());
        this.openModal(this.$refs.pickerHeader);
      } else {
        if (!this.time) {
          this.time = this.getTime();
        }
        this.closeModal();
      }
    },

    selectionMode(newVal) {
      if (newVal === 'month') {
        /* istanbul ignore next */
        if (this.currentView !== 'year' || this.currentView !== 'month') {
          this.currentView = 'month';
        }
      } else if (newVal === 'dates') {
        this.currentView = 'date';
      }
    },
    currentView(val) {
      if (val === 'date') {
        this.closeModal();
      }
    }
  },
  beforeMount() {
    this._popupId = `popup-date-${this._uid}`;
    PopupManager.register(this._popupId, this);
  },
  beforeDestroy() {
    PopupManager.deregister(this._popupId);
    PopupManager.closeModal(this._popupId);
  },
  methods: {
    proxyTimePickerDataProperties() {
      const format = timeFormat => {
        this.$refs.timepicker.format = timeFormat;
      };
      const value = value => {
        this.$refs.timepicker.value = value;
      };
      const time = time => {
        this.$refs.timepicker.date = time;
      };
      const selectableRange = selectableRange => {
        this.$refs.timepicker.selectableRange = selectableRange;
      };
      const defaultValue = defaultValue => {
        this.$refs.timepicker.defaultValue = defaultValue;
      };

      this.$watch('timeFormat', format);
      this.$watch('value', value);
      this.$watch('time', time);
      this.$watch('selectableRange', selectableRange);
      this.$watch('defaultValue', defaultValue);
      this.$watch('defaultTime', defaultValue);

      format(this.timeFormat);
      value(this.value);
      time(this.time);
      selectableRange(this.selectableRange);
      defaultValue(this.defaultValue || this.defaultTime);
    },

    handleClear() {
      this.date = this.getDefaultValue();
      this.time = null;
      this.emit(null);
    },

    emit(value, ...args) {
      if (isEmpty(value)) {
        this.$emit('pick', value, ...args);
      } else if (Array.isArray(value)) {
        const dates = value.map(date =>
          this.showTime ? clearMilliseconds(date) : clearTime(date)
        );
        this.$emit('pick', dates, ...args);
      } else {
        this.$emit(
          'pick',
          this.showTime ? clearMilliseconds(value) : clearTime(value),
          ...args
        );
      }
      this.userInputDate = null;
      this.userInputTime = null;
    },
    openModal(dom) {
      PopupManager.openModal({
        id: this._popupId,
        zIndex: 10,
        dom: dom,
        modalClass: '',
        modalFade: true,
        multiModal: true
      });
    },

    closeModal() {
      PopupManager.closeModal(this._popupId);
    },

    close() {
      this.currentView = 'date';
      this.closeModal();
    },

    showYearPicker() {
      this.currentView = 'year';
      if (this.selectionMode !== 'year' && this.selectionMode !== 'month') {
        this.$nextTick(() => {
          this.openModal(this.$refs.yearTable.$el);
        });
      }
    },

    showMonthPicker() {
      this.currentView = 'month';
      if (this.selectionMode !== 'year' && this.selectionMode !== 'month') {
        this.$nextTick(() => {
          this.openModal(this.$refs.monthTable.$el);
        });
      }
    },

    setValue(emit) {
      if (this.value && this.selectionMode !== 'dates') {
        this.value = this.date;
      }
      if (emit) {
        this.emit(this.value, true);
      }
    },

    prevMonth() {
      this.date = prevMonth(this.date);
      // this.setValue(true);
    },

    nextMonth() {
      this.date = nextMonth(this.date);
      // this.setValue(true);
    },

    prevYear() {
      if (this.currentView === 'year') {
        this.date = prevYear(this.date, 10);
      } else {
        this.date = prevYear(this.date);
      }
      // this.setValue(true);
    },

    nextYear() {
      if (this.currentView === 'year') {
        this.date = nextYear(this.date, 10);
      } else {
        this.date = nextYear(this.date);
      }
      // this.setValue(true);
    },

    handleShortcutClick(shortcut) {
      if (shortcut.onClick) {
        shortcut.onClick(this);
      }
      this.closeModal();
    },

    handleTimePick(value, visible) {
      if (visible) {
        if (isDate(value)) {
          const newDate = !isEmpty(this.date)
            ? modifyTime(
                this.date,
                value.getHours(),
                value.getMinutes(),
                value.getSeconds()
              )
            : modifyTime(
                this.date,
                value.getHours(),
                value.getMinutes(),
                value.getSeconds()
              );
          this.time = newDate;
          if (this.date) {
            this.emit(newDate, true, false);
          }
        } else {
          this.emit(value, true, false);
        }
      }
    },

    handleTimePickClose() {
      this.timePickerVisible = false;
    },

    handleYearPick(year) {
      if (this.selectionMode === 'year') {
        this.date = modifyDate(this.date, year, 0, 1);
        this.emit(this.date, this.visibleFooter);
      } else {
        this.date = setYear(this.date, year);
        // TODO: should emit intermediate value ??
        if (this.selectionMode === 'month') {
          this.currentView = 'month';
        } else {
          this.currentView = 'date';
        }
        if (this.type !== 'dates') this.emit(this.date, true);
      }
      this.setValue();
      this.closeModal();
    },

    handleMonthPick(month) {
      if (this.selectionMode === 'month') {
        this.date = modifyDate(this.date, this.year, month, 1);
        this.emit(this.date, this.visibleFooter);
      } else {
        this.date = setMonth(this.date, month);
        // TODO: should emit intermediate value ??
        this.currentView = 'date';
        if (this.type !== 'dates') this.emit(this.date, true);
      }
      this.setValue();
      this.closeModal();
    },

    handleDatePick(value) {
      if (this.selectionMode === 'day') {
        let newDate = this.date
          ? modifyDate(
              this.date,
              value.getFullYear(),
              value.getMonth(),
              value.getDate()
            )
          : modifyWithTimeString(value, this.defaultTime);
        // change default time while out of selectableRange
        if (!this.checkDateWithinRange(newDate)) {
          newDate = modifyDate(
            this.selectableRange[0][0],
            value.getFullYear(),
            value.getMonth(),
            value.getDate()
          );
        }
        if (isEmpty(this.time)) {
          this.time = this.getTime();
        }
        this.date = newDate;
        this.emit(this.date, this.visibleFooter);
      } else if (this.selectionMode === 'week') {
        this.emit(value.date, this.visibleFooter);
      } else if (this.selectionMode === 'dates') {
        this.emit(value, true); // set false to keep panel open
      }
    },

    changeToNow() {
      // NOTE: not a permanent solution
      //       consider disable "now" button in the future
      if (!this.disabledNow) {
        const now = new Date();
        this.date = now;
        this.time = now;
        if (this.type === 'week') {
          const week = this.date.getDay();
          const dayOffset = week + this.weekOffsetDay;
          this.date = prevDate(this.date, dayOffset);
        }
        if (this.timePickerVisible) {
          this.$nextTick(() => this.$refs.timepicker.adjustSpinners());
        }
        this.emit(this.date, true, false);
      }
    },

    confirm() {
      if (this.selectionMode === 'dates') {
        this.emit(this.value, false, true);
      } else {
        // value were emitted in handle{Date,Time}Pick, nothing to update here
        // deal with the scenario where: user opens the picker, then confirm without doing anything
        this.emit(this.getTime(), false, true);
      }
    },

    getSingleValue() {
      let value = this.value;
      if (Array.isArray(value)) {
        value = value[this.value.length - 1];
      }
      return value;
    },

    getTime() {
      const value = this.getSingleValue();
      let newValue = value || this.getDefaultValue();
      if (this.time) {
        newValue = dateMergeTime(newValue, this.time);
      }
      if (this.selectionMode === 'week') {
        newValue = this.$refs.dateTable.weekDate;
      }
      return newValue;
    },

    getDate() {
      if (this.type === 'datetime') {
        return this.getTime();
      } else {
        return clearTime(this.getTime());
      }
    },

    resetView() {
      this.date = this.getDate();
      this.time = isDate(this.value) ? this.getTime() : null;
    },

    handleEnter() {
      document.body.addEventListener('keydown', this.handleKeydown);
    },

    handleLeave() {
      this.$emit('dodestroy');
      document.body.removeEventListener('keydown', this.handleKeydown);
    },

    handleKeydown(event) {
      if (this.selectionMode === 'dates') {
        return;
      }
      const keyCode = event.keyCode;
      const list = [38, 40, 37, 39];
      if (this.showTime && this.timePickerVisible) {
        this.$refs.timepicker.handleKeydown(event);
      }
      if (this.visible && !this.timePickerVisible) {
        if (list.indexOf(keyCode) !== -1) {
          this.handleKeyControl(keyCode);
          event.stopPropagation();
          event.preventDefault();
        }
        if (
          keyCode === 13 &&
          this.userInputDate === null &&
          this.userInputTime === null
        ) {
          // Enter
          this.emit(this.date, false);
        }
      }
    },
    setSelectionRange(start, end) {
      this.refInput.setSelectionRange(start, end);
      this.refInput.focus();
    },
    handleKeyControl(keyCode) {
      const mapping = {
        year: {
          38: -4,
          40: 4,
          37: -1,
          39: 1,
          offset: (date, step) => setYear(date, date.getFullYear() + step)
        },
        month: {
          38: -6,
          40: 6,
          37: -1,
          39: 1,
          offset: (date, step) => setMonth(date, date.getMonth() + step)
        },
        week: {
          38: -1,
          40: 1,
          37: -1,
          39: 1,
          offset: (date, step) => setDate(date, date.getDate() + step * 7)
        },
        day: {
          38: -7,
          40: 7,
          37: -1,
          39: 1,
          offset: (date, step) => setDate(date, date.getDate() + step)
        }
      };
      const mode = this.selectionMode;
      const year = 3.1536e10;
      const now = this.date.getTime();
      const newDate = new Date(this.date.getTime());
      while (Math.abs(now - newDate.getTime()) <= year) {
        const map = mapping[mode];
        map.offset(newDate, map[keyCode]);
        if (this.disabledDate(newDate)) {
          continue;
        }
        this.date = newDate;
        this.emit(newDate, true);
        break;
      }
    },
    handleVisibleTimeBlur() {
      this.userInputTime = null;
    },
    handleVisibleTimeChange(value) {
      const time = parseDate(value, this.timeFormat);
      if (time && this.checkDateWithinRange(time)) {
        this.time = modifyDate(time, this.year, this.month, this.monthDate);
        this.userInputTime = null;
        this.$refs.timepicker.value = this.time;
        this.emit(this.time, true, false);
      }
    },

    // handleVisibleDateChange(value) {
    //   const date = parseDate(value, this.dateFormat);
    //   if (date) {
    //     if (
    //       typeof this.disabledDate === 'function' &&
    //       this.disabledDate(date)
    //     ) {
    //       return;
    //     }
    //     this.date = modifyTime(
    //       date,
    //       this.date.getHours(),
    //       this.date.getMinutes(),
    //       this.date.getSeconds()
    //     );
    //     this.userInputDate = null;
    //     this.resetView();
    //     this.emit(this.date, true);
    //   }
    // },

    isValidValue(value) {
      if (Array.isArray(value)) {
        return value.every(item => isDate(item) && !this.disabledDate(item));
      } else {
        return (
          isDate(value) &&
          !this.disabledDate(value) &&
          this.checkDateWithinRange(value)
        );
      }
    },

    getDatesValue() {
      let value = this.value;
      if (Array.isArray(value)) {
        value = value[this.value.length - 1];
      }
      return value;
    },

    getDefaultValue() {
      let nowDate = now();
      if (this.selectionMode === 'dates') {
        nowDate = this.getDatesValue() || nowDate;
      }
      // if default-value is set, return it
      // otherwise, return now (the moment this method gets called)
      return this.defaultValue
        ? modifyWithTimeString(
            clearTime(toDate(this.defaultValue)),
            this.defaultTime
          )
        : modifyWithTimeString(nowDate, this.defaultTime);
    },

    checkDateWithinRange(date) {
      return this.selectableRange.length > 0
        ? timeWithinRange(date, this.selectableRange, this.format || 'HH:mm:ss')
        : true;
    }
  }
};
</script>

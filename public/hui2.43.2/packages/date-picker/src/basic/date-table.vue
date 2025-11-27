<template>
  <div>
    <div class="el-date-table el-date-table__week">
      <div v-if="showWeekNumber">{{ t('el.datepicker.week') }}</div>
      <div
        v-for="(week, key) in WEEKS"
        :key="key"
        class="el-date-table__week-cell"
        v-text="t('el.datepicker.weeks.' + week)"
      />
    </div>
    <table
      :class="{
        'is-week-mode': selectionMode === 'week',
        'is-unlink': unlinkRange
      }"
      cellspacing="0"
      cellpadding="0"
      class="el-date-table el-date-table__calendar"
    >
      <tbody>
        <tr
          v-for="(row, key) in rows"
          :key="key"
          :class="{
            selected: isWeekActive(row[1])
          }"
          class="el-date-table__row"
        >
          <td
            v-for="(cell, rowKey) in row"
            :key="rowKey"
            :class="getCellClasses(cell)"
            @click="handleClick(cell)"
            @mousemove="handleMouseMove(cell)"
          >
            <slot
              v-if="$slots.date || $scopedSlots.date"
              name="date"
              v-bind="buildData(cell)"
            />
            <slot
              v-else-if="
                ($slots.startDate || $scopedSlots.startDate) &&
                  tableType === 'min'
              "
              name="startDate"
              v-bind="buildData(cell)"
            />
            <slot
              v-else-if="
                ($slots.endDate || $scopedSlots.endDate) && tableType === 'max'
              "
              name="endDate"
              v-bind="buildData(cell)"
            />
            <span
              v-else
              class="cell"
              :class="cell.renderClasses"
              v-text="cell.value"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  getFirstDayOfMonth,
  getDayCountOfMonth,
  getWeekNumber,
  getStartDateOfMonth,
  prevDate,
  nextDate,
  isDate,
  getTimestamp,
  now,
  clearTime as _clearTime,
  dateValidator,
  setYear,
  setMonth,
  setDate
} from '../util';
import Locale from 'hui/src/mixins/locale';
import {
  arrayFindIndex,
  arrayFind,
  coerceTruthyValueToArray
} from 'hui/src/utils/util';
import Range from '../mixins/range';

// remove the first element that satisfies `pred` from arr
// return a new array if modification occurs
// return the original array otherwise
const removeFromArray = function(arr, pred) {
  const idx =
    typeof pred === 'function' ? arrayFindIndex(arr, pred) : arr.indexOf(pred);
  return idx >= 0 ? [...arr.slice(0, idx), ...arr.slice(idx + 1)] : arr;
};

const WEEKS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default {
  mixins: [Locale, Range],

  props: {
    firstDayOfWeek: {
      default: 1,
      type: Number,
      validator: val => val >= 1 && val <= 7
    },

    minDate: {
      type: null,
      default: null
    },

    maxDate: {
      type: null,
      default: null
    },

    defaultValue: {
      default: null,
      validator: dateValidator
    },

    date: {
      default: null,
      validator: dateValidator
    },

    value: {
      default: null,
      validator: dateValidator
    },

    selectionMode: {
      type: String,
      default: 'day'
    },

    showWeekNumber: {
      type: Boolean,
      default: false
    },

    disabledDate: {
      type: Function,
      default: () => {
        return false;
      }
    },

    dateClassRender: {
      type: Function,
      default: () => {
        return '';
      }
    },

    rangeState: {
      type: null,
      default() {
        return {
          endDate: null,
          selecting: false
        };
      }
    },

    tableType: {
      type: String,
      default: null
    },

    unlinkRange: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      lastRow: null,
      lastColumn: null
    };
  },

  computed: {
    offsetDay() {
      const week = this.firstDayOfWeek;
      // 周日为界限，左右偏移的天数，3217654 例如周一就是 -1，目的是调整前两行日期的位置
      return week > this.firstDayOfMonth ? 7 - week : -week;
    },

    WEEKS() {
      const week = this.firstDayOfWeek;
      return WEEKS.concat(WEEKS).slice(week, week + 7);
    },

    year() {
      return this.date.getFullYear();
    },

    month() {
      return this.date.getMonth();
    },

    monthDate() {
      return this.date.getDate();
    },

    startDate() {
      return getStartDateOfMonth(this.year, this.month);
    },

    firstDayOfMonth() {
      const date = new Date(this.year, this.month, 1);
      return getFirstDayOfMonth(date);
    },

    rows() {
      // TODO: refactory rows / getCellClasses
      const rows = [[], [], [], [], [], []];
      const date = new Date(this.year, this.month, 1);
      const day = getFirstDayOfMonth(date); // day of first day
      const selectionMode = this.selectionMode;
      const dateCountOfMonth = getDayCountOfMonth(
        date.getFullYear(),
        date.getMonth()
      );
      const dateCountOfLastMonth = getDayCountOfMonth(
        date.getFullYear(),
        date.getMonth() === 0 ? 11 : date.getMonth() - 1
      );
      const selectedDate = (cell, cellDate) => {
        if (this.selectionMode === 'dates') {
          return !!arrayFind(
            coerceTruthyValueToArray(this.value),
            date =>
              _clearTime(date).getTime() === _clearTime(cellDate).getTime()
          );
        } else if (selectionMode === 'day') {
          return (
            (cell.type === 'normal' || cell.type === 'today') &&
            this.cellMatchesDate(cell, this.value)
          );
        } else {
          return false;
        }
      };

      const offset = this.offsetDay;
      let count = 1;

      const startDate = this.startDate;
      const disabledDate = this.disabledDate;
      const dateClassRender = this.dateClassRender;
      for (let i = 0; i < 6; i++) {
        const row = rows[i];

        if (this.showWeekNumber) {
          if (!row[0]) {
            row[0] = {
              type: 'week',
              value: getWeekNumber(nextDate(startDate, i * 7 + 1))
            };
          }
        }

        for (let j = 0; j < 7; j++) {
          let cell = row[this.showWeekNumber ? j + 1 : j];
          if (!cell) {
            cell = {
              row: i,
              column: j,
              type: 'normal',
              inRange: false,
              start: false,
              end: false,
              tableType: this.tableType
            };
          }

          cell.type = 'normal';

          const index = i * 7 + j;
          const time = nextDate(startDate, index - offset).getTime();
          cell.inRange =
            time >= getTimestamp(this.minDate) &&
            time <= getTimestamp(this.maxDate);
          cell.start = this.minDate && time === getTimestamp(this.minDate);
          cell.end = this.maxDate && time === getTimestamp(this.maxDate);
          const isToday = time === getTimestamp(now());

          if (isToday) {
            cell.type = 'today';
          }
          if (i >= 0 && i <= 1) {
            if (j + i * 7 >= day + offset) {
              cell.value = count++;
            } else {
              cell.value =
                dateCountOfLastMonth - (day + offset - (j % 7)) + 1 + i * 7;
              cell.type = 'prev-month';
            }
          } else {
            if (count <= dateCountOfMonth) {
              cell.value = count++;
            } else {
              cell.value = count++ - dateCountOfMonth;
              cell.type = 'next-month';
            }
          }

          const cellDate = new Date(time);

          cell.disabled = disabledDate(cellDate);

          cell.renderClasses = dateClassRender ? dateClassRender(cellDate) : '';

          cell.selected = selectedDate(cell, cellDate);

          this.$set(row, this.showWeekNumber ? j + 1 : j, cell);
        }
        if (this.selectionMode === 'week') {
          const start = this.showWeekNumber ? 1 : 0;
          const end = this.showWeekNumber ? 7 : 6;
          const isWeekActive = this.isWeekActive(row[start + 1]);
          row[start].inRange = isWeekActive;
          row[start].start = isWeekActive;
          row[end].inRange = isWeekActive;
          row[end].end = isWeekActive;
        }
      }
      return rows;
    },
    weekDate() {
      let date = now();
      const startDate = this.startDate;
      const offset = this.offsetDay;
      this.rows.forEach(item => {
        item.forEach(cell => {
          if (cell.start) {
            date = nextDate(startDate, cell.row * 7 - offset);
          }
        });
      });
      return date;
    }
  },

  watch: {
    'rangeState.endDate'(newVal) {
      this.markRange(this.minDate, newVal);
    },

    minDate(newVal, oldVal) {
      if (getTimestamp(newVal) !== getTimestamp(oldVal)) {
        this.markRange(this.minDate, this.maxDate);
      }
    },

    maxDate(newVal, oldVal) {
      if (getTimestamp(newVal) !== getTimestamp(oldVal)) {
        this.markRange(this.minDate, this.maxDate);
      }
    }
  },

  methods: {
    buildData(cell) {
      const data = {};

      const openKeys = ['value', 'type', 'disabled', 'selected'];

      openKeys.forEach(item => {
        data[item] = cell[item];

        // 特殊处理 date
        const value = new Date(this.year, this.month);
        if (cell.type === 'next-month') value.setMonth(value.getMonth() + 1);
        else if (cell.type === 'prev-month')
          value.setMonth(value.getMonth() - 1);

        const date = new Date(
          value.getFullYear(),
          value.getMonth(),
          cell.value,
          0,
          0,
          0
        );

        data.date = date;
      });

      return data;
    },

    cellMatchesDate(cell, date) {
      const value = new Date(date);
      return (
        this.year === value.getFullYear() &&
        this.month === value.getMonth() &&
        +cell.value === value.getDate()
      );
    },

    getCellClasses(cell) {
      const style = {};
      const selectionMode = this.selectionMode;
      const defaultValue = this.defaultValue
        ? Array.isArray(this.defaultValue)
          ? this.defaultValue
          : [this.defaultValue]
        : [];

      style[cell.type] = true;
      style.default =
        cell.type === 'normal' &&
        defaultValue.some(date => this.cellMatchesDate(cell, date));
      style.disabled = cell.disabled;
      style.selected = cell.selected;
      if (selectionMode === 'week') {
        if (cell.start) {
          style['start-date'] = true;
        }
        if (cell.end) {
          style['end-date'] = true;
        }
      } else if (cell.type === 'normal' || cell.type === 'today') {
        if (
          cell.start &&
          (this.unlinkRange ? this.tableType !== 'max' : true)
        ) {
          style['start-date'] = true;
        }
        if (cell.end && (this.unlinkRange ? this.tableType !== 'min' : true)) {
          style['end-date'] = true;
        }
        if (cell.inRange && !this.unlinkRange) {
          style['in-range'] = true;
        }
      }
      return style;
    },

    getDateOfCell(row, column) {
      const offsetFromStart =
        row * 7 + (column - (this.showWeekNumber ? 1 : 0)) - this.offsetDay;
      return nextDate(this.startDate, offsetFromStart);
    },

    isWeekActive(cell) {
      if (this.selectionMode !== 'week') return false;
      let newDate = new Date(this.year, this.month, 1);
      const year = newDate.getFullYear();
      const month = newDate.getMonth();

      if (cell.type === 'prev-month') {
        newDate = setYear(newDate, month === 0 ? year - 1 : year);
        newDate = setMonth(newDate, month === 0 ? 11 : month - 1);
      }

      if (cell.type === 'next-month') {
        newDate = setYear(newDate, month === 11 ? year + 1 : year);
        newDate = setMonth(newDate, month === 11 ? 0 : month + 1);
      }

      newDate = setDate(newDate, parseInt(cell.value, 10));

      if (isDate(this.value)) {
        const dayOffset =
          ((this.value.getDay() - this.firstDayOfWeek + 7) % 7) - 1;
        const weekDate = prevDate(this.value, dayOffset);
        return weekDate.getTime() === newDate.getTime();
      }
      return false;
    },

    markRange(minDate, maxDate) {
      minDate = getTimestamp(minDate);
      maxDate = getTimestamp(maxDate) || (this.unlinkRange ? NaN : minDate);
      if (!this.unlinkRange) {
        [minDate, maxDate] = [
          Math.min(minDate, maxDate),
          Math.max(minDate, maxDate)
        ];
      }

      const startDate = this.startDate;
      const rows = this.rows;
      for (let i = 0, k = rows.length; i < k; i++) {
        const row = rows[i];
        for (let j = 0, l = row.length; j < l; j++) {
          if (this.showWeekNumber && j === 0) continue;
          const cell = row[j];
          const index = i * 7 + j + (this.showWeekNumber ? -1 : 0);
          const time = nextDate(startDate, index - this.offsetDay).getTime();
          cell.inRange = minDate && time >= minDate && time <= maxDate;
          cell.start = minDate && time === minDate;
          cell.end = maxDate && time === maxDate;
        }
      }
    },

    handleMouseMove(cell) {
      // can not select disabled date
      if (!this.rangeState.selecting || cell.disabled || this.unlinkRange) {
        return;
      }

      // HUI modification
      const row = cell.row;
      const column = cell.column;

      // only update rangeState when mouse moves to a new cell
      // this avoids frequent Date object creation and improves performance
      if (row !== this.lastRow || column !== this.lastColumn) {
        this.lastRow = row;
        this.lastColumn = column;
        this.$emit('changerange', {
          minDate: this.minDate,
          maxDate: this.maxDate,
          rangeState: {
            selecting: true,
            endDate: this.getDateOfCell(row, column)
          }
        });
      }
    },

    handleClick(cell) {
      // HUI modification
      const row = cell.row;
      const column = this.selectionMode === 'week' ? 1 : cell.column;

      if (cell.disabled || cell.type === 'week') return;

      const newDate = this.getDateOfCell(row, column);
      const opts = {
        type: this.tableType,
        cell: cell
      };
      if (this.selectionMode === 'range') {
        this.emitRange({ newDate, opts });
      } else if (this.selectionMode === 'day') {
        this.$emit('pick', newDate, opts);
      } else if (this.selectionMode === 'week') {
        const weekNumber = getWeekNumber(newDate);
        this.$emit(
          'pick',
          {
            year: newDate.getFullYear(),
            week: weekNumber,
            date: prevDate(newDate)
          },
          opts
        );
      } else if (this.selectionMode === 'dates') {
        const value = Array.isArray(this.value)
          ? this.value
          : this.value
          ? [this.value]
          : [];
        const newValue = cell.selected
          ? removeFromArray(value, date => date.getTime() === newDate.getTime())
          : [...value, newDate];
        this.$emit('pick', newValue, opts);
      }
    }
  }
};
</script>

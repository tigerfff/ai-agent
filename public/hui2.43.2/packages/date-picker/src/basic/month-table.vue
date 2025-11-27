<template>
  <table class="el-month-table">
    <tbody>
      <tr v-for="(row, rowKey) in rows" :key="rowKey">
        <td
          v-for="(cell, cellKey) in row"
          :key="cellKey"
          :class="getCellStyle(cell)"
          @click="handleMonthTableClick(cell)"
          @mousemove="handleMouseMove(cell)"
        >
          <slot
            v-if="$slots.month || $scopedSlots.month"
            name="month"
            v-bind="buildData(cell)"
          />
          <slot
            v-else-if="
              ($slots.startMonth || $scopedSlots.startMonth) &&
                tableType === 'min'
            "
            name="startMonth"
            v-bind="buildData(cell)"
          />
          <slot
            v-else-if="
              ($slots.endMonth || $scopedSlots.endMonth) && tableType === 'max'
            "
            name="endMonth"
            v-bind="buildData(cell)"
          />
          <span v-else class="cell" v-text="cell.value + 1" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script type="text/babel">
/* 月份 i18n
el.datepicker.months.jan
el.datepicker.months.feb
el.datepicker.months.mar
el.datepicker.months.apr
el.datepicker.months.may
el.datepicker.months.jun
el.datepicker.months.jul
el.datepicker.months.aug
el.datepicker.months.sep
el.datepicker.months.oct
el.datepicker.months.nov
el.datepicker.months.dec
 */
import {
  range,
  getDayCountOfMonth,
  nextDate,
  getTimestamp,
  now,
  dateValidator,
  clearDate,
  toDate
} from '../util';
import { arrayFindIndex, coerceTruthyValueToArray } from 'hui/src/utils/util';
import Range from '../mixins/range';

const datesInMonth = (year, month) => {
  const numOfDays = getDayCountOfMonth(year, month);
  const firstDay = new Date(year, month, 1);
  return range(numOfDays).map(n => nextDate(firstDay, n));
};

export default {
  mixins: [Range],
  props: {
    disabledDate: {
      type: null,
      default: () => {
        return false;
      }
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
      default: now('clearDate'),
      validator: dateValidator
    },
    value: {
      default: null,
      validator: dateValidator
    },
    selectionMode: {
      type: String,
      default: 'month'
    },
    rangeState: {
      type: Object,
      default() {
        return {
          endDate: null,
          selecting: false
        };
      }
    },
    unlinkRange: {
      type: Boolean,
      default: true
    },
    tableType: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      lastRow: null,
      lastColumn: null
    };
  },
  computed: {
    customValidationResult() {
      if (typeof this.customValidation === 'function') {
        const disabledMaxDate = new Date(this.maxDate);
        disabledMaxDate.setHours(0);
        disabledMaxDate.setMinutes(0);
        disabledMaxDate.setSeconds(0);
        return this.customValidation(new Date(this.minDate), disabledMaxDate);
      }
      return true;
    },
    rows() {
      // TODO: refactory rows / getCellClasses
      const rows = [[], []];
      const disabledDate = this.disabledDate;
      const year = this.date.getFullYear();

      const selectedDate = (cell, month) => {
        return (
          arrayFindIndex(
            coerceTruthyValueToArray(this.value),
            date => date.getFullYear() === year && date.getMonth() === month
          ) >= 0
        );
      };

      for (let i = 0; i < 2; i++) {
        const row = rows[i];
        for (let j = 0; j < 6; j++) {
          let cell = row[j];
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

          const index = this.getIndex(i, j);

          const time = clearDate(
            new Date(this.date.getFullYear(), index)
          ).getTime();

          cell.inRange =
            time >= this.getMonthstamp(this.minDate) &&
            time <= this.getMonthstamp(this.maxDate);

          cell.start =
            this.minDate && time === this.getMonthstamp(this.minDate);
          cell.end = this.maxDate && time === this.getMonthstamp(this.maxDate);

          const isToday = time === this.getMonthstamp(now('clearDate'));

          if (isToday) {
            cell.type = 'today';
          }

          cell.value = index;

          cell.disabled = datesInMonth(year, index).every(disabledDate);

          cell.selected = selectedDate(cell, cell.value);

          this.$set(row, j, cell);
        }
      }
      return rows;
    }
  },
  watch: {
    'rangeState.endDate'(newVal) {
      this.markRange(this.minDate, newVal);
    },

    minDate(newVal, oldVal) {
      if (this.getMonthstamp(newVal) !== this.getMonthstamp(oldVal)) {
        this.markRange(this.minDate, this.maxDate);
      }
    },

    maxDate(newVal, oldVal) {
      if (this.getMonthstamp(newVal) !== this.getMonthstamp(oldVal)) {
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
        const value = toDate(this.value);
        const date = new Date(
          value.getFullYear(),
          value.getMonth(),
          1,
          0,
          0,
          0
        );

        data.date = date;
      });

      return data;
    },
    getMonthstamp(date) {
      return getTimestamp(date, 'clearDate');
    },
    getIndex(row, column) {
      return row * 6 + column;
    },
    cellMatchesDate(cell, date) {
      const value = new Date(date);
      return (
        this.date.getFullYear() === value.getFullYear() &&
        +cell.value === value.getMonth()
      );
    },
    markRange(minDate, maxDate) {
      minDate = this.getMonthstamp(minDate);
      maxDate =
        this.getMonthstamp(maxDate) || (this.unlinkRange ? NaN : minDate);
      if (!this.unlinkRange) {
        [minDate, maxDate] = [
          Math.min(minDate, maxDate),
          Math.max(minDate, maxDate)
        ];
      }

      const rows = this.rows;
      for (let i = 0, k = rows.length; i < k; i++) {
        const row = rows[i];
        for (let j = 0, l = row.length; j < l; j++) {
          const cell = row[j];
          const index = this.getIndex(i, j);
          const time = new Date(this.date.getFullYear(), index).getTime();

          cell.inRange = minDate && time >= minDate && time <= maxDate;
          cell.start = minDate && time === minDate;
          cell.end = maxDate && time === maxDate;
        }
      }
    },
    handleMouseMove(cell) {
      if (!this.rangeState.selecting) {
        return;
      }
      const row = cell.row;
      const column = cell.column;
      // can not select disabled date
      if (cell.disabled) {
        return;
      }

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
            endDate: this.getMonthOfCell(this.getIndex(row, column))
          }
        });
      }
    },
    getCellStyle(cell) {
      const style = {};
      const defaultValue = this.defaultValue
        ? Array.isArray(this.defaultValue)
          ? this.defaultValue
          : [this.defaultValue]
        : [];

      style[cell.type] = true;
      style.default = defaultValue.some(date =>
        this.cellMatchesDate(cell, date)
      );
      style.disabled = cell.disabled;
      style.selected = cell.selected;
      style.today = cell.type === 'today';

      if (cell.start && (this.unlinkRange ? this.tableType !== 'max' : true)) {
        style['start-date'] = true;
      }
      if (cell.end && (this.unlinkRange ? this.tableType !== 'min' : true)) {
        style['end-date'] = true;
      }
      if (cell.inRange && !this.unlinkRange) {
        style['in-range'] = true;
      }

      return style;
    },
    getMonthOfCell(month) {
      const year = this.date.getFullYear();
      return new Date(year, month, 1);
    },
    handleMonthTableClick(cell) {
      if (cell.disabled) {
        return;
      }
      const column = cell.column;
      const row = cell.row;
      const month = this.getIndex(row, column);
      const newDate = this.getMonthOfCell(month);
      const opts = {
        type: this.tableType,
        cell: cell
      };
      if (this.selectionMode === 'range') {
        this.emitRange({ newDate, opts });
      } else {
        this.$emit('pick', month);
      }
    }
  }
};
</script>

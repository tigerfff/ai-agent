<template>
  <table class="el-year-table">
    <tbody>
      <tr v-for="(row, rowKey) in rows" :key="rowKey">
        <td
          v-for="(cell, cellKey) in row"
          :key="cellKey"
          :class="getCellStyle(cell)"
          @click="handleYearTableClick(cell)"
        >
          <slot
            v-if="$slots.year || $scopedSlots.year"
            name="year"
            v-bind="buildData(cell)"
          />
          <slot
            v-else-if="
              ($slots.startYear || $scopedSlots.startYear) &&
                tableType === 'min'
            "
            name="startYear"
            v-bind="buildData(cell)"
          />
          <slot
            v-else-if="
              ($slots.endYear || $scopedSlots.endYear) && tableType === 'max'
            "
            name="endYear"
            v-bind="buildData(cell)"
          />
          <span v-else class="cell" v-text="cell.showValue" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script type="text/babel">
import {
  range,
  nextDate,
  getDayCountOfYear,
  dateValidator,
  getTimestamp,
  toDate,
  clearDateAndMonth,
  getOffset
} from '../util';
import { arrayFindIndex, coerceTruthyValueToArray } from 'hui/src/utils/util';
import Range from '../mixins/range';

const datesInYear = year => {
  const numOfDays = getDayCountOfYear(year);
  const firstDay = new Date(year, 0, 1);
  return range(numOfDays).map(n => nextDate(firstDay, n));
};

export default {
  mixins: [Range],
  props: {
    disabledDate: {
      type: Function,
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
      default: null,
      validator: dateValidator
    },
    value: {
      default: null,
      validator: dateValidator
    },
    unlinkRange: {
      type: Boolean,
      default: true
    },
    calendarType: {
      type: String,
      default: ''
    },
    tableType: {
      type: String,
      default: null
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
    selectionMode: {
      type: String,
      default: 'year'
    }
  },
  data() {
    return {
      lastRow: null,
      lastColumn: null
    };
  },
  computed: {
    startYear() {
      return Math.floor(this.date.getFullYear() / 10) * 10;
    },
    rows() {
      // TODO: refactory rows / getCellClasses
      const rows = [[], [], []];
      const disabledDate = this.disabledDate;
      const today = new Date();

      for (let i = 0; i < 3; i++) {
        const row = rows[i];
        for (let j = 0; j < 4; j++) {
          let cell = row[j];
          if (!cell) {
            cell = {
              row: i,
              column: j,
              type: 'normal'
            };
          }

          const index = this.getIndex(i, j);

          const year = this.startYear + +index - 1;
          const offset = getOffset(this.calendarType);

          cell.value = year;
          cell.showValue = year + offset;

          const time = clearDateAndMonth(new Date(year + '')).getTime();

          cell.inRange =
            time >= this.getYearstamp(this.minDate) &&
            time <= this.getYearstamp(this.maxDate);

          cell.start = this.minDate && time === this.getYearstamp(this.minDate);
          cell.end = this.maxDate && time === this.getYearstamp(this.maxDate);

          const isToday = today.getFullYear() === year;
          if (isToday) {
            cell.type = 'today';
          }

          if (+index === 0) {
            cell.type = 'prev-year';
          }

          if (+index === 11) {
            cell.type = 'next-year';
          }

          cell.disabled = datesInYear(year).every(disabledDate);

          cell.selected =
            arrayFindIndex(
              coerceTruthyValueToArray(this.value),
              date => date.getFullYear() === year
            ) >= 0;

          this.$set(row, j, cell);
        }
      }
      return rows;
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
        const date = new Date(value.getFullYear(), 1, 1, 0, 0, 0);

        data.date = date;
      });

      return data;
    },
    cellMatchesDate(cell, date) {
      const value = new Date(date);
      return cell.value === value.getFullYear();
    },
    getIndex(row, column) {
      return row * 4 + column;
    },
    getYearstamp(date) {
      return getTimestamp(date, 'clearDateAndMonth');
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
    handleYearTableClick(cell) {
      if (cell.disabled) {
        return;
      }
      const column = cell.column;
      const row = cell.row;
      const year = this.getIndex(row, column);

      const newDate = new Date(this.startYear + year - 1, 1, 1);
      const opts = {
        type: this.tableType,
        cell: cell
      };
      if (this.selectionMode === 'range') {
        this.emitRange({ newDate, opts });
      } else {
        this.$emit('pick', cell.value);
      }
    }
  }
};
</script>

<template>
  <div :class="{ 'has-seconds': showSeconds }" class="el-time-spinner">
    <template v-if="!arrowControl">
      <el-scrollbar
        ref="hours"
        class="el-time-spinner__wrapper"
        wrap-style="max-height: inherit;"
        view-class="el-time-spinner__list"
        tag="ul"
        @mouseenter.native="emitSelectRange('hours')"
      >
        <li
          v-for="(disabled, hour) in hoursList"
          :key="hour"
          :class="{ active: hour === hours && !isEmpty, disabled: disabled }"
          class="el-time-spinner__item"
          @click="
            handleClick('hours', {
              value: hour,
              disabled: disabled,
              active: hour === hours && !isEmpty
            })
          "
          v-text="
            ('0' + (amPmMode ? hour % 12 || 12 : hour)).slice(-2) + amPm(hour)
          "
        />
      </el-scrollbar>
      <el-scrollbar
        ref="minutes"
        class="el-time-spinner__wrapper"
        wrap-style="max-height: inherit;"
        view-class="el-time-spinner__list"
        tag="ul"
        @mouseenter.native="emitSelectRange('minutes')"
      >
        <li
          v-for="(disabled, key) in minutesList"
          :key="key"
          :class="{
            active: key === minutes && !isEmpty,
            disabled: disabled
          }"
          class="el-time-spinner__item"
          @click="
            handleClick('minutes', {
              value: key,
              disabled: disabled,
              active: key === minutes && !isEmpty
            })
          "
          v-text="('0' + key).slice(-2)"
        />
      </el-scrollbar>
      <el-scrollbar
        v-show="showSeconds"
        ref="seconds"
        class="el-time-spinner__wrapper"
        wrap-style="max-height: inherit;"
        view-class="el-time-spinner__list"
        tag="ul"
        @mouseenter.native="emitSelectRange('seconds')"
      >
        <li
          v-for="(disabled, key) in secondsList"
          :key="key"
          :class="{
            active: key === seconds && !isEmpty,
            disabled: disabled
          }"
          class="el-time-spinner__item"
          @click="
            handleClick('seconds', {
              value: key,
              disabled: disabled,
              active: key === seconds && !isEmpty
            })
          "
          v-text="('0' + key).slice(-2)"
        />
      </el-scrollbar>
    </template>
    <template v-if="arrowControl">
      <div
        class="el-time-spinner__wrapper is-arrow"
        @mouseenter="emitSelectRange('hours')"
      >
        <i
          v-repeat-click="decrease"
          class="el-time-spinner__arrow h-icon-angle-sm-up"
        />
        <i
          v-repeat-click="increase"
          class="el-time-spinner__arrow h-icon-angle_down_sm"
        />
        <ul ref="hours" class="el-time-spinner__list">
          <li
            v-for="(hour, key) in arrowHourList"
            :key="key"
            :class="{ active: hour === hours, disabled: hoursList[hour] }"
            class="el-time-spinner__item"
            v-text="
              hour === undefined
                ? ''
                : ('0' + (amPmMode ? hour % 12 || 12 : hour)).slice(-2) +
                  amPm(hour)
            "
          />
        </ul>
      </div>
      <div
        class="el-time-spinner__wrapper is-arrow"
        @mouseenter="emitSelectRange('minutes')"
      >
        <i
          v-repeat-click="decrease"
          class="el-time-spinner__arrow h-icon-angle-sm-up"
        />
        <i
          v-repeat-click="increase"
          class="el-time-spinner__arrow h-icon-angle_down_sm
"
        />
        <ul ref="minutes" class="el-time-spinner__list">
          <li
            v-for="(minute, key) in arrowMinuteList"
            :key="key"
            :class="{ active: minute === minutes }"
            class="el-time-spinner__item"
            v-text="minute === undefined ? '' : ('0' + minute).slice(-2)"
          />
        </ul>
      </div>
      <div
        v-if="showSeconds"
        class="el-time-spinner__wrapper is-arrow"
        @mouseenter="emitSelectRange('seconds')"
      >
        <i
          v-repeat-click="decrease"
          class="el-time-spinner__arrow h-icon-angle-sm-up"
        />
        <i
          v-repeat-click="increase"
          class="el-time-spinner__arrow h-icon-angle_down_sm"
        />
        <ul ref="seconds" class="el-time-spinner__list">
          <li
            v-for="(second, key) in arrowSecondList"
            :key="key"
            :class="{ active: second === seconds }"
            class="el-time-spinner__item"
            v-text="second === undefined ? '' : ('0' + second).slice(-2)"
          />
        </ul>
      </div>
    </template>
  </div>
</template>

<script type="text/babel">
import Locale from 'hui/src/mixins/locale';
import { getRange, modifyTime, isDate, dateValidator, toDate } from '../util';
import ElScrollbar from 'hui/packages/scrollbar';
import RepeatClick from 'hui/src/directives/repeat-click';

export default {
  components: { ElScrollbar },

  directives: {
    repeatClick: RepeatClick
  },
  mixins: [Locale],

  props: {
    date: {
      default: null,
      validator: dateValidator
    },
    defaultValue: {
      default: null,
      validator: dateValidator
    }, // reserved for future use
    showSeconds: {
      type: Boolean,
      default: true
    },
    arrowControl: {
      type: Boolean,
      default: false
    },
    amPmMode: {
      type: String,
      default: '' // 'a': am/pm; 'A': AM/PM
    },
    visible: {
      type: Boolean,
      default: false
    },
    isEmpty: {
      type: Boolean,
      default: true
    },
    unlinkRange: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      selectableRange: [],
      currentScrollbar: null
    };
  },
  computed: {
    internalDate() {
      return toDate(this.date);
    },
    hours() {
      return this.internalDate.getHours();
    },
    minutes() {
      return this.internalDate.getMinutes();
    },
    seconds() {
      return this.internalDate.getSeconds();
    },
    hoursList() {
      return getRange('hours', this.selectableRange);
    },
    minutesList() {
      return getRange('minutes', this.selectableRange, this.internalDate);
    },
    secondsList() {
      return getRange('seconds', this.selectableRange, this.internalDate);
    },
    arrowHourList() {
      const hours = this.hours;
      return [
        hours > 0 ? hours - 1 : undefined,
        hours,
        hours < 23 ? hours + 1 : undefined
      ];
    },
    arrowMinuteList() {
      const minutes = this.minutes;
      return [
        minutes > 0 ? minutes - 1 : undefined,
        minutes,
        minutes < 59 ? minutes + 1 : undefined
      ];
    },
    arrowSecondList() {
      const seconds = this.seconds;
      return [
        seconds > 0 ? seconds - 1 : undefined,
        seconds,
        seconds < 59 ? seconds + 1 : undefined
      ];
    }
  },
  methods: {
    increase() {
      this.scrollDown(1);
    },

    decrease() {
      this.scrollDown(-1);
    },

    modifyDateField(type, value) {
      let data;
      switch (type) {
        case 'hours':
          data = modifyTime(
            this.internalDate,
            value,
            this.minutes,
            this.seconds
          );
          break;
        case 'minutes':
          data = modifyTime(this.internalDate, this.hours, value, this.seconds);
          break;
        case 'seconds':
          data = modifyTime(this.internalDate, this.hours, this.minutes, value);
          break;
      }
      if (this.selectableRange.length > 0) {
        const start = this.selectableRange[0][0];
        const selectableRangeLength = this.selectableRange.length;
        const end = this.selectableRange[selectableRangeLength - 1][1];
        const dataHours = data.getHours();
        const dataMinutes = data.getMinutes();
        const dataSeconds = data.getSeconds();
        const startHours = start.getHours();
        const startMinutes = start.getMinutes();
        const startSeconds = start.getSeconds();
        const endHours = end.getHours();
        const endMinutes = end.getMinutes();
        const endSeconds = end.getSeconds();

        if (dataHours === startHours && dataMinutes < startMinutes) {
          data.setMinutes(startMinutes);
          this.adjustSpinner('minutes', startMinutes, 120);
          data.setSeconds(startSeconds);
          this.adjustSpinner('seconds', startSeconds, 120);
        } else if (
          dataHours === startHours &&
          dataMinutes === startMinutes &&
          dataSeconds < startSeconds
        ) {
          data.setSeconds(startSeconds);
          this.adjustSpinner('seconds', startSeconds, 120);
        }
        if (dataHours === endHours && dataMinutes > endMinutes) {
          data.setMinutes(endMinutes);
          this.adjustSpinner('minutes', endMinutes, 120);
          data.setSeconds(endSeconds);
          this.adjustSpinner('seconds', endSeconds, 120);
        } else if (
          dataHours === endHours &&
          dataMinutes === endMinutes &&
          dataSeconds > endSeconds
        ) {
          data.setSeconds(endSeconds);
          this.adjustSpinner('seconds', endSeconds, 120);
        }
      }
      this.$emit('change', data);
    },

    handleClick(type, { value, disabled, active }) {
      if (!disabled) {
        if (type === 'hours') {
          if (isDate(this.internalDate)) {
            const hours = modifyTime(
              this.internalDate,
              value,
              this.minutes,
              this.seconds
            );
            if (hours.getHours() !== value) {
              this.$message({
                message: this.t('el.datepicker.dstInfo'),
                type: 'info'
              });
            }
            value = hours.getHours();
          }
        }
        this.modifyDateField(type, value);
        this.$nextTick(() => {
          this.adjustSpinner('hours', this.hours, 120);
          this.adjustSpinner('minutes', this.minutes, 120);
          this.adjustSpinner('seconds', this.seconds, 120);
          this.emitSelectRange(type);
        });
      }
    },

    emitSelectRange(type) {
      if (this.visible) {
        if (type === 'hours') {
          this.$emit('select-range', 0, 2);
        } else if (type === 'minutes') {
          this.$emit('select-range', 3, 5);
        } else if (type === 'seconds') {
          this.$emit('select-range', 6, 8);
        }
        this.currentScrollbar = type;
      }
    },

    // NOTE: used by datetime / date-range panel
    //       renamed from adjustScrollTop
    //       should try to refactory it
    adjustSpinners() {
      this.adjustSpinner('hours', this.hours);
      this.adjustSpinner('minutes', this.minutes);
      this.adjustSpinner('seconds', this.seconds);
    },

    adjustCurrentSpinner(type) {
      this.adjustSpinner(type, this[type], 120);
    },

    adjustSpinner(type, value, duration = 0) {
      if (this.arrowControl) return;
      const el = this.$refs[type];
      if (el) {
        el.setScroll(value * this.typeItemHeight(type), 0, duration);
      }
    },

    scrollDown(step) {
      if (!this.currentScrollbar) {
        this.emitSelectRange('hours');
      }

      const label = this.currentScrollbar;
      const hoursList = this.hoursList;
      let now = this[label];
      // HUI fix circulation
      if (this.currentScrollbar === 'hours') {
        if (now === 0 && step < 0) {
          return;
        } else if (now === 23 && step > 0) {
          return;
        }
      } else {
        if (now === 0 && step < 0) {
          return;
        } else if (now === 59 && step > 0) {
          return;
        }
      }
      if (this.currentScrollbar === 'hours') {
        let total = Math.abs(step);
        step = step > 0 ? 1 : -1;
        let length = hoursList.length;
        while (length-- && total) {
          now = (now + step + hoursList.length) % hoursList.length;
          if (hoursList[now]) {
            continue;
          }
          total--;
        }
        if (hoursList[now]) return;
      } else {
        now = (now + step + 60) % 60;
      }

      this.modifyDateField(label, now);
      this.adjustSpinner(label, now);
      this.$nextTick(() => {
        this.emitSelectRange(this.currentScrollbar);
      });
    },
    amPm(hour) {
      const shouldShowAmPm = this.amPmMode.toLowerCase() === 'a';
      if (!shouldShowAmPm) return '';
      const isCapital = this.amPmMode === 'A';
      let content = hour < 12 ? ' am' : ' pm';
      if (isCapital) content = content.toUpperCase();
      return content;
    },
    typeItemHeight(type) {
      return this.$refs[type].$el.querySelector('li').offsetHeight;
    },
    scrollBarHeight(type) {
      return this.$refs[type].$el.offsetHeight;
    }
  }
};
</script>

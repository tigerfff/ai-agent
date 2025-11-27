<template>
  <el-input
    v-if="!ranged"
    ref="reference"
    v-clickoutside="handleClose"
    :class="'el-date-editor--' + type"
    :readonly="!editable || readonly || type === 'dates'"
    :disabled="pickerDisabled"
    :size="pickerSize"
    :name="name"
    :placeholder="placeholder"
    :value="displayValue"
    :title="displayValue"
    :validate-event="false"
    v-bind="firstInputId"
    class="el-date-editor"
    maxlength="20"
    @mouseenter.native="handleMouseEnter"
    @mouseleave.native="showClose = false"
    @focus="handleFocus"
    @keydown.native="handleKeydown"
    @change.native="handleChange"
    @input.native="handleInput"
  >
    <i
      slot="suffix"
      :class="[showClose ? clearIcon : triggerClass]"
      class="el-input__icon el-date-editor__icon"
      @click="handleClickSuffixIcon"
    />
  </el-input>
  <div
    v-else
    ref="reference"
    v-clickoutside="handleClose"
    :class="[
      'el-date-editor--' + type,
      pickerSize ? `el-date-editor--${pickerSize}` : '',
      pickerDisabled ? 'is-disabled' : '',
      pickerVisible ? 'is-active' : ''
    ]"
    :title="displayTitle"
    class="el-date-editor el-range-editor el-input__inner"
    @click="handleFocus"
    @keydown="handleKeydown"
    @mouseenter="handleMouseEnter"
    @mouseleave="showClose = false"
  >
    <input
      :placeholder="startPlaceholder"
      :value="displayValue && displayValue[0]"
      :disabled="pickerDisabled"
      v-bind="firstInputId"
      :readonly="!editable || readonly"
      :name="name && name[0]"
      autocomplete="off"
      class="el-range-input"
      @input="handleStartInput"
      @change="handleStartChange"
      @focus="handleFocus"
    />
    <slot name="range-separator">
      <span class="el-range-separator">{{ rangeSeparator }}</span>
    </slot>
    <input
      :placeholder="endPlaceholder"
      :value="displayValue && displayValue[1]"
      :disabled="pickerDisabled"
      v-bind="secondInputId"
      :readonly="!editable || readonly"
      :name="name && name[1]"
      autocomplete="off"
      class="el-range-input"
      @input="handleEndInput"
      @change="handleEndChange"
      @focus="handleFocus"
    />
    <span class="el-input__suffix">
      <span class="el-input__suffix-inner">
        <i
          :class="[showClose ? clearIcon : triggerClass]"
          class="el-input__icon el-range__icon el-date-editor__icon"
          @click="handleClickSuffixIcon"
        />
      </span>
    </span>
  </div>
</template>

<script>
import Vue from 'vue';
import Clickoutside from 'hui/src/utils/clickoutside';
import {
  modifyDate,
  isDateObject,
  dateValidator,
  isString,
  isEmpty,
  toDate,
  parseAsFormatAndType,
  formatAsFormatAndType,
  DEFAULT_FORMATS,
  TYPE_VALUE_RESOLVER_MAP,
  formatSpecial
} from './util';
import { hasOwn } from 'hui/src/utils/util';
import Popper from 'hui/src/utils/vue-popper';
import Emitter from 'hui/src/mixins/emitter';
import ElInput from 'hui/packages/input';
import merge from 'hui/src/utils/merge';

const NewPopper = {
  props: {
    appendToBody: Popper.props.appendToBody,
    offset: Popper.props.offset,
    boundariesPadding: Popper.props.boundariesPadding,
    arrowOffset: Popper.props.arrowOffset
  },
  methods: Popper.methods,

  data() {
    return merge({ visibleArrow: false }, Popper.data);
  },
  beforeDestroy: Popper.beforeDestroy
};

const PLACEMENT_MAP = {
  left: 'bottom-start',
  center: 'bottom',
  right: 'bottom-end'
};

const HAVE_TRIGGER_TYPES = [
  'date',
  'datetime',
  'time',
  'time-select',
  'week',
  'month',
  'year',
  'daterange',
  'monthrange',
  'timerange',
  'datetimerange',
  'dates',
  'yearrange'
];

/*
 * Considers:
 *   1. Date object
 *   2. date string
 *   3. array of 1 or 2
 */
const valueEquals = function(a, b) {
  // considers Date object and string
  const dateEquals = function(a, b) {
    const aIsDate = a instanceof Date;
    const bIsDate = b instanceof Date;
    if (aIsDate && bIsDate) {
      return a.getTime() === b.getTime();
    }
    if (!aIsDate && !bIsDate) {
      return a === b;
    }
    return false;
  };

  const aIsArray = a instanceof Array;
  const bIsArray = b instanceof Array;
  if (aIsArray && bIsArray) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => dateEquals(item, b[index]));
  }
  if (!aIsArray && !bIsArray) {
    return dateEquals(a, b);
  }
  return false;
};

const stringValidator = function(val) {
  // either: String, Array of String, null / undefined
  return (
    isEmpty(val) ||
    isString(val) ||
    (Array.isArray(val) && val.length === 2 && val.every(isString))
  );
};

export default {
  components: { ElInput },

  directives: { Clickoutside },
  mixins: [Emitter, NewPopper],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },

  props: {
    size: {
      type: String,
      default: null
    },
    format: {
      type: String,
      default: null
    },
    valueFormat: {
      type: String,
      default: null
    },
    readonly: {
      type: Boolean,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    startPlaceholder: {
      type: String,
      default: null
    },
    endPlaceholder: {
      type: String,
      default: null
    },
    prefixIcon: {
      type: String,
      default: null
    },
    clearIcon: {
      type: String,
      default: 'h-icon-close_f'
    },
    id: {
      default: '',
      validator: stringValidator
    },
    name: {
      default: '',
      validator: stringValidator
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    popperClass: {
      type: String,
      default: null
    },
    editable: {
      type: Boolean,
      default: true
    },
    align: {
      type: String,
      default: 'left'
    },
    value: {
      default: null,
      validator: dateValidator
    },
    defaultValue: {
      default: null,
      validator: dateValidator
    },
    defaultTime: {
      default: null,
      validator: dateValidator
    },
    rangeSeparator: { type: String, default: '-' },
    pickerOptions: {
      type: Object,
      default: () => {}
    },
    unlinkPanels: {
      type: Boolean,
      default: true
    },
    unlinkRange: {
      type: Boolean,
      default: true
    },
    validateEvent: {
      type: Boolean,
      default: true
    },
    unlink: {
      type: Boolean,
      default: null
    },
    calendarType: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      pickerVisible: false,
      showClose: false,
      userInput: null,
      valueOnOpen: null, // value when picker opens, used to determine whether to emit change
      unwatchPickerOptions: null,
      changeInput: true,
      preConfirmValue: null,
      calcValue: null
    };
  },

  computed: {
    ranged() {
      return this.type.indexOf('range') > -1;
    },

    refInput() {
      if (this.reference) {
        return [].slice.call(this.reference.querySelectorAll('input'));
      }
      return [];
    },

    valueIsEmpty() {
      const val = this.value;
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length; i < len; i++) {
          if (val[i]) {
            return false;
          }
        }
      } else {
        if (val) {
          return false;
        }
      }
      return true;
    },

    triggerClass() {
      return (
        this.prefixIcon ||
        (this.type === 'time' ||
        this.type === 'time-select' ||
        this.type === 'timerange'
          ? 'h-icon-clock'
          : 'h-icon-calendar')
      );
    },

    selectionMode() {
      if (this.type === 'week') {
        return 'week';
      } else if (this.type === 'month') {
        return 'month';
      } else if (this.type === 'year') {
        return 'year';
      } else if (this.type === 'dates') {
        return 'dates';
      }

      return 'day';
    },

    haveTrigger() {
      if (typeof this.showTrigger !== 'undefined') {
        return this.showTrigger;
      }
      return HAVE_TRIGGER_TYPES.indexOf(this.type) !== -1;
    },

    displayValue() {
      let formattedValue = formatAsFormatAndType(
        this.preConfirmValue,
        this.format,
        this.type
      );
      // special date(th、niboer)
      if (this.calendarType === 'th' || this.calendarType === 'np') {
        formattedValue = formatSpecial(
          formattedValue,
          this.format,
          this.type,
          this.calendarType
        );
      }
      const userInput = this.userInput;
      const isTrueValue = () => {
        if (
          Array.isArray(formattedValue) &&
          !isEmpty(formattedValue[0]) &&
          !isEmpty(formattedValue[1])
        ) {
          return true;
        }
        return !isEmpty(formattedValue);
      };
      if (Array.isArray(userInput) && isTrueValue()) {
        return [
          userInput[0] || (formattedValue && formattedValue[0]) || '',
          userInput[1] || (formattedValue && formattedValue[1]) || ''
        ];
      } else if (userInput) {
        return userInput;
      } else if (isTrueValue()) {
        return this.type === 'dates'
          ? formattedValue.join(', ')
          : formattedValue;
      } else {
        return '';
      }
    },

    displayTitle() {
      const displayValue = this.displayValue;
      return displayValue === ''
        ? ''
        : `${displayValue && displayValue[0]} ${
            this.rangeSeparator
          } ${displayValue && displayValue[1]}`;
    },

    parsedValue() {
      if (!this.calcValue) return this.calcValue; // component value is not set
      if (this.type === 'time-select') {
        // time-select does not require parsing, this might change in next major version
        return this.value.length !== 5 ? this.calcValue : this.value;
      }
      const valueIsDateObject =
        isDateObject(this.calcValue) ||
        (Array.isArray(this.calcValue) && this.calcValue.every(isDateObject));
      if (valueIsDateObject) {
        return this.calcValue;
      }
      if (this.valueFormat) {
        const formatValue = parseAsFormatAndType(
          this.calcValue,
          this.valueFormat,
          this.type,
          this.rangeSeparator
        );
        if (!isEmpty(formatValue)) {
          return formatValue;
        } else {
          return this.calcValue;
        }
      }
      // NOTE: deal with common but incorrect usage, should remove in next major version
      // user might provide string / timestamp without value-format, coerce them into date (or array of date)
      return Array.isArray(this.calcValue)
        ? this.calcValue.map(val => toDate(val))
        : toDate(this.calcValue);
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },

    pickerSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },

    pickerDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },

    firstInputId() {
      const obj = {};
      let id;
      if (this.ranged) {
        id = this.id && this.id[0];
      } else {
        id = this.id;
      }
      if (id) obj.id = id;
      return obj;
    },

    secondInputId() {
      const obj = {};
      let id;
      if (this.ranged) {
        id = this.id && this.id[1];
      }
      if (id) obj.id = id;
      return obj;
    }
  },

  watch: {
    pickerVisible(val) {
      if (this.readonly || this.pickerDisabled) return;
      if (val) {
        this.showPicker();
        this.valueOnOpen = Array.isArray(this.value)
          ? [...this.value]
          : this.value;
      } else {
        this.hidePicker();
        this.userInput = null;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur');
        }
        this.$emit(
          'blur',
          this.formatToValue(this.calcValue),
          this.displayValue
        );
        this.blur();
      }
    },
    parsedValue: {
      immediate: true,
      handler(val) {
        if (this.picker && val) {
          this.picker.value = val;
        }
      }
    },
    defaultValue(val) {
      // NOTE: should eventually move to jsx style picker + panel ?
      if (this.picker) {
        this.picker.defaultValue = val;
      }
    },
    value(val, oldVal) {
      if (
        !valueEquals(val, oldVal) &&
        !this.pickerVisible &&
        this.validateEvent
      ) {
        this.dispatch('ElFormItem', 'el.form.change', val);
        if (!valueEquals(this.formatToValue(this.preConfirmValue), val)) {
          this.preConfirmValue = val;
        }
        if (!valueEquals(this.formatToValue(this.calcValue), val)) {
          this.calcValue = val;
        }
      }
    },
    preConfirmValue(val, oldVal) {
      if (!valueEquals(val, this.value)) {
        this.$emit('input', this.formatToValue(val), this.displayValue);
      }
    },
    calcValue(val, oldVal) {
      if (
        !valueEquals(val, this.preConfirmValue) &&
        this.isValidValue(val) &&
        this.pickerVisible
      ) {
        // calcValue变化时不触发el.form.change事件(@param doNotValid为true)，只在pick时触发
        this.emitChange(val, false, true);
      }
    }
  },
  created() {
    // init
    const { value: val, type } = this;
    if (typeof val === 'number') {
      this.calcValue = new Date(val);
    } else if (
      typeof val === 'string' &&
      val.length > 0 &&
      (type.includes('date') ||
        type.includes('month') ||
        type.includes('year') ||
        type.includes('week'))
    ) {
      // 可能会导致面板初始化不渲染的问题
      this.calcValue = val ? new Date(val) : new Date();
    } else {
      this.calcValue = val;
    }
    this.preConfirmValue = val;
    // vue-popper
    this.popperOptions = {
      boundariesPadding: 0,
      gpuAcceleration: false
    };
    this.placement = PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left;
    this.$on('fieldReset', this.handleFieldReset);
  },
  mounted() {
    this.setReference();
  },
  methods: {
    setReference() {
      const reference = this.$refs.reference;
      this.reference = reference.$el || reference;
    },

    // replaceDate(value) {
    //   return value.replace(/-/g, '/');
    // },

    focus() {
      if (window) {
        window.focus();
      }
      this.handleFocus();
      this.refInput[0].focus();
    },

    blur() {
      this.refInput.forEach(input => input.blur());
    },

    formatToValue(value) {
      if (typeof value === 'number') {
        value = new Date(value);
      }
      if (isEmpty(value)) {
        return '';
      }
      const isParsed =
        isDateObject(value) ||
        (Array.isArray(value) && value.every(isDateObject));
      if (this.valueFormat && isParsed) {
        const formatValue = formatAsFormatAndType(
          value,
          this.valueFormat,
          this.type
        );
        return isEmpty(formatValue) ? value : formatValue;
      } else {
        return value;
      }
    },

    // {parse, formatTo} String deals with user input
    parseString(value) {
      const type = Array.isArray(value)
        ? this.type
        : this.type.replace('range', '');
      return parseAsFormatAndType(value, this.format, type);
    },

    formatToString(value) {
      const type = Array.isArray(value)
        ? this.type
        : this.type.replace('range', '');
      return formatAsFormatAndType(value, this.format, type);
    },

    handleMouseEnter() {
      if (this.readonly || this.pickerDisabled) return;
      if (!this.valueIsEmpty && this.clearable) {
        this.showClose = true;
      }
    },

    handleInput(event) {
      const val = event.target.value;
      this.$nextTick(() => {
        this.userInput = val;
        if (val && this.picker) {
          const parseDate = this.parseString(val);
          if (parseDate) {
            this.picker.value = parseDate;
            if (this.isValidValue(parseDate)) {
              this.emitInput(parseDate);
            }
          }
        }
      });
    },

    handleChange(event) {
      const val = event.target.value;
      this.userInput = val;
    },

    handleStartInput(event) {
      const val = event.target.value;
      const preConfirmValue = this.preConfirmValue && this.preConfirmValue[0];
      const parseValue = this.parseString(val);
      const isTimerange = this.type === 'timerange';
      if (parseValue && this.picker) {
        const value = isTimerange
          ? modifyDate(
              parseValue,
              preConfirmValue.getFullYear(),
              preConfirmValue.getMonth(),
              preConfirmValue.getDate()
            )
          : parseValue;
        const newValue = [value, this.picker.value && this.picker.value[1]];
        this.picker.value = newValue;
        if (this.isValidValue(newValue)) {
          this.emitInput(newValue);
        }
      }
    },

    handleEndInput(event) {
      const val = event.target.value;
      const preConfirmValue = this.preConfirmValue && this.preConfirmValue[1];
      const parseValue = this.parseString(val);
      const isTimerange = this.type === 'timerange';
      if (parseValue && this.picker) {
        const value = isTimerange
          ? modifyDate(
              parseValue,
              preConfirmValue.getFullYear(),
              preConfirmValue.getMonth(),
              preConfirmValue.getDate()
            )
          : parseValue;
        const newValue = [this.picker.value && this.picker.value[0], value];
        this.picker.value = newValue;
        if (this.isValidValue(newValue)) {
          this.emitInput(newValue);
        }
      }
    },

    handleStartChange(event) {
      const val = event.target.value;
      if (this.userInput) {
        this.userInput = [val, this.userInput[1]];
      } else {
        this.userInput = [val, null];
      }
    },

    handleEndChange(event) {
      const val = event.target.value;
      if (this.userInput) {
        this.userInput = [this.userInput[0], val];
      } else {
        this.userInput = [null, val];
      }
    },

    handleClickSuffixIcon(event) {
      if (this.showClose) {
        this.handleClickIcon(event);
      } else {
        this.handleFocus();
      }
    },

    handleClickIcon(event) {
      if (this.readonly || this.pickerDisabled) return;
      this.valueOnOpen = this.value;
      event.stopPropagation();
      this.emitInput(null);
      this.showClose = false;
      if (this.picker && typeof this.picker.handleClear === 'function') {
        this.picker.handleClear();
      }
    },

    handleClose() {
      if (!this.pickerVisible) return;
      this.pickerVisible = false;
    },

    handleFieldReset(initialValue) {
      this.userInput = initialValue === '' ? null : initialValue;
    },

    handleFocus() {
      if (!this.editable) {
        this.blur();
      }
      const type = this.type;

      if (HAVE_TRIGGER_TYPES.indexOf(type) !== -1 && !this.pickerVisible) {
        this.pickerVisible = true;
      }
      this.$emit(
        'focus',
        this.formatToValue(this.calcValue),
        this.displayValue
      );
    },

    handleKeydown(event) {
      const keyCode = event.keyCode;
      // ESC
      if (keyCode === 27) {
        this.pickerVisible = false;
        event.stopPropagation();
        return;
      }

      // Tab
      if (keyCode === 9) {
        if (!this.ranged) {
          this.pickerVisible = this.picker.visible = false;
          this.blur();
          event.stopPropagation();
        } else {
          // user may change focus between two input
          setTimeout(() => {
            if (this.refInput.indexOf(document.activeElement) === -1) {
              this.pickerVisible = false;
              this.blur();
              event.stopPropagation();
            }
          }, 0);
        }
        return;
      }

      // Enter
      if (keyCode === 13) {
        if (
          this.userInput === '' ||
          this.isValidValue(this.parseString(this.displayValue))
        ) {
          this.pickerVisible = this.picker.visible = false;
          this.blur();
        }
        event.stopPropagation();
        return;
      }

      if (this.refInput[0] === document.activeElement) {
        event.stopPropagation();
        return;
      }

      // delegate other keys to panel
      if (this.picker && this.picker.handleKeydown) {
        this.picker.handleKeydown(event);
      }
    },

    hidePicker() {
      if (this.picker) {
        let emitValue;
        if (this.userInput === '') {
          emitValue = null;
        } else if (!this.userInput && this.picker.unlink) {
          this.calcValue = this.preConfirmValue;
          emitValue = this.calcValue;
        } else {
          this.preConfirmValue = this.calcValue;
          emitValue = this.preConfirmValue;
        }
        this.emitInput(emitValue);
        this.pickerVisible = false;
        this.picker.visible = false;
        this.destroyPopper();
      }
    },

    showPicker() {
      if (this.$isServer) return;
      this.setReference();
      if (!this.picker) {
        this.mountPicker();
      }
      this.$nextTick(() => {
        this.picker.value = this.parsedValue;
        this.resetView();
        this.pickerVisible = true;
        this.picker.visible = true;
        this.updatePopper();
        this.picker.adjustSpinners && this.picker.adjustSpinners();
      });
    },

    mountPicker() {
      const specialUnlinkTypes = ['year', 'month', 'time'];
      this.picker = new Vue(this.panel).$mount();
      if (Object.keys(this.$slots).length) {
        this.picker.$slots = this.$slots;
      }
      if (Object.keys(this.$scopedSlots).length) {
        this.picker.$scopedSlots = this.$scopedSlots;
      }
      this.picker.defaultValue = this.defaultValue;
      this.picker.defaultTime = this.defaultTime;
      this.picker.popperClass = this.popperClass;
      this.popperElm = this.picker.$el;
      this.picker.width = this.reference.getBoundingClientRect().width;
      this.picker.showTime =
        this.type === 'datetime' || this.type === 'datetimerange';
      this.picker.type = this.type;
      this.picker.selectionMode = this.selectionMode;
      this.picker.unlinkPanels = this.unlinkPanels;
      this.picker.arrowControl =
        this.arrowControl || this.timeArrowControl || false;
      if (this.compareTimes && this.isRange) {
        this.picker.compareTimesFunc = this.compareTimes;
      }
      // HUI custom
      this.picker.unlink =
        this.unlink === null
          ? !specialUnlinkTypes.includes(this.type)
          : this.unlink;
      this.picker.unlinkRange = this.unlinkRange;
      this.picker.isRange = this.isRange;
      this.picker.startPlaceholder = this.startPlaceholder;
      this.picker.endPlaceholder = this.endPlaceholder;
      this.picker.displayValue = this.displayValue;
      this.picker.calendarType = this.calendarType;
      this.$watch('format', format => {
        this.picker.format = format;
      });

      const updateOptions = () => {
        const options = this.pickerOptions;
        if (options && options.selectableRange) {
          let ranges = options.selectableRange;
          const parser = TYPE_VALUE_RESOLVER_MAP.datetimerange.parser;
          const format = DEFAULT_FORMATS.timerange;

          ranges = Array.isArray(ranges) ? ranges : [ranges];
          this.picker.selectableRange = ranges.map(range =>
            parser(range, format, this.rangeSeparator)
          );
        }

        for (const option in options) {
          if (
            hasOwn(options, option) &&
            // 忽略 time-picker 的该配置项
            option !== 'selectableRange'
          ) {
            this.picker[option] = options[option];
          }
        }

        // main format must prevail over undocumented pickerOptions.format
        if (this.format) {
          this.picker.format = this.format;
        }
      };
      updateOptions();
      this.unwatchPickerOptions = this.$watch(
        'pickerOptions',
        () => updateOptions(),
        {
          deep: true
        }
      );
      this.$el.appendChild(this.picker.$el);
      this.picker.$on('dodestroy', this.doDestroy);
      this.picker.$on('pick', (date = '', visible = false, changeInput) => {
        this.calcValue = date;
        if (changeInput !== undefined) {
          this.changeInput = changeInput;
        } else {
          this.changeInput = !visible;
        }
        if (this.changeInput) {
          this.emitChange(date);
        }
        if (!visible || this.changeInput) {
          this.emitInput(date);
        }
        this.picker.visible = visible;
        this.pickerVisible = visible;
      });
      this.picker.$on('select-range', (start, end, pos) => {
        if (this.refInput.length === 0 || !this.pickerVisible) return;
        if (!pos || pos === 'min') {
          this.refInput[0].setSelectionRange(start, end);
          this.refInput[0].focus();
        } else if (pos === 'max') {
          this.refInput[1].setSelectionRange(start, end);
          this.refInput[1].focus();
        }
      });
    },

    unmountPicker() {
      if (this.picker) {
        this.picker.$destroy();
        this.picker.$off();
        this.doDestroy();
        if (typeof this.unwatchPickerOptions === 'function') {
          this.unwatchPickerOptions();
        }
        this.picker.$el.parentNode.removeChild(this.picker.$el);
      }
    },

    emitChange(val, forceEmit, doNotValid) {
      // determine user real change only
      if (
        (!valueEquals(val, this.preConfirmValue) &&
          !valueEquals(val, this.valueOnOpen)) ||
        forceEmit
      ) {
        this.$emit('change', this.formatToValue(val), this.displayValue);
        this.valueOnOpen = val;
        if (this.validateEvent && !doNotValid) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
      }
    },

    emitInput(val) {
      this.userInput = null;
      if (!valueEquals(this.preConfirmValue, val)) {
        this.calcValue = val;
        this.preConfirmValue = val;
      }
    },

    isValidValue(value) {
      if (!this.picker) {
        this.mountPicker();
      }
      if (this.picker.isValidValue) {
        return value && this.picker.isValidValue(value);
      } else {
        return true;
      }
    },

    resetView() {
      this.picker.resetView && this.picker.resetView();
    }
  }
};
</script>

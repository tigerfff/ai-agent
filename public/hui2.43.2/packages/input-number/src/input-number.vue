<template>
  <div
    :class="[
      'el-input-number',
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]"
    @dragstart.prevent
  >
    <el-button
      v-if="controls"
      v-repeat-click="decrease"
      :disabled="disabled"
      :class="{ 'is-disabled': minDisabled }"
      icon="h-icon-angle_down"
      size="mini"
      class="el-decrease  el-input-number__decrease "
      @keydown.enter="decrease"
    />
    <el-button
      v-if="controls"
      v-repeat-click="increase"
      :disabled="disabled"
      :class="{ 'is-disabled': maxDisabled }"
      icon="h-icon-angle_up"
      size="mini"
      class="el-increase el-input-number__increase"
      @keydown.enter="increase"
    />
    <el-input
      ref="input"
      v-bind="$attrs"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :name="name"
      :label="label"
      @keydown.up.native.prevent="increase"
      @keydown.down.native.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
      @change="handleInputChange"
    >
      <template v-if="$slots.suffix" slot="suffix">
        <slot name="suffix" />
      </template>
    </el-input>
  </div>
</template>
<script>
import ElInput from 'hui/packages/input';
import RepeatClick from 'hui/src/directives/repeat-click';
export default {
  name: 'ElInputNumber',
  directives: {
    repeatClick: RepeatClick
  },
  components: {
    ElInput
  },
  inheritAttrs: false,
  props: {
    step: {
      type: Number,
      default: 1
    },
    stepStrictly: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: Infinity
    },
    min: {
      type: Number,
      default: 0
    },
    value: {
      type: null,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: ''
    },
    controls: {
      type: Boolean,
      default: true
    },
    controlsPosition: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    precision: {
      type: Number,
      validator(val) {
        return val >= 0 && val === parseInt(val, 10);
      },
      default: 0
    },
    resetNum: {
      type: [Number, String, null],
      default: null
    }
  },
  data() {
    return {
      currentValue: 0,
      userInput: null
    };
  },
  computed: {
    // 最小值时禁用decrease按钮
    minDisabled() {
      return this.value <= this.min;
      // return this._decrease(this.value, this.step) < this.min;
    },
    // 最大值时禁用increase按钮
    maxDisabled() {
      // return this._increase(this.value, this.step) > this.max;
      return this.value >= this.max;
    },
    // 精度
    numPrecision() {
      const { value, step, getPrecision, precision } = this;
      const stepPrecision = getPrecision(step);
      if (precision !== undefined) {
        // 如果步长的小数位比 value的小数位数还长，警告并返回vaulue小数位
        if (stepPrecision > precision) {
          console.warn(
            '[HUI Warn][InputNumber]precision should not be less than the decimal places of step'
          );
        }
        return precision;
      } else {
        // 步长精度和value精度，返回更精准的
        return Math.max(getPrecision(value), stepPrecision);
      }
    },
    controlsAtRight() {
      return this.controls && this.controlsPosition === 'right';
    },
    inputNumberSize() {
      return this.size;
    },
    inputNumberDisabled() {
      return this.disabled;
    },
    // 显示的值
    displayValue() {
      if (this.userInput !== null && this.userInput !== '') {
        return this.userInput;
      }

      let currentValue = this.currentValue;
      if (typeof currentValue === 'number') {
        if (this.stepStrictly) {
          const stepPrecision = this.getPrecision(this.step);
          const precisionFactor = Math.pow(10, stepPrecision);
          currentValue =
            (Math.round(currentValue / this.step) *
              precisionFactor *
              this.step) /
            precisionFactor;
        }
        // 修正小数点位数
        if (this.precision !== undefined) {
          currentValue = currentValue.toFixed(this.precision);
        }
      }
      return currentValue;
    }
  },
  watch: {
    // 传入的值
    value: {
      immediate: true,
      handler(value) {
        let newVal =
          value === undefined || value === '' ? value : Number(value);

        if (typeof newVal === 'number') {
          if (isNaN(newVal)) {
            return;
          }
          if (this.stepStrictly) {
            const stepPrecision = this.getPrecision(this.step);
            const precisionFactor = Math.pow(10, stepPrecision);
            newVal =
              (Math.round(newVal / this.step) * precisionFactor * this.step) /
              precisionFactor;
          }
          if (this.precision !== undefined) {
            newVal = this.toPrecision(newVal, this.precision);
          }
        }
        if (typeof newVal === 'number') {
          if (newVal >= this.max) newVal = this.max;
          if (newVal <= this.min) newVal = this.min;
        }
        this.currentValue = newVal;
        // this.userInput = null;
        this.$emit('input', newVal);
      }
    }
  },
  mounted() {
    const innerInput = this.$refs.input.$refs.input;
    innerInput.setAttribute('role', 'spinbutton');
    innerInput.setAttribute('aria-valuemax', this.max);
    innerInput.setAttribute('aria-valuemin', this.min);
    innerInput.setAttribute('aria-valuenow', this.currentValue);
    innerInput.setAttribute('aria-disabled', this.inputNumberDisabled);
  },
  updated() {
    if (!this.$refs || !this.$refs.input) return;
    const innerInput = this.$refs.input.$refs.input;
    innerInput.setAttribute('aria-valuenow', this.currentValue);
  },
  methods: {
    // 转化精度
    toPrecision(num, precision) {
      if (precision === undefined) precision = this.numPrecision;
      return parseFloat(
        Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision)
      );
    },
    // 计算精度
    getPrecision(value) {
      if (value === undefined) return 0;
      const valueString = value.toString();
      const dotPosition = valueString.indexOf('.');
      let precision = 0;
      // 计算小数点后有几位
      if (dotPosition !== -1) {
        precision = valueString.length - dotPosition - 1;
      }
      return precision;
    },
    _increase(val, step) {
      if (typeof val !== 'number' && val !== undefined)
        return this.currentValue;
      const precisionFactor = Math.pow(10, this.numPrecision);
      // Solve the accuracy problem of JS decimal calculation by converting the value to integer.
      return this.toPrecision(
        (precisionFactor * val + precisionFactor * step) / precisionFactor
      );
    },
    _decrease(val, step) {
      if (typeof val !== 'number' && val !== undefined)
        return this.currentValue;
      const precisionFactor = Math.pow(10, this.numPrecision);
      return this.toPrecision(
        (precisionFactor * val - precisionFactor * step) / precisionFactor
      );
    },
    increase() {
      if (this.inputNumberDisabled || this.maxDisabled) return;
      this.userInput = null;
      const value = this.value || 0;
      const newVal = this._increase(value, this.step);
      this.setCurrentValue(newVal);
    },
    decrease() {
      if (this.inputNumberDisabled || this.minDisabled) return;
      this.userInput = null;
      const value = this.value || 0;
      const newVal = this._decrease(value, this.step);
      this.setCurrentValue(newVal);
    },
    handleBlur(event) {
      this.userInput = null;
      let newVal = event.target.value;
      // 如果用户什么都没有输入，默认用resetNum xx
      if (newVal.trim() === '') {
        newVal = this.resetNum === null ? '' : this.resetNum;
      }

      // 如果转换结果是 NaN（不是一个有效的数字）则判断为0或者是resetNum
      newVal = isNaN(Number(newVal))
        ? this.resetNum === null
          ? 0
          : this.resetNum
        : Number(newVal);

      // 加入精度和最大小值的判断
      if (this.precision !== undefined) {
        newVal = this.toPrecision(newVal, this.precision);
      }
      if (typeof newVal === 'number') {
        if (newVal >= this.max) newVal = this.max;
        if (newVal <= this.min) newVal = this.min;
      }
      this.setCurrentValue(newVal);
      this.$emit('blur', event);
    },
    handleFocus(event) {
      this.$emit('focus', event);
    },
    setCurrentValue(newVal) {
      const oldVal = this.currentValue;

      if (oldVal === newVal) return;
      // this.userInput = null;
      this.$emit('input', newVal);
      this.$emit('change', newVal, oldVal);
      this.currentValue = newVal;
    },
    handleInput(value) {
      this.userInput = value;
    },
    handleInputChange(value) {
      const newVal = Number(value);

      if (!isNaN(newVal) && !isNaN(parseFloat(value))) {
        this.setCurrentValue(newVal);
      } else {
        this.currentValue = value;
      }
      // this.userInput = null;
    }
  }
};
</script>

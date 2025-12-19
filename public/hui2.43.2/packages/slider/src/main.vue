<template>
  <div
    ref="sliderContainer"
    :class="{
      'is-vertical': vertical,
      'el-slider--with-input': showInput,
      'el-slider--with-button': internalShowButton
    }"
    class="el-slider"
  >
    <el-input-number
      v-if="showInput && !range"
      ref="input"
      v-model="firstValue"
      v-bind="$attrs"
      :step="step"
      :disabled="disabled"
      :controls="showInputControls"
      :min="min"
      :max="max"
      class="el-slider__input"
      :precision="precision"
      @blur="handleBlur"
    />
    <el-button
      v-if="internalShowButton"
      v-repeat-click="onFirstButtonClick"
      :icon="`h-icon-${vertical ? 'add' : 'minus'}`"
    />
    <div
      ref="slider"
      :class="{
        'show-input': showInput && !range,
        'show-button': internalShowButton,
        disabled: disabled
      }"
      :style="runwayStyle"
      class="el-slider__runway"
    >
      <div class="el-slider__runway-click-area" @click="onSliderClick" />
      <div :style="barStyle" class="el-slider__bar" />
      <slider-button
        ref="button1"
        v-model="firstValue"
        :vertical="vertical"
        @slider-click-value-change="sliderClickValueChange"
        @drag-end="dragEnd"
        @button-down="buttonDown(sliderInput)"
      />
      <slider-button
        v-if="range"
        ref="button2"
        v-model="secondValue"
        :vertical="vertical"
        @drag-end="dragEnd"
        @button-down="buttonDown(sliderInput2)"
      />
      <div v-if="showStops">
        <template v-for="(item, index) in stops">
          <div :key="index" class="el-slider__stop-wrap">
            <div
              :style="
                vertical
                  ? { bottom: item.stepWidth + '%' }
                  : { left: item.stepWidth + '%' }
              "
              class="el-slider__stop el-slider__stop--top el-slider__stop--left"
            />
            <div
              :style="
                vertical
                  ? { bottom: item.stepWidth + '%' }
                  : { left: item.stepWidth + '%' }
              "
              class="el-slider__stop el-slider__stop--bottom el-slider__stop--right"
            />
            <div
              v-show="showStopsNumber"
              :style="
                vertical
                  ? { bottom: item.stepWidth + '%' }
                  : { left: item.stepWidth + '%' }
              "
              class="el-slider__mark"
            >
              {{ item.stepValue }}
            </div>
          </div>
        </template>
      </div>
    </div>
    <el-button
      v-if="internalShowButton"
      v-repeat-click="onSecondButtonClick"
      :icon="`h-icon-${vertical ? 'minus' : 'add'}`"
    />
  </div>
</template>

<script type="text/babel">
import Vue from 'vue';
import ElInputNumber from 'hui/packages/input-number';
import SliderButton from './button.vue';
import SliderInput from './input.vue';
import Emitter from 'hui/src/mixins/emitter';
import RepeatClick from 'hui/src/directives/repeat-click';

export default {
  name: 'ElSlider',

  components: {
    ElInputNumber,
    SliderButton
  },
  directives: {
    RepeatClick
  },
  mixins: [Emitter],

  props: {
    debounce: {
      type: Number,
      default: 300
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    marks: {
      type: [Array, Object],
      default: () => []
    },
    value: {
      type: [Number, Array],
      default: 0
    },
    showInput: {
      type: Boolean,
      default: false
    },
    showButton: {
      type: Boolean,
      default: false
    },
    showInputControls: {
      type: Boolean,
      default: true
    },
    showStops: {
      type: Boolean,
      default: false
    },
    showStopsNumber: {
      type: Boolean,
      default: false
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    formatTooltip: {
      type: Function,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    height: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      firstValue: null,
      secondValue: null,
      oldValue: null,
      dragging: false,
      sliderSize: 1,
      sliderInput: null,
      sliderInput2: null
    };
  },

  computed: {
    stops() {
      const result = [];
      const totalWidth = 100;

      if (
        this.marks.length > 0 ||
        (Object.keys(this.marks) && Object.keys(this.marks).length > 0)
      ) {
        // TODO: 判断数据正确性
        const markObj = Array.isArray(this.marks)
          ? this.marks.reduce((prev, curr) => {
              prev[curr] = curr;
              return prev;
            }, {})
          : this.marks;

        for (const key in markObj) {
          result.push({
            stepWidth: ((key - this.min) * totalWidth) / (this.max - this.min),
            stepValue: markObj[key]
          });
        }
        return result;
      }
      if (this.step === 0) {
        process.env.NODE_ENV !== 'production' &&
          console.warn('[HUI Warn][Slider]step should not be 0.');
        return [];
      }
      const stopCount = (this.max - this.min) / this.step;
      const stepWidth = (totalWidth * this.step) / (this.max - this.min);
      for (let i = 0; i <= stopCount; i++) {
        result.push({
          stepWidth: i * stepWidth,
          stepValue: this.min + i * this.step
        });
      }
      return result;
    },

    minValue() {
      return Math.min(this.firstValue, this.secondValue);
    },

    maxValue() {
      return Math.max(this.firstValue, this.secondValue);
    },

    barSize() {
      return this.range
        ? `${(100 * (this.maxValue - this.minValue)) / (this.max - this.min)}%`
        : `${(100 * (this.firstValue - this.min)) / (this.max - this.min)}%`;
    },

    barStart() {
      return this.range
        ? `${(100 * (this.minValue - this.min)) / (this.max - this.min)}%`
        : '0%';
    },

    precision() {
      const precisions = [this.min, this.max, this.step].map(item => {
        const decimal = ('' + item).split('.')[1];
        return decimal ? decimal.length : 0;
      });
      return Math.max.apply(null, precisions);
    },

    runwayStyle() {
      return this.vertical ? { height: this.height } : {};
    },

    barStyle() {
      return this.vertical
        ? {
            height: this.barSize,
            bottom: this.barStart
          }
        : {
            width: this.barSize,
            left: this.barStart
          };
    },
    internalShowButton() {
      return this.showButton && !this.range && !this.showInput;
    }
  },

  watch: {
    value(val, oldVal) {
      if (
        this.dragging ||
        (Array.isArray(val) &&
          Array.isArray(oldVal) &&
          val.every((item, index) => item === oldVal[index]))
      ) {
        return;
      }
      this.setValues();
    },

    dragging(val) {
      if (!val) {
        this.setValues();
      }
    },

    firstValue(val) {
      if (this.range) {
        this.$emit('input', [this.minValue, this.maxValue]);
      } else {
        this.$emit('input', val);
      }
    },

    secondValue() {
      if (this.range) {
        this.$emit('input', [this.minValue, this.maxValue]);
      }
    },

    min() {
      this.setValues();
    },

    max() {
      this.setValues();
    }
  },

  mounted() {
    if (this.range) {
      if (Array.isArray(this.value)) {
        this.firstValue = Math.max(this.min, this.value[0]);
        this.secondValue = Math.min(this.max, this.value[1]);
      } else {
        this.firstValue = this.min;
        this.secondValue = this.max;
      }
      this.oldValue = [this.firstValue, this.secondValue];
      // 增加范围选择带输入框 add by yangzhini at 2019-4-18
      if (this.showInput) {
        this.sliderInput = this.createInputElement(0);
        this.sliderInput2 = this.createInputElement(1);

        /**
         * modify by taooujing 2023-08-21
         * sliderInput不添加到body层。直接添加在button-wrappwe层。
         * 设置其位置为absoulute;top:-32px;left:-16px;
         *
         * vertical时，位置设置为right:-56px;top:-4px
         */

        this.sliderInput.$el.style.position = 'absolute';
        this.sliderInput2.$el.style.position = 'absolute';

        // button-wrapper绑定了mouseenter，mouseleave，mousedown事件。input-number需要去除这些事件。
        this.sliderInput.$el.addEventListener('mouseenter', e => {
          e.stopPropagation();
        });
        this.sliderInput.$el.addEventListener('mouseleave', e => {
          e.stopPropagation();
        });
        this.sliderInput.$el.addEventListener('mousedown', e => {
          e.stopPropagation();
        });
        this.sliderInput2.$el.addEventListener('mouseenter', e => {
          e.stopPropagation();
        });
        this.sliderInput2.$el.addEventListener('mouseleave', e => {
          e.stopPropagation();
        });
        this.sliderInput2.$el.addEventListener('mousedown', e => {
          e.stopPropagation();
        });

        if (this.vertical) {
          this.sliderInput.$el.style.top = '-4px';
          this.sliderInput.$el.style.right = '-56px';

          this.sliderInput2.$el.style.top = '-4px';
          this.sliderInput2.$el.style.right = '-56px';
          // 设置slider右部padding
          this.$refs.sliderContainer.style.paddingRight = '56px';
        } else {
          this.sliderInput.$el.style.top = '-32px';
          this.sliderInput.$el.style.left = '-16px';
          this.sliderInput.$el.style.zIndex = '10';

          this.sliderInput2.$el.style.top = '-32px';
          this.sliderInput2.$el.style.left = '-16px';
          this.sliderInput.$el.style.zIndex = '11';

          // 设置slider顶部padding
          this.$refs.sliderContainer.style.paddingTop = '30px';
        }

        this.$refs.button1.$el.appendChild(this.sliderInput.$el);
        this.$refs.button2.$el.appendChild(this.sliderInput2.$el);

        this.$watch('value', val => {
          this.sliderInput.value = this.firstValue;
          this.sliderInput2.value = this.secondValue;
          // this.sliderInput.updatePopper();
          // this.sliderInput2.updatePopper();
        });
      }
    } else {
      if (typeof this.value !== 'number' || isNaN(this.value)) {
        this.firstValue = this.min;
      } else {
        this.firstValue = Math.min(this.max, Math.max(this.min, this.value));
      }
      this.oldValue = this.firstValue;
    }
    this.resetSize();
    window.addEventListener('resize', this.resetSize);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resetSize);
    if (this.sliderInput) {
      this.sliderInput.$destroy(true);
    }
    if (this.sliderInput2) {
      this.sliderInput2.$destroy(true);
    }
  },

  methods: {
    valueChanged() {
      if (this.range) {
        return ![this.minValue, this.maxValue].every(
          (item, index) => item === this.oldValue[index]
        );
      } else {
        return this.value !== this.oldValue;
      }
    },
    setValues() {
      if (this.min > this.max) {
        console.error('[Hui Error][Slider]min should not be greater than max.');
        return;
      }
      const val = this.value;
      if (this.range && Array.isArray(val)) {
        if (val[1] < this.min) {
          this.$emit('input', [this.min, this.min]);
        } else if (val[0] > this.max) {
          this.$emit('input', [this.max, this.max]);
        } else if (val[0] < this.min) {
          this.$emit('input', [this.min, val[1]]);
        } else if (val[1] > this.max) {
          this.$emit('input', [val[0], this.max]);
        } else {
          this.firstValue = val[0];
          this.secondValue = val[1];
          if (this.valueChanged()) {
            this.$emit('change', [this.minValue, this.maxValue]);
            this.dispatch('ElFormItem', 'el.form.change', [
              this.minValue,
              this.maxValue
            ]);
            this.oldValue = val.slice();
          }
        }
      } else if (!this.range && typeof val === 'number' && !isNaN(val)) {
        if (val < this.min) {
          this.$emit('input', this.min);
        } else if (val > this.max) {
          this.$emit('input', this.max);
        } else {
          this.firstValue = val;
          if (this.valueChanged()) {
            this.$emit('change', val);
            this.dispatch('ElFormItem', 'el.form.change', val);
            this.oldValue = val;
          }
        }
      }
    },

    setPosition(percent, type) {
      const targetValue = this.min + (percent * (this.max - this.min)) / 100;
      if (!this.range) {
        this.$refs.button1.setPosition(percent, type);
        return;
      }
      let button;
      if (
        Math.abs(this.minValue - targetValue) <
        Math.abs(this.maxValue - targetValue)
      ) {
        button = this.firstValue < this.secondValue ? 'button1' : 'button2';
      } else {
        button = this.firstValue > this.secondValue ? 'button1' : 'button2';
      }
      this.$refs[button].setPosition(percent, type);
    },

    onSliderClick(event) {
      if (this.disabled || this.dragging) return;
      // add by zhangxiaogang
      this.$emit(
        'before-click',
        event,
        this.range && Array.isArray(this.value)
          ? [this.minValue, this.maxValue]
          : this.value
      );
      this.resetSize();
      if (this.vertical) {
        const sliderOffsetBottom = this.$refs.slider.getBoundingClientRect()
          .bottom;
        this.setPosition(
          ((sliderOffsetBottom - event.clientY) / this.sliderSize) * 100,
          'slider-click-value-change'
        );
      } else {
        const sliderOffsetLeft = this.$refs.slider.getBoundingClientRect().left;
        this.setPosition(
          ((event.clientX - sliderOffsetLeft) / this.sliderSize) * 100,
          'slider-click-value-change'
        );
      }
    },
    sliderClickValueChange(value) {
      if (this.range && Array.isArray(value)) {
        this.$emit('slider-click', [this.minValue, this.maxValue]);
      } else {
        this.$emit('slider-click', value);
      }
    },
    onSecondButtonClick() {
      this.vertical
        ? (this.firstValue -= this.step)
        : (this.firstValue += this.step);
    },
    onFirstButtonClick() {
      this.vertical
        ? (this.firstValue += this.step)
        : (this.firstValue -= this.step);
    },
    resetSize() {
      if (this.$refs.slider) {
        this.sliderSize = this.$refs.slider[
          `client${this.vertical ? 'Height' : 'Width'}`
        ];
      }
    },

    // add by zhangxiaogang
    dragEnd() {
      if (this.range && Array.isArray(this.value)) {
        this.$emit('drag-end', [this.minValue, this.maxValue]);
      } else {
        this.$emit('drag-end', this.value);
      }
    },

    // range show-input 情况下，点击 button聚焦 input add by yangzhini
    buttonDown(sliderInput) {
      // 点击失去焦点
      if (this.$refs.input && this.$refs.input.$refs.input.$refs.input) {
        this.$refs.input.$refs.input.$refs.input.blur();
      }
      if (!sliderInput) return;
      this.sliderInputSelect(sliderInput);
    },

    sliderInputSelect(sliderInput) {
      if (!sliderInput) return;
      sliderInput.$refs.rangeInput.$refs.input.$refs.input.select();
    },

    // add by yangzhini
    createInputElement(index) {
      const sliderInput = new Vue(SliderInput);
      sliderInput.value = this.value[index];
      sliderInput.button = this.$refs[`button${index + 1}`].$el;
      sliderInput.slider = this;
      !this.$isServer && sliderInput.$mount(document.createElement('div'));
      sliderInput.$on('change', value => {
        if (index === 0) {
          this.firstValue = value;
        } else {
          this.secondValue = value;
        }
        // 解决[1,6]变为[6,9]时（即1改为9）显示为[9,9]的问题
        sliderInput.$refs.rangeInput.$refs.input.$refs.input.value = value;

        // sliderInput.updatePopper();
      });
      return sliderInput;
    },

    handleBlur(event) {
      this.$emit('blur', event);
    }
  }
};
</script>

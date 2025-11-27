<template>
  <el-input-number
    ref="rangeInput"
    v-model="value"
    :step="slider.step"
    :precision="precision"
    :disabled="slider.disabled"
    :controls="slider.showInputControls"
    :min="slider.min"
    :max="slider.max"
    :debounce="slider.debounce"
    class="el-slider__range-input"
  />
</template>

<script>
// import Popper from 'hui/src/utils/vue-popper';
import ElInputNumber from 'hui/packages/input-number';

export default {
  name: 'ElSliderInput',

  components: {
    ElInputNumber
  },

  // mixins: [Popper],

  props: {
    placement: {
      type: String,
      default: 'top'
    },
    value: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      slider: {
        step: 1,
        disabled: false,
        showInputControls: true,
        min: 0,
        max: 100,
        debounce: 300
      },
      button: null
    };
  },
  computed: {
    precision() {
      return this.slider &&
        this.slider.step &&
        this.slider.step.toString().includes('.')
        ? this.slider.step
            .toString()
            .split('.')
            .pop().length
        : undefined;
    }
  },
  watch: {
    value(val) {
      if (typeof val !== 'undefined') {
        this.$emit('change', val);
      }
    }
  },

  mounted() {
    this.popperElm = this.$el;
    this.referenceElm = this.button;
    this.showPopper = true;
  }
};
</script>

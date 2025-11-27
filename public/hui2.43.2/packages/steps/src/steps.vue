<template>
  <div
    :class="[
      'is-' + direction,
      rightTitle ? 'is-rightTitle' : '',
      isCenter ? 'is-center' : ''
    ]"
    class="el-steps"
  >
    <!-- <div :class="[alignCenter ? 'el-steps-content' : '']"> -->
    <slot />
    <!-- </div> -->
  </div>
</template>

<script>
import Emitter from 'hui/src/mixins/emitter';
export default {
  name: 'ElSteps',
  mixins: [Emitter],
  props: {
    space: {
      type: [Number, String],
      default: null
    },
    active: {
      type: Number,
      default: null
    },
    direction: {
      type: String,
      default: 'horizontal'
    },
    size: {
      type: String,
      default: null
    },
    line: {
      type: Boolean,
      default: true
    },
    rightTitle: {
      type: Boolean,
      default: false
    },
    alignCenter: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: null
    },
    finishStatus: {
      type: String,
      default: 'finish'
    },
    processStatus: {
      type: String,
      default: 'process'
    },
    disorder: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      steps: [],
      stepOffset: 0
    };
  },
  computed: {
    isCenter() {
      return this.alignCenter || typeof this.space === 'string';
    }
  },
  watch: {
    active(newVal, oldVal) {
      this.$emit('change', newVal, oldVal);
    },

    steps(steps) {
      steps.forEach((child, index) => {
        child.index = index;
      });
      if (this.center) {
        const len = steps.length;
        this.$nextTick(() => {
          this.stepOffset =
            steps[len - 1].$el.getBoundingClientRect().width / (len - 1);
        });
      }
    }
  }
};
</script>

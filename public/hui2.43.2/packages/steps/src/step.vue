<template>
  <div
    :style="style"
    :class="[
      'is-' + $parent.direction,
      $parent.size ? 'el-step--' + $parent.size : '',
      icon ? 'el-step--' + 'icon' : '',
      isLast &&
        !$parent.space &&
        $parent.direction === 'horizontal' &&
        'is-flex',
      $parent.disorder ? 'el-step--' + 'disorder' : ''
    ]"
    class="el-step"
  >
    <div
      v-if="$parent.line"
      :class="['is-' + $parent.direction, { 'is-icon': icon }]"
      class="el-step__line"
    >
      <i :style="lineStyle" class="el-step__line-inner" />
    </div>
    <div
      :class="['is-' + currentStatus, { 'is-text': !icon }]"
      class="el-step__head"
      @click="hdClick"
    >
      <span class="el-step__icon">
        <slot
          v-if="
            currentStatus !== 'success' &&
              currentStatus !== 'error' &&
              $parent.size !== 'mini' &&
              !$parent.disorder
          "
          name="icon"
        >
          <i v-if="icon" :class="['h-icon-' + icon]" />
          <!-- <div v-else>{{ index + 1 }}</div> -->
          <!-- <div v-if="description">{{ description }}</div> -->
          <div v-if="!icon">{{ index + 1 }}</div>
        </slot>
        <i v-else-if="$parent.size == 'mini' || $parent.disorder" />
        <i
          v-else
          :class="[
            'h-icon-' + (currentStatus === 'success' ? 'done' : 'close')
          ]"
        />
      </span>
    </div>
    <div
      ref="main"
      :class="[$parent.rightTitle ? 'rightTitle' : '']"
      class="el-step__main"
    >
      <div ref="title" :class="['is-' + currentStatus]" class="el-step__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div :class="['is-' + currentStatus]" class="el-step__description">
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
import Emitter from 'hui/src/mixins/emitter';
export default {
  name: 'ElStep',
  mixins: [Emitter],
  props: {
    title: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      index: -1,
      lineStyle: {},
      internalStatus: ''
    };
  },

  computed: {
    currentStatus() {
      return this.status || this.internalStatus;
    },
    prevStatus() {
      const prevStep = this.$parent.steps[this.index - 1];
      return prevStep ? prevStep.currentStatus : 'wait';
    },
    isLast: function() {
      const parent = this.$parent;
      return parent.steps[parent.steps.length - 1] === this;
    },
    style: function() {
      const style = {};
      const parent = this.$parent;
      // const isCenter = parent.center;
      const len = parent.steps.length;

      // if (isCenter && this.isLast) {
      //   return {};
      // }

      const space =
        typeof parent.space === 'number'
          ? parent.space + 'px'
          : parent.space
          ? parent.space
          : 100 / (len - (parent.isCenter ? 0 : 1)) + '%';

      if (parent.direction === 'horizontal') {
        style.flexBasis = space;
      } else {
        if (!this.isLast) {
          style.flexBasis = space;
        }
      }

      return style;
    }
  },

  beforeCreate() {
    this.$parent.steps.push(this);
  },

  beforeDestroy() {
    const steps = this.$parent.steps;
    const index = steps.indexOf(this);
    if (index >= 0) {
      steps.splice(index, 1);
    }
  },

  mounted() {
    // const parent = this.$parent;

    const unwatch = this.$watch('index', () => {
      this.$watch('$parent.active', this.updateStatus, {
        immediate: true
      });
      unwatch();
    });
  },

  methods: {
    updateStatus(val) {
      const prevChild = this.$parent.$children[this.index - 1];

      if (val > this.index) {
        this.internalStatus = this.$parent.finishStatus;
      } else if (val === this.index && this.prevStatus !== 'error') {
        this.internalStatus = this.$parent.processStatus;
      } else {
        this.internalStatus = 'wait';
      }

      if (prevChild) prevChild.calcProgress(this.internalStatus);
    },

    calcProgress(status) {
      let step = 100;
      const style = {};

      style.transitionDelay = 150 * this.index + 'ms';
      if (status === this.$parent.processStatus) {
        step = this.currentStatus !== 'error' ? 100 : 0;
      } else if (status === 'wait') {
        step = 0;
        style.transitionDelay = -150 * this.index + 'ms';
      }
      if (this.$parent.direction === 'vertical') {
        style.borderLeftWidth = step ? '1px' : 0;
        style.height = step + '%';
      } else {
        style.borderTopWidth = step ? '1px' : 0;
        style.width = step + '%';
      }
      this.lineStyle = style;
    },

    hdClick() {
      this.$parent.$emit('step-click', this.index);
    }
  }
};
</script>

<template>
  <div
    :class="[{ 'is-multiple': $parent.multiple }, popperClass]"
    :style="{ minWidth: minWidth, maxWidth: maxWidth }"
    class="el-select-dropdown"
  >
    <slot />
  </div>
</template>

<script type="text/babel">
import Popper from 'hui/src/utils/vue-popper';

export default {
  name: 'ElSelectDropdown',

  componentName: 'ElSelectDropdown',

  mixins: [Popper],

  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    },

    boundariesPadding: {
      type: null,
      default: 0
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    popperOptions: {
      type: null,
      default() {
        return {
          forceAbsolute: true,
          gpuAcceleration: false
        };
      }
    }
  },

  data() {
    return {
      minWidth: '',
      maxWidth: ''
    };
  },

  computed: {
    popperClass() {
      return this.$parent.popperClass;
    }
  },

  watch: {
    '$parent.inputWidth'() {
      const inputWidth = this.$parent.$el.getBoundingClientRect().width;
      this.minWidth = inputWidth + 'px';
      this.maxWidth = (this.$parent.maxWidth || inputWidth) + 'px';
    }
  },

  mounted() {
    this.referenceElm = this.$parent.$refs.reference.$el;
    this.$parent.popperElm = this.popperElm = this.$el;
    this.$on('updatePopper', () => {
      if (this.$parent.visible) this.updatePopper();
    });
    this.$on('destroyPopper', this.destroyPopper);
  }
};
</script>

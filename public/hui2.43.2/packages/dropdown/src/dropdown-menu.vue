<template>
  <transition name="el-zoom-in-top" @after-leave="doDestroy">
    <ul
      v-show="showPopper"
      :class="[size && `el-dropdown-menu--${size}`]"
      class="el-dropdown-menu el-popper"
    >
      <slot />
    </ul>
  </transition>
</template>
<script>
import Popper from 'hui/src/utils/vue-popper';

export default {
  name: 'ElDropdownMenu',

  componentName: 'ElDropdownMenu',

  mixins: [Popper],

  props: {
    visibleArrow: {
      type: Boolean,
      default: false
    },
    offset: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      size: this.dropdown.dropdownSize
    };
  },

  inject: ['dropdown'],

  watch: {
    'dropdown.placement': {
      immediate: true,
      handler(val) {
        this.currentPlacement = val;
      }
    }
  },

  created() {
    this.$on('updatePopper', () => {
      if (this.showPopper) this.updatePopper();
    });
    this.$on('visible', val => {
      this.showPopper = val;
    });
  },

  mounted() {
    this.$parent.popperElm = this.popperElm = this.$el;
    this.referenceElm = this.$parent.$el;
  }
};
</script>

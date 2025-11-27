<template>
  <section :class="{ 'is-vertical': isVertical }" class="h-layout">
    <slot />
  </section>
</template>

<script>
import { isVNode } from '@hui-pro/utils';
export default {
  name: 'HLayout',
  provide() {
    return {
      layout: this
    };
  },
  props: {
    // 内部是水平排列还是垂直排列，默认为'水平排列'
    direction: {
      type: String,
      default: null,
      validator: function(value) {
        return ['vertical', 'horizontal'].includes(value);
      }
    }
  },
  computed: {
    isVertical() {
      if (this.direction === 'vertical') {
        return true;
      } else if (this.direction === 'horizontal') {
        return false;
      }
      return this.$slots && this.$slots.default
        ? this.$slots.default.some(vNode => {
            const tag =
              isVNode(vNode) &&
              vNode.componentOptions &&
              vNode.componentOptions.tag;
            return tag === 'h-layout-header' || tag === 'h-layout-footer';
          })
        : false;
    }
  }
};
</script>

<template>
  <div
    :class="{
      'is-flex': flex,
      'is-vertical': direction === 'vertical',
      'is-overflow': overflow
    }"
    class="h-layout-content"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'HLayoutContent',
  props: {
    // 内部是否使用 flex 布局
    flex: {
      type: Boolean,
      default: false
    },
    // 使用 flex 布局时，内部是水平排列还是垂直排列，默认为'水平排列'
    direction: {
      type: String,
      default: 'horizontal',
      validator: function(value) {
        return ['vertical', 'horizontal'].includes(value);
      }
    },
    // 是否出现滚动条
    overflow: {
      type: Boolean,
      default: false
    }
  }
};
</script>

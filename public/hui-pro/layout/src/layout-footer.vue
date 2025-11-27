<template>
  <div :style="{ height }" class="h-layout-footer">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'HLayoutFooter',
  props: {
    // 高度
    height: {
      type: String,
      default: undefined
    }
  }
};
</script>

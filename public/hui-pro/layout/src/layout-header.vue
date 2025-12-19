<template>
  <div :style="{ height }" class="h-layout-header">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'HLayoutHeader',
  props: {
    // 高度
    height: {
      type: String,
      default: undefined
    }
  }
};
</script>

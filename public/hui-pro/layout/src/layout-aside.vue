<template>
  <aside :style="{ width }" class="h-layout-aside">
    <slot />
  </aside>
</template>

<script>
export default {
  name: 'HLayoutAside',
  props: {
    // 宽度
    width: {
      type: String,
      default: undefined
    }
  }
};
</script>

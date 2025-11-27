<template>
  <div class="el-card">
    <div v-if="$slots.header || header" class="el-card__header">
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div :style="bodyStyle" class="el-card__body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ElCard',

  props: {
    header: {
      type: null,
      default: null
    },
    bodyStyle: {
      type: null,
      default: null
    }
  }
};
</script>

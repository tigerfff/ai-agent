<template>
  <span class="el-spinner">
    <svg
      :style="{ width: radius / 2 + 'px', height: radius / 2 + 'px' }"
      class="el-spinner-inner"
      viewBox="0 0 50 50"
    >
      <circle
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        class="path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
      />
    </svg>
  </span>
</template>
<script>
export default {
  name: 'ElSpinner',
  props: {
    type: {
      type: String,
      default: null
    },
    radius: {
      type: Number,
      default: 100
    },
    strokeWidth: {
      type: Number,
      default: 5
    },
    strokeColor: {
      type: String,
      default: '#efefef'
    }
  }
};
</script>

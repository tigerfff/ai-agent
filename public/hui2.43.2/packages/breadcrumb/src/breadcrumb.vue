<template>
  <div class="el-breadcrumb">
    <slot />
  </div>
</template>
<script>
export default {
  name: 'ElBreadcrumb',
  provide() {
    return {
      breadcrumb: this
    };
  },

  props: {
    separator: {
      type: String,
      default: '/'
    },
    separatorClass: {
      type: String,
      default: 'h-icon-angle_right_sm'
    },
    // 面包屑子项最大宽度
    itemMaxWidth: {
      type: [String, Number],
      default: null
    }
  }
};
</script>

<template>
  <div :class="{ 'is-double-col': doubleCol }" class="h-page-detail-item">
    <div class="h-page-detail-item__label">
      <slot v-if="$slots.label" name="label" />
      <template v-else-if="$slots.labelAction">
        <span v-ellipsis.nonFull>{{ label }}</span>
        <span class="h-page-detail-item__label--action">
          <slot name="labelAction" />
        </span>
      </template>
      <span v-ellipsis v-else>{{ label }}</span>
    </div>
    <div ref="content" class="h-page-detail-item__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HPageDetailItem',
  inject: ['pageDetail'],
  props: {
    label: {
      type: String,
      default: ''
    },
    doubleCol: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      index: 0, // 序号
      span: 24, // 搜索项所占的栅格数
      width: '100%',
      height: null // 详情项高度
    };
  },
  computed: {
    rowAmount() {
      return this.pageDetail.rowAmount;
    }
  },
  mounted() {
    this.index = this.pageDetail.itemIndex++;
  }
};
</script>

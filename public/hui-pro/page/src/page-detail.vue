<template>
  <div
    :class="{
      'is-single': single,
      [`row-amount-${rowAmount}`]: rowAmount !== 1
    }"
    class="h-page-detail"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'HPageDetail',
  inject: ['pageContent'],
  provide() {
    return {
      pageDetail: this
    };
  },
  props: {
    single: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      xl: 1408, // 一行4列断点
      lg: 944, // 一行3列断点
      md: 708, // 一行2列断点
      rowAmount: 4, // 一行有多少个详情项
      itemIndex: 1
    };
  },
  computed: {
    // 详情页宽度
    detailWidth() {
      return this.pageContent.innerWidth;
    }
  },
  watch: {
    // 监听详情页宽度
    detailWidth() {
      if (!this.single) this.resize();
    }
  },
  mounted() {
    if (this.single) this.rowAmount = 1;
    else this.resize();
  },
  methods: {
    /**
     * @desc 修改详情项所占栅格数
     * @author chenguanbin
     */
    resize: function() {
      const width = this.$el.clientWidth;
      // 通过宽度设置列数，参考 HUI 的 el-col 控件
      if (width >= this.xl) this.rowAmount = 4;
      else if (width >= this.lg) this.rowAmount = 3;
      else if (width >= this.md) this.rowAmount = 2;
      else this.rowAmount = 1;
    }
  }
};
</script>

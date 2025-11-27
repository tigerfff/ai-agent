<template>
  <div
    :style="{ display: hidden ? 'none' : show || showMore ? null : 'none' }"
    class="h-page-search-item"
  >
    <el-form-item
      :label="label"
      :prop="prop"
      :rules="rules"
      :required="required"
      :required-right="requiredRight"
      :label-width="itemLabelWidth"
    >
      <slot />
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'HPageSearchItem',
  inject: ['pageSearch'],
  props: {
    // Form-Item 控件的 prop 参数
    prop: {
      type: String,
      default: null
    },
    // Form-Item 控件的 rules 参数
    rules: {
      type: Object,
      default: undefined
    },
    // Form-Item 控件的 label 参数
    label: {
      type: String,
      default: ''
    },
    // Form-Item 控件的 required 参数
    required: {
      type: Boolean,
      default: false
    },
    // Form-Item 控件的 requiredRight 参数
    requiredRight: {
      type: Boolean,
      default: false
    },
    // Form-Item 控件的 labelWidth 参数
    labelWidth: {
      type: String,
      default: null
    },
    // 菜单项是否默认显示（高低频过滤）
    show: {
      type: Boolean,
      default: true
    },
    // 菜单项是否隐藏，取代 v-if 和 v-show 实现隐藏功能
    hidden: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      span: 4, // 搜索项所占的栅格数
      showMore: false // 是否显示搜索项
    };
  },
  computed: {
    itemLabelWidth() {
      return this.labelWidth || this.pageSearch.labelWidth;
    },
    // 是否是高低频搜索
    hlfSearch() {
      return this.pageSearch.hlfSearch;
    },
    // 是否显示更多搜索项
    showMoreItem() {
      return this.pageSearch.showMoreItem;
    },
    rowAmount() {
      return this.pageSearch.rowAmount;
    }
  },
  watch: {
    // 监控菜单项的显示状态
    showMoreItem(showMore) {
      this.showMore = showMore;
      // 菜单项若默认隐藏，会影响搜索栏布局，需要重新计算栅格
      if (this.show !== true) this.pageSearch.resize();
    },
    show() {
      this.pageSearch.setHlfStatus();
    }
  },
  mounted() {
    this.pageSearch.items.push(this);
  },
  destroyed() {
    const index = this.pageSearch.items.indexOf(this);
    this.pageSearch.items.splice(index, 1);
  }
};
</script>

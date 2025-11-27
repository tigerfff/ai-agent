<template>
  <el-collapse-transition>
    <div
      v-show="show"
      ref="pageSearch"
      :class="{
        'is-collapse': searchIconExist,
        [`row-amount-${rowAmount}`]: rowAmount !== 1
      }"
      class="h-page-search"
    >
      <el-form
        ref="form"
        :model="model"
        :rules="rules"
        :label-position="labelPosition"
        :label-width="labelWidth"
        class="h-page-search__form"
        @submit.prevent.native
      >
        <slot />
        <div
          v-if="$slots.pageSearchAction"
          :style="{ width: actionWidth }"
          class="h-page-search__action"
        >
          <slot name="pageSearchAction" />
          <template v-if="hlfSearch">
            <slot v-if="$slots.pageSearchHlf" name="pageSearchHlf" />
            <span
              v-else
              :class="{ 'is-active': showMoreItem }"
              class="h-page-search__action--more"
              @click="collapse"
            >
              <i :class="hlfIcon" />
            </span>
          </template>
        </div>
      </el-form>
    </div>
  </el-collapse-transition>
</template>

<script>
import { offset } from '@hui-pro/utils';

export default {
  name: 'HPageSearch',
  inject: ['pageContainer', 'pageContent'],
  provide() {
    return {
      pageSearch: this
    };
  },
  props: {
    // Form 控件的 model 参数
    model: {
      type: Object,
      default: undefined
    },
    // Form 控件的 rules 参数
    rules: {
      type: Object,
      default: undefined
    },
    // Form 控件的 labelPosition 参数
    labelPosition: {
      type: String,
      default: 'top'
    },
    // Form 控件的 labelWidth 参数
    labelWidth: {
      type: String,
      default: null
    },
    // 断点参数
    options: {
      type: Object,
      default: () => {}
    },
    // 高低频搜索图标
    hlfIcon: {
      type: String,
      default: 'h-icon-angles_down_sm'
    }
  },
  data() {
    return {
      show: false, // 搜索栏是否显示
      showMoreItem: false, // 是否显示更多搜索项
      hlfSearch: false, // 是否是高低频搜索
      // 影响断点的因素：门户最小宽度 1280px，门户菜单收起时 48px，滚动条宽度 17px，侧边栏宽度 256px，h-page-content 左右 padding 各 12px
      xl: 1408, // 一行6列断点
      lg: 935, // 一行4列断点（保证 1280px 情况下，门户搜索默认显示一行 4 列：1280 - 48 - 17 - 256 - 12 * 2 = 935）
      md: 708, // 一行3列断点
      sm: 472, // 一行2列断点
      items: [], // 保存所有搜索项
      rowAmount: 6, // 一行有多少个搜索项
      actionWidth: '100%' // 操作项宽度
    };
  },
  computed: {
    // 页面滚动距离
    scrollTop() {
      return this.pageContainer.scrollTop;
    },
    // 搜索栏宽度
    searchWidth() {
      return this.pageContent.innerWidth;
    },
    // 搜索图标是否存在
    searchIconExist() {
      return this.pageContent.searchIconExist;
    },
    // 搜索图标是否激活
    searchIconActive() {
      return this.pageContent.searchIconActive;
    },
    // 获取所有显示的菜单项
    existItems(items) {
      return this.items.filter(item => {
        return !item.hidden;
      });
    }
  },
  watch: {
    // 监听页面滚动距离
    scrollTop(top) {
      const { actionAffix, actionHeight } = this.pageContent;
      // 搜索栏隐藏，或者操作栏不固定时，直接返回
      if (!this.show || !actionAffix) return;
      const sTop = top + actionHeight; // 页面滚动距离加上操作栏高度（操作栏）
      const offsetTop = offset(this.$refs.pageSearch).top; // 搜索栏顶部到页面顶部距离
      const oTop = offsetTop + this.$refs.pageSearch.offsetHeight; // 搜索栏底部到页面顶部距离
      this.pageContent.searchIconLazy = sTop > oTop; // 判断页面是否滚动超过搜索栏底部
    },
    // 监听搜索栏宽度
    searchWidth() {
      this.resize();
    },
    // 监听搜索栏激活状态
    searchIconActive(newVal) {
      this.show = newVal;
    },
    // 监控断点参数变化
    options() {
      this._setOptions();
      this.resize();
    },
    // 菜单项数据变化
    existItems() {
      this.setHlfStatus();
    }
  },
  created() {
    // 不存在搜索图标，或者搜索图标激活时，搜索栏为显示状态
    if (!this.searchIconExist || this.searchIconActive) this.show = true;
    // 设置断点参数
    if (this.options) this._setOptions();
  },
  mounted() {
    this.setHlfStatus();
  },
  methods: {
    /**
     * @desc 获取搜索栏使用的表单控件
     * @author chenguanbin
     */
    getForm() {
      return this.$refs.form;
    },

    /**
     * @desc 对整个表单进行重置，清空所有字段并移除校验结果
     * @author chenguanbin
     */
    resetFields(isEmpty = false) {
      this.$refs.form.resetFields(isEmpty);
    },

    /**
     * @desc 重置搜索栏显隐性状态
     * @author chenguanbin
     */
    resetStatus() {
      this.showMoreItem = false;
    },

    /**
     * @desc 重置搜索栏
     * @author chenguanbin
     */
    reset() {
      this.resetFields();
      this.resetStatus();
    },

    /**
     * @desc 修改搜索项和操作项所占栅格数
     * @author chenguanbin
     */
    resize() {
      const width = this.searchWidth;

      // 宽度不存在时，不进行后续计算
      if (width <= 0) return;

      // 判断页面是否存在滚动条，若存在滚动条在计算断点宽度时减去 17px
      const isBodyScroll =
        document.body.scrollHeight > document.body.clientHeight;
      const shiftWidth = isBodyScroll ? -17 : 0;

      // 通过宽度设置一行显示多少个搜索项
      if (width >= this.xl + shiftWidth) this.rowAmount = 6;
      else if (width >= this.lg + shiftWidth) this.rowAmount = 4;
      else if (width >= this.md + shiftWidth) this.rowAmount = 3;
      else if (width >= this.sm + shiftWidth) this.rowAmount = 2;
      else this.rowAmount = 1;

      if (this.$slots.pageSearchAction) this._setActionWidth();
    },

    /**
     * @desc 设置高低频状态
     * @author chenguanbin
     */
    setHlfStatus() {
      // 若搜索项中有默认不显示项，则显示展开收起图标，开启高低频搜索
      this.hlfSearch = !!this.existItems.some(item => {
        return !item.show;
      });
      this.resize();
    },

    /**
     * @desc 显示/隐藏高低频搜索项
     * @author chenguanbin
     */
    collapse() {
      this.showMoreItem = !this.showMoreItem;
      this.$emit('collapse', this.showMoreItem);
    },

    /**
     * @desc 页面宽度变化后，修改操作项宽度
     * @author chenguanbin
     */
    _setActionWidth() {
      const itemCount = this.showMoreItem
        ? this.existItems.length
        : this.existItems.filter(item => {
            return item.show;
          }).length;
      const { rowAmount } = this;
      const percent = (1 / rowAmount) * 100; // 每列占据的宽度百分比
      const piece = rowAmount - (itemCount % rowAmount); // 给操作项预留下的列数
      this.actionWidth = piece === rowAmount ? null : `${piece * percent}%`;
    },

    /**
     * @desc 设置断点参数
     * @author chenguanbin
     */
    _setOptions() {
      Object.assign(this, this.options);
    }
  }
};
</script>

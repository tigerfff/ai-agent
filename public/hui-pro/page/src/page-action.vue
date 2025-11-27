<template>
  <component
    ref="affix"
    :is="wrapperComponent"
    :slot-width="10"
    :offset-top="offsetTop"
    class="h-page-action"
  >
    <div
      :class="{ 'is-show-search-icon': searchIcon }"
      class="h-page-action__main"
    >
      <h-page-button-group
        v-if="$slots.default"
        :style="leftActionStyle"
        class="h-page-action__left-action"
        @fold="handleChangeButtonStatus('fold')"
        @unfold="handleChangeButtonStatus('unfold')"
      >
        <slot />
      </h-page-button-group>
      <div
        v-if="$slots.leftAction"
        :style="leftActionStyle"
        class="h-page-action__left-action"
      >
        <slot name="leftAction" />
      </div>
      <div
        v-if="$slots.rightAction"
        ref="rightAction"
        class="h-page-action__right-action"
      >
        <slot name="rightAction" />
      </div>
      <template v-if="searchIcon">
        <div
          v-if="hideSearchIconTips"
          :class="{ 'is-active': searchAction && !searchIconLazy }"
          class="h-page-action__search-icon"
          @click="handleClickSearchIcon"
        >
          <i class="h-icon-filter" />
        </div>
        <el-tooltip
          v-else
          ref="tooltip"
          :content="searchIconTips"
          placement="top"
          popper-class="h-page-action__tooltip"
        >
          <div
            :class="{ 'is-active': searchAction && !searchIconLazy }"
            class="h-page-action__search-icon"
            @click="handleClickSearchIcon"
          >
            <i class="h-icon-filter" />
          </div>
        </el-tooltip>
      </template>
    </div>
  </component>
</template>

<script>
import { offset, scrollTo } from '@hui-pro/utils';

export default {
  name: 'HPageAction',
  inject: ['pageContainer', 'pageContent'],
  props: {
    // 是否开启固定模式
    affix: {
      type: Boolean,
      default: true
    },
    // 距离窗口顶部达到指定偏移量后触发
    offsetTop: {
      type: Number,
      default: 0
    },
    // 是否显示搜索图标
    searchIcon: {
      type: Boolean,
      default: false
    },
    // 搜索图标提示信息
    searchIconTips: {
      type: String,
      default: 'filter'
    },
    // 是否隐藏搜索图标提示信息
    hideSearchIconTips: {
      type: Boolean,
      default: false
    },
    // 搜索图标是否激活
    searchIconActive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      spacingTop: 0, // 到页面顶部的距离
      searchAction: this.searchIconActive, // 搜索图标是否激活
      rightActionWidth: 0
    };
  },
  computed: {
    // 固定模式下使用 Affix 图钉控件
    wrapperComponent() {
      return this.affix ? 'h-affix' : 'div';
    },
    // 获取操作栏宽度
    contentWidth() {
      return this.pageContent.innerWidth;
    },
    // 页面滚动距离
    scrollTop() {
      return this.pageContainer.scrollTop;
    },
    // 页面是否滚动超过搜索栏底部
    searchIconLazy() {
      return this.pageContent.searchIconLazy;
    },
    leftActionStyle() {
      const gutter = 4; // 左右操作区域添加 4px 的间距
      const ret = {};
      ret.width = this.$slots.rightAction
        ? `calc(100% - ${this.rightActionWidth + gutter}px)`
        : '100%';
      return ret;
    }
  },
  watch: {
    // 监听容器宽度
    contentWidth(width) {
      // 非固定模式直接返回
      if (!this.affix) return;
      const gutter = 12; // 内容区域的 padding-left 为 12px
      const left = offset(this.pageContent.$el).left + gutter; // 内容区域到页面左边的距离，加上区域的左边距
      this.$refs.affix.updateAffixStyle({ left, width });
    },
    searchIconActive() {
      this.handleClickSearchIcon();
    }
  },
  created() {
    if (this.affix) this.pageContent.actionAffix = true;
    if (this.searchIcon) this.pageContent.searchIconExist = true;
  },
  mounted() {
    this.spacingTop = offset(this.$el).top;
    this.pageContent.searchIconActive = this.searchAction;
    if (this.affix) this.pageContent.actionHeight = this.$el.offsetHeight;
    if (this.$refs.rightAction) {
      this.$nextTick(() => {
        this.resize();
      });
    }
  },
  updated() {
    if (this.affix) this.pageContent.actionHeight = this.$el.offsetHeight;
    if (this.$refs.rightAction) {
      this.$nextTick(() => {
        this.resize();
      });
    }
  },
  // keep-alive 情况下进行路由切换
  activated() {
    if (this.affix) this.$refs.affix.handleScroll();
  },
  methods: {
    /**
     * @desc 重新计算操作栏宽度
     * @author chenguanbin
     */
    resize() {
      this.rightActionWidth = this.$refs.rightAction.clientWidth;
    },
    /**
     * @desc 点击搜索图标
     * @author chenguanbin
     */
    handleClickSearchIcon() {
      const oldWidth = this.contentWidth;
      const lazy = this.searchIconLazy;

      // 若页面滚动超过操作栏顶部，向上滚动到操作栏顶部
      if (this.scrollTop > this.spacingTop) scrollTo(this.spacingTop, 200);

      // 若页面滚动未超过搜索栏底部，切换搜索图标激活状态
      if (!lazy) this.searchAction = !this.searchAction;

      this.pageContent.searchIconActive = this.searchAction;
      this.$emit('search-collapse', this.searchAction);

      // 若容器宽度有变化，更新 tooltip 位置
      setTimeout(() => {
        if (this.contentWidth !== oldWidth) this.$refs.tooltip.updatePopper();
      }, 300);
    },

    /**
     * @author chenguanbin
     * @date 2020-03-16 10:36:49
     * @desc 按钮组折叠/展开事件
     */
    handleChangeButtonStatus(status) {
      this.$emit(status);
    }
  }
};
</script>

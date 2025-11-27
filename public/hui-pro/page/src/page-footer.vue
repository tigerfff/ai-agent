<template>
  <component
    ref="affix"
    :is="wrapperComponent"
    :offset-bottom="affix ? 0 : null"
    :class="{ 'is-affix': affix }"
    :style="affix ? null : footerFixedStyle"
    class="h-page-footer"
  >
    <div class="h-page-footer__main">
      <div :style="style" class="h-page-footer__inner">
        <div class="h-page-footer__left">
          <slot />
        </div>
        <div v-if="$slots.rightAction" class="h-page-footer__right">
          <slot name="rightAction" />
        </div>
      </div>
    </div>
  </component>
</template>

<script>
export default {
  name: 'HPageFooter',
  inject: ['pageContainer'],
  props: {
    affix: {
      type: Boolean,
      default: false
    },
    // 除了菜单，额外的左侧元素宽度
    extraLeft: {
      type: [Number, String],
      default: 0
    },
    // 使用默认 slot 时，操作区域所占的宽度
    innerWidth: {
      type: String,
      default: '100%'
    },
    // 使用默认 slot 时，操作区域里的内容是否居中显示
    innerCenter: {
      type: Boolean,
      default: false
    },
    innerStyle: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    page() {
      let { $parent } = this;
      while ($parent.$options.name !== 'HPage') {
        $parent = $parent.$parent;
        if (!$parent) return null;
      }
      return $parent || null;
    },
    // 固定模式下使用 Affix 图钉控件
    wrapperComponent() {
      return this.affix ? 'h-affix' : 'div';
    },
    // 容器宽度
    containerWidth() {
      return this.pageContainer.innerWidth;
    },
    // 底部操作栏容器样式
    footerFixedStyle() {
      const { page } = this;
      const extraLeft = parseInt(this.extraLeft);
      const left =
        page && page.menuExist
          ? page.menuCollapse
            ? parseInt(page.menuFoldWidth) + extraLeft
            : parseInt(page.menuExpandWidth) + extraLeft
          : extraLeft;
      return {
        left: `${left + 12}px` // 左右间距12px
      };
    },
    // 默认区域样式
    style() {
      return Object.assign({}, this.innerStyle, {
        width: this.innerWidth,
        'justify-content': this.innerCenter && 'center'
      });
    }
  },
  watch: {
    containerWidth() {
      this.resize();
    }
  },
  // keep-alive 情况下进行路由切换
  activated() {
    if (this.affix) this.$refs.affix.handleScroll();
  },
  methods: {
    resize() {
      // 非固定模式直接返回
      if (!this.affix) return;
      this.$refs.affix.handleScroll();
      const { page, pageContainer } = this;
      const menuWidth =
        page && page.menuExist
          ? page.menuCollapse
            ? page.menuFoldWidth
            : page.menuExpandWidth
          : 0;
      const extraLeft = parseInt(this.extraLeft);
      const gutter = 12; // 内容区域的 padding-left 为 12px
      // 菜单宽度 + 除了菜单，额外的左侧元素宽度 + 区域的左边距
      const left = menuWidth + extraLeft + gutter;
      // 容器宽度 - 除了菜单，额外的左侧元素宽度 - 区域的左右边距
      const width = pageContainer.$el.offsetWidth - extraLeft - gutter * 2;
      this.$refs.affix.updateAffixStyle({ left, width });
    }
  }
};
</script>

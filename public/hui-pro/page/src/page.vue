<template>
  <div
    :style="pageStyle"
    :class="{ 'is-inited': inited, 'hide-animation': hideAnimation }"
    class="h-page"
  >
    <slot />
  </div>
</template>

<script>
import { throttle, on, off } from '@hui-pro/utils';

export default {
  name: 'HPage',
  provide() {
    return {
      page: this
    };
  },
  props: {
    // 菜单自动收起页面宽度断点，默认为1472px
    collapseWidth: {
      type: [String, Number],
      default: 1472
    },
    // 指定页面初始化时间，单位是 ms，默认值为 500ms
    initTime: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      menuExist: false, // 页面上是否存在菜单
      menuCollapse: null, // 菜单是否为收起状态
      hasDefaultMenuCollapse: false, // page-menu 控件的 menuCollapse 是否设置过默认值
      menuFoldWidth: 48, // 菜单折叠时的宽度
      menuExpandWidth: 230, // 菜单展开时的宽度
      screenWidth: 0, // 屏幕宽度默认值，用来浏览器窗口变化时watch
      screenWidthOld: 0, // 记录窗口变化时的上一次屏幕宽度
      inited: true,
      hideAnimation: true // 是否暂时隐藏动画效果
    };
  },
  computed: {
    pageStyle() {
      const ret = {};
      if (this.menuExist) {
        ret.paddingLeft = this.menuCollapse
          ? `${parseInt(this.menuFoldWidth)}px`
          : `${parseInt(this.menuExpandWidth)}px`;
      }
      return ret;
    }
  },
  watch: {
    menuExist(exist) {
      if (!exist) return;
      const clientWidth = window.innerWidth;
      this.screenWidth = this.screenWidthOld = clientWidth;
      // 如果 page-menu 控件的 menuCollapse 设置过默认值，则 page 控件的 menuCollapse 不进行第一次初始化
      if (this.hasDefaultMenuCollapse) {
        this.hasDefaultMenuCollapse = false;
        return;
      }
      // 页面宽度大于等于 1462px 时，默认展开菜单，否则收起菜单
      if (clientWidth >= parseInt(this.collapseWidth)) {
        this.menuCollapse = false;
      } else {
        this.menuCollapse = true;
        this.delayInitPage();
      }
      this.delayAnimation();
    }
  },
  mounted() {
    on(this.$el, 'resize', this.resizePage);
    // 存在菜单，且菜单默认收起时，延时显示页面
    if (this.menuExist && this.$el.clientWidth < parseInt(this.collapseWidth)) {
      this.delayInitPage();
      this.delayAnimation();
    }
  },
  beforeDestroy() {
    off(this.$el, 'resize', this.resizePage);
  },
  methods: {
    /**
     * @author chenguanbin
     * @date 2020-03-28 16:10:44
     * @desc 延迟加载页面
     */
    delayInitPage() {
      this.inited = false;
      setTimeout(() => {
        this.inited = true;
      }, this.initTime);
    },

    /**
     * @author chenguanbin
     * @date 2020-03-28 16:17:11
     * @desc 一定时间内禁止动画效果
     */
    delayAnimation() {
      this.hideAnimation = true;
      setTimeout(() => {
        this.hideAnimation = false;
      }, this.initTime);
    },

    /**
     * @desc 页面宽度变化事件
     * @author chenguanbin
     */
    resizePage: throttle(function() {
      if (!this.menuExist) return;
      this.screenWidth = window.innerWidth;
      this.collapse();
    }),
    /**
     * @desc 页面宽度变化时菜单自动收起/展开
     * @author chenguanbin
     */
    collapse() {
      const collapseWidth = parseInt(this.collapseWidth);
      // 浏览器大小缩小到页面断点以内
      if (
        this.screenWidthOld >= collapseWidth &&
        this.screenWidth < collapseWidth
      ) {
        this.menuCollapse = true;
      }
      // 浏览器大小扩大到页面断点以上
      if (
        this.screenWidthOld < collapseWidth &&
        this.screenWidth >= collapseWidth
      ) {
        this.menuCollapse = false;
      }
      this.screenWidthOld = this.screenWidth;
    }
  }
};
</script>

<template>
  <component
    :is="wrapperComponent"
    ref="affix"
    :container="container"
    :offset-top="offsetTop"
    :offset-bottom="offsetBottom"
    style="text-align: right;"
  >
    <div
      :class="{ folded }"
      :style="wrapperStyle"
      class="h-anchor-wrapper"
      @mouseenter="handleMouseenter"
      @mouseleave="handleMouseleave"
    >
      <component
        :is="scrollComponent"
        ref="scrollbar"
        wrap-class="el-anchor-scrollbar__wrap"
        view-class="el-anchor-scrollbar__view"
      >
        <div
          ref="anchor"
          :class="{ 'is-folded': folded && isFolded }"
          class="h-anchor"
        >
          <div v-show="!folded || !isFolded">
            <slot />
            <span
              v-show="showInk && inkActived"
              :style="{ top: `${inkTop + 8}px`, left: '15px' }"
              class="h-anchor__ink-ball"
            />
          </div>
          <i
            v-show="folded && isFolded"
            class="h-anchor-icon h-icon-ctrl_anchor"
          />
        </div>
      </component>
    </div>
  </component>
</template>
<script>
import { scrollTop, findComponentsDownward, sharpMatcherRegx } from './util';
import { on, off, getOffset } from 'hui/src/utils/dom';

export default {
  name: 'HAnchor',
  provide() {
    return {
      anchor: this
    };
  },
  props: {
    affix: {
      /* 固定模式 */
      type: Boolean,
      default: true
    },
    height: {
      type: [Number, String],
      default: ''
    },
    offsetTop: {
      /* 固定模式下，距离窗口顶部达到指定偏移量后触发 */
      type: Number,
      default: 0
    },
    offsetBottom: {
      type: Number,
      default: -1
    } /* 固定模式下，距离窗口底部达到指定偏移量后触发 */,
    bounds: {
      /* 锚点区域边界，单位：px */
      type: Number,
      default: 5
    },
    scrollOffset: {
      /* 点击滚动的额外距离 */
      type: Number,
      default: 0
    },
    container: {
      type: [String, Object],
      default: ''
    } /* 指定滚动的容器 */,
    showInk: {
      /* 是否显示小圆点 */
      type: Boolean,
      default: false
    },
    folded: {
      /* 是否能收起面板 */
      type: Boolean,
      default: false
    },
    foldedScrollTime: {
      /* 滚动停止时，面板收起的延后时间 */
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      inkActived: false, // 小圆点是否处于激活状态
      inkTop: 0, // 小圆点top值
      animating: false, // 是否正在滚动中
      currentLink: '#', // current show link =>  #href -> currentLink = #href
      currentId: '', // current show title id =>  #href -> currentId = href
      scrollContainer: null, // 绑定滚动事件的对象，默认情况下是 window 对象
      scrollElement: null, // 滚动的元素，默认情况下是 document.documentElement || document.body
      titlesOffsetArr: [], // 锚点关联元素的位置
      wrapperTop: 0,
      scrollTop: 0,
      isFolded: false,
      isMouseEnter: false,
      timer: null,
      childWidth: null,
      minWidth: 120,
      scrollTimer: null
      // upperFirstTitle: true
    };
  },
  computed: {
    // 固定模式下使用 Affix 图钉控件
    wrapperComponent() {
      return this.affix ? 'h-affix' : 'div';
    },
    // 传入height时，为页面存在滚动条
    scrollComponent() {
      return this.height && !(this.folded && this.isFolded)
        ? 'el-scrollbar'
        : 'div';
    },
    // 锚点容器样式
    wrapperStyle() {
      const isFolded = this.folded && this.isFolded;
      const isFoldedStyle = {
        padding: '0',
        'box-shadow': 'none',
        'background-color': 'transparent'
      };
      return Object.assign(
        {
          height: this.height ? `${this.height}px` : 'inherit',
          maxHeight: this.offsetTop
            ? `calc(100vh - ${this.offsetTop}px)`
            : '100vh',
          'min-width': `${this.minWidth}px`
        },
        isFolded ? isFoldedStyle : {}
      );
    },
    // 判断绑定滚动事件的元素是否是 window
    containerIsWindow() {
      return this.scrollContainer === window;
    }
  },
  watch: {
    $route() {
      this.handleHashChange();
      this.$nextTick(() => {
        this.handleScrollTo();
      });
    },
    container() {
      this.init();
    },
    currentLink(newHref, oldHref) {
      this.$emit('on-change', newHref, oldHref);
    },
    isFolded: {
      handler(val) {
        if (!val) {
          this.$nextTick(() => {
            const offsetWidth = this.$refs.anchor.offsetWidth;
            this.minWidth = offsetWidth > 120 ? offsetWidth : 120;
          });
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.removeListener();
  },
  methods: {
    handleMouseenter(e) {
      this.isFolded = false;
      this.isMouseEnter = true;
      this.scrollTop =
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        e.target.scrollTop;
      clearTimeout(this.timer);
    },
    handleMouseleave() {
      this.isMouseEnter = false;
      this.isFolded = true;
    },
    /**
     * @desc 滚动容器的滚动事件
     * @author chenguanbin
     * @param {Event} e
     */
    handleScroll(e) {
      if (this.animating) return;

      this.updateTitleOffset();
      const scrollTop =
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        e.target.scrollTop;
      this.getCurrentScrollAtTitleId(scrollTop);

      if (this.scrollTop !== scrollTop) {
        clearTimeout(this.timer);
        this.isFolded = false;
        this.timer = setTimeout(() => {
          !this.isMouseEnter && (this.isFolded = true);
        }, this.foldedScrollTime);
      }

      this.scrollTop = scrollTop;
    },
    /**
     * @desc 浏览器路径发生变化
     * @author chenguanbin
     */
    handleHashChange() {
      const url = window.location.href;
      const sharpLinkMatch = sharpMatcherRegx.exec(url);
      if (!sharpLinkMatch) return;
      this.currentLink = sharpLinkMatch[0];
      this.currentId = sharpLinkMatch[1];
    },
    /**
     * @desc 滚动到目标锚点
     * @author chenguanbin
     */
    handleScrollTo() {
      const anchor = document.getElementById(this.currentId);
      const currentLinkElementA = document.querySelector(
        `a[data-href="${this.currentLink}"]`
      );
      let offset = this.scrollOffset;
      if (currentLinkElementA) {
        offset = parseFloat(
          currentLinkElementA.getAttribute('data-scroll-offset')
        );
      }
      if (!anchor) return;
      const offsetTop =
        getOffset(
          anchor,
          this.scrollContainer === window ? null : this.scrollContainer
        ).top -
        this.wrapperTop -
        offset;
      this.animating = true;
      scrollTop(
        this.scrollContainer,
        this.scrollElement.scrollTop,
        offsetTop,
        600,
        () => {
          this.animating = false;
        }
      );
      this.handleSetInkTop();
    },
    /**
     * @desc 设置小圆点的 top 值
     * @author chenguanbin
     */
    handleSetInkTop() {
      let currentLinkElementA = document.querySelector(
        `a[data-href="${this.currentLink}"]`
      );
      if (!currentLinkElementA) {
        const currentChild = this.titlesOffsetArr.find(item => item.active);
        if (!currentChild) {
          this.inkActived = false;
          return;
        } else {
          currentLinkElementA = document.querySelector(
            `a[data-href="${currentChild.link}"]`
          );
        }
      }
      this.inkActived = true;

      this.$nextTick(() => {
        const elementATop = getOffset(currentLinkElementA, this.$refs.anchor)
          .top;
        // const top = elementATop < 0 ? this.offsetTop : elementATop;
        // this.inkTop = top;
        this.inkTop = Math.abs(elementATop);
      });
    },
    /**
     * @desc 更新锚点关联元素的位置信息
     * @author chenguanbin
     */
    updateTitleOffset() {
      const links = findComponentsDownward(this, [
        'HAnchorLink',
        'HSubanchor'
      ]).map(link => {
        return {
          href: link.href,
          active: link.active
        };
      });
      const offsetArr = [];
      for (const link of links) {
        const id = link.href.split('#')[1];
        const titleEle = document.getElementById(id);
        if (titleEle) {
          offsetArr.push({
            link: `#${id}`,
            offset:
              getOffset(
                titleEle,
                this.scrollContainer === window ? null : this.scrollContainer
              ).top - this.scrollElement.offsetTop,
            active: link.active
          });
        }
      }
      this.titlesOffsetArr = offsetArr;
      this.handleSetScroll();
    },
    /**
     * @author xuzilong
     * @desc 设置面板内滚动条的滚动值
     */
    handleSetScroll() {
      if (!this.height) return;

      const currentLinkElementA = document.querySelector(
        `a[data-href="${this.currentLink}"]`
      );
      if (!currentLinkElementA) return;
      const offset = getOffset(currentLinkElementA, this.$refs.anchor);

      // 给个防抖，否则面板会不停跳动
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        this.$refs.scrollbar.setScroll(offset.top);
      }, 100);
    },
    /**
     * @desc 根据滚动距离，判断目前激活的锚点
     * @author chenguanbin
     * @param {Number} scrollTop 滚动距离
     */
    getCurrentScrollAtTitleId(scrollTop) {
      let i = -1;
      const len = this.titlesOffsetArr.length;
      let titleItem = {
        link: '#',
        offset: 0
      };
      scrollTop += this.bounds;
      while (++i < len) {
        const currentEle = this.titlesOffsetArr[i];
        const nextEle = this.titlesOffsetArr[i + 1];
        if (
          scrollTop >= currentEle.offset &&
          scrollTop < ((nextEle && nextEle.offset) || Infinity)
        ) {
          titleItem = this.titlesOffsetArr[i];
          break;
        }
      }
      this.currentLink = titleItem.link;
      this.handleSetInkTop();
    },
    /**
     * @desc 获取滚动的对象和元素
     *       默认情况下分别是 window、document.documentElement || document.body，若设置了 container，则两个都是 container
     * @author chenguanbin
     */
    getContainer() {
      this.scrollContainer = this.container
        ? typeof this.container === 'string'
          ? document.querySelector(this.container)
          : this.container
        : window;
      this.scrollElement = this.container
        ? this.scrollContainer
        : document.documentElement || document.body;
    },
    /**
     * @desc 移除事件监听
     * @author chenguanbin
     */
    removeListener() {
      off(this.scrollContainer, 'scroll', this.handleScroll);
      off(window, 'hashchange', this.handleHashChange);
    },
    /**
     * @desc 初始化
     * @author chenguanbin
     */
    init() {
      this.handleHashChange();
      this.$nextTick(() => {
        this.removeListener();
        this.getContainer();
        this.wrapperTop = this.containerIsWindow
          ? 0
          : this.scrollElement.offsetTop;
        this.updateTitleOffset();
        this.handleScrollTo();
        this.handleSetInkTop();
        on(this.scrollContainer, 'scroll', this.handleScroll);
        on(window, 'hashchange', this.handleHashChange);
      });
    }
  }
};
</script>

<script>
// reference https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js
import {
  addResizeListener,
  removeResizeListener
} from 'hui/src/utils/resize-event';
import scrollbarWidth from 'hui/src/utils/scrollbar-width';
import { toObject } from 'hui/src/utils/util';
import Bar from './bar.vue';
import throttle from 'throttle-debounce/throttle';
import scrollTo from 'hui/src/utils/scroll-to';
import { getStyle } from 'hui/src/utils/dom';
/* istanbul ignore next */
export default {
  name: 'ElScrollbar',

  components: { Bar },

  props: {
    native: {
      type: Boolean,
      default: null
    },
    extrusion: {
      type: Boolean,
      default: false
    },
    overflow: {
      type: String,
      default: 'auto'
    },
    overflowX: {
      type: String,
      default: 'auto'
    },
    overflowY: {
      type: String,
      default: 'auto'
    },
    size: {
      type: Number,
      default: 4
    }, // 滚动条的宽度
    opacity: {
      type: Number,
      default: 1
    }, // 滚动条透明度
    pieceOpacity: {
      type: Number,
      default: 1
    }, // 轨道透明度
    color: {
      type: String,
      default: null
    }, // 滚动条颜色，支持16进制颜色、rgb和rgba
    pieceColor: {
      type: String,
      default: null
    }, // 轨道颜色，默认透明即同容器背景色，支持16进制颜色、rgb和rgba
    wrapClass: {
      type: [Object, String],
      default: null
    },
    wrapStyle: {
      type: [Object, Array, String],
      default: () => {}
    },
    viewClass: {
      type: [Object, String],
      default: null
    },
    viewStyle: {
      type: [Object, Array, String],
      default: () => {}
    },
    noresize: {
      type: Boolean,
      default: false
    }, // 如果 container 尺寸不会发生变化，最好设置它可以优化性能
    tag: {
      type: String,
      default: 'div'
    },
    minLength: {
      // 滚动条最小长度
      type: Number,
      default: 24
    }
  },

  data() {
    return {
      sizeWidth: this.minLength,
      sizeHeight: this.minLength,
      percentX: 0,
      percentY: 0,
      gutter: 0,
      position: null
    };
  },

  computed: {
    wrap() {
      return this.$refs.wrap;
    },
    isDoubleScroll() {
      return this.showHorizontal && this.showVertical;
    },
    showHorizontal() {
      return (
        this.overflow !== 'visible' &&
        this.overflow !== 'hidden' &&
        this.overflowX !== 'visible' &&
        this.overflowX !== 'hidden' &&
        this.sizeWidth !== this.minLength
      );
    },
    showVertical() {
      return (
        this.overflow !== 'visible' &&
        this.overflow !== 'hidden' &&
        this.overflowY !== 'visible' &&
        this.overflowY !== 'hidden' &&
        this.sizeHeight !== this.minLength
      );
    }
  },

  mounted() {
    if (this.native) return;
    this.$nextTick(this.update);
    if (!this.noresize) {
      addResizeListener(this.$refs.wrap, this.throttleUpdate);
      addResizeListener(this.$refs.resize, this.throttleUpdate);
    }
    this.position = getStyle(this.wrap, 'position');
  },

  beforeDestroy() {
    if (this.native) return;
    if (!this.noresize) {
      removeResizeListener(this.$refs.wrap, this.throttleUpdate);
      removeResizeListener(this.$refs.resize, this.throttleUpdate);
    }
  },

  methods: {
    handleScroll() {
      const wrap = this.wrap;
      const percentX = wrap.scrollLeft / (wrap.scrollWidth - wrap.clientWidth);
      const percentY = wrap.scrollTop / (wrap.scrollHeight - wrap.clientHeight);
      this.percentX = percentX;
      this.percentY = percentY;
      const scrollValue = {
        scrollLeft: wrap.scrollLeft,
        scrollTop: wrap.scrollTop,
        percentX,
        percentY
      };
      this.$emit('on-scrolling-x', scrollValue);
      this.$emit('on-scrolling-y', scrollValue);
      this.$emit('on-scrolling', scrollValue);
    },
    throttleUpdate() {
      throttle(500, () => this.update(true))();
    },
    update(isThrottle) {
      this.$nextTick(() => {
        const wrap = this.wrap;
        if (!wrap) return;
        // 重新计算滚动条宽度
        this.gutter = scrollbarWidth(true);
        const heightPercentage = (wrap.clientHeight * 100) / wrap.scrollHeight;
        const widthPercentage = (wrap.clientWidth * 100) / wrap.scrollWidth;
        this.sizeHeight =
          heightPercentage < 99 ? heightPercentage + '%' : this.minLength;
        this.sizeWidth =
          widthPercentage < 99 ? widthPercentage + '%' : this.minLength;
        this.$emit('on-scrollbar-x', this.showHorizontal);
        this.$emit('on-scrollbar-y', this.showVertical);
      });
    },

    setScroll(top = -1, left = -1, duration = 120) {
      if (top > -1) {
        scrollTo(this.wrap, top, duration);
      }
      if (left > -1) {
        scrollTo(this.wrap, left, duration, true);
      }
      this.update();
    }
  },

  render(h) {
    let style = this.wrapStyle || {}; // wrapStyle 可能是 undefined，附一个默认值

    if (this.gutter) {
      const gutterWidth = `-${this.gutter}px`;
      const gutterStyle = `margin-bottom: ${gutterWidth}; margin-right: ${gutterWidth};`;
      if (Array.isArray(this.wrapStyle)) {
        style = toObject(this.wrapStyle);
        style.marginRight = style.marginBottom = gutterWidth;
      } else if (typeof this.wrapStyle === 'string') {
        style += gutterStyle;
      } else {
        style = Object.keys(style)
          .map(key => `${key}: ${style[key]};`)
          .join('');
        style += gutterStyle;
      }
      if (this.extrusion) {
        style += 'padding-right: 12px;';
      }
    }
    const view = h(
      this.tag,
      {
        class: ['el-scrollbar__view', this.viewClass],
        style: this.viewStyle,
        ref: 'resize'
      },
      this.$slots.default
    );
    const wrap = (
      <div
        ref='wrap'
        style={style}
        onScroll={this.handleScroll}
        class={[
          this.wrapClass,
          'el-scrollbar__wrap',
          this.gutter ? '' : 'el-scrollbar__wrap--hidden-default'
        ]}
      >
        {[view]}
      </div>
    );
    let nodes;
    if (!this.native) {
      nodes = [
        wrap,
        <Bar
          ref='horizontal'
          v-show={this.showHorizontal}
          percent={this.percentX}
          size={this.sizeWidth}
          width={this.size + 8}
          opacity={this.opacity}
          pieceOpacity={this.pieceOpacity}
          color={this.color}
          pieceColor={this.pieceColor}
          overflow={this.overflow}
          overflowX={this.overflowX}
          overflowY={this.overflowY}
          minLength={this.minLength}
        />,
        <Bar
          ref='vertical'
          v-show={this.showVertical}
          vertical
          percent={this.percentY}
          size={this.sizeHeight}
          width={this.size + 8}
          opacity={this.opacity}
          pieceOpacity={this.pieceOpacity}
          pieceColor={this.pieceColor}
          color={this.color}
          overflow={this.overflow}
          overflowX={this.overflowX}
          overflowY={this.overflowY}
          minLength={this.minLength}
        />
      ];
    } else {
      nodes = [
        <div
          ref='wrap'
          class={[this.wrapClass, 'el-scrollbar__wrap']}
          style={style}
        >
          {[view]}
        </div>
      ];
    }
    return h(
      'div',
      {
        class: [
          'el-scrollbar',
          {
            'is-double': this.isDoubleScroll,
            'has-gutter': this.gutter
          }
        ]
      },
      nodes
    );
  }
};
</script>

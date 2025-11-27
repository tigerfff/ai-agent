<script>
import { on, off } from 'hui/src/utils/dom';
import { renderThumbStyle, BAR_MAP } from './util';

/* istanbul ignore next */
export default {
  name: 'Bar',

  props: {
    vertical: {
      type: Boolean,
      default: null
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
      type: [String, Number],
      default: null
    },
    percent: {
      type: Number,
      default: null
    },
    width: {
      type: Number,
      default: null
    },
    opacity: {
      type: Number,
      default: null
    },
    pieceOpacity: {
      type: Number,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    pieceColor: {
      type: String,
      default: null
    },
    minLength: {
      type: Number,
      default: null
    }
  },

  data() {
    return {
      isMousewheel: false,
      timer: null,
      prevEvent: null
    };
  },

  computed: {
    bar() {
      return BAR_MAP[this.vertical ? 'vertical' : 'horizontal'];
    },

    wrap() {
      return this.$parent.wrap;
    }
  },

  destroyed() {
    off(document, 'mouseup', this.mouseUpDocumentHandler);
  },

  methods: {
    handleMousewheel() {
      if (this.isMousewheel) {
        return;
      }
      this.isMousewheel = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.isMousewheel = false;
      }, 500);
    },

    handleMouseleave() {
      this.isMousewheel = false;
    },

    clickThumbHandler(e) {
      this.prevEvent = e;
      this.startDrag(e);
      if (e.ctrlKey || e.button === 2) {
        return;
      }
      this[this.bar.axis] =
        e.currentTarget[this.bar.offset] -
        (e[this.bar.client] -
          e.currentTarget.getBoundingClientRect()[this.bar.direction]);
    },

    clickTrackHandler(e) {
      const offset = Math.abs(
        e.target.getBoundingClientRect()[this.bar.direction] -
          e[this.bar.client]
      );
      const thumbHalf = this.$refs.thumb[this.bar.offset] / 2;

      // 计算 thumb 的 percent 时
      // 除数应当为 railSize - barSize
      const thumbPositionPercentage =
        ((offset - thumbHalf) * 100) /
        (this.$refs.rail[this.bar.offset] - this.$refs.thumb[this.bar.offset]);
      this.wrap[this.bar.scroll] =
        (thumbPositionPercentage *
          (this.wrap[this.bar.scrollSize] - this.wrap[this.bar.clientSize])) /
        100;
    },

    startDrag(e) {
      e.stopImmediatePropagation();
      this.cursorDown = true;

      on(document, 'mousemove', this.mouseMoveDocumentHandler);
      on(document, 'mouseup', this.mouseUpDocumentHandler);
      document.onselectstart = () => false;
    },

    mouseMoveDocumentHandler(e) {
      if (
        this.prevEvent.clientX === e.clientX &&
        this.prevEvent.clientY === e.clientY
      ) {
        return;
      }

      if (this.cursorDown === false) return;
      // 防止选中滚动条的情况下拖动滚动条
      if (window.getSelection) {
        const selection = window.getSelection();
        if (
          selection.type === 'Range' &&
          selection.getRangeAt(0).endContainer.className ===
            'el-scrollbar__thumb'
        ) {
          return;
        }
      }
      const prevPage = this[this.bar.axis];

      if (!prevPage) return;

      const offset =
        (this.$refs.rail.getBoundingClientRect()[this.bar.direction] -
          e[this.bar.client]) *
        -1;
      const thumbClickPosition = this.$refs.thumb[this.bar.offset] - prevPage;

      // 计算 thumb 的 percent 时
      // 除数应当为 railSize - barSize
      const thumbPositionPercentage =
        ((offset - thumbClickPosition) * 100) /
        (this.$refs.rail[this.bar.offset] - this.$refs.thumb[this.bar.offset]);

      this.wrap[this.bar.scroll] =
        (thumbPositionPercentage *
          (this.wrap[this.bar.scrollSize] - this.wrap[this.bar.clientSize])) /
        100;
    },

    mouseUpDocumentHandler() {
      this.cursorDown = false;
      this[this.bar.axis] = 0;
      off(document, 'mousemove', this.mouseMoveDocumentHandler);
      document.onselectstart = null;
    },

    getBarStyle(type) {
      const style = {};
      const railSize =
        this.$refs.rail &&
        this.$refs.rail.getBoundingClientRect()[this.bar.size];
      const setVisible = () => {
        style.visibility = 'visible';
      };
      if (type === 'bar') {
        const {
          bar,
          width,
          pieceColor,
          pieceOpacity,
          vertical,
          overflow,
          overflowX,
          overflowY
        } = this;
        if (pieceOpacity) {
          style.opacity = pieceOpacity;
        }
        if (vertical && (overflowY === 'scroll' || overflow === 'scroll')) {
          setVisible();
        } else if (overflowX === 'scroll' || overflow === 'scroll') {
          setVisible();
        }
        if (width) {
          style[bar.key === 'horizontal' ? 'height' : 'width'] = width + 'px';
        }
        if (pieceColor) {
          style['background-color'] = pieceColor;
        }
        // const { _sizeMinheight, minLength } = this;
        // if (_sizeMinheight && _sizeMinheight !== 1) {
        //   // 修补滚动条放大后的影响，需要补上原有的2px
        //   style[this.bar.paddingPosition] =
        //     minLength * (1 - _sizeMinheight) + 2 + 'px';
        // }
      } else {
        const { size, bar, color, opacity, percent, minLength } = this;
        if (opacity) style.opacity = opacity;
        if (color) style['background-color'] = color;
        Object.assign(
          style,
          renderThumbStyle.call(this, {
            size,
            bar,
            minLength,
            railSize,
            percent,
            wrap: this.wrap // 滚动容器
          })
        );
      }
      return style;
    }
  },

  render() {
    const { bar } = this;
    return (
      <div
        class={[
          'el-scrollbar__bar',
          'is-' + bar.key,
          { 'is-mousewheel': this.isMousewheel }
        ]}
        onMousewheel={this.handleMousewheel}
        onMouseleave={this.handleMouseleave}
        onMousedown={this.clickTrackHandler}
        style={this.getBarStyle('bar')}
      >
        <div ref='rail' class='el-scrollbar__rail'>
          <div
            ref='thumb'
            class='el-scrollbar__thumb'
            onMousedown={this.clickThumbHandler}
            style={this.getBarStyle('thumb')}
          />
        </div>
      </div>
    );
  }
};
</script>

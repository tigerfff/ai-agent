<template>
  <div>
    <div ref="point" :class="{ 'h-affix': affix }" :style="styles">
      <slot />
    </div>
    <div v-show="slot" :style="slotStyle" />
  </div>
</template>
<script>
import { on, off } from 'hui/src/utils/dom';
import { getScroll, getOffset } from './util';

export default {
  name: 'HAffix',
  props: {
    offsetTop: {
      type: Number,
      default: 0
    },
    offsetBottom: {
      type: Number,
      default: -1
    },
    slotWidth: {
      type: Number,
      default: undefined
    },
    slotHeight: {
      type: Number,
      default: undefined
    },
    container: {
      type: [String, Object],
      default: ''
    }
  },
  data() {
    return {
      affix: false,
      styles: {},
      slot: false,
      slotStyle: {}
    };
  },
  computed: {
    offsetType() {
      let type = 'top';
      if (this.offsetBottom >= 0) {
        type = 'bottom';
      }

      return type;
    },
    scrollContainer() {
      return this.container
        ? typeof this.container === 'string'
          ? document.querySelector(this.container)
          : this.container
        : window;
    }
  },
  mounted() {
    this.handleScroll();

    on(this.scrollContainer, 'scroll', this.handleScroll);
    on(this.scrollContainer, 'resize', this.handleScroll);

    if (this.scrollContainer !== window) {
      on(window, 'resize', this.handleScroll);
      on(window, 'scroll', this.handleScroll);
    }
  },
  beforeDestroy() {
    off(this.scrollContainer, 'scroll', this.handleScroll);
    off(this.scrollContainer, 'resize', this.handleScroll);

    if (this.scrollContainer !== window) {
      off(window, 'resize', this.handleScroll);
      off(window, 'scroll', this.handleScroll);
    }
  },
  methods: {
    /**
     * @desc 响应滚动条滚动事件
     * @author chenguanbin
     */
    handleScroll() {
      const affix = this.affix;
      const scrollTop = getScroll(this.scrollContainer, true);
      const elOffset = getOffset(this.$el, this.scrollContainer);
      const windowHeight = this.container
        ? this.scrollContainer.offsetHeight
        : window.innerHeight;
      const elHeight = this.$el.getElementsByTagName('div')[0].offsetHeight;
      const containerTop = this.scrollContainer.getBoundingClientRect
        ? this.scrollContainer.getBoundingClientRect().top
        : 0;
      // Fixed Top
      if (
        elOffset.top - this.offsetTop < scrollTop &&
        this.offsetType === 'top' &&
        !affix
      ) {
        this.affix = true;
        this.slotStyle = {
          width: `${this.slotWidth || this.$refs.point.clientWidth}px`,
          height: `${this.slotHeight || this.$refs.point.clientHeight}px`
        };
        this.slot = true;
        this.styles = {
          top: `${this.offsetTop + containerTop}px`,
          left: `${elOffset.left}px`,
          width: `${this.$el.offsetWidth}px`
        };

        this.$emit('on-change', true);
      } else if (
        elOffset.top - this.offsetTop > scrollTop &&
        this.offsetType === 'top' &&
        affix
      ) {
        this.slotStyle = {};
        this.affix = false;
        this.slot = false;
        this.styles = null;

        this.$emit('on-change', false);
      } else if (this.offsetType === 'top' && affix) {
        this.slotStyle = {
          width: `${this.slotWidth || this.$refs.point.clientWidth}px`,
          height: `${this.slotHeight || this.$refs.point.clientHeight}px`
        };

        this.styles = {
          top: `${this.offsetTop + containerTop}px`,
          left: `${elOffset.left}px`,
          width: `${this.$el.offsetWidth}px`
        };
      }

      // Fixed Bottom
      const containerHeight = window.innerHeight - windowHeight - containerTop;
      if (
        elOffset.top + this.offsetBottom + elHeight >
          scrollTop + windowHeight &&
        this.offsetType === 'bottom' &&
        !affix
      ) {
        this.affix = true;
        this.slotStyle = {
          width: `${this.slotWidth || this.$refs.point.clientWidth}px`,
          height: `${this.slotHeight || this.$refs.point.clientHeight}px`
        };
        this.slot = true;
        this.styles = {
          bottom: `${this.offsetBottom + containerHeight}px`,
          left: `${elOffset.left}px`,
          width: `${this.$el.offsetWidth}px`
        };

        this.$emit('on-change', true);
      } else if (
        elOffset.top + this.offsetBottom + elHeight <
          scrollTop + windowHeight &&
        this.offsetType === 'bottom' &&
        affix
      ) {
        this.slot = false;
        this.affix = false;
        this.styles = null;

        this.$emit('on-change', false);
      } else if (this.offsetType === 'bottom' && affix) {
        this.slotStyle = {
          width: `${this.slotWidth || this.$refs.point.clientWidth}px`,
          height: `${this.slotHeight || this.$refs.point.clientHeight}px`
        };
        this.styles = {
          bottom: `${this.offsetBottom + containerHeight}px`,
          left: `${elOffset.left}px`,
          width: `${this.$el.offsetWidth}px`
        };
      }
    },
    updateAffixStyle(affixStyle) {
      if (!this.affix) return;
      const { top, bottom, left, width } = affixStyle;
      if (top !== undefined) this.styles.top = `${parseInt(top)}px`;
      if (bottom !== undefined) this.styles.bottom = `${parseInt(bottom)}px`;
      if (left !== undefined) this.styles.left = `${parseInt(left)}px`;
      if (width !== undefined) {
        this.styles.width = `${parseInt(width)}px`;
        this.slotStyle.width = `${parseInt(width)}px`;
      }
    }
  }
};
</script>

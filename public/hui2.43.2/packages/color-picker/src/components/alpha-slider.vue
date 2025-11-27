<template>
  <div
    :class="{ 'is-vertical': vertical, 'is-showAlpha': showAlpha }"
    class="h-color-alpha-slider"
  >
    <div
      ref="bar"
      :style="{
        background: background
      }"
      class="h-color-alpha-slider__bar"
      @click="handleClick"
    />
    <div
      ref="thumb"
      :style="{
        left: thumbLeft + 'px',
        top: thumbTop + 'px'
      }"
      class="h-color-alpha-slider__thumb"
    />
  </div>
</template>

<script>
import draggable from '../draggable';

export default {
  name: 'ElColorAlphaSlider',

  props: {
    color: {
      type: null,
      default: null,
      required: true
    },
    vertical: {
      type: Boolean,
      default: null
    },
    showAlpha: {
      type: Boolean,
      default: null
    }
  },

  data() {
    return {
      thumbLeft: 0,
      thumbTop: 0,
      background: null
    };
  },

  watch: {
    'color._alpha'() {
      this.update();
    },

    'color.value'() {
      this.update();
    }
  },

  mounted() {
    const { bar, thumb } = this.$refs;

    const dragConfig = {
      drag: event => {
        this.handleDrag(event);
      },
      end: event => {
        this.handleDrag(event);
      }
    };

    draggable(bar, dragConfig);
    draggable(thumb, dragConfig);
    this.update();
  },

  methods: {
    handleClick(event) {
      const thumb = this.$refs.thumb;
      const target = event.target;

      if (target !== thumb) {
        this.handleDrag(event);
      }
    },

    handleDrag(event) {
      const rect = this.$el.getBoundingClientRect();
      const { thumb } = this.$refs;

      let top = event.clientY - rect.top;
      top = Math.max(thumb.offsetHeight / 2, top);
      top = Math.min(top, rect.height - thumb.offsetHeight / 2);
      this.color.set(
        'alpha',
        Math.round(
          ((278 - (top + thumb.offsetHeight / 2)) /
            (rect.height - thumb.offsetHeight)) *
            100
        )
      );
      this.$emit('clearEditColor');
    },

    getThumbLeft() {
      if (this.vertical) return 0;
      const el = this.$el;
      const alpha = this.color._alpha;

      if (!el) return 0;
      const thumb = this.$refs.thumb;
      return Math.round(
        (alpha * (el.offsetWidth - thumb.offsetWidth / 2)) / 100
      );
    },

    getThumbTop() {
      if (!this.vertical) return 0;
      const el = this.$el;
      const alpha = this.color._alpha;

      if (!el) return 0;
      return Math.round(el.offsetHeight - (alpha * el.offsetHeight) / 100);
    },

    getBackground() {
      if (this.color && this.color.value) {
        const { r, g, b } = this.color.toRgb();
        return `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
      }
      return null;
    },

    update() {
      this.thumbTop = this.getThumbTop();
      this.background = this.getBackground();
    }
  }
};
</script>

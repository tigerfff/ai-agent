<template>
  <div
    :style="wrapperStyle"
    :class="[offline && 'is-offline', active && 'is-active']"
    class="h-svg-icon-wrapper"
  >
    <template v-if="svgs || svgs.length">
      <div
        v-for="(item, index) in icons"
        :key="index"
        :class="[svgColors[index] && 'is-show-color', svgClasses[index]]"
        :style="{ color: svgColors[index] }"
        class="h-svg-icon"
        v-html="item"
      />
    </template>
    <slot v-else />
  </div>
</template>
<script>
export default {
  name: 'HSvgIcon',
  props: {
    svgs: {
      type: [String, Array],
      default: ''
    },
    size: {
      type: [Number, String],
      default: null
    },
    offline: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    colors: {
      type: [String, Array],
      default: ''
    },
    classes: {
      type: [String, Array],
      default: ''
    }
  },
  data() {
    return {
      icons: this.svgs || this.svgs.length ? this.getIcons() : [],
      svgColors: this.colors || this.colors.length ? this.getColors() : [],
      svgClasses: this.classes || this.classes.length ? this.getClasses() : []
    };
  },
  computed: {
    wrapperStyle() {
      if (this.size) return { 'font-size': `${parseInt(this.size)}px` };
      else return {};
    }
  },
  watch: {
    svgs() {
      this.icons = this.getIcons();
    },
    colors() {
      this.svgColors = this.getColors();
    },
    classes() {
      this.svgClasses = this.getClasses();
    }
  },
  methods: {
    getIcons() {
      const iconsArray = [];
      if (Array.isArray(this.svgs)) {
        for (const icon of this.svgs) {
          iconsArray.push(this.judgeSVGType(icon));
        }
      } else {
        iconsArray.push(this.judgeSVGType(this.svgs));
      }
      return iconsArray;
    },
    judgeSVGType(icon) {
      if (icon.default) icon = icon.default;
      if (icon.includes('</svg>') || icon.includes('.svg')) {
        // 为svg文件
        return icon;
      } else {
        return icon;
      }
    },
    getColors() {
      const colorArray = [];
      if (Array.isArray(this.colors)) {
        for (const color of this.colors) {
          colorArray.push(color);
        }
      } else {
        colorArray.push(this.colors);
      }
      return colorArray;
    },
    getClasses() {
      const classArray = [];
      if (Array.isArray(this.classes)) {
        for (const className of this.classes) {
          classArray.push(className);
        }
      } else {
        classArray.push(this.classes);
      }
      return classArray;
    }
  }
};
</script>

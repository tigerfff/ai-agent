<template>
  <transition name="el-zoom-in-top" @after-leave="doDestroy">
    <div v-show="showPopper" class="h-color-dropdown">
      <div
        v-if="!isSimple"
        class="h-color-dropdown__complex-main-wrapper"
        :show-alpha="showAlpha"
        :class="{ 'is-showAlpha': showAlpha }"
      >
        <sv-panel
          ref="sl"
          :color="color"
          :show-alpha="showAlpha"
          @clearEditColor="clearEditColor"
        />
        <hue-slider
          ref="hue"
          :color="color"
          vertical
          :show-alpha="showAlpha"
          @clearEditColor="clearEditColor"
        />
        <alpha-slider
          v-if="showAlpha"
          ref="alpha"
          vertical
          :color="color"
          :show-alpha="showAlpha"
          @clearEditColor="clearEditColor"
        ></alpha-slider>

        <color-details
          ref="details"
          :color="color"
          :show-alpha="showAlpha"
          vertical
          :current-color="currentColor"
          @selectColor="selectColor"
        ></color-details>
      </div>

      <div
        v-else
        class="h-color-dropdown__simple-main-wrapper"
        :style="{ minWidth: inputWidth, maxWidth: inputWidth }"
      >
        <simple-panel
          :color-list="colorList"
          :color="color"
          @selectSimpleColor="selectSimpleColor"
        ></simple-panel>
      </div>
    </div>
  </transition>
</template>

<script>
import SvPanel from './sv-panel';
import HueSlider from './hue-slider';
import SimplePanel from './simple-panel';

import AlphaSlider from './alpha-slider';
import ColorDetails from './color-details';
import Popper from 'hui/src/utils/vue-popper';
import Locale from 'hui/src/mixins/locale';

export default {
  name: 'ElColorPickerDropdown',

  components: {
    SvPanel,
    HueSlider,
    ColorDetails,
    SimplePanel,
    AlphaSlider
  },

  mixins: [Popper, Locale],

  props: {
    color: {
      type: null,
      default: null,
      required: true
    },
    showAlpha: {
      type: Boolean,
      default: null
    },
    isSimple: {
      type: Boolean,
      default: true
    },
    colorList: {
      type: Array,
      default: null
    },
    currentColor: {
      type: String,
      default: ''
    },
    inputWidth: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      customInput: ''
    };
  },

  watch: {
    showPopper(val) {
      if (val === true) {
        this.$nextTick(() => {
          const { sl, hue, alpha } = this.$refs;
          sl && sl.update();
          hue && hue.update();
          alpha && alpha.update();
        });
      }
    }
  },

  mounted() {
    this.$parent.popperElm = this.popperElm = this.$el;
    this.referenceElm = this.$parent.$el;
  },

  methods: {
    confirmValue() {
      this.$emit('pick');
    },

    handleConfirm() {
      const valid = this.showAlpha
        ? this.validRGBA(this.customInput)
        : this.validRGBHex(this.customInput);
      if (valid) {
        this.color.fromString(this.customInput);
      } else {
        this.customInput = this.currentColor;
      }
    },

    validRGBHex(color) {
      return /^#[A-Fa-f0-9]{6}$/.test(color);
    },

    validRGBA(color) {
      const matches = color.match(
        /^rgba\((\d+), ?(\d+), ?(\d+), ?([.0-9]+)\)$/
      );
      if (!matches) return false;
      const list = matches.map(v => parseInt(v, 10)).slice(1);
      if (list.some(v => isNaN(v))) return false;
      const [r, g, b, a] = list;
      if ([r, g, b].some(v => v < 0 || v > 255) || a < 0 || a > 1) return false;
      return true;
    },
    selectSimpleColor(color) {
      this.$emit('selectSimpleColor', color);
    },
    selectColor(color) {
      this.$emit('selectColor', color);
    },
    clearEditColor() {
      this.$refs.details.clearEditColor();
    }
  }
};
</script>

<template>
  <div v-clickoutside="hide" class="h-color-picker">
    <el-input
      ref="inputColor"
      v-model="inputValue"
      class="h-color-picker__input"
      :class="{ 'is-disabled': disabled }"
      :style="innerStyle"
      :placeholder="inputPlaceholder"
      :readonly="true"
      @click.native="switchShow"
    ></el-input>
    <picker-dropdown
      ref="dropdown"
      v-model="showPicker"
      :input-width="inputWidth"
      :current-color="value"
      :placement="placement"
      :color-list="colorList"
      :is-simple="isSimple"
      :color="color"
      :show-alpha="showAlpha"
      class="h-color-picker__panel"
      :class="{ 'is-Simple': isSimple }"
      @selectSimpleColor="selectColor"
      @selectColor="selectColor"
      @pick="confirmValue"
    />
  </div>
</template>

<script>
import Color from './color';
import PickerDropdown from './components/picker-dropdown.vue';
import Clickoutside from 'hui/src/utils/clickoutside';
import ElInput from 'hui/packages/input';

export default {
  name: 'HColorPicker',

  directives: { Clickoutside },

  components: {
    PickerDropdown,
    ElInput
  },

  props: {
    value: {
      type: String,
      default: ''
    },
    showAlpha: {
      type: Boolean,
      default: false
    },
    colorFormat: {
      type: String,
      default: null
    },
    showColorText: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    defaultColor: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    colorList: {
      type: Array,
      default: () => {
        return [
          '#f30303',
          '#e92656',
          '#960fa3',
          '#3f40a9',
          '#2c84ee',
          '#00b2cd',
          '#008b7e',
          '#36a751',
          '#79be4d',
          '#c2da46',
          '#fdeb4a',
          '#ff911b'
        ];
      }
    },
    isSimple: {
      type: Boolean,
      default: false
    },
    placement: {
      type: String,
      default: 'bottom-start'
    }
  },

  data() {
    const color = new Color({
      enableAlpha: this.showAlpha,
      format: this.colorFormat
    });
    return {
      color,
      showPicker: false,
      showPanelColor: false,
      inputWidth: ''
    };
  },

  computed: {
    displayedColor() {
      if (!this.value && !this.showPanelColor) {
        return 'transparent';
      } else {
        const { r, g, b } = this.color.toRgb();
        return this.showAlpha
          ? `rgba(${r}, ${g}, ${b}, ${this.color.get('alpha') / 100})`
          : `rgb(${r}, ${g}, ${b})`;
      }
    },
    inputValue() {
      if (this.showColorText) {
        return this.value;
      }
      return '';
    },
    innerStyle() {
      if (this.defaultColor) {
        return {
          background: this.defaultColor
        };
      } else {
        return '';
      }
    },
    inputPlaceholder() {
      // 当有绑定值或缺省值时，不展示placeholder
      return this.value || this.defaultColor ? '' : this.placeholder;
    }
  },
  watch: {
    value(val) {
      if (
        !val &&
        this.defaultColor !== 'transparent' &&
        this.defaultColor !== ''
      ) {
        // 没有输入颜色 且defaultColor不为透明与空字符串时，将颜色设置为缺省颜色
        this.color.fromString(this.defaultColor);
        this.setInputColor();
      } else if (
        !val &&
        (this.defaultColor === 'transparent' || this.defaultColor === '')
      ) {
        // 没有输入颜色 且defaultColor不为透明与空字符串时，直接设置背景色为 transparent
        this.$refs.inputColor.$el.style.background = 'transparent';
        this.showPanelColor = false;
      } else if (val && val !== this.color.value) {
        this.color.fromString(val);
        this.setInputColor();
      }
    },
    color: {
      deep: true,
      handler() {
        this.showPanelColor = true;
      }
    },
    displayedColor(val) {
      this.$emit('active-change', val);
    },
    showPicker(val) {
      if (val) {
        this.inputWidth =
          this.$refs.inputColor.$el.getBoundingClientRect().width + 'px';
      }
    }
  },

  mounted() {
    const value = this.value;

    if (value) {
      this.color.fromString(value);
      this.setInputColor();
    } else if (
      this.defaultColor === '' ||
      this.defaultColor === 'transparent'
    ) {
      // 当没有输入颜色，且缺省颜色为 '' 或则 'transparent' 时，直接将背景色设置为透明
      this.color.fromString('#ffffff');
      this.$refs.inputColor.$el.style.background = 'transparent';
    } else if (this.defaultColor) {
      // 当没有输入颜色，但有缺省颜色时，设置缺省色为当前颜色
      this.color.fromString(this.defaultColor);
      this.setInputColor();
    } else {
      this.color.fromString('#ffffff');
      this.setInputColor();
    }
  },

  methods: {
    switchShow() {
      if (!this.disabled) {
        this.showPicker = !this.showPicker;
      }
    },

    confirmValue() {
      this.$emit('input', this.color.value);
      this.$emit('change', this.color.value);
      this.showPicker = false;
    },
    hide() {
      this.showPicker = false;
      this.resetColor();
    },
    resetColor() {
      this.$nextTick(() => {
        if (this.value) {
          this.color.fromString(this.value);
        } else {
          this.showPanelColor = false;
        }
      });
    },
    selectColor(color) {
      this.setInputColor();
      const outputColor = this.getOutputColor(color);
      this.showPicker = false;
      this.$emit('input', outputColor);
      this.$emit('change', outputColor);
    },
    judgeColorIsLight(rgb) {
      return 0.213 * rgb.r + 0.715 * rgb.g + 0.072 * rgb.b > 255 / 2;
    },
    setInputColor() {
      const rgbColor = this.color.toRgb();
      const islight = this.judgeColorIsLight(rgbColor);
      this.$refs.inputColor.$el.children[0].style.color = islight
        ? '#000'
        : '#fff';
      this.$refs.inputColor.$el.children[0].style.background = this.color.value;
    },
    getOutputColor(color) {
      // 需求：当rgba场景下，当透明度为1时，控制输出的颜色格式
      let outputColor = null;
      if (this.isSimple) {
        outputColor = color;
      } else {
        if (this.showAlpha && this.color._alpha === 100) {
          outputColor = this.color.rgbToHex();
        } else {
          outputColor = color.value;
        }
      }
      return outputColor;
    }
  }
};
</script>

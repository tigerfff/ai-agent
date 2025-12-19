<template>
  <div class="h-color-details">
    <div class="h-color-details-contrast">
      {{ t('el.colorpicker.new_name') }}
      <div>
        <div
          class="h-color-details-contrast-color h-color-details-contrast__newColor"
          :style="{ background: newColor }"
        ></div>
        <div
          class="h-color-details-contrast-color h-color-details-contrast__currentColor"
          :style="{ background: currentColor }"
        ></div>
      </div>
      {{ t('el.colorpicker.current_name') }}
    </div>
    <div class="h-color-details-numerical">
      <div class="h-color-details-numerical-rgb-hsb-group">
        <div class="h-color-details-numerical-rgb">
          <div class="h-color-details-numerical__input">
            <el-input
              v-model="rgbColor.r"
              size="mini"
              :maxlength="3"
              @blur="inputRgb"
            >
              <template slot="prepend"><span class="">R</span></template>
            </el-input>
          </div>
          <div class="h-color-details-numerical__input">
            <el-input
              v-model="rgbColor.g"
              size="mini"
              :maxlength="3"
              @blur="inputRgb"
            >
              <template slot="prepend"><span class="">G</span></template>
            </el-input>
          </div>
          <div class="h-color-details-numerical__input">
            <el-input
              v-model="rgbColor.b"
              size="mini"
              :maxlength="3"
              @blur="inputRgb"
            >
              <template slot="prepend"><span class="">B</span></template>
            </el-input>
          </div>
          <div v-if="showAlpha" class="h-color-details-numerical__input">
            <el-input
              v-model="rgbColor.a"
              size="mini"
              :maxlength="4"
              @focus="inputRgb"
              @blur="inputRgb"
            >
              <template slot="prepend"><span class="">A</span></template>
            </el-input>
          </div>
        </div>

        <div class="h-color-details-numerical-hsb">
          <div class="h-color-details-numerical__input">
            <el-input
              v-model="hslColor.h"
              size="mini"
              :maxlength="3"
              @blur="inputHsl"
            >
              <template slot="prepend"><span class="">H</span></template>
            </el-input>
          </div>
          <div class="h-color-details-numerical__input">
            <el-input
              v-model="hslColor.s"
              size="mini"
              :maxlength="4"
              @blur="inputHsl"
            >
              <template slot="prepend"><span class="">S</span></template>
            </el-input>
          </div>
          <div class="h-color-details-numerical__input">
            <el-input
              v-model="hslColor.l"
              size="mini"
              :maxlength="4"
              @blur="inputHsl"
            >
              <template slot="prepend"><span class="">L</span></template>
            </el-input>
          </div>
          <div v-if="showAlpha" class="h-color-details-numerical__input">
            <el-input
              v-model="hslColor.a"
              size="mini"
              :maxlength="4"
              @focus="inputHsl"
              @blur="inputHsl"
            >
              <template slot="prepend"><span class="">A</span></template>
            </el-input>
          </div>
        </div>
      </div>

      <div class="h-color-details-numerical-hex">
        <div class="h-color-details-numerical__input">
          <el-input
            v-model="hexColor"
            size="mini"
            :maxlength="6"
            @focus="inputHex"
            @blur="inputHex"
          >
            <template slot="prepend"><span class="">#</span></template>
          </el-input>
        </div>
      </div>
    </div>
    <div class="h-color-details-button">
      <el-button type="primary" @click="confirmValue">
        {{ t('el.colorpicker.confirm') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import ElInput from 'hui/packages/input';
import ElButton from 'hui/packages/button';
import Locale from 'hui/src/mixins/locale';
export default {
  name: 'ElColorDetails',

  components: {
    ElInput,
    ElButton
  },
  mixins: [Locale],
  props: {
    color: {
      type: null,
      default: null,
      required: true
    },
    currentColor: {
      type: String,
      default: ''
    },
    showAlpha: {
      type: Boolean,
      default: null
    }
  },

  data() {
    return {
      hexColor: '', // 进制颜色
      rgbColor: {
        r: '',
        g: '',
        b: '',
        a: 1
      },
      hslColor: {
        h: '',
        s: '',
        l: '',
        a: 1
      },
      newColor: '',
      editColor: ''
    };
  },
  computed: {
    cacheHslColor() {
      return JSON.parse(JSON.stringify(this.hslColor));
    },
    cacheRgbColor() {
      return JSON.parse(JSON.stringify(this.rgbColor));
    }
  },

  watch: {
    color: {
      deep: true,
      immediate: true,

      handler(val) {
        this.hexColor = this.showAlpha
          ? this.color.rgbToHex().split('#')[1]
          : this.color.value.split('#')[1];
        this.newColor = this.showAlpha
          ? this.color.rgbToHex()
          : this.color.value;
        if (this.showAlpha) {
          const matches = this.color.value.match(
            /^rgba\((\d+), ?(\d+), ?(\d+), ?([.0-9]+)\)$/
          );

          const list = matches.map(v => parseFloat(v, 10)).slice(1);
          this.rgbColor = {
            r: list[0],
            g: list[1],
            b: list[2],
            a: list[3]
          };
        } else {
          this.rgbColor = { ...this.color.toRgb() };
        }
        const hslColorData = [...this.color.toHsl()];

        this.hslColor = this.showAlpha
          ? this.color.toHsla()
          : {
              h: Number(hslColorData[0]).toFixed(0),
              s: Number(hslColorData[1] * 100).toFixed(0) + '%',
              l: Number(hslColorData[2] * 100).toFixed(0) + '%'
            };
        this.newColor = val.value;
      }
    },
    hexColor(val, oldvalue) {
      if (val !== oldvalue && this.editColor === 'hex') {
        if (this.validHex(val)) {
          this.color.fromString('#' + val);
        }
      }
    },
    cacheRgbColor: {
      handler(color, oldvalue) {
        if (
          JSON.stringify(color) !== JSON.stringify(oldvalue) &&
          this.editColor === 'rgb'
        ) {
          if (this.validRgbColor(color)) {
            this.color.fromString(
              `rgb(${color.r},${color.g},${color.b},${color.a})`
            );
          }
        }
      },
      deep: true
    },
    cacheHslColor: {
      handler(color, oldvalue) {
        if (oldvalue.h === '' && oldvalue.l === '' && oldvalue.a === '') return;
        if (
          JSON.stringify(color) !== JSON.stringify(oldvalue) &&
          this.editColor === 'hsl'
        ) {
          if (this.validHslColor(color)) {
            this.color.fromString(
              `hsl(${color.h},${color.s},${color.l},${color.a})`
            );
          }
        }
      },
      deep: true
    }
  },
  methods: {
    inputRgb() {
      this.editColor = 'rgb';
      // 重新控制变量的值
      let { r, g, b } = this.rgbColor;
      r = parseInt(r, 10);
      g = parseInt(g, 10);
      b = parseInt(b, 10);
      this.rgbColor.r = isNaN(r) ? 0 : Math.min(Math.max(r, 0), 255);
      this.rgbColor.g = isNaN(g) ? 0 : Math.min(Math.max(g, 0), 255);
      this.rgbColor.b = isNaN(b) ? 0 : Math.min(Math.max(b, 0), 255);
    },
    inputHsl() {
      this.editColor = 'hsl';
      // 重新控制变量的值
      let { h, s, l } = this.hslColor;
      h = parseInt(h, 10);
      s = parseInt(s, 10);
      l = parseInt(l, 10);
      this.hslColor.h = isNaN(h) ? 0 : Math.min(Math.max(h, 0), 360);
      this.hslColor.s = isNaN(s) ? '0%' : Math.min(Math.max(s, 0), 100) + '%';
      this.hslColor.l = isNaN(l) ? '0%' : Math.min(Math.max(l, 0), 100) + '%';
    },
    inputHex() {
      this.editColor = 'hex';
      if (!this.validHex(this.hexColor)) {
        this.hexColor = this.showAlpha
          ? this.color.rgbToHex().split('#')[1]
          : this.color.value.split('#')[1];
      }
    },
    clearEditColor() {
      this.editColor = '';
    },
    confirmValue() {
      this.$emit('selectColor', this.color);
    },
    validHex(color) {
      return /^[A-Fa-f0-9]{6}$/.test(color);
    },
    validRgbColor(color) {
      const { r, g, b, a } = color;
      let newArr = [r, g, b];
      const numReg = /^(0|[1-9]\d*)$/;
      const aReg = /^(0\.[0-9]{0,2}|0|1)$/;
      if (newArr.some(item => !numReg.test(item))) return false;
      newArr = newArr.map(item => parseInt(item, 10));
      if (newArr.some(v => v < 0 || v > 255)) return false;
      if (this.showAlpha && (!aReg.test(a) || /\.$/.test(a))) return false;
      return true;
    },
    validHslColor(color) {
      const { h, s, l, a } = color;
      const numReg = /^(0|[1-9]\d*)%$/;
      const aReg = /^(0\.[0-9]{0,2}|0|1)$/; // /^(0\.[0-9]{0,2}|0|1)$/
      let slArr = [s, l];
      if (slArr.some(item => !numReg.test(item))) return false; // sl 都为百分数
      if (
        !/^(0|[1-9]\d*)$/.test(h) ||
        (/^(0|[1-9]\d*)$/.test(h) && parseInt(h, 10) > 360)
      )
        return false; // h 没有百分数
      slArr = slArr.map(v => v.split('%')[0]).map(v => parseInt(v, 10));
      if (slArr.some(v => v < 0 || v > 100)) return false;
      if (this.showAlpha && (!aReg.test(a) || /\.$/.test(a))) return false;
      return true;
    }
  }
};
</script>

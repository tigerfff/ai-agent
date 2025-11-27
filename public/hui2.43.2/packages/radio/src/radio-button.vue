<template>
  <label
    :class="[
      size ? 'el-radio-button--' + size : '',
      { 'is-checked': value === label },
      { 'is-disabled': isDisabled },
      { 'is-simple': isSimple }
    ]"
    class="el-radio-button"
  >
    <input
      v-model="value"
      :value="label"
      :name="name"
      :disabled="isDisabled"
      class="el-radio-button__orig-radio"
      type="radio"
    />
    <span
      :title="titleLabel"
      :style="buttonStyle"
      class="el-radio-button__inner"
      @mouseover="handleMouseover"
    >
      <slot />
      <template v-if="!$slots.default">
        {{ label }}
      </template>
    </span>
  </label>
</template>
<script>
export default {
  name: 'ElRadioButton',
  props: {
    maxWidth: {
      type: Number,
      default: 256
    },
    label: {
      type: null,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      titleLabel: '',
      isIE: false
    };
  },
  computed: {
    isSimple() {
      return this._radioGroup.type === 'simple';
    },
    value: {
      get() {
        return this._radioGroup.value;
      },
      set(value) {
        this._radioGroup.$emit('input', value);
      }
    },
    _radioGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.componentName !== 'ElRadioGroup') {
          parent = parent.$parent;
        } else {
          return parent;
        }
      }
      return false;
    },
    buttonStyle() {
      const isActive = this._radioGroup.value === this.label;
      let style = {
        'max-width': this.maxWidth + 'px'
      };
      if (isActive) {
        style = Object.assign(style, {
          backgroundColor: this._radioGroup.fill || '',
          borderColor: this._radioGroup.fill || '',
          boxShadow: this._radioGroup.fill
            ? `-1px 0 0 0 ${this._radioGroup.fill}`
            : '',
          color: this._radioGroup.textColor || ''
        });
      }
      return style;
    },
    size() {
      return this._radioGroup.size;
    },
    isDisabled() {
      return this.disabled || this._radioGroup.disabled;
    }
  },
  mounted() {
    // ie兼容
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIE = true;
    }
  },
  methods: {
    handleMouseover(e) {
      const t = e.target;
      if (t.tagName === 'SPAN') {
        if (t.scrollWidth > t.clientWidth || this.isIE) {
          this.titleLabel = t.innerText;
        } else {
          this.titleLabel = '';
        }
      }
    }
  }
};
</script>

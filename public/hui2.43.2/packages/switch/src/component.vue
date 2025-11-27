<template>
  <label
    :class="[
      size ? 'el-switch--' + size : '',
      {
        'is-disabled': disabled,
        'is-checked': checked
      }
    ]"
    class="el-switch"
  >
    <div v-show="disabled" class="el-switch__mask" />
    <div
      v-if="inactiveText"
      class="el-switch__label el-switch__label--left"
      :class="[!checked ? 'is-active' : '']"
    >
      <i v-if="inactiveIconClass" :class="[inactiveIconClass]"></i>
      <span>
        {{ inactiveText }}
      </span>
    </div>
    <input
      ref="input"
      :class="{ 'allow-focus': allowFocus }"
      :name="name"
      :true-value="activeValue"
      :false-value="inactiveValue"
      :disabled="disabled"
      class="el-switch__input"
      type="checkbox"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <span
      ref="core"
      :style="{ width: coreWidth + 'px' }"
      class="el-switch__core"
      @click="setFocus"
    >
      <span :style="{ transform }" class="el-switch__button" />
    </span>
    <div
      v-if="activeText"
      class="el-switch__label el-switch__label--right"
      :class="[checked ? 'is-active' : '']"
    >
      <i v-if="activeIconClass" :class="[activeIconClass]"></i>
      <span>
        {{ activeText }}
      </span>
    </div>
    <span v-if="instruction" class="el-switch__instruction">
      {{ instruction }}
    </span>
  </label>
</template>

<script>
export default {
  name: 'ElSwitch',
  props: {
    value: {
      type: [Boolean, String, Number],
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 0
    },
    activeText: {
      type: String,
      default: ''
    },
    inactiveText: {
      type: String,
      default: ''
    },
    activeIconClass: {
      type: String,
      default: ''
    },
    inactiveIconClass: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium'
    },
    instruction: {
      type: String,
      default: null
    },
    activeColor: {
      type: String,
      default: ''
    },
    inactiveColor: {
      type: String,
      default: ''
    },
    activeValue: {
      type: [Boolean, String, Number],
      default: true
    },
    inactiveValue: {
      type: [Boolean, String, Number],
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    allowFocus: {
      type: Boolean,
      default: false
    },
    beforeChange: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      coreWidth: this.width
    };
  },
  computed: {
    checked() {
      return this.value === this.activeValue;
    },
    transform() {
      if (this.size === 'small') {
        return this.checked
          ? `translate(${this.coreWidth - 18}px, 1px)`
          : 'translate(2px, 1px)';
      } else if (this.size === 'mini') {
        return this.checked
          ? `translate(${this.coreWidth - 14}px, 1px)`
          : 'translate(2px, 1px)';
      }
      return this.checked
        ? `translate(${this.coreWidth - 22}px, 1px)`
        : 'translate(2px, 1px)';
    }
  },
  watch: {
    checked() {
      this.$refs.input.checked = this.checked;
      if (this.activeColor || this.inactiveColor) {
        this.setBackgroundColor();
      }
    }
  },
  created() {
    if (!~[this.activeValue, this.inactiveValue].indexOf(this.value)) {
      this.$emit('input', this.inactiveValue);
    }
  },
  mounted() {
    /* istanbul ignore if */
    if (this.width === 0) {
      this.coreWidth = 48;
      if (this.size === 'medium') {
        this.coreWidth = 48;
      } else if (this.size === 'small') {
        this.coreWidth = 40;
      } else if (this.size === 'mini') {
        this.coreWidth = 32;
      }
    }
    if (this.activeColor || this.inactiveColor) {
      this.setBackgroundColor();
    }
    this.$refs.input.checked = this.checked;
  },
  methods: {
    handleChange() {
      // 判断是否存在beforeChange
      if (this.beforeChange) {
        this.beforeChange(
          this.checked ? this.activeValue : this.inactiveValue,
          () => {
            this.change();
          }
        );
      } else {
        this.change();
      }
    },
    change() {
      this.$emit(
        'input',
        !this.checked ? this.activeValue : this.inactiveValue
      );
      this.$emit(
        'change',
        !this.checked ? this.activeValue : this.inactiveValue
      );
      this.$nextTick(() => {
        // set input's checked property
        // in case parent refuses to change component's value
        this.$refs.input.checked = this.checked;
      });
    },
    setBackgroundColor() {
      const newColor = this.checked ? this.activeColor : this.inactiveColor;
      this.$refs.core.style.borderColor = newColor;
      this.$refs.core.style.backgroundColor = newColor;
    },
    setFocus() {
      // set focus on input
      if (this.allowFocus) {
        this.$refs.input.focus();
      }
    },
    handleBlur(event) {
      if (this.allowFocus) {
        this.$emit('blur', event);
      }
    },
    handleFocus(event) {
      if (this.allowFocus) {
        this.$emit('focus', event);
      }
    }
  }
};
</script>

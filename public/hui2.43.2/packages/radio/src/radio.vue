<template>
  <label
    :class="[
      radioSize ? 'el-radio--' + radioSize : '',
      { 'is-disabled': isDisabled },
      { 'is-focus': focus },
      { 'is-checked': model === label }
    ]"
    :aria-checked="model === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    class="el-radio"
    :style="{ 'max-width': maxWidth + 'px' }"
    role="radio"
    @keydown.space.stop.prevent="model = isDisabled ? model : label"
  >
    <span
      :class="{
        'is-disabled': isDisabled,
        'is-checked': model === label
      }"
      class="el-radio__input"
    >
      <span class="el-radio__inner" />
      <input
        ref="radio"
        v-model="model"
        :value="label"
        :name="name"
        :disabled="isDisabled"
        class="el-radio__original"
        type="radio"
        tabindex="-1"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
      />
    </span>
    <span v-if="icon" class="el-radio__icon">
      <i :class="icon" />
    </span>
    <span class="el-radio__label">
      <slot />
      <template v-if="!$slots.default">
        {{ label }}
      </template>
    </span>
  </label>
</template>
<script>
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElRadio',

  mixins: [Emitter],

  componentName: 'ElRadio',

  props: {
    maxWidth: {
      type: Number,
      default: 256
    },
    value: {
      type: null,
      default: null
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
    },
    plain: {
      type: Boolean,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      focus: false,
      titleLabel: ''
    };
  },
  computed: {
    isGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.componentName !== 'ElRadioGroup') {
          parent = parent.$parent;
        } else {
          // this._radioGroup = parent;
          return true;
        }
      }
      return false;
    },

    model: {
      get() {
        return this.isGroup ? this._radioGroup.value : this.value;
      },

      set(val) {
        if (this.isGroup) {
          this.dispatch('ElRadioGroup', 'input', [val]);
        } else {
          this.$emit('input', val);
        }
        this.$refs.radio &&
          (this.$refs.radio.checked = this.model === this.label);
      }
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    radioSize() {
      const temRadioSize =
        this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      return this.isGroup
        ? this._radioGroup.radioGroupSize || temRadioSize
        : temRadioSize;
    },
    isDisabled() {
      return this.isGroup
        ? this._radioGroup.disabled || this.disabled
        : this.disabled;
    },

    tabIndex() {
      return !this.isDisabled
        ? this.isGroup
          ? this.model === this.label
            ? 0
            : -1
          : 0
        : -1;
    }
  },
  created() {
    if (this.$parent.$options.componentName === 'ElRadioGroup') {
      this._radioGroup = this.$parent;
    }
  },

  methods: {
    handleChange() {
      this.$nextTick(() => {
        this.$emit('change', this.model);
        this.isGroup &&
          this.dispatch('ElRadioGroup', 'handleChange', this.model);
      });
    }
  }
};
</script>

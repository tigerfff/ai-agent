<template>
  <label
    :class="[
      size ? 'el-checkbox-button--' + size : '',
      { 'is-disabled': isDisabled },
      { 'is-checked': isChecked },
      { 'is-focus': focus },
      { 'is-simple': isSimple }
    ]"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    class="el-checkbox-button"
    role="checkbox"
  >
    <input
      v-if="trueLabel || falseLabel"
      v-model="model"
      :name="name"
      :disabled="isDisabled"
      :true-value="trueLabel"
      :false-value="falseLabel"
      class="el-checkbox-button__orig-checkbox"
      type="checkbox"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false"
    />
    <input
      v-else
      v-model="model"
      :name="name"
      :disabled="isDisabled"
      :value="label"
      class="el-checkbox-button__orig-checkbox"
      type="checkbox"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false"
    />

    <span
      v-if="$slots.default || label"
      :style="isChecked ? activeStyle : null"
      class="el-checkbox-button__inner"
    >
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
<script>
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElCheckboxButton',

  mixins: [Emitter],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },

  props: {
    value: {
      type: [String, Number, Boolean],
      default: undefined
    },
    label: {
      type: [String, Number, Boolean],
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: null
    },
    checked: {
      type: Boolean,
      default: null
    },
    name: {
      type: String,
      default: undefined
    },
    trueLabel: {
      type: [String, Number],
      default: undefined
    },
    falseLabel: {
      type: [String, Number],
      default: undefined
    }
  },

  data() {
    return {
      selfModel: false,
      focus: false,
      isLimitExceeded: false
    };
  },
  computed: {
    isSimple() {
      return this._checkboxGroup.type === 'simple';
    },
    model: {
      get() {
        return this._checkboxGroup
          ? this.store
          : this.value !== undefined
          ? this.value
          : this.selfModel;
      },

      set(val) {
        if (this._checkboxGroup) {
          this.isLimitExceeded = false;
          this._checkboxGroup.min !== undefined &&
            val.length < this._checkboxGroup.min &&
            (this.isLimitExceeded = true);

          this._checkboxGroup.max !== undefined &&
            val.length > this._checkboxGroup.max &&
            (this.isLimitExceeded = true);

          this.isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);
        } else if (this.value !== undefined) {
          this.$emit('input', val);
        } else {
          this.selfModel = val;
        }
      }
    },

    isChecked() {
      if ({}.toString.call(this.model) === '[object Boolean]') {
        return this.model;
      } else if (Array.isArray(this.model)) {
        return this.model.indexOf(this.label) > -1;
      } else if (this.model !== null && this.model !== undefined) {
        return this.model === this.trueLabel;
      }
      return false;
    },

    _checkboxGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.componentName !== 'ElCheckboxGroup') {
          parent = parent.$parent;
        } else {
          return parent;
        }
      }
      return false;
    },

    store() {
      return this._checkboxGroup ? this._checkboxGroup.value : this.value;
    },

    activeStyle() {
      return {
        backgroundColor: this._checkboxGroup.fill || '',
        borderColor: this._checkboxGroup.fill || '',
        color: this._checkboxGroup.textColor || '',
        'box-shadow': '-1px 0 0 0 ' + this._checkboxGroup.fill
      };
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },

    size() {
      return (
        this._checkboxGroup.checkboxGroupSize ||
        this._elFormItemSize ||
        (this.$ELEMENT || {}).size
      );
    },

    isDisabled() {
      return this._checkboxGroup
        ? this._checkboxGroup.disabled ||
            this.disabled ||
            (this.elForm || {}).disabled
        : this.disabled || (this.elForm || {}).disabled;
    }
  },

  created() {
    this.checked && this.addToStore();
  },
  methods: {
    addToStore() {
      if (Array.isArray(this.model) && this.model.indexOf(this.label) === -1) {
        this.model.push(this.label);
      } else {
        this.model = this.trueLabel || true;
      }
    },
    handleChange(ev) {
      if (this.isLimitExceeded) return;
      let value;
      if (ev.target.checked) {
        value = this.trueLabel === undefined ? true : this.trueLabel;
      } else {
        value = this.falseLabel === undefined ? false : this.falseLabel;
      }
      this.$emit('change', value, ev);
      this.$nextTick(() => {
        if (this._checkboxGroup) {
          this.dispatch('ElCheckboxGroup', 'change', [
            this._checkboxGroup.value
          ]);
        }
      });
    }
  }
};
</script>

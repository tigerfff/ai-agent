<script>
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElCheckboxGroup',

  componentName: 'ElCheckboxGroup',

  mixins: [Emitter],

  inject: {
    elFormItem: {
      default: ''
    }
  },

  props: {
    value: {
      type: Array,
      default: function() {
        return [];
      }
    },
    disabled: {
      type: Boolean,
      default: null
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Infinity
    },
    size: {
      type: String,
      default: 'medium'
    },
    fill: {
      type: String,
      default: undefined
    },
    textColor: {
      type: String,
      default: undefined
    },
    type: {
      type: String,
      default: 'default'
    },
    vertical: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    checkboxGroupSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    }
  },

  watch: {
    value(value) {
      this.dispatch('ElFormItem', 'el.form.change', [value]);
    }
  }
};
</script>

<template>
  <div
    class="el-checkbox-group"
    role="group"
    aria-label="checkbox-group"
    :class="{ 'el-checkbox-group--vertical': vertical }"
  >
    <slot />
  </div>
</template>

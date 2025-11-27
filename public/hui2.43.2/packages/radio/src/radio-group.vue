<template>
  <div class="el-radio-group">
    <slot />
  </div>
</template>
<script>
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElRadioGroup',

  componentName: 'ElRadioGroup',

  mixins: [Emitter],

  props: {
    value: {
      type: null,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    fill: {
      type: String,
      default: null
    },
    textColor: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'default'
    }
  },
  watch: {
    value(value) {
      this.dispatch('ElFormItem', 'el.form.change', [this.value]);
      this.$emit('change', this.value);
    }
  }
};
</script>

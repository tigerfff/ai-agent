<template>
  <el-time-picker
    ref="reference"
    v-model="value"
    :format="format"
    :value-format="valueFormat"
    :picker-options="pickerOptions"
    is-range
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script type="text/babel">
export default {
  props: {
    format: {
      type: String,
      default: null
    },
    valueFormat: {
      type: String,
      default: null
    },
    pickerOptions: {
      type: null,
      default: null
    }
  },
  data() {
    return {
      value: []
    };
  },
  methods: {
    handleChange() {},
    handleInput() {},
    handleFocus() {},
    handleBlur() {}
  }
};
</script>

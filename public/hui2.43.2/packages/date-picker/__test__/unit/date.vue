<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    :format="format"
    :value-format="valueFormat"
    :picker-options="pickerOptions"
    type="date"
    placeholder="请选择日期"
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
      value: new Date('2019-08-09')
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

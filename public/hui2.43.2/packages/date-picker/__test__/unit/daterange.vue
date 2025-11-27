<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    :format="format"
    :value-format="valueFormat"
    :picker-options="pickerOptions"
    type="daterange"
    placeholder="-"
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
      value: [new Date('2018-08-09'), new Date('2019-10-10')]
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

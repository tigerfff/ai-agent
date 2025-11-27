<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    :default-time="defaultTime"
    type="datetime"
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
    defaultTime: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      value: ''
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

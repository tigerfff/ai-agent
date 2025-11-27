<template>
  <el-time-select
    ref="reference"
    v-model="value"
    :picker-options="{
      start: '08:30',
      step: '00:15',
      end: '18:30'
    }"
    placeholder="请选择时间"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script type="text/babel">
export default {
  data() {
    return {
      value: '09:30'
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

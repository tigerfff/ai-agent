<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    type="dates"
    placeholder="请选择日期"
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
      value: [new Date('2019-09-09'), new Date('2019-09-10')]
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

<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    type="week"
    placeholder="-"
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
      value: new Date('2019-09-09')
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

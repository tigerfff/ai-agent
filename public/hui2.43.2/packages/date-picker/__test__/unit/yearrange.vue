<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    type="yearrange"
    format="yyyy"
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
      value: [new Date('2018-02-01'), new Date('2019-08-01')]
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

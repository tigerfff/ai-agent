<template>
  <el-time-picker
    ref="reference"
    v-model="value"
    :unlink="unlink"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script type="text/babel">
import moment from 'moment';
export default {
  props: {
    unlink: {
      type: Boolean,
      default: null
    }
  },
  data() {
    return {
      value: moment('2019-09-09 09:09:09', 'YYYY/MM/DD HH:mm:ss')
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

<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    :default-time="defaultTime"
    :format="format"
    :value-format="valueFormat"
    type="datetimerange"
    placeholder="-"
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
    defaultTime: {
      type: Array,
      default: null
    },
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
      value: [
        moment(new Date('2018/05/05 02:02:02')),
        moment(new Date('2019/06/06 08:08:08'))
      ]
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

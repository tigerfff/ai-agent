<template>
  <el-date-picker
    ref="reference"
    v-model="value"
    type="date"
    placeholder="请选择日期"
  >
    <template slot="year" slot-scope="{ value }">
      <span
        :class="['custom-cell', { tag: new Date().getFullYear() === value }]"
      >
        {{ value }}
      </span>
    </template>
    <template slot="month" slot-scope="{ value }">
      <span :class="['custom-cell', { tag: new Date().getMonth() === value }]">
        {{ value }}
      </span>
    </template>
    <template slot="date" slot-scope="{ value }">
      <span :class="['custom-cell', { tag: new Date().getDate() === value }]">
        {{ value }}
      </span>
    </template>
  </el-date-picker>
</template>

<script type="text/babel">
export default {
  props: {
    format: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      value: new Date('2019-08-09')
    };
  }
};
</script>

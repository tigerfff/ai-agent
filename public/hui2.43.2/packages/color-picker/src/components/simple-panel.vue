<template>
  <div
    class="h-color-simple-panel"
    :style="{ minWidth: minWidth, maxWidth: maxWidth }"
  >
    <el-scrollbar wrap-class="h-colorPicker-scrollbar-wrap">
      <div class="h-color-simple-panel-wrapper">
        <div
          v-for="(itemColor, index) in colorList"
          :key="index"
          class="h-color-simple-panel-item"
          :style="{
            background: itemColor,
            border:
              itemColor === color.value.toLowerCase() ? '2px solid black' : ''
          }"
          @click="selectSimpleColor(itemColor)"
        ></div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import ElScrollbar from 'hui/packages/scrollbar';

export default {
  nameL: 'ElColorSimplePanel',
  components: {
    ElScrollbar
  },
  props: {
    colorList: {
      type: Array,
      default: null
    },
    color: {
      type: null,
      default: null,
      required: true
    }
  },

  data() {
    return {
      minWidth: '',
      maxWidth: ''
    };
  },
  methods: {
    selectSimpleColor(color) {
      this.color.fromString(color);
      this.$emit('selectSimpleColor', color);
    }
  }
};
</script>

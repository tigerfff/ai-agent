<template>
  <div 
    class="img-canvas-mock" 
    :style="{ width: typeof width === 'number' ? width + 'px' : width, height: typeof height === 'number' ? height + 'px' : height }"
  >
    <img :src="url" alt="demo-img" style="width: 100%; height: 100%; object-fit: cover;" />
    <!-- Mock AI Info or coordinates if needed in the future -->
    <div v-if="aiInfo || ruleInfo || info" class="mock-overlay" style="position: absolute; top: 0; left: 0; pointer-events: none; color: red; font-size: 10px;">
      [Mock Overlay]
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImgCanvasMock',
  props: {
    url: {
      type: String,
      default: ''
    },
    aiInfo: {
      type: Array,
      default: () => [],
    },
    ruleInfo: {
      type: Array,
      default: () => [],
    },
    ruleInfo: {
      type: Array,
      default: () => [],
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    height: {
      type: [Number, String],
      default: 'auto'
    }
  }
};
</script>

<style scoped>
.img-canvas-mock {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: #f0f0f0;
}
</style>


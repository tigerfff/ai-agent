<template>
  <el-dialog
    :title="title"
    :visible.sync="localVisible"
    width="1000px"
    append-to-body
    custom-class="image-draw-viewer-mock"
    @close="handleClose"
  >
    <div class="viewer-container">
      <!-- 左侧图片展示区 -->
      <div class="image-main">
        <div class="store-header" v-if="storeName">
          <i class="h-icon-location"></i> {{ storeName }}
        </div>
        <div class="image-wrapper" v-if="currentPic">
          <img :src="currentPic.picUrl" alt="preview" class="main-img" />
        </div>
        <!-- 底部缩略图/切换 -->
        <div class="image-nav" v-if="picArr && picArr.length > 1">
          <div 
            v-for="(pic, idx) in picArr" 
            :key="idx" 
            class="nav-item"
            :class="{ active: currentSelectIndex === idx }"
            @click="$emit('update:currentSelectIndex', idx)"
          >
            <img :src="pic.picUrl" />
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏插槽 -->
      <div class="aside-panel">
        <slot name="rightAside" :pic="currentPic"></slot>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ImageDrawViewerMock',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    picArr: { type: Array, default: () => [] },
    currentSelectIndex: { type: Number, default: 0 },
    currentSecondSelectIndex: { type: Number, default: 0 },
    storeName: { type: String, default: '' },
    models: { type: Array, default: () => [] },
    deletable: { type: Boolean, default: false },
    contentDec: { type: String, default: '' }
  },
  data() {
    return {
      localVisible: this.visible
    };
  },
  computed: {
    currentPic() {
      return this.picArr[this.currentSelectIndex] || null;
    }
  },
  watch: {
    visible(val) {
      this.localVisible = val;
    },
    localVisible(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
.viewer-container {
  display: flex;
  height: 600px;
  background: #1a1a1a;
  color: #fff;

  .image-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    position: relative;

    .store-header {
      margin-bottom: 10px;
      font-size: 16px;
    }

    .image-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      
      .main-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }

    .image-nav {
      height: 80px;
      display: flex;
      gap: 10px;
      padding-top: 10px;
      justify-content: center;

      .nav-item {
        width: 60px;
        height: 60px;
        border: 2px solid transparent;
        cursor: pointer;
        opacity: 0.6;
        img { width: 100%; height: 100%; object-fit: cover; }
        &.active { border-color: #388eff; opacity: 1; }
      }
    }
  }

  .aside-panel {
    width: 300px;
    background: #fff;
    color: #333;
    border-left: 1px solid #ddd;
  }
}
</style>


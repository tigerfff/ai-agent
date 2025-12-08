<template>
  <div v-if="visible" class="preview-overlay" @click.self="handleClose">
    <div class="preview-close" @click="handleClose">✕</div>
    
    <!-- 左箭头 -->
    <div 
      class="preview-nav nav-left" 
      v-if="showNav" 
      @click="handlePrev"
    >
      ‹
    </div>
    
    <!-- 内容区域 -->
    <div class="preview-content">
      <template v-if="file">
        <!-- 图片 -->
        <img 
          v-if="isImage" 
          :src="file.url || getLocalUrl(file.rawFile)" 
          class="preview-image"
        />
        
        <!-- 视频 -->
        <video 
          v-else-if="isVideo"
          :src="file.url || getLocalUrl(file.rawFile)"
          class="preview-video"
          controls
          autoplay
        ></video>
        
        <!-- 其他文件 -->
        <div v-else class="preview-file">
          <div class="file-icon">📄</div>
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
        </div>
      </template>
    </div>

    <!-- 右箭头 -->
    <div 
      class="preview-nav nav-right" 
      v-if="showNav" 
      @click="handleNext"
    >
      ›
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttachmentsPreview',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 当前预览的文件对象
    file: {
      type: Object,
      default: () => null
    },
    // 是否显示切换箭头
    showNav: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isImage() {
      if (!this.file) return false;
      return this.file.type === 'image' || /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(this.file.name);
    },
    isVideo() {
      if (!this.file) return false;
      return this.file.type === 'video' || /\.(mp4|webm|ogg|mov)$/i.test(this.file.name);
    }
  },
  watch: {
    visible(val) {
      if (val) {
        window.addEventListener('keydown', this.handleKeydown);
      } else {
        window.removeEventListener('keydown', this.handleKeydown);
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    handleClose() {
      this.$emit('close');
    },
    handlePrev() {
      this.$emit('prev');
    },
    handleNext() {
      this.$emit('next');
    },
    handleKeydown(e) {
      if (!this.visible) return;
      if (e.key === 'Escape') this.handleClose();
      if (e.key === 'ArrowLeft') this.handlePrev();
      if (e.key === 'ArrowRight') this.handleNext();
    },
    getLocalUrl(file) {
      if (!file) return '';
      try {
        return URL.createObjectURL(file);
      } catch (e) {
        return '';
      }
    },
    formatFileSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return bytes + ' B';
      const k = 1024;
      const sizes = ['KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    }
  }
};
</script>

<style lang="scss" scoped>
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  .preview-close {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: background 0.2s;
    z-index: 10000;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  .preview-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #fff;
    font-size: 40px;
    cursor: pointer;
    padding: 20px;
    opacity: 0.6;
    transition: opacity 0.2s;
    z-index: 10000;

    &:hover {
      opacity: 1;
    }

    &.nav-left {
      left: 20px;
    }

    &.nav-right {
      right: 20px;
    }
  }

  .preview-content {
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .preview-image,
    .preview-video {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border-radius: 4px;
    }

    .preview-file {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
      padding: 40px;
      border-radius: 12px;
      min-width: 200px;

      .file-icon {
        font-size: 64px;
        margin-bottom: 20px;
      }

      .file-name {
        font-size: 18px;
        font-weight: 500;
        margin-bottom: 8px;
        text-align: center;
        word-break: break-all;
      }

      .file-size {
        font-size: 14px;
        opacity: 0.7;
      }
    }
  }
}
</style>

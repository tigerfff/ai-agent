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
      <template v-if="currentFile">
        <!-- 图片 -->
        <img 
          v-if="isImage" 
          :src="currentFile.url || getLocalUrl(currentFile.rawFile)" 
          class="preview-image"
        />
        
        <!-- 视频 -->
        <video 
          v-else-if="isVideo"
          :src="currentFile.url || getLocalUrl(currentFile.rawFile)"
          class="preview-video"
          controls
          autoplay
        ></video>
        
        <!-- 其他文件 -->
        <div v-else class="preview-file">
          <div class="file-icon">📄</div>
          <div class="file-name">{{ currentFile.name }}</div>
          <div class="file-size">{{ formatFileSize(currentFile.size) }}</div>
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
    // 文件列表
    fileList: {
      type: Array,
      default: () => []
    },
    // 初始预览的文件索引
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentIndex: 0
    };
  },
  computed: {
    // 当前预览的文件对象
    currentFile() {
      if (!this.fileList || this.fileList.length === 0) return null;
      const file = this.fileList[this.currentIndex];
      if (!file) return null;
      
      // 规范化文件类型
      return {
        ...file,
        type: this.normalizeFileType(file)
      };
    },
    // 是否显示导航箭头（文件数量大于1时显示）
    showNav() {
      return this.fileList && this.fileList.length > 1;
    },
    isImage() {
      if (!this.currentFile) return false;
      return this.currentFile.type === 'image';
    },
    isVideo() {
      if (!this.currentFile) return false;
      return this.currentFile.type === 'video';
    }
  },
  watch: {
    visible(val) {
      if (val) {
        // 打开预览时，重置为初始索引
        this.currentIndex = Math.max(0, Math.min(this.initialIndex, (this.fileList?.length || 1) - 1));
        window.addEventListener('keydown', this.handleKeydown);
      } else {
        window.removeEventListener('keydown', this.handleKeydown);
      }
    },
    initialIndex(val) {
      // 当初始索引变化时，更新当前索引（仅在预览可见时）
      if (this.visible && this.fileList && this.fileList.length > 0) {
        this.currentIndex = Math.max(0, Math.min(val, this.fileList.length - 1));
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
      if (!this.showNav) return;
      this.currentIndex = (this.currentIndex - 1 + this.fileList.length) % this.fileList.length;
    },
    handleNext() {
      if (!this.showNav) return;
      this.currentIndex = (this.currentIndex + 1) % this.fileList.length;
    },
    /**
     * 规范化文件类型
     * @param {Object} file - 文件对象
     * @returns {string} 'image' | 'video' | 'file'
     */
    normalizeFileType(file) {
      if (!file) return 'file';
      
      // 1. 优先使用 rawFile 的 MIME type
      if (file.rawFile && file.rawFile.type) {
        const mimeType = file.rawFile.type.toLowerCase();
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'file';
      }
      
      // 2. 根据文件名扩展名判断
      const fileName = (file.name || '').toLowerCase();
      if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(fileName)) {
        return 'image';
      }
      if (/\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v)$/i.test(fileName)) {
        return 'video';
      }
      
      // 3. 如果 file.type 是 MIME type，解析它
      if (file.type && typeof file.type === 'string') {
        const type = file.type.toLowerCase();
        if (type.startsWith('image/') || type.startsWith('image')) return 'image';
        if (type.startsWith('video/') || type.startsWith('video')) return 'video';
        if (type.includes('/')) return 'file';
      }
      
      // 4. 如果 file.type 已经是规范的类型字符串，直接使用
      if (file.type === 'image' || file.type === 'video' || file.type === 'file') {
        return file.type;
      }
      
      // 5. 默认为文件类型
      return 'file';
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

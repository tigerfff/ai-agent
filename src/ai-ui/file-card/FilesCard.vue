<template>
  <div 
    class="files-card" 
    :class="{ 
      'is-hover-delete': showDelIcon,
      'is-mini': mode === 'mini'
    }"
    :style="cardStyle"
    :title="mode === 'mini' ? name : ''"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 1. 图标/图片区域 -->
    <div class="files-card-icon" :style="{ width: iconSize, height: iconSize }">
      <slot name="icon" :item="$props">
        <!-- 图片类型 -->
        <template v-if="isImage">
          <img 
            v-if="imgUrl" 
            :src="imgUrl" 
            class="files-card-image"
            :class="imgVariant"
            @click="handlePreview"
          />
          <span v-else class="files-card-file-icon">🖼️</span>
        </template>
        <!-- 其他文件类型 (简化版图标) -->
        <span v-else class="files-card-file-icon" :style="{ color: iconColor }">
          {{ getFileEmoji(fileType || name) }}
        </span>
      </slot>

      <!-- 遮罩层 (用于图片) -->
      <div 
        v-if="isImage && imgPreview && imgPreviewMask && status === 'done'" 
        class="files-card-mask"
        @click="handlePreview"
      >
        <slot name="image-preview-actions" :item="$props">
          <span class="view-icon">👁️</span>
        </slot>
      </div>
    </div>

    <!-- 2. 内容区域 (仅在非 mini 模式下显示) -->
    <div class="files-card-content" v-if="mode !== 'mini'">
      <slot name="content" :item="$props">
        <div class="files-card-header">
          <slot name="name-prefix" :item="$props"></slot>
          <div class="files-card-name" :title="name">{{ name }}</div>
          <slot name="name-suffix" :item="$props"></slot>
        </div>

        <div class="files-card-desc">
          <slot name="description" :item="$props">
            <!-- 上传中 -->
            <div v-if="status === 'uploading'" class="status-text">
              上传中... {{ percent }}%
            </div>
            <!-- 失败 -->
            <div v-else-if="status === 'error'" class="status-text error">
              {{ errorTip }}
            </div>
            <!-- 默认描述 -->
            <div v-else class="desc-text">
               {{ description || formatFileSize(fileSize) }}
            </div>
          </slot>
        </div>
      </slot>
    </div>

    <!-- 3. 删除按钮 -->
    <div 
      v-if="showDelIcon && (isHover || status === 'error')" 
      class="files-card-close"
      @click.stop="handleDelete"
    >
      <slot name="del-icon" :item="$props">✕</slot>
    </div>
    
    <!-- 进度条背景 -->
    <div 
      v-if="status === 'uploading'" 
      class="upload-progress-bar"
      :style="{ width: percent + '%' }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'FilesCard',
  props: {
    uid: { type: [String, Number], default: '' },
    name: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    fileType: { type: String, default: '' }, // 'image', 'video', etc.
    description: { type: String, default: '' },
    url: { type: String, default: '' }, // 远程地址
    imgFile: { default: null }, // 本地 File 对象 (允许任何类型以兼容 File/Blob)
    iconSize: { type: String, default: '42px' },
    iconColor: { type: String, default: '' },
    showDelIcon: { type: Boolean, default: false },
    maxWidth: { type: String, default: '236px' },
    mode: { type: String, default: 'default' }, // 'default' | 'mini'
    imgVariant: { type: String, default: 'rectangle' }, // 'rectangle' | 'square'
    imgPreview: { type: Boolean, default: true },
    imgPreviewMask: { type: Boolean, default: true },
    status: { type: String, default: 'done' }, // 'uploading' | 'done' | 'error'
    percent: { type: Number, default: 0 },
    errorTip: { type: String, default: '上传失败' }
  },
  data() {
    return {
      isHover: false,
      localImgUrl: ''
    };
  },
    computed: {
    cardStyle() {
      if (this.mode === 'mini') {
        return {
          width: 'auto',
          maxWidth: 'none',
          padding: '4px',
          background: 'transparent',
          border: 'none'
        };
      }
      return {
        maxWidth: this.maxWidth
      };
    },
    isImage() {
      if (this.fileType === 'image') return true;
      if (/\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(this.name)) return true;
      return false;
    },
    imgUrl() {
      return this.url || this.localImgUrl;
    }
  },
  watch: {
    imgFile: {
      handler(val) {
        if (val && !this.url) {
          // 生成本地预览
          const reader = new FileReader();
          reader.onload = (e) => {
            this.localImgUrl = e.target.result;
          };
          reader.readAsDataURL(val);
        }
      },
      immediate: true
    }
  },
  methods: {
    handleMouseEnter() {
      this.isHover = true;
    },
    handleMouseLeave() {
      this.isHover = false;
    },
    handleDelete() {
      this.$emit('delete', this.$props);
    },
    handlePreview() {
      if (!this.imgPreview) return;
      this.$emit('image-preview', this.$props);
      // 这里可以集成一个全局的图片预览组件，简单起见先 emit
    },
    formatFileSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return bytes + ' B';
      const k = 1024;
      const sizes = ['KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    },
    getFileEmoji(filenameOrType) {
      const type = filenameOrType.toLowerCase();
      if (type.includes('pdf')) return '📕';
      if (type.includes('doc')) return '📝';
      if (type.includes('xls')) return '📊';
      if (type.includes('ppt')) return '📽️';
      if (type.includes('zip') || type.includes('rar')) return '📦';
      if (type.includes('mp4') || type.includes('avi')) return '🎬';
      if (type.includes('mp3')) return '🎵';
      if (type.includes('txt')) return '📄';
      if (type.includes('image')) return '🖼️';
      return '📄';
    }
  }
};
</script>

<style scoped>
.files-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background-color: #f5f7fa;
  border: 1px solid transparent;
  transition: all 0.2s;
  overflow: hidden;
  box-sizing: border-box;
  gap: 10px;
  flex-shrink: 0;
}

.files-card:hover {
  background-color: #ecf5ff;
}

.files-card.is-hover-delete:hover {
  /* 可以添加特定样式 */
}

.files-card.is-mini {
  gap: 0;
  border-radius: 4px;
}

.files-card.is-mini:hover {
  background-color: rgba(0,0,0,0.05) !important;
}

.files-card.is-mini .files-card-close {
  top: -6px;
  right: -6px;
  background: #f56c6c;
  color: #fff;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
}

/* Icon */
.files-card-icon {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.files-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.files-card-file-icon {
  font-size: 24px;
}

/* Mask */
.files-card-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.files-card-icon:hover .files-card-mask {
  opacity: 1;
}

.view-icon {
  color: #fff;
  font-size: 16px;
}

/* Content */
.files-card-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.files-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.files-card-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.files-card-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

.status-text {
  color: #409eff;
}

.status-text.error {
  color: #f56c6c;
}

/* Close Btn */
.files-card-close {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(0,0,0,0.1);
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  z-index: 2;
}

.files-card-close:hover {
  background: #f56c6c;
  color: #fff;
}

/* Progress Bar */
.upload-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: #409eff;
  transition: width 0.2s;
  opacity: 0.6;
}
</style>

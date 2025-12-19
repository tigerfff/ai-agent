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
    <div 
      class="files-card-icon" 
      :style="{ width: iconSize, height: iconSize, cursor: imgPreview ? 'pointer' : 'default' }"
      @click="handlePreview"
    >
      <slot name="icon" :item="$props">
        <!-- 图片类型 或 视频(有封面) -->
        <template v-if="isImage || (isVideo && imgUrl)">
          <img 
            v-if="imgUrl" 
            :src="imgUrl" 
            class="files-card-image"
            :class="imgVariant"
          />
          <!-- 视频播放标识 -->
          <div v-if="isVideo" class="video-play-overlay">
            <span class="play-icon">▶</span>
          </div>
        </template>
        
        <!-- 其他文件类型 (简化版图标) -->
        <span v-else class="files-card-file-icon" :style="{ color: iconColor }">
          {{ getFileEmoji(fileType || name) }}
        </span>
      </slot>

      <!-- 遮罩层 (用于图片/视频预览) -->
      <div 
        v-if="(isImage || isVideo) && imgPreview && imgPreviewMask && status === 'done'" 
        class="files-card-mask"
      >
        <slot name="image-preview-actions" :item="$props">
          <span class="view-icon">
            {{ isVideo ? '▶' : '' }}
          </span>
        </slot>
      </div>

      <!-- mini 模式下的圆形进度条遮罩  -->
      <div 
        v-if="mode === 'mini' && status === 'uploading'"
        class="mini-progress-overlay"
      >
        <div class="mini-progress-circle">
          <div class="mini-progress-inner">
            <span class="mini-progress-text">{{ percent }}%</span>
          </div>
        </div>
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
      <slot name="del-icon" :item="$props">
        <i class="h-icon-close" style="font-size: 16px; color: #ccc;" />
      </slot>
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
import { getVideoFrameUrl } from '@/utils';

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
    iconSize: { type: String, default: '64px' },
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
      // fileType 应该已经是规范化的 'image' | 'video' | 'file'
      return this.fileType === 'image';
    },
    isVideo() {
      // fileType 应该已经是规范化的 'image' | 'video' | 'file'
      return this.fileType === 'video';
    },
    imgUrl() {
      // 视频：只有上传完成且有 URL 时才返回封面，否则返回空（使用默认图标）
      if (this.isVideo) {
        if (this.status === 'done' && this.url) {
          return getVideoFrameUrl(this.url);
        }
        return ''; // 上传中或无 URL 时，使用默认图标
      }
      
      // 图片：使用远程 URL 或本地预览（base64）
      if (this.isImage) {
        return this.url || this.localImgUrl;
      }
      
      // 文件类型（非图片、非视频）：始终返回空，使用默认图标
      return '';
    },
    // mini 模式圆形进度条样式
    // miniProgressStyle() {
    //   const p = Math.max(0, Math.min(100, this.percent || 0));
    //   const deg = (p / 100) * 360;
    //   return {
    //     backgroundImage: `conic-gradient(#409eff ${deg}deg, rgba(255, 255, 255, 0.15) 0deg)`
    //   };
    // }
  },
  watch: {
    imgFile: {
      handler(val) {
        if (val && !this.url) {
          // 仅对图片生成本地预览
          const isImg = val.type?.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(val.name);
          
          if (isImg) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.localImgUrl = e.target.result;
            };
            reader.readAsDataURL(val);
          } else {
            this.localImgUrl = '';
          }
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
      // 触发通用的预览事件
      this.$emit('preview', this.$props);
      // 兼容旧的图片预览事件
      if (this.isImage) {
        this.$emit('image-preview', this.$props);
      }
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

<style lang="scss" scoped>
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

  &:hover {
    background-color: #ecf5ff;
  }

  &.is-mini {
    gap: 0;
    border-radius: 4px;

    .files-card-close {
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      width: 18px;
      height: 18px;
    }
  }

  &.is-hover-delete {
    .files-card-close {
      opacity: 1;
    }
  }

  .files-card-icon {
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background: #fff;
    overflow: hidden;

    .files-card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.1);
      
      .play-icon {
        color: #fff;
        font-size: 14px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }
    }

    .files-card-file-icon {
      font-size: 24px;
    }

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
      z-index: 1;

      .view-icon {
        color: #fff;
        font-size: 16px;
      }
    }

    &:hover {
      .files-card-mask {
        opacity: 1;
      }
    }

    .mini-progress-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      z-index: 2;

      .mini-progress-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .mini-progress-inner {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          .mini-progress-text {
            font-size: 14px;
            color: #FFF;
            font-weight: 500;
          }
        }
      }
    }
  }

  .files-card-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .files-card-header {
      display: flex;
      align-items: center;
      margin-bottom: 2px;

      .files-card-name {
        font-size: 14px;
        color: #303133;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
      }
    }

    .files-card-desc {
      font-size: 12px;
      color: #909399;
      line-height: 1.2;

      .status-text {
        color: #409eff;

        &.error {
          color: #f56c6c;
        }
      }
    }
  }

  .files-card-close {
    position: absolute;
    top: 0;
    right: 0;
    width: 16px;
    height: 16px;
    border-radius: 0 8px 0px 8px;
    background: rgba(0, 0, 0, 0.1);
    color: #909399;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.2s;

    &:hover {
      background: #f56c6c;
      color: #fff;
    }
  }

  .upload-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background-color: #409eff;
    transition: width 0.2s;
    opacity: 0.6;
  }
}
</style>
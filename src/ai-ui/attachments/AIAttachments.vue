<template>
  <div 
    class="ai-attachments" 
    :class="[`overflow-${overflow}`, `mode-${cardMode}`]"
    v-if="value.length > 0"
  >
    <!-- 单张大图模式 -->
    <div v-if="cardMode === 'single-image'" class="single-image-view">
      <!-- 视频：展示首帧 + 播放按钮 -->
      <div 
        v-if="normalizedFileList[0].type === 'video'"
        class="video-cover-wrapper"
        @click="onPreview(0)"
      >
        <img 
          :src="getVideoCover(normalizedFileList[0])"
          class="limit-img"
        />
        <div class="play-icon-overlay">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <!-- 图片：直接展示 -->
      <img 
        v-else
        :src="value[0].url || value[0].localUrl" 
        class="limit-img"
        @click="onPreview(0)"
      />
    </div>

    <!-- 列表模式 -->
    <template v-else>
      <!-- 左箭头 (仅 scrollX 且非起始位置显示) -->
      <div 
        v-if="overflow === 'scrollX' && showLeftArrow" 
        class="scroll-arrow arrow-left"
        @click="scrollPrev"
      >
        ‹
      </div>

      <!-- 列表容器 -->
      <div 
        ref="scrollContainer"
        class="attachments-list"
        @scroll="handleScroll"
      > 
        <FilesCard
          v-for="(file, index) in value"
          :key="file.uid || index"
          :uid="file.uid"
          :name="file.name"
          :file-size="file.size"
          :file-type="normalizeFileType(file)"
          :url="file.url"
          :img-file="file.rawFile"
          :status="file.status"
          :percent="file.percent"
          :show-del-icon="!readonly"
          :icon-size="iconSize"
          :mode="cardMode === 'mini' ? 'mini' : 'default'"
          @delete="handleDelete(index)"
          @preview="onPreview(index)"
        />
      </div>

      <!-- 右箭头 (仅 scrollX 且非结束位置显示) -->
      <div 
        v-if="overflow === 'scrollX' && showRightArrow" 
        class="scroll-arrow arrow-right"
        @click="scrollNext"
      >
        ›
      </div>
    </template>

    <!-- 预览弹窗 -->
    <AttachmentsPreview
      :visible="previewVisible"
      :file-list="normalizedFileList"
      :initial-index="previewIndex"
      @close="closePreview"
    />
  </div>
</template>

<script>
import FilesCard from '@/ai-ui/file-card/FilesCard.vue';
import AttachmentsPreview from './AttachmentsPreview.vue';
import { getVideoFrameUrl } from '@/utils/index.js';

export default {
  name: 'AIAttachments',
  components: {
    FilesCard,
    AttachmentsPreview
  },
  props: {
    // 初始文件列表
    value: {
      type: Array,
      default: () => []
    },
    // 滚动布局模式
    overflow: {
      type: String,
      default: 'scrollX', // 'scrollX' | 'scrollY' | 'wrap'
      validator: val => ['scrollX', 'scrollY', 'wrap'].includes(val)
    },
    readonly: {
      type: Boolean,
      default: false
    },
    // 卡片展示模式：'default' (完整) | 'mini' (仅图标) | 'single-image'
    cardMode: {
      type: String,
      default: 'default'
    },
    iconSize: {
      type: String,
      default: '64px'
    }
  },
  data() {
    return {
      showLeftArrow: false,
      showRightArrow: false,
      previewVisible: false,
      previewIndex: 0
    };
  },
  computed: {
    // 规范化文件列表，确保每个文件都有正确的 type 字段
    normalizedFileList() {
      return this.value.map(file => ({
        ...file,
        type: this.normalizeFileType(file)
      }));
    }
  },
  watch: {
    value() {
      // 列表变化时更新箭头状态
      this.$nextTick(this.checkArrows);
    },
    overflow() {
      this.$nextTick(this.checkArrows);
    }
  },
  mounted() {
    this.checkArrows();
    window.addEventListener('resize', this.checkArrows);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkArrows);
  },
  methods: {
    // 供父组件调用
    addFile(rawFile) {
      const file = {
        uid: Date.now() + Math.random(),
        name: rawFile.name,
        size: rawFile.size,
        type: this.getFileType(rawFile),
        rawFile: rawFile, // 保留原始 File 对象用于预览
        url: '',
        status: 'done', // 默认直接 done，如果是上传逻辑可改为 uploading
        percent: 100
      };
      
      const newList = [...this.value, file];
      this.$emit('input', newList);
      this.$emit('change', newList);
    },
    
    clear() {
      this.$emit('input', []);
      this.$emit('change', []);
    },
    
    handleDelete(index) {
      const newList = [...this.value];
      newList.splice(index, 1);
      this.$emit('input', newList);
      this.$emit('change', newList);
    },
    
    getFileType(file) {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      return 'file';
    },
    
    /**
     * 规范化文件类型
     * 场景1：上传中/刚上传 - 有 rawFile，使用其 MIME type
     * 场景2：历史记录 - 只有 url/name，根据文件名扩展名判断
     * 统一返回：'image' | 'video' | 'file'
     */
    normalizeFileType(file) {
      if (!file) return 'file';
      
      // 1. 优先使用 rawFile 的 MIME type（上传中或刚上传的文件，最可靠）
      if (file.rawFile && file.rawFile.type) {
        const mimeType = file.rawFile.type.toLowerCase();
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'file'; // 其他类型（如 application/pdf）都是文件
      }
      
      // 2. 根据文件名扩展名判断（适用于历史记录，优先级高于 file.type）
      const fileName = (file.name || '').toLowerCase();
      if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(fileName)) {
        return 'image';
      }
      if (/\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v)$/i.test(fileName)) {
        return 'video';
      }
      // PDF 等文档类型
      if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i.test(fileName)) {
        return 'file';
      }
      
      // 3. 如果 file.type 是 MIME type，解析它
      if (file.type && typeof file.type === 'string') {
        const type = file.type.toLowerCase();
        if (type.startsWith('image/') || type.startsWith('image')) return 'image';
        if (type.startsWith('video/') || type.startsWith('video')) return 'video';
        // 其他 MIME type 都是文件
        if (type.includes('/')) return 'file';
      }
      
      // 4. 如果 file.type 已经是规范的类型字符串，直接使用
      // 注意：这一步放在最后，因为服务器可能返回错误的类型
      if (file.type === 'image' || file.type === 'video' || file.type === 'file') {
        return file.type;
      }
      
      // 5. 默认为文件类型
      return 'file';
    },

    /* --- 滚动逻辑 --- */
    checkArrows() {
      if (this.overflow !== 'scrollX') return;
      const el = this.$refs.scrollContainer;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      // 容差 1px
      this.showLeftArrow = scrollLeft > 1;
      this.showRightArrow = scrollLeft + clientWidth < scrollWidth - 1;
    },

    handleScroll() {
      if (this.overflow === 'scrollX') {
        this.checkArrows();
      }
    },

    scrollPrev() {
      const el = this.$refs.scrollContainer;
      if (!el) return;
      el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' });
    },

    scrollNext() {
      const el = this.$refs.scrollContainer;
      if (!el) return;
      el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
    },

    /* --- 预览逻辑 --- */
    onPreview(index) {
      this.previewIndex = index;
      this.previewVisible = true;
    },
    
    closePreview() {
      this.previewVisible = false;
    },
    getVideoCover(file) {
      if (file.url) {
        return getVideoFrameUrl(file.url, 0, 0, 0, 'jpg');
      }
      return file.localUrl || '';
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-attachments {
  width: 100%;
  box-sizing: border-box;
  position: relative;

  /* 单图模式样式 */
  .single-image-view {
    display: inline-block;
    vertical-align: top;
    
    .video-cover-wrapper {
      position: relative;
      cursor: pointer;
      display: inline-block;

      .play-icon-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(2px);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        transition: all 0.2s;
        pointer-events: none;

        svg {
          margin-left: 2px; /* 视觉修正 */
        }
      }

      &:hover .play-icon-overlay {
        background: rgba(0, 0, 0, 0.6);
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    .limit-img {
      max-width: calc(var(--chat-max-width, 960px) / 2);
      max-height: calc(var(--chat-max-width, 960px) / 2);
      width: auto;
      height: auto;
      border-radius: 8px;
      cursor: pointer;
      display: block;
      object-fit: contain;
    }
  }

  .attachments-list {
    display: flex;
    gap: 8px; /* 默认间距 */
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  /* mini 模式强制 Grid 布局，并使用 8px 间距 */
  &.mode-mini .attachments-list {
    gap: 8px; 
  }

  &.overflow-wrap {
    .attachments-list {
      flex-wrap: wrap;
      overflow: visible;
    }
  }

  &.overflow-scrollY {
    .attachments-list {
      flex-wrap: wrap;
      overflow-y: auto;
      max-height: 200px;
    }
  }

  &.overflow-scrollX {
    padding: 0 4px;

    .attachments-list {
      flex-wrap: nowrap;
      overflow-x: auto;
      white-space: nowrap;
    }
  }

  .scroll-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #eee;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
    font-size: 18px;
    color: #606266;
    user-select: none;
    transition: all 0.2s;

    &:hover {
      color: #409eff;
      background: #fff;
      box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
    }

    &.arrow-left {
      left: 0;
    }

    &.arrow-right {
      right: 0;
    }
  }
}
</style>
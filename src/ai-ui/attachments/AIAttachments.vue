<template>
  <div 
    class="ai-attachments" 
    :class="[`overflow-${overflow}`]"
    v-if="value.length > 0"
  >
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
        :file-type="file.type"
        :url="file.url"
        :img-file="file.rawFile"
        :status="file.status"
        :percent="file.percent"
        :show-del-icon="!readonly"
        :icon-size="iconSize"
        :mode="cardMode"
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

    <!-- 预览弹窗 -->
    <AttachmentsPreview
      :visible="previewVisible"
      :file="currentPreviewFile"
      :show-nav="value.length > 1"
      @close="closePreview"
      @prev="prevPreview"
      @next="nextPreview"
    />
  </div>
</template>

<script>
import FilesCard from '@/ai-ui/file-card/FilesCard.vue';
import AttachmentsPreview from './AttachmentsPreview.vue';

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
    // 卡片展示模式：'default' (完整) | 'mini' (仅图标)
    cardMode: {
      type: String,
      default: 'default'
    },
    iconSize: {
      type: String,
      default: '42px'
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
    currentPreviewFile() {
      return this.value[this.previewIndex];
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
    
    prevPreview() {
      this.previewIndex = (this.previewIndex - 1 + this.value.length) % this.value.length;
    },
    
    nextPreview() {
      this.previewIndex = (this.previewIndex + 1) % this.value.length;
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-attachments {
  width: 100%;
  box-sizing: border-box;
  position: relative;

  .attachments-list {
    display: flex;
    gap: 8px;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
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
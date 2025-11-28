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
  </div>
</template>

<script>
import FilesCard from '@/ai-ui/file-card/FilesCard.vue';

export default {
  name: 'AIAttachments',
  components: {
    FilesCard
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
      showRightArrow: false
    };
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
    }
  }
};
</script>

<style scoped>
.ai-attachments {
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.attachments-list {
  display: flex;
  gap: 8px;
  /* 隐藏滚动条但保留功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.attachments-list::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* 布局模式 */
.ai-attachments.overflow-wrap .attachments-list {
  flex-wrap: wrap;
  overflow: visible;
}

.ai-attachments.overflow-scrollY .attachments-list {
  flex-wrap: wrap;
  overflow-y: auto;
  max-height: 200px; /* 默认最大高度，可覆盖 */
}

.ai-attachments.overflow-scrollX .attachments-list {
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
}

/* 箭头样式 */
.scroll-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
}

.scroll-arrow:hover {
  color: #409eff;
  background: #fff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.arrow-left {
  left: 0;
}

.arrow-right {
  right: 0;
}

/* 滚动时给两边留一点空隙防止箭头遮挡 */
.ai-attachments.overflow-scrollX {
  padding: 0 4px;
}
</style>
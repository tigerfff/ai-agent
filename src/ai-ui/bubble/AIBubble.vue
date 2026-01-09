<template>
  <div class="ai-bubble" :class="placement">
    <!-- 头像 -->
    <div class="bubble-avatar" v-if="showAvatar">
      <slot name="avatar">
        <img :src="avatar" class="avatar-img" />
      </slot>
    </div>

    <!-- 内容区 -->
    <div class="bubble-content-wrapper">
      <!-- Header -->
      <div class="bubble-header" v-if="$slots.header">
        <slot name="header"></slot>
      </div>

      <!-- 1. 附件气泡 (独立渲染) -->
      <div 
        v-if="attachments && attachments.length > 0"
        class="bubble-attachments"
      >
        <AIAttachments 
          :value="attachments" 
          :card-mode="attachmentConfig.mode" 
          :iconSize="attachmentConfig.iconSize"
          :overflow="attachmentConfig.overflow"
          readonly 
        />
      </div>

      <!-- 2. 文本内容气泡（独立渲染） -->
      <div 
        v-if="(content || loading) && (textParts.length > 0 || loading)"
        class="bubble-body text-body" 
        :class="variant"
      >
        <!-- Loading 状态 -->
        <div v-if="loading" class="typing-indicator">
          <img src="@/assets/images/star-sport.png" alt="loading" class="loading-star-image" />
          <span>正在生成中...</span>
        </div>

        <!-- 文本内容渲染 -->
        <div v-else class="bubble-content-mix">
          <template v-for="(part, idx) in textParts">
            <div 
              :key="'text-' + idx"
              class="markdown-body" 
              v-html="renderMarkdown(part.content)"
            ></div>
          </template>
        </div>

        <!-- 光标 (打字时显示) -->
        <span v-if="isTyping" class="cursor">|</span>
      </div>

      <!-- 3. Widget 气泡（独立渲染，每个 widget 一个气泡） -->
      <div 
        v-for="(widget, idx) in filteredWidgetParts"
        :key="'widget-' + idx"
        class="bubble-body widget-body" 
        :class="variant"
      >
        <div class="widget-wrapper">
          <slot name="widget" :info="widget">
            <div class="widget-fallback">
              [Unknown Widget: {{ widget.widgetType }}]
            </div>
          </slot>
          <!-- Loading 蒙层 -->
          <div v-if="loading" class="widget-loading-overlay">
            <div class="loading-content">
              <div class="typing-indicator">
                <img src="@/assets/images/star-sport.png" alt="loading" class="loading-star-image" />
              </div>
              <span class="loading-text">加载中...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bubble-footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { Typewriter } from './Typewriter';
import { StreamMessageParser } from '@/ai-core/parser/StreamMessageParser';
import AIAttachments from '@/ai-ui/attachments/AIAttachments.vue';

export default {
  name: 'AIBubble',
  components: {
    AIAttachments
  },
  props: {
    content: {
      type: String,
      default: ''
    },
    attachments: {
      type: Array,
      default: () => []
    },
    // 放置位置: 'start' (AI) | 'end' (用户)
    placement: {
      type: String,
      default: 'start' 
    },
    avatar: {
      type: String,
      default: '' // 默认头像 URL
    },
    showAvatar: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    // 是否开启打字机效果
    typing: {
      type: Boolean,
      default: false
    },
    // 气泡样式变体: 'filled' | 'outlined'
    variant: {
      type: String,
      default: 'filled'
    },
    /**
     * 不渲染的 widget 类型列表，例如 ['ymform:train_confirm']
     * 父组件可传入以禁用特定 widget 冒泡
     */
    ignoreWidgetTypes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      displayContent: '', // 当前展示的文本（可能是部分）
      typewriter: null,
      isTyping: false,
      parser: new StreamMessageParser()
    };
  },
  computed: {
    // 解析后的内容片段列表
    contentParts() {
      return this.parser.parse(this.displayContent || '');
    },
    
    // 文本片段（所有 type === 'text' 的部分）
    textParts() {
      return this.contentParts.filter(part => part.type === 'text');
    },
    
    // Widget 片段（所有 type === 'widget' 的部分）
    widgetParts() {
      return this.contentParts.filter(part => part.type === 'widget');
    },
    
    // 经过过滤后需要渲染的 widget（排除 ignoreWidgetTypes）
    filteredWidgetParts() {
      if (!this.ignoreWidgetTypes || this.ignoreWidgetTypes.length === 0) return this.widgetParts;
      const ignoreSet = new Set(this.ignoreWidgetTypes);
      return this.widgetParts.filter(part => !ignoreSet.has(part.widgetType));
    },
    
    // 判断是否为单张图片
    isSingleImage() {
      if (!this.attachments || this.attachments.length !== 1) return false;
      const file = this.attachments[0];
      // 兼容 file.type 或根据文件名推断
      if (file.type && file.type.startsWith('image')) return true;
      if (file.name && /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(file.name)) return true;
      return false;
    },

    // 判断是否为单张视频
    isSingleVideo() {
      if (!this.attachments || this.attachments.length !== 1) return false;
      const file = this.attachments[0];
      if (file.type && file.type.startsWith('video')) return true;
      if (file.name && /\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v)$/i.test(file.name)) return true;
      return false;
    },

    // 计算附件展示配置
    attachmentConfig() {
      // 规则 1: 单张图片或视频 -> 大图模式
      if (this.isSingleImage || this.isSingleVideo) {
        return {
          mode: 'single-image',
          iconSize: '', 
          overflow: 'wrap'
        };
      }
      
      // 规则 2, 3, 4: 多图/视频/文件/混合 -> Mini Grid 模式
      return {
        mode: 'mini',
        iconSize: '64px', // 需求：单个大小 64px
        overflow: 'wrap'  // 自动换行
      };
    }
  },
  watch: {
    // 监听 content 变化
    content: {
      handler(newVal, oldVal) {
        if (!this.typing) {
          // 如果不开启打字机，直接显示
          this.displayContent = newVal;
          return;
        }

        // 如果开启打字机
        if (!oldVal) {
           // 第一次有内容，初始化
           this.initTypewriter();
           this.typewriter.append(newVal);
        } else if (newVal.startsWith(oldVal)) {
           // 典型的追加模式 (Streaming)
           const diff = newVal.slice(oldVal.length);
           if (diff) this.typewriter.append(diff);
        } else {
           // 内容完全变了，重置
           this.displayContent = '';
           this.initTypewriter();
           this.typewriter.append(newVal);
        }
      },
      immediate: true
    }
  },
  methods: {
    renderMarkdown(text) {
      if (!text) return '';
      return marked.parse(text);
    },
    initTypewriter() {
      if (this.typewriter) return;
      
      this.typewriter = new Typewriter(
        (text) => {
          this.displayContent = text;
          this.isTyping = true;
          // 每次更新可以抛出事件，方便父组件做自动滚动
          this.$emit('update', text);
        },
        () => {
          this.isTyping = false;
          this.$emit('finish');
        }
      );
    }
  },
  beforeDestroy() {
    if (this.typewriter) {
      this.typewriter.stop();
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  max-width: 100%;

  // 右侧气泡（用户端）- 蓝色背景 + 白色文字
  &.end {
    flex-direction: row-reverse;

    .bubble-content-wrapper {
      align-items: flex-end;
      max-width: calc(100% - 40px);
    }

    .bubble-attachments {
      align-items: flex-end;

      :deep(.attachments-list) {
        justify-content: flex-end;
      }

      :deep(.single-image-view) {
        text-align: right;
      }
    }

    .bubble-body.filled {
      background: linear-gradient(90deg, rgba(53,172,255,1) 0%, rgba(22,122,255,1) 100%);
      color: #fff;
      border-radius: 16px 0px 16px 16px;
      
      // 确保所有子元素都是白色文字
      .markdown-body {
        color: #fff;
        
        :deep(*) {
          color: inherit;
        }
      }
      
      .bubble-content-mix {
        color: #fff;
      }
    }
  }
  
  // 左侧气泡（机器人端）- 白色背景 + 黑色文字
  &.start {
    .bubble-content-wrapper {
      max-width: 100%;
    }

    .bubble-body.filled {
      background: #fff;
      color: rgba($color: #000000, $alpha: .7);
      border-radius: 0px 16px 16px 16px;
      
      // 确保所有子元素都是黑色文字
      .markdown-body {
        color: rgba($color: #000000, $alpha: 0.7);
        
        :deep(*) {
          color: inherit;
        }
      }
      
      .bubble-content-mix {
        color: #333;
      }
    }
  }

  .bubble-avatar {
    .avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
  }

  .bubble-content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    gap: 8px; /* 增加气泡间距 */

    .bubble-attachments {
      margin-bottom: 4px;
      max-width: 100%;
      display: flex;
      flex-direction: column;
    }

    .bubble-body {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      position: relative;
      word-break: break-word;

      &.widget-body {
        background: #fff !important;
        color: rgba($color: #000000, $alpha: 0.7) !important;
        padding: 16px; /* Widget 场景下内边距稍微缩小一点，更紧凑 */
      }

      .markdown-body {
        font-family: var(--ym-ai-font-family, -apple-system, BlinkMacSystemFont, sans-serif);

        :deep(p) {
          margin-bottom: 0.5em;

          &:last-child {
            margin-bottom: 0;
          }
        }

        :deep(pre) {
          background: #282c34;
          color: #abb2bf;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }

        :deep(a) {
          color: inherit;
          text-decoration: underline;
          opacity: 1;
          font-weight: 500;
          
          &:hover {
            opacity: 0.8;
          }
        }
      }

      .cursor {
        display: inline-block;
        margin-left: 2px;
        animation: blink 1s step-end infinite;
        font-weight: bold;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .loading-star-image {
          width: 24px;
          height: 24px;
        }
      }

      .widget-wrapper {
        width: 100%;
        position: relative;

        &.is-loading {
          pointer-events: none;
          user-select: none;
        }

        .widget-fallback {
          background: #f0f2f5;
          color: #909399;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          border: 1px dashed #dcdfe6;
        }

        .widget-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: inherit;

          .loading-content {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .loading-text {
              font-size: 14px;
            }
          }
        }
      }
    }

    // Widget 容器在所有状态下使用统一的 Loading 样式（因为背景统一为白色了）
    .bubble-body.widget-body .widget-wrapper {
      .widget-loading-overlay {
        background: rgba(255, 255, 255, 0.8);

        .loading-content {
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
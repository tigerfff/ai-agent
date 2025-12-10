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
        class="bubble-body attachments-body"
        :class="variant"
      >
        <AIAttachments 
          :value="attachments" 
          :card-mode="attachmentConfig.mode" 
          :iconSize="attachmentConfig.iconSize"
          :overflow="attachmentConfig.overflow"
          readonly 
        />
      </div>

      <!-- 2. 文本内容气泡 -->
      <div 
        v-if="content || loading"
        class="bubble-body text-body" 
        :class="variant"
      >
        <!-- Loading 状态 -->
        <div v-if="loading" class="typing-indicator">
          <span></span><span></span><span></span>
        </div>

        <!-- 混合内容渲染 (Markdown + Widgets) -->
        <div v-else class="bubble-content-mix">
          <template v-for="(part, idx) in contentParts">
            <!-- 文本片段 -->
            <div 
              v-if="part.type === 'text'"
              :key="'text-' + idx"
              class="markdown-body" 
              v-html="renderMarkdown(part.content)"
            ></div>

            <!-- 组件片段 (Loading 或 Done) -->
            <div 
              v-else-if="part.type === 'widget'"
              :key="'widget-' + idx"
              class="widget-wrapper"
            >
              <slot name="widget" :info="part">
                <div class="widget-fallback">
                  [Unknown Widget: {{ part.widgetType }}]
                </div>
              </slot>
            </div>
          </template>
        </div>

        <!-- 光标 (打字时显示) -->
        <span v-if="isTyping" class="cursor">|</span>
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
    
    // 判断是否为单张图片
    isSingleImage() {
      if (!this.attachments || this.attachments.length !== 1) return false;
      const file = this.attachments[0];
      // 兼容 file.type 或根据文件名推断
      if (file.type && file.type.startsWith('image')) return true;
      if (file.name && /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(file.name)) return true;
      return false;
    },

    // 计算附件展示配置
    attachmentConfig() {
      // 规则 1: 单张图片 -> 大图模式
      if (this.isSingleImage) {
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
    .bubble-body.filled {
      background: #fff;
      color: #333;
      border-radius: 0px 16px 16px 16px;
      
      // 确保所有子元素都是黑色文字
      .markdown-body {
        color: #333;
        
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
    max-width: 80%;
    min-width: 0;
    gap: 8px; /* 增加气泡间距 */

    .bubble-attachments {
      margin-bottom: 0;
      max-width: 100%;
      width: 100%;
    }

    .bubble-body {
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      position: relative;
      word-break: break-word;

      .markdown-body {
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;

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
        span {
          display: inline-block;
          width: 6px;
          height: 6px;
          background-color: #aaa;
          border-radius: 50%;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }

          &:nth-child(2) {
            animation-delay: -0.16s;
          }
        }
      }

      .widget-wrapper {
        margin: 8px 0;
        width: 100%;

        .widget-fallback {
          background: #f0f2f5;
          color: #909399;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          border: 1px dashed #dcdfe6;
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
</style>
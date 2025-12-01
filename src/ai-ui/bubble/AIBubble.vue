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

      <!-- 气泡实体 -->
      <div class="bubble-body" :class="variant" v-if="content || loading || (attachments && attachments.length > 0)">
        
        <!-- 附件列表 (移入气泡内部) -->
        <div class="bubble-attachments" v-if="attachments && attachments.length > 0">
          <AIAttachments 
            :value="attachments" 
            overflow="scrollY" 
            card-mode="mini" 
            iconSize="88px"
            readonly 
          />
        </div>

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
      default: true
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

<style scoped>
/* 基础布局 */
.ai-bubble {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  max-width: 100%;
}

.ai-bubble.end {
  flex-direction: row-reverse;
}

.bubble-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 80%;
  min-width: 0; /* 防止子元素撑破容器 */
}

.ai-bubble.end .bubble-content-wrapper {
  align-items: flex-end;
}

.bubble-attachments {
  margin-bottom: 8px;
  max-width: 100%;
  width: 100%; /* 确保能撑满最大宽度以触发滚动 */
}

/* 当附件在 bubble-body 内部时，需要去除底部 margin，除非后面还有文本 */
.bubble-body .bubble-attachments:last-child {
  margin-bottom: 0;
}

/* 头像 */
.bubble-avatar .avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

/* 气泡主体 */
.bubble-body {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  word-break: break-word;
}

/* 样式变体 */
.bubble-body.filled {
  background: #f4f6f8;
  color: #333;
  border-radius: 0px 12px 12px 12px;
}

.ai-bubble.end .bubble-body.filled {
  background: #dbefff; /* 用户气泡色 */
  color: #333;
  border-radius: 12px 0px 12px 12px;
}

/* Markdown 样式微调 (可选) */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
.markdown-body :deep(p) {
  margin-bottom: 0.5em;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

/* 打字光标动画 */
.cursor {
  display: inline-block;
  margin-left: 2px;
  animation: blink 1s step-end infinite;
  font-weight: bold;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Loading 三点动画 */
.typing-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #aaa;
  border-radius: 50%;
  margin: 0 2px;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Widget Styles */
.widget-wrapper {
  margin: 8px 0;
  width: 100%;
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
</style>

<template>
  <div class="ai-history-wrapper" :style="{ height: maxHeight }">
    <div 
      ref="listRef" 
      class="ai-history-list" 
      @scroll="handleScroll"
      @load.capture="handleImageLoad"
    >
      <div class="history-inner">
        <AIBubble
          v-for="(item, index) in list"
          :key="item.key || index"
          v-bind="item"
          @update="handleBubbleUpdate"
          @finish="(inst) => handleBubbleFinish(index, inst)"
        >
          <!-- 透传插槽 -->
          <template v-for="(_, slotName) in $scopedSlots" v-slot:[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData" :item="item" :index="index"></slot>
          </template>
        </AIBubble>
      </div>
    </div>

    <!-- 回到底部按钮 -->
    <transition name="fade">
      <div 
        v-show="showBackToBottom" 
        class="back-to-bottom-btn"
        @click="scrollToBottom"
      >
        <span class="arrow-down">↓</span>
        <span class="new-msg-tip" v-if="hasNewMessage">新消息</span>
      </div>
    </transition>
  </div>
</template>

<script>
import AIBubble from '../bubble/AIBubble.vue';

export default {
  name: 'AIHistory',
  components: {
    AIBubble
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    maxHeight: {
      type: String,
      default: '100%'
    },
    // 滚动条距离底部超过这个值，显示“回到底部”按钮
    backButtonThreshold: {
      type: Number,
      default: 150
    },
    // 自动滚动容差（在这个距离内认为是在底部）
    autoScrollTolerance: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      showBackToBottom: false,
      hasNewMessage: false,
      userScrolledUp: false,
      resizeObserver: null,
      isInitialLoading: false // 新增：标记是否处于初次加载阶段
    };
  },
  computed: {
    lastItem() {
      return this.list.length ? this.list[this.list.length - 1] : null;
    }
  },
  mounted() {
    // 组件挂载时，视为初始加载，强制无动画滚动
    this.isInitialLoading = true;
    this.scrollToBottom();
    this.initResizeObserver();
    
    // 2秒后关闭初始加载状态
    setTimeout(() => {
      this.isInitialLoading = false;
    }, 2000);
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  watch: {
    list: {
      handler(newVal, oldVal) {
        const newLen = newVal ? newVal.length : 0;
        const oldLen = oldVal ? oldVal.length : 0;

        // 只要列表引用变化，或者从 0 开始加载，或者旧列表长度不为 0 但新列表长度与旧列表不一致（大幅变化）
        // 都视为可能的“会话切换”或“初始化”
        // 更严格的判断：如果新旧列表引用不同，就重置
        
        if (newVal !== oldVal || newLen === 0 || oldLen === 0) {
          this.isInitialLoading = true;
          // 重置用户滚动状态，确保新会话一定从底部开始
          this.userScrolledUp = false;
          
          // 2秒后解除初始加载状态（给足够的时间加载图片）
          setTimeout(() => {
            this.isInitialLoading = false;
          }, 2000);
        }

        if (newLen > oldLen) {
          this.$nextTick(() => {
            // 如果是初始加载，强制滚动（忽略 userScrolledUp）
            // 否则才判断 userScrolledUp
            if (this.isInitialLoading) {
              this.scrollToBottom();
            } else if (this.userScrolledUp) {
              this.hasNewMessage = true;
            } else {
              this.scrollToBottom();
            }
          });
        }
      },
      immediate: true // 确保组件挂载时也触发
    }
  },
  methods: {
    // 监听图片加载事件
    handleImageLoad(e) {
      console.log(e,'e')
      if (e.target && e.target.tagName === 'IMG') {
        // 如果处于初始加载阶段，或者之前已经在底部，强制滚动
        if (this.isInitialLoading || !this.userScrolledUp) {
          this.scrollToBottom();
        }
      }
    },

    initResizeObserver() {
      const inner = this.$el.querySelector('.history-inner');
      if (!inner) return;

      this.resizeObserver = new ResizeObserver(() => {
        // 如果处于初始加载阶段，强制滚动
        if (this.isInitialLoading || !this.userScrolledUp) {
          this.scrollToBottom();
        }
      });
      this.resizeObserver.observe(inner);
    },

    handleScroll() {
      const el = this.$refs.listRef;
      if (!el) return;
      
      const { scrollTop, scrollHeight, clientHeight } = el;
      // 计算距离底部的距离
      // 向上滚动的距离 = 总高度 - (可视高度 + 滚动位置)
      // 比如：总高1000，可视500，滚到0(顶部)，dist = 1000 - 500 = 500
      // 滚到底部，scrollTop = 500，dist = 0
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      
      // 容错处理：有时计算会有 1px 左右的误差
      const dist = Math.max(0, Math.ceil(distanceToBottom));

      // 判断
      this.showBackToBottom = dist > this.backButtonThreshold;
      this.userScrolledUp = dist > this.autoScrollTolerance;

      // 如果回到接近底部的位置，清除新消息提示
      if (dist <= this.autoScrollTolerance) {
        this.hasNewMessage = false;
      }
    },

    handleBubbleUpdate() {
      if (!this.userScrolledUp) {
        this.scrollToBottom();
      }
    },

    handleBubbleFinish(index, instance) {
      this.$emit('complete', { index, instance });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.listRef;
        if (el) {
          // 如果是初始加载，使用 'auto' 瞬间跳转，避免动画干扰
          const behavior = this.isInitialLoading ? 'auto' : 'smooth';
          el.scrollTo({
            top: el.scrollHeight,
            behavior
          });
          // 状态重置
          // 仅当非初始加载状态下，才重置 userScrolledUp
          // 因为初始加载时图片可能还在撑开高度，此时不应认为用户已操作
          if (!this.isInitialLoading) {
            this.userScrolledUp = false;
          }
          this.hasNewMessage = false;
          this.showBackToBottom = false; // 点击后立即隐藏
        }
      });
    },

    scrollToTop() {
      const el = this.$refs.listRef;
      if (el) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/style/mixins.scss' as *;
.ai-history-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  height: 100%;

  .ai-history-list {
    flex: 1;
    overflow-y: auto;
    position: relative;
    scroll-behavior: smooth;
    width: 100%;
    @extend %scrollbar;

    .history-inner {
      display: flex;
      flex-direction: column;
      min-height: min-content;
      max-width: 960px; /* 限制内容宽度 */
      margin: 0 auto;   /* 内容居中 */
      padding: 20px;    /* 将 padding 移到这里 */
    }
  }

  .back-to-bottom-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #409eff;
    font-size: 14px;
    z-index: 10;
    transition: all 0.3s;
    user-select: none;

    &:hover {
      background-color: #f2f6fc;
      transform: translateX(-50%) translateY(-2px);
    }

    .arrow-down {
      font-weight: bold;
    }

    .new-msg-tip {
      color: #f56c6c;
      font-size: 12px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>

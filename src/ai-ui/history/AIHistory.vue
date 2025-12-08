<template>
  <div class="ai-history-wrapper" :style="{ height: maxHeight }">
    <div 
      ref="listRef" 
      class="ai-history-list" 
      @scroll="handleScroll"
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
      resizeObserver: null
    };
  },
  computed: {
    lastItem() {
      return this.list.length ? this.list[this.list.length - 1] : null;
    }
  },
  mounted() {
    this.scrollToBottom();
    this.initResizeObserver();
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  watch: {
    'list.length'(newLen, oldLen) {
      if (newLen > oldLen) {
        this.$nextTick(() => {
          if (this.userScrolledUp) {
            this.hasNewMessage = true;
          } else {
            this.scrollToBottom();
          }
        });
      }
    }
  },
  methods: {
    initResizeObserver() {
      const inner = this.$el.querySelector('.history-inner');
      if (!inner) return;

      this.resizeObserver = new ResizeObserver(() => {
        if (!this.userScrolledUp) {
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
          el.scrollTo({
            top: el.scrollHeight,
            behavior: 'smooth'
          });
          // 状态重置
          this.userScrolledUp = false;
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
.ai-history-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .ai-history-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    position: relative;
    scroll-behavior: smooth;

    .history-inner {
      display: flex;
      flex-direction: column;
      min-height: min-content;
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

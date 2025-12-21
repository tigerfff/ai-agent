<template>
  <div class="ai-history-wrapper" :style="{ height: maxHeight }">
    <div 
      ref="listRef" 
      class="ai-history-list" 
      @scroll="handleScroll"
      @load.capture="handleImageLoad"
    >
      <div class="history-inner">
        <div v-for="(item, index) in list" :key="item.key || index" class="bubble-wrapper">
          <div 
            v-if="shouldShowTime(index)" 
            class="history-time-divider"
          >
            {{ formatTime(item.time || item.createTime) }}
          </div>
        <AIBubble
          v-bind="item"
          :ignoreWidgetTypes="ignoreWidgetTypes"
          @update="handleBubbleUpdate"
          @finish="(inst) => handleBubbleFinish(index, inst)"
          class="bubble-item-wrapper" 
        >
          <!-- 1. 透传作用域插槽 (header, widget, etc) -->
          <template v-for="(_, slotName) in $scopedSlots" v-slot:[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData" :item="item" :index="index"></slot>
          </template>

          <!-- 2. 默认 Footer (操作栏) -->
          <template #footer>
            <!-- 优先使用父组件传入的 footer 插槽 -->
            <slot name="footer" :item="item" :index="index">
              <BubbleFooter 
                v-if="enableActions"
                :item="item" 
                :actions="getActions(item)"
                @action="(type, payload) => handleAction(type, payload, index)"
              >
                <template #before-custom-actions>
                  <slot name="before-custom-actions"></slot>
                </template>
                <template #after-custom-actions>
                  <slot name="after-custom-actions"></slot>
                </template>
              </BubbleFooter>
            </slot>
          </template>
        </AIBubble>
        </div>
      </div>
    </div>

    <!-- 回到底部按钮 -->
    <transition name="fade">
      <div 
        v-show="showBackToBottom" 
        class="back-to-bottom-btn"
        @click="scrollToBottom"
      >
        <span class="arrow-down">
          <i class="h-icon-angles_down_sm"></i>
        </span>
        <span class="new-msg-tip" v-if="hasNewMessage">新消息</span>
      </div>
    </transition>
  </div>
</template>

<script>
import AIBubble from '../bubble/AIBubble.vue';
import BubbleFooter from './BubbleFooter.vue';

export default {
  name: 'AIHistory',
  components: {
    AIBubble,
    BubbleFooter
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    // 需要忽略渲染的 widget 类型列表，透传给 AIBubble
    ignoreWidgetTypes: {
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
      default: 100
    },
    // 是否启用默认操作栏
    enableActions: {
      type: Boolean,
      default: true
    },
    // 操作栏配置
    actionConfig: {
      type: Object,
      default: () => ({
        user: ['edit', 'copy'],
        // 机器人：复制、点赞、踩、编辑
        bot: ['copy', 'like', 'dislike', 'edit']
      })
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
      if (e.target && e.target.tagName === 'IMG') {
        // 如果处于初始加载阶段，或者之前已经在底部，强制滚动
        if (this.isInitialLoading || !this.userScrolledUp) {
          this.scrollToBottom();
        }
      }
    },

    shouldShowTime(index) {
      if (index === 0) return true;
      const currentItem = this.list[index];
      const prevItem = this.list[index - 1];
      
      const currentTimeStr = currentItem.time || currentItem.createTime;
      const prevTimeStr = prevItem.time || prevItem.createTime;

      if (!currentTimeStr || !prevTimeStr) return false;

      // 兼容 ISO 8601 和其他常见格式
      // "2025-12-07T22:44:58.051+08:00" 是标准的 ISO 格式，new Date() 原生支持
      const currentTime = new Date(currentTimeStr).getTime();
      const prevTime = new Date(prevTimeStr).getTime();
      
      if (isNaN(currentTime) || isNaN(prevTime)) return false;
      
      // 1 hour = 3600000 ms
      return (currentTime - prevTime) > 3600000;
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      // 判断是否是今天：需要注意时区问题，简单起见用本地时间判断
      const isToday = date.getFullYear() === now.getFullYear() &&
                      date.getMonth() === now.getMonth() &&
                      date.getDate() === now.getDate();
                      
      const pad = n => n.toString().padStart(2, '0');
      const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      
      if (isToday) {
        return timePart;
      } else {
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        // 按照用户要求的格式：YYYY/MM/DD HH:mm:ss
        return `${year}/${month}/${day} ${timePart}`;
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
    },
    
    getActions(item) {
      // 根据 placement 判断角色：'end' 是用户，'start' 是机器人
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },

    handleAction(type, payload, index) {
      // 统一向外抛出事件，父组件监听 @action-click
      this.$emit('action-click', { type, payload, index });
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
      padding: 16px 32px;;
      
      .bubble-wrapper {
        width: 100%;
        display: flex;
        flex-direction: column;
      }
    }

    .history-time-divider {
      text-align: center;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.4);
      margin: 16px 0;
      user-select: none;
    }
  }

  .back-to-bottom-btn {
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    padding: 4px;
    align-items: center;
    color: #000;
    z-index: 10;
    transition: all 0.3s;
    user-select: none;

    &:hover {
      background-color: #f2f6fc;
      transform: translateX(-50%) translateY(-2px);
    }

    .arrow-down {
      font-weight: bold;
      font-size: 24px;
      display: flex;
      align-items: center;
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

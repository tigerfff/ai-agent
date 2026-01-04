<template>
  <div class="ai-history-wrapper" :style="{ height: maxHeight }">
    <div 
      ref="listRef" 
      class="ai-history-list" 
      @scroll="handleScroll"
      @load.capture="handleImageLoad"
    >
      <div class="history-inner">
        <!-- 顶部加载指示器 -->
        <div v-if="loading || noMore" class="history-load-more" ref="loadMoreRef">
          <template v-if="loading">
            <i class="h-icon-loading history-loading-icon"></i>
            <span>{{ loadingText }}</span>
          </template>
          <template v-else-if="noMore">
            <span class="no-more-text">{{ noMoreText }}</span>
          </template>
        </div>

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
        @click="scrollToBottom()"
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
      default: 300
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
    },
    // 是否正在分页加载
    loading: {
      type: Boolean,
      default: false
    },
    // 是否全部加载完毕
    noMore: {
      type: Boolean,
      default: false
    },
    // 距离顶部多少像素触发加载
    loadMoreThreshold: {
      type: Number,
      default: 50
    },
    // 加载中的自定义文案
    loadingText: {
      type: String,
      default: '正在加载历史记录...'
    },
    // 没有更多数据的文案
    noMoreText: {
      type: String,
      default: '没有更多记录了'
    }
  },
  data() {
    return {
      showBackToBottom: false,
      hasNewMessage: false,
      userScrolledUp: false,
      resizeObserver: null,

      // 向上分页加载锁：避免分页过程中被 ResizeObserver/图片load/bubble update 误判并滚到底部
      isLoadMoreTriggered: false,
      loadMorePrevScrollHeight: 0,
      loadMorePrevScrollTop: 0,
      
      lastListLength: 0 // 记录上一次列表长度，避开 Vue 2 数组引用相同导致的 watch 判定失效问题
    };
  },
  computed: {
    lastItem() {
      return this.list.length ? this.list[this.list.length - 1] : null;
    }
  },
  mounted() {
    // 初始进入，直接滚到底部
    this.scrollToBottom('auto');
    this.initResizeObserver();
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  watch: {
    list: {
      handler(newVal) {
        const el = this.$refs.listRef;
        // 在数据更新前，先记录当前是否接近底部
        const wasNearBottom = el ? this.isNearBottom(el) : true;

        const newLen = newVal ? newVal.length : 0;
        const oldLen = this.lastListLength; // 使用记录的旧长度，避开对象引用问题

        // 立即更新长度记录
        this.lastListLength = newLen;

        // 1. 会话切换或初始化：旧长度为 0，新长度大于 0
        if (oldLen === 0 && newLen > 0) {
          this.userScrolledUp = false;
          this.scrollToBottom('auto');
          return;
        }

        // 2. 向上分页加载数据：以“触发 load-more 时记录的锁”为准（避免阈值判断不稳定）
        if (this.isLoadMoreTriggered && newLen > oldLen && this.$refs.listRef) {
          const el = this.$refs.listRef;
          const prevHeight = this.loadMorePrevScrollHeight || 0;
          const prevTop = this.loadMorePrevScrollTop || 0;

          this.$nextTick(() => {
            const newHeight = el.scrollHeight;
            const diff = newHeight - prevHeight;
            if (diff !== 0) {
              // 锁定视角：保持用户看到的内容不变
              el.scrollTop = prevTop + diff;
            }

            // 分页结束，解除锁
            this.isLoadMoreTriggered = false;
            this.loadMorePrevScrollHeight = 0;
            this.loadMorePrevScrollTop = 0;
          });
          return;
        }

        // 3. 新消息到达（向下增加）
        if (newLen > oldLen) {
          this.$nextTick(() => {
            // 使用更新前记录的状态 wasNearBottom 来决定是否自动滚动
            // 这样可以避免新消息撑开高度后导致 isNearBottom 判定失败
            if (wasNearBottom) {
              this.scrollToBottom('smooth');
            } else {
              this.hasNewMessage = true;
            }
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    getDistanceToBottom(el) {
      if (!el) return 0;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      return Math.max(0, Math.ceil(distanceToBottom));
    },

    isNearBottom(el) {
      return this.getDistanceToBottom(el) <= this.autoScrollTolerance;
    },

    // 监听图片加载事件
    handleImageLoad(e) {
      if (e.target && e.target.tagName === 'IMG') {
        // 分页加载过程中禁止自动置底
        if (this.isLoadMoreTriggered || this.loading) return;

        // 只有在“确实接近底部”时，图片撑开高度后才继续保持在底部
        const el = this.$refs.listRef;
        if (this.isNearBottom(el)) {
          this.scrollToBottom('auto');
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

      const currentTime = new Date(currentTimeStr).getTime();
      const prevTime = new Date(prevTimeStr).getTime();
      
      if (isNaN(currentTime) || isNaN(prevTime)) return false;
      
      return (currentTime - prevTime) > 3600000;
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
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
        return `${year}/${month}/${day} ${timePart}`;
      }
    },

    initResizeObserver() {
      const inner = this.$el.querySelector('.history-inner');
      if (!inner) return;

      this.resizeObserver = new ResizeObserver(() => {
        // 分页加载过程中禁止自动置底
        if (this.isLoadMoreTriggered || this.loading) return;

        // 只有在“确实接近底部”时，才随内容撑开自动滚动（避免分页插入导致误置底）
        const el = this.$refs.listRef;
        if (this.isNearBottom(el)) {
          this.scrollToBottom('auto');
        }
      });
      this.resizeObserver.observe(inner);
    },

    handleScroll() {
      const el = this.$refs.listRef;
      if (!el) return;
      
      const { scrollTop, scrollHeight, clientHeight } = el;

      console.log('scrollTop', scrollTop);

      // 触发向上分页加载：必须有滚动条且触达顶部阈值
      const hasScrollbar = scrollHeight > clientHeight;
      if (!this.loading && !this.noMore && !this.isLoadMoreTriggered && hasScrollbar && scrollTop <= this.loadMoreThreshold) {
        // 记录触发时的滚动信息，用于后续锁定视角
        this.isLoadMoreTriggered = true;
        this.loadMorePrevScrollHeight = scrollHeight;
        this.loadMorePrevScrollTop = scrollTop;
        this.$emit('load-more');
      }

      // 计算距离底部的距离
      const dist = this.getDistanceToBottom(el);

      // 按钮显示逻辑
      this.showBackToBottom = dist > this.backButtonThreshold;
      this.userScrolledUp = dist > this.autoScrollTolerance;

      console.log('dist', dist);

      if (dist <= this.autoScrollTolerance) {
        this.hasNewMessage = false;
      }
    },

    handleBubbleUpdate() {
      // 分页加载过程中禁止自动置底
      if (this.isLoadMoreTriggered || this.loading) return;

      // 只有在“确实接近底部”时才跟随到底部，避免分页插入或状态不同步导致误置底
      const el = this.$refs.listRef;
      if (this.isNearBottom(el)) {
        this.scrollToBottom('auto');
      }
    },

    handleBubbleFinish(index, instance) {
      this.$emit('complete', { index, instance });
    },

    scrollToBottom(behavior = 'smooth') {
      // 这里的 behavior 如果是浏览器事件对象，则强制转为 smooth
      const finalBehavior = (typeof behavior === 'string') ? behavior : 'smooth';

      this.$nextTick(() => {
        const el = this.$refs.listRef;
        if (el) {
          el.scrollTo({
            top: el.scrollHeight,
            behavior: finalBehavior
          });
          // 既然用户主动点击了置底，强制重置所有状态
          this.userScrolledUp = false;
          this.hasNewMessage = false;
          this.showBackToBottom = false;
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

      .history-load-more {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 13px;

        .history-loading-icon {
          animation: rotating 2s linear infinite;
        }

        .no-more-text {
          color: rgba(0, 0, 0, 0.25);
        }
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
      color: var(--ym-ai-primary-color);
      font-size: 12px;
    }
  }
}

@keyframes rotating {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
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

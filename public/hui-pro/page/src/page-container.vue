<template>
  <div class="h-page-container">
    <slot name="pageHeader" />
    <div v-if="headerAffix" :style="{ marginTop: `${headerHeight}px` }">
      <slot />
    </div>
    <slot v-else />
  </div>
</template>

<script>
import { on, off, throttle } from '@hui-pro/utils';

export default {
  name: 'HPageContainer',
  provide() {
    return {
      pageContainer: this
    };
  },
  data() {
    return {
      headerAffix: false, // 页面头部是否为固定模式
      headerHeight: 0, // 页面头部高度
      sidebarAffix: false, // 侧边栏是否为固定模式（page-action控件使用）
      scrollTop: 0, // 页面滚动距离
      innerWidth: 0
    };
  },
  computed: {
    page() {
      let { $parent } = this;
      while ($parent.$options.name !== 'HPage') {
        $parent = $parent.$parent;
        if (!$parent) return null;
      }
      return $parent;
    }
  },
  mounted() {
    on(this.$el, 'resize', this.resize);
    on(document, 'scroll', this.handlePageScroll);
    if (document.documentElement) document.documentElement.scrollTop = 0;
  },
  beforeDestroy() {
    off(this.$el, 'resize', this.resize);
    off(document, 'scroll', this.handlePageScroll);
  },
  methods: {
    /**
     * @desc 响应页面宽度变化，修改内容区域宽度
     * @author chenguanbin
     */
    resize() {
      throttle(() => {
        this.innerWidth = this.$el.offsetWidth;
      })();
    },

    /**
     * @desc 监控页面滚动
     * @author chenguanbin
     */
    handlePageScroll: function() {
      const scroll = {
        scrollTop: document.documentElement.scrollTop,
        scrollLeft: document.documentElement.scrollLeft
      };

      this.scrollTop = scroll.scrollTop;

      // 抛出事件 on-scroll
      this.$emit('on-scroll', scroll);
    }
  }
};
</script>

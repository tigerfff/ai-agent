<template>
  <div
    :class="{
      'is-flex': flex,
      'is-horizontal': direction === 'horizontal',
      'is-align-center': alignCenter
    }"
    class="h-page-content"
  >
    <slot />
  </div>
</template>

<script>
import { throttle, on, off } from '@hui-pro/utils';

export default {
  name: 'HPageContent',
  provide() {
    return {
      pageContent: this
    };
  },
  props: {
    // 内部是否使用 flex 布局
    flex: {
      type: Boolean,
      default: false
    },
    // 使用 flex 布局时，水平方向是否居中
    alignCenter: {
      type: Boolean,
      default: false
    },
    // 使用 flex 布局时，内部是水平排列还是垂直排列，默认为'垂直排列'
    direction: {
      type: String,
      default: 'vertical',
      validator: function(value) {
        return ['vertical', 'horizontal'].includes(value);
      }
    }
  },
  data() {
    return {
      searchIconExist: false, // 搜索图标是否存在
      searchIconActive: false, // 搜索图标是否被激活
      searchIconLazy: false, // 页面是否滚动超过搜索栏底部，为true时，搜索图标显示为未激活状态
      actionAffix: false, // 操作栏是否为固定模式
      actionHeight: 44, // 操作栏高度，默认为44px
      innerWidth: 0, // 内容区域宽度，减去左右间距
      innerHeight: 0
    };
  },
  mounted() {
    this.resize();
    on(this.$el, 'resize', this.resize);
  },
  beforeDestroy() {
    off(this.$el, 'resize', this.resize);
  },
  methods: {
    /**
     * @desc 响应页面宽度变化，修改内容区域宽度
     * @author chenguanbin
     */
    resize() {
      throttle(() => {
        const gutter = 24; // 左右间距各12px，共24px
        this.innerWidth = this.$el.offsetWidth - gutter;
        this.innerHeight = this.$el.offsetHeight;
      })();
    }
  }
};
</script>

<template>
  <!-- 容器需要设置宽度，因为是 flex 布局，侧边栏固定后，依然需要在页面上占据空间 -->
  <aside :style="{ width }" class="h-page-sidebar-wrapper">
    <div
      :class="{ 'is-fixed': fixed }"
      :style="{
        width,
        height: fixed ? 'auto' : `${height}px`,
        top: fixed && `${offsetTop}px`
      }"
      class="h-page-sidebar"
    >
      <div v-if="$slots.pageSidebarAction" class="h-page-sidebar__action">
        <slot name="pageSidebarAction" />
      </div>
      <div v-if="$slots.pageSidebarSearch" class="h-page-sidebar__search">
        <slot name="pageSidebarSearch" />
      </div>
      <div
        :class="{
          'h-page-sidebar__list': type === 'list',
          'is-inline-scroll': showScrollbar
        }"
        class="h-page-sidebar__main"
      >
        <el-scrollbar v-if="showScrollbar" wrap-class="page-scrollbar__wrap">
          <div class="h-page-sidebar__main--content">
            <slot />
          </div>
        </el-scrollbar>
        <slot v-else />
      </div>
    </div>
  </aside>
</template>

<script>
import { on, off, offset } from '@hui-pro/utils';

export default {
  name: 'HPageSidebar',
  inject: ['pageContainer'],
  props: {
    // 侧边栏类型，可选: ['list']
    type: {
      type: String,
      default: 'default',
      validator: function(value) {
        return ['default', 'list'].includes(value);
      }
    },
    // 是否开启固定模式
    affix: {
      type: Boolean,
      default: true
    },
    // 距离窗口顶部达到指定偏移量后触发
    offsetTop: {
      type: Number,
      default: 0
    },
    // 侧边栏宽度
    width: {
      type: String,
      default: '256px'
    },
    // 是否使用内置滚动条
    inlineScroll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fixed: false, // 是否固定
      height: null // 侧边栏实际高度，侧边栏不固定且页面在滚动时，需要实时修改高度
    };
  },
  computed: {
    // 页面滚动距离
    scrollTop() {
      return this.pageContainer.scrollTop;
    },
    showScrollbar() {
      return this.inlineScroll || this.type === 'list';
    }
  },
  watch: {
    // 监听页面滚动距离
    scrollTop() {
      this.setSidebarStyle();
    }
  },
  created() {
    // 将侧边栏状态保存到 page-container 控件
    this.pageContainer.sidebarAffix = true;
  },
  mounted() {
    this.setSidebarStyle();
    // 监控容器宽度变化
    on(this.$el, 'resize', this.setSidebarStyle);
  },
  beforeDestroy() {
    off(this.$el, 'resize', this.setSidebarStyle);
  },
  methods: {
    /**
     * @desc 设置侧边栏的固定状态
     * @author chenguanbin
     */
    setSidebarStyle() {
      if (!this.affix) return;
      // keep-alive的情况下，切换到其他页面，侧边栏还是会计算，需要用 offsetHeight 来判断是否在当前页面
      if (!this.$el.offsetHeight) return;
      const scrollTop = this.scrollTop;
      const spacingTop = offset(this.$el).top; // 容器到页面顶部的距离
      const offsetHeight = this.$el.offsetHeight; // 容器实际所占的高度
      // 若页面滚动距离超过容器顶部，则侧边栏固定
      if (scrollTop >= spacingTop - this.offsetTop) {
        this.fixed = true;
      } else {
        this.fixed = false;
        this.height = offsetHeight + scrollTop;
      }
    }
  }
};
</script>

<template>
  <div
    :class="{
      'is-full': full,
      'has-border': border,
      'is-scrollbar-fixed': scFixed
    }"
    class="h-page-table"
  >
    <div ref="main" class="h-page-table__main">
      <slot />
      <template v-if="$slots.pagination">
        <div
          ref="pagination"
          :style="{ height: paginationAffix ? `${pHeight}px` : null }"
          class="h-page-table__pagination"
        >
          <div
            v-if="paginationAffix"
            ref="affix"
            :style="{
              left: affixLeft,
              right: affixRight,
              bottom: `${paginationOffsetBottom}px`
            }"
            class="h-page-table__pagination--affix"
          >
            <slot name="pagination" />
          </div>
          <slot v-else name="pagination" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { on, off, addClass, removeClass, offset } from '@hui-pro/utils';

export default {
  name: 'HPageTable',
  inject: ['pageContainer', 'pageContent'],
  props: {
    // 表格是否占据容器的剩余空间
    full: {
      type: Boolean,
      default: false
    },
    // 表格左右是否有边框
    border: {
      type: Boolean,
      default: false
    },
    // 表格头部是否开启固定模式
    headerAffix: {
      type: Boolean,
      default: true
    },
    // 表格头部开启固定模式时，距离窗口顶部达到指定偏移量后触发
    headerOffsetTop: {
      type: Number,
      default: null
    },
    // 滚动条是否开启固定模式
    scrollbarAffix: {
      type: Boolean,
      default: true
    },
    // 滚动条开启固定模式时，距离窗口底部达到指定偏移量后触发
    scrollbarOffsetBottom: {
      type: Number,
      default: 0
    },
    // 分页栏是否开启固定模式
    paginationAffix: {
      type: Boolean,
      default: true
    },
    // 分页栏开启固定模式时，距离窗口底部达到指定偏移量后触发
    paginationOffsetBottom: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      pHeight: 0,
      affixLeft: 0,
      affixRight: 0,
      scFixed: false,
      scrolling: false, // 页面是否正在滚动
      scrollTimer: null // 滚动计时器
    };
  },
  computed: {
    // 获取 h-page 控件
    page() {
      let { $parent } = this;
      while ($parent.$options.name !== 'HPage') {
        $parent = $parent.$parent;
        if (!$parent) return null;
      }
      return $parent;
    },
    // 页面滚动距离
    scrollTop() {
      return this.pageContainer.scrollTop;
    },
    contentWidth() {
      return this.pageContent.innerWidth;
    },
    contentHeight() {
      return this.pageContent.innerHeight;
    }
  },
  watch: {
    // 监听页面滚动距离
    scrollTop() {
      if (!this.$el.offsetHeight) return;
      this.setHeaderFixed();
      // 滚动条开启固定模式，但分页栏未使用插槽，或者分页栏未开启固定模式，页面滚动时要实时设置滚动条固定状态
      if (
        this.scrollbarAffix &&
        (!this.$slots.pagination || !this.paginationAffix)
      )
        this.setScrollbarFixed();
    },
    // 监控页面是否在滚动
    scrolling(scrolling) {
      if (scrolling) return;

      // 获取页面上所有的表格
      const $tableAll = Array.from(this.$el.querySelectorAll('.el-table'));
      if (!$tableAll || !$tableAll.length) return;
      for (const $table of $tableAll) {
        const $tHeader = $table.querySelector('.el-table__header-wrapper'); // 表格的头部
        // 表格固定情况下的头部，可能有左右两个
        const $tFixedHeader = $table.querySelectorAll(
          '.el-table__fixed-header-wrapper'
        );
        // 若表格头部固定
        if (this.headerAffix) {
          this._setTableHeaderStyle($tHeader, $tFixedHeader, 'opacity', 1);
        }
      }
    },
    contentWidth() {
      this.resize();
    },
    // 监听容器高度变化，因为页面高度变化时 main 元素不会调用 resize 方法
    contentHeight() {
      this.resize();
    }
  },
  mounted() {
    if (this.$refs.affix) this.pHeight = this.$refs.affix.scrollHeight;
    on(this.$refs.main, 'resize', this.resize);

    // 若分页栏开启固定模式，给每页显示条数下拉框添加样式类
    if (this.$slots.pagination && this.paginationAffix) {
      for (const slot of this.$slots.pagination) {
        if (slot.componentOptions.tag === 'el-pagination') {
          slot.componentInstance.popperClass =
            'h-page-table__pagination-dropdown';
        }
      }
    }
  },
  beforeDestroy() {
    off(this.$refs.main, 'resize', this.resize);
  },
  // keep-alive 情况下进行路由切换
  activated() {
    this.setHeaderFixed();
  },
  methods: {
    /**
     * @desc 响应表格内容大小变化
     * @author chenguanbin
     */
    resize() {
      this.setPaginationFixed();
      this.setScrollbarFixed();
      this.setHeaderFixed();
    },

    /**
     * @desc 设置表格区域的样式（方法已废弃，考虑到外部可能有人使用，暂时保留空方法）
     * @author chenguanbin
     */
    setTableStyle() {},

    /**
     * @desc 设置表格分页栏的固定状态
     * @author chenguanbin
     */
    setPaginationFixed() {
      if (!this.$slots.pagination || !this.paginationAffix) return;
      if (this.$refs.affix) this.pHeight = this.$refs.affix.scrollHeight;
      const scrollWidth = this.page
        ? this.page.$el.scrollWidth
        : this.pageContainer.$el.scrollWidth;
      const elOffset = offset(this.$el);
      this.affixLeft = `${elOffset.left}px`;
      this.affixRight = `${scrollWidth - elOffset.right}px`;
    },

    /**
     * @desc 设置表格滚动条的固定状态
     * @author chenguanbin
     */
    setScrollbarFixed() {
      if (!this.scrollbarAffix) return;
      this.$nextTick(() => {
        const $scrollbar = this.$el.querySelector(
          '.el-table__body-wrapper > .el-scrollbar > .el-scrollbar__bar.is-horizontal'
        );
        if (!$scrollbar) return;
        const scrollWidth = this.page
          ? this.page.$el.scrollWidth
          : this.pageContainer.$el.scrollWidth;
        const elOffset = offset(this.$el);
        this._setScFixedStatus();
        Object.assign($scrollbar.style, {
          left: this.scFixed ? `${elOffset.left}px` : '0',
          right: this.scFixed ? `${scrollWidth - elOffset.right}px` : '0',
          bottom: this.scFixed
            ? `${this.scrollbarOffsetBottom ||
                this.pHeight + this.paginationOffsetBottom}px` // scrollbarOffsetBottom 属性优先级最高
            : '0'
        });
      });
    },

    /**
     * @desc 设置滚动条是否固定
     * @author chenguanbin
     */
    _setScFixedStatus() {
      const bodyHeight = document.body.offsetHeight;
      const elOffset = offset(this.$el);
      const tableOffset = offset(this.$el.querySelector('.el-table'));
      const pgOffset = offset(this.$refs.pagination);

      // 若设置 scrollbarOffsetBottom 属性，优先根据属性值计算滚动条是否固定
      if (this.scrollbarOffsetBottom) {
        this.scFixed =
          bodyHeight + this.scrollTop <
          tableOffset.bottom + this.scrollbarOffsetBottom;
      } else {
        // 若分页开启固定模式，根据表格是否超出来屏幕，来设置滚动条是否固定
        // 若分页未开启固定模式，根据分页是否出现在屏幕中，来设置滚动条是否固定
        this.scFixed =
          this.$slots.pagination && this.paginationAffix
            ? bodyHeight <= elOffset.bottom
            : pgOffset.top > bodyHeight + this.scrollTop;
      }
    },

    /**
     * @desc 设置表格头部的固定状态
     * @author chenguanbin
     */
    setHeaderFixed() {
      // 若表格头部需要固定
      if (this.headerAffix) {
        this.scrolling = true;
        this._setScrollTimer();
        this.fixedTable();
      }
    },

    /**
     * @desc 设置滚动计时器，500ms后设置为不滚动
     * @author chenguanbin
     */
    _setScrollTimer() {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        this.scrolling = false;
      }, 500);
    },

    /**
     * @desc 固定页面表格上的元素
     * @author chenguanbin
     */
    fixedTable() {
      // 获取页面上所有的表格
      const $table = this.$el.querySelector('.el-table');

      // 若页面上没有表格，直接返回
      if (!$table) return;

      const { top: offsetTop } = offset($table); // 表格距离页面左上角的距离
      this.fixedTableHeader($table, offsetTop);
    },

    /**
     * @desc 固定表格头部
     * @author chenguanbin
     * @param {Document} $table 表格
     * @param {Number} offsetTop 表格到页面左上角的距离
     */
    fixedTableHeader($table, offsetTop) {
      const {
        pageContent: { actionAffix, actionHeight }
      } = this;
      const $tHeader = $table.querySelector('.el-table__header-wrapper'); // 表格的头部
      // 表格固定情况下的头部，可能有左右两个
      const $tFixedHeader = $table.querySelectorAll(
        '.el-table__fixed-header-wrapper'
      );
      const offsetHeight = $table.offsetHeight; // 表格的高度
      const headerHeight = 36; // 表格头部高度
      // 表格头部固定时到页面顶部的距离（表格头部和页面顶部有1px的偏差）
      // headerOffsetTop 属性优先，然后判断操作栏是否固定
      const gutter = this.headerOffsetTop
        ? this.headerOffsetTop - 1
        : actionAffix
        ? actionHeight - 1
        : -1;

      // 若页面滚动到表格头部，表头固定
      if (this.scrollTop > offsetTop - gutter) {
        const targetTop = `${this.scrollTop - offsetTop + gutter}px`;
        this._setTableHeaderStyle($tHeader, $tFixedHeader, 'top', targetTop);
      }

      // 若页面滚到未超过表格头部，表头显示
      if (this.scrollTop <= offsetTop + headerHeight - gutter) {
        this._setTableHeaderStyle($tHeader, $tFixedHeader, 'opacity', 1);
        removeClass($table, 'fixed-header');
      }

      // 若页面滚动超过表格头部，且正在滚动中，表头隐藏
      if (this.scrollTop > offsetTop + headerHeight - gutter) {
        this._setTableHeaderStyle($tHeader, $tFixedHeader, 'opacity', 0);
        addClass($table, 'fixed-header');
      }

      // 若页面滚动未到达表格头部，或者页面滚动超过表格，表头不固定
      if (
        this.scrollTop <= offsetTop - gutter ||
        this.scrollTop > offsetTop + offsetHeight - headerHeight
      ) {
        this._setTableHeaderStyle($tHeader, $tFixedHeader, 'top', '0');
      }
    },

    /**
     * 设置表格头部样式
     * @author chenguanbin
     * @param {Node} $tHeader 表格头部
     * @param {NodeList} $tFixedHeader 左右固定的表格头部
     * @param {String} property 样式属性
     * @param {String|Number} value 样式值
     */
    _setTableHeaderStyle($tHeader, $tFixedHeader, property, value) {
      $tHeader.style[property] = value;
      if ($tFixedHeader && $tFixedHeader.length) {
        if ($tFixedHeader[0]) $tFixedHeader[0].style[property] = value;
        if ($tFixedHeader[1]) $tFixedHeader[1].style[property] = value;
      }
    }
  }
};
</script>

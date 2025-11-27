<template>
  <div
    :class="{
      'el-table--fit': fit,
      'el-table--striped': stripe,
      'el-table--border': border,
      'el-table--group': isGroup,
      'el-table--fluid-height': maxHeight,
      'el-table--enable-row-hover': !store.states.isComplex,
      'el-table--enable-row-transition':
        (store.states.data || []).length !== 0 &&
        (store.states.data || []).length < 100
    }"
    class="el-table"
    @mouseleave="handleMouseLeave($event)"
  >
    <div ref="hiddenColumns" class="hidden-columns">
      <slot />
    </div>
    <div v-if="showHeader" ref="headerWrapper" class="el-table__header-wrapper">
      <table-header
        :store="store"
        :default-sort="defaultSort"
        :style="{ width: bodyWidth }"
      />
    </div>
    <div ref="bodyWrapper" :style="[bodyHeight]" class="el-table__body-wrapper">
      <el-scrollbar
        ref="tableScrollbar"
        :overflow="alwaysShowBar || isFixBarScrollShow ? 'scroll' : 'auto'"
        :overflow-x="niceScroll === 'vertical' ? 'hidden' : 'auto'"
        wrap-class="el-table-scrollbar__wrap"
        view-class="el-table-scrollbar__view"
        :wrap-style="wrapStyle"
        :view-style="[{ width: bodyWidth }]"
        @on-scrolling-x="onScrollingX"
        @on-scrolling-y="onScrollingY"
      >
        <table-body
          ref="tableBody"
          :context="context"
          :store="store"
          :stripe="stripe"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :highlight="highlightCurrentRow"
          :style="{ width: bodyWidth }"
        />
        <div
          v-if="isShowEmptyText"
          :style="{ width: bodyWidth }"
          class="el-table__empty-block"
        >
          <span class="el-table__empty-text">
            <slot name="empty">
              {{ emptyText || t('el.table.emptyText') }}
            </slot>
          </span>
        </div>
      </el-scrollbar>
      <slot v-if="showLoading" name="loading">
        <div v-loading="showLoading" class="el-table__loading" />
      </slot>
    </div>
    <div
      v-if="showSummary"
      ref="footerWrapper"
      class="el-table__footer-wrapper"
    >
      <table-footer
        :store="store"
        :border="border"
        :sum-text="sumText || t('el.table.sumText')"
        :summary-method="summaryMethod"
        :default-sort="defaultSort"
        :style="{ width: bodyWidth }"
      />
    </div>
    <div
      v-if="fixedColumns.length > 0"
      ref="fixedWrapper"
      :style="[{ width: fixedWidth }, fixedHeight]"
      class="el-table__fixed"
      @mouseenter.stop="isFixBarScrollShow = true"
      @mouseleave.stop="isFixBarScrollShow = false"
    >
      <div
        v-if="showHeader"
        ref="fixedHeaderWrapper"
        class="el-table__fixed-header-wrapper"
      >
        <table-header
          :store="store"
          :style="{ width: fixedWidth }"
          fixed="left"
        />
      </div>
      <div
        ref="fixedBodyWrapper"
        :style="[fixedBodyHeight]"
        class="el-table__fixed-body-wrapper"
      >
        <table-body
          ref="tableBody"
          :store="store"
          :stripe="stripe"
          :highlight="highlightCurrentRow"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :style="{ width: fixedWidth }"
          fixed="left"
        />
      </div>
      <div
        v-if="showSummary"
        ref="fixedFooterWrapper"
        class="el-table__fixed-footer-wrapper"
      >
        <table-footer
          :border="border"
          :sum-text="sumText || t('el.table.sumText')"
          :summary-method="summaryMethod"
          :store="store"
          :style="{ width: fixedWidth }"
          fixed="left"
        />
      </div>
    </div>
    <div
      v-if="fixedColumns.length > 0"
      :style="[
        {
          width: fixedWidth,
          height: fixedShadowHeight
        }
      ]"
      class="el-table__fixed-box-shadow el-table__fixed-box-shadow-left"
    />
    <div
      v-if="rightFixedColumns.length > 0"
      ref="rightFixedWrapper"
      :style="[
        { width: rightFixedWidth },
        {
          right: border ? layout.gutterWidth : (layout.gutterWidth || 1) + 'px'
        },
        fixedHeight
      ]"
      class="el-table__fixed-right"
      @mouseenter.stop="isFixBarScrollShow = true"
      @mouseleave.stop="isFixBarScrollShow = false"
    >
      <div
        v-if="showHeader"
        ref="rightFixedHeaderWrapper"
        class="el-table__fixed-header-wrapper"
      >
        <table-header
          :store="store"
          :style="{ width: rightFixedWidth }"
          fixed="right"
        />
      </div>
      <div
        ref="rightFixedBodyWrapper"
        :style="[fixedBodyHeight]"
        class="el-table__fixed-body-wrapper"
      >
        <table-body
          ref="tableBody"
          :store="store"
          :stripe="stripe"
          :row-class-name="rowClassName"
          :row-style="rowStyle"
          :highlight="highlightCurrentRow"
          :style="{ width: rightFixedWidth }"
          fixed="right"
        />
      </div>
      <div
        v-if="showSummary"
        ref="rightFixedFooterWrapper"
        class="el-table__fixed-footer-wrapper"
      >
        <table-footer
          :border="border"
          :sum-text="sumText || t('el.table.sumText')"
          :summary-method="summaryMethod"
          :store="store"
          :style="{ width: rightFixedWidth }"
          fixed="right"
        />
      </div>
    </div>
    <div
      v-if="rightFixedColumns.length > 0"
      :style="[
        {
          width: rightFixedWidth,
          height: fixedShadowHeight
        }
      ]"
      class="el-table__fixed-box-shadow el-table__fixed-box-shadow-right"
    />
    <div
      v-if="rightFixedColumns.length > 0"
      :style="{ width: '0', height: layout.headerHeight + 'px' }"
      class="el-table__fixed-right-patch"
    />
    <div
      v-show="resizeProxyVisible"
      ref="resizeProxy"
      class="el-table__column-resize-proxy"
    />
  </div>
</template>

<script type="text/babel">
// import ElCheckbox from 'hui/packages/checkbox';
import throttle from 'throttle-debounce/throttle';
import debounce from 'throttle-debounce/debounce';
import {
  addResizeListener,
  removeResizeListener
} from 'hui/src/utils/resize-event';
import Locale from 'hui/src/mixins/locale';
import TableStore from './table-store';
import TableLayout from './table-layout';
import TableBody from './table-body';
import TableHeader from './table-header';
import TableFooter from './table-footer';
import ElScrollbar from 'hui/packages/scrollbar';
import { mousewheel, normalizeWheel } from './util';

const tableIdSeed = 1;

export default {
  name: 'ElTable',

  components: {
    TableHeader,
    TableFooter,
    TableBody,
    // ElCheckbox,
    ElScrollbar
  },

  mixins: [Locale],

  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },

    width: {
      type: [String, Number],
      default: null
    },

    height: {
      type: [String, Number],
      default: null
    },

    maxHeight: {
      type: [String, Number],
      default: null
    },

    fit: {
      type: Boolean,
      default: true
    },

    stripe: {
      type: Boolean,
      default: null
    },

    border: {
      type: Boolean,
      default: null
    },

    rowKey: {
      type: [String, Function],
      default: null
    },

    context: {
      type: null,
      default: null
    },

    showHeader: {
      type: Boolean,
      default: true
    },

    showSummary: {
      type: Boolean,
      default: null
    },

    sumText: {
      type: String,
      default: null
    },

    summaryMethod: {
      type: Function,
      default: null
    },

    rowClassName: {
      type: [String, Function],
      default: null
    },

    rowStyle: {
      type: [Object, Function],
      default: null
    },

    cellClassName: {
      type: [String, Function],
      default: null
    },

    cellStyle: {
      type: [Object, Function],
      default: null
    },

    headerRowClassName: {
      type: [String, Function],
      default: null
    },

    headerRowStyle: {
      type: [Object, Function],
      default: null
    },

    headerCellClassName: {
      type: [String, Function],
      default: null
    },

    headerCellStyle: {
      type: [Object, Function],
      default: null
    },

    highlightCurrentRow: {
      type: Boolean,
      default: null
    },

    currentRowKey: {
      type: [String, Number],
      default: null
    },

    emptyText: {
      type: String,
      default: null
    },

    expandRowKeys: {
      type: Array,
      default: null
    },

    defaultExpandAll: {
      type: Boolean,
      default: null
    },

    defaultSort: {
      type: Object,
      default() {
        return {
          prop: '',
          order: ''
        };
      }
    },
    // 设置默认的排序规则 add by yangzhini 2019-04-18
    defaultSortMethod: {
      type: Function,
      default: null
    },

    alwaysShowBar: {
      type: Boolean,
      default: null
    }, // 始终显示滚动条还是鼠标移入才显示

    forceScroll: {
      // 在不指定高度和最大高度时是否强制美化滚动条，如果是，则需要指定表格外部容器高度
      type: [Boolean, String],
      default: false
    },

    showLoading: {
      // 分页请求时是否显示加载中
      type: Boolean,
      default: false
    },

    spanMethod: {
      type: Function,
      default: null
    },

    showHeaderOverflow: {
      // 当header中内容过长被隐藏时显示title add by yangzhini 2018-08-02
      type: Boolean,
      default: true
    },
    showOverflowTooltip: {
      type: Boolean,
      default: null
    },
    showOverflowTitle: {
      // 默认单元格内容溢出时隐藏，展示title modify by yangzhini 2019-03-21
      type: Boolean,
      default: true
    },

    // 设置是否开启虚拟滚动 add by yangzhini 2019-09-05
    enableVirtualScroll: {
      type: Boolean,
      default: false
    },
    // 是否显示全选按钮
    showHeaderSelection: {
      type: Boolean,
      default: true
    }
  },

  data() {
    const store = new TableStore(this, {
      rowKey: this.rowKey,
      defaultExpandAll: this.defaultExpandAll,
      defaultSortMethod: this.defaultSortMethod
    });
    const layout = new TableLayout({
      store,
      table: this,
      fit: this.fit,
      showHeader: this.showHeader
    });
    return {
      store,
      layout,
      renderExpanded: null,
      resizeProxyVisible: false,
      // isShowLoading: false, 暂时没用了，去掉 2021/7/27
      /* 外部传入的force-scroll原本是boolean型，
       * 现改为boolean和string均可，
       * 那么以前的force-scroll直接写个属性名的方式声明布尔型会导致传入undefined
       * 为了兼容已有项目，这里声明内部变量予以拦截
       * */
      niceScroll: true,
      /**
       * 移动到el-table__fixed也出现滚动条，为了不影响alwaysShowBar；新增一个参数控制
       */
      isFixBarScrollShow: false,
      // fixedShadowHeight: '',
      resizeState: {
        width: null,
        height: null
      },
      // 是否拥有多级表头
      isGroup: false,

      scrollTop: 0,
      bodyWrapperHeight: 1080
    };
  },

  computed: {
    bodyWrapper() {
      return this.$refs.bodyWrapper;
    },

    shouldUpdateHeight() {
      return (
        this.height ||
        this.maxHeight ||
        this.fixedColumns.length > 0 ||
        this.rightFixedColumns.length > 0
      );
    },

    selection() {
      return this.store.states.selection;
    },

    columns() {
      return this.store.states.columns;
    },

    tableData() {
      return this.store.states.data;
    },

    fixedColumns() {
      return this.store.states.fixedColumns || [];
    },

    rightFixedColumns() {
      return this.store.states.rightFixedColumns;
    },

    wrapStyle() {
      let style = [];

      if (this.maxHeight) {
        let _maxHeight = this.maxHeight;
        if (typeof _maxHeight === 'string') {
          _maxHeight = +_maxHeight.replace('px', '');
        }
        style = [
          {
            'max-height':
              (this.showHeader
                ? _maxHeight -
                  this.layout.headerHeight -
                  this.layout.footerHeight
                : _maxHeight - this.layout.footerHeight) + 'px'
          }
        ];
      }

      return style;
    },

    bodyHeight() {
      let style = {};

      if (this.maxHeight) {
        let _maxHeight = this.maxHeight;
        if (typeof _maxHeight === 'string') {
          _maxHeight = +_maxHeight.replace('px', '');
        }
        style = {
          'max-height':
            (this.showHeader
              ? _maxHeight - this.layout.headerHeight - this.layout.footerHeight
              : _maxHeight - this.layout.footerHeight) + 'px'
        };
        // this.setScrollStyle();
      } else if (this.niceScroll && this.niceScroll !== 'horizontal') {
        // 兼容 IE 下纵向无法滚动的问题
        style = {
          'flex-basis': '100%',
          'min-height': '0'
        };
      } else {
        style = {
          height: this.layout.bodyHeight ? this.layout.bodyHeight + 'px' : ''
        };
      }

      return style;
    },

    bodyWidth() {
      const { bodyWidth } = this.layout;
      return bodyWidth ? bodyWidth + 'px' : '';
    },

    fixedWidth() {
      const { fixedWidth } = this.layout;
      return fixedWidth ? fixedWidth + 'px' : '';
    },

    rightFixedWidth() {
      const { rightFixedWidth } = this.layout;
      return rightFixedWidth ? rightFixedWidth + 'px' : '';
    },

    fixedBodyHeight() {
      let style = {};

      if (this.height || this.niceScroll) {
        style = {
          height: this.layout.fixedBodyHeight
            ? this.layout.fixedBodyHeight + 'px'
            : ''
        };
      } else if (this.maxHeight) {
        let _maxHeight = this.maxHeight;
        if (typeof _maxHeight === 'string') {
          _maxHeight = +_maxHeight.replace('px', '');
        }

        if (this.showHeader) {
          _maxHeight -= this.layout.headerHeight;
        }

        _maxHeight -= this.layout.footerHeight;

        style = {
          'max-height': _maxHeight + 'px'
        };
      }
      style.top = this.layout.headerHeight + 'px';

      return style;
    },

    fixedHeight() {
      let style = {};

      if (this.maxHeight) {
        style = {
          bottom: 0
        };
      } else {
        style = {
          height: this.layout.tableHeight ? this.layout.tableHeight + 'px' : ''
        };
      }

      return style;
    },

    fixedShadowHeight() {
      const { tableHeight } = this.layout;
      return tableHeight ? tableHeight + 'px' : '';
    },

    isVirtualScroll() {
      return this.enableVirtualScroll && this.niceScroll !== 'horizontal';
    },

    isShowEmptyText() {
      const empty =
        !this.showLoading &&
        (!this.data ||
          this.data.length === 0 ||
          !this.tableData ||
          this.tableData.length === 0);
      empty && this.fixEmptyScrollViewHeight();
      return empty;
    }
  },

  watch: {
    height: {
      immediate: true,
      handler(value) {
        this.layout.setHeight(value);
        this.setScrollStyle();
      }
    },

    maxHeight: {
      immediate: true,
      handler(value) {
        this.layout.setMaxHeight(value);
        this.setScrollStyle();
      }
    },

    currentRowKey: {
      immediate: true,
      handler(value) {
        if (!this.rowKey) return;
        this.$nextTick(() => {
          this.store.setCurrentRowKey(value);
        });
      }
    },

    data: {
      immediate: true,
      handler(val = []) {
        this.store.commit('setData', val);
        if (this.$ready) {
          this.doLayout();
          this.$refs.tableScrollbar && this.$refs.tableScrollbar.update();
        }
      }
    },

    expandRowKeys: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.store.setExpandRowKeys(newVal);
        }
      }
    },

    isShowEmptyText(v) {
      v && this.fixEmptyScrollViewHeight();
    },

    columns(c, p) {
      /**
       * modify by zhangxiaogang
       * 2018-06-07
       * info: 当列宽自适应时，且列个数由少到多会出现宽度分布不均匀的问题，
       *    此情况下将realWidth重置为初始化状态即可
       */
      if (p.length > 0 && p.length !== c.length) {
        this.columns.forEach(column => {
          column.realWidth = column.width || column.minWidth;
        });
      }
    }
  },

  created() {
    this.tableId = 'el-table_' + tableIdSeed + '_';
    // this.debouncedLayout = debounce(50, () => this.doLayout());
    this.debouncedLayout = debounce(50, debouncedLayout =>
      this.doLayout(debouncedLayout)
    );

    this.niceScroll = this.forceScroll;
    if (this.niceScroll === '') {
      this.niceScroll = true;
    }
  },

  destroyed() {
    if (this.resizeListener) {
      removeResizeListener(this.$el, this.resizeListener);
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.bindEvents();
      this.doLayout(); // 在 nextTick 调用是为了修复 IE 下无法获取 bodyWidth 的问题   add by yangzhini  2020-05-11
    });
    this.store.updateColumns();

    this.resizeState = {
      width: this.$el.offsetWidth,
      height: this.$el.offsetHeight
    };

    // init filters
    this.columns.forEach(column => {
      if (column.filteredValue && column.filteredValue.length) {
        this.store.commit('filterChange', {
          column,
          values: column.filteredValue,
          silent: true
        });
      }
    });

    this.$ready = true;

    this.setScrollStyle();
  },

  methods: {
    setCurrentRow(row) {
      this.store.commit('setCurrentRow', row);
    },

    toggleRowSelection(row, selected, emitChange = true) {
      this.store.toggleRowSelection(row, selected, emitChange);
      this.store.updateAllSelected();
    },

    toggleRowExpanded(row, expanded) {
      this.store.toggleRowExpanded(row, expanded);
    },

    clearSelection() {
      this.store.clearSelection();
    },

    handleMouseLeave() {
      this.store.commit('setHoverRow', null);
      if (this.hoverState) this.hoverState = null;
    },

    // updateScrollY() {
    //   this.layout.updateScrollY();
    // },

    /**
     * scrollbar的横向滚动事件
     * add by zhangxiaogang 2017-09-27
     * @param {Object} s {scrollLeft: wrap.scrollLeft, scrollTop: wrap.scrollTop} 滚动条上下边距距离
     */
    onScrollingX(s) {
      // 触发用户传入的滚动和横向滚动事件 (若有)
      const { headerWrapper, footerWrapper } = this.$refs;
      const { scrollLeft, percentX } = s;
      if (headerWrapper) headerWrapper.scrollLeft = s.scrollLeft;
      if (footerWrapper) footerWrapper.scrollLeft = s.scrollLeft;
      this.$emit('on-scrolling-x', scrollLeft, percentX);
      this.$emit('on-scrolling', s);
    },
    /**
     * scrollbar的纵向滚动事件
     * add by zhangxiaogang 2017-09-27
     * @param {Object} s {scrollLeft: wrap.scrollLeft, scrollTop: wrap.scrollTop} 滚动条上下边距距离
     */
    onScrollingY(s) {
      // 触发用户传入的滚动和纵向滚动事件 (若有)
      const { fixedBodyWrapper, rightFixedBodyWrapper } = this.$refs;
      const { scrollTop, percentY } = s;
      if (this.isVirtualScroll) {
        this.scrollTop = scrollTop;
        process.env.NODE_ENV !== 'production' &&
          this.store.getTableRowsHeight();
      }
      if (fixedBodyWrapper) fixedBodyWrapper.scrollTop = s.scrollTop;
      if (rightFixedBodyWrapper) rightFixedBodyWrapper.scrollTop = s.scrollTop;
      this.$emit('on-scrolling-y', scrollTop, percentY);
      this.$emit('on-scrolling', s);
    },

    bindEvents() {
      const { fixedBodyWrapper, rightFixedBodyWrapper } = this.$refs;
      /**
       * modify by yangzhini
       * 2019-02-13
       * info: 修复固定列区域鼠标上下滚动无效的问题
       */
      const scrollFixedBodyWrapper = event => {
        const data = normalizeWheel(event);
        const wrap = this.$refs.tableScrollbar.$refs.wrap;

        if (Math.abs(data.spinY) > 0) {
          const currentScrollTop = wrap.scrollTop;
          if (data.pixelY < 0 && currentScrollTop !== 0) {
            event.preventDefault();
          }
          if (
            data.pixelY > 0 &&
            wrap.scrollHeight - wrap.clientHeight > currentScrollTop
          ) {
            event.preventDefault();
          }
          wrap.scrollTop += Math.ceil(data.pixelY / 5);
        } else {
          wrap.scrollLeft += Math.ceil(data.pixelX / 5);
        }
      };

      if (fixedBodyWrapper) {
        mousewheel(fixedBodyWrapper, throttle(16, scrollFixedBodyWrapper));
      }
      if (rightFixedBodyWrapper) {
        mousewheel(rightFixedBodyWrapper, throttle(16, scrollFixedBodyWrapper));
      }

      if (this.fit) {
        addResizeListener(this.$el, this.resizeListener);
      }
    },

    resizeListener() {
      if (!this.$ready) return;
      let shouldUpdateLayout = false;
      const el = this.$el;
      const { width: oldWidth, height: oldHeight } = this.resizeState;

      const width = el.offsetWidth;
      if (oldWidth !== width) {
        shouldUpdateLayout = true;
      }

      const height = el.offsetHeight;
      if ((this.height || this.shouldUpdateHeight) && oldHeight !== height) {
        shouldUpdateLayout = true;
      }

      if (shouldUpdateLayout) {
        this.resizeState.width = width;
        this.resizeState.height = height;
        this.doLayout();
      }
    },

    doLayout(dragResize) {
      this.layout.update(dragResize);
      if (this.shouldUpdateHeight) {
        this.layout.updateHeight();
      }

      if (this.isVirtualScroll || this.store.states.isComplex) {
        this.$nextTick(() => {
          // 虚拟滚动：获取可视区域高度并更新行高数据
          this.bodyWrapperHeight = this.$refs.bodyWrapper
            ? this.$refs.bodyWrapper.clientHeight
            : 1080;
          this.store.getTableRowsHeight();
        });
      }
    },
    /**
     * 获取表格当前渲染的数据
     * add by zhangxiaogang 2017-11-28
     * @param {Number} index 行号，从0开始，不传则获取全部数据
     */
    getData(index) {
      const d = this.data;
      if (typeof index === 'undefined' || isNaN(index)) {
        return d;
      } else if (index > d.length - 1) {
        // 大于数组长度则倒序查找
        const l = d.length - 1;
        const i = index % l;
        return d[l - i];
      } else {
        return d[index];
      }
    },
    /**
     * 更新表格指定行的数据，index指定起始行，再根据data长度决定更新哪些行
     * add by zhangxiaogang 2017-11-28
     * @param {Array, Object} data 要更新的数据，可以是数组也可以是对象，数组则表示更新多行，对象则表示只更新一行
     * @param {Number} index 要更新的起始行号，从0开始
     */
    setData(data, index = 0) {
      if (
        !Array.isArray(data) &&
        {}.toString.call(data) !== '[object Object]'
      ) {
        throw new Error(
          'table func setDate first arguments type must be Array or Object'
        );
      }
      if ({}.toString.call(data) === '[object Object]') {
        data = [data];
      }
      const d = this.data;
      const l = d.length - 1;
      if (isNaN(index)) {
        index = 0;
      } else if (index > l) {
        // 大于数组长度则倒序查找
        const i = index % l;
        index = l - i;
      }
      d.splice(index, data.length, ...data);
    },

    /**
     * 处理多场景下的美化滚动条
     */
    setScrollStyle() {
      // 指定了max-height时滚动条容器对应加上max-height
      this.$nextTick(() => {
        const scrollWrap = this.$el.querySelector('.el-table-scrollbar__wrap');
        if (!scrollWrap) return;
        /**
         * 没有指定高度也无最大高度，让表格自适应外部容器高度且内容超出时美化滚动条
         * zhangxiaogang  2017-11-7
         */
        if (!this.height && !this.maxHeight && this.niceScroll) {
          // 仅横向滚动，纵向自适应无滚动
          if (this.niceScroll === 'horizontal') {
            const $tableTixed = this.$el.querySelector('.el-table__fixed');
            const $tableTixedRight = this.$el.querySelector(
              '.el-table__fixed-right'
            );
            if ($tableTixed) {
              $tableTixed.style.overflow = 'hidden';
            }
            if ($tableTixedRight) {
              $tableTixedRight.style.overflow = 'hidden';
            }
            return;
          }
          this.$el.style.height = '100%';
          // 修复在chrome下能滚动却不显示滚动条的问题
          scrollWrap.style.overflow = 'hidden';
          setTimeout(() => {
            scrollWrap.style.overflow = 'visible';
          }, 0);
        }
      });
    },

    fixEmptyScrollViewHeight() {
      this.$nextTick(() => {
        const scrollView = this.$el.querySelector('.el-table-scrollbar__view');
        if (scrollView) {
          scrollView.style.height = '100%';
        }
      });
    }
  }
};
</script>

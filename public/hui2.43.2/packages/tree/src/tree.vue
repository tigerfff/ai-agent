<template>
  <component
    :is="wrapContainer"
    ref="scrollbar"
    wrap-class="el-tree-scrollbar__wrap"
    view-class="el-tree-scrollbar__view"
    @on-scrolling-x="onScrollingX"
    @on-scrolling-y="onScrollingY"
  >
    <div
      :class="{
        'el-tree--highlight-current': highlightCurrent,
        'is-moving': moveConfig.moveFlag,
        'has-border': border
      }"
      class="el-tree"
    >
      <el-tree-node
        v-for="child in root.childNodes"
        :key="getNodeKey(child)"
        :node="child"
        :props="defaultProps"
        :render-after-expand="renderAfterExpand"
        :render-when-expand="renderWhenExpand"
        :render-content="renderContent"
        :prefix-content="prefixContent"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
      />
      <div
        v-if="!root.childNodes || root.childNodes.length === 0 || !root.visible"
        class="el-tree__empty-block"
      >
        <slot v-if="$scopedSlots.empty" name="empty" />
        <span v-else class="el-tree__empty-text">{{ emptyText }}</span>
      </div>
      <div
        v-if="moveConfig.moveFlag"
        :style="moveBlockStyle"
        class="el-tree__move-block"
      >
        <!-- eslint-disable -->
        <div class="el-tree-node__content" v-html="moveConfig.nodeHtml" />
      </div>
      <div
        v-if="moveConfig.moveFlag && moveConfig.arrowFlag"
        class="el-tree__move-arrow"
        :style="{
          top: moveConfig.arrowTop + 'px',
          left: moveConfig.arrowLeft + 'px'
        }"
      />
    </div>
  </component>
</template>

<script>
import TreeStore from './model/tree-store';
import { t } from 'hui/src/locale';
import emitter from 'hui/src/mixins/emitter';
import { formatData } from './model/util';
import ElScrollbar from 'hui/packages/scrollbar';
import ElTreeNode from './tree-node.vue';

export default {
  name: 'ElTree',

  components: {
    ElScrollbar,
    ElTreeNode
  },

  mixins: [emitter],

  props: {
    data: {
      type: Array,
      default: null
    },
    emptyText: {
      type: String,
      default() {
        return t('el.tree.emptyText');
      }
    },
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    renderWhenExpand: {
      type: Boolean,
      default: false
    },
    nodeKey: {
      type: String,
      default: ''
    },
    parentKey: {
      type: String,
      default: ''
    },
    checkStrictly: {
      type: Boolean,
      default: null
    },
    checkParentToChild: {
      type: Boolean,
      default: true
    },
    checkChildToParent: {
      type: Boolean,
      default: true
    },
    defaultExpandAll: {
      type: Boolean,
      default: null
    },
    expandOnClickNode: {
      type: Boolean,
      default: false
    },
    checkOnClickNode: {
      type: Boolean,
      default: false
    },
    expandOnDbclickNode: {
      type: Boolean,
      default: true
    },
    checkDescendants: {
      type: Boolean,
      default: false
    },
    autoExpandParent: {
      type: Boolean,
      default: true
    },
    defaultCheckedKeys: {
      type: Array,
      default: null
    },
    defaultExpandedKeys: {
      type: Array,
      default: null
    },
    prefixContent: {
      type: Function,
      default: null
    },
    renderContent: {
      type: Function,
      default: null
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    props: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'label',
          icon: 'icon',
          svgIcon: 'svgIcon',
          svgIconOffline: 'svgIconOffline',
          disabled: 'disabled',
          selectable: 'selectable',
          isLeaf: 'isLeaf'
        };
      }
    },
    lazy: {
      type: Boolean,
      default: false
    },
    highlightCurrent: {
      type: Boolean,
      default: true
    },
    currentNodeKey: {
      type: [String, Number],
      default: ''
    },
    load: {
      type: Function,
      default: null
    },
    filterNodeMethod: {
      type: Function,
      default: null
    },
    accordion: {
      type: Boolean,
      default: null
    },
    indent: {
      type: Number,
      default: 16
    },
    // 是否使用简单数据结构
    simpleData: {
      type: Boolean,
      default: false
    },
    // 是否可移动
    move: {
      type: Boolean,
      default: null
    },
    moveStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    // 节点可拖拽的区域： all(全部) outter(只能拖拽到树区域以外)
    moveArea: {
      type: String,
      default: 'all'
    },
    // 用于捕获节点被拖拽之前的事件回调函数，若返回 false， 则无法拖拽节点
    beforeDrag: {
      type: Function,
      default: null
    },
    // 用于捕获节点拖拽操作结束之前的事件回调函数，若返回 false 则无法终止拖拽
    beforeDrop: {
      type: Function,
      default: null
    },
    // 用于自定义处理mouseup之后的逻辑，true 自定义处理
    customDrag: {
      type: Boolean,
      default: false
    },
    // 用于捕获单击节点之前的事件回调函数，若返回 false， 则无法进行单击操作
    beforeClick: {
      type: Function,
      default: null
    },
    // 是否显示图标
    showIcon: {
      type: Boolean,
      default: false
    },
    // 默认图标
    defaultIcon: {
      type: String,
      default: ''
    },
    border: {
      type: Boolean,
      default: false
    },
    scrollSize: {
      type: Number,
      default: 6
    },
    customSrcollbar: {
      type: Boolean,
      default: false
    },
    nodeHeight: {
      type: Number,
      default: null
    },
    nodeClassRender: {
      type: Function,
      default: () => ''
    }
  },

  data() {
    return {
      store: null,
      root: null,
      currentNode: null,
      scrollTop: 0,
      moveConfig: {
        mouseDownFlag: false, // 鼠标点击节点标志
        moveFlag: false, // 节点正在移动标志
        moveNode: null, // 被移动的节点
        moveNodeExpanded: false, // 节点被移动前是否已经展开
        $el: null, // 被移动节点的 DOM
        targetNode: null, // 目标节点
        targetEl: null, // 目标节点的 DOm
        movePosition: 'inner', // 节点被移动到目标节点的位置: inner(目标节点内) prev(目标节点之前) next(目标节点之后)
        nodeHtml: '', // 模拟节点：被移动节点的 html
        top: 0, // 模拟节点的 top 值
        left: 0, // 模拟节点的 left 值
        clientX: 0, // 记录开始移动时鼠标的 X 轴定位
        clientY: 0, // 记录开始移动时鼠标的 Y 轴定位
        arrowFlag: false, // 是否显示箭头
        arrowTop: 0, // 箭头 top 值
        arrowLeft: 0 // 箭头 left 值
      },
      defaultProps: {
        children: 'children',
        label: 'label',
        icon: 'icon',
        svgIcon: 'svgIcon',
        svgIconOffline: 'svgIconOffline',
        svgIconColor: 'svgIconColor',
        svgIconColorActive: 'svgIconColorActive',
        svgIconRequire: 'svgIconRequire',
        disabled: 'disabled',
        selectable: 'selectable',
        isLeaf: 'isLeaf'
      }
    };
  },

  computed: {
    children: {
      set(value) {
        this.data = value;
      },
      get() {
        return this.data;
      }
    },
    moveBlockStyle() {
      const offset = {
        top: this.moveConfig.top + 'px',
        left: this.moveConfig.left + 'px'
      };
      return Object.assign({}, this.moveStyle, offset);
    },
    wrapContainer() {
      return this.customSrcollbar ? 'div' : 'el-scrollbar';
    }
  },

  watch: {
    lazy(newVal) {
      this.store.lazy = newVal;
    },
    defaultExpandAll(newVal) {
      this.store.defaultExpandAll = newVal;
    },
    defaultCheckedKeys(newVal) {
      this.store.defaultCheckedKeys = newVal;
      this.store.setDefaultCheckedKey(newVal);
    },
    defaultExpandedKeys(newVal) {
      this.store.defaultExpandedKeys = newVal;
      this.store.setDefaultExpandedKeys(newVal);
    },
    currentNodeKey(newVal) {
      this.store.setCurrentNodeKey(newVal);
      this.store.currentNodeKey = newVal;
    },
    data(newVal) {
      // 启用简单数据，则在改变data后处理数据
      // 判断是否有nodeKey和parentKey
      if (this.simpleData && this.nodeKey && this.parentKey) {
        newVal = formatData(newVal, this.nodeKey, this.parentKey);
      }
      this.store.setData(newVal);
    }
  },

  created() {
    this.isTree = true;

    let _data = this.data;

    this.defaultProps = {
      ...this.defaultProps,
      ...this.props
    };

    // 若启用简单数据
    // 判断是否有nodeKey 和 parentKey
    if (this.simpleData && this.nodeKey && this.parentKey) {
      _data = formatData(this.data, this.nodeKey, this.parentKey);
      // 简单数据结构直接设置 children，这样无需在外部 props 中传入
      this.defaultProps.children = 'children';
    }

    this.store = new TreeStore({
      key: this.nodeKey,
      parentKey: this.parentKey,
      data: _data,
      lazy: this.lazy,
      props: this.defaultProps,
      simpleData: this.simpleData,
      load: this.load,
      checkParentToChild: this.checkParentToChild,
      checkChildToParent: this.checkChildToParent,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod
    });

    this.root = this.store.root;
  },

  mounted() {
    this.$refs.scrollbar &&
      !this.customSrcollbar &&
      this.$refs.scrollbar.update();
  },

  methods: {
    filter(value, keepAlive) {
      if (!this.filterNodeMethod) {
        throw new Error('[Tree] filterNodeMethod is required when filter');
      }
      this.store.filter(value, keepAlive);
    },
    getNodeKey(node, index) {
      const nodeKey = this.nodeKey;
      if (nodeKey && node) {
        return node.data[nodeKey];
      }
      return index;
    },
    getCheckedNodes(leafOnly, checkedOnly) {
      return this.store.getCheckedNodes(leafOnly, checkedOnly);
    },
    getCheckedKeys(leafOnly, checkedOnly) {
      return this.store.getCheckedKeys(leafOnly, checkedOnly);
    },
    setCheckedNodes(nodes, leafOnly, rootOnly) {
      if (!this.nodeKey) {
        throw new Error('[Tree] nodeKey is required in setCheckedNodes');
      }
      this.store.setCheckedNodes(nodes, leafOnly, rootOnly);
    },
    setCheckedKeys(keys, leafOnly, rootOnly) {
      if (!this.nodeKey) {
        throw new Error('[Tree] nodeKey is required in setCheckedNodes');
      }
      this.store.setCheckedKeys(keys, leafOnly, rootOnly);
    },
    setChecked(data, checked, deep) {
      this.store.setChecked(data, checked, deep);
    },
    handleNodeExpand(nodeData, node, instance) {
      this.broadcast('ElTreeNode', 'tree-node-expand', node);
      this.$emit('node-expand', nodeData, node, instance);
      setTimeout(() => {
        this.$refs.scrollbar &&
          !this.customSrcollbar &&
          this.$refs.scrollbar.update();
      }, 300);
    },
    handleNodeCollapse() {
      setTimeout(() => {
        this.$refs.scrollbar &&
          !this.customSrcollbar &&
          this.$refs.scrollbar.update();
      }, 300);
    },
    /**
     * 手动触发，重新渲染滚动条
     */
    resizeScrollbar() {
      this.$refs.scrollbar &&
        !this.customSrcollbar &&
        this.$refs.scrollbar.update();
    },
    /**
     * 选中目标节点
     * @param {Object/String} data 选中节点的 key 或者 data
     * @param {Boolean} selected 节点是否选中
     */
    setSelected(data, selected = true) {
      const store = this.store;
      const node = store.getNode(data);
      if (selected) {
        store.setCurrentNode(node);
        this.currentNode = node;
      } else {
        store.setCurrentNode(null);
        this.currentNode = null;
      }
      this.$emit('current-change', node.data, node);
    },
    getSelectedNode() {
      return this.store.currentNode;
    },
    getSelectedKey() {
      return this.store.currentNode
        ? this.getNodeKey(this.store.currentNode)
        : '';
    },
    getHalfCheckedNodes() {
      return this.store.getHalfCheckedNodes();
    },
    getHalfCheckedKeys() {
      return this.store.getHalfCheckedKeys();
    },
    setCurrentNode(data) {
      if (!this.nodeKey) {
        throw new Error('[Tree] nodeKey is required in setCurrentNode');
      }
      this.store.setUserCurrentNode(data);
    },
    setCurrentKey(key) {
      if (!this.nodeKey) {
        throw new Error('[Tree] nodeKey is required in setCurrentKey');
      }
      this.store.setCurrentNodeKey(key);
    },
    getNode(data) {
      return this.store.getNode(data);
    },
    remove(data) {
      this.store.remove(data);
    },
    append(data, parentNode) {
      this.store.append(data, parentNode);
    },
    insertBefore(data, refNode) {
      this.store.insertBefore(data, refNode);
    },
    insertAfter(data, refNode) {
      this.store.insertAfter(data, refNode);
    },
    expandNode(data) {
      const store = this.store;
      const node = store.getNode(data);
      node && node.expand();
    },
    collapseNode(data) {
      const store = this.store;
      const node = store.getNode(data);
      node && node.collapse();
    },
    onScrollingX(s) {
      const { scrollLeft, percentX } = s;
      this.$emit('on-scrolling-x', { scrollLeft, percentX });
      this.$emit('on-scrolling', s);
    },
    onScrollingY(s) {
      const { scrollTop, percentY } = s;
      this.scrollTop = scrollTop;
      this.$emit('on-scrolling-y', { scrollTop, percentY });
      this.$emit('on-scrolling', s);
    },
    reload(data, done) {
      this.store.reload(data, done);
    }
  }
};
</script>

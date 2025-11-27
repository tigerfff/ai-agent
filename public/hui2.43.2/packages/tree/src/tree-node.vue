<template>
  <div
    v-show="node.visible"
    :data-key="getNodeKey(node)"
    :class="classObject"
    class="el-tree-node"
    @mousedown="mouseDown"
  >
    <div
      :style="nodeStyle"
      class="el-tree-node__content"
      @click.stop="handleClick"
      @dblclick.stop="handleDbClick"
      @contextmenu="$event => handleContextMenu($event)"
      @mouseenter="
        $event => tree.$emit('node-mouseenter', node.data, node, $event)
      "
      @mouseleave="
        $event => tree.$emit('node-mouseleave', node.data, node, $event)
      "
    >
      <prefix-content
        :node="node"
        :expanded="expanded"
        :handle-expand-icon-click="handleExpandIconClick"
      ></prefix-content>
      <el-checkbox
        v-if="showCheckbox"
        v-model="node.checked"
        :indeterminate="node.indeterminate"
        :disabled="!!node.disabled"
        @click.native.stop
        @change="handleCheckChange"
      />
      <h-svg-icon
        v-if="node.svgIcon && node.svgIconRequire"
        :svgs="node.svgIcon"
        class="el-tree-node__icon"
      ></h-svg-icon>
      <h-svg-icon
        v-else-if="node.svgIcon && typeof node.svgIcon === 'string'"
        :offline="node.svgIconOffline"
        class="el-tree-node__icon"
      >
        <component :is="node.svgIcon" :color="svgIconColor" />
      </h-svg-icon>
      <h-svg-icon
        v-else-if="node.svgIcon && typeof node.svgIcon === 'object'"
        :offline="node.svgIconOffline"
        class="el-tree-node__icon"
      >
        <component
          :is="icon"
          v-for="(icon, index) in node.svgIcon"
          :key="index"
          :color="svgIconColor[index]"
        />
      </h-svg-icon>
      <span
        v-if="!node.svgIcon && (node.icon || defaultIcon)"
        :class="'el-tree-node__icon ' + (node.icon || defaultIcon)"
      />
      <span
        v-if="node.loading"
        class="el-tree-node__loading-icon h-icon-restart"
      />
      <node-content :node="node" />
    </div>
    <!-- IE下，存在checkbox的情况下，由于动画效果的存在，会使得多选框无法渲染，暂时移除动画效果 -->
    <!--<el-collapse-transition>-->
    <div
      v-if="!renderAfterExpand || childNodeRendered"
      v-show="expanded"
      class="el-tree-node__children"
    >
      <el-tree-node
        v-for="child in node.childNodes"
        :key="getNodeKey(child)"
        :render-content="renderContent"
        :prefix-content="prefixContent"
        :render-after-expand="renderAfterExpand"
        :render-when-expand="renderWhenExpand"
        :node="child"
        @node-expand="handleChildNodeExpand"
      />
    </div>
    <!--</el-collapse-transition>-->
  </div>
</template>

<script type="text/jsx">
// import ElCollapseTransition from 'hui/src/transitions/collapse-transition';
import ElCheckbox from 'hui/packages/checkbox';
import emitter from 'hui/src/mixins/emitter';
import { hasClass } from 'hui/src/utils/dom';
import { getOffset } from './model/util';

export default {
  name: 'ElTreeNode',

  componentName: 'ElTreeNode',

  components: {
    // ElCollapseTransition,
    ElCheckbox,

    PrefixContent: {
      props: {
        node: {
          required: true
        },
        expanded: {
          required: true
        },
        handleExpandIconClick: {
          required: true
        }
      },
      render(h) {
        const parent = this.$parent;
        const { node, expanded, handleExpandIconClick } = this;
        return parent.prefixContent ? (
          parent.prefixContent.call(parent._renderProxy, h, {
            node,
            expanded,
            handleExpandIconClick
          })
        ) : (<span
          class={{
            'is-leaf': (node.isLeaf || node.data.isLeaf) && node.childNodes.length === 0,
            'expanded': !node.isLeaf && expanded,
            'el-tree-node__expand-icon h-icon-angle_right': true
          }}
          on-click={handleExpandIconClick}
        ></span >)
      }
    },
    NodeContent: {
      props: {
        node: {
          required: true
        }
      },
      render(h) {
        const parent = this.$parent;
        const tree = parent.tree;
        const node = this.node;
        const { data, store } = node;
        return parent.renderContent ? (
          parent.renderContent.call(parent._renderProxy, h, {
            _self: tree.$vnode.context,
            node,
            data,
            store
          })
        ) : tree.$scopedSlots.default ? (
          tree.$scopedSlots.default({ node, data, store })
        ) : (
          <span class='el-tree-node__label' title={node.label}>
            {node.label}
          </span>
        );
      }
    }
  },

  mixins: [emitter],

  props: {
    node: {
      type: Object,
      default() {
        return {};
      }
    },
    props: {
      type: Object,
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
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    renderWhenExpand: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      tree: null,
      expanded: false,
      childNodeRendered: false,
      oldChecked: null,
      oldIndeterminate: null
      // nodeWidth: 0 // 节点宽度
    };
  },

  computed: {
    // tree-node class
    classObject: function () {
      const classObject = {
        'is-expanded': this.expanded,
        'is-current': this.isCurrent,
        'is-hidden': !this.node.visible,
        'is-disabled': !!this.node.disabled,
        'is-drag': this.tree.moveConfig.moveFlag,
        'is-nonselectable': !this.node.selectable,
        'is-drag-inner':
          this.tree.moveConfig.targetNode === this.node &&
          this.tree.moveConfig.movePosition === 'inner' &&
          this.tree.moveConfig.targetNode !== this.tree.moveConfig.moveNode
      }
      // 节点自定义样式
      if(this.tree.nodeClassRender){
        const nodeClass = this.tree.nodeClassRender(this.node.data)
        if(nodeClass){
          classObject[nodeClass] = true;
        }
      }
      return classObject
    },
    svgIconColor() {
      const { node } = this;
      if (node.svgIconColorActive && this.isCurrent) {
        return node.svgIconColorActive;
      } else if (node.svgIconColor && !this.isCurrent) {
        return node.svgIconColor;
      } else {
        return '';
      }
    },
    isCurrent() {
      return (
        this.tree.store.currentNode &&
        this.tree.store.currentNode.id === this.node.id
      );
    },
    nodeStyle() {
      const nodeHeight = this.tree.nodeHeight
      const style = { 'padding-left': (this.node.level - 1) * this.tree.indent + 'px' }
      return nodeHeight
        ? Object.assign(style, { height: nodeHeight + 'px', 'line-height': nodeHeight - 4 + 'px' })
        : style
    },
    showCheckbox() {
      return this.tree.showCheckbox
    }
  },

  watch: {
    'node.indeterminate'(val) {
      this.handleSelectChange(this.node.checked, val);
    },

    'node.checked'(val) {
      this.handleSelectChange(val, this.node.indeterminate);
    },

    'node.expanded'(val) {
      this.$nextTick(() => (this.expanded = val));
      if (val) {
        this.childNodeRendered = true;
      } else if (!val && this.renderWhenExpand) {
        this.childNodeRendered = false;
      }
    }
    // 监听树的最长节点宽度，改变时对应修改自身宽度
    // 'tree.maxNodeWidth'(val) {
    //   this.nodeWidth = val;
    // }
  },

  created() {
    let parent = this.$parent;

    if (parent.wrapClass) {
      parent = parent.$parent;
    }

    if (parent.isTree) {
      this.tree = parent;
    } else {
      this.tree = parent.tree;
    }

    const tree = this.tree;
    if (!tree) {
      // eslint-disable-next-line
      console.warn("Can not find node's tree.");
    }

    const props = tree.props || {};
    const childrenKey = props.children || 'children';

    this.$watch(`node.data.${childrenKey}`, () => {
      this.node.updateChildren();
    });

    // 是否显示图标
    this.showIcon = tree.showIcon;
    // 默认图标
    this.defaultIcon = tree.defaultIcon;

    if (this.node.expanded) {
      this.expanded = true;
      this.childNodeRendered = true;
    }

    if (this.tree.accordion) {
      this.$on('tree-node-expand', node => {
        if (this.node !== node) {
          this.node.collapse();
        }
      });
    }
  },

  mounted() {
    // const contentWidth = this.$el.querySelector('.el-tree-node__content').scrollWidth;
    let parent = this.$parent;

    if (parent.wrapClass) {
      parent = parent.$parent;
    }
  },

  methods: {
    getNodeKey(node, index) {
      const nodeKey = this.tree.nodeKey;
      if (nodeKey && node) {
        return node.data[nodeKey];
      }
      return index;
    },

    handleSelectChange(checked, indeterminate) {
      this.tree.$emit('check-change', this.node.data, checked, indeterminate);
      this.oldChecked = checked;
      this.indeterminate = indeterminate;
    },

    handleClick($event) {
      // selectable 未赋值则可以点击，否则按照 selectable 的值来判断
      const selectable = this.node.selectable;
      const isContinue =
        selectable === undefined || selectable === '' ? true : selectable;

      const todo = () => {
        const store = this.tree.store;
        store.setCurrentNode(this.node);
        this.tree.$emit(
          'current-change',
          store.currentNode ? store.currentNode.data : null,
          store.currentNode
        );
        this.tree.currentNode = this;
        if (this.tree.expandOnClickNode) {
          this.handleExpandIconClick();
        }
        if (this.tree.checkOnClickNode && !this.node.disabled) {
          this.handleCheckChange(!this.node.checked);
        }
        this.tree.$emit('node-click', this.node.data, this.node, this, $event);
      };

      // beforeClick 能够覆盖 selectable
      if (this.tree.beforeClick) {
        // 支持beforeClick返回Boolean或Promise
        let result = this.tree.beforeClick(this.node.data, this.node);
        if (result === false) return; // 返回false则无法点击
        if (result === undefined) result = true; // 未返回值可以点击
        Promise.resolve(result).then(allowed => {
          if (allowed) {
            todo();
          }
        });
      } else if (isContinue) {
        todo();
      }
    },

    handleDbClick($event) {
      if (this.tree.expandOnDbclickNode) {
        this.handleExpandIconClick();
      }
      this.tree.$emit('node-dbclick', this.node.data, this.node, this, $event);
    },

    handleExpandIconClick(e) {
      if(e) e.stopPropagation();
      if ((this.node.isLeaf || this.node.data.isLeaf) && this.node.childNodes.length === 0) {
        return;
      }
      if (this.expanded) {
        this.tree.$emit('node-collapse', this.node.data, this.node, this);
        this.node.collapse();
        this.$emit('node-collapse', this.node.data, this.node, this);
      } else {
        this.node.expand();
        this.$emit('node-expand', this.node.data, this.node, this);
      }
    },

    /**
     * 当某一节点被鼠标右键点击时会触发该事件
     */
    handleContextMenu(event) {
      if (
        this.tree._events['node-contextmenu'] &&
        this.tree._events['node-contextmenu'].length > 0
      ) {
        event.stopPropagation();
        event.preventDefault();
      }
      this.tree.$emit(
        'node-contextmenu',
        event,
        this.node.data,
        this.node,
        this
      );
    },

    handleCheckChange(ev) {
      this.node.setChecked(ev, !this.tree.checkStrictly);
      this.$nextTick(() => {
        const store = this.tree.store;
        this.tree.$emit('check', this.node.data, {
          checkedNodes: store.getCheckedNodes(),
          checkedKeys: store.getCheckedKeys(),
          halfCheckedNodes: store.getHalfCheckedNodes(),
          halfCheckedKeys: store.getHalfCheckedKeys()
        }, this.node.checked);
      });
    },

    handleChildNodeExpand(nodeData, node, instance) {
      this.broadcast('ElTreeNode', 'tree-node-expand', node);
      this.tree.$emit('node-expand', nodeData, node, instance);
    },

    /**
     * 鼠标点击到节点上的事件
     * @author chenguanbin
     * @param {Event} [event] 事件触发时的事件对象
     */
    mouseDown(event) {
      if (this.tree.move) {
        // 节点拖拽时阻止事件冒泡
        event.stopPropagation();
        // beforeDrag 返回false，则无法拖拽
        if (
          this.tree.beforeDrag &&
          this.tree.beforeDrag(this.node.data, this.node) === false
        ) {
          return;
        }

        const _this = this;
        const leftDist = 20; // 移动节点距离鼠标有20px的位移
        const moveConfig = this.tree.moveConfig;

        moveConfig.mouseDownFlag = true;
        moveConfig.moveNode = this.node;
        moveConfig.$el = this.$el;
        moveConfig.nodeHtml = this.$el.children[0].innerHTML;
        moveConfig.clientX = event.clientX;
        moveConfig.clientY = event.clientY;
        moveConfig.top = moveConfig.clientY + this.tree.$el.scrollTop;
        moveConfig.left =
          moveConfig.clientX + this.tree.$el.scrollLeft + leftDist;

        // 在body上绑定onmousemove事件
        document.body.onmousemove = event => {
          _this.bodyMouseMove(event);
        };

        // 在body上绑定mouseup事件
        document.body.onmouseup = function (event) {
          _this.bodyMouseUp(event);
        };

        // 防止IE文字选中
        this.$el.onselectstart = function () {
          return false;
        };
      }
    },

    /**
     * 鼠标在节点上移动的事件
     * @author chenguanbin
     * @param {Event} [event] 事件触发时的事件对象
     */
    bodyMouseMove(event) {
      if (this.tree.move) {
        const moveConfig = this.tree.moveConfig;
        const x = event.clientX - moveConfig.clientX;
        const y = event.clientY - moveConfig.clientY;
        const reponseDistance = 2; // 拖拽响应距离设置为2px，一定程度上防止误操作

        // 鼠标点击后开始拖拽
        if (
          moveConfig.mouseDownFlag &&
          (Math.abs(x) > reponseDistance || Math.abs(y) > reponseDistance)
        ) {
          // 若正在移动标志为false
          if (!moveConfig.moveFlag) {
            moveConfig.moveFlag = true;
            // 若节点展开，收起自身节点
            if (
              moveConfig.moveNode.expanded &&
              this.tree.moveArea !== 'outter'
            ) {
              moveConfig.moveNodeExpanded = true;
              moveConfig.moveNode.collapse();
            }
            // 触发开始拖拽事件：'node-drag'
            this.tree.$emit(
              'node-drag',
              event,
              this.node.data,
              this.node,
              this
            );
          }

          // 被选中的节点跟着鼠标移动
          moveConfig.top += y;
          moveConfig.left += x;
          moveConfig.clientX = event.clientX;
          moveConfig.clientY = event.clientY;

          // 触发节点拖拽过程中的事件：'node-drag-move'
          this.tree.$emit(
            'node-drag-move',
            event,
            this.node.data,
            this.node,
            this
          );

          // 若只能移动到树范围之外，则移动到树节点上无响应
          if (this.tree.moveArea === 'outter') return;

          // 判断是否还在树范围内
          if (this._isWinthinTree(event.target)) {
            // 获取 el-tree-node 节点
            const nodeEl = this._getNodeElement(event.target);
            if (!nodeEl.getAttribute) return;
            const key = nodeEl.getAttribute('data-key');
            const node = this.tree.store.getNode(key);

            const targetNode = moveConfig.targetNode;
            const moveNode = moveConfig.moveNode;
            if (targetNode !== node) {
              if (targetNode && moveConfig.movePosition !== 'out') {
                this.tree.$emit(
                  'node-drag-leave',
                  event,
                  moveNode,
                  targetNode,
                  this
                );
              }
              if (node.id !== moveNode.id) {
                this.tree.$emit('node-drag-enter', event, moveNode, node, this);
              }
            }

            // 设置目标节点
            moveConfig.targetNode = node;
            moveConfig.targetEl = nodeEl;

            // 移动到自身上隐藏箭头
            if (nodeEl === moveConfig.$el) {
              moveConfig.arrowFlag = false;
              return;
            }

            // 移动箭头位置
            this._moveArrow(nodeEl, moveConfig, event);
          } else {
            if (moveConfig.movePosition !== 'out') {
              this.tree.$emit(
                'node-drag-leave',
                event,
                moveConfig.moveNode,
                null,
                this
              );
            }
            // 移出树范围后，移除箭头
            moveConfig.arrowFlag = false;
            moveConfig.movePosition = 'out';
          }
        }
      }
    },

    /**
     * @desc 移动箭头位置
     * @author chenguanbin
     * @param {Document} nodeEl el-tree-node 节点
     * @param {Object} moveConfig 节点移动时的各参数
     */
    _moveArrow(nodeEl, moveConfig) {
      const contentNode = nodeEl.querySelector('.el-tree-node__content');
      const treeOffset = this.tree.$el.getBoundingClientRect();
      const offset = getOffset(contentNode, this.tree.$el);
      let top = moveConfig.top - treeOffset.top + this.tree.scrollTop; // 计算出目前鼠标位于树控件顶部的距离，有滚动条时需要加上滚动条距离
      const nodeHeight = this.tree.nodeHeight || 32; // 节点高度为32px
      const dis = this.tree.nodeHeight ? this.tree.nodeHeight / 4 : 8; // 拖拽响应距离： 0-8px（兄弟前节点）  9-24px（子节点）  25-31px（兄弟后节点）
      let count = 0; // 计算拖动了多少个节点的距离
      while (top >= nodeHeight) {
        top -= nodeHeight;
        count++;
      }
      const targetNode = moveConfig.targetNode;
      // 添加到目标节点之前
      if (top >= 0 && top < dis) {
        moveConfig.arrowTop = count * nodeHeight;
        moveConfig.movePosition = 'prev';
        moveConfig.arrowFlag = true;
      } else if (top > nodeHeight - dis && top < nodeHeight) {
        // 添加到目标节点之后
        moveConfig.arrowTop = (count + 1) * nodeHeight - 1; // 减1px，为了区分添加到节点前后的情况
        moveConfig.movePosition = 'next';
        moveConfig.arrowFlag = true;
      } else {
        // 添加到子节点
        moveConfig.movePosition = 'inner';
        moveConfig.arrowFlag = false;
        // targetNode.childNodes.length && targetNode.expand();
      }

      // 目标节点为叶子节点时，指示线的起点要去掉展开图标的尺寸32px；
      const iconOffset = this.tree.nodeHeight || 32;
      const borderOffset = 2; // 采用默认border为2px透明的方式，所以要去掉边框的偏移
      const paddingLeft = parseInt(contentNode.style.paddingLeft);
      moveConfig.arrowLeft =
        offset.left +
        (targetNode.isLeaf === true
          ? paddingLeft + iconOffset + borderOffset
          : paddingLeft + borderOffset);
    },

    /**
     * 在body上绑定的mouseup事件
     * @author chenguanbin
     * @param {Event} [event] 事件触发时的事件对象
     */
    bodyMouseUp(event) {
      const tree = this.tree;
      const moveConfig = tree.moveConfig;
      // 停止拖拽
      moveConfig.mouseDownFlag = false;
      // 若节点正在移动
      if (moveConfig.moveFlag) {
        // 节点停止移动
        moveConfig.moveFlag = false;
        // 判断是否还在树范围之内
        if (this._isWinthinTree(event.target)) {
          // 若只能移动到树范围之外
          if (tree.moveArea === 'outter') return;
          // 获取目标节点
          const targetNode = moveConfig.targetNode;
          // 若目标节点不是正在移动的节点，则移动节点
          // 移动节点
          tree.moveNodes = () => {
            if (this.node.data !== targetNode.data) {

              const todo = () => {
                // 触发'node-drop'事件
                tree.$emit(
                  'node-drop',
                  event,
                  this.node.data,
                  this.node,
                  targetNode,
                  moveConfig.movePosition,
                  this
                );
                // 移动节点
                const newNode = tree.store.move(
                  this.node.data,
                  targetNode.data,
                  moveConfig.movePosition
                );
                const store = this.tree.store;
                store.setCurrentNode(newNode);
                this.tree.$emit(
                  'current-change',
                  store.currentNode ? store.currentNode.data : null,
                  store.currentNode
                );
                this.tree.currentNode = newNode;
              }

              // beforeDrop 返回false，则无法完成拖拽
              if (tree.beforeDrop) {
                let result = this.tree.beforeDrop(
                  this.node.data,
                  this.node,
                  targetNode,
                  moveConfig.movePosition
                )
                if (result === false) return
                if (result === undefined) result = true
                Promise.resolve(result).then(allowed => {
                  if (allowed) {
                    todo();
                  }
                })
              } else {
                todo();
              }
            }
            // 若节点拖拽前为展开状态
            if (moveConfig.moveNodeExpanded) {
              this.$nextTick(() => {
                const node = tree.getNode(moveConfig.moveNode.key);
                node.expand();
                moveConfig.moveNodeExpanded = false;
                // 若目标节点不是正在移动的节点，则展开子节点
                if (this.node.data !== targetNode.data) {
                  this.expandChildNodes(moveConfig.moveNode.childNodes);
                }
              });
            }
            tree.$emit(
              'node-drag-end',
              event,
              this.node.data,
              this.node,
              targetNode,
              moveConfig.movePosition,
              this
            );
          }
          // 添加一个属性控制是否mouseup处理逻辑
          if (!tree.customDrag) {
            tree.moveNodes();
          }
          // 拖拽完成后处理逻辑钩子
          tree.$emit('node-drag-over',
            event,
            this.node.data,
            this.node,
            targetNode,
            moveConfig.movePosition,
            this
          );
        } else {
          // beforeDrop 返回false，则无法完成拖拽
          if (
            tree.beforeDrop &&
            tree.beforeDrop(this.node.data, this.node, null, 'out') === false
          ) {
            return;
          }
          // 触发'node-drop'事件
          tree.$emit(
            'node-drop',
            event,
            this.node.data,
            this.node,
            null,
            'out',
            this
          );
          tree.$emit(
            'node-drag-end',
            event,
            this.node.data,
            this.node,
            null,
            'out',
            this
          );
        }
      }
    },

    /**
     * @desc 根据子节点在拖拽前的状态，展开子节点
     * @author chenguanbin
     * @param {Array} nodes 子节点
     */
    expandChildNodes(childNodes) {
      for (const child of childNodes) {
        const node = this.tree.getNode(child.key);
        // 子节点在拖拽前未展开状态，则展开节点
        child.expanded && node.expand();
        const childNodes = child.childNodes;
        if (childNodes && childNodes.length) this.expandChildNodes(childNodes);
      }
    },

    /**
     * 判断是否还在树范围内
     */
    _isWinthinTree(node) {
      let isWinthin = false;
      while (node.tagName.toLocaleLowerCase() !== 'body') {
        if (hasClass(node, 'el-tree')) {
          isWinthin = true;
          break;
        }
        node = node.parentNode;
      }
      return isWinthin;
    },

    /**
     * 获取节点元素
     */
    _getNodeElement(node) {
      while (node && node.getAttribute && !node.getAttribute('data-key')) {
        node = node.parentNode;
      }
      return node;
    }
  }
};
</script>

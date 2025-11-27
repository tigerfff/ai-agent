import Node from './node';
import { getNodeKey, isArray, formatData } from './util';
import { hasOwn } from 'hui/src/utils/util';

export default class TreeStore {
  constructor(options) {
    this.currentNode = null;
    this.currentNodeKey = null;

    for (const option in options) {
      if (hasOwn(options, option)) {
        this[option] = options[option];
      }
    }

    this.nodesMap = {};

    this.root = new Node({
      data: this.data,
      store: this
    });

    if (this.lazy && this.load) {
      const loadFn = this.load;
      loadFn(this.root, data => {
        // this.root.doCreateChildren(data);
        if (this.simpleData) data = formatData(data, this.key, this.parentKey);
        this._initLazyNode(this.root, data);
        this._initDefaultCheckedNodes();
      });
    } else {
      this._initDefaultCheckedNodes();
    }
  }

  _initLazyNode(node, data) {
    node.doCreateChildren(data);
    for (const item of data) {
      if (item[this.props.children] && item[this.props.children].length) {
        const _node = this.getNode(item);
        _node.loaded = true;
        this._initLazyNode(_node, item[this.props.children]);
      }
    }
  }

  filter(value, keepAlive) {
    const filterNodeMethod = this.filterNodeMethod;
    const traverse = function(node) {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      childNodes.forEach(child => {
        child.visible = filterNodeMethod.call(child, value, child.data, child);

        traverse(child);
      });

      if (!node.visible && childNodes.length) {
        let allHidden = true;

        childNodes.forEach(child => {
          if (child.visible) allHidden = false;
        });

        if (node.root) {
          node.root.visible = allHidden === false;
        } else {
          node.visible = allHidden === false;
        }
      }

      if (!node.isLeaf) {
        if (node.filtering === false && !keepAlive) {
          node.cacheExpanded = node.expanded;
          node.filtering = true;
        }
        node.root ? node.root.expand() : node.expand();
        if (keepAlive) {
          node.filtering = false;
          !node.cacheExpanded && node.collapse && node.collapse();
        }
      }
    };

    traverse(this);
  }

  setData(newVal) {
    const instanceChanged = newVal !== this.root.data;
    this.root.setData(newVal);
    if (instanceChanged) {
      this._initDefaultCheckedNodes();
    }
  }

  getNode(data) {
    const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
    return this.nodesMap[key];
  }

  insertBefore(data, refData) {
    const refNode = this.getNode(refData);
    refNode.parent.insertBefore({ data }, refNode);
  }

  insertAfter(data, refData) {
    const refNode = this.getNode(refData);
    refNode.parent.insertAfter({ data }, refNode);
  }

  remove(data) {
    if (!Array.isArray(data)) data = [data];
    data.forEach(d => {
      const node = this.getNode(d);
      node && node.parent.removeChild(node);
    });
  }

  append(data, parentData) {
    const parentNode = parentData ? this.getNode(parentData) : this.root;
    if (parentNode) {
      if (!Array.isArray(data)) data = [data];
      data.forEach(d => {
        parentNode.insertChild({ data: d });
      });
    }
  }

  reload(data, done) {
    if (this.lazy && this.load) {
      if (!Array.isArray(data)) data = [data];
      const l = data.length - 1;
      data.forEach((d, i) => {
        const node = this.getNode(d);
        if (node) {
          node.loaded = false;
          node.loadNode(i === l && done);
        }
      });
    }
  }

  /**
   * 将节点移动到目标节点的子节点
   * @author chenguanbin
   * @param {Object} [data] 被移动节点的数据对象
   * @param {Object} [targetData] 目标节点的数据对象
   * @param {String} [position] 节点被移动到目标节点的位置: inner(目标节点内) prev(目标节点之前) next(目标节点之后)
   */
  move(data, targetData, position) {
    const node = this.getNode(data);
    const targetNode = targetData ? this.getNode(targetData) : this.root;

    // 移除节点数据
    if (node) {
      let parentNodeData = node.parent.data;
      if (!isArray(parentNodeData)) {
        parentNodeData = parentNodeData.children || [];
      }
      for (let i = 0; i < parentNodeData.length; i++) {
        if (parentNodeData[i] === data) {
          parentNodeData.splice(i, 1);
          break;
        }
      }
      node.parent.removeChild(node);
    }

    const loadedBeforeMove = node.loaded;
    const loadedChildren = node.childNodes.map(n => n.data);

    // 添加节点数据到目标节点
    if (targetNode) {
      if (position === 'inner') {
        targetNode.insertChild(
          { data },
          undefined,
          true,
          loadedBeforeMove,
          loadedChildren
        );
      } else if (position === 'prev') {
        targetNode.parent.insertBefore(
          { data },
          targetNode,
          loadedBeforeMove,
          loadedChildren
        );
      } else if (position === 'next') {
        targetNode.parent.insertAfter(
          { data },
          targetNode,
          loadedBeforeMove,
          loadedChildren
        );
      }
      this._moveData(data, targetNode, position);

      return this.getNode(data);
    }
  }

  /**
   * 移动数据
   * @author chenguanbin
   * @param {Object} [data] 被移动节点的数据对象
   * @param {Object} [targetNode] 目标节点
   * @param {String} [position] 节点被移动到目标节点的位置: inner(目标节点内) prev(目标节点之前) next(目标节点之后)
   */
  _moveData(data, targetNode, position) {
    // 分为：移动到节点之中、移动到节点前后
    if (position === 'inner') {
      if (!targetNode.data.children) {
        targetNode.data.children = [];
      }
      targetNode.data.children.push(data);
    } else {
      let pNodeData = targetNode.parent.data;
      if (!isArray(pNodeData)) {
        pNodeData = pNodeData.children || [];
      }
      for (let i = 0; i < pNodeData.length; i++) {
        if (pNodeData[i] === targetNode.data) {
          position === 'prev'
            ? pNodeData.splice(i, 0, data)
            : pNodeData.splice(i + 1, 0, data);
          break;
        }
      }
    }
  }

  _initDefaultCheckedNodes() {
    const defaultCheckedKeys = this.defaultCheckedKeys || [];
    const nodesMap = this.nodesMap;

    defaultCheckedKeys.forEach(checkedKey => {
      const node = nodesMap[checkedKey];

      if (node) {
        node.setChecked(true, !this.checkStrictly);
      }
    });
  }

  _initDefaultCheckedNode(node) {
    const defaultCheckedKeys = this.defaultCheckedKeys || [];

    if (defaultCheckedKeys.indexOf(node.key) !== -1) {
      node.setChecked(true, !this.checkStrictly, this.lazy);
    } else if (node.parent && !this.checkStrictly) {
      node.setChecked(node.parent.checked, !this.checkStrictly, this.lazy);
    }
  }

  setDefaultCheckedKey(newVal) {
    if (newVal !== this.defaultCheckedKeys) {
      this.defaultCheckedKeys = newVal;
      this._initDefaultCheckedNodes();
    }
  }

  registerNode(node) {
    const key = this.key;
    if (!key || !node || !node.data) return;

    const nodeKey = node.key;
    if (nodeKey !== undefined) this.nodesMap[node.key] = node;
  }

  deregisterNode(node) {
    const key = this.key;
    if (!key || !node || !node.data) return;

    delete this.nodesMap[node.key];
  }

  /**
   * 获取选中节点方法
   * 增加选中半选的判断，默认不获取  xiangxiao3 2017/9/26
   * @param {boolean} [leafOnly=false] 仅返回被选中的叶子节点
   * @param {boolean} [checkedOnly=true] 仅返回半选状态的节点
   * @returns 被选中的节点
   * @memberof TreeStore
   */
  getCheckedNodes(leafOnly = false, checkedOnly = true) {
    const checkedNodes = [];
    const traverse = function(node) {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      childNodes.forEach(child => {
        // 1、leafOnly=false，且节点选中
        // 2、leafOnly=true，且节点是叶子节点，且节点选中
        // 3、checkedOnly=false，且节点半选
        if (
          (!leafOnly && child.checked) ||
          (leafOnly && child.isLeaf && child.checked) ||
          (!checkedOnly && child.indeterminate)
        ) {
          checkedNodes.push(child.data);
        }

        traverse(child);
      });
    };

    traverse(this);

    return checkedNodes;
  }

  /**
   * 获取选中节点的key值
   * 增加选中半选的判断，默认不获取  xiangxiao3 2017/9/26
   * @param {boolean} [leafOnly=false] 仅返回被选中的叶子节点
   * @param {boolean} [checkedOnly=true] 仅返回半选状态的节点
   * @returns 被选中节点的key值
   * @memberof TreeStore
   */
  getCheckedKeys(leafOnly = false, checkedOnly = true) {
    return this.getCheckedNodes(leafOnly, checkedOnly).map(
      data => (data || {})[this.key]
    );
  }

  /**
   * 返回目前半选中的节点所组成的数组
   */
  getHalfCheckedNodes() {
    const nodes = [];
    const traverse = function(node) {
      const childNodes = node.root ? node.root.childNodes : node.childNodes;

      childNodes.forEach(child => {
        if (child.indeterminate) {
          nodes.push(child.data);
        }

        traverse(child);
      });
    };

    traverse(this);

    return nodes;
  }

  /**
   * 返回目前半选中的节点的 key 所组成的数组
   */
  getHalfCheckedKeys() {
    return this.getHalfCheckedNodes().map(data => (data || {})[this.key]);
  }

  _getAllNodes() {
    const allNodes = [];
    const nodesMap = this.nodesMap;
    for (const nodeKey in nodesMap) {
      if (hasOwn(nodesMap, nodeKey)) {
        allNodes.push(nodesMap[nodeKey]);
      }
    }

    return allNodes;
  }

  // updateChildren(key, data) {
  //   const node = this.nodesMap[key];
  //   if (!node) return;
  //   const childNodes = node.childNodes;
  //   for (let i = childNodes.length - 1; i >= 0; i--) {
  //     const child = childNodes[i];
  //     this.remove(child.data);
  //   }
  //   for (let i = 0, j = data.length; i < j; i++) {
  //     const child = data[i];
  //     this.append(child, node.data);
  //   }
  // }

  _setCheckedKeys(key, leafOnly = false, checkedKeys, rootOnly = false) {
    const allNodes = this._getAllNodes().sort((a, b) => b.level - a.level);
    const cache = Object.create(null);
    const keys = Object.keys(checkedKeys);
    for (let i = 0, j = allNodes.length; i < j; i++) {
      const node = allNodes[i];
      const nodeKey = node.data[key].toString();
      const checked = keys.indexOf(nodeKey) > -1;
      if (!checked) {
        if (node.checked && !cache[nodeKey]) {
          node.setChecked(false, false);
        }
        continue;
      }

      let parent = node.parent;
      while (parent && parent.level > 0) {
        cache[parent.data[key]] = true;
        parent = parent.parent;
      }

      if (node.isLeaf || this.checkStrictly) {
        // 是否只选中点击的节点
        if (rootOnly) {
          node.setChecked(true, false, false, false, rootOnly);
        } else {
          node.setChecked(true, false);
        }
        continue;
      }

      // 是否只选中点击的节点
      if (rootOnly) {
        node.setChecked(true, false, false, false, rootOnly);
      } else {
        node.setChecked(true, true);
      }

      if (leafOnly) {
        node.setChecked(false, false);
        const traverse = function(node) {
          const childNodes = node.childNodes;
          childNodes.forEach(child => {
            if (!child.isLeaf) {
              child.setChecked(false, false);
            }
            traverse(child);
          });
        };
        traverse(node);
      }
    }
  }

  setCheckedNodes(array, leafOnly = false, rootOnly = false) {
    const key = this.key;
    const checkedKeys = {};
    array.forEach(item => {
      checkedKeys[(item || {})[key]] = true;
    });

    this._setCheckedKeys(key, leafOnly, checkedKeys, rootOnly);
  }

  setCheckedKeys(keys, leafOnly = false, rootOnly = false) {
    this.defaultCheckedKeys = keys;
    const key = this.key;
    const checkedKeys = {};
    keys.forEach(key => {
      checkedKeys[key] = true;
    });

    this._setCheckedKeys(key, leafOnly, checkedKeys, rootOnly);
  }

  setDefaultExpandedKeys(keys) {
    keys = keys || [];
    this.defaultExpandedKeys = keys;

    keys.forEach(key => {
      const node = this.getNode(key);
      if (node) node.expand(null, this.autoExpandParent);
    });
  }

  setChecked(data, checked, deep) {
    const node = this.getNode(data);

    if (node) {
      node.setChecked(!!checked, deep);
    }
  }

  getCurrentNode() {
    return this.currentNode;
  }

  setCurrentNode(node) {
    if (node === null) {
      this.currentNode = null;
      return;
    }

    this.currentNode = node;
  }

  setUserCurrentNode(node) {
    const key = node[this.key];
    const currNode = this.nodesMap[key];
    this.setCurrentNode(currNode);
  }

  setCurrentNodeKey(key) {
    if (key === null) {
      this.currentNode = null;
      return;
    }

    const node = this.getNode(key);
    if (node) {
      this.currentNode = node;
    }
  }
}

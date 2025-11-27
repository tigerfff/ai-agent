export const NODE_KEY = '$treeNodeId';

export const markNodeData = function(node, data) {
  if (data[NODE_KEY]) return;
  Object.defineProperty(data, NODE_KEY, {
    value: node.id,
    enumerable: false,
    configurable: false,
    writable: false
  });
};

export const getNodeKey = function(key, data) {
  if (!key) return data[NODE_KEY];
  return data[key] || data.key;
};

/**
 * 判断传入的对象是否为数组
 * @author chenguanbin
 * @param {Object} [object] 传入的对象
 */
export const isArray = function(object) {
  return object && typeof object === 'object' && Array === object.constructor;
};

/**
 * 返回当前页面相对于窗口显示区左上角的 X ，Y 的位置
 * @author chenguanbin
 * @param {boolean} [top] 是否是获取顶部的左上角的Y坐标
 */
export const getScroll = function(top) {
  var ret = window['page' + (top ? 'Y' : 'X') + 'Offset'];
  var method = 'scroll' + (top ? 'Top' : 'Left');
  if (typeof ret !== 'number') {
    var d = window.document;
    // ie6,7,8 standard mode
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      // quirks mode
      ret = d.body[method];
    }
  }
  return ret;
};

/**
 * 返回目标节点在容器中的位置
 * @author chenguanbin
 * @param {HTMLElement} [element] 需要获取位置的元素
 * @param {HTMLElement} [container = document.body] 容器元素
 */
export const getOffset = function(element, container = document.body) {
  const elRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const clientTop = element.clientTop || container.clientTop || 0;
  const clientLeft = element.clientLeft || container.clientLeft || 0;
  let top, left;

  if (container === document.body) {
    top = getScroll(true);
    left = getScroll();
  } else {
    top = container.scrollTop - containerRect.top;
    left = container.scrollLeft - containerRect.left;
  }

  return {
    top: elRect.top + top - clientTop,
    left: elRect.left + left - clientLeft,
    right: elRect.right + left - clientLeft,
    bottom: elRect.bottom + top - clientTop
  };
};

/**
 * 格式化数据，将简单格式数据转化为tree需要使用的格式
 * @param {Array} treeData 树节点数据
 * @param {String} nodeKey 节点Key
 * @param {String} parentKey 父节点Key
 */
export const formatData = function(treeData, nodeKey, parentKey) {
  const dataClone = JSON.parse(JSON.stringify(treeData)); // 将数据进行深度克隆，避免污染源数据
  const nodeIds = dataClone.map(item => {
    return item[nodeKey];
  }); // 所有ID的数组
  const target = []; // 目标数据
  const childNodes = []; // 除根节点以外的数据

  // 将根节点加入到target，其余节点加入到childNodes
  treeData.forEach(item => {
    if (nodeIds.indexOf(item[parentKey]) === -1) {
      target.push(item);
    } else {
      childNodes.push(item);
    }
  });

  // 按照父节点key进行分组
  const groupNodes = getGruopNodes(childNodes, parentKey);

  const traverse = parent => {
    for (const pId in groupNodes) {
      if (pId.toString() === parent[nodeKey].toString()) {
        parent.children = groupNodes[pId].nodes;
        groupNodes[pId].nodes.forEach(item => {
          traverse(item);
        });
      }
    }
  };

  target.forEach(item => {
    traverse(item);
  });

  return target;
};

/**
 * 数据按照父节点ID进行分组
 * @param {Array} childNodes 除根节点以外的数据
 * @param {String} parentKey 父节点Key
 */
const getGruopNodes = (childNodes, parentKey) => {
  const groups = {};
  childNodes.forEach(item => {
    const pId = item[parentKey];
    if (groups[pId]) {
      groups[pId].nodes.push(item);
    } else {
      groups[pId] = {
        nodes: new Array(item)
      };
    }
  });
  return groups;
};

/**
 * 判断传入对象的类型
 * @param {传入的对象} obj
 */
export const getType = function(obj) {
  // tostring会返回对应不同的标签的构造函数
  const toString = Object.prototype.toString;
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };
  if (obj instanceof Element) {
    return 'element';
  }
  return map[toString.call(obj)];
};

/**
 * 对象深度拷贝
 * @param {传入的对象} data
 */
export const deepClone = function(data) {
  const type = getType(data);
  let obj;
  if (type === 'array') {
    obj = [];
  } else if (type === 'object') {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === 'array') {
    for (let i = 0, len = data.length; i < len; i++) {
      obj.push(deepClone(data[i]));
    }
  } else if (type === 'object') {
    for (const key in data) {
      obj[key] = deepClone(data[key]);
    }
  }
  return obj;
};

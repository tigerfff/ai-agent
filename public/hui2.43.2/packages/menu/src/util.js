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
 * 获取折叠子菜单的高度
 * @param {HTMLElement} submenu 子菜单
 */
export const getCollapseHeight = function(submenu) {
  let cHeight = 0;
  const traverse = el => {
    const childNodes = Array.prototype.slice.call(el.childNodes);
    childNodes.forEach(node => {
      const nodeName = node.nodeName;
      const className = node.className;
      if (nodeName === 'LI' && className.indexOf('el-menu-item-group') !== -1) {
        cHeight += 32;
        traverse(node);
      } else if (
        nodeName === 'LI' &&
        (className.indexOf('el-menu-item') !== -1 ||
          className.indexOf('el-submenu') !== -1)
      ) {
        cHeight += 40;
      } else if (nodeName === 'UL') {
        traverse(node);
      }
    });
  };
  traverse(submenu);

  return cHeight;
};

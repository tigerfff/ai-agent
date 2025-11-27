import { off, on, once } from 'hui/src/utils/dom';
// 用来获取 css 相关属性值 IE下获取的是属性字符串如 50%,100px;FF下是计算后的值
const getAttr = (obj, key) =>
  obj.currentStyle
    ? obj.currentStyle[key]
    : window.getComputedStyle(obj, false)[key];
// 限流函数
const throttle = function(fn, interval) {
  let s = 0;
  return function() {
    const ctx = this;
    const e = Date.now();
    if (e - s >= interval) {
      fn.apply(ctx, arguments);
      // console.error('do something');
      s = e;
    }
  };
};

const fps = 1 / 60; // 刷新帧率
const interval = parseInt(fps * 1000); // ms
const vDrag = {
  bind(el) {
    /**
     * target: dialog 组件的容器元素
     * header：dialog 组件的头部区域，也是就是拖拽的区域
     * 如果需要封装move指令，可基于此做简单改造
     */
    const target = el.children[0];
    const header = target.children[0];
    // header 鼠标手型
    header.style.cursor = 'move';

    const onmousedown = e => {
      // dialog面板el的宽高,用于适配IE下获取是%的情况，计算真实px
      const pWidth = el.offsetWidth;
      const pHeight = el.offsetHeight;

      const marginLStr = getAttr(target, 'margin-left');
      const marginTStr = getAttr(target, 'margin-top');
      // 处理IE下获取是百分比margin的情况
      const marginL =
        (marginLStr.includes('%')
          ? (pWidth * parseFloat(marginLStr)) / 100
          : parseFloat(marginLStr)) || 0;

      const marginT =
        (marginTStr.includes('%')
          ? (pHeight * parseFloat(marginTStr)) / 100
          : parseFloat(marginTStr)) || 0;
      // 记录按下时鼠标的坐标和目标元素的 left、top 值
      const currentX = e.clientX;
      const currentY = e.clientY;

      const offsetLeft = target.offsetLeft;
      const offsetTop = target.offsetTop;
      // offsetLeft = marginLeft + left; so => left = offsetLeft - marginLeft;
      const oLeft = offsetLeft - marginL; // 初始的left和top值
      const oTop = offsetTop - marginT;

      // 存到this.onmousemove 中，用于解绑
      const onmousemove = throttle(event => {
        // 鼠标移动时计算每次移动的距离，并改变拖拽元素的定位
        const deltaX = event.clientX - currentX; // x偏移
        const deltaY = event.clientY - currentY; // y偏移
        target.style.left = `${oLeft + deltaX}px`;
        target.style.top = `${oTop + deltaY}px`;
        const browserWidth =
          document.documentElement.clientWidth || document.body.clientWidth;
        const browserHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        const {
          left,
          top,
          right,
          bottom,
          height,
          width
        } = target.getBoundingClientRect(); // 获取浏览器视口的位置

        // 修正dialog 的margin导致的边界控制问题;
        if (left <= 0) {
          // 控制左侧不出边界 marginLeft：修正由于marginLeft存在，left=0时候依旧存在不靠最左边或者超出边界的问题；最右边同理
          target.style.left = `${0 - marginL}px`;
        }
        if (right >= browserWidth) {
          // 控制右侧不出边界
          target.style.left = `${browserWidth - width - marginL}px`;
        }
        if (top <= 0) {
          // 控制顶部不出边界 marginTop：修正由于marginTop存在，top=0时候依旧存在不靠最顶边或者超出边界的问题，最底边同理
          target.style.top = `${0 - marginT}px`;
        }
        if (bottom >= browserHeight) {
          target.style.top = `${browserHeight - height - marginT}px`;
        }
        // 阻止事件的默认行为，可以解决选中文本的时候拖不动
        e.preventDefault();
        return false;
      }, interval);
      on(document, 'mousemove', onmousemove);

      // 鼠标松开时，拖拽结束
      once(document, 'mouseup', () => {
        off(document, 'mousemove', onmousemove);
      });
    };
    on(header, 'mousedown', onmousedown);
    el.$$onmousedown = onmousedown; // 引用持有
  },

  // 最后卸载时，清除事件绑定
  unbind(el) {
    const header = el && el.children[0] && el.children[0].children[0];
    if (header) {
      off(header, 'mousedown', el.$$onmousedown);
      el.$$onmousedown = null;
    }
  }
};

export default vDrag;

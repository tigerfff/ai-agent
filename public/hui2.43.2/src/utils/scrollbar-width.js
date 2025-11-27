import Vue from 'vue';

let scrollBarWidth;

export default function(isChange) {
  if (Vue.prototype.$isServer) return 0;
  if (!isChange) {
    // 防止鼠标缩放浏览器时scrollBarWidth不变化
    if (scrollBarWidth !== undefined && scrollBarWidth !== 0) {
      return scrollBarWidth;
    }
  }

  const outer = document.createElement('div');
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
}

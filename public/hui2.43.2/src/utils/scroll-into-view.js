import Vue from 'vue';

export default function scrollIntoView(container, selected, selfScroll) {
  if (Vue.prototype.$isServer) return;

  if (!selected) {
    container.scrollTop = 0;
    return;
  }

  const top = selected.offsetTop;
  const bottom = selected.offsetTop + selected.offsetHeight;
  const viewRectTop = container.scrollTop;
  const viewRectBottom = viewRectTop + container.clientHeight;

  if (top < viewRectTop) {
    if (selfScroll) {
      selfScroll.setScroll(top);
    } else {
      container.scrollTop = top;
    }
  } else if (bottom > viewRectBottom) {
    if (selfScroll) {
      selfScroll.setScroll(bottom - container.clientHeight);
    } else {
      container.scrollTop = bottom - container.clientHeight;
    }
  }
}

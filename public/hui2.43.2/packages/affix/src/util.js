export const getScroll = (target, top) => {
  const prop = top ? 'pageYOffset' : 'pageXOffset';
  const method = top ? 'scrollTop' : 'scrollLeft';

  let ret = target[prop];

  if (typeof ret !== 'number') {
    ret = target ? target[method] : window.document.documentElement[method];
  }

  return ret;
};

export const getOffset = (element, target) => {
  const rect = element.getBoundingClientRect();
  const targetTop =
    target && target.getBoundingClientRect
      ? target.getBoundingClientRect().top
      : 0;

  const scrollTop = getScroll(target || window, true);
  const scrollLeft = getScroll(target || window);

  const docEl = window.document.body;
  const clientTop = docEl.clientTop || 0;
  const clientLeft = docEl.clientLeft || 0;

  return {
    top: rect.top + scrollTop - clientTop - targetTop,
    left: rect.left + scrollLeft - clientLeft
  };
};

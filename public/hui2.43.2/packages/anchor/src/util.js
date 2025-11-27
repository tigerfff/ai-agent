/**
 * @desc 元素滚动到目标位置
 * @author chenguanbin
 * @param {Document} el 滚动元素
 * @param {Number} from 开始位置
 * @param {Number} to 目标位置
 * @param {Number} duration 持续时间
 * @param {Function} endCallback 回调函数
 */
export const scrollTop = (el, from = 0, to, duration = 500, endCallback) => {
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame =
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
  }
  const difference = Math.abs(from - to);
  const step = Math.ceil((difference / duration) * 50);

  function scroll(start, end, step) {
    if (start === end) {
      endCallback && endCallback();
      return;
    }

    let d = start + step > end ? end : start + step;
    if (start > end) {
      d = start - step < end ? end : start - step;
    }

    if (el === window) {
      window.scrollTo(d, d);
    } else {
      el.scrollTop = d;
    }
    window.requestAnimationFrame(() => scroll(d, end, step));
  }
  scroll(from, to, step);
};

/**
 * @desc 找到子组件中的目标组件
 * @author chenguanbin
 * @param {Object} context 父组件
 * @param {String} componentName 子组件名称
 */
export const findComponentsDownward = (context, componentName) => {
  return context.$children.reduce((components, child) => {
    componentName = Array.isArray(componentName)
      ? componentName
      : [componentName];
    if (componentName.includes(child.$options.name)) components.push(child);
    const foundChilds = findComponentsDownward(child, componentName);
    return components.concat(foundChilds);
  }, []);
};

// 锚点正则
export const sharpMatcherRegx = /#([^#]+)$/;

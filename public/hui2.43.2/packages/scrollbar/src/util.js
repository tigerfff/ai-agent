export const BAR_MAP = {
  vertical: {
    offset: 'offsetHeight',
    scroll: 'scrollTop',
    scrollSize: 'scrollHeight',
    size: 'height',
    paddingPosition: 'paddingBottom',
    key: 'vertical',
    axis: 'Y',
    client: 'clientY',
    direction: 'top',
    clientSize: 'clientHeight'
  },
  horizontal: {
    offset: 'offsetWidth',
    scroll: 'scrollLeft',
    scrollSize: 'scrollWidth',
    size: 'width',
    paddingPosition: 'paddingRight',
    key: 'horizontal',
    axis: 'X',
    client: 'clientX',
    direction: 'left',
    clientSize: 'clientWidth'
  }
};

export function renderThumbStyle({
  size,
  bar,
  minLength,
  railSize,
  percent,
  wrap
}) {
  const style = {};
  let translate;
  const _size = typeof size !== 'number' ? +size.replace('%', '') : minLength;
  /**
   * el-time-picker使用el-scrollbar组件，
   * 当el-time-picker展开时，railSize === 0，导致计算出来的translate值不正确，
   * 所以这里单独对railSize === 0 时做处理，其实 else if 和 else 分支也可以直接使用这个逻辑
   */
  if (railSize === 0) {
    const { scrollTop = 0, scrollLeft = 0, clientHeight = 1, clientWidth = 1 } =
      wrap || {};
    const val =
      bar.axis === 'Y'
        ? (scrollTop * 100) / clientHeight
        : (scrollLeft * 100) / clientWidth;
    translate = `translate${bar.axis}(${val}%)`;
    style[bar.size] = size;
  } else if ((railSize * _size) / 100 < minLength) {
    const barSize = minLength;
    translate = `translate${bar.axis}(${(((railSize - barSize) * percent) /
      barSize) *
      100}%)`;
    style[bar.size] = barSize + 'px';
  } else {
    const barSize = (_size / 100) * railSize;
    translate = `translate${bar.axis}(${(((railSize - barSize) * percent) /
      barSize) *
      100}%)`;
    style[bar.size] = size;
  }
  style.transform = translate;
  style.msTransform = translate;
  style.webkitTransform = translate;
  return style;
}

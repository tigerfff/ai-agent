const scrollTo = (element, to, duration, isLeft = false) => {
  const requestAnimationFrame =
    window.requestAnimationFrame ||
    function requestAnimationFrameTimeout() {
      return setTimeout(arguments[0], 10);
    };
  let scrollDirection;
  if (isLeft) {
    scrollDirection = 'scrollLeft';
  } else {
    scrollDirection = 'scrollTop';
  }
  // jump to target if duration zero
  if (duration <= 0) {
    element[scrollDirection] = to;
    return;
  }
  const difference = to - element[scrollDirection];
  const perTick = (difference / duration) * 10;

  requestAnimationFrame(() => {
    element[scrollDirection] += perTick;
    if (element[scrollDirection] === to) return;
    scrollTo(element, to, duration - 10, isLeft);
  });
};

export default scrollTo;

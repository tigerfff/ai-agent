import { once, on } from 'hui/src/utils/dom';

export default {
  bind(el, binding, vnode) {
    let interval = null;
    let startTime;
    // 判断handler是否已执行；setInterval调度延时导致handler没有被执行时，需要保证至少handler至少执行一次。
    let executed = false;
    const handler = () => {
      vnode.context[binding.expression].apply();
      executed = true;
    };
    const clear = () => {
      clearInterval(interval);
      interval = null;
      if (new Date() - startTime < 100 || !executed) {
        handler();
      }
    };

    on(el, 'mousedown', e => {
      if (e.button !== 0) return;
      executed = false;
      startTime = new Date();
      once(document, 'mouseup', clear);
      clearInterval(interval);
      interval = setInterval(handler, 100);
    });
  }
};

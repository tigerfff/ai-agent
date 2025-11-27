import Vue from 'vue';
import { PopupManager } from 'hui/src/utils/popup';
import { isVNode } from 'hui/src/utils/vdom';
import NotificationMain from './main.vue';
const NotificationConstructor = Vue.extend(NotificationMain);

let instance;
const instances = []; // Notification的实例信息
let pages = []; // 分页的页数信息
let seed = 1;

var Notification = function(options) {
  if (Vue.prototype.$isServer) return;
  options = options || {};
  const id = 'notification_' + seed++;
  const position = options.position || 'top-right';
  // 非分页场景和 分页场景的第一页 都需要新建一个Notification实例
  if (!(options.pagination && pages.length)) {
    const userOnClose = options.onClose;
    options.onClose = function() {
      Notification.close(id, userOnClose);
    };
    instance = new NotificationConstructor({
      data: options
    });
    if (options.pagination) {
      // 分页的第一条信息  更新pages
      pages.push({ content: options.message, title: options.title });
      options.pages = pages;
      const offset = options.offset || 0;
      instance.verticalOffset = offset + 16;
    } else {
      // 非分页场景 单条或者多条时都包含 考虑多个实例时的偏移问题
      let verticalOffset = options.offset || 0;
      instances
        .filter(item => item.position === position)
        .forEach(item => {
          verticalOffset += item.$el.offsetHeight + 16;
        });
      verticalOffset += 16;
      instance.verticalOffset = verticalOffset;
    }
    if (isVNode(options.message)) {
      instance.$slots.default = [options.message];
      options.message = 'REPLACED_BY_VNODE';
    }
    instance.id = id;
    instance.vm = instance.$mount();
    document.body.appendChild(instance.vm.$el);
    instance.vm.visible = true;
    instance.dom = instance.vm.$el;
    instance.dom.style.zIndex = PopupManager.nextZIndex();
    instances.push(instance);
    return instance.vm;
  } else {
    // 分页情况下的后续页
    // 第一个实例的timeout清零
    instance.clearTimer();
    pages.push({ content: options.message, title: options.title });
    options.pages = pages;
    options.message = '';
    instance.startTimer();
  }
};

Notification.close = function(id, userOnClose) {
  let index = -1;
  const len = instances.length;
  const instance = instances.filter((instance, i) => {
    if (instance.id === id) {
      index = i;
      return true;
    }
    return false;
  })[0];
  if (!instance) return;

  if (typeof userOnClose === 'function') {
    userOnClose(instance);
  }
  instances.splice(index, 1);
  pages = [];

  if (len <= 1) return;
  const position = instance.position;
  const removedHeight = instance.dom.offsetHeight;
  for (let i = index; i < len - 1; i++) {
    if (instances[i].position === position) {
      instances[i].dom.style[instance.verticalProperty] =
        parseInt(instances[i].dom.style[instance.verticalProperty], 10) -
        removedHeight -
        16 +
        'px';
    }
  }
};

export default Notification;

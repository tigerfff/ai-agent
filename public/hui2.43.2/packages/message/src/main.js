import Vue from 'vue';
import { PopupManager } from 'hui/src/utils/popup';
import { isVNode } from 'hui/src/utils/vdom';
import MessageMain from './main.vue';
// let MessageConstructor = Vue.extend(require('./main.vue'));
const MessageConstructor = Vue.extend(MessageMain);

let instance;
const instances = [];
let seed = 1;

var Message = function(options) {
  if (Vue.prototype.$isServer) return;
  options = options || {};
  if (typeof options === 'string') {
    options = {
      message: options
    };
  }
  const userOnClose = options.onClose;
  const id = 'message_' + seed++;

  options.onClose = function() {
    Message.close(id, userOnClose);
  };
  instance = new MessageConstructor({
    data: options
  });
  let verticalOffset = 0;
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 16;
  });
  // 首个的位置为top:20px
  verticalOffset += 20;
  instance.verticalOffset = verticalOffset;
  instance.id = id;
  if (isVNode(instance.message)) {
    instance.$slots.default = [instance.message];
    instance.message = null;
  }
  instance.vm = instance.$mount();
  document.body.appendChild(instance.vm.$el);
  instance.vm.visible = true;
  instance.dom = instance.vm.$el;
  instance.dom.style.zIndex = PopupManager.nextZIndex();
  instances.push(instance);
  return instance.vm;
};

['success', 'warning', 'info', 'error'].forEach(type => {
  Message[type] = options => {
    if (typeof options === 'string') {
      options = {
        message: options
      };
    }
    options.type = type;
    return Message(options);
  };
});

Message.close = function(id, userOnClose) {
  const len = instances.length;
  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      if (typeof userOnClose === 'function') {
        userOnClose(instances[i]);
      }
      const removedHeight = instances[i].dom.offsetHeight;
      instances.splice(i, 1);
      if (len <= 1) return;
      for (let j = i; j < len - 1; j++) {
        instances[j].dom.style.top =
          parseInt(instances[j].dom.style.top, 10) - removedHeight - 16 + 'px';
      }
      break;
    }
  }
};

Message.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close();
  }
};

export default Message;

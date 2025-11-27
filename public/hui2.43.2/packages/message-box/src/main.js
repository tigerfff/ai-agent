import Vue from 'vue';
import msgboxVue from './main.vue';
import merge from 'hui/src/utils/merge';
import { isVNode } from 'hui/src/utils/vdom';
import { hasOwn } from 'hui/src/utils/util';

const defaults = {
  title: undefined,
  message: '',
  type: '',
  size: '',
  showInput: false,
  showClose: true,
  modalFade: true,
  lockScroll: true,
  closeOnClickModal: false,
  closeOnPressEscape: false,
  closeOnHashChange: true,
  inputValue: null,
  inputPlaceholder: '',
  inputType: 'text',
  inputPattern: null,
  inputValidator: null,
  inputErrorMessage: '',
  showConfirmButton: true,
  showCancelButton: false,
  confirmButtonPosition: 'right',
  confirmButtonHighlight: false,
  cancelButtonHighlight: false,
  confirmButtonText: '',
  cancelButtonText: '',
  confirmButtonClass: '',
  cancelButtonClass: '',
  customClass: '',
  beforeClose: null,
  dangerouslyUseHTMLString: false,
  buttons: null,
  onConfirm: null,
  onCancel: null
};

const MessageBoxConstructor = Vue.extend(msgboxVue);

let currentMsg, instance;
let msgQueue = [];

const defaultCallback = action => {
  if (currentMsg) {
    const callback = currentMsg.callback;
    if (typeof callback === 'function') {
      if (instance.showInput) {
        callback(instance.inputValue, action);
      } else {
        callback(action);
      }
    }
    if (currentMsg.resolve) {
      if (action !== 'cancel') {
        if (instance.showInput) {
          currentMsg.resolve({ value: instance.inputValue, action });
        } else {
          currentMsg.resolve(action);
        }
        if (typeof currentMsg.options.onConfirm === 'function') {
          if (instance.showInput) {
            currentMsg.options.onConfirm({
              value: instance.inputValue,
              action
            });
          } else {
            currentMsg.options.onConfirm(action);
          }
        }
      } else if (currentMsg.reject) {
        if (typeof currentMsg.options.onCancel === 'function') {
          currentMsg.options.onCancel(action);
        } else {
          currentMsg.reject(action);
        }
      }
    }
  }
};

const initInstance = () => {
  instance = new MessageBoxConstructor({
    el: document.createElement('div')
  });

  instance.callback = defaultCallback;
};

const showNextMsg = () => {
  if (!instance) {
    initInstance();
  }
  instance.action = '';
  if (!instance.visible || instance.closeTimer) {
    if (msgQueue.length > 0) {
      currentMsg = msgQueue.shift();

      const options = currentMsg.options;

      for (const prop in options) {
        if (hasOwn(options, prop)) {
          instance[prop] = options[prop];
        }
      }

      // 如果msgbox默认没有使用title属性，则应该赋值title为空
      if (!options.title) {
        instance.title = '';
      }

      if (options.callback === undefined) {
        instance.callback = defaultCallback;
      }

      const oldCb = instance.callback;
      instance.callback = (action, instance) => {
        oldCb(action, instance);
        showNextMsg();
      };
      if (isVNode(instance.message)) {
        instance.$slots.default = [instance.message];
        instance.message = null;
      } else {
        delete instance.$slots.default;
      }
      [
        'modal',
        'showClose',
        'closeOnClickModal',
        'closeOnPressEscape',
        'closeOnHashChange'
      ].forEach(prop => {
        if (instance[prop] === undefined) {
          instance[prop] = true;
        }
      });
      document.body.appendChild(instance.$el);

      Vue.nextTick(() => {
        instance.visible = true;
      });
    }
  }
};

const MessageBox = function(options, callback) {
  if (Vue.prototype.$isServer) return;
  if (typeof options === 'string' || isVNode(options)) {
    options = {
      message: options
    };
    if (typeof arguments[1] === 'string') {
      options.title = arguments[1];
    }
    if (arguments[2]) {
      options.type = arguments[2];
    }
  } else if (options.callback && !callback) {
    callback = options.callback;
  }

  if (typeof Promise !== 'undefined') {
    return new Promise((resolve, reject) => { // eslint-disable-line
      msgQueue.push({
        options: merge({}, defaults, MessageBox.defaults, options),
        callback: callback,
        resolve: resolve,
        reject: reject
      });

      showNextMsg();
    });
  } else {
    msgQueue.push({
      options: merge({}, defaults, MessageBox.defaults, options),
      callback: callback
    });

    showNextMsg();
  }
};

MessageBox.setDefaults = defaults => {
  MessageBox.defaults = defaults;
};

MessageBox.alert = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  } else if (title === undefined) {
    title = '';
  }
  return MessageBox(
    merge(
      {
        title: title,
        message: message,
        $type: 'alert'
      },
      options
    )
  );
};

MessageBox.confirm = (title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  } else if (title === undefined) {
    title = '';
  }
  return MessageBox(
    merge(
      {
        title: title,
        $type: 'confirm',
        type: 'question',
        showCancelButton: true
      },
      options
    )
  );
};

MessageBox.prompt = (message, title, options) => {
  if (typeof title === 'object') {
    options = title;
    title = '';
  } else if (title === undefined) {
    title = '';
  }
  return MessageBox(
    merge(
      {
        title: title,
        message: message,
        showCancelButton: true,
        showInput: true,
        $type: 'prompt'
      },
      options
    )
  );
};

MessageBox.close = () => {
  instance.doClose();
  instance.visible = false;
  msgQueue = [];
  currentMsg = null;
};

export default MessageBox;
export { MessageBox };

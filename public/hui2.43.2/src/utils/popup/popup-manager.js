import Vue from 'vue';
import { addClass, removeClass } from 'hui/src/utils/dom';

let hasModal = false;

const getModal = function(id, multiModal) {
  if (Vue.prototype.$isServer) return;
  let modalDom;
  if (multiModal) {
    modalDom = PopupManager.multiModalDom[id];
  } else {
    modalDom = PopupManager.modalDom;
  }

  if (modalDom) {
    hasModal = true;
  } else {
    hasModal = false;
    modalDom = document.createElement('div');

    if (multiModal) {
      PopupManager.multiModalDom[id] = modalDom;
    } else {
      PopupManager.modalDom = modalDom;
    }

    modalDom.addEventListener('touchmove', function(event) {
      event.preventDefault();
      event.stopPropagation();
    });

    modalDom.addEventListener('click', function() {
      PopupManager.doOnModalClick && PopupManager.doOnModalClick(id);
    });
  }

  return modalDom;
};

const instances = {};

const PopupManager = {
  multiModalDom: {},

  zIndex: 2000,

  modalFade: true,

  getInstance: function(id) {
    return instances[id];
  },

  register: function(id, instance) {
    if (id && instance) {
      instances[id] = instance;
    }
  },

  deregister: function(id) {
    if (id) {
      instances[id] = null;
      delete instances[id];
    }
  },

  nextZIndex: function() {
    return PopupManager.zIndex++;
  },

  modalStack: [],

  multiModalStack: {},

  doOnModalClick: function(id) {
    let topItem;
    if (PopupManager.multiModalStack[id] !== undefined) {
      topItem =
        PopupManager.multiModalStack[id][
          PopupManager.multiModalStack[id].length - 1
        ];
    } else {
      topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];
    }

    if (!topItem) return;

    const instance = PopupManager.getInstance(topItem.id);
    if (instance && instance.closeOnClickModal) {
      instance.close(topItem.id);
    }
  },

  openModal: function(opts) {
    opts = Object.assign(
      {
        multiModal: false
      },
      opts
    );
    // id, zIndex, dom, modalClass, modalFade
    if (Vue.prototype.$isServer) return;
    if (!opts.id || opts.zIndex === undefined) return;
    this.modalFade = opts.modalFade;
    let modalStack;
    if (opts.multiModal) {
      if (!this.multiModalStack[opts.id]) {
        this.multiModalStack[opts.id] = [];
      }
      modalStack = this.multiModalStack[opts.id];
    } else {
      modalStack = this.modalStack;
    }
    for (let i = 0, j = modalStack.length; i < j; i++) {
      const item = modalStack[i];
      if (item.id === opts.id) {
        return;
      }
    }

    const modalDom = getModal(opts.id, opts.multiModal);
    addClass(modalDom, 'v-modal');
    if (this.modalFade && !hasModal) {
      addClass(modalDom, 'v-modal-enter');
    }
    if (opts.modalClass) {
      const classArr = opts.modalClass.trim().split(/\s+/);
      classArr.forEach(item => addClass(modalDom, item));
    }
    setTimeout(() => {
      removeClass(modalDom, 'v-modal-enter');
    }, 200);
    if (
      opts.dom &&
      opts.dom.parentNode &&
      opts.dom.parentNode.nodeType !== 11
    ) {
      opts.dom.parentNode.appendChild(modalDom);
    } else {
      document.body.appendChild(modalDom);
    }
    if (opts.zIndex) {
      modalDom.style.zIndex = opts.zIndex;
    }
    modalDom.style.display = '';
    modalStack.push({
      id: opts.id,
      zIndex: opts.zIndex,
      modalClass: opts.modalClass
    });
  },

  closeModal: function(id) {
    let modalStack;
    if (this.multiModalStack[id] !== undefined) {
      modalStack = this.multiModalStack[id];
    } else {
      modalStack = this.modalStack;
    }
    const modalDom = getModal(
      id,
      PopupManager.multiModalStack[id] !== undefined
    );
    if (modalStack.length > 0) {
      const topItem = modalStack[modalStack.length - 1];
      if (topItem.id === id) {
        if (topItem.modalClass) {
          const classArr = topItem.modalClass.trim().split(/\s+/);
          classArr.forEach(item => removeClass(modalDom, item));
        }

        modalStack.pop();
        if (modalStack.length > 0) {
          modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
        }
      } else {
        for (let i = modalStack.length - 1; i >= 0; i--) {
          if (modalStack[i].id === id) {
            modalStack.splice(i, 1);
            break;
          }
        }
      }
    }

    if (modalStack.length === 0) {
      if (this.modalFade) {
        addClass(modalDom, 'v-modal-leave');
      }
      setTimeout(() => {
        if (modalStack.length === 0) {
          if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom);
          modalDom.style.display = 'none';
          if (PopupManager.multiModalStack[id] !== undefined) {
            PopupManager.multiModalDom[id] = null;
          } else {
            PopupManager.modalDom = null;
          }
        }
        removeClass(modalDom, 'v-modal-leave');
      }, 200);
    }
  }
};

const getTopPopup = function() {
  if (Vue.prototype.$isServer) return;
  if (PopupManager.modalStack.length > 0) {
    const topPopup =
      PopupManager.modalStack[PopupManager.modalStack.length - 1];
    if (!topPopup) return;
    const instance = PopupManager.getInstance(topPopup.id);

    return instance;
  }
};

if (!Vue.prototype.$isServer) {
  // handle `esc` key when the popup is shown
  window.addEventListener('keydown', function(event) {
    if (event.keyCode === 27) {
      const topPopup = getTopPopup();

      if (topPopup && topPopup.closeOnPressEscape) {
        topPopup.handleClose
          ? topPopup.handleClose()
          : topPopup.handleAction
          ? topPopup.handleAction('cancel')
          : topPopup.close();
      }
    }
  });
}

export default PopupManager;

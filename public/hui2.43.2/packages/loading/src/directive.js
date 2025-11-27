import Vue from 'vue';
import { addClass, removeClass, getStyle } from 'hui/src/utils/dom';
import loadingVue from './loading.vue';
// let Mask = Vue.extend(require('./loading.vue'));
const Mask = Vue.extend(loadingVue);

export default {
  install: Vue => {
    if (Vue.prototype.$isServer) return;
    const toggleLoading = (el, binding) => {
      if (binding.value) {
        Vue.nextTick(() => {
          if (binding.modifiers.fullscreen) {
            el.originalPosition = getStyle(document.body, 'position');
            el.originalOverflow = getStyle(document.body, 'overflow');
            // 获取overflowX、overflowY值，在结束loading设置
            el.originalOverflowX = getStyle(document.body, 'overflowX');
            el.originalOverflowY = getStyle(document.body, 'overflowY');
            addClass(el.mask, 'is-fullscreen');
            insertDom(document.body, el, binding);
          } else {
            removeClass(el.mask, 'is-fullscreen');

            if (binding.modifiers.body) {
              el.originalPosition = getStyle(document.body, 'position');

              ['top', 'left'].forEach(property => {
                const scroll = property === 'top' ? 'scrollTop' : 'scrollLeft';
                el.maskStyle[property] =
                  el.getBoundingClientRect()[property] +
                  document.body[scroll] +
                  document.documentElement[scroll] +
                  'px';
              });
              ['height', 'width'].forEach(property => {
                el.maskStyle[property] =
                  el.getBoundingClientRect()[property] + 'px';
              });

              insertDom(document.body, el, binding);
            } else {
              el.originalPosition = getStyle(el, 'position');
              insertDom(el, el, binding);
            }
          }
        });
      } else {
        if (el.domVisible) {
          el.instance.$on('after-leave', () => {
            el.domVisible = false;
            // 结束loading时，分别设置overflowX、overflowY，
            // 解决ie11下overflow多个值无法设置的问题，如：overflow: hidden auto;
            if (
              binding.modifiers.fullscreen &&
              (el.originalOverflowX !== 'hidden' ||
                el.originalOverflowY !== 'hidden')
            ) {
              if (el.originalOverflowX === el.originalOverflowY) {
                document.body.style.overflow = el.originalOverflow;
              } else {
                document.body.style.overflow = '';
                document.body.style.overflowX = el.originalOverflowX;
                document.body.style.overflowY = el.originalOverflowY;
              }
            }
            if (binding.modifiers.fullscreen || binding.modifiers.body) {
              document.body.style.position = el.originalPosition;
            } else {
              el.style.position = el.originalPosition;
            }
          });
          Vue.nextTick(() => {
            el.instance.visible = false;
          });
        }
      }

      // icon大小
      if (binding.modifiers.mini) {
        addClass(el.mask, 'is-mini');
      } else if (binding.modifiers.small) {
        addClass(el.mask, 'is-small');
      } else if (binding.modifiers.large) {
        addClass(el.mask, 'is-large');
      } else {
        addClass(el.mask, 'is-default');
      }

      // 主题色
      addClass(el.mask, binding.modifiers.gray ? 'is-gray' : 'is-primary');
    };
    const insertDom = (parent, el, binding) => {
      if (
        !el.domVisible &&
        getStyle(el, 'display') !== 'none' &&
        getStyle(el, 'visibility') !== 'hidden'
      ) {
        Object.keys(el.maskStyle).forEach(property => {
          el.mask.style[property] = el.maskStyle[property];
        });

        if (
          el.originalPosition !== 'absolute' &&
          el.originalPosition !== 'fixed'
        ) {
          // parent.style.position = 'relative';
        }
        if (binding.modifiers.fullscreen && binding.modifiers.lock) {
          parent.style.overflow = 'hidden';
        }
        el.domVisible = true;

        parent.appendChild(el.mask);
        Vue.nextTick(() => {
          el.instance.visible = true;
        });
        el.domInserted = true;
      }
    };

    Vue.directive('loading', {
      bind: function(el, binding) {
        const mask = new Mask({
          el: document.createElement('div'),
          data: {
            text: el.getAttribute('element-loading-text'),
            fullscreen: !!binding.modifiers.fullscreen
          }
        });
        el.instance = mask;
        el.mask = mask.$el;
        el.maskStyle = {};

        toggleLoading(el, binding);
      },

      update: function(el, binding) {
        el.instance.setText(el.getAttribute('element-loading-text'));
        if (binding.oldValue !== binding.value) {
          toggleLoading(el, binding);
        }
      },

      unbind: function(el) {
        if (el.domInserted) {
          /* if (binding.modifiers.fullscreen || binding.modifiers.body) {
            document.body.removeChild(el.mask);
          } else { */
          el.mask &&
            el.mask.parentNode &&
            el.mask.parentNode.removeChild(el.mask);
          // }
        }
        el.instance && el.instance.$destroy();
      }
    });
  }
};

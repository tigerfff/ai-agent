import Popper from 'hui/src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';
import { addClass, removeClass, on, off } from 'hui/src/utils/dom';
import Vue from 'vue';

export default {
  name: 'ElTooltip',

  mixins: [Popper],

  props: {
    openDelay: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    manual: {
      type: Boolean,
      default: null
    },
    effect: {
      type: String,
      default: 'light'
    },
    popperClass: {
      type: String,
      default: null
    },
    content: {
      type: String,
      default: null
    },
    visibleArrow: {
      default: true
    },
    transition: {
      type: String,
      default: 'el-fade-in-linear'
    },
    popperOptions: {
      default() {
        return {
          boundariesPadding: 10,
          gpuAcceleration: false
        };
      }
    },
    enterable: {
      type: Boolean,
      default: false
    },
    debounceClosable: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      focusing: false
    };
  },

  watch: {
    disabled(val) {
      if (!val) return;
      this.showPopper = false;
    },
    focusing(val) {
      if (val) {
        addClass(this.referenceElm, 'focusing');
      } else {
        removeClass(this.referenceElm, 'focusing');
      }
    }
  },

  beforeCreate() {
    if (this.$isServer) return;

    this.popperVM = new Vue({
      data: { node: '' },
      render() {
        return this.node;
      }
    }).$mount();

    this.debounceClose = debounce(200, () => this.handleClosePopper());
  },

  render() {
    if (this.popperVM) {
      this.popperVM.node = (
        <transition name={this.transition} onAfterLeave={this.doDestroy}>
          <div
            onMouseleave={() => {
              this.setExpectedState(false);
              this.debounceClosable
                ? this.debounceClose()
                : this.handleClosePopper();
              // this.hide();
            }}
            onMouseenter={() => {
              this.setExpectedState(true);
            }}
            ref='popper'
            v-show={!this.disabled && this.showPopper}
            class={[
              'el-tooltip__popper',
              'is-' + this.effect,
              this.popperClass
            ]}
          >
            {this.$slots.content || this.content}
          </div>
        </transition>
      );
    }

    if (!this.$slots.default || !this.$slots.default.length) {
      return this.$slots.default;
    }

    this.firstElement = this.getFirstElement();
    if (!this.firstElement) return null;

    const data = (this.firstElement.data = this.firstElement.data || {});
    data.staticClass = this.addTooltipClass(data.staticClass);

    return this.firstElement;
  },

  mounted() {
    this.referenceElm = this.$el;
    if (!this.firstElement) return this.firstElement;

    this.referenceElm = this.$el;
    if (this.$el.nodeType === 1) {
      this.$el.setAttribute('aria-describedby', this.tooltipId);
      this.$el.setAttribute('tabindex', this.tabindex);
      on(this.referenceElm, 'mouseenter', this.show);
      on(this.referenceElm, 'mouseleave', this.hide);
      on(this.referenceElm, 'focus', () => {
        if (!this.$slots.default || !this.$slots.default.length) {
          this.handleFocus();
          return;
        }
        const instance = this.$slots.default[0].componentInstance;
        if (instance && instance.focus) {
          instance.focus();
        } else {
          this.handleFocus();
        }
      });
      on(this.referenceElm, 'blur', this.handleBlur);
      on(this.referenceElm, 'click', this.removeFocusing);
    }
    // fix issue https://github.com/ElemeFE/element/issues/14424
    if (this.value && this.popperVM) {
      this.popperVM.$nextTick(() => {
        if (this.value) {
          this.updatePopper();
        }
      });
    }
  },

  destroyed() {
    const reference = this.referenceElm;
    if (reference.nodeType === 1) {
      off(reference, 'mouseenter', this.show);
      off(reference, 'mouseleave', this.hide);
      off(reference, 'focus', this.handleFocus);
      off(reference, 'blur', this.handleBlur);
      off(reference, 'click', this.removeFocusing);
    }
  },

  methods: {
    show() {
      this.setExpectedState(true);
      this.handleShowPopper();
    },

    hide() {
      this.setExpectedState(false);
      this.debounceClosable ? this.debounceClose() : this.handleClosePopper();
    },

    handleFocus() {
      this.focusing = true;
      this.show();
    },

    handleBlur() {
      this.focusing = false;
      this.hide();
    },

    removeFocusing() {
      this.focusing = false;
    },

    addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip';
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '');
      }
    },

    concatClass(a, b) {
      if (a && a.indexOf(b) > -1) return a;
      return a ? (b ? a + ' ' + b : a) : b || '';
    },

    handleShowPopper() {
      if (!this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showPopper = true;
      }, this.openDelay);
    },

    handleClosePopper() {
      if ((this.enterable && this.expectedState) || this.manual) return;
      clearTimeout(this.timeout);
      this.showPopper = false;
    },

    setExpectedState(expectedState) {
      this.expectedState = expectedState;
    },

    getFirstElement() {
      const slots = this.$slots.default;
      if (!Array.isArray(slots)) return null;
      let element = null;
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] && slots[index].tag) {
          element = slots[index];
        }
      }
      return element;
    }
  }
};

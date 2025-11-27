<template>
  <span class="el-popover-wrap">
    <transition :name="transition" @after-leave="doDestroy">
      <div
        v-show="!disabled && showPopper"
        ref="popper"
        :class="[popperClass]"
        :style="popoverStyle"
        class="el-popover"
      >
        <div v-if="title" class="el-popover__title" v-text="title" />
        <!-- <span v-if="showHtml" v-html="content"></span>
        <span v-else> -->
        <slot v-if="showContent">{{ content }}</slot>
        <!-- </span> -->
      </div>
    </transition>
    <slot name="reference" />
  </span>
</template>

<script>
import Popper from 'hui/src/utils/vue-popper';
import { on, off } from 'hui/src/utils/dom';

export default {
  name: 'ElPopover',

  mixins: [Popper],

  props: {
    trigger: {
      type: String,
      default: 'click',
      validator: value =>
        ['click', 'focus', 'hover', 'manual'].indexOf(value) > -1
    },
    contentDelay: {
      type: Number,
      default: 0
    },
    openDelay: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: null
    },
    reference: {
      type: null,
      default: null
    },
    popperClass: {
      type: String,
      default: null
    },
    width: {
      type: null,
      default: null
    },
    maxWidth: {
      type: null,
      default: null
    }, // 最大宽度
    showHtml: {
      // 是否直接显示HTML
      type: Boolean,
      default: false
    },
    visibleArrow: {
      type: Boolean,
      default: true
    },
    transition: {
      type: String,
      default: 'fade-in-linear'
    },
    offsetPlacement: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      showContent: true
    };
  },

  computed: {
    popoverStyle() {
      const ret = {};
      ret.width = (this.width + 'px').replace(/pxpx/, 'px');
      ret.maxWidth = (this.maxWidth + 'px').replace(/pxpx/, 'px');
      const gutter = 10; // 控件与元素间默认间距
      if (this.placement.indexOf('top') !== -1) {
        ret.marginBottom = this.offsetPlacement + gutter + 'px';
      } else if (this.placement.indexOf('bottom') !== -1) {
        ret.marginTop = this.offsetPlacement + gutter + 'px';
      } else if (this.placement.indexOf('left') !== -1) {
        ret.marginRight = this.offsetPlacement + gutter + 'px';
      } else if (this.placement.indexOf('right') !== -1) {
        ret.marginLeft = this.offsetPlacement + gutter + 'px';
      }
      return ret;
    }
  },

  watch: {
    showPopper(newVal) {
      newVal ? this.$emit('show') : this.$emit('hide');
    }
  },

  created() {
    if (this.contentDelay) this.showContent = false;
    setTimeout(() => {
      this.showContent = true;
    }, this.contentDelay);
  },

  mounted() {
    let reference = this.reference || this.$refs.reference;
    const popper = this.popper || this.$refs.popper;

    if (!reference && this.$slots.reference && this.$slots.reference[0]) {
      reference = this.referenceElm = this.$slots.reference[0].elm;
    }
    if (this.trigger === 'click') {
      on(reference, 'click', this.doToggle);
      on(document, 'click', this.handleDocumentClick);
    } else if (this.trigger === 'hover') {
      on(reference, 'mouseenter', this.handleMouseEnter);
      on(popper, 'mouseenter', this.handleMouseEnter);
      on(reference, 'mouseleave', this.handleMouseLeave);
      on(popper, 'mouseleave', this.handleMouseLeave);
    } else if (this.trigger === 'focus') {
      let found = false;

      if ([].slice.call(reference.children).length) {
        const children = reference.childNodes;
        const len = children.length;
        for (let i = 0; i < len; i++) {
          if (
            children[i].nodeName === 'INPUT' ||
            children[i].nodeName === 'TEXTAREA'
          ) {
            on(children[i], 'focus', this.doShow);
            on(children[i], 'blur', this.doClose);
            found = true;
            break;
          }
        }
      }
      if (found) return;
      if (reference.nodeName === 'INPUT' || reference.nodeName === 'TEXTAREA') {
        on(reference, 'focus', this.doShow);
        on(reference, 'blur', this.doClose);
      } else {
        on(reference, 'mousedown', this.doShow);
        on(reference, 'mouseup', this.doClose);
      }
    }
  },

  destroyed() {
    const reference = this.reference;

    off(reference, 'click', this.doToggle);
    off(reference, 'mouseup', this.doClose);
    off(reference, 'mousedown', this.doShow);
    off(reference, 'focus', this.doShow);
    off(reference, 'blur', this.doClose);
    off(reference, 'mouseleave', this.handleMouseLeave);
    off(reference, 'mouseenter', this.handleMouseEnter);
    off(document, 'click', this.handleDocumentClick);
  },

  methods: {
    doToggle() {
      this.showPopper = !this.showPopper;
    },
    doShow() {
      this.showPopper = true;
    },
    doClose() {
      this.showPopper = false;
    },
    handleMouseEnter() {
      clearTimeout(this._timer);
      if (this.openDelay) {
        this._timer = setTimeout(() => {
          this.showPopper = true;
        }, this.openDelay);
      } else {
        this.showPopper = true;
      }
    },
    handleMouseLeave() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.showPopper = false;
      }, 200);
    },
    handleDocumentClick(e) {
      let reference = this.reference || this.$refs.reference;
      const popper = this.popper || this.$refs.popper;

      if (!reference && this.$slots.reference && this.$slots.reference[0]) {
        reference = this.referenceElm = this.$slots.reference[0].elm;
      }
      if (
        !this.$el ||
        !reference ||
        this.$el.contains(e.target) ||
        reference.contains(e.target) ||
        !popper ||
        popper.contains(e.target)
      ) {
        return;
      }
      this.showPopper = false;
    }
  }
};
</script>

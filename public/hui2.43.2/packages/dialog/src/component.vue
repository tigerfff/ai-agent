<template>
  <transition
    name="dialog-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      v-show="visible"
      ref="dialog"
      class="el-dialog__wrapper"
      @click.self="handleWrapperClick"
    >
      <div :class="[sizeClass, customClass]" :style="style" class="el-dialog">
        <div class="el-dialog__header">
          <slot name="title">
            <span class="el-dialog__title">{{ title }}</span>
          </slot>
          <button
            v-if="showClose"
            type="button"
            class="el-dialog__headerbtn"
            aria-label="Close"
            @click="handleClose"
          >
            <i class="el-dialog__close el-icon h-icon-close" />
          </button>
        </div>
        <div v-if="rendered" class="el-dialog__body">
          <!-- 只有指定了高度才显示滚动条 -->
          <el-scrollbar
            v-if="areaIsArray && !noScrollbar"
            ref="scrollbar"
            wrap-class="el-dialog-scrollbar__wrap"
          >
            <div class="el-dialog__body-wrapper">
              <slot />
            </div>
          </el-scrollbar>
          <div v-else class="el-dialog__body-wrapper">
            <slot />
          </div>
        </div>
        <div v-if="$slots.footer" class="el-dialog__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from 'hui/src/utils/popup';
import emitter from 'hui/src/mixins/emitter';
import ElScrollbar from 'hui/packages/scrollbar';
import vDrag from 'hui/src/utils/drag';
export default {
  name: 'ElDialog',
  components: { ElScrollbar },

  mixins: [Popup, emitter],

  props: {
    title: {
      type: String,
      default: ''
    },

    modal: {
      type: Boolean,
      default: true
    },

    modalAppendToBody: {
      type: Boolean,
      default: true
    },
    /**
     * 弹窗嵌套时需传入参数
     * add by yinzhixing  2018-03-09
     */
    appendToBody: {
      type: Boolean,
      default: true
    },

    closeOnClickModal: {
      type: Boolean,
      default: false
    },

    closeOnPressEscape: {
      type: Boolean,
      default: false
    },

    showClose: {
      type: Boolean,
      default: true
    },

    size: {
      type: String,
      default: 'small'
    },

    customClass: {
      type: String,
      default: ''
    },

    top: {
      type: String,
      default: '15%'
    },

    draggable: {
      type: Boolean,
      default: false
    },
    /**
     * 传入数组则表示指定宽高，传入一个数值则表示只指定宽度,
     * 且传入了该参数则自动忽略size
     * add by zhangxiaogang  2017-09-28
     */
    area: {
      type: [Array, Number],
      default: null
    },

    noScrollbar: {
      type: Boolean,
      default: false
    },

    beforeClose: {
      type: Function,
      default: null
    },

    destroyOnClose: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      closed: false,
      rendered: false
    };
  },

  computed: {
    sizeClass() {
      return this.area ? '' : `el-dialog--${this.size}`;
    },
    areaIsArray() {
      return Array.isArray(this.area);
    },
    style() {
      const { area, areaIsArray } = this;
      let { top } = this;
      const styleArr = [];
      if (top === 'middle') {
        top = '50%';
      }
      styleArr.push(this.size === 'full' ? '' : `top: ${top}`);
      if (areaIsArray) {
        if (area.length === 2) {
          styleArr.push(`width: ${area[0]}px;height: ${area[1]}px;`);
          styleArr.push(`margin-left: ${-area[0] / 2}px`);
        } else {
          throw new Error(
            'The area parameter passed to the dialog component must be 2! If it is an array.'
          );
        }
      } else if (area) {
        styleArr.push(`width: ${area}px`);
        styleArr.push(`margin-left: ${-area / 2}px`);
      } else {
        switch (this.size) {
          case 'tiny':
            styleArr.push('margin-left: -15%');
            break;
          case 'small':
            styleArr.push('margin-left: -25%');
            break;
          case 'large':
            styleArr.push('margin-left: -45%');
            break;
          case 'full':
            styleArr.push('margin-left: -50%');
            break;
        }
      }
      return styleArr.join(';');
    }
  },

  watch: {
    visible(val) {
      this.$emit('update:visible', val);
      if (val) {
        this.closed = false;
        this.$emit('open');
        this.rendered = true;
        this.$el.addEventListener('scroll', this.updatePopper);
        window.addEventListener('resize', this.setStyle);
        this.$nextTick(() => {
          // 替换之前hui的打开dialog调整scrollTop的方法，调整为修改自定义滚动条 xx
          if (this.$refs.scrollbar) this.$refs.scrollbar.setScroll(0, 0);
          // this.$refs.dialog.scrollTop = 0;
          this.setStyle();
        });
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
      } else {
        this.$el.removeEventListener('scroll', this.updatePopper);
        window.removeEventListener('resize', this.setStyle);
        if (!this.closed) this.$emit('close');
        if (this.destroyOnClose) this.rendered = false;
      }
    }
  },

  mounted() {
    if (this.draggable) {
      vDrag.bind(this.$refs.dialog);
    }

    if (this.visible) {
      this.rendered = true;
      this.open();
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
      this.$nextTick(() => {
        this.setStyle();
      });
    }
  },
  beforeDestroy() {
    if (this.draggable) {
      vDrag.unbind(this.$refs.dialog); // 取消事件
    }
  },
  destroyed() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },

  methods: {
    afterLeave() {
      this.$emit('closed');
      if (this.destroyOnClose) this.rendered = false;
    },
    afterEnter() {
      this.$emit('opened');
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return;
      this.handleClose();
    },
    handleClose() {
      if (typeof this.beforeClose === 'function') {
        this.beforeClose(this.hide);
      } else {
        this.hide();
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit('update:visible', false);
        this.$emit('visible-change', false);
        this.$emit('close');
        this.closed = true;
      }
    },
    updatePopper() {
      this.broadcast('ElSelectDropdown', 'updatePopper');
      this.broadcast('ElDropdownMenu', 'updatePopper');
    },
    setStyle() {
      const elDialog = this.$el.querySelector('.el-dialog');
      const h = Number(
        window
          .getComputedStyle(elDialog)
          .getPropertyValue('height')
          .replace('px', '')
      );
      const hw = Number(
        window
          .getComputedStyle(this.$el)
          .getPropertyValue('height')
          .replace('px', '')
      );
      if (h) {
        if (this.top === 'middle') {
          if (hw < h) {
            // 56px 由 dialog.scss margin-bottom 得到
            elDialog.style.marginTop = `${-h / 2 + (h - hw) / 2 + 56}px`;
          } else {
            elDialog.style.marginTop = `${-h / 2}px`;
          }
        }
        if (this.areaIsArray) {
          // 设置内容区高度
          const dialogBody = this.$el.querySelector('.el-dialog__body');
          let dialogFooterLength = 56;
          if (!this.$el.querySelector('.el-dialog__footer')) {
            dialogFooterLength = 0;
          }
          dialogBody.style.cssText = `height: ${h -
            36 -
            dialogFooterLength}px;box-sizing: border-box`;
        }
      }
    }
  }
};
</script>

<template>
  <el-popover
    ref="popoverInput"
    :content="tips"
    :max-width="tipsMaxWidth"
    :placement="tipsPlacement"
    :show-html="true"
    :offset-placement="tipsOffset"
    :value="tipsVisible"
    effect="effect"
    trigger="manual"
    popper-class="
      el-popover__for-input el-popover__for-input-form
    "
  >
    <div
      slot="reference"
      :style="styleObj"
      :class="{
        'is-focus': focused,
        'is-disabled': disabled
      }"
      class="h-ip-input"
    >
      <!-- 给ip-input添加提示功能 -->
      <el-input
        v-for="i in 4"
        :key="i"
        :ref="'input_' + i"
        v-model="ipArr[i - 1]"
        :maxlength="3"
        :disabled="disabled"
        :style="{ width: itemWidth }"
        class="h-ip-input__verse"
        @change="updateValue($event, i)"
        @focus="handleFocus"
        @blur="e => handleBlur(e, i)"
        @keyup.native="onInputKeyup($event, i)"
        @paste.native.prevent="onPaste($event, i)"
      />
    </div>
  </el-popover>
</template>
<script>
// 获取当前输入框的焦点位置 by liumeng6
function getRange(el) {
  const ret = {};
  if (el.setSelectionRange) {
    ret.begin = el.selectionStart;
    ret.end = el.selectionEnd;
    ret.result = el.value.substring(ret.begin, ret.end);
  }
  el.focus();
  return ret;
}

export default {
  name: 'HIpInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '100%'
    },
    itemWidth: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 提示信息，设置了tips才能显示popover
    tips: {
      type: String,
      default: null
    },
    // popover的最大宽度
    tipsMaxWidth: {
      type: [String, Number],
      default: null
    },
    // popover出现的位置
    tipsPlacement: {
      type: String,
      default: 'top'
    },
    // 出现位置的偏移量
    tipsOffset: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      ipArr: (this.value || '').split('.'),
      tipsVisible: false,
      focused: false
    };
  },
  computed: {
    styleObj() {
      return {
        width: this.width
      };
    }
  },
  watch: {
    value(val) {
      this.ipArr = val.split('.');
    }
  },
  methods: {
    updateValue(val, index) {
      this.$nextTick(() => {
        if (/^\D*$/.test(val)) {
          // 输入的内容都是非数字时，输入框置空
          val = '';
        } else {
          if (!/^\d*$/.test(val)) {
            // 去除非数字的字符
            val = parseInt(val.replace(/[^\d]/g, ''));
          } else {
            // 超过255默认显示255
            val = parseInt(val) > 255 ? 255 : parseInt(val);
          }
          // 当不处于第四个输入框，且当前输入框满三位时，自动获取下一个焦点
          if (index < 4 && `${val}`.length >= 3) {
            const inputEl = this.$el.getElementsByTagName('input')[index];
            this._setCursorPosition(inputEl, 0);
          }
        }
        this.ipArr.splice(index - 1, 1, val);

        // 如果ip都为空，则返回空字符串，如果ip不为空，则返回ip字符串
        this.$emit(
          'input',
          this.ipArr.every(ip => ip === '') ? '' : this.ipArr.join('.')
        );
      });
    },
    /**
     * @author liumeng6
     * @date 2017-12-11 15:50:48
     * @desc input按键监听
     */
    onInputKeyup(event, index) {
      const keyCode = event.keyCode || event.which;
      const value = event.target.value;
      const arrIndex = index - 1; // 值在数组中的顺序 即从0开始
      const ip = this.ipArr[arrIndex];
      // 处理键盘监听，8 为退格键，37 为left箭头，39 为right箭头，110 为数字键盘上的小数点，190为控制键上的小数点，229为中文数字键盘上小数点
      if (keyCode === 8 || keyCode === 37) {
        if (
          (value.length === 0 || getRange(event.target).end === 0) &&
          arrIndex > 0
        ) {
          const inputEl = this.$el.getElementsByTagName('input')[arrIndex - 1];
          this._setCursorPosition(inputEl, inputEl.value.length, event);
        }
      } else if (keyCode === 39) {
        // 按下右箭头，要光标在最后的时候才聚焦下一个
        if (getRange(event.target).end !== value.length) return;
        if (arrIndex < 3 && ip !== undefined) {
          const inputEl = this.$el.getElementsByTagName('input')[arrIndex + 1];
          this._setCursorPosition(inputEl, 0, event);
        }
      } else if (
        keyCode === 110 ||
        keyCode === 190 ||
        (keyCode === 229 &&
          (event.code === 'NumpadDecimal' || event.code === 'Period'))
      ) {
        if (!value.length) return;
        // 输入小数点或数字键盘上的句号能跳转
        if (arrIndex < 3 && ip !== undefined) {
          const inputEl = this.$el.getElementsByTagName('input')[arrIndex + 1];
          this._setCursorPosition(inputEl, 0, event);
        }
      }
    },

    /**
     * @desc 设置输入框光标位置
     * @author chenguanbin
     * @param {Document} inputEl 设置光标的IP框
     * @param {Number} index 光标位置
     */
    _setCursorPosition(inputEl, index, event) {
      inputEl.select();
      if (inputEl.setSelectionRange) inputEl.setSelectionRange(index, 10);
      // 解决缺陷：IE浏览器下一定概率出现，IP输入框按退格键，当前一位是3位数时，无法退回到上一个输入框的问题
      // 原因：IE下先执行了键盘的退格事件，再执行前一个输入框的focus，这样会触发前一个输入框的change事件，导致焦点重新回到原输入框。（正确事件顺序：focus - 退格 - change）
      // 解决：focus事件后阻止后续事件的执行，这样就不会执行键盘的退格事件和输入框的change事件
      event && event.preventDefault();
    },

    /**
     * @author liumeng6
     * @date 2017-12-11 15:50:17
     * @desc ip粘贴事件
     */
    onPaste(event, index) {
      const arrayIndex = index - 1;
      // `ie`和`chrome`兼容
      const pasteText = event.clipboardData
        ? event.clipboardData.getData('text/plain').trim()
        : window.clipboardData.getData('text').trim();
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(pasteText)) {
        const segments = pasteText.split('.');
        segments.forEach((segment, i) => {
          const value = Number(segment);
          if (
            arrayIndex + i < 4 &&
            !isNaN(value) &&
            value >= 0 &&
            value <= 255
          ) {
            this.ipArr.splice(arrayIndex + i, 1, value);
            this.$emit('input', this.ipArr.join('.'));
          }
        });
        this.$emit(
          'input',
          this.ipArr.every(ip => ip === '') ? '' : this.ipArr.join('.')
        );
      }
    },

    /**
     * @author liumeng6
     * @date 2018-09-05 10:45:33
     * @desc 处理焦点事件
     */
    handleFocus() {
      this.focused = true;
      if (this.tips) {
        this.tipsVisible = true;
      }
    },

    /**
     * @author liumeng6
     * @date 2018-09-05 11:10:06
     * @desc 处理失焦事件
     */
    handleBlur(e, i) {
      this.focused = false;
      if (this.tips) {
        this.tipsVisible = false;
      }
      this.$emit('blur', e, i);
    }
  }
};
</script>

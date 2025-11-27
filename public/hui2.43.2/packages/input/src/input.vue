<template>
  <div
    ref="wrapper"
    :class="[
      type === 'textarea' ? 'el-textarea' : 'el-input',
      kind ? 'el-input--' + kind : '',
      size ? 'el-input--' + size : '',
      {
        'is-disabled': disabled,
        'is-count': count,
        'el-input-group': $slots.prepend || $slots.append,
        'el-input-group--append': $slots.append,
        'el-input-group--prepend': $slots.prepend,
        'el-input--prefix': $slots.prefix || prefixIcon,
        'el-input--suffix': $slots.suffix || suffixIcon,
        'is-hover': count && isHover,
        'is-focus': count && isFocus
      }
    ]"
  >
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div v-if="$slots.prepend" class="el-input-group__prepend">
        <slot name="prepend" />
      </div>
      <!-- input 图标 -->
      <slot name="icon">
        <i
          v-if="icon"
          :class="[
            icon,
            onIconClick || onMousedownClick || onMouseupClick
              ? 'is-clickable'
              : ''
          ]"
          :style="suffixOffset"
          class="el-input__icon"
          @click="handleIconClick"
          @mousedown="handleMousedownClick"
          @mouseup="handleMouseupClick"
        />
      </slot>
      <i
        v-if="clearable && value && (String(value).length || select)"
        :style="{
          right: $slots.suffix || suffixIcon ? 28 + 'px' : 4 + 'px',
          transform: suffixOffset ? suffixOffset.transform : 0,
          zIndex: 1
        }"
        class="el-input__icon h-icon-close_f is-clickable"
        @click="handleClearClick"
      />
      <template v-if="tips">
        <!-- 给input添加提示功能 -->
        <el-popover
          ref="popoverInput"
          :content="tips"
          :max-width="tipsMaxWidth"
          :placement="tipsPlacement"
          :trigger="tipsTrigger"
          :disabled="tipsDisabled"
          :show-html="true"
          :offset-placement="tipsOffset"
          :popper-class="
            `el-popover__for-input ${tipsClass} el-popover__for-input-form`
          "
          effect="light"
        >
          <input
            ref="input"
            slot="reference"
            v-bind="[$props, $attrs]"
            :autocomplete="autoComplete"
            :value="nativeInputValue"
            :style="inputStyle"
            class="el-input__inner"
            @input="debouncedOnInputChange"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </el-popover>
      </template>
      <template v-else>
        <input
          ref="input"
          v-bind="[$props, $attrs]"
          :autocomplete="autoComplete"
          :value="nativeInputValue"
          :style="inputStyle"
          class="el-input__inner"
          @input="debouncedOnInputChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </template>
      <!-- 前置内容 -->
      <span
        v-if="$slots.prefix || prefixIcon"
        ref="prefix"
        :style="prefixOffset"
        class="el-input__prefix"
      >
        <slot name="prefix" />
        <i
          v-if="prefixIcon"
          :class="prefixIcon"
          class="el-input__icon"
          @click="handleIconClick"
        />
      </span>
      <!-- 后置内容 -->
      <span
        v-if="$slots.suffix || suffixIcon"
        ref="suffix"
        :style="suffixOffset"
        class="el-input__suffix"
      >
        <span class="el-input__suffix-inner">
          <template>
            <slot name="suffix" />
            <i
              v-if="suffixIcon"
              :class="suffixIcon"
              class="el-input__icon"
              @click="handleIconClick"
            />
          </template>
        </span>
      </span>
      <i
        v-if="validating"
        class="el-input__icon el-validate__icon el-icon-restart"
      />
      <!-- 后置元素 -->
      <div v-if="$slots.append" class="el-input-group__append">
        <slot name="append" />
      </div>
    </template>
    <template v-else>
      <template v-if="tips">
        <!-- 给input添加提示功能 -->
        <el-popover
          ref="popoverTextarea"
          :content="tips"
          :max-width="tipsMaxWidth"
          :placement="tipsPlacement"
          :trigger="tipsTrigger"
          :disabled="tipsDisabled"
          :show-html="true"
          :offset-placement="tipsOffset"
          :popper-class="
            `el-popover__for-input ${tipsClass} el-popover__for-input-form`
          "
          effect="light"
        >
          <textarea
            ref="textarea"
            slot="reference"
            v-bind="[$props, $attrs]"
            :value="nativeInputValue"
            :style="textareaStyle"
            class="el-textarea__inner"
            @input="debouncedOnInputChange"
            @mouseenter="handleMouseenter"
            @mouseout="handleMouseout"
            @focus="handleFocus"
            @blur="handleBlur"
          />
        </el-popover>
        <span v-if="count" class="el-textarea__count" v-text="total" />
      </template>
      <template v-else>
        <textarea
          ref="textarea"
          v-bind="[$props, $attrs]"
          :value="nativeInputValue"
          :style="textareaStyle"
          class="el-textarea__inner"
          @mouseenter="handleMouseenter"
          @mouseout="handleMouseout"
          @input="debouncedOnInputChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <span v-if="count" class="el-textarea__count" v-text="total" />
      </template>
    </template>
  </div>
</template>
<script>
import emitter from 'hui/src/mixins/emitter';
import calcTextareaHeight from './calcTextareaHeight';
import merge from 'hui/src/utils/merge';
import ElPopover from 'hui/packages/popover';
import debounce from 'throttle-debounce/debounce';

export default {
  name: 'ElInput',

  components: {
    ElPopover
  },

  mixins: [emitter],

  inheritAttrs: false, // 只有input/textrear支持原生属性

  componentName: 'ElInput',

  props: {
    value: {
      type: [String, Number],
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    kind: {
      type: String,
      default: null
    },
    resize: {
      type: String,
      default: null
    },
    readonly: {
      type: Boolean,
      default: null
    },
    autofocus: {
      type: Boolean,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    unselectable: {
      type: String,
      default: null
    },
    clearable: {
      type: Boolean,
      default: null
    },
    select: {
      type: Boolean,
      default: null
    },
    suffixIcon: {
      type: String,
      default: null
    },
    prefixIcon: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'text'
    },
    name: {
      type: String,
      default: null
    },
    count: {
      type: Number,
      default: null
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    rows: {
      type: Number,
      default: 2
    },
    autoComplete: {
      type: String,
      default: 'off'
    },
    form: {
      type: String,
      default: null
    },
    step: {
      type: null,
      default: null
    },
    validateEvent: {
      type: Boolean,
      default: true
    },
    onIconClick: {
      type: Function,
      default: null
    },
    onMousedownClick: {
      type: Function,
      default: null
    },
    onMouseupClick: {
      type: Function,
      default: null
    },
    clearIconClick: {
      type: Function,
      default: null
    },
    // 提示信息，设置了tips才能显示popover
    tips: {
      type: String,
      default: null
    },
    // popover的最大宽度
    tipsMaxWidth: {
      type: null,
      default: 480 // 交互规范表单项tip最大宽度480，超出换行
    },
    // popover出现的位置
    tipsPlacement: {
      type: String,
      default: 'top-start'
    },
    // 出现位置的偏移量
    tipsOffset: {
      type: Number,
      default: 0
    },
    // popover触发方式
    tipsTrigger: {
      type: String,
      default: 'focus'
    },
    // popover触发方式
    tipsClass: {
      type: String,
      default: ''
    },
    dataPicker: {
      type: Boolean,
      default: false
    },
    debounce: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      textareaRect: {},
      textareaCalcStyle: {},
      prefixOffset: null,
      suffixOffset: null,
      tipsDisabled: true,
      ie: {}, // ie下的时间定时器
      ie9: false, // 判断是否是ie9
      isFormItem: false, // 是否为表单元素
      isFocus: false,
      isHover: false,
      prefixWidth: null,
      suffixWidth: null
    };
  },

  computed: {
    inputStyle() {
      return {
        paddingLeft: this.prefixWidth ? `${this.prefixWidth + 8}px` : null,
        paddingRight: this.suffixWidth
          ? `${this.suffixWidth + (this.clearable ? 28 : 8)}px`
          : this.clearable
          ? '28px'
          : null
      };
    },
    validating() {
      return this.$parent.validateState === 'validating';
    },
    textareaStyle() {
      return merge({}, this.textareaCalcStyle, {
        resize: this.resize === '' || this.autosize ? 'both' : this.resize
      });
    },
    isGroup() {
      return this.$slots.prepend || this.$slots.append;
    },
    valueLength() {
      if (this.value) {
        return this.value.length;
      }
      return 0;
    },
    nativeInputValue() {
      return this.value === null || this.value === undefined ? '' : this.value;
    },
    total() {
      const num = this.count - this.valueLength;
      if (num < 0) {
        return 0;
      }
      return this.count - this.valueLength || 0;
    }
  },

  watch: {
    value(val) {
      this.$nextTick(this.resizeTextarea);
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.change', [val]);
      }
    }
  },

  created() {
    this.$on('inputSelect', this.inputSelect);
    this.debouncedOnInputChange =
      this.debounce > 0
        ? debounce(this.debounce, e => {
            this.handleInput(e);
          })
        : this.handleInput;
  },

  mounted() {
    if (this.type === 'textarea') {
      this.textareaRect = this.$refs.wrapper
        ? this.$refs.wrapper.getBoundingClientRect()
        : {};
      this.resizeTextarea();
    }
    if (this.$refs.prefix) {
      this.prefixWidth = this.$refs.prefix.getBoundingClientRect().width;
    }
    if (this.$refs.suffix) {
      this.suffixWidth = this.$refs.suffix.getBoundingClientRect().width;
    }
    if (this.isGroup) {
      this.prefixOffset = this.calcIconOffset('pre');
      this.suffixOffset = this.calcIconOffset('suf');
    }
    // ie9兼容
    if (
      navigator.appName === 'Microsoft Internet Explorer' &&
      navigator.appVersion.split(';')[1].replace(/[ ]/g, '') === 'MSIE9.0' &&
      !this.dataPicker
    ) {
      this.ie9 = true;
    }
    // 影响switch beforeChange 事件 placeholder 可以为空
    // if (this.placeholder === '') {
    //   console.error('input的placeholder属性不能传空');
    // }
    this.isFormItem = !!this.findComponentUpward(this, 'ElFormItem');
  },

  methods: {
    /**
     * @author xuzilong
     * @desc 找到指定的父组件
     */
    findComponentUpward(context, componentName) {
      let parent = context.$parent;
      let name = parent.$options.name;

      while (parent && (!name || [componentName].indexOf(name) < 0)) {
        parent = parent.$parent;
        if (parent) name = parent.$options.name;
      }
      return parent;
    },
    handleBlur(event) {
      this.isFocus = false;
      this.$emit('blur', event);
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.blur', [this.value]);
      }
      if (this.tipsTrigger === 'focus') {
        this.tipsDisabled = true;
      }
      if (this.ie9) {
        clearTimeout(this.ie); // ie9兼容
        // document.removeEventListener('selectionchange', this.handleInput, false);
      }
    },
    inputSelect() {
      // TODO 这里不知道干啥用的，没改，请检查一下这里是否会有问题
      this.$refs.input.select();
    },
    resizeTextarea() {
      if (this.$isServer) return;
      var { autosize, type } = this;
      if (!autosize || type !== 'textarea') return;
      const minRows = autosize.minRows;
      const maxRows = autosize.maxRows;
      const maxWidth = autosize.maxWidth;

      this.textareaCalcStyle = calcTextareaHeight(
        this.$refs.textarea,
        this.textareaRect,
        minRows,
        maxRows,
        maxWidth
      );
    },
    handleMouseenter() {
      this.isHover = true;
    },
    handleMouseout() {
      this.isHover = false;
    },
    handleFocus(event) {
      if (this.readonly) {
        event.preventDefault();
      }

      this.isFocus = true;
      this.$emit('focus', event);
      if (this.tips && this.tipsTrigger === 'focus') {
        this.tipsDisabled = false;
      }
      if (this.ie9) {
        this.ie = setInterval(this.handleInput, 200); // ie9兼容
        // document.addEventListener('selectionchange', this.handleInput, false);
      }
    },
    handleInput(event) {
      const value = event.target.value;

      if (value === this.nativeInputValue) return;
      this.$emit('input', value);
      this.$emit('change', value);
    },
    handleIconClick(event) {
      if (this.onIconClick) {
        this.onIconClick(event);
      }
      this.$emit('click', event);
    },
    handleMousedownClick(event) {
      if (this.onMousedownClick) {
        this.onMousedownClick(event);
      }
    },
    handleMouseupClick(event) {
      if (this.onMouseupClick) {
        this.onMouseupClick(event);
      }
    },
    handleClearClick(event) {
      if (!this.disabled) {
        if (this.clearIconClick) {
          this.clearIconClick(event);
        }
        this.deleteSelected(event);
        this.$emit('delete');
        this.$nextTick(() => {
          this.$refs.input.focus();
        });
      }
    },
    deleteSelected(event) {
      event.stopPropagation();
      this.$emit('input', '');
      this.$emit('clear');
    },
    calcIconOffset(place) {
      const pendantMap = {
        suf: 'append',
        pre: 'prepend'
      };

      const pendant = pendantMap[place];
      if (this.$slots[pendant]) {
        return {
          transform: `translateX(${place === 'suf' ? '-' : ''}${
            this.$el.querySelector(`.el-input-group__${pendant}`).offsetWidth
          }px)`
        };
      }
    }
  }
};
</script>

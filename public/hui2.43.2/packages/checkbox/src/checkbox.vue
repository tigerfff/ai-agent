<template>
  <label
    :id="id"
    :class="[
      border && checkboxSize ? 'el-checkbox--' + checkboxSize : '',
      { 'is-disabled': isDisabled },
      { 'is-bordered': border },
      { 'is-checked': isChecked }
    ]"
    :aria-checked="indeterminate ? 'mixed' : isChecked"
    :aria-disabled="isDisabled"
    class="el-checkbox"
    role="checkbox"
  >
    <span
      :class="{
        'is-disabled': isDisabled,
        'is-checked': isChecked && !indeterminate,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
      class="el-checkbox__input"
      aria-checked="mixed"
    >
      <span class="el-checkbox__inner">
        <input
          v-if="trueLabel || falseLabel"
          v-model="model"
          :name="name"
          :disabled="isDisabled"
          :true-value="trueLabel"
          :false-value="falseLabel"
          class="el-checkbox__original"
          type="checkbox"
          @change="handleChange"
          @focus="focus = true"
          @blur="focus = false"
        />
        <input
          v-else
          v-model="model"
          :disabled="isDisabled"
          :value="label"
          :name="name"
          class="el-checkbox__original"
          type="checkbox"
          @change="handleChange"
          @focus="focus = true"
          @blur="focus = false"
        />
        <h-svg-icon :size="14" :svgs="ctrl_tick" />
      </span>
    </span>
    <span v-if="icon" class="el-checkbox__icon">
      <i :class="icon" />
    </span>
    <span
      v-if="$slots.default || label"
      :title="titleLabel"
      class="el-checkbox__label"
      @mouseover="handleMouseover"
    >
      <slot />
      <template v-if="!$slots.default && showLabel">
        {{ label }}
      </template>
    </span>
  </label>
</template>
<script>
import Emitter from 'hui/src/mixins/emitter';
import hSvgIcon from 'hui/packages/svg-icon';

export default {
  name: 'ElCheckbox',
  components: {
    hSvgIcon
  },

  mixins: [Emitter],

  inject: {
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },

  componentName: 'ElCheckbox',

  props: {
    value: {
      type: [String, Number, Boolean],
      default: undefined
    },
    label: {
      type: [String, Number, Boolean],
      default: undefined
    },
    indeterminate: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: null
    },
    checked: {
      type: Boolean,
      default: null
    },
    name: {
      type: String,
      default: undefined
    },
    trueLabel: {
      type: [String, Number],
      default: undefined
    },
    falseLabel: {
      type: [String, Number],
      default: undefined
    },
    id: {
      type: String,
      default: undefined
    } /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系 */,
    controls: {
      type: String,
      default: undefined
    } /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系 */,
    border: {
      type: Boolean,
      default: null
    },
    size: {
      type: String,
      default: 'medium'
    },
    icon: {
      type: String,
      default: undefined
    },
    showLabel: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      selfModel: false,
      focus: false,
      isLimitExceeded: false,
      titleLabel: '',
      ctrl_tick: `<?xml version="1.0" encoding="UTF-8"?>
        <svg viewBox="5 5 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <!-- Generator: Sketch 54.1 (76490) - https://sketchapp.com -->
            <desc>Created with Sketch.</desc>
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g class="el-checkbox__tick">
                    <g transform="translate(5.000000, 5.000000)">
                        <rect fill-opacity="0" x="0" y="0" width="14" height="14" rx="1" ></rect>
                        <g transform="translate(2.000000, 3.000000)">
                            <path d="M3.8044344,5.5168557 L8.6780673,0.76615083 C8.9540622,0.44048717 9.4314325,0.40937065 9.7443038,0.69665013 C10.0571751,0.98392961 10.0870694,1.4808182 9.8110745,1.80648186 L4.3639727,7.2338586 C4.060806,7.591584 3.5239337,7.5881988 3.2249529,7.2266766 L0.18291667,4.5483022 C-0.08926753,4.2191821 -0.05359216,3.7227069 0.26259985,3.4393939 C0.57879185,3.156081 1.055765,3.193215 1.3279492,3.5223351 L3.8044344,5.5168557 Z"></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>`
    };
  },

  computed: {
    model: {
      get() {
        return this.isGroup
          ? this.store
          : this.value !== undefined
          ? this.value
          : this.selfModel;
      },

      set(val) {
        if (this.isGroup) {
          this.isLimitExceeded = false;
          this._checkboxGroup.min !== undefined &&
            val.length < this._checkboxGroup.min &&
            (this.isLimitExceeded = true);

          this._checkboxGroup.max !== undefined &&
            val.length > this._checkboxGroup.max &&
            (this.isLimitExceeded = true);

          this.isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);
        } else {
          this.$emit('input', val);
          this.selfModel = val;
        }
      }
    },

    isChecked() {
      if ({}.toString.call(this.model) === '[object Boolean]') {
        return this.model;
      } else if (Array.isArray(this.model)) {
        return this.model.indexOf(this.label) > -1;
      } else if (this.model !== null && this.model !== undefined) {
        return this.model === this.trueLabel;
      }
      return false;
    },

    isGroup() {
      let parent = this.$parent;
      while (parent) {
        if (parent.$options.componentName !== 'ElCheckboxGroup') {
          parent = parent.$parent;
        } else {
          this._checkboxGroup = parent; // eslint-disable-line
          return true;
        }
      }
      return false;
    },

    store() {
      return this._checkboxGroup ? this._checkboxGroup.value : this.value;
    },

    isDisabled() {
      return this.isGroup
        ? this._checkboxGroup.disabled ||
            this.disabled ||
            (this.elForm || {}).disabled ||
            (this._checkboxGroup.value.length === this._checkboxGroup.min &&
              this._checkboxGroup.value.includes(this.label)) ||
            (this._checkboxGroup.value.length === this._checkboxGroup.max &&
              !this._checkboxGroup.value.includes(this.label))
        : this.disabled || (this.elForm || {}).disabled;
    },

    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },

    checkboxSize() {
      const temCheckboxSize =
        this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      return this.isGroup
        ? this._checkboxGroup.checkboxGroupSize || temCheckboxSize
        : temCheckboxSize;
    }
  },

  watch: {
    value(value) {
      this.dispatch('ElFormItem', 'el.form.change', value);
    }
  },

  created() {
    this.checked && this.addToStore();
  },
  mounted() {
    // 为indeterminate元素 添加aria-controls 属性
    if (this.indeterminate) {
      this.$el.setAttribute('aria-controls', this.controls);
    }
  },

  methods: {
    addToStore() {
      if (Array.isArray(this.model) && this.model.indexOf(this.label) === -1) {
        this.model.push(this.label);
      } else {
        this.model = this.trueLabel || true;
      }
    },
    // 鼠标悬停显示Lable
    // 移除过滤条件，个人认为比较多余，就直接做成悬浮展示 xx 2020/5/29
    handleMouseover(e) {
      const t = e.target;
      if (t.tagName === 'SPAN') {
        // if (t.scrollWidth >= t.offsetWidth) {
        this.titleLabel = t.innerText;
        // } else {
        //   this.titleLabel = '';
        // }
      }
    },
    handleChange(ev) {
      if (this.isLimitExceeded) {
        // 如果超出限制，重置下dom状态
        ev.target.checked = !ev.target.checked;
        return;
      }
      let value;
      if (ev.target.checked) {
        value = this.trueLabel === undefined ? true : this.trueLabel;
      } else {
        value = this.falseLabel === undefined ? false : this.falseLabel;
      }

      this.$emit('change', value, ev);
      this.$nextTick(() => {
        if (this.isGroup) {
          this.dispatch('ElCheckboxGroup', 'change', [
            this._checkboxGroup.value
          ]);
        }
      });
    }
  }
};
</script>

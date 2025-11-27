<template>
  <span
    ref="reference"
    v-clickoutside="handleClickoutside"
    :class="[
      {
        'is-opened': menuVisible,
        'is-disabled': disabled
      },
      size ? 'el-cascader--' + size : ''
    ]"
    class="el-cascader"
    @click="handleClick"
    @mouseenter="inputHover = true"
    @mouseleave="inputHover = false"
    @focus="inputHover = true"
    @blur="inputHover = false"
  >
    <el-input
      ref="input"
      v-model="inputValue"
      :readonly="!filterable"
      :placeholder="currentLabels.length ? undefined : placeholder"
      :validate-event="false"
      :size="size"
      :disabled="disabled"
      @change="debouncedInputChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template slot="suffix">
        <i
          v-if="clearable && inputHover && (currentLabels.length || inputValue)"
          key="1"
          class="el-input__icon h-icon-close_f"
          @click="clearValue"
        />
        <i v-else key="2" class="el-input__icon h-icon-angle_down_sm" />
      </template>
    </el-input>
    <span
      v-show="inputValue === ''"
      :title="currentValueTitle"
      class="el-cascader__label"
    >
      <template v-if="showAllLevels">
        <span v-for="(label, index) in currentLabels" :key="index">
          {{ label }}
          <span
            v-if="index < currentLabels.length - 1"
            class="el-cascader__separator"
          >
            /
          </span>
        </span>
      </template>
      <template v-else>
        {{ currentLabels[currentLabels.length - 1] }}
      </template>
    </span>
  </span>
</template>

<script>
import Vue from 'vue';
import ElCascaderMenu from './menu';
import ElInput from 'hui/packages/input';
import Popper from 'hui/src/utils/vue-popper';
import Clickoutside from 'hui/src/utils/clickoutside';
import emitter from 'hui/src/mixins/emitter';
import Locale from 'hui/src/mixins/locale';
import { t } from 'hui/src/locale';
import debounce from 'throttle-debounce/debounce';
// import ElScrollbar from 'hui/packages/scrollbar';

const popperMixin = {
  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    },
    appendToBody: Popper.props.appendToBody,
    offset: Popper.props.offset,
    boundariesPadding: Popper.props.boundariesPadding,
    popperOptions: Popper.props.popperOptions
  },
  methods: Popper.methods,
  data: Popper.data,
  beforeDestroy: Popper.beforeDestroy
};

export default {
  name: 'ElCascader',

  directives: { Clickoutside },

  components: {
    ElInput
    // ElScrollbar
  },

  mixins: [popperMixin, emitter, Locale],

  props: {
    options: {
      type: Array,
      required: true
    },
    props: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'label',
          value: 'value',
          disabled: 'disabled'
        };
      }
    },
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    placeholder: {
      type: String,
      default() {
        return t('el.cascader.placeholder');
      }
    },
    disabled: {
      type: Boolean,
      default: null
    },
    clearable: {
      type: Boolean,
      default: false
    },
    changeOnSelect: {
      type: Boolean,
      default: null
    },
    popperClass: {
      type: String,
      default: null
    },
    noMatch: {
      type: String,
      default() {
        return t('el.cascader.noMatch');
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    check: {
      type: Function,
      default: () => {
        return true;
      }
    },
    expandTrigger: {
      type: String,
      default: 'click'
    },
    filterable: {
      type: Boolean,
      default: null
    },
    size: {
      type: String,
      default: null
    },
    showAllLevels: {
      type: Boolean,
      default: true
    },
    debounce: {
      type: Number,
      default: 300
    },
    beforeFilter: {
      type: Function,
      default: () => () => {}
    }
  },

  data() {
    return {
      currentValue: this.value || [],
      // currentValueTitle: '',
      menu: null,
      debouncedInputChange() {},
      menuVisible: false,
      inputHover: false,
      inputValue: '',
      flatOptions: null
    };
  },

  computed: {
    labelKey() {
      return this.props.label || 'label';
    },
    valueKey() {
      return this.props.value || 'value';
    },
    childrenKey() {
      return this.props.children || 'children';
    },
    currentLabels() {
      let options = this.options;
      const labels = [];
      this.currentValue.forEach(value => {
        const targetOption =
          options &&
          options.filter(option => option[this.valueKey] === value)[0];
        if (targetOption) {
          labels.push(targetOption[this.labelKey]);
          options = targetOption[this.childrenKey];
        }
      });
      return labels;
    },
    currentValueTitle() {
      return this.currentLabels.join('/');
    }
  },

  watch: {
    menuVisible(value) {
      value ? this.showMenu() : this.hideMenu();
    },
    value(value) {
      this.currentValue = value;
    },
    currentValue(value) {
      this.dispatch('ElFormItem', 'el.form.change', [value]);
    },
    options: {
      deep: true,
      handler(value) {
        if (!this.menu) {
          this.initMenu();
        }
        this.flatOptions = this.flattenOptions(this.options);
        this.menu.options = value;
      }
    },
    loading: {
      deep: true,
      handler(value) {
        if (!this.menu) {
          this.initMenu();
        }
        this.menu.loading = value;
      }
    }
  },

  created() {
    this.debouncedInputChange = debounce(this.debounce, value => {
      const before = this.beforeFilter(value);

      if (before && before.then) {
        this.menu.options = [
          {
            __IS__FLAT__OPTIONS: true,
            label: this.t('el.cascader.loading'),
            value: '',
            disabled: true
          }
        ];
        before.then(() => {
          this.$nextTick(() => {
            this.handleInputChange(value);
          });
        });
      } else if (before !== false) {
        this.$nextTick(() => {
          this.handleInputChange(value);
        });
      }
    });
  },

  mounted() {
    this.flatOptions = this.flattenOptions(this.options);
  },

  methods: {
    initMenu() {
      this.menu = new Vue(ElCascaderMenu).$mount();
      this.menu.$scopedSlots = this.$scopedSlots;
      this.menu.options = this.options;
      this.menu.loading = this.loading;
      this.menu.filterable = this.filterable;
      this.menu.inputValue = this.inputValue;
      this.menu.props = this.props;
      this.menu.expandTrigger = this.expandTrigger;
      this.menu.noMatch = this.noMatch;
      this.menu.loadingTitle = this.t('el.cascader.loading');
      this.menu.check = this.check;
      this.menu.changeOnSelect = this.changeOnSelect;
      this.menu.popperClass = this.popperClass;
      this.popperElm = this.menu.$el;
      this.menu.$on('pick', this.handlePick);
      this.menu.$on('activeItemChange', this.handleActiveItemChange);
      this.menu.$on('menuLeave', this.doDestroy);
    },
    showMenu() {
      if (!this.menu) {
        this.initMenu();
      }

      this.menu.value = this.currentValue.slice(0);
      this.menu.visible = true;
      this.menu.options = this.options;
      this.$nextTick(() => {
        this.updatePopper();
        this.menu.inputWidth = this.$refs.input.$el.offsetWidth - 2;
      });
    },
    hideMenu() {
      this.inputValue = '';
      this.menu.visible = false;
    },
    handleActiveItemChange(value, item) {
      this.$nextTick(() => {
        this.updatePopper();
      });
      this.$emit('active-item-change', value, item);
    },
    handlePick(value, children, close = true) {
      this.currentValue = value;
      this.$emit('input', value);
      this.$emit('change', value);
      // hover + change-on-select 情况下，click点击选中后也主动隐藏菜单
      if (
        (close && !(this.changeOnSelect && children)) ||
        (this.expandTrigger === 'hover' && this.changeOnSelect)
      ) {
        this.menuVisible = false;
      } else {
        this.$nextTick(this.updatePopper);
      }
    },
    handleFocus(event) {
      this.$emit('focus', event);
    },
    handleBlur(event) {
      this.$emit('blur', event);
    },
    handleInputChange(value) {
      if (!this.menuVisible) return;
      const flatOptions = this.flatOptions;

      // 搜索内容包含特殊的则屏蔽
      const regStr = String(value).replace(
        /(\^|\(|\)|\[|\]|\$|\*|\+|\.|\?|\\|\{|\}|\|)/g,
        '\\$1'
      );

      if (!value || !regStr) {
        this.menu.options = this.options;
        this.$nextTick(this.updatePopper);
        return;
      }
      let filteredFlatOptions = flatOptions.filter(optionsStack => {
        return optionsStack.some(
          option =>
            !option.disabled &&
            new RegExp(regStr, 'i').test(option[this.labelKey])
        );
      });

      if (filteredFlatOptions.length > 0) {
        filteredFlatOptions = filteredFlatOptions.map(optionStack => {
          return {
            __IS__FLAT__OPTIONS: true,
            value: optionStack.map(item => item[this.valueKey]),
            label: this.renderFilteredOptionLabel(value, optionStack)
          };
        });
      } else {
        filteredFlatOptions = [];
      }
      this.menu.options = filteredFlatOptions;
      this.$nextTick(this.updatePopper);
    },
    renderFilteredOptionLabel(inputValue, optionsStack) {
      return optionsStack.map((option, index) => {
        const label = option[this.labelKey];
        const keywordIndex = label
          .toLowerCase()
          .indexOf(inputValue.toLowerCase());
        const labelPart = label.slice(
          keywordIndex,
          inputValue.length + keywordIndex
        );
        const node =
          keywordIndex > -1 ? this.highlightKeyword(label, labelPart) : label;
        return index === 0 ? node : ['/', node];
      });
    },
    highlightKeyword(label, keyword) {
      const h = this._c;
      return label.split(keyword).map((node, index) =>
        index === 0
          ? node
          : [
              h(
                'span',
                {
                  class: {
                    'el-cascader-menu__item__keyword': true
                  }
                },
                [this._v(keyword)]
              ),
              node
            ]
      );
    },
    flattenOptions(options, ancestor = []) {
      let flatOptions = [];
      options.forEach(option => {
        const optionsStack = ancestor.concat(option);
        if (!option[this.childrenKey]) {
          flatOptions.push(optionsStack);
        } else {
          if (this.changeOnSelect) {
            flatOptions.push(optionsStack);
          }
          flatOptions = flatOptions.concat(
            this.flattenOptions(option[this.childrenKey], optionsStack)
          );
        }
      });
      return flatOptions;
    },
    clearValue(ev) {
      ev.stopPropagation();
      this.inputValue = '';
      this.handlePick([], true);
    },
    handleClickoutside() {
      this.menuVisible = false;
    },
    handleClick() {
      if (this.disabled) return;
      if (this.filterable) {
        this.menuVisible = true;
        this.$refs.input.$refs.input.focus();
        return;
      }
      this.menuVisible = !this.menuVisible;
    }
  }
};
</script>

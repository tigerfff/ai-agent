<template>
  <div
    v-clickoutside="handleClose"
    :class="[kind ? 'el-select--' + kind : '']"
    class="el-select"
  >
    <div
      v-if="multiple"
      ref="tags"
      :class="{
        'el-select__tags--nowrap': multipleNowrap,
        'el-select__tags--filterable-left': multipleNowrap && filterable
      }"
      :style="{ 'max-width': inputWidth - inputWidthMin + 'px' }"
      class="el-select__tags"
      @click.stop="toggleMenu"
    >
      <span v-if="collapseTags && selected.length">
        <el-tag
          :closable="!selected[0].disabled"
          :size="collapseTagSize"
          :title="selected[0].currentLabel"
          :hit="selected[0].hitState"
          max-width="94px"
          type="primary"
          close-transitions
          :class="[
            {
              'el-tag--disabled': disabled
            }
          ]"
          @close="deleteTag($event, selected[0])"
        >
          <span class="el-select__tags-text">
            {{ selected[0].currentLabel }}
          </span>
        </el-tag>
        <el-tag
          v-if="selected.length > 1"
          :closable="false"
          :size="collapseTagSize"
          type="primary"
          close-transitions
        >
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group v-if="!collapseTags" @after-leave="resetInputHeight">
        <el-tag
          v-for="item in selected"
          :key="getValueKey(item)"
          :title="item.currentLabel"
          :closable="!item.disabled"
          :size="collapseTagSize"
          :hit="item.hitState"
          max-width="94px"
          type="primary"
          close-transition
          :class="[
            {
              'el-tag--disabled': disabled
            }
          ]"
          @close="deleteTag($event, item)"
        >
          <span class="el-select__tags-text">{{ item.currentLabel }}</span>
        </el-tag>
      </transition-group>
      <input
        v-if="filterable"
        ref="input"
        v-model="query"
        :class="`is-${size}`"
        :disabled="disabled"
        :debounce="remote ? 300 : 0"
        :style="{
          width: textWidth + 16 + 'px',
          'max-width': inputWidth - inputWidthMin + 'px',
          'flex-grow': 1
        }"
        type="text"
        class="el-select__input"
        @keyup="managePlaceholder"
        @keydown.exact="resetInputState"
        @keydown.down.prevent="navigateOptions('next')"
        @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption"
        @keydown.esc.stop.prevent="visible = false"
        @keydown.delete="deletePrevTag"
      />
      <div v-else style="flex-grow: 1"></div>
    </div>
    <span ref="text" class="el-select__text" v-text="query" />
    <!-- 用来解决input在ie下出现光标的问题 -->
    <div
      v-if="isIE && !multiple && !filterable"
      :icon="iconClass"
      class="el-select__isIE"
      @click="toggleMenu"
      @mouseenter="inputHovering = true"
      @mouseleave="inputHovering = false"
    />
    <el-input
      ref="reference"
      v-model="selectedLabel"
      :title="selectedLabel"
      :placeholder="currentPlaceholder"
      :select="inputClear"
      :name="name"
      :size="size"
      :disabled="disabled"
      :readonly="!filterable || multiple"
      :unselectable="isIE && !multiple && !filterable ? 'on' : 'off'"
      :validate-event="false"
      type="text"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleIconClick"
      @mousedown.native="handleMouseDown"
      @keyup.native="debouncedOnInputChange"
      @input="debouncedOnInputChange"
      @keydown.native.down.prevent="navigateOptions('next')"
      @keydown.native.up.prevent="navigateOptions('prev')"
      @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false"
      @keydown.native.tab="visible = false"
      @paste.native="debouncedOnInputChange"
      @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false"
    >
      <template v-if="$slots.prefix" slot="prefix">
        <slot name="prefix"></slot>
      </template>
      <i
        slot="suffix"
        :class="iconClass"
        class="el-input__icon"
        @click="handleIconClick"
      />
    </el-input>
    <transition
      name="el-zoom-in-top"
      @before-enter="handleMenuEnter"
      @after-enter="afterEnter"
      @after-leave="doDestroy"
    >
      <el-select-menu
        v-show="showDropdown"
        ref="popper"
        :append-to-body="popperAppendToBody"
        :popper-options="popperOptions"
        :placement="placement"
      >
        <el-scrollbar
          v-show="options.length > 0 && !loading"
          ref="scrollbar"
          :class="{
            'is-empty': !allowCreate && filteredOptionsCount === 0
          }"
          always-show
          is-small
          tag="ul"
          wrap-class="el-select-dropdown__wrap"
          view-class="el-select-dropdown__list"
          @on-scrolling-x="onScrollingX"
          @on-scrolling-y="onScrollingY"
        >
          <slot />
          <el-option v-if="showNewOption" :value="query" created />
        </el-scrollbar>
        <p v-if="isShowEmptyText" class="el-select-dropdown__empty">
          {{ emptyText }}
        </p>
      </el-select-menu>
    </transition>
  </div>
</template>

<script type="text/babel">
import Emitter from 'hui/src/mixins/emitter';
import Locale from 'hui/src/mixins/locale';
import ElInput from 'hui/packages/input';
import ElSelectMenu from './select-dropdown.vue';
import ElOption from './option.vue';
import ElTag from 'hui/packages/tag';
import ElScrollbar from 'hui/packages/scrollbar';
import debounce from 'throttle-debounce/debounce';
import Clickoutside from 'hui/src/utils/clickoutside';
import { addClass, removeClass, hasClass } from 'hui/src/utils/dom';
import {
  addResizeListener,
  removeResizeListener
} from 'hui/src/utils/resize-event';
import { t } from 'hui/src/locale';
import scrollIntoView from 'hui/src/utils/scroll-into-view';
import { getValueByPath } from 'hui/src/utils/util';

const sizeMap = {
  large: 42,
  small: 30,
  mini: 22
};

export default {
  name: 'ElSelect',

  components: {
    ElInput,
    ElSelectMenu,
    ElOption,
    ElTag,
    ElScrollbar
  },

  directives: { Clickoutside },
  mixins: [Emitter, Locale],

  componentName: 'ElSelect',

  props: {
    name: { type: String, default: null },
    // eslint-disable-next-line
    value: {
      required: true
    },
    size: {
      type: String,
      default: null
    },
    clearable: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: null
    },
    reserveKeyword: {
      type: Boolean,
      default: null
    },
    clear: {
      type: Boolean,
      default: null
    },
    filterable: {
      type: Boolean,
      default: false
    },
    allowCreate: {
      type: Boolean,
      default: null
    },
    loading: {
      type: Boolean,
      default: null
    },
    popperClass: {
      type: String,
      default: null
    },
    remote: {
      type: Boolean,
      default: null
    },
    loadingText: {
      type: String,
      default: null
    },
    noMatchText: {
      type: String,
      default: null
    },
    kind: {
      type: String,
      default: null
    },
    noDataText: {
      type: String,
      default: null
    },
    remoteMethod: {
      type: Function,
      default: null
    },
    filterMethod: {
      type: Function,
      default: null
    },
    multiple: {
      type: Boolean,
      default: null
    },
    multipleNowrap: {
      type: Boolean,
      default: null
    },
    multipleLimit: {
      type: Number,
      default: 0
    },
    maxWidth: {
      type: Number,
      default: null
    },
    placeholder: {
      type: String,
      default() {
        return t('el.select.placeholder');
      }
    },
    defaultFirstOption: {
      type: Boolean,
      default: null
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    collapseTags: {
      type: Boolean,
      default: null
    },
    popperAppendToBody: {
      type: Boolean,
      default: true
    },
    popperOptions: {
      type: null,
      default() {
        return {
          forceAbsolute: true,
          gpuAcceleration: false
        };
      }
    },
    placement: {
      type: String,
      default: 'bottom-start'
    }
  },

  data() {
    return {
      options: [],
      cachedOptions: [],
      createdLabel: null,
      createdSelected: false,
      selected: this.multiple ? [] : {},
      isSelect: true,
      isClick: false,
      textWidth: 0,
      inputWidth: 0,
      inputWidthMin: 0,
      inputClear: false,
      cachedPlaceHolder: '',
      optionsCount: 0,
      filteredOptionsCount: 0,
      visible: false,
      selectedLabel: '',
      hoverIndex: -1,
      query: '',
      optionsAllDisabled: false,
      inputHovering: false,
      currentPlaceholder: '',
      isIE: false // 判断是否是ie
    };
  },

  computed: {
    // 判断 暂无结果 是否展示
    isShowEmptyText() {
      if (!this.emptyText) {
        return false;
      }
      return this.options.length === 0 || this.filteredOptionsCount === 0;
    },
    showDropdown() {
      // if (!this.multiple && this.search && this.query === '') {
      //   return false;
      // }
      return this.visible && this.emptyText !== false;
    },
    search() {
      return this.filterable || this.remote;
    },
    criteria() {
      return (
        !this.disabled &&
        this.inputHovering &&
        // 单选清除 与 多选清除
        ((this.clear &&
          !this.multiple &&
          this.value !== undefined &&
          this.value !== '') ||
          (this.clearable &&
            this.multiple &&
            Array.isArray(this.value) &&
            this.value.length))
      );
    },
    iconClass() {
      if (this.criteria) {
        return 'h-icon-close_f';
      } else {
        return 'h-icon-angle_down_sm';
      }
    },

    debounce() {
      return this.remote ? 300 : 0;
    },

    emptyText() {
      if (this.loading) {
        return this.loadingText || this.t('el.select.loading');
      } else {
        if (this.remote && this.query === '' && this.options.length === 0) {
          return false;
        }
        if (this.options.length === 0) {
          return this.noDataText || this.t('el.select.noData');
        } else if (
          this.filterable &&
          this.options.length > 0 &&
          this.filteredOptionsCount === 0
        ) {
          return this.noMatchText || this.t('el.select.noMatch');
        }
      }
      return null;
    },

    showNewOption() {
      const hasExistingOption = this.options
        .filter(option => !option.created)
        .some(option => option.currentLabel === this.query);

      return (
        this.filterable &&
        this.allowCreate &&
        this.query !== '' &&
        !hasExistingOption
      );
    },

    selectSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },

    selectDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },

    collapseTagSize() {
      return ['medium', 'small'].indexOf(this.selectSize) > -1
        ? 'small'
        : 'medium';
    }
  },

  watch: {
    placeholder(val) {
      this.cachedPlaceHolder = this.currentPlaceholder = val;
    },

    value(val) {
      if (this.multiple) {
        // this.resetInputHeight();
        if (val.length > 0 || (this.$refs.input && this.query !== '')) {
          this.currentPlaceholder = '';
        } else {
          this.currentPlaceholder = this.cachedPlaceHolder;
        }
      }
      this.setSelected();
      // if (this.filterable && !this.multiple) {
      //   this.inputLength = 20;
      // }
      this.$emit('change', val, this);
      this.dispatch('ElFormItem', 'el.form.change', val);
    },

    query(val) {
      if (this.remote || this.allowCreate) {
        // const newValue = val.trim();
        const newValue = val || val === 0 ? val.toString().trim() : val.trim();
        if (newValue !== val) {
          this.query = newValue;
          return;
        }
      }
      this.$nextTick(() => {
        if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper');
        this.textWidth = this.$refs.text.getBoundingClientRect().width;
        this.resetInputHeight();
      });
      this.hoverIndex = -1;

      if (this.remote && typeof this.remoteMethod === 'function') {
        this.hoverIndex = -1;
        this.remoteMethod(val, this.isClick);
        this.isClick = false;
        this.broadcast('ElOption', 'resetIndex');
      } else if (typeof this.filterMethod === 'function') {
        this.filterMethod(val);
        this.broadcast('ElOptionGroup', 'queryChange');
      } else {
        this.filteredOptionsCount = this.optionsCount;
        this.broadcast('ElOption', 'queryChange', val);
        this.broadcast('ElOptionGroup', 'queryChange');
      }
      if (
        this.defaultFirstOption &&
        (this.filterable || this.remote) &&
        this.filteredOptionsCount
      ) {
        this.checkDefaultFirstOption();
      }
    },

    visible(val) {
      if (!val) {
        this.$refs.reference.$el.querySelector('input').blur();
        if (!this.criteria) {
          this.handleIconHide();
        }
        this.broadcast('ElSelectDropdown', 'destroyPopper');
        if (this.$refs.input) {
          this.$refs.input.blur();
        }
        this.query = '';
        this.selectedLabel = '';
        // this.inputLength = 20;
        this.resetHoverIndex();
        this.$nextTick(() => {
          if (
            this.$refs.input &&
            this.$refs.input.value === '' &&
            this.selected.length === 0
          ) {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }
        });
        if (!this.multiple) {
          if (this.selected) {
            if (
              this.filterable &&
              this.allowCreate &&
              this.createdSelected &&
              this.createdOption
            ) {
              this.selectedLabel = this.createdLabel;
            } else {
              this.selectedLabel = this.selected.currentLabel;
            }
            if (this.filterable) this.query = this.selectedLabel;
          }
        }
      } else {
        if (!this.criteria) {
          this.handleIconShow();
        }
        this.broadcast('ElSelectDropdown', 'updatePopper');
        if (this.filterable) {
          this.query = this.selectedLabel;
          if (this.multiple) {
            this.$refs.input.focus();
          } else {
            if (!this.remote) {
              this.broadcast('ElOption', 'queryChange', '');
              this.broadcast('ElOptionGroup', 'queryChange');
            }
            this.broadcast('ElInput', 'inputSelect');
          }
        }
      }
      this.$emit('visible-change', val);
    },

    options(val) {
      if (this.$isServer) return;
      this.optionsAllDisabled =
        val.length === val.filter(item => item.disabled === true).length;
      if (this.multiple) {
        this.resetInputHeight();
      }
      const inputs = this.$el.querySelectorAll('input');
      if ([].indexOf.call(inputs, document.activeElement) === -1) {
        this.setSelected();
      }
      if (
        this.defaultFirstOption &&
        (this.filterable || this.remote) &&
        this.filteredOptionsCount
      ) {
        this.checkDefaultFirstOption();
      }
    }
  },

  created() {
    this.cachedPlaceHolder = this.currentPlaceholder = this.placeholder;
    if (this.multiple && !Array.isArray(this.value)) {
      this.$emit('input', []);
    }
    if (!this.multiple && Array.isArray(this.value)) {
      this.$emit('input', '');
    }
    this.setSelected();
    this.debouncedOnInputChange = debounce(this.debounce, () => {
      this.onInputChange();
    });

    this.$on('handleOptionClick', this.handleOptionSelect);
    this.$on('onOptionDestroy', this.onOptionDestroy);
    this.$on('setSelected', this.setSelected);
  },

  mounted() {
    if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
      this.currentPlaceholder = '';
    }
    addResizeListener(this.$el, this.handleResize);
    if (this.remote && this.multiple) {
      this.resetInputHeight();
    }
    this.$nextTick(() => {
      if (this.$refs.reference && this.$refs.reference.$el) {
        this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
        this.textWidth = this.$refs.text.getBoundingClientRect().width;
      }
    });
    // ie兼容
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIE = true;
    }
    this.$on('popperHidden', this.handleClose);
  },

  beforeDestroy() {
    if (this.$el && this.handleResize) {
      removeResizeListener(this.$el, this.handleResize);
    }
  },

  methods: {
    handleIconHide() {
      const icon = this.$el.querySelector('.el-input__suffix');
      // if (icon && !this.search) {
      //   removeClass(icon, 'is-reverse');
      // }
      if (icon) {
        removeClass(icon, 'is-reverse');
      }
    },

    handleIconShow() {
      const icon = this.$el.querySelector('.el-input__suffix');
      // if (icon && !hasClass(icon, 'h-icon-close_f') && !this.search) {
      //   addClass(icon, 'is-reverse');
      // }
      if (icon && !hasClass(icon, 'h-icon-close_f')) {
        addClass(icon, 'is-reverse');
      }
    },

    scrollToOption(option) {
      const target =
        Array.isArray(option) && option[0] ? option[0].$el : option.$el;
      if (this.$refs.popper && target) {
        const menu = this.$refs.popper.$el.querySelector(
          '.el-select-dropdown__wrap'
        );
        scrollIntoView(menu, target);
      }
    },

    handleMenuEnter() {
      this.$nextTick(() => this.scrollToOption(this.selected));
    },
    afterEnter() {
      this.$nextTick(() => this.$refs.scrollbar.throttleUpdate());
    },
    getOption(value) {
      let option;
      const isObject =
        Object.prototype.toString.call(value).toLowerCase() ===
        '[object object]';
      for (let i = this.cachedOptions.length - 1; i >= 0; i--) {
        const cachedOption = this.cachedOptions[i];
        const isEqual = isObject
          ? getValueByPath(cachedOption.value, this.valueKey) ===
            getValueByPath(value, this.valueKey)
          : cachedOption.value === value;
        if (isEqual) {
          option = cachedOption;
          break;
        }
      }
      if (option) return option;
      // 没匹配上就不显示了
      // const label = !isObject ? value : '';
      const label = '';
      const newOption = {
        value: value,
        currentLabel: label
      };
      if (this.multiple) {
        newOption.hitState = false;
      }
      return newOption;
    },

    setSelected() {
      if (!this.multiple) {
        const option = this.getOption(this.value);
        if (option.created) {
          this.createdLabel = option.currentLabel;
          this.createdSelected = true;
        } else {
          this.createdSelected = false;
        }
        this.selectedLabel = option.currentLabel;
        this.selected = option;
        if (this.filterable) this.query = this.selectedLabel;
        return;
      }
      const result = [];
      if (Array.isArray(this.value)) {
        this.value.forEach(value => {
          result.push(this.getOption(value));
        });
      }
      // 再对选中的项进行过滤如果没有label则不显示 xx
      this.selected = result.filter(val => val.currentLabel !== '');
      if (this.selected.length) {
        this.inputClear = true;
      } else {
        this.inputClear = false;
      }
      this.$nextTick(() => {
        this.resetInputHeight();
      });
    },

    handleFocus(event) {
      if (!this.readonly) {
        this.visible = true;
        this.$emit('focus', event);
      }
    },
    // blur() {
    //   this.visible = false;
    //   this.$refs.reference.blur();
    // },
    handleBlur(event) {
      this.$emit('blur', event);
    },
    handleSearchClick(event) {
      event.stopPropagation();
      this.$emit('search', this.value, this.query);
    },
    handleIconClick(event) {
      if (this.iconClass.indexOf('h-icon-search') > -1) {
        this.handleSearchClick(event);
      } else if (this.iconClass.indexOf('h-icon-close_f') > -1) {
        // this.deleteSelected(event);
        this.multiple && this.clearable
          ? this.deleteAllTag()
          : this.deleteSelected(event);
      } else {
        this.toggleMenu();
      }
    },

    handleMouseDown(event) {
      if (event.target.tagName !== 'INPUT') return;
      if (this.visible) {
        this.handleClose();
        event.preventDefault();
      }
    },

    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy();
      this.dropdownUl = null;
    },

    handleClose() {
      this.visible = false;
    },

    toggleLastOptionHitState(hit) {
      if (!Array.isArray(this.selected)) return;
      const option = this.selected[this.selected.length - 1];
      if (!option) return;

      if (hit === true || hit === false) {
        option.hitState = hit;
        return hit;
      }

      option.hitState = !option.hitState;
      return option.hitState;
    },

    deletePrevTag(e) {
      if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
        const value = this.value.slice();
        value.pop();
        this.$emit('input', value);
      }
    },

    managePlaceholder() {
      if (this.currentPlaceholder !== '') {
        this.currentPlaceholder = this.$refs.input.value
          ? ''
          : this.cachedPlaceHolder;
      }
    },

    resetInputState(e) {
      if (e.keyCode !== 8) this.toggleLastOptionHitState(false);
      // this.inputLength = this.$refs.input.value.length * 15 + 20;
      // this.resetInputHeight();
    },

    resetInputHeight() {
      if (!this.multiple) return;

      this.$nextTick(() => {
        if (!this.$refs.reference) return;
        const inputChildNodes = this.$refs.reference.$el.childNodes;
        const input = [].filter.call(
          inputChildNodes,
          item => item.tagName === 'INPUT'
        )[0];
        const height = input.style.height;
        input.style.height =
          Math.max(this.$refs.tags.clientHeight, sizeMap[this.size] || 32) +
          'px';
        if (this.isIE && height === input.style.height) {
          // ie下防止闪烁
          return;
        }
        if (this.visible && this.emptyText !== false) {
          this.broadcast('ElSelectDropdown', 'updatePopper');
        }
      });
    },

    resetHoverIndex() {
      setTimeout(() => {
        if (!this.multiple) {
          this.hoverIndex = this.options.indexOf(this.selected);
        } else {
          if (this.selected.length > 0) {
            this.hoverIndex = Math.min.apply(
              null,
              this.selected.map(item => this.options.indexOf(item))
            );
          } else {
            this.hoverIndex = -1;
          }
        }
      }, 300);
    },

    handleOptionSelect(option) {
      if (this.multiple) {
        const value = this.value.slice();
        const optionIndex = this.getValueIndex(value, option.value);
        if (optionIndex > -1) {
          value.splice(optionIndex, 1);
        } else if (
          this.multipleLimit <= 0 ||
          value.length < this.multipleLimit
        ) {
          value.push(option.value);
        } else {
          return;
        }
        this.$emit('input', value);
        // if (!this.searchArray.length && !this.reserveKeyword) {
        //   this.query = '';
        // }
        // if (option.created) {
        //   this.query = '';
        // }
        if (this.filterable) {
          this.$refs.input.focus();
        }
      } else {
        this.$emit('input', option.value);
        this.visible = false;
      }
      this.isClick = true;
      this.$nextTick(() => this.scrollToOption(option));
    },

    getValueIndex(arr = [], value) {
      const isObject =
        Object.prototype.toString.call(value).toLowerCase() ===
        '[object object]';
      if (!isObject) {
        return arr.indexOf(value);
      } else {
        const valueKey = this.valueKey;
        let index = -1;
        arr.some((item, i) => {
          if (
            getValueByPath(item, valueKey) === getValueByPath(value, valueKey)
          ) {
            index = i;
            return true;
          }
          return false;
        });
        return index;
      }
    },

    toggleMenu() {
      // if (this.filterable && this.query === '' && this.visible) {
      //   return;
      // }
      if (!this.disabled && !this.readonly) {
        this.visible = !this.visible;
      }
    },
    hiddenMenu() {
      this.visible = false;
    },

    navigateOptions(direction) {
      if (!this.visible) {
        this.visible = true;
        return;
      }
      if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
      this.optionsAllDisabled =
        this.options.length ===
        this.options.filter(item => item.disabled === true).length;
      if (!this.optionsAllDisabled) {
        if (direction === 'next') {
          this.hoverIndex++;
          if (this.hoverIndex === this.options.length) {
            this.hoverIndex = 0;
          }
          if (
            this.options[this.hoverIndex].disabled === true ||
            this.options[this.hoverIndex].groupDisabled === true ||
            !this.options[this.hoverIndex].visible
          ) {
            this.navigateOptions('next');
          }
        }
        if (direction === 'prev') {
          this.hoverIndex--;
          if (this.hoverIndex < 0) {
            this.hoverIndex = this.options.length - 1;
          }
          if (
            this.options[this.hoverIndex].disabled === true ||
            this.options[this.hoverIndex].groupDisabled === true ||
            !this.options[this.hoverIndex].visible
          ) {
            this.navigateOptions('prev');
          }
        }
      }
      this.$nextTick(() => this.scrollToOption(this.options[this.hoverIndex]));
    },

    selectOption() {
      if (this.options[this.hoverIndex]) {
        this.handleOptionSelect(this.options[this.hoverIndex]);
      }
    },

    deleteSelected(event) {
      event.stopPropagation();
      this.$emit('input', '');
      this.visible = false;
      this.$emit('clear');
    },
    deleteAllTag() {
      this.value.splice(0, this.selected.length);
      this.$emit('input', this.value);
      for (let i = 0; i < this.selected.length; i++) {
        this.$emit('remove-tag', this.selected[i]);
      }
    },
    deleteTag(event, tag) {
      const index = this.selected.indexOf(tag);
      if (index > -1 && !this.disabled) {
        const value = this.value.slice();
        value.splice(index, 1);
        this.$emit('input', value);
        this.$emit('remove-tag', tag);
      }
      event.stopPropagation();
    },

    onInputChange() {
      if (this.filterable) {
        this.query = this.selectedLabel;
      }
    },

    onOptionDestroy(option) {
      const index = this.options.indexOf(option);
      if (index > -1) {
        this.optionsCount--;
        this.filteredOptionsCount--;
        this.options.splice(index, 1);
      }
      this.broadcast('ElOption', 'resetIndex');
    },

    resetInputWidth() {
      this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
    },
    resetInputWidthMin() {
      this.inputWidthMin = this.clearable ? 50 : 32;
    },
    handleResize() {
      this.resetInputWidth();
      this.resetInputWidthMin();
      if (this.multiple) this.resetInputHeight();
    },

    checkDefaultFirstOption() {
      this.hoverIndex = -1;
      for (let i = 0; i !== this.options.length; ++i) {
        const option = this.options[i];
        if (this.query) {
          // pick first options that passes the filter
          if (!option.disabled && !option.groupDisabled && option.visible) {
            this.hoverIndex = i;
            break;
          }
        } else {
          // pick currently selected option
          if (option.itemSelected) {
            this.hoverIndex = i;
            break;
          }
        }
      }
    },

    getValueKey(item) {
      const type = typeof item.value;
      if (type === 'number' || type === 'string') {
        return item.value;
      } else {
        return getValueByPath(item.value, this.valueKey);
      }
    },
    onScrollingX(s) {
      const { scrollLeft, percentX } = s;
      this.$emit('on-scrolling-x', { scrollLeft, percentX });
      this.$emit('on-scrolling', s);
    },

    onScrollingY(s) {
      const { scrollTop, percentY } = s;
      this.$emit('on-scrolling-y', { scrollTop, percentY });
      this.$emit('on-scrolling', s);
    }
  }
};
</script>

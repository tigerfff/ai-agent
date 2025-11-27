<template>
  <li
    v-show="visible"
    ref="dom"
    :class="{
      selected: itemSelected,
      'is-disabled': disabled || groupDisabled || limitReached,
      'brand-font': created,
      radio: !parent.multiple,
      hover: parent.hoverIndex === index
    }"
    :title="showTitle ? currentLabel : ''"
    class="el-select-dropdown__item"
    @mouseenter="hoverItem"
    @click.stop.prevent="selectOptionClick"
  >
    <span v-if="parent.multiple" class="el-select_check-box-wrap">
      <el-checkbox ref="checkbox" v-model="itemSelected" />
    </span>
    <slot>
      <span
        v-if="!showHtml"
        :class="{
          'brand-font': created
        }"
      >
        {{ currentLabel }}
      </span>
      <span
        v-if="showLabel && showHtml"
        :class="{
          'brand-font': created
        }"
        v-html="showLabel"
      ></span>
      <span
        v-if="!showLabel && showHtml"
        :class="{
          'brand-font': created
        }"
        v-html="currentLabel"
      ></span>
    </slot>
    <!-- <i :class="{ 'h-icon-done': itemSelected }" v-if="this.parent.multiple"></i> -->
  </li>
</template>

<script type="text/babel">
import ElCheckbox from 'hui/packages/checkbox';
// import ElTooltip from 'hui/packages/tooltip';
import Emitter from 'hui/src/mixins/emitter';
import { getValueByPath } from 'hui/src/utils/util';

export default {
  name: 'ElOption',
  components: {
    ElCheckbox
  },
  mixins: [Emitter],

  componentName: 'ElOption',

  props: {
    value: { type: null, required: true },
    label: {
      type: [String, Number],
      default: null
    },
    created: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showHtml: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      index: -1,
      groupDisabled: false,
      visible: true,
      hitState: false,
      showTitle: false,
      showLabel: null
    };
  },

  computed: {
    isObject() {
      return (
        Object.prototype.toString.call(this.value).toLowerCase() ===
        '[object object]'
      );
    },

    currentLabel() {
      return this.label || (this.isObject ? '' : this.value);
    },

    currentValue() {
      return this.value || this.label || '';
    },

    parent() {
      let result = this.$parent;
      while (!result.isSelect) {
        result = result.$parent;
      }
      return result;
    },

    itemSelected: {
      get: function() {
        if (!this.parent.multiple) {
          return this.isEqual(this.value, this.parent.value);
        } else {
          return this.contains(this.parent.value, this.value);
        }
      },
      set: function() {}
    },

    limitReached() {
      if (this.parent.multiple) {
        return (
          !this.itemSelected &&
          this.parent.value.length >= this.parent.multipleLimit &&
          this.parent.multipleLimit > 0
        );
      } else {
        return false;
      }
    }
  },

  watch: {
    currentLabel() {
      if (!this.created && !this.parent.remote) {
        this.dispatch('ElSelect', 'setSelected');
      }
    },
    value() {
      if (!this.created && !this.parent.remote) {
        this.dispatch('ElSelect', 'setSelected');
      }
    }
  },

  created() {
    this.parent.options.push(this);
    this.parent.cachedOptions.push(this);
    this.parent.optionsCount++;
    this.parent.filteredOptionsCount++;
    this.index = this.parent.options.indexOf(this);

    this.$on('queryChange', this.queryChange);
    this.$on('handleGroupDisabled', this.handleGroupDisabled);
    this.$on('resetIndex', this.resetIndex);
  },

  beforeDestroy() {
    this.dispatch('ElSelect', 'onOptionDestroy', this);
  },

  methods: {
    isEqual(a, b) {
      if (!this.isObject) {
        return a === b;
      } else {
        const valueKey = this.parent.valueKey;
        return getValueByPath(a, valueKey) === getValueByPath(b, valueKey);
      }
    },

    contains(arr = [], target) {
      if (!this.isObject) {
        return arr.indexOf(target) > -1;
      } else {
        const valueKey = this.parent.valueKey;
        return arr.some(item => {
          return (
            getValueByPath(item, valueKey) === getValueByPath(target, valueKey)
          );
        });
      }
    },

    handleGroupDisabled(val) {
      this.groupDisabled = val;
    },

    hoverItem() {
      this.showTitle = this.$refs.dom.clientWidth < this.$refs.dom.scrollWidth;
      if (!this.disabled && !this.groupDisabled) {
        this.parent.hoverIndex = this.parent.options.indexOf(this);
      }
      if (this.disabled) {
        this.parent.hoverIndex = -1;
      }
    },
    selectOptionClick() {
      if (this.disabled !== true && this.groupDisabled !== true) {
        this.dispatch('ElSelect', 'handleOptionClick', this);
      }
    },

    queryChange(query) {
      // query 里如果有正则中的特殊字符，需要先将这些字符转义
      const parsedQuery = String(query).replace(
        /(\^|\(|\)|\[|\]|\$|\*|\+|\.|\?|\\|\{|\}|\|)/g,
        '\\$1'
      );
      this.visible =
        new RegExp(parsedQuery, 'i').test(this.currentLabel) || this.created;
      if (!this.visible) {
        this.parent.filteredOptionsCount--;
      } else {
        if (this.created) {
          this.showLabel = query;
          return;
        }
        if (parsedQuery) {
          this.showLabel = this.currentLabel.replace(
            new RegExp(parsedQuery, 'g'),
            "<font class='brand-font'>" + query + '</font>'
          );
        } else {
          this.showLabel = null;
        }
      }
    },

    resetIndex() {
      this.$nextTick(() => {
        this.index = this.parent.options.indexOf(this);
      });
    }
  }
};
</script>

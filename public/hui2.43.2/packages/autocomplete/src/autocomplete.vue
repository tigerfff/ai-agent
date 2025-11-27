<template>
  <div
    v-clickoutside="close"
    :class="[kind ? 'el-input--' + kind : '']"
    class="el-autocomplete"
  >
    <el-input
      ref="input"
      v-bind="$props"
      :clearable="clearable"
      :maxlength="maxlength"
      :minlength="minlength"
      :tips="tips"
      :tips-max-width="tipsMaxWidth"
      :tips-placement="tipsPlacement"
      :tips-offset="tipsOffset"
      :tips-trigger="tipsTrigger"
      :tips-class="tipsClass"
      @clear="clearValue"
      @compositionstart.native="handleComposition"
      @compositionupdate.native="handleComposition"
      @compositionend.native="handleComposition"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.up.native.prevent="highlight(highlightedIndex - 1)"
      @keydown.down.native.prevent="highlight(highlightedIndex + 1)"
      @keydown.enter.native="handleKeyEnter"
      @keydown.native.tab="close"
    >
      <template v-if="$slots.prefix" slot="prefix">
        <slot name="prefix" />
      </template>
      <template v-if="$slots.suffix" slot="suffix">
        <slot name="suffix" />
      </template>
      <template v-if="$slots.prepend" slot="prepend">
        <slot name="prepend" />
      </template>
      <template v-if="$slots.append" slot="append">
        <slot name="append" />
      </template>
    </el-input>
    <el-autocomplete-suggestions
      ref="suggestions"
      :props="props"
      :class="[popperClass ? popperClass : '']"
      :suggestions="suggestions"
      :loading="loading"
      :append-to-body="popperAppendToBody"
      placement="bottom-start"
    >
      <template v-if="$slots.content" slot="content">
        <slot name="content" />
      </template>
      <template v-if="$slots.bottom" slot="bottom">
        <slot name="bottom" />
      </template>
    </el-autocomplete-suggestions>
  </div>
</template>
<script>
import ElInput from 'hui/packages/input';
import Clickoutside from 'hui/src/utils/clickoutside';
import ElAutocompleteSuggestions from './autocomplete-suggestions.vue';
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElAutocomplete',

  components: {
    ElInput,
    ElAutocompleteSuggestions
  },

  directives: { Clickoutside },

  mixins: [Emitter],

  componentName: 'ElAutocomplete',

  props: {
    props: {
      type: Object,
      default() {
        return {
          value: 'value',
          label: 'value'
        };
      }
    },
    popperClass: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    kind: {
      type: String,
      default: ''
    },
    clearIconClick: {
      type: Function,
      default: null
    },
    size: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    fetchSuggestions: {
      type: Function,
      default: null
    },
    triggerOnFocus: {
      type: Boolean,
      default: true
    },
    customItem: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    onIconClick: {
      type: Function,
      default: null
    },
    debounce: {
      type: Number,
      default: 100
    },
    maxlength: {
      type: Number,
      default: null
    },
    minlength: {
      type: Number,
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
      default: null
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
    popperAppendToBody: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activated: false,
      isOnComposition: false,
      suggestions: [],
      lastValue: {
        type: String,
        default: ''
      },
      loading: false,
      highlightedIndex: -1,
      ie: false // 判断是否是ie
    };
  },
  computed: {
    suggestionVisible() {
      const suggestions = this.suggestions;
      const isValidData = Array.isArray(suggestions);
      // 非激活情况下且suggestions为空数组时不显示建议
      const noSuggestion =
        !this.value.length && !this.suggestions.length && !this.triggerOnFocus;
      return !noSuggestion && isValidData && this.activated;
    }
  },
  watch: {
    suggestionVisible(val) {
      if (val) {
        this.$refs.suggestions.showNoMatch = false;
      }
      this.$emit('visible', this.suggestionVisible);
      this.broadcast('ElAutocompleteSuggestions', 'visible', [
        val,
        this.$refs.input.$refs.input.offsetWidth
      ]);
    }
  },
  mounted() {
    // ie兼容
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.ie = true;
    }
    this.$on('item-click', item => {
      this.select(item);
    });
  },
  beforeDestroy() {
    this.$refs.suggestions.$destroy();
  },
  methods: {
    clearValue() {
      if (!this.disabled) {
        // if (this.clearIconClick) {
        //   this.clearIconClick(event);
        // }
        this.$emit('input', '');
        this.activated = false;
        this.suggestions = [];
      }
    },
    getData(queryString) {
      this.loading = true;
      // this.activated = true;
      this.fetchSuggestions(queryString, suggestions => {
        if (Array.isArray(suggestions)) {
          this.suggestions = suggestions;
        } else {
          console.error('autocomplete suggestions must be an array');
        }
        this.loading = false;
      });
    },
    handleComposition(event) {
      if (event.type === 'compositionend') {
        this.isOnComposition = false;
        this.handleChange(event.target.value);
      } else {
        this.isOnComposition = true;
      }
    },
    handleChange(value, fromWrap) {
      this.activated = true;
      this.$emit('input', value);
      this.getData(value);
      this.index++;
      this.lastValue = value;

      if (this.isOnComposition || (!this.triggerOnFocus && !value)) {
        this.suggestions = [];
      }
    },
    handleFocus(event) {
      if (this.triggerOnFocus) {
        this.activated = true;
      }
      if (this.triggerOnFocus || this.value) {
        this.getData(this.value);
      }
      this.$emit('focus', event);
    },
    handleBlur(event) {
      this.$emit('blur', event);
    },
    close(e) {
      this.activated = false;
      this.suggestions = [];
    },
    handleKeyEnter(e) {
      if (
        this.suggestionVisible &&
        this.highlightedIndex >= 0 &&
        this.highlightedIndex < this.suggestions.length
      ) {
        e.preventDefault();
        this.select(this.suggestions[this.highlightedIndex]);
      }
    },
    select(item, index) {
      const selected = item[this.props.value] || item;
      // 如果选中的不是字符串则不做处理
      if (typeof selected !== 'string' && typeof selected !== 'number') return;
      this.lastValue = item;
      this.activated = false;
      this.$emit('input', selected);
      this.$emit('select', item);
      this.$nextTick(_ => {
        this.suggestions = [];
      });
    },
    highlight(index) {
      if (!this.suggestionVisible || this.loading) {
        return;
      }
      if (index < 0) index = 0;
      if (index >= this.suggestions.length) {
        index = this.suggestions.length - 1;
      }
      const suggestion = this.$refs.suggestions.$el.querySelector(
        '.el-autocomplete-suggestion__wrap'
      );
      const suggestionList = suggestion.querySelectorAll(
        '.el-autocomplete-suggestion__list li'
      );

      const highlightItem = suggestionList[index];
      const scrollTop = suggestion.scrollTop;
      const offsetTop = highlightItem.offsetTop;

      if (
        offsetTop + highlightItem.scrollHeight >
        scrollTop + suggestion.clientHeight
      ) {
        suggestion.scrollTop += highlightItem.scrollHeight;
      }
      if (offsetTop < scrollTop) {
        suggestion.scrollTop -= highlightItem.scrollHeight;
      }

      this.highlightedIndex = index;
    }
  }
};
</script>

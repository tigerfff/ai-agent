<template>
  <transition
    name="el-zoom-in-top"
    @after-enter="afterEnter"
    @after-leave="doDestroy"
  >
    <div
      v-show="showPopper"
      :class="{ 'is-loading': parent.loading }"
      :style="{ width: dropdownWidth }"
      class="el-autocomplete-suggestion"
    >
      <el-scrollbar
        ref="scrollbar"
        :is-small="true"
        tag="ul"
        wrap-class="el-autocomplete-suggestion__wrap"
        view-class="el-autocomplete-suggestion__list"
      >
        <li v-if="parent.loading" class="el-autocomplete__nodata">
          <el-load-icon></el-load-icon>
        </li>
        <div
          v-else-if="showNoMatch"
          :class="{ 'el-autocomplete__nodata': showNoMatch }"
        >
          {{ noMatch }}
        </div>
        <template v-else-if="$slots.content">
          <slot name="content" />
        </template>
        <div v-else>
          <template v-for="(item, index) in suggestions">
            <li
              v-if="!parent.customItem"
              :key="index"
              :class="{ highlighted: itemSelected(item) }"
              class="el-autocomplete-suggestion__item"
              @click="select(item)"
            >
              {{ item[props.value] || item }}
            </li>
            <component
              :is="parent.customItem"
              v-else
              :key="index"
              :select="select"
              :item="item"
              :index="index"
              class="el-autocomplete-suggestion__item"
              @click="select(item)"
            />
          </template>
        </div>
      </el-scrollbar>
      <template v-if="$slots.bottom">
        <slot name="bottom" />
      </template>
    </div>
  </transition>
</template>
<script>
import Popper from 'hui/src/utils/vue-popper';
import Emitter from 'hui/src/mixins/emitter';
import ElScrollbar from 'hui/packages/scrollbar';
import { getValueByPath } from 'hui/src/utils/util';
import { t } from 'hui/src/locale';

export default {
  components: { ElScrollbar },
  mixins: [Popper, Emitter],

  componentName: 'ElAutocompleteSuggestions',

  props: {
    props: {
      type: Object,
      default() {
        return {
          label: 'value',
          value: 'value'
        };
      }
    },
    suggestions: {
      type: Array,
      default: null
    }
  },

  data() {
    return {
      parent: this.$parent,
      dropdownWidth: '',
      noMatch: t('el.cascader.noMatch'),
      showNoMatch: false
    };
  },
  watch: {
    suggestions(newValue, oldValue) {
      this.$nextTick(this.updatePopper);
      if (newValue.length) {
        this.showNoMatch = false;
      } else {
        if (this.parent.suggestionVisible) {
          this.showNoMatch = true;
        }
      }
    }
  },

  mounted() {
    this.$parent.popperElm = this.popperElm = this.$el;
    this.referenceElm = this.$parent.$refs.input.$refs.input;
  },

  created() {
    this.$on('visible', (val, inputWidth) => {
      this.dropdownWidth = inputWidth + 'px';
      this.showPopper = val;
    });
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
    itemSelected(value) {
      return this.isEqual(value, this.parent.lastValue);
    },
    select(item) {
      this.dispatch('ElAutocomplete', 'item-click', item);
    },
    afterEnter() {
      this.$nextTick(() => this.$refs.scrollbar.throttleUpdate());
    }
  }
};
</script>

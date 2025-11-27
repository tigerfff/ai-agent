<template>
  <div class="el-transfer-panel">
    <p class="el-transfer-panel__header">
      {{ title }}
    </p>

    <div
      :class="[
        'el-transfer-panel__body',
        !isShowFooter ? 'no-footer' : 'is-with-footer',
        filterable ? 'is-filterable' : ''
      ]"
    >
      <el-input
        v-if="filterable && !isSearch"
        v-model="query"
        :placeholder="placeholder"
        :icon="inputIcon"
        class="el-transfer-panel__filter"
        size="small"
        @mouseenter.native="inputHover = true"
        @mouseleave.native="inputHover = false"
        @click="clearQuery"
      />
      <el-input
        v-else-if="isSearch"
        v-model="searchQuery"
        :placeholder="placeholder"
        :icon="inputIcon"
        class="el-transfer-panel__filter"
        size="small"
        @keyup.enter.native="searchMethod(searchQuery)"
        @mouseenter.native="inputHover = true"
        @mouseleave.native="inputHover = false"
        @click="clearQuery"
      />
      <el-scrollbar
        v-show="data.length > 0"
        :wrap-class="
          filterable
            ? 'el-transfer-scrollbar-filterable__wrap'
            : 'el-transfer-scrollbar__wrap'
        "
        view-class="el-transfer-scrollbar__view"
        is-small
        @on-scrolling="onScrolling"
      >
        <el-checkbox-group
          v-show="!hasNoMatch && data.length > 0"
          v-model="checked"
          :class="{
            'is-filterable': filterable
          }"
          class="el-transfer-panel__list"
        >
          <el-checkbox
            v-for="item in filteredData"
            :key="item[keyProp]"
            :label="item[keyProp]"
            :disabled="item[disabledProp]"
            class="el-transfer-panel__item"
          >
            <option-content :option="item" />
          </el-checkbox>
        </el-checkbox-group>
      </el-scrollbar>
      <!--</div>-->
      <p v-show="hasNoMatch" class="el-transfer-panel__empty">
        {{ t('el.transfer.noMatch') }}
      </p>
      <p
        v-show="data.length === 0 && !hasNoMatch"
        class="el-transfer-panel__empty"
      >
        {{ t('el.transfer.noData') }}
      </p>
    </div>
    <p v-if="isShowFooter" class="el-transfer-panel__footer">
      <el-checkbox
        v-model="allChecked"
        :indeterminate="isIndeterminate"
        @change="handleAllCheckedChange"
      >
        {{ checkedSummary }}
      </el-checkbox>
      <slot />
    </p>
  </div>
</template>

<script>
import ElCheckboxGroup from 'hui/packages/checkbox-group';
import ElCheckbox from 'hui/packages/checkbox';
import ElInput from 'hui/packages/input';
import ElScrollbar from 'hui/packages/scrollbar';
import Locale from 'hui/src/mixins/locale';

export default {
  name: 'ElTransferPanel',

  components: {
    ElCheckboxGroup,
    ElCheckbox,
    ElInput,
    ElScrollbar,
    OptionContent: {
      props: {
        option: Object
      },
      render(h) {
        const getParent = vm => {
          if (vm.$options.componentName === 'ElTransferPanel') {
            return vm;
          } else if (vm.$parent) {
            return getParent(vm.$parent);
          } else {
            return vm;
          }
        };
        const parent = getParent(this);
        return parent.renderContent ? (
          parent.renderContent(h, this.option)
        ) : (
          <span>
            {this.option[parent.labelProp] || this.option[parent.keyProp]}
          </span>
        );
      }
    }
  },
  mixins: [Locale],

  componentName: 'ElTransferPanel',

  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    renderContent: {
      type: Function,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    filterable: {
      type: Boolean,
      default: null
    },
    filterPlaceholder: {
      type: String,
      default: ''
    },
    footerFormat: {
      type: [Object, Boolean],
      default: null
    },
    filterMethod: {
      type: Function,
      default: null
    },
    defaultChecked: {
      type: Array,
      default: null
    },
    props: {
      type: Object,
      default: null
    },
    panelAt: {
      type: String,
      default: null
    },
    searchPlaceholder: {
      type: String,
      default: ''
    },
    searchMethod: {
      type: Function,
      default: null
    }
  },

  data() {
    return {
      checked: [],
      allChecked: false,
      query: '',
      inputHover: false,
      searchQuery: ''
    };
  },

  computed: {
    filteredData() {
      return this.data.filter(item => {
        if (typeof this.filterMethod === 'function') {
          return this.filterMethod(this.query, item);
        } else {
          const label = item[this.labelProp] || item[this.keyProp].toString();
          return label.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
        }
      });
    },

    checkableData() {
      return this.filteredData.filter(item => !item[this.disabledProp]);
    },

    checkedSummary() {
      if (this.footerFormat === false) return '';
      const checkedLength = this.checked.length;
      const dataLength = this.data.length;
      const { noChecked, hasChecked } = this.footerFormat;
      if (noChecked && hasChecked) {
        return checkedLength > 0
          ? hasChecked
              .replace(/\${checked}/g, checkedLength)
              .replace(/\${total}/g, dataLength)
          : noChecked.replace(/\${total}/g, dataLength);
      } else {
        return checkedLength > 0
          ? this.t('el.transfer.hasCheckedFormat', {
              total: dataLength,
              checked: checkedLength
            })
          : this.t('el.transfer.noCheckedFormat', {
              total: dataLength
            });
      }
    },

    isIndeterminate() {
      const checkedLength = this.checked.length;
      return checkedLength > 0 && checkedLength < this.checkableData.length;
    },

    hasNoMatch() {
      return this.query.length > 0 && this.filteredData.length === 0;
    },

    inputIcon() {
      return this.query.length > 0 && this.inputHover
        ? 'h-icon-close_f'
        : 'h-icon-search';
    },

    labelProp() {
      return this.props.label || 'label';
    },

    keyProp() {
      return this.props.key || 'key';
    },

    disabledProp() {
      return this.props.disabled || 'disabled';
    },

    isSearch() {
      return this.panelAt === 'left' && typeof this.searchMethod === 'function';
    },

    isShowFooter() {
      return this.footerFormat !== false;
    },

    placeholder() {
      const {
        filterPlaceholder,
        filterable,
        searchPlaceholder,
        isSearch,
        t
      } = this;
      if (filterable && !isSearch) {
        return filterPlaceholder || t('el.transfer.filterPlaceholder');
      } else if (isSearch) {
        return searchPlaceholder || t('el.transfer.filterPlaceholder');
      } else {
        return '';
      }
    }
  },

  watch: {
    checked(val) {
      this.updateAllChecked();
      this.$emit('checked-change', val);
    },

    data() {
      const checked = [];
      const filteredDataKeys = this.filteredData.map(
        item => item[this.keyProp]
      );
      this.checked.forEach(item => {
        if (filteredDataKeys.indexOf(item) > -1) {
          checked.push(item);
        }
      });
      this.checked = checked;
    },

    checkableData() {
      this.updateAllChecked();
    },

    defaultChecked: {
      immediate: true,
      handler(val, oldVal) {
        if (
          oldVal &&
          val.length === oldVal.length &&
          val.every(item => oldVal.indexOf(item) > -1)
        ) {
          return;
        }
        const checked = [];
        const checkableDataKeys = this.checkableData.map(
          item => item[this.keyProp]
        );
        val.forEach(item => {
          if (checkableDataKeys.indexOf(item) > -1) {
            checked.push(item);
          }
        });
        this.checked = checked;
      }
    }
  },

  methods: {
    updateAllChecked() {
      const checkableDataKeys = this.checkableData.map(
        item => item[this.keyProp]
      );
      this.allChecked =
        checkableDataKeys.length > 0 &&
        checkableDataKeys.every(item => this.checked.indexOf(item) > -1);
    },

    handleAllCheckedChange(value) {
      this.checked = value
        ? this.checkableData.map(item => item[this.keyProp])
        : [];
    },

    clearQuery() {
      const { searchMethod, searchQuery, isSearch } = this;
      if (this.inputIcon === 'h-icon-close_f') {
        if (isSearch) {
          this.searchQuery = '';
        } else {
          this.query = '';
        }
      } else if (isSearch) {
        searchMethod(searchQuery);
      }
    },

    onScrolling(s) {
      const { scrollTop, percentY } = s;
      this.$parent.$emit(`on-${this.panelAt}-scrolling`, {
        scrollTop,
        percentY
      });
    }
  }
};
</script>

<template>
  <transition name="el-zoom-in-top">
    <div v-if="multiple" v-show="showPopper" class="el-table-filter el-popper">
      <div class="el-table-filter__content">
        <el-checkbox-group
          v-model="filteredValue"
          class="el-table-filter__checkbox-group"
        >
          <el-checkbox
            v-for="filter in filters"
            :key="filter.value"
            :label="filter.value"
          >
            {{ filter.text }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="el-table-filter__bottom">
        <button
          :class="{ 'is-disabled': filteredValue.length === 0 }"
          :disabled="filteredValue.length === 0"
          @click="handleConfirm"
        >
          {{ t('el.table.confirmFilter') }}
        </button>
        <button @click="handleReset">
          {{ t('el.table.resetFilter') }}
        </button>
      </div>
    </div>
    <div v-else v-show="showPopper" class="el-table-filter">
      <ul class="el-table-filter__list">
        <li
          :class="{ 'is-active': !filterValue }"
          class="el-table-filter__list-item"
          @click="handleSelect(null)"
        >
          {{ t('el.table.clearFilter') }}
        </li>
        <li
          v-for="filter in filters"
          :key="filter.value"
          :label="filter.value"
          :class="{ 'is-active': isActive(filter) }"
          class="el-table-filter__list-item"
          @click="handleSelect(filter.value)"
        >
          {{ filter.text }}
        </li>
      </ul>
    </div>
  </transition>
</template>

<script type="text/babel">
import Popper from 'hui/src/utils/vue-popper';
import { PopupManager } from 'hui/src/utils/popup';
import Locale from 'hui/src/mixins/locale';
import Clickoutside from 'hui/src/utils/clickoutside';
import Dropdown from './dropdown';
import ElCheckbox from 'hui/packages/checkbox';
import ElCheckboxGroup from 'hui/packages/checkbox-group';

export default {
  name: 'ElTableFilterPanel',

  directives: {
    Clickoutside
  },

  components: {
    ElCheckbox,
    ElCheckboxGroup
  },

  mixins: [Popper, Locale],

  props: {
    placement: {
      type: String,
      default: 'bottom-end'
    },
    visibleArrow: { type: Boolean, default: true }
  },

  customRender() {
    return (
      <div class='el-table-filter'>
        <div class='el-table-filter__content' />
        <div class='el-table-filter__bottom'>
          <button on-click={this.handleConfirm}>
            {this.t('el.table.confirmFilter')}
          </button>
          <button on-click={this.handleReset}>
            {this.t('el.table.resetFilter')}
          </button>
        </div>
      </div>
    );
  },

  data() {
    return {
      table: null,
      cell: null,
      column: null
    };
  },

  computed: {
    filters() {
      return this.column && this.column.filters;
    },

    filterValue: {
      get() {
        return (this.column.filteredValue || [])[0];
      },
      set(value) {
        if (this.filteredValue) {
          if (typeof value !== 'undefined' && value !== null) {
            this.filteredValue.splice(0, 1, value);
          } else {
            this.filteredValue.splice(0, 1);
          }
        }
      }
    },

    filteredValue: {
      get() {
        if (this.column) {
          return this.column.filteredValue || [];
        }
        return [];
      },
      set(value) {
        if (this.column) {
          this.column.filteredValue = value;
        }
      }
    },

    multiple() {
      if (this.column) {
        return this.column.filterMultiple;
      }
      return true;
    }
  },
  watch: {
    showPopper(val) {
      if (
        val === true &&
        parseInt(this.popperJS._popper.style.zIndex, 10) < PopupManager.zIndex
      ) {
        this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
      }
    }
  },

  mounted() {
    this.popperElm = this.$el;
    this.referenceElm = this.cell.querySelector(
      '.el-table__column-filter-trigger'
    );
    this.table.bodyWrapper.addEventListener('scroll', () => {
      this.updatePopper();
    });

    this.$watch('showPopper', value => {
      if (this.column) this.column.filterOpened = value;
      if (value) {
        Dropdown.open(this);
      } else {
        Dropdown.close(this);
      }
    });
  },

  methods: {
    isActive(filter) {
      return filter.value === this.filterValue;
    },

    handleOutsideClick() {
      this.showPopper = false;
    },

    handleConfirm() {
      this.confirmFilter(this.filteredValue);
      this.handleOutsideClick();
    },

    handleReset() {
      this.filteredValue = [];
      this.confirmFilter(this.filteredValue);
      this.handleOutsideClick();
    },

    handleSelect(filterValue) {
      this.filterValue = filterValue;

      if (typeof filterValue !== 'undefined' && filterValue !== null) {
        this.confirmFilter(this.filteredValue);
      } else {
        this.confirmFilter([]);
      }

      this.handleOutsideClick();
    },

    confirmFilter(filteredValue) {
      this.table.store.commit('filterChange', {
        column: this.column,
        values: filteredValue
      });
    }
  }
};
</script>

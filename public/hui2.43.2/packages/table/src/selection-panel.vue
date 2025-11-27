<template>
  <transition name="el-zoom-in-top">
    <div v-show="showPopper" class="el-table-selection">
      <ul class="el-table-selection__list">
        <li
          v-for="selection in selections"
          :key="selection.value"
          :label="selection.value"
          class="el-table-selection__list-item"
          @click="handleSelect(selection.value)"
        >
          {{ selection.text }}
        </li>
      </ul>
    </div>
  </transition>
</template>

<script type="text/babel">
import Popper from 'hui/src/utils/vue-popper';
import { PopupManager } from 'hui/src/utils/popup';
import { on, off } from 'hui/src/utils/dom';

export default {
  name: 'ElTableSelectionPanel',

  mixins: [Popper],

  props: {
    placement: {
      type: String,
      default: 'bottom-start'
    }
  },

  data() {
    return {
      table: null,
      target: null,
      column: null
    };
  },

  computed: {
    selections() {
      return this.column && this.column.selections;
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
    this.referenceElm = this.target;
    this.table.bodyWrapper.addEventListener('scroll', () => {
      this.updatePopper();
    });

    on(this.referenceElm, 'mouseenter', this.handleMouseEnter);
    on(this.popperElm, 'mouseenter', this.handleMouseEnter);
    on(this.referenceElm, 'mouseleave', this.handleMouseLeave);
    on(this.popperElm, 'mouseleave', this.handleMouseLeave);
  },

  destroyed() {
    off(this.referenceElm, 'mouseenter', this.handleMouseEnter);
    off(this.popperElm, 'mouseenter', this.handleMouseEnter);
    off(this.referenceElm, 'mouseleave', this.handleMouseLeave);
    off(this.popperElm, 'mouseleave', this.handleMouseLeave);
  },

  methods: {
    handleSelect(selectedValue) {
      const selection = this.column.selections.find(
        selection => selection.value === selectedValue
      );

      if (selection && selection.onClick) {
        selection.onClick();
      }

      this.showPopper = false;
    },

    handleMouseEnter() {
      clearTimeout(this._timer);
      this.showPopper = true;
    },
    handleMouseLeave() {
      this._timer = setTimeout(() => {
        this.showPopper = false;
      }, 200);
    }
  }
};
</script>

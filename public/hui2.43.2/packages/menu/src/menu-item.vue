<template>
  <li
    :style="paddingStyle"
    :class="{
      'is-active': active,
      'is-disabled': disabled
    }"
    :title="
      rootMenu.mode === 'vertical' &&
        !rootMenu.collapse &&
        !disabled &&
        (isIe || textEllipsis) &&
        $slots.default &&
        $slots.default[0].text
    "
    class="el-menu-item"
    @click="handleClick"
  >
    <el-tooltip
      v-if="parentMenu === rootMenu && rootMenu.collapse"
      effect="dark"
      placement="right"
      popper-class="tooltip-for-menu-item"
    >
      <div slot="content">
        {{ $slots.default[0].text }}
      </div>
      <div class="el-menu-item__collapse">
        <i v-if="$slots.icon" class="el-menu-icon is-slot">
          <slot name="icon" />
        </i>
        <i v-else-if="icon" :class="icon" class="el-menu-icon" />
        <span class="el-menu-item--text">
          <slot />
        </span>
      </div>
    </el-tooltip>
    <template v-else>
      <i v-if="$slots.icon" class="el-menu-icon is-slot">
        <slot name="icon" />
      </i>
      <i v-else-if="icon" :class="icon" class="el-menu-icon" />
      <span class="el-menu-item--text">
        <slot />
      </span>
    </template>
  </li>
</template>
<script>
import Menu from './menu-mixin';
import Emitter from 'hui/src/mixins/emitter';
import ElTooltip from 'hui/packages/tooltip';
import {
  addResizeListener,
  removeResizeListener
} from 'hui/src/utils/resize-event';

export default {
  name: 'ElMenuItem',

  componentName: 'ElMenuItem',

  components: {
    ElTooltip
  },

  mixins: [Menu, Emitter],
  props: {
    index: {
      type: String,
      required: true
    },
    route: {
      type: Object,
      required: false,
      default: null
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    icon: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isIe: false,
      textEllipsis: false
    };
  },
  computed: {
    active() {
      return this.index === this.rootMenu.activeIndex;
    }
  },
  created() {
    this.parentMenu.addItem(this);
    this.rootMenu.addItem(this);
  },
  mounted() {
    addResizeListener(this.$el, this.setTextEllipsis);
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIe = true;
    }
  },
  beforeDestroy() {
    this.parentMenu.removeItem(this);
    this.rootMenu.removeItem(this);
    removeResizeListener(this.$el, this.setTextEllipsis);
  },
  methods: {
    handleClick() {
      if (!this.disabled) {
        this.dispatch('ElMenu', 'item-click', this);
        this.$emit('click', this);
      }
    },
    setTextEllipsis() {
      const $text = this.$el.querySelector('.el-menu-item--text');
      if (!$text || !$text.parentNode) return;
      const gutter = 60; // 菜单项左右的间距
      this.textEllipsis =
        $text.offsetWidth >= $text.parentNode.offsetWidth - gutter;
    }
  }
};
</script>

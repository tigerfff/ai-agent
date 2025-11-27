<template>
  <li
    :class="{
      'is-disabled': disabled,
      'el-dropdown-menu__item--divided': divided
    }"
    :aria-disabled="disabled"
    :tabindex="disabled ? null : -1"
    class="el-dropdown-menu__item"
    @click="handleClick"
  >
    <slot />
  </li>
</template>
<script>
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElDropdownItem',

  mixins: [Emitter],

  props: {
    command: {
      type: null,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    divided: {
      type: Boolean,
      default: null
    }
  },

  methods: {
    handleClick() {
      this.dispatch('ElDropdown', 'menu-item-click', [this.command, this]);
    }
  }
};
</script>

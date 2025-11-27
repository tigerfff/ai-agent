<template>
  <li class="el-menu-item-group">
    <div
      :style="{ paddingLeft: levelPadding + 'px' }"
      class="el-menu-item-group__title"
    >
      <template v-if="!$slots.title">
        {{ title }}
      </template>
      <slot v-else name="title" />
    </div>
    <ul>
      <slot />
    </ul>
  </li>
</template>
<script>
export default {
  name: 'ElMenuItemGroup',

  componentName: 'ElMenuItemGroup',

  inject: ['rootMenu'],
  props: {
    title: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      paddingLeft: 10
    };
  },
  computed: {
    levelPadding() {
      let padding = 10;
      let subPadding = 26; // 子菜单额外缩进距离
      let parent = this.$parent;

      // 无图标
      if (!this.icon) {
        padding = 22;
        subPadding = 0;
      }

      if (this.rootMenu.collapse) return 16;
      while (parent && parent.$options.componentName !== 'ElMenu') {
        if (parent.$options.componentName === 'ElSubmenu') {
          padding += 10;
        }
        parent = parent.$parent;
        // 增加子菜单的缩进距离
        if (parent && parent.$options.componentName === 'ElMenu') {
          padding += subPadding;
        }
      }
      padding === 10 && (padding = 10);
      return padding;
    }
  }
};
</script>

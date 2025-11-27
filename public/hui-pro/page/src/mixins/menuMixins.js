export default {
  inject: ['$pageMenu'],
  computed: {
    // 子菜单和菜单项 padding-left 值
    itemPaddingLeft() {
      let gutter = 12;
      let parent = this.$parent;
      // 菜单收起时，不需要设置 padding-left 值
      if (this.$pageMenu.isCollapse) {
        return null;
      }
      if (parent.$options.name === 'ElMenu') {
        gutter = 12;
      } else {
        gutter = 48; // 第一层子菜单左侧间距，和第一层菜单齐平
        parent = parent.$parent;
        while (parent && parent.$options.name !== 'ElMenu') {
          // 子菜单每层缩进 16px
          if (parent.$options.componentName === 'ElSubmenu') {
            gutter += 16;
          }
          parent = parent.$parent;
        }
      }
      return `${gutter}px`;
    }
  }
};

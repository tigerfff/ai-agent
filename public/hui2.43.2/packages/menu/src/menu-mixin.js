export default {
  computed: {
    indexPath() {
      var path = [this.index];
      var parent = this.$parent;
      while (parent.$options.componentName !== 'ElMenu') {
        if (parent.index) {
          path.unshift(parent.index);
        }
        parent = parent.$parent;
      }
      return path;
    },
    rootMenu() {
      var parent = this.$parent;
      while (parent && parent.$options.componentName !== 'ElMenu') {
        parent = parent.$parent;
      }
      return parent;
    },
    parentMenu() {
      let parent = this.$parent;
      while (
        parent &&
        ['ElMenu', 'ElSubmenu'].indexOf(parent.$options.componentName) === -1
      ) {
        parent = parent.$parent;
      }
      return parent;
    },
    paddingStyle() {
      if (this.rootMenu.mode !== 'vertical') return {};

      let gutter = 12;
      let parent = this.$parent;

      if (this.rootMenu.collapse || !parent) {
        return {};
      } else {
        if (parent.$options.componentName === 'ElSubmenu') {
          gutter = 48; // 第一层子菜单左侧间距，和第一层菜单齐平
          parent = parent.$parent;
          while (parent && parent.$options.componentName !== 'ElMenu') {
            // 子菜单每层缩进 16px
            if (parent.$options.componentName === 'ElSubmenu') {
              gutter += 16;
            }
            parent = parent.$parent;
          }
        } else {
          gutter = this.icon || this.$slots.icon ? 12 : 24; // 第一层菜单左侧间距
        }
        return { paddingLeft: gutter + 'px' };
      }
    }
  }
};

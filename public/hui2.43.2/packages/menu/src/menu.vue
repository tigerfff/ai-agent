<template>
  <el-menu-collapse-transition>
    <ul
      :key="+collapse"
      :class="{
        'el-menu--horizontal': mode === 'horizontal',
        'el-menu--collapse': collapse
      }"
      class="el-menu"
    >
      <slot name="menu-top" />
      <li
        v-if="collapseBtn"
        class="el-menu--colloase-btn"
        @click="collapseMenu"
      >
        <div class="el-submenu__title">
          <i class="el-menu-icon h-icon-menu_leftbar" />
        </div>
      </li>
      <slot />
    </ul>
  </el-menu-collapse-transition>
</template>
<script>
import emitter from 'hui/src/mixins/emitter';
import { addClass, removeClass, hasClass } from 'hui/src/utils/dom';

export default {
  name: 'ElMenu',

  componentName: 'ElMenu',

  components: {
    'el-menu-collapse-transition': {
      functional: true,
      render(createElement, context) {
        const data = {
          props: {
            mode: 'out-in'
          },
          on: {
            beforeEnter(el) {
              el.style.opacity = 0.2;
            },

            enter(el) {
              addClass(el, 'el-opacity-transition');
              el.style.opacity = 1;
            },

            afterEnter(el) {
              removeClass(el, 'el-opacity-transition');
              el.style.opacity = '';
            },

            beforeLeave(el) {
              if (!el.dataset) el.dataset = {};

              if (hasClass(el, 'el-menu--collapse')) {
                removeClass(el, 'el-menu--collapse');
                el.dataset.oldOverflow = el.style.overflow;
                el.dataset.scrollWidth = el.scrollWidth;
                addClass(el, 'el-menu--collapse');
              }

              el.style.width = el.scrollWidth + 'px';
              el.style.overflow = 'hidden';
            },

            leave(el) {
              if (!hasClass(el, 'el-menu--collapse')) {
                addClass(el, 'horizontal-collapse-transition');
                el.style.width = '48px';
              } else {
                addClass(el, 'horizontal-collapse-transition');
                el.style.width = el.dataset.scrollWidth + 'px';
              }
            },

            afterLeave(el) {
              removeClass(el, 'horizontal-collapse-transition');
              if (hasClass(el, 'el-menu--collapse')) {
                el.style.width = el.dataset.scrollWidth + 'px';
              } else {
                el.style.width = '48px';
              }
              el.style.overflow = el.dataset.oldOverflow;
            }
          }
        };
        return createElement('transition', data, context.children);
      }
    }
  },

  mixins: [emitter],

  provide() {
    return {
      rootMenu: this
    };
  },

  props: {
    mode: {
      type: String,
      default: 'vertical'
    },
    defaultActive: {
      type: String,
      default: ''
    },
    defaultOpeneds: {
      type: Array,
      default: null
    },
    // theme: {
    //   type: String,
    //   default: 'light'
    // },
    uniqueOpened: {
      type: Boolean,
      default: null
    },
    router: {
      type: Boolean,
      default: null
    },
    menuTrigger: {
      type: String,
      default: 'hover'
    },
    collapse: {
      type: Boolean,
      default: null
    },
    collapseBtn: {
      type: Boolean,
      default: null
    },
    collapseBtnClick: {
      type: Function,
      default: null
    },
    noIcon: {
      type: Boolean,
      default: false
    },
    wrapScroll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeIndex: this.defaultActive,
      openedMenus: this.defaultOpeneds ? this.defaultOpeneds.slice(0) : [],
      openedCollapseMenus: [], // 打开的子菜单
      items: {},
      submenus: {}
    };
  },
  watch: {
    defaultActive(value) {
      const item = this.items[value];
      if (item) {
        this.activeIndex = item.index;
        this.initOpenedMenu();
      } else {
        this.activeIndex = '';
      }
    },
    defaultOpeneds(value) {
      this.openedMenus = value;
    },
    collapse(value) {
      if (value) {
        this.openedMenus = [];
        this.openedCollapseMenus = [];
        this.$emit('fold');
      } else {
        this.$emit('unfold');
      }
    }
  },
  mounted() {
    this.initOpenedMenu();
    this.$on('item-click', this.handleItemClick);
    this.$on('submenu-click', this.handleSubmenuClick);
  },
  methods: {
    addItem(item) {
      this.$set(this.items, item.index, item);
    },
    removeItem(item) {
      delete this.items[item.index];
    },
    addSubmenu(item) {
      this.$set(this.submenus, item.index, item);
    },
    removeSubmenu(item) {
      delete this.submenus[item.index];
    },
    openMenu(index, indexPath) {
      const openedMenus = this.openedMenus;
      if (openedMenus.indexOf(index) !== -1) return;
      // 将不在该菜单路径下的其余菜单收起
      if (this.uniqueOpened) {
        this.openedMenus = openedMenus.filter(index => {
          return indexPath.indexOf(index) !== -1;
        });
      }
      this.openedMenus.push(index);
    },
    closeMenu(index) {
      const i = this.openedMenus.indexOf(index);
      if (i !== -1) {
        this.openedMenus.splice(i, 1);
      }
    },
    // 关闭所有展开的子菜单
    closeCollapseMenu() {
      this.openedCollapseMenus.forEach(index => {
        const i = this.openedMenus.indexOf(index);
        if (i !== -1) {
          this.openedMenus.splice(i, 1);
        }
      });
      this.openedCollapseMenus.length = 0;
    },
    handleSubmenuClick(submenu) {
      const { index, indexPath } = submenu;
      const isOpened = this.openedMenus.indexOf(index) !== -1;

      if (isOpened) {
        this.closeMenu(index);
        this.$emit('close', index, indexPath);
      } else {
        this.openMenu(index, indexPath);
        this.$emit('open', index, indexPath);
      }
    },
    handleItemClick(item) {
      const { index, indexPath } = item;
      this.activeIndex = item.index;
      this.$emit('select', index, indexPath, item);

      if (this.mode === 'horizontal' || this.collapse) {
        this.openedMenus = [];
      }

      if (this.router) {
        this.routeToItem(item, error => {
          if (error) {
            // vue-router 3.1.0+ push/replace cause NavigationDuplicated error
            if (error.name === 'NavigationDuplicated') return;
            console.error(error);
          }
        });
      }
    },
    // 初始化展开菜单
    initOpenedMenu() {
      const index = this.activeIndex;
      const activeItem = this.items[index];
      if (!activeItem || this.mode === 'horizontal' || this.collapse) return;

      const indexPath = activeItem.indexPath;

      // 展开该菜单项的路径上所有子菜单
      indexPath.forEach(index => {
        const submenu = this.submenus[index];
        submenu && this.openMenu(index, submenu.indexPath);
      });
    },
    routeToItem(item, onError) {
      const route = item.route || item.index;
      try {
        this.$router.push(route, () => {}, onError);
      } catch (e) {
        console.error(e);
      }
    },
    collapseMenu() {
      // 由于 prop 是单向绑定的，需要通过调用外部事件来完成
      this.$emit('click-collapse');
      if (this.wrapScroll) {
        this.closeCollapseMenu();
      }
    },
    open(index) {
      const { indexPath } = this.submenus[index.toString()];
      indexPath.forEach(i => this.openMenu(i, indexPath));
    },
    close(index) {
      this.closeMenu(index.toString());
    }
  }
};
</script>

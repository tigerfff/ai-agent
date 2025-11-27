<template>
  <nav
    v-if="(menu && menu.length) || $slots.default"
    :style="{ width: isCollapse ? foldWidth : unfoldWidth }"
    class="h-page-menu"
  >
    <el-scrollbar v-if="menu && menu.length" wrap-class="page-scrollbar__wrap">
      <el-menu
        :default-active="defaultActiveMenu"
        :router="router"
        :collapse="isCollapse"
        :style="{ width: !isCollapse && `${parseInt(unfoldWidth)}px` }"
        :unique-opened="uniqueOpened"
        :default-openeds="defaultOpeneds"
        collapse-btn
        wrap-scroll
        @select="handleSelect"
        @fold="fold"
        @unfold="unfold"
        @click-collapse="clickCollapse"
        @show-collapse="handleShowCollapse"
        @hide-collapse="handleHideCollapse"
      >
        <template v-for="(menuItem, index) in menuData">
          <!-- 是否是分割线 -->
          <template v-if="menuItem.dividing">
            <li :key="index" class="h-page-menu__dividing" />
          </template>
          <template v-else>
            <!-- 有子菜单 -->
            <page-submenu
              v-if="menuItem.children && menuItem.children.length"
              :key="index"
              :router="router"
              :menu-item="menuItem"
            />
            <!-- 无子菜单 -->
            <page-menu-item
              v-else
              :key="index"
              :router="router"
              :menu-item="menuItem"
            />
          </template>
        </template>
      </el-menu>
    </el-scrollbar>
    <template v-else>
      <slot />
    </template>
  </nav>
</template>

<script>
export default {
  name: 'HPageMenu',
  inject: ['page'],
  provide() {
    return {
      $pageMenu: this
    };
  },
  props: {
    menu: {
      type: Array,
      default: null
    },
    menuCollapse: {
      type: Boolean,
      default: null
    },
    // 菜单折叠宽度
    foldWidth: {
      type: String,
      default: '48px'
    },
    // 菜单展开宽度
    unfoldWidth: {
      type: String,
      default: '240px'
    },
    // 是否只保持一个子菜单的展开
    uniqueOpened: {
      type: Boolean,
      default: false
    },
    // 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转
    router: {
      type: Boolean,
      default: true
    },
    // 当前打开的 submenu 的 key 数组
    defaultOpeneds: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      menuData: [], // 菜单数据
      isCollapse: this.menuCollapse === null ? false : this.menuCollapse // 菜单是否收起
    };
  },
  computed: {
    // 获取菜单状态
    pageMenuCollapse() {
      return this.page.menuCollapse;
    },
    // 获取激活的菜单
    defaultActiveMenu() {
      const path = this.$route.path;
      let activeMenu = '';
      // 递归遍历菜单，找出当前选中的菜单
      const traverse = menu => {
        if (activeMenu !== '') {
          return;
        }
        for (let i = 0; i < menu.length; i++) {
          // 有子菜单则直接遍历子菜单
          if (menu[i].children && menu[i].children.length) {
            traverse(menu[i].children);
            if (activeMenu) return;
          } else if (menu[i].router) {
            if (
              menu[i].router === path ||
              menu[i].alias === path ||
              path.includes(menu[i].router + '/') ||
              (menu[i].router.indexOf(path) === 0 && path !== '/')
            ) {
              activeMenu = menu[i].router;
              return;
            }
          }
        }
      };
      traverse(this.menu);
      return activeMenu;
    }
  },
  watch: {
    // 监听菜单状态
    pageMenuCollapse(isCollapse) {
      this.isCollapse = isCollapse;
    },
    menu(data) {
      this.updateMenu();
    }
  },
  created() {
    if (this.menuCollapse !== null) {
      this.page.menuCollapse = this.menuCollapse;
      this.page.hasDefaultMenuCollapse = true;
    }
    this.page.menuFoldWidth = parseInt(this.foldWidth);
    this.page.menuExpandWidth = parseInt(this.unfoldWidth);
    this.updateMenu();
  },
  destroyed() {
    this.page.menuExist = false;
  },
  methods: {
    clickCollapse() {
      this.isCollapse = !this.isCollapse;
      this.$emit('click-collapse');
    },
    updateMenu() {
      if ((this.menu && this.menu.length) || this.$slots.default) {
        this.page.menuExist = true;
        this.formatMenu(this.menu);
      } else {
        this.page.menuExist = false;
      }
    },
    /**
     * @desc 格式化菜单数据
     * @author chenguanbin
     * @param {Array} menu 菜单数据
     */
    formatMenu(menu) {
      if (!menu || !menu.length) return;
      // 若数据中没有字段 group，则不需要格式化数据
      if (!menu.some(item => item.group !== undefined)) {
        this.menuData = menu;
        return;
      }
      this.menuData = [];
      let groupName = menu[0].group;
      menu.forEach(item => {
        if (groupName !== item.group) {
          groupName = item.group;
          this.menuData.push({
            dividing: true
          });
        }
        this.menuData.push(item);
      });
    },
    /**
     * @desc 菜单折叠事件
     * @author chenguanbin
     */
    fold() {
      this.page.menuCollapse = true;
      this.$emit('fold');
      this.$emit('collapse', true);
    },
    /**
     * @desc 菜单展开事件
     * @author chenguanbin
     */
    unfold() {
      this.page.menuCollapse = false;
      this.$emit('unfold');
      this.$emit('collapse', false);
    },

    /**
     * @author chenguanbin
     * @date 2019-11-08 14:17:04
     * @desc 菜单选中事件
     */

    handleSelect(index, indexPath, item) {
      this.$emit('select', index, indexPath, item);
    },

    /**
     * @author chenguanbin
     * @date 2019-11-08 14:21:03
     * @desc 折叠菜单显示事件
     */

    handleShowCollapse(el) {
      this.$emit('show-collapse', el);
    },

    /**
     * @author chenguanbin
     * @date 2019-11-08 14:21:14
     * @desc 折叠菜单隐藏事件
     */

    handleHideCollapse(el) {
      this.$emit('hide-collapse', el);
    }
  }
};
</script>

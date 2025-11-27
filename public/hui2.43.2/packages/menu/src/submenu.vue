<template>
  <li
    :class="{
      'el-submenu': true,
      'is-active': active,
      'is-opened': opened,
      'is-disabled': disabled
    }"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <div
      ref="submenu-title"
      :style="paddingStyle"
      :title="
        !rootMenu.collapse && !disabled && (isIe || textEllipsis) && title
      "
      class="el-submenu__title"
      @click="handleClick"
    >
      <i v-if="$slots.icon" class="el-menu-icon is-slot">
        <slot name="icon" />
      </i>
      <i v-else-if="icon" :class="icon" class="el-menu-icon"></i>
      <span v-if="$slots.title" class="el-submenu__title--text">
        <slot name="title" />
      </span>
      <span v-else class="el-submenu__title--text">{{ title }}</span>
      <i
        :class="{
          'el-submenu__icon-arrow': true,
          'h-icon-angle_down_sm':
            rootMenu.mode === 'horizontal' ||
            (rootMenu.mode === 'vertical' && !rootMenu.collapse),
          'h-icon-angle_right_sm':
            rootMenu.mode === 'vertical' && rootMenu.collapse
        }"
      />
    </div>
    <template v-if="rootMenu.mode === 'horizontal'">
      <transition :name="menuTransitionName">
        <ul v-show="opened" class="el-menu">
          <slot />
        </ul>
      </transition>
    </template>
    <template v-else-if="rootMenu.mode === 'vertical' && rootMenu.collapse">
      <transition :name="menuTransitionName">
        <ul v-show="opened" v-if="!rootMenu.wrapScroll" class="el-menu">
          <li v-if="title && level === 1" class="el-submenu__collpase-title">
            {{ title }}
          </li>
          <slot />
        </ul>
        <el-menu-collapse
          v-show="opened"
          v-else
          ref="collapseMenu"
          :root-menu="rootMenu"
          @mouse-enter="handleMouseenter"
          @leave-collapse="leaveCollapse"
        >
          <li v-if="title && level === 1" class="el-submenu__collpase-title">
            {{ title }}
          </li>
          <slot />
        </el-menu-collapse>
      </transition>
    </template>
    <el-collapse-transition v-else>
      <ul v-show="opened" class="el-menu">
        <slot />
      </ul>
    </el-collapse-transition>
  </li>
</template>
<script>
import ElCollapseTransition from 'hui/src/transitions/collapse-transition';
import menuMixin from './menu-mixin';
import Emitter from 'hui/src/mixins/emitter';
import { closest } from 'hui/src/utils/dom';
import {
  addResizeListener,
  removeResizeListener
} from 'hui/src/utils/resize-event';

const HIDE_TIME = 20;

export default {
  name: 'ElSubmenu',

  componentName: 'ElSubmenu',

  components: { ElCollapseTransition },

  mixins: [menuMixin, Emitter],

  props: {
    index: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      isIe: false,
      timeout: null,
      items: {},
      submenus: {},
      collapseEl: null, // 折叠元素
      textEllipsis: false,
      level: 1,
      hideTimer: null
    };
  },

  computed: {
    menuTransitionName() {
      return this.rootMenu.collapse ? 'el-zoom-in-left' : 'el-zoom-in-top';
    },
    opened() {
      return this.rootMenu.openedMenus.indexOf(this.index) > -1;
    },
    active: {
      cache: false,
      get() {
        let isActive = false;
        const submenus = this.submenus;
        const items = this.items;

        Object.keys(items).forEach(index => {
          if (items[index].active) {
            isActive = true;
          }
        });

        Object.keys(submenus).forEach(index => {
          if (submenus[index].active) {
            isActive = true;
          }
        });

        return isActive;
      }
    }
  },

  watch: {
    opened(val) {
      const { rootMenu } = this;
      if (rootMenu.menuTrigger === 'hover' && rootMenu.mode === 'horizontal') {
        const { index, indexPath } = this;
        val
          ? rootMenu.$emit('open', index, indexPath)
          : rootMenu.$emit('close', index, indexPath);
      }
    }
  },

  created() {
    // 获取上级子菜单
    const $subMenu = this.rootMenu.wrapScroll
      ? this.$parent.$parent
      : this.$parent;
    // 第一个子菜单level为1，嵌套子菜单递增
    this.level = $subMenu.level ? $subMenu.level + 1 : 1;
    this.parentMenu.addSubmenu(this);
    this.rootMenu.addSubmenu(this);
  },
  mounted() {
    addResizeListener(this.$el, this.setTextEllipsis);
    if (!!window.ActiveXObject || 'ActiveXObject' in window) {
      this.isIe = true;
    }
  },
  beforeDestroy() {
    this.parentMenu.removeSubmenu(this);
    this.rootMenu.removeSubmenu(this);
    removeResizeListener(this.$el, this.setTextEllipsis);
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
    handleClick() {
      const { rootMenu } = this;
      if (
        (rootMenu.menuTrigger === 'hover' && rootMenu.mode === 'horizontal') ||
        (rootMenu.collapse && rootMenu.mode === 'vertical') ||
        this.disabled
      ) {
        return;
      }
      this.dispatch('ElMenu', 'submenu-click', this);
    },
    handleMouseenter(event) {
      const { rootMenu } = this;
      if (
        (rootMenu.menuTrigger === 'click' && rootMenu.mode === 'horizontal') ||
        (!rootMenu.collapse && rootMenu.mode === 'vertical') ||
        this.disabled
      ) {
        return;
      }

      const fromElement = event.fromElement || event.originalTarget;
      // 若从滚动条移动到菜单（菜单使用滚动条控件的情况）
      if (
        closest(fromElement, '.el-scrollbar__bar') ||
        closest(fromElement, '.el-scrollbar__thumb')
      ) {
        this.rootMenu.closeCollapseMenu();
      }

      // 打开菜单
      clearTimeout(this.hideTimer);
      this.rootMenu.openMenu(this.index, this.indexPath);

      // 属性 wrapScroll 为 true，且不存在 collapseEl
      // 或者存在 collapseEl，但收缩菜单未打开（解决菜单会重叠问题）
      if (
        (rootMenu.wrapScroll && this.$refs.collapseMenu && !this.collapseEl) ||
        (this.collapseEl &&
          this.rootMenu.openedCollapseMenus.indexOf(this.index) === -1)
      ) {
        // 加载收缩菜单
        this.collapseEl = this.$refs.collapseMenu.loadCollapseMenu();
        if (this.rootMenu.openedCollapseMenus.indexOf(this.index) === -1) {
          // 将index加入到子菜单数组中
          this.rootMenu.openedCollapseMenus.push(this.index);
        }
      }
    },
    handleMouseleave(event) {
      const { rootMenu } = this;
      const activeIndex = this.index;
      if (
        (rootMenu.menuTrigger === 'click' && rootMenu.mode === 'horizontal') ||
        (!rootMenu.collapse && rootMenu.mode === 'vertical')
      ) {
        return;
      }

      // 关闭菜单
      this.hideTimer = setTimeout(() => {
        this.rootMenu.closeMenu(activeIndex);
      }, HIDE_TIME);

      if (rootMenu.wrapScroll) {
        // 处理firefox兼容性（chrome 为 toElement，firefox 为 relatedTarget）
        const toElement = event.toElement || event.relatedTarget;

        // 若移动到自身的子菜单上
        if (
          this.$refs.collapseMenu &&
          closest(toElement, '.el-menu-collapse-wrap') ===
            this.$refs.collapseMenu.$el
        ) {
          return;
        }

        // 若移动到滚动条上（菜单使用滚动条控件的情况）
        if (
          closest(toElement, '.el-scrollbar__bar') ||
          closest(toElement, '.el-scrollbar__thumb')
        ) {
          return;
        }
      }

      // 关闭收缩菜单
      if (rootMenu.wrapScroll) this.emitHideCollapse();
    },

    // 鼠标离开子菜单后
    leaveCollapse(event) {
      const toElement = event.toElement || event.relatedTarget;
      const activeIndex = this.index;
      // 若鼠标没有回到菜单，则关闭所有子菜单
      if (
        closest(toElement, '.el-menu') == null &&
        closest(toElement, '.el-menu-collapse-wrap') === null
      ) {
        this.rootMenu.closeCollapseMenu();
      }
      // 若鼠标没回到父菜单，则关闭当前子菜单
      if (closest(toElement, '.el-submenu') !== this.$el) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.rootMenu.closeMenu(activeIndex);
          this.emitHideCollapse();
        }, 100);
      }
    },

    // 触发隐藏折叠菜单事件
    emitHideCollapse() {
      this.rootMenu.$emit('hide-collapse', this.collapseEl);
      this.collapseEl = null;
    },

    /**
     * @desc 判断文本是否超长，超长则显示省略号
     * @author chenguanbin
     */
    setTextEllipsis() {
      const $text = this.$el.querySelector('.el-submenu__title--text');
      if (!$text || !$text.parentNode) return;
      const gutter = 84; // 菜单项左右的间距
      this.textEllipsis =
        $text.offsetWidth > $text.parentNode.offsetWidth - gutter;
    }
  }
};
</script>

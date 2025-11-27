<template>
  <el-submenu
    ref="submenu"
    :index="menuItem.index || UUIDGenerator()"
    :icon="menuItem.icon"
    :title="menuItem.title"
    :disabled="menuItem.disabled"
  >
    <template v-for="(subItem, index) in menuItem.children">
      <page-submenu
        v-if="subItem.children && subItem.children.length"
        :key="index"
        :router="router"
        :menu-item="subItem"
      />
      <page-menu-item
        v-else
        :key="`subMenu_${index}`"
        :router="router"
        :menu-item="subItem"
      />
    </template>
  </el-submenu>
</template>

<script>
import menuMixins from './mixins/menuMixins.js';

export default {
  name: 'PageSubmenu',
  mixins: [menuMixins],
  props: {
    router: {
      type: Boolean,
      default: false
    },
    menuItem: {
      type: Object,
      default: null
    }
  },
  mounted() {
    const $titleEl = this.$refs.submenu.$el.querySelector('.el-submenu__title');
    $titleEl.style.paddingLeft = this.itemPaddingLeft;
  },
  methods: {
    /**
     * @author chenguanbin
     * @date 2020-08-26 11:46:09
     * @desc 生成 UUID
     */
    UUIDGenerator() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (
          c ^
          (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
        ).toString(16)
      );
    }
  }
};
</script>

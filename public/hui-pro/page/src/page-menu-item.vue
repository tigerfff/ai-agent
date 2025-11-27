<template>
  <el-menu-item
    :index="(router ? menuItem.router : menuItem.index) || 'no-router'"
    :icon="menuItem.icon"
    :disabled="menuItem.disabled"
    :style="{ paddingLeft: itemPaddingLeft }"
  >
    {{ menuItem.title }}
  </el-menu-item>
</template>

<script>
import menuMixins from './mixins/menuMixins.js';

export default {
  name: 'PageMenuItem',
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
  }
};
</script>

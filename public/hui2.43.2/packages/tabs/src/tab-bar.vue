<template>
  <div
    :class="`is-${rootTabs.tabPosition}`"
    :style="barStyle"
    class="el-tabs__active-bar"
  />
</template>
<script>
import { arrayFind } from 'hui/src/utils/util';
export default {
  name: 'TabBar',
  props: {
    tabs: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  inject: ['rootTabs'],
  computed: {
    barStyle: {
      get() {
        const style = {};
        let offset = 0;
        let tabSize = 0;
        const sizeName =
          ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) !== -1
            ? 'width'
            : 'height';
        const sizeDir = sizeName === 'width' ? 'x' : 'y';
        const firstUpperCase = str => {
          return str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
        };
        // 此处取走了index, 因下面的语句块并未使用到Index
        this.tabs.every(tab => {
          const $el = arrayFind(
            this.$parent.$refs.tabs || [],
            t => t.id.replace('tab-', '') === tab.paneName
          );
          if (!$el) {
            return false;
          }
          if (!tab.active) {
            offset += $el[`client${firstUpperCase(sizeName)}`];
            return true;
          } else {
            tabSize = $el[`client${firstUpperCase(sizeName)}`];
            // if (sizeName === 'width' && this.tabs.length > 1) {
            //   tabSize -= index === 0 || index === this.tabs.length - 1 ? 0 : 24;
            // }
            return false;
          }
        });
        if (sizeName === 'width' && offset !== 0) {
          // offset += 24;
        }
        const transform = `translate${firstUpperCase(sizeDir)}(${offset}px)`;
        style[sizeName] = tabSize + 'px';
        style.transform = transform;
        style.msTransform = transform;
        style.webkitTransform = transform;
        return style;
      }
    }
  }
};
</script>

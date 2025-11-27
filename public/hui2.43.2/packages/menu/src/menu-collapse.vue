<template>
  <div
    class="el-menu-collapse-wrap"
    style="transition: all .2s;
"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <ul :class="{ 'el-menu--dark': rootMenu.theme === 'dark' }" class="el-menu">
      <slot />
    </ul>
  </div>
</template>

<script>
import { getOffset, getCollapseHeight } from './util';
import { closest } from 'hui/src/utils/dom';

export default {
  name: 'ElMenuCollapse',
  componentName: 'ElMenuCollapse',
  props: {
    rootMenu: { type: Object, default: null }
  },
  data() {
    return {
      open: false
    };
  },
  mounted() {},
  methods: {
    handleMouseenter(event) {
      this.$emit('mouse-enter', event);
    },
    handleMouseleave(event) {
      const toElement = event.toElement || event.relatedTarget;
      // 若鼠标未移动到子菜单上，则触发事件
      if (closest(toElement, '.el-menu-collapse-wrap') === null) {
        this.$emit('leave-collapse', event);
      }
    },
    loadCollapseMenu() {
      let isExistNode = false;
      const nodes = Array.prototype.slice.call(document.body.childNodes);
      // 判断节点是否已经添加到body下
      if (nodes && nodes.length) {
        nodes.forEach(node => {
          if (node === this.$el) {
            isExistNode = true;
          }
        });
      }
      // 若节点未添加到body下
      if (!isExistNode) {
        document.body.appendChild(this.$el);
      }

      // 每次打开重新计算位置
      const parent = this.$parent.$el;
      const parentOffset = getOffset(parent); // 父节点距离页面顶部的距离
      const parentClientTop = parent.getBoundingClientRect().top; // 父节点相对于浏览器左上角的距离

      const collapseHeight = getCollapseHeight(this.$el.childNodes[0]); // 折叠菜单高度
      const clientHeight = document.body.clientHeight; // 页面的可视高度

      const wrapScrollTop =
        document.getElementsByTagName('html')[0].scrollTop ||
        document.body.scrollTop; // 外层滚动条的滚动距离（html/body）(在HUIdemo网站上该值会过大)

      let gutter = 0; // top值偏移量

      // 若底部控件不足，则向上偏移
      if (parentClientTop + collapseHeight >= clientHeight) {
        gutter =
          parentClientTop + collapseHeight - clientHeight + wrapScrollTop + 2;
      }

      // 计算折叠子菜单的 top/left 值
      this.$el.style.top = parentOffset.top - gutter + 'px';
      this.$el.style.left = parentOffset.left + parent.offsetWidth + 'px';

      setTimeout(() => {
        this.rootMenu.$emit('show-collapse', this.$el);
      }, 300);

      return this.$el;
    }
  }
};
</script>

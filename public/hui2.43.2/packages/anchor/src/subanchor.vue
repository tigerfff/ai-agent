<template>
  <div :class="{ 'is-expand': expand }" class="h-subanchor">
    <div class="h-subanchor-item">
      <span class="h-subanchor__point" />
      <a
        :href="href"
        :data-scroll-offset="scrollOffset"
        :data-href="href"
        :title="title"
        :style="{ 'padding-left': `${level * 16 + 36}px` }"
        class="h-subanchor__title"
      >
        {{ title }}
      </a>
    </div>
    <div class="h-subanchor__content">
      <slot />
    </div>
  </div>
</template>

<script>
import { findComponentsDownward } from './util';
export default {
  name: 'HSubanchor',
  inject: ['anchor'],
  props: {
    href: { type: String, default: null },
    title: { type: String, default: null },
    scrollOffset: {
      type: Number,
      default() {
        return this.anchor.scrollOffset;
      }
    },
    isCurrent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      level: 0,
      expand: false
    };
  },
  computed: {
    active() {
      return (
        this.href === this.anchor.currentLink ||
        (this.anchor.currentLink === '#' && this.isCurrent)
      );
    }
  },
  watch: {
    active(val) {
      this.expand = val;
      this.handleParentAction(this, 'HSubanchor', 'getChildrenActive');
    }
  },
  mounted() {
    this.setAnchorLevel(this, 'HSubanchor');
  },
  methods: {
    setAnchorLevel(context, name) {
      const parent = context.$parent;
      if (parent.$options.name === name) {
        this.level++;
        this.setAnchorLevel(parent, name);
      }
    },
    getChildrenActive() {
      const children = findComponentsDownward(this, [
        'HAnchorLink',
        'HSubanchor'
      ]);
      this.expand =
        children.some(item => item.active) ||
        this.anchor.currentLink === this.href;
    },
    handleParentAction(context, name, actionName) {
      const parent = context.$parent;
      if (parent && parent.$options.name === name) {
        parent[actionName]();
      }
      if (parent) {
        this.handleParentAction(parent, name, actionName);
      }
    }
  }
};
</script>

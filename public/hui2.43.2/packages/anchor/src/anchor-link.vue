<template>
  <div
    ref="anchorLink"
    :class="[
      'h-anchor-link',
      active ? `is-active` : '',
      hasChildren && 'is-parent'
    ]"
  >
    <span class="h-anchor-link__point" />
    <a
      :href="href"
      :data-scroll-offset="scrollOffset"
      :data-href="href"
      :title="title"
      :style="{ 'padding-left': `${level * 16 + 36}px` }"
      class="h-anchor-link__title"
      @click="goAnchor"
    >
      {{ title }}
    </a>
    <slot />
  </div>
</template>
<script>
import { findComponentsDownward } from './util';

export default {
  name: 'HAnchorLink',
  inject: ['anchor'],
  props: {
    href: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
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
      hasChildren: false,
      level: 0,
      width: 0
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
      this.handleParentAction(this, 'HSubanchor', 'getChildrenActive');
    }
  },
  mounted() {
    if (findComponentsDownward(this, 'HAnchorLink').length) {
      this.hasChildren = true;
    }

    this.setAnchorLevel(this, 'HSubanchor');

    this.getWidth();
  },
  methods: {
    getWidth() {
      this.width = this.$refs.anchorLink.clientWidth;
    },

    goAnchor() {
      const noChange = this.active;
      this.anchor.$emit('on-select', this.href);
      const isRoute = this.$router;
      if (isRoute) {
        // 不需要引入多余包处理
        const query = this.$route.query;
        const queryParams = new URLSearchParams(query);
        this.$router.replace(this.$route.path + '?' + queryParams + this.href);
      } else {
        const location = window.location;
        window.location.href =
          location.origin + location.pathname + location.search + this.href;
      }

      if (noChange) {
        this.anchor.handleHashChange();
        this.anchor.handleScrollTo();
      }
    },

    setAnchorLevel(context, name) {
      const parent = context.$parent;
      if (parent.$options.name === name) {
        this.level++;
        this.setAnchorLevel(parent, name);
      }
    },

    setAnchorProp(context, name, prop, val) {
      const parent = context.$parent;
      if (parent && parent.$options.name === name) {
        parent[prop] = val;
      }
      if (parent) {
        this.setAnchorProp(parent, name, prop, val);
      }
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

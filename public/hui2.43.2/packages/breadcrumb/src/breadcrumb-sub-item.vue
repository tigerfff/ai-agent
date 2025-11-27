<template>
  <el-dropdown-item
    v-if="type === 'dropdown'"
    :command="to"
    :class="[to ? '' : 'el-breadcrumb__item__unclickable']"
  >
    <slot />
  </el-dropdown-item>
  <el-breadcrumb-item
    v-else
    :to="to"
    :separator-class="separatorClass"
    :max-width="maxWidth"
    @click="goto"
  >
    <slot />
  </el-breadcrumb-item>
</template>
<script>
export default {
  name: 'ElBreadcrumbSubItem',
  props: {
    to: {
      type: null,
      default: null
    },
    separator: {
      type: String,
      default: ''
    },
    separatorClass: {
      type: String,
      default: ''
    },
    replace: {
      type: Boolean,
      default: null
    },
    // 面包屑子项最大宽度
    maxWidth: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      type: ''
    };
  },
  mounted() {
    this.type = this.$parent.$attrs.type;
  },
  methods: {
    goto() {
      const { to, $router } = this;
      if (!to || !$router) return;
      self.replace ? $router.replace(to) : $router.push(to);
    }
  }
};
</script>

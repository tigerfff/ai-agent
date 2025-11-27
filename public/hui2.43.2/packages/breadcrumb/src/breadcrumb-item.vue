<template>
  <span
    :class="[
      'el-breadcrumb__item',
      to ? '' : 'el-breadcrumb__item__unclickable'
    ]"
  >
    <el-dropdown
      v-if="type === 'dropdown'"
      trigger="click"
      placement="bottom-start"
      @command="gotoBread"
    >
      <el-button
        type="iconButton"
        icon="h-icon-more_hori"
        class="el-breadcrumb__item__omit"
      />
      <el-dropdown-menu
        slot="dropdown"
        :type="type"
        class="el-breadcrumb__dropdown__menu"
      >
        <slot />
      </el-dropdown-menu>
    </el-dropdown>
    <el-popover
      v-else-if="type === 'tooltip'"
      placement="top"
      trigger="hover"
      effect="light"
      popper-class="el-tooltip__contain--breadcrumb"
    >
      <el-button
        slot="reference"
        type="iconButton"
        icon="h-icon-more_hori"
        class="el-breadcrumb__item__omit"
      />
      <!-- <template > -->
      <el-breadcrumb :item-max-width="subMaxWidth">
        <slot />
      </el-breadcrumb>
      <!-- </template> -->
    </el-popover>
    <span
      v-else
      ref="link"
      :style="{ 'max-width': linkMaxWidth }"
      :title="linkTitle"
      role="link"
      class="el-breadcrumb__item__inner"
    >
      <slot />
    </span>
    <span :class="['el-breadcrumb__separator', separatorClass]">
      {{ separator }}
    </span>
  </span>
</template>
<script>
export default {
  name: 'ElBreadcrumbItem',
  inject: ['breadcrumb'],
  props: {
    to: {
      type: null,
      default: null
    },
    replace: {
      type: Boolean,
      default: null
    },
    type: {
      type: String,
      default: ''
    },
    // 面包屑子项最大宽度
    maxWidth: {
      type: [String, Number],
      default: null
    },
    // 被收起的面包屑子项最大宽度
    subMaxWidth: {
      type: [String, Number],
      default: null
    },
    itemClick: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      separator: '',
      separatorClass: '',
      ellipsisItems: [],
      linkTitle: ''
    };
  },
  computed: {
    // 子项最大宽度，优先级：自身 maxWidth > 父级 itemMaxWidth
    linkMaxWidth() {
      if (this.maxWidth) return `${parseInt(this.maxWidth)}px`;
      else if (this.breadcrumb.itemMaxWidth)
        return `${parseInt(this.breadcrumb.itemMaxWidth)}px`;
      else return null;
    }
  },
  mounted() {
    // let self = this;
    this.separator = this.breadcrumb.separatorClass.length
      ? ''
      : this.breadcrumb.separator;
    this.separatorClass =
      this.breadcrumb.separatorClass || 'h-icon-angle_right_sm';
    if (this.to || this.itemClick) {
      const link = this.$refs.link;
      link.addEventListener('click', () => {
        const { to, $router, itemClick } = this;
        if (itemClick) {
          itemClick();
        }
        if (!to || !$router) return;
        this.replace ? $router.replace(to) : $router.push(to);
      });
    }
    // 若设置了最大宽度，默认显示 title
    if (this.linkMaxWidth && this.$refs.link)
      this.linkTitle = this.$refs.link.innerText;
  },
  methods: {
    gotoBread(to) {
      const { $router } = this;
      if (!to || !$router) return;
      this.replace ? $router.replace(to) : $router.push(to);
    }
  }
};
</script>

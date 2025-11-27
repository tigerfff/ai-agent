<template>
  <div class="h-page-group">
    <header v-if="title" class="h-page-group__header">
      <span
        v-if="collapsable"
        class="h-page-group__collapse"
        @click="wrapperExpanded = !wrapperExpanded"
      >
        <i
          :class="{ 'is-expanded': wrapperExpanded }"
          class="h-page-group__collapse--icon h-icon-angle_right"
        />
      </span>
      <span class="h-page-group__title">
        {{ title }}
      </span>
      <div v-if="$slots.headerAction" class="h-page-group__header--action">
        <slot name="headerAction" />
      </div>
    </header>
    <el-collapse-transition v-if="collapsable">
      <div v-show="wrapperExpanded" class="h-page-group__main is-collapsable">
        <slot />
      </div>
    </el-collapse-transition>
    <div v-else class="h-page-group__main">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HPageGroup',
  props: {
    // 分组是否可伸缩
    collapsable: {
      type: Boolean,
      default: false
    },
    // 分组可伸缩时，是否为展开状态
    expanded: {
      type: Boolean,
      default: true
    },
    // 标题
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      wrapperExpanded: this.expanded
    };
  },
  watch: {
    // 可以通过外部改变 expanded 来修改分组的展开状态
    expanded(newVal) {
      this.wrapperExpanded = newVal;
    },
    // 监听表单项的展开状态，抛出事件
    wrapperExpanded(newVal) {
      newVal ? this.$emit('open') : this.$emit('close');
    }
  }
};
</script>

<template>
  <div class="el-badge">
    <slot />
    <transition name="el-zoom-in-center">
      <ElTooltip v-if="max && showTip" :content="'' + value" placement="right">
        <sup
          v-show="!hidden && (content || isDot)"
          :class="{ 'is-fixed': $slots.default, 'is-dot': isDot }"
          class="el-badge__content"
          v-text="content"
        />
      </ElTooltip>
      <sup
        v-else
        v-show="!hidden && (content || isDot)"
        :class="{ 'is-fixed': $slots.default, 'is-dot': isDot }"
        class="el-badge__content"
        v-text="content"
      />
    </transition>
  </div>
</template>

<script>
import ElTooltip from 'hui/packages/tooltip';
export default {
  name: 'ElBadge',

  components: {
    ElTooltip
  },

  props: {
    // showTips 最大值存在时，有效；鼠标移至 span 处有提示
    showTip: { type: Boolean, default: false },
    value: { type: null, default: null },
    max: { type: Number, default: null },
    isDot: {
      type: Boolean,
      default: null
    },
    hidden: {
      type: Boolean,
      default: null
    }
  },

  computed: {
    content() {
      if (this.isDot) return;

      const value = this.value;
      const max = this.max;

      if (typeof value === 'number' && typeof max === 'number') {
        return max < value ? `${max}+` : value;
      }

      return value;
    }
  }
};
</script>

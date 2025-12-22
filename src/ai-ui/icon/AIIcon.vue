<template>
  <img 
    class="ai-icon" 
    :src="src"
    :style="iconStyle" 
    v-on="$listeners"
  />
</template>

<script>
/**
 * AIIcon 组件
 * 暂时回退到 img 模式以解决生产环境 mask 属性丢失问题
 * 注意：img 模式下 color 属性将不再生效
 */
export default {
  name: 'AIIcon',
  props: {
    // 图标路径
    src: {
      type: String,
      required: true
    },
    // 图标大小
    size: {
      type: [String, Number],
      default: 16
    },
    // 图标颜色（img 模式下暂不生效，保留 prop 以兼容旧代码）
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  computed: {
    iconStyle() {
      const sizeValue = typeof this.size === 'number' ? `${this.size}px` : this.size;
      return {
        width: sizeValue,
        height: sizeValue,
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain'
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-icon {
  flex-shrink: 0;
}
</style>

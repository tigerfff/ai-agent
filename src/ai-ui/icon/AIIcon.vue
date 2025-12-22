<template>
  <i 
    class="ai-icon" 
    :style="iconStyle" 
    v-on="$listeners"
  ></i>
</template>

<script>
/**
 * AIIcon 组件
 * 使用 CSS Mask 技术实现 SVG 图标变色
 * 支持直接传入图片路径，并可以通过 color 属性或父级 color 样式控制颜色
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
    // 图标颜色，默认跟随父级文字颜色
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  computed: {
    iconStyle() {
      const sizeValue = typeof this.size === 'number' ? `${this.size}px` : this.size;
      const maskUrl = `url("${this.src}")`;
      return {
        width: sizeValue,
        height: sizeValue,
        backgroundColor: this.color,
        // 使用 mask-image 将 SVG 路径作为遮罩
        WebkitMaskImage: maskUrl,
        maskImage: maskUrl,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        display: 'inline-block',
        verticalAlign: 'middle'
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

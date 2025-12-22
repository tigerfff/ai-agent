<template>
  <i 
    class="ai-icon" 
    :style="iconStyleString" 
    v-on="$listeners"
  ></i>
</template>

<script>
/**
 * AIIcon 组件
 * 使用 CSS Mask 技术实现 SVG 图标变色
 * 采用字符串拼接方式绑定 style，防止生产环境打包时 mask 属性被过滤
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
    iconStyleString() {
      const sizeValue = typeof this.size === 'number' ? `${this.size}px` : this.size;
      const maskUrl = `url("${this.src}")`;
      
      // 使用数组 join 拼接成字符串，强制让浏览器原样接收 CSS 属性
      // 这种方式可以绕过 Vue 样式对象处理阶段，防止 mask 属性被误删
      return [
        `width: ${sizeValue}`,
        `height: ${sizeValue}`,
        `background-color: ${this.color}`,
        `-webkit-mask-image: ${maskUrl}`,
        `mask-image: ${maskUrl}`,
        `-webkit-mask-size: 100% 100%`,
        `mask-size: 100% 100%`,
        `-webkit-mask-repeat: no-repeat`,
        `mask-repeat: no-repeat`,
        `display: inline-block`,
        `vertical-align: middle`
      ].join('; ');
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-icon {
  flex-shrink: 0;
}
</style>

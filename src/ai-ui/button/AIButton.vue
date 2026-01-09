<template>
  <div 
    class="ai-button"
    :class="{
      'is-disabled': disabled,
      'is-loading': loading
    }"
    @click="handleClick"
  >
    <span v-if="icon" class="icon">
      <img :src="icon" alt="" width="24px">
    </span>
    <span v-if="$slots.default || text">
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'AIButton',
  props: {
    // 按钮文字
    text: {
      type: String,
      default: ''
    },
    // 图标路径
    icon: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(e) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', e);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-button {
  background: linear-gradient(-90deg, #9D83FF 0%, #388EFF 100%);
  width: 108px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  gap: 2px;
  transition: opacity 0.2s;

  &:hover:not(.is-disabled):not(.is-loading) {
    opacity: 0.9;
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.is-loading {
    cursor: wait;
    opacity: 0.8;
  }

  .icon {
    font-size: 14px;
    margin-right: 4px;
    display: flex;
    align-items: center;
  }
}
</style>

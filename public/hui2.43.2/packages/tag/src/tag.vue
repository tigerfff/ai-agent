<template>
  <transition :name="disableTransitions ? '' : 'el-zoom-in-center'">
    <span
      :class="[
        type ? 'el-tag--' + type : '',
        size ? `el-tag--${size}` : '',
        maxWidth ? `el-tag--maxwidth` : '',
        { 'is-hit': hit },
        color ? 'el-tag--custom--color' : '',
        closable ? 'el-tag--closable' : ''
      ]"
      :style="[{ backgroundColor: color }]"
      :title="title"
      class="el-tag"
    >
      <span
        :class="[maxWidth ? `el-tag--maxwidth` : '']"
        :style="[
          maxWidth ? { 'max-width': maxWidth, display: 'inline-block' } : ''
        ]"
      >
        <slot />
      </span>
      <i
        v-if="closable"
        class="el-tag__close h-icon-close"
        @click="handleClose"
      />
    </span>
  </transition>
</template>
<script>
export default {
  name: 'ElTag',
  props: {
    text: {
      type: String,
      default: null
    },
    closable: {
      type: Boolean,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    hit: {
      type: Boolean,
      default: null
    },
    disableTransitions: {
      type: Boolean,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: ''
    },
    maxWidth: {
      type: String,
      default: '200px'
    },
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClose(event) {
      this.$emit('close', event);
    }
  }
};
</script>

<template>
  <div
    :class="{
      'is-dragover': dragover
    }"
    class="el-upload-dragger"
    @drop.prevent="onDrop"
    @dragover.prevent="onDragover"
    @dragleave.prevent="dragover = false"
  >
    <slot />
  </div>
</template>
<script>
export default {
  name: 'ElUploadDrag',
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dragover: false
    };
  },
  methods: {
    onDragover() {
      if (!this.disabled) {
        this.dragover = true;
      }
    },
    onDrop(e) {
      if (!this.disabled) {
        this.dragover = false;
        this.$emit('file', e.dataTransfer.files);
      }
    }
  }
};
</script>

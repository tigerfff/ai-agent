<template>
  <i :class="'h-icon-' + name" />
</template>

<script>
export default {
  name: 'ElIcon',

  props: {
    name: { type: String, default: null }
  }
};
</script>

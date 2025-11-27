<template>
  <i :class="feedbackIcon">
    <span class="path1" />
    <span class="path2" />
  </i>
</template>

<script>
export default {
  name: 'HFeedbackIcon',

  props: {
    iconName: {
      type: String,
      default: undefined
    }
  },

  computed: {
    feedbackIcon() {
      return !this.iconName.includes('h-icon-')
        ? `h-icon-${this.iconName}`
        : this.iconName;
    }
  }
};
</script>

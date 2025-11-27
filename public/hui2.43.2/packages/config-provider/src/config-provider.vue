<script>
export default {
  name: 'ElConfigProvider',
  props: {
    zIndex: {
      type: Number,
      default: 2000
    }
  },
  provide() {
    return {
      configProvider: this
    };
  },
  render() {
    return this.$slots.default ? this.$slots.default[0] : '';
  }
};
</script>

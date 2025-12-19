<template>
  <div
    v-if="!lazy || loaded || active"
    v-show="active"
    :id="`pane-${paneName}`"
    :aria-labelledby="`tab-${paneName}`"
    class="el-tab-pane"
    role="tabpanel"
  >
    <slot />
  </div>
</template>
<script>
export default {
  name: 'ElTabPane',
  componentName: 'ElTabPane',
  props: {
    label: {
      type: String,
      default: ''
    },
    labelIcon: {
      type: String,
      default: ''
    },
    labelContent: {
      type: Function,
      default: () => () => {}
    },
    name: {
      type: String,
      default: ''
    },
    closable: {
      type: Boolean,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: null
    },
    labelMaxWidth: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      index: null,
      loaded: false
    };
  },
  computed: {
    isClosable() {
      return this.closable || this.$parent.closable;
    },
    active() {
      return this.$parent.currentName === (this.name || this.index);
    },
    paneName() {
      return this.name || this.index;
    }
  },
  watch: {
    label() {
      this.$parent.$forceUpdate();
    },
    'this.$parent.currentName'(val) {
      if (val === (this.name || this.index)) this.loaded = true;
    }
  },
  updated() {
    this.$parent.$emit('tab-nav-update');
  }
};
</script>

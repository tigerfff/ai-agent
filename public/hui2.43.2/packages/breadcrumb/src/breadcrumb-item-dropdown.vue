<template>
  <span class="el-breadcrumb__item">
    <span ref="link" class="el-breadcrumb__item__inner"><slot /></span>
    <span :class="['el-breadcrumb__separator', separatorClass]">
      {{ separator }}
    </span>
  </span>
</template>
<script>
export default {
  name: 'ElBreadcrumbItem',
  props: {
    to: {
      type: null,
      default: null
    },
    replace: {
      type: Boolean,
      default: null
    }
  },
  data() {
    return {
      separator: '',
      separatorClass: ''
    };
  },
  mounted() {
    this.separator = this.$parent.separatorClass.length
      ? ''
      : this.$parent.separator;
    this.separatorClass = this.$parent.separatorClass || '';
    var self = this;
    if (this.to) {
      const link = this.$refs.link;
      link.addEventListener('click', () => {
        const to = this.to;
        self.replace ? self.$router.replace(to) : self.$router.push(to);
      });
    }
  }
};
</script>

<template>
  <span class="h-an-icon-loading">
    <span ref="path1" class="path1" />
    <span ref="path2" class="path2" />
    <span ref="path3" class="path3" />
    <span ref="path4" class="path4" />
  </span>
</template>

<script>
export default {
  name: 'ElLoadIcon',
  data() {
    return {
      interval: []
    };
  },
  mounted() {
    if (
      navigator.appName === 'Microsoft Internet Explorer' &&
      navigator.appVersion.split(';')[1].replace(/[ ]/g, '') === 'MSIE9.0' &&
      !this.dataPicker
    ) {
      this.animation({
        time: 0,
        ref: this.$refs.path1
      });
      this.animation({
        time: 600,
        ref: this.$refs.path2
      });
      this.animation({
        time: 800,
        ref: this.$refs.path3
      });
      this.animation({
        time: 1000,
        ref: this.$refs.path4
      });
    }
  },
  beforeDestroy() {
    for (const i in this.interval) {
      this.interval[i] && clearInterval(this.interval[i]);
    }
  },
  methods: {
    scale(scale, ref) {
      ref.style.msTransform = 'scale(' + (1 + scale) + ')';
      ref.style.opacity = 0.3 + scale;
    },
    animation(op) {
      setTimeout(() => {
        let scale = 0;
        let isUp = true;
        const interval = setInterval(() => {
          if (scale === 0.7 || scale > 0.7) {
            isUp = false;
          } else if (scale === 0 || scale < 0) {
            isUp = true;
          }
          scale = isUp ? scale + 0.1 : scale - 0.1;
          this.scale(scale, op.ref);
        }, 80);
        this.interval.push(interval);
      }, op.time);
    }
  }
};
</script>

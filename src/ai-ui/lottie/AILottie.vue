<template>
  <div ref="lottieContainer" class="ai-lottie-container" :style="containerStyle"></div>
</template>

<script>
import lottie from 'lottie-web';

export default {
  name: 'AILottie',
  props: {
    /**
     * 动画数据（JSON 对象或路径）
     */
    animationData: {
      type: [Object, String],
      required: true
    },
    /**
     * 是否自动播放
     */
    autoplay: {
      type: Boolean,
      default: false
    },
    /**
     * 是否循环播放
     */
    loop: {
      type: Boolean,
      default: true
    },
    /**
     * 渲染方式：'svg' | 'canvas' | 'html'
     */
    renderer: {
      type: String,
      default: 'svg'
    },
    /**
     * 容器宽度
     */
    width: {
      type: [Number, String],
      default: null
    },
    /**
     * 容器高度
     */
    height: {
      type: [Number, String],
      default: null
    },
    /**
     * 播放速度（1 = 正常速度）
     */
    speed: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      lottieInstance: null
    };
  },
  computed: {
    containerStyle() {
      const style = {};
      if (this.width) {
        style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
      }
      if (this.height) {
        style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
      }
      return style;
    }
  },
  mounted() {
    this.initAnimation();
  },
  beforeDestroy() {
    this.destroyAnimation();
  },
  watch: {
    animationData: {
      handler() {
        this.destroyAnimation();
        this.$nextTick(() => {
          this.initAnimation();
        });
      },
      deep: true
    },
    autoplay(newVal) {
      if (this.lottieInstance) {
        if (newVal) {
          this.lottieInstance.play();
        } else {
          this.lottieInstance.pause();
        }
      }
    },
    speed(newVal) {
      if (this.lottieInstance) {
        this.lottieInstance.setSpeed(newVal);
      }
    }
  },
  methods: {
    /**
     * 初始化动画
     */
    initAnimation() {
      if (!this.$refs.lottieContainer) {
        return;
      }

      // 如果 animationData 是字符串，则作为路径加载
      const config = {
        container: this.$refs.lottieContainer,
        renderer: this.renderer,
        loop: this.loop,
        autoplay: this.autoplay
      };

      if (typeof this.animationData === 'string') {
        config.path = this.animationData;
      } else {
        config.animationData = this.animationData;
      }

      this.lottieInstance = lottie.loadAnimation(config);
      
      if (this.speed !== 1) {
        this.lottieInstance.setSpeed(this.speed);
      }
    },

    /**
     * 销毁动画
     */
    destroyAnimation() {
      if (this.lottieInstance) {
        this.lottieInstance.destroy();
        this.lottieInstance = null;
      }
    },

    /**
     * 播放动画
     */
    play() {
      if (this.lottieInstance) {
        this.lottieInstance.play();
      }
    },

    /**
     * 暂停动画
     */
    pause() {
      if (this.lottieInstance) {
        this.lottieInstance.pause();
      }
    },

    /**
     * 停止动画
     */
    stop() {
      if (this.lottieInstance) {
        this.lottieInstance.stop();
      }
    },

    /**
     * 跳转到指定帧
     */
    goToAndStop(frame) {
      if (this.lottieInstance) {
        this.lottieInstance.goToAndStop(frame, true);
      }
    },

    /**
     * 跳转到指定帧并播放
     */
    goToAndPlay(frame) {
      if (this.lottieInstance) {
        this.lottieInstance.goToAndPlay(frame, true);
      }
    },

    /**
     * 设置播放速度
     */
    setSpeed(speed) {
      if (this.lottieInstance) {
        this.lottieInstance.setSpeed(speed);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-lottie-container {
  display: flex;
  align-items: center;
  justify-content: center;
  
  ::v-deep svg {
    width: 100%;
    height: 100%;
  }
}
</style>


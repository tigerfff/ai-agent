<template>
  <transition name="el-message-fade">
    <div
      v-show="visible"
      :class="customClass"
      :style="`top:${verticalOffset}px`"
      class="el-message"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <i v-if="iconClass" :class="iconClass" class="el-message__img" />
      <feedback-icon
        v-else
        :icon-name="typeClass"
        class="el-message__typeImg"
      />
      <div :class="{ 'is-with-icon': iconClass }" class="el-message__group">
        <slot>
          <div>
            <p
              v-if="!dangerouslyUseHTMLString"
              :class="[showClose ? 'is-close' : '']"
            >
              {{ message }}
            </p>
            <p v-else :class="[showClose ? 'is-close' : '']" v-html="message" />
          </div>
        </slot>
        <div
          v-if="showClose"
          class="el-message__closeBtn h-icon-close_sm"
          @click="close"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import feedbackIcon from '../../icon/src/feedback-icon.vue';

const typeMap = {
  success: 'feedback_success_md',
  info: 'feedback_info_md',
  warning: 'feedback_warning_md',
  error: 'feedback_error_md'
};

export default {
  components: {
    feedbackIcon
  },
  data() {
    return {
      visible: false,
      message: '',
      duration: 3000,
      type: 'info',
      iconClass: '',
      customClass: '',
      verticalOffset: 0,
      onClose: null,
      showClose: false,
      closed: false,
      timer: null,
      dangerouslyUseHTMLString: false
    };
  },

  computed: {
    typeClass() {
      return this.type && typeMap[this.type]
        ? `h-icon-${typeMap[this.type]}`
        : '';
    }
  },

  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false;
        this.$el.addEventListener('transitionend', this.destroyElement);
      }
    }
  },

  mounted() {
    this.startTimer();
  },

  methods: {
    destroyElement() {
      this.$el.removeEventListener('transitionend', this.destroyElement);
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },

    close() {
      this.closed = true;
      if (typeof this.onClose === 'function') {
        this.onClose(this);
      }
    },

    clearTimer() {
      clearTimeout(this.timer);
    },

    startTimer() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
    }
  }
};
</script>

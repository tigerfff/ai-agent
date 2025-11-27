<template>
  <transition name="el-loading-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      :class="[customClass, { 'is-fullscreen': fullscreen }]"
      class="el-loading-mask"
    >
      <div class="el-loading-spinner">
        <!-- <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none"/>
        </svg> -->
        <!-- <svg viewBox="0 0 80 80" class="circular">
          <g>
            <path class="path" d="m8.923606,28l7,0l-3,25l-7,0"/>
            <path class="path" d="m28,28l7,0l-3,25l-7,0"/>
            <path class="path" d="m47,28l7,0l-3,25l-7,0"/>
            <path class="path" d="m66,28l7,0l-3,25l-7,0"/>
          </g>
        </svg> -->
        <loading-icon class="h-icon-loading loading-icon" />
        <p v-if="text" class="el-loading-text">
          {{ text }}
        </p>
      </div>
    </div>
  </transition>
</template>

<script>
import loadingIcon from '../../icon/src/loading-icon.vue';
export default {
  components: {
    loadingIcon
  },

  data() {
    return {
      text: null,
      fullscreen: true,
      visible: false,
      customClass: ''
    };
  },

  methods: {
    handleAfterLeave() {
      this.$emit('after-leave');
    },
    setText(text) {
      this.text = text;
    }
  }
};
</script>

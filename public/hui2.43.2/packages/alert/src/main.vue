<template>
  <transition name="el-alert-fade">
    <div
      v-show="visible"
      :class="[typeClass, isSimple, isCenter]"
      class="el-alert"
    >
      <h-feedback-icon
        v-if="showIcon"
        :icon-name="iconClass"
        class="el-alert__icon"
      />
      <div
        :class="[showIcon ? 'is-icon' : '', closable ? 'is-close' : '']"
        class="el-alert__content"
      >
        <span
          v-if="title || $slots.title"
          :class="[isBoldTitle, isSimple]"
          class="el-alert__title"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </span>
        <slot>
          <p
            v-if="description"
            :class="[isSimple, title ? 'is-title' : '']"
            class="el-alert__description"
          >
            {{ description }}
          </p>
        </slot>
        <i
          v-show="closable"
          :class="[isCustomed, iconCloseClass]"
          class="el-alert__closebtn"
          @click="close()"
        >
          {{ closeText }}
        </i>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
const TYPE_CLASSES_MAP = {
  success: 'h-icon-feedback_success_sm',
  warning: 'h-icon-feedback_warning_sm',
  error: 'h-icon-feedback_error_sm',
  info: 'h-icon-feedback_info_sm'
};

export default {
  name: 'ElAlert',

  props: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info'
    },
    center: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: true
    },
    closeText: {
      type: String,
      default: ''
    },
    closeIcon: {
      type: String,
      default: ''
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    simple: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      visible: true
    };
  },

  computed: {
    typeClass() {
      return `el-alert--${this.type}`;
    },

    isSimple() {
      return this.simple ? 'is-simple' : '';
    },

    isCenter() {
      return this.center ? 'is-center' : '';
    },

    iconClass() {
      if (this.icon === '') {
        return this.type ? TYPE_CLASSES_MAP[this.type] : '';
      } else {
        return this.icon;
      }
    },

    isCustomed() {
      return this.closeText ? 'is-customed' : '';
    },

    iconCloseClass() {
      return this.closeText === ''
        ? this.closeIcon
          ? this.closeIcon
          : 'h-icon-close_sm'
        : '';
    },

    isBoldTitle() {
      return this.description || this.$slots.default ? 'is-bold' : '';
    }
  },

  methods: {
    close() {
      this.visible = false;
      this.$emit('close');
    }
  }
};
</script>

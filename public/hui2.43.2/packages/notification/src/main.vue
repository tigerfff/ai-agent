<template>
  <transition name="el-notification-fade">
    <div
      v-show="visible"
      :class="[customClass, sizeClass, horizontalClass]"
      :style="positionStyle"
      class="el-notification"
      @mouseenter="clearTimer()"
      @mouseleave="startTimer()"
      @click="click"
    >
      <div class="el-notification__group">
        <div class="el-notification__title">
          {{ title }}
        </div>
        <div class="el-notification__content">
          <slot>
            <p v-if="!dangerouslyUseHTMLString">
              {{ message }}
            </p>
            <p v-else v-html="message" />
          </slot>
        </div>
        <div
          v-if="showClose"
          class="el-notification__closeBtn h-icon-close_sm"
          @click.stop="close"
        />
      </div>
      <div v-if="pages.length >= 2" class="el-notification__pagination">
        <el-pagination
          :total="pages.length * 10"
          :page-count="4"
          small
          layout="first, prev, miniPager, next, last"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
const sizeMap = {
  small: 'small',
  middle: 'middle',
  large: 'large'
};
export default {
  data() {
    return {
      visible: false,
      title: '',
      message: '',
      duration: 3000,
      showClose: true,
      size: 'small',
      customClass: '',
      onClose: null,
      onClick: null,
      closed: false,
      verticalOffset: 0,
      position: 'top-right',
      timer: null,
      pages: [],
      activePageIndex: 0,
      dangerouslyUseHTMLString: false
    };
  },

  computed: {
    sizeClass() {
      return sizeMap[this.size]
        ? `el-notification--${sizeMap[this.size]}`
        : 'el-notification--small';
    },
    horizontalClass() {
      return this.position.indexOf('right') > -1 ? 'right' : 'left';
    },
    verticalProperty() {
      return /^top-/.test(this.position) ? 'top' : 'bottom';
    },
    positionStyle() {
      return {
        [this.verticalProperty]: `${this.verticalOffset}px`
      };
    }
  },

  watch: {
    closed(newVal) {
      if (newVal) {
        this.visible = false;
        this.$el.addEventListener('transitionend', this.destroyElement);
      }
    },
    pages(val) {
      if (val.length !== 1) return;
      this.renderPage(0);
    },
    activePageIndex(val) {
      this.renderPage(val);
    }
  },

  mounted() {
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        if (!this.closed) {
          this.close();
        }
      }, this.duration);
    }
  },

  methods: {
    destroyElement() {
      this.$el.removeEventListener('transitionend', this.destroyElement);
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },

    renderPage(index) {
      this.message = this.pages[index].content;
      this.title = this.pages[index].title;
    },

    click() {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    },

    close() {
      this.closed = true;
      if (typeof this.onClose === 'function') {
        this.onClose();
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
    },
    handlePageChange(currentPage) {
      this.activePageIndex = currentPage - 1;
    }
  }
};
</script>

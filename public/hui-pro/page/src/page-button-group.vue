<template>
  <div :style="{ 'max-width': maxWidth }" class="h-page-button-group-wrap">
    <div
      ref="group"
      :class="{ 'over-long': overLong }"
      class="h-page-button-group"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { on, off, hasClass } from '@hui-pro/utils';

export default {
  name: 'HPageButtonGroup',
  props: {
    maxWidth: {
      type: String,
      default: null
    },
    btnMaxWidth: {
      type: [String, Number],
      default: 256
    }
  },
  data() {
    return {
      scrollWidth: null,
      overLong: false
    };
  },
  computed: {
    // page-header 控件
    pageHeader() {
      let { $parent } = this;
      while ($parent.$options.name !== 'HPageHeader') {
        $parent = $parent.$parent;
        if (!$parent) return null;
      }
      return $parent || null;
    },
    // page-header 右侧操作栏模式
    actionModel() {
      return this.pageHeader ? this.pageHeader.actionModel : '';
    }
  },
  watch: {
    // 监听 page-header 右侧操作栏模式，'fold' 时收起按钮组，'unfold' 时展开按钮组
    actionModel(model) {
      this.setGroupStatus(model);
    }
  },
  mounted() {
    this.scrollWidth = this.$refs.group.scrollWidth;
    on(this.$el, 'resize', this.resize);
  },
  beforeDestroy() {
    off(this.$el, 'resize', this.resize);
  },
  methods: {
    /**
     * @desc 响应按钮组宽度变化
     * @author chenguanbin
     */
    resize() {
      if (!this.$el.clientWidth) return;
      this.setButtonTitleAsMaxWidth();
      if (this.$el.clientWidth < this.scrollWidth && !this.overLong) {
        this.setGroupStatus('fold');
      }
      if (this.$el.clientWidth >= this.scrollWidth && this.overLong) {
        this.setGroupStatus('unfold');
      }
    },

    /**
     * @author chenguanbin
     * @date 2019-12-11 19:46:51
     * @desc 设置按钮组状态
     */
    setGroupStatus(status) {
      this.overLong = status === 'fold';
      this.setButtonTitle(status);
      this.$emit(status);
    },

    /**
     * @desc 设置按钮title
     * @author chenguanbin
     * @param {String} type 'fold'：折叠  'unfold'：展开
     */
    setButtonTitle(type) {
      const $buttons = Array.from(this.$el.querySelectorAll('.el-button'));
      for (const $dom of $buttons) {
        // 显示按钮提示信息前提：按钮未禁用，按钮折叠或者按钮展开但内容超出按钮最大范围
        const showTitle =
          !hasClass($dom, 'is-disabled') &&
          (type === 'fold' ||
            (type === 'unfold' &&
              $dom.clientWidth === parseInt(this.btnMaxWidth)));
        $dom.title = showTitle ? $dom.querySelector('span').innerText : '';
      }
    },

    /**
     * @desc 仅根据按钮是否超出最大宽度限制，来设置按钮title
     * @author chenguanbin
     */
    setButtonTitleAsMaxWidth() {
      const $buttons = Array.from(this.$el.querySelectorAll('.el-button'));
      for (const $dom of $buttons) {
        const showTitle = $dom.clientWidth === parseInt(this.btnMaxWidth);
        $dom.title = showTitle ? $dom.querySelector('span').innerText : '';
      }
    }
  }
};
</script>

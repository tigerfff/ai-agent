<template>
  <ul class="el-pager" @click="onPagerClick">
    <li
      v-if="pageCount > 0"
      :class="{ active: currentPage === 1, disabled }"
      class="number"
    >
      1
    </li>
    <el-tooltip
      v-if="showPrevMore"
      :content="t('el.pagination.prevMore', { count: pageCountOffset })"
      effect="light"
      placement="top"
    >
      <li
        :class="[quickprevIconClass, { disabled }]"
        class="el-icon more btn-quickprev"
        @mouseenter="onMouseenter('left')"
        @mouseleave="quickprevIconClass = 'h-icon-more_hori'"
      />
    </el-tooltip>
    <li
      v-for="pager in pagers"
      :key="pager"
      :class="{ active: currentPage === pager, disabled }"
      class="number"
    >
      {{ pager }}
    </li>
    <el-tooltip
      v-if="showNextMore"
      :content="t('el.pagination.nextMore', { count: pageCountOffset })"
      effect="light"
      placement="top"
    >
      <li
        :class="[quicknextIconClass, { disabled }]"
        class="el-icon more btn-quicknext"
        @mouseenter="onMouseenter('right')"
        @mouseleave="quicknextIconClass = 'h-icon-more_hori'"
      />
    </el-tooltip>
    <li
      v-if="pageCount > 1"
      :class="{ active: currentPage === pageCount, disabled }"
      class="number"
    >
      {{ pageCount }}
    </li>
  </ul>
</template>

<script type="text/babel">
import Locale from 'hui/src/mixins/locale';

export default {
  name: 'ElPager',
  mixins: [Locale],

  props: {
    currentPage: {
      type: Number,
      default: null
    },

    pageCount: {
      type: Number,
      default: null
    },

    pagerCount: {
      type: Number,
      default: 7
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      current: null,
      quicknextIconClass: 'h-icon-more_hori',
      quickprevIconClass: 'h-icon-more_hori',
      showPrevMore: false,
      showNextMore: false
    };
  },

  computed: {
    pagers() {
      const array = [];
      const pagerCount = this.pagerCount;
      const halfPagerCount = Math.floor(pagerCount / 2);
      const currentPage = Number(this.currentPage);
      const pageCount = Number(this.pageCount);

      let showPrevMore = false;
      let showNextMore = false;

      if (pageCount > pagerCount) {
        if (currentPage > pagerCount - halfPagerCount) {
          showPrevMore = true;
        }

        if (currentPage < pageCount - halfPagerCount) {
          showNextMore = true;
        }
      }

      if (showPrevMore && !showNextMore) {
        const startPage = pageCount - (pagerCount - 2);
        for (let i = startPage; i < pageCount; i++) {
          array.push(i);
        }
      } else if (!showPrevMore && showNextMore) {
        for (let i = 2; i < pagerCount; i++) {
          array.push(i);
        }
      } else if (showPrevMore && showNextMore) {
        const offset = Math.floor(pagerCount / 2) - 1;
        // 对pagerCount为偶数的情况做处理, 但是不推荐用户使用偶数的pagerCount
        const startNum =
          pagerCount % 2 ? currentPage - offset : currentPage - offset + 1;

        for (let i = startNum; i <= currentPage + offset; i++) {
          array.push(i);
        }
      } else {
        for (let i = 2; i < pageCount; i++) {
          array.push(i);
        }
      }

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.showPrevMore = showPrevMore;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.showNextMore = showNextMore;

      return array;
    },
    pageCountOffset() {
      return Number(this.pagerCount) >= 2 ? Number(this.pagerCount) - 2 : 2;
    }
  },

  watch: {
    showPrevMore(val) {
      if (!val) this.quickprevIconClass = 'h-icon-more_hori';
    },

    showNextMore(val) {
      if (!val) this.quicknextIconClass = 'h-icon-more_hori';
    }
  },

  methods: {
    onPagerClick(event) {
      const target = event.target;
      if (target.tagName === 'UL' || this.disabled) {
        return;
      }

      let newPage = Number(event.target.textContent);
      const pageCount = this.pageCount;
      const currentPage = this.currentPage;

      if (target.className.indexOf('more') !== -1) {
        if (target.className.indexOf('quickprev') !== -1) {
          newPage = currentPage - this.pageCountOffset;
        } else if (target.className.indexOf('quicknext') !== -1) {
          newPage = currentPage + this.pageCountOffset;
        }
      }

      /* istanbul ignore if */
      if (!isNaN(newPage)) {
        if (newPage < 1) {
          newPage = 1;
        }

        if (newPage > pageCount) {
          newPage = pageCount;
        }
      }

      if (newPage !== currentPage) {
        this.$emit('change', newPage);
      }
    },
    onMouseenter(direction) {
      if (this.disabled) return;
      if (direction === 'left') {
        this.quickprevIconClass = 'h-icon-angles_left_sm';
      } else {
        this.quicknextIconClass = 'h-icon-angles_right_sm';
      }
    }
  }
};
</script>

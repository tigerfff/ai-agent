<template>
  <header
    ref="pageHeader"
    :class="{ 'is-affix': affix }"
    :style="headerStyle"
    class="h-page-header"
  >
    <!-- 返回按钮 -->
    <div
      v-if="returnIcon"
      class="h-page-header__return"
      @click="handleReturnClick"
    >
      <i class="h-page-header__return-icon h-icon-ctrl_pageback" />
    </div>
    <h-layout direction="vertical">
      <div ref="main" class="h-page-header__main">
        <!-- 面包屑 -->
        <div
          v-if="breadcrumb && breadcrumb.length"
          ref="breadcrumb"
          class="h-page-header__breadcrumb"
        >
          <el-breadcrumb
            :separator="separator"
            :item-max-width="breadcrumbItemMaxWidth"
          >
            <!-- 面包屑不折叠（面包屑子项长度在 3 个以内时，将不会进行折叠） -->
            <template v-if="bcModel === 'unfold' || breadcrumb.length < 3">
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumb"
                :key="index"
                :to="item.router"
                :class="{ 'has-router': item.router }"
              >
                {{ item.title || item }}
              </el-breadcrumb-item>
            </template>
            <!-- 面包屑折叠 -->
            <template v-else>
              <el-breadcrumb-item
                :to="breadcrumb[0].router"
                :class="{ 'has-router': breadcrumb[0].router }"
              >
                {{ breadcrumb[0].title || breadcrumb[0] }}
              </el-breadcrumb-item>
              <!-- 收起的面包屑 -->
              <el-breadcrumb-item
                :sub-max-width="breadcrumbItemMaxWidth"
                type="tooltip"
              >
                <template v-for="(item, index) in breadcrumb">
                  <el-breadcrumb-sub-item
                    v-if="index !== 0 && index !== breadcrumb.length - 1"
                    :key="index"
                    :to="item.router"
                  >
                    {{ item.title || item }}
                  </el-breadcrumb-sub-item>
                </template>
              </el-breadcrumb-item>
              <el-breadcrumb-item
                :to="breadcrumb[breadcrumb.length - 1].router"
                :class="{
                  'has-router': breadcrumb[breadcrumb.length - 1].router
                }"
              >
                {{
                  breadcrumb[breadcrumb.length - 1].title ||
                    breadcrumb[breadcrumb.length - 1]
                }}
              </el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </div>
        <!-- 操作按钮 -->
        <div
          v-if="$slots.pageHeaderAction"
          ref="pageHeaderAction"
          class="h-page-header__action"
        >
          <slot name="pageHeaderAction" />
        </div>
      </div>
      <!-- 标题 -->
      <div v-if="title" class="h-page-header__title">
        <span v-ellipsis>{{ title }}</span>
      </div>
      <!-- 二级标题 -->
      <div v-if="subtitle" class="h-page-header__subtitle">
        <span v-ellipsis>{{ subtitle }}</span>
      </div>
    </h-layout>
  </header>
</template>

<script>
import { on, off } from '@hui-pro/utils';

export default {
  name: 'HPageHeader',
  inject: ['pageContainer'],
  props: {
    // 固定模式
    affix: {
      type: Boolean,
      default: false
    },
    // 面包屑
    breadcrumb: {
      type: Array,
      default() {
        return [];
      }
    },
    // 面包屑分隔符
    separator: {
      type: String,
      default: null
    },
    // 面包屑项最大宽度
    breadcrumbItemMaxWidth: {
      type: [String, Number],
      default: '256px'
    },
    // 页面标题
    title: {
      type: String,
      default: ''
    },
    // 页面副标题
    subtitle: {
      type: String,
      default: ''
    },
    // 是否显示返回图标
    returnIcon: {
      type: Boolean,
      default: false
    },
    // 返回路由
    returnRouter: {
      type: String,
      default: ''
    },
    // TODO: beforeReturn 和 returnEvent 考虑做成 Promise
    // 返回事件执行之前，若返回false，则不会返回
    beforeReturn: {
      type: Function,
      default: null
    },
    // 点击返回图标后，执行的方法
    returnEvent: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      headerHeight: 40, // 头部高度
      bcModel: 'unfold', // 面包屑模式： fold: 折叠面包屑，收起除第一个和最后一个之外的子项； unfold: 正常展示
      bcOriginWidth: 0, // 面包屑全展开时的原始宽度
      bcFoldWidth: 0, // 面包屑折叠时宽度
      actionModel: 'unfold', // 右侧操作栏模式
      actionOriginWidth: 0 // 右侧操作栏原始宽度
    };
  },
  computed: {
    page() {
      let { $parent } = this;
      while ($parent.$options.name !== 'HPage') {
        $parent = $parent.$parent;
        if (!$parent) return null;
      }
      return $parent || null;
    },
    // 获取头部样式
    headerStyle() {
      const { page } = this;
      const ret = {
        height: `${this.headerHeight}px`
      };
      if (this.affix) {
        ret.left =
          page && page.menuExist
            ? page.menuCollapse
              ? `${parseInt(page.menuFoldWidth)}px`
              : `${parseInt(page.menuExpandWidth)}px`
            : '0';
      }
      return ret;
    }
  },
  watch: {
    subtitle() {
      this.setHeaderHeight();
    },
    breadcrumb(val) {
      this.$nextTick(() => {
        this.getOriginWidth();
      });
    },
    bcOriginWidth(val) {
      this.resizeHeader();
    },
    actionOriginWidth(val) {
      this.resizeHeader();
    }
  },
  created() {
    this.pageContainer.headerAffix = this.affix;
  },
  mounted() {
    this.setHeaderHeight();
    this.getOriginWidth(true);
    on(this.$el, 'resize', this.resizeHeader);
  },
  beforeDestroy() {
    off(this.$el, 'resize', this.resizeHeader);
  },
  methods: {
    /**
     * @desc 设置头部高度
     * @author chenguanbin
     */
    setHeaderHeight() {
      // 若已经设置过副标题高度
      if (this.headerHeight !== 40) return;
      // subtitle 高度 26
      this.headerHeight += this.subtitle ? 26 : 0;
      this.pageContainer.headerHeight = this.headerHeight;
    },

    /**
     * @author chenguanbin
     * @date 2019-12-11 20:43:16
     * @desc 获取面包屑和右侧操作栏原始宽度
     */
    getOriginWidth(isMounted) {
      // 计算面包屑全展开时的原始宽度，mounted 时分隔符未加载，因此需要加上分隔符的宽度
      if (this.$refs.breadcrumb) {
        this.bcOriginWidth =
          this.$refs.breadcrumb.clientWidth +
          (isMounted ? (this.breadcrumb.length - 1) * 24 : 0);
      }
      // 计算右侧操作栏原始宽度
      if (this.$refs.pageHeaderAction) {
        setTimeout(() => {
          this.actionOriginWidth = this.$refs.pageHeaderAction.clientWidth;
        }, 200);
      }
    },

    /**
     * @desc 监控 header 元素变化
     * @author chenguanbin
     */
    resizeHeader() {
      const headerWidth = this.$refs.main.clientWidth; // 头部宽度
      // 头部宽度不足时优先折叠面包屑
      this.bcModel =
        headerWidth < this.bcOriginWidth + this.actionOriginWidth
          ? 'fold'
          : 'unfold';
      // 若面包屑进行折叠，计算折叠面包屑宽度
      if (this.bcModel === 'fold' && !this.bcFoldWidth) {
        this.$nextTick(() => {
          this.bcFoldWidth = this.$refs.breadcrumb.clientWidth;
        });
      }
      // 面包屑已折叠，若头部宽度任然不足，折叠右侧操作栏
      this.$nextTick(() => {
        this.actionModel =
          headerWidth < this.bcFoldWidth + this.actionOriginWidth
            ? 'fold'
            : 'unfold';
      });
    },

    /**
     * @desc 点击返回按钮
     * @author chenguanbin
     */
    handleReturnClick() {
      // 若存在 beforeReturn 且返回值不是 false
      if (this.beforeReturn ? this.beforeReturn() !== false : true) {
        if (this.returnEvent) {
          this.returnEvent();
        } else {
          this.returnRouter
            ? this.$router.push(this.returnRouter)
            : this.$router.back();
        }
      }
    }
  }
};
</script>

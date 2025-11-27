<template>
  <div :class="{ 'is-active': isActive }" class="el-collapse-item">
    <div class="el-collapse-item__header" @click="handleHeaderClick">
      <i
        v-if="arrowPlacement !== 'right'"
        :class="{
          'is-active': isActive
        }"
        class="el-collapse-item__arrow h-icon-angle_right_sm"
      />
      <span>
        <slot name="title">
          {{ title }}
        </slot>
      </span>
      <i
        v-if="arrowPlacement === 'right'"
        :class="{
          'is-active': isActive
        }"
        class="el-collapse-item__arrow h-icon-angle_right_sm on-right"
      />
    </div>
    <el-collapse-transition>
      <div v-show="isActive" class="el-collapse-item__wrap">
        <div class="el-collapse-item__content">
          <slot />
        </div>
      </div>
    </el-collapse-transition>
  </div>
</template>
<script>
import ElCollapseTransition from 'hui/src/transitions/collapse-transition';
import Emitter from 'hui/src/mixins/emitter';

export default {
  name: 'ElCollapseItem',

  componentName: 'ElCollapseItem',

  components: { ElCollapseTransition },

  mixins: [Emitter],

  props: {
    title: { type: String, default: null },
    arrowPlacement: {
      type: String,
      default: 'left'
    },
    name: {
      type: [String, Number],
      default() {
        return this._uid;
      }
    }
  },

  data() {
    return {
      contentWrapStyle: {
        height: 'auto',
        display: 'block'
      },
      contentHeight: 0
    };
  },

  computed: {
    isActive() {
      return this.$parent.activeNames.indexOf(this.name) > -1;
    }
  },

  mounted() {},

  // watch: {
  //     isActive(value) {}
  // },

  methods: {
    handleHeaderClick() {
      this.dispatch('ElCollapse', 'item-click', this);
    }
  }
};
</script>

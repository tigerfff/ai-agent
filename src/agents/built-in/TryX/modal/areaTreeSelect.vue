<template>
  <div class="area-select" ref="areaSelectRef">
    <el-input
      placeholder="请选择"
      :suffix-icon="icon"
      v-model="label"
      readonly
      class="select-input"
      @click.native="togglePanel"
    >
    </el-input>
    <transition name="fade">
      <div v-show="expand" class="expand-pane" :style="{'width': panelWidth+'px'}">
        <TreeAnsySearch @getClickData="getClickData" top="0" treeW="225"></TreeAnsySearch>
      </div>
    </transition>
  </div>
</template>

<script>
import TreeAnsySearch from './treeAnsySearch.vue'
export default {
  name: 'areaTreeSelect',
  components: {
    TreeAnsySearch
  },
  props: {
    panelWidth: {
      type: Number,
      default: 240
    },
    isOnlyChooseLeaf: { // 是否仅点击到叶子节点再发射事件
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      label: '',
      expand: false,
    }
  },
  computed: {
    icon() {
      return this.expand ? 'h-icon-angle_up_sm' : 'h-icon-angle_down_sm'
    }
  },
  mounted() {
    document.addEventListener('mouseup', this.handlerMouseup)
  },
  methods: {
    handlerMouseup (e) {
      this.$nextTick(() => {
        const dom = this.$refs.areaSelectRef
        if (dom && !dom.contains(e.target)) {
          this.expand = false
        }
      })
    },
    togglePanel(expand) {
      if (typeof expand === 'boolean') {
        this.expand = expand
        return
      }
      this.expand = !this.expand
    },
    getClickData (area) {
      this.label = area.groupName
      this.togglePanel(false)
      this.$emit('onSelect', area)
    },

  },
  beforeDestroy () {
    document.removeEventListener('mouseup', this.handlerMouseup)
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active {
  animation: fade .2s;
}
.fade-leave-active {
  animation: fade .2s reverse;
}
@keyframes fade {
  0% {
    height: 0px;
  }
  100% {
    height: 420px;
  }
}
.area-select {
  z-index: 9;
  width: 100%;
  min-width: 160px;
  position: relative;
}
::v-deep .select-input .el-input__inner {
  padding-right: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.expand-pane{
  width: 100%;
  position: absolute;
  height: 420px;
  background: white;
  top: 40px;
  left: 0px;
  border: 1px solid #ddd;
  z-index: 9;
}
</style>

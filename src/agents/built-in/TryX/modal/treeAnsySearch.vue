<template>
  <div class="tree-frame" v-bind:style="{top:top+'px',height:height+'px'}">
    <div class="tree-filter">
      <el-input class="tree-filter-inp" placeholder="请输入名称" suffix-icon="h-icon-search" :style="{width:treeW}"
      v-model="nameLike" @keyup.enter.native="handleSearchClick" :on-icon-click="handleSearchClick" clearable :clear-icon-click='clearClick'>
      </el-input>
      <div class="tree-wrap" :style="{width:treeW,bottom:treeBot+'px'}">
        <el-tree class="tree-left" default-icon="h-icon-location" :data="treeData" simple-data parent-key="parentId"
        :props="defaultProps" node-key="groupId" ref="tree" @node-click="getClickNode" lazy>
        </el-tree>
      </div>
    </div>
  </div>
</template>
<script>
import { TryApi } from '../api';
export default {
  props: {
    top: {
      type: String,
      default: '0'
    },
    height: {
      type: String,
      default: ''
    },
    treeW: {// 树外层样式
      type: String,
      default: '200px'
    },
    treeBot: {// 树外层样式
      type: String,
      default: '10'
    }
  },
  mounted () {
    this.getTree()
  },

  data () {
    return {
      defaultProps: {
        children: 'children',
        groupId: 'groupId',
        label: 'groupName',
        isLeaf: true
      },
      params: {
        pageNo: 1,
        pageSize: 2000
      },
      nameLike: '',
      treeData: []
    }
  },
  methods: {
    clearClick () {
      this.nameLike = ''
      this.handleSearchClick()
    },
    getTree () {
      this.treeData = []
      this.params.storeName = this.nameLike
      TryApi.getStoresTreeList(this.$aiClient, this.params).then(res => {
        if (res.code === 0 && res.data) {
          let data = res.data.rows || []
          if(data.length >= 2000) {
            this.$message.info("组织过多，建议通过搜索进行更精确的查找~")
          }
          data.forEach(item => {
            item.groupId = item.storeId
            item.groupName = item.storeName
            item.isLeaf = true
          })
          this.treeData = data
          if(!this.nameLike) {
            this.treeInit(data)
          }
        }
      })
    },
    treeInit (data) {
      if (data && data.length > 0) {
        this.$emit('getClickData', data[0])
      }
    },
    handleSearchClick () {
      this.getTree()
    },
    getClickNode (data, node) {
      this.$emit('getClickData', data, node.level)
    }
  }
}
</script>
<style lang="scss">
.tree-frame {
  width: 100%;
  padding: 8px;
  position: absolute;
  bottom: 0px;
  .tree-filter {
    width: 100%;
    height: 100%;
    position: relative;
    .tree-wrap {
      padding-top: 8px;
      position: absolute;
      left: 0px;
      right: 0px;
      top: 32px;
    }
  }
  .tree-filter-inp{
    input{
      padding-left: 15px;
    }
  }
}
</style>

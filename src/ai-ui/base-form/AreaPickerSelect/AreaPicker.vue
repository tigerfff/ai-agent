<template>
    <hik-cloud-organization
      ref='transfer'
      :waitSelect="options"
      :loading="loading"
      :tableHeadName="tableHeadName"
      :isTranslate="needTransfer"
      :checkStrictly ="checkStrictly"
      @search="searchTrigger"
      @breadClick="parentChange"
      @clearSearch="getOptionsData"
      @departmentChange="parentChange"
      @selectionChange="selectionChange"
      @breadChange="breadChange">
      <template slot="rightOpear">
        <span class="btn" style="color:#2196f3" @click="deleteAll">清空</span>
      </template>
    </hik-cloud-organization>
  </template>
  <script>
  import { AreaPickerApi } from './proxy'
  export default {
    name: 'areaPicker',
    props: {
      checkStrictly: {//是否严格的遵循父子不互相关联的做法，默认为 false
          type: Boolean,
          default: false
        },
    },
    data () {
      return {
        tableHeadName: '区域名称',
        needTransfer: false,
        searchCondition: '',
        options: [],
        selectedObj: [],
        breads: undefined,
        loading: false,   // 加载中提示
      }
    },
    mounted () {
      this.tableHeadName =  `区域/${this.applicationSceneName || '门店'}名称`;
      this.getOptionsData()
    },
    methods: {
      // 数组去重
      matchArr(arr1) {
        let arr = [];
        for (let i = 0; i < arr1.length; i++) {
          const idx = arr.findIndex(a => {
            return a.nodeId === arr1[i].nodeId;
          });
          if (idx === -1) {
            arr.push(arr1[i]);
          }
        }
        return arr;
      },
      deleteAll() {
        this.$nextTick(()=>{
          this.$refs.transfer.initSelected([])
        })
      },
      breadChange(breads) {
        this.breads = breads
      },
      searchTrigger(keyword, cb) {
        this.searchCondition = keyword
        this.handleIconClick(keyword, cb)
      },
      parentChange(node, cb) {
        this.searchCondition = ''
        // 如果节点是门店（nodeType = 1），则没有下级，不加载数据
        if (node && node.nodeType === 1) {
          cb && cb()
          return
        }
        this.getOptionsData(node, cb)
      },
      selectionChange(objs) {
        this.selectedObj = objs
        this.$emit('selectionChange', objs)
      },
      initSeletedObj() {
        this.$refs.transfer.initSelected(this.selectedObj)
      },
      resetSelectList() {
        this.$refs.transfer.initSelected([])
      },
      checkError(msg) {
        this.$refs.transfer.showError(msg)
      },
      // 获取详情数据
      async refreshSelectData(data) {
        this.selectedObj = this.matchArr(data)
        this.initSeletedObj()
      },
      // 设置图标
      setIcon(item) {
        item.icon = item.nodeType === 0 ? 'iconfont icon-ic_tree_area' : 'iconfont icon-ic_tree_store'
      },
      // 搜索
      async handleIconClick (keyword, cb) {
        console.log('keyword', keyword);
        if (!keyword) return
        try {
          this.loading = true
          let rows = []
          let res = await AreaPickerApi.searchAreaListForBusiness(this.$aiClient, { condition: keyword, limit: 30, isLeafArea: true })
          if (res.code === 0) {
            rows = (res.data && res.data.hasOwnProperty('nodeList') ? res.data.nodeList : res.data) || []
          }
          rows.forEach(e => {
            e.type = e.nodeType
            this.setIcon(e)
            // 如果是门店（nodeType = 1），设置为叶子节点，没有下级
            if (e.nodeType === 1) {
              e.isLeaf = true
            }
          })
          this.options = rows
          this.loading = false
          cb && cb()
        } catch (e) {
          this.loading = false
        }
      },
      // 获取待选择数据
      getOptionsData (row, cb) {
          this.loading = true
          let params = {
            needStore: true,  // 设置为 true 以支持加载门店
          }
          if (row) {
            params.nodeId = row.nodeId
          }
          AreaPickerApi.findAreaStoreTreeForBusiness(this.$aiClient, params).then((res) => {
            if (res.code === 0) {
              let rows = (res.data && res.data.hasOwnProperty('nodeList') ? res.data.nodeList : res.data) || []
              rows.forEach(e => {
                e.type = e.nodeType
                this.setIcon(e)
                // 门店节点（nodeType = 1）设置为叶子节点，没有下级
                if (e.nodeType === 1) {
                  e.isLeaf = true
                }
              })
              this.options = rows
              this.$emit('optionLoaded', rows)
              cb && cb()
            }
          }).finally(() => {
            this.loading = false
          })
      },
      // 获取已选中区域的Id列表
      getIds () {
        return this.selectedObj
      },
      setSelectedObjs(objs) {
        this.selectedObj = [...objs]
        this.initSeletedObj()
      },
    }
  }
  </script>
  
  <style lang="scss" scoped>
    .btn:hover{
      cursor: pointer;
      opacity: 0.8;
    }
  </style>
<template>
    <hik-cloud-organizer
      ref='transfer'
      :waitSelect='options'
      :loading='loading'
      :tableHeadName='tableHeadName'
      :isTranslate='needTransfer'
      :checkStrictly ='checkStrictly'
      @search='searchTrigger'
      @breadClick='parentChange'
      @clearSearch='getOptionsData'
      @departmentChange='parentChange'
      @selectionChange='selectionChange'
      @breadChange="breadChange">
    </hik-cloud-organizer>
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
      breadChange(breads) {
        this.breads = breads
      },
      searchTrigger(keyword, cb) {
        this.searchCondition = keyword
        this.handleIconClick(keyword, cb)
      },
      parentChange(node, cb) {
        this.searchCondition = ''
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
        if (!keyword) return
        try {
          this.loading = true
          let rows = []
          let res = await AreaPickerApi.searchAreaListForBusiness(this.$aiClient, { condition: keyword, limit: 30, isLeafArea: false })
          if (res.code === 0) {
            rows = res.data || []
          }
          rows.forEach(e => {
            e.type = 0
            e.nodeType = 0
            this.setIcon(e)
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
            needStore: false,
          }
          if (row) {
            params.nodeId = row.nodeId
          }
          AreaPickerApi.findAreaStoreTreeForBusiness(this.$aiClient, params).then((res) => {
            if (res.code === 0) {
              let rows = (res.data && res.data.hasOwnProperty('nodeList') ? res.data.nodeList : res.data) || []
              rows.forEach(e => {
                e.type = 0
                this.setIcon(e)
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
  
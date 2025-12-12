<template>
  <div class="dual-selection-table">
    <div class="table-container">
      <!-- 左侧表格 -->
      <div class="left-table-wrapper">
        <div class="table-action">
          <h4>待选择({{ currentLeftPageData.length }}/{{leftTotalCount > defaultPageSize ? defaultPageSize : leftTotalCount }})</h4>
          <slot name="left-action"> </slot>
        </div>
        <div class="table-search">
          <el-input
            v-if="showSearch"
            v-model="leftSearchKeyword"
            :placeholder="searchPlaceholder"
            suffix-icon="h-icon-search"
            clearable
            :on-icon-click="handleLeftSearch"
            @input="handleLeftSearch"></el-input>
        </div>

        <el-table
          ref="leftTable"
          v-loading="leftLoading"
          class="left-table"
          :data="leftTableData"
          :height="tableHeight"
          :row-key="rowKey"
          :empty-text="leftEmptyText"
          @selection-change="handleLeftSelectionChange">
        
          <el-table-column
            type="selection"
            :selectable="actualSelectable"
            :reserve-selection="true"
            :selections="selections"
            width="50"></el-table-column>
          <!-- 左侧表格自定义列 -->
          <slot name="left-columns"></slot>
        </el-table>
        <div v-if="showPagination" class="pagination-container">
          <el-pagination
            small
            layout="prev, miniPager, next"
            :pageSize="defaultPageSize"
            :total="leftTotalCount"
            @current-change="handleLeftCurrentChange"></el-pagination>
        </div>
      </div>

      <!-- 右侧表格 -->
      <div class="right-table-wrapper">
        <div class="table-action">
          <h4>已选择({{ selectedData.length }})</h4>
          <slot name="right-action">
            <div>
              <el-button type="text" :disabled="filteredRightTableData.length === 0" @click="clearCurrentPage">清除当前页</el-button>
              <el-button type="text" :disabled="filteredRightTableData.length === 0" @click="clearSelectionConfirm">清空</el-button>
            </div>
          </slot>
        </div>
        <div class="table-search">
          <el-input
            v-if="showSearch"
            v-model="rightSearchKeyword"
            :placeholder="rightSearchPlaceholder"
            suffix-icon="h-icon-search"
            clearable
            :on-icon-click="handleRightSearch"
            @input="handleRightSearch"></el-input>
        </div>
        <el-table
          ref="rightTable"
          class="right-table"
          :data="filteredRightTableData"
          :height="tableHeight"
          :row-key="rowKey">
          <slot name="right-columns"></slot>
          <!-- 右侧表格自定义列 -->
          <el-table-column width="60" label="操作">
            <template slot-scope="scope" >
              <el-button
                type="link"
                :disabled="!moveToRightButtonFlag"
                @click="removeSelectedItem(scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="showRightPagination" class="pagination-container">
          <el-pagination
            layout="prev, miniPager, next"
            :pageSize="defaultPageSize"
            :total="filteredSelectedDataTotal"
            @current-change="handleRightCurrentChange"></el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import emitter from '@/mixins/emitter';
export default {
  name: 'PageDualTableTransfer',
  props: {
    // 接口请求方法，需返回Promise，传入参数: {page, pageSize, keyword}
    fetchMethod: {
      type: Function,
      required: true
    },
    fetchOtherParams: {
      type: Object,
      default: () => {}
    },
    // v-model绑定值
    value: {
      type: Array,
      default: () => []
    },
    // 处理接口返回值的方法
    responseHandler: {
      type: Function,
      default: (response) => 
        // 默认处理方法，假设返回格式为 {data: [], total: 0}
        ({
          data: response.data || [],
          total: response.total || 0
        })
      
    },
    searchPlaceholder: {
      type: String,
      default: '请输入姓名'
    },
    rightSearchPlaceholder: {
      type: String,
      default: '请输入姓名'
    },
    // 左侧表格空数据时显示的文本内容
    leftEmptyText: {
      type:String,
      default: '暂无数据'
    },
    // 左侧表格数据是否可以勾选方法
    selectable: {
      type: Function,
      default: null
    },
    // 行主键（用于唯一标识一行数据）
    rowKey: {
      type: String,
      default: 'id'
    },
    // 左侧table的搜索key值
    leftSearchKey: {
      type: String,
      default: 'keyword'
    },
    // 表格高度
    tableHeight: {
      type: [String, Number],
      default: 400
    },
    // 是否显示搜索框
    showSearch: {
      type: Boolean,
      default: true
    },
    // 是否显示左侧分页器
    showPagination: {
      type: Boolean,
      default: true
    },
    // 是否显示右侧分页器
    showRightPagination: {
      type: Boolean,
      default: true
    },
    // 默认分页大小
    defaultPageSize: {
      type: Number,
      default: 10
    },
    // 搜索的字段列表
    searchFields: {
      type: Array,
      default: () => ['name']
    },
    // form校验字段
    validateEvent: {
      type: Boolean,
      default: true
    },
    // 最大可选数量，为0表示不限制
    maxSelectionLimit: {
      type: Number,
      default: 0
    },
    maxLimitMessage: {
      type: String,
      default: '已达到最大选择数量限制'
    },
    // 2.45和安全中心约定最大值1万，超过这个数字不展示全选全部
    maxListLimit: {
      type: Number,
      default: 10000
    },
    // 是否可以左边数据传右边
    moveToLeftButtonFlag: {
      type: Boolean,
      default: true
    },
    // 是否可以右边传左边
    moveToRightButtonFlag: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Function,
      default: null
    }
  },
  mixins: [emitter],
  computed: {
    
    // 右侧表格过滤后的数据
    filteredSelectedData () {
      if (!this.rightSearchKeyword.trim()) {
        return this.selectedData;
      }

      // 前端搜索过滤
      return this.selectedData.filter((item) => this.searchFields.some((field) => {
        if (item[field]) {
          return item[field].toString().toLowerCase().includes(
            this.rightSearchKeyword.toLowerCase()
          );
        }
        return false;
      }));
    },

    // 过滤后的右侧数据总数
    filteredSelectedDataTotal () {
      return this.filteredSelectedData.length;
    },

    // 右侧表格分页后的数据
    filteredRightTableData () {
      if (!this.showRightPagination) {
        return this.filteredSelectedData;
      }

      const startIndex = (this.rightCurrentPage - 1) * this.rightPageSize;
      const endIndex = startIndex + this.rightPageSize;
      return this.filteredSelectedData.slice(startIndex, endIndex);
    },

  },
  
  data () {
    return {
      // 左侧表格数据 (从后端获取的当前页数据)
      leftTableData: [],
      // 已选择的所有数据（维护所有选中项）
      selectedData: [],
      // 左侧表格搜索关键字
      leftSearchKeyword: '',
      // 右侧表格搜索关键字
      rightSearchKeyword: '',
      // 左侧表格分页当前页
      leftCurrentPage: 1,
      // 左侧表格分页大小
      leftPageSize: this.defaultPageSize,
      // 右侧表格分页当前页
      rightCurrentPage: 1,
      // 右侧表格分页大小
      rightPageSize: this.defaultPageSize,
      // 左侧表格总数据量
      leftTotalCount: 0,
      // 标记是否是内部操作，避免无限循环
      isInternalUpdate: false,
      // 左侧加载状态
      leftLoading: false,
      // 标记当前页的选中ID (用于优化左侧表格selection显示)
      currentPageSelectedIds: [],
      // 左边table的当页选择数量
      currentLeftPageData: [],
      selections: [
        {
          value: 'all',
          text: '全选所有',
          onClick: () => {
            this.handleSelect('all');
          }
        },
        {
          value: 'page',
          text: '全选当前页',
          onClick: () => {
            this.handleSelect('page');
          }
        }
      ]
    };
  },
  created () {
    // 初始化选中数据，使用v-model值
    this.selectedData = [...(this.value || [])];
  },
  mounted () {
    // 初始化选中状态
    this.$nextTick(() => {
      this.updateLeftTableSelection();
    });
  },
  methods: {
    actualSelectable(row, index) {
        // moveToLeftButtonFlag优先级高
        if(this.moveToLeftButtonFlag === false) return false;
        // 如果用户传入了selectable就使用用户的，否则使用moveToLeftButtonFlag的值
        return this.selectable !== null 
            ? this.selectable(row, index) 
            : () => this.moveToLeftButtonFlag;
    },
    // 加载左侧表格数据
    async loadLeftTableData () {
      if (!this.fetchMethod) return;

      this.leftLoading = true;
      try {
        const params = {
          pageNo: this.leftCurrentPage,
          pageSize: this.leftPageSize,
          [this.leftSearchKey]: this.leftSearchKeyword,
          ...this.fetchOtherParams
        };

        const result = await this.fetchMethod(this.$aiClient, params);

        // 使用自定义处理方法处理返回结果
        const processedResult = await this.responseHandler(result);


        // 处理返回结果
        if (processedResult) {
          
          this.leftTableData = processedResult.data || [];
          this.leftTotalCount = processedResult.total || 0;

          // 更新选中状态
          this.$nextTick(() => {
            // 更新
            this.updateLeftTableSelection();
          });
        }
      } catch (error) {
        this.$message.error('获取数据失败');
      } finally {
        this.leftLoading = false;
      }
    },

    // 左侧表格选择变化处理
    handleLeftSelectionChange (selection) {
      this.currentLeftPageData = selection;

      // 标记内部操作，不去执行change事件，否则会造成dom渲染卡死
      if (this.isInternalUpdate) return;

      // 获取当前页显示的数据ID
      const currentPageIds = this.leftTableData.map((item) => item[this.rowKey]);

      // 找出当前页中选中的项ID
      const selectedIds = selection.map((item) => item[this.rowKey]);

      // 检查是否会超出最大选择限制
      if (this.maxSelectionLimit > 0) {
        // 计算新增选中的数量
        const currentPageSelectedCount = selectedIds.filter((id) => 
          !this.selectedData.some((item) => item[this.rowKey] === id)
        ).length;
        
        // 检查是否会超过限制
        if (this.selectedData.length + currentPageSelectedCount > this.maxSelectionLimit) {
          // 超出限制，提示用户并恢复选择状态
          this.$message.error(this.maxLimitMessage);
          
          // 恢复之前的选择状态
          this.$nextTick(() => {
            this.updateLeftTableSelection();
          });
          
          return;
        }
      }


      // 处理当前页中的选择变化
      (currentPageIds || []).forEach((itemId) => {
        // 是否选中
        const isSelected = selectedIds.includes(itemId);
        // 在selectedData中的索引
        const index = this.selectedData.findIndex((item) => item[this.rowKey] === itemId);
        // 当前数据项
        const item = this.leftTableData.find((item) => item[this.rowKey] === itemId);

        if (isSelected && index === -1 && item) {
          // 新选中的项，添加到selectedData
          this.selectedData.push(item);
        } else if (!isSelected && index !== -1) {
          // 取消选中的项，从selectedData中移除
          this.selectedData.splice(index, 1);
        }
      });

      // 通知父组件
      this.$emit('selection-change', [...this.selectedData]);
      // v-model双向绑定更新
      this.$emit('input', [...this.selectedData]);
    },

    // 更新左侧表格选择状态
    updateLeftTableSelection () {
      this.isInternalUpdate = true;

      this.$nextTick(() => {
        if (this.$refs.leftTable) {
          // 先清除当前页所有选择
          this.$refs.leftTable.clearSelection();

          // 获取已选中项的ID列表
          const selectedIds = this.selectedData.map((item) => item[this.rowKey]);

          // 为当前页中已在selectedData中的项设置选中状态
          (this.leftTableData || []).forEach((row) => {
            if (selectedIds.includes(row[this.rowKey])) {
              this.$refs.leftTable.toggleRowSelection(row, true);
            }
          });
        }

        this.isInternalUpdate = false;
      });
    },

    // 从右侧移除选中项
    removeSelectedItem (row) {
      const index = this.selectedData.findIndex((item) => item[this.rowKey] === row[this.rowKey]);
      if (index !== -1) {
        this.selectedData.splice(index, 1);

        // 通知父组件
        this.$emit('selection-change', [...this.selectedData]);
        // v-model双向绑定更新
        this.$emit('input', [...this.selectedData]);

        // 更新左侧表格选择状态
        this.$nextTick(() => {
          this.updateLeftTableSelection();
        });

        // 处理右侧分页
        const totalPages = Math.ceil(this.filteredSelectedDataTotal / this.rightPageSize);
        if (this.rightCurrentPage > totalPages && totalPages > 0) {
          this.rightCurrentPage = totalPages;
        }
      }
    },

    // 左侧表格页码变化
    handleLeftCurrentChange (page) {
      this.leftCurrentPage = page;
      this.loadLeftTableData();
    },

    // 右侧表格页码变化
    handleRightCurrentChange (page) {
      this.rightCurrentPage = page;
    },

    // 左侧搜索处理
    handleLeftSearch () {
      this.leftCurrentPage = 1;
      // 触发后端搜索
      this.loadLeftTableData();
    },

    // 右侧搜索处理
    handleRightSearch () {
      this.rightCurrentPage = 1;
    },

    // 对外暴露的方法：获取所有已选择的数据
    getSelectedData () {
      return [...this.selectedData];
    },

    // 对外暴露的方法：设置已选择的数据
    setSelectedData (data) {
      if (this.maxSelectionLimit > 0 && data.length > this.maxSelectionLimit) {
        this.$message.error(this.maxLimitMessage);
        return;
      }
      this.selectedData = [...data];
      // 更新左侧表格选择状态
      this.$nextTick(() => {
        this.updateLeftTableSelection();
      });

      // 通知父组件
      this.$emit('selection-change', [...this.selectedData]);
      // v-model双向绑定更新
      this.$emit('input', [...this.selectedData]);
    },

    // 对外暴露的方法：清空所有选择
    clearSelection () {
      this.selectedData = [];
      if (this.$refs.leftTable) {
        this.$refs.leftTable.clearSelection();
      }

      // 通知父组件
      this.$emit('selection-change', []);
      // v-model双向绑定更新
      this.$emit('input', []);
    },

    // 删除当前页弹框
    clearSelectionConfirm (){
      this.$confirm('确定清空全部选项吗?', {
        type: 'question',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.clearSelection();
      });
    },

    // 清除右侧当前页的数据
    clearCurrentPage () {
      if (this.filteredRightTableData.length === 0) return;
      
      // 获取当前页数据的ID列表
      const currentPageIds = this.filteredRightTableData.map((item) => item[this.rowKey]);
        
      // 确认删除
      this.$confirm('确定清除当前页选项吗?', {
        type: 'question',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        // 记录原始数据长度
        const originalLength = this.selectedData.length;
          
        // 逐个删除当前页的数据（注意：从后向前删除以避免索引变化问题）
        for (let i = this.selectedData.length - 1; i >= 0; i--) {
          if (currentPageIds.includes(this.selectedData[i][this.rowKey])) {
            this.selectedData.splice(i, 1);
          }
        }
          
        // 通知父组件
        this.$emit('selection-change', [...this.selectedData]);
        // v-model双向绑定更新
        this.$emit('input', [...this.selectedData]);
          
        // 更新左侧表格选择状态
        this.$nextTick(() => {
          this.updateLeftTableSelection();
        });
          
        // 处理右侧分页 - 如果当前页被清空且不是第一页，调整页码
        const totalPages = Math.ceil(this.filteredSelectedDataTotal / this.rightPageSize);
        if (this.rightCurrentPage > totalPages && totalPages > 0) {
          this.rightCurrentPage = totalPages;
        }
          
        this.$message.success(`已清除当前页 ${originalLength - this.selectedData.length} 项数据`);
      }).catch(() => {
      });
    },


    // 选择所有的数据
    handleSelect (value) {
      switch (value) {
        case 'all':
          this.handleSelectAll();
          break;
        case 'page':
          if((this.maxSelectionLimit > 0 && this.defaultPageSize > this.maxSelectionLimit)){
            this.$message.error(this.maxLimitMessage)
            return
          }

          if(this.maxSelectionLimit > 0 && 
            (this.selectedData.length + this.leftTableData.length) > this.maxSelectionLimit) {
            this.$message.error(this.maxLimitMessage)
            return
          }
          this.handleSelectCurrentPage();
          break;
      }
    },

    // 添加全选当前页方法
    handleSelectCurrentPage() {
      // 设置内部更新标志，避免触发 handleLeftSelectionChange
      this.isInternalUpdate = true;

      try {
      // 找出当前页中未选中的项
      const currentSelectedIds = this.selectedData.map(item => item[this.rowKey]);
      const newSelectedItems = this.leftTableData.filter((item,index) =>
        !currentSelectedIds.includes(item[this.rowKey]) && this.actualSelectable(item, index)
      );

      // 批量添加到选中数据
      if (newSelectedItems.length > 0) {
        this.selectedData.push(...newSelectedItems);

        // 批量更新表格选择状态
        this.$nextTick(() => {
          if (this.$refs.leftTable) {
          // 先清除选择
          this.$refs.leftTable.clearSelection();

          // 批量设置选中状态
          this.leftTableData.forEach(row => {
            this.$refs.leftTable.toggleRowSelection(row, true);
            });
          }

          // 重置标志
          this.isInternalUpdate = false;

          // 一次性触发事件通知
          this.$emit('selection-change', [...this.selectedData]);
          this.$emit('input', [...this.selectedData]);
        });
      } else {
        // 如果没有新增项，直接重置标志
        this.isInternalUpdate = false;
      }
      } catch (error) {
        this.isInternalUpdate = false;
      }
    },

    // 添加全选方法
    async handleSelectAll () {
      if (!this.fetchMethod) return;
      
      if(this.maxSelectionLimit > 0 && this.leftTotalCount > this.maxSelectionLimit){
        this.$message.error(this.maxLimitMessage)
        return
      }

      // 这里为什么要加leftTotalCount，是因为可能他全选所有不一定是在根节点的，可能只是某个节点的所有
       if(this.maxSelectionLimit > 0 && 
        (this.selectedData.length + this.leftTotalCount) > this.maxSelectionLimit) {
        this.$message.error(this.maxLimitMessage)
        return
      }

      if( this.maxListLimit < this.leftTotalCount){
        this.$message.error(`全选所有仅支持小于${this.maxListLimit}条的数据`)
        return
      }

      this.leftLoading = true;
      try {
        // 调用接口获取所有数据
        const params = {
          pageNo: 1,
          pageSize: 999999, // 设置一个足够大的数来获取所有数据
          [this.leftSearchKey]: this.leftSearchKeyword,
          ...this.fetchOtherParams
        };
        
        
        const result = await this.fetchMethod(this.$aiClient, params);
        const processedResult = await this.responseHandler(result);

        if (processedResult && processedResult.data) {
          
          // 获取当前已选中的ID
          const currentSelectedIds = this.selectedData.map((item) => item[this.rowKey]);
          
          // 找出未选中的数据
          const newItems = processedResult.data.filter((item,index) => 
            !currentSelectedIds.includes(item[this.rowKey]) && this.actualSelectable(item, index)
          );
          
          // 将新数据添加到已选列表中
          this.selectedData = [...this.selectedData, ...newItems];

          // 更新选中状态
          this.$nextTick(() => {
            this.updateLeftTableSelection();
          });
          
          // 通知父组件
          this.$emit('selection-change', [...this.selectedData]);
          this.$emit('input', [...this.selectedData]);
          
          this.$message.success('已全选所有数据');
        }
      } catch (error) {
        this.$message.error('全选操作失败');
      } finally {
        this.leftLoading = false;
      }
    }
  },
  watch: {
    selectedData: {
      handler (val){
        if (this.validateEvent) this.dispatch('ElFormItem', 'el.form.change', [val]);
      },
      deep: true
    },
    fetchOtherParams: {
      handler (){
        this.leftCurrentPage = 1;
        this.loadLeftTableData();
      },
      deep: true
    },
    value: {
      handler (newVal) {
        if (newVal && JSON.stringify(newVal) !== JSON.stringify(this.selectedData)) {
          this.selectedData = [...newVal];
          this.$nextTick(() => {
            this.updateLeftTableSelection();
          });
        }
      },
      deep: true
    }
  }
};
</script>

<style lang="scss" scoped>
.dual-selection-table {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .table-container {
    height: 100%;
    display: flex;
    justify-content: space-between;
  }
}

.left-table-wrapper, .right-table-wrapper {
  width: 49%;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px 16px;
  border: 1px solid #ccc;
  .table-search,.table-action {
    height: 32px;
    line-height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .el-input {
      width: 100%;
      padding: 0;
    }
  }
  .table-action{
    h4{
     font-family: MicrosoftYaHeiUISemibold;
     font-size: 14px;
     color: rgba(0,0,0,0.90);
     letter-spacing: 0;
     line-height: 20px;
     font-weight: 600;
    }
  }
  .pagination-container {
    margin-top: 10px;
    text-align: right;
    .el-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  .left-table,.right-table{
    flex-grow: 1;
    margin-bottom: 12px;;
   
  }
}


// 设置table无边框样式，hui版本较低
::v-deep .el-table:after, .el-table:before ,.el-table .el-table__body-wrapper:before  {
  display: none;
}
::v-deep .el-table .el-table__body-wrapper:before{
  display: none;
}
::v-deep .el-table--fit{
  border-left: 0;
}
</style>

<template>
  <table class="easy-table" :class="customClass">
    <thead>
      <tr>
        <th 
          v-for="(column, index) in columns" 
          :key="index"
          :style="{ width: column.width }"
        >
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in data" :key="rowIndex">
        <td 
          v-for="(column, colIndex) in columns" 
          :key="colIndex"
          :class="getCellClass(row, column)"
        >
          <slot 
            :name="`cell-${column.prop}`" 
            :row="row" 
            :column="column" 
            :value="row[column.prop]"
            :rowIndex="rowIndex"
            :colIndex="colIndex"
          >
            {{ row[column.prop] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'EasyTable',
  props: {
    // 列配置 [{ label: '表头', prop: '字段名', cellClass: '自定义类名' }]
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    // 数据源
    data: {
      type: Array,
      required: true,
      default: () => []
    },
    // 自定义表格类名
    customClass: {
      type: String,
      default: ''
    }
  },
  methods: {
    /**
     * 获取单元格的类名
     */
    getCellClass(row, column) {
      const classes = [];
      
      // 如果列配置中有 cellClass，添加它
      if (column.cellClass) {
        if (typeof column.cellClass === 'function') {
          const customClass = column.cellClass(row, column);
          if (customClass) {
            classes.push(customClass);
          }
        } else {
          classes.push(column.cellClass);
        }
      }
      
      return classes.join(' ');
    }
  }
};
</script>

<style lang="scss" scoped>
.easy-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(229,229,229,1);

  th {
    background: rgba(248,249,251,1);
    color: rgba(0, 0, 0, 0.45);
    font-weight: normal;
    text-align: left;
    padding: 8px 12px;
    border-right: 1px solid rgba(229,229,229,1);
    
    &:first-child {
      border-top-left-radius: 8px;
    }
    
    &:last-child {
      border-top-right-radius: 8px;
      border-right: none;
    }
  }

  td {
    padding: 8px 12px;
    border-right: 1px solid rgba(229,229,229,1);
    border-bottom: 1px solid rgba(229,229,229,1);
    background-color: #FFF;
    color: #333;
    
    &:last-child {
      border-right: none;
    }
  }

  tr:last-child {
    td {
      border-bottom: none;
      
      &:first-child {
        border-bottom-left-radius: 8px;
      }
      
      &:last-child {
        border-bottom-right-radius: 8px;
      }
    }
  }
}
</style>


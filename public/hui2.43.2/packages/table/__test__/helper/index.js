const getBasicTableData = function() {
  return {
    tableData: [
      {
        date: '2018/01/02',
        name: '海康威视海康威视海康威视',
        address: '杭州市滨江区阡陌路555号'
      },
      {
        date: '2018/01/04',
        name: '海康威视',
        address: '杭州市滨江区阡陌路555号'
      },
      {
        date: '2018/01/01',
        name: '海康威视',
        address: '杭州市滨江区阡陌路555号'
      },
      {
        date: '2018/01/03',
        name: '海康威视',
        address: '杭州市滨江区阡陌路555号'
      }
    ]
  };
};
const basicTable = {
  template: `
      <el-table :data="tableData" style="width: 100%">
        <el-table-column
          prop="date"
          label="日期"
          width="180">
        </el-table-column>
        <el-table-column
          prop="name"
          show-overflow-tooltip
          label="品牌"
          width="150">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
    `,
  data: getBasicTableData
};

const stripeTable = {
  template: `
  <el-table
    :data="tableData"
    stripe
    style="width: 100%">
    <el-table-column
      prop="date"
      label="日期"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="品牌"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="地址">
    </el-table-column>
  </el-table>
    `,
  data: getBasicTableData
};

const borderTable = {
  template: `
  <el-table
    :data="tableData"
    border
    style="width: 100%">
    <el-table-column
      prop="date"
      label="日期"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="品牌"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="地址">
    </el-table-column>
  </el-table>
    `,
  data: getBasicTableData
};
const statusTable = {
  template: `
  <el-table
    :data="tableData"
    style="width: 100%"
    :row-class-name="tableRowClassName">
    <el-table-column
      prop="date"
      label="日期"
      width="180">
    </el-table-column>
    <el-table-column
      prop="name"
      label="品牌"
      width="180">
    </el-table-column>
    <el-table-column
      prop="address"
      label="地址">
    </el-table-column>
  </el-table>
    `,
  methods: {
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'info-row';
      } else if (rowIndex === 3) {
        return 'positive-row';
      }
      return '';
    }
  },
  data: getBasicTableData
};

// 合计行
const tableFooterTotal = {
  template: `
  <div>
    <el-table
      :data="tableData7"
      show-summary
      style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="品牌">
      </el-table-column>
      <el-table-column
        prop="amount1"
        label="数值 1">
      </el-table-column>
      <el-table-column
        prop="amount2"
        label="数值 2">
      </el-table-column>
      <el-table-column
        prop="amount3"
        label="数值 3">
      </el-table-column>
    </el-table>

    <el-table
      :data="tableData7"
      height="200"
      :summary-method="getSummaries"
      show-summary
      style="width: 100%; margin-top: 20px">
      <el-table-column
        prop="id"
        label="ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="品牌">
      </el-table-column>
      <el-table-column
        prop="amount1"
        label="数值 1（¥）">
      </el-table-column>
      <el-table-column
        prop="amount2"
        label="数值 2（¥）">
      </el-table-column>
      <el-table-column
        prop="amount3"
        label="数值 3（¥）">
      </el-table-column>
    </el-table>
  </div>

  `,
  data() {
    return {
      tableData7: [
        {
          id: '12987122',
          name: '海康威视',
          amount1: '234',
          amount2: '3.2',
          amount3: 10
        },
        {
          id: '12987123',
          name: '海康威视',
          amount1: '165',
          amount2: '4.43',
          amount3: 12
        },
        {
          id: '12987124',
          name: '海康威视',
          amount1: '324',
          amount2: '1.9',
          amount3: 9
        },
        {
          id: '12987125',
          name: '海康威视',
          amount1: '621',
          amount2: '2.2',
          amount3: 17
        },
        {
          id: '12987126',
          name: '海康威视',
          amount1: '539',
          amount2: '4.1',
          amount3: 15
        }
      ]
    };
  },
  methods: {
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总价';
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          sums[index] = '¥ ' + sums[index];
        } else {
          sums[index] = 'N/A';
        }
      });

      return sums;
    }
  }
};

// 合并行或者列
const mergeRowColumnTable = {
  template: `
    <div>
      <el-table
        :data="tableData6"
        :span-method="objectSpanMethod"
        border
        style="width: 100%;">
        <el-table-column
          prop="id"
          label="ID">
        </el-table-column>
        <el-table-column
          prop="name"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="category"
          sortable
          label="分类">
        </el-table-column>
        <el-table-column
          prop="desc"
          sortable
          label="单位">
        </el-table-column>
        <el-table-column
          prop="address"
          sortable
          label="地址">
        </el-table-column>
        <el-table-column
          prop="shop"
          sortable
          label="所属主体">
        </el-table-column>
        <el-table-column
          prop="shopId"
          sortable
          label="主体编号">
        </el-table-column>
      </el-table>
    </div>
  `,
  data() {
    return {
      tableData6: [
        {
          id: '12987122',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        },
        {
          id: '12987123',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        },
        {
          id: '12987125',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        },
        {
          id: '12987126',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        }
      ]
    };
  },
  methods: {
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (rowIndex % 2 === 0) {
        if (columnIndex === 0) {
          return {
            rowspan: 1,
            colspan: 2
          };
        } else if (columnIndex === 1) {
          return {
            // rowspan和colspan同时为0表示不插入单元格
            rowspan: 0,
            colspan: 0
          };
        }
      }
      if (columnIndex === 3) {
        if (rowIndex === 0) {
          return {
            rowspan: 0, // table特性：rowspan = 0表示从首行到尾行都合并
            colspan: 1
          };
        } else {
          return {
            // rowspan和colspan同时为0表示不插入单元格
            rowspan: 0,
            colspan: 0
          };
        }
      }
    }
  }
};

export {
  basicTable,
  stripeTable,
  borderTable,
  statusTable,
  tableFooterTotal,
  mergeRowColumnTable
};

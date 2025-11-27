import { createVue, destroyVM } from '@/src/utils/test-util';
import {
  basicTable,
  stripeTable,
  borderTable,
  statusTable,
  tableFooterTotal,
  mergeRowColumnTable
} from './helper';

jest.setTimeout(10000);

/**
 * FIXME: 虚拟滚动条计算相关在snapshots中有问题
 */

function timeout(callback, done, delay = 800) {
  setTimeout(() => {
    callback();
    done();
  }, delay);
}

function sleep(ms = 800) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

describe('table snapshot', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('基础表格', () => {
    return new Promise(done => {
      vm = createVue(basicTable);

      // table-column mounted后更新store, 触发table-header/table-body 重新render, 所以nextTick中table才会有数据
      // table中用了很多nextTick去更新布局, 为了获取表格最终的样子, 用setTimeout比较好, 保证中table所有nextTick和debounce都执行完
      // nextTick(() => {
      //   expect(vm.$el).toMatchSnapshot();
      // });
      timeout(() => {
        expect(vm.$el).toMatchSnapshot();
      }, done);
    });
  });

  test('带斑马纹表格', () => {
    return new Promise(done => {
      vm = createVue(stripeTable);

      timeout(() => {
        expect(vm.$el).toMatchSnapshot();
      }, done);
    });
  });

  test('带边框表格', () => {
    return new Promise(done => {
      vm = createVue(borderTable);

      timeout(() => {
        expect(vm.$el).toMatchSnapshot();
      }, done);
    });
  });

  test('带状态表格', () => {
    return new Promise(done => {
      vm = createVue(statusTable);
      timeout(() => {
        expect(vm.$el).toMatchSnapshot();
      }, done);
    });
  });

  test('表尾合计行', () => {
    return new Promise(done => {
      vm = createVue(tableFooterTotal);
      timeout(() => {
        expect(vm.$el).toMatchSnapshot();
      }, done);
    });
  });

  test('合并行或列', () => {
    return new Promise(done => {
      vm = createVue(mergeRowColumnTable);
      timeout(() => {
        expect(vm.$el).toMatchSnapshot();
      }, done);
    });
  });
});

describe('table attribute', () => {
  let tableVm;
  afterEach(() => {
    destroyVM(tableVm);
  });
  const getTableData = function() {
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
  const createTable = function(props, options = {}) {
    return createVue(
      Object.assign(
        {
          template: `
      <el-table :data="tableData" ${props}>
        <el-table-column
          prop="date"
          label="日期">
        </el-table-column>
        <el-table-column
          prop="name"
          label="品牌">
        </el-table-column>
        <el-table-column
          prop="address"
          label="地址">
        </el-table-column>
      </el-table>
    `,
          data: getTableData
        },
        options
      )
    );
  };
  const createMultiLevelTable = function(prop) {
    return createVue({
      template: `
        <el-table
          height="370"
          ${prop}
          :data="tableData"
          border
          style="width: 100%">
          <el-table-column
            prop="date"
            label="日期"
            width="150">
          </el-table-column>
          <el-table-column label="配送信息">
            <el-table-column
              prop="name"
              label="品牌"
              width="120">
            </el-table-column>
            <el-table-column label="地址">
              <el-table-column
                prop="province"
                label="省份"
                width="120">
              </el-table-column>
              <el-table-column
                prop="city"
                label="市区"
                width="120">
              </el-table-column>
              <el-table-column
                prop="address"
                label="地址"
                width="300">
              </el-table-column>
              <el-table-column
                prop="zip"
                label="邮编"
                width="120">
              </el-table-column>
            </el-table-column>
          </el-table-column>
        </el-table>
      `,

      data() {
        return {
          tableData: [
            {
              date: '2018/01/03',
              name: '海康威视',
              province: '浙江省',
              city: '杭州市',
              address: '杭州市滨江区阡陌路555号',
              zip: 310018
            }
          ]
        };
      }
    });
  };

  test('height', () => {
    return new Promise(done => {
      tableVm = createTable('height="200"');
      timeout(() => {
        expect(tableVm.$el.style.height).toBe('200px');
        destroyVM(tableVm);
      }, done);
    });
  });

  test('max-height', () => {
    return new Promise(done => {
      tableVm = createTable('max-height="200"');
      timeout(() => {
        expect(tableVm.$el.style.maxHeight).toBe('200px');
        destroyVM(tableVm);
      }, done);
    });
  });

  test('stripe', () => {
    return new Promise(done => {
      tableVm = createTable('stripe');
      timeout(() => {
        expect(tableVm.$el.classList.contains('el-table--striped')).toBe(true);
        destroyVM(tableVm);
      }, done);
    });
  });

  test('border', () => {
    return new Promise(done => {
      tableVm = createTable('border');
      timeout(() => {
        expect(tableVm.$el.classList.contains('el-table--border')).toBe(true);
        destroyVM(tableVm);
      }, done);
    });
  });

  test('fit', () => {
    return new Promise(done => {
      tableVm = createTable('fit');
      timeout(() => {
        expect(tableVm.$el.classList.contains('el-table--fit')).toBe(true);
        destroyVM(tableVm);
      }, done);
    });
  });

  test('show header', () => {
    return new Promise(done => {
      tableVm = createTable(':show-header="false"');
      timeout(() => {
        expect(
          tableVm.$el.querySelectorAll('.el-table__header-wrapper').length
        ).toBe(0);
        destroyVM(tableVm);
      }, done);
    });
  });

  test('highlight-current-row', async () => {
    tableVm = createTable('highlight-current-row ref="table"', {
      methods: {
        setRow() {
          this.$refs.table.setCurrentRow(this.tableData[1]);
        }
      }
    });
    await sleep();

    tableVm.setRow();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[1].classList.contains('current-row')).toBe(false);
    await sleep();
    expect(trs[1].classList.contains('current-row')).toBe(true);
  });

  test('current-row-key, row-key', async () => {
    tableVm = createTable(
      'highlight-current-row row-key="id" current-row-key="b"',
      {
        data() {
          return {
            tableData: [
              {
                id: 'a',
                date: '2018/01/02',
                name: '海康威视海康威视海康威视',
                address: '杭州市滨江区阡陌路555号'
              },
              {
                id: 'b',
                date: '2018/01/04',
                name: '海康威视',
                address: '杭州市滨江区阡陌路555号'
              }
            ]
          };
        }
      }
    );
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].classList.contains('current-row')).toBe(false);
    expect(trs[1].classList.contains('current-row')).toBe(true);
  });

  test('row-class-name function', async () => {
    tableVm = createTable(`:row-class-name="tableRowClassName"`, {
      methods: {
        tableRowClassName({ row, rowIndex }) {
          if (rowIndex === 0) {
            return 'test0';
          } else if (rowIndex === 1) {
            return 'test1';
          }
          return '';
        }
      }
    });
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].classList.contains('test0')).toBe(true);
    expect(trs[1].classList.contains('test1')).toBe(true);
  });

  test('row-class-name string', async () => {
    tableVm = createTable(`row-class-name="testString"`);
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].classList.contains('testString')).toBe(true);
    expect(trs[1].classList.contains('testString')).toBe(true);
  });

  test('row-style Object', async () => {
    tableVm = createTable(`:row-style="{color: 'coral'}"`);
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].style.color).toBe('coral');
    expect(trs[1].style.color).toBe('coral');
  });

  test('row-style function', async () => {
    tableVm = createTable(
      `:row-style="({rowIndex}) => {if(rowIndex===0) return {color: 'coral'}}"`
    );
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].style.color).toBe('coral');
    expect(trs[1].style.color).not.toBe('coral');
  });

  test('cell-class-name string', async () => {
    tableVm = createTable(`cell-class-name="test-my-class"`);
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    const cell1 = trs[1].querySelector('td');
    const cell2 = trs[2].querySelector('td');
    expect(cell1.classList.contains('test-my-class')).toBe(true);
    expect(cell2.classList.contains('test-my-class')).toBe(true);
  });

  test('cell-class-name function', async () => {
    tableVm = createTable(
      `:cell-class-name="({rowIndex}) => {if(rowIndex===0) return 'test-0-class'; return 'test-other-class'}"`
    );
    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    const cell0 = trs[0].querySelector('td');
    const cell1 = trs[1].querySelector('td');
    expect(cell0.classList.contains('test-0-class')).toBe(true);
    expect(cell1.classList.contains('test-other-class')).toBe(true);
  });

  test('cell-style string', async () => {
    tableVm = createTable(`:cell-style="{color: 'coral'}"`);

    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].querySelector('td').style.color).toBe('coral');
    expect(trs[1].querySelector('td').style.color).toBe('coral');
  });

  test('cell-style function', async () => {
    tableVm = createTable(
      `:cell-style="({rowIndex}) => {if(rowIndex===0) return {color: 'coral'}}"`
    );

    await sleep();
    const trs = tableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[0].querySelector('td').style.color).toBe('coral');
    expect(trs[1].querySelector('td').style.color).not.toBe('coral');
  });

  test('header-row-class-name string', async () => {
    tableVm = createTable(`header-row-class-name="my-header-class"`);
    await sleep();
    const header = tableVm.$el.querySelector(
      '.el-table__header-wrapper thead tr'
    );

    expect(header.classList.contains('my-header-class')).toBe(true);
  });

  test('header-row-class-name function', async () => {
    // 多级表头
    tableVm = createMultiLevelTable(
      `:header-row-class-name="({rowIndex}) => {return rowIndex === 0 ? 'header-class-0': 'header-class-other'}"`
    );

    await sleep();
    const headers = tableVm.$el.querySelectorAll(
      '.el-table__header-wrapper thead tr'
    );

    expect(headers[0].classList.contains('header-class-0')).toBe(true);
    expect(headers[1].classList.contains('header-class-other')).toBe(true);
  });

  test('header-row-style Object', async () => {
    tableVm = createTable(`:header-row-style="{color: 'coral'}"`);
    await sleep();
    const header = tableVm.$el.querySelector(
      '.el-table__header-wrapper thead tr'
    );

    expect(header.style.color).toBe('coral');
  });

  test('header-row-style function', async () => {
    tableVm = createTable(`:header-row-style="() => ({color: 'coral'})"`);
    await sleep();
    const header = tableVm.$el.querySelector(
      '.el-table__header-wrapper thead tr'
    );

    expect(header.style.color).toBe('coral');
  });

  test('header-cell-class-name string', async () => {
    tableVm = createTable(`header-cell-class-name="my-header-cell-class"`);
    await sleep();
    const header = tableVm.$el.querySelector(
      '.el-table__header-wrapper thead tr'
    );

    expect(
      header
        .querySelectorAll('th')[0]
        .classList.contains('my-header-cell-class')
    ).toBe(true);
    expect(
      header
        .querySelectorAll('th')[1]
        .classList.contains('my-header-cell-class')
    ).toBe(true);
  });

  test('header-cell-class-name function', async () => {
    tableVm = createMultiLevelTable(
      `:header-cell-class-name="({rowIndex}) => {return rowIndex === 0 ? 'header-cell-class-0': 'header-cell-class-other'}"`
    );
    await sleep();
    const headers = tableVm.$el.querySelectorAll(
      '.el-table__header-wrapper thead tr'
    );

    expect(
      headers[0]
        .querySelectorAll('th')[0]
        .classList.contains('header-cell-class-0')
    ).toBe(true);
    expect(
      headers[0]
        .querySelectorAll('th')[1]
        .classList.contains('header-cell-class-0')
    ).toBe(true);

    expect(
      headers[1]
        .querySelectorAll('th')[0]
        .classList.contains('header-cell-class-other')
    ).toBe(true);
    expect(
      headers[1]
        .querySelectorAll('th')[1]
        .classList.contains('header-cell-class-other')
    ).toBe(true);
  });

  test('header-cell-style Object', async () => {
    tableVm = createTable(`:header-cell-style="{color: 'coral'}"`);
    await sleep();
    const header = tableVm.$el.querySelector(
      '.el-table__header-wrapper thead tr'
    );

    expect(header.querySelectorAll('th')[0].style.color).toBe('coral');
    expect(header.querySelectorAll('th')[1].style.color).toBe('coral');
  });

  test('header-cell-style function', async () => {
    tableVm = createMultiLevelTable(
      `:header-cell-style="({rowIndex}) => rowIndex === 0 ? ({color: 'coral'}) : ({color: 'red'})"`
    );
    await sleep();
    const headers = tableVm.$el.querySelectorAll(
      '.el-table__header-wrapper thead tr'
    );

    // 一级表头
    expect(headers[0].querySelectorAll('th')[0].style.color).toBe('coral');
    expect(headers[0].querySelectorAll('th')[1].style.color).toBe('coral');
    // 二级表头
    expect(headers[1].querySelectorAll('th')[0].style.color).toBe('red');
    expect(headers[1].querySelectorAll('th')[1].style.color).toBe('red');
  });

  test('empty-text', async () => {
    tableVm = createTable(`empty-text="no-data"`, {
      data() {
        return { tableData: [] };
      }
    });
    await sleep();
    expect(
      tableVm.$el
        .querySelector('.el-table__body-wrapper .el-table__empty-text')
        .textContent.trim()
    ).toBe('no-data');
  });
});

describe('expand', () => {
  let expandTableVm;
  afterEach(() => {
    destroyVM(expandTableVm);
  });
  const createExpandTable = function(tableProp, columnProp) {
    const getExpandTableData = function() {
      return [
        {
          id: '0',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        },
        {
          id: '1',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        },
        {
          id: '2',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        },
        {
          id: '3',
          name: 'AI Cloud',
          category: '嗯啊',
          desc: '海康威视',
          address: '阡陌路',
          shop: '海康威视',
          shopId: '10333'
        }
      ];
    };
    return createVue({
      template: `
          <el-table
            ref=expandTable
            ${tableProp}
            :data="tableData"
            style="width: 100%">
            <el-table-column type="expand" ${columnProp}>
              <template slot-scope="props">
                <el-form inline label-width="90px" class="demo-table-expand">
                  <el-form-item label="名称">
                    <span>{{ props.row.name }}</span>
                  </el-form-item>
                  <el-form-item label="所属品牌">
                    <span>{{ props.row.shop }}</span>
                  </el-form-item>
                  <el-form-item label="商品 ID">
                    <span>{{ props.row.id }}</span>
                  </el-form-item>
                  <el-form-item label="ID">
                    <span>{{ props.row.shopId }}</span>
                  </el-form-item>
                  <el-form-item label="分类">
                    <span>{{ props.row.category }}</span>
                  </el-form-item>
                  <el-form-item label="地址">
                    <span>{{ props.row.address }}</span>
                  </el-form-item>
                  <el-form-item label="描述">
                    <span>{{ props.row.desc }}</span>
                  </el-form-item>
                </el-form>
              </template>
            </el-table-column>
            <el-table-column
              label="ID"
              prop="id">
            </el-table-column>
            <el-table-column
              label="名称"
              prop="name">
            </el-table-column>
            <el-table-column
              label="描述"
              prop="desc">
            </el-table-column>
          </el-table>
        `,
      data() {
        return {
          tableData: getExpandTableData()
        };
      },
      methods: {
        refreshData() {
          this.tableData = getExpandTableData();
        }
      }
    });
  };
  test('expand work', async () => {
    expandTableVm = createExpandTable();
    await sleep();

    expect(
      expandTableVm.$el.querySelectorAll('td.el-table__expand-column').length
    ).toBe(4);
  });

  test('default-expand-all', async () => {
    expandTableVm = createExpandTable('default-expand-all');
    await sleep();

    expect(
      expandTableVm.$el.querySelectorAll(
        '.el-table__body-wrapper .el-table__row.expanded'
      ).length
    ).toBe(4);

    // 刷新数据后, 是否需要全部折叠
    // expandTableVm.refreshData();

    // await sleep();

    // expect(
    //   expandTableVm.$el.querySelectorAll(
    //     '.el-table__body-wrapper .el-table__row.expanded'
    //   ).length
    // ).toBe(0);
  });

  test('expand-row-key', async () => {
    expandTableVm = createExpandTable(`row-key="id" :expand-row-keys="['1']"`);
    await sleep();

    expect(
      expandTableVm.$el.querySelectorAll(
        '.el-table__body-wrapper .el-table__row.expanded'
      ).length
    ).toBe(1);
    const trs = expandTableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );
    expect(trs[1].classList.contains('expanded')).toBe(true);
  });

  test('expand when click icon', async () => {
    expandTableVm = createExpandTable();

    await sleep();
    const trs = expandTableVm.$el.querySelectorAll(
      '.el-table__body-wrapper tbody tr'
    );

    trs[0].querySelector('.el-table__expand-icon').click();
    await sleep();

    expect(trs[0].classList.contains('expanded')).toBe(true);
  });
});
describe('table column attribute', () => {});

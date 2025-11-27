import LayoutObserver from './layout-observer';
export default {
  name: 'ElTableFooter',

  mixins: [LayoutObserver],

  render() {
    const sums = [];
    this.columns.forEach((column, index) => {
      if (index === 0) {
        sums[index] = this.sumText;
        return;
      }
      const values = this.store.states.data.map(item =>
        Number(item[column.property])
      );
      const precisions = [];
      let notNumber = true;
      values.forEach(value => {
        if (!isNaN(value)) {
          notNumber = false;
          const decimal = ('' + value).split('.')[1];
          precisions.push(decimal ? decimal.length : 0);
        }
      });
      const precision = Math.max.apply(null, precisions);
      if (!notNumber) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!isNaN(value)) {
            return parseFloat((prev + curr).toFixed(Math.min(precision, 20)));
          } else {
            return prev;
          }
        }, 0);
      } else {
        sums[index] = '';
      }
    });

    return (
      <table
        class='el-table__footer'
        cellspacing='0'
        cellpadding='0'
        border='0'
      >
        <colgroup>
          {this._l(this.columns, column => (
            <col name={column.id} />
          ))}
        </colgroup>
        <tbody>
          <tr>
            {this._l(this.columns, (column, cellIndex) => (
              <td
                colspan={column.colSpan}
                rowspan={column.rowSpan}
                class={[
                  column.id,
                  column.headerAlign,
                  column.className || '',
                  !column.children ? 'is-leaf' : '',
                  column.labelClassName
                ]}
              >
                <div class={['cell', column.labelClassName]}>
                  {this.summaryMethod
                    ? this.summaryMethod({
                        columns: this.columns,
                        data: this.store.states.data
                      })[cellIndex]
                    : sums[cellIndex]}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  },

  props: {
    fixed: String,
    store: {
      required: true
    },
    summaryMethod: Function,
    sumText: String,
    border: Boolean,
    defaultSort: {
      type: Object,
      default() {
        return {
          prop: '',
          order: ''
        };
      }
    }
  },

  computed: {
    table() {
      return this.$parent;
    },
    isAllSelected() {
      return this.store.states.isAllSelected;
    },

    columnsCount() {
      return this.store.states.columns.length;
    },

    // leftFixedLeafCount() {
    //   return this.store.states.fixedLeafColumns.length;
    // },

    // rightFixedLeafCount() {
    //   return this.store.states.rightFixedLeafColumns.length;
    // },

    columns() {
      if (this.fixed === true || this.fixed === 'left') {
        return this.store.states.fixedLeafColumns;
      } else if (this.fixed === 'right') {
        return this.store.states.rightFixedLeafColumns;
      }
      return this.store.states.columns;
    }
  },

  methods: {
    // isCellHidden(index, columns) {
    //   if (this.fixed === true || this.fixed === 'left') {
    //     return index >= this.leftFixedLeafCount;
    //   } else if (this.fixed === 'right') {
    //     let before = 0;
    //     for (let i = 0; i < index; i++) {
    //       before += columns[i].colSpan;
    //     }
    //     return before < this.columnsCount - this.rightFixedLeafCount;
    //   } else {
    //     return (
    //       index < this.leftFixedLeafCount ||
    //       index >= this.columnsCount - this.rightFixedLeafCount
    //     );
    //   }
    // }
  }
};

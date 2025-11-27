import { getCell, getColumnByCell, getRowIdentity } from './util';
import { hasClass, addClass, removeClass } from 'hui/src/utils/dom';
import ElCheckbox from 'hui/packages/checkbox';
import ElTooltip from 'hui/packages/tooltip';
import debounce from 'throttle-debounce/debounce';
import LayoutObserver from './layout-observer';

export default {
  name: 'ElTableBody',

  mixins: [LayoutObserver],

  components: {
    ElCheckbox,
    ElTooltip
  },

  props: {
    store: {
      required: true
    },
    stripe: {
      type: Boolean,
      default: null
    },
    context: {},
    rowClassName: [String, Function],
    rowStyle: [Object, Function],
    fixed: String,
    highlight: {
      type: Boolean,
      default: null
    }
  },

  render(h) {
    return (
      <table class='el-table__body' cellspacing='0' cellpadding='0' border='0'>
        <colgroup>
          {this._l(this.columns, column => (
            <col name={column.id} />
          ))}
        </colgroup>
        <tbody>
          {this._l(this.data, (row, _$index) => {
            // modify by zhangxiaogang
            const renderExpanded =
              this.table.renderExpanded || this.table.$parent.renderExpanded;
            const $index = _$index + this.startIndex;
            return [
              <tr
                style={this.getRowStyle(row, $index)}
                key={this.table.rowKey ? this.getKeyOfRow(row, $index) : $index}
                on-dblclick={$event => this.handleDoubleClick($event, row)}
                on-click={$event => this.handleClick($event, row, $index)}
                on-contextmenu={$event => this.handleContextMenu($event, row)}
                on-mouseenter={() => this.handleMouseEnter($index)}
                on-mouseleave={() => this.handleMouseLeave()}
                class={[this.getRowClass(row, $index)]}
              >
                {this._l(this.columns, (column, _cellIndex) => {
                  const cellIndex = column.cellIndex || _cellIndex;
                  const { rowspan, colspan } = this.getSpan(
                    row,
                    column,
                    $index,
                    cellIndex
                  );
                  if (!rowspan && !colspan) {
                    return '';
                  } else {
                    if (rowspan === 1 && colspan === 1) {
                      return (
                        <td
                          style={this.getCellStyle(
                            $index,
                            cellIndex,
                            row,
                            column
                          )}
                          class={this.getCellClass(
                            $index,
                            cellIndex,
                            row,
                            column
                          )}
                          on-mouseenter={$event =>
                            this.handleCellMouseEnter($event, row)
                          }
                          on-mouseleave={this.handleCellMouseLeave}
                        >
                          {column.renderCell.call(this._renderProxy, h, {
                            row,
                            column,
                            $index,
                            store: this.store,
                            _self: this.context || this.table.$vnode.context
                          })}
                        </td>
                      );
                    } else {
                      return (
                        <td
                          style={this.getCellStyle(
                            $index,
                            cellIndex,
                            row,
                            column
                          )}
                          class={this.getCellClass(
                            $index,
                            cellIndex,
                            row,
                            column
                          )}
                          rowspan={rowspan}
                          colspan={colspan}
                          on-mouseenter={$event =>
                            this.handleCellMouseEnter($event, row)
                          }
                          on-mouseleave={this.handleCellMouseLeave}
                        >
                          {column.renderCell.call(this._renderProxy, h, {
                            row,
                            column,
                            $index,
                            store: this.store,
                            _self: this.context || this.table.$vnode.context
                          })}
                        </td>
                      );
                    }
                  }
                })}
              </tr>,
              this.store.states.expandRows.indexOf(row) > -1 ? (
                <tr class={{ 'is-hidden': this.fixed }}>
                  <td
                    colspan={this.columns.length}
                    class='el-table__expanded-cell'
                  >
                    {renderExpanded
                      ? renderExpanded(h, {
                          row,
                          $index,
                          store: this.store
                        })
                      : ''}
                  </td>
                </tr>
              ) : (
                ''
              )
            ];
          })
            .concat(this.table.$slots.append)
            .concat(
              <el-tooltip
                placement='top'
                ref='tooltip'
                content={this.tooltipContent}
              />
            )}
        </tbody>
      </table>
    );
  },

  watch: {
    scrollViewStyle: {
      handler(style) {
        if (!this.isVirtualScroll) return;
        if (!this.table.$refs.bodyWrapper) {
          this.$nextTick(() => {
            this.setScrollViewStyle(style);
          });
        } else {
          this.setScrollViewStyle(style);
        }
        // 修复虚拟滚动下固定列错位的问题
        if (this.fixed) {
          this.$nextTick(() => {
            this.setFixedBodyStyle(style);
          });
        }
      },
      immediate: true
    },
    /**
     * modified by zhangxiaogang
     * date: 2018-05-09
     * todo: 合并行列的表格hover需要关联变化，故改写此处逻辑
     */
    'store.states.hoverRow'(newVal) {
      if (!this.store.states.isComplex) return;
      const el = this.$el;
      if (!el) return;
      const rows = el.querySelectorAll('tbody > tr.el-table__row');
      const oldRow = el.querySelector('tbody > tr.el-table__row.hover-row');
      const newRow =
        newVal !== 0 && !newVal ? null : rows[newVal - this.startIndex];
      if (oldRow) {
        removeClass(oldRow, 'hover-row');
      }
      if (newRow) {
        addClass(newRow, 'hover-row');
      }
      /* const setHover = (index, flag) => {
        const row = rows[index];
        flag ? addClass(row, 'hover-row') : removeClass(row, 'hover-row');
      };
      if (!Array.isArray(newVal)) newVal = [newVal];
      if (!Array.isArray(oldVal)) oldVal = [oldVal];
      [newVal, oldVal].forEach((vv, i) => {
        vv.forEach((v) => {
          !isNaN(v) && setHover(v, i === 0);
        });
      }); */
    },
    'store.states.currentRow'(newVal, oldVal) {
      if (!this.highlight) return;
      const el = this.$el;
      if (!el) return;
      const data = this.store.states.data;
      const rows = el.querySelectorAll('tbody > tr.el-table__row');
      const oldRow = rows[data.indexOf(oldVal)];
      const newRow = rows[data.indexOf(newVal)];
      if (oldRow) {
        removeClass(oldRow, 'current-row');
      } else if (rows) {
        [].forEach.call(rows, row => removeClass(row, 'current-row'));
      }
      if (newRow) {
        addClass(newRow, 'current-row');
      }
    }
  },

  computed: {
    table() {
      if (!this.$parent.columns) {
        return this.$parent.$parent;
      }
      return this.$parent;
    },

    scrollTop() {
      return this.table.scrollTop;
    },

    isVirtualScroll() {
      return this.table.isVirtualScroll;
    },

    rowHeight() {
      return this.store.states.rowHeight;
    },

    clientHeight() {
      return (
        Number(this.table.height) ||
        Number(this.table.maxHeight) ||
        this.table.bodyWrapperHeight
      );
    },

    scrollState() {
      const { scrollTop, clientHeight } = this;
      return {
        start: scrollTop,
        end: scrollTop + clientHeight
      };
    },

    count() {
      return this.store.states.data.length;
    },

    startIndex() {
      const { rowHeight, scrollState, isVirtualScroll, columnsCount } = this;
      if (!isVirtualScroll || !columnsCount || !this.count) return 0;
      let index = Math.floor(scrollState.start / rowHeight);
      index < 0 && (index = 0);

      return index;
    },

    endIndex() {
      const { rowHeight, scrollState, count, isVirtualScroll } = this;
      if (!isVirtualScroll) return count;
      let index = Math.ceil(scrollState.end / rowHeight);
      index > count - 1 && (index = count - 1);

      return index;
    },

    viewMarginTop() {
      return this.startIndex * this.rowHeight;
    },

    viewMarginBottom() {
      return (this.count - 1 - this.endIndex) * this.rowHeight;
    },

    scrollViewStyle() {
      const { isVirtualScroll, viewMarginTop, viewMarginBottom } = this;
      return isVirtualScroll
        ? {
            marginTop: `${viewMarginTop}px`,
            marginBottom: `${viewMarginBottom}px`
          }
        : {};
    },

    data() {
      return this.isVirtualScroll
        ? this.store.states.data.slice(this.startIndex, this.endIndex + 1)
        : this.store.states.data;
    },

    columnsCount() {
      return this.store.states.columns.length;
    },

    leftFixedLeafCount() {
      return this.store.states.fixedLeafColumns.length;
    },

    rightFixedLeafCount() {
      return this.store.states.rightFixedLeafColumns.length;
    },

    columns() {
      if (this.fixed === true || this.fixed === 'left') {
        return this.store.states.fixedLeafColumns;
      } else if (this.fixed === 'right') {
        // 固定列优化后，右侧固定列索引需要计算 add by yangzhini 2020-04-17
        const { columns, rightFixedLeafColumns } = this.store.states;
        const bIndex = columns.length - rightFixedLeafColumns.length;

        return rightFixedLeafColumns.map((col, cellIndex) => ({
          ...col,
          cellIndex: bIndex + cellIndex
        }));
      }
      return this.store.states.columns;
    }
  },

  data() {
    return {
      tooltipContent: ''
    };
  },

  created() {
    this.activateTooltip = debounce(50, tooltip => tooltip.handleShowPopper());
  },

  methods: {
    setScrollViewStyle(style) {
      const scrollView = this.table.$refs.bodyWrapper.querySelector(
        '.el-table-scrollbar__view'
      );
      Object.assign(scrollView.style, style);
    },
    setFixedBodyStyle(style) {
      Object.assign(this.$el.style, style);
    },

    getKeyOfRow(row, index) {
      const rowKey = this.table.rowKey;
      if (rowKey) {
        return getRowIdentity(row, rowKey);
      }
      return index;
    },

    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1;
      let colspan = 1;

      const fn = this.table.spanMethod;
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          rowIndex,
          columnIndex
        });

        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (typeof result === 'object') {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
      }

      return {
        rowspan,
        colspan
      };
    },

    getRowStyle(row, rowIndex) {
      let rowStyle = this.table.rowStyle;
      if (typeof rowStyle === 'function') {
        rowStyle = rowStyle({
          row,
          rowIndex
        });
      }

      if (this.fixed) {
        const rowHeight = this.isVirtualScroll
          ? this.store.states.rowHeight
          : this.store.states.rowsHeight[rowIndex];

        const fixedRowStyle = {
          height: `${rowHeight}px`
        };
        if (!rowStyle) {
          return fixedRowStyle;
        }
        if (typeof rowStyle === 'string') {
          return `height:${rowHeight}px;${rowStyle}`;
        }
        if (typeof rowStyle === 'object') {
          return { ...rowStyle, ...fixedRowStyle };
        }
      }

      return rowStyle || null;
    },

    getRowClass(row, rowIndex) {
      const classes = ['el-table__row'];

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-table__row--striped');
      }
      const rowClassName = this.table.rowClassName;
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName);
      } else if (typeof rowClassName === 'function') {
        classes.push(
          rowClassName({
            row,
            rowIndex
          })
        );
      }

      if (this.store.states.expandRows.indexOf(row) > -1) {
        classes.push('expanded');
      }

      // 如果切换列表数据判断 currentRow 是否是之前的
      if (
        this.store.states.currentRow &&
        this.table.rowKey &&
        this.store.states.currentRow[this.table.rowKey] ===
          row[this.table.rowKey]
      ) {
        classes.push('current-row');
      }

      if (this.isRowUnselectable(row, rowIndex)) {
        classes.push('disabled');
      }

      return classes.join(' ');
    },

    getCellStyle(rowIndex, columnIndex, row, column) {
      const cellStyle = this.table.cellStyle;
      if (typeof cellStyle === 'function') {
        return cellStyle({
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return cellStyle;
    },

    getCellClass(rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.align, column.className];

      const cellClassName = this.table.cellClassName;
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName);
      } else if (typeof cellClassName === 'function') {
        classes.push(
          cellClassName({
            rowIndex,
            columnIndex,
            row,
            column
          })
        );
      }

      return classes.join(' ');
    },
    // 寻找其他相关合并的单元格, 并设置hover状态
    findAndSetRowspanTdHoverState(rowIndex, flag = 'enter') {
      if (flag === 'leave') {
        // 清除之前设置的cell hover状态
        this.$el
          .querySelectorAll('tbody > tr.el-table__row > td.el-table_td-hover')
          .forEach(td => {
            removeClass(td, 'el-table_td-hover');
          });
      }
      // 如果td没有rowspan属性，则不进行处理
      const cellsWithRowspan = document.querySelectorAll('tbody td[rowspan]');
      if (cellsWithRowspan.length === 0) {
        return;
      }

      const allRows = this.$el.querySelectorAll('tbody > tr.el-table__row');
      // 当td的rowspan为0时，表示从当前行一直到末尾都合并，这个就默认要加上hover状态
      const tds = [...this.$el.querySelectorAll('td[rowspan="0"]')];

      for (let i = 0; i < rowIndex; i++) {
        const row = allRows[i];
        for (const td of row.children) {
          const rowspan = td.getAttribute('rowspan');
          if (rowspan && Number(rowspan) + i > rowIndex) {
            tds.push(td);
          }
        }
      }
      tds.forEach(td => {
        addClass(td, 'el-table_td-hover');
      });
    },
    /**
     * add by zhangxiaogang
     * 2018-05-09
     * 如果有合并行的单元格，鼠标处于合并的单元格，则该单元格所跨的行全部要处于hover状态
     * 鼠标离开，则状态对应改变
     * {@param} cell:单元格td的dom
     * {@param} flag:'enter'表示进入，'leave'表示离开
     **/
    setRowspanTrHoverState(cell, flag = 'enter') {
      const allRow = this.$el.querySelectorAll('tbody > tr.el-table__row');
      let rowspan = cell.getAttribute('rowspan');

      // 当前单元格所在行的序号
      let start = [].slice.call(allRow).indexOf(cell.parentNode);

      // 如果鼠标进入，处理其他相关合并的单元格
      this.findAndSetRowspanTdHoverState(start, flag);

      // 如果rowspan为null，则表示鼠标不再合并的单元格上
      if (rowspan === null) {
        return;
      }

      rowspan = +rowspan;
      // rowspan == 0表示从当前行一直都末尾都合并
      // rowspan == 1无意义，等同于未合并
      if (rowspan > 1 || rowspan === 0) {
        const end = rowspan > 0 ? rowspan + start - 1 : allRow.length - start;
        while (start <= end) {
          flag === 'enter'
            ? addClass(allRow[start], 'hover-row')
            : removeClass(allRow[start], 'hover-row');
          start++;
        }
      }
    },
    handleCellMouseEnter(event, row) {
      // const tdValue = event.target.innerText;
      const table = this.table;
      const cell = getCell(event);

      if (cell) {
        const column = getColumnByCell(table, cell);
        const hoverState = (table.hoverState = { cell, column, row });
        table.$emit(
          'cell-mouse-enter',
          hoverState.row,
          hoverState.column,
          hoverState.cell,
          event
        );
        this.$nextTick(() => {
          this.setRowspanTrHoverState(cell);
        });
      }

      const cellChild = event.target.querySelector('.cell');
      const labelChild = event.target.querySelector('.label');
      const labelItem = labelChild || cellChild;

      /**
       * IE 下当 labelItem.getBoundingClientRect().width 为小数时
       * clientWidth 根据实际宽度四舍五入，而 scrollWidth 比 clientWidth 大 1px
       * 故存在内容未溢出而显示 title 的情况
       * 此处暂时不做兼容处理
       * add by yangzhini 2019-05-14
       **/

      if (labelItem.clientWidth <= labelItem.scrollWidth) {
        if (hasClass(cellChild, 'el-tooltip')) {
          const tooltip = this.$refs.tooltip;

          this.tooltipContent = cell.innerText.trim();
          tooltip.referenceElm = cell;
          tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
          tooltip.doDestroy();
          tooltip.setExpectedState(true);
          this.activateTooltip(tooltip);
        } else if (hasClass(cellChild, 'show-overflow-title')) {
          cell.setAttribute('title', cell.innerText.trim());
        }
      } else if (cell.getAttribute('title')) {
        cell.removeAttribute('title');
      }
    },

    handleCellMouseLeave(event) {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.setExpectedState(false);
        tooltip.handleClosePopper();
      }
      const cell = getCell(event);
      if (!cell) return;

      const oldHoverState = this.table.hoverState;
      this.table.$emit(
        'cell-mouse-leave',
        oldHoverState.row,
        oldHoverState.column,
        oldHoverState.cell,
        event
      );

      this.$nextTick(() => {
        this.setRowspanTrHoverState(cell, 'leave');
      });
    },
    /**
     * modified by zhangxiaogang
     * date: 2018-05-09
     * todo: 合并行列的表格hover需要关联变化，故改写此处逻辑
     */
    handleMouseEnter(index) {
      this.store.commit('setHoverRow', index);
    },

    handleMouseLeave() {
      this.store.commit('setHoverRow', null);
    },

    handleContextMenu(event, row) {
      this.handleEvent(event, row, 'contextmenu');
    },

    handleDoubleClick(event, row) {
      this.handleEvent(event, row, 'dblclick');
    },

    handleClick(event, row, $index) {
      if (!this.isRowUnselectable(row, $index)) {
        this.store.commit('setCurrentRow', row);
        this.handleEvent(event, row, 'click');
      }
    },

    isRowUnselectable(row, $index) {
      const radioColumn = this.columns.find(col => col.type === 'radio');
      return (
        radioColumn &&
        radioColumn.selectable &&
        !radioColumn.selectable.call(null, row, $index)
      );
    },

    handleEvent(event, row, name) {
      const table = this.table;
      const cell = getCell(event);
      let column;
      if (cell) {
        column = getColumnByCell(table, cell);
        if (column) {
          table.$emit(`cell-${name}`, row, column, cell, event);
        }
      }
      table.$emit(`row-${name}`, row, event, column);
    },

    handleExpandClick(row) {
      this.store.toggleRowExpanded(row);
    }
  }
};

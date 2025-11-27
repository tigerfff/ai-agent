import { hasClass, addClass, removeClass } from 'hui/src/utils/dom';
import ElCheckbox from 'hui/packages/checkbox';
import ElTag from 'hui/packages/tag';
import Vue from 'vue';
import FilterPanel from './filter-panel.vue';
import SelectionPanel from './selection-panel.vue';
import LayoutObserver from './layout-observer';
import { hasOwn } from 'hui/src/utils/util';

const getAllColumns = columns => {
  const result = [];
  columns.forEach(column => {
    if (column.children) {
      result.push(column);
      result.push.apply(result, getAllColumns(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

const convertToRows = originColumns => {
  let maxLevel = 1;
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }
    if (column.children) {
      let colSpan = 0;
      column.children.forEach(subColumn => {
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach(column => {
    column.level = 1;
    traverse(column);
  });

  const rows = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(originColumns);

  allColumns.forEach(column => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });

  return rows;
};

// function parseToDOM(str) {
//     const div = document.createElement('div');
//     if (typeof str === 'string') {
//         div.innerHTML = str;
//     }
//     return <div />;
// }

export default {
  name: 'ElTableHeader',

  mixins: [LayoutObserver],

  render(h) {
    const originColumns = this.store.states.originColumns;
    const columnRows = convertToRows(originColumns, this.columns);

    // 是否拥有多级表头
    const isGroup = columnRows.length > 1;
    if (isGroup) this.$parent.isGroup = true;

    return (
      <table
        class='el-table__header'
        cellspacing='0'
        cellpadding='0'
        border='0'
      >
        <colgroup>
          {this._l(this.columns, column => (
            <col name={column.id} />
          ))}
        </colgroup>
        <thead>
          {this._l(columnRows, (columns, rowIndex) => (
            <tr
              style={this.getHeaderRowStyle(rowIndex)}
              class={this.getHeaderRowClass(rowIndex)}
            >
              {this._l(columns, (column, cellIndex) => (
                <th
                  colspan={column.colSpan}
                  rowspan={column.rowSpan}
                  on-mousemove={$event =>
                    this.handleMouseMove($event, column, cellIndex)
                  }
                  on-mouseout={this.handleMouseOut}
                  on-mousedown={$event => this.handleMouseDown($event, column)}
                  on-mouseenter={$event =>
                    this.handleCellMouseEnter($event, column)
                  }
                  on-click={$event => this.handleHeaderClick($event, column)}
                  style={this.getHeaderCellStyle(
                    rowIndex,
                    cellIndex,
                    columns,
                    column
                  )}
                  class={this.getHeaderCellClass(
                    rowIndex,
                    cellIndex,
                    columns,
                    column
                  )}
                >
                  <div
                    class={[
                      'cell',
                      column.filteredValue && column.filteredValue.length > 0
                        ? 'highlight'
                        : '',
                      column.labelClassName,
                      {
                        'show-header-overflow': this.store.table
                          .showHeaderOverflow
                      }
                    ]}
                  >
                    {column.renderHeader ? (
                      column.renderHeader.call(this._renderProxy, h, {
                        column,
                        $index: cellIndex,
                        store: this.store,
                        _self: this.$parent.$vnode.context
                      })
                    ) : column.hasSlotHeader() ? (
                      column.slotHeader.call(this._renderProxy, h, {
                        column,
                        $index: cellIndex,
                        store: this.store,
                        _self: this.$parent.$vnode.context
                      })
                    ) : column.ishtml ? (
                      h('span', {
                        domProps: {
                          innerHTML: column.label
                        }
                      })
                    ) : (column.sortable || column.filterable) &&
                      this.store.table.showHeaderOverflow ? (
                      <span
                        class={[
                          'has-icon-right',
                          {
                            'double-icon': column.sortable && column.filterable
                          }
                        ]}
                      >
                        {column.label}
                      </span>
                    ) : (
                      <div class='label'>{column.label}</div>
                    )}
                    {column.sortable ? (
                      <span
                        class='caret-wrapper'
                        on-click={$event =>
                          this.handleSortClick($event, column)
                        }
                      >
                        <i
                          class='sort-caret ascending'
                          on-click={$event =>
                            this.handleSortClick($event, column, 'ascending')
                          }
                        />
                        <i
                          class='sort-caret descending'
                          on-click={$event =>
                            this.handleSortClick($event, column, 'descending')
                          }
                        />
                      </span>
                    ) : (
                      ''
                    )}
                    {column.filterable ? (
                      <span
                        class='el-table__column-filter-trigger'
                        on-click={$event =>
                          this.handleFilterClick($event, column)
                        }
                      >
                        <i
                          class={[
                            'h-icon-filter',
                            column.filteredValue &&
                            column.filteredValue.length > 0
                              ? 'h-icon-filter_f'
                              : '',
                            column.filterOpened ? 'filter-opened' : ''
                          ]}
                        />
                      </span>
                    ) : (
                      ''
                    )}
                    {column.selections ? (
                      <span
                        class='el-table__column-selection-icon'
                        on-mouseenter={$event =>
                          this.handleSelectionMouseEnter($event, column)
                        }
                      >
                        <i class='h-icon-angle_down_sm' />
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
      </table>
    );
  },

  props: {
    fixed: String,
    store: {
      required: true
    },
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

  components: {
    ElCheckbox,
    ElTag
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

    leftFixedLeafCount() {
      return this.store.states.fixedLeafColumns.length;
    },

    rightFixedLeafCount() {
      return this.store.states.rightFixedLeafColumns.length;
    },

    columns() {
      return this.store.states.columns;
    }
  },

  created() {
    this.filterPanels = {};
  },

  mounted() {
    if (this.defaultSort.prop) {
      const states = this.store.states;
      states.sortProp = this.defaultSort.prop;
      states.sortOrder = this.defaultSort.order || 'ascending';
      this.$nextTick(() => {
        for (let i = 0, length = this.columns.length; i < length; i++) {
          const column = this.columns[i];
          if (column.property === states.sortProp) {
            column.order = states.sortOrder;
            states.sortingColumn = column;
            break;
          }
        }

        if (states.sortingColumn) {
          this.store.commit('changeSortCondition');
        }
      });
    }
  },

  beforeDestroy() {
    const panels = this.filterPanels;
    for (const prop in panels) {
      if (hasOwn(panels, prop) && panels[prop]) {
        panels[prop].$destroy(true);
      }
    }
    if (this.selectionPanel) {
      this.selectionPanel.$destroy(true);
    }
  },

  methods: {
    isCellHidden(index, columns) {
      if (this.fixed === true || this.fixed === 'left') {
        return index >= this.leftFixedLeafCount;
      } else if (this.fixed === 'right') {
        let before = 0;
        for (let i = 0; i < index; i++) {
          before += columns[i].colSpan;
        }
        return before < this.columnsCount - this.rightFixedLeafCount;
      } else {
        return (
          index < this.leftFixedLeafCount ||
          index >= this.columnsCount - this.rightFixedLeafCount
        );
      }
    },

    getHeaderRowStyle(rowIndex) {
      const headerRowStyle = this.table.headerRowStyle;
      if (typeof headerRowStyle === 'function') {
        return headerRowStyle({ rowIndex });
      }
      return headerRowStyle;
    },

    getHeaderRowClass(rowIndex) {
      const classes = [];

      const headerRowClassName = this.table.headerRowClassName;
      if (typeof headerRowClassName === 'string') {
        classes.push(headerRowClassName);
      } else if (typeof headerRowClassName === 'function') {
        classes.push(headerRowClassName({ rowIndex }));
      }

      return classes.join(' ');
    },

    getHeaderCellStyle(rowIndex, columnIndex, row, column) {
      const headerCellStyle = this.table.headerCellStyle;
      if (typeof headerCellStyle === 'function') {
        return headerCellStyle({
          rowIndex,
          columnIndex,
          row,
          column
        });
      }
      return headerCellStyle;
    },

    getHeaderCellClass(rowIndex, columnIndex, row, column) {
      const classes = [
        column.id,
        column.order,
        column.headerAlign,
        column.className,
        column.labelClassName
      ];

      // if (rowIndex === 0 && this.isCellHidden(columnIndex, row)) {
      //   classes.push('is-hidden');
      // }

      if (!column.children) {
        classes.push('is-leaf');
      }

      if (column.sortable) {
        classes.push('is-sortable');
      }

      if (column.filterable) {
        classes.push('is-filterable');
      }

      const headerCellClassName = this.table.headerCellClassName;
      if (typeof headerCellClassName === 'string') {
        classes.push(headerCellClassName);
      } else if (typeof headerCellClassName === 'function') {
        classes.push(
          headerCellClassName({
            rowIndex,
            columnIndex,
            row,
            column
          })
        );
      }

      return classes.join(' ');
    },

    toggleAllSelection() {
      this.store.commit('toggleAllSelection');
    },

    handleFilterClick(event, column) {
      event.stopPropagation();
      const target = event.target;
      let cell = target;
      while (cell.tagName !== 'TH') {
        cell = cell.parentNode;
      }
      const table = this.$parent;

      let filterPanel = this.filterPanels[column.id];

      if (filterPanel && column.filterOpened) {
        filterPanel.showPopper = false;
        return;
      }

      if (!filterPanel) {
        filterPanel = new Vue(FilterPanel);
        this.filterPanels[column.id] = filterPanel;
        if (column.filterPlacement) {
          filterPanel.placement = column.filterPlacement;
        }
        filterPanel.table = table;
        filterPanel.cell = cell;
        filterPanel.column = column;
        !this.$isServer && filterPanel.$mount(document.createElement('div'));
      }

      this.closeAllFilterPanel();
      setTimeout(() => {
        filterPanel.showPopper = true;
      }, 16);
    },

    closeAllFilterPanel() {
      Object.values(this.filterPanels).forEach(panel => {
        panel.showPopper = false;
      });
    },

    handleSelectionMouseEnter(event, column) {
      event.stopPropagation();
      const target = event.target;
      const table = this.$parent;

      let selectionPanel = this.selectionPanel;

      if (!selectionPanel) {
        selectionPanel = new Vue(SelectionPanel);
        this.selectionPanel = selectionPanel;
        selectionPanel.table = table;
        selectionPanel.target = target;
        selectionPanel.column = column;
        !this.$isServer && selectionPanel.$mount(document.createElement('div'));
      }

      setTimeout(() => {
        selectionPanel.showPopper = true;
      }, 16);
    },

    handleHeaderClick(event, column) {
      if (column.sortable) {
        this.handleSortClick(event, column);
      } else if (column.filters) {
        this.handleFilterClick(event, column);
      }

      this.$parent.$emit('header-click', column, event);
    },

    handleMouseDown(event, column) {
      if (this.$isServer) return;
      if (column.children && column.children.length > 0) return;
      /* istanbul ignore if */
      if (this.draggingColumn) {
        this.dragging = true;

        this.$parent.resizeProxyVisible = true;

        const table = this.$parent;
        const tableEl = table.$el;
        const tableLeft = tableEl.getBoundingClientRect().left;
        const columnEl = this.$el.querySelector(`th.${column.id}`);
        const columnRect = columnEl.getBoundingClientRect();
        const minLeft = columnRect.left - tableLeft + 30;

        addClass(columnEl, 'noclick');

        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        };

        const resizeProxy = table.$refs.resizeProxy;
        resizeProxy.style.left = this.dragState.startLeft + 'px';

        document.onselectstart = function() {
          return false;
        };
        document.ondragstart = function() {
          return false;
        };

        const handleMouseMove = event => {
          // 直接使用tableEl.getBoundingClientRect().right，会导致边框线会被看不见。表格左右有1px边框，线本身有1px,为了明显一点，右侧留了1px。总共4px
          const maxTableRight = tableEl.getBoundingClientRect().right - 4;
          const deltaLeft =
            Math.min(event.clientX, maxTableRight) -
            this.dragState.startMouseLeft;

          const proxyLeft = this.dragState.startLeft + deltaLeft;

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px';
        };

        const handleMouseUp = () => {
          if (this.dragging) {
            const { startColumnLeft, startLeft } = this.dragState;
            const finalLeft = parseInt(resizeProxy.style.left, 10);
            let columnWidth = finalLeft - startColumnLeft;
            if (column.minWidth && columnWidth < column.minWidth) {
              columnWidth = column.minWidth;
            }
            column.width = column.realWidth = columnWidth;
            table.$emit(
              'header-dragend',
              column.width,
              startLeft - startColumnLeft,
              column,
              event
            );

            this.store.scheduleLayout(true);

            document.body.style.cursor = '';
            this.dragging = false;
            this.draggingColumn = null;
            this.dragState = {};

            table.resizeProxyVisible = false;
          }

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.onselectstart = null;
          document.ondragstart = null;

          setTimeout(function() {
            removeClass(columnEl, 'noclick');
          }, 0);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    },

    handleMouseMove(event, column, cellIndex) {
      if (column.children && column.children.length > 0) return;
      let target = event.target;
      while (target && target.tagName !== 'TH') {
        target = target.parentNode;
      }
      // 最后一列不可拖拽
      if (cellIndex === this.columns.length - 1) return;

      if (!column || !column.resizable) return;

      if (!this.dragging) {
        const rect = target.getBoundingClientRect();

        if (rect.width > 12 && rect.right - event.pageX < 8) {
          target.style.cursor = 'col-resize';
          this.draggingColumn = column;
        } else if (!this.dragging) {
          target.style.cursor = '';
          this.draggingColumn = null;
        }
      }
    },

    handleMouseOut() {
      if (this.$isServer) return;
      document.body.style.cursor = '';
    },

    /**
     * 当showHeaderOverflow为true时，为header设置title
     *  add by yangzhini 2018-08-03
     **/
    handleCellMouseEnter(event, column) {
      // const tdValue = event.target.innerText;

      let cell = event.target;

      while (cell && cell.tagName.toUpperCase() !== 'HTML') {
        if (cell.tagName.toUpperCase() === 'TH') {
          break;
        }
        cell = cell.parentNode;
      }

      const cellChild = event.target.querySelector('.cell');
      const labelChild = event.target.querySelector('.label');
      let labelItem = labelChild || cellChild;
      if (column.sortable || column.filterable) {
        labelItem = cellChild.querySelector('.has-icon-right');
      }

      /**
       * IE 下当 labelItem.getBoundingClientRect().width 为小数时
       * clientWidth 根据实际宽度四舍五入，而 scrollWidth 比 clientWidth 大 1px
       * 故存在内容未溢出而显示 title 的情况
       * 此处暂时不做兼容处理
       * add by yangzhini 2019-05-14
       **/

      if (labelItem.clientWidth <= labelItem.scrollWidth) {
        if (hasClass(cellChild, 'show-header-overflow')) {
          cell.setAttribute('title', cell.innerText.trim());
        }
      } else if (cell.getAttribute('title')) {
        cell.removeAttribute('title');
      }
    },

    toggleOrder(order) {
      return !order ? 'ascending' : order === 'ascending' ? 'descending' : null;
    },

    handleSortClick(event, column, givenOrder) {
      event.stopPropagation();
      const order = givenOrder || this.toggleOrder(column.order);

      let target = event.target;
      while (target && target.tagName !== 'TH') {
        target = target.parentNode;
      }

      if (target && target.tagName === 'TH') {
        if (hasClass(target, 'noclick')) {
          removeClass(target, 'noclick');
          return;
        }
      }

      if (!column.sortable) return;

      const states = this.store.states;
      let sortProp = states.sortProp;
      let sortOrder;
      const sortingColumn = states.sortingColumn;

      if (sortingColumn !== column) {
        if (sortingColumn) {
          sortingColumn.order = null;
        }
        states.sortingColumn = column;
        sortProp = column.property;
      }

      if (!order) {
        sortOrder = column.order = null;
      } else {
        sortOrder = column.order = order;
      }

      states.sortProp = sortProp;
      states.sortOrder = sortOrder;

      this.store.commit('changeSortCondition');
    }
  },

  data() {
    return {
      draggingColumn: null,
      dragging: false,
      dragState: {}
    };
  }
};

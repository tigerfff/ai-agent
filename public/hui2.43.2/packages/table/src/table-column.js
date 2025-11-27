import ElCheckbox from 'hui/packages/checkbox';
import ElRadio from 'hui/packages/radio';
import ElTag from 'hui/packages/tag';
import objectAssign from 'hui/src/utils/merge';
import { getPropByPath, hasOwn } from 'hui/src/utils/util';

let columnIdSeed = 1;

const defaults = {
  default: {
    order: ''
  },
  selection: {
    width: 40,
    minWidth: 40,
    realWidth: 40,
    order: '',
    className: 'el-table-column--selection'
  },
  radio: {
    width: 40,
    minWidth: 40,
    realWidth: 40,
    order: '',
    className: 'el-table-column--radio'
  },
  expand: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: ''
  },
  index: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: ''
  }
};

const forced = {
  selection: {
    renderHeader: function(h, { store }) {
      return store.table.showHeaderSelection ? (
        <el-checkbox
          nativeOn-click={
            (store.states.data && store.states.data.length === 0) ||
            store.states.isAllDisabled
              ? () => {}
              : this.toggleAllSelection
          }
          value={store.states.isAllSelected}
          indeterminate={
            !store.states.isAllSelected && store.states.selection.length > 0
          }
          disabled={
            (store.states.data && store.states.data.length === 0) ||
            store.states.isAllDisabled
          }
        />
      ) : null;
    },
    renderCell: function(h, { row, column, store, $index }) {
      return (
        <el-checkbox
          nativeOn-click={event => event.stopPropagation()}
          value={store.isSelected(row)}
          disabled={
            column.selectable
              ? !column.selectable.call(null, row, $index)
              : false
          }
          on-input={() => {
            store.commit('rowSelectedChanged', row);
          }}
        />
      );
    },
    sortable: false,
    resizable: false
  },
  radio: {
    renderHeader: function() {
      return '';
    },
    renderCell: function(h, { row, column, store, $index }) {
      return (
        <el-radio
          nativeOn-click={event => event.stopPropagation()}
          value={store.states.currentRow}
          disabled={
            column.selectable
              ? !column.selectable.call(null, row, $index)
              : false
          }
          label={row}
          on-input={() => {
            store.commit('setCurrentRow', row);
          }}
        >
          <span />
        </el-radio>
      );
    },
    sortable: false,
    resizable: false
  },
  index: {
    renderHeader: function(h, { column }) {
      return column.label || '#';
    },
    renderCell: function(h, { $index }) {
      return <span>{$index + 1}</span>;
    },
    sortable: false
  },
  expand: {
    renderHeader: function() {
      return '';
    },
    renderCell: function(h, { row, store }, proxy, allowExpand) {
      if (!allowExpand) return;
      const expanded = store.states.expandRows.indexOf(row) > -1;
      return (
        <div
          class={
            'el-table__expand-icon ' +
            (expanded ? 'el-table__expand-icon--expanded' : '')
          }
          on-click={() => proxy.handleExpandClick(row)}
        >
          <i class='el-icon h-icon-angle_right_sm' />
        </div>
      );
    },
    sortable: false,
    resizable: false,
    className: 'el-table__expand-column'
  }
};

const getDefaultColumn = function(type, options) {
  const column = {};

  objectAssign(column, defaults[type || 'default']);

  for (const name in options) {
    if (hasOwn(options, name)) {
      const value = options[name];
      if (typeof value !== 'undefined') {
        column[name] = value;
      }
    }
  }

  if (type === 'selection' && options.selections) {
    column.width = 64;
    column.minWidth = 64;
    column.realWidth = 64;
  }

  if (!column.minWidth) {
    column.minWidth = 80;
  }

  column.realWidth = column.width || column.minWidth;

  return column;
};

const DEFAULT_RENDER_CELL = function(h, { row, column }) {
  const property = column.property;
  const value = property && getPropByPath(row, property).v;
  if (column && column.formatter) {
    return column.formatter(row, column, value);
  }
  return !value && value !== 0 ? '--' : value;
};

export default {
  name: 'ElTableColumn',

  props: {
    type: {
      type: String,
      default: 'default'
    },
    label: String,
    className: String,
    labelClassName: String,
    property: String,
    prop: String,
    width: {},
    minWidth: {},
    renderHeader: Function,
    sortable: {
      type: [String, Boolean],
      default: false
    },
    sortMethod: Function,
    resizable: {
      type: Boolean,
      default: true
    },
    context: {},
    columnKey: String,
    align: String,
    headerAlign: String,
    showOverflowTooltip: Boolean,
    showOverflowTitle: Boolean,
    fixed: [Boolean, String],
    formatter: Function,
    selectable: Function,
    reserveSelection: Boolean,
    selections: Array,
    filterMethod: Function,
    filteredValue: Array,
    filters: Array,
    filterPlacement: String,
    filterMultiple: {
      type: Boolean,
      default: true
    },
    ishtml: Boolean,
    allowExpand: {
      type: Function,
      default: () => true
    }
  },

  data() {
    return {
      isSubColumn: false,
      columns: []
    };
  },

  beforeCreate() {
    this.row = {};
    this.column = {};
    this.$index = 0;
  },

  components: {
    ElCheckbox,
    ElRadio,
    ElTag
  },

  computed: {
    owner() {
      let parent = this.$parent;
      while (parent && !parent.tableId) {
        parent = parent.$parent;
      }
      return parent;
    },
    columnOrTableParent() {
      let parent = this.$parent;
      while (parent && !parent.tableId && !parent.columnId)
        parent = parent.$parent;

      return parent;
    }
  },

  created() {
    const parent = this.columnOrTableParent;
    this.customRender = this.$options.render;
    this.$options.render = h => h('div', this.$slots.default);
    this.columnId = `${parent.tableId ||
      `${parent.columnId}_`}column_${columnIdSeed++}`;

    const owner = this.owner;
    this.isSubColumn = owner !== parent;

    const type = this.type;

    let width = this.width;
    if (width !== undefined) {
      // width = parseInt(width, 10);
      // if (isNaN(width)) {
      //   width = null;
      // }
      if (!/%$/.test(width)) {
        width = parseInt(width, 10);
        if (isNaN(width)) {
          width = null;
        }
      }
    }

    let minWidth = this.minWidth;
    if (minWidth !== undefined) {
      minWidth = parseInt(minWidth, 10);
      if (isNaN(minWidth)) {
        minWidth = 51;
        if (this.sortable === '' || this.sortable) minWidth += 24;
        if (this.filters || this.filterMethod) minWidth += 32;
      }
    } else {
      minWidth = 51;
      if (this.sortable === '' || this.sortable) minWidth += 24;
      if (this.filters || this.filterMethod) minWidth += 32;
    }

    const isColumnGroup = false;
    const _self = this;

    const column = getDefaultColumn(type, {
      id: this.columnId,
      columnKey: this.columnKey,
      label: this.label,
      className: this.className,
      labelClassName: this.labelClassName,
      property: this.prop || this.property,
      type,
      renderCell: null,
      renderHeader: this.renderHeader,
      minWidth,
      width,
      isColumnGroup,
      context: this.context,
      align: this.align ? 'is-' + this.align : null,
      headerAlign: this.headerAlign
        ? 'is-' + this.headerAlign
        : this.align
        ? 'is-' + this.align
        : null,
      sortable: this.sortable === '' ? true : this.sortable,
      sortMethod: this.sortMethod,
      resizable: this.resizable,
      showOverflowTooltip:
        this.owner.store.table.showOverflowTooltip || this.showOverflowTooltip,
      showOverflowTitle:
        this.owner.store.table.showOverflowTitle || this.showOverflowTitle,
      formatter: this.formatter,
      selectable: this.selectable,
      reserveSelection: this.reserveSelection,
      selections: this.selections,
      fixed: this.fixed === '' ? true : this.fixed,
      filterMethod: this.filterMethod,
      filters: this.filters,
      filterable: this.filters || this.filterMethod,
      filterMultiple: this.filterMultiple,
      filterOpened: false,
      filteredValue: this.filteredValue || [],
      filterPlacement: this.filterPlacement || '',
      ishtml: this.ishtml,
      allowExpand: this.allowExpand,
      slotHeader: function(h, data) {
        if (!_self.$scopedSlots.header) return;
        return _self.$scopedSlots.header(data);
      },
      hasSlotHeader: function() {
        if (!_self.$scopedSlots.header) return false;
        return true;
      }
    });

    objectAssign(column, forced[type] || {});

    this.columnConfig = column;

    let renderCell = column.renderCell;

    if (type === 'expand') {
      owner.renderExpanded = function(h, data) {
        return _self.$scopedSlots.default
          ? _self.$scopedSlots.default(data)
          : _self.$slots.default;
      };

      column.renderCell = function(h, data) {
        const allowExpand =
          column.allowExpand && column.allowExpand(data.row, data.$index);
        return (
          <div class='cell'>
            {renderCell(h, data, this._renderProxy, allowExpand)}
          </div>
        );
      };

      return;
    }

    column.renderCell = function(h, data) {
      let tooltipWidth = data.column.realWidth;
      if (!tooltipWidth) {
        if (/%$/.test(data.column.width)) {
          tooltipWidth = data.column.width;
        } else {
          tooltipWidth = data.column.width + 'px';
        }
      } else {
        tooltipWidth += 'px';
      }
      // 未来版本移除
      if (_self.$vnode.data.inlineTemplate) {
        renderCell = function() {
          data._self = _self.context || data._self;
          if (
            Object.prototype.toString.call(data._self) === '[object Object]'
          ) {
            for (const prop in data._self) {
              if (!hasOwn(data, prop)) {
                data[prop] = data._self[prop];
              }
            }
          }
          // 静态内容会缓存到 _staticTrees 内，不改的话获取的静态数据就不是内部 context
          data._staticTrees = _self._staticTrees;
          data.$options.staticRenderFns = _self.$options.staticRenderFns;
          return _self.customRender.call(data);
        };
      } else if (_self.$scopedSlots.default) {
        renderCell = () => _self.$scopedSlots.default(data);
        if (!_self.showOverflowTooltip && !_self.showOverflowTitle) {
          return <div class='cell'>{renderCell(h, data)}</div>;
        }
      }

      if (!renderCell) {
        renderCell = DEFAULT_RENDER_CELL;
      }

      return column.showOverflowTooltip ? (
        <div class='cell el-tooltip'>
          <div class='label'>{renderCell(h, data)}</div>
        </div>
      ) : column.showOverflowTitle ? (
        <div class='cell show-overflow-title'>
          <div class='label'>{renderCell(h, data)}</div>
        </div>
      ) : (
        <div class='cell'>{renderCell(h, data)}</div>
      );
    };
  },

  destroyed() {
    if (!this.$parent) return;
    const parent = this.$parent;
    this.owner.store.commit(
      'removeColumn',
      this.columnConfig,
      this.isSubColumn ? parent.columnConfig : null
    );
  },

  watch: {
    label(newVal) {
      if (this.columnConfig) {
        this.columnConfig.label = newVal;
      }
    },

    prop(newVal) {
      if (this.columnConfig) {
        this.columnConfig.property = newVal;
      }
    },

    property(newVal) {
      if (this.columnConfig) {
        this.columnConfig.property = newVal;
      }
    },

    filters(newVal) {
      if (this.columnConfig) {
        this.columnConfig.filters = newVal;
      }
    },

    filteredValue(newVal) {
      if (this.columnConfig) {
        this.columnConfig.filteredValue = newVal;
        this.owner.store.commit('filterChange', {
          column: this.columnConfig,
          values: newVal,
          silent: true
        });
      }
    },

    filterMultiple(newVal) {
      if (this.columnConfig) {
        this.columnConfig.filterMultiple = newVal;
      }
    },

    align(newVal) {
      if (this.columnConfig) {
        this.columnConfig.align = newVal ? 'is-' + newVal : null;

        if (!this.headerAlign) {
          this.columnConfig.headerAlign = newVal ? 'is-' + newVal : null;
        }
      }
    },

    headerAlign(newVal) {
      if (this.columnConfig) {
        this.columnConfig.headerAlign = 'is-' + (newVal || this.align);
      }
    },

    width(newVal) {
      if (this.columnConfig) {
        this.columnConfig.width = newVal;
        this.owner.store.scheduleLayout();
      }
    },

    minWidth(newVal) {
      if (this.columnConfig) {
        this.columnConfig.minWidth = newVal;
        this.owner.store.scheduleLayout();
      }
    },

    fixed(newVal) {
      if (this.columnConfig) {
        this.columnConfig.fixed = newVal;
        this.owner.store.scheduleLayout();
      }
    },

    sortable(newVal) {
      if (this.columnConfig) {
        this.columnConfig.sortable = newVal;
      }
    }
  },

  mounted() {
    const owner = this.owner;
    const parent = this.columnOrTableParent;
    let columnIndex;

    if (!this.isSubColumn) {
      columnIndex = [].indexOf.call(
        parent.$refs.hiddenColumns.children,
        this.$el
      );
    } else {
      columnIndex = [].indexOf.call(parent.$el.children, this.$el);
    }

    owner.store.commit(
      'insertColumn',
      this.columnConfig,
      columnIndex,
      this.isSubColumn ? parent.columnConfig : null
    );
  }
};

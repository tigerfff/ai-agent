import Vue from 'vue';
// import scrollbarWidth from 'hui/src/utils/scrollbar-width';
import { hasOwn } from 'hui/src/utils/util';

class TableLayout {
  constructor(options) {
    this.observers = [];
    this.table = null;
    this.store = null;
    this.columns = null;
    this.fit = true;
    this.showHeader = true;

    this.height = null;
    // this.scrollX = false;
    // this.scrollY = false;
    this.bodyWidth = null;
    this.fixedWidth = null;
    this.fixedBodyTop = null; // 固定列时计算header高度
    this.rightFixedWidth = null;
    this.tableHeight = null;
    this.headerHeight = 36; // Table Header Height
    this.footerHeight = 0; // Table Footer Height
    // this.viewportHeight = null; // Table Height - Scroll Bar Height （same with tableHeight）
    this.bodyHeight = null; // Table Height - Table Header Height
    this.fixedBodyHeight = null; // Table Height - Table Header Height - Scroll Bar Height
    this.dragFlexWidth = 0; // 记录拖拽可调节宽度
    this.hasDragged = false; // 记录是否拖拽过
    for (const name in options) {
      if (hasOwn(options, name)) {
        this[name] = options[name];
      }
    }

    if (!this.table) {
      throw new Error('table is required for Table Layout');
    }
    if (!this.store) {
      throw new Error('store is required for Table Layout');
    }
  }

  setHeight(value, prop = 'height') {
    const el = this.table.$el;
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      value = Number(value);
    }

    this.height = value;

    if (!el && (value || value === 0)) {
      return Vue.nextTick(() => this.setHeight(value, prop));
    }

    if (typeof value === 'number') {
      el.style[prop] = value + 'px';

      this.updateHeight();
    } else if (typeof value === 'string') {
      el.style[prop] = value;
      this.updateHeight();
    }
  }

  setMaxHeight(value) {
    return this.setHeight(value, 'max-height');
  }

  updateHeight() {
    if (!this.table.$ready) return Vue.nextTick(() => this.updateHeight());
    const { headerWrapper, appendWrapper, footerWrapper } = this.table.$refs;
    this.appendHeight = appendWrapper ? appendWrapper.offsetHeight : 0;

    if (this.showHeader && !headerWrapper) return;

    // fix issue (https://github.com/ElemeFE/element/pull/16956)
    const headerTrElm = headerWrapper
      ? headerWrapper.querySelector('.el-table__header tr')
      : null;
    const noneHeader = this.headerDisplayNone(headerTrElm);

    const headerHeight = (this.headerHeight = !this.showHeader
      ? 0
      : headerWrapper.offsetHeight);
    if (
      this.showHeader &&
      !noneHeader &&
      headerWrapper.offsetWidth > 0 &&
      (this.table.columns || []).length > 0 &&
      headerHeight < 2
    ) {
      return Vue.nextTick(() => this.updateHeight());
    }
    const tableHeight = (this.tableHeight = this.table.$el.clientHeight);
    const footerHeight = (this.footerHeight = footerWrapper
      ? footerWrapper.offsetHeight
      : 0);
    if (this.height !== null) {
      this.bodyHeight =
        tableHeight - headerHeight - footerHeight + (footerWrapper ? 1 : 0);
    }
    this.fixedBodyHeight =
      tableHeight - headerHeight - footerHeight + (footerWrapper ? 1 : 0);
  }

  headerDisplayNone(elm) {
    if (!elm) return true;
    let headerChild = elm;
    while (headerChild.tagName !== 'DIV') {
      if (getComputedStyle(headerChild).display === 'none') {
        return true;
      }
      headerChild = headerChild.parentElement;
    }
    return false;
  }

  getFlattenColumns() {
    const flattenColumns = [];
    const columns = this.table.columns;
    columns.forEach(column => {
      if (column.isColumnGroup) {
        flattenColumns.push.apply(flattenColumns, column.columns);
      } else {
        flattenColumns.push(column);
      }
    });

    return flattenColumns;
  }

  update(dragResize) {
    const fit = this.fit;
    const hasDragged = (this.hasDragged = this.hasDragged || dragResize);
    // const columns = this.table.columns;
    const bodyWidth = this.table.$el.clientWidth || this.bodyWidth;
    let bodyMinWidth = 0;

    const flattenColumns = this.getFlattenColumns();
    // 兼容没有设置 column 的场景
    if (!flattenColumns.length) return;

    let flexColumns = flattenColumns.filter(
      column => typeof column.width !== 'number'
    );

    if (fit) {
      // 存在列没有设置 width 为 number 的场景（width为百分比或者没有设置）
      if (flexColumns.length > 0 && !hasDragged) {
        flattenColumns.forEach(column => {
          if (typeof column.width === 'number') {
            bodyMinWidth += column.width;
          }
        });
        const remainWidth = bodyWidth - bodyMinWidth;
        let percent = 0;
        flexColumns.forEach(column => {
          if (/%$/.test(column.width)) {
            percent = Number(column.width.replace(/%$/, '')) / 100;
            const realWidth =
              remainWidth * percent >= column.minWidth
                ? remainWidth * percent
                : column.minWidth;
            column.realWidth = realWidth;
            bodyMinWidth += realWidth;
          } else {
            bodyMinWidth += column.minWidth || 80;
          }
        });

        flexColumns = flexColumns.filter(column => !/%$/.test(column.width));
        // DON'T HAVE SCROLL BAR
        if (bodyMinWidth < bodyWidth && flexColumns.length) {
          const totalFlexWidth = bodyWidth - bodyMinWidth;
          if (flexColumns.length === 1) {
            flexColumns[0].realWidth =
              (flexColumns[0].minWidth || 80) + totalFlexWidth;
          } else {
            const allColumnsWidth = flexColumns.reduce(
              (prev, column) => prev + (column.minWidth || 80),
              0
            );
            const flexWidthPerPixel = totalFlexWidth / allColumnsWidth;
            let noneFirstWidth = 0;

            flexColumns.forEach((column, index) => {
              if (index === 0) return;
              const flexWidth = Math.floor(
                (column.minWidth || 80) * flexWidthPerPixel
              );
              noneFirstWidth += flexWidth;
              column.realWidth = (column.minWidth || 80) + flexWidth;
            });

            flexColumns[0].realWidth =
              (flexColumns[0].minWidth || 80) + totalFlexWidth - noneFirstWidth;
          }
        } else {
          // HAVE HORIZONTAL SCROLL BAR
          flexColumns.forEach(function(column) {
            column.realWidth = column.minWidth;
          });
        }

        this.bodyWidth = Math.max(bodyMinWidth, bodyWidth);
      } else {
        // 1.flexColumns.length === 0 即各列宽度均被设置为 number 时
        // 2.hasDragged = true 用户对列宽进行了拖拽操作
        // 拖动
        flattenColumns.forEach(column => {
          bodyMinWidth += column.realWidth;
        });
        if (bodyMinWidth - bodyWidth >= this.dragFlexWidth) {
          flattenColumns[flattenColumns.length - 1].realWidth =
            flattenColumns[flattenColumns.length - 1].realWidth -
            this.dragFlexWidth;
          this.bodyWidth = bodyMinWidth - this.dragFlexWidth;
          this.dragFlexWidth = 0;
        } else if (
          bodyMinWidth - bodyWidth < this.dragFlexWidth &&
          bodyMinWidth > bodyWidth
        ) {
          const flexWidth = bodyMinWidth - bodyWidth;
          flattenColumns[flattenColumns.length - 1].realWidth =
            flattenColumns[flattenColumns.length - 1].realWidth - flexWidth;
          this.bodyWidth = bodyWidth;
          this.dragFlexWidth -= flexWidth;
        } else {
          flattenColumns[flattenColumns.length - 1].realWidth =
            flattenColumns[flattenColumns.length - 1].realWidth +
            bodyWidth -
            bodyMinWidth;
          this.dragFlexWidth += bodyWidth - bodyMinWidth;
          this.bodyWidth = bodyWidth;
        }
      }

      // if (this.table.$refs.tableScrollbar) {
      //   this.table.$refs.tableScrollbar.$refs.resize.style.width =
      //     this.bodyWidth + 'px';
      // }
      this.table.resizeState.width = this.bodyWidth;
    } else {
      flattenColumns.forEach(column => {
        if (!column.width && !column.minWidth) {
          column.realWidth = 80;
        } else {
          column.realWidth = column.width || column.minWidth;
        }

        bodyMinWidth += column.realWidth;
      });

      this.bodyWidth = bodyMinWidth;
    }

    const fixedColumns = this.store.states.fixedColumns;

    if (fixedColumns.length > 0) {
      let fixedWidth = 0;
      fixedColumns.forEach(function(column) {
        fixedWidth += column.realWidth;
      });

      this.fixedWidth = fixedWidth;
    }

    const rightFixedColumns = this.store.states.rightFixedColumns;
    if (rightFixedColumns.length > 0) {
      let rightFixedWidth = 0;
      rightFixedColumns.forEach(function(column) {
        rightFixedWidth += column.realWidth;
      });

      this.rightFixedWidth = rightFixedWidth;
    }

    const $header = this.table.$el.querySelector('.el-table__header-wrapper');
    this.fixedBodyTop = $header
      ? window.getComputedStyle($header).getPropertyValue('height')
      : 0;

    this.notifyObservers();
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers() {
    const observers = this.observers;
    observers.forEach(observer => {
      observer.onColumnsChange(this);
    });
  }
}

export default TableLayout;

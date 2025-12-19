import { getValueByPath } from 'hui/src/utils/util';

export const getCell = function(event) {
  let cell = event.target;

  while (cell && cell.tagName.toUpperCase() !== 'HTML') {
    if (cell.tagName.toUpperCase() === 'TD') {
      return cell;
    }
    cell = cell.parentNode;
  }

  return null;
};

const isObject = function(obj) {
  return obj !== null && typeof obj === 'object';
};

export const orderBy = function(
  array,
  sortKey,
  reverse,
  sortMethod,
  defaultSortMethod
) {
  if (typeof reverse === 'string') {
    reverse = reverse === 'descending' ? -1 : 1;
  } else {
    return array;
  }
  if (!sortKey && !sortMethod) {
    return array;
  }
  const order = reverse && reverse < 0 ? -1 : 1;

  // sort on a copy to avoid mutating original array
  return array.slice().sort(
    sortMethod
      ? function(a, b) {
          return sortMethod(a, b) ? order : -order;
        }
      : function(a, b) {
          if (sortKey !== '$key') {
            if (isObject(a) && '$value' in a) a = a.$value;
            if (isObject(b) && '$value' in b) b = b.$value;
          }
          a = isObject(a) ? getValueByPath(a, sortKey) : a;
          b = isObject(b) ? getValueByPath(b, sortKey) : b;
          if (!defaultSortMethod) return a === b ? 0 : a > b ? order : -order;
          return defaultSortMethod(a, b) ? order : -order;
        }
  );
};

export const getColumnById = function(table, columnId) {
  let column = null;
  (table.columns || []).forEach(function(item) {
    if (item.id === columnId) {
      column = item;
    }
  });
  return column;
};

export const getColumnByCell = function(table, cell) {
  const matches = (cell.className || '').match(/el-table_[^\s]+/gm);
  if (matches) {
    return getColumnById(table, matches[0]);
  }
  return null;
};

const isFirefox =
  typeof navigator !== 'undefined' &&
  navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export const mousewheel = function(element, callback) {
  if (element && element.addEventListener) {
    element.addEventListener(
      isFirefox ? 'DOMMouseScroll' : 'mousewheel',
      callback
    );
  }
};

export const normalizeWheel = event => {
  // Reasonable defaults
  const PIXEL_STEP = 10;
  const LINE_HEIGHT = 40;
  const PAGE_HEIGHT = 800;

  // spinX, spinY, pixelX, pixelY
  let sX = 0;
  let sY = 0;
  let pX = 0;
  let pY = 0;

  // Legacy
  if ('detail' in event) {
    sY = event.detail;
  }
  if ('wheelDelta' in event) {
    sY = -event.wheelDelta / 120;
  }
  if ('wheelDeltaY' in event) {
    sY = -event.wheelDeltaY / 120;
  }
  if ('wheelDeltaX' in event) {
    sX = -event.wheelDeltaX / 120;
  }

  // side scrolling on FF with DOMMouseScroll
  if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
    sX = sY;
    sY = 0;
  }

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ('deltaY' in event) {
    pY = event.deltaY;
  }
  if ('deltaX' in event) {
    pX = event.deltaX;
  }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode === 1) {
      // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {
      // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) {
    sX = pX < 1 ? -1 : 1;
  }
  if (pY && !sY) {
    sY = pY < 1 ? -1 : 1;
  }

  return {
    spinX: sX,
    spinY: sY,
    pixelX: pX,
    pixelY: pY
  };
};

export const getRowIdentity = (row, rowKey) => {
  if (!row) throw new Error('row is required when get row identity');
  if (typeof rowKey === 'string') {
    if (rowKey.indexOf('.') < 0) {
      return row[rowKey];
    }
    const key = rowKey.split('.');
    let current = row;
    for (let i = 0; i < key.length; i++) {
      current = current[key[i]];
    }
    return current;
  } else if (typeof rowKey === 'function') {
    return rowKey(row);
  }
};

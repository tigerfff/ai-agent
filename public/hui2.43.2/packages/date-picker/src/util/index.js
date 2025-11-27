import dateUtil from 'hui/src/utils/date';
import { t } from 'hui/src/locale';

export const isEmpty = val => {
  if (typeof val === 'string') {
    return val.trim() === '';
  }
  return typeof val === 'undefined' || val === null;
};

export const isString = function(val) {
  return typeof val === 'string' || val instanceof String;
};

const WEEKS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec'
];

export const DEFAULT_FORMATS = {
  date: 'yyyy/MM/dd',
  month: 'yyyy/MM',
  datetime: 'yyyy/MM/dd HH:mm:ss',
  time: 'HH:mm:ss',
  week: 'yyyy/MM/dd$',
  timerange: 'HH:mm:ss',
  daterange: 'yyyy/MM/dd',
  monthrange: 'yyyy/MM',
  datetimerange: 'yyyy/MM/dd HH:mm:ss',
  year: 'yyyy'
};

const DATE_FORMATTER = function(value, format) {
  if (format === 'timestamp') return value.getTime();
  return formatDate(value, format);
};
const DATE_PARSER = function(text, format) {
  if (format === 'timestamp') return new Date(Number(text));
  return parseDate(text, format);
};
const RANGE_FORMATTER = function(value, format) {
  if (Array.isArray(value) && value.length === 2) {
    const start = value[0];
    const end = value[1];
    if (start && end) {
      return [DATE_FORMATTER(start, format), DATE_FORMATTER(end, format)];
    }
  }
  return '';
};
const RANGE_PARSER = function(array, format, separator) {
  if (!Array.isArray(array)) {
    array = array.split(separator);
  }
  if (array.length === 2) {
    const range1 = array[0];
    const range2 = array[1];

    return [DATE_PARSER(range1, format), DATE_PARSER(range2, format)];
  }
  return [];
};
export const TYPE_VALUE_RESOLVER_MAP = {
  default: {
    formatter(value) {
      if (isEmpty(value)) {
        return '';
      }
      return '' + value;
    },
    parser(text) {
      if (text === undefined || text === '') return null;
      return text;
    }
  },
  week: {
    formatter(value, format) {
      const week = dateUtil.getWeekNumber(value);
      let trueDate;
      if (Array.isArray(value)) {
        trueDate = new Date(value[0]);
      } else {
        trueDate = new Date(value);
      }
      const month = trueDate.getMonth();
      const showWeek = /W/.test(format);
      const isRange = /\${1}$/.test(format);
      if (isRange) {
        format = format.replace(/\${1}$/, '');
      }
      if (showWeek && week === 1 && month === 11) {
        trueDate.setHours(0, 0, 0, 0);
        trueDate.setDate(
          trueDate.getDate() + 3 - ((trueDate.getDay() + 6) % 7)
        );
      }
      const date = formatDate(trueDate, format);
      const endDate = formatDate(nextDate(trueDate, 6), format);
      if (!showWeek && isRange) {
        return `${date} - ${endDate}`;
      } else {
        return date;
      }
    },
    parser(text, format) {
      return TYPE_VALUE_RESOLVER_MAP.date.parser(text, format);
    }
  },
  date: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  datetime: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  daterange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  monthrange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  yearrange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  datetimerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  timerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  time: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  month: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  year: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  number: {
    formatter(value) {
      if (isEmpty(value)) {
        return '';
      }
      return '' + value;
    },
    parser(text) {
      const result = Number(text);

      if (!isNaN(text)) {
        return result;
      } else {
        return null;
      }
    }
  },
  dates: {
    formatter(value, format) {
      return value.map(date => DATE_FORMATTER(date, format));
    },
    parser(value, format) {
      return (typeof value === 'string' ? value.split(', ') : value).map(date =>
        date instanceof Date ? date : DATE_PARSER(date, format)
      );
    }
  }
};

export const validateFormatType = function(value, format) {
  switch (true) {
    case isDateObject(value):
      return true;
    case typeof value === 'number' && format === 'timestamp': {
      return true;
    }
    case typeof value === 'string': {
      const valueArr = value.split('');
      const formatArr = format.split('');
      const char = ['y', 'M', 'd', 'H', 'h', 'm', 's'];
      let formatLength = 0;
      let valueLength = 0;
      valueArr.forEach(str => {
        if (isInteger(+str) && str.trim() !== '') {
          valueLength++;
        }
      });
      formatArr.forEach(str => {
        if (char.includes(str)) {
          formatLength++;
        }
      });
      return formatLength === valueLength;
    }
    default:
      return true;
  }
};

const getI18nSettings = () => {
  return {
    dayNamesShort: WEEKS.map(week => t(`el.datepicker.weeks.${week}`)),
    dayNames: WEEKS.map(week => t(`el.datepicker.weeks.${week}`)),
    monthNamesShort: MONTHS.map(month => t(`el.datepicker.months.${month}`)),
    monthNames: MONTHS.map((month, index) =>
      t(`el.datepicker.month${index + 1}`)
    ),
    amPm: dateUtil.i18n.amPm,
    oFn: dateUtil.i18n.oFn
  };
};

const newArray = function(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

export const isDate = dateUtil.isDate;
export const getWeekNumber = dateUtil.getWeekNumber;

export const toDate = function(date) {
  return isDate(date) ? new Date(date) : now();
};

export const isDateObject = function(val) {
  return val instanceof Date;
};

export const formatDate = function(date, format, calendarType) {
  format = format || 'yyyy/MM/dd';
  if (typeof date === 'string') {
    return calendarType ? getOffsetDate(date, calendarType) : date;
  } else if (isDate(date)) {
    date = new Date(date);
  } else if (!date) {
    return '';
  }
  const d = dateUtil.format(date, format, getI18nSettings());
  return calendarType ? getOffsetDate(d, calendarType) : d;
};

export const parseDate = function(string, format) {
  format = format || 'yyyy/MM/dd';
  if (validateFormatType(string, format)) {
    return dateUtil.parse(string, format, getI18nSettings());
  } else {
    return false;
  }
};

export const getDayCountOfMonth = function(year, month) {
  if (month === 3 || month === 5 || month === 8 || month === 10) {
    return 30;
  }

  if (month === 1) {
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      return 29;
    } else {
      return 28;
    }
  }

  return 31;
};

export const setYear = function(date, _year) {
  return changeYearMonthAndClampDate(date, _year, date.getMonth());
};

export const setMonth = function(date, _month) {
  return changeYearMonthAndClampDate(date, date.getFullYear(), _month);
};

export const setDate = function(date, _date) {
  date.setDate(_date);
  return new Date(date);
};

export const clearDate = date => {
  return new Date(date.getFullYear(), date.getMonth());
};

export const clearDateAndMonth = date => {
  return new Date(date.getFullYear());
};

export const clearTime = function(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const clearMinutes = function(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours()
  );
};

export const clearSeconds = function(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes()
  );
};

export const clearMilliseconds = function(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
};

export const timeToNowDate = function(date) {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

export const getDayCountOfYear = function(year) {
  const isLeapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  return isLeapYear ? 366 : 365;
};

export const getFirstDayOfMonth = function(date) {
  const temp = new Date(date.getTime());
  temp.setDate(1);
  return temp.getDay();
};

// see: https://stackoverflow.com/questions/3674539/incrementing-a-date-in-javascript
// {prev, next} Date should work for Daylight Saving Time
// Adding 24 * 60 * 60 * 1000 does not work in the above scenario
export const prevDate = function(date, amount = 1) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - amount);
};

export const nextDate = function(date, amount = 1) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
};

export const getStartDateOfMonth = function(year, month) {
  const result = new Date(year, month, 1);
  const day = result.getDay();
  return prevDate(result, day);
};

export const getRangeHours = function(ranges) {
  const hours = [];
  let disabledHours = [];

  (ranges || []).forEach(range => {
    const value = range.map(date => date.getHours());

    disabledHours = disabledHours.concat(newArray(value[0], value[1]));
  });

  if (disabledHours.length) {
    for (let i = 0; i < 24; i++) {
      hours[i] = disabledHours.indexOf(i) === -1;
    }
  } else {
    for (let i = 0; i < 24; i++) {
      hours[i] = false;
    }
  }

  return hours;
};

function setRangeData(arr, start, end, disabled) {
  for (let i = start; i < end; i++) {
    arr[i] = disabled;
  }
}

export const getRange = function(type, ranges, date) {
  if (type === 'hours') {
    return getRangeHours(ranges);
  }
  const list = [];
  for (let i = 0; i < 60; i++) {
    list[i] = true;
  }
  if (!date) {
    return list;
  }
  const isMinutes = type === 'minutes';
  const dateTimestamp = isMinutes
    ? +clearMinutes(timeToNowDate(date))
    : +clearSeconds(timeToNowDate(date));
  if (ranges.length > 0) {
    ranges.forEach(range => {
      const start = range[0];
      const end = range[1];
      const startList = isMinutes ? start.getMinutes() : start.getSeconds();
      const endList = isMinutes ? end.getMinutes() : end.getSeconds();
      const startTimestamp = isMinutes
        ? +clearMinutes(timeToNowDate(start))
        : +clearSeconds(timeToNowDate(start));
      const endTimestamp = isMinutes
        ? +clearMinutes(timeToNowDate(end))
        : +clearSeconds(timeToNowDate(end));
      if (startTimestamp === dateTimestamp && endTimestamp !== dateTimestamp) {
        setRangeData(list, startList, 60, false);
      } else if (
        startTimestamp === dateTimestamp &&
        endTimestamp === dateTimestamp
      ) {
        setRangeData(list, startList, endList + 1, false);
      } else if (
        startTimestamp !== dateTimestamp &&
        endTimestamp === dateTimestamp
      ) {
        setRangeData(list, 0, endList + 1, false);
      } else if (
        startTimestamp < dateTimestamp &&
        endTimestamp > dateTimestamp
      ) {
        setRangeData(list, 0, 60, false);
      }
    });
  } else {
    setRangeData(list, 0, 60, false);
  }
  return list;
};

export const range = function(n) {
  // see https://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n
  return Array.apply(null, { length: n }).map((_, n) => n);
};

export const dateMergeTime = function(from, to) {
  if (isDate(from) && isDate(to)) {
    from = new Date(from);
    to = new Date(to);
    return new Date(
      from.getFullYear(),
      from.getMonth(),
      from.getDate(),
      to.getHours(),
      to.getMinutes(),
      to.getSeconds(),
      to.getMilliseconds()
    );
  }
  return to;
};

export const modifyDate = function(date, y, m, d) {
  return new Date(
    y,
    m,
    d,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );
};

export const modifyTime = function(date, h, m, s) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    h,
    m,
    s,
    date.getMilliseconds()
  );
};

export const modifyWithTimeString = (date, time) => {
  if (date === null) {
    return date;
  }
  if (!time) {
    return modifyTime(date, 0, 0, 0);
  }
  time = parseDate(time, 'HH:mm:ss');
  return modifyTime(
    date,
    time.getHours(),
    time.getMinutes(),
    time.getSeconds()
  );
};

export const limitTimeRange = function(date, ranges, format = 'HH:mm:ss') {
  // TODO: refactory a more elegant solution
  if (ranges.length === 0) return date;
  const normalizeDate = date =>
    dateUtil.parse(dateUtil.format(date, format), format);
  const ndate = normalizeDate(date);
  const nranges = ranges.map(range => range.map(normalizeDate));
  if (nranges.some(nrange => ndate >= nrange[0] && ndate <= nrange[1])) {
    return date;
  }

  let minDate = nranges[0][0];
  let maxDate = nranges[0][0];

  nranges.forEach(nrange => {
    minDate = new Date(Math.min(nrange[0], minDate));
    maxDate = new Date(Math.max(nrange[1], minDate));
  });

  const ret = ndate < minDate ? minDate : maxDate;
  // preserve Year/Month/Date
  return modifyDate(ret, date.getFullYear(), date.getMonth(), date.getDate());
};

export const timeWithinRange = function(date, selectableRange, format) {
  const limitedDate = limitTimeRange(date, selectableRange, format);
  return limitedDate.getTime() === date.getTime();
};

export const changeYearMonthAndClampDate = function(date, year, month) {
  // clamp date to the number of days in `year`, `month`
  // eg: (2010-1-31, 2010, 2) => 2010-2-28
  const monthDate = Math.min(date.getDate(), getDayCountOfMonth(year, month));
  return modifyDate(date, year, month, monthDate);
};

export const prevMonth = function(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 0
    ? changeYearMonthAndClampDate(date, year - 1, 11)
    : changeYearMonthAndClampDate(date, year, month - 1);
};

export const nextMonth = function(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month === 11
    ? changeYearMonthAndClampDate(date, year + 1, 0)
    : changeYearMonthAndClampDate(date, year, month + 1);
};

export const prevYear = function(date, amount = 1) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return changeYearMonthAndClampDate(date, year - amount, month);
};

export const nextYear = function(date, amount = 1) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return changeYearMonthAndClampDate(date, year + amount, month);
};

export const extractDateFormat = function(format) {
  return format
    .replace(/\W?m{1,2}\W?|\W?ZZ\W?/g, '')
    .replace(/\W?h{1,2}\W?|\W?s{1,3}\W?|\W?a\W?/gi, '')
    .trim();
};

export const extractTimeFormat = function(format) {
  return format
    .replace(
      /\W?D{1,2}\W?|\W?do\W?|\W?d{1,4}\W?|\W?M{1,4}\W?|\W?y{2,4}\W?/g,
      ''
    )
    .trim();
};

export const isInteger = function(val) {
  return typeof val === 'number' && val % 1 === 0;
};

export const formatAsFormatAndType = (value, customFormat, type) => {
  if (isEmpty(value)) {
    return null;
  }
  const formatter = (
    TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP.default
  ).formatter;
  const format = customFormat || DEFAULT_FORMATS[type];
  return formatter(value, format);
};

export const parseAsFormatAndType = (
  value,
  customFormat,
  type,
  rangeSeparator = '-'
) => {
  if (isEmpty(value)) {
    return null;
  }
  const parser = (
    TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP.default
  ).parser;
  let format = customFormat || DEFAULT_FORMATS[type];
  format = format && format.replace(/-/g, '/');
  if (validateFormatType(value, format)) {
    return parser(value, format, rangeSeparator);
  } else {
    return null;
  }
};

export const getTimestamp = function(time, type = 'clearTime') {
  let tempTime;
  if (typeof time === 'number' || typeof time === 'string') {
    time = new Date(time);
  }
  if (!(time instanceof Date)) {
    return NaN;
  }
  switch (type) {
    case 'clearTime':
      tempTime = clearTime(time).getTime();
      break;
    case 'clearDate':
      tempTime = clearDate(time).getTime();
      break;
    case 'clearDateAndMonth':
      tempTime = clearDateAndMonth(time).getTime();
      break;
  }
  return tempTime;
};

export const now = (type = 'clearTime') => {
  if (type === 'clearTime') {
    return clearTime(new Date());
  } else {
    return clearDate(new Date());
  }
};

export const dateValidator = function(val) {
  const condition = item => isDate(item) || isString(item) || isEmpty(item);
  return (
    isEmpty(val) ||
    condition(val) ||
    (Array.isArray(val) && val.every(condition))
  );
};

export const isEmptyDate = val => {
  const condition = item => isEmpty(item);
  return condition(val) || (Array.isArray(val) && val.every(condition));
};

export const MIN_TIME = parseDate('00:00:00', 'HH:mm:ss');

export const MAX_TIME = parseDate('23:59:59', 'HH:mm:ss');

// International calendar related interfaces, At present, it includes Buddhist calendar and Nepalese calendar
export const getOffset = type => {
  let offset = 0;
  if (type === 'th') {
    offset = 543;
  } else if (type === 'np') {
    offset = 57;
  }
  return offset;
};
const getOffsetDate = (value, type) => {
  const offset = getOffset(type);
  const offsetDate =
    Number.parseInt(value.substring(0, 4), 10) +
    offset +
    value.substring(4, value.length);
  return offsetDate;
};
const RANGE_SPECIAL_FORMATTER = (value, calendarType) => {
  if (Array.isArray(value) && value.length === 2) {
    const start = value[0];
    const end = value[1];
    if (start && end) {
      return [
        getOffsetDate(start, calendarType),
        getOffsetDate(end, calendarType)
      ];
    }
  }
  return '';
};
const TYPE_VALUE_SPECIAL_MAP = {
  default: {
    formatter(value) {
      return value;
    }
  },
  week: {
    formatter(value, calendarType, format) {
      const showWeek = /W/.test(format);
      const isRange = /\${1}$/.test(format);
      if (!showWeek && isRange) {
        const weeks = value.split(' - ');
        return (
          getOffsetDate(weeks[0], calendarType) +
          ' - ' +
          getOffsetDate(weeks[1], calendarType)
        );
      } else {
        return getOffsetDate(value, calendarType);
      }
    }
  },
  date: {
    formatter(value, calendarType) {
      return getOffsetDate(value, calendarType);
    }
  },
  month: {
    formatter(value, calendarType) {
      return getOffsetDate(value, calendarType);
    }
  },
  year: {
    formatter(value, calendarType) {
      return getOffsetDate(value, calendarType);
    }
  },
  datetime: {
    formatter(value, calendarType) {
      return getOffsetDate(value, calendarType);
    }
  },
  daterange: {
    formatter: RANGE_SPECIAL_FORMATTER
  },
  monthrange: {
    formatter: RANGE_SPECIAL_FORMATTER
  },
  datetimerange: {
    formatter: RANGE_SPECIAL_FORMATTER
  },
  dates: {
    formatter(value, calendarType) {
      return value.map(date => getOffsetDate(date, calendarType));
    }
  }
};
export const formatSpecial = (value, customFormat, type, calendarType) => {
  if (value) {
    let format = customFormat || DEFAULT_FORMATS[type];
    format = format && format.replace(/-/g, '/');
    const formatter = (
      TYPE_VALUE_SPECIAL_MAP[type] || TYPE_VALUE_SPECIAL_MAP.default
    ).formatter;
    return formatter(value, calendarType, format);
  } else {
    return value;
  }
};

import _ from 'lodash'
const uuid = require('node-uuid')
// 将图片转成图片组的方法
export function groupPicsByPicId(_images) {
  const images = _.cloneDeep(_images)
  // 如果没有图片数据，返回空数组
  if (!images || !images.length) {
    return [];
  }

  // Step 1: 按 picRelId 分组
  const groups = images.reduce((acc, pic) => {
    const picId = pic.picRelId || uuid();
    if (!acc[picId]) {
      acc[picId] = [];
    }
    acc[picId].push(pic);
    return acc;
  }, {});

  // Step 2: 组内按 captureTime 排序
  Object.keys(groups).forEach((picId) => {
    groups[picId].sort((a, b) => {
      const timeA = a.captureTime || 0;
      const timeB = b.captureTime || 0;
      return timeA - timeB;
    });
  });

  // Step 3: 组间按每组最后一张图片的时间排序，并返回数组
  return Object.values(groups).sort((groupA, groupB) => {
    const timeA = groupA[groupA.length - 1]?.captureTime || 0;
    const timeB = groupB[groupB.length - 1]?.captureTime || 0;
    return timeA - timeB;
  });
}


// 时间校验，可自定义字符串
export function parseTime (time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time, 10) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') {
      return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return timeStr
}

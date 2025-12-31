/**
 * 预览环境 - 工具方法库
 * 以全局变量形式提供，供预览代码使用
 */

window.__previewUtils = {
  /**
   * 日期格式化
   */
  formatDate: function(date, format) {
    if (!date) return ''
    format = format || 'YYYY-MM-DD'
    
    var d = new Date(date)
    if (isNaN(d.getTime())) return ''

    var year = d.getFullYear()
    var month = String(d.getMonth() + 1).padStart(2, '0')
    var day = String(d.getDate()).padStart(2, '0')
    var hours = String(d.getHours()).padStart(2, '0')
    var minutes = String(d.getMinutes()).padStart(2, '0')
    var seconds = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  /**
   * 金额格式化
   */
  formatMoney: function(amount, decimals, symbol) {
    if (amount === null || amount === undefined || amount === '') return (symbol || '¥') + '0.00'
    decimals = decimals !== undefined ? decimals : 2
    symbol = symbol || '¥'
    
    var num = Number(amount)
    if (isNaN(num)) return symbol + '0.00'
    
    var fixed = num.toFixed(decimals)
    var parts = fixed.split('.')
    var integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    return symbol + (parts[1] ? integerPart + '.' + parts[1] : integerPart)
  },

  /**
   * 数字格式化
   */
  formatNumber: function(num, decimals) {
    if (num === null || num === undefined || num === '') return '0'
    decimals = decimals || 0
    
    var number = Number(num)
    if (isNaN(number)) return '0'
    
    var fixed = decimals > 0 ? number.toFixed(decimals) : String(Math.floor(number))
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },

  /**
   * 防抖函数
   */
  debounce: function(func, wait) {
    wait = wait || 300
    var timeout
    return function() {
      var context = this
      var args = arguments
      var later = function() {
        timeout = null
        func.apply(context, args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  /**
   * 节流函数
   */
  throttle: function(func, limit) {
    limit = limit || 300
    var inThrottle
    return function() {
      var context = this
      var args = arguments
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(function() {
          inThrottle = false
        }, limit)
      }
    }
  },

  /**
   * 深拷贝
   */
  deepClone: function(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) {
      return obj.map(function(item) {
        return window.__previewUtils.deepClone(item)
      })
    }
    if (obj instanceof Object) {
      var clonedObj = {}
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = window.__previewUtils.deepClone(obj[key])
        }
      }
      return clonedObj
    }
  },

  /**
   * 下载文件
   */
  downloadFile: function(content, filename, type) {
    type = type || 'text/plain'
    var blob = new Blob([content], { type: type })
    var url = URL.createObjectURL(blob)
    var link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },

  /**
   * 生成唯一ID
   */
  generateId: function(prefix) {
    prefix = prefix || 'id'
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },

  /**
   * 等待
   */
  sleep: function(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms)
    })
  },

  // ==================== 日期时间扩展 ====================
  
  /**
   * 格式化时间
   */
  formatTime: function(time, format) {
    format = format || 'HH:mm:ss'
    if (!time) return ''
    var d = new Date(time)
    if (isNaN(d.getTime())) return ''
    
    var hours = String(d.getHours()).padStart(2, '0')
    var minutes = String(d.getMinutes()).padStart(2, '0')
    var seconds = String(d.getSeconds()).padStart(2, '0')
    
    return format
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  /**
   * 格式化日期时间
   */
  formatDateTime: function(datetime, format) {
    return this.formatDate(datetime, format || 'YYYY-MM-DD HH:mm:ss')
  },

  /**
   * 解析日期
   */
  parseDate: function(dateStr) {
    if (!dateStr) return null
    var d = new Date(dateStr)
    return isNaN(d.getTime()) ? null : d
  },

  /**
   * 获取日期范围
   */
  getDateRange: function(type) {
    var now = new Date()
    var start, end
    
    switch(type) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59)
        break
      case 'week':
        var day = now.getDay() || 7
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1)
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 7, 23, 59, 59)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      default:
        start = end = now
    }
    
    return [start, end]
  },

  // ==================== 数字格式化扩展 ====================
  
  /**
   * 格式化百分比
   */
  formatPercent: function(value, decimals) {
    if (value === null || value === undefined || value === '') return '0%'
    decimals = decimals !== undefined ? decimals : 2
    var num = Number(value) * 100
    return num.toFixed(decimals) + '%'
  },

  /**
   * 保留小数
   */
  toFixed: function(num, decimals) {
    decimals = decimals !== undefined ? decimals : 2
    var number = Number(num)
    if (isNaN(number)) return '0'
    return number.toFixed(decimals)
  },

  // ==================== 字符串处理 ====================
  
  /**
   * 去除首尾空格
   */
  trim: function(str) {
    return str ? String(str).trim() : ''
  },

  /**
   * 截断文本
   */
  truncate: function(text, maxLength, suffix) {
    if (!text) return ''
    suffix = suffix || '...'
    text = String(text)
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + suffix
  },

  /**
   * 首字母大写
   */
  capitalize: function(str) {
    if (!str) return ''
    str = String(str)
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  /**
   * 转驼峰命名
   */
  camelCase: function(str) {
    if (!str) return ''
    return String(str).replace(/[-_\s]+(.)?/g, function(_, c) {
      return c ? c.toUpperCase() : ''
    })
  },

  /**
   * 转短横线命名
   */
  kebabCase: function(str) {
    if (!str) return ''
    return String(str)
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  },

  // ==================== 数据处理 ====================
  
  /**
   * 合并对象
   */
  merge: function() {
    var result = {}
    for (var i = 0; i < arguments.length; i++) {
      var obj = arguments[i]
      if (obj && typeof obj === 'object') {
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            result[key] = obj[key]
          }
        }
      }
    }
    return result
  },

  /**
   * 提取对象属性
   */
  pick: function(obj, keys) {
    if (!obj || !keys) return {}
    var result = {}
    keys.forEach(function(key) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key]
      }
    })
    return result
  },

  /**
   * 排除对象属性
   */
  omit: function(obj, keys) {
    if (!obj) return {}
    var result = {}
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && keys.indexOf(key) === -1) {
        result[key] = obj[key]
      }
    }
    return result
  },

  // ==================== 数组处理 ====================
  
  /**
   * 数组去重
   */
  unique: function(arr) {
    if (!Array.isArray(arr)) return []
    var seen = {}
    return arr.filter(function(item) {
      var key = typeof item === 'object' ? JSON.stringify(item) : item
      return seen.hasOwnProperty(key) ? false : (seen[key] = true)
    })
  },

  /**
   * 数组分组
   */
  groupBy: function(arr, key) {
    if (!Array.isArray(arr)) return {}
    return arr.reduce(function(groups, item) {
      var groupKey = typeof key === 'function' ? key(item) : item[key]
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(item)
      return groups
    }, {})
  },

  /**
   * 数组排序
   */
  sortBy: function(arr, key, order) {
    if (!Array.isArray(arr)) return []
    order = order || 'asc'
    return arr.slice().sort(function(a, b) {
      var aVal = typeof key === 'function' ? key(a) : a[key]
      var bVal = typeof key === 'function' ? key(b) : b[key]
      if (order === 'desc') {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })
  },

  /**
   * 数组扁平化
   */
  flatten: function(arr, depth) {
    if (!Array.isArray(arr)) return []
    depth = depth !== undefined ? depth : Infinity
    return depth > 0
      ? arr.reduce(function(acc, val) {
          return acc.concat(Array.isArray(val) ? window.__previewUtils.flatten(val, depth - 1) : val)
        }, [])
      : arr.slice()
  },

  // ==================== 校验判断 ====================
  
  /**
   * 是否为空
   */
  isEmpty: function(value) {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  },

  /**
   * 是否为数组
   */
  isArray: function(value) {
    return Array.isArray(value)
  },

  /**
   * 是否为对象
   */
  isObject: function(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  },

  /**
   * 是否为函数
   */
  isFunction: function(value) {
    return typeof value === 'function'
  },

  // ==================== URL 处理 ====================
  
  /**
   * 获取URL参数
   */
  getQueryParam: function(key, url) {
    url = url || window.location.href
    var params = {}
    var queryString = url.split('?')[1] || ''
    if (queryString) {
      queryString.split('&').forEach(function(item) {
        var parts = item.split('=')
        params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '')
      })
    }
    return key ? params[key] : params
  },

  /**
   * 构建查询字符串
   */
  buildQueryString: function(params) {
    if (!params || typeof params !== 'object') return ''
    var parts = []
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      }
    }
    return parts.join('&')
  },

  // ==================== 文件处理 ====================
  
  /**
   * 获取文件扩展名
   */
  getFileExt: function(filename) {
    if (!filename) return ''
    var parts = filename.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : ''
  },

  /**
   * 导出Excel（简化版本，需配合后端）
   */
  exportExcel: function(data, filename) {
    console.log('导出Excel:', filename, data)
    // 实际项目中需要配合后端或使用第三方库
    alert('请配合后端实现Excel导出功能')
  }
}

// 打印日志
console.log('✅ 预览环境 utils 已加载')


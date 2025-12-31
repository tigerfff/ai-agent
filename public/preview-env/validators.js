/**
 * 预览环境 - 表单校验规则库
 * 以全局变量形式提供，供预览代码使用
 * 
 * 使用方式：
 * - 在提示词中使用 !required、!phone、!email 等引用校验规则
 * - 在生成的代码中自动转换为对应的校验函数
 */

window.__previewValidators = {
  // ==================== 基础校验 ====================
  
  /**
   * 必填校验
   * 使用: !required
   */
  required: function(message) {
    message = message || '此项为必填项'
    return {
      required: true,
      message: message,
      trigger: 'blur'
    }
  },

  /**
   * 最小长度校验
   * 使用: !minLength(3)
   */
  minLength: function(min, message) {
    message = message || '长度不能小于' + min + '个字符'
    return {
      min: min,
      message: message,
      trigger: 'blur'
    }
  },

  /**
   * 最大长度校验
   * 使用: !maxLength(32)
   */
  maxLength: function(max, message) {
    message = message || '长度不能大于' + max + '个字符'
    return {
      max: max,
      message: message,
      trigger: 'blur'
    }
  },

  /**
   * 长度范围校验
   * 使用: !lengthRange(3, 32)
   */
  lengthRange: function(min, max, message) {
    message = message || '长度应在' + min + '-' + max + '个字符之间'
    return {
      min: min,
      max: max,
      message: message,
      trigger: 'blur'
    }
  },

  // ==================== 格式校验 ====================

  /**
   * 手机号校验（大陆）
   * 使用: !phone
   */
  phone: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(value)) {
      callback(new Error('请输入正确的手机号'))
    } else {
      callback()
    }
  },

  /**
   * 固定电话或手机号
   * 使用: !phoneOrTel
   */
  phoneOrTel: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^((0\d{2,3}-\d{7,8})|(1[3-9]\d{9}))$/
    if (!reg.test(value)) {
      callback(new Error('请输入正确的电话号码'))
    } else {
      callback()
    }
  },

  /**
   * 邮箱校验
   * 使用: !email
   */
  email: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var emailReg = /\w+([-+.]\w+)*@\w+([-.]w+)*\.\w+([-.]\w+)*/
    if (!emailReg.test(value)) {
      callback(new Error('请输入正确的邮箱地址'))
    } else {
      callback()
    }
  },

  /**
   * 身份证号校验
   * 使用: !idCard
   */
  idCard: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!idCardReg.test(value)) {
      callback(new Error('请输入正确的身份证号'))
    } else {
      callback()
    }
  },

  /**
   * URL 地址校验
   * 使用: !url
   */
  url: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var urlReg = /(http|https):\/\/([\w.]+\/?)\S*/
    if (!urlReg.test(value)) {
      callback(new Error('请输入正确的URL地址'))
    } else {
      callback()
    }
  },

  /**
   * 密码校验（8-16位，至少包含字母和数字）
   * 使用: !password
   */
  password: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d][\d\D]{7,15}$/
    if (!passwordReg.test(value)) {
      callback(new Error('密码为8-16位，至少包含字母和数字'))
    } else {
      callback()
    }
  },

  /**
   * 强密码校验（8-16位，至少包含字母和数字，不含空格）
   * 使用: !strongPassword
   */
  strongPassword: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var passwordReg = /(?!.*\s)^(?![^a-zA-Z/D]+$)(?![^0-9/D]+$).{8,16}$/
    if (!passwordReg.test(value)) {
      callback(new Error('密码为8-16位，至少包含字母和数字，不含空格'))
    } else {
      callback()
    }
  },

  /**
   * 账号校验（1-32位，字母数字及@/._组合，不能纯数字）
   * 使用: !account
   */
  account: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var accountReg = /^(?!\d+$)[a-zA-Z\d@._]{1,32}$/
    if (!accountReg.test(value)) {
      callback(new Error('账号为1-32位，不能为纯数字'))
    } else {
      callback()
    }
  },

  // ==================== 数字校验 ====================

  /**
   * 纯数字校验
   * 使用: !number
   */
  number: function(rule, value, callback) {
    if (value === '' || value === null || value === undefined) {
      callback()
      return
    }
    var numberReg = /^\d+$/
    if (!numberReg.test(value)) {
      callback(new Error('请输入数字'))
    } else {
      callback()
    }
  },

  /**
   * 数字或小数校验
   * 使用: !decimal
   */
  decimal: function(rule, value, callback) {
    if (value === '' || value === null || value === undefined) {
      callback()
      return
    }
    var decimalReg = /^\d+(\.\d+)?$/
    if (!decimalReg.test(value)) {
      callback(new Error('请输入数字或小数'))
    } else {
      callback()
    }
  },

  /**
   * 数字或小数（最多2位小数）
   * 使用: !decimal2
   */
  decimal2: function(rule, value, callback) {
    if (value === '' || value === null || value === undefined) {
      callback()
      return
    }
    var decimalReg = /^(\d|[1-9]\d+)(\.\d{1,2})?$/
    if (!decimalReg.test(value)) {
      callback(new Error('请输入数字，最多2位小数'))
    } else {
      callback()
    }
  },

  /**
   * 正整数校验（大于0）
   * 使用: !positiveInteger
   */
  positiveInteger: function(rule, value, callback) {
    if (value === '' || value === null || value === undefined) {
      callback()
      return
    }
    var num = Number(value)
    if (!Number.isInteger(num) || num <= 0) {
      callback(new Error('请输入大于0的整数'))
    } else {
      callback()
    }
  },

  // ==================== 特殊字符校验 ====================

  /**
   * 不允许 % 字符（常用于搜索框）
   * 使用: !noPercent
   */
  noPercent: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (value.indexOf('%') !== -1) {
      callback(new Error('不允许输入 % 字符'))
    } else {
      callback()
    }
  },

  /**
   * 不允许特殊字符（保留常用字符：中英文、数字、-_[]【】()#@~<>.、）
   * 使用: !noSpecialChar
   */
  noSpecialChar: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /[^-、._[\]【】()（）#@~<>0-9a-zA-Z\u4E00-\u9FA5]+/g
    if (reg.test(value)) {
      callback(new Error('不支持特殊字符'))
    } else {
      callback()
    }
  },

  /**
   * 限制特殊字符（允许常用标点和符号）
   * 使用: !limitedSpecialChar
   */
  limitedSpecialChar: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5`~!@#\$%\^&\*()_\+\-=\{\}\[\];:><,.，。：""；''【】（）%、？\?○≤《》≥]{0,}$/
    if (!reg.test(value)) {
      callback(new Error('包含不支持的特殊字符'))
    } else {
      callback()
    }
  },

  /**
   * 不允许空格
   * 使用: !noSpace
   */
  noSpace: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    if (/\s/.test(value)) {
      callback(new Error('不允许包含空格'))
    } else {
      callback()
    }
  },

  // ==================== 组合校验（长度+字符）====================

  /**
   * 通用文本（1-32字符，中英文数字及常用符号）
   * 使用: !commonText
   */
  commonText: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5\[\].、\-_【】()（）#@~<>]{1,32}$/
    if (!reg.test(value)) {
      callback(new Error('长度为1-32字符，不支持部分特殊字符'))
    } else {
      callback()
    }
  },

  /**
   * 通用文本（1-16字符）
   * 使用: !commonText16
   */
  commonText16: function(rule, value, callback) {
    if (!value) {
      callback()
      return    
    }
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5\[\].、\-_【】()（）#@~<>]{1,16}$/
    if (!reg.test(value)) {
      callback(new Error('长度为1-16字符，不支持部分特殊字符'))
    } else {
      callback()
    }
  },

  /**
   * 通用文本长（1-128字符）
   * 使用: !commonTextLong
   */
  commonTextLong: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5`~!@#\$%\^&\*()_\+\-=\{\}\[\];:><,.，。：""；''【】（）%、？\?○≤《》≥]{1,128}$/
    if (!reg.test(value)) {
      callback(new Error('长度为1-128字符'))
    } else {
      callback()
    }
  },

  /**
   * 备注（1-500字符）
   * 使用: !remark
   */
  remark: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5`°~!@#℃\$%\^&\*()_\+\-=\{\}\[\]; :><,.，。""""''\n【】（）%、？\?○≤≥…$｜|¥·{–}\/.，。？！＃：、～；＊—＄＆『〔【｛￥￡♀‖《〖「」〗》｝】〕』]{1,500}$/
    if (!reg.test(value)) {
      callback(new Error('长度为1-500字符'))
    } else {
      callback()
    }
  },

  /**
   * 文本域（1-5000字符，支持换行）
   * 使用: !textArea
   */
  textArea: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^[a-zA-Z0-9\u4e00-\u9fa5`°~!@#℃\$%\^&\*()_\+\-=\{\}\[\]; :><,.，。""""''\n【】（）%、？\?○≤≥…$｜|¥·{–}\/.，。？！＃：、～；＊—＄＆『〔【｛￥￡♀‖《〖「」〗》｝】〕』]{1,5000}$/
    if (!reg.test(value)) {
      callback(new Error('长度为1-5000字符'))
    } else {
      callback()
    }
  },

  /**
   * 用户姓名（1-32字符，中英文数字及空格）
   * 使用: !userName
   */
  userName: function(rule, value, callback) {
    if (!value) {
      callback()
      return
    }
    var reg = /^(?!\s)(?!.*\s$)[a-zA-Z0-9\u4e00-\u9fa5\s]{1,32}$/
    if (!reg.test(value)) {
      callback(new Error('长度为1-32字符，首尾不能为空格'))
    } else {
      callback()
    }
  },

  // ==================== 工具方法 ====================

  /**
   * 自定义正则校验
   * 使用: !pattern(regex, message)
   */
  pattern: function(regex, message) {
    message = message || '格式不正确'
    return {
      pattern: regex,
      message: message,
      trigger: 'blur'
    }
  }
}

// 打印日志
console.log('✅ 预览环境 validators 已加载')


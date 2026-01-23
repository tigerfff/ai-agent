import axios from 'axios'
import pako from 'pako'
import { debounce } from '@hui-pro/utils'
import { isMac } from '@/plugin/utils/util'
import Bowser from "bowser"

var collect = {
  install (Vue, options = {}) {
    // 内部使用的方法
    // 获取当前浏览器类型和版本
    const _getBroswerAndVersion = () => {
      const browser = Bowser.getParser(window.navigator.userAgent);
      return browser.getBrowser()
    }
    const MAXNUM = 50 // 最大存储数量
    // 存储当前平台信息
    var _clientCode = ''
    var _envInfo = {}
    var _collectTimer = '' // 定时器
    const localKey = 'collect_data'

    const _getLocalData = () => {
      let localData = localStorage.getItem(localKey)
      localStorage.removeItem(localKey)
      return localData ? JSON.parse(localData) : []
    }
    const _getSendData = () => {
      const singleMaxLength = 500
      return dataStore.splice(0, singleMaxLength)
    }
    const restoreData = data => {
      dataStore.unshift(...data)
    }
    // 运行状态数据存储
    let dataStore = _getLocalData()
    // 关闭页面时将未发送数据本地存储
    window.addEventListener('unload', function(event) {
      if (dataStore.length === 0) return
      localStorage.setItem(localKey, JSON.stringify([...dataStore, ..._getLocalData()]))
    })

    // 根据字段获取cookie信息
    const _getCookie = (name) => {
      var cookies = document.cookie.split(';')
      for(var i = 0; i < cookies.length; i++) {
        var item = cookies[i].split('=')
        if (item[0] === name) return item[1]
      }
      return ''
    }
    // 获取baseURL地址
    const _getBASEURL = () => {
      let host = window.location.host
      if (host === 'www.hik-cloud.com') {
        return 'https://pick.hik-cloud.com/v1/datahub/picker'
      }
      if (host === 'pb.hik-cloud.com') {
        return 'https://pbpick.hik-cloud.com/v1/datahub/picker'
      }
      if (host === 'pa.hik-cloud.com') {
        return 'https://papick.hik-cloud.com/v1/datahub/picker'
      }
      return ''
    }
    // 自定义axios实例
    const _createAxios = () => {
      const collectAxios = axios.create({
        baseURL: _getBASEURL(),
        timeout: 3000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return collectAxios
    }
    // 发送post请求
    const _sendData = (url, data) => {
      // data进行gzip处理
      data = pako.gzip(encodeURIComponent(JSON.stringify(data)), { to: 'string' })
      var collectAxios = _createAxios()
      return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'development' || process.env.VUE_APP_CUSTOM_ENV === 'private') {
          resolve({ code: 0 })
          return
        }
        collectAxios({
          method: 'post',
          url: url,
          data: data
        }).then(res => {
          resolve(res.data)
        }).catch((err) => {
          // token失效后，取消定时器
          if (err.message.includes('401')) {
            _collectTimer = null
            clearInterval(_collectTimer)
          }
          reject(err)
        })
      })
    }
    // 设置30s间隔上报数据
    const _setTimer = () => {
      let timer = _collectTimer
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      timer = setInterval(() => {
        _sendStorageMessage()
      }, 30000)
    }
    // 发送localStorage里面的数据（防止接口还未返回又发起新的请求，重复上报数据）
    const _sendStorageMessage = debounce(async () => {
      let data = _getSendData()
      if (!data || data.length === 0) return
      data.forEach(item => {
        item.rt = new Date().getTime()
      })
      let { code } = await _sendData('/pick/pickInfo', { dataList: data })
      if (code === 0) return
      if (code === 101) {
        _sendEnvironmentInfo(_clientCode, _envInfo)
        return
      }
      restoreData(data)
    }, 2000, true)

    // 立即发送埋点信息给后端
    Vue.prototype.sendStorageMessage = _sendStorageMessage
    // 发送环境信息给后端供内部调用
    const _sendEnvironmentInfo = (clientCode, envInfo = {}) => {
      _clientCode = clientCode
      _envInfo = envInfo
      let browser = _getBroswerAndVersion()
      _sendData('/pick/envInfo', {
        clientCode,
        environmentalInfo: Object.assign({
          osVersion: isMac() ? 'mac' : 'windows',
          // mac or windows
          brand: '',
          model: '',
          appVersion: '',
          browser: browser.name,
          browserVersion: browser.version
        } , envInfo)
      })
      // 设置定时上报数据
      _setTimer()
    }
    // 添加原型方法--发送环境信息供外部调用
    Vue.prototype.sendEnvironmentInfo = _sendEnvironmentInfo
    // 发送点击信息供内部调用
    const _sendClickMessage = (data) => {
      if (!data.lc) return
      let d = Object.assign({
        ety: 'click',
        rt: '',
        et: new Date().getTime()
      }, data)
      if (d.ety == 'aac' && d.biz) {
        Object.assign(d.biz, { a2: '', c: 0 }, {...d.biz})
      }
      console.log.info('触发埋点事件=========> ', d.lc)
      dataStore.push(d)
      if (dataStore.length >= MAXNUM) {
        _sendStorageMessage()
      }
    }
    // 发送点击信息供外部调用
    Vue.prototype.sendClickMessage = (data) => {
      _sendClickMessage(data)
    }
    // 绑定click事件的指令
    Vue.directive('collectclick', {
      // 当被绑定的元素插入到 DOM 中时……
      bind: function (el, binding) {
        el.addEventListener('click', () => {
          const data = binding.value
          _sendClickMessage(data)
        })
      }
    })
    // 绑定click事件，直接将剩余数据上报
    Vue.directive('sendmessage', {
      bind: function (el, binding) {
        el.addEventListener('click', () => {
          _sendStorageMessage()
        })
      }
    })
    // Vue.mixin({
    //   beforeDestroy: debounce(() => {
    //     _sendStorageMessage()
    //   }, 3000, true)
    // })
  },
}

export default collect

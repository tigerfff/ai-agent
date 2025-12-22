import axios from "axios";
import Vue from "vue";
import {
  Message,
  Loading,
} from "hui";
import { safeCenterPrefix } from '@/plugin/utils/util'
import store from '@/store'

axios.defaults.withCredentials = true;
//d7b41b71-2ca8-4063-b249-8c45caca37c9
const myAxios = axios.create({
  timeout: 30000,
  headers: {
    'ChainVersion': '2.48.0',
    'ApplicationSource': '1',
    'accessToken': `bearer ${localStorage.getItem('accessToken')}`
  },
}); 
let loadingInstance
// 过滤报错情况，白名单中的code错误不进行toast
const whiteList = [50100084, 1010335, 1010318, 1010339, 1010340, 50100005, 50100098, 50100363, 50100412, 50100307, 50102078, 50102151, 50102277,50109024, 50102123, 88110431, 88110432, 50102380,50102389, 1010007]
const  = [
  { key: '/api', host: 'VUE_APP_REQUEST_HOST' },
  { key: '/qwapi', host: 'VUE_APP_REQUEST_QW_HOST' },
  { key: '/safe-center', host: 'VUE_APP_REQUEST_SC_HOST' },
  { key: '/device-api', host: 'VUE_APP_REQUEST_CARRIER_HOST' },
  { key: '/nissan-api', host: 'VUE_APP_REQUEST_CARRIER_HOST' },
]
// 请求拦截器
myAxios.interceptors.request.use(
  config => {
    let url = config.url;
    if (process.env.NODE_ENV === "production") {
      for (let e of ) {
        if (url.indexOf(e.key) > -1) {
          url = process.env[e.host] + url.replace(new RegExp(e.key), '')
          break
        }
      }
    } else {
    }
    // get参数编码
    if (config.method === "get" && config.params) {
      url += "?";
      let keys = Object.keys(config.params);
      for (let key of keys) {
        if (
          config.params[key] ||
          config.params[key] === false ||
          config.params[key] === 0
        ) {
          url += `${key}=${encodeURIComponent(config.params[key])}&`;
        }
      }
      url = url.substring(0, url.length - 1);
      config.params = {};
    }
    config.url = url;
    return config;
  },
  error => {
    Message.error('获取数据失败');
    // 添加获取数据失败情况的埋点，方便后续分析
    Vue.prototype.sendClickMessage({ lc: '9_1_1162' })
    return Promise.reject(error);
  }
);

// 响应拦截器
// myAxios.interceptors.response.use(
//   response => {
//     loadingInstance && loadingInstance.close();
//     // response.config.headers.loaddingFlag && store.commit('loadNumMinus')
//     localStorage.setItem('requestTimestamp', Date.now())
//     // store.commit("loadNumMinus");
//     // if (store.state.loaddingNum <= 0) {
//     //   store.commit("resetLoadNum");
//     // }
//     if (+response.data.code !== 0 && whiteList.indexOf(+response.data.code) < 0) {
//       Message.error(response.data.message);
//     }
//     return Promise.resolve(response.data);
//   },
//   error => {
//     loadingInstance && loadingInstance.close();
//     // store.commit("loadNumMinus");
//     // if (store.state.loaddingNum <= 0) {
//     //   store.commit("resetLoadNum");
//     // }
//     if (error.response && error.response.status * 1 === 401) {
//       const direction = judgeDirection()
//       if (direction) {
//         window.location.replace(`${safeCenterPrefix}/login/retail?type=true&direction=${direction}`)
//       }
//     } else {
//       Message.error('获取数据失败');
//     }
//     return Promise.reject(error);
//   }
// );

function judgeDirection () {
  const direction = window.location.hash.replace('#', '')
  const isLoginPage = /^\/login/.test(direction)
  return isLoginPage ? '' : escape(direction)
}

//#region 接口重试
//  失败后需要重试的接口
const retryApiList = ["operation/log/logs/actions/queryDeferredWithManage"]
//  失败后需要重试的错误码
const RETRY_CODE = [10999]
//  重试最大次数
const RETRY_MAX = 20
async function retryApi (code, responseConfig, requestId, config) {
  try {
    if (!RETRY_CODE.includes(code)) {
      return { retry: false, data: null }
    }

    let needRetry = false
    for (let api of retryApiList) {
      if (responseConfig.url.indexOf(api) > -1) {
        needRetry = true
        break
      }
    }
    if (!needRetry) {
      return { retry: false, data: null }
    }

    config.retryCount = config.retryCount || 0
    if (config.retryCount >= RETRY_MAX) {
      return { retry: false, data: null }
    }

    let { method, data, url } = responseConfig
    if (['get', 'delete'].includes(method)) {
      let params = getQuery(url)
      params.requestId = requestId
      data = { params }
      url = url.split('?')[0]
    } else {
      data.requestId = requestId
    }

    config.retryCount += 1
    const res = await http(method, url, data, { ...responseConfig, ...config })
    return { retry: true, data: res }
  } catch (e) {
    return { retry: false, data: null }
  }
}

function getQuery (url) {
  const index = url.indexOf('?')
  const obj = {}
  if (index === -1) return obj
  const queryStr = url.slice(index + 1)
  const arr = queryStr.split('&')
  for (let item of arr) {
    const keyValue = item.split('=')
    obj[keyValue[0]] = decodeURIComponent(keyValue[1])
  }
  return obj
}
//#endregion

// config: { showLoading: true, hideErrorMsg: true, hide500ErrorMsg: true, notRecordRequestTimestamp: true, cancel401Redirect: false }
function http (type, url, data, config = {}) {
  // 类型、路径、参数、loading对象
  if (typeof config !== 'object') {
    config = {}
  }
  if (config.showLoading) {
    loadingInstance = Loading.service();
  }
  let requestInstance
  if (type === "post") {
    requestInstance = myAxios.post(url, data);
  } else if (type === "get") {
    requestInstance = myAxios.get(url, data);
  } else if (type === "patch") {
    requestInstance = myAxios.patch(url, data);
  } else if (type === "delete") {
    requestInstance = myAxios.delete(url, data);
  } else if (type === "put") {
    requestInstance = myAxios.put(url, data);
  } else if (type === "form") {
    myAxios.defaults.headers.post["Content-Type"] = "multipart/form-data";
    requestInstance = myAxios.post(url, data);
  }
  if (!requestInstance) return Promise.reject('请求方法未支持')
  return requestInstance.then(async response => {
    if (!config.notRecordRequestTimestamp) {
      //用于记录token刷新时间，条件可过滤某些非用户发起的自动操作
      localStorage.setItem('requestTimestamp', Date.now())
    }
    const { retry, data } = await retryApi(+response.data.code, response.config, response.data.data, config)
    if (!retry) {
      loadingInstance && loadingInstance.close();
      if (!config.hideErrorMsg && +response.data.code !== 0 && whiteList.indexOf(+response.data.code) < 0) {
        Message.error(response.data.message);
      }
      if (+response.data.code == 50102277) {
        Message.error('当前应用不是最新版本，请刷新页面后重试')
      }
      return Promise.resolve(response.data);
    } else {
      return Promise.resolve(data);
    }
  }).catch(error => {
    loadingInstance && loadingInstance.close();
    if (error.response && error.response.status * 1 === 401) {
      const customStatus = error.response.headers['x-status-code']
      if (customStatus && +customStatus == 403) return
      if (config.cancel401Redirect) return
      const direction = judgeDirection()
      if (direction) {
        window.location.replace(`${safeCenterPrefix}/login/${store.getters.isIotTenant ? 'aiot' : store.getters.isEnterpriseTenant ? 'enterprise' :'retail'}?type=true`)
      }
    } else if (!config.hideErrorMsg && (!config.hide500ErrorMsg || [500, 504].indexOf(+error.response.status) === -1)) {
      Message.error('获取数据失败');
      // 添加获取数据失败情况的埋点，方便后续分析
      Vue.prototype.sendClickMessage({ lc: '9_1_1162' })
    }
    return Promise.reject(error);
  })
}

export default http;

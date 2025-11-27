import Vue from 'vue'
import App from './App.vue'
import '@hui/lib/hui.css'
import Hui from '@hui/lib/hui.esm-browser.js'

// 引入我们刚开发的组件库
import AIComponentLib from './index.js'
import axios from 'axios' // 模拟父项目的 axios

Vue.use(Hui)

// 模拟父项目的 HTTP 配置
const myAxios = axios.create({
  baseURL: '/api'
});

// 注册组件库
Vue.use(AIComponentLib, {
  // 1. 注入 HTTP 能力
  http: (method, url, data) => myAxios({ method, url, data }),
  
  // 2. 注入配置提供者
  configProvider: () => ({
    baseUrl: '/api', // 父项目 API 地址
    headers: {
      'Token': 'mock-token-from-parent'
    }
  })
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

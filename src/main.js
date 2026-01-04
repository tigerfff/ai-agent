import Vue from 'vue'
import App from './App.vue'
import '@/style/vars.scss'
import '@/assets/reset.css'
import 'hui/lib/hui.css'


import '@/style/message-box.scss'
import '@/style/select.scss'
import '../public/hik-cloud-ui/packages/theme-chalk/index.css'
import '../public/hik-cloud-ui/packages/theme-chalk/organization.css'
import Hui from 'hui/lib/hui.esm-browser.js'
import HikCloudOrganizer from '../public/org.js'
// 引入我们刚开发的组件库
import AIComponentLib from './index.js'
// 简化版 http 封装，用来在本项目里模拟父项目的 this.$http / this.$aiClient 行为
import http from './demo/httpStub'
// 从 URL 参数同步 token 到 cookie
import { syncTokenFromUrl } from './utils'

// 在应用启动前，从 URL 参数中读取 token 并写入 cookie
syncTokenFromUrl('token', 'accessToken', {
  expires: 30, // 30 天过期
  path: '/'
});

Vue.use(Hui)

Vue.prototype.applicationSceneName = '门店'

// 全局注册 HikCloudOrganizer 组件
Vue.component(HikCloudOrganizer.name, HikCloudOrganizer)

// 注册组件库
Vue.use(AIComponentLib, {
  // 1. 注入 HTTP 能力
  // AIClient 会调用 httpAdapter(method, url, data)
  // 这里用 httpStub 来模拟父项目里的 http(type, url, data)
  http: (method, url, data) => {
    // 与 aiModal/index.js 保持一致：方法名统一用小写
    const type = (method || 'post').toLowerCase()
    return http(type, url, data)
  },
  
  // 2. 注入配置提供者
  configProvider: () => ({
    baseUrl: '/api', // 父项目 API 地址（默认）
    headers: {},
    // 标准化前缀映射，父项目按需覆盖
    prefixMap: {
      chain: '/api',
      qylite: '',
      nissan: '',
      hbl: '',
      open: '',
      tenant: '',
      auth: '',
      sse: '',
      teach: ''
    }
  })
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

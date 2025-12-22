import Vue from 'vue'
import App from './App.vue'
import '@/style/vars.scss'
import '@/assets/reset.css'
import '@hui/lib/hui.css'
import '@/style/message-box.scss'
import '@/style/select.scss'
import Hui from '@hui/lib/hui.esm-browser.js'

// 引入我们刚开发的组件库
import AIComponentLib, { STSProvider, OssUploader } from './index.js'
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

// ============================================
// STSProvider 使用示例（方式二：全局配置）
// ============================================
// 
// 方式二已经在 Vue.use(AIComponentLib) 时自动配置完成
// STSProvider.config() 已在组件库的 install 方法中调用
// 
// 现在可以在任何地方直接使用，无需再次配置：

// 示例1：直接创建实例获取 STS 凭证
window.demoGetSTSCredentials = async function() {
  try {
    console.log('=== 开始获取 STS 凭证 ===')
    
    const stsProvider = new STSProvider()
    const credentials = await stsProvider.getCredentials({
      bizCode: '70201' // AI 业务的 bizCode
    })
    
    console.log('✅ STS 凭证获取成功：', credentials)
    return credentials
  } catch (error) {
    console.error('❌ STS 凭证获取失败：', error)
    throw error
  }
}

// 示例2：配合 OssUploader 使用
window.demoCreateOssUploader = function(bizCode = '70201') {
  try {
    console.log('=== 创建 OSS 上传器 ===')
    console.log('业务编码：', bizCode)
    
    const stsProvider = new STSProvider()
    const uploader = new OssUploader({
      tokenProvider: () => stsProvider.getCredentials({ bizCode })
    })
    
    console.log('✅ OSS 上传器创建成功')
    return uploader
  } catch (error) {
    console.error('❌ OSS 上传器创建失败：', error)
    throw error
  }
}

// 示例3：模拟文件上传流程
window.demoUploadFile = async function(file, bizCode = '70201') {
  if (!file) {
    console.warn('请提供要上传的文件')
    return
  }
  
  try {
    console.log('=== 开始上传文件 ===')
    console.log('文件名：', file.name)
    console.log('文件大小：', (file.size / 1024).toFixed(2) + ' KB')
    console.log('业务编码：', bizCode)
    
    const uploader = window.demoCreateOssUploader(bizCode)
    
    const result = await uploader.upload(file, (percent) => {
      console.log(`上传进度：${Math.round(percent * 100)}%`)
    })
    
    console.log('✅ 文件上传成功：', result)
    return result
  } catch (error) {
    console.error('❌ 文件上传失败：', error)
    throw error
  }
}

// 打印使用提示
console.log(`
%c🎉 STSProvider 已全局配置完成！

📖 使用方式（在浏览器控制台调用）：

1️⃣ 获取 STS 凭证：
   await demoGetSTSCredentials()

2️⃣ 创建 OSS 上传器：
   const uploader = demoCreateOssUploader('70201')

3️⃣ 上传文件（需要先选择文件）：
   const input = document.createElement('input')
   input.type = 'file'
   input.onchange = (e) => {
     const file = e.target.files[0]
     demoUploadFile(file, '70201')
   }
   input.click()

📝 业务编码（bizCode）示例：
   - 10101: 考勤签到
   - 10201: 用户头像
   - 10502: 人脸库图片-会员
   - 70201: AI 业务
   - 更多见：docs/sts.md

`, 'color: #42b983; font-size: 14px; font-weight: bold;')

new Vue({
  render: h => h(App),
}).$mount('#app')

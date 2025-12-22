# OSS STS 快速开始

## 🎯 方案概览

我们采用 **方式二：全局配置一次，到处使用** 的方案。

### 方案特点

✅ **bizCode 不封装**：由使用方根据业务场景传入，保持灵活性  
✅ **全局配置**：在 `Vue.use()` 时自动配置，无需重复初始化  
✅ **简单易用**：创建实例即可使用，无需关心加解密细节  
✅ **自动缓存**：公钥信息自动缓存，减少网络请求  

---

## 📦 文件结构

```
src/
├── utils/
│   ├── sts-provider.js       # STS 凭证提供者（新增）
│   └── oss-uploader.js        # OSS 上传器（已有）
├── index.js                   # 组件库入口（已修改）
└── main.js                    # 应用入口（已修改，包含示例）

docs/
├── sts.md                     # STS 接口文档（已有）
├── STS_USAGE.md              # 使用指南（新增）
└── STS_QUICKSTART.md         # 快速开始（本文档）
```

---

## 🚀 使用流程

### 步骤1：配置组件库（自动完成）

在 `main.js` 中配置组件库时，`STSProvider` 会自动配置：

```javascript
import Vue from 'vue'
import AIComponentLib from './index.js'
import http from './demo/httpStub'

Vue.use(AIComponentLib, {
  http: (method, url, data) => {
    return http(method.toLowerCase(), url, data)
  },
  configProvider: () => ({
    baseUrl: '/api',
    // ... 其他配置
  })
})

// ✅ STSProvider 已自动配置完成！
```

### 步骤2：创建实例并获取凭证

在任何地方都可以直接使用：

```javascript
import { STSProvider } from 'hik-cloud-agentX'

// 创建实例（使用全局配置）
const stsProvider = new STSProvider()

// 获取 STS 凭证
const credentials = await stsProvider.getCredentials({
  bizCode: '70201'  // 根据业务场景传入
})
```

### 步骤3：配合 OssUploader 上传文件

```javascript
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

// 创建上传器
const stsProvider = new STSProvider()
const uploader = new OssUploader({
  tokenProvider: () => stsProvider.getCredentials({ 
    bizCode: '70201' 
  })
})

// 上传文件
const result = await uploader.upload(file, (percent) => {
  console.log(`上传进度：${percent * 100}%`)
})

console.log('文件地址：', result.url)
```

---

## 💡 完整示例

### 场景1：上传用户头像

```vue
<template>
  <div>
    <input type="file" accept="image/*" @change="uploadAvatar" />
  </div>
</template>

<script>
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

export default {
  data() {
    return {
      uploader: null
    }
  },
  
  created() {
    const stsProvider = new STSProvider()
    this.uploader = new OssUploader({
      tokenProvider: () => stsProvider.getCredentials({ 
        bizCode: '10201' // 用户头像业务
      })
    })
  },
  
  methods: {
    async uploadAvatar(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        const result = await this.uploader.upload(file)
        console.log('头像上传成功：', result.url)
        // 更新用户头像 URL...
      } catch (error) {
        console.error('头像上传失败：', error)
      }
    }
  }
}
</script>
```

### 场景2：批量上传图片

```javascript
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

async function batchUpload(files, bizCode) {
  const stsProvider = new STSProvider()
  const uploader = new OssUploader({
    tokenProvider: () => stsProvider.getCredentials({ bizCode })
  })
  
  const results = await Promise.all(
    files.map(file => uploader.upload(file))
  )
  
  return results.map(r => r.url)
}

// 使用
const imageUrls = await batchUpload(files, '11102') // 考评场景封面图
```

### 场景3：不同业务使用不同凭证

```javascript
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

export default {
  data() {
    return {
      avatarUploader: null,   // 用户头像上传器
      faceUploader: null,     // 人脸库上传器
    }
  },
  
  created() {
    const stsProvider = new STSProvider()
    
    // 用户头像上传器
    this.avatarUploader = new OssUploader({
      tokenProvider: () => stsProvider.getCredentials({ 
        bizCode: '10201' 
      })
    })
    
    // 人脸库上传器
    this.faceUploader = new OssUploader({
      tokenProvider: () => stsProvider.getCredentials({ 
        bizCode: '10502' 
      })
    })
  },
  
  methods: {
    async uploadAvatar(file) {
      return await this.avatarUploader.upload(file)
    },
    
    async uploadFace(file) {
      return await this.faceUploader.upload(file)
    }
  }
}
```

---

## 🔍 开发调试

在开发环境中，可以在浏览器控制台直接测试：

```javascript
// 1. 获取 STS 凭证
await demoGetSTSCredentials()

// 2. 创建上传器（指定业务）
const uploader = demoCreateOssUploader('70201')

// 3. 测试上传文件
const input = document.createElement('input')
input.type = 'file'
input.onchange = async (e) => {
  const file = e.target.files[0]
  await demoUploadFile(file, '70201')
}
input.click()
```

启动项目后，控制台会显示可用的调试方法：

```
🎉 STSProvider 已全局配置完成！

📖 使用方式（在浏览器控制台调用）：
   1️⃣ await demoGetSTSCredentials()
   2️⃣ demoCreateOssUploader('70201')
   3️⃣ demoUploadFile(file, '70201')
```

---

## 📋 常用 bizCode 参考

| bizCode | 业务功能 | 使用场景 |
|---------|----------|----------|
| `10101` | 考勤签到 | 考勤签到记录 |
| `10201` | 用户头像 | 用户个人中心头像上传 |
| `10204` | 通知公告附件 | 通知公告附件上传 |
| `10502` | 人脸库图片-会员 | 会员人脸识别图片 |
| `10503` | 人脸库图片-员工 | 员工人脸识别图片 |
| `11102` | 考评场景封面图 | 考评标准封面图上传 |
| `70201` | AI 业务 | AI 相关资源上传 |

> 💡 完整列表请查看：[docs/sts.md](./sts.md)

---

## ⚙️ 核心原理

### 加密流程

```
1. 获取 RSA 公钥（modulus + exponent）
   ↓
2. 生成随机 AES 密钥（32位）和 IV（16位）
   ↓
3. 使用 RSA 加密 AES 密钥和 IV
   ↓
4. 发送加密后的 key、iv 和 bizCode 到后端
   ↓
5. 接收后端返回的加密数据
   ↓
6. 使用 AES 解密加密字段
   ↓
7. 返回完整的 STS 凭证
```

### 解密字段

后端返回的以下字段是加密的，`STSProvider` 会自动解密：

- `accessKeyId` - OSS 访问密钥 ID
- `accessKeySecret` - OSS 访问密钥
- `bucket` - 存储桶名称
- `domain` - 访问域名
- `endpoint` - OSS 端点
- `object` - 对象前缀路径

---

## ❓ 常见问题

### Q: 为什么 bizCode 不封装在组件库里？

**A:** 因为：
1. bizCode 数量多（100+）且持续增加
2. 不同业务场景使用不同的 bizCode
3. 业务方更清楚自己的场景
4. 保持组件库的通用性和可维护性

### Q: 可以在组件库外部单独使用吗？

**A:** 可以！只需手动配置：

```javascript
import { STSProvider } from 'hik-cloud-agentX'

STSProvider.config({
  httpClient: yourHttpClient,
  baseURL: '/api'
})
```

### Q: 凭证会自动刷新吗？

**A:** 会！`OssUploader` 内置了自动刷新机制。当 STS 凭证过期时，会自动调用 `tokenProvider` 重新获取。

### Q: 如何处理上传失败？

**A:** 使用 try-catch 捕获错误：

```javascript
try {
  const result = await uploader.upload(file)
  console.log('上传成功')
} catch (error) {
  if (error.message.includes('token expired')) {
    // 凭证过期，会自动重试
  } else {
    console.error('上传失败：', error.message)
  }
}
```

---

## 📚 相关文档

- [详细使用指南](./STS_USAGE.md) - 完整的 API 文档和示例
- [STS 接口文档](./sts.md) - 后端接口说明和 bizCode 列表
- [集成指南](./INTEGRATION.md) - 组件库集成说明

---

## 🎉 总结

使用 `STSProvider` 获取 OSS STS 凭证非常简单：

```javascript
// 1. 导入
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

// 2. 创建
const stsProvider = new STSProvider()
const uploader = new OssUploader({
  tokenProvider: () => stsProvider.getCredentials({ bizCode: '70201' })
})

// 3. 使用
await uploader.upload(file)
```

**3 行代码，完成 OSS 文件上传！** 🚀


# OSS STS 凭证获取使用指南

## 概述

`STSProvider` 是一个用于获取阿里云 OSS 临时访问凭证（STS）的工具类。它封装了完整的 STS 获取流程，包括：

1. 获取公钥质数对
2. 生成随机 AES 密钥和 IV
3. 使用 RSA 加密
4. 调用 STS 接口
5. 解密返回的加密字段

## 特性

- ✅ **全局配置**：在应用初始化时配置一次，全局可用
- ✅ **自动缓存**：公钥信息自动缓存 30 分钟，减少请求次数
- ✅ **加解密封装**：自动处理 RSA 和 AES 加解密
- ✅ **错误处理**：完善的错误捕获和日志输出
- ✅ **类型安全**：清晰的参数说明和返回值

## 安装配置

### 方式一：自动配置（推荐）

在使用组件库时，`STSProvider` 会自动配置：

```javascript
import Vue from 'vue'
import AIComponentLib from 'hik-cloud-agentX'

Vue.use(AIComponentLib, {
  http: (method, url, data) => {
    // 你的 HTTP 客户端
    return httpClient(method, url, data)
  },
  configProvider: () => ({
    baseUrl: '/api',
    // ... 其他配置
  })
})

// STSProvider 已自动配置完成，可直接使用 ✅
```

### 方式二：手动配置

如果需要单独使用 `STSProvider`，可以手动配置：

```javascript
import { STSProvider } from 'hik-cloud-agentX'
import http from './http'

// 全局配置一次
STSProvider.config({
  httpClient: http,
  baseURL: '/api'
})
```

## 使用方式

### 1. 直接获取 STS 凭证

```javascript
import { STSProvider } from 'hik-cloud-agentX'

// 创建实例
const stsProvider = new STSProvider()

// 获取凭证
try {
  const credentials = await stsProvider.getCredentials({
    bizCode: '70201' // 必填：业务编码
  })
  
  console.log('STS 凭证：', credentials)
  // {
  //   accessKeyId: 'LTAI...',
  //   accessKeySecret: 'xxx',
  //   securityToken: 'CAI...',
  //   bucket: 'my-bucket',
  //   endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  //   domain: 'https://my-bucket.oss-cn-hangzhou.aliyuncs.com',
  //   object: 'ai/uploads/',
  //   expiration: '2025-12-22T12:00:00Z',
  //   expireTime: 1734868800000,
  //   ...
  // }
} catch (error) {
  console.error('获取 STS 凭证失败：', error)
}
```

### 2. 配合 OssUploader 使用（推荐）

```javascript
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

// 创建 STS 提供者
const stsProvider = new STSProvider()

// 创建 OSS 上传器
const uploader = new OssUploader({
  tokenProvider: () => stsProvider.getCredentials({ 
    bizCode: '70201' 
  })
})

// 上传文件
async function uploadFile(file) {
  try {
    const result = await uploader.upload(file, (percent) => {
      console.log(`上传进度：${Math.round(percent * 100)}%`)
    })
    
    console.log('上传成功：', result.url)
  } catch (error) {
    console.error('上传失败：', error)
  }
}
```

### 3. 在 Vue 组件中使用

```vue
<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <div v-if="uploading">上传中... {{ progress }}%</div>
    <div v-if="uploadedUrl">
      <img :src="uploadedUrl" alt="已上传" />
    </div>
  </div>
</template>

<script>
import { STSProvider, OssUploader } from 'hik-cloud-agentX'

export default {
  data() {
    return {
      uploader: null,
      uploading: false,
      progress: 0,
      uploadedUrl: ''
    }
  },
  
  created() {
    // 初始化上传器
    const stsProvider = new STSProvider()
    this.uploader = new OssUploader({
      tokenProvider: () => stsProvider.getCredentials({ 
        bizCode: '10201' // 用户头像业务
      })
    })
  },
  
  methods: {
    async handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.uploading = true
      this.progress = 0
      
      try {
        const result = await this.uploader.upload(file, (percent) => {
          this.progress = Math.round(percent * 100)
        })
        
        this.uploadedUrl = result.url
        this.$message.success('上传成功')
      } catch (error) {
        this.$message.error('上传失败：' + error.message)
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>
```

## bizCode 业务编码

`bizCode` 是业务相关的必填参数，不同业务场景使用不同的编码。

### 常用 bizCode 列表

| bizCode | 业务功能 | 业务线 |
|---------|----------|--------|
| 10101 | 考勤签到 | 连锁 |
| 10201 | 用户头像 | 连锁 |
| 10502 | 人脸库图片-会员 | 连锁 |
| 10503 | 人脸库图片-员工 | 连锁 |
| 11102 | 考评场景封面图 | 连锁 |
| 70201 | AI 业务 | AI |

> 💡 更多 bizCode 请参考：[docs/sts.md](./sts.md)

### 如何选择 bizCode？

根据你的业务场景选择对应的 `bizCode`：

```javascript
// 场景1：上传用户头像
const credentials = await stsProvider.getCredentials({ 
  bizCode: '10201' 
})

// 场景2：上传 AI 相关资源
const credentials = await stsProvider.getCredentials({ 
  bizCode: '70201' 
})

// 场景3：上传人脸库图片
const credentials = await stsProvider.getCredentials({ 
  bizCode: '10502' 
})
```

## API 参考

### STSProvider.config(options)

全局配置 `STSProvider`（静态方法）

**参数：**
- `options.httpClient` (Function): HTTP 客户端函数
- `options.baseURL` (String): API 基础路径，默认为 `''`

**示例：**
```javascript
STSProvider.config({
  httpClient: (method, url, data) => axios({ method, url, data }),
  baseURL: '/api'
})
```

### new STSProvider(options)

创建 `STSProvider` 实例

**参数：**
- `options.httpClient` (Function): HTTP 客户端函数（可选，使用全局配置）
- `options.baseURL` (String): API 基础路径（可选，使用全局配置）

**示例：**
```javascript
// 使用全局配置
const provider = new STSProvider()

// 或覆盖配置
const provider = new STSProvider({
  httpClient: customHttp,
  baseURL: '/custom-api'
})
```

### provider.getCredentials(params)

获取 STS 凭证（异步方法）

**参数：**
- `params.bizCode` (String): 业务编码，**必填**

**返回值：**
```typescript
Promise<{
  accessKeyId: string         // OSS 访问密钥 ID
  accessKeySecret: string     // OSS 访问密钥
  securityToken: string       // 安全令牌
  bucket: string              // 存储桶名称
  endpoint: string            // OSS 端点
  domain: string              // 访问域名
  object: string              // 对象前缀
  expiration: string          // 过期时间（ISO 格式）
  expireTime: number          // 过期时间（时间戳）
  cname: number               // 是否使用 CNAME
  region?: string             // 区域
  type: string                // 类型
  kmsDataKey?: Object         // KMS 数据密钥（如果有）
}>
```

**示例：**
```javascript
const credentials = await provider.getCredentials({ 
  bizCode: '70201' 
})
```

### provider.clearCache()

清除缓存的公钥信息

**示例：**
```javascript
provider.clearCache()
```

## 高级用法

### 自定义缓存时间

```javascript
const provider = new STSProvider()

// 修改缓存过期时间（默认 30 分钟）
provider.cache.cacheExpire = 60 * 60 * 1000 // 改为 60 分钟
```

### 多实例使用

```javascript
// 不同业务使用不同的实例
const avatarProvider = new STSProvider()
const faceProvider = new STSProvider()

// 用户头像上传
const avatarUploader = new OssUploader({
  tokenProvider: () => avatarProvider.getCredentials({ 
    bizCode: '10201' 
  })
})

// 人脸库上传
const faceUploader = new OssUploader({
  tokenProvider: () => faceProvider.getCredentials({ 
    bizCode: '10502' 
  })
})
```

### 错误处理

```javascript
try {
  const credentials = await provider.getCredentials({ 
    bizCode: '70201' 
  })
} catch (error) {
  if (error.message.includes('bizCode is required')) {
    console.error('缺少业务编码')
  } else if (error.message.includes('httpClient is not configured')) {
    console.error('HTTP 客户端未配置')
  } else {
    console.error('获取凭证失败：', error)
  }
}
```

## 开发调试

在开发环境中，可以使用浏览器控制台快速测试：

```javascript
// 1. 获取 STS 凭证
await demoGetSTSCredentials()

// 2. 创建上传器
const uploader = demoCreateOssUploader('70201')

// 3. 上传文件
const input = document.createElement('input')
input.type = 'file'
input.onchange = async (e) => {
  const file = e.target.files[0]
  await demoUploadFile(file, '70201')
}
input.click()
```

## 常见问题

### Q1: 为什么要传 bizCode？

A: `bizCode` 是业务编码，用于标识不同的业务场景。后端根据 `bizCode` 返回对应的 OSS 配置（如存储桶、目录前缀等）。

### Q2: 可以把 bizCode 封装在组件库里吗？

A: 不建议。因为：
- bizCode 数量多且会持续增加
- 不同业务场景使用不同的 bizCode
- 保持组件库的通用性和灵活性

### Q3: 公钥会缓存多久？

A: 默认缓存 30 分钟。可以通过 `provider.cache.cacheExpire` 自定义。

### Q4: 如何处理 STS 凭证过期？

A: `OssUploader` 已内置自动刷新机制。当凭证过期时，会自动调用 `tokenProvider` 重新获取。

### Q5: 支持哪些加密算法？

A: 
- RSA 加密：用于加密 AES 密钥和 IV
- AES-256-CBC：用于解密后端返回的加密字段

## 更新日志

### v1.0.0 (2025-12-22)
- ✨ 新增 `STSProvider` 工具类
- ✨ 支持全局配置
- ✨ 自动缓存公钥信息
- ✨ 完整的加解密流程封装

## 相关文档

- [STS 接口文档](./sts.md)
- [OssUploader 使用指南](./INTEGRATION.md)
- [组件库集成指南](./INTEGRATION_GUIDE.md)


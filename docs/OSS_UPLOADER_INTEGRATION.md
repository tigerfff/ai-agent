## AIOssUploader & STSProvider 集成指南

本文档说明如何在其他项目 / 组件库中集成当前实现的 **STS + OSS 上传封装**，包括：

- 对外暴露的文件与依赖
- 在新组件库的 `index.js` 中如何配置
- 在父项目中如何初始化与使用

---

## 一、对外暴露的核心文件

在当前项目中，对外暴露（可迁移到其他组件库 / 项目）的核心文件有两个：

- `src/utils/sts-provider.js`
  - 负责：
    - 调用后端接口获取 STS 凭证
    - 使用 RSA 对随机密钥 & IV 加密
    - 使用 SM4 对后端返回的敏感字段解密
    - 提供按 `bizCode` 维度的凭证缓存（带过期时间 & 并发锁）
  - 对外暴露：`STSProvider` 类

- `src/utils/ai-oss-uploader.js`
  - 负责：
    - 通过 `STSProvider` 获取/复用 STS 凭证
    - 根据 `encryptEnable` / `kmsDataKey.sm4Supported` 选择是否进行 **SM4 文件加密**
    - 调用 `ali-oss` SDK 上传文件到 OSS，并设置必要的加密元数据（`encrypted-version` 等）
    - 封装单文件、多文件上传与进度回调
  - 对外暴露：`AIOssUploader` 类

> 这两个文件内部都依赖 `src/utils/crypto.common.js` 中的 SM4 实现，因此迁移时必须一并迁移。

---

## 二、依赖说明

在新组件库 / 项目中，需要在 `package.json` 中确保安装以下依赖：

```json
{
  "dependencies": {
    "ali-oss": "^6.23.0",
    "crypto-js": "^4.2.0",
    "jsrsasign": "10.8.6"
  }
}
```

对应用途：

- **ali-oss**：阿里云 OSS 浏览器 SDK，用于执行 `put` 上传。
- **crypto-js**：用于处理 Hex / Base64 / Utf8 编解码等（STS 字段的 SM4 解密）。
- **jsrsasign**：用于 RSA 公钥加密（`modulus + exponent` -> 公钥 -> 加密随机密钥/IV）。

> 此外，还需要将当前项目中的 `src/utils/crypto.common.js` 一并迁移，它内部封装了 `sm4` 算法实现。

---

## 三、`STSProvider` 使用说明

### 1. 全局配置

`STSProvider` 需要一个 **HTTP 客户端** 和一个 **baseURL** 来访问后端接口：

```javascript
import { STSProvider } from './utils/sts-provider'

STSProvider.config({
  httpClient: (method, url, data) => {
    // 建议由父项目传入一个封装好的 http 函数
    return axiosInstance.request({
      method,
      url,
      data: method.toLowerCase() === 'get' ? undefined : data,
      params: method.toLowerCase() === 'get' ? data : undefined
    }).then(res => res.data)  // 需要返回后端的 data 对象
  },
  baseURL: '/api'  // 例如：由父项目控制
})
```

`httpClient` 要求：

- 形参：`(method, url, data)`
- 返回：`Promise<response>`，其中 `response` 需要至少包含：
  - `success`（布尔）
  - `data`（对象，包含 STS 字段）
  - `message`（可选，错误文案）

### 2. 获取 STS 凭证

```javascript
const provider = new STSProvider()
const credentials = await provider.getCredentials({ bizCode: '70201' })
```

内部行为：

- 按 `bizCode` 查找缓存：
  - 若缓存存在且未过期（提前 60 秒失效），直接返回缓存；
  - 否则发起新请求。
- 请求过程：
  - 先调用 `/v1/ossManager/ossManager/actions/getModulusExponent` 获取公钥对；
  - 生成随机 SM4 key/IV，并用 RSA 公钥加密；
  - 带上加密后的 key/IV 调用 `/v1/ossManager/ossManager/actions/getOssCredential`；
  - 使用 SM4 解密返回字段（`accessKeyId`、`accessKeySecret`、`bucket`、`endpoint`、`object` 等）。

> 接口路径如果在新项目中不同，需修改 `sts-provider.js` 内的 URL。

---

## 四、`AIOssUploader` 使用说明

### 1. 全局配置

`AIOssUploader` 复用 `STSProvider` 的配置，提供一个静态 `config` 方法：

```javascript
import { AIOssUploader } from './utils/ai-oss-uploader'

AIOssUploader.config({
  httpClient: yourHttpClient,  // 与 STSProvider 一致
  baseURL: '/api'
})
```

> 一般推荐只调用一次（在组件库 install / 父项目初始化时）。

### 2. 上传单个文件

```javascript
const uploader = new AIOssUploader()

const result = await uploader.upload(file, '70201', {
  fileName: 'custom-name.png',              // 可选：自定义文件名
  onProgress: (percent) => {                // 可选：上传进度 0-100
    console.log('进度:', percent, '%')
  }
})

console.log('OSS URL:', result.url)
```

内部流程：

1. 调用 `STSProvider.getCredentials({ bizCode })` 获取/复用凭证（带缓存）。
2. 若 `encryptEnable === true` 且 `kmsDataKey.sm4Supported === true`：
   - 使用 SM4-CBC 对文件字节流加密（`kmsDataKey.dataKey` -> Hex -> key/iv）。
   - 使用加密后的 Blob 作为上传内容。
   - OSS `meta` 中附带：
     - `encrypted-version`
     - `encrypted-data-key`
     - `sm4-supported`
3. 使用 `ali-oss` 客户端执行 `put(objectKey, file, { meta, progress })`。
4. 返回带有 `fileName` 和可用 `url` 的结果对象。

### 3. 上传多个文件

```javascript
const results = await uploader.uploadMultiple(files, '70201', {
  onItemProgress: (index, percent) => {
    console.log(`文件 ${index} 进度: ${percent}%`)
  }
})

// results 为 Promise.allSettled 的结果数组
```

---

## 五、在新组件库的 `index.js` 中如何配置

假设你要把这套能力迁移到另一个 Vue 组件库中，可以参考下面的 `index.js` 模板。

### 模板：Vue 组件库集成

```javascript
// 工具类
import { STSProvider } from './utils/sts-provider'
import { AIOssUploader } from './utils/ai-oss-uploader'

// 你的业务组件...
// import YourComponent from './components/YourComponent.vue'

const install = (Vue, options = {}) => {
  // 1. 注册组件
  // Vue.component('YourComponent', YourComponent)

  // 2. 从 options 中拿到 httpClient 和 baseURL
  const httpClient = options.httpClient || options.http
  const baseURL = options.baseURL || options.baseUrl || '/api'

  if (httpClient) {
    // 配置 STSProvider
    STSProvider.config({
      httpClient,
      baseURL
    })

    // 配置 AIOssUploader
    AIOssUploader.config({
      httpClient,
      baseURL
    })
  }

  // 3. 可选：挂到 Vue.prototype，方便在组件里直接使用
  Vue.prototype.$stsProvider = STSProvider
  Vue.prototype.$AIOssUploader = AIOssUploader
}

export {
  STSProvider,
  AIOssUploader
}

export default {
  install
}
```

> 父项目在 `Vue.use(YourLib, { ... })` 时，需要传入 `httpClient` / `baseURL`。

---

## 六、父项目如何配置 & 使用

### 1. Vue 项目中的使用示例

```javascript
import Vue from 'vue'
import YourLib from 'your-lib'
import axios from 'axios'

const axiosInstance = axios.create({
  withCredentials: true,
  timeout: 30000
})

Vue.use(YourLib, {
  httpClient: (method, url, data) => {
    const m = (method || 'post').toLowerCase()
    if (m === 'get') {
      return axiosInstance.request({ method: m, url, params: data }).then(res => res.data)
    }
    return axiosInstance.request({ method: m, url, data }).then(res => res.data)
  },
  baseURL: '/api'
})
```

在任意组件中：

```javascript
export default {
  methods: {
    async uploadAvatar(file) {
      const uploader = new this.$AIOssUploader()
      const res = await uploader.upload(file, '70201', {
        onProgress: (p) => {
          console.log('上传进度:', p, '%')
        }
      })
      console.log('上传成功:', res.url)
    }
  }
}
```

### 2. 纯工具库集成（不依赖 Vue）

如果新库不是 Vue 组件库，而是纯工具库，可以提供一个初始化函数：

```javascript
// your-lib/index.js
import { STSProvider } from './utils/sts-provider'
import { AIOssUploader } from './utils/ai-oss-uploader'

export function initOssUploader(options = {}) {
  const { httpClient, baseURL = '/api' } = options

  if (!httpClient) {
    console.warn('initOssUploader: httpClient is required')
    return
  }

  STSProvider.config({ httpClient, baseURL })
  AIOssUploader.config({ httpClient, baseURL })
}

export {
  STSProvider,
  AIOssUploader
}
```

父项目使用：

```javascript
import { initOssUploader, AIOssUploader } from 'your-lib'

initOssUploader({
  httpClient: yourHttpClient,
  baseURL: '/api'
})

const uploader = new AIOssUploader()
await uploader.upload(file, '70201')
```

---

## 七、迁移清单总结

当你要把这套能力迁移到另一个组件库 / 项目时，至少需要：

1. **复制文件**
   - `utils/sts-provider.js`
   - `utils/ai-oss-uploader.js`
   - `utils/crypto.common.js`（SM4 实现）

2. **安装依赖**
   - `ali-oss`
   - `crypto-js`
   - `jsrsasign`

3. **在新库的入口 (`index.js`) 中：**
   - 导入并导出 `STSProvider`、`AIOssUploader`
   - 提供统一的配置入口（`install` 或 `initOssUploader`），接收：
     - `httpClient`：HTTP 调用能力
     - `baseURL`：后端 API 前缀

4. **在父项目中：**
   - 初始化时配置好 `httpClient` 和 `baseURL`
   - 业务代码中只需要：
     - `new AIOssUploader()`
     - 调用 `upload(file, bizCode, options)`

这样，父项目就可以在几乎零感知 STS 细节的情况下，直接使用“STS + SM4 + OSS 上传”的完整封装。 



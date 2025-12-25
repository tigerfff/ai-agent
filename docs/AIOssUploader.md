# AIOssUploader 使用说明

`AIOssUploader` 是一个基于阿里云 OSS SDK 封装的上传工具类，支持分片上传、断点续传、文件加密（SM4）、进度回调、暂停/中止控制以及多文件批量上传。

## 1. 基础配置

在使用上传功能前，需要进行全局配置（通常在应用入口处执行一次）。

```javascript

import { STSProvider } from '@/utils/ai-oss-uploader';
STSProvider.config({
  // 你自己的http
  http,
  // STS 获取凭证的接口地址等配置
  baseUrl: '/api/v1/sts/credentials', 
  // ... 其他配置项
});
```

---

## 2. 单文件上传（简单调用）

支持传入 `File`、`Blob` 或 `Base64` 字符串。

```javascript
const uploader = new AIOssUploader();

try {
  const result = await uploader.upload(file, '70201');
  console.log('上传成功，访问地址：', result.url);
} catch (error) {
  console.error('上传失败', error);
}
```

---

## 3. 多文件批量上传

```javascript
const uploader = new AIOssUploader();
const files = [file1, file2];

const results = await uploader.uploadMultiple(files, 'bizCode_70201', {
  onItemProgress: (index, percent, checkpoint) => {
    console.log(`文件 ${index} 进度: ${percent}%`);
  }
});

results.forEach((res, idx) => {
  if (res.status === 'fulfilled') {
    console.log(`文件 ${idx} 上传成功:`, res.value.url);
  } else {
    console.error(`文件 ${idx} 上传失败:`, res.reason);
  }
});
```

---

## 4. 停止与暂停（控制句柄）

### 4.1 暂停 (Pause)

**作用**：仅取消当前网络请求，**保留** OSS 服务器上已上传的分片。适用于“断点续传”。

### 4.2 中止 (Abort)

**作用**：取消网络请求并**删除** OSS 服务器上的所有分片。任务彻底销毁。

```javascript
let pauseHandle = null;
let abortHandle = null;

const result = await uploader.upload(file, 'bizCode', {
  // 获取暂停句柄
  onPauseHandler: (pauseFn) => { pauseHandle = pauseFn; },
  // 获取中止句柄
  onAbortHandler: (abortFn) => { abortHandle = abortFn; }
});

// 执行暂停
if (pauseHandle) pauseHandle();

// 执行中止
if (abortHandle) await abortHandle();
```

---

## 5. 断点续传 (Resumable Upload)

断点续传需要配合 `checkpoint` 使用。

### 5.1 单文件断点续传

```javascript
let savedCheckpoint = null;

// 1. 开始上传并监听进度保存 checkpoint
await uploader.upload(file, 'bizCode', {
  onProgress: (percent, checkpoint) => {
    savedCheckpoint = checkpoint; // 将此对象保存到本地（如 localStorage）
  },
  onPauseHandler: (pauseFn) => { 
    // 模拟暂停逻辑
    setTimeout(() => pauseFn(), 2000); 
  }
});

// 2. 恢复上传
const result = await uploader.upload(file, 'bizCode', {
  checkpoint: savedCheckpoint, // 传入之前保存的 checkpoint
  onProgress: (percent, checkpoint) => {
    console.log('恢复上传进度:', percent);
  }
});
```

### 5.2 多文件断点续传

多文件模式下，通过 `onItemPauseTask` 和 `onItemAbortTask` 获取每个文件的独立控制句柄。

```javascript
const pauseMap = new Map();

await uploader.uploadMultiple(files, 'bizCode', {
  onItemProgress: (index, percent, checkpoint) => {
    // 建议：按 index 或文件唯一标识保存 checkpoint 到本地
    saveToLocal(files[index], checkpoint);
  },
  onItemPauseTask: (index, pauseFn) => {
    pauseMap.set(index, pauseFn); // 存储每个文件的暂停函数
  }
});

// 暂停第 0 个文件的上传
const pauseFn0 = pauseMap.get(0);
if (pauseFn0) pauseFn0();
```

---

## 6. API 列表

### 6.1 `upload(file, bizCode, options)`

**参数说明：**

- `file`: `File | Blob | String` (Base64)。
- `bizCode`: `String` 业务编码。
- `options`: `Object` 可选。
  - `fileName`: `String` 自定义文件名。
  - `checkpoint`: `Object` 断点信息。
  - `onProgress`: `(percent, checkpoint) => void` 进度回调。
  - `onPauseHandler`: `(pauseFn) => void` 获取暂停句柄。
  - `onAbortHandler`: `(abortFn) => void` 获取中止句柄。
  - `externalEncrypt`: `(file, stsData) => Promise<{encryptedFile, meta}>` 自定义加密逻辑。

### 6.2 `uploadMultiple(files, bizCode, options)`

**参数说明：**

- `files`: `Array<File | Blob | String>`。
- `bizCode`: `String` 业务编码。
- `options`: `Object` 包含 `upload` 的所有 options，并新增：
  - `onItemProgress`: `(index, percent, checkpoint) => void` 单项进度。
  - `onItemPauseTask`: `(index, pauseFn) => void` 单项暂停句柄。
  - `onItemAbortTask`: `(index, abortFn) => void` 单项中止句柄。

---

## 7. 返回值详解

`upload` 方法返回一个对象，包含以下字段：

| 字段名        | 类型       | 说明                                                                                                |
| :------------ | :--------- | :-------------------------------------------------------------------------------------------------- |
| `url`       | `String` | **最终访问地址**。如果是加密文件，已自动拼接 `accessKey`、`v=1`、`encrypted=1` 等参数。 |
| `originUrl` | `String` | **原始访问地址**。不包含任何 Query 参数的纯净 OSS URL。                                       |
| `fileName`  | `String` | 本次上传生成的唯一文件名（包含时间戳和随机字符）。                                                  |
| `bucket`    | `String` | OSS Bucket 名称。                                                                                   |
| `name`      | `String` | OSS 对象的完整路径（ObjectKey）。                                                                   |
| `etag`      | `String` | 文件的 ETag 标识。                                                                                  |
| `stsData`   | `Object` | 本次上传使用的 STS 信息，包含凭证、域名、以及**`kmsDataKey`**（加密元数据）。               |
| `res`       | `Object` | OSS 原生响应对象，包含 `status`, `headers`, `x-oss-request-id` 等底层信息。                   |

---

## 8. 补充说明

- **Base64 支持**：传入的字符串必须以 `data:...;base64,` 开头。
- **加密说明**：如果后台配置开启了加密，上传前会自动进行 SM4 加密，且通过 API 返回的 URL 会自带鉴权参数。
- **分片大小**：默认分片大小由 `ali-oss` 决定（通常为 1MB），可以通过 `options` 透传 `partSize` 等参数。

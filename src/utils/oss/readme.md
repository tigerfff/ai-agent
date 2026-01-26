# OssUploader 使用说明

`OssUploader` 是一个基于阿里云 OSS SDK 封装的上传工具类，支持分片上传、断点续传、文件加密（SM4）、进度回调、暂停/中止控制以及多文件批量上传。

## 目录

- [前置依赖](#前置依赖)
- [基础配置](#基础配置)
- [单文件上传](#单文件上传)
- [多文件批量上传](#多文件批量上传)
- [停止与暂停控制](#停止与暂停控制)
- [断点续传](#断点续传)
- [API 文档](#api-文档)
- [返回值说明](#返回值说明)
- [完整示例](#完整示例)

## 前置依赖

```bash
npm install jsrsasign@10.8.6 crypto-js@4.2.0 ali-oss@6.23.0 sec-crypto@0.0.3 hik-cloud-obs


# 腾讯云 COS 支持
npm install cos-js-sdk-v5
```

## 基础配置

在使用上传功能前，需要进行全局配置：

```javascript
import { STSProvider, OssUploader } from 'hik-cloud-obs';

// STS 配置
STSProvider.config({
  httpClient: (method, url, data) => {
    const m = method.toLowerCase();
    return http(m, url, data);
  },
  baseURL: '/api/v1/sts/credentials',
});

// 全局实例
Vue.prototype.$ossUploader = new OssUploader();
```

### 单独获取 STS 信息

```javascript
const provider = new STSProvider();
const credentials = await provider.getCredentials({ bizCode: '70201' });
```

## 单文件上传

支持传入 `File`、`Blob` 或 `Base64` 字符串：

```javascript
// 如果没有挂载全局实例则需要单独实例化
const uploader = new OssUploader();

try {
  const result = await uploader.upload(file, '70201'); // 挂载全局实例后，这里就可以写成 await this.$ossUploader.upload(file, '70201'); 
  console.log('上传成功，访问地址：', result.url);
} catch (error) {
  console.error('上传失败', error);
}
```

## 多文件批量上传

```javascript
const uploader = new OssUploader();
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

## 停止与暂停控制

### 暂停 (Pause)

仅取消当前网络请求，**保留** OSS 服务器上已上传的分片。

### 中止 (Abort)

取消网络请求并**删除** OSS 服务器上的所有分片。

```javascript
let pauseHandle = null;
let abortHandle = null;

const result = await uploader.upload(file, 'bizCode', {
  onPauseHandler: (pauseFn) => { pauseHandle = pauseFn; },
  onAbortHandler: (abortFn) => { abortHandle = abortFn; }
});

// 执行暂停
if (pauseHandle) pauseHandle();

// 执行中止
if (abortHandle) await abortHandle();
```

## 断点续传

### 单文件断点续传

```javascript
let savedCheckpoint = null;

// 开始上传并保存 checkpoint
await uploader.upload(file, 'bizCode', {
  onProgress: (percent, checkpoint) => {
    savedCheckpoint = checkpoint; // 保存到本地存储
  }
});

// 恢复上传
const result = await uploader.upload(file, 'bizCode', {
  checkpoint: savedCheckpoint,
  onProgress: (percent, checkpoint) => {
    console.log('恢复上传进度:', percent);
  }
});
```

### 多文件断点续传

```javascript
const pauseMap = new Map();

await uploader.uploadMultiple(files, 'bizCode', {
  onItemProgress: (index, percent, checkpoint) => {
    saveToLocal(files[index], checkpoint); // 按文件保存 checkpoint
  },
  onItemPauseTask: (index, pauseFn) => {
    pauseMap.set(index, pauseFn);
  }
});

// 暂停指定文件
const pauseFn0 = pauseMap.get(0);
if (pauseFn0) pauseFn0();
```

### 腾讯云 COS 上传 (CosUploader)

```javascript
import { CosUploader } from 'hik-cloud-obs';

const uploader = new CosUploader();

// 上传文件
const result = await uploader.upload(file, 'bizCode', {
  onProgress: (percent, progressData) => {
    console.log(`上传进度: ${percent}%`);
  }
});
```

### 阿里云 OSS 表单上传 (OssFormUploader)

适用于不需要 SDK、直接通过 POST 提交的场景。需要手动传入后端生成的 `stsData`。

```javascript
import { OssFormUploader } from 'hik-cloud-obs';

const uploader = new OssFormUploader();

// stsData 由后端接口直接返回
const stsData = {
  accessKeyId: "...",
  policy: "...",
  signature: "...",
  endpoint: "https://...",
  object: "path/to/file",
  encryptEnable: true,
  kmsDataKey: { ... }
};

const result = await uploader.upload(file, stsData);
console.log('访问地址:', result.url);
```

## API 文档

### upload(file, bizCode, options)

**参数说明：**

- `file`: File | Blob | String (Base64)
- `bizCode`: String 业务编码
- `options`: Object
  - `fileName`: String 自定义文件名
  - `checkpoint`: Object 断点信息
  - `onProgress`: (percent, checkpoint) => void 进度回调
  - `onPauseHandler`: (pauseFn) => void 暂停句柄
  - `onAbortHandler`: (abortFn) => void 中止句柄
  - `externalEncrypt`: (file, stsData) => Promise<{encryptedFile, meta}> 自定义加密

### uploadMultiple(files, bizCode, options)

**参数说明：**

- `files`: Array<File | Blob | String>
- `bizCode`: String 业务编码
- `options`: 包含 upload 的所有 options，并新增：
  - `onItemProgress`: (index, percent, checkpoint) => void 单项进度
  - `onItemPauseTask`: (index, pauseFn) => void 单项暂停句柄
  - `onItemAbortTask`: (index, abortFn) => void 单项中止句柄

## 返回值说明

| 字段名        | 类型   | 说明                                   |
| ------------- | ------ | -------------------------------------- |
| `url`       | String | **最终访问地址**（包含加密参数） |
| `originUrl` | String | **原始访问地址**（纯净 OSS URL） |
| `fileName`  | String | 生成的唯一文件名                       |
| `bucket`    | String | OSS Bucket 名称                        |
| `name`      | String | OSS 对象的完整路径                     |
| `etag`      | String | 文件的 ETag 标识                       |
| `stsData`   | Object | STS 信息（包含 kmsDataKey）            |
| `res`       | Object | OSS 原生响应对象                       |

## 补充说明

- **Base64 支持**：字符串必须以 `data:...;base64,` 开头
- **加密功能**：后台配置开启加密时自动进行 SM4 加密
- **分片大小**：默认 1MB，可通过 options 透传 `partSize` 参数

## 完整示例

详见提供的 Vue 组件代码，该示例包含：

- 单文件/多文件上传切换
- 进度显示与控制
- 暂停/继续功能
- 断点续传实现
- 结果展示

示例支持的功能：

- 文件选择与预览
- 实时进度监控
- 暂停/继续上传
- 错误处理与状态管理
- localStorage 存储断点信息

如需查看完整的 Vue 组件实现代码，请参考原始文档中的 `<template>` 和 `<script>` 部分。

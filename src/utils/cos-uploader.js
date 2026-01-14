/**
 * COS 上传器
 * 封装了从 STS 获取凭证、文件 SM4 加密以及腾讯云 COS 上传的完整流程。
 * 支持：分片上传、进度回调、上传暂停。
 */

import COS from "cos-js-sdk-v5";
import { STSProvider } from "./sts-provider.js";
import * as secCrypto from "./crypto.common";

// 复用 crypto.common 中的 sm4 实现
const sm4 =
  secCrypto.sm4 ||
  (secCrypto.default && secCrypto.default.sm4) ||
  secCrypto.default ||
  secCrypto;

/**
 * 读取 File 为 ArrayBuffer
 */
async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Base64 转 HEX
 */
function base64toHEX(base64) {
  const raw = window.atob(base64);
  let HEX = "";
  for (let i = 0; i < raw.length; i++) {
    const _hex = raw.charCodeAt(i).toString(16);
    HEX += _hex.length === 2 ? _hex : "0" + _hex;
  }
  return HEX;
}

/**
 * DataURL (Base64) 转 Blob
 */
function dataURLtoBlob(dataurl) {
  if (!dataurl || typeof dataurl !== 'string') {
    throw new Error('dataURLtoBlob: dataurl must be a non-empty string');
  }
  
  const arr = dataurl.split(",");
  if (arr.length < 2) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing comma separator');
  }
  
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing MIME type');
  }
  
  const mime = mimeMatch[1];
  const bstr = window.atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * 使用 SM4 对二进制数据加密
 */
function sm4Encrypt(arrayBuffer, kmsDataKey) {
  const bytes = new Uint8Array(arrayBuffer);
  const hexData = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const hexDataKey = base64toHEX(kmsDataKey.dataKey);

  const encryptedHex = sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
    iv: hexDataKey.slice(32, 64),
    mode: "cbc",
  });

  const result = new Uint8Array(
    encryptedHex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
  );

  return result;
}

/**
 * 将 File 加密后构造新的 Blob
 */
async function createEncryptedBlob(file, { kmsDataKey }) {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const encryptedData = sm4Encrypt(arrayBuffer, kmsDataKey);
  return new Blob([encryptedData], { type: file.type });
}

export class CosUploader {
  constructor() {
    this.stsProvider = new STSProvider();
  }

  /**
   * 全局配置
   */
  static config(options) {
    STSProvider.config(options);
  }

  /**
   * 上传单个文件
   * @param {File|Blob|string} file - 要上传的文件
   * @param {string} bizCode - 业务编码
   * @param {Object} options - 配置项
   */
  async upload(file, bizCode, options = {}) {
    if (!file || !bizCode) {
      throw new Error("CosUploader: file and bizCode are required");
    }

    try {
      // 0. 归一化输入
      let normalizedFile = file;
      if (typeof file === "string" && file.startsWith("data:")) {
        normalizedFile = dataURLtoBlob(file);
      }

      // 1. 获取 STS 凭证
      const stsData = await this.stsProvider.getCredentials({ bizCode });

      // 2. 处理文件加密
      let uploadFile = normalizedFile;
      let headers = {};

      if (stsData.encryptEnable) {
        if (stsData.kmsDataKey && stsData.kmsDataKey.sm4Supported) {
          uploadFile = await createEncryptedBlob(normalizedFile, stsData)
          headers = {
            'x-cos-meta-encrypted-version': String(stsData.kmsDataKey.version),
            'x-cos-meta-encrypted-data-key': String(stsData.kmsDataKey.dataKeyEncrypted),
            'x-cos-meta-sm4-supported': '1'
          }
        } else if (typeof options.externalEncrypt === 'function') {
          const { encryptedFile, meta: extraMeta } = await options.externalEncrypt(normalizedFile, stsData)
          uploadFile = encryptedFile
          // 将 meta 转换为 x-cos-meta- 前缀
          if (extraMeta) {
            Object.keys(extraMeta).forEach(key => {
              headers[`x-cos-meta-${key}`] = extraMeta[key];
            });
          }
        } else {
          console.warn('CosUploader: encryptEnable=true 但不支持 SM4，按未加密处理')
        }
      }

      // 3. 准备 COS 客户端
      const client = new COS({
        getAuthorization: (options, callback) => {
          const now = Math.floor(Date.now() / 1000);
          let expiredTime;

          // 逻辑：如果 expireTime 是 10 位及以上的数字，直接当作秒使用；
          // 否则尝试用 Date 对象解析（支持 ISO 字符串如 stsData.expiration）
          if (typeof stsData.expireTime === 'number' && stsData.expireTime > 1000000000) {
            expiredTime = stsData.expireTime;
          } else {
            const expDate = new Date(stsData.expiration || stsData.expireTime);
            expiredTime = Math.floor(expDate.getTime() / 1000);
          }

          // 最终容错：如果解析失败或时间戳不合理，默认 1 小时过期
          if (isNaN(expiredTime) || expiredTime <= now) {
            expiredTime = now + 3600;
          }

          callback({
            TmpSecretId: stsData.accessKeyId,
            TmpSecretKey: stsData.accessKeySecret,
            SecurityToken: stsData.securityToken,
            StartTime: now,
            ExpiredTime: expiredTime,
          });
        }
      });

      // 4. 路径处理
      const originalName = normalizedFile.name || (normalizedFile.type ? `upload.${normalizedFile.type.split('/')[1]}` : "unnamed");
      const fileName = options.fileName || this.generateUniqueFileName(originalName);
      const objectKey = `${stsData.object}/${fileName}`.replace(/\/+/g, "/");

      // 5. 执行上传
      return new Promise((resolve, reject) => {
        let uploadTaskId = null;

        // 暴露中止句柄
        if (options.onAbortHandler) {
          options.onAbortHandler(() => {
            if (uploadTaskId) {
              client.cancelTask(uploadTaskId);
            }
          });
        }

        // 暴露暂停句柄
        if (options.onPauseHandler) {
          options.onPauseHandler(() => {
            if (uploadTaskId) {
              client.pauseTask(uploadTaskId);
            }
          });
        }

        client.uploadFile({
          Bucket: stsData.bucket,
          Region: stsData.region,
          Key: objectKey,
          Body: uploadFile,
          Headers: headers,
          SliceSize: options.sliceSize || 1024 * 1024 * 10, // 默认 10MB 分片
          onTaskReady: (taskId) => {
            uploadTaskId = taskId;
          },
          onProgress: (progressData) => {
            if (options.onProgress) {
              const percent = Math.floor(progressData.percent * 100);
              options.onProgress(percent, progressData);
            }
          }
        }, (err, data) => {
          if (err) {
            if (err.name === 'cancel') {
              console.log("CosUploader: Upload canceled by user");
            } else {
              console.error("CosUploader: Upload failed", err);
            }
            return reject(err);
          }

          // 构造结果
          const finalUrl = stsData.domain 
            ? `${stsData.domain.replace(/\/+$/, "")}/${objectKey.replace(/^\/+/, "")}`
            : `https://${data.Location}`;

          resolve({
            ...data,
            fileName,
            url: finalUrl,
            originUrl: finalUrl,
            stsData
          });
        });
      });
    } catch (error) {
      console.error("CosUploader: Upload failed", error);
      throw error;
    }
  }

  /**
   * 上传多个文件
   */
  async uploadMultiple(files, bizCode, options = {}) {
    const promises = files.map((file, index) => {
      return this.upload(file, bizCode, {
        ...options,
        onProgress: (p, cpt) => {
          if (options.onItemProgress) {
            options.onItemProgress(index, p, cpt);
          }
        },
        onPauseHandler: (pauseFn) => {
          if (options.onItemPauseTask) {
            options.onItemPauseTask(index, pauseFn);
          }
        },
        onAbortHandler: (abortFn) => {
          if (options.onItemAbortTask) {
            options.onItemAbortTask(index, abortFn);
          }
        },
      });
    });

    return Promise.allSettled(promises);
  }

  /**
   * 生成唯一文件名
   */
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split(".").pop();
    return `${timestamp}-${randomStr}.${ext}`;
  }

  /**
   * 清除所有 STS 缓存
   */
  static clearCache() {
    STSProvider.clearCache();
  }
}


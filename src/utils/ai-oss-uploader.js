/**
 * AI OSS 上传器
 * 封装了从 STS 获取凭证、文件 SM4 加密以及阿里云 OSS 分片上传的完整流程。
 * 支持：分片上传、断点续传、进度回调、上传暂停。
 */

import OSS from "ali-oss";
import { STSProvider } from "./sts-provider";
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

export class AIOssUploader {
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
   * 上传单个文件 (使用分片上传模式)
   * @param {File|Blob} file - 要上传的文件
   * @param {string} bizCode - 业务编码
   * @param {Object} options - 配置项
   * @param {string} options.fileName - 自定义文件名
   * @param {Object} options.checkpoint - 断点信息（用于续传）
   * @param {Function} options.onProgress - 进度回调 (percent, checkpoint) => {}
   * @param {Function} options.onCancelTask - 获取取消句柄的回调 (cancelHandle) => {}
   * @returns {Promise<Object>} OSS 上传结果
   */
  async upload(file, bizCode, options = {}) {
    if (!file || !bizCode) {
      throw new Error("AIOssUploader: file and bizCode are required");
    }

    try {
      // 1. 获取 STS 凭证
      const stsData = await this.stsProvider.getCredentials({ bizCode });

      // 2. 处理文件加密 (注意：分片上传建议先完成整体加密)
      let uploadFile = file;
      let meta = {};

      if (stsData.encryptEnable) {
        if (stsData.kmsDataKey && stsData.kmsDataKey.sm4Supported) {
          // 1. 我们内部的 SM4 加密
          uploadFile = await createEncryptedBlob(file, stsData)
          meta = {
            'encrypted-version': String(stsData.kmsDataKey.version),
            'encrypted-data-key': String(stsData.kmsDataKey.dataKeyEncrypted),
            'sm4-supported': '1'
          }
        } else if (typeof options.externalEncrypt === 'function') {
          // 2. 由外部注入加密逻辑（兼容旧加密方案）
          const { encryptedFile, meta: extraMeta } = await options.externalEncrypt(file, stsData)
          uploadFile = encryptedFile
          meta = extraMeta || {}
        } else {
          // 3. 否则：仅告警，不做加密，交给调用方自己决定要不要用这个类
          console.warn('AIOssUploader: encryptEnable=true 但不支持 SM4，且未提供 externalEncrypt 回调，按未加密处理')
        }
      }

      // 3. 准备 OSS 客户端
      const client = new OSS({
        accessKeyId: stsData.accessKeyId,
        accessKeySecret: stsData.accessKeySecret,
        stsToken: stsData.securityToken,
        bucket: stsData.bucket,
        endpoint: stsData.endpoint,
        cname: !!stsData.cname,
        region: stsData.region || undefined,
        secure: true,
      });

      // 4. 路径处理
      const fileName =
        options.fileName || this.generateUniqueFileName(file.name || "unnamed");
      const objectKey = `${stsData.object}/${fileName}`.replace(/\/+/g, "/");
      // 关键信息：保存最新的 checkpoint（里面有 uploadId）
      let latestCheckpoint = options.checkpoint || null;

      // 先把 abort 函数暴露给外面（里面用的是闭包里的 latestCheckpoint）
      if (options.onAbortHandler) {
        const abortFn = async () => {
          if (latestCheckpoint && latestCheckpoint.uploadId) {
            await client.abortMultipartUpload(
              objectKey,
              latestCheckpoint.uploadId
            );
          }
        };
        options.onAbortHandler(abortFn);
      }
      // 5. 执行分片上传
      const result = await client.multipartUpload(objectKey, uploadFile, {
        checkpoint: options.checkpoint,
        meta,
        progress: (p, cpt) => {
          console.log(p, cpt, "progress");
          // cpt 里包含 uploadId 和已上传的分片信息
          latestCheckpoint = cpt || latestCheckpoint; // 更新最新的 checkpoint
          if (options.onProgress) {
            // 返回进度百分比和当前的 checkpoint
            options.onProgress(Math.floor(p * 100), cpt);
          }
        },
      });

      // 优先使用后端返回的 domain + objectKey 组合 URL（而不是 endpoint）
      let finalUrl = "";
      if (stsData.domain) {
        const domain = stsData.domain.replace(/\/+$/, "");
        const key = objectKey.replace(/^\/+/, "");
        finalUrl = `${domain}/${key}`;
      } else if (result.url) {
        finalUrl = result.url;
      } else if (
        result.res &&
        result.res.requestUrls &&
        result.res.requestUrls[0]
      ) {
        finalUrl = result.res.requestUrls[0];
      }

      return {
        ...result,
        fileName,
        url: finalUrl,
      };
    } catch (error) {
      // 判断是否是主动取消
      if (error.name === "cancel") {
        console.log("AIOssUploader: Upload canceled by user");
      }
      console.error("AIOssUploader: Upload failed", error);
      throw error;
    }
  }

  /**
   * 上传多个文件
   * @param {Array<File>} files
   * @param {string} bizCode
   * @param {Object} options
   */
  async uploadMultiple(files, bizCode, options = {}) {
    const promises = files.map((file, index) => {
      // 注意：多文件上传时，如果需要分别控制暂停，options 里的回调需要处理 index
      return this.upload(file, bizCode, {
        ...options,
        onProgress: (p, cpt) => {
          if (options.onItemProgress) {
            options.onItemProgress(index, p, cpt);
          }
        },
        onCancelTask: (cancel) => {
          if (options.onItemCancelTask) {
            options.onItemCancelTask(index, cancel);
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

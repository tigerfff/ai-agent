/**
 * AI OSS 上传器
 * 封装了从 STS 获取凭证、文件 SM4 加密以及阿里云 OSS 上传的完整流程。
 *
 * 使用方式：
 * 1. 全局配置（推荐在 main.js）
 *    AIOssUploader.config({ httpClient: axios, baseURL: '/api' })
 * 
 * 2. 业务上传
 *    const uploader = new AIOssUploader()
 *    const result = await uploader.upload(file, 'bizCode_70201', {
 *      onProgress: (p) => console.log('进度：', p)
 *    })
 */

import OSS from 'ali-oss'
import { STSProvider } from './sts-provider'
import * as secCrypto from './crypto.common'

// 复用 crypto.common 中的 sm4 实现（兼容 default / 命名导出等多种情况）
const sm4 =
  secCrypto.sm4 ||
  (secCrypto.default && secCrypto.default.sm4) ||
  secCrypto.default ||
  secCrypto

/**
 * 读取 File 为 ArrayBuffer
 * @param {File} file
 * @returns {Promise<ArrayBuffer>}
 */
async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Base64 转 HEX
 * @param {string} base64
 * @returns {string}
 */
function base64toHEX(base64) {
  const raw = window.atob(base64)
  let HEX = ''
  for (let i = 0; i < raw.length; i++) {
    const _hex = raw.charCodeAt(i).toString(16)
    HEX += _hex.length === 2 ? _hex : '0' + _hex
  }
  return HEX
}

/**
 * 使用 SM4 对二进制数据加密（CBC 模式）
 * @param {ArrayBuffer} arrayBuffer - 原始文件二进制
 * @param {Object} kmsDataKey - KMS 下发的数据密钥信息
 * @returns {Uint8Array} 加密后的字节数组
 */
function sm4Encrypt(arrayBuffer, kmsDataKey) {
  // 1. ArrayBuffer -> HEX 数据
  const bytes = new Uint8Array(arrayBuffer)
  const hexData = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  // 2. 将 dataKey(Base64) 转 HEX，前 16 字节作为 key，后 16 字节作为 iv
  const hexDataKey = base64toHEX(kmsDataKey.dataKey)

  // 3. SM4-CBC 加密，保持与后端约定一致
  const encryptedHex = sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
    iv: hexDataKey.slice(32, 64),
    mode: 'cbc'
  })

  // 4. HEX -> Uint8Array
  const result = new Uint8Array(
    encryptedHex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
  )

  return result
}

/**
 * 将 File 加密后构造新的 Blob（保留原始类型）
 * @param {File} file
 * @param {{ kmsDataKey: Object }} param1
 * @returns {Promise<Blob>}
 */
async function createEncryptedBlob(file, { kmsDataKey }) {
  const arrayBuffer = await readFileAsArrayBuffer(file)
  const encryptedData = sm4Encrypt(arrayBuffer, kmsDataKey)
  return new Blob([encryptedData], { type: file.type })
}

export class AIOssUploader {
  constructor() {
    this.stsProvider = new STSProvider()
  }

  /**
   * 全局配置
   * @param {Object} options 
   */
  static config(options) {
    STSProvider.config(options)
  }

  /**
   * 上传单个文件
   * @param {File|Blob} file - 要上传的文件
   * @param {string} bizCode - 业务编码
   * @param {Object} options - 配置项
   * @param {string} options.fileName - 自定义文件名，如果不传则自动生成
   * @param {Function} options.onProgress - 进度回调 (percent) => {}
   * @returns {Promise<Object>} OSS 上传结果
   */
  async upload(file, bizCode, options = {}) {
    if (!file || !bizCode) {
      throw new Error('AIOssUploader: file and bizCode are required')
    }

    try {
      // 1. 获取 STS 凭证
      const stsData = await this.stsProvider.getCredentials({ bizCode })

      // 2. 处理文件加密
      let uploadFile = file
      let meta = {}

      if (stsData.encryptEnable) {
        if (stsData.kmsDataKey && stsData.kmsDataKey.sm4Supported) {
          // 使用 SM4 加密
          uploadFile = await createEncryptedBlob(file, stsData)
          // 设置元数据
          meta = {
            'encrypted-version': String(stsData.kmsDataKey.version),
            'encrypted-data-key': String(stsData.kmsDataKey.dataKeyEncrypted),
            'sm4-supported': '1'
          }
        } else {
          // 这里可以根据需求决定是否处理旧的加密模式，目前按照需求描述，若不支持 sm4 且需要加密，暂不特殊处理或抛错
          console.warn('AIOssUploader: Encryption enabled but SM4 is not supported.')
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
        secure: true // 强制使用 HTTPS
      })

      // 4. 生成文件名和最终路径
      const fileName = options.fileName || this.generateUniqueFileName(file.name || 'unnamed')
      const objectKey = `${stsData.object}/${fileName}`.replace(/\/+/g, '/') // 确保路径没有双斜杠

      // 5. 执行上传
      const result = await client.put(objectKey, uploadFile, {
        meta,
        progress: (p) => {
          if (options.onProgress) {
            options.onProgress(Math.floor(p * 100))
          }
        }
      })

      return {
        ...result,
        fileName,
        url: result.url || result.res.requestUrls[0]
      }
    } catch (error) {
      console.error('AIOssUploader: Upload failed', error)
      throw error
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
      return this.upload(file, bizCode, {
        ...options,
        onProgress: (p) => {
          if (options.onItemProgress) {
            options.onItemProgress(index, p)
          }
        }
      })
    })

    // 使用 allSettled 保证部分失败不影响整体
    return Promise.allSettled(promises)
  }

  /**
   * 生成唯一文件名
   */
  generateUniqueFileName(originalName) {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = originalName.split('.').pop()
    return `${timestamp}-${randomStr}.${ext}`
  }

  /**
   * 清除所有 STS 缓存
   */
  static clearCache() {
    STSProvider.clearCache()
  }
}


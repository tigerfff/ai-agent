/**
 * OSS STS 凭证提供者
 * 模式：RSA-2048 (使用 getPubKey 加密密钥) + AES-CBC (解密业务数据)
 */

import CryptoJS from 'crypto-js'
import { KJUR, KEYUTIL } from 'jsrsasign'

export class STSProvider {
  constructor(options = {}) {
    // 支持实例级配置或使用全局配置
    this.httpClient = options.httpClient || STSProvider.globalHttpClient
    this.baseURL = options.baseURL || STSProvider.globalBaseURL || ''
    
    if (!this.httpClient) {
      console.warn('STSProvider: httpClient not provided, please set it via constructor or STSProvider.config()')
    }
    
    // 缓存公钥信息，避免重复请求
    this.cache = {
      pubKeyHex: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000 // 缓存30分钟
    }
  }
  
  /**
   * 全局配置 STSProvider
   */
  static config(options = {}) {
    if (options.httpClient) {
      STSProvider.globalHttpClient = options.httpClient
    }
    if (options.baseURL !== undefined) {
      STSProvider.globalBaseURL = options.baseURL
    }
  }

  /**
   * 获取 STS 凭证（主方法）
   * @param {Object} params
   * @param {string} params.bizCode - 业务编码（必传）
   * @returns {Promise<Object>} 解密后的 STS 凭证
   */
  async getCredentials({ bizCode }) {
    if (!bizCode) {
      throw new Error('STSProvider: bizCode is required')
    }
    
    if (!this.httpClient) {
      throw new Error('STSProvider: httpClient is not configured. Please call STSProvider.config() first.')
    }

    try {
      // 1. 获取完整 RSA 公钥 Hex 串（来自 /basic/actions/getPubKey）
      const pubKeyHex = await this.getPubKey()
      
      // 2. 生成随机 AES 密钥和 IV
      // AES-256 要求 32 字节密钥，IV 要求 16 字节
      const aesKey = this.generateRandomKey(32)
      const iv = this.generateRandomKey(16)
      
      // 3. 使用 RSA-2048 公钥加密 AES 密钥和 IV
      const encryptedKey = this.rsaEncrypt(aesKey, pubKeyHex)
      const encryptedIv = this.rsaEncrypt(iv, pubKeyHex)
      
      // 4. 调用 STS 接口
      const response = await this.fetchOssCredential({
        bizCode,
        key: encryptedKey,
        iv: encryptedIv
      })
      
      // 5. 使用 AES 解密返回的加密字段
      const decrypted = this.decryptCredentials(response.data, aesKey, iv)
      
      return decrypted
    } catch (error) {
      console.error('STSProvider: Failed to get credentials', error)
      throw error
    }
  }

  /**
   * 获取完整 RSA 公钥（Hex DER）
   * 来源：/basic/actions/getPubKey
   */
  async getPubKey() {
    const now = Date.now()
    if (this.cache.pubKeyHex && this.cache.cacheTime && (now - this.cache.cacheTime < this.cache.cacheExpire)) {
      return this.cache.pubKeyHex
    }

    const res = await this.httpClient(
      'get',
      `${this.baseURL}/basic/actions/getPubKey`
    )

    if (res && res.success && res.data) {
      this.cache.pubKeyHex = res.data  // 就是文档里的 30820122... 那串
      this.cache.cacheTime = now
      return res.data
    }

    throw new Error('STSProvider: Failed to get public key')
  }

  /**
   * RSA 加密 (使用 getPubKey 返回的完整公钥 Hex 串)
   * @param {string} data - 要加密的明文
   * @param {string} pubKeyHex - 公钥 Hex（例如 30820122...）
   */
  rsaEncrypt(data, pubKeyHex) {
    try {
      // KEYUTIL.getKey 会自动识别 Hex DER 公钥并构造 RSAKey 对象
      const pubKey = KEYUTIL.getKey(pubKeyHex)

      // 执行加密（返回 Hex，默认 PKCS1Padding）
      const encryptedHex = KJUR.crypto.Cipher.encrypt(data, pubKey)

      // 转成 Base64 传给后端
      return this.hexToBase64(encryptedHex)
    } catch (error) {
      console.error('STSProvider: RSA encryption failed', error)
      throw new Error('RSA encryption failed: ' + error.message)
    }
  }

  /**
   * AES 解密 (CBC 模式)
   */
  aesDecrypt(encrypted, key, iv) {
    const decrypted = CryptoJS.AES.decrypt(
      encrypted, 
      CryptoJS.enc.Utf8.parse(key),
      {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    return decrypted.toString(CryptoJS.enc.Utf8)
  }

  /**
   * 解密 STS 凭证中的加密字段
   */
  decryptCredentials(data, aesKey, iv) {
    const encryptedFields = [
      'accessKeyId',
      'accessKeySecret',
      'bucket',
      'domain',
      'endpoint',
      'object'
    ]
    
    const decrypted = { ...data }
    
    encryptedFields.forEach(field => {
      if (data[field]) {
        try {
          decrypted[field] = this.aesDecrypt(data[field], aesKey, iv)
        } catch (error) {
          console.error(`STSProvider: Failed to decrypt field [${field}]`, error)
        }
      }
    })
    
    return decrypted
  }

  // --- 辅助转换工具 ---

  generateRandomKey(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  base64ToHex(base64) {
    const raw = atob(base64)
    let hex = ''
    for (let i = 0; i < raw.length; i++) {
      const byte = raw.charCodeAt(i).toString(16)
      hex += (byte.length === 2 ? byte : '0' + byte)
    }
    return hex
  }

  hexToBase64(hex) {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    const binary = String.fromCharCode.apply(null, bytes)
    return btoa(binary)
  }

  async fetchOssCredential(params) {
    const res = await this.httpClient(
      'post',
      `${this.baseURL}/basic/actions/getOssCredential`,
      params
    )
    
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to get OSS credentials')
    }
    
    return res.data
  }

  clearCache() {
    this.cache = {
      pubKeyHex: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000
    }
  }
}

STSProvider.globalHttpClient = null
STSProvider.globalBaseURL = ''
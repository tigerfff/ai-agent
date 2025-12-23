/**
 * OSS STS 凭证提供者
 * 用于获取阿里云 OSS 的临时访问凭证
 * 
 * 使用方式：
 * 1. 全局配置一次（推荐在 Vue.use() 时配置）
 *    STSProvider.config({ httpClient: http, baseURL: '/api' })
 * 
 * 2. 在需要的地方创建实例并获取凭证
 *    const provider = new STSProvider()
 *    const credentials = await provider.getCredentials({ bizCode: '70201' })
 */

import CryptoJS from 'crypto-js'
import { RSAKey } from 'jsrsasign'
import { sm4 } from 'sec-crypto'

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
      modulus: null,
      exponent: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000 // 缓存30分钟
    }
  }
  
  /**
   * 全局配置 STSProvider
   * @param {Object} options
   * @param {Function} options.httpClient - HTTP 客户端函数
   * @param {string} options.baseURL - API 基础路径
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
      // 1. 获取公钥质数对（用于 RSA 加密）
      const { modulus, exponent } = await this.getModulusExponent()
      
      // 2. 生成随机密钥和 IV (SM4 要求 16 字节/128位)
      const secretKey = this.generateRandomKey(16) 
      const iv = this.generateRandomKey(16)
      
      // 3. 使用 RSA 加密原始密钥和 IV 传给后端
      const encryptedKey = this.rsaEncrypt(secretKey, modulus, exponent)
      const encryptedIv = this.rsaEncrypt(iv, modulus, exponent)
      
      // 4. 调用 STS 接口
      const response = await this.fetchOssCredential({
        bizCode,
        key: encryptedKey,
        iv: encryptedIv
      })
      
      // 5. 使用 SM4 解密返回的加密字段
      const decrypted = this.decryptCredentials(response.data, secretKey, iv)
      
      return decrypted
    } catch (error) {
      console.error('STSProvider: Failed to get credentials', error)
      throw error
    }
  }

  /**
   * 获取公钥质数对
   * @returns {Promise<{modulus: string, exponent: string}>}
   */
  async getModulusExponent() {
    // 检查缓存是否有效
    const now = Date.now()
    if (
      this.cache.modulus && 
      this.cache.exponent && 
      this.cache.cacheTime &&
      (now - this.cache.cacheTime < this.cache.cacheExpire)
    ) {
      return {
        modulus: this.cache.modulus,
        exponent: this.cache.exponent
      }
    }

    // 调用接口获取
    const res = await this.httpClient(
      'get',
      `${this.baseURL}/basic/actions/getModulusExponent`
    )
    
    if (res && res.success && res.data) {
      this.cache.modulus = res.data.modulus
      this.cache.exponent = res.data.exponent
      this.cache.cacheTime = now
      
      return {
        modulus: res.data.modulus,
        exponent: res.data.exponent
      }
    }
    
    throw new Error('STSProvider: Failed to get modulus and exponent')
  }

  /**
   * RSA 加密
   * @param {string} data - 要加密的数据
   * @param {string} modulus - 公钥模数（Base64）
   * @param {string} exponent - 公钥指数（Base64）
   * @returns {string} Base64 编码的加密结果
   */
  rsaEncrypt(data, modulus, exponent) {
    try {
      // 创建 RSA 密钥对象
      const rsa = new RSAKey()
      
      // 将 Base64 编码的模数和指数转换为十六进制
      const modulusHex = this.base64ToHex(modulus)
      const exponentHex = this.base64ToHex(exponent)
      
      // 设置公钥
      rsa.setPublic(modulusHex, exponentHex)
      
      // 加密数据（返回十六进制字符串）
      const encrypted = rsa.encrypt(data)
      
      // 将十六进制转换为 Base64
      return this.hexToBase64(encrypted)
    } catch (error) {
      console.error('STSProvider: RSA encryption failed', error)
      throw new Error('RSA encryption failed: ' + error.message)
    }
  }

  /**
   * Base64 转十六进制
   * @param {string} base64 - Base64 字符串
   * @returns {string} 十六进制字符串
   */
  base64ToHex(base64) {
    const raw = atob(base64)
    let hex = ''
    for (let i = 0; i < raw.length; i++) {
      const byte = raw.charCodeAt(i).toString(16)
      hex += (byte.length === 2 ? byte : '0' + byte)
    }
    return hex
  }

  /**
   * 十六进制转 Base64
   * @param {string} hex - 十六进制字符串
   * @returns {string} Base64 字符串
   */
  hexToBase64(hex) {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16))
    }
    const binary = String.fromCharCode.apply(null, bytes)
    return btoa(binary)
  }

  /**
   * 生成随机密钥
   * @param {number} length - 密钥长度
   * @returns {string} 随机密钥
   */
  generateRandomKey(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 调用获取 STS 凭证接口
   * @param {Object} params - 请求参数
   * @returns {Promise<Object>} 接口响应
   */
  async fetchOssCredential(params) {
    const res = await this.httpClient(
      'post',
      `${this.baseURL}/basic/actions/getOssCredential`,
      params
    )
    
    if (!res || !res.success) {
      throw new Error(res?.message || 'Failed to get OSS credentials')
    }
    
    return res
  }

  /**
   * 解密 STS 凭证中的加密字段
   * @param {Object} data - 原始数据
   * @param {string} secretKey - 密钥
   * @param {string} iv - IV
   * @returns {Object} 解密后的数据
   */
  decryptCredentials(data, secretKey, iv) {
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
          decrypted[field] = this.sm4Decrypt(data[field], secretKey, iv)
        } catch (error) {
          console.error(`STSProvider: Failed to decrypt field [${field}]`, error)
          // 解密失败时保留原值
        }
      }
    })
    
    return decrypted
  }

  /**
   * SM4 解密 (CBC 模式)
   * @param {string} encrypted - 加密的 Base64 字符串
   * @param {string} key - 16 字节原始密钥字符串
   * @param {string} iv - 16 字节原始 IV 字符串
   * @returns {string} 解密后的字符串
   */
  sm4Decrypt(encrypted, key, iv) {
    // 将原始字符串转换为 hex 字符串，以符合 sec-crypto 的要求
    const keyHex = CryptoJS.enc.Utf8.parse(key).toString(CryptoJS.enc.Hex)
    const ivHex = CryptoJS.enc.Utf8.parse(iv).toString(CryptoJS.enc.Hex)

    // 使用 sec-crypto 进行 SM4 解密
    return sm4.decrypt(encrypted, keyHex, {
      mode: 'cbc',
      iv: ivHex,
      padding: 'pkcs7'
    })
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache = {
      modulus: null,
      exponent: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000
    }
  }
}

// 初始化静态属性
STSProvider.globalHttpClient = null
STSProvider.globalBaseURL = ''


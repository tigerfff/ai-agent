/**
 * OSS STS 凭证提供者
 * 采用 SM4 国密对称加密算法
 */

import { sm4 } from 'sm-crypto' 
import { RSAKey } from 'jsrsasign'

export class STSProvider {
  constructor(options = {}) {
    this.httpClient = options.httpClient || STSProvider.globalHttpClient
    this.baseURL = options.baseURL || STSProvider.globalBaseURL || ''
    
    if (!this.httpClient) {
      console.warn('STSProvider: httpClient not provided, please set it via constructor or STSProvider.config()')
    }
    
    this.cache = {
      modulus: null,
      exponent: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000
    }
  }
  
  static config(options = {}) {
    if (options.httpClient) {
      STSProvider.globalHttpClient = options.httpClient
    }
    if (options.baseURL !== undefined) {
      STSProvider.globalBaseURL = options.baseURL
    }
  }

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
      
      // 2. 生成随机 SM4 密钥和 IV
      // SM4 要求 128 位密钥（即 32 位十六进制字符串）
      const sm4Key = this.generateRandomHex(32)
      const iv = this.generateRandomHex(32)
      
      // 3. 使用 RSA 加密 SM4 密钥和 IV
      const encryptedKey = this.rsaEncrypt(sm4Key, modulus, exponent)
      const encryptedIv = this.rsaEncrypt(iv, modulus, exponent)
      
      // 4. 调用 STS 接口
      const response = await this.fetchOssCredential({
        bizCode,
        key: encryptedKey,
        iv: encryptedIv
      })
      
      // 5. 使用 SM4 解密返回的加密字段
      const decrypted = this.decryptCredentials(response.data, sm4Key, iv)
      
      return decrypted
    } catch (error) {
      console.error('STSProvider: Failed to get credentials', error)
      throw error
    }
  }

  /**
   * 生成随机十六进制字符串
   */
  generateRandomHex(length) {
    const chars = '0123456789abcdef'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  async getModulusExponent() {
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

  rsaEncrypt(data, modulus, exponent) {
    try {
      const rsa = new RSAKey()
      const modulusHex = this.base64ToHex(modulus)
      const exponentHex = this.base64ToHex(exponent)
      rsa.setPublic(modulusHex, exponentHex)
      const encrypted = rsa.encrypt(data)
      return this.hexToBase64(encrypted)
    } catch (error) {
      console.error('STSProvider: RSA encryption failed', error)
      throw new Error('RSA encryption failed: ' + error.message)
    }
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
    
    return res
  }

  /**
   * 解密 STS 凭证中的加密字段
   */
  decryptCredentials(data, sm4Key, iv) {
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
          decrypted[field] = this.sm4Decrypt(data[field], sm4Key, iv)
        } catch (error) {
          console.error(`STSProvider: Failed to decrypt field [${field}]`, error)
        }
      }
    })
    
    return decrypted
  }

  /**
   * SM4 解密实现
   * @param {string} base64Data - 后端返回的加密 Base64 字符串
   * @param {string} key - 32位十六进制密钥
   * @param {string} iv - 32位十六进制IV
   */
  sm4Decrypt(base64Data, key, iv) {
    // 1. 先将 Base64 转换为十六进制字符串，因为 sm-crypto 接收 hex 格式数据
    const hexData = this.base64ToHex(base64Data)
    
    // 2. 调用 sm4 解密，使用 cbc 模式和指定的 iv
    // 注意：sm-crypto 默认使用 pkcs#7 填充
    return sm4.decrypt(hexData, key, {
      mode: 'cbc',
      iv: iv,
      padding: 'pkcs#7'
    })
  }

  clearCache() {
    this.cache = {
      modulus: null,
      exponent: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000
    }
  }
}

STSProvider.globalHttpClient = null
STSProvider.globalBaseURL = ''

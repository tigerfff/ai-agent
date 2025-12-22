/**
 * OSS STS 凭证提供者
 * 流程：全 SM4 对称加密 (sec-crypto)
 * 1. getPubKey -> 获取 Master Key
 * 2. SM4-CBC(MasterKey, MyKey/MyIv) -> 加密会话秘钥
 * 3. getOssCredential -> 获取加密的 STS 信息
 * 4. SM4-CBC(MyKey, Data) -> 解密 STS 信息
 */

import { sm4 } from "sec-crypto";

export class STSProvider {
  constructor(options = {}) {
    this.httpClient = options.httpClient || STSProvider.globalHttpClient
    this.baseURL = options.baseURL || STSProvider.globalBaseURL || ''
    
    if (!this.httpClient) {
      console.warn('STSProvider: httpClient not provided, please set it via constructor or STSProvider.config()')
    }
    
    this.cache = {
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

  /**
   * 获取 STS 凭证 (全 SM4 流程)
   */
  async getCredentials({ bizCode }) {
    if (!bizCode) throw new Error('STSProvider: bizCode is required')
    if (!this.httpClient) throw new Error('STSProvider: httpClient is not configured')

    try {
      // 1. 获取服务器提供的原始秘钥串 (getPubKey)
      const serverPubKeyData = await this.getPubKey()
      
      // 2. 准备 Master Key 和 Master IV
      // 根据约定，通常取前 32 位十六进制(16字节)作为 Key，后 32 位作为 IV
      // 如果 serverPubKeyData 只有 32 位，则 IV 默认为全 0
      const masterKeyHex = serverPubKeyData.slice(0, 32)
      const masterIvHex = serverPubKeyData.slice(32, 64) || '00000000000000000000000000000000'

      // 3. 随机生成本次会话的 Key 和 IV (32位十六进制)
      const myKeyHex = this.generateRandomHex(32)
      const myIvHex = this.generateRandomHex(32)

      // 4. 【核心改动】使用 SM4-CBC 加密我们自己的 Key 和 IV
      // 使用服务器给的 masterKeyHex 和 masterIvHex
      const encryptedKey = sm4.encrypt(myKeyHex, masterKeyHex, {
        mode: 'cbc',
        iv: masterIvHex,
        padding: 'pkcs#7'
      })
      
      const encryptedIv = sm4.encrypt(myIvHex, masterKeyHex, {
        mode: 'cbc',
        iv: masterIvHex,
        padding: 'pkcs#7'
      })

      // 5. 调用 STS 接口
      const response = await this.fetchOssCredential({
        bizCode,
        key: encryptedKey,
        iv: encryptedIv
      })
      
      // 6. 使用我们生成的 myKeyHex 解密返回的 STS 信息
      const decrypted = this.decryptCredentials(response.data, myKeyHex, myIvHex)
      
      return decrypted
    } catch (error) {
      console.error('STSProvider: Failed to get credentials', error)
      throw error
    }
  }

  /**
   * 获取服务器公钥数据
   */
  async getPubKey() {
    const res = await this.httpClient(
      'get',
      `${this.baseURL}/basic/actions/getPubKey`
    )
    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || 'STSProvider: Failed to get public key data')
    }
    return res.data
  }

  /**
   * 辅助工具：生成随机十六进制字符串
   */
  generateRandomHex(length) {
    const chars = '0123456789abcdef'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * 辅助工具：字符串转字节数组 (bitsArray)
   */
  stringToUint8Array(str) {
    const arr = [];
    for (let i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr);
  }

  /**
   * 辅助工具：十六进制串转字节数组
   */
  hexToUint8Array(hex) {
    const matches = hex.match(/[\da-f]{2}/gi) || [];
    return new Uint8Array(matches.map(h => parseInt(h, 16)));
  }

  /**
   * 辅助工具：字节数组转十六进制串
   */
  uint8ArrayToHex(uint8Array) {
    return Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * 辅助工具：Base64 转十六进制串
   */
   /**
   * 辅助工具：Base64 转十六进制串（不依赖浏览器 atob，且包含 _keyStr 逻辑）
   */
   base64ToHex(base64) {
    const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;

    // 清洗掉非 Base64 字符
    base64 = base64.replace(/[^A-Za-z0-9+/=]/g, "");

    while (i < base64.length) {
      enc1 = _keyStr.indexOf(base64.charAt(i++));
      enc2 = _keyStr.indexOf(base64.charAt(i++));
      enc3 = _keyStr.indexOf(base64.charAt(i++));
      enc4 = _keyStr.indexOf(base64.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      // 转换为 Hex
      output += chr1.toString(16).padStart(2, '0');
      if (enc3 !== 64) {
        output += chr2.toString(16).padStart(2, '0');
      }
      if (enc4 !== 64) {
        output += chr3.toString(16).padStart(2, '0');
      }
    }
    return output;
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

  /**
   * 解密 STS 凭证中的加密字段
   */
  decryptCredentials(data, sm4Key, iv) {
    const encryptedFields = ['accessKeyId', 'accessKeySecret', 'bucket', 'domain', 'endpoint', 'object']
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
   */
  sm4Decrypt(base64Data, key, iv) {
    const hexData = this.base64ToHex(base64Data)
    return sm4.decrypt(hexData, key, {
      mode: 'cbc',
      iv: iv,
      padding: 'pkcs#7'
    })
  }
}

STSProvider.globalHttpClient = null
STSProvider.globalBaseURL = ''

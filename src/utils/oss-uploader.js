import OSS from 'ali-oss';

// 存储桶所在地域
let BUCKET_REGION = 'ap-nanjing';
const SLICE_SIZE = 10 * 1024 * 1024;

export class OssUploader {
  /**
   * @param {Object} options
   * @param {Function} options.tokenProvider - 获取 STS Token 的函数，返回 Promise
   */
  constructor(options) {
    this.sliceSize = options.sliceSize || SLICE_SIZE;
    this.tokenProvider = options.tokenProvider;
    
    this.client = null;
    this.bucketDomain = '';
    this.bucketName = '';
    this.object = '';
  }

  /**
   * 获取密钥并初始化客户端
   */
  async initClient() {
    if (this.client) return this.client;

    try {
      const credentials = await this.tokenProvider();
      if (!credentials) return null;

      this.bucketDomain = credentials.domain;
      this.bucketName = credentials.bucket;
      this.object = credentials.object;
      BUCKET_REGION = credentials.region;

      this.client = new OSS({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        stsToken: credentials.securityToken,
        bucket: this.bucketName,
        region: BUCKET_REGION,
        refreshSTSToken: async () => {
          const info = await this.tokenProvider();
          return {
            accessKeyId: info.accessKeyId,
            accessKeySecret: info.accessKeySecret,
            stsToken: info.securityToken
          };
        }
      });
      return this.client;
    } catch (error) {
      console.error('OSS init failed:', error);
      return null;
    }
  }

  generateKey(file) {
    const timeStamp = file.uid ? file.uid : new Date().getTime() + '';
    const suffix = file.name.split('.').pop();
    return `${this.randomString()}_${timeStamp}.${suffix}`;
  }

  randomString(len = 6) {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz0123456789';
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  async upload(file) {
    const client = await this.initClient();
    if (!client) {
      throw new Error('OSS client init failed');
    }

    const key = `${this.object}${this.generateKey(file)}`;
    
    try {
      // 简单上传，大文件可以后续扩展分片逻辑
      const result = await client.put(key, file);
      
      // 构造返回 URL
      // 注意：这里优先使用 bucketDomain，如果没有则使用 OSS 返回的 url
      let url = result.url;
      if (this.bucketDomain) {
        // 确保 bucketDomain 不带最后的斜杠，key 不带开头的斜杠（通常 key 也不带）
        const domain = this.bucketDomain.replace(/\/$/, '');
        const cleanKey = key.replace(/^\//, '');
        url = `${domain}/${cleanKey}`;
      }
      
      return {
        url,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (err) {
      console.error('OSS upload failed:', err);
      throw err;
    }
  }
}


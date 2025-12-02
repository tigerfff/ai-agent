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
    console.log(options,'options')
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

      // 构造 ali-oss 配置
      const ossConfig = {
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        stsToken: credentials.securityToken,
        bucket: this.bucketName,
        secure: true, // 强制 HTTPS
        refreshSTSToken: async () => {
          const info = await this.tokenProvider();
          return {
            accessKeyId: info.accessKeyId,
            accessKeySecret: info.accessKeySecret,
            stsToken: info.securityToken
          };
        }
      };

      // 1. 如果有 endpoint，优先使用 endpoint
      if (credentials.endpoint) {
        ossConfig.endpoint = credentials.endpoint;
        // 如果后端返回了 cname 标识（1 或 true），则开启 cname 模式
        if (credentials.cname) {
          ossConfig.cname = true;
        }
      } 
      // 2. 否则如果后端返回了 region，则使用 region
      else if (credentials.region) {
        ossConfig.region = credentials.region;
        BUCKET_REGION = credentials.region; // 更新全局默认值
      } 
      // 3. 兜底：如果都没有，尝试使用默认的 BUCKET_REGION
      else if (BUCKET_REGION) {
        ossConfig.region = BUCKET_REGION;
      }

      this.client = new OSS(ossConfig);
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


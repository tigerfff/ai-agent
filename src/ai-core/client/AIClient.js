import { createDefaultSSEDriver } from './DefaultSSEDriver';

export class AIClient {
  /**
   * @param {Object} options
   * @param {Function} options.httpAdapter - 父项目注入的 HTTP 适配器 (必需)
   * @param {Function} options.configProvider - 父项目注入的配置提供者 (必需)
   * @param {Function} [options.sseDriver] - 可选的自定义 SSE 驱动，默认使用内置实现
   */
  constructor(options = {}) {
    if (!options.httpAdapter) {
      throw new Error('[AIClient] httpAdapter is required. Please inject it during installation.');
    }
    if (!options.configProvider) {
      throw new Error('[AIClient] configProvider is required. Please inject it during installation.');
    }

    this.httpAdapter = options.httpAdapter;
    this.configProvider = options.configProvider;

    // 如果父项目没有提供 SSE 实现，使用默认的 DefaultSSEDriver
    // 并将 configProvider 传递给它，以便它能获取 token/baseUrl
    this.sseDriver = options.sseDriver || createDefaultSSEDriver(this.configProvider);
  }

  /**
   * 统一发送消息接口
   * @param {Object} params
   * @param {string} params.url - 接口地址
   * @param {Object} params.data - 请求数据
   * @param {string} [params.method='POST'] - 请求方法
   * @param {boolean} [params.stream=false] - 是否开启 SSE 流式模式
   * @param {Object} [params.httpConfig] - 传递给父项目 http 函数的额外配置（如 showLoading、hideErrorMsg 等）
   * @param {Function} [params.onMessage] - (SSE) 接收消息回调
   * @param {Function} [params.onComplete] - (SSE) 完成回调
   * @param {Function} [params.onError] - 错误回调
   * @param {AbortController} [params.signal] - 中断信号
   * @returns {Promise|void} 非流式请求返回 Promise，流式请求返回 void (通过回调通信)
   */
  send(params) {
    const { 
      url, 
      data, 
      method = 'POST', 
      stream = false,
      httpConfig,  // 父项目的额外配置
      onMessage, 
      onComplete, 
      onError,
      signal
    } = params;

    // 场景 1: 流式请求 (SSE)
    if (stream) {
      return this.sseDriver(url, data, {
        onMessage,
        onComplete,
        onError,
        signal
      });
    }

    // 场景 2: 普通 HTTP 请求
    const methodUpper = method.toUpperCase();

    let finalUrl = url;
    let finalData = data;

    // 【兼容性增强】对于 GET/DELETE 等请求，手动将 data 拼接到 URL 上
    // 目的：兼容那些不支持 params 参数或错误地将 data 当作 config 处理的 adapter
    const isGetLike = ['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(methodUpper);
    
    if (isGetLike && data && typeof data === 'object') {
      const params = new URLSearchParams();
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });
      
      const queryString = params.toString();
      if (queryString) {
        finalUrl = finalUrl.includes('?') 
          ? `${finalUrl}&${queryString}` 
          : `${finalUrl}?${queryString}`;
      }
      
      // 重要：清空 data，防止 adapter 误将其作为 body 或 config 传入
      finalData = undefined;
    }

    // POST/PUT/PATCH 请求：data 作为请求体，httpConfig 作为第四个参数传递给父项目
    return this.httpAdapter(method, finalUrl, finalData, httpConfig)
      .catch(err => {
        if (onError) onError(err);
        throw err;
      });
  }
}


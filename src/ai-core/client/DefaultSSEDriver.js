import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * 创建默认的 SSE 驱动
 * @param {Function} configProvider - 提供配置的函数，返回 { baseUrl, headers }
 * @returns {Function} SSE 请求函数
 */
export function createDefaultSSEDriver(configProvider) {
  return async (url, data, { onMessage, onComplete, onError, signal }) => {
    // 1. 从 configProvider 获取最新的环境配置
    // 这样可以确保每次请求都拿到最新的 Token (如果 Token 放在 header 里)
    const config = configProvider() || {};
    const baseUrl = config.baseUrl || '';
    
    // 拼接完整 URL
    // 如果 url 已经是绝对路径 (http开头)，则不拼接 baseUrl
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // 准备 Headers
    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers || {})
    };

    try {
      await fetchEventSource(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal,

        // 关键点：fetch 选项，用于支持 HttpOnly Cookie
        fetch: (input, init) => {
          return fetch(input, {
            ...init,
            credentials: 'include', // 确保跨域或同域请求带上 Cookie
          });
        },

        async onopen(response) {
          if (response.ok) {
            return; // 连接成功
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // 客户端错误 (4xx)，通常不可重试，抛出 FatalError
            throw new Error(`Client Error: ${response.status} ${response.statusText}`);
          } else {
            // 其他错误，抛出异常让库决定是否重试
            throw new Error(`Server Error: ${response.status} ${response.statusText}`);
          }
        },

        onmessage(msg) {
          // 处理自定义的结束标识，例如 [DONE]
          if (msg.data === '[DONE]') {
            // onComplete 会在 onclose 中触发，这里可以忽略或者提前处理
            return;
          }

          try {
            // 尝试解析 JSON
            const payload = JSON.parse(msg.data);
            onMessage(payload);
          } catch (e) {
            // 解析失败，作为普通文本返回
            onMessage(msg.data);
          }
        },

        onclose() {
          // 连接正常关闭
          if (onComplete) onComplete();
        },

        onerror(err) {
          // 发生错误
          if (onError) onError(err);
          // 如果需要重试，可以不抛出异常；如果想中断重试，抛出异常
          // 这里我们默认把错误抛出去，由调用方决定或者遵循库的默认重试策略
          throw err; 
        }
      });
    } catch (err) {
      // 捕获 fetchEventSource 抛出的最终错误
      if (onError) onError(err);
    }
  };
}


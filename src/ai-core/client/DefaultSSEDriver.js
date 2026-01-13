import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * 创建默认的 SSE 驱动
 * @param {Function} configProvider - 提供配置的函数，返回 { baseUrl, headers, sseTimeout }
 * @returns {Function} SSE 请求函数
 */
export function createDefaultSSEDriver(configProvider) {
  return async (url, data, { onMessage, onComplete, onError, signal }) => {
    // 1. 从 configProvider 获取最新的环境配置
    // 这样可以确保每次请求都拿到最新的 Token (如果 Token 放在 header 里)
    const config = configProvider() || {};
    const baseUrl = config.baseUrl || '';
    // SSE 连接建立的超时时间（毫秒），默认 5 分钟，支持长时间连接
    const sseTimeout = config.sseTimeout || 5 * 60 * 1000; // 5 分钟
    
    // 拼接完整 URL
    // 如果 url 已经是绝对路径 (http开头)，则不拼接 baseUrl
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    // 准备 Headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream', // SSE 必需的请求头
      ...(config.headers || {})
    };

    // 创建连接建立的超时控制器
    let connectionTimeoutId = null;
    let connectionAbortController = null;

    try {
      await fetchEventSource(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal,
        openWhenHidden: true, // 允许在页面不可见时打开连接

        // 关键点：fetch 选项，用于支持 HttpOnly Cookie 和超时控制
        fetch: (input, init) => {
          // 创建连接建立的超时控制器
          connectionAbortController = new AbortController();
          const timeoutSignal = connectionAbortController.signal;
          
          // 合并信号：如果外部有 signal，需要同时监听两个信号
          let combinedSignal = timeoutSignal;
          if (signal) {
            // 创建一个新的 AbortController 来合并两个信号
            const combinedAbortController = new AbortController();
            combinedSignal = combinedAbortController.signal;
            
            // 监听外部 signal
            signal.addEventListener('abort', () => {
              combinedAbortController.abort();
            });
            
            // 监听超时 signal
            timeoutSignal.addEventListener('abort', () => {
              combinedAbortController.abort();
            });
          }
          
          // 设置连接建立的超时
          connectionTimeoutId = setTimeout(() => {
            if (!connectionAbortController.signal.aborted) {
              connectionAbortController.abort();
              console.warn(`[SSE] Connection timeout after ${sseTimeout}ms`);
            }
          }, sseTimeout);
          
          return fetch(input, {
            ...init,
            credentials: 'include', // 确保跨域或同域请求带上 Cookie
            signal: combinedSignal,
          }).then(response => {
            // 连接建立成功，清除超时
            if (connectionTimeoutId) {
              clearTimeout(connectionTimeoutId);
              connectionTimeoutId = null;
            }
            return response;
          }).catch(err => {
            // 连接失败，清除超时
            if (connectionTimeoutId) {
              clearTimeout(connectionTimeoutId);
              connectionTimeoutId = null;
            }
            throw err;
          });
        },

        async onopen(response) {
          // 连接建立成功，清除超时
          if (connectionTimeoutId) {
            clearTimeout(connectionTimeoutId);
            connectionTimeoutId = null;
          }
          
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
      // 清除超时定时器
      if (connectionTimeoutId) {
        clearTimeout(connectionTimeoutId);
        connectionTimeoutId = null;
      }
      
      // 捕获 fetchEventSource 抛出的最终错误
      if (onError) onError(err);
    }
  };
}


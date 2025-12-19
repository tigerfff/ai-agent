import axios from 'axios';

/**
 * 简化版 http 封装，用来在 ai-aa 开发环境中「模拟」父项目的 http 行为：
 * - 统一通过 axios 实例发送请求
 * - GET 请求把 data 当成 query string 处理（而不是放到 body）
 * - 默认携带 cookie（withCredentials）
 */

const axiosInstance = axios.create({
  withCredentials: true,
  timeout: 30000
});

/**
 * @param {'get'|'post'|'put'|'patch'|'delete'|'form'} type
 * @param {string} url
 * @param {Object} data
 * @param {Object} config  预留扩展位（showLoading 等）
 * @returns {Promise<any>} 直接返回后端的 response.data
 */
export default function http(type, url, data = {}, config = {}) {
  let request;

  const method = type.toLowerCase();

  if (method === 'get' || method === 'delete') {
    // 模拟 aiModal/index.js 里对 GET params 的处理：拼接到 URL 上
    request = axiosInstance.request({
      method,
      url,
      params: data,
      ...config
    });
  } else if (method === 'post' || method === 'put' || method === 'patch') {
    request = axiosInstance.request({
      method,
      url,
      data,
      ...config
    });
  } else if (method === 'form') {
    request = axiosInstance.request({
      method: 'post',
      url,
      data,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(config.headers || {})
      },
      ...config
    });
  } else {
    return Promise.reject(new Error(`Unsupported http method: ${type}`));
  }

  return request.then(res => res.data);
}



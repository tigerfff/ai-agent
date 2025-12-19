/**
 * 从 client 的 configProvider 中获取前缀映射
 * @param {object} client AIClient 实例
 * @param {string} key 标准前缀 key，如 chain/sse 等
 * @param {string} fallback 未配置时的回退值，默认 '/api'
 */
export function getPrefix(client, key, fallback = '/api') {
  try {
    const cfg = typeof client?.configProvider === 'function' ? client.configProvider() : {};
    const map = cfg?.prefixMap || {};
    return map[key] || fallback;
  } catch (e) {
    console.warn('[api-prefix] getPrefix error', e);
    return fallback;
  }
}

/**
 * 构造带前缀的 URL
 * @param {object} client AIClient 实例
 * @param {string} path 接口路径，建议以 / 开头
 * @param {string} key 标准前缀 key，默认 'chain'
 * @param {string} fallback 未配置时的回退值，默认 '/api'
 */
export function buildUrl(client, path, key = 'chain', fallback = '/api') {
  const prefix = getPrefix(client, key, fallback);
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${prefix}${normalized}`;
}


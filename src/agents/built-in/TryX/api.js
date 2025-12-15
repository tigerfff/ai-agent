// TryX 智能体 API 定义
import { buildUrl } from '@/utils/api-prefix';

export const TryApi = {
  /**
   * 获取 OSS 上传凭证
   * @param {AIClient} client 
   */
  getOssToken(client) {
    return client.send({
      url: buildUrl(client, '/inspect/algorithm/models/upload/ossInfo', 'sse'),
      method: 'get'
    });
  },

  /**
   * 获取会话列表
   * @param {AIClient} client
   * @param {Object} [data] - 查询参数
   */
  getConversationList(client, data = {}) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agent/chat/list', 'sse'),
      method: 'post',
      data
    });
  },

  /**
   * 获取会话历史记录
   * @param {AIClient} client 
   * @param {string} sessionId 
   */
  getHistory(client, sessionId) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agent/chat/history', 'sse'),
      method: 'get',
      // 注意：AIClient.send 目前只会把 data 传给 httpAdapter，
      // 所以这里用 data，由 httpStub 在 GET 场景下自动转成 query string
      data: { chatId: sessionId }
    });
  },

  /**
   * 删除历史消息
   * @param {AIClient} client
   * @param {Object} data - 删除参数（通常包含 chatId）
   */
  deleteHistory(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agent/chat/delete', 'sse'),
      method: 'get',
      data
    });
  },

  /**
   * 创建会话/获取会话ID
   * @param {AIClient} client
   * @param {Object} data - 创建会话的参数
   */
  getChatId(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agent/chat/add', 'sse'),
      method: 'post',
      data
    });
  },

  /**
   * 评价消息
   * @param {AIClient} client
   * @param {Object} data - 评价参数
   * @note URL 在 proxy.js 中为空，需要确认实际接口地址
   */
  evaluateMessage(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agent/chat/evaluate', 'sse'),
      method: 'post',
      data
    });
  },

  /**
   * 发起流式对话
   * @param {AIClient} client 
   * @param {Object} options
   * @param {Object} options.data - 请求体
   * @param {AbortSignal} options.signal - 中断信号
   * @param {Function} options.onMessage - 消息回调
   * @param {Function} options.onComplete - 完成回调
   * @param {Function} options.onError - 错误回调
   * @param {string} [options.uploadType='img'] - 上传类型 (img/video)
   */
  chatStream(client, { data, signal, onMessage, onComplete, onError, uploadType = 'img' }) {
    // 根据环境或类型选择 URL
    // 注意：这里保留了之前的 URL 选择逻辑
    const apiPath = uploadType === 'img' 
      ? '/inspect/chat/web/agent/chat/app/stream/completion'
      : '/inspect/chat/web/agent/chat/multimodal/stream/completion';

    return client.send({
      url: buildUrl(client, apiPath, 'sse'),
      method: 'POST',
      data,
      stream: true,
      signal,
      onMessage,
      onComplete,
      onError
    });
  }
};


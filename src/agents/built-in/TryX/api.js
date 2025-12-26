// TryX 智能体 API 定义
import { buildUrl } from '@/utils/api-prefix';
const AGENT_ID = '1';
export const TryApi = {
  /**
   * 获取 OSS 上传凭证
   * @param {AIClient} client 
   */
  getOssToken(client) {
    return client.send({
      url: buildUrl(client, '/inspect/algorithm/models/upload/ossInfo', 'chain'),
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
      url: buildUrl(client, '/inspect/chat/web/agent/chat/list', 'chain'),
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
      url: buildUrl(client, '/inspect/chat/web/agent/chat/history', 'chain'),
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
      url: buildUrl(client, '/inspect/chat/web/agent/chat/delete', 'chain'),
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
      url: buildUrl(client, '/inspect/chat/web/agent/chat/add', 'chain'),
      method: 'post',
      data
    });
  },

  /**
   * 评价消息
   * @param {AIClient} client
   * @param {Object} data - { chatId, msgId, userEvaluation: 'UPVOTE'|'DOWNVOTE'|'NO_EVAL' }
   */
  evaluateMessage(client, data) {
    const { chatId, ...body } = data;
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/userEvaluation`, 'chain', '/api'),
      method: 'post',
      data: body
    });
  },

  /**
   * 重命名聊天
   * @param {AIClient} client
   * @param {Object} data - { chatId, title }
   */
  renameChatTitle(client, data) {
    const { chatId, ...body } = data;
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/renameChatTitle`, 'chain', '/api'),
      method: 'post',
      data: body
    });
  },

  /**
   * 聊天置顶/取消置顶
   * @param {AIClient} client
   * @param {Object} data - { chatId, pinned: boolean }
   * @note pinned 参数在 query 中传递
   */
  pinnedChat(client, data) {
    const { chatId, pinned } = data;
    // pinned 参数在 query 中，手动拼接 URL
    const url = `${buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/pinned`, 'chain', '/api')}?pinned=${pinned}`;
    return client.send({
      url,
      method: 'put',
      data: {}
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
      url: buildUrl(client, apiPath, '', ''),
      method: 'POST',
      data,
      stream: true,
      signal,
      onMessage,
      onComplete,
      onError
    });
  },
  
  getMonitors(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/taskconfig/taskConfigs/orgs/channels', 'chain'),
      method: 'get',
      data
    });
  },
  getDeviceValidateCode(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/device/devices/actions/getDeviceValidateCode', 'chain'),
      method: 'get',
      data
    });
  },
  getDeviceRamAccount(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/device/deviceRamAccount', 'chain'),
      method: 'get',
      data
    });
  },
  getCredentials(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/algorithm/models/upload/ossInfo', 'chain'),
      method: 'get',
      data
    });
  },
  getTokenStrategy(client, data) {
    return client.send({
      url: buildUrl(client, '/carrier/account/tkToken/getTokenStrategy', 'nissan'),
      method: 'get',
      data
    });
  },
  getTkToken(client, data) {
    return client.send({
      url: buildUrl(client, '/carrier/account/tkToken/getTkToken', 'nissan'),
      method: 'post',
      data
    });
  },
  getStoresTreeList(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/taskconfig/taskConfigs/actions/storeList', 'chain'),
      method: 'get',
      data
    });
  },
  remainingChatTimes(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agent/chat/remainingChatTimes', 'chain'),
      method: 'get',
      data
    });
  },
  refreshToken (client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/taskconfig/taskConfigs/actions/refreshToken', 'chain'),
      method: 'get',
      data
    });
  }
};


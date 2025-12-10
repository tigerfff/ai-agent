// TryX 智能体 API 定义 (基于 api-培训 文档更新)

const AGENT_ID = '2';

export const TryApi = {
  /**
   * 获取 OSS 上传凭证
   * @param {AIClient} client 
   */
  getOssToken(client) {
    // 文档中未提及 ossInfo 接口变更，暂时保留或需确认
    return client.send({
      url: '/v1/inspect/algorithm/models/upload/ossInfo',
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
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/list`,
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
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/history`,
      method: 'get',
      headers: {
        chatId: sessionId
      }
    });
  },

  /**
   * 删除会话
   * @param {AIClient} client
   * @param {Object} data - { chatId }
   */
  deleteHistory(client, data) {
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/delete`,
      method: 'get',
      data
    });
  },

  /**
   * 创建会话
   * @param {AIClient} client
   * @param {Object} data - { mineType, source }
   */
  getChatId(client, data) {
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/add`,
      method: 'post',
      data
    });
  },

  /**
   * 评价消息
   * @param {AIClient} client
   * @param {Object} data - { chatId, msgId, userEvaluation: 'UPVOTE'|'DOWNVOTE' }
   */
  evaluateMessage(client, data) {
    const { chatId, ...body } = data;
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/userEvaluation`,
      method: 'post',
      data: body
    });
  },

  /**
   * 发起流式对话
   * @param {AIClient} client 
   * @param {Object} options
   */
  chatStream(client, { data, signal, onMessage, onComplete, onError, uploadType = 'img' }) {
    // V2 接口统一使用 app/stream/completion
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/app/stream/completion`,
      method: 'POST',
      data,
      stream: true,
      signal,
      onMessage,
      onComplete,
      onError
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
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/renameChatTitle`,
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
    const url = `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/action/pinned?pinned=${pinned}`;
    return client.send({
      url,
      method: 'put',
      data: {}
    });
  },

  /**
   * 获取智能体推荐的提示词
   * @param {AIClient} client
   */
  getSuggestions(client) {
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/suggestions`,
      method: 'get'
    });
  },

  /**
   * 标记聊天已读
   * @param {AIClient} client
   * @param {Object} data - { chatId }
   */
  markAsRead(client, data) {
    const { chatId } = data;
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/read`,
      method: 'put',
      data: {}
    });
  }
};

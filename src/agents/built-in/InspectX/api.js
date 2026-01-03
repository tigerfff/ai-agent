// TryX 智能体 API 定义 (基于 api-培训 文档更新)

const AGENT_ID = '3';

import { buildUrl } from '@/utils/api-prefix';

export const InspectXApi = {
  /**
   * 获取 OSS 上传凭证
   * @param {AIClient} client 
   */
  getOssToken(client) {
    return client.send({
      url: buildUrl(client, '/inspect/algorithm/models/upload/ossInfo', 'chain', '/api'),
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
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/list`, 'chain', '/api'),
      method: 'get',
      data
    });
  },

  /**
   * 获取会话历史记录
   * @param {AIClient} client 
   * @param {string} sessionId 
   * @param {Object} params - { pagesize, key }
   */
  getHistory(client, sessionId, params = {}) {
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/historyScrolling`, 'chain', '/api'),
      method: 'get',
      data: { chatId: sessionId, ...params }
    });
  },

  /**
   * 删除会话
   * @param {AIClient} client
   * @param {Object} data - { chatId }
   */
  deleteHistory(client, data) {
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/delete`, 'chain', '/api'),
      method: 'delete',
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
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/add`, 'chain', '/api'),
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
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/userEvaluation`, 'chain', '/api'),
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
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/app/stream/completion`, '', ''),
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
   * 获取智能体推荐的提示词
   * @param {AIClient} client
   */
  getSuggestions(client) {
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/suggestions`, 'chain', '/api'),
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
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/read`, 'chain', '/api'),
      method: 'put',
      data: {}
    });
  },


  getProjectDetailByUser(client, projectId) {
    return client.send({
      url: buildUrl(client, `/enterprise/training/userProjects/actions/getProjectInfo/${projectId}`, 'chain', '/api'),
      method: 'get',
    });
  },


  // 通过storeId查询人
  listLearnersByStore(client, data = {}) {
    return client.send({
      url: buildUrl(client, `/chain/patrol/patrolAgent/action/listLearnersByStore`, 'chain', '/api'),
      method: 'get',
      data
    });
  },

  /**
   * 提交实操
   * @param {AIClient} client
   * @param {Object} data - 实操提交参数
   */
  submitOperation(client, data) {
    return client.send({
      url: buildUrl(client, `/enterprise/training/userProjects/actions/addOperation`, 'chain', '/api'),
      method: 'post',
      data
    });
  },



  /**
   * 获取智能体红点提示
   * @param {AIClient} client
   * @param {Object} data { agentIds: [] }
   */
  getAgentTip(client, data) {
    return client.send({
      url: buildUrl(client, '/inspect/chat/web/agentV2/actions/getAgentTip', 'chain', '/api'),
      method: 'POST',
      data
    });
  }
  
};

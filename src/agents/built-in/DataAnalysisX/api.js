import { buildUrl } from '@/utils/api-prefix';

const AGENT_ID = '4'; // 请修改为实际的智能体 ID

export const DataAnalysisXApi = {
  /**
   * 获取 OSS 上传凭证
   */
  getOssToken(client) {
    return client.send({
      url: buildUrl(client, '/inspect/algorithm/models/upload/ossInfo', 'chain', '/api'),
      method: 'get'
    });
  },

  /**
   * 获取会话列表
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
   */
  chatStream(client, { data, signal, onMessage, onComplete, onError }) {
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
   */
  pinnedChat(client, data) {
    const { chatId, pinned } = data;
    const url = `${buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/pinned`, 'chain', '/api')}?pinned=${pinned}`;
    return client.send({
      url,
      method: 'put',
      data: {}
    });
  },

  /**
   * 获取智能体推荐的提示词
   */
  getSuggestions(client) {
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/suggestions`, 'chain', '/api'),
      method: 'get'
    });
  },

  /**
   * 标记聊天已读
   */
  markAsRead(client, data) {
    const { chatId } = data;
    return client.send({
      url: buildUrl(client, `/inspect/chat/web/agentV2/${AGENT_ID}/chat/${chatId}/actions/read`, 'chain', '/api'),
      method: 'put',
      data: {}
    });
  },

  /**
   * 查发生不合格问题次数最多的问题
   */
  queryMostQuestion(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/aiAgent/actions/queryPatrolAgentMostQuestion', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 出现次数最多的那个问题项，对应的 top 3 门店
   */
  queryPatrolAgentMostStore(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/aiAgent/actions/queryPatrolAgentMostStore', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * topN 问题概览
   */
  queryStoreQuestionData(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/aiAgent/actions/queryPatrolAgentStoreQuestionData', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 查看 topN 问题图片
   */
  queryStoreQuestionPics(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/aiAgent/actions/queryPatrolAgentStoreQuestionPics', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 获取门店客流重点变化 topN
   */
  getPassengerChanges(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/aiAgent/actions/getPassengerChangesForDataAnalysis', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 获取客流环比 TOP/BOTTOM
   */
  getPassengerChainRateTopBottom(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/aiAgent/actions/getPassengerChainRateTopBottom', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 获取区域门店树（获取根节点 ID）
   */
  getAreaTree(client) {
    return client.send({
      url: buildUrl(client, '/chain/basic/areas/actions/findAreaStoreTree', 'chain', '/api'),
      method: 'get'
    });
  },

  /**
   * 查询门店评分排行
   */
  queryStoreRank(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/patrols/actions/queryStoreRank', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 查询问题项统计
   */
  queryQuestionRank(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/patrols/template/question', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 模糊查询区域或门店列表
   */
  searchAreaList(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/basic/users/actions/findUserAreaStoreListByNodeName', 'chain', '/api'),
      method: 'get',
      data
    });
  },

  /**
   * 客流排行统计
   */
  queryPassengerRank(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/passenger/ranks/actions/agentPassengerRank', 'chain', '/api'),
      method: 'post',
      data
    });
  },

  /**
   * 客流排行导出
   */
  exportPassengerRank(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/passenger/exports/actions/agentExportRankData', 'chain', '/api'),
      method: 'post',
      data
    });
  },
 
  /**
   * 巡查区域报表导出
   */
  exportPatrolAreaOverview(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/statistic/patrols/center/export/actions/patrolAreaOverview', 'chain', '/api'),
      method: 'post',
      data
    });
  },

   /**
   * 推送报告导出
   */
   pdfExport(client, data) {
    return client.send({
      url: buildUrl(client, '/chain/export/patrol/aiAgent/pdf/export', 'chain', '/api'),
      method: 'post',
      data
    });
  }

};
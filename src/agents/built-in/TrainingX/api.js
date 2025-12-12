// TryX 智能体 API 定义 (基于 api-培训 文档更新)

const AGENT_ID = '2';

export const TrainingXApi = {
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
      method: 'get',
      data
    });
  },

  /**
   * 获取会话历史记录
   * @param {AIClient} client 
   * @param {string} sessionId 
   */
  getHistory(client, sessionId) {
    console.log('sessionId', sessionId)
    return client.send({
      url: `/v1/inspect/chat/web/agentV2/${AGENT_ID}/chat/history`,
      method: 'get',
      data: { chatId: sessionId }
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
  },

  /**
   * 获取 ASR 签名
   * @param {AIClient} client
   * @param {Object} [data] - 可选参数，如 { body: '待签名字符串' }
   */
  getAsrSign(client, data = {}) {
    return client.send({
      url: '/web/asr/actions/getSign',
      method: 'post',
      data
    });
  },

  /**
   * 获取项目详情
   * @param {AIClient} client
   * @param {string} projectId
   */
  getProjectDetail(client, projectId) {
    return client.send({
      url: `/v1/enterprise/training/projects/${projectId}`,
      method: 'get',
      baseURL: '' // 使用完整 URL
    });
  },

  /**
   * 获取课程详情
   * @param {AIClient} client
   * @param {string} courseId
   */
  getCourseDetail(client, courseId) {
    return client.send({
      url: `/v1/enterprise/training/course`,
      method: 'get',
      data: { courseId },
      baseURL: '' // 使用完整 URL
    });
  },

  /**
   * 获取人员信息 (Mock)
   * @param {AIClient} client
   * @param {Array<string>} userIds
   */
  getPersonnelInfo(client, userIds) {
    // 模拟异步请求
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers = userIds.map(id => ({
          id,
          name: id === '4649d25a7be14f7bb1106219b3bec89c' ? '张三' : (id === 'bbbb' ? '李四' : `用户${id.slice(0, 4)}`)
        }));
        resolve({
          code: 0,
          data: mockUsers,
          msg: 'success'
        });
      }, 500);
    });
  },

  /**
   * 获取项目列表（支持搜索和分页）
   * @param {AIClient} client
   * @param {Object} params - { projectName, pageNo, pageSize, containSub, projectStatus, projectType }
   */
  getProjectList(client, data = {}) {
    return client.send({
      url: `/v1/enterprise/training/projects`,
      method: 'get',
      data // GET 请求的 data 可能不会被使用，但为了兼容性保留
    });
  },

  /**
   * 获取课程列表（支持搜索和分页）
   * @param {AIClient} client
   * @param {Object} params - { name, pageNo, pageSize, state, classId, orderName, orderType, subClass, type }
   */
  getCourseList(client, data = {}) {
    return client.send({
      url: `/v1/enterprise/training/course/list`,
      method: 'get',
      data // GET 请求的 data 可能不会被使用，但为了兼容性保留
    });
  },

  getCourseList(client, data = {}) {
    return client.send({
      url: `/v1/enterprise/training/course/list`,
      method: 'get',
      data // GET 请求的 data 可能不会被使用，但为了兼容性保留
    });
  },

  // 通过storeId查询人
  listLearnersByStore(client, data = {}) {
    return client.send({
      url: `/v1/chain/patrol/patrolAgent/action/listLearnersByStore`,
      method: 'get',
      data // GET 请求的 data 可能不会被使用，但为了兼容性保留
    });
  },

  /**
   * 提交实操
   * @param {AIClient} client
   * @param {Object} data - 实操提交参数
   */
  submitOperation(client, data) {
    return client.send({
      url: '/v1/enterprise/training/userProjects/actions/addOperation',
      method: 'post',
      data,
      baseURL: '' // 使用完整 URL
    });
  },
  
};

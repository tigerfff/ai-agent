// TryX 智能体 API 定义 (基于 api-培训 文档更新)

const AGENT_ID = '2';

export const orgPersonPagedPickerApi = {
  /**
   * 获取用户列表（支持搜索和分页）
   * @param {AIClient} client
   * @param {Object} params - { name, pageNo, pageSize, state, classId, orderName, orderType, subClass, type }
   */
  findUserListAdminAuthority(client,data = {}) {
    return client.send({
      url: '/v1/chain/basic/users/actions/findUserListAdminAuthority',
      method: 'get',
      data // GET 请求的 data 可能不会被使用，但为了兼容性保留
    });
  },


  // 获取职位列表
  getRoleList(client,data = {}) {
    return client.send({
      url: '/safe-center/auth/centerRole/actions/list',
      method: 'get',
      data // GET 请求的 data 可能不会被使用，但为了兼容性保留
    });
  },
  
  // 获取组织树
  async findOrgTreeByParentId(client,data = {}) {
    const { data: departmentList } = await client.send({
      method: 'get',
      url: '/v1/chain/basic/organizations/actions/findOrgTreeByParentId',
      data
    })
    return {
      code: 0,
      data: departmentList || []
    }
  },
};

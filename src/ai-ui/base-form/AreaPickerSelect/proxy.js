import { buildUrl } from '@/utils/api-prefix';

export const AreaPickerApi = {
  /**
   * 查询区域树
   * @param {AIClient} client
   * @param {Object} [data] - 查询参数 { needStore, nodeId }
   */
  findAreaStoreTreeForBusiness(client, data = {}) {
    return client.send({
      url: buildUrl(client, '/chain/basic/areas/actions/findAreaStoreTree', 'chain', '/api'),
      method: 'get',
      data
    });
  },

  /**
   * 搜索区域列表
   * @param {AIClient} client
   * @param {Object} [data] - 查询参数 { condition, limit, isLeafArea }
   */
  searchAreaListForBusiness(client, data = {}) {
    return client.send({
      url: buildUrl(client, '/chain/basic/users/actions/findUserAreaStoreListByNodeName', 'chain', '/api'),
      method: 'get',
      data
    });
  },
};


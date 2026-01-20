/**
 * 跳转到智能巡店-区域报表页面并带入参数
 * @param {Object} options 
 * @param {number} options.patrolType - 0: 考评, 1: 点检
 * @param {string} options.tabType - 'store': 门店维度, 'area': 区域维度
 * @param {string} options.startDate - 开始日期 (如: '2026-01-01')
 * @param {string} options.endDate - 结束日期 (如: '2026-01-20')
 * @param {string} options.patrolTemplateId - 模板ID
 * @param {string} [options.planConfigId] - 任务/计划ID (可选)
 * @param {Array} options.nodeList - 区域/门店列表，格式: [{nodeId: 'ID', nodeType: 0}, ...] (0区域, 1门店)
 */
export function navigateToAreaReport(options) {
  // 1. 构造参数对象（保持与 index.vue 预期的结构一致）
  const pageQueryData = {
    patrolType: options.patrolType ?? 0,
    tabType: options.tabType || 'store',
    startDate: options.startDate,
    endDate: options.endDate,
    patrolTemplateId: options.patrolTemplateId,
    planConfigId: options.planConfigId || '',
    nodeList: options.nodeList || [],
    // 如果有排序需求可以带上
    orderField: options.orderField,
    orderFlag: options.orderFlag 
  };

  // 2. 存入 localStorage (目标页面会从这里取数据)
  localStorage.setItem('pageQueryData', JSON.stringify(pageQueryData));

  // 3. 执行跳转（使用 window.open 在新标签页打开）
  // 注意：必须带上 query 参数 pageQueryData=1，否则目标页面判断不通过
  const path = '/inspect/intelliInspect/areaReport';
  const url = `${window.location.origin}${window.location.pathname}#${path}?pageQueryData=1`;
  
  window.open(url, '_blank');
}

/**
 * 跳转到客流排名页面并传入时间
 * @param {string} startTime - '2026-01-01'
 * @param {string} endTime - '2026-01-20'
 */
export function navigateToPassengerRank(startTime, endTime) {
  const path = '/datum/passengerStatistical/ranking';
  const url = `${window.location.origin}${window.location.pathname}#${path}?startTime=${startTime}&endTime=${endTime}`;
  
  window.open(url, '_blank');
}

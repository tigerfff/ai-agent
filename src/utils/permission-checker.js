import { TrainingXApi } from '@/agents/built-in/TrainingX/api';

/**
 * 权限状态常量
 */
export const PERMISSION_STATUS = {
  HAS_PERMISSION: 'has_permission',
  NO_SERVICE: 'no_service',
  NO_PERMISSION: 'no_permission',
  UNDER_CONSTRUCTION: 'under_construction'
};

/**
 * 检查服务白名单 (TrainingX 等需要判断是否购买服务)
 * @param {Object} config - { url, method, data? }
 * @param {string} userId - 当前用户 ID
 * @param {Object} client - AIClient 实例
 */
async function checkServiceWhitelist(config, userId, client) {
  if (!config || !config.url) return true; // 没有配置则默认通过
  if (!userId) return false; // 必须要有 userId

  try {
    const requestUrl = typeof config.url === 'function' ? config.url(client) : config.url;
    const res = await client.send({
      url: requestUrl,
      method: config.method || 'get',
      data: { ...config.data, storeId: null } // 某些接口可能需要 storeId，这里先只传 data
    });

    if (res.code === 0 && Array.isArray(res.data)) {
      // 接口返回白名单用户 ID 列表
      return res.data.includes(userId);
    }
    return false;
  } catch (e) {
    console.error('[Permission] Check service failed', e);
    return false; // 接口异常视为无权限
  }
}

/**
 * 检查本地权限码 (通用权限判断)
 * @param {Object} config - { permissionCodeKey, permissionCode, permissionMode? }
 * permissionMode: 'or' | 'and' - 默认 'or'（只要有一个匹配就通过）
 */
function checkLocalAuth(config) {
  if (!config || !config.permissionCodeKey) return true;
  
  // 支持单个权限码或权限码数组
  const permissionCodes = Array.isArray(config.permissionCode) 
    ? config.permissionCode 
    : (config.permissionCode ? [config.permissionCode] : []);
  
  // 如果没有配置权限码，默认通过
  if (permissionCodes.length === 0) return true;

  try {
    const stored = localStorage.getItem(config.permissionCodeKey);
    if (!stored) return false;

    // 假设存储的是逗号分隔的字符串或 JSON 数组
    let codes = [];
    if (stored.startsWith('[')) {
      codes = JSON.parse(stored);
    } else {
      codes = stored.split(',');
    }

    // 根据模式判断：'and' 需要全部匹配，'or' 只要有一个匹配
    const mode = config.permissionMode || 'or';
    if (mode === 'and') {
      // AND 逻辑：全部权限码都要匹配
      return permissionCodes.every(code => codes.includes(code));
    } else {
      // OR 逻辑：只要有一个权限码匹配就通过（默认）
      return permissionCodes.some(code => codes.includes(code));
    }
  } catch (e) {
    console.error('[Permission] Check local auth failed', e);
    return false;
  }
}


/**
 * 核心：检查智能体权限
 * @param {Object} client - AIClient 实例 (用于发请求)
 * @param {string} userId - 当前用户 ID
 * @param {Object} agent - 智能体配置对象
 */
export async function checkAgentPermission(client, userId, agent) {
  const { permission } = agent;
  
  // 0. 如果没有配置权限，默认放行
  if (!permission) {
    return { status: PERMISSION_STATUS.HAS_PERMISSION };
  }

  // 1. 检查建设中状态 (Under Construction)
  // 优先级最高，如果是建设中，直接拦截
  if (permission.underConstruction) {
    return { status: PERMISSION_STATUS.UNDER_CONSTRUCTION };
  }

  // 2. 检查服务购买状态 (Service Check)
  // 例如：TrainingX 需要检查是否购买了培训服务
  if (permission.checkService) {
    const hasService = await checkServiceWhitelist(
      permission.serviceCheckConfig || permission.serviceCheckApi, // 兼容字段
      userId,
      client
    );
    
    if (!hasService) {
      return { 
        status: PERMISSION_STATUS.NO_SERVICE,
        message: `请联系管理员扫码添加销售人员进行购买`
      };
    }
  }

  // 3. 检查功能权限码 (Auth Code Check)
  // 通用检查：localStorage 中的权限码
  if (permission.checkAuth || permission.checkPermission) { // 兼容 checkPermission 字段
    const hasAuth = checkLocalAuth(permission);
    
    if (!hasAuth) {
      return {
        status: PERMISSION_STATUS.NO_PERMISSION,
        message: `请联系管理员开通对应的模块权限`
      };
    }
  }

  // 4. 自定义/外部接口适配 (Custom Check)
  // 例如：数据分析需要调用特殊的外部接口
  if (typeof permission.customCheck === 'function') {
    const context = { client, userId, agent };
    const result = await permission.customCheck(context);
    // 如果 customCheck 返回了明确的状态（非 HAS_PERMISSION），则拦截
    if (result && result.status && result.status !== PERMISSION_STATUS.HAS_PERMISSION) {
      return result;
    }
  }

  // 5. 全部通过
  return { status: PERMISSION_STATUS.HAS_PERMISSION };
}

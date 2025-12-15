/**
 * 权限检查服务
 */

/**
 * 权限状态枚举
 */
export const PERMISSION_STATUS = {
  HAS_PERMISSION: 'has_permission',      // 有权限
  NO_SERVICE: 'no_service',              // 未购买服务
  NO_PERMISSION: 'no_permission'        // 已购买服务但无权限码
};

/**
 * 从 localStorage 获取权限码字符串
 * @param {string} codeKey - 权限码在 localStorage 中的 key（如 'RETAIL_AUTH'）
 * @returns {string|null} 权限码值（可能是逗号分隔的字符串、JSON 字符串等）
 */
function getPermissionCodeString(codeKey) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    return localStorage.getItem(codeKey);
  } catch (e) {
    console.warn('[PermissionChecker] Failed to get permission code from localStorage:', e);
    return null;
  }
}

/**
 * 检查权限码是否存在
 * @param {string} codeKey - 权限码在 localStorage 中的 key（如 'RETAIL_AUTH'）
 * @param {string} permissionCode - 要检查的具体权限码（如 '21001'）
 * @returns {boolean} 是否有权限码
 */
function hasPermissionCode(codeKey, permissionCode) {
  if (!codeKey || !permissionCode) {
    return false;
  }
  
  const codeString = getPermissionCodeString(codeKey);
  if (!codeString || codeString === '' || codeString === 'undefined') {
    return false;
  }

  // 尝试解析为 JSON（如果是 JSON 格式）
  let codes = null;
  try {
    codes = JSON.parse(codeString);
    // 如果是数组，转换为字符串数组
    if (Array.isArray(codes)) {
      codes = codes.map(c => String(c));
    } else if (typeof codes === 'object') {
      // 如果是对象，检查对象的值
      codes = Object.values(codes).map(c => String(c));
    } else {
      // 如果不是数组或对象，当作字符串处理
      codes = String(codes);
    }
  } catch (e) {
    // 不是 JSON，当作普通字符串处理（可能是逗号分隔的字符串）
    codes = codeString;
  }

  // 检查是否包含指定的权限码
  if (Array.isArray(codes)) {
    return codes.includes(String(permissionCode));
  } else if (typeof codes === 'string') {
    // 字符串可能是逗号分隔的，或者直接就是权限码
    const codeStr = String(permissionCode);
    // 检查完全匹配或作为子字符串存在（用逗号分隔）
    return codes === codeStr || 
           codes.split(',').map(c => c.trim()).includes(codeStr) ||
           codes.includes(codeStr);
  }

  return false;
}

/**
 * 检查智能体权限
 * @param {Object} client - AIClient 实例
 * @param {string} agentId - 智能体 ID
 * @param {Object} permissionConfig - 权限配置（从 agent-config.js 中的 permission 字段获取）
 * @returns {Promise<{status: string, message?: string}>}
 */
export async function checkAgentPermission(client, agentId, permissionConfig) {
  if (!permissionConfig) {
    // 如果没有配置权限检查，默认有权限
    return Promise.resolve({
      status: PERMISSION_STATUS.HAS_PERMISSION
    });
  }

  const { 
    checkService, 
    checkPermission, 
    serviceName, 
    permissionName, 
    permissionCodeKey,  // localStorage 的 key（如 'RETAIL_AUTH'）
    permissionCode      // 要检查的具体权限码（如 '21001'）
  } = permissionConfig;

  // 1. 检查服务购买状态（需要调用接口）
  if (checkService && permissionConfig.serviceCheckApi) {
    try {
      const res = await client.send({
        url: permissionConfig.serviceCheckApi.url,
        method: permissionConfig.serviceCheckApi.method || 'get',
        data: permissionConfig.serviceCheckApi.data || {}
      });

      // 根据接口返回判断是否购买了服务
      // TODO: 根据实际接口返回结构调整判断逻辑
      const hasService = res?.data?.hasService !== false && res?.code === 0;
      
      if (!hasService) {
        return {
          status: PERMISSION_STATUS.NO_SERVICE,
          message: `您尚未购买${serviceName}，请联系管理员开通`
        };
      }
    } catch (e) {
      console.error(`[PermissionChecker] Service check failed for ${agentId}:`, e);
      // 接口调用失败，降级处理：默认认为有服务，继续检查权限码
    }
  }

  // 2. 检查权限码（从 localStorage 读取）
  if (checkPermission && permissionCodeKey && permissionCode) {
    const hasCode = hasPermissionCode(permissionCodeKey, permissionCode);
    
    if (!hasCode) {
      return {
        status: PERMISSION_STATUS.NO_PERMISSION,
        message: `您已购买${serviceName}，但暂无${permissionName}，请联系管理员开通`
      };
    }
  }

  // 3. 都有权限
  return {
    status: PERMISSION_STATUS.HAS_PERMISSION
  };
}

/**
 * 批量检查多个智能体的权限
 * @param {Object} client - AIClient 实例
 * @param {Array<Object>} agents - 智能体配置数组（包含 id 和 permission 配置）
 * @returns {Promise<Object>} 返回 { agentId: {status, message} } 的映射
 */
export async function checkAgentsPermissions(client, agents) {
  const results = {};
  await Promise.all(
    agents.map(async (agent) => {
      results[agent.id] = await checkAgentPermission(client, agent.id, agent.permission);
    })
  );
  return results;
}


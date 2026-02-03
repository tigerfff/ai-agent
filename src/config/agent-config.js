import TrainingXAgent from '@/agents/built-in/TrainingX/index.vue';
import TryAgent from '@/agents/built-in/TryX/index.vue';
import InspectX from '@/agents/built-in/InspectX/index.vue';
import DataAnalysisXAgent from '@/agents/built-in/DataAnalysisX/index.vue';
import { buildUrl } from '@/utils/api-prefix';

// 导入图标资源
import inspectIcon from '@images/inspect@3x.png';
import dataAnalysisIcon from '@images/data-analysis@3x.png';
import tryXIcon from '@images/try-x@3x.png';
import trainingIcon from '@images/training@3x.png';
import sopIcon from '@images/sop@3x.png';

import tryIcon from '@/assets/images/try.png';
import sopHomeIcon from '@/assets/images/sop.png';
import trainingHomeIcon from '@/assets/images/training.png';
import inspectSquareIcon from '@/assets/images/inspect-square.png';
import dataAnalysisHomeIcon from '@/assets/images/data-analysis-home.png';

// 业务线枚举
export const BUSINESS_LINES = {
  RETAIL: 'retail',      // 零售
  MINERVA: 'minerva',    // 教学
  PORTAL: 'portal',      // 官网
  OPEN: 'open',      // 开发者
  ENTERPRISE: 'enterprise', // 企业
  AIOT: 'aiot',          // 智联
  CUSTOM: 'custom',      // 自定义（由外部指定展示哪些 ID）
  DEFAULT: 'default'      // 默认（所有智能体）
};

// 所有可用的智能体定义
export const ALL_AGENTS = {
  'inspect-x': {
    id: '3',
    name: '智慧巡查',
    miniName:'巡查',
    icon: inspectIcon,
    homeIcon: inspectSquareIcon,
    description: '通过对话快速进行多门店巡查，提高巡查效率，降低人力成本',
    type: 'built-in',
    tags: ['对话模型', '机器视觉'],
    hideConversations: false,
    component: InspectX, // 暂时复用 TryAgent，实际应为 InspectAgent
    sort: 1, // 排序字段，数字越小越靠前
    permission: {
      underConstruction: false, // 建设中
      serviceName: '巡查服务',
      permissionName: '巡查权限',

      // 1. 检查服务购买 (白名单)
      checkService: true,
      serviceCheckConfig: {
        url: (client) => buildUrl(client, '/chain/patrol/patrolAgent/action/listLearnersByStore', 'chain', '/api'), // 白名单接口
        method: 'get',
        data: {}
      },

      // 2. 检查权限码 (LocalStorage)
      checkAuth: true,
      permissionCodeKey: 'authorities', // localStorage 中权限码的 key
      permissionCode: ["RETAIL_AUTH_04017"],        // 要检查的具体权限码
      // 将来开发完成后开启
      // checkService: true,
      // serviceCheckConfig: { url: '...', method: 'get' }
    }
  },

  'data-analysis-x': {
    id: '4',
    name: '数据分析',
    miniName:'分析',
    icon: dataAnalysisIcon,
    homeIcon: dataAnalysisHomeIcon,
    description: '深入分析门店运营数据，智能发现潜在问题并提供改进建议。',
    type: 'built-in',
    businessGroup: 'data-analysis', // 业务组标识
    tags: ['数据建模', '智能分析'],
    hideConversations: false,
    component: DataAnalysisXAgent,
    sort: 2, // 排序字段
    permission: {
      serviceName: '数据分析服务',        // 服务名称（用于提示）
      permissionName: '巡查统计权限',   // 权限名称（用于提示）
      
      // 1. 检查服务购买 (白名单)
      checkService: true,
      serviceCheckConfig: {
        url: (client) => buildUrl(client, '/chain/patrol/patrolAgent/action/listLearnersByStore', 'chain', '/api'), // 白名单接口
        method: 'get',
        data: {}
      },

      // 2. 检查权限码 (LocalStorage)
      checkAuth: false,
      permissionCodeKey: 'authorities', // localStorage 中权限码的 key
      permissionCode: [],        // 要检查的具体权限码
    }
  },

  'try-x': {
    id: '1',
    name: 'AI试用',
    miniName:'AI试用',
    icon: tryXIcon,
    homeIcon: tryIcon,
    description: '智能识别图片、视频内的违规行为。',
    tags: ['对话模型', '机器视觉'],
    type: 'built-in',
    component: TryAgent,
    sort: 3, // 排序字段，数字越小越靠前
    // AI试用通常对所有人开放，无需特殊权限
    permission: null 
  },
  'training-x': {
    id: '2',
    name: '员工培训助手',
    miniName:'培训',
    icon: trainingIcon,
    homeIcon: trainingHomeIcon,
    description: '结合近期运营情况，智能推荐学习任务。',
    type: 'built-in',
    tags: ['大语言模型'],
    component: TrainingXAgent,
    sort: 4, // 排序字段，数字越小越靠前
    // 权限配置
    permission: {
      serviceName: '培训服务',        // 服务名称（用于提示）
      permissionName: '培训权限码',   // 权限名称（用于提示）
      
      // 1. 检查服务购买 (白名单)
      checkService: true,
      serviceCheckConfig: {
        url: (client) => buildUrl(client, '/chain/patrol/patrolAgent/action/listLearnersByStore', 'chain', '/api'), // 白名单接口
        method: 'get',
        data: {}
      },

      // 2. 检查权限码 (LocalStorage)
      checkAuth: true,
      permissionCodeKey: 'authorities', // localStorage 中权限码的 key
      permissionCode: ["RETAIL_AUTH_21","RETAIL_AUTH_21001","RETAIL_AUTH_21003","RETAIL_AUTH_21003001","RETAIL_AUTH_21003003","RETAIL_AUTH_21003005","RETAIL_AUTH_21005","RETAIL_AUTH_21005001","RETAIL_AUTH_21005003","RETAIL_AUTH_21005005","RETAIL_AUTH_21007","RETAIL_AUTH_21007001","RETAIL_AUTH_21007003","RETAIL_AUTH_21007005","RETAIL_AUTH_21007007","RETAIL_AUTH_21009","RETAIL_AUTH_21009001","RETAIL_AUTH_21009003","RETAIL_AUTH_21009005","RETAIL_AUTH_21011","RETAIL_AUTH_21011001","RETAIL_AUTH_21011003","RETAIL_AUTH_21011005","RETAIL_AUTH_21011007","RETAIL_AUTH_21011009","RETAIL_AUTH_21011011","RETAIL_AUTH_21013","RETAIL_AUTH_21013001","RETAIL_AUTH_21015","RETAIL_AUTH_21015001","RETAIL_AUTH_21015003","RETAIL_AUTH_21017","RETAIL_AUTH_21017001","RETAIL_AUTH_21017003","RETAIL_AUTH_21019","RETAIL_AUTH_21019001","RETAIL_AUTH_21019003","RETAIL_AUTH_21019005"],        // 要检查的具体权限码
    }
  },
  'sop-generation': {
    id: 'sop-generation',
    name: 'SOP生成',
    miniName:'SOP',
    icon: sopIcon,
    homeIcon: sopHomeIcon,
    description: '简单对话智能生成 SOP 模板',
    type: 'external', // 外部链接类型
    tags: ['SOP', '效率'],
    sort: 5, // 排序字段，数字越小越靠前
    // 外部链接地址（使用当前域名）
    getUrl: () => {
      window.localStorage.removeItem('Chain_IntelliInspect_addMode')
      // 根据当前域名动态构建 URL
      const origin = window.location.origin;
      return `${origin}/chain/index.html#/inspect/config/template`;
    },
    // 权限配置
    permission: {
      serviceName: '巡查服务',        // 服务名称（用于提示）
      permissionName: 'SOP权限码',     // 权限名称（用于提示）
      
      checkService: false,
      

      checkAuth: true,
      permissionCodeKey: 'authorities', // localStorage 中权限码的 key
      permissionCode: 'RETAIL_AUTH_04007',          // 要检查的具体权限码
    } 
  }
};

// 业务线与智能体的映射配置
export const BUSINESS_LINE_AGENTS = {
  [BUSINESS_LINES.RETAIL]: [
    'inspect-x',
    'try-x',
    'training-x',
    'data-analysis-x'
  ],
  [BUSINESS_LINES.MINERVA]: [
    'training-x',
  ],
  [BUSINESS_LINES.PORTAL]: [
    'try-x'
  ],
  [BUSINESS_LINES.OPEN]: [
    'try-x'
  ],
  [BUSINESS_LINES.ENTERPRISE]: [
    'inspect-x',
    'data-analysis',
    'try-x',
    'training-x',
    'sop-generation'
  ],
  [BUSINESS_LINES.AIOT]: [
    'try-x',
  ],
  [BUSINESS_LINES.DEFAULT]: [
    'inspect-x',
    'data-analysis',
    'try-x',
    'training-x',
    'sop-generation'
  ]
};

/**
 * 根据业务线获取对应的智能体列表
 * @param {string} businessLine - 业务线标识
 * @returns {Array} 智能体配置数组
 */
export function getAgentsByBusinessLine(businessLine = BUSINESS_LINES.DEFAULT) {
  // 如果是 custom 类型，默认返回空，由组件内部处理 agentIds
  if (businessLine === BUSINESS_LINES.CUSTOM) return [];

  const agentIds = BUSINESS_LINE_AGENTS[businessLine] || BUSINESS_LINE_AGENTS[BUSINESS_LINES.DEFAULT];
  const agents = agentIds.map(id => ALL_AGENTS[id]).filter(Boolean);
  
  // 根据 sort 字段排序，数字越小越靠前，如果没有 sort 字段则排在最后
  return agents.sort((a, b) => {
    const sortA = a.sort !== undefined ? a.sort : 999;
    const sortB = b.sort !== undefined ? b.sort : 999;
    return sortA - sortB;
  });
}

/**
 * 获取当前业务线（可以从环境变量、URL参数等获取）
 * @returns {string} 业务线标识
 */
export function getCurrentBusinessLine() {
  // 方式1: 从环境变量获取
  if (typeof process !== 'undefined' && process.env?.VUE_APP_BUSINESS_LINE) {
    return process.env.VUE_APP_BUSINESS_LINE;
  }
  
  // 方式2: 从 URL 参数获取
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const line = params.get('businessLine');
    if (line && Object.values(BUSINESS_LINES).includes(line)) {
      return line;
    }
  }
  
  // 方式3: 从 localStorage 获取
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('businessLine');
    if (stored && Object.values(BUSINESS_LINES).includes(stored)) {
      return stored;
    }
  }
  
  // 默认返回
  return BUSINESS_LINES.DEFAULT;
}

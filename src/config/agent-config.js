import TrainingXAgent from '@/agents/built-in/TrainingX/index.vue';
import TryAgent from '@/agents/built-in/TryX/index.vue';
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
  ENTERPRISE: 'enterprise', // 企业
  AIOT: 'aiot',          // 智联
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
    description: '智能巡查助手，帮助您高效完成巡查任务。',
    type: 'built-in',
    tags: ['巡查', '安防'],
    hideConversations: true,
    component: TryAgent, // 暂时复用 TryAgent，实际应为 InspectAgent
    permission: {
      underConstruction: true, // 建设中
      serviceName: '巡查服务',
      permissionName: '巡查权限',
      // 将来开发完成后开启
      // checkService: true,
      // serviceCheckConfig: { url: '...', method: 'get' }
    }
  },
  // 'data-analysis': {
  //   id: 'data-analysis',
  //   name: '数据分析',
  //   miniName:'数据',
  //   icon: dataAnalysisIcon,
  //   homeIcon: dataAnalysisHomeIcon,
  //   description: '深度挖掘数据价值，辅助业务决策。',
  //   type: 'built-in',
  //   tags: ['数据', '分析'],
  //   component: TryAgent, // 暂时复用
  //   permission: {
  //     serviceName: '数据服务',
  //     permissionName: '数据分析权限',
  //     checkService: false, 
  //     checkAuth: false,
  //     // 自定义外部接口检查
  //     customCheck: async ({ client, userId }) => {
  //       try {
  //         // 假设接口是 /api/external/check_access (需根据实际接口修改)
  //         // 这里仅为示例，实际请替换为真实接口
  //         // const res = await client.send({
  //         //   url: '/api/external/check_access',
  //         //   method: 'GET',
  //         //   data: { uid: userId }
  //         // });
  //         // if (res.code === 0 && res.data === true) {
  //         //   return { status: 'has_permission' };
  //         // }
  //         // return { status: 'no_permission', message: '暂无数据分析权限' };
          
  //         // 暂时放行，方便演示
  //         return { status: 'has_permission' };
  //       } catch (e) {
  //         return { status: 'no_permission', message: '权限检查服务异常' };
  //       }
  //     }
  //   }
  // },
  'try-x': {
    id: '1',
    name: 'AI试用',
    miniName:'AI试用',
    icon: tryXIcon,
    homeIcon: tryIcon,
    description: 'AI试用助手，可以帮你快速体验各种 AI 功能',
    tags: ['试用', 'AI'],
    type: 'built-in',
    component: TryAgent,
    // AI试用通常对所有人开放，无需特殊权限
    permission: null 
  },
  'training-x': {
    id: '2',
    name: '员工培训助手',
    miniName:'培训',
    icon: trainingIcon,
    homeIcon: trainingHomeIcon,
    description: '专业的培训助手，帮助你快速学习。',
    type: 'built-in',
    tags: ['培训', '学习'],
    component: TrainingXAgent,
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
      permissionCode: 'RETAIL_AUTH_21',         // 要检查的具体权限码
    }
  },
  'sop-generation': {
    id: 'sop-generation',
    name: 'SOP生成',
    miniName:'SOP',
    icon: sopIcon,
    homeIcon: sopHomeIcon,
    description: '标准化作业流程生成助手。',
    type: 'external', // 外部链接类型
    tags: ['SOP', '效率'],
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
    'try-x',
    'training-x',
    'sop-generation',
    'data-analysis'
  ],
  [BUSINESS_LINES.MINERVA]: [
    'training-x',
  ],
  [BUSINESS_LINES.PORTAL]: [
    'inspect-x',
    'data-analysis',
    'try-x',
    'training-x',
    'sop-generation'
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
  const agentIds = BUSINESS_LINE_AGENTS[businessLine] || BUSINESS_LINE_AGENTS[BUSINESS_LINES.DEFAULT];
  return agentIds.map(id => ALL_AGENTS[id]).filter(Boolean);
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

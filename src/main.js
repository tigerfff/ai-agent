import Vue from 'vue'
import App from './App.vue'
import '@/style/vars.scss'
import '@/assets/reset.css'
import 'hui/lib/hui.css'
import '@hcu/packages/theme-chalk/index.css'

import '@/style/message-box.scss'
import '@/style/select.scss'
import Hui from 'hui/lib/hui.esm-browser.js'
import HikCloudUI from '@hcu/hik-cloud-ui.es.js'
import VLazyComponent from 'v-lazy-component/vue2'
import imgCanvas from './demo/ImgCanvas.vue'
import ImageDrawViewer from './demo/ImageDrawViewer.vue'
import RightAsideContainer from './demo/RightAsideContainer.vue'
// 引入我们刚开发的组件库
import AIComponentLib from './index.js'
import { TRACK_EVENTS } from './utils/event-tracker'
// 简化版 http 封装，用来在本项目里模拟父项目的 this.$http / this.$aiClient 行为
import http from './demo/httpStub'
// 从 URL 参数同步 token 到 cookie
import { syncTokenFromUrl } from './utils'

// 在应用启动前，从 URL 参数中读取 token 并写入 cookie
syncTokenFromUrl('token', 'accessToken', {
  expires: 30, // 30 天过期
  path: '/'
});

Vue.use(Hui)
Vue.use(HikCloudUI)
Vue.use(VLazyComponent)
console.log(VLazyComponent)
Vue.prototype.applicationSceneName = '监狱'

// 本地开发 Demo 用：注册组件
Vue.component('imgCanvas', imgCanvas);
Vue.component('ImageDrawViewer', ImageDrawViewer);
Vue.component('RightAsideContainer', RightAsideContainer);

// 全局注册 HikCloudOrganizer 组件
// Vue.component('hikCloudOrganization', HikCloudOrganizer)

// 注册组件库
Vue.use(AIComponentLib, {
  // 1. 注入 HTTP 能力
  // AIClient 会调用 httpAdapter(method, url, data)
  // 这里用 httpStub 来模拟父项目里的 http(type, url, data)
  http: (method, url, data) => {
    // 与 aiModal/index.js 保持一致：方法名统一用小写
    const type = (method || 'post').toLowerCase()
    return http(type, url, data)
  },
  
  // 2. 注入配置提供者
  configProvider: () => ({
    baseUrl: '/api', // 父项目 API 地址（默认）
    headers: {},
    // 标准化前缀映射，父项目按需覆盖
    prefixMap: {
      chain: '/api',
    }
  }),

  // 3. 注入埋点配置 (参考 web 云小智-表格 1.csv)
  sendClickMessage: (data) => {
    console.log('%c[父项目埋点 SDK] 收到埋点请求:', 'color: #409EFF; font-weight: bold;', data);
    // 这里可以根据 data.lc 找到表格中对应的功能名
    // 实际生产环境下，父项目的 SDK 会在这里执行真正的网络请求
  },

  // 映射组件库标识到具体配置 (模拟连锁项目：需要 a1 + a2)
  eventMap: {
    [TRACK_EVENTS.AVATAR_CLICK]: { lc: '9_1_1165', a1: '点击云小智头像进入' },
    
    [TRACK_EVENTS.SELECT_PAGE_ENTER]: { lc: '9_1_1166', a1: '进入页面' },
    [TRACK_EVENTS.SELECT_PAGE_CLOSE]: { lc: '9_1_1166', a1: '关闭云小智' },
    [TRACK_EVENTS.SELECT_PAGE_FULL]: { lc: '9_1_1166', a1: '全屏' },
    [TRACK_EVENTS.SELECT_PAGE_MIN]: { lc: '9_1_1166', a1: '缩小' },
    [TRACK_EVENTS.SELECT_AGENT_CARD]: { 
      lc: '9_1_1166', 
      biz: (p) => ({ a1: `${p.agentName}卡片` }) 
    }, 
    
    [TRACK_EVENTS.NAV_AGENT_SWITCH]: { 
      lc: '9_1_1167', 
      biz: (p) => ({ a1: p.agentName }) 
    },
    
    [TRACK_EVENTS.NAV_CONVERSATION_NEW]: { 
      lc: '9_1_1168', 
      biz: (p) => ({ a1: '新建对话按钮', a2: p.agentName }) 
    },
    [TRACK_EVENTS.NAV_CONVERSATION_ITEM]: { 
      lc: '9_1_1168', 
      biz: (p) => ({ a1: '单个对话记录', a2: p.agentName }) 
    },
    [TRACK_EVENTS.NAV_CONVERSATION_PIN]: { 
      lc: '9_1_1168', 
      biz: (p) => ({ a1: '记录操作-置顶', a2: p.agentName }) 
    },
    [TRACK_EVENTS.NAV_CONVERSATION_UNPIN]: { 
      lc: '9_1_1168', 
      biz: (p) => ({ a1: '记录操作-取消置顶', a2: p.agentName }) 
    },
    [TRACK_EVENTS.NAV_CONVERSATION_RENAME]: { 
      lc: '9_1_1168', 
      biz: (p) => ({ a1: '记录操作-重命名', a2: p.agentName }) 
    },
    [TRACK_EVENTS.NAV_CONVERSATION_DELETE]: { 
      lc: '9_1_1168', 
      biz: (p) => ({ a1: '记录操作-删除', a2: p.agentName }) 
    },

    [TRACK_EVENTS.CHAT_HEADER_NAV_TOGGLE]: { 
      lc: '9_1_1169', 
      biz: (p) => ({ a1: '展开/收起导航', a2: p.agentName }) 
    },
    [TRACK_EVENTS.CHAT_HEADER_RENAME]: { 
      lc: '9_1_1169', 
      biz: (p) => ({ a1: '重命名', a2: p.agentName }) 
    },
    [TRACK_EVENTS.CHAT_HEADER_FULL]: { 
      lc: '9_1_1169', 
      biz: (p) => ({ a1: '放大', a2: p.agentName }) 
    },
    [TRACK_EVENTS.CHAT_HEADER_MIN]: { 
      lc: '9_1_1169', 
      biz: (p) => ({ a1: '缩小', a2: p.agentName }) 
    },
    [TRACK_EVENTS.CHAT_HEADER_EXIT]: { 
      lc: '9_1_1169', 
      biz: (p) => ({ a1: '退出', a2: p.agentName }) 
    },

    [TRACK_EVENTS.INPUT_SEND]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ a1: '发送', a2: p.agentName }) 
    },
    [TRACK_EVENTS.INPUT_VOICE_ON]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ a1: '语音开启', a2: p.agentName }) 
    },
    [TRACK_EVENTS.INPUT_VOICE_OFF]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ a1: '语音关闭', a2: p.agentName }) 
    },
    [TRACK_EVENTS.INPUT_ATTACH_IMAGE]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ a1: '附件-图', a2: p.agentName }) 
    },
    [TRACK_EVENTS.INPUT_ATTACH_VIDEO]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ a1: '附件-视频', a2: p.agentName }) 
    },
    [TRACK_EVENTS.INPUT_ATTACH_SNAPSHOT]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ a1: '附件-抓图', a2: p.agentName }) 
    },

    [TRACK_EVENTS.MESSAGE_COPY_USER]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '发送语-复制', a2: p.agentName }) 
    },
    [TRACK_EVENTS.MESSAGE_RETRY]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '回复语-重试', a2: p.agentName }) 
    },
    [TRACK_EVENTS.MESSAGE_COPY_AI]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '回复语-复制', a2: p.agentName }) 
    },
    [TRACK_EVENTS.MESSAGE_LIKE]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '回复语-点赞', a2: p.agentName }) 
    },
    [TRACK_EVENTS.MESSAGE_UNLIKE]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '回复语-取消点赞', a2: p.agentName }) 
    },
    [TRACK_EVENTS.MESSAGE_DISLIKE]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '回复语-点踩', a2: p.agentName }) 
    },
    [TRACK_EVENTS.MESSAGE_UNDISLIKE]: { 
      lc: '9_1_1171', 
      biz: (p) => ({ a1: '回复语-取消点踩', a2: p.agentName }) 
    },

    [TRACK_EVENTS.WIDGET_INSPECT_SCOPE_CHANGE]: { lc: '9_1_1172', a1: '巡检范围', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_TIME_ADD]: { lc: '9_1_1172', a1: '巡检时间添加', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_TIME_EDIT]: { lc: '9_1_1172', a1: '巡检时间修改', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_PUSH_ENABLE]: { lc: '9_1_1172', a1: '门店整改推送开关-开启', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_PUSH_DISABLE]: { lc: '9_1_1172', a1: '门店整改推送开关-关闭', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_CONFIRM]: { lc: '9_1_1172', a1: '确认执行按钮', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_CANCEL]: { lc: '9_1_1172', a1: '取消计划按钮', a2: '智慧巡查' },
    [TRACK_EVENTS.WIDGET_INSPECT_EDIT]: { lc: '9_1_1172', a1: '参数修改', a2: '智慧巡查' },

    [TRACK_EVENTS.WIDGET_TRAIN_PROJECT_CHANGE]: { lc: '9_1_1173', a1: '学习项目修改', a2: '员工培训助手' },
    [TRACK_EVENTS.WIDGET_TRAIN_USERS_CHANGE]: { lc: '9_1_1173', a1: '培训学员调整', a2: '员工培训助手' },
    [TRACK_EVENTS.WIDGET_TRAIN_CONFIRM]: { lc: '9_1_1173', a1: '确认执行卡片', a2: '员工培训助手' },
    [TRACK_EVENTS.WIDGET_TRAIN_EDIT]: { lc: '9_1_1173', a1: '参数修改', a2: '员工培训助手' },

    [TRACK_EVENTS.WIDGET_AITRY_IMAGE_ADD]: { lc: '9_1_1174', a1: '添加图片', a2: 'AI试用' },
    [TRACK_EVENTS.WIDGET_AITRY_VIDEO_ADD]: { lc: '9_1_1174', a1: '添加视频', a2: 'AI试用' },
    [TRACK_EVENTS.WIDGET_AITRY_SNAPSHOT_ADD]: { lc: '9_1_1174', a1: '添加视频截图', a2: 'AI试用' },
    
    [TRACK_EVENTS.WIDGET_DATA_STORE_DETAIL]: { lc: '9_1_1176', a1: '门店详情', a2: '数据分析' },
    [TRACK_EVENTS.WIDGET_DATA_REPORT_EXPORT]: { 
      lc: '9_1_1176', 
      biz: (p) => ({ a1: `${p.prefix}报告导出`, a2: '数据分析' }) 
    },
    [TRACK_EVENTS.WIDGET_DATA_REPORT_DETAIL]: { 
      lc: '9_1_1176', 
      biz: (p) => ({ a1: `${p.prefix}报告详情`, a2: '数据分析' }) 
    },
    [TRACK_EVENTS.WIDGET_DATA_PLAN_CREATE]: { lc: '9_1_1176', a1: '生成自检计划', a2: '数据分析' },

    [TRACK_EVENTS.SUGGESTION_CLICK]: { 
      lc: '9_1_1175', 
      biz: (p) => ({ a1: '意图引导快捷语', a2: p.agentName }) 
    }
  },
  
  trackEty: 'aac' // 事件类型
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

# 云小智组件库埋点点位手册

本文档定义了组件库内部的所有埋点事件标识及业务数据，供父项目（如连锁、官网、App等）在集成时配置映射表。

## 1. 埋点架构说明

组件库采用 **“语义化标识 + 动态映射”** 架构。组件库内部只负责触发具体的业务行为（EventKey）并提供原始数据（Payload），父项目通过 `eventMap` 配置决定最终发送给埋点 SDK 的参数（lc, a1, a2等）。

### 数据流向：
`组件库触发事件` -> `EventTracker 翻译器 (合并配置)` -> `调用父项目 sendClickMessage`

---

## 2. 核心点位定义

### 一、 框架与入口 (Framework)
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `AVATAR_CLICK` | 点击悬浮球/头像进入 | 无 | a1: '点击云小智头像进入' |
| `SELECT_PAGE_ENTER` | 进入智能体选择页 | 无 | a1: '进入页面' |
| `SELECT_AGENT_CARD` | 点击智能体入口卡片 | `agentName`: 智能体名称 | a1: `${agentName}卡片` |
| `SELECT_PAGE_CLOSE` | 在选择页点击关闭/缩小 | 无 | a1: '关闭云小智' |
| `SELECT_PAGE_FULL` | 在选择页点击全屏 | 无 | a1: '全屏' |
| `SELECT_PAGE_MIN` | 在选择页点击缩小 | 无 | a1: '缩小' |

### 二、 左侧导航与对话列表 (Sidebar)
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `NAV_AGENT_SWITCH` | 切换左侧功能导航智能体 | `agentName`: 目标智能体名 | a1: `${agentName}` |
| `NAV_CONVERSATION_NEW` | 点击“新建对话”按钮 | `agentName`: 当前智能体名 | a1: '新建对话按钮', a2: `${agentName}` |
| `NAV_CONVERSATION_ITEM` | 点击历史对话记录 | `agentName`: 当前智能体名 | a1: '单个对话记录', a2: `${agentName}` |
| `NAV_CONVERSATION_PIN` | 记录操作-置顶 | `agentName`: 当前智能体名 | a1: '记录操作-置顶', a2: `${agentName}` |
| `NAV_CONVERSATION_UNPIN` | 记录操作-取消置顶 | `agentName`: 当前智能体名 | a1: '记录操作-取消置顶', a2: `${agentName}` |
| `NAV_CONVERSATION_RENAME`| 记录操作-重命名 | `agentName`: 当前智能体名 | a1: '记录操作-重命名', a2: `${agentName}` |
| `NAV_CONVERSATION_DELETE`| 记录操作-删除 | `agentName`: 当前智能体名 | a1: '记录操作-删除', a2: `${agentName}` |

### 三、 对话页面顶部栏 (Chat Header)
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `CHAT_HEADER_NAV_TOGGLE`| 展开/收起侧边栏 | 无 | a1: '收起导航' |
| `CHAT_HEADER_FULL` | 点击放大/全屏 | `agentName`: 当前智能体名 | a1: '放大' |
| `CHAT_HEADER_MIN` | 点击缩小/还原 | `agentName`: 当前智能体名 | a1: '缩小' |
| `CHAT_HEADER_EXIT` | 点击退出 | `agentName`: 当前智能体名 | a1: '退出' |
| `CHAT_HEADER_RENAME` | 标题区域点击重命名 | `agentName`: 当前智能体名 | a1: '重命名' |

### 四、 消息输入框 (Input)
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `INPUT_SEND` | 发送消息 | `agentName`: 当前智能体名 | a1: '发送', a2: `${agentName}` |
| `INPUT_VOICE_ON` | 开启语音输入 | `agentName`: 当前智能体名 | a1: '语音开启', a2: `${agentName}` |
| `INPUT_VOICE_OFF` | 关闭语音输入 | `agentName`: 当前智能体名 | a1: '语音关闭', a2: `${agentName}` |
| `INPUT_ATTACH_IMAGE` | 点击上传图片附件 | `agentName`: 当前智能体名 | a1: '附件-图', a2: `${agentName}` |
| `INPUT_ATTACH_VIDEO` | 点击上传视频附件 | `agentName`: 当前智能体名 | a1: '附件-视频', a2: `${agentName}` |
| `INPUT_ATTACH_SNAPSHOT` | 点击视频抓图附件 | `agentName`: 当前智能体名 | a1: '附件-抓图', a2: `${agentName}` |

### 五、 消息反馈与交互 (Feedback)
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `MESSAGE_COPY_AI` | 复制 AI 回复文本 | `agentName`: 当前智能体名 | a1: '回复语-复制' |
| `MESSAGE_COPY_USER` | 点击用户蓝色气泡(复制) | `agentName`: 当前智能体名 | a1: '发送语-复制' |
| `MESSAGE_LIKE` | 点击消息点赞 | `agentName`: 当前智能体名 | a1: '回复语-点赞' |
| `MESSAGE_UNLIKE` | 取消消息点赞 | `agentName`: 当前智能体名 | a1: '回复语-取消点赞' |
| `MESSAGE_DISLIKE` | 点击消息点踩 | `agentName`: 当前智能体名 | a1: '回复语-点踩' |
| `MESSAGE_UNDISLIKE` | 取消消息点踩 | `agentName`: 当前智能体名 | a1: '回复语-取消点踩' |
| `MESSAGE_RETRY` | 点击“重新生成” | `agentName`: 当前智能体名 | a1: '回复语-重试' |

### 六、 业务卡片内部操作 (Widgets)
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `WIDGET_INSPECT_CONFIRM`| 智慧巡查-确认执行 | 无 | a1: '确认执行按钮', a2: '智慧巡查' |
| `WIDGET_INSPECT_CANCEL` | 智慧巡查-取消计划 | 无 | a1: '取消计划按钮', a2: '智慧巡查' |
| `WIDGET_INSPECT_EDIT` | 智慧巡查-参数修改 | 无 | a1: '巡检时间修改', a2: '智慧巡查' |
| `WIDGET_TRAIN_CONFIRM` | 员工培训-确认执行 | 无 | a1: '确认执行卡片', a2: '员工培训助手' |
| `WIDGET_TRAIN_EDIT` | 员工培训-参数修改 | 无 | a1: '学习项目修改', a2: '员工培训助手' |
| `WIDGET_AITRY_ADD` | AI试用-添加媒体 | 无 | a1: '添加图片', a2: 'AI试用' |

### 七、 其他交互
| 标识 (EventKey) | 功能说明 | 原始数据 (Payload) | 连锁项目参考建议 |
| :--- | :--- | :--- | :--- |
| `SUGGESTION_CLICK` | 点击意图引导快捷语 | `agentName`: 当前智能体名 | a1: '意图引导快捷语' |

---

## 3. 父项目配置指南

父项目在调用 `Vue.use(AIComponentLib, options)` 时，通过 `eventMap` 定义如何翻译这些事件。

### 示例：支持动态 a2 的连锁项目映射
```javascript
import { TRACK_EVENTS } from 'hik-cloud-agent-x';

Vue.use(AIComponentLib, {
  eventMap: {
    // 情况 1: 静态 a1 参数
    [TRACK_EVENTS.AVATAR_CLICK]: { lc: '9_1_1165', a1: '点击云小智头像进入' },

    // 情况 2: 根据组件库 Payload 动态生成 a1/a2 (推荐)
    [TRACK_EVENTS.INPUT_SEND]: { 
      lc: '9_1_1170', 
      biz: (p) => ({ 
        a1: '发送', 
        a2: p.agentName // 将组件库传出的 agentName 映射到 a2
      }) 
    },

    // 情况 3: 字符串简写 (仅发送 LC，无 biz 参数)
    [TRACK_EVENTS.CHAT_HEADER_FULL]: '9_1_1169'
  }
});
```

### 示例：不需要 a2 的官网项目映射
```javascript
Vue.use(AIComponentLib, {
  eventMap: {
    [TRACK_EVENTS.INPUT_SEND]: { 
      lc: '7_1_004', 
      biz: (p) => ({ 
        a1: `发送-${p.agentName}` // 将智能体名合并到 a1 中，符合官网格式
      }) 
    }
  }
});
```

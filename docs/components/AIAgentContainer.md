# AIAgentContainer 智能体容器组件

`AIAgentContainer` 是组件库的核心容器组件，用于管理多个智能体（Agent）的展示和切换。

## 基本用法

```vue
<template>
  <AIAgentContainer 
    :user-id="userId"
    @select-agent="handleSelectAgent"
    @select-conversation="handleSelectConversation"
  />
</template>

<script>
export default {
  data() {
    return {
      userId: 'user123'
    }
  },
  methods: {
    handleSelectAgent(agent) {
      console.log('选中智能体:', agent)
    },
    handleSelectConversation(conversationId) {
      console.log('选中会话:', conversationId)
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| userId | 用户 ID（用于权限检查） | String | '' |
| extraAgents | 额外的智能体列表 | Array | [] |
| businessLine | 业务线标识 | String | 'default' |
| isMini | 是否为小窗模式 | Boolean | false |
| defaultAgentId | 默认选中的智能体 ID | String | null |
| defaultConversationId | 默认选中的会话 ID | String | null |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select-agent | 选中智能体 | (agent: Object) |
| select-conversation | 选中会话 | (conversationId: String) |
| update-list | 会话列表更新 | (list: Array) |

## Methods

通过 ref 可以调用以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| initializeState | 初始化状态（用于深度链接） | ({ agentId: String, chatId: String }) |

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| agent-view | 自定义智能体视图 | { agent: Object } |
| sidebar-bottom | 侧边栏底部内容 | - |

## 使用示例

### 基础用法

```vue
<AIAgentContainer :user-id="userId" />
```

### 添加自定义智能体

```vue
<template>
  <AIAgentContainer 
    :user-id="userId"
    :extra-agents="customAgents"
  >
    <template #agent-view="{ agent }">
      <OrderQueryView v-if="agent.id === 'order-helper'" />
      <ApprovalView v-else-if="agent.id === 'approval-helper'" />
    </template>
  </AIAgentContainer>
</template>

<script>
export default {
  data() {
    return {
      userId: 'user123',
      customAgents: [
        {
          id: 'order-helper',
          name: '订单助手',
          icon: '/path/to/icon.png',
          component: OrderQueryView
        },
        {
          id: 'approval-helper',
          name: '审批助手',
          icon: '/path/to/icon.png',
          component: ApprovalView
        }
      ]
    }
  }
}
</script>
```

### 深度链接

```vue
<template>
  <AIAgentContainer 
    ref="agentContainer"
    :user-id="userId"
  />
</template>

<script>
export default {
  mounted() {
    // 从 URL 参数获取 agentId 和 chatId
    const params = new URLSearchParams(window.location.search)
    const agentId = params.get('agentId')
    const chatId = params.get('chatId')
    
    if (agentId) {
      this.$nextTick(() => {
        this.$refs.agentContainer.initializeState({ agentId, chatId })
      })
    }
  }
}
</script>
```

### 自定义侧边栏底部

```vue
<AIAgentContainer :user-id="userId">
  <template #sidebar-bottom>
    <div class="custom-sidebar-footer">
      <button @click="handleCustomAction">自定义操作</button>
    </div>
  </template>
</AIAgentContainer>
```

## 智能体配置

智能体配置对象包含以下字段：

```typescript
interface Agent {
  id: string                    // 唯一标识
  name: string                 // 名称
  miniName?: string            // 缩写名称（侧边栏折叠时显示）
  icon: string                 // 图标路径
  homeIcon?: string            // 首页图标
  description?: string         // 描述
  type: 'built-in' | 'custom' | 'external'  // 类型
  tags?: string[]              // 标签
  component?: VueComponent     // 组件（内置或自定义）
  getUrl?: string | Function   // 外部链接（type='external' 时使用）
  permission?: Object          // 权限配置
}
```

### 权限配置

```typescript
interface Permission {
  underConstruction?: boolean  // 是否建设中
  checkService?: boolean       // 是否检查服务购买
  serviceCheckConfig?: {       // 服务检查配置
    url: string
    method?: string
    data?: Object
  }
  checkAuth?: boolean          // 是否检查权限码
  authConfig?: {               // 权限检查配置
    storageKey: string
    code: string
  }
  customCheck?: Function       // 自定义权限检查函数
  serviceName?: string         // 服务名称（用于提示）
  permissionName?: string      // 权限名称（用于提示）
}
```

## 内置智能体

组件库内置了以下智能体：

- **TryX**: AI 试用助手
- **TrainingX**: 员工培训助手
- **InspectX**: 智慧巡查（建设中）

## 注意事项

1. `userId` 是必需的，用于权限检查和白名单验证
2. 自定义智能体的 `component` 必须是一个 Vue 组件
3. 外部智能体（`type='external'`）会在新窗口打开 `getUrl`
4. 权限检查失败时会显示相应的空状态页面


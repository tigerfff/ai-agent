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
| resetCycle | 重置窗口周期缓存，清除各智能体记录的当前会话 | - |

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

## 新增功能

### 标题重命名

在会话标题旁边（鼠标悬停时显示）提供了编辑按钮，可以快速重命名当前会话。

**使用方式**：
- 鼠标悬停到标题上，会显示编辑图标
- 点击编辑图标，打开重命名对话框
- 输入新名称并确认即可完成重命名

**注意事项**：
- 只有真实会话（非临时会话 `conv-` 开头）才显示编辑按钮
- 重命名功能由智能体组件实现（需要智能体有 `renameSession` 方法）
- 重命名成功后会自动刷新会话列表

### beforeNewChat 钩子

智能体组件可以实现 `beforeNewChat` 方法来阻止新建对话。这在某些场景下很有用，比如：
- AI 正在流式输出回复时
- 文件正在上传时
- 其他需要阻止新建对话的业务场景

**实现方式**：

```javascript
// 在智能体组件中
export default {
  methods: {
    /**
     * 新建对话前的钩子，返回 false 可以阻止新建对话
     * @returns {boolean} true-允许新建，false-阻止新建
     */
    beforeNewChat() {
      // 如果正在流式输出，阻止新建对话
      if (this.isStreaming) {
        this.$message.warning('AI 正在回复中，请稍后再试');
        return false;  // 返回 false 阻止新建对话
      }
      
      // 如果正在上传文件，阻止新建对话
      if (this.isUploading) {
        this.$message.warning('文件正在上传中，请稍后再试');
        return false;
      }
      
      return true;  // 返回 true 允许新建对话
    }
  }
}
```

**返回值**：
- `true` 或 `undefined`：允许新建对话
- `false`：阻止新建对话，并显示提示信息

**调用时机**：
当用户在 `AIAgentContainer` 中点击"新建会话"按钮时，容器会先调用智能体的 `beforeNewChat` 方法，如果返回 `false`，则不会创建新会话。

### 窗口周期会话 (Cycle Sessions)

为了提供更好的用户体验，容器实现了“窗口周期会话”管理：

1. **会话缓存**：容器内部维护一个 `cycleSessions` 对象，记录当前窗口打开期间，每个智能体最后一次访问的 `chatId`。
2. **状态保留**：在不关闭大窗口的情况下，用户在多个智能体之间切换时，会自动返回到该智能体在该周期内的最后一次对话。
3. **周期重置**：当 `AIChatWindow` 重新打开时，会调用 `resetCycle()`，清空所有缓存。这意味着新的一天或新的操作时段，用户将从全新的对话开始。

## 注意事项

1. `userId` 是必需的，用于权限检查和白名单验证
2. 自定义智能体的 `component` 必须是一个 Vue 组件
3. 外部智能体（`type='external'`）会在新窗口打开 `getUrl`
4. 权限检查失败时会显示相应的空状态页面
5. 智能体组件如果实现了 `renameSession` 方法，可以通过标题编辑按钮重命名会话


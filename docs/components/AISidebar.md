# AISidebar 侧边栏组件

`AISidebar` 用于显示智能体列表和会话列表，支持折叠/展开功能。

## 基本用法

```vue
<template>
  <AISidebar 
    :agents="agents"
    :current-agent-id="currentAgentId"
    :conversations="conversations"
    :active-conversation-id="activeConversationId"
    :collapsed="collapsed"
    @select="handleSelectAgent"
    @new-chat="handleNewChat"
    @toggle="handleToggle"
  />
</template>

<script>
export default {
  data() {
    return {
      collapsed: false,
      currentAgentId: 'try-x',
      agents: [
        { id: 'try-x', name: 'AI 试用', icon: '/path/to/icon.png' }
      ],
      conversations: [
        { id: 'conv1', label: '会话1', time: '10:30' }
      ],
      activeConversationId: 'conv1'
    }
  },
  methods: {
    handleSelectAgent(agent) {
      this.currentAgentId = agent.id
    },
    handleNewChat() {
      // 创建新会话
    },
    handleToggle(collapsed) {
      this.collapsed = collapsed
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| agents | 智能体列表 | Array | [] |
| currentAgentId | 当前选中的智能体 ID | String/Number | '' |
| conversations | 会话列表 | Array | [] |
| activeConversationId | 当前激活的会话 ID | String/Number | '' |
| collapsed | 是否折叠 | Boolean | false |
| isMini | 是否为小窗模式 | Boolean | false |
| hideConversations | 是否隐藏会话列表 | Boolean | false |

### agents 数据结构

```typescript
interface Agent {
  id: string | number
  name: string
  miniName?: string      // 折叠时显示的名称
  icon: string           // 图标路径
}
```

### conversations 数据结构

```typescript
interface Conversation {
  id: string | number
  label: string          // 会话标题
  time?: string          // 显示时间（格式化后的字符串）
  createTime?: string    // 创建时间（ISO 字符串）
  updateTime?: string    // 更新时间（ISO 字符串）
  top?: boolean          // 是否置顶
  isUnread?: boolean     // 是否有未读消息
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 选中智能体 | (agent: Agent) |
| new-chat | 新建会话 | - |
| toggle | 折叠/展开 | (collapsed: Boolean) |
| update:collapsed | 折叠状态变化（用于 v-model） | (collapsed: Boolean) |
| conversation-change | 会话变更 | (item: Conversation) |
| update:activeConversationId | 激活会话变化 | (id: String/Number) |
| conversation-menu-command | 会话菜单命令 | (command: String, item: Conversation) |

## Slots

| 插槽名 | 说明 |
|--------|------|
| bottom | 底部内容（折叠时也显示） |

## 使用示例

### 基础用法

```vue
<AISidebar 
  :agents="agents"
  :current-agent-id="currentAgentId"
  :conversations="conversations"
  :active-conversation-id="activeConversationId"
  @select="handleSelectAgent"
/>
```

### 自定义底部内容

```vue
<AISidebar :agents="agents" :conversations="conversations">
  <template #bottom>
    <div class="sidebar-footer">
      <button>自定义按钮</button>
    </div>
  </template>
</AISidebar>
```

### 折叠控制

```vue
<template>
  <AISidebar 
    v-model:collapsed="collapsed"
    :agents="agents"
    :conversations="conversations"
  />
</template>

<script>
export default {
  data() {
    return {
      collapsed: false
    }
  }
}
</script>
```

### 会话列表交互

```vue
<AISidebar 
  :conversations="conversations"
  :active-conversation-id="activeConversationId"
  @conversation-change="handleConversationChange"
  @conversation-menu-command="handleMenuCommand"
/>

<script>
export default {
  methods: {
    handleConversationChange(item) {
      // 切换会话
      this.activeConversationId = item.id
    },
    handleMenuCommand(command, item) {
      if (command === 'rename') {
        // 重命名会话
        this.renameConversation(item.id)
      } else if (command === 'delete') {
        // 删除会话
        this.deleteConversation(item.id)
      }
    }
  }
}
</script>
```

## 注意事项

1. 折叠时，会话列表会隐藏，但底部 slot 仍然显示
2. `hideConversations` 为 `true` 时，整个会话区域（包括新建按钮）都会隐藏
3. 会话列表支持自动分组（今天、昨天、30天内等）


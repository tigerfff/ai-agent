# AIConversations 会话列表组件

`AIConversations` 用于显示和管理会话列表，支持分组、置顶、未读标记等功能。

## 基本用法

```vue
<template>
  <AIConversations 
    :items="conversations"
    :active-key="activeConversationId"
    :groupable="true"
    @update:activeKey="handleSelect"
    @change="handleChange"
    @menu-command="handleMenuCommand"
  >
    <template #label="{ item }">
      <div class="conversation-label">
        <span>{{ item.label }}</span>
        <span class="time">{{ item.time }}</span>
      </div>
    </template>
  </AIConversations>
</template>

<script>
export default {
  data() {
    return {
      activeConversationId: 'conv1',
      conversations: [
        {
          id: 'conv1',
          label: '会话1',
          time: '10:30',
          createTime: '2024-01-01T10:30:00',
          top: false
        }
      ]
    }
  },
  methods: {
    handleSelect(id) {
      this.activeConversationId = id
    },
    handleChange(item) {
      console.log('会话变更:', item)
    },
    handleMenuCommand(command, item) {
      if (command === 'delete') {
        this.deleteConversation(item.id)
      }
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| items | 会话项列表 | Array | [] |
| activeKey | 当前激活的会话 ID | String/Number | '' |
| groupable | 是否启用分组 | Boolean | false |
| autoGroupByTime | 是否自动按时间分组 | Boolean | true |
| timeField | 时间字段名：'createTime' | 'updateTime' | String | 'updateTime' |
| enableTop | 是否启用置顶功能 | Boolean | true |
| topField | 置顶字段名 | String | 'top' |
| ungroupedTitle | 未分组的标题 | String | '未分组' |

### 会话项数据结构

```typescript
interface ConversationItem {
  id: string | number        // 唯一标识
  label: string              // 会话标题
  time?: string              // 显示时间（格式化后的字符串）
  createTime?: string        // 创建时间（ISO 字符串）
  updateTime?: string        // 更新时间（ISO 字符串）
  top?: boolean              // 是否置顶
  group?: string             // 分组标识（可选）
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:activeKey | 激活会话变化 | (id: String/Number) |
| change | 会话变更 | (item: ConversationItem) |
| menu-command | 菜单命令 | (command: String, item: ConversationItem) |

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| label | 自定义标签内容 | { item: ConversationItem } |

## 使用示例

### 基础用法

```vue
<AIConversations 
  :items="conversations"
  :active-key="activeConversationId"
  @update:activeKey="handleSelect"
/>
```

### 启用分组

```vue
<AIConversations 
  :items="conversations"
  :groupable="true"
  :active-key="activeConversationId"
/>
```

分组会自动按时间分组：
- **置顶**：置顶的会话
- **今天**：今天的会话
- **昨天**：昨天的会话
- **30天内**：最近 30 天的会话
- **更多**：更早的会话

### 自定义标签

```vue
<AIConversations :items="conversations">
  <template #label="{ item }">
    <div class="custom-label">
      <span class="title">{{ item.label }}</span>
      <span class="time">{{ item.time }}</span>
      <span v-if="item.isUnread" class="unread-badge">未读</span>
    </div>
  </template>
</AIConversations>
```

### 菜单命令处理

```vue
<AIConversations 
  :items="conversations"
  @menu-command="handleMenuCommand"
/>

<script>
export default {
  methods: {
    handleMenuCommand(command, item) {
      switch (command) {
        case 'rename':
          this.renameConversation(item.id)
          break
        case 'delete':
          this.deleteConversation(item.id)
          break
        case 'pin':
          this.pinConversation(item.id, true)
          break
        case 'unpin':
          this.pinConversation(item.id, false)
          break
      }
    }
  }
}
</script>
```

## 注意事项

1. 当 `groupable` 为 `true` 时，会自动按时间分组
2. 置顶的会话会显示在最前面
3. 分组标题支持点击折叠/展开
4. `time` 字段用于显示，`createTime`/`updateTime` 用于分组计算


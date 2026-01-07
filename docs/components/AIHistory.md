# AIHistory 历史消息列表组件

`AIHistory` 用于展示聊天历史消息列表，支持消息渲染、滚动控制、时间显示等功能。

## 基本用法

```vue
<template>
  <AIHistory 
    :list="messages"
    @complete="handleComplete"
  />
</template>

<script>
export default {
  data() {
    return {
      messages: [
        {
          key: 'msg1',
          role: 'user',
          content: '你好',
          placement: 'end'
        },
        {
          key: 'msg2',
          role: 'ai',
          content: '你好！有什么可以帮助你的吗？',
          placement: 'start'
        }
      ]
    }
  },
  methods: {
    handleComplete(data) {
      console.log('消息完成:', data)
    }
  }
}
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| list | 消息列表 | Array | [] |
| maxHeight | 最大高度 | String | '100%' |
| backButtonThreshold | 滚动条距离底部超过此值时显示"回到底部"按钮 | Number | 150 |
| autoScrollTolerance | 自动滚动容差（在此距离内认为是在底部） | Number | 50 |
| enableActions | 是否启用默认操作栏（复制、点赞等） | Boolean | true |
| actionConfig | 操作栏配置 | Object | {} |
| ignoreWidgetTypes | 需要忽略渲染的 widget 类型列表 | Array | [] |

### 消息项数据结构

```typescript
interface MessageItem {
  key: string | number          // 唯一标识
  role: 'user' | 'ai'          // 角色
  content: string              // 消息内容（支持 Markdown）
  placement: 'start' | 'end'   // 位置：start=左侧(AI)，end=右侧(用户)
  variant?: string             // 样式变体
  attachments?: Array          // 附件列表
  time?: string | number       // 时间戳
  loading?: boolean            // 是否加载中
  typing?: boolean             // 是否正在输入
  msgId?: string               // 消息 ID（用于评价等操作）
  likeStatus?: 'like' | 'dislike' | ''  // 点赞状态
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| complete | 消息完成（流式输出结束） | (data: { index: number }) |
| action-click | 操作按钮点击（复制、点赞等） | (data: { type: string, payload: any, index: number }) |
| update | 消息更新 | (data: Object) |
| finish | 消息完成（同 complete） | (data: { index: number }) |

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| widget | 自定义 Widget 渲染 | { info: Object, item: MessageItem, index: number } |
| footer | 消息底部内容 | { item: MessageItem, index: number, isLast: boolean } |
| avatar | 自定义头像 | { item: MessageItem, index: number } |

## 使用示例

### 基础用法

```vue
<AIHistory :list="messages" />
```

### 禁用默认操作栏

```vue
<AIHistory 
  :list="messages"
  :enable-actions="false"
/>
```

### 自定义 Widget 渲染

```vue
<AIHistory :list="messages">
  <template #widget="{ info, item, index }">
    <CustomForm 
      v-if="info.widgetType === 'custom:form'"
      :data="info.data"
    />
  </template>
</AIHistory>
```

### 自定义消息底部

```vue
<AIHistory :list="messages">
  <template #footer="{ item, index }">
    <div class="custom-footer">
      <button @click="handleAction('copy', item, index)">复制</button>
      <button @click="handleAction('like', item, index)">点赞</button>
    </div>
  </template>
</AIHistory>
```

### 时间显示

消息项包含 `time` 字段时，组件会自动显示时间分隔符：
- 如果两条消息间隔超过 1 小时，会显示时间
- 今天的消息显示格式：`HH:mm:ss`
- 其他日期显示格式：`YYYY/MM/DD HH:mm:ss`

```javascript
messages: [
  {
    key: 'msg1',
    content: '消息1',
    time: '2024-01-01T10:00:00'  // ISO 格式字符串
  },
  {
    key: 'msg2',
    content: '消息2',
    time: Date.now()  // 时间戳
  }
]
```

### 流式消息

支持流式消息显示，设置 `loading: true` 和 `typing: true`：

```javascript
messages: [
  {
    key: 'msg1',
    content: '正在输入...',
    loading: true,
    typing: true
  }
]
```

当消息完成时，触发 `complete` 事件：

```vue
<AIHistory 
  :list="messages"
  @complete="handleComplete"
/>

<script>
export default {
  methods: {
    handleComplete({ index }) {
      // 更新消息状态
      this.$set(this.messages[index], 'loading', false)
      this.$set(this.messages[index], 'typing', false)
    }
  }
}
</script>
```

### 操作栏配置

```vue
<AIHistory 
  :list="messages"
  :action-config="{
    user: ['copy'],
    bot: ['copy', 'like', 'dislike']
  }"
  @action-click="handleAction"
/>

<script>
export default {
  methods: {
    handleAction({ type, payload, index }) {
      if (type === 'like') {
        // 处理点赞
        this.$set(this.messages[index], 'likeStatus', 'like')
      } else if (type === 'copy') {
        // 处理复制
        this.copyText(this.messages[index].content)
      }
    }
  }
}
</script>
```

### 自动滚动行为

组件具有智能的自动滚动功能，会根据用户是否在浏览历史消息来决定是否自动滚动到底部。

#### 工作原理

1. **滚动状态检测**：
   - 组件会监听滚动事件，计算距离底部的距离
   - 如果距离底部超过 `autoScrollTolerance`（默认 50px），认为用户正在浏览历史消息
   - 此时设置 `userScrolledUp = true`

2. **新消息到达时的行为**：
   - **用户在底部**（`userScrolledUp = false`）：自动滚动到底部 ✅
   - **用户在浏览历史**（`userScrolledUp = true`）：不自动滚动，显示"新消息"提示 ⚠️
   - **初始加载**：强制滚动到底部

3. **回到底部按钮**：
   - 当距离底部超过 `backButtonThreshold`（默认 150px）时显示
   - 点击按钮可以快速滚动到底部
   - **新消息动画**：当有新消息到达且用户不在底部时，按钮会显示一个蓝色渐变圆环旋转动画（Loading Ring），提示用户下方有未读消息。

#### 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `autoScrollTolerance` | 50px | 判断用户是否在底部的容差，超过此距离认为用户在浏览历史 |
| `backButtonThreshold` | 150px | 显示"回到底部"按钮的阈值，超过此距离显示按钮 |

#### 使用示例

```vue
<AIHistory 
  :list="messages"
  :auto-scroll-tolerance="100"  <!-- 增大容差，更宽松的判断 -->
  :back-button-threshold="200"  <!-- 调整按钮显示阈值 -->
/>
```

#### 行为说明

**场景 1：用户在底部**
- 用户滚动到底部（距离底部 < 50px）
- 新消息到达 → **自动滚动到底部** ✅

**场景 2：用户在浏览历史**
- 用户向上滚动查看历史消息（距离底部 > 50px）
- 新消息到达 → **不自动滚动**，只显示"新消息"提示 ⚠️
- 用户可以继续浏览，或点击"回到底部"按钮

**场景 3：初始加载**
- 组件挂载或切换会话时
- 强制滚动到底部，忽略 `userScrolledUp` 状态

## 注意事项

1. 消息列表应该是响应式的，使用 `this.$set` 或 Vue.set 更新数组项
2. `key` 字段必须唯一，建议使用消息 ID 或时间戳
3. `time` 字段支持 ISO 字符串或时间戳（毫秒）
4. Widget 内容会被自动解析，使用 `ignoreWidgetTypes` 可以忽略特定类型的 Widget


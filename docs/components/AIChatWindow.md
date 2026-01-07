# AIChatWindow 聊天窗口组件

`AIChatWindow` 是聊天窗口的顶层容器组件，提供了完整的聊天界面，包括侧边栏和主内容区。

## 基本用法

```vue
<template>
  <AIChatWindow v-model="visible" />
</template>

<script>
export default {
  data() {
    return {
      visible: false
    }
  },
  methods: {
    openChat() {
      this.visible = true
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示窗口（支持 v-model） | Boolean | false |
| userId | 用户 ID（传递给 AIAgentContainer） | String | '' |
| isMini | 是否为小窗模式 | Boolean | false |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update:visible | 可见性变化（用于 v-model） | (visible: Boolean) |

## Methods

通过 ref 可以调用以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| open | 打开窗口并初始化状态 | ({ agentId?: String, chatId?: String }) |
| close | 关闭窗口 | - |

## 使用示例

### 基础用法

```vue
<template>
  <div>
    <button @click="visible = true">打开聊天</button>
    <AIChatWindow v-model="visible" :user-id="userId" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      userId: 'user123'
    }
  }
}
</script>
```

### 深度链接打开

```vue
<template>
  <AIChatWindow ref="chatWindow" v-model="visible" :user-id="userId" />
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      userId: 'user123'
    }
  },
  methods: {
    openSpecificChat(agentId, chatId) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.chatWindow.open({ agentId, chatId })
      })
    }
  }
}
</script>
```

### 小窗模式

```vue
<AIChatWindow v-model="visible" :user-id="userId" :is-mini="true" />
```

## 注意事项

1. 组件内部使用了 `AIAgentContainer`，所有 `AIAgentContainer` 的功能都可用
2. `open` 方法需要在 `visible` 变为 `true` 后调用（使用 `$nextTick`）
3. 如果不传 `agentId`，会显示首页（智能体列表）
4. **窗口周期会话逻辑**：
   - 每次窗口从关闭状态打开（`visible` 由 `false` 变 `true`）时，会重置所有智能体的“周期缓存”。
   - 在同一个窗口周期内，切换智能体会保留该智能体上一次的对话状态。
   - 重新打开窗口则会为每个智能体开启全新的对话。


# AIBubble 消息气泡组件

`AIBubble` 用于渲染单条消息的气泡样式，支持 Markdown 渲染、附件展示、Widget 解析等功能。

## 基本用法

```vue
<template>
  <AIBubble :item="messageItem" />
</template>

<script>
export default {
  data() {
    return {
      messageItem: {
        key: 'msg1',
        role: 'user',
        content: '这是一条消息',
        placement: 'end'
      }
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| item | 消息项数据 | Object | - |
| ignoreWidgetTypes | 需要忽略的 widget 类型列表 | Array | [] |

### item 数据结构

```typescript
interface MessageItem {
  key: string | number
  role: 'user' | 'ai'
  content: string                    // 消息内容（支持 Markdown）
  placement: 'start' | 'end'        // start=左侧(AI)，end=右侧(用户)
  variant?: string                  // 样式变体
  attachments?: Array               // 附件列表
  loading?: boolean                 // 是否加载中
  typing?: boolean                  // 是否正在输入
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| update | 消息更新 | (data: Object) |
| finish | 消息完成 | (instance: Object) |

## Slots

| 插槽名 | 说明 | 作用域参数 |
|--------|------|-----------|
| widget | 自定义 Widget 渲染 | { info: Object, item: MessageItem, index: number } |
| footer | 消息底部内容 | { item: MessageItem, index: number } |
| avatar | 自定义头像 | { item: MessageItem } |

## 使用示例

### 基础用法

```vue
<AIBubble :item="messageItem" />
```

### 自定义 Widget 渲染

```vue
<AIBubble :item="messageItem">
  <template #widget="{ info }">
    <CustomForm 
      v-if="info.widgetType === 'custom:form'"
      :data="info.data"
    />
  </template>
</AIBubble>
```

### 自定义底部操作栏

```vue
<AIBubble :item="messageItem">
  <template #footer="{ item }">
    <div class="custom-footer">
      <button @click="handleCopy(item)">复制</button>
    </div>
  </template>
</AIBubble>
```

## Widget 支持

组件支持解析和渲染自定义 Widget，格式如下：

```html
<ymform:custom_widget desc="描述">
{
  "key": "value"
}
</ymform:custom_widget>
```

Widget 内容会被解析为：

```javascript
{
  widgetType: 'ymform:custom_widget',
  desc: '描述',
  data: { key: 'value' }
}
```

## 注意事项

1. `content` 支持 Markdown 语法
2. Widget 标签会被解析，使用 `ignoreWidgetTypes` 可以忽略特定类型
3. `placement` 决定了气泡的左右对齐方式


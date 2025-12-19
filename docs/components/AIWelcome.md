# AIWelcome 欢迎页组件

`AIWelcome` 用于显示智能体的欢迎页面，通常在没有消息时显示，提供快速开始提示。

## 基本用法

```vue
<template>
  <AIWelcome 
    :icon="icon"
    title="AI 助手"
    description="我可以帮助你处理各种任务"
    :prompts="prompts"
    @select="handleSelect"
  />
</template>

<script>
export default {
  data() {
    return {
      icon: '/path/to/icon.png',
      prompts: [
        { desc: '推荐问题1', text: '问题内容1' },
        { desc: '推荐问题2', text: '问题内容2' }
      ]
    }
  },
  methods: {
    handleSelect(data) {
      console.log('选中:', data.text)
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| icon | 图标路径 | String | '' |
| title | 标题 | String | '' |
| description | 描述文本 | String | '' |
| prompts | 推荐问题列表 | Array | [] |

### prompts 数据结构

```typescript
interface Prompt {
  desc?: string      // 描述文本（显示在按钮上）
  text?: string      // 问题文本（点击时发送）
  title?: string     // 标题（兼容字段）
  needsFile?: boolean  // 是否需要文件
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 选择推荐问题 | (data: Prompt) |

## 使用示例

### 基础用法

```vue
<AIWelcome 
  icon="/path/to/icon.png"
  title="AI 助手"
  description="有什么可以帮助你的吗？"
/>
```

### 带推荐问题

```vue
<AIWelcome 
  :icon="icon"
  title="AI 助手"
  :prompts="prompts"
  @select="handleSelect"
/>

<script>
export default {
  data() {
    return {
      prompts: [
        { desc: '帮我分析图片', text: '分析这张图片', needsFile: true },
        { desc: '常见问题1', text: '常见问题1的内容' },
        { desc: '常见问题2', text: '常见问题2的内容' }
      ]
    }
  },
  methods: {
    handleSelect(data) {
      // 如果 needsFile 为 true，需要处理文件选择
      if (data.needsFile) {
        // 触发文件选择逻辑
        this.selectFile(data.text)
      } else {
        // 直接发送文本
        this.sendMessage(data.text)
      }
    }
  }
}
</script>
```

### 从接口获取推荐问题

```vue
<AIWelcome 
  :icon="icon"
  :title="title"
  :description="description"
  :prompts="prompts"
  @select="handleSelect"
/>

<script>
export default {
  data() {
    return {
      prompts: []
    }
  },
  async created() {
    // 从接口获取推荐问题
    const res = await this.$aiClient.send({
      url: '/api/suggestions',
      method: 'get'
    })
    if (res.code === 0) {
      this.prompts = res.data.map(text => ({
        desc: text,
        text: text,
        needsFile: false
      }))
    }
  }
}
</script>
```

## 注意事项

1. `needsFile` 为 `true` 时，点击会触发文件选择流程
2. `select` 事件传递的数据包含完整的 prompt 对象


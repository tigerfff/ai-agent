# AI 智体组件库开发文档

欢迎使用 AI 智体组件库 (AI-AA) 开发文档。本文档提供了所有组件的详细使用说明和 API 参考。

## 📚 文档索引

### 视图层组件

- [AIChatWindow](./components/AIChatWindow.md) - 聊天窗口组件（顶层容器）
- [AIAgentContainer](./components/AIAgentContainer.md) - 智能体容器组件（管理多个智能体）

### 核心 UI 组件

- [AIInput](./components/AIInput.md) - 输入框组件（支持文本、文件上传、语音输入）
- [AIHistory](./components/AIHistory.md) - 历史消息列表组件
- [AIBubble](./components/AIBubble.md) - 消息气泡组件
- [AIWelcome](./components/AIWelcome.md) - 欢迎页组件

### 布局组件

- [AILayout](./components/AILayout.md) - 标准布局骨架
- [AISidebar](./components/AISidebar.md) - 侧边栏组件
- [AIDrawer](./components/AIDrawer.md) - 抽屉组件

### 基础 UI 组件

- [AIAttachments](./components/AIAttachments.md) - 附件列表组件
- [AttachmentsPreview](./components/AttachmentsPreview.md) - 附件预览组件
- [FilesCard](./components/FilesCard.md) - 文件卡片组件
- [AIConversations](./components/AIConversations.md) - 会话列表组件
- [AILoadSelect](./components/AILoadSelect.md) - 加载选择器组件
- [PersonSelect](./components/PersonSelect.md) - 人员选择器组件

### 辅助组件

- [AIEmpty](./components/AIEmpty.md) - 空状态组件
- [ChatSkeleton](./components/ChatSkeleton.md) - 聊天骨架屏组件

## 🚀 快速开始

### 安装

```bash
npm install ai-aa
```

### 基本使用

```javascript
import Vue from 'vue'
import AIComponentLib from 'ai-aa'

Vue.use(AIComponentLib, {
  http: (method, url, data, config) => {
    // 你的 HTTP 适配器
  },
  configProvider: () => ({
    baseUrl: '/api',
    headers: {}
  })
})
```

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

## 📖 核心概念

### 智能体 (Agent)

智能体是组件库的核心概念，每个智能体代表一个独立的功能模块。组件库支持：
- **内置智能体**：预置的智能体（如 TrainingX、TryX）
- **自定义智能体**：通过 props 注入的智能体

### 会话 (Conversation)

每个智能体可以管理多个会话，用户可以在不同会话之间切换。

### 消息 (Message)

消息是聊天交互的基本单元，支持：
- 文本消息
- 图片/视频附件
- 自定义 Widget（如表单、卡片等）

## 🔧 开发指南

### 创建自定义智能体

```vue
<template>
  <div class="custom-agent">
    <AIInput @send="handleSend" />
    <AIHistory :list="messages" />
  </div>
</template>

<script>
export default {
  name: 'CustomAgent',
  props: {
    conversationId: String
  },
  data() {
    return {
      messages: []
    }
  },
  methods: {
    handleSend(data) {
      // 处理发送逻辑
    }
  }
}
</script>
```

### 组件通信

组件库使用以下方式进行组件间通信：

- **Props / Events**：父子组件通信
- **$aiClient**：全局 HTTP 客户端
- **EventBus**：跨组件事件总线
- **Inject / Provide**：依赖注入

## 📝 更新日志

查看 [CHANGELOG.md](../CHANGELOG.md) 了解版本更新记录。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。

## 📄 许可证

[许可证信息]


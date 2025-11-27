# AI 智体组件库 (AI-AA) 架构设计文档

本文档详细描述了将 `ai-aa` 项目重构为 **可插拔、高扩展的 AI 智体组件库 (AI Container)** 的架构设计方案。

## 1. 设计理念

核心目标是将本项目打造为一个 **AI 容器**。它不只是一个简单的聊天窗口，而是一个能够承载不同“智能体 (Agent)”的运行环境。

*   **独立性**: 作为一个 npm 组件包嵌入到宿主（父）项目中。
*   **依赖注入**: 网络请求、鉴权、环境配置等由宿主环境注入，组件库保持纯净。
*   **可扩展**: 支持内置智能体，同时开放 Slot 允许宿主注入自定义智能体页面。

---

## 2. 架构分层 (Architecture Layers)

系统自下而上分为四层：

### 2.1 Core Layer (核心层)
处理最底层的通信、状态管理和协议解析，不包含具体 UI 业务。

*   **AIClient**: 统一的通信客户端，屏蔽了 HTTP 和 SSE 的差异。
*   **AIAdapter**: 通信适配器接口，用于接收父项目注入的网络能力。
*   **Protocol Parser**: 消息解析器，处理 Markdown 及自定义业务协议（如 `[DATA_JSON]...`）。
*   **Event Bus**: 跨组件/跨智能体的事件总线。

### 2.2 UI Kit Layer (基础 UI 层)
纯粹的 Vue UI 组件，无业务逻辑，仅负责展示。

*   **基础组件**: `AIBubble` (气泡), `AIInput` (输入框), `AIHistory` (历史列表)。
*   **布局组件**: `AISidebar` (侧边栏), `AILayout` (标准骨架)。

### 2.3 Agent Layer (智能体层)
具体的业务场景实现。

*   **Agent Protocol**: 定义智能体的标准配置结构（名称、图标、入口组件等）。
*   **Built-in Agents**: 预置的开箱即用智能体（如 `Training-X`, `Try-X`）。

### 2.4 Container Layer (容器层)
对外暴露的顶层组件。

*   **AIAgentContainer**: 总入口组件，管理当前激活的智能体视图。
*   **Data Merge**: 负责合并 **内置智能体** 和 **外部注入智能体 (Props)** 的列表数据。
*   **Slot System**: 提供 `agent-view` 插槽，配合外部注入的智能体 ID，渲染宿主提供的自定义业务页面。

---

## 3. 通信层设计 (Communication Layer)

由于组件库需要复用宿主项目的鉴权（Token/Cookie）和网络环境（代理/网关），我们采用 **"混合策略 + 依赖注入"** 的设计。

### 3.1 策略核心
*   **普通 HTTP 请求**: **完全委托**给宿主项目（复用宿主的 Axios）。
*   **SSE 流式请求**: **组件库内置**标准实现（基于 `@microsoft/fetch-event-source`），但配置由宿主注入。

### 3.2 AIAdapter 接口定义
组件库要求宿主项目在安装时提供以下适配器：

```javascript
const AIAdapter = {
  /**
   * 1. HTTP 请求适配器 (必须)
   * 直接调用父项目的 axios 实例
   */
  http: (method, url, data) => Promise,

  /**
   * 2. 配置提供者 (必须)
   * 用于 SSE 请求动态获取最新的环境信息
   */
  configProvider: () => ({
    baseUrl: string,  // 例如 '/api'
    headers: Object,  // 例如 { 'Chain-Version': '1.0' }
    // 注意：如果 Token 在 Cookie 中，无需在此传递 Token
  })
}
```

### 3.3 内部实现 (AIClient)

组件库内部封装 `AIClient` 类，统一调度：

```javascript
// 伪代码示意
class AIClient {
  constructor(adapter) {
    this.http = adapter.http;
    this.configProvider = adapter.configProvider;
  }

  send(params) {
    if (params.stream) {
      // 使用内置的 SSE Driver，但读取父项目的 config
      return this._runSSE(params);
    } else {
      // 使用父项目的 Axios
      return this.http(params.method, params.url, params.data);
    }
  }

  _runSSE({ url, data, callbacks }) {
    const config = this.configProvider();
    // 使用 @microsoft/fetch-event-source
    // 关键点：设置 credentials: 'include' 以支持 HttpOnly Cookie
    fetchEventSource(config.baseUrl + url, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(data),
      fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
      ...callbacks
    });
  }
}
```

---

## 4. 目录结构规划

```text
src/
├── ai-core/                # [核心层]
│   ├── client/             # AIClient, DefaultSSEDriver
│   ├── adapter/            # Adapter Interface 定义
│   └── event-bus/          # 全局事件总线
├── ai-ui/                  # [UI层]
│   ├── bubble/             # 气泡框组件
│   ├── input/              # 输入框组件
│   ├── layout/             # Sidebar, ContainerLayout
│   └── icon/               # 图标资源
├── agents/                 # [智能体层]
│   ├── built-in/           # 内置智能体 (Training-X, etc.)
│   └── registry.js         # 智能体注册表
├── views/                  # [容器层]
│   ├── AgentContainer.vue  # 主入口容器
│   └── Home.vue            # 智能体列表页
└── index.js                # 组件库导出入口 (install 方法)
```

---

## 5. 接入指南 (Integration Guide)

宿主项目（父项目）接入组件库的步骤：

### 步骤 1: 安装
```bash
npm install ai-aa
```

### 步骤 2: 注册并注入依赖
在 `main.js` 中：

```javascript
import AIComponentLib from 'ai-aa';
import myAxios from '@/plugin/http'; // 父项目的 axios

Vue.use(AIComponentLib, {
  // 注入 HTTP 能力
  http: myAxios,
  
  // 注入配置获取逻辑
  configProvider: () => ({
    baseUrl: process.env.VUE_APP_API_HOST || '/api',
    headers: {
      'App-Source': '1'
    }
  })
});
```

### 步骤 3: 使用组件
通过 `extra-agents` 注入元数据，通过 `agent-view` 插槽渲染内容。

```html
<template>
  <ai-agent-container 
    :extra-agents="[
      { id: 'my-agent-1', name: '订单查询', icon: 'icon-order', type: 'slot' },
      { id: 'my-agent-2', name: '审批助手', icon: 'icon-approve', type: 'slot' }
    ]"
  >
    <!-- Slot: 处理所有 type='slot' 的智能体渲染 -->
    <!-- 通过作用域参数 { agent } 判断当前显示哪个组件 -->
    <template #agent-view="{ agent }">
      <order-query-view v-if="agent.id === 'my-agent-1'" />
      <approval-view v-else-if="agent.id === 'my-agent-2'" />
    </template>
  </ai-agent-container>
</template>
```


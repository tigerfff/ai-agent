# AI-AA 组件库集成指南

本文档介绍如何在父项目中使用 `ai-aa` 组件库，包括调试方式、组件使用方法和 HTTP 配置。

---

## 目录

1. [调试方式](#1-调试方式)
2. [父项目集成](#2-父项目集成)
3. [HTTP 配置](#3-http-配置)

---

## 1. 调试方式

### 1.1 实时调试（推荐）

组件库支持在打包后实时调试，父项目修改后可以立即看到效果。

#### 方式一：使用 Vite Watch 模式

在组件库项目中运行：

```bash
npm run build:watch
```

这个命令会：
- 监听 `src/` 目录下的所有文件变化
- 自动重新打包到 `dist/` 目录
- 保持进程运行，持续监听

**父项目配置：**

在父项目的 `package.json` 中，将 `ai-aa` 的依赖指向本地路径：

```json
{
  "dependencies": {
    "ai-aa": "file:../ai-aa"
  }
}
```

或者使用 `npm link`：

```bash
# 在组件库目录下
cd /path/to/ai-aa
npm link

# 在父项目目录下
cd /path/to/parent-project
npm link ai-aa
```

**工作流程：**

1. 在组件库项目中运行 `npm run build:watch`
2. 在父项目中正常启动开发服务器（如 `npm run serve`）
3. 修改组件库代码 → 自动重新打包 → 父项目自动热更新

#### 方式二：直接引用源码（开发环境）

在父项目的 `vite.config.js` 或 `vue.config.js` 中配置别名：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      'ai-aa': resolve(__dirname, '../ai-aa/src')
    }
  }
}
```

然后在父项目中直接引用源码：

```javascript
// main.js
import AIComponentLib from 'ai-aa/src/index.js'
```

**注意：** 这种方式需要父项目和组件库使用相同的构建工具和配置。

### 1.2 调试技巧

#### 查看组件库日志

组件库内部使用 `console.log` 输出调试信息，可以在浏览器控制台查看：

- `[AIClient]` - 网络请求相关
- `[StreamMessageParser]` - 消息解析相关
- `[TrainingX]` - TrainingX 智能体相关

#### 使用 Vue DevTools

组件库完全支持 Vue DevTools，可以：
- 查看组件树
- 检查组件 props 和 data
- 监听事件

---

## 2. 父项目集成

### 2.1 安装组件库

```bash
npm install ai-aa
```

### 2.2 注册组件库

在父项目的 `main.js` 中：

```javascript
import Vue from 'vue'
import AIComponentLib from 'ai-aa'
import http from '@/utils/http' // 父项目的 HTTP 封装

// 注册组件库
Vue.use(AIComponentLib, {
  // HTTP 适配器（必需）
  http: (method, url, data, config = {}) => {
    // 直接调用父项目的 http 函数
    // method: 'get' | 'post' | 'put' | 'delete' | 'patch'
    // url: 接口地址（可能包含前缀，如 /api、/safe-center）
    // data: 请求数据
    // config: 额外配置（如 showLoading、hideErrorMsg 等）
    return http(method, url, data, config)
  },
  
  // 配置提供者（必需）
  // 用于 SSE 流式请求获取 baseUrl 和 headers
  configProvider: () => ({
    baseUrl: '/api', // SSE 请求的 baseUrl
    headers: {
      // 可选：额外的请求头
      // 'Chain-Version': '2.48.0'
    }
  })
})
```

### 2.3 使用组件

#### 基础用法

```vue
<template>
  <div>
    <AIAgentContainer />
  </div>
</template>

<script>
export default {
  name: 'MyPage'
}
</script>
```

#### 自定义智能体

通过 `extra-agents` prop 注入自定义智能体，通过 `agent-view` slot 渲染内容：

```vue
<template>
  <AIAgentContainer 
    :extra-agents="customAgents"
    business-line="retail"
    :is-mini="false"
  >
    <!-- 自定义智能体视图 -->
    <template #agent-view="{ agent }">
      <OrderQueryView v-if="agent.id === 'order-helper'" />
      <ApprovalView v-else-if="agent.id === 'approval-helper'" />
    </template>
    
    <!-- 侧边栏底部插槽 -->
    <template #sidebar-bottom>
      <div class="custom-sidebar-footer">
        <button @click="handleCustomAction">自定义操作</button>
      </div>
    </template>
  </AIAgentContainer>
</template>

<script>
import OrderQueryView from './OrderQueryView.vue'
import ApprovalView from './ApprovalView.vue'

export default {
  name: 'MyPage',
  components: {
    OrderQueryView,
    ApprovalView
  },
  data() {
    return {
      // 自定义智能体列表
      customAgents: [
        {
          id: 'order-helper',        // 唯一标识
          name: '订单助手',          // 显示名称
          icon: '📦',               // 图标（可以是 emoji 或图片 URL）
          description: '查询订单状态和物流信息', // 描述
          type: 'slot'              // 必须为 'slot'，表示使用 slot 渲染
        },
        {
          id: 'approval-helper',
          name: '审批助手',
          icon: '✅',
          description: '处理审批流程',
          type: 'slot'
        }
      ]
    }
  },
  methods: {
    handleCustomAction() {
      // 自定义操作
    }
  }
}
</script>
```

#### 智能体配置说明

`extra-agents` 数组中的每个对象支持以下属性：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | String | 是 | 智能体唯一标识 |
| `name` | String | 是 | 显示名称 |
| `icon` | String | 否 | 图标（emoji 或图片 URL） |
| `description` | String | 否 | 描述信息 |
| `type` | String | 是 | 必须为 `'slot'` |

#### 使用 AIChatWindow（弹窗模式）

```vue
<template>
  <div>
    <button @click="visible = true">打开 AI 助手</button>
    
    <AIChatWindow 
      :visible.sync="visible"
      :extra-agents="customAgents"
      business-line="retail"
    >
      <template #agent-view="{ agent }">
        <CustomView v-if="agent.id === 'custom-agent'" />
      </template>
    </AIChatWindow>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: false,
      customAgents: [
        {
          id: 'custom-agent',
          name: '自定义助手',
          icon: '🤖',
          type: 'slot'
        }
      ]
    }
  }
}
</script>
```

### 2.4 访问组件库 API

组件库会在 Vue 实例上挂载以下对象：

#### `this.$aiClient`

用于发起网络请求，会自动使用父项目的 HTTP 配置：

```javascript
// GET 请求
const res = await this.$aiClient.send({
  url: '/api/v1/inspect/chat/web/agentV2/2/chat/list',
  method: 'get',
  data: { pageNo: 1, pageSize: 10 }
})

// POST 请求
const res = await this.$aiClient.send({
  url: '/api/inspect/chat/web/agentV2/2/chat/add',
  method: 'post',
  data: { mineType: 'text', source: 'web' }
})

// 带额外配置的请求
const res = await this.$aiClient.send({
  url: '/api/v1/xxx',
  method: 'get',
  data: { id: '123' },
  httpConfig: {
    showLoading: true,
    hideErrorMsg: false
  }
})
```

#### `this.$aiEventBus`

全局事件总线，用于组件间通信：

```javascript
// 监听事件
this.$aiEventBus.$on('agent:selected', (agentId) => {
  console.log('选中了智能体:', agentId)
})

// 触发事件
this.$aiEventBus.$emit('agent:selected', 'my-agent-id')
```

---

## 3. HTTP 配置

### 3.1 HTTP 适配器接口

父项目需要提供一个 HTTP 适配器函数，签名如下：

```typescript
type HttpAdapter = (
  method: string,      // 'get' | 'post' | 'put' | 'delete' | 'patch'
  url: string,         // 接口地址（可能包含前缀，如 /api、/safe-center）
  data?: any,          // 请求数据
  config?: object      // 额外配置（如 showLoading、hideErrorMsg 等）
) => Promise<any>
```

### 3.2 父项目 HTTP 函数示例

假设父项目有一个 `http` 函数，格式如下：

```javascript
// 父项目的 http 函数
function http(type, url, data, config = {}) {
  // type: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'form'
  // url: 接口地址
  // data: 请求数据
  // config: { showLoading, hideErrorMsg, ... }
  
  // ... 实现逻辑
  return axiosInstance.request({ ... })
}
```

**适配器包装：**

```javascript
Vue.use(AIComponentLib, {
  http: (method, url, data, config = {}) => {
    // 将 method 转换为父项目需要的 type
    const type = method.toLowerCase()
    return http(type, url, data, config)
  },
  configProvider: () => ({
    baseUrl: '/api',
    headers: {}
  })
})
```

### 3.3 URL 前缀处理

组件库的 API 调用中，URL 可能包含以下前缀：

- `/api` - 用于 SSE 和聊天相关接口
- `/safe-center` - 用于培训相关接口
- `/qwapi` - 其他业务接口
- `/device-api` - 设备相关接口
- `/nissan-api` - 其他业务接口

**父项目需要在请求拦截器中处理这些前缀：**

```javascript
// 父项目的 axios 拦截器
myAxios.interceptors.request.use(config => {
  let url = config.url
  
  if (process.env.NODE_ENV === 'production') {
    // 根据 URL 前缀替换为实际域名
    const prefixMap = [
      { key: '/api', host: 'VUE_APP_REQUEST_HOST' },
      { key: '/safe-center', host: 'VUE_APP_REQUEST_SC_HOST' },
      { key: '/qwapi', host: 'VUE_APP_REQUEST_QW_HOST' },
      // ...
    ]
    
    for (let item of prefixMap) {
      if (url.indexOf(item.key) > -1) {
        url = process.env[item.host] + url.replace(new RegExp(item.key), '')
        break
      }
    }
  }
  
  config.url = url
  return config
})
```

### 3.4 GET 请求参数处理

组件库会自动将 GET/DELETE 请求的 `data` 包装成 `{ params: data }`，父项目的拦截器需要处理 `config.params`：

```javascript
// 父项目的请求拦截器
myAxios.interceptors.request.use(config => {
  // GET 请求参数编码
  if (config.method === 'get' && config.params) {
    let url = config.url
    url += '?'
    let keys = Object.keys(config.params)
    for (let key of keys) {
      if (
        config.params[key] ||
        config.params[key] === false ||
        config.params[key] === 0
      ) {
        url += `${key}=${encodeURIComponent(config.params[key])}&`
      }
    }
    url = url.substring(0, url.length - 1)
    config.params = {}
    config.url = url
  }
  return config
})
```

### 3.5 SSE 配置

SSE（Server-Sent Events）流式请求需要单独配置 `baseUrl`：

```javascript
Vue.use(AIComponentLib, {
  http: (method, url, data, config) => { ... },
  
  // SSE 配置
  configProvider: () => ({
    baseUrl: '/api',  // SSE 请求的 baseUrl
    headers: {
      // 可选：额外的请求头
    }
  })
})
```

**注意：**
- `baseUrl` 会被拼接到 SSE 请求的 URL 前面
- 如果 URL 已经是绝对路径（`http://` 开头），则不会拼接 `baseUrl`
- SSE 请求会自动携带 Cookie（`credentials: 'include'`）

### 3.6 完整配置示例

```javascript
// main.js
import Vue from 'vue'
import AIComponentLib from 'ai-aa'
import http from '@/utils/http'

Vue.use(AIComponentLib, {
  // HTTP 适配器
  http: (method, url, data, config = {}) => {
    const type = method.toLowerCase()
    return http(type, url, data, config)
  },
  
  // SSE 配置
  configProvider: () => {
    // 可以根据环境动态配置
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VUE_APP_SSE_BASE_URL || '/api'
      : '/api'
    
    return {
      baseUrl,
      headers: {
        // 如果需要额外的请求头，可以在这里添加
        // 'Chain-Version': '2.48.0'
      }
    }
  }
})
```

---

## 4. 常见问题

### 4.1 组件库修改后父项目没有更新

**解决方案：**
1. 确保运行了 `npm run build:watch`
2. 检查父项目是否正确链接到组件库
3. 尝试重启父项目的开发服务器

### 4.2 GET 请求参数没有传递

**检查：**
1. 确认父项目的请求拦截器正确处理了 `config.params`
2. 确认 `httpAdapter` 函数正确传递了参数

### 4.3 SSE 请求失败

**检查：**
1. 确认 `configProvider` 返回了正确的 `baseUrl`
2. 确认父项目的代理配置正确
3. 检查浏览器控制台的网络请求

### 4.4 自定义智能体不显示

**检查：**
1. 确认 `extra-agents` 数组格式正确
2. 确认 `type` 字段为 `'slot'`
3. 确认提供了 `agent-view` slot

---

## 5. 更多资源

- 组件库源码：`src/`
- 内置智能体示例：`src/agents/built-in/`
- API 定义：`src/agents/built-in/TrainingX/api.js`

---

**最后更新：** 2025-01-XX


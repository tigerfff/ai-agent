# 接入指南

本文档介绍如何在你的 Vue 2 项目中安装和使用 `hik-cloud-agentX` 组件库。

---

## 📦 安装

### 1. 安装组件库

```bash
npm install hik-cloud-agentX
```

### 2. 安装必要的依赖

组件库依赖以下 peer dependencies，你需要在宿主项目中安装：

```bash
npm install vue@^2.7.0
```

如果你使用了组件库的某些高级功能，可能还需要安装：

```bash
# 如果使用了 Hui UI 组件
npm install hui@2.43.2

# 如果使用了时间处理功能
npm install moment@^2.30.1

# 如果使用了图表功能
npm install echarts@^5.5.1

# 如果使用了视频播放功能
npm install video.js@^8.9.0

# 如果使用了文件上传功能
npm install ali-oss@^6.23.0

# 如果使用了工具函数
npm install lodash@^4.17.21
```

---

## 🚀 快速开始

### 方式一：全局注册（推荐）

在你的项目入口文件（如 `main.js`）中：

```javascript
import Vue from 'vue';
import App from './App.vue';

// 1. 引入组件库
import HikCloudAgentX from 'hik-cloud-agentX';

// 2. 引入样式
import 'hik-cloud-agentX/style';

// 3. 配置 HTTP 适配器和配置提供者
import axios from 'axios';

const httpAdapter = async ({ url, method, data, headers }) => {
  const res = await axios({
    url,
    method,
    data,
    headers
  });
  return res.data;
};

const configProvider = () => {
  return {
    businessLine: 'retail', // 业务线标识
    // 其他配置...
  };
};

// 4. 注册插件
Vue.use(HikCloudAgentX, {
  http: httpAdapter,
  configProvider
});

new Vue({
  render: h => h(App)
}).$mount('#app');
```

### 方式二：按需引入

如果你只需要使用某些组件：

```javascript
import { AIChatWindow, AIInput } from 'hik-cloud-agentX';
import 'hik-cloud-agentX/style';

export default {
  components: {
    AIChatWindow,
    AIInput
  }
};
```

**注意：** 按需引入时，你需要手动处理 `$aiClient` 的注入。

---

## 💡 使用示例

### 示例 1：完整的 AI 聊天窗口

```vue
<template>
  <div id="app">
    <!-- 触发按钮 -->
    <button @click="showChat = true">打开 AI 助手</button>

    <!-- AI 聊天窗口（抽屉形式） -->
    <AIChatWindow
      v-model="showChat"
      business-line="retail"
      :conversation-id="conversationId"
      @select-conversation="handleSelectConversation"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      showChat: false,
      conversationId: ''
    };
  },
  methods: {
    handleSelectConversation(id) {
      this.conversationId = id;
      console.log('Selected conversation:', id);
    }
  }
};
</script>
```

### 示例 2：嵌入式 AI 容器

```vue
<template>
  <div class="chat-container">
    <AIAgentContainer
      :conversation-id="conversationId"
      business-line="retail"
      @select-conversation="handleSelectConversation"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      conversationId: ''
    };
  },
  methods: {
    handleSelectConversation(id) {
      this.conversationId = id;
    }
  }
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 600px;
}
</style>
```

### 示例 3：单独使用输入框

```vue
<template>
  <div>
    <AIInput
      v-model="message"
      :loading="isLoading"
      placeholder="输入你的问题..."
      :allowed-types="['image', 'video']"
      @send="handleSend"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '',
      isLoading: false
    };
  },
  methods: {
    async handleSend(data) {
      console.log('User sent:', data);
      this.isLoading = true;
    
      // 处理发送逻辑
      try {
        // 调用你的 API...
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>
```

---

## ⚙️ 配置说明

### HTTP 适配器

HTTP 适配器是必需的，用于处理所有 API 请求。

```javascript
const httpAdapter = async ({ url, method, data, headers }) => {
  // 你的 HTTP 客户端实现
  // 可以使用 axios、fetch 或其他 HTTP 库
  
  const response = await axios({
    url,
    method: method || 'GET',
    data,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  
  return response.data;
};
```

### 配置提供者

配置提供者用于提供全局配置信息。

```javascript
const configProvider = () => {
  return {
    businessLine: 'retail',     // 业务线标识
    userId: 'user123',          // 用户 ID（可选）
    environment: 'production'   // 环境标识（可选）
  };
};
```

---

## 📝 组件文档

详细的组件 API 文档请查看：

- [AIChatWindow - 聊天窗口](./components/AIChatWindow.md)
- [AIAgentContainer - 智能体容器](./components/AIAgentContainer.md)
- [AIInput - 输入框](./components/AIInput.md)
- [AIHistory - 历史消息](./components/AIHistory.md)
- [AIBubble - 消息气泡](./components/AIBubble.md)
- [更多组件...](./components/)

---

## 🎨 样式定制

### 引入 SCSS 源文件

如果你需要定制主题色或样式变量：

```javascript
// 不引入编译后的 CSS
// import 'hik-cloud-agentX/style';

// 引入 SCSS 源文件
import 'hik-cloud-agentX/src/style/index.scss';
```

然后在你的全局样式文件中覆盖变量：

```scss
// 在引入组件库样式之前定义变量
$primary-color: #1890ff;
$border-radius: 4px;

// 引入组件库样式
@import 'hik-cloud-agentX/src/style/index.scss';
```

### 使用 CSS 变量覆盖（推荐）

```css
:root {
  --ai-primary-color: #1890ff;
  --ai-text-color: #333;
  --ai-bg-color: #f5f5f5;
}
```

---

## 🔧 常见问题

### Q1: 样式没有生效？

确保你已经引入了样式文件：

```javascript
import 'hik-cloud-agentX/style';
```

如果使用 Vite/Webpack，确保配置了 CSS 处理器。

### Q2: 组件报错 `$aiClient is not defined`？

确保你使用了 `Vue.use()` 全局注册了插件：

```javascript
Vue.use(HikCloudAgentX, {
  http: httpAdapter,
  configProvider
});
```

### Q3: 如何配置不同环境的 API 地址？

在 HTTP 适配器中根据环境变量处理：

```javascript
const httpAdapter = async ({ url, method, data, headers }) => {
  const baseURL = process.env.VUE_APP_API_BASE_URL || 'https://api.example.com';
  
  const response = await axios({
    url: `${baseURL}${url}`,
    method,
    data,
    headers
  });
  
  return response.data;
};
```

### Q4: 组件库体积太大？

可以考虑：

1. **按需引入组件**（而不是全局注册）
2. **配置 Tree Shaking**（Vite/Webpack 默认支持）
3. **使用 CDN 加载第三方依赖**（如 echarts、video.js）

---

## 🔗 相关链接

- [发布指南](./PUBLISH.md)
- [组件文档](./components/)
- [GitHub 仓库](#)
- [更新日志](#)

---

## 📞 技术支持

如有问题，请联系：

- 提交 Issue: [GitHub Issues](#)
- 内部支持：联系组件库维护团队

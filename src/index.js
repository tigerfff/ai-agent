import AIAgentContainer from './views/AgentContainer.vue';
import { setAdapter } from './ai-core/adapter';
import { AIClient } from './ai-core/client/AIClient';
import { EventBus } from './ai-core/event-bus';

// 组件库入口
const install = (Vue, options = {}) => {
  // 1. 注册全局组件
  Vue.component('AIAgentContainer', AIAgentContainer);

  // 2. 处理适配器注入
  // options: { http, configProvider }
  setAdapter(options);

  // 3. 挂载全局对象 (可选，方便调试或直接调用)
  // 这样父项目或其他组件可以通过 this.$aiClient 发送请求
  const client = new AIClient({
    httpAdapter: options.http,
    configProvider: options.configProvider
  });
  
  Vue.prototype.$aiClient = client;
  Vue.prototype.$aiEventBus = EventBus;
};

// 导出组件，方便局部引用
export { AIAgentContainer, AIClient, EventBus };

// 导出默认安装对象
export default {
  install
};


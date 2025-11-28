import AIAgentContainer from './views/AgentContainer.vue';
import AIInput from './ai-ui/input/AIInput.vue';
import AIBubble from './ai-ui/bubble/AIBubble.vue';
import AIHistory from './ai-ui/history/AIHistory.vue';
import AIConversations from './ai-ui/conversations/AIConversations.vue'; // 新增
import { setAdapter } from './ai-core/adapter';
import { AIClient } from './ai-core/client/AIClient';
import { EventBus } from './ai-core/event-bus';

// 组件库入口
const install = (Vue, options = {}) => {
  // 1. 注册全局组件
  Vue.component('AIAgentContainer', AIAgentContainer);
  Vue.component('AIInput', AIInput);
  Vue.component('AIBubble', AIBubble);
  Vue.component('AIHistory', AIHistory);
  Vue.component('AIConversations', AIConversations); // 新增注册

  // 2. 处理适配器注入
  setAdapter(options);

  // 3. 挂载全局对象
  const client = new AIClient({
    httpAdapter: options.http,
    configProvider: options.configProvider
  });
  
  Vue.prototype.$aiClient = client;
  Vue.prototype.$aiEventBus = EventBus;
};

// 导出组件
export { AIAgentContainer, AIInput, AIBubble, AIHistory, AIConversations, AIClient, EventBus };

export default {
  install
};

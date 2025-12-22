// 视图层组件
import AIAgentContainer from './views/AgentContainer.vue';
import AIChatWindow from './views/AIChatWindow.vue';

// 核心 UI 组件
import AIInput from './ai-ui/input/AIInput.vue';
import AIBubble from './ai-ui/bubble/AIBubble.vue';
import AIHistory from './ai-ui/history/AIHistory.vue';
import AIIcon from './ai-ui/icon/AIIcon.vue';
import AIConversations from './ai-ui/conversations/AIConversations.vue';
import AIWelcome from './ai-ui/welcome/AIWelcome.vue';

// 布局组件
import AILayout from './ai-ui/layout/AILayout.vue';
import AISidebar from './ai-ui/layout/AISidebar.vue';
import AIDrawer from './ai-ui/layout/AIDrawer.vue';

// 基础 UI 组件
import FilesCard from './ai-ui/file-card/FilesCard.vue';
import AIAttachments from './ai-ui/attachments/AIAttachments.vue';
import AttachmentsPreview from './ai-ui/attachments/AttachmentsPreview.vue';
import AILoadSelect from './ai-ui/base-form/AILoadSelect.vue';
import PersonSelect from './ai-ui/base-form/OrgPersonPagedPicker/index.vue';

// 辅助组件
import ChatSkeleton from './ai-ui/skeleton/ChatSkeleton.vue';
import AIEmpty from './ai-ui/empty/AIEmpty.vue';

// 核心功能
import { setAdapter } from './ai-core/adapter';
import { AIClient } from './ai-core/client/AIClient';
import { EventBus } from './ai-core/event-bus';

// 工具类
import { STSProvider } from './utils/sts-provider';
import { OssUploader } from './utils/oss-uploader';

// 导入样式（Vite 会自动处理 SCSS 编译和打包）
import './style/index.scss';

// 组件库入口
const install = (Vue, options = {}) => {
  // 1. 注册全局组件 - 视图层
  Vue.component('AIAgentContainer', AIAgentContainer);
  Vue.component('AIChatWindow', AIChatWindow);

  // 2. 注册全局组件 - 核心 UI
  Vue.component('AIInput', AIInput);
  Vue.component('AIBubble', AIBubble);
  Vue.component('AIHistory', AIHistory);
  Vue.component('AIIcon', AIIcon);
  Vue.component('AIConversations', AIConversations);
  Vue.component('AIWelcome', AIWelcome);

  // 3. 注册全局组件 - 布局
  Vue.component('AILayout', AILayout);
  Vue.component('AISidebar', AISidebar);
  Vue.component('AIDrawer', AIDrawer);

  // 4. 注册全局组件 - 基础 UI
  Vue.component('FilesCard', FilesCard);
  Vue.component('AIAttachments', AIAttachments);
  Vue.component('AttachmentsPreview', AttachmentsPreview);
  Vue.component('AILoadSelect', AILoadSelect);
  Vue.component('PersonSelect', PersonSelect);

  // 5. 注册全局组件 - 辅助
  Vue.component('ChatSkeleton', ChatSkeleton);
  Vue.component('AIEmpty', AIEmpty);

  // 6. 处理适配器注入
  setAdapter(options);

  // 7. 挂载全局对象
  const client = new AIClient({
    httpAdapter: options.http,
    configProvider: options.configProvider
  });
  
  Vue.prototype.$aiClient = client;
  Vue.prototype.$aiEventBus = EventBus;

  // 8. 配置 STSProvider（全局配置一次）
  if (options.http) {
    const baseURL = options.configProvider ? options.configProvider().baseUrl : '';
    STSProvider.config({
      httpClient: options.http,
      baseURL: baseURL
    });
  }
};

// 导出所有组件和工具
export { 
  // 视图层
  AIAgentContainer,
  AIChatWindow,
  // 核心 UI
  AIInput,
  AIBubble,
  AIHistory,
  AIConversations,
  AIWelcome,
  // 布局
  AILayout,
  AISidebar,
  AIDrawer,
  // 基础 UI
  FilesCard,
  AIAttachments,
  AttachmentsPreview,
  AILoadSelect,
  PersonSelect,
  // 辅助
  ChatSkeleton,
  AIEmpty,
  // 核心功能
  AIClient,
  EventBus,
  // 工具类
  STSProvider,
  OssUploader
};

export default {
  install
};

<template>
  <div class="training-x-agent">
    <div class="header">
      <h1>Training-X 助手 (内置)</h1>
      <div class="header-actions">
        <button @click="handleNewSession" class="test-btn" style="margin-right: 8px;">
          + 新会话
        </button>
        <button @click="startStreamDemo" :disabled="isStreaming" class="test-btn">
          {{ isStreaming ? '正在流式输出...' : '▶️ 测试流式打字' }}
        </button>
      </div>
    </div>
    
    <!-- 聊天区域 -->
    <div class="chat-area-wrapper">
      <!-- 欢迎页：无消息时显示 -->
      <AIWelcome
        v-if="messages.length === 0"
        v-bind="welcomeConfig"
        @select="handleWelcomeSelect"
      />

      <!-- 聊天历史：有消息时显示 -->
      <AIHistory 
        v-else
        ref="history"
        :list="messages" 
        max-height="100%"
        :back-button-threshold="50"
        @complete="handleFinish"
      >
        <!-- 自定义头像插槽 (可选) -->
        <template #avatar="{ item }">
          <div class="custom-avatar" :class="item.role">
            {{ item.role === 'user' ? '👤' : '🤖' }}
          </div>
        </template>

        <!-- Widget 插槽 -->
        <template #widget="{ info }">
           <div v-if="info.loading" class="widget-loading">
              <span class="loading-icon">⏳</span> 正在加载业务组件...
           </div>
           <DemoForm 
             v-else-if="info.widgetType === 'form:demo'" 
             :data="info.data" 
           />
           <!-- 可以在这里增加其他类型的判断 -->
        </template>

      </AIHistory>
    </div>

    <!-- 底部输入框 -->
    <div class="footer">
      <AIInput 
        :loading="isStreaming" 
        :speech-config-provider="getSpeechConfig"
        @send="handleSend" 
        @stop="handleStop"
      />
    </div>
  </div>
</template>

<script>
import DemoForm from './widgets/DemoForm.vue';
import AIWelcome from '@/ai-ui/welcome/AIWelcome.vue';
import { TrainingApi } from './api';

export default {
  name: 'TrainingXAgent',
  inject: ['sessionApi'],
  components: {
    DemoForm,
    AIWelcome
  },
  data() {
    return {
      isStreaming: false,
      delayTimer: null,
      streamTimer: null,
      // 消息列表数据源 (默认空，以显示欢迎页)
      messages: [],
      
      // 欢迎页配置
      welcomeConfig: {
        icon: '🎓',
        title: '你好，我是 Training-X 助手',
        description: '我可以帮你制定学习计划、解答技术难题，或者只是陪你聊聊最新的技术趋势。',
        prompts: [
          { icon: '📅', title: '制定学习计划', desc: '根据我的基础定制 Python 学习路线', text: '请帮我制定一份 Python 学习计划' },
          { icon: '🐍', title: 'Python 基础语法', desc: '讲解一下 Python 的装饰器', text: '请讲解 Python 装饰器的用法' },
          { icon: '🐛', title: '代码调试助手', desc: '帮我查找这段代码的 bug', text: '帮我看看这段代码有什么问题' },
          { icon: '📝', title: '生成表单演示', desc: '测试流式组件渲染能力', text: '请生成一个采购申请单表单' }
        ]
      },

      // 模拟的长文本数据源
      fullResponse: `好的，这里有一个表单需要您确认：
<form:demo>
{
  "id": "FORM-001",
  "name": "采购申请单"
}
</form:demo>
请确认无误后提交。`
    };
  },
  created() {
    // 示例：可以从 API 加载配置
    // TrainingApi.getWelcomeConfig().then(config => this.welcomeConfig = config);
  },
  methods: {
    handleWelcomeSelect(text) {
      this.handleSend({ text });
    },
    handleNewSession() {
      if (this.sessionApi) {
        this.sessionApi.createNewSession();
      }
    },
    handleSend(data) {
      console.log('发送内容:', data);

      // 演示：每次发送消息都更新会话标题
      if (this.sessionApi) {
         const newTitle = data.text.slice(0, 10) || '新会话';
         this.sessionApi.updateCurrentTitle(newTitle);
      }

      // 1. 追加用户消息
      this.messages.push({
        key: Date.now(),
        role: 'user',
        content: data.text || '',
        attachments: data.attachments || [], // 传递附件
        placement: 'end',
        variant: 'filled'
      });
      
      // 2. 模拟 AI 回复
      this.$nextTick(() => {
        this.startStreamDemo();
      });
    },
    
    startStreamDemo() {
      if (this.isStreaming) return;
      this.isStreaming = true;

      // 1. 先追加一个 Loading 状态的气泡
      const aiMsgKey = Date.now() + '_ai';
      this.messages.push({
        key: aiMsgKey,
        role: 'ai',
        content: '',
        loading: true, // 显示 loading
        placement: 'start',
        typing: true // 开启打字机
      });

      // 模拟网络延迟 1秒后开始输出
      this.delayTimer = setTimeout(() => {
        // 找到刚才那条消息，取消 loading，开始填充内容
        const aiMsg = this.messages.find(m => m.key === aiMsgKey);
        if (aiMsg) {
          aiMsg.loading = false;
          this.simulateSSE(aiMsg);
        }
      }, 1000);
    },

    // 模拟 SSE 流式接收
    simulateSSE(messageObj) {
      let index = 0;
      const chars = this.fullResponse.split('');
      
      this.streamTimer = setInterval(() => {
        if (index >= chars.length) {
          this.handleStop(); // 完成时清除定时器
          return;
        }
        // 每次追加 1-3 个字符，模拟真实网络包
        const chunk = chars.slice(index, index + Math.ceil(Math.random() * 3)).join('');
        
        // 直接修改对象属性，Vue 会响应式更新
        messageObj.content += chunk;
        
        index += chunk.length;
      }, 50); 
    },

    handleStop() {
      // 清除所有定时器
      if (this.delayTimer) clearTimeout(this.delayTimer);
      if (this.streamTimer) clearInterval(this.streamTimer);
      
      this.isStreaming = false;
      
      // 处理最后一条消息的状态
      const lastMsg = this.messages[this.messages.length - 1];
      if (lastMsg && lastMsg.role === 'ai') {
        lastMsg.loading = false; // 确保不显示 loading
        // 可以在这里追加一个 [已停止] 的标记，视业务需求而定
      }
      console.log('会话已停止');
    },

    handleFinish({ index }) {
      // 只有当最后一条消息打字完成时，才重置状态
      if (index === this.messages.length - 1) {
        // 注意：如果在打字机动画完成前点了停止，isStreaming 已经被 handleStop 设为 false 了
        // 这里只是为了确保状态一致性
        this.isStreaming = false;
        console.log('AI 回复完毕');
      }
    },

    // 提供给 AIInput 的语音配置
    async getSpeechConfig() {
      // TODO: 替换为您真实的腾讯云 ASR 密钥进行测试
      // 警告：不要将真实密钥提交到 Git 仓库！
      // 实际项目中，建议请求后端接口获取临时凭证
      return {
        secretId: 'YOUR_SECRET_ID', 
        secretKey: 'YOUR_SECRET_KEY',
        appId: 'YOUR_APP_ID'
      };
    }
  }
};
</script>

<style scoped>
.training-x-agent {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header h1 {
  font-size: 18px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.test-btn {
  padding: 6px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  cursor: pointer;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 聊天区域容器 */
.chat-area-wrapper {
  flex: 1;
  overflow: hidden; /* 让 AIHistory 处理内部滚动 */
  background: #f9f9f9;
  position: relative;
}

.footer {
  padding: 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

/* 自定义头像样式 */
.custom-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #eee;
}

.custom-avatar.user {
  background: #dbefff;
}

.custom-avatar.ai {
  background: #e6f7ff;
}

.widget-loading {
  padding: 12px;
  background: #fdf6ec;
  color: #e6a23c;
  border-radius: 4px;
  font-size: 13px;
  margin: 4px 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>


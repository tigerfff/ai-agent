<template>
  <div class="training-x-agent">
    <div class="header">
      <h1>Training-X 助手 (内置)</h1>
      <button @click="startStreamDemo" :disabled="isStreaming" class="test-btn">
        {{ isStreaming ? '正在流式输出...' : '▶️ 测试流式打字' }}
      </button>
    </div>
    
    <!-- 聊天区域：使用 AIHistory 组件 -->
    <div class="chat-area-wrapper">
      <AIHistory 
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

export default {
  name: 'TrainingXAgent',
  components: {
    DemoForm
  },
  data() {
    // 生成假数据撑开高度
    const mockMessages = Array.from({ length: 20 }).map((_, i) => ({
      key: `mock-${i}`,
      role: i % 2 === 0 ? 'user' : 'ai',
      content: i % 2 === 0 ? `这是第 ${i + 1} 条历史消息（用户）` : `这是第 ${i + 1} 条历史消息（AI），为了撑开页面高度测试滚动条。`,
      placement: i % 2 === 0 ? 'end' : 'start',
      variant: i % 2 === 0 ? 'filled' : 'outlined'
    }));

      return {
      isStreaming: false,
      delayTimer: null,
      streamTimer: null,
      // 消息列表数据源 (包含大量历史消息)
      messages: [
        ...mockMessages,
        {
          key: 'msg-static',
          role: 'ai',
          content: '**这是一条静态消息**，展示 `Markdown` 渲染能力：\n- 列表项 1\n- 列表项 2',
          placement: 'start'
        }
      ],
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
  methods: {
    handleSend(data) {
      console.log('发送内容:', data);
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

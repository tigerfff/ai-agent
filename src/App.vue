<template>
  <div id="app">
    <div class="host-page-mock">
      <h1>业务系统宿主页面</h1>
      <p>这是一个模拟的业务系统背景。</p>
      <button class="open-btn" @click="openChat">打开 AI 助手</button>
    </div>

    <!-- 模拟父项目使用组件库 -->
    <AIChatWindow 
      ref="chatWindow"
      business-line="retail"
      :visible.sync="visible"
      :extra-agents="customAgents"
      userId="211fdcadaa424f279670cf093af3340d"
    >
      <!-- 处理自定义智能体的渲染 -->
      <template #agent-view="{ agent }">
        <div class="custom-view-wrapper">
          <h2>{{ agent.name }} (Custom)</h2>
          <p>Agent ID: {{ agent.id }}</p>
          <p>这里是父项目注入的自定义业务组件。</p>
          <button @click="testRequest">测试父项目网络请求</button>
        </div>
      </template>

      <!-- <template #sidebar-bottom>
        111
      </template> -->
    </AIChatWindow>
  </div>
</template>

<script>
import AIChatWindow from '@/views/AIChatWindow.vue';

export default {
  name: 'App',
  components: {
    AIChatWindow
  },
  data() {
    return {
      visible: false,
      // 父项目定义的额外智能体
      customAgents: [
        {
          // 基础参数
          id: 'order-helper',
          name: '订单助手',
          miniName: '订单',
          icon: '📦',  // 或图片 URL
          homeIcon: '/path/to/icon.png',
          description: '查询订单状态和物流信息',
          tags: ['订单', '物流'],

          hideConversations: true,
          
          // 类型
          type: 'slot',  // 或 'external'
          
          // 如果是外部链接
          getUrl: () => {
            const origin = window.location.origin;
            return `${origin}/order/index.html`;
          },
          
          // 权限配置（可选）
          permission: {
            serviceName: '订单服务',
            permissionName: '订单权限码',
            checkService: true,
            checkPermission: true,
            permissionCodeKey: 'RETAIL_AUTH', // localStorage 中权限码的 key
            permissionCode: 'ORDER',           // 要检查的具体权限码
            serviceCheckApi: {
              url: '/api/order/service/check',
              method: 'get',
              data: {}
            }
          }
        }
      ]
    };
  },
  methods: {
    openChat() {
      console.log('openChat clicked');
      // this.visible = true;
      this.$refs.chatWindow.open({
        agentId: '',
        chatId: ''
      });
      // this.$refs.chatWindow.open();
    },
    async testRequest() {
      try {
        // 使用组件库暴露的 $aiClient 发起请求，走的是父项目的 axios
        const res = await this.$aiClient.send({
          url: '/test',
          method: 'GET'
        });
        console.log('请求成功', res);
      } catch (e) {
        console.error('请求失败', e);
        this.$message.error('请求测试失败');
      }
    }
  }
}
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow: hidden; /* 防止宿主页面滚动条干扰 */
}

.host-page-mock {
  padding: 50px;
  background: #f0f2f5;
  height: 100%;
  box-sizing: border-box;

  .open-btn {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    
    &:hover {
      background: #40a9ff;
    }
  }
}

.custom-view-wrapper {
  padding: 40px;
  background: #e6fffb;
  height: 100%;
  border-radius: 8px;
}
</style>
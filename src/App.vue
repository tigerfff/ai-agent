<template>
  <div id="app">
    <!-- 模拟父项目使用组件库 -->
    <AIAgentContainer 
      :extra-agents="customAgents"
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

      <!-- 侧边栏底部的自定义内容 -->
      <template #sidebar-bottom>
        <div style="padding: 10px; text-align: center; font-size: 12px; color: #999;">
          v1.0.0
        </div>
      </template>
    </AIAgentContainer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // 父项目定义的额外智能体
      customAgents: [
        {
          id: 'order-helper',
          name: '订单助手',
          icon: '📦',
          description: '查询订单状态和物流信息',
          type: 'slot' // 标记为 slot 类型
        },
        {
          id: 'approval-helper',
          name: '审批精灵',
          icon: '✍️',
          description: '快速处理待办审批',
          type: 'slot'
        }
      ]
    };
  },
  methods: {
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

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.custom-view-wrapper {
  padding: 40px;
  background: #e6fffb;
  height: 100%;
  border-radius: 8px;
}
</style>

<template>
  <div id="app">
    <div class="host-page-mock">
      <h1>业务系统宿主页面</h1>
      <p>这是一个模拟的业务系统背景。</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="open-btn" @click="openChat">打开 AI 助手</button>
        <button class="open-btn" style="background: #67c23a;" @click="openDataAnalysisNew">数据分析(新)</button>
        <button class="open-btn" style="background: #e6a23c;" @click="openDataAnalysisOld">数据分析(旧)</button>
      </div>
    </div>

    <!-- 模拟父项目使用组件库 -->
    <AIChatWindow 
      ref="chatWindow"
      business-line="custom" 
      :visible.sync="visible"
      :agent-ids="['inspect-x', 'data-analysis-x','training-x','try-x']" 
      :extra-agents="customAgents"
      userId="08040da51923457aaaf43e4267abcf4e"
    >
      <!-- 处理自定义智能体的渲染 -->
      <template #agent-view="{ agent }">
        <div v-if="agent.id === 'data-analysis-old'" class="custom-view-wrapper old-version-container">
          <div class="old-header">
            <h2>{{ agent.name }} (旧版 Slot)</h2>
            <el-tag type="warning" size="small">Legacy Version</el-tag>
          </div>
          
          <div class="old-content">
            <p class="description">这里是父项目注入的老版本数据分析逻辑，基于传统的报表展示方式。</p>
            
            <div class="mock-stats-grid">
              <div class="stat-card">
                <div class="stat-label">总销售额</div>
                <div class="stat-value">{{ oldVersionData.totalSales }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">订单数</div>
                <div class="stat-value">{{ oldVersionData.orderCount }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">活跃用户</div>
                <div class="stat-value">{{ oldVersionData.activeUsers }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">转化率</div>
                <div class="stat-value">{{ oldVersionData.conversionRate }}</div>
              </div>
            </div>

            <div class="mock-chart-placeholder">
              <div class="chart-title">销售趋势图 (模拟)</div>
              <div class="chart-bars">
                <div v-for="i in 7" :key="i" class="bar" :style="{ height: (30 + Math.random() * 60) + '%' }"></div>
              </div>
            </div>

            <div class="action-bar">
              <el-button type="primary" size="medium" @click="switchToNew">立即体验 AI 新版</el-button>
              <el-button size="medium" @click="testRequest">导出旧版报表</el-button>
            </div>
          </div>
        </div>
        <div v-else class="custom-view-wrapper">
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
      // 模拟旧版数据分析的数据
      oldVersionData: {
        totalSales: '¥ 1,284,500',
        orderCount: 1256,
        activeUsers: 856,
        conversionRate: '12.5%'
      },
      // 父项目定义的额外智能体
      customAgents: [
        {
          id: 'data-analysis-old',
          name: '数据分析(旧)',
          miniName: '分析',
          icon: '📊',
          description: '数据分析旧版本。',
          type: 'slot',
          businessGroup: 'data-analysis',
          isOld: true,
          hideConversations: true,
          sort: 2,
          permission: null
        },
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
      // this.visible = true;
      this.$refs.chatWindow.open({
        agentId: '4',
        chatId: ''
      });
      // this.$refs.chatWindow.open();
    },
    openDataAnalysisNew() {
      this.$refs.chatWindow.open({
        businessId: 'data-analysis',
        version: 'new'
      });
    },
    openDataAnalysisOld() {
      this.$refs.chatWindow.open({
        businessId: 'data-analysis',
        version: 'old'
      });
    },
    switchToNew() {
      // 通过 EventBus 通知容器切换到新版
      this.$aiEventBus.$emit('command:switch-agent', {
        businessId: 'data-analysis',
        version: 'new'
      });
    },
    async testRequest() {
      try {
        // 使用组件库暴露的 $aiClient 发起请求，走的是父项目的 axios
        const res = await this.$aiClient.send({
          url: '/test',
          method: 'GET'
        });
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
  box-sizing: border-box;
  overflow-y: auto;
}

.old-version-container {
  background: #fffbe6 !important;
  border: 1px solid #ffe58f;
  
  .old-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    h2 { margin: 0; color: #856404; }
  }

  .description {
    color: #856404;
    margin-bottom: 30px;
  }

  .mock-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 30px;

    .stat-card {
      background: #fff;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      
      .stat-label { font-size: 14px; color: #999; margin-bottom: 8px; }
      .stat-value { font-size: 20px; font-weight: bold; color: #333; }
    }
  }

  .mock-chart-placeholder {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    height: 200px;
    display: flex;
    flex-direction: column;

    .chart-title { font-size: 14px; font-weight: bold; margin-bottom: 20px; }
    .chart-bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 10px;
      
      .bar {
        width: 30px;
        background: #ffe58f;
        border-radius: 4px 4px 0 0;
        transition: height 0.3s;
      }
    }
  }

  .action-bar {
    display: flex;
    gap: 16px;
  }
}
</style>
<template>
  <div class="try-agent ${agentName.toLowerCase()}-agent" :class="{ 'is-mini': isMini }">
    <!-- 消息区域 -->
    <div class="chat-area">
      <AIWelcome
        v-if="messages.length === 0 && !isInitialLoading"
        v-bind="welcomeConfig"
        @select="handleWelcomeSelect"
        class="content-wrapper"
      />
      
      <ChatSkeleton style="margin-top: 40px;" v-else-if="isInitialLoading && messages.length === 0" class="content-wrapper" />

      <AIHistory 
        v-else
        ref="history"
        :list="messages" 
        :loading="loadingHistory"
        :no-more="allHistoryLoaded"
        :back-button-threshold="50"
        @complete="handleFinish"
        @load-more="handleLoadMore"
        :ignoreWidgetTypes="['ymform:suggest', 'ymform:patrol_plan_offline', 'ymform:patrol_plan_offline_create_result', 'ymform:patrol_plan_offline_delete']"
        class="history-full-width"
      >
        <template #widget="{ item, index }">
            <!-- 巡查/客流数据查询 Widget -->
           <PatrolPassengerDataQuery
            v-if="item.content && item.content.includes('ymform:patrol_passenger_data_query')"
            :data="parseWidgetData(item, 'ymform:patrol_passenger_data_query')"
            :client="$aiClient"
            :is-mini="isMini"
          />
          <!-- 数据分析报告 Widget -->
          <PatrolDataPush
            v-if="item.content && item.content.includes('ymform:patrol_data_push')"
            :data="parseWidgetData(item, 'ymform:patrol_data_push')"
            :client="$aiClient"
            :is-mini="isMini"
            @send-message="handleWidgetSend"
          />
        </template>

        <template #footer="{ item, index, isLast }">
          <div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <PatrolSelfCheckResult
                v-if="item.content && item.content.includes('ymform:patrol_plan_offline_create_result')"
                :data="parseWidgetData(item, 'ymform:patrol_plan_offline_create_result')"
                @send-message="handleWidgetSend"
              />

              <span 
                v-if="item.content && item.content.includes('ymform:patrol_plan_offline_create_result')" 
                style="padding: 0 4px; color: rgba(0, 0, 0, .1);"
              >|</span>

              <BubbleFooter 
                v-show="shouldShowFooter(item)"
                :item="item" 
                :actions="getActions(item)"
                :is-last="isLast"
                @action="handleAction($event, item, index)"
              />
            </div>

            <AISuggestWidget
              v-if="item.content && item.content.includes('ymform:suggest')"
              :data="parseWidgetData(item, 'ymform:suggest')"
              @select="handleWelcomeSelect"
            />
          </div>
        </template>
      </AIHistory>
    </div>

    <!-- 输入区域 -->
    <div class="footer">
      <div class="content-wrapper">
        <!-- Mock 测试按钮 -->
        <div style="margin-bottom: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
          <el-button size="mini" type="warning" plain @click="mockPatrolDataReport">测试数据分析报告</el-button>
          <el-button size="mini" type="success" plain @click="mockPatrolQueryReport">测试巡查查询结果</el-button>
          <el-button size="mini" type="primary" plain @click="mockSelfCheckResult">测试生成自检计划结果</el-button>
          <el-button size="mini" type="info" plain @click="mockCancelPlanMessage">测试点击取消自检计划</el-button>
        </div>

        <AIInput 
          ref="aiInput"
          v-model="aiInputText"
          :loading="isStreaming || isUploading"
          :showClearButton="false"
          :enable-stop-button="true"
          placeholder="有问题尽管问我~"
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="asrConfigProvider"
          :send-disabled="sendBtnDisabled"
          @send="handleSend" 
          @stop="handleStop"
          @file-list-change="inputFilesList = $event"
        />
        <p class="footer-text">内容由AI生成，仅供参考</p>
      </div>
    </div>
  </div>
</template>

<script>
import { DataAnalysisXApi } from './api';
import { AgentBaseMixin } from '@/mixins/AgentBaseMixin';
import AISuggestWidget from '@/ai-ui/base-widget/AISuggestWidget.vue';
import PatrolDataPush from './widgets/PatrolDataPush.vue';
import PatrolPassengerDataQuery from './widgets/PatrolPassengerDataQuery.vue';
import PatrolSelfCheckResult from './widgets/PatrolSelfCheckResult.vue';
import dataAnalysisHomeIcon from '@/assets/images/data-analysis-home.png';
import { parseWidgetData } from './widgets/widgetParser';

export default {
  name: 'DataAnalysisXAgent',
  mixins: [AgentBaseMixin],
  components: {
    AISuggestWidget,
    PatrolDataPush,
    PatrolPassengerDataQuery,
    PatrolSelfCheckResult
  },
  props: {
    conversationId: { type: String, default: '' },
    isMini: { type: Boolean, default: false }
  },
  data() {
    return {
      welcomeConfig: {
        title: '数据分析',
        description: '我是您的智能助手，有什么可以帮您的吗？',
        icon: dataAnalysisHomeIcon
      }
    };
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        if (!val || val.startsWith('conv-')) {
          this.fetchSuggestions();
        }
      }
    }
  },
  methods: {
    parseWidgetData(item, type) {
      return parseWidgetData(item, type);
    },
    getAgentApi() { return DataAnalysisXApi; },
    async fetchSuggestions() {
      try {
        const res = await DataAnalysisXApi.getSuggestions(this.$aiClient);
        if (res && res.code === 0 && Array.isArray(res.data)) {
          this.welcomeConfig.prompts = res.data.map(text => ({
            desc: text,
            text: text,
            needsFile: false
          }));
        } 
      } catch (e) {
        console.error('Fetch suggestions failed:', e);
      }
    },
    getActions(item) {
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },
    shouldShowFooter(item) {
      if (item.placement === 'start' && item.role === 'ai') {
        if (item.loading) return false;
        if (!item.msgId) return false;
        return true
      }
      return !!(item && item.content);
    },
    handleWidgetSend(text) {
      this.handleSend({ text });
    },
    /**
     * Mock 数据分析报告测试
     */
    mockPatrolDataReport() {
      const mockData = {
        "startDate": "2025-12-15",
        "endDate": "2026-02-15",
        "templateId": "32a0373b23884fd2aca7778db9ce18e4",
        "questionInfos": [
          { "questionId": "1", "questionName": "门店开水机灰尘擦拭" },
          { "questionId": "2", "questionName": "收银台玻璃制品、金属制品、贵重物品摆放规范" },
          { "questionId": "3", "questionName": "玻璃门窗清洁" },
          { "questionId": "4", "questionName": "后厨地面积水检查" }
        ]
      };

      const message = {
        key: Date.now(),
        role: 'ai',
        placement: 'start',
        content: `分析完成，这是您的门店检查总结报告：\n<ymform:patrol_data_push>\n${JSON.stringify(mockData, null, 2)}\n</ymform:patrol_data_push>`,
        time: Date.now()
      };

      this.messages.push(message);
    },
    /**
     * Mock 巡查查询结果测试
     */
    mockPatrolQueryReport() {
      const mockData = {
        "startDate": "2026-01-09",
        "endDate": "2026-01-17",
        "queryType": 2,
        "templateId": "06b695ef7bf74bf2a9f4dde08e44eff0",
        "areaOrStoreName": ""
      };

      const message = {
        key: Date.now(),
        role: 'ai',
        placement: 'start',
        content: `这是为您查询到的巡查统计结果：\n<ymform:patrol_passenger_data_query>\n${JSON.stringify(mockData, null, 2)}\n</ymform:patrol_passenger_data_query>`,
        time: Date.now()
      };

      this.messages.push(message);
    },
    /**
     * Mock 自检计划结果测试
     */
    mockSelfCheckResult() {
      const mockData = {
        "configId": "mock_config_123456"
      };

      const message = {
        key: Date.now(),
        role: 'ai',
        placement: 'start',
        content: `计划已为您生成，如有变动可随时取消：\n<ymform:patrol_plan_offline_create_result>\n${JSON.stringify(mockData, null, 2)}\n</ymform:patrol_plan_offline_create_result>`,
        time: Date.now(),
        msgId: 'msg-' + Date.now()
      };

      this.messages.push(message);
    },
    /**
     * Mock 点击取消自检计划后的消息
     */
    mockCancelPlanMessage() {
      const mockData = {
        "configId": "mock_config_123456"
      };
      
      const message = {
        key: Date.now(),
        role: 'user',
        placement: 'end',
        content: `取消自检计划<ymform:patrol_plan_offline_delete>${JSON.stringify(mockData)}</ymform:patrol_plan_offline_delete>`,
        time: Date.now()
      };
      
      this.messages.push(message);

      // 模拟 AI 回复
      setTimeout(() => {
        const aiMessage = {
          key: Date.now(),
          role: 'ai',
          placement: 'start',
          content: '好的，已为您取消该自检计划。',
          time: Date.now(),
          msgId: 'msg-' + Date.now()
        };
        this.messages.push(aiMessage);
      }, 1000);
    }
  }
};
</script>

<style lang="scss" scoped>
.try-agent {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  // 小窗模式适配
  &.is-mini {
    .chat-area .content-wrapper,
    .footer .content-wrapper {
      padding: 0 32px;
      max-width: 100%;
    }
  }

  .chat-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    width: 100%;

    .content-wrapper {
      max-width: 960px;
      margin: 0 auto;
      height: 100%;
      padding: 0 32px;

      @media (max-width: 1024px) {
        padding: 0 16px;
      }

      @media (max-width: 768px) {
        max-width: 600px;
        padding: 0 32px;
      }
    }

    .loading-history {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .history-full-width {
      width: 100%;
      height: 100%;
    }
  }

  .footer {
    flex-shrink: 0;
    width: 100%;
    padding: 16px 0 12px;

    .footer-text {
      font-size: 14px;
      color: rgba($color: #000000, $alpha: .3);
      text-align: center;
      margin-top: 12px;
    }

    .content-wrapper {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 32px;

      @media (max-width: 1024px) {
        padding: 0 16px;
      }

      @media (max-width: 768px) {
        max-width: 600px;
        padding: 0 32px;
      }
    }
  }
}
</style>
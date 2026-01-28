<template>
  <div class="patrol-data-push">
    <!-- 标题部分 -->
    <div class="report-header">
      <div class="report-title">{{ formatDateTitle(data.startDate) }}{{ applicationSceneName }}检查总结</div>
      <div class="report-summary" v-show="mostQuestionName">
        经过分析，发现您的{{ applicationSceneName }}确实普遍存在<span>「{{ mostQuestionName || '门店卫生' }}」</span>问题。其中有{{ topStores.length }}家{{ applicationSceneName }}问题尤为严重，现场情况如下：
      </div>
    </div>

    <!-- TOP 5 门店问题概览 -->
    <div class="section-header" v-show="topStores.length > 0">
      <div class="section-title">TOP5{{ applicationSceneName }}问题概览</div>
      <div class="view-all" @click="handleStoreDetail">查看全部详情</div>
    </div>
    <div class="section-container" v-show="topStores.length > 0">
      <div class="store-list">
        <div v-for="(store, index) in topStores" :key="store.storeId" class="store-item">
          <div class="store-info">
            <div class="store-name">
              <img v-if="index < 5" :src="rankIcons[index]" class="rank-icon" />
              <span v-else class="index">{{ index + 1 }}.</span>
              {{ store.storeName }}
            </div>
            <div class="problem-wrapper">
              <div class="problem-tag">【{{ getStoreProblemCount(store) }}个问题】</div>
              <div class="problem-desc" :title="getStoreProblemSummary(store)">
                {{ getStoreProblemSummary(store) }}
              </div>
            </div>
          </div>
          <div class="store-image" v-if="store.image">
            <img :src="store.image" :alt="`${applicationSceneName}问题图片`" />
          </div>
        </div>
      </div>
    </div>

    <!-- 客流数据重点提醒 -->
    <div class="section-container info-section" v-show="trafficData.length">
      <div class="section-header">
        <div class="section-title">
          <i class="h-icon-info_f info-icon"></i>
          {{ formatDateTitle(data.startDate) }}{{ applicationSceneName }}客流数据重点提醒
        </div>
      </div>
      <div class="section-desc">
        {{ trafficDesc }}
      </div>
      <EasyTable 
        :columns="trafficTableColumns" 
        :data="trafficData"
        style="margin-top: 8px;"
      >
        <template #cell-lastRate="{ value }">
          <span>{{ value > 0 ? '+' : '' }}{{ value }}%</span>
        </template>
        <template #cell-chainRate="{ value }">
          <span>{{ value > 0 ? '+' : '' }}{{ value }}%</span>
        </template>
      </EasyTable>
    </div>

    <!-- 门店卫生巡查问题总览 -->
    <ReportDocSection
      :title="`${formatDateTitle(data.startDate)}${applicationSceneName}问题总览`"
      description="已同步至「问题统计」模块，支持下载查看，或点击查看详情"
      icon-type="pdf"
      :export-function="toExport"
      :is-mini="isMini"
      @show-detail="handleShowDetail"
      style="margin-bottom: 16px;"
    />

    <div class="line"></div>

    <!-- 生成自检计划 -->
    <div class="section-container plan-section">
      <div class="section-header">
        <div class="section-title">
          <i class="h-icon-warning_f warning-icon"></i>
          针对以下高频问题，推荐生成自检计划
        </div>
      </div>
      <div class="section-desc mini-text">
        生成自检计划后，{{ applicationSceneName }}需拍照上传线下自检结果
      </div>
      <div class="problem-grid">
        <div v-for="info in data.questionInfos" :key="info.questionId" class="grid-item">
          <span class="dot"></span>
          <span class="grid-item-text" :title="info.questionName">{{ info.questionName }}</span>
        </div>
      </div>
      <div class="plan-footer">
        <AIButton
          :icon="starWhiteIcon"
          text="生成自检计划"
          @click="handleCreatePlan"
          v-if="!isConfirmed"
        />

        <AIButton
          v-else
          :icon="sureWhiteIcon"
          text="已生成自检计划"
          @click="handleCreatePlan"
          :disabled="isConfirmed"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <PatrolStoreDetailDrawer
      :visible.sync="drawerVisible"
      :title="drawerTitle"
      :stores="topStores"
      :client="client"
      :start-time="startTime"
      :end-time="endTime"
    />
  </div>
</template>

<script>
import { DataAnalysisXApi } from '../api';
import starWhiteIcon from '@/assets/svg/star-white.svg';
import rank1 from '@/assets/svg/rank-1.svg';
import rank2 from '@/assets/svg/rank-2.svg';
import rank3 from '@/assets/svg/rank-3.svg';
import rank4 from '@/assets/svg/rank-4.svg';
import rank5 from '@/assets/svg/rank-5.svg';
import sureWhiteIcon from '@/assets/svg/sure.svg';
import AIButton from '@/ai-ui/button/AIButton.vue';
import EasyTable from '@/ai-ui/base-form/EasyTable.vue';
import ReportDocSection from '@/ai-ui/base-form/ReportDocSection.vue';
import PatrolStoreDetailDrawer from './PatrolStoreDetailDrawer.vue';

export default {
  name: 'PatrolDataPush',
  components: {
    EasyTable,
    AIButton,
    starWhiteIcon,
    ReportDocSection,
    PatrolStoreDetailDrawer
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    client: {
      type: Object,
      required: true
    },
    isMini: {
      type: Boolean,
      default: false
    },
    isHistoryDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      starWhiteIcon,
      rankIcons: [rank1, rank2, rank3, rank4, rank5],
      mostQuestionName: '',
      topStores: [],
      trafficData: [],
      drawerVisible: false,
      startTime: 0,
      endTime: 0,
      isConfirmed: false,
      sureWhiteIcon
    };
  },
  computed: {
    drawerTitle() {
      return `${this.formatDateTitle(this.data.startDate)}问题${this.applicationSceneName}列表`;
    },
    // 客流数据表格列配置
    trafficTableColumns() {
      return [
        { label: `异常${this.applicationSceneName}名称`, prop: 'storeName' },
        { label: '昨日客流', prop: 'current' },
        { label: '同比', prop: 'lastRate' },
        { label: '环比', prop: 'chainRate' }
      ];
    },
    // 客流异常动态描述
    trafficDesc() {
      if (!this.trafficData || this.trafficData.length === 0) {
        return `经监测，暂无客流异常${this.applicationSceneName}。`;
      }
      const names = this.trafficData.slice(0, 3).map(item => item.storeName).join('、');
      const suffix = this.trafficData.length > 3 ? '等' : '';
      return `经监测，${names}${suffix}${this.applicationSceneName}昨日客流异常，其客流数据同比增长率>50% 或 环比增长率>20%。可能因促销活动导致来不及清洁，建议与一线${this.applicationSceneName}进一步确认。`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async toExport(done) {
      // 埋点：报告导出
      this.$trackEvent(this.$TRACK_EVENTS.WIDGET_DATA_REPORT_EXPORT, { prefix: '推送' });
      
      await DataAnalysisXApi.pdfExport(this.client, {
        startTime: this.data.startDate,
        endTime: this.data.endDate
      });
      done();
    },
    formatDateTitle(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    },
    async fetchData() {
      this.startTime = new Date(this.data.startDate).setHours(0, 0, 0, 0);
      this.endTime = new Date(this.data.endDate).setHours(23, 59, 59, 999);
      
      const startTime = this.startTime;
      const endTime = this.endTime;
      
      try {
        // 1. 获取最多问题
        const mostRes = await DataAnalysisXApi.queryMostQuestion(this.client, {
          startTime,
          endTime
        });
        if (mostRes && mostRes.code === 0 && mostRes.data) {
          this.mostQuestionName = mostRes.data.questionName;
        }

        // 2. 获取 TOP 5 门店概览
        const topRes = await DataAnalysisXApi.queryStoreQuestionData(this.client, {
          startTime,
          endTime
        });
        if (topRes && topRes.code === 0 && Array.isArray(topRes.data)) {
          this.topStores = topRes.data.slice(0, 5);
        }

        // 3. 获取客流重点变化
        const trafficRes = await DataAnalysisXApi.getPassengerChanges(this.client, {
          startTime: this.data.startDate,
          endTime: this.data.endDate
        });
        if (trafficRes.code === 0) {
          this.trafficData = trafficRes.data;
        }
      } catch (e) {
        console.error('[PatrolDataPush] fetch data failed:', e);
      }
    },
    getStoreProblemCount(store) {
      if (!store.questionData) return 0;
      return store.questionData.length
    },
    getStoreProblemSummary(store) {
      if (!store.questionData || store.questionData.length === 0) return '无异常情况';
      return store.questionData.map((q, i) => `${i + 1}、${q.questionName}`).join('；');
    },
    handleCreatePlan() {
      if (this.isConfirmed) return;
      
      // 埋点：生成自检计划
      this.$trackEvent(this.$TRACK_EVENTS.WIDGET_DATA_PLAN_CREATE);
      
      const planData = {
        templateId: this.data.templateId,
        questionIds: (this.data.questionInfos || []).map(q => q.questionId),
        storeIds: this.topStores.map(s => s.storeId)
      };
      
      const message = `生成自检计划<ymform:patrol_plan_offline>\n${JSON.stringify(planData, null, 2)}\n</ymform:patrol_plan_offline>`;
      this.$emit('send-message', message);
      this.isConfirmed = true;
    },
    handleShowDetail() {
      // 埋点：报告详情
      this.$trackEvent(this.$TRACK_EVENTS.WIDGET_DATA_REPORT_DETAIL, { prefix: '推送' });
      this.drawerVisible = true;
    },
    handleStoreDetail() {
      // 埋点：门店详情
      this.$trackEvent(this.$TRACK_EVENTS.WIDGET_DATA_STORE_DETAIL);
      this.drawerVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.patrol-data-push {
  background: #FFF;
  color: rgba(0,0,0,0.7);
  width: 100%;
  box-sizing: border-box;

  .line {
    height: 1px;
    background: #eee;
    margin-bottom: 16px;;
  }

  .report-header {
    margin-bottom: 16px;
    .report-title {
      color: rgba(0,0,0,0.9);
      font-size: 20px;
      line-height: 28px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .report-summary {
      font-size: 14px;
      line-height: 22px;
      color: rgba(0,0,0,0.7);
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: rgba(0,0,0,0.9);
      display: flex;
      align-items: center;
    }

    .view-all {
      font-size: 14px;
      color: rgba(58,147,255,1);
      cursor: pointer;
    }
  }

  .section-container {
    border-radius: 8px 8px 0px 0px;
    background: rgba(248,249,251,1);    
    padding: 12px 16px;
    margin-bottom: 16px;
   
    .section-desc {
      font-size: 14px;
      line-height: 22px;
      
      &.sub-text {
        font-size: 14px;
        color: rgba(0,0,0,0.5);
      }

      &.mini-text {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
        margin-top: -8px;
        margin-bottom: 16px;
      }
    }
  }

  .store-list {
    .store-item {
      display: flex;
      justify-content: space-between;
      // padding: 12px 0;
      margin-bottom: 12px;
      
      &:last-child {
        border-bottom: none;
      }

      .store-info {
        flex: 1;
        padding-right: 16px;

        .store-name {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          
          .rank-icon {
            width: 20px;
            height: 20px;
            margin-right: 4px;
          }

          .index {
            color: #fa8c16;
            margin-right: 4px;
          }
        }

        .problem-wrapper { 
          display: flex;
          align-items: center;
        }

        .problem-tag {
          font-size: 12px;
          line-height: 20px;
          color: rgba(250,50,57,1);
          flex-shrink: 0;
        }

        .problem-desc {
          font-size: 12px;
          color: rgba(0,0,0,0.5);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .store-image {
        width: 80px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
        background: #f0f0f0;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .info-section {
    .info-icon {
      color: #388eff;
      font-size: 18px;
    }
    
    // 表格样式已移至 EasyTable 组件
    // 仅保留趋势上升的样式
    .trend-up {
      color: #ff4d4f;
    }
  }

  .plan-section {
    .warning-icon {
      color: #fa8c16;
      font-size: 18px;
    }

    .problem-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;

      .grid-item {
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #FFF;
        padding: 8px 12px;
        border-radius: 4px;

        .dot {
          width: 4px;
          height: 4px;
          background: #388eff;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .grid-item-text {
          flex: 1;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          word-break: break-all;
        }
      }
    }

    .plan-footer {
      display: flex;
      justify-content: flex-start;

      .ai-btn {
        background: linear-gradient(90deg, #6ea1ff 0%, #388eff 100%);
        border: none;
        height: 36px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 18px;

        .plan-btn-icon {
          font-size: 16px;
        }
      }
    }
  }
}
</style>


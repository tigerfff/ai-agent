<template>
  <div class="patrol-data-push">
    <!-- 标题部分 -->
    <div class="report-header">
      <div class="report-title">{{ formatDateTitle(data.startDate) }}门店检查总结</div>
      <div class="report-summary">
        经过分析，发现您的门店确实普遍存在<span class="highlight">「{{ mostQuestionName || '门店卫生' }}」</span>问题。其中有{{ topStores.length }}家门店问题尤为严重，现场情况如下：
      </div>
    </div>

    <!-- TOP 5 门店问题概览 -->
    <div class="section-header">
      <div class="section-title">TOP {{ topStores.length }} 门店问题概览</div>
      <div class="view-all" @click="showDetail">查看全部详情</div>
    </div>
    <div class="section-container">
      <div class="store-list">
        <div v-for="(store, index) in topStores" :key="store.storeId" class="store-item">
          <div class="store-info">
            <div class="store-name">
              <span class="index">{{ index + 1 }}.</span> {{ store.storeName }}
            </div>
            <div class="problem-wrapper">
              <div class="problem-tag">【{{ getStoreProblemCount(store) }}个问题】</div>
              <div class="problem-desc">
                {{ getStoreProblemSummary(store) }}
              </div>
            </div>
          </div>
          <div class="store-image" v-if="store.image">
            <img :src="store.image" alt="门店问题图片" />
          </div>
        </div>
      </div>
    </div>

    <!-- 客流数据重点提醒 -->
    <div class="section-container info-section">
      <div class="section-header">
        <div class="section-title">
          <i class="h-icon-info_f info-icon"></i>
          {{ formatDateTitle(data.startDate) }}客流数据重点提醒
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
          <span class="trend-up">+{{ value }}%</span>
        </template>
        <template #cell-chainRate="{ value }">
          <span class="trend-up">+{{ value }}%</span>
        </template>
      </EasyTable>
    </div>

    <!-- 门店卫生巡查问题总览 -->
    <div class="section-container doc-section" :class="{ 'is-mini-mode': isMini }">
      <div class="section-header">
        <div class="doc-icon-wrapper">
            <i class="h-icon-file_f doc-icon"></i>
        </div>
        <div class="doc-content">
          <p class="section-title">
            {{ formatDateTitle(data.startDate) }}{{ mostQuestionName || '门店卫生' }}巡查问题总览
          </p>
          <p class="section-desc sub-text">
            已同步至「问题统计」模块，支持下载查看，或点击查看详情
          </p>
        </div>
        
      </div>
     
      <div class="action-buttons">
        <hik-cloud-sync-export
        :export-function="toExport"
        export-label="导出明细"
        ></hik-cloud-sync-export>
        <el-button size="mini" icon="h-icon-details" @click="showDetail">详情</el-button>
      </div>
    </div>

    <!-- 生成自检计划 -->
    <div class="section-container plan-section">
      <div class="section-header">
        <div class="section-title">
          <i class="h-icon-warning_f warning-icon"></i>
          针对以下高频问题，推荐生成自检计划
        </div>
      </div>
      <div class="section-desc mini-text">
        生成自检计划后，门店需拍照上传线下自检结果
      </div>
      <div class="problem-grid">
        <div v-for="info in data.questionInfos" :key="info.questionId" class="grid-item">
          <span class="dot"></span>
          <span class="grid-item-text">{{ info.questionName }}</span>
        </div>
      </div>
      <div class="plan-footer">
        <AIButton
          :icon="starWhiteIcon"
          text="生成自检计划"
          @click="handleCreatePlan"
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
import AIButton from '@/ai-ui/button/AIButton.vue';
import EasyTable from '@/ai-ui/base-form/EasyTable.vue';
import PatrolStoreDetailDrawer from './PatrolStoreDetailDrawer.vue';

export default {
  name: 'PatrolDataPush',
  components: {
    EasyTable,
    AIButton,
    starWhiteIcon,
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
    }
  },
  data() {
    return {
      starWhiteIcon,
      mostQuestionName: '',
      topStores: [],
      trafficData: [],
      drawerVisible: false,
      startTime: 0,
      endTime: 0
    };
  },
  computed: {
    drawerTitle() {
      return `${this.formatDateTitle(this.data.startDate)}萧山区问题门店列表`;
    },
    // 客流数据表格列配置
    trafficTableColumns() {
      return [
        { label: '异常门店名称', prop: 'storeName' },
        { label: '昨日客流', prop: 'current' },
        { label: '同比', prop: 'lastRate' },
        { label: '环比', prop: 'chainRate' }
      ];
    },
    // 客流异常动态描述
    trafficDesc() {
      if (!this.trafficData || this.trafficData.length === 0) {
        return '经监测，暂无客流异常门店。';
      }
      const names = this.trafficData.slice(0, 3).map(item => item.storeName).join('、');
      const suffix = this.trafficData.length > 3 ? '等' : '';
      return `经监测，${names}${suffix}门店昨日客流异常，其客流数据同比增长率>50% 或 环比增长率>20%。可能因促销活动导致来不及清洁，建议与一线门店进一步确认。`;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    toExport(done) {
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
        let mostRes;
        try {
          mostRes = await DataAnalysisXApi.queryMostQuestion(this.client, {
            startTime,
            endTime
          });
        } catch (e) {
          console.warn('[PatrolDataPush] queryMostQuestion failed, using mock data');
          mostRes = { code: 0, data: { questionName: '门店卫生' } };
        }

        if (mostRes && mostRes.code === 0 && mostRes.data) {
          this.mostQuestionName = mostRes.data.questionName;
        }

        // 2. 获取 TOP 5 门店概览
        let topRes;
        try {
          topRes = await DataAnalysisXApi.queryStoreQuestionData1(this.client, {
            startTime,
            endTime
          });
        } catch (e) {
          console.warn('[PatrolDataPush] queryStoreQuestionData failed, using mock data');
          topRes = {
            code: 0,
            data: [
              {
                storeId: '1',
                storeName: '萧山银隆百货店',
                questionData: [
                  { questionName: '地面有大面积积水', questionCount: 15 },
                  { questionName: '部分员工未按规定佩戴工牌', questionCount: 10 }
                ]
              },
              {
                storeId: '2',
                storeName: '萧山万象汇店',
                questionData: [
                  { questionName: '货架上陈列杂乱', questionCount: 8 },
                  { questionName: '缺货未及时补货', questionCount: 2 }
                ]
              },
              {
                storeId: '3',
                storeName: '旺角城新天地店',
                questionData: [
                  { questionName: '价签对应错误', questionCount: 5 }
                ]
              },
              {
                storeId: '4',
                storeName: '萧山宝龙店',
                questionData: [
                  { questionName: '垃圾桶满溢未及时清理', questionCount: 3 }
                ]
              },
              {
                storeId: '5',
                storeName: '萧山加州阳光店',
                questionData: [
                  { questionName: '熟食区部分展柜未及时遮盖', questionCount: 1 }
                ]
              }
            ]
          };
        }

        if (topRes && topRes.code === 0 && Array.isArray(topRes.data)) {
          this.topStores = topRes.data.slice(0, 5);
        }

        // 3. 获取客流重点变化
        try {
          const trafficRes = await DataAnalysisXApi.getPassengerChanges(this.client, {
            startTime: this.data.startDate,
            endTime: this.data.endDate
          });
          if (trafficRes.code === 200 && Array.isArray(trafficRes.data)) {
            this.trafficData = trafficRes.data;
          } else {
            console.warn('[PatrolDataPush] getPassengerChanges failed, using mock data');
            this.trafficData = [
              { storeId: 'store001', storeName: '萧山银隆百货店', current: 121199, lastRate: 50, chainRate: 33 },
              { storeId: 'store002', storeName: '萧山万象汇店', current: 99199, lastRate: 67, chainRate: 67 }
            ];
          }
        } catch (e) {
          console.warn('[PatrolDataPush] getPassengerChanges failed', e);
        }
      } catch (e) {
        console.error('[PatrolDataPush] fetch data failed:', e);
      }
    },
    getStoreProblemCount(store) {
      if (!store.questionData) return 0;
      return store.questionData.reduce((acc, cur) => acc + (cur.questionCount || 0), 0);
    },
    getStoreProblemSummary(store) {
      if (!store.questionData || store.questionData.length === 0) return '无异常情况';
      return store.questionData.map((q, i) => `${i + 1}、${q.questionName}`).join('；');
    },
    handleCreatePlan() {
      const planData = {
        templateId: this.data.templateId,
        questionIds: (this.data.questionInfos || []).map(q => q.questionId),
        storeIds: this.topStores.map(s => s.storeId)
      };
      
      const message = `<ymform:patrol_plan_offline>\n${JSON.stringify(planData, null, 2)}\n</ymform:patrol_plan_offline>`;
      this.$emit('send-message', message);
    },
    showDetail() {
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
          font-weight: 500;
          margin-bottom: 4px;
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

    .doc-section {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &.is-mini-mode {
        flex-direction: column;
        align-items: flex-start;

        .action-buttons {
          margin-top: 4px;
          margin-left: 44px; // 32px (icon) + 12px (gap)
          justify-content: flex-start;
          width: calc(100% - 44px);
          ::v-deep .el-button {
            font-weight: 400 !important;
            color: rgba(0,0,0,0.7);
          }
        }
      }

      .section-header{
        display: flex;
        align-items: center;
        .doc-content {
          margin-left: 12px;
          .section-title{
            margin-top: 4px;
          }
        }
      }
      
      .doc-icon-wrapper {
        width: 32px;
        height: 32px;
        background: #fff1f0;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        .doc-icon {
          color: #ff4d4f;
          font-size: 18px;
        }
      }

      .action-buttons {
        display: flex;
        align-items: center;
        gap: 12px;
        justify-content: flex-end;
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


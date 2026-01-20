<template>
  <div class="patrol-passenger-query">
    <!-- 巡查报表视图 (queryType === 0) -->
    <template v-if="normalizedQueryType === 0">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <i class="h-icon-loading"></i>
        <p>巡查统计数据分析中...</p>
      </div>

      <div v-else-if="hasData" class="patrol-report">
        <!-- 标题 -->
        <div class="report-header">
          <div class="report-title">{{ formatRangeTitle(data.startDate, data.endDate) }}巡查统计结果</div>
        </div>

        <!-- 1. 得分排名前 5 -->
        <div v-if="topStores.length > 0" class="section-container">
          <div class="section-header">
            <span class="dot"></span>
            <span class="header-text">{{ storeTopHeaderText }}</span>
          </div>
          <EasyTable :columns="topStoreRankColumns" :data="topStores" />
        </div>

        <!-- 2. 得分排名后 5 -->
        <div v-if="showLastStores" class="section-container">
          <div class="section-header">
            <span class="dot"></span>
            <span class="header-text">上周巡查得分排名后 5 的门店是:</span>
          </div>
          <EasyTable :columns="lastStoreRankColumns" :data="lastStores" />
        </div>

        <!-- 3. 出现次数最多的 5 个问题项 -->
        <div v-if="topQuestions.length > 0" class="section-container">
          <div class="section-header">
            <span class="dot"></span>
            <span class="header-text">{{ questionTopHeaderText }}</span>
          </div>
          <EasyTable :columns="topQuestionRankColumns" :data="topQuestions" />
        </div>

        <!-- 4. 出现次数最少的 5 个问题项 -->
        <div v-if="showLastQuestions" class="section-container">
          <div class="section-header">
            <span class="dot"></span>
            <span class="header-text">上周出现次数最少的 5 个问题项:</span>
          </div>
          <EasyTable :columns="lastQuestionRankColumns" :data="lastQuestions" />
        </div>

        <!-- 5. 异常门店预警 -->
        <div v-if="alertStores.length > 0" class="section-container alert-section">
          <div class="alert-title">
            <i class="h-icon-tip_info"></i>
            {{ formatRangeTitle(data.startDate, data.endDate) }}异常门店预警
          </div>
          <div class="alert-content">
            监测期间，{{ alertStoreNames }}等 {{ alertStores.length }} 家门店，均出现了5次以上的卫生问题，建议对门店进行线下沟通，积极完成整改
          </div>
        </div>

        <!-- 6. 巡查统计总览 (Doc Section) -->
        <ReportDocSection
          :title="`${formatRangeTitle(data.startDate, data.endDate)}巡查统计总览`"
          description="已同步至「智慧巡查-区域报表」模块，支持导出或查看详情"
          icon-type="excel"
          :export-function="toExport"
          :is-mini="isMini"
          @show-detail="handleShowDetail"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="h-icon-tip_info_f empty-icon"></i>
        <p>暂无相关统计数据</p>
      </div>
    </template>

    <!-- 客流报表视图 (queryType === 1) -->
    <template v-else-if="normalizedQueryType === 1">
      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <i class="h-icon-loading"></i>
        <p>客流统计数据分析中...</p>
      </div>

      <div v-else-if="hasPassengerData" class="passenger-report">
        <!-- 标题 -->
        <div class="report-header">
          <div class="report-title">{{ formatRangeTitle(data.startDate, data.endDate) }}客流统计结果</div>
        </div>

          <!-- 1. 客流进入最多 5 门店 -->
          <div v-if="passengerTopStores.length > 0" class="section-container">
            <div class="section-header">
              <span class="dot"></span>
              <span class="header-text">{{ passengerTopHeaderText }}</span>
            </div>
            <EasyTable :columns="passengerTopColumns" :data="passengerTopStores" />
          </div>

        <!-- 2. 客流进入最少 5 门店 -->
        <div v-if="showPassengerLastStores" class="section-container">
          <div class="section-header">
            <span class="dot"></span>
            <span class="header-text">上周门店“客流进入”排名后 5 的门店是:</span>
          </div>
          <EasyTable :columns="passengerLastColumns" :data="passengerLastStores" />
        </div>

        <!-- 3. 客流重点提醒 -->
        <div v-if="passengerChanges.length > 0" class="section-container alert-section">
          <div class="alert-title">
            <i class="h-icon-tip_info alert-icon-blue"></i>
            {{ formatRangeTitle(data.startDate, data.endDate) }}门店客流重点提醒
          </div>
          <div class="alert-content">
            监测期间，{{ passengerAlertStoreNames }}等 {{ passengerAlertHighCount }} 家门店的客流增长高于平均水平，建议对门店进行缺货陈列检查避免丢失销售机会。另外，{{ passengerAlertLowStoreName }}的客流出现明显下滑，建议对门店进行营销物料检查。
          </div>
          <div class="alert-table-wrapper">
            <EasyTable :columns="passengerChangeColumns" :data="passengerChanges" />
          </div>
        </div>  

        <!-- 4. 客流统计总览 (Doc Section) -->
        <ReportDocSection
          :title="`${formatRangeTitle(data.startDate, data.endDate)}客流统计总览`"
          description="已同步至「客流统计-客流排行」模块，支持导出或查看详情"
          icon-type="excel"
          icon-wrapper-class="green-bg"
          :export-function="toExport"
          :is-mini="isMini"
          @show-detail="handleShowDetail"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="h-icon-tip_info_f empty-icon"></i>
        <p>暂无相关客流统计数据</p>
      </div>
    </template>
  </div>
</template>

<script>
import { DataAnalysisXApi } from '../api';
import EasyTable from '@/ai-ui/base-form/EasyTable.vue';
import ReportDocSection from '@/ai-ui/base-form/ReportDocSection.vue';

export default {
  name: 'PatrolPassengerDataQuery',
  components: {
    EasyTable,
    ReportDocSection
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
    // 最小数量阈值，当总数小于此值时，不展示倒数排名
    minCountForBottom: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      topStores: [],
      lastStores: [],
      topQuestions: [],
      lastQuestions: [],
      alertStores: [], // 异常门店预警数据（最多问题项对应的 top 3 门店）
      passengerTopStores: [],
      passengerLastStores: [],
      passengerChanges: [],
      loading: false,
      areaIdList: [],
      storeIdList: []
    };
  },
  computed: {
    // 统一 queryType 为数字类型
    normalizedQueryType() {
      return Number(this.data.queryType) || 0;
    },
    // 是否有任何有效数据
    hasData() {
      return this.topStores.length > 0 || this.topQuestions.length > 0;
    },
    // 是否有客流数据
    hasPassengerData() {
      return this.passengerTopStores.length > 0 || this.passengerLastStores.length > 0 || this.passengerChanges.length > 0;
    },
    // 是否显示“后5名”门店：只有前5满5个，且后5不为空，且总数 >= 配置阈值时展示
    showLastStores() {
      const totalCount = this.topStores.length + this.lastStores.length;
      return this.topStores.length >= 5 && this.lastStores.length > 0 && totalCount >= this.minCountForBottom;
    },
    // 是否显示“后N名”客流门店：总数 >= 配置阈值时展示
    showPassengerLastStores() {
      const totalCount = this.passengerTopStores.length + this.passengerLastStores.length;
      return this.passengerTopStores.length >= 5 && this.passengerLastStores.length > 0 && totalCount >= this.minCountForBottom;
    },
    // 是否显示“最少”问题项：只有最多满5个，且最少不为空，且总数 >= 配置阈值时展示
    showLastQuestions() {
      const totalCount = this.topQuestions.length + this.lastQuestions.length;
      return this.topQuestions.length >= 5 && this.lastQuestions.length > 0 && totalCount >= this.minCountForBottom;
    },
    // 动态标题：门店
    storeTopHeaderText() {
      const count = this.topStores.length;
      return count >= 5 ? '上周巡查得分排名前 5 的门店是:' : `上周巡查得分排名的 ${count} 家门店是:`;
    },
    // 动态标题：客流
    passengerTopHeaderText() {
      const count = this.passengerTopStores.length;
      return count >= 5 ? '上周门店“客流进入”排名前 5 的门店是:' : `上周门店“客流进入”排名的 ${count} 家门店是:`;
    },
    // 动态标题：问题
    questionTopHeaderText() {
      const count = this.topQuestions.length;
      return count >= 5 ? '上周出现次数最多的 5 个问题项:' : `上周出现次数最多的 ${count} 个问题项:`;
    },
    topStoreRankColumns() {
      return [
        { label: '得分排名前 5 的门店名称', prop: 'storeName' },
        { label: '平均不合格问题', prop: 'avgQuestionCount', width: '120px' },
        { label: '平均得分', prop: 'avgScore', width: '100px' },
        { label: '平均得分率', prop: 'scoreDisplay', width: '100px' }
      ];
    },
    lastStoreRankColumns() {
      return [
        { label: '得分排名后 5 的门店名称', prop: 'storeName' },
        { label: '平均不合格问题', prop: 'avgQuestionCount', width: '120px' },
        { label: '平均得分', prop: 'avgScore', width: '100px' },
        { label: '平均得分率', prop: 'scoreDisplay', width: '100px' }
      ];
    },
    topQuestionRankColumns() {
      return [
        { label: '出现次数最多的 5 个问题项名称', prop: 'questionName' },
        { label: '出现次数', prop: 'questionCount', width: '150px' }
      ];
    },
    lastQuestionRankColumns() {
      return [
        { label: '出现次数最少的 5 个问题项名称', prop: 'questionName' },
        { label: '出现次数', prop: 'questionCount', width: '150px' }
      ];
    },
    passengerTopColumns() {
      return [
        { label: '“客流进入”最多 5 门店名称', prop: 'storeName' },
        { label: '进入客流（人次）', prop: 'current', width: '150px' }
      ];
    },
    passengerLastColumns() {
      return [
        { label: '“客流进入”最少 5 门店名称', prop: 'storeName' },
        { label: '进入客流（人次）', prop: 'current', width: '150px' }
      ];
    },
    passengerChangeColumns() {
      return [
        { label: '门店名称', prop: 'storeName' },
        { label: '进入客流人次', prop: 'current', width: '120px' },
        { 
          label: '较平均水平', 
          prop: 'changeRateDisplay', 
          width: '120px',
          cellClass: (row) => {
            const chainRate = row.chainRate;
            if (chainRate > 0) return 'chain-rate-positive';
            if (chainRate < 0) return 'chain-rate-negative';
            return ''; // 0 或 undefined 时返回空字符串，使用默认颜色
          }
        }
      ];
    },
    topStoreNames() {
      return this.lastStores.slice(0, 3).map(s => s.storeName).join('、');
    },
    // 异常门店名称（用于预警文案）
    alertStoreNames() {
      return this.alertStores.slice(0, 3).map(s => s.storeName).join('、');
    },
    passengerAlertStoreNames() {
      return this.passengerChanges.filter(i => i.chainRate > 0).slice(0, 3).map(s => s.storeName).join('、');
    },
    passengerAlertHighCount() {
      return this.passengerChanges.filter(i => i.chainRate > 0).length;
    },
    passengerAlertLowStoreName() {
      const lowStores = this.passengerChanges.filter(i => i.chainRate < 0);
      return lowStores.length > 0 ? lowStores[0].storeName : '部分门店';
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    formatRangeTitle(start, end) {
      if (!start || !end) return '';
      const s = new Date(start);
      const e = new Date(end);
      return `${s.getMonth() + 1}月${s.getDate()}日-${e.getMonth() + 1}月${e.getDate()}日`;
    },
    async initData() {
      this.loading = true;
      try {
        // 1. 获取 areaIdList 和 storeIdList
        if (this.data.areaOrStoreName) {
          // 如果有 areaOrStoreName，通过模糊查询获取对应的 ID 列表
          const searchRes = await DataAnalysisXApi.searchAreaList(this.client, {
            condition: this.data.areaOrStoreName,
            limit: 200
          });
          if (searchRes && searchRes.code === 0 && Array.isArray(searchRes.data)) {
            const areaIds = [];
            const storeIds = [];
            searchRes.data.forEach(node => {
              if (node.nodeType === 0) {
                areaIds.push(node.nodeId);
              } else if (node.nodeType === 1) {
                storeIds.push(node.nodeId);
              }
            });
            this.areaIdList = areaIds;
            this.storeIdList = storeIds;
          }
        } else {
          // 如果没有 areaOrStoreName，获取区域树根节点
          const treeRes = await DataAnalysisXApi.getAreaTree(this.client);
          if (treeRes && treeRes.code === 0 && treeRes.data?.nodeList) {
            this.areaIdList = treeRes.data.nodeList.map(node => node.nodeId);
            this.storeIdList = [];
          }
        }

        if (this.normalizedQueryType === 0) {
          await this.fetchPatrolData();
        } else if (this.normalizedQueryType === 1) {
          await this.fetchPassengerData();
        }
      } catch (e) {
        console.error('[PatrolPassengerDataQuery] init failed:', e);
      } finally {
        this.loading = false;
      }
    },
    async fetchPatrolData() {
      const baseParams = {
        startDate: this.data.startDate,
        endDate: this.data.endDate,
        templateId: this.data.templateId,
        patrolTemplateId: this.data.templateId,
        areaIdList: this.areaIdList,
        storeIdList: this.storeIdList,
        from: 0,
        size: 5,
        patrolType: 0,
        filterCondition: 0,
        rateStart: 0,
        rateEnd: 100
      };

      try {
        // 获取排名前5
        const topRes = await DataAnalysisXApi.queryStoreRank(this.client, {
          ...baseParams,
          sortField: 'score',
          sortOrder: 'desc',
          type: 'top10'
        });
        if (topRes && topRes.code === 0) {
          this.topStores = (topRes.data?.storeEvaluations || []).slice(0, 5).map(item => ({
            ...item,
            scoreDisplay: `${item.score}%`
          }));
        }

        // 获取排名后5
        const lastRes = await DataAnalysisXApi.queryStoreRank(this.client, {
          ...baseParams,
          sortField: 'score',
          sortOrder: 'asc',
          type: 'last10'
        });
        if (lastRes && lastRes.code === 0) {
          this.lastStores = (lastRes.data?.storeEvaluations || []).slice(0, 5).map(item => ({
            ...item,
            scoreDisplay: `${item.score}%`
          }));
        }

        // 获取问题排行
        const questionParams = {
          pageNo: 1,
          pageSize: 5,
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          patrolTemplateId: this.data.templateId,
          areaIdList: this.areaIdList,
          storeIdList: this.storeIdList,
          planConfigId: "",
          patrolOrganizationId: "",
          patrolPersonName: "",
          roleIds: [],
          storeStatus: "",
          storeType: "",
          patrolType: 0,
          columnList: [5017, 5018, 5103, 5104, 5105, 5106, 5001, 5002, 5003, 5004, 5005, 5006],
          questionIdList: [],
          filterCondition: 0,
          questionType: 0,
          orderField: "05001"
        };

        const topQRes = await DataAnalysisXApi.queryQuestionRank(this.client, {
          ...questionParams,
          orderFlag: -1 // 降序
        });
        if (topQRes && topQRes.code === 0) {
          this.topQuestions = (topQRes.data?.rows || []).slice(0, 5);
        }

        const lastQRes = await DataAnalysisXApi.queryQuestionRank(this.client, {
          ...questionParams,
          orderFlag: 1 // 升序
        });
        if (lastQRes && lastQRes.code === 0) {
          this.lastQuestions = (lastQRes.data?.rows || []).slice(0, 5);
        }

        // 获取异常门店预警数据（最多问题项对应的 top 3 门店）
        try {
          const startTimeTimestamp = new Date(this.data.startDate).setHours(0, 0, 0, 0);
          const endTimeTimestamp = new Date(this.data.endDate).setHours(23, 59, 59, 999);
          
          // 1. 先通过专门的接口获取出现次数最多的问题项
          const mostQRes = await DataAnalysisXApi.queryMostQuestion(this.client, {
            startTime: startTimeTimestamp,
            endTime: endTimeTimestamp
          });

          if (mostQRes && mostQRes.code === 0 && mostQRes.data?.questionId) {
            const questionId = mostQRes.data.questionId;
            // 2. 再获取该问题项对应的 top 3 门店
            const alertRes = await DataAnalysisXApi.queryPatrolAgentMostStore(this.client, {
              questionId: questionId,
              templateId: this.data.templateId,
              startTime: startTimeTimestamp
            });
            if (alertRes && alertRes.code === 0 && Array.isArray(alertRes.data)) {
              this.alertStores = alertRes.data.slice(0, 3);
            }
          }
        } catch (e) {
          console.error('[PatrolPassengerDataQuery] Fetch alert stores failed:', e);
        }
      } catch (e) {
        console.error('Fetch patrol data failed:', e);
      }
    },
    async fetchPassengerData() {
      // 这里的 areaId 逻辑：优先取搜索到的区域 ID，其次取搜索到的门店 ID，最后取根节点 ID
      const areaId = this.areaIdList[0] || this.storeIdList[0] || '';
      
      const rankParams = {
        pageNo: 1,
        pageSize: 5,
        orderName: 'inCountRaw',
        startTime: this.data.startDate,
        endTime: this.data.endDate,
        areaId: areaId,
        areaIdList: this.areaIdList, // 根据用户示例传空
        storeIdList: this.storeIdList  // 根据用户示例传空
      };

      const chainParams = {
        startTime: this.data.startDate,
        endTime: this.data.endDate,
        areaIdList: this.areaIdList,
        storeIdList: this.storeIdList
      };

      try {
        // 1. 获取客流进入最多 5 门店 (orderType: "1" 降序)
        const topRes = await DataAnalysisXApi.queryPassengerRank(this.client, {
          ...rankParams,
          orderType: '1'
        });
        if (topRes && topRes.code === 0 && topRes.data?.rows) {
          this.passengerTopStores = topRes.data.rows.slice(0, 5).map(item => ({
            ...item,
            current: item.inCountRaw ?? item.current // 确保有 current 字段用于表格展示
          }));
        }

        // 2. 获取客流进入最少 5 门店 (orderType: "0" 升序)
        const lastRes = await DataAnalysisXApi.queryPassengerRank(this.client, {
          ...rankParams,
          orderType: '0'
        });
        if (lastRes && lastRes.code === 0 && lastRes.data?.rows) {
          this.passengerLastStores = lastRes.data.rows.slice(0, 5).map(item => ({
            ...item,
            current: item.inCountRaw ?? item.current
          }));
        }

        // 3. 获取客流环比 TOP/BOTTOM (Section 3)
        const chainRes = await DataAnalysisXApi.getPassengerChainRateTopBottom(this.client, chainParams);
        if (chainRes && (chainRes.code === 200 || chainRes.code === 0) && chainRes.data) {
          const topList = chainRes.data.topList || [];
          const bottomList = chainRes.data.bottomList || [];
          // 合并展示 Top 3 和 Bottom 3
          this.passengerChanges = [...topList, ...bottomList].map(item => ({
            ...item,
            changeRateDisplay: item.chainRate >= 0 ? `+${item.chainRate}%` : `${item.chainRate}%`
          }));
        }
      } catch (e) {
        console.error('Fetch passenger data failed:', e);
      }
    },
    async toExport(done) {
      try {
        if (this.normalizedQueryType === 0) {
          // 巡查导出
          const params = {
            startDate: this.data.startDate,
            endDate: this.data.endDate,
            patrolTemplateId: this.data.templateId,
            areaIdList: this.areaIdList,
            storeIdList: this.storeIdList,
            patrolType: 0,
            filterCondition: 0,
            templateType: 2,
            storeStatus: '',
            storeType: '',
            patrolOrganizationId: '',
            level: 0,
            optionalColumns: ['01009', '01101', '01102', '01103', '03101', '03102', '05001', '05002', '05019']
          };
          const res = await DataAnalysisXApi.exportPatrolAreaOverview(this.client, params);
          if (res && res.code === 0) {
            this.$message.success('导出成功，请前往"下载中心"查看');
          }
        } else if (this.normalizedQueryType === 1) {
          // 客流导出
          const areaId = this.areaIdList[0] || this.storeIdList[0] || '';
          const params = {
            pageNo: 1,
            pageSize: 20,
            orderType: '1',
            orderName: 'inCountRaw',
            startTime: this.data.startDate,
            endTime: this.data.endDate,
            areaId: areaId,
            areaIdList: this.areaIdList,
            storeIdList: this.storeIdList
          };
          const res = await DataAnalysisXApi.exportPassengerRank(this.client, params);
          if (res && res.code === 0) {
            this.$message.success('导出成功，请前往“下载中心”查看');
          }
        }
      } catch (e) { 
        console.error('[PatrolPassengerDataQuery] export failed:', e);
      } finally {
        done();
      }
    },
    handleShowDetail() {
      // 这里的详情跳转逻辑可以根据需要完善
      console.log('Show detail');
    }
  }
};
</script>

<style lang="scss" scoped>
.patrol-passenger-query {
  width: 100%;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;

  .report-header {
    margin-bottom: 16px;
    .report-title {
      font-size: 18px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
    }
  }

  .section-container {
    margin-bottom: 24px;

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      .dot {
        width: 4px;
        height: 4px;
        background: #333;
        border-radius: 50%;
        margin-right: 8px;
      }
      
      .header-text {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  .alert-section {
    background: rgba(248, 249, 251, 1);
    border-radius: 8px;
    padding: 16px;
    
    .alert-title {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.9);
      margin-bottom: 12px;
      
      .alert-icon {
        color: #fa8c16;
        font-size: 24px;
      }

      .alert-icon-blue {
        color: #388eff;
        font-size: 24px;
      }
    }
    
    .alert-content {
      line-height: 22px;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.65);
      margin-bottom: 12px;
    }

    .alert-table-wrapper {
      background: #fff;
      border-radius: 4px;
      overflow: hidden;

      ::v-deep {
        .easy-table {
          th {
            background-color: #fcfcfc;
          }
          td {
            font-size: 12px;
            
            // 较平均水平列的颜色（仅此表格的最后一列）
            &:last-child {
              &.chain-rate-positive {
                color: rgba(2, 191, 15, 1) !important;
              }
              &.chain-rate-negative {
                color: rgba(250, 50, 57, 1) !important;
              }
              // 0 或 undefined 时使用默认颜色，不需要特殊样式
            }
          }
        }
      }
    }
  }

  .placeholder-tip {
    padding: 40px;
    text-align: center;
    color: #999;
  }

  .loading-state,
  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: rgba(0, 0, 0, 0.45);
    background: #f8f9fb;
    border-radius: 8px;

    .h-icon-loading {
      font-size: 32px;
      margin-bottom: 12px;
      color: #388eff;
      display: inline-block;
      animation: rotating 2s linear infinite;
    }

    .empty-icon {
      font-size: 32px;
      margin-bottom: 12px;
      color: rgba(0, 0, 0, 0.15);
    }
    p {
      margin: 0;
      font-size: 14px;
    }
  }

  @keyframes rotating {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>

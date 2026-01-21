<template>
  <div class="patrol-passenger-query">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <i class="h-icon-loading"></i>
      <p>{{ normalizedQueryType === 2 ? '巡查和客流数据分析中...' : (normalizedQueryType === 1 ? '客流统计数据分析中...' : '巡查统计数据分析中...') }}</p>
    </div>

    <div v-else-if="showCombinedContent" class="combined-report">
      <!-- 综合大标题 (仅在 queryType === 2 时显示) -->
      <div v-if="normalizedQueryType === 2" class="report-header main-header">
        <div class="report-title">{{ formatRangeTitle(data.startDate, data.endDate) }}巡查和客流统计结果</div>
      </div>

      <!-- 巡查报表部分 -->
      <div v-if="showPatrolSection" class="patrol-report-section">
        <div v-if="normalizedQueryType === 2" class="sub-report-title">一、巡查情况：</div>
        
        <!-- 标题 (仅在单独巡查模式下显示) -->
        <div v-if="normalizedQueryType === 0" class="report-header">
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
            <span class="header-text">上周巡查得分排名后 5 的{{ applicationSceneName }}是:</span>
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
            <i class="h-icon-tip_info alert-icon"></i>
            {{ formatRangeTitle(data.startDate, data.endDate) }}异常{{ applicationSceneName }}预警
          </div>
          <div class="alert-content">
            监测期间，{{ alertStoreNames }} {{ alertStores.length }}家{{ applicationSceneName }}，<span v-show="alertStores.length > 1">均</span>出现了{{ alertMinCount }}次及以上的“{{ alertQuestionName }}”问题，建议对{{ applicationSceneName }}进行线下沟通，积极完成整改
          </div>
        </div>

        <!-- 6. 巡查统计总览 (Doc Section) -->
        <ReportDocSection
          :title="`${formatRangeTitle(data.startDate, data.endDate)}的巡店统计总览`"
          description="已同步至「智慧巡查-区域报表」模块，支持导出或查看详情"
          icon-type="excel"
          :export-function="(done) => toExport(done, 'patrol')"
          :is-mini="isMini"
          @show-detail="handleShowDetail('patrol')"
        />
      </div>

      <!-- 客流报表部分 -->
      <div v-if="showPassengerSection" class="passenger-report-section" :class="{ 'mt-32': normalizedQueryType === 2 }">
        <div v-if="normalizedQueryType === 2" class="sub-report-title">二、客流情况：</div>
        
        <!-- 标题 (仅在单独客流模式下显示) -->
        <div v-if="normalizedQueryType === 1" class="report-header">
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
            <span class="header-text">上周{{ applicationSceneName }}“客流进入”排名后 5 的{{ applicationSceneName }}是:</span>
          </div>
          <EasyTable :columns="passengerLastColumns" :data="passengerLastStores" />
        </div>

        <!-- 3. 客流重点提醒 -->
        <div v-if="passengerChanges.length > 0" class="section-container alert-section">
          <div class="alert-title">
            <i class="h-icon-tip_info alert-icon-blue"></i>
            {{ formatRangeTitle(data.startDate, data.endDate) }}{{ applicationSceneName }}客流重点提醒
          </div>
          <div class="alert-content" style="margin-bottom: 12px;">
            监测期间，<template v-if="passengerAlertHighCount > 0">
              {{ passengerAlertStoreNames }} {{ passengerAlertHighCount }}家{{ applicationSceneName }}的客流增长高于平均水平，建议对{{ applicationSceneName }}进行缺货陈列检查避免丢失销售机会。
            </template>
            <template v-if="passengerAlertHighCount > 0 && passengerAlertLowCount > 0">另外，</template>
            <template v-if="passengerAlertLowCount > 0">
              {{ passengerAlertLowStoreName }}的客流出现明显下滑，建议对{{ applicationSceneName }}进行营销物料检查。
            </template>
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
          :export-function="(done) => toExport(done, 'passenger')"
          :is-mini="isMini"
          @show-detail="handleShowDetail('passenger')"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <i class="h-icon-tip_info_f empty-icon"></i>
      <p>暂无相关统计数据</p>
    </div>
  </div>
</template>

<script>
import { DataAnalysisXApi } from '../api';
import EasyTable from '@/ai-ui/base-form/EasyTable.vue';
import ReportDocSection from '@/ai-ui/base-form/ReportDocSection.vue';
import { navigateToAreaReport, navigateToPassengerRank } from './utils';

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
      alertQuestionName: '', // 异常问题名称
      passengerTopStores: [],
      passengerLastStores: [],
      passengerChanges: [],
      loading: false,
      totalStores: 0, // 门店总数
      totalQuestions: 0, // 问题总数
      totalPassengerStores: 0, // 客流门店总数
      areaIdList: [],
      storeIdList: [],
      areaNodes: [], // 新增：存储完整的区域节点对象
      storeNodes: []  // 新增：存储完整的门店节点对象
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
    // 是否显示巡查板块
    showPatrolSection() {
      return (this.normalizedQueryType === 0 || this.normalizedQueryType === 2) && this.hasData;
    },
    // 是否显示客流板块
    showPassengerSection() {
      return (this.normalizedQueryType === 1 || this.normalizedQueryType === 2) && this.hasPassengerData;
    },
    // 是否有内容展示
    showCombinedContent() {
      return this.showPatrolSection || this.showPassengerSection;
    },
    // 是否显示“后5名”门店：只有前5满5个，且后5不为空，且总数 >= 配置阈值时展示
    showLastStores() {
      return this.topStores.length >= 5 && this.lastStores.length > 0 && this.totalStores >= this.minCountForBottom;
    },
    // 是否显示“后N名”客流门店：总数 >= 配置阈值时展示
    showPassengerLastStores() {
      return this.passengerTopStores.length >= 5 && this.passengerLastStores.length > 0 && this.totalPassengerStores >= this.minCountForBottom;
    },
    // 是否显示“最少”问题项：只有最多满5个，且最少不为空，且总数 >= 配置阈值时展示
    showLastQuestions() {
      return this.topQuestions.length >= 5 && this.lastQuestions.length > 0 && this.totalQuestions >= this.minCountForBottom;
    },
    // 动态标题：门店
    storeTopHeaderText() {
      const count = this.topStores.length;
      return count >= 2 ? `上周巡查得分排名前 ${count} 的${this.applicationSceneName}是:` : `上周巡查得分排名第${count}的${this.applicationSceneName}是:`;
    },
    // 动态标题：客流
    passengerTopHeaderText() {
      const count = this.passengerTopStores.length;
      return count >= 2 ? `上周${this.applicationSceneName}“客流进入”排名前${count}的${this.applicationSceneName}是:` : `上周${this.applicationSceneName}“客流进入”排名弟${count}的${this.applicationSceneName}是:`;
    },
    // 动态标题：问题
    questionTopHeaderText() {
      const count = this.topQuestions.length;
      return count >= 5 ? '上周出现次数最多的 5 个问题项:' : `上周出现次数最多的 ${count} 个问题项:`;
    },
    topStoreRankColumns() {
      return [
        { label: `得分排名前 5 的${this.applicationSceneName}名称`, prop: 'storeName' },
        { label: '平均不合格问题', prop: 'avgQuestionCount', width: '120px' },
        { label: '平均得分', prop: 'avgScore', width: '100px' },
        { label: '平均得分率', prop: 'scoreDisplay', width: '100px' }
      ];
    },
    lastStoreRankColumns() {
      return [
        { label: `得分排名后 5 的${this.applicationSceneName}名称`, prop: 'storeName' },
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
        { label: `“客流进入”最多 5 ${this.applicationSceneName}名称`, prop: 'storeName' },
        { label: '进入客流（人次）', prop: 'current', width: '150px' }
      ];
    },
    passengerLastColumns() {
      return [
        { label: `“客流进入”最少 5 ${this.applicationSceneName}名称`, prop: 'storeName' },
        { label: '进入客流（人次）', prop: 'current', width: '150px' }
      ];
    },
    passengerChangeColumns() {
      return [
        { label: `${this.applicationSceneName}名称`, prop: 'storeName' },
        { label: '进入客流人次', prop: 'current', width: '120px' },
        { 
          label: '环比', 
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
    // 异常门店最小出现次数
    alertMinCount() {
      if (this.alertStores.length === 0) return 0;
      return Math.min(...this.alertStores.map(s => s.count || 0));
    },
    passengerAlertStoreNames() {
      const highStores = this.passengerChanges.filter(i => i.chainRate > 0);
      return highStores.length > 0 ? (highStores.slice(0, 3).map(s => s.storeName).join('、') + (highStores.length > 3 ? '等' : '')) : '';
    },
    passengerAlertHighCount() {
      return this.passengerChanges.filter(i => i.chainRate > 0).length;
    },
    passengerAlertLowCount() {
      return this.passengerChanges.filter(i => i.chainRate < 0).length;
    },
    passengerAlertLowStoreName() {
      const lowStores = this.passengerChanges.filter(i => i.chainRate < 0);
      return lowStores.length > 0 ? (lowStores.slice(0, 3).map(s => s.storeName).join('、') + (lowStores.length > 3 ? '等' : '')) : '';
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
          if (searchRes.code === 0 && searchRes.data?.length > 0) {
            const areaNodes = [];
            const storeNodes = [];
            searchRes.data.forEach(node => {
              if (node.nodeType === 0) {
                areaNodes.push(node);
              } else if (node.nodeType === 1) {
                storeNodes.push(node);
              }
            });
            this.areaNodes = areaNodes;
            this.storeNodes = storeNodes;
            this.areaIdList = areaNodes.map(n => n.nodeId);
            this.storeIdList = storeNodes.map(n => n.nodeId);
          }else{
            const treeRes = await DataAnalysisXApi.getAreaTree(this.client);
            if (treeRes && treeRes.code === 0 && treeRes.data?.nodeList) {
              this.areaNodes = treeRes.data.nodeList;
              this.storeNodes = [];
              this.areaIdList = this.areaNodes.map(node => node.nodeId);
              this.storeIdList = [];
            }
          }
        } else {
          // 如果没有 areaOrStoreName，获取区域树根节点
          const treeRes = await DataAnalysisXApi.getAreaTree(this.client);
          if (treeRes && treeRes.code === 0 && treeRes.data?.nodeList) {
            this.areaNodes = treeRes.data.nodeList;
            this.storeNodes = [];
            this.areaIdList = this.areaNodes.map(node => node.nodeId);
            this.storeIdList = [];
          }
        }

        if (this.normalizedQueryType === 0) {
          await this.fetchPatrolData();
        } else if (this.normalizedQueryType === 1) {
          await this.fetchPassengerData();
        } else if (this.normalizedQueryType === 2) {
          await Promise.all([
            this.fetchPatrolData(),
            this.fetchPassengerData()
          ]);
        }
      } catch (e) {
        console.error('[PatrolPassengerDataQuery] init failed:', e);
      } finally {
        this.loading = false;
      }
    },
    async fetchPatrolData() {
      const startTime = new Date(this.data.startDate).setHours(0, 0, 0, 0);
      const endTime = new Date(this.data.endDate).setHours(23, 59, 59, 999);

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

      const questionParams = {
        templateId: this.data.templateId,
        startTime,
        endTime,
        areaIdList: this.areaIdList,
        storeIdList: this.storeIdList,
      };

      try {
        // 1. 发起所有并行请求
        const results = await Promise.allSettled([
          // Top 5 门店 [0]
          DataAnalysisXApi.queryStoreRank(this.client, { ...baseParams, sortField: 'score', sortOrder: 'desc' }),
          // Last 5 门店 [1]
          DataAnalysisXApi.queryStoreRank(this.client, { ...baseParams, sortField: 'score', sortOrder: 'asc' }),
          // Top 5 问题 [2]
          DataAnalysisXApi.queryQuestionRank(this.client, { ...questionParams, asc: false }),
          // Last 5 问题 [3]
          DataAnalysisXApi.queryQuestionRank(this.client, { ...questionParams, asc: true })
        ]);

        // 2. 处理 Top 5 门店
        if (results[0].status === 'fulfilled' && results[0].value?.code === 0) {
          const res = results[0].value;
          this.topStores = (res.data?.storeEvaluations || []).slice(0, 5).map(item => ({
            ...item,
            scoreDisplay: `${parseFloat(Number(item.score || 0).toFixed(2))}%`
          }));
          this.totalStores = res.data?.totalCount || 0;
        }

        // 3. 处理 Last 5 门店
        if (results[1].status === 'fulfilled' && results[1].value?.code === 0) {
          const res = results[1].value;
          this.lastStores = (res.data?.storeEvaluations || []).slice(0, 5).map(item => ({
            ...item,
            scoreDisplay: `${parseFloat(Number(item.score || 0).toFixed(2))}%`
          }));
        }

        // 4. 处理 Top 5 问题
        if (results[2].status === 'fulfilled' && results[2].value?.code === 0) {
          const res = results[2].value;
          this.topQuestions = (res.data || []).slice(0, 5);
          this.totalQuestions = (res.data || []).length;
        }

        // 5. 处理 Last 5 问题
        if (results[3].status === 'fulfilled' && results[3].value?.code === 0) {
          const res = results[3].value;
          this.lastQuestions = (res.data || []).slice(0, 5);
        }

        // 6. 获取异常门店预警数据（依赖 topQuestions[0]）
        if (this.topQuestions.length > 0) {
          const targetQ = this.topQuestions[0];
          const alertRes = await DataAnalysisXApi.queryPatrolAgentMostStore(this.client, {
            questionId: targetQ.questionId,
            templateId: this.data.templateId,
            startTime,
            endTime
          });
          if (alertRes && alertRes.code === 0 && Array.isArray(alertRes.data)) {
            this.alertStores = alertRes.data;
            this.alertQuestionName = targetQ.questionName || '相关问题';
          }
        }
      } catch (e) {
        console.error('[PatrolPassengerDataQuery] fetchPatrolData failed:', e);
      }
    },
    async fetchPassengerData() {
      const rankParams = {
        pageNo: 1,
        pageSize: 5,
        orderName: 'inCountRaw',
        startTime: this.data.startDate,
        endTime: this.data.endDate,
        areaIdList: this.areaIdList,
        storeIdList: this.storeIdList
      };

      const chainParams = {
        startTime: this.data.startDate,
        endTime: this.data.endDate,
        areaIdList: this.areaIdList,
        storeIdList: this.storeIdList
      };

      try {
        // 使用 Promise.allSettled 并发获取客流排行和环比数据
        const results = await Promise.allSettled([
          // Top 5 客流 [0]
          DataAnalysisXApi.queryPassengerRank(this.client, { ...rankParams, orderType: '1' }),
          // Last 5 客流 [1]
          DataAnalysisXApi.queryPassengerRank(this.client, { ...rankParams, orderType: '0' }),
          // 环比 Top/Bottom [2]
          DataAnalysisXApi.getPassengerChainRateTopBottom(this.client, chainParams)
        ]);

        // 处理 Top 5 客流
        if (results[0].status === 'fulfilled' && results[0].value?.code === 0) {
          const res = results[0].value;
          this.passengerTopStores = (res.data?.rows || []).slice(0, 5).map(item => ({
            ...item,
            current: item.inCountRaw ?? item.current
          }));
          this.totalPassengerStores = res.data?.total || 0;
        }

        // 处理 Last 5 客流
        if (results[1].status === 'fulfilled' && results[1].value?.code === 0) {
          const res = results[1].value;
          this.passengerLastStores = (res.data?.rows || []).slice(0, 5).map(item => ({
            ...item,
            current: item.inCountRaw ?? item.current
          }));
        }

        // 处理环比数据
        if (results[2].status === 'fulfilled' && results[2].value?.data) {
          const data = results[2].value.data;
          const topList = data.topList || [];
          const bottomList = data.bottomList || [];
          this.passengerChanges = [...topList, ...bottomList].map(item => ({
            ...item,
            changeRateDisplay: item.chainRate >= 0 ? `+${item.chainRate}%` : `${item.chainRate}%`
          }));
        }
      } catch (e) {
        console.error('[PatrolPassengerDataQuery] fetchPassengerData failed:', e);
      }
    },
    async toExport(done, type) {
      const exportType = type || (this.normalizedQueryType === 1 ? 'passenger' : 'patrol');
      try {
        if (exportType === 'patrol') {
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
            optionalColumns: [
              "01008",
              "01002",
              "01003",
              "01004",
              "01005",
              "01006",
              "01007",
              "03101",
              "03102",
              "05001",
              "05002",
              "05019"
            ]
          };
          const res = await DataAnalysisXApi.exportPatrolAreaOverview(this.client, params);
          if (res && res.code === 0) {
            this.$message.success('导出成功，请前往"下载中心"查看');
          }
        } else if (exportType === 'passenger') {
          // 客流导出
          const areaId = this.areaIdList[0] || '';
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
    handleShowDetail(type) {
      // 如果没有传 type，则根据当前 normalizedQueryType 降级处理
      const detailType = type || (this.normalizedQueryType === 1 ? 'passenger' : 'patrol');

      if (detailType === 'patrol') {
        // 巡查详情：跳转至「智慧巡查-区域报表」
        const nodeList = [...this.areaNodes, ...this.storeNodes];
        navigateToAreaReport({
          patrolType: 0,
          tabType: 'store',
          startDate: this.data.startDate,
          endDate: this.data.endDate,
          patrolTemplateId: this.data.templateId,
          nodeList: nodeList
        });
      } else if (detailType === 'passenger') {
        // 客流详情：跳转至「客流统计-客流排行」
        navigateToPassengerRank(this.data.startDate, this.data.endDate);
      }
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

  .sub-report-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    margin: 0 0 16px 0;
  }

  .mt-32 {
    margin-top: 32px;
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

<template>
  <hik-cloud-drawer
    :title="title"
    :visible.sync="localVisible"
    width="800px"
    :mask-closable="true"
    :append-to-body="true"
    :no-padding="true"
    :gray="false"
    @close="handleClose"
  >
    <div class="drawer-content">
      <!-- 左侧门店列表 -->
      <div class="store-list-panel">
        <div class="panel-header">
          <span class="panel-title">TOP {{ stores.length }} {{ applicationSceneName }}</span>
          <span class="panel-subtitle">问题数</span>
        </div>
        <div class="store-list">
          <div
            v-for="(store, index) in stores"
            :key="store.storeId"
            class="store-item"
            :class="{ active: currentStoreId === store.storeId }"
            @click="selectStore(store)"
          >
            <span class="store-name">
              <span class="index">{{ index + 1 }}、</span>
              {{ store.storeName }}
            </span>
            <span class="problem-count">{{ getStoreProblemCount(store) }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧问题详情 -->
      <div class="problem-detail-panel">
        <div class="panel-header">
          <span class="panel-title">问题列表 ({{ total }})</span>
        </div>
        <div class="problem-list" v-loading="loading">
          <div
            v-for="(problem, index) in currentStoreProblems"
            :key="index"
            class="problem-item"
          >
            <div class="problem-header" @click="toggleProblem(index)">
              <div class="problem-desc">
                {{ index + 1 }}、{{ problem.questionName }}
              </div>
              <i style="font-weight: 500; font-size: 18px;color: #000;" :class="expandedProblems.includes(index) ? 'h-icon-angle_up' : 'h-icon-angle_down'"></i>
            </div>
            
            <el-collapse-transition>
              <div v-show="expandedProblems.includes(index)" class="problem-body">
                <LazyComponent>
                  <div class="image-list">
                    <div
                      v-for="(img, imgIdx) in problem.pics"
                      :key="imgIdx"
                      class="image-item"
                    >
                         <ImageGrid 
                             :images="[img]" 
                             :container-width="97"
                             @handleClickImage="(img, idx) => previewImage(img, problem.pics, problem)"
                         />
                    </div>
                    <div v-if="!problem.pics || problem.pics.length === 0" class="no-image">
                      暂无图片
                    </div>
                  </div>
                </LazyComponent>
              </div>
            </el-collapse-transition>
          </div>
        </div>
      </div>
    </div>

    <!-- 大图查看器 -->
    <ImageDrawViewer
      ref="ImageDrawViewer"
      :pic-arr="bigImgInfo.pics"
      :current-select-index.sync="bigImgInfo.picIndexArr[0]"
      :current-second-select-index.sync="bigImgInfo.picIndexArr[1]"
      title="问题图片"
      :store-name="bigImgInfo.storeName"
      :visible.sync="bigImgInfo.visible"
      :models="['zoom', 'drag', 'download']"
      :deletable="false"
      content-dec=""
      @close="graffitiClose"
    >
      <template v-slot:rightAside="{ pic }">
        <RightAsideContainer
          :has-change-ques-btn="true"
          :question="bigImgInfo.question"
          :show-eval-btn="true"
          :store-name="bigImgInfo.storeName"
          :pic="{
            ...pic,
            captureTime: pic ? pic.captureTime : null
          }"
          @changeQues="changeQues"
          @goEval="goEval"
        />
      </template>
    </ImageDrawViewer>
  </hik-cloud-drawer>
</template>

<script>
import Vue from 'vue';
import HikCloudDrawer from '@/../public/hik-cloud-ui/packages/drawer/index.js';
import ImageGrid from '@/ai-ui/base-form/ImageGrid/index.vue';
import { DataAnalysisXApi } from '../api';

export default {
  name: 'PatrolStoreDetailDrawer',
  components: {
    HikCloudDrawer,
    ImageGrid
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: () => Vue.prototype.applicationSceneName ? `${Vue.prototype.applicationSceneName}问题详情` : '门店问题详情'
    },
    stores: {
      type: Array,
      default: () => []
    },
    client: {
      type: Object,
      required: true
    },
    startTime: {
      type: Number,
      required: true
    },
    endTime: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      localVisible: this.visible,
      currentStoreId: '',
      currentStore: null,
      loading: false,
      expandedProblems: [], // 默认展开前三个（如果数量超过3个）
      total: 0,
      currentStoreProblems: [],
      // 大图查看器状态
      bigImgInfo: {
        visible: false,
        pics: [],
        picIndexArr: [0, 0],
        storeName: '',
        question: {}
      }
    };
  },
  computed: {
    currentStoreProblemCount() {
      if (!this.currentStore) return 0;
      return this.getStoreProblemCount(this.currentStore);
    }
  },
  watch: {
    visible(val) {
      this.localVisible = val;
      if (val && this.stores.length > 0) {
        // 初始打开时，选中第一个门店
        if (!this.currentStoreId) {
          this.selectStore(this.stores[0]);
        }
      }
    },
    localVisible(val) {
      this.$emit('update:visible', val);
    }
  },
  methods: {
    handleClose() {
      this.localVisible = false;
    },
    getStoreProblemCount(store) {
      if (!store.questionData) return 0;
      return store.questionData.reduce((acc, cur) => acc + (cur.questionCount || 0), 0);
    },
    selectStore(store) {
      this.currentStoreId = store.storeId;
      this.currentStore = store;
      this.fetchStoreProblems();
    },
    async fetchStoreProblems() {
      if (!this.currentStore || !this.currentStore.questionData) return;
      
      const questionIds = this.currentStore.questionData.map(q => q.questionId);
      if (questionIds.length === 0) {
        this.currentStoreProblems = [];
        this.total = 0;
        return;
      }

      this.loading = true;
      try {
        const res = await DataAnalysisXApi.queryStoreQuestionPics(this.client, {
          startTime: this.startTime,
          endTime: this.endTime,
          storeId: this.currentStoreId,
          questionIds: questionIds
        });
        
        if (res && res.code === 0 && Array.isArray(res.data)) {
          // 将图片数据与问题名称进行合并映射
          this.currentStoreProblems = this.currentStore.questionData.map(q => {
            const picData = res.data.find(item => item.questionId === q.questionId);
            const pics = picData ? (picData.pics || []) : [];

            return {
              ...q,
              pics
            };
          });
          this.total = this.currentStoreProblems.length;
          
          // 默认展开前三个（如果数量超过3个）
          this.expandedProblems = Array.from({ length: Math.min(3, this.total) }, (_, i) => i);
        } else {
          // 如果接口返回失败，只展示问题列表，不填充图片
          this.currentStoreProblems = this.currentStore.questionData.map(q => ({
            ...q,
            pics: []
          }));
          this.total = this.currentStoreProblems.length;
          // 默认展开前三个（如果数量超过3个）
          this.expandedProblems = Array.from({ length: Math.min(3, this.total) }, (_, i) => i);
        }
      } catch (e) {
        console.error('Fetch store problems failed:', e);
        // 错误时只展示问题列表，不填充图片
        this.currentStoreProblems = this.currentStore.questionData.map(q => ({
          ...q,
          pics: []
        }));
        this.total = this.currentStoreProblems.length;
        // 默认展开前三个（如果数量超过3个）
        this.expandedProblems = Array.from({ length: Math.min(3, this.total) }, (_, i) => i);
      } finally {
        this.loading = false;
      }
    },
    toggleProblem(index) {
      const pos = this.expandedProblems.indexOf(index);
      if (pos > -1) {
        this.expandedProblems.splice(pos, 1);
      } else {
        this.expandedProblems.push(index);
      }
    },
    previewImage(img, allPics, question) {
      this.bigImgInfo.pics = allPics || [];
      const index = (allPics || []).indexOf(img);
      this.bigImgInfo.picIndexArr = [index > -1 ? index : 0, 0];
      this.bigImgInfo.storeName = this.currentStore ? this.currentStore.storeName : '';
      this.bigImgInfo.question = question || {};
      this.bigImgInfo.visible = true;
    },
    changeQues(direction) {
      if (!this.currentStoreProblems || this.currentStoreProblems.length === 0) return;
      
      // 过滤出有图片的问题列表
      const problemsWithPics = this.currentStoreProblems.filter(p => p.pics && p.pics.length > 0);
      if (problemsWithPics.length === 0) return;

      const currentIndex = problemsWithPics.findIndex(p => p.questionId === this.bigImgInfo.question.questionId);
      
      if (direction === 'prev') {
        if (currentIndex <= 0) {
          this.$message.info('已经是第一个有图片的问题了');
          return;
        }
        const prevProblem = problemsWithPics[currentIndex - 1];
        this.bigImgInfo.question = prevProblem;
        this.bigImgInfo.pics = prevProblem.pics;
      } else if (direction === 'next') {
        if (currentIndex === -1 || currentIndex >= problemsWithPics.length - 1) {
          this.$message.info('已经是最后一个有图片的问题了');
          return;
        }
        const nextProblem = problemsWithPics[currentIndex + 1];
        this.bigImgInfo.question = nextProblem;
        this.bigImgInfo.pics = nextProblem.pics;
      }
      
      // 切换问题后，默认选中该问题的第一个图片
      this.bigImgInfo.picIndexArr = [0, 0];
    },
    goEval(patrolRecord) {
       window.open(
          `${location.pathname}#/inspect/intelliInspect/intelliRecord/evalDetail?patrolId=${patrolRecord.patrolId}`
        );
    },
    graffitiClose() {
      this.bigImgInfo.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/style/mixins.scss';

::v-deep .el-scrollbar__view {
    height: 100%;
}

.drawer-content {
  display: flex;
  height: 100%;
  background: #fff;
  overflow: hidden;

  .panel-header {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    flex-shrink: 0;
    
    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: rgba(0,0,0,0.9);
    }
    
    .panel-subtitle {
      font-size: 12px;
      color: rgba(0,0,0,0.45);
    }
  }

  .store-list-panel {
    width: 348px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    .store-list {
      flex: 1;
      overflow-y: auto;
      @extend %scrollbar;
      
      .store-item {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        cursor: pointer;
        transition: background 0.3s;
        
        &:hover {
           background: rgba(248,249,251,1);
        }
        
        &.active {
          background: rgba(248,249,251,1);
        }
        
        .store-name {
          font-size: 14px;
          color: rgba(0,0,0,0.7);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: flex;
          align-items: center;
          
          .index {
            color: rgba(0,0,0,0.45);
            margin-right: 4px;
          }
        }
        
        .problem-count {
          font-size: 14px;
          color: #ff4d4f;
        }
      }
    }
  }

  .problem-detail-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8f9fb;
    overflow: hidden;

    .problem-list {
      flex: 1;
      overflow-y: auto;
      @extend %scrollbar;
      
      .problem-item {
        border-radius: 4px;
        margin-bottom: 12px;
        overflow: hidden;
        padding: 0 16px;
        
        .problem-header {
          border-radius: 8px;
          background: rgba(0,0,0,0.04);
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          
          .problem-desc {
            font-size: 14px;
            color: rgba(0,0,0,0.85);
            line-height: 22px;
            flex: 1;
            padding-right: 12px;
            word-break: break-all;
          }
          
          i {
            color: rgba(0,0,0,0.25);
            transition: transform 0.3s;
            font-size: 12px;
          }
        }
        
        .problem-body {
          padding: 12px 0;
          
          .image-list {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            
            .image-item {
              width: 96px;
              height: 96px;
              border-radius: 8px;
              overflow: hidden;
              cursor: pointer;
              background: #f0f0f0;
              
              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
                
                &:hover {
                  transform: scale(1.05);
                }
              }
            }
            
            .no-image {
              font-size: 12px;
              color: rgba(0,0,0,0.45);
              padding: 20px 0;
            }
          }
        }
      }
    }
  }
}
</style>


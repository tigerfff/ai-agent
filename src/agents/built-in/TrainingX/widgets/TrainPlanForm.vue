<template>
  <div class="train-plan-form" :class="{ 'is-disabled': isDisabled }">
    <div class="title">请确认培训任务</div>
    
    <div class="form-body">
      <!-- 学习项目 -->
      <div class="form-item">
        <div class="label">学习项目</div>
        <div class="content">
          <AILoadSelect
            v-if="!isConfirmed && !isDisabled"
            v-model="formData.courseProjectId"
            :remote-method="handleProjectSearch"
            :selected-options="selectedProjectOptions"
            :get-option-key="(item) => item.projectId"
            :get-option-label="(item) => item.projectName"
            :get-option-value="(item) => item.projectId"
            placeholder="请选择学习项目"
            :disabled="isDisabled"
            style="width: 50%"
            @change="handleProjectChange"
            @input="handleProjectInput"
          />
          <div v-else class="text-display">{{ detailInfo.name || selectedProjectName || '未知项目' }}</div>
        </div>
      </div>

      <!-- 培训学员 -->
      <div class="form-item">
        <div class="label">培训学员</div>
        <div class="content">
          <div v-if="loadingUsers" class="loading-placeholder">加载中...</div>
          <el-select 
            v-else-if="!isConfirmed && !isDisabled" 
            v-model="formData.userIds" 
            multiple
            collapse-tags
            placeholder="请选择"
            size="small"
            style="width: 50%"
          >
            <el-option 
              v-for="user in userList" 
              :key="user.id" 
              :label="user.name" 
              :value="user.id"
            ></el-option>
          </el-select>
          <div v-else class="text-display">{{ userNames }}</div>
        </div>
      </div>

      <!-- 培训周期 -->
      <div class="form-item">
        <div class="label">培训周期</div>
        <div class="content">
          <div class="text-display">{{ dateRangeDisplay }}</div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="form-footer" >
      <div class="confirm-btn" @click="handleConfirm" v-if="!isConfirmed && !isDisabled">
        <span class="icon">✨</span>
        <span>确认执行</span>
      </div>

      <div class="confirmed-badge" v-if="isConfirmed">
        <span class="icon">✔</span>
        <span>确认执行</span>
      </div>
    </div>
  </div>
</template>

<script>
import { TrainingXApi } from '../api';
import AILoadSelect from '@/ai-ui/base-form/AILoadSelect.vue';

export default {
  name: 'TrainPlanForm',
  components: {
    AILoadSelect
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    // 是否为不可操作的历史消息（例如超过1轮）
    isHistoryDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      loadingUsers: false,
      isConfirmed: false,
      initialData: {}, // 保存初始数据用于对比
      formData: {
        courseProjectId: '',
        type: '',
        userIds: [],
        dateRange: [] // [start, end]
      },
      detailInfo: {}, // 课程/项目详情
      userList: [], // 学员列表
      selectedProjectOptions: [] // 已选中的项目选项（用于 AILoadSelect 显示）
    };
  },
  computed: {
    isDisabled() {
      return this.isHistoryDisabled || this.isConfirmed;
    },
    userNames() {
      if (!this.formData.userIds || this.formData.userIds.length === 0) return '';
      const names = this.formData.userIds.map(id => {
        const user = this.userList.find(u => u.id === id);
        return user ? user.name : id;
      });
      return names.join('、');
    },
    dateRangeDisplay() {
      if (!this.formData.dateRange || this.formData.dateRange.length < 2) return '未设置';
      const start = this.formData.dateRange[0];
      const end = this.formData.dateRange[1];
      
      // 计算天数
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = Math.abs(e - s);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      const numMap = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
      const dayStr = diffDays <= 10 ? numMap[diffDays] : diffDays;
      
      return `${dayStr}天(${start}-${end})`;
    },
    selectedProjectName() {
      if (!this.formData.courseProjectId) return '';
      const selected = this.selectedProjectOptions.find(
        opt => opt.projectId === this.formData.courseProjectId
      );
      return selected ? selected.projectName : '';
    }
  },
  created() {
    // 初始化数据
    this.initialData = { ...this.data };
    this.formData.courseProjectId = this.data.courseProjectId;
    this.formData.type = this.data.type;
    this.formData.userIds = [...(this.data.userIds || [])];
    
    // 默认给一个时间范围示例 (需求未明确，这里暂且默认三天后)
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);
    this.formData.dateRange = [
      this.formatDate(today),
      this.formatDate(threeDaysLater)
    ];

    this.fetchDetail();
    this.fetchUsers();
    
    
    // 如果有初始项目ID，加载项目信息用于显示
    if (this.formData.courseProjectId && this.formData.type === '项目') {
      this.loadInitialProject();
    }
  },
  methods: {
    formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    async fetchDetail() {
      this.loading = true;
      try {
        let res;

        if (this.formData.type === '项目') {
          res = await TrainingXApi.getProjectDetail(this.$aiClient, this.formData.courseProjectId);
        } else {
          // 默认课程
          res = await TrainingXApi.getCourseDetail(this.$aiClient, this.formData.courseProjectId);
        }

        if (res && res.data) {
          this.detailInfo = res.data;
        }
      } catch (e) {
        console.error('Fetch detail failed:', e);
        this.detailInfo = { name: '获取失败' };
      } finally {
        this.loading = false;
      }
    },
    async fetchUsers() {
      this.loadingUsers = true;
      try {
        const res = await TrainingXApi.getPersonnelInfo(this.$aiClient, this.formData.userIds);
        if (res && res.data) {
          this.userList = res.data;
        }
      } catch (e) {
        console.error('Fetch users failed:', e);
      } finally {
        this.loadingUsers = false;
      }
    },
    /**
     * 处理项目搜索（AILoadSelect 的 remoteMethod）
     */
    async handleProjectSearch(query, page, pageSize) {
      try {
        const {data} = await TrainingXApi.getProjectList(this.$aiClient, {
          projectName: query || '',
          pageNo: page,
          pageSize: pageSize,
          containSub: true,
          projectStatus: 1,
          projectType: 0
        });

        const list = data.rows || [];
          if(!query && page === 1 && !list.find(item => item.projectId === this.data.courseProjectId)) {
            list.unshift({
              projectId: this.detailInfo.courseProjectId,
              projectName: this.detailInfo.courseProjectName
            });
          }
          return {
            list: list,
            hasMore: data.hasNextPage === true
          };
      } catch (e) {
        return { list: [], hasMore: false };
      }
    },
    /**
     * 处理项目输入（v-model 更新）
     */
    handleProjectInput(projectId) {
      // v-model 会自动更新 formData.courseProjectId
      // 这里只需要确保 selectedProjectOptions 同步更新
      if (projectId) {
        // 从 allOptions 中查找对应的项目（如果下拉框已加载）
        // 或者通过 change 事件来更新
      }
    },
    /**
     * 处理项目选择变化
     */
    handleProjectChange(projectId, projectItem) {
      console.log('[TrainPlanForm] handleProjectChange:', { projectId, projectItem });
      if (projectItem) {
        // 更新选中选项列表
        this.selectedProjectOptions = [projectItem];
        // 更新详情信息
        this.detailInfo = {
          name: projectItem.projectName,
          projectId: projectItem.projectId
        };
        // formData.courseProjectId 已经通过 v-model 自动更新了
        // 如果类型是项目，可以调用详情接口获取更多信息
        if (this.formData.type === '项目') {
          this.fetchDetail();
        }
      } else if (projectId) {
        // 如果没有 projectItem，说明可能是直接设置的值，需要查找对应的项目
        const foundProject = this.selectedProjectOptions.find(
          p => p.projectId === projectId
        );
        if (!foundProject) {
          // 如果找不到，尝试从已加载的选项中查找
          // 这里可以触发一次搜索来获取项目信息
        }
      }
    },
    /**
     * 加载初始项目信息（用于显示已选中的项目）
     */
    async loadInitialProject() {
      if (!this.formData.courseProjectId) return;
      
      try {
        const res = await TrainingXApi.getProjectList(this.$aiClient, {
          projectName: '',
          pageNo: 1,
          pageSize: 100, // 获取更多数据以便找到当前项目
          containSub: true,
          projectStatus: 1,
          projectType: 0
        });

        if (res && res.code === 0 && res.data && Array.isArray(res.data.rows)) {
          const currentProject = res.data.rows.find(
            p => p.projectId === this.formData.courseProjectId
          );
          if (currentProject) {
            this.selectedProjectOptions = [currentProject];
            this.detailInfo = {
              name: currentProject.projectName,
              projectId: currentProject.projectId
            };
          }
        }
      } catch (e) {
        console.error('[TrainPlanForm] Load initial project failed:', e);
      }
    },
    handleConfirm() {
      this.isConfirmed = true;
      
      // 检查是否修改过
      const isModified = 
        this.formData.courseProjectId !== this.initialData.courseProjectId ||
        JSON.stringify(this.formData.userIds.sort()) !== JSON.stringify((this.initialData.userIds || []).sort());
        // 日期范围对比省略，因为初始数据没给日期

      let message = '确认';
      if (isModified) {
        // 如果修改过，构造修改后的信息文本
        message = `已确认调整培训计划：
项目：${this.detailInfo.name || this.formData.courseProjectId}
人员：${this.userNames}
时间：${this.dateRangeDisplay}`;
      }

      // 触发事件通知父组件发送消息
      this.$emit('send-message', message);
    }
  }
};
</script>

<style lang="scss" scoped>
.train-plan-form {
  background: #fff;
  width: 400px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  position: relative;
  padding: 8px;

  &.is-disabled {
    .form-body {
      opacity: 0.8;
      pointer-events: none; // 禁止交互
    }
  }

  .title {
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 16px;
  }

  .form-body {
    .form-item {
      margin-bottom: 12px;
      display: flex;
      align-items: center;

      .label {
        width: 70px;
        flex-shrink: 0;
        color: rgba(0,0,0,0.4);
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
      }

      .content {
        flex: 1;
        min-width: 0;

        .text-display {
            color: rgba(0,0,0,0.9);
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0px;
            text-align: left;
        }
        
        .loading-placeholder {
          font-size: 12px;
          color: #999;
          line-height: 32px;
        }
      }
    }
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;

    .confirm-btn {
      background: linear-gradient(90deg, #6c9dfa 0%, #409eff 100%);
      color: #fff;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9;
      }

      .icon {
        font-size: 14px;
      }
    }
  }

  .confirmed-badge {
    width: 107px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-radius: 4px;
    padding: 6px 16px;
    font-size: 12px;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;
    margin-left: auto;
    border-radius: 8px;
    background: linear-gradient(-82.01deg, rgba(161,75,254,1) 0%, rgba(5,189,254,1) 100%);
    opacity: 0.4;
    cursor: not-allowed;
    .icon {
      margin-right: 8px;
    }
  }
}
</style>


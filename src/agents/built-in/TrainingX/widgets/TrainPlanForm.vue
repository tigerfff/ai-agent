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
            :get-option-key="getOptionKey"
            :get-option-label="getOptionLabel"
            :get-option-value="getOptionValue"
            :placeholder="formData.type === '项目' ? '请选择学习项目' : '请选择学习课程'"
            :disabled="isDisabled"
            style="width: 50%"
            @change="handleProjectChange"
            @input="handleProjectInput"
          />
          <div v-else class="text-display">{{ detailInfo.name || selectedProjectName || (formData.type === '项目' ? '未知项目' : '未知课程') }}</div>
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
      const selected = this.selectedProjectOptions.find(opt => {
        if (this.formData.type === '项目') {
          return opt.projectId === this.formData.courseProjectId;
        } else {
          return (opt.courseId === this.formData.courseProjectId || opt.id === this.formData.courseProjectId);
        }
      });
      
      if (this.formData.type === '项目') {
        return selected ? selected.projectName : '';
      } else {
        return selected ? (selected.courseName || selected.name) : '';
      }
    },
    /**
     * 获取选项的 key（用于 v-for :key）
     */
    getOptionKey() {
      return (item) => {
        if (this.formData.type === '项目') {
          return item.projectId;
        } else {
          return item.courseId || item.id;
        }
      };
    },
    /**
     * 获取选项的 label（显示文本）
     */
    getOptionLabel() {
      return (item) => {
        if (this.formData.type === '项目') {
          return item.projectName;
        } else {
          return item.name;
        }
      };
    },
    /**
     * 获取选项的 value（实际值）
     */
    getOptionValue() {
      return (item) => {
        if (this.formData.type === '项目') {
          return item.projectId;
        } else {
          return item.courseId || item.id;
        }
      };
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
     * 处理项目/课程搜索（AILoadSelect 的 remoteMethod）
     */
    async handleProjectSearch(query, page, pageSize) {
      try {
        let result;
        
        // 根据 type 判断是项目还是课程
        if (this.formData.type === '项目') {
          // 项目列表
          const { data } = await TrainingXApi.getProjectList(this.$aiClient, {
            projectName: query || '',
            pageNo: page,
            pageSize: pageSize,
            containSub: true,
            projectStatus: 1,
            projectType: 0
          });

          const list = data.rows || [];
          // 如果是第一页且没有搜索关键词，且当前项目不在列表中，添加到列表开头
          if (!query && page === 1 && this.formData.courseProjectId && 
              !list.find(item => item.projectId === this.formData.courseProjectId)) {
            // 尝试从 detailInfo 或 selectedProjectOptions 获取项目信息
            const currentProject = this.selectedProjectOptions.find(
              p => p.projectId === this.formData.courseProjectId
            );
            if (currentProject) {
              list.unshift(currentProject);
            } else if (this.detailInfo && this.detailInfo.projectId) {
              list.unshift({
                projectId: this.detailInfo.projectId,
                projectName: this.detailInfo.name || this.detailInfo.projectName
              });
            }
          }
          
          result = {
            list: list,
            hasMore: data.hasNextPage === true
          };
        } else {
          // 课程列表（默认或 type === '课程'）
          const { data } = await TrainingXApi.getCourseList(this.$aiClient, {
            name: query || '',
            pageNo: page,
            pageSize: pageSize,
            state: 2,
            classId: '',
            orderName: 'updateTime',
            orderType: 'desc',
            subClass: true,
            type: 0
          });

          const list = data.rows || [];
          // 如果是第一页且没有搜索关键词，且当前课程不在列表中，添加到列表开头
          if (!query && page === 1 && this.formData.courseProjectId && 
              !list.find(item => item.courseId === this.formData.courseProjectId || item.id === this.formData.courseProjectId)) {
            // 尝试从 detailInfo 或 selectedProjectOptions 获取课程信息
            const currentCourse = this.selectedProjectOptions.find(
              c => (c.courseId === this.formData.courseProjectId || c.id === this.formData.courseProjectId)
            );
            if (currentCourse) {
              list.unshift(currentCourse);
            } else if (this.detailInfo && (this.detailInfo.courseId || this.detailInfo.id)) {
              list.unshift({
                courseId: this.detailInfo.courseId,
                courseName: this.detailInfo.name,
              });
            }
          }
          
          result = {
            list: list,
            hasMore: data.hasNextPage === true
          };
        }
        
        return result;
      } catch (e) {
        console.error('[TrainPlanForm] Search failed:', e);
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
     * 处理项目/课程选择变化
     */
    handleProjectChange(selectedId, selectedItem) {
      if (selectedItem) {
        // 更新选中选项列表
        this.selectedProjectOptions = [selectedItem];
        // 更新详情信息
        if (this.formData.type === '项目') {
          this.detailInfo = {
            name: selectedItem.projectName,
            projectId: selectedItem.projectId
          };
        } else {
          this.detailInfo = {
            name: selectedItem.courseName || selectedItem.name,
            courseId: selectedItem.courseId || selectedItem.id,
          };
        }
        // formData.courseProjectId 已经通过 v-model 自动更新了
        // 调用详情接口获取更多信息
        this.fetchDetail();
      } else if (selectedId) {
        // 如果没有 selectedItem，说明可能是直接设置的值，需要查找对应的项目/课程
        const found = this.selectedProjectOptions.find(item => {
          if (this.formData.type === '项目') {
            return item.projectId === selectedId;
          } else {
            return (item.courseId === selectedId);
          }
        });
        if (!found) {
          // 如果找不到，尝试从已加载的选项中查找
          // 这里可以触发一次搜索来获取项目/课程信息
        }
      }
    },
    /**
     * 加载初始项目/课程信息（用于显示已选中的项目/课程）
     */
    async loadInitialProject() {
      if (!this.formData.courseProjectId) return;
      
      try {
        let res;
        let currentItem;
        
        if (this.formData.type === '项目') {
          // 加载项目列表
          res = await TrainingXApi.getProjectList(this.$aiClient, {
            projectName: '',
            pageNo: 1,
            pageSize: 100, // 获取更多数据以便找到当前项目
            containSub: true,
            projectStatus: 1,
            projectType: 0
          });

          if (res && res.code === 0 && res.data && Array.isArray(res.data.rows)) {
            currentItem = res.data.rows.find(
              p => p.projectId === this.formData.courseProjectId
            );
            if (currentItem) {
              this.selectedProjectOptions = [currentItem];
              this.detailInfo = {
                name: currentItem.projectName,
                projectId: currentItem.projectId
              };
            }
          }
        } else {
          // 加载课程列表
          res = await TrainingXApi.getCourseList(this.$aiClient, {
            name: '',
            pageNo: 1,
            pageSize: 100, // 获取更多数据以便找到当前课程
            state: 2,
            classId: '',
            orderName: 'updateTime',
            orderType: 'desc',
            subClass: true,
            type: 0
          });

          if (res && res.code === 0 && res.data && Array.isArray(res.data.rows)) {
            currentItem = res.data.rows.find(
              c => (c.courseId === this.formData.courseProjectId || c.id === this.formData.courseProjectId)
            );
            if (currentItem) {
              this.selectedProjectOptions = [currentItem];
              this.detailInfo = {
                name: currentItem.courseName || currentItem.name,
                courseId: currentItem.courseId || currentItem.id,
                id: currentItem.courseId || currentItem.id
              };
            }
          }
        }
      } catch (e) {
        console.error('[TrainPlanForm] Load initial project/course failed:', e);
      }
    },
   // TrainPlanForm.vue - handleConfirm 方法
    handleConfirm() {
      this.isConfirmed = true;
      
      // 检查是否修改过
      const isModified = 
        this.formData.courseProjectId !== this.initialData.courseProjectId ||
        JSON.stringify(this.formData.userIds.sort()) !== JSON.stringify((this.initialData.userIds || []).sort());

      // 构造确认数据
      const confirmData = {
        courseProjectId: this.formData.courseProjectId,
        type: this.formData.type,
        questionId: this.initialData.questionId || '',
        storeId: this.initialData.storeId || '',
        userIds: this.formData.userIds || []
      };

      // 构造描述文本
      let desc = `以下是用户确认的${this.formData.type}内容`;

      // 构造消息格式
      const message = `确认执行 <ymform:train_confirm desc="${desc}">
    ${JSON.stringify(confirmData, null, 2)}
    </ymform:train_confirm>`;

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


<template>
  <div class="train-plan-form" :class="{ 'is-disabled': isDisabled, 'is-loading': loading }">
    <!-- Loading 蒙层 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">
          <span></span><span></span><span></span>
        </div>
        <span class="loading-text">加载中...</span>
      </div>
    </div>

    <div class="title">请确认培训任务</div>

    
    <div class="form-body">
      <!-- 学习项目 -->
      <div class="form-item">
        <div class="label">学习{{ isProject ? '项目' : '课程' }}</div>
        <div class="content">
          <AILoadSelect
            v-if="!isConfirmed && !isDisabled"
            v-model="formData.courseProjectId"
            :remote-method="handleProjectSearch"
            :selected-options="selectedProjectOptions"
            :get-option-key="getOptionKey"
            :get-option-label="getOptionLabel"
            :get-option-value="getOptionValue"
            :placeholder="isProject ? '请选择学习项目' : '请选择学习课程'"
            :disabled="isDisabled || loading"
            style="width: 80%"
            @change="handleProjectChange"
            @input="handleProjectInput"
          />
          <div v-else class="text-display">{{ detailInfo.name || selectedProjectName || (isProject ? '未知项目' : '未知课程') }}</div>
        </div>
      </div>

      <!-- 培训学员 -->
      <div class="form-item">
        <div class="label">培训学员</div>
        <div class="content">
          <PersonSelect
            v-if="!isConfirmed && !isDisabled"
            v-model="selectedUsers"
            dialogTitle="选择学员"
            placeholder="请选择"
            collapseTags
            :disabled="isDisabled || loading"
            :selectable="selectable"
            style="width: 80%"
            @change="handleUsersChange"
          />
          <div v-else class="text-display">{{ userNames }}</div>
        </div>
      </div>

      <!-- 培训周期 -->
      <div class="form-item" v-if="isProject">
        <div class="label">培训周期</div>
        <div class="content">
          <div class="text-display">{{ dateRangeDisplay }}</div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="form-footer" >
      <div 
        class="confirm-btn" 
        :class="{ 'is-disabled': !canConfirm || loading }"
        @click="handleConfirm" 
        v-if="!isConfirmed && !isDisabled"
      >
        <span class="icon">
          <img src="@/assets/svg/star-white.svg" alt="" width="24px">
        </span>
        <span>确认执行</span>
      </div>

      <div class="confirmed-badge" v-if="isConfirmed || isHistoryDisabled">
        <span class="icon">
          <img src="@/assets/svg/sure.svg" alt="" width="24px">
        </span>
        <span>确认执行</span>
      </div>
    </div>

  </div>
</template>

<script>
import { TrainingXApi } from '../api';
import AILoadSelect from '@/ai-ui/base-form/AILoadSelect.vue';
import PersonSelect from '@/ai-ui/base-form/orgPersonPagedPicker/index.vue';

// 类型常量定义：1=项目，2=课程
const TYPE_PROJECT = 1; // 项目
const TYPE_COURSE = 2;  // 课程

export default {
  name: 'TrainPlanForm',
  components: {
    AILoadSelect,
    PersonSelect
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
      isConfirmed: false,
      initialData: {}, // 保存初始数据用于对比
      formData: {
        courseProjectId: '',
        type: '', // 1 = 项目, 2 = 课程
        userIds: [],
        period: 0,
        dateRange: [] // [start, end]
      },
      detailInfo: {}, // 课程/项目详情
      detailLoaded: false, // 详情是否成功加载（用于权限判断）
      selectedUsers: [], // 选中的用户对象数组
      selectedProjectOptions: [], // 已选中的项目选项（用于 AILoadSelect 显示）
      whiteUserIds: [], // 白名单用户ID列表（用于 selectable）
      _lastInitKey: '' // 用于防止重复初始化的标记
    };
  },
  computed: {
    isDisabled() {
      return this.isHistoryDisabled || this.isConfirmed;
    },
    // 是否可以确认执行（必须选择了项目/课程和学员，且详情加载成功）
    canConfirm() {
      const hasProject = !!this.formData.courseProjectId;
      const hasUsers = this.formData.userIds && this.formData.userIds.length > 0;
      // 必须同时满足：有项目/课程ID、详情加载成功、有学员
      return hasProject && this.detailLoaded && hasUsers;
    },
    // 是否为项目类型
    isProject() {
      return +this.formData.type === TYPE_PROJECT;
    },
    // 是否为课程类型
    isCourse() {
      return +this.formData.type === TYPE_COURSE;
    },
    userNames() {
      if (!this.selectedUsers || this.selectedUsers.length === 0) return '';
      return this.selectedUsers.map(user => {
        return user?.userName || user?.roleName || user?.name || '';
      }).filter(Boolean).join('、');
    },
    dateRangeDisplay() {
      if (!this.formData.dateRange || this.formData.dateRange.length < 2) {
        return this.formDate?.period || 0
      }
      const start = this.formData.dateRange[0];
      const end = this.formData.dateRange[1];
      
      return this.formData.period ? `${this.formData.period}天` : `${start} - ${end}`;
    },
    selectedProjectName() {
      if (!this.formData.courseProjectId) return '';
      const selected = this.selectedProjectOptions.find(opt => {
        // type=1 代表项目，type=2 代表课程
        if (this.isProject) {
          return opt.projectId === this.formData.courseProjectId;
        } else {
          return (opt.courseId === this.formData.courseProjectId || opt.id === this.formData.courseProjectId);
        }
      });
      
      // type="1" 代表项目，type="2" 代表课程
      if (this.isProject) {
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
        // type=1 代表项目，type=2 代表课程
        if (this.isProject) {
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
        // type=1 代表项目，type=2 代表课程
        if (this.isProject) {
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
        // type=1 代表项目，type=2 代表课程
        if (this.isProject) {
          return item.projectId;
        } else {
          return item.courseId || item.id;
        }
      };
    }
  },
  watch: {
    data: {
      handler(newVal) {
        // 当 data prop 变化时，重新初始化
        if (newVal && Object.keys(newVal).length > 0) {
          this.initFormData();
        }
      },
      deep: true,
      immediate: false // 不在 watch 中立即执行，避免和 created 重复
    }
  },
  created() {
    // 如果 data 已有值，立即初始化
    if (this.data && Object.keys(this.data).length > 0) {
      this.initFormData();
    }
  },
  methods: {
    /**
     * 初始化表单数据
     * 从 data prop 中提取并初始化所有表单字段
     */
    async initFormData() {
      if (!this.data || Object.keys(this.data).length === 0) {
        return;
      }

      // 防止重复初始化（如果数据没有变化）
      const currentKey = `${this.data.courseProjectId}-${this.data.type}-${JSON.stringify(this.data.userIds || [])}`;
      if (this._lastInitKey === currentKey) {
        return; // 数据没有变化，跳过初始化
      }
      this._lastInitKey = currentKey;

      // 开始加载
      this.loading = true;

      try {
        // 保存初始数据用于对比
        this.initialData = { ...this.data };
        
        // 初始化表单字段
        this.formData.courseProjectId = this.data?.courseProjectId || '';
        this.formData.type = this.data.type ? Number(this.data.type) : '';
        this.formData.userIds = [...(this.data.userIds || [])];
        this.formData.storeId = this.data.storeId || '';
        this.formData.period = 0;
        this.formData.dateRange = [];
        this.detailLoaded = false; // 重置详情加载状态

        // 初始化白名单用户列表（不依赖 data）
        await this.getListLearnersByStore();
        
        // 初始化选中的用户（临时使用 userIds，后续会通过接口获取完整用户信息）
        this.selectedUsers = this.data.userIds || [];

        // 如果有项目/课程ID，加载详情
        if (this.formData.courseProjectId) {
          // fetchDetail 内部会管理自己的 loading，但这里我们已经设置了外层 loading
          await this.fetchDetail();
          
          // type=1 代表项目，type=2 代表课程
          this.loadInitialProject();
        }
      } finally {
        // 结束加载
        this.loading = false;
      }
    },

    selectable (row, index) {
      return this.whiteUserIds.includes(row.userId)
    },
    // TOOD 等后端给个新接口查人名,这个是全量数据，用于去
    async getListLearnersByStore() {
      const { data } = await TrainingXApi.listLearnersByStore(this.$aiClient, { storeId: this.formData.storeId })
      this.formData.userIds = data
      this.whiteUserIds = data
      this.loadInitialUsers()
    },
    formatDate(stringDate) {
      const date = new Date(stringDate);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    },
    async fetchDetail() {
      // 记录是否由外部管理 loading（如 initFormData）
      const externalLoading = this.loading;
      
      // 如果外部没有设置 loading，则自己管理
      if (!externalLoading) {
        this.loading = true;
      }
      
      this.detailLoaded = false; // 重置状态
      try {
        let res;
        if (this.isProject) {
          res = await TrainingXApi.getProjectDetail(this.$aiClient, this.formData.courseProjectId);
          if (res && res.data) {
            this.formData.period = res.data.period;
            this.formData.dateRange = [
              this.formatDate(res.data.startDate),
              this.formatDate(res.data.endDate)
            ];
          }
        } else {
          // 默认课程
          res = await TrainingXApi.getCourseDetail(this.$aiClient, this.formData.courseProjectId);
        }

        if (res && res.data) {
          this.detailInfo = res.data;
          this.detailLoaded = true; // 详情加载成功
        } else {
          // 接口返回但没有数据，视为失败
          this.detailInfo = { name: '获取失败' };
          this.detailLoaded = false;
        }
      } catch (e) {
        console.error('Fetch detail failed:', e);
        this.detailInfo = { name: '获取失败' };
        this.detailLoaded = false; // 详情加载失败（可能是权限问题）
      } finally {
        // 只有自己管理的 loading 才清除
        if (!externalLoading) {
          this.loading = false;
        }
      }
    },
    /**
     * 加载初始用户信息（用于显示已选中的用户）
     */
    async loadInitialUsers() {
      try {
        const res = await TrainingXApi.getPersonnelInfo(this.$aiClient, {
          userIds: this.formData.userIds.join(',')
        });
        if (res && res.data && Array.isArray(res.data)) {
          // 将接口返回的用户信息转换为 PersonSelect 需要的格式
          this.selectedUsers = res.data.map(user => ({
            userId: user.id || user.userId,
            userName: user.name || user.userName,
            ...user // 保留其他字段
          }));
        }
      } catch (e) {
        console.error('Load initial users failed:', e);
      }
    },
    
    /**
     * 处理用户选择变化
     */
    handleUsersChange(users) {
      // 从用户对象数组中提取 userIds
      this.formData.userIds = users.map(user => {
        return user?.userId || user?.roleId || user?.id || '';
      }).filter(Boolean);
    },
    /**
     * 处理项目/课程搜索（AILoadSelect 的 remoteMethod）
     */
    async handleProjectSearch(query, page, pageSize) {
      try {
        let result;
        
        // 根据 type 判断是项目还是课程：type=1 代表项目，type=2 代表课程
        if (this.isProject) {
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
          
          // 如果是第一页且没有搜索关键词，且当前项目不在列表中，需要添加
          // 因为列表是分页的，可能没有加载到当前项目
          if (!query && page === 1 && this.formData.courseProjectId && 
              !list.find(item => item.projectId === this.formData.courseProjectId)) {
            // 从 selectedProjectOptions 或 detailInfo 获取当前项目信息
            const currentProject = this.selectedProjectOptions.find(
              p => p.projectId === this.formData.courseProjectId
            );
            if (currentProject) {
              list.unshift(currentProject);
            } else if (this.detailInfo && this.detailInfo.projectId) {
              // 从 detailInfo 构造项目信息
              list.unshift({
                projectId: this.detailInfo.projectId || this.formData.courseProjectId,
                projectName: this.detailInfo.projectName || this.detailInfo.name
              });
            }
          }
          
          result = {
            list: list,
            hasMore: data.hasNextPage === true
          };
        } else {
          // 课程列表（默认或 type=2）
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
          
          // 如果是第一页且没有搜索关键词，且当前课程不在列表中，需要添加
          // 因为列表是分页的，可能没有加载到当前课程
          if (!query && page === 1 && this.formData.courseProjectId && 
              !list.find(item => (item.courseId === this.formData.courseProjectId || item.id === this.formData.courseProjectId))) {
            // 从 selectedProjectOptions 或 detailInfo 获取当前课程信息
            const currentCourse = this.selectedProjectOptions.find(
              c => (c.courseId === this.formData.courseProjectId || c.id === this.formData.courseProjectId)
            );
            if (currentCourse) {
              list.unshift(currentCourse);
            } else if (this.detailInfo && (this.detailInfo.courseId || this.detailInfo.id)) {
              // 从 detailInfo 构造课程信息
              list.unshift({
                courseId: this.detailInfo.courseId || this.detailInfo.id || this.formData.courseProjectId,
                courseName: this.detailInfo.name,
                name: this.detailInfo.name,
                id: this.detailInfo.courseId || this.detailInfo.id || this.formData.courseProjectId
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
        // 重置详情加载状态
        this.detailLoaded = false;
        // 更新详情信息：type=1 代表项目，type=2 代表课程
        if (this.isProject) {
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
          // type=1 代表项目，type=2 代表课程
          if (this.isProject) {
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
     * 从 detailInfo 构造 selectedProjectOptions，供 AILoadSelect 显示
     */
    loadInitialProject() {
      if (!this.formData.courseProjectId || !this.detailInfo) return;
      
      try {
        // type=1 代表项目，type=2 代表课程
        if (this.isProject) {
          // 从 detailInfo 构造项目信息
          if (this.detailInfo.projectId || this.detailInfo.projectName || this.detailInfo.name) {
            const projectInfo = {
              projectId: this.detailInfo.projectId || this.formData.courseProjectId,
              projectName: this.detailInfo.projectName || this.detailInfo.name
            };
            this.selectedProjectOptions = [projectInfo];
          }
        } else {
          // 从 detailInfo 构造课程信息
          if (this.detailInfo.courseId || this.detailInfo.id || this.detailInfo.name) {
            const courseInfo = {
              courseId: this.detailInfo.courseId || this.detailInfo.id || this.formData.courseProjectId,
              courseName: this.detailInfo.name,
              name: this.detailInfo.name,
              id: this.detailInfo.courseId || this.detailInfo.id || this.formData.courseProjectId
            };
            this.selectedProjectOptions = [courseInfo];
          }
        }
      } catch (e) {
        console.error('[TrainPlanForm] Load initial project/course failed:', e);
      }
    },
   // TrainPlanForm.vue - handleConfirm 方法
    handleConfirm() {
      // 验证：必须选择了项目/课程和学员
      if (!this.canConfirm) {
        console.warn('[TrainPlanForm] Cannot confirm: missing project/course or users');
        return;
      }

      this.isConfirmed = true;
      
      // 检查是否修改过
      const currentUserIds = this.formData.userIds.sort();
      const initialUserIds = (this.initialData.userIds || []).sort();
      const isModified = 
        this.formData.courseProjectId !== this.initialData.courseProjectId ||
        JSON.stringify(currentUserIds) !== JSON.stringify(initialUserIds);

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

  // Loading 状态下禁用交互
  &.is-loading {
    pointer-events: none;
    user-select: none;

    .loading-overlay {
      pointer-events: auto; // 蒙层本身可以接收事件（虽然不需要）
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    border-radius: 8px;

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .loading-spinner {
        display: flex;
        gap: 4px;

        span {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #409eff;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }

          &:nth-child(2) {
            animation-delay: -0.16s;
          }
        }
      }

      .loading-text {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }
    }
  }

  &.is-disabled {
    .form-body {
      opacity: 0.8;
      pointer-events: none; // 禁止交互
      .form-item {
        align-items: flex-start !important;
      }
    }
  }

  .title {
    font-weight: bold;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 16px;
  }

  .form-body {
    border-bottom: 1px solid rgba(0,0,0,0.08);
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
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;

    .confirm-btn {
      background: linear-gradient(90deg, #6c9dfa 0%, #409eff 100%);
      color: #fff;
      border-radius: 8px;
      padding: 6px 16px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: opacity 0.2s;

      &:hover:not(.is-disabled) {
        opacity: 0.9;
      }

      &.is-disabled {
        background: #d3d3d3;
        cursor: not-allowed;
        opacity: 0.6;
      }

      .icon {
        font-size: 14px;
        margin-right: 4px;
      }
    }
  }

  .confirmed-badge {
    width: 112px;
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

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>


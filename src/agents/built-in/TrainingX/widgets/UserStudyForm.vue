<template>
  <div class="user-study-form" :class="{ 'error': errorMessage }">
    <!-- 错误提示 -->
    <!-- <div v-if="errorMessage" class="error-card">
      {{ errorMessage }}
    </div> -->

    <div class="study-card">
      <!-- 左侧封面 -->
      <div class="card-cover">
        <img 
          v-if="coverImage" 
          :src="coverImage" 
          :alt="title"
          class="cover-img"
        />
        <div v-else class="cover-placeholder">
          <div class="placeholder-text">
            <div class="placeholder-name">{{ errorMessage ? '' :title }}</div>
          </div>
        </div>
      </div>

      <!-- 中间内容 -->
      <div class="card-content">
        <div class="card-title">{{ title }}</div>
        <div class="card-duration" v-if="durationText || errorMessage">{{ durationText || '无法学习' }}</div>
      </div>

      <!-- 右侧按钮 -->
      <div class="card-action">
        <div class="learn-btn" @click="handleLearn">
          <span>学习</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { TrainingXApi } from '../api';

// 类型常量定义：1=项目，2=课程
const TYPE_PROJECT = '1'; // 项目
const TYPE_COURSE = '2';  // 课程

export default {
  name: 'UserStudyForm',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      detailInfo: {}, // 课程/项目详情
      errorMessage: '', // 错误信息
      formData: {
        courseProjectId: '',
        type: '' // '1' = 项目, '2' = 课程
      }
    };
  },
  computed: {
    // 是否为项目类型
    isProject() {
      return this.formData.type === TYPE_PROJECT;
    },
    // 是否为课程类型
    isCourse() {
      return this.formData.type === TYPE_COURSE;
    },
    // 标题
    title() {
      if (this.isProject) {
        return this.detailInfo.projectName || this.errorMessage;
      } else {
        return this.detailInfo.name || this.errorMessage;
      }
    },
    // 封面图片
    coverImage() {
      if (this.isProject) {
        return this.detailInfo.coverImage?.url || null;
      } else {
        return this.detailInfo.coverImg?.url || null;
      }
    },
    // 时长/周期文本
    durationText() {
      if (this.isProject) {
        // 项目显示周期
        if (this.detailInfo.period) {
          return `培训周期: ${this.detailInfo.period}天`;
        } else if (this.detailInfo.startDate && this.detailInfo.endDate) {
          const start = this.formatDate(this.detailInfo.startDate);
          const end = this.formatDate(this.detailInfo.endDate);
          return `培训周期: ${start} - ${end}`;
        }
        return '培训周期: 未设置';
      } 
      return ''
    },
  },
  created() {
    if(!this.data) {
      this.errorMessage = '数据不存在';
    };
    // 初始化数据
    this.formData.courseProjectId = this.data.courseProjectId || '';
    this.formData.type = this.data.type || '';

    // 如果有 courseProjectId，加载详情
    if (this.formData.courseProjectId) { 
      this.fetchDetail();
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    async fetchDetail() {
      if (!this.formData.courseProjectId) return;

      this.loading = true;
      this.errorMessage = '';
      try {
        let res;

        // type="1" 代表项目，type="2" 代表课程
        if (this.isProject) {
          res = await TrainingXApi.getProjectDetail(this.$aiClient, this.formData.courseProjectId);
        } else {
          // 默认课程（type="2"）
          res = await TrainingXApi.getCourseDetail(this.$aiClient, this.formData.courseProjectId);
        }

        if (res && res.code === 0 && res.data) {
          this.detailInfo = res.data;
        } else {
          // 处理错误情况
          if (res && res.message) {
            this.errorMessage = res.message;
          } else {
            this.errorMessage = this.isProject ? '获取项目详情失败' : '获取课程详情失败';
          }
        }
      } catch (e) {
        console.error('[UserStudyForm] Fetch detail failed:', e);
        this.errorMessage = '请求发生异常';
        this.detailInfo = {};
      } finally {
        this.loading = false;
      }
    },
    handleLearn() {
      if (!this.formData.courseProjectId) {
        console.warn('[UserStudyForm] courseProjectId is required');
        return;
      }

      let baseUrl = '';

      const origin = window.location.origin;
      // 如果当前域名包含 pb.hik-cloud.com，使用 training-cs-web 子路径
      if (origin.includes('pb.hik-cloud.com')) {
        return `${origin}/training-cs-web`;
      }
      // 其他情况，默认使用 pb.hik-cloud.com
      baseUrl =  'https://www.hik-cloud.com/training-cs-web';
      
      // 根据类型确定路径
      const path = this.isProject ? 'project' : 'course';
      const url = `${baseUrl}/index.html#/${path}/${this.formData.courseProjectId}`;
      
      // 新窗口打开
      window.open(url, '_blank');
    }
  }
};
</script>

<style lang="scss" scoped>
.user-study-form {
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  .error-card {
    padding: 4px 12px;
    background: #fff;
    border-radius: 8px;
    color: #ff4d4f;
    font-size: 14px;
    text-align: center;
    border: 1px solid #ffccc7;
  }

  .study-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    // padding: 8px;
    background: #fff;
    border-radius: 12px;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    // 左侧封面
    .card-cover {
      flex-shrink: 0;
      width: 86px;
      height: 56px;
      border-radius: 8px;
      overflow: hidden;
      background: rgba($color: #000000, $alpha: .1);

      .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
        }

        .placeholder-text {
          position: relative;
          z-index: 1;
          color: #fff;
          font-size: 12px;
          text-align: center;
          line-height: 1.4;

          .placeholder-name {
            font-size: 14px;
            font-weight: 500;
            margin-top: 4px;
          }
        }
      }
    }

    // 中间内容
    .card-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .card-title {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.9);
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .card-duration {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 1.4;
      }
    }

    // 右侧按钮
    .card-action {
      flex-shrink: 0;

      .learn-btn {
        padding: 4px 14px;
        background: linear-gradient(90deg, #6c9dfa 0%, #409eff 100%);
        color: #fff;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.2s;
        user-select: none;

        &:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

.error{
  // width: 200px;
  opacity: 0.7;
  cursor: not-allowed;

  .study-card .card-content .card-title ,.study-card .card-content .card-duration {
    color: rgba($color: #000000, $alpha: 0.2) !important;
  }
}
</style>
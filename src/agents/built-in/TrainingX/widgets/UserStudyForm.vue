<template>
  <div class="user-study-form">
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
            <div>{{ formData.type === '项目' ? '这里是培训项目' : '这里是培训课程' }}</div>
            <div class="placeholder-name">{{ title || '名称示例' }}</div>
          </div>
        </div>
      </div>

      <!-- 中间内容 -->
      <div class="card-content">
        <div class="card-title">{{ title }}</div>
        <div class="card-duration" v-if="durationText">{{ durationText }}</div>
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
      formData: {
        courseProjectId: '',
        type: '' // '项目' 或 '课程'
      }
    };
  },
  computed: {
    // 标题
    title() {
      if (this.formData.type === '项目') {
        return this.detailInfo.projectName || '未知项目';
      } else {
        return this.detailInfo.name || '未知课程';
      }
    },
    // 封面图片
    coverImage() {
      if (this.formData.type === '项目') {
        return this.detailInfo.coverImage?.url || null;
      } else {
        return this.detailInfo.coverImg?.url || null;
      }
    },
    // 时长/周期文本
    durationText() {
      if (this.formData.type === '项目') {
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
      try {
        let res;

        if (this.formData.type === '项目') {
          res = await TrainingXApi.getProjectDetail(this.$aiClient, this.formData.courseProjectId);
        } else {
          // 默认课程
          res = await TrainingXApi.getCourseDetail(this.$aiClient, this.formData.courseProjectId);
        }

        if (res && res.code === 0 && res.data) {
          this.detailInfo = res.data;
        }
      } catch (e) {
        console.error('[UserStudyForm] Fetch detail failed:', e);
        this.detailInfo = {};
      } finally {
        this.loading = false;
      }
    },
    handleLearn() {
      // 处理学习按钮点击事件
      // 可以跳转到学习页面，或者触发父组件事件
      this.$emit('learn', {
        courseProjectId: this.formData.courseProjectId,
        type: this.formData.type,
        detailInfo: this.detailInfo
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.user-study-form {
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  .study-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px;
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
      background: #f5f5f5;

      .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
</style>


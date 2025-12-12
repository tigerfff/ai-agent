<template>
  <div class="user-train-finish">
    <div class="upload-btn" @click="handleUploadClick" :class="{ 'is-uploading': isUploading, 'is-disabled': isDisabled }">
      <i class="h-icon-upload"></i>
      <span>{{ isUploading ? '上传中...' : '上传培训视频' }}</span>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="video/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script>
import { OssUploader } from '@/utils/oss-uploader.js';
import { TrainingXApi } from '../api';
import { parseWidgetData } from './widgetParser.js';

export default {
  name: 'UserTrainFinish',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    // 是否为不可操作的历史消息
    isHistoryDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isUploading: false,
      ossUploader: null,
      parsedData: {}
    };
  },
  computed: {
    isDisabled() {
      return this.isHistoryDisabled || this.isUploading;
    },
    projectId() {
      return this.parsedData.projectId || '';
    },
    taskId() {
      return this.parsedData.taskId || '';
    },
    storeId() {
      return this.parsedData.storeId || '';
    }
  },
  created() {
    // 解析 widget 数据
    this.parsedData = parseWidgetData(this.data, 'ymform:user_train_finish');
    this.initUploader();
  },
  methods: {

    /**
     * 初始化 OSS 上传器
     */
    async initUploader() {
      try {
        const tokenProvider = async () => {
          const res = await TrainingXApi.getOssToken(this.$aiClient);
          if (res.code === 0 && res.data) {
            return res.data;
          }
          throw new Error('Failed to get OSS token');
        };
        
        this.ossUploader = new OssUploader({ tokenProvider });
      } catch (e) {
        console.error('[UserTrainFinish] Init uploader failed:', e);
      }
    },

    /**
     * 点击上传按钮
     */
    handleUploadClick() {
      if (this.isDisabled) return;
      
      // 触发文件选择
      this.$refs.fileInput?.click();
    },

    /**
     * 文件选择变化
     */
    async handleFileChange(e) {
      const file = e.target.files?.[0];
      if (!file) return;

      // 验证文件类型
      if (!file.type.startsWith('video/')) {
        this.$message?.error('请选择视频文件');
        return;
      }

      // 验证文件大小（200MB）
      const maxSize = 200 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$message?.error('视频文件大小不能超过 200MB');
        return;
      }

      // 重置 input
      e.target.value = '';

      // 开始上传
      await this.uploadVideo(file);
    },

    /**
     * 上传视频
     */
    async uploadVideo(file) {
      if (!this.ossUploader) {
        this.$message?.error('上传器未初始化');
        return;
      }

      if (!this.projectId || !this.taskId || !this.storeId) {
        this.$message?.error('缺少必要参数：projectId、taskId 或 storeId');
        return;
      }

      this.isUploading = true;

      try {
        // 1. 上传视频到 OSS
        const uploadResult = await this.ossUploader.upload(file, (percent) => {
          // 可以在这里更新进度
          console.log('[UserTrainFinish] Upload progress:', Math.round(percent * 100) + '%');
        });

        const videoUrl = uploadResult.url;
        console.log('[UserTrainFinish] Video uploaded:', videoUrl);

        // 2. 获取视频时长（如果可能）
        const duration = await this.getVideoDuration(file);

        // 3. 调用实操提交接口
        await this.submitOperation(videoUrl, file, duration);

        // 4. 发送成功消息
        this.sendVideoUploadMessage(videoUrl);

        this.$message?.success('视频上传成功');
      } catch (e) {
        console.error('[UserTrainFinish] Upload failed:', e);
        this.$message?.error('视频上传失败：' + (e.message || '未知错误'));
      } finally {
        this.isUploading = false;
      }
    },

    /**
     * 获取视频时长
     */
    getVideoDuration(file) {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          resolve(Math.round(video.duration));
        };
        video.onerror = () => {
          resolve(0);
        };
        video.src = URL.createObjectURL(file);
      });
    },

    /**
     * 提交实操
     */
    async submitOperation(videoUrl, file, duration) {
      const startTime = Date.now();
      const endTime = startTime + (duration * 1000);

      // 根据 traing.md 的接口文档构造参数
      const params = {
        mode: 2,
        taskId: this.taskId,
        loading: true,
        startTime: startTime,
        endTime: endTime,
        userAnswerList: null,
        steps: [
          {
            video: videoUrl,
            note: '',
            name: '-',
            stepId: this.generateStepId(),
            fileSize: file.size,
            fileType: 3, // 视频类型
            fileSubType: this.getFileSubType(file.name),
            duration: duration
          }
        ],
        evaluators: [],
        tempWorkId: 'null'
      };

      const res = await TrainingXApi.submitOperation(this.$aiClient, params);
      
      if (res.code !== 0) {
        throw new Error(res.message || '提交实操失败');
      }

      console.log('[UserTrainFinish] Operation submitted:', res);
    },

    /**
     * 生成 stepId
     */
    generateStepId() {
      // 生成 UUID v4 格式的 stepId
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },

    /**
     * 获取文件子类型
     */
    getFileSubType(fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      return ext || 'mp4';
    },

    /**
     * 发送视频上传消息
     */
    sendVideoUploadMessage(videoUrl) {
      const message = `<ymform:train_video_upload desc="以下是用户上传的视频内容和课程信息">
{
  "taskId": "${this.taskId}",
  "videoUrl": "${videoUrl}"
}
</ymform:train_video_upload>`;

      this.$emit('send-message', message);
    }
  }
};
</script>

<style lang="scss" scoped>
.user-train-finish {
  .upload-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(232, 246, 255, 1);
    border: 1px solid rgba(232, 246, 255, 1);
    border-radius: 4px;
    color: rgba(56, 142, 255, 1);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover:not(.is-disabled) {
      background: rgba(56, 142, 255, 0.1);
      border-color: rgba(56, 142, 255, 0.3);
    }

    &.is-uploading {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    i {
      font-size: 16px;
    }
  }
}
</style>


<template>
  <div class="user-train-finish">
    <div 
      v-for="task in taskList" 
      :key="task.taskId"
      class="upload-btn-wrapper"
    >
      <div 
        class="upload-btn" 
        @click="handleUploadClick(task)"
        :class="{ 
          'is-uploading': task.isUploading, 
          'is-disabled': isTaskDisabled(task),
          'is-uploaded': task.uploaded
        }"
      >
        <i class="h-icon-upload" style="font-size: 24px;"></i>
        <span>{{ getButtonText(task) }}</span>
      </div>
      <input
        :ref="`fileInput-${task.taskId}`"
        type="file"
        accept="video/*"
        style="display: none"
        @change="(e) => handleFileChange(e, task)"
      />
    </div>
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
      ossUploader: null,
      parsedData: {},
      taskList: [], // 任务列表，包含 taskId, taskName, status, isUploading, uploaded
      loading: false
    };
  },
  computed: {
    projectId() {
      return this.parsedData.projectId || '';
    },
    taskIds() {
      // 兼容旧格式：如果存在 taskId，转换为数组
      if (this.parsedData.taskIds && Array.isArray(this.parsedData.taskIds)) {
        return this.parsedData.taskIds;
      } else if (this.parsedData.taskId) {
        return [this.parsedData.taskId];
      }
      return [];
    },
    storeId() {
      return this.parsedData.storeId || '';
    }
  },
  created() {
    // 解析 widget 数据
    this.parsedData = parseWidgetData(this.data, 'ymform:user_train_finish');
    this.initUploader();
    this.loadTaskInfo();
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
     * 加载任务信息
     */
    async loadTaskInfo() {
      if (!this.projectId || this.taskIds.length === 0) {
        console.warn('[UserTrainFinish] Missing projectId or taskIds');
        return;
      }

      this.loading = true;
      try {
        const res = await TrainingXApi.getProjectTasks(this.$aiClient, this.projectId);
        
        if (res.code === 0 && res.data && res.data.length > 0) {
          // 从返回的数据中提取所有任务
          const allTasks = [];
          res.data.forEach(stage => {
            if (stage.taskList && Array.isArray(stage.taskList)) {
              allTasks.push(...stage.taskList);
            }
          });

          // 根据 taskIds 过滤并构建任务列表
          this.taskList = this.taskIds.map(taskId => {
            const taskInfo = allTasks.find(t => t.taskId === taskId);
            return {
              taskId: taskId,
              taskName: taskInfo ? taskInfo.taskName : `任务 ${taskId.substring(0, 8)}`,
              status: taskInfo ? taskInfo.status : null,
              isUploading: false,
              uploaded: false
            };
          });
        } else {
          // 如果接口返回失败，至少显示任务ID
          this.taskList = this.taskIds.map(taskId => ({
            taskId: taskId,
            taskName: `任务 ${taskId.substring(0, 8)}`,
            status: null,
            isUploading: false,
            uploaded: false
          }));
        }
      } catch (e) {
        console.error('[UserTrainFinish] Load task info failed:', e);
        // 失败时至少显示任务ID
        this.taskList = this.taskIds.map(taskId => ({
          taskId: taskId,
          taskName: `任务 ${taskId.substring(0, 8)}`,
          status: null,
          isUploading: false,
          uploaded: false
        }));
      } finally {
        this.loading = false;
      }
    },

    /**
     * 判断任务是否禁用
     */
    isTaskDisabled(task) {
      // 历史消息禁用
      // if (this.isHistoryDisabled) return true;
      // 正在上传
      if (task.isUploading) return true;
      // 已上传
      if (task.uploaded) return true;
      // status 不为 -1 未开始 2 已驳回
      if (task.status !== null && ![-1, 2].includes(task.status)) return true;
      return false;
    },

    /**
     * 获取按钮文本
     */
    getButtonText(task) {
      if (task.isUploading) {
        return '上传中...';
      }
      if (task.uploaded) {
        return `${task.taskName} 已上传`;
      }
      if (task.status !== null && task.status !== -1) {
        return `${task.taskName}`;
      }
      return `上传 ${task.taskName}`;
    },

    /**
     * 点击上传按钮
     */
    handleUploadClick(task) {
      if (this.isTaskDisabled(task)) return;
      
      // 触发文件选择
      const fileInput = this.$refs[`fileInput-${task.taskId}`];
      if (fileInput && fileInput[0]) {
        fileInput[0].click();
      } else if (fileInput) {
        fileInput.click();
      }
    },

    /**
     * 文件选择变化
     */
    async handleFileChange(e, task) {
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
      await this.uploadVideo(file, task);
    },

    /**
     * 上传视频
     */
    async uploadVideo(file, task) {
      if (!this.ossUploader) {
        this.$message?.error('上传器未初始化');
        return;
      }

      if (!this.projectId || !task.taskId || !this.storeId) {
        this.$message?.error('缺少必要参数：projectId、taskId 或 storeId');
        return;
      }

      // 设置上传状态
      task.isUploading = true;

      try {
        // 1. 上传视频到 OSS
        const uploadResult = await this.ossUploader.upload(file, (percent) => {
          // 可以在这里更新进度
          console.log(`[UserTrainFinish] Upload progress for ${task.taskName}:`, Math.round(percent * 100) + '%');
        });

        const videoUrl = uploadResult.url;
        console.log(`[UserTrainFinish] Video uploaded for ${task.taskName}:`, videoUrl);

        // 2. 获取视频时长（如果可能）
        const duration = await this.getVideoDuration(file);

        // 3. 调用实操提交接口
        await this.submitOperation(videoUrl, file, duration, task.taskId);

        // 4. 标记为已上传
        task.uploaded = true;

        // 5. 发送成功消息
        this.sendVideoUploadMessage(videoUrl, task.taskId);

        this.$message?.success(`${task.taskName} 视频上传成功`);
      } catch (e) {
        console.error(`[UserTrainFinish] Upload failed for ${task.taskName}:`, e);
        this.$message?.error(`${task.taskName} 视频上传失败：` + (e.message || '未知错误'));
      } finally {
        task.isUploading = false;
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
    async submitOperation(videoUrl, file, duration, taskId) {
      const startTime = Date.now();
      const endTime = startTime + (duration * 1000);

      // 根据 traing.md 的接口文档构造参数
      const params = {
        mode: 2,
        taskId: taskId,
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

      console.log(`[UserTrainFinish] Operation submitted for task ${taskId}:`, res);
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
    sendVideoUploadMessage(videoUrl, taskId) {
      const message = `<ymform:train_video_upload desc="以下是用户上传的视频内容和课程信息">
{
  "taskId": "${taskId}",
  "videoUrl": "${videoUrl}",
  "projectId": "${this.projectId}"
}
</ymform:train_video_upload>`;

      this.$emit('send-message', message);
    }
  }
};
</script>

<style lang="scss" scoped>
  @use '@/style/mixins.scss';
.user-train-finish {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .upload-btn-wrapper {
    display: inline-block;
  }

  .upload-btn {
    height: 32px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: #FFF;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    color: rgba(0,0,0,0.7);
    line-height: 32px;
    letter-spacing: 0px;
    text-align: left;
    max-width: 400px;
    overflow: hidden;

    i {
      flex-shrink: 0; // 图标不收缩
    }

    span {
      min-width: 0; // 允许 flex 项收缩
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }


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

    &.is-uploaded {
      background: #d4ffe6;
      border-color: rgba(183, 223, 85, 1);
      color: rgba(82, 196, 26, 1);
      cursor: default;
    }

    i {
      font-size: 16px;
    }
  }
}
</style>

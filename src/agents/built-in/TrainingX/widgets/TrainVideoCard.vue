<template>
  <div class="train-video-card">
    <FilesCard
      :name="videoName"
      :url="videoUrl"
      :file-type="'video'"
      :icon-size="'100%'"
      :status="'done'"
      :img-preview="true"
      :img-preview-mask="true"
      mode="mini"
      @preview="handlePreview"
    />
    
    <!-- 视频预览弹窗 -->
    <AttachmentsPreview
      :visible="previewVisible"
      :fileList="previewFile"
      :show-nav="false"
      @close="handleClosePreview"
    />
  </div>
</template>

<script>
import FilesCard from '@/ai-ui/file-card/FilesCard.vue';
import AttachmentsPreview from '@/ai-ui/attachments/AttachmentsPreview.vue';

export default {
  name: 'TrainVideoCard',
  components: {
    FilesCard,
    AttachmentsPreview
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      previewVisible: false
    };
  },
  computed: {
    videoUrl() {
      return this.data.videoUrl || '';
    },
    taskId() {
      return this.data.taskId || '';
    },
    videoName() {
      // 从 URL 中提取文件名，或使用默认名称
      if (this.videoUrl) {
        const urlParts = this.videoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1]?.split('?')[0];
        return fileName || '培训视频';
      }
      return '培训视频';
    },
    previewFile() {
      console.log(this.videoUrl,'this.videoUrl')
      if (!this.videoUrl) return null;
      return [{
        url: this.videoUrl,
        type: 'video',
        name: this.videoName
      }];
    }
  },
  methods: {
    handlePreview() {
      this.previewVisible = true;
    },
    handleClosePreview() {
      this.previewVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.train-video-card {
  width: 100%;
  max-width: 400px;
}
</style>


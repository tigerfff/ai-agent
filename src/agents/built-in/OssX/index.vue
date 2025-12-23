<template>
  <div class="oss-x-container">
    <div class="demo-card">
      <h2>AIOssUploader 功能模拟</h2>
      <p class="desc">集成 STS 获取、SM4 加密、OSS 上传的完整流程演示</p>

      <div class="form-item">
        <label>业务编码 (bizCode):</label>
        <el-input v-model="bizCode" placeholder="请输入 bizCode (如 70201)"></el-input>
      </div>

      <div class="form-item">
        <label>选择文件:</label>
        <div class="upload-area" @click="$refs.fileInput.click()">
          <i class="el-icon-upload"></i>
          <p v-if="!selectedFile">点击选择文件</p>
          <p v-else>{{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(2) }} KB)</p>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          style="display: none" 
          @change="handleFileChange"
        />
      </div>

      <div class="actions">
        <el-button type="primary" :loading="loading" @click="handleUpload" :disabled="!selectedFile">
          开始上传
        </el-button>
        <el-button @click="reset">重置</el-button>
      </div>

      <div v-if="loading || progress > 0" class="progress-wrap">
        <p>上传进度: {{ progress }}%</p>
        <div class="progress-bar">
          <div class="progress-inner" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <div v-if="result" class="result-area">
        <h3>✅ 上传成功</h3>
        <div class="result-info">
          <p><strong>文件名:</strong> {{ result.fileName }}</p>
          <p><strong>OSS URL:</strong> <a :href="result.url" target="_blank">{{ result.url }}</a></p>
          <p><strong>Object Key:</strong> {{ result.name }}</p>
        </div>
        <div class="preview" v-if="isImage">
          <img :src="result.url" alt="预览" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AIOssUploader } from '@/utils/ai-oss-uploader'

export default {
  name: 'OssXDemo',
  data() {
    return {
      bizCode: '70201',
      selectedFile: null,
      loading: false,
      progress: 0,
      result: null,
      uploader: null
    }
  },
  computed: {
    isImage() {
      return this.result && /\.(png|jpg|jpeg|gif|webp)$/i.test(this.result.fileName)
    }
  },
  created() {
    // 实例化上传器
    this.uploader = new AIOssUploader()
  },
  methods: {
    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        this.selectedFile = file
        this.result = null
        this.progress = 0
      }
    },
    async handleUpload() {
      if (!this.selectedFile) return

      this.loading = true
      this.progress = 0
      this.result = null

      try {
        const res = await this.uploader.upload(this.selectedFile, this.bizCode, {
          onProgress: (p) => {
            this.progress = p
          }
        })
        this.result = res
        this.$message.success('上传成功！')
      } catch (error) {
        console.error('Upload error:', error)
        this.$message.error('上传失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.selectedFile = null
      this.result = null
      this.progress = 0
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.oss-x-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100%;
  display: flex;
  justify-content: center;
}

.demo-card {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);

  h2 {
    margin: 0 0 8px;
    color: #303133;
  }

  .desc {
    color: #909399;
    font-size: 14px;
    margin-bottom: 32px;
  }
}

.form-item {
  margin-bottom: 24px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #606266;
  }
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #409eff;
    background: #ecf5ff;
  }

  i {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    color: #606266;
  }
}

.actions {
  margin-top: 32px;
  display: flex;
  gap: 16px;
}

.progress-wrap {
  margin-top: 24px;
  
  p {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
}

.progress-bar {
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #409eff;
  transition: width 0.3s;
}

.result-area {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;

  h3 {
    color: #67c23a;
    margin: 0 0 16px;
  }

  .result-info {
    background: #f0f9eb;
    padding: 16px;
    border-radius: 4px;
    font-size: 14px;

    p {
      margin: 8px 0;
      word-break: break-all;
    }

    a {
      color: #409eff;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .preview {
    margin-top: 16px;
    img {
      max-width: 100%;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  }
}
</style>


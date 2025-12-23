<template>
    <div class="oss-x-container">
      <div class="demo-card">
        <h2>AIOssUploader 分片上传模拟</h2>
        <p class="desc">支持：分片上传、进度回显、暂停/取消、断点续传</p>
  
        <div class="form-item">
          <label>业务编码 (bizCode):</label>
          <el-input v-model="bizCode" placeholder="请输入 bizCode" :disabled="loading || status === 'paused'"></el-input>
        </div>
  
        <div class="form-item">
          <label>选择大文件 (建议 > 5MB 测试分片):</label>
          <div class="upload-area" @click="triggerFileInput">
            <i class="el-icon-upload"></i>
            <p v-if="!selectedFile">点击选择文件</p>
            <div v-else>
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">({{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB)</p>
            </div>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            @change="handleFileChange"
          />
        </div>
  
        <div class="actions">
          <!-- 上传/续传按钮 -->
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleUpload" 
            :disabled="!selectedFile || status === 'uploading'"
          >
            {{ status === 'paused' ? '恢复续传' : '开始上传' }}
          </el-button>
  
          <!-- 暂停按钮 -->
          <el-button 
            type="warning" 
            @click="handlePause" 
            v-if="status === 'uploading'"
          >
            暂停上传
          </el-button>
  
          <el-button @click="reset">重置</el-button>
        </div>
  
        <!-- 进度条 -->
        <div v-if="status !== 'idle' || progress > 0" class="progress-wrap">
          <div class="status-text">
            <span>状态: {{ statusText }}</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-inner" :class="status" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="cpt-hint" v-if="checkpoint">已保存断点信息 (Parts: {{ checkpoint.parts.length }})</p>
        </div>
  
        <!-- 结果展示 -->
        <div v-if="result" class="result-area">
          <h3>✅ 上传成功</h3>
          <div class="result-info">
            <p><strong>文件名:</strong> {{ result.fileName }}</p>
            <p><strong>OSS URL:</strong> <a :href="result.url" target="_blank">{{ result.url }}</a></p>
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
        uploader: null,
        
        // 新增状态管理
        status: 'idle', // idle, uploading, paused, success, error
        checkpoint: null, // 存储断点信息
        abortFn: null, // 👈 新增：保存 abort 句柄
        cancelHandle: null // 存储取消函数
      }
    },
    computed: {
      statusText() {
        const map = {
          idle: '待开始',
          uploading: '上传中...',
          paused: '已暂停 (支持续传)',
          success: '上传成功',
          error: '上传失败'
        }
        return map[this.status]
      }
    },
    created() {
      this.uploader = new AIOssUploader()
    },
    methods: {
      triggerFileInput() {
        if (this.status === 'uploading') return
        this.$refs.fileInput.click()
      },
      handleFileChange(e) {
        const file = e.target.files[0]
        if (file) {
          this.selectedFile = file
          this.resetState()
        }
      },
      resetState() {
        this.status = 'idle'
        this.progress = 0
        this.result = null
        this.checkpoint = null
        this.cancelHandle = null
      },
      async handleUpload() {
        if (!this.selectedFile) return

        this.loading = true
        this.status = 'uploading'
        this.result = null

        try {
            const res = await this.uploader.upload(this.selectedFile, this.bizCode, {
            checkpoint: this.checkpoint,
            onProgress: (p, cpt) => {
                this.progress = p
                this.checkpoint = cpt
            },
            // 这里接收 abort 函数
            onAbortHandler: (abortFn) => {
                console.log(abortFn,'abortFn')
                this.abortFn = abortFn
            }
            })

            this.result = res
            this.status = 'success'
            this.$message.success('文件上传完成！')
        } catch (error) {
            this.status = 'error'
            this.$message.error('上传出错: ' + (error.message || '未知错误'))
        } finally {
            this.loading = false
        }
    },
      handlePause() {
        if (this.abortFn && this.status === 'uploading') {
            this.abortFn()  // 调用 AIOssUploader 内部封装的 abortMultipartUpload
            .then(() => {
                this.status = 'error' // 或者你定义成 'paused'，但实际上这次上传已作废
                this.$message.warning('上传已中止')
            })
            .catch(err => {
                console.error('Abort failed:', err)
                this.$message.error('中止上传失败')
            })
        }
      },
      reset() {
        this.selectedFile = null
        this.resetState()
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
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 640px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  
    h2 { margin: 0 0 8px; color: #303133; }
    .desc { color: #909399; font-size: 14px; margin-bottom: 32px; }
  }
  
  .form-item {
    margin-bottom: 24px;
    label { display: block; margin-bottom: 10px; font-weight: 600; color: #606266; }
  }
  
  .upload-area {
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { border-color: #409eff; background: #f0f7ff; }
    i { font-size: 40px; color: #c0c4cc; margin-bottom: 12px; }
    .file-name { font-weight: bold; color: #409eff; margin-bottom: 4px; }
    .file-size { font-size: 12px; color: #909399; }
  }
  
  .actions { margin-top: 32px; display: flex; gap: 12px; }
  
  .progress-wrap {
    margin-top: 32px;
    .status-text {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
    }
    .progress-bar {
      height: 10px;
      background: #ebeef5;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-inner {
      height: 100%;
      background: #409eff;
      transition: width 0.3s;
      &.paused { background: #e6a23c; }
      &.success { background: #67c23a; }
      &.error { background: #f56c6c; }
    }
    .cpt-hint {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      font-style: italic;
    }
  }
  
  .result-area {
    margin-top: 32px;
    padding: 20px;
    background: #f0f9eb;
    border-radius: 8px;
    border: 1px solid #e1f3d8;
    h3 { color: #67c23a; margin-top: 0; }
    .result-info { font-size: 13px; p { margin: 6px 0; word-break: break-all; } a { color: #409eff; } }
  }
  </style>
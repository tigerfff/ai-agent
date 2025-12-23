<template>
  <div class="oss-x-container">
    <div class="demo-card">
      <h2>AIOssUploader 多文件分片上传模拟</h2>
      <p class="desc">支持：分片上传、多文件并发、进度回显、暂停/取消、断点续传</p>

      <div class="form-item">
        <label>业务编码 (bizCode):</label>
        <el-input v-model="bizCode" placeholder="请输入 bizCode" :disabled="loading"></el-input>
      </div>

      <div class="form-item">
        <label>选择文件（可多选，建议 > 5MB 测试分片）:</label>
        <div class="upload-area" @click="triggerFileInput">
          <i class="el-icon-upload"></i>
          <p v-if="files.length === 0">点击选择文件</p>
          <div v-else class="file-list">
            <p class="file-count">已选择 {{ files.length }} 个文件</p>
            <div v-for="(file, idx) in files" :key="idx" class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
              <span class="file-status" :class="fileStatuses[idx]">{{ getFileStatusText(fileStatuses[idx]) }}</span>
            </div>
          </div>
        </div>
        <input 
          type="file" 
          ref="fileInput" 
          style="display: none" 
          multiple
          @change="handleFileChange"
        />
      </div>

      <div class="actions">
        <el-button 
          type="primary" 
          :loading="loading" 
          @click="handleMultiUpload" 
          :disabled="files.length === 0 || loading || hasUploading"
        >
          开始批量上传
        </el-button>

        <el-button 
          type="warning" 
          @click="handlePauseAll" 
          :disabled="!hasUploading"
        >
          暂停所有
        </el-button>

        <el-button @click="reset">重置</el-button>
      </div>

      <!-- 每个文件的进度条 -->
      <div v-if="files.length > 0 && (hasUploading || hasProgress)" class="progress-wrap">
        <div 
          v-for="(file, idx) in files" 
          :key="idx" 
          class="file-progress-row"
        >
          <div class="status-text">
            <span class="file-name-text">{{ file.name }}</span>
            <span>{{ progresses[idx] || 0 }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-inner" 
              :class="fileStatuses[idx]"
              :style="{ width: (progresses[idx] || 0) + '%' }"
            ></div>
          </div>
          <div class="file-actions" v-if="fileStatuses[idx] === 'uploading'">
            <el-button 
              size="mini" 
              type="warning" 
              @click="handlePauseOne(idx)"
            >
              暂停
            </el-button>
          </div>
        </div>
      </div>

      <!-- 结果汇总 -->
      <div v-if="results.length > 0" class="result-area">
        <h3>上传结果汇总</h3>
        <div class="result-list">
          <div 
            v-for="(result, idx) in results" 
            :key="idx" 
            class="result-item"
            :class="{ success: result.status === 'fulfilled', error: result.status === 'rejected' }"
          >
            <div class="result-header">
              <strong>{{ files[idx].name }}</strong>
              <span class="result-status">
                {{ result.status === 'fulfilled' ? '✅ 成功' : '❌ 失败' }}
              </span>
            </div>
            <div v-if="result.status === 'fulfilled' && result.value" class="result-info">
              <p><strong>OSS URL:</strong> <a :href="result.value.url" target="_blank">{{ result.value.url }}</a></p>
            </div>
            <div v-else-if="result.status === 'rejected'" class="result-info">
              <p><strong>错误:</strong> {{ result.reason?.message || '未知错误' }}</p>
            </div>
          </div>
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
      files: [],
      loading: false,
      progresses: [],        // 每个文件的进度 0-100
      fileStatuses: [],      // 每个文件的状态：idle/uploading/success/error
      abortMap: new Map(),   // index -> abortFn 映射
      results: [],           // 上传结果（Promise.allSettled 的返回值）
      uploader: null
    }
  },
  computed: {
    hasUploading() {
      return this.fileStatuses.some(s => s === 'uploading')
    },
    hasProgress() {
      return this.progresses.some(p => p > 0)
    }
  },
  created() {
    this.uploader = new AIOssUploader()
  },
  methods: {
    getFileStatusText(status) {
      const map = {
        idle: '待上传',
        uploading: '上传中...',
        success: '上传成功',
        error: '上传失败',
        paused: '已暂停'
      }
      return map[status] || '待上传'
    },
    triggerFileInput() {
      if (this.loading || this.hasUploading) return
      this.$refs.fileInput.click()
    },
    handleFileChange(e) {
      const fileList = Array.from(e.target.files || [])
      if (fileList.length > 0) {
        this.files = fileList
        this.progresses = fileList.map(() => 0)
        this.fileStatuses = fileList.map(() => 'idle')
        this.abortMap.clear()
        this.results = []
      }
    },
    async handleMultiUpload() {
      if (this.files.length === 0) return

      this.loading = true
      this.fileStatuses = this.files.map(() => 'uploading')
      this.progresses = this.files.map(() => 0)
      this.results = []

      try {
        const results = await this.uploader.uploadMultiple(this.files, this.bizCode, {
          onItemProgress: (index, percent, checkpoint) => {
            this.$set(this.progresses, index, percent)
            // checkpoint 可以保存起来用于断点续传（当前示例暂不处理）
          },
          onItemCancelTask: (index, abortFn) => {
            this.abortMap.set(index, abortFn)
          }
        })

        // 处理每个文件的结果
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            this.$set(this.fileStatuses, idx, 'success')
          } else {
            this.$set(this.fileStatuses, idx, 'error')
          }
        })

        this.results = results

        const successCount = results.filter(r => r.status === 'fulfilled').length
        this.$message.success(`上传完成！成功: ${successCount}/${this.files.length}`)
      } catch (error) {
        console.error('批量上传异常:', error)
        this.$message.error('批量上传出错: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    // 暂停单个文件
    async handlePauseOne(index) {
      const abortFn = this.abortMap.get(index)
      if (abortFn && this.fileStatuses[index] === 'uploading') {
        try {
          await abortFn()
          this.$set(this.fileStatuses, index, 'error')
          this.abortMap.delete(index)
          this.$message.warning(`文件 "${this.files[index].name}" 上传已中止`)
        } catch (err) {
          console.error('Abort failed:', err)
          this.$message.error('中止上传失败')
        }
      }
    },
    // 暂停所有正在上传的文件
    async handlePauseAll() {
      const tasks = []
      this.abortMap.forEach((abortFn, idx) => {
        if (this.fileStatuses[idx] === 'uploading') {
          tasks.push(
            abortFn().then(() => {
              this.$set(this.fileStatuses, idx, 'error')
              this.$message.warning(`文件 "${this.files[idx].name}" 已中止`)
            }).catch(err => {
              console.error(`Abort file ${idx} failed:`, err)
            })
          )
        }
      })

      if (tasks.length > 0) {
        await Promise.allSettled(tasks)
        this.abortMap.clear()
        this.$message.warning('所有上传已中止')
      }
    },
    reset() {
      this.files = []
      this.progresses = []
      this.fileStatuses = []
      this.abortMap.clear()
      this.results = []
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
  max-width: 800px;
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
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  &:hover { border-color: #409eff; background: #f0f7ff; }
  i { font-size: 40px; color: #c0c4cc; margin-bottom: 12px; }
  
  .file-list {
    text-align: left;
    .file-count {
      font-weight: bold;
      color: #409eff;
      margin-bottom: 12px;
      text-align: center;
    }
    .file-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      margin-bottom: 4px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 13px;
      
      .file-name {
        flex: 1;
        color: #303133;
        word-break: break-all;
      }
      .file-size {
        color: #909399;
        white-space: nowrap;
      }
      .file-status {
        white-space: nowrap;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        
        &.idle { background: #e4e7ed; color: #606266; }
        &.uploading { background: #ecf5ff; color: #409eff; }
        &.success { background: #f0f9eb; color: #67c23a; }
        &.error { background: #fef0f0; color: #f56c6c; }
      }
    }
  }
}

.actions { 
  margin-top: 32px; 
  display: flex; 
  gap: 12px; 
}

.progress-wrap {
  margin-top: 32px;
  
  .file-progress-row {
    margin-bottom: 16px;
    padding: 12px;
    background: #fafafa;
    border-radius: 6px;
    
    .status-text {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: #606266;
      
      .file-name-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 12px;
      }
    }
    
    .progress-bar {
      height: 8px;
      background: #ebeef5;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .progress-inner {
      height: 100%;
      background: #409eff;
      transition: width 0.3s;
      
      &.uploading { background: #409eff; }
      &.success { background: #67c23a; }
      &.error { background: #f56c6c; }
    }
    
    .file-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }
  }
}

.result-area {
  margin-top: 32px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  
  h3 { 
    margin-top: 0; 
    margin-bottom: 16px;
    color: #303133; 
  }
  
  .result-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .result-item {
      padding: 12px;
      background: #fff;
      border-radius: 6px;
      border: 1px solid #e4e7ed;
      
      &.success {
        border-color: #e1f3d8;
        background: #f0f9eb;
      }
      
      &.error {
        border-color: #fde2e2;
        background: #fef0f0;
      }
      
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        strong {
          flex: 1;
          color: #303133;
          word-break: break-all;
        }
        
        .result-status {
          margin-left: 12px;
          font-size: 12px;
          white-space: nowrap;
        }
      }
      
      .result-info {
        font-size: 13px;
        color: #606266;
        
        p {
          margin: 4px 0;
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
    }
  }
}
</style>

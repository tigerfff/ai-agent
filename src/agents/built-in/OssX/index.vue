<template>
    <div class="oss-x-container">
      <div class="demo-card">
        <h2>AIOssUploader 上传模拟</h2>
        <p class="desc">支持：单文件 / 多文件 分片上传、进度回显、暂停/取消、externalEncrypt 等</p>
  
        <!-- 上传模式切换 -->
        <div class="form-item">
          <label>上传模式：</label>
          <el-radio-group v-model="mode" :disabled="loading">
            <el-radio label="single">单文件上传</el-radio>
            <el-radio label="multi">多文件上传</el-radio>
          </el-radio-group>
        </div>
  
        <div class="form-item">
          <label>业务编码 (bizCode):</label>
          <el-input v-model="bizCode" placeholder="请输入 bizCode" :disabled="loading"></el-input>
        </div>
  
        <!-- externalEncrypt 开关 -->
        <div class="form-item">
          <el-checkbox v-model="useExternalEncrypt">
            使用 externalEncrypt（模拟旧加密逻辑）
          </el-checkbox>
        </div>
  
        <!-- 单文件上传区域 -->
        <template v-if="mode === 'single'">
          <div class="form-item">
            <label>选择文件（单个）:</label>
            <div class="upload-area" @click="triggerSingleInput">
              <i class="el-icon-upload"></i>
              <p v-if="!singleFile">点击选择文件</p>
              <div v-else>
                <p class="file-name">{{ singleFile.name }}</p>
                <p class="file-size">({{ (singleFile.size / 1024 / 1024).toFixed(2) }} MB)</p>
              </div>
            </div>
            <input
              type="file"
              ref="singleInput"
              style="display: none"
              @change="handleSingleFileChange"
            />
          </div>
  
          <div class="actions">
            <el-button
              type="primary"
              :loading="loading"
              @click="handleSingleUpload"
              :disabled="!singleFile || loading || singleStatus === 'uploading'"
            >
              开始上传
            </el-button>
  
            <el-button
              type="warning"
              @click="handleSinglePause"
              :disabled="singleStatus !== 'uploading' || !singleAbortFn"
            >
              暂停
            </el-button>
  
            <el-button @click="resetSingle">重置</el-button>
          </div>
  
          <div v-if="singleFile && (singleProgress > 0 || singleStatus !== 'idle')" class="progress-wrap">
            <div class="file-progress-row">
              <div class="status-text">
                <span class="file-name-text">{{ singleFile.name }}</span>
                <span>{{ singleProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-inner"
                  :class="singleStatus"
                  :style="{ width: singleProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>
  
          <div v-if="singleResult" class="result-area">
            <h3>单文件上传结果</h3>
            <div class="result-list">
              <div class="result-item success">
                <div class="result-header">
                  <strong>{{ singleFile?.name }}</strong>
                  <span class="result-status">✅ 成功</span>
                </div>
                <div class="result-info">
                  <p><strong>OSS URL:</strong> <a :href="singleResult.url" target="_blank">{{ singleResult.url }}</a></p>
                </div>
              </div>
            </div>
          </div>
        </template>
  
        <!-- 多文件上传区域 -->
        <template v-else>
          <div class="form-item">
            <label>选择文件（可多选，建议 > 5MB 测试分片）:</label>
            <div class="upload-area" @click="triggerMultiInput">
              <i class="el-icon-upload"></i>
              <p v-if="files.length === 0">点击选择文件</p>
              <div v-else class="file-list">
                <p class="file-count">已选择 {{ files.length }} 个文件</p>
                <div v-for="(file, idx) in files" :key="idx" class="file-item">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ (file.size / 1024 / 1024).toFixed(2) }} MB)</span>
                  <span class="file-status" :class="fileStatuses[idx]">
                    {{ getFileStatusText(fileStatuses[idx]) }}
                  </span>
                </div>
              </div>
            </div>
            <input
              type="file"
              ref="multiInput"
              style="display: none"
              multiple
              @change="handleMultiFileChange"
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
  
            <el-button @click="resetMulti">重置</el-button>
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
  
          <!-- 多文件结果汇总 -->
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
        </template>
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
        mode: 'single',           // 'single' | 'multi'
        useExternalEncrypt: false,
  
        // 单文件
        singleFile: null,
        singleProgress: 0,
        singleStatus: 'idle',     // idle/uploading/success/error
        singleResult: null,
        singleAbortFn: null,
  
        // 多文件
        files: [],
        loading: false,
        progresses: [],
        fileStatuses: [],
        abortMap: new Map(),
        results: [],
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
  
      /* 单文件相关 */
      triggerSingleInput() {
        if (this.loading) return
        this.$refs.singleInput.click()
      },
      handleSingleFileChange(e) {
        const file = e.target.files[0]
        if (file) {
          this.singleFile = file
          this.singleProgress = 0
          this.singleStatus = 'idle'
          this.singleResult = null
          this.singleAbortFn = null
        }
      },
      async handleSingleUpload() {
        if (!this.singleFile) return
  
        this.loading = true
        this.singleStatus = 'uploading'
        this.singleResult = null
  
        try {
          const res = await this.uploader.upload(this.singleFile, this.bizCode, {
            onProgress: (percent /*, checkpoint */) => {
              this.singleProgress = percent
            },
            onAbortHandler: (abortFn) => {
              this.singleAbortFn = abortFn
            },
            externalEncrypt: this.useExternalEncrypt
              ? async (rawFile, stsData) => {
                  // 这里可以接入真实的旧加密逻辑；当前仅演示 meta 格式
                  return {
                    encryptedFile: rawFile,
                    meta: {
                      'encrypted-version': String(stsData.kmsDataKey?.version || ''),
                      'encrypted-data-key': String(stsData.kmsDataKey?.dataKeyEncrypted || ''),
                      'sm4-supported': '0'
                    }
                  }
                }
              : undefined
          })
  
          this.singleResult = res
          this.singleStatus = 'success'
          this.$message.success('单文件上传完成！')
        } catch (e) {
          console.error('单文件上传失败', e)
          this.singleStatus = 'error'
          this.$message.error('单文件上传失败: ' + (e.message || '未知错误'))
        } finally {
          this.loading = false
        }
      },
      async handleSinglePause() {
        if (this.singleAbortFn && this.singleStatus === 'uploading') {
          try {
            await this.singleAbortFn()
            this.singleStatus = 'error'
            this.$message.warning(`文件 "${this.singleFile?.name}" 上传已中止`)
          } catch (e) {
            console.error('单文件中止失败', e)
            this.$message.error('单文件中止失败')
          }
        }
      },
      resetSingle() {
        this.singleFile = null
        this.singleProgress = 0
        this.singleStatus = 'idle'
        this.singleResult = null
        this.singleAbortFn = null
        if (this.$refs.singleInput) {
          this.$refs.singleInput.value = ''
        }
      },
  
      /* 多文件相关 */
      triggerMultiInput() {
        if (this.loading || this.hasUploading) return
        this.$refs.multiInput.click()
      },
      handleMultiFileChange(e) {
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
              // checkpoint 可用于断点续传（示例暂不使用）
            },
            onItemCancelTask: (index, abortFn) => {
              this.abortMap.set(index, abortFn)
            },
            externalEncrypt: this.useExternalEncrypt
              ? async (rawFile, stsData) => {
                  return {
                    encryptedFile: rawFile,
                    meta: {
                      'encrypted-version': String(stsData.kmsDataKey?.version || ''),
                      'encrypted-data-key': String(stsData.kmsDataKey?.dataKeyEncrypted || ''),
                      'sm4-supported': '0'
                    }
                  }
                }
              : undefined
          })
  
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
      resetMulti() {
        this.files = []
        this.progresses = []
        this.fileStatuses = []
        this.abortMap.clear()
        this.results = []
        if (this.$refs.multiInput) {
          this.$refs.multiInput.value = ''
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  /* 可以沿用你现有的样式，大致结构不变，这里略 */
  </style>
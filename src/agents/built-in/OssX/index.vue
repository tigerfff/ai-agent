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

        <!-- 断点续传功能开关（新功能） -->
        <div class="form-item">
          <el-checkbox v-model="enableResume">
            启用断点续传功能（暂停后可继续上传）
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

            <!-- 断点续传：继续上传按钮 -->
            <el-button
              v-if="enableResume"
              type="success"
              @click="handleSingleResume"
              :disabled="!singleFile || singleStatus !== 'paused' || loading"
            >
              继续上传
            </el-button>
  
            <el-button @click="resetSingle">重置</el-button>
          </div>
  
          <div v-if="singleFile && (singleProgress > 0 || singleStatus !== 'idle')" class="progress-wrap">
            <div class="file-progress-row">
              <div class="status-text">
                <span class="file-name-text">{{ singleFile.name }}</span>
                <span>{{ singleProgress }}%</span>
                <span v-if="enableResume && singleStatus === 'paused'" class="resume-tip">
                  （已暂停，可点击"继续上传"恢复）
                </span>
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
              <div class="file-actions">
                <!-- 暂停按钮 -->
                <el-button
                  v-if="fileStatuses[idx] === 'uploading'"
                  size="mini"
                  type="warning"
                  @click="handlePauseOne(idx)"
                >
                  暂停
                </el-button>
                <!-- 继续按钮（断点续传） -->
                <el-button
                  v-if="enableResume && fileStatuses[idx] === 'paused'"
                  size="mini"
                  type="success"
                  @click="handleResumeOne(idx)"
                >
                  继续
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
        enableResume: false,      // 断点续传功能开关（新功能）
  
        // 单文件
        singleFile: null,
        singleProgress: 0,
        singleStatus: 'idle',     // idle/uploading/success/error/paused
        singleResult: null,
        singleAbortFn: null,
        singlePauseFn: null,      // 暂停句柄（新功能）
        singleCheckpoint: null,   // 断点续传的 checkpoint（新功能）
  
        // 多文件
        files: [],
        loading: false,
        progresses: [],
        fileStatuses: [],
        abortMap: new Map(),
        pauseMap: new Map(),      // 暂停句柄 Map（新功能）
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

      /**
       * 生成文件的唯一标识（用于 localStorage key）
       */
      getFileKey(file, bizCode) {
        if (!file) return null
        // 使用文件名+大小+修改时间+bizCode 生成唯一key
        const lastModified = file.lastModified || Date.now()
        return `oss_upload_${bizCode}_${file.name}_${file.size}_${lastModified}`
      },

      /**
       * 保存 checkpoint 到 localStorage
       */
      saveCheckpoint(file, bizCode, checkpoint, progress) {
        if (!this.enableResume || !checkpoint) return
        try {
          const key = this.getFileKey(file, bizCode)
          if (key) {
            localStorage.setItem(key, JSON.stringify({
              checkpoint,
              progress: progress,
              timestamp: Date.now()
            }))
          }
        } catch (e) {
          console.warn('保存 checkpoint 失败:', e)
        }
      },

      /**
       * 从 localStorage 读取 checkpoint
       */
      loadCheckpoint(file, bizCode) {
        if (!this.enableResume || !file) return null
        try {
          const key = this.getFileKey(file, bizCode)
          if (!key) return null
          const data = localStorage.getItem(key)
          if (data) {
            const parsed = JSON.parse(data)
            // checkpoint 有效期 24 小时
            if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
              return parsed.checkpoint
            } else {
              localStorage.removeItem(key)
            }
          }
        } catch (e) {
          console.warn('读取 checkpoint 失败:', e)
        }
        return null
      },

      /**
       * 清除 checkpoint
       */
      clearCheckpoint(file, bizCode) {
        if (!file) return
        try {
          const key = this.getFileKey(file, bizCode)
          if (key) {
            localStorage.removeItem(key)
          }
        } catch (e) {
          console.warn('清除 checkpoint 失败:', e)
        }
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
          this.singleResult = null
          this.singleAbortFn = null
          
          // 如果启用断点续传，尝试加载之前的 checkpoint
          if (this.enableResume) {
            const savedCheckpoint = this.loadCheckpoint(file, this.bizCode)
            if (savedCheckpoint) {
              this.singleCheckpoint = savedCheckpoint
              this.singleStatus = 'paused'
              // 从 checkpoint 中恢复进度（如果有的话）
              if (savedCheckpoint.uploaded && savedCheckpoint.file) {
                const uploadedSize = savedCheckpoint.uploaded.reduce((sum, part) => sum + part.size, 0)
                this.singleProgress = Math.floor((uploadedSize / file.size) * 100)
              }
              this.$message.info('检测到未完成的上传，可以点击"继续上传"恢复')
            } else {
              this.singleProgress = 0
              this.singleStatus = 'idle'
              this.singleCheckpoint = null
            }
          } else {
            this.singleProgress = 0
            this.singleStatus = 'idle'
            this.singleCheckpoint = null
          }
        }
      },
      async handleSingleUpload() {
        if (!this.singleFile) return
  
        this.loading = true
        this.singleStatus = 'uploading'
        this.singleResult = null

        // 如果启用断点续传，尝试使用保存的 checkpoint
        const checkpoint = this.enableResume ? (this.singleCheckpoint || this.loadCheckpoint(this.singleFile, this.bizCode)) : null
  
        try {
          const res = await this.uploader.upload(this.singleFile, this.bizCode, {
            checkpoint: checkpoint, // 传入 checkpoint 实现断点续传
            onProgress: (percent, checkpoint) => {
              this.singleProgress = percent
              // 如果启用断点续传，保存最新的 checkpoint
              if (this.enableResume && checkpoint) {
                this.singleCheckpoint = checkpoint
                this.saveCheckpoint(this.singleFile, this.bizCode, checkpoint, percent)
              }
            },
            onAbortHandler: (abortFn) => {
              this.singleAbortFn = abortFn
            },
            onPauseHandler: (pauseFn) => {
              this.singlePauseFn = pauseFn
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

          console.log(res, "res");
          this.singleStatus = 'success'
          // 上传成功后清除 checkpoint
          if (this.enableResume) {
            this.clearCheckpoint(this.singleFile, this.bizCode)
            this.singleCheckpoint = null
          }
          this.$message.success('单文件上传完成！')
        } catch (e) {
          console.error('单文件上传失败', e)
          // 如果是用户主动取消，且启用断点续传，状态设为 paused
          if (this.enableResume && e.name === 'cancel') {
            this.singleStatus = 'paused'
            this.$message.warning('上传已暂停，可以点击"继续上传"恢复')
          } else {
            this.singleStatus = 'error'
            this.$message.error('单文件上传失败: ' + (e.message || '未知错误'))
          }
        } finally {
          this.loading = false
        }
      },
      async handleSinglePause() {
        if (this.singleStatus !== 'uploading') return

        try {
          // 如果启用断点续传，只调用暂停（取消请求），不调用中止（删除分片）
          if (this.enableResume && this.singlePauseFn) {
            this.singlePauseFn()
            this.singleStatus = 'paused'
            this.$message.warning(`文件 "${this.singleFile?.name}" 上传已暂停，分片已保留`)
          } else if (this.singleAbortFn) {
            // 普通模式或没有暂停句柄时，调用中止（会删除分片）
            await this.singleAbortFn()
            this.singleStatus = 'error'
            this.$message.warning(`文件 "${this.singleFile?.name}" 上传已中止`)
          }
        } catch (e) {
          console.error('暂停/中止失败', e)
          this.$message.error('操作失败')
        }
      },

      /**
       * 继续上传（断点续传功能）
       */
      async handleSingleResume() {
        if (!this.singleFile || this.singleStatus !== 'paused') return

        // 确保有 checkpoint
        if (!this.singleCheckpoint) {
          this.singleCheckpoint = this.loadCheckpoint(this.singleFile, this.bizCode)
        }

        if (!this.singleCheckpoint) {
          this.$message.warning('未找到断点信息，将重新开始上传')
          this.singleCheckpoint = null
          this.singleProgress = 0
          this.singleStatus = 'idle'
        }

        // 调用上传方法（会自动使用 checkpoint）
        await this.handleSingleUpload()
      },
      resetSingle() {
        // 清除 checkpoint
        if (this.singleFile && this.enableResume) {
          this.clearCheckpoint(this.singleFile, this.bizCode)
        }
        this.singleFile = null
        this.singleProgress = 0
        this.singleStatus = 'idle'
        this.singleResult = null
        this.singleAbortFn = null
        this.singlePauseFn = null
        this.singleCheckpoint = null
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
          this.abortMap.clear()
          this.pauseMap.clear()
          this.results = []

          // 初始化状态和进度，并检测断点
          const progresses = []
          const statuses = []
          
          fileList.forEach(file => {
            let savedCheckpoint = null
            if (this.enableResume) {
              savedCheckpoint = this.loadCheckpoint(file, this.bizCode)
            }

            if (savedCheckpoint) {
              const uploadedSize = savedCheckpoint.uploaded.reduce((sum, part) => sum + part.size, 0)
              progresses.push(Math.floor((uploadedSize / file.size) * 100))
              statuses.push('paused')
            } else {
              progresses.push(0)
              statuses.push('idle')
            }
          })

          this.progresses = progresses
          this.fileStatuses = statuses
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
              // 如果启用断点续传，保存 checkpoint
              if (this.enableResume && checkpoint) {
                this.saveCheckpoint(this.files[index], this.bizCode, checkpoint, percent)
              }
            },
            onItemCancelTask: (index, abortFn) => {
              this.abortMap.set(index, abortFn)
            },
            onItemPauseTask: (index, pauseFn) => {
              this.pauseMap.set(index, pauseFn)
            },
            onItemAbortTask: (index, abortFn) => {
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
        if (this.fileStatuses[index] !== 'uploading') return

        try {
          // 如果启用断点续传，只调用暂停（取消请求），不调用中止（删除分片）
          if (this.enableResume && this.pauseMap.has(index)) {
            const pauseFn = this.pauseMap.get(index)
            if (pauseFn) pauseFn()
            this.$set(this.fileStatuses, index, 'paused')
            this.$message.warning(`文件 "${this.files[index].name}" 已暂停，分片已保留`)
          } else {
            // 普通模式：调用中止（删除分片）
            const abortFn = this.abortMap.get(index)
            if (abortFn) {
              await abortFn()
              this.$set(this.fileStatuses, index, 'error')
              this.abortMap.delete(index)
              this.$message.warning(`文件 "${this.files[index].name}" 上传已中止`)
            }
          }
        } catch (err) {
          console.error('暂停/中止失败:', err)
          this.$message.error('操作失败')
        }
      },
      async handleResumeOne(index) {
        if (!this.files[index] || this.fileStatuses[index] !== 'paused') return

        const file = this.files[index]
        const checkpoint = this.loadCheckpoint(file, this.bizCode)

        this.$set(this.fileStatuses, index, 'uploading')

        try {
          const res = await this.uploader.upload(file, this.bizCode, {
            checkpoint: checkpoint,
            onProgress: (percent, checkpoint) => {
              this.$set(this.progresses, index, percent)
              if (this.enableResume && checkpoint) {
                this.saveCheckpoint(file, this.bizCode, checkpoint, percent)
              }
            },
            onAbortHandler: (abortFn) => {
              this.abortMap.set(index, abortFn)
            },
            onPauseHandler: (pauseFn) => {
              this.pauseMap.set(index, pauseFn)
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

          this.$set(this.fileStatuses, index, 'success')
          if (this.enableResume) {
            this.clearCheckpoint(file, this.bizCode)
          }
          this.$message.success(`文件 "${file.name}" 上传成功`)
        } catch (e) {
          console.error('继续上传失败', e)
          if (this.enableResume && e.name === 'cancel') {
            this.$set(this.fileStatuses, index, 'paused')
          } else {
            this.$set(this.fileStatuses, index, 'error')
            this.$message.error(`文件 "${file.name}" 上传失败`)
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
    .oss-x-container {
      padding: 20px;
      font-family: var(--ym-ai-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif);
    
      .demo-card {
        background: #fff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        max-width: 900px;
        margin: 0 auto;
    
        h2 {
          font-size: 20px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.9);
          margin: 0 0 8px 0;
        }
    
        .desc {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
    
        .form-item {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
    
          label {
            min-width: 120px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.7);
            flex-shrink: 0;
          }
    
          ::v-deep .el-input {
            flex: 1;
            max-width: 400px;
          }
    
          ::v-deep .el-radio-group {
            display: flex;
            gap: 16px;
          }
    
          ::v-deep .el-checkbox {
            font-size: 14px;
          }
        }
    
        .upload-area {
          border: 2px dashed #d9d9d9;
          border-radius: 6px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #fafafa;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
    
          &:hover {
            border-color: #409eff;
            background: #f0f9ff;
          }
    
          i {
            font-size: 48px;
            color: #8c939d;
            margin-bottom: 8px;
          }
    
          p {
            margin: 0;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
          }
    
          .file-name {
            font-weight: 500;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 4px;
          }
    
          .file-size {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
          }
    
          .file-list {
            width: 100%;
            text-align: left;
    
            .file-count {
              font-size: 14px;
              color: rgba(0, 0, 0, 0.7);
              margin-bottom: 12px;
              font-weight: 500;
            }
    
            .file-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 8px 12px;
              background: #fff;
              border-radius: 4px;
              margin-bottom: 8px;
              border: 1px solid #e4e7ed;
    
              .file-name {
                flex: 1;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.8);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
    
              .file-size {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.5);
                flex-shrink: 0;
              }
    
              .file-status {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 4px;
                flex-shrink: 0;
    
                &.idle {
                  color: #909399;
                  background: #f4f4f5;
                }
    
                &.uploading {
                  color: #409eff;
                  background: #ecf5ff;
                }
    
                &.success {
                  color: #67c23a;
                  background: #f0f9ff;
                }
    
                &.error {
                  color: #f56c6c;
                  background: #fef0f0;
                }
    
                &.paused {
                  color: #e6a23c;
                  background: #fdf6ec;
                }
              }
            }
          }
        }
    
        .actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
          margin-bottom: 20px;
        }
    
        .progress-wrap {
          margin-top: 20px;
          margin-bottom: 20px;
    
          .file-progress-row {
            margin-bottom: 16px;
            padding: 12px;
            background: #f5f7fa;
            border-radius: 6px;
    
            .status-text {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              font-size: 14px;
    
              .file-name-text {
                flex: 1;
                color: rgba(0, 0, 0, 0.8);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-right: 12px;
              }
    
              span:last-child {
                color: #409eff;
                font-weight: 500;
                flex-shrink: 0;
              }

              .resume-tip {
                font-size: 12px;
                color: #e6a23c;
                margin-left: 8px;
                font-style: italic;
                flex-shrink: 0;
              }
            }
    
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #e4e7ed;
              border-radius: 4px;
              overflow: hidden;
              position: relative;
    
              .progress-inner {
                height: 100%;
                background: #409eff;
                transition: width 0.3s;
                border-radius: 4px;
    
                &.uploading {
                  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
                  animation: progress-stripes 1s linear infinite;
                }
    
                &.success {
                  background: #67c23a;
                }
    
                &.error {
                  background: #f56c6c;
                }
    
                &.paused {
                  background: #e6a23c;
                }
              }
            }
    
            .file-actions {
              margin-top: 8px;
              display: flex;
              justify-content: flex-end;
            }
          }
        }
    
        .result-area {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e4e7ed;
    
          h3 {
            font-size: 16px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.9);
            margin: 0 0 16px 0;
          }
    
          .result-list {
            .result-item {
              padding: 16px;
              border-radius: 6px;
              margin-bottom: 12px;
              border: 1px solid #e4e7ed;
              background: #fafafa;
    
              &.success {
                border-color: #b3e19d;
                background: #f0f9ff;
              }
    
              &.error {
                border-color: #fbc4c4;
                background: #fef0f0;
              }
    
              .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
    
                strong {
                  font-size: 14px;
                  color: rgba(0, 0, 0, 0.8);
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  margin-right: 12px;
                }
    
                .result-status {
                  font-size: 14px;
                  flex-shrink: 0;
                }
              }
    
              .result-info {
                font-size: 13px;
                color: rgba(0, 0, 0, 0.7);
                line-height: 1.6;
    
                p {
                  margin: 4px 0;
    
                  strong {
                    color: rgba(0, 0, 0, 0.8);
                    margin-right: 8px;
                  }
    
                  a {
                    color: #409eff;
                    text-decoration: none;
                    word-break: break-all;
    
                    &:hover {
                      text-decoration: underline;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    @keyframes progress-stripes {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: 20px 0;
      }
    }
    </style>
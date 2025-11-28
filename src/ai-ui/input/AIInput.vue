<template>
  <div class="ai-input-container">
    <div class="el-sender-wrap">
      <div 
        class="el-sender" 
        :class="{ 'el-sender-disabled': disabled, 'focused': isFocused }"
      >
        <!-- 头部容器：用于显示文件预览 -->
        <transition name="slide">
          <div v-show="hasAttachments" class="el-sender-header-wrap">
            <div class="el-sender-header">
              <!-- 使用 Attachments 组件替换原预览层 -->
              <AIAttachments 
                ref="attachments"
                v-model="fileList"
              />
            </div>
          </div>
        </transition>

        <!-- 内容容器 -->
        <div class="el-sender-content" @click="focusInput">
          <!-- 前缀 -->
          <div class="el-sender-prefix" v-if="$slots.prefix">
            <slot name="prefix"></slot>
          </div>

          <!-- 输入框 -->
          <div class="el-sender-input">
            <textarea
              ref="textarea"
              :value="inputValue"
              class="ai-textarea"
              :placeholder="placeholder"
              :rows="1"
              :disabled="disabled"
              @input="handleInput"
              @focus="handleFocus"
              @blur="handleBlur"
              @keydown="handleKeyDown"
              @paste="handlePaste"
            ></textarea>
          </div>

          <!-- 操作列表 -->
          <div class="el-sender-action-list">
            <div class="el-sender-action-list-presets">
              
              <!-- 发送/停止按钮 -->
              <div 
                v-if="loading"
                class="action-btn stop-btn"
                @click="stopGeneration"
                title="停止生成"
              >
                <span>■</span>
              </div>
              
              <div 
                v-else
                class="action-btn send-btn" 
                :class="{ 'disabled': isSubmitDisabled }"
                @click="submit"
                title="发送"
              >
                <span>➤</span>
              </div>

              <!-- 语音按钮 -->
              <div 
                class="action-btn speech-btn" 
                :class="{ 'recording': isRecording }"
                @click="toggleRecord"
                title="语音输入"
              >
                <span>{{ isRecording ? '■' : '🎤' }}</span>
              </div>

              <!-- 上传按钮 (自定义增加) -->
              <div class="action-btn upload-btn" @click="triggerUpload" title="上传文件">
                <span>📎</span>
                <input 
                  type="file" 
                  ref="fileInput" 
                  style="display: none" 
                  multiple 
                  @change="handleFileChange"
                />
              </div>

              <!-- 清空按钮 -->
              <div 
                class="action-btn clear-btn" 
                v-if="inputValue || hasAttachments"
                @click="clear"
                title="清空"
              >
                <span>✕</span>
              </div>

            </div>
          </div>
        </div>

        <!-- 底部容器 -->
        <div v-if="$slots.footer" class="el-sender-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
    
    <!-- 字符计数 -->
    <div class="char-count" v-if="maxLength">
      {{ inputValue.length }}/{{ maxLength }}
    </div>
  </div>
</template>

<script>
import { SpeechRecognizer } from '@/ai-core/audio/SpeechRecognizer';
import AIAttachments from '@/ai-ui/attachments/AIAttachments.vue';

export default {
  name: 'AIInput',
  components: {
    AIAttachments
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: 2000
    },
    submitType: {
      type: String,
      default: 'enter' // 'enter' | 'shiftEnter'
    },
    // 必须传入生成签名的函数
    asrUrlGenerator: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      inputValue: this.value,
      fileList: [], // 用于 v-model 绑定 AIAttachments
      isFocused: false,
      isRecording: false,
      recognizer: null
    };
  },
  watch: {
    value(val) {
      this.inputValue = val;
    },
    inputValue(val) {
      this.$emit('input', val);
      this.$nextTick(this.adjustHeight);
    }
  },
  computed: {
    hasAttachments() {
      return this.fileList && this.fileList.length > 0;
    },
    isSubmitDisabled() {
      return (
        this.disabled || 
        this.loading || 
        (!this.inputValue.trim() && !this.hasAttachments)
      );
    }
  },
  mounted() {
    // 初始化录音实例
    this.recognizer = new SpeechRecognizer({
      onText: (text, isFinal) => {
        if (isFinal) {
           this.inputValue += text;
           // 保持焦点在最后
           this.$nextTick(() => {
             this.adjustHeight();
             this.focusToEnd();
           });
        }
      },
      onStop: () => {
        this.isRecording = false;
      },
      onError: (err) => {
        console.error('ASR Error:', err);
        this.isRecording = false;
        // 这里可以触发一个 $message.error
      }
    });
    
    this.adjustHeight();
  },
  beforeDestroy() {
    if (this.recognizer) {
      this.recognizer.stop();
    }
  },
  methods: {
    /* --- 输入框逻辑 --- */
    handleInput(e) {
      this.inputValue = e.target.value;
    },
    
    handleFocus() {
      this.isFocused = true;
    },
    
    handleBlur() {
      this.isFocused = false;
    },

    focusInput() {
      this.$refs.textarea.focus();
    },

    focusToEnd() {
      const el = this.$refs.textarea;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    },

    adjustHeight() {
      const textarea = this.$refs.textarea;
      textarea.style.height = 'auto';
      // max-height: 300px via CSS
      textarea.style.height = textarea.scrollHeight + 'px';
    },

    handleKeyDown(e) {
      if (e.keyCode === 13) { // Enter
        // 如果是 shift+enter，默认换行，不需要阻止
        if (this.submitType === 'enter' && !e.shiftKey) {
          e.preventDefault();
          this.submit();
        } else if (this.submitType === 'shiftEnter' && e.shiftKey) {
          e.preventDefault();
          this.submit();
        }
      }
    },

    handlePaste(e) {
      const files = e.clipboardData?.files;
      if (files?.length) {
        e.preventDefault();
        this.processFiles(Array.from(files));
      }
    },

    clear() {
      this.inputValue = '';
      this.fileList = []; // 直接清空本地数据
      this.adjustHeight();
      this.$emit('clear');
    },

    /* --- 文件上传逻辑 --- */
    triggerUpload() {
      this.$refs.fileInput.click();
    },

    handleFileChange(e) {
      this.processFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset
    },

    processFiles(files) {
      files.forEach(file => {
        const item = {
          uid: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: this.getFileType(file),
          rawFile: file,
          url: '',
          status: 'done',
          percent: 100
        };
        this.fileList.push(item);
      });
    },

    getFileType(file) {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      return 'file';
    },

    /* --- 录音逻辑 --- */
    async toggleRecord() {
      if (this.isRecording) {
        this.recognizer.stop();
      } else {
        if (!this.asrUrlGenerator) {
          // console.warn('No asrUrlGenerator provided');
        }
        
        try {
          const url = this.asrUrlGenerator ? await this.asrUrlGenerator() : '';
          this.isRecording = true;
          this.recognizer.start(url);
        } catch (e) {
          console.error('Failed to start recording:', e);
          this.isRecording = false;
        }
      }
    },

    /* --- 提交与停止 --- */
    submit() {
      if (this.isSubmitDisabled) return;

      const data = {
        text: this.inputValue,
        attachments: this.fileList // 直接使用 AIAttachments 同步过来的列表
      };

      this.$emit('send', data); 
      this.$emit('submit', data.text);

      this.clear();
    },

    stopGeneration() {
      this.$emit('stop');
    }
  }
};
</script>

<style scoped>
/* 移植并简化 Sender 样式 */
.ai-input-container {
  width: 100%;
  position: relative;
}

.el-sender-wrap {
  width: 100%;
  cursor: text;
}

.el-sender {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  background: #fff;
  border-radius: 12px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s;
}

.el-sender.focused {
  box-shadow: 0 0 0 1px #409eff;
  border-color: #409eff;
}

.el-sender-disabled {
  background-color: #f5f7fa;
  pointer-events: none;
  opacity: 0.6;
}

/* Header & Preview */
.el-sender-header-wrap {
  border-bottom: 1px solid #ebeef5;
  overflow: hidden;
}

.el-sender-header {
  padding: 8px 12px;
}

/* Content */
.el-sender-content {
  display: flex;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  align-items: flex-end;
}

.el-sender-prefix {
  flex: none;
}

.el-sender-input {
  flex: 1;
  display: flex;
  align-items: center;
}

.ai-textarea {
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  max-height: 176px; /* Sender 默认最大高度 */
  overflow-y: auto;
  padding: 0;
  background: transparent;
  font-family: inherit;
}

.ai-textarea::placeholder {
  color: #c0c4cc;
}

/* Action List */
.el-sender-action-list-presets {
  display: flex;
  gap: 8px;
  flex-direction: row-reverse; /* 按钮右对齐 */
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  font-size: 16px;
}

.action-btn:hover {
  background-color: #f2f6fc;
  color: #409eff;
}

.send-btn {
  background-color: #409eff;
  color: #fff;
  border-radius: 8px; /* Sender 风格圆角 */
}

.send-btn:hover {
  background-color: #66b1ff;
  color: #fff;
}

.send-btn.disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
  opacity: 0.7;
}

.stop-btn {
  background-color: #f56c6c;
  color: #fff;
  border-radius: 8px;
  font-size: 12px;
}

.stop-btn:hover {
  background-color: #ff7875;
  color: #fff;
}

.speech-btn.recording {
  color: #f56c6c;
  background-color: #fef0f0;
  animation: pulse 1.5s infinite;
}

.loading-spinner {
  animation: rotate 1s linear infinite;
  display: inline-block;
}

/* Footer */
.el-sender-footer {
  border-top: 1px solid #ebeef5;
  padding: 8px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding-right: 4px;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
  max-height: 300px;
}

.slide-enter,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
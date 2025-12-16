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
                :card-mode="attachmentCardMode"
                overflow="scrollY"
              />
            </div>
          </div>
        </transition>

        <!-- 内容容器 -->
        <div class="el-sender-content" @click="focusInput">
          <div class="input-row">
          <!-- 前缀 -->
            <div class="el-sender-prefix">
              <slot name="prefix">
                <img v-show="!(isFocused || inputValue.length > 0)" :src="starIcon" alt="星星" class="prefix-star-icon" />
              </slot>
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
          </div>

          <!-- 操作列表 -->
          <div class="el-sender-action-list">
            <!-- 左侧操作区：上传 & 计数 -->
            <div class="action-left">
              <!-- 上传按钮（带下拉菜单） -->
              <div v-if="showUploadButton" class="upload-btn-wrapper">
                <div 
                  class="action-btn upload-btn" 
                  :class="{ 'disabled': disableUploadButton }"
                  @click="!disableUploadButton && handleUploadClick()" 
                  title="上传文件"
                >
                  <img :src="attachmentIcon" alt="上传文件" class="icon-img" />
                </div>
                
                <!-- 下拉菜单（仅在支持多种类型时显示，或有自定义菜单项时显示） -->
                <div 
                  v-if="(!isSingleTypeOnly || visibleCustomMenuItems.length > 0) && showUploadMenu" 
                  class="upload-menu"
                  @click.stop
                >
                  <div 
                    v-if="parsedAllowedTypes.image"
                    class="menu-item"
                    @click="selectFileType('image')"
                  >
                    <img :src="imageIcon" alt="图片" class="menu-icon" />
                    <span>图片</span>
                  </div>
                  <div 
                    v-if="parsedAllowedTypes.video"
                    class="menu-item"
                    @click="selectFileType('video')"
                  >
                    <img :src="imageIcon" alt="视频" class="menu-icon" />
                    <span>视频</span>
                  </div>
                  <div 
                    v-if="parsedAllowedTypes.document"
                    class="menu-item"
                    @click="selectFileType('document')"
                  >
                    <img :src="documentIcon" alt="文档" class="menu-icon" />
                    <span>文档</span>
                  </div>
                  
                  <!-- 分隔线（如果有文件类型选项和自定义菜单项） -->
                  <div 
                    v-if="hasFileTypeOptions && visibleCustomMenuItems.length > 0"
                    class="menu-divider"
                  ></div>
                  
                  <!-- 自定义菜单项 -->
                  <div
                    v-for="item in visibleCustomMenuItems"
                    :key="item.key"
                    class="menu-item"
                    :class="{ 'disabled': item.disabled }"
                    @click="!item.disabled && handleCustomMenuItemClick(item)"
                  >
                    <img v-if="item.iconSrc" :src="item.iconSrc" alt="" class="menu-icon" />
                    <span>{{ item.label }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 隐藏的文件输入 -->
              <input 
                type="file" 
                ref="fileInput" 
                style="display: none" 
                multiple 
                @change="handleFileChange"
              />
              
              <div class="char-count" v-if="maxLength">
                {{ inputValue.length }}/{{ maxLength }}
              </div>
            </div>

            <!-- 右侧操作区：清空 & 语音 & 发送 & 自定义按钮 -->
            <div class="action-right">
              <!-- 清空按钮 -->
              <div 
                v-if="showClearButton"
                class="action-btn clear-btn" 
                :class="{ 'disabled': disableClearButton }"
                @click="!disableClearButton && clear()"
                title="清空"
              >
                <i class="h-icon-close_f" style="font-size: 32px;"></i>
              </div>

              <!-- 语音按钮 -->
              <div 
                v-if="showSpeechButton"
                class="action-btn speech-btn" 
                :class="{ 'recording': isRecording, 'disabled': disableSpeechButton }"
                @click="!disableSpeechButton && toggleRecord()"
                title="语音输入"
              >
                <img 
                  v-if="!isRecording" 
                  :src="voiceIcon" 
                  alt="语音输入" 
                  class="icon-img" 
                />
                <img 
                  v-else 
                  :src="pauseIcon" 
                  alt="停止录音" 
                  class="icon-img" 
                />
              </div>

              <!-- 停止按钮 -->
              <div 
                v-if="showStopButton"
                class="action-btn stop-btn"
                :class="{ 'disabled': disableStopButton }"
                @click="!disableStopButton && stopGeneration()"
                title="停止生成"
              >
                <img :src="pauseIcon" alt="停止生成" class="icon-img" />
              </div>
              
              <!-- 发送按钮 -->
              <div 
                v-if="showSendButton"
                class="action-btn send-btn" 
                :class="{ 'disabled': disableSendButton }"
                @click="!disableSendButton && submit()"
                title="发送"
              >
                <img 
                  :src="disableSendButton ? sendDisabledIcon : sendIcon" 
                  alt="发送" 
                  class="icon-img" 
                />
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
    
  </div>
</template>

<script>
import { SpeechRecognizerWrapper } from '@/ai-core/audio/SpeechRecognizer';
import AIAttachments from '@/ai-ui/attachments/AIAttachments.vue';

// 导入图标资源
import attachmentIcon from '@svg/attachment.svg';
import deleteIcon from '@svg/delete.svg';
import voiceIcon from '@svg/voice.svg';
import pauseIcon from '@images/pause@3x.png';
import sendIcon from '@images/send-msg.png';
import sendDisabledIcon from '@images/send_msg_disabled.png';
import imageIcon from '@svg/image.svg';
import documentIcon from '@svg/document.svg';
import starIcon from '@images/star@3x.png';

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
    // 提供语音识别配置: async () => ({ secretId, secretKey, appId })
    speechConfigProvider: {
      type: Function,
      default: null
    },
    /**
     * 预上传钩子：在文件进入附件列表前触发
     * async (rawFiles: File[]) => Promise<UploadedItem[]>
     * UploadedItem: { url, name, size, type, rawFile? }
     */
    beforeAddAttachments: {
      type: Function,
      default: null
    },
    /**
     * 允许的文件类型配置
     * 格式1: 字符串，如 ".jpg,.jpeg,.png,.mp4" (兼容旧版 accepts)
     * 格式2: 对象，如 { image: true, video: true, document: true }
     * 格式3: 数组，如 ['image', 'video'] 或 ['image'] (单一类型)
     */
    allowedTypes: {
      type: [String, Object, Array],
      default: null
    },
    /**
     * 兼容旧版：文件类型限制（字符串格式）
     * 如果提供了 allowedTypes，则优先使用 allowedTypes
     */
    accepts: {
      type: String,
      default: null
    },
    /**
     * 单一类型模式：如果为 true，一旦选择了某种类型，就只能继续选择该类型
     * 例如：传了视频后，就不能再传图片或文档
     */
    singleTypeMode: {
      type: Boolean,
      default: false
    },
    /**
     * 最大文件大小（字节）
     */
    maxSize: {
      type: Number,
      default: null
    },
    /**
     * 按钮配置对象，控制按钮的显示/隐藏和禁用
     * {
     *   upload: { visible: true, disabled: false },
     *   clear: { visible: true, disabled: false },
     *   speech: { visible: true, disabled: false },
     *   stop: { visible: true, disabled: false },
     *   send: { visible: true, disabled: false }
     * }
     */
    buttonConfig: {
      type: Object,
      default: () => ({})
    },
    /**
     * 发送按钮是否禁用（快速控制，优先级高于 buttonConfig）
     */
    sendDisabled: {
      type: Boolean,
      default: null
    },
    /**
     * 发送前钩子，用于校验或拦截
     * 返回 false 或 Promise.reject 则中断发送流程（不清空输入框）
     * (data: { text, attachments }) => boolean | Promise<boolean>
     */
    beforeSend: {
      type: Function,
      default: null
    },
    /**
     * 分类型的限制配置
     * 格式示例：
     * {
     *   image: { maxSize: 10 * 1024 * 1024, extensions: ['jpg', 'png', 'jpeg'] },
     *   video: { maxSize: 200 * 1024 * 1024, extensions: ['mp4'] }
     * }
     */
    fileLimit: {
      type: Object,
      default: () => ({})
    },
    /**
     * 自定义菜单项数组（添加到上传按钮的下拉菜单中）
     * [
     *   {
     *     key: 'custom1',
     *     label: '自定义菜单',
     *     iconSrc: '/path/to/icon.svg', // 可选：图标路径
     *     visible: true,
     *     disabled: false,
     *     onClick: () => {} // 点击回调
     *   }
     * ]
     */
    customMenuItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      inputValue: this.value,
      fileList: [], // 用于 v-model 绑定 AIAttachments
      isFocused: false,
      isRecording: false,
      recognizer: null,
      tempRecognitionText: '', // 临时存储实时识别的文本
      confirmedText: '', // 已确认的文本（句子结束后）
      // 图标资源
      attachmentIcon,
      deleteIcon,
      voiceIcon,
      pauseIcon,
      sendIcon,
      sendDisabledIcon,
      imageIcon,
      documentIcon,
      starIcon,
      // 上传菜单相关
      showUploadMenu: false, // 控制下拉菜单显示
      currentFileType: null // 当前已选择的文件类型（用于单一类型模式）
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
    hasUploading() {
      return this.fileList && this.fileList.some(f => f.status === 'uploading');
    },
    isSubmitDisabled() {
      return (
        this.disabled || 
        this.loading || 
        this.hasUploading ||
        (!this.inputValue.trim() && !this.hasAttachments)
      );
    },
    attachmentCardMode() {
      if (!this.fileList || this.fileList.length === 0) return 'default';
      
      // 检查是否包含文件类型（非图片、非视频）
      // 使用和 AIAttachments.normalizeFileType 相同的逻辑
      const hasDocument = this.fileList.some(f => {
        const fileType = this.getFileTypeFromItem(f);
        return fileType === 'file';
      });

      // 如果有文件，强制默认模式 (完整卡片)
      if (hasDocument) return 'default';

      // 如果只有图片或视频，使用 mini 模式 (缩略图)
      return 'mini';
    },
    /**
     * 解析 allowedTypes prop
     */
    parsedAllowedTypes() {
      const config = this.allowedTypes || this.accepts;
      
      // 如果没有配置，默认支持所有类型
      if (!config) {
        return { image: true, video: true, document: true };
      }
      
      // 格式1: 字符串 ".jpg,.jpeg,.png,.mp4"
      if (typeof config === 'string') {
        const accept = config.toLowerCase();
        return {
          image: accept.includes('.jpg') || accept.includes('.jpeg') || 
                 accept.includes('.png') || accept.includes('.gif') || 
                 accept.includes('.webp') || accept.includes('image'),
          video: accept.includes('.mp4') || accept.includes('.avi') || 
                 accept.includes('.mov') || accept.includes('.wmv') || 
                 accept.includes('.flv') || accept.includes('video'),
          document: accept.includes('.pdf') || accept.includes('.doc') || 
                    accept.includes('.docx') || accept.includes('.xls') || 
                    accept.includes('.xlsx') || accept.includes('.ppt') || 
                    accept.includes('.pptx') || accept.includes('.txt') || 
                    accept.includes('.csv')
        };
      }
      
      // 格式2: 对象 { image: true, video: true, document: true }
      if (typeof config === 'object' && !Array.isArray(config)) {
        return {
          image: config.image === true,
          video: config.video === true,
          document: config.document === true
        };
      }
      
      // 格式3: 数组 ['image', 'video'] 或 ['image']
      if (Array.isArray(config)) {
        return {
          image: config.includes('image'),
          video: config.includes('video'),
          document: config.includes('document')
        };
      }
      
      return { image: true, video: true, document: true };
    },
    /**
     * 支持的类型列表
     */
    supportedTypes() {
      const types = [];
      if (this.parsedAllowedTypes.image) types.push('image');
      if (this.parsedAllowedTypes.video) types.push('video');
      if (this.parsedAllowedTypes.document) types.push('document');
      return types;
    },
    /**
     * 是否只支持单一类型（不需要下拉菜单）
     */
    isSingleTypeOnly() {
      return this.supportedTypes.length === 1;
    },
    /**
     * 当前已锁定的文件类型（用于单一类型模式）
     */
    lockedFileType() {
      if (!this.singleTypeMode || !this.currentFileType) return null;
      return this.currentFileType;
    },
    /**
     * 合并后的按钮配置（默认值 + 用户配置）
     */
    mergedButtonConfig() {
      const defaultConfig = {
        upload: { visible: true, disabled: false },
        clear: { visible: true, disabled: false },
        speech: { visible: true, disabled: false },
        stop: { visible: true, disabled: false },
        send: { visible: true, disabled: false }
      };
      
      // 合并用户配置
      const merged = { ...defaultConfig };
      Object.keys(this.buttonConfig).forEach(key => {
        if (merged[key]) {
          merged[key] = { ...merged[key], ...this.buttonConfig[key] };
        }
      });
      
      // sendDisabled 优先级最高
      if (this.sendDisabled !== null) {
        merged.send.disabled = this.sendDisabled;
      }
      
      return merged;
    },
    /**
     * 上传按钮是否可见
     */
    showUploadButton() {
      return this.mergedButtonConfig.upload.visible;
    },
    /**
     * 上传按钮是否禁用
     */
    disableUploadButton() {
      return this.mergedButtonConfig.upload.disabled;
    },
    /**
     * 清空按钮是否可见
     */
    showClearButton() {
      return this.mergedButtonConfig.clear.visible && (this.inputValue || this.hasAttachments);
    },
    /**
     * 清空按钮是否禁用
     */
    disableClearButton() {
      return this.mergedButtonConfig.clear.disabled;
    },
    /**
     * 语音按钮是否可见
     */
    showSpeechButton() {
      return this.mergedButtonConfig.speech.visible;
    },
    /**
     * 语音按钮是否禁用
     */
    disableSpeechButton() {
      return this.mergedButtonConfig.speech.disabled || !this.speechConfigProvider;
    },
    /**
     * 停止按钮是否可见
     */
    showStopButton() {
      return this.mergedButtonConfig.stop.visible && this.loading;
    },
    /**
     * 停止按钮是否禁用
     */
    disableStopButton() {
      return this.mergedButtonConfig.stop.disabled;
    },
    /**
     * 发送按钮是否可见
     */
    showSendButton() {
      return this.mergedButtonConfig.send.visible && !this.loading;
    },
    /**
     * 发送按钮是否禁用（合并内部逻辑和外部配置）
     */
    disableSendButton() {
      return this.mergedButtonConfig.send.disabled || this.isSubmitDisabled;
    },
    /**
     * 是否有文件类型选项（图片/视频/文档）
     */
    hasFileTypeOptions() {
      return this.parsedAllowedTypes.image || 
             this.parsedAllowedTypes.video || 
             this.parsedAllowedTypes.document;
    },
    /**
     * 可见的自定义菜单项（过滤掉不可见的）
     */
    visibleCustomMenuItems() {
      return (this.customMenuItems || []).filter(item => item.visible !== false);
    }
  },
  mounted() {
    // 初始化录音实例
    this.recognizer = new SpeechRecognizerWrapper({
      onText: (text, isFinal) => {
        console.log('[AIInput] onText:', { text, isFinal });
        if (isFinal) {
          // 句子结束，确认文本
          this.confirmedText += text;
          this.tempRecognitionText = '';
          this.inputValue = this.confirmedText;
        } else {
          // 实时识别结果
          this.tempRecognitionText = text;
          this.inputValue = this.confirmedText + text;
        }
        
           // 保持焦点在最后
           this.$nextTick(() => {
             this.adjustHeight();
             this.focusToEnd();
           });
      },
      onStart: () => {
        console.log('[AIInput] ASR started');
        // 录音开始时，保存当前输入框内容
        this.confirmedText = this.inputValue || '';
        this.tempRecognitionText = '';
      },
      onStop: () => {
        console.log('[AIInput] ASR stopped');
        this.isRecording = false;
        // 停止时，确认所有临时文本
        if (this.tempRecognitionText) {
          this.confirmedText += this.tempRecognitionText;
          this.inputValue = this.confirmedText;
          this.tempRecognitionText = '';
        }
      },
      onError: (err) => {
        console.error('[AIInput] ASR Error:', err);
        this.isRecording = false;
        this.$message && this.$message.error('语音识别失败：' + err.message);
      }
    });
    
    // 点击外部关闭上传菜单
    this.handleClickOutside = (e) => {
      if (this.showUploadMenu && !this.$el.contains(e.target)) {
        this.showUploadMenu = false;
      }
    };
    document.addEventListener('click', this.handleClickOutside);
    
    this.adjustHeight();
  },
  beforeDestroy() {
    if (this.recognizer) {
      this.recognizer.stop();
    }
    if (this.handleClickOutside) {
      document.removeEventListener('click', this.handleClickOutside);
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

    async handlePaste(e) {
      const files = e.clipboardData?.files;
      if (files?.length) {
        e.preventDefault();
        await this.processFiles(Array.from(files));
      }
    },

    clear() {
      this.inputValue = '';
      this.fileList = []; // 直接清空本地数据
      this.currentFileType = null; // 重置类型锁定
      this.adjustHeight();
      this.$emit('clear');
    },

    /* --- 文件上传逻辑 --- */
    /**
     * 处理上传按钮点击
     */
    handleUploadClick(e) {
      // 点击外部区域关闭菜单
      if (this.showUploadMenu) {
        this.showUploadMenu = false;
        return;
      }
      
      // 如果有自定义菜单项，即使只有一种文件类型也显示菜单
      if (this.isSingleTypeOnly && this.visibleCustomMenuItems.length === 0) {
        // 只支持一种类型且没有自定义菜单项，直接触发文件选择
        this.triggerFileSelect(this.supportedTypes[0]);
      } else {
        // 支持多种类型或有自定义菜单项，显示下拉菜单
        this.showUploadMenu = !this.showUploadMenu;
      }
    },
    
    /**
     * 从下拉菜单选择类型
     */
    selectFileType(type) {
      this.showUploadMenu = false;
      this.triggerFileSelect(type);
    },
    
    /**
     * 触发文件选择
     */
    triggerFileSelect(type) {
      const input = this.$refs.fileInput;
      
      let accept = '*/*';

      // 1. 优先读取 fileLimit 配置
      if (this.fileLimit && this.fileLimit[type] && this.fileLimit[type].extensions) {
        const exts = this.fileLimit[type].extensions;
        // 转换为 .jpg,.png 格式
        accept = exts.map(ext => ext.startsWith('.') ? ext : `.${ext}`).join(',');
        
        // 为了兼容性和移动端体验，追加大类通配符
        if (type === 'image') accept = 'image/*,' + accept;
        if (type === 'video') accept = 'video/*,' + accept;
      } else {
        // 2. 降级使用默认映射
      const acceptMap = {
        image: 'image/*,.jpg,.jpeg,.png,.gif,.webp',
        video: 'video/*,.mp4,.avi,.mov,.wmv,.flv,.mkv',
        document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'
      };
        accept = acceptMap[type] || '*/*';
      }
      
      input.accept = accept;
      input.click();
      
      // 如果是单一类型模式，记录当前类型
      if (this.singleTypeMode) {
        this.currentFileType = type;
      }
    },

    async handleFileChange(e) {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) {
        e.target.value = '';
        return;
      }
      
      // 检查单一类型模式限制
      if (this.lockedFileType) {
        const firstFileType = this.getFileType(files[0]);
        if (firstFileType !== this.lockedFileType) {
          const typeLabel = this.getTypeLabel(this.lockedFileType);
          // 尝试使用 $message，如果没有则使用 alert
          if (this.$message) {
            this.$message.warning(`当前只能上传${typeLabel}类型文件`);
          } else {
            alert(`当前只能上传${typeLabel}类型文件`);
          }
          e.target.value = '';
          return;
        }
      } else if (this.singleTypeMode && files.length > 0) {
        // 首次选择文件时，记录类型
        this.currentFileType = this.getFileType(files[0]);
      }
      
      // [新增] 详细校验逻辑 (大小 & 后缀)
      if (this.fileLimit) {
        for (const file of files) {
          const fileType = this.getFileType(file); // 'image' | 'video' | 'file'
          const limitConfig = this.fileLimit[fileType];

          if (limitConfig) {
            // A. 校验大小
            if (limitConfig.maxSize && file.size > limitConfig.maxSize) {
              const limitMB = (limitConfig.maxSize / 1024 / 1024).toFixed(0);
              const msg = `文件 ${file.name} 超过大小限制 (${limitMB}MB)`;
              if (this.$message) this.$message.warning(msg);
              else alert(msg);
              
              e.target.value = '';
              return;
            }

            // B. 校验后缀 (extensions)
            if (limitConfig.extensions && limitConfig.extensions.length > 0) {
              const fileName = file.name.toLowerCase();
              const isValidExt = limitConfig.extensions.some(ext => {
                const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
                return fileName.endsWith(cleanExt.toLowerCase());
              });

              if (!isValidExt) {
                const msg = `文件 ${file.name} 格式不正确，仅支持: ${limitConfig.extensions.join(', ')}`;
                if (this.$message) this.$message.warning(msg);
                else alert(msg);

                e.target.value = '';
                return;
              }
            }
          }
        }
      }

      // 检查文件大小限制 (全局 maxSize)
      if (this.maxSize) {
        const oversizedFiles = files.filter(file => file.size > this.maxSize);
        if (oversizedFiles.length > 0) {
          const maxSizeMB = (this.maxSize / 1024 / 1024).toFixed(2);
          if (this.$message) {
            this.$message.warning(`文件大小不能超过 ${maxSizeMB}MB`);
          } else {
            alert(`文件大小不能超过 ${maxSizeMB}MB`);
          }
          e.target.value = '';
          return;
        }
      }
      
      await this.processFiles(files);
      e.target.value = ''; // Reset
    },
    
    /**
     * 获取文件类型标签
     */
    getTypeLabel(type) {
      const labels = {
        image: '图片',
        video: '视频',
        document: '文档'
      };
      return labels[type] || '文件';
    },

    async processFiles(files) {
      const rawFiles = Array.from(files);

      // 1. 先在本地创建占位条目（用于显示上传进度）
      const baseIndex = this.fileList.length;
      rawFiles.forEach(file => {
        const item = {
          uid: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: this.getFileType(file),
          rawFile: file,
          url: '',
          status: this.beforeAddAttachments ? 'uploading' : 'done',
          percent: this.beforeAddAttachments ? 0 : 100
        };
        this.fileList.push(item);
      });

      // 2. 如果外部提供了预上传钩子，则优先交给外部处理（例如上传到 OSS，带进度）
      if (this.beforeAddAttachments) {
        const updateItem = (idx, patch) => {
          const target = this.fileList[baseIndex + idx];
          if (target) {
            Object.assign(target, patch);
          }
        };

        try {
          const maybeResult = await this.beforeAddAttachments(rawFiles, { updateItem });

          // 兼容旧协议：如果返回了数组，则用返回的数据覆盖占位条目
          if (Array.isArray(maybeResult)) {
            maybeResult.forEach((file, i) => {
              const target = this.fileList[baseIndex + i];
              if (!target) return;
              Object.assign(target, {
                name: file.name || target.name,
                size: file.size != null ? file.size : target.size,
                type: file.type || target.type,
                rawFile: file.rawFile != null ? file.rawFile : target.rawFile,
                url: file.url || target.url,
                status: file.status || 'done',
                percent: file.percent != null ? file.percent : 100
              });
            });
          }
          return;
        } catch (e) {
          console.error('[AIInput] beforeAddAttachments failed:', e);
          // 失败则退回到本地模式：标记为 done，但没有 url
          rawFiles.forEach((file, i) => {
            const target = this.fileList[baseIndex + i];
            if (!target) return;
            Object.assign(target, {
              status: 'done',
              percent: 100,
              url: ''
            });
          });
          return;
        }
      }

      // 3. 没有提供预上传钩子时，默认本地模式已经在占位条目里完成（status: 'done'）
    },

    getFileType(file) {
      if (file.type.startsWith('image/')) return 'image';
      if (file.type.startsWith('video/')) return 'video';
      return 'file';
    },
    
    /**
     * 从文件条目判断文件类型（用于 attachmentCardMode）
     * 逻辑和 AIAttachments.normalizeFileType 保持一致
     */
    getFileTypeFromItem(fileItem) {
      if (!fileItem) return 'file';
      
      // 1. 优先使用 rawFile 的 MIME type（最可靠）
      if (fileItem.rawFile && fileItem.rawFile.type) {
        const mimeType = fileItem.rawFile.type.toLowerCase();
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        return 'file';
      }
      
      // 2. 根据文件名扩展名判断
      const fileName = (fileItem.name || '').toLowerCase();
      if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(fileName)) {
        return 'image';
      }
      if (/\.(mp4|avi|mov|wmv|flv|mkv|webm|m4v)$/i.test(fileName)) {
        return 'video';
      }
      // PDF 等文档类型
      if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar)$/i.test(fileName)) {
        return 'file';
      }
      
      // 3. 如果 fileItem.type 是 MIME type，解析它
      if (fileItem.type && typeof fileItem.type === 'string') {
        const type = fileItem.type.toLowerCase();
        if (type.startsWith('image/') || type.startsWith('image')) return 'image';
        if (type.startsWith('video/') || type.startsWith('video')) return 'video';
        // 其他 MIME type 都是文件
        if (type.includes('/')) return 'file';
      }
      
      // 4. 如果 fileItem.type 已经是规范的类型字符串
      if (fileItem.type === 'image' || fileItem.type === 'video' || fileItem.type === 'file') {
        return fileItem.type;
      }
      
      // 5. 默认为文件类型
      return 'file';
    },

    /* --- 录音逻辑 --- */
    async toggleRecord() {
      if (this.isRecording) {
        this.recognizer.stop();
      } else {
        if (!this.speechConfigProvider) {
          return;
        }
        
        try {
          const config = await this.speechConfigProvider();
          if (!config) return;
          
          this.isRecording = true;
          this.recognizer.start(config);
        } catch (e) {
          this.isRecording = false;
        }
      }
    },

    async submit() {
      if (this.isSubmitDisabled) return;

      const data = {
        text: this.inputValue,
        attachments: this.fileList // 直接使用 AIAttachments 同步过来的列表
      };

      // 调用 beforeSend 钩子
      if (this.beforeSend) {
        try {
          const shouldContinue = await this.beforeSend(data);
          if (shouldContinue === false) return;
        } catch (e) {
          console.error('[AIInput] beforeSend failed:', e);
          return;
        }
      }

      this.$emit('send', data); 
      this.$emit('submit', data.text);

      this.clear();
    },

    stopGeneration() {
      this.$emit('stop');
    },

    /**
     * 公开方法：从外部添加文件
     * @param {File[]} files - 要添加的文件数组
     */
    async addFiles(files) {
      if (!files || files.length === 0) return;
      await this.processFiles(Array.from(files));
    },

    /**
     * 公开方法：设置输入框文本
     * @param {String} text - 要设置的文本
     */
    setText(text) {
      this.inputValue = text || '';
    },
    /**
     * 处理自定义菜单项点击
     */
    handleCustomMenuItemClick(item) {
      if (item.disabled) return;
      
      // 关闭菜单
      this.showUploadMenu = false;
      
      if (typeof item.onClick === 'function') {
        item.onClick({
          inputValue: this.inputValue,
          fileList: this.fileList,
          hasAttachments: this.hasAttachments
        });
      }
      
      // 触发事件，让父组件可以监听
      this.$emit('custom-menu-item-click', {
        key: item.key,
        item: item,
        inputValue: this.inputValue,
        fileList: this.fileList
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-input-container {
  width: 100%;
  position: relative;

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

    &.focused {
      box-shadow: 0 0 0 1px #409eff;
      border-color: rgba(56,142,255,1);
    }

    &.el-sender-disabled {
      background-color: #f5f7fa;
      pointer-events: none;
      opacity: 0.6;
    }

    .el-sender-header-wrap {
      border-bottom: 1px solid #ebeef5;
      overflow: hidden;

      .el-sender-header {
        padding: 8px 12px;
      }
    }

    .el-sender-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100px;
      padding: 12px 16px;
      box-sizing: border-box;

      .input-row {
        display: flex;
        width: 100%;
        flex: 1;
        align-items: flex-start;
      }

      .el-sender-prefix {
        flex: none;
        margin-right: 8px;
        margin-top: 2px; // Align with text
        display: flex;
        align-items: center;

        .prefix-star-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          display: block;
        }
      }

      .el-sender-input {
        flex: 1;
        display: flex;
        align-items: flex-start;
        width: 100%;

        .ai-textarea {
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          font-size: 14px;
          line-height: 1.5;
          color: #303133;
          max-height: 176px;
          overflow-y: auto;
          padding: 0;
          background: transparent;
          font-family: inherit;

          &::placeholder {
            color: #c0c4cc;
          }
        }
      }

      .el-sender-action-list {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;

        .action-left,
        .action-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn-wrapper {
          position: relative;
          border: 1px solid #dcdfe6;
          border-radius: 8px;;

          .upload-menu {
            position: absolute;
            bottom: 100%;
            left: 0;
            margin-bottom: 8px;
            background: #fff;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            min-width: 120px;
            overflow: hidden;

            .menu-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              cursor: pointer;
              transition: background-color 0.2s;
              font-size: 14px;
              color: #606266;

              &:hover:not(.disabled) {
                background-color: #f5f7fa;
              }

              &:not(:last-child) {
                border-bottom: 1px solid #ebeef5;
              }

              &.disabled {
                cursor: not-allowed;
                opacity: 0.6;
                color: #c0c4cc;
              }

              .menu-icon {
                width: 16px;
                height: 16px;
                margin-right: 8px;
                object-fit: contain;
                flex-shrink: 0;
              }
            }

            .menu-divider {
              height: 1px;
              background-color: #ebeef5;
              margin: 4px 0;
            }
          }
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

          .icon-img {
            width: 32px;
            height: 32px;
            object-fit: contain;
            display: block;
          }

          &:hover {
            background-color: #f2f6fc;
            color: #409eff;
          }

          &.send-btn {
            color: #fff;
            border-radius: 8px;

            &:hover {
              color: #fff;
            }

            &.disabled {
              cursor: not-allowed;
              opacity: 0.7;
            }
          }

          &.stop-btn {
            color: #fff;
            border-radius: 8px;
            font-size: 12px;

            &:hover {
              color: #fff;
            }
          }

          &.speech-btn {
            &.recording {
              background-color: #fef0f0;
              animation: pulse 1.5s infinite;
            }
          }
        }

        .char-count {
          font-size: 12px;
          color: #909399;
          margin-left: 4px;
        }
      }
    }

    .el-sender-footer {
      border-top: 1px solid #ebeef5;
      padding: 8px;
    }
  }

  .loading-spinner {
    animation: rotate 1s linear infinite;
    display: inline-block;
  }
}

// Animations
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
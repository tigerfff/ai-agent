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
                <img v-show="!(isFocused || (inputValue && inputValue.length > 0))" :src="starIcon" alt="星星" class="prefix-star-icon" />
              </slot>
          </div>

          <!-- 输入框 -->
          <div class="el-sender-input">
            <textarea
              ref="textarea"
              :value="inputValue"
              class="ai-textarea"
              :placeholder="placeholder"
              :maxlength="maxLength"
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
              <div v-if="actionButtons.upload.visible" class="upload-btn-wrapper">
                <div 
                  class="action-btn upload-btn" 
                  :class="{ 'disabled': actionButtons.upload.disabled }"
                  @click="!actionButtons.upload.disabled && handleUploadClick()" 
                  title="上传文件"
                >
                  <img :src="uploadActionIcon" alt="上传文件" class="icon-img" />
                </div>
                
                <!-- 下拉菜单 -->
                <div 
                  v-if="!isSingleTypeOnly && showUploadMenu" 
                  class="upload-menu"
                  @click.stop
                >
                  <!-- 标准菜单项 -->
                  <div 
                    v-for="item in visibleStandardMenuItems"
                    :key="item.key"
                    class="menu-item"
                    :class="{ 'disabled': item.disabled }"
                    @click="!item.disabled && selectFileType(item.key)"
                  >
                    <img :src="item.icon" :alt="item.label" class="menu-icon" />
                    <span>{{ item.label }}</span>
                  </div>
                  
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
                {{ (inputValue || '').length }}/{{ maxLength }}
              </div>
            </div>

            <!-- 右侧操作区：清空 & 语音 & 发送 & 自定义按钮 -->
            <div class="action-right">
              <!-- 清空按钮 -->
              <div 
                v-if="actionButtons.clear.visible"
                class="action-btn clear-btn" 
                :class="{ 'disabled': actionButtons.clear.disabled }"
                @click="!actionButtons.clear.disabled && clear()"
                title="清空"
              >
                <i class="h-icon-close_f" style="font-size: 32px;"></i>
              </div>

              <!-- 语音按钮 -->
              <div 
                v-if="actionButtons.speech.visible"
                class="action-btn speech-btn" 
                :class="{ 'recording': isRecording, 'disabled': actionButtons.speech.disabled }"
                @click="!actionButtons.speech.disabled && toggleRecord()"
                title="语音输入"
              >
                <!-- Lottie 动画 -->
                <AILottie
                  v-if="isRecording"
                  ref="speechAnimation"
                  :animation-data="speechAnimationData"
                  :autoplay="true"
                  :loop="true"
                  :width="24"
                  :height="24"
                  class="speech-animation"
                />
                <!-- 未录音时显示静态图标 -->
                <img 
                  v-else
                  :src="voiceIcon" 
                  alt="语音输入" 
                  class="icon-img" 
                />
              </div>

              <!-- 停止按钮 -->
              <div 
                v-if="actionButtons.stop.visible"
                class="action-btn stop-btn"
                :class="{ 'disabled': actionButtons.stop.disabled }"
                @click="!actionButtons.stop.disabled && stopGeneration()"
                title="停止生成"
              >
                <img :src="pauseIcon" alt="停止生成" class="icon-img" />
              </div>
              
              <!-- 发送按钮 -->
              <div 
                v-if="actionButtons.send.visible"
                class="action-btn send-btn" 
                :class="{ 'disabled': actionButtons.send.disabled }"
                @click="!actionButtons.send.disabled && submit()"
                title="发送"
              >
                <img 
                  :src="actionButtons.send.disabled ? sendDisabledIcon : sendIcon" 
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
/**
 * AIInput 组件
 * 
 * 功能概述：
 * - 支持文本输入、文件上传（图片/视频/文档）、语音输入
 * - 支持文件类型限制、大小限制、数量限制
 * - 支持单一类型模式（一旦选择某种类型，只能继续选择该类型）
 * - 支持自定义菜单项（如通道抓取等业务功能）
 * - 支持发送前校验钩子、文件上传前处理钩子
 * - 支持按钮显示/隐藏/禁用状态控制
 * 
 * 使用示例：
 * <AIInput
 *   v-model="inputText"
 *   :loading="isStreaming"
 *   :allowed-types="['image', 'video']"
 *   :file-limit="{ image: { maxSize: 10 * 1024 * 1024, extensions: ['jpg', 'png'] } }"
 *   :button-config="{ upload: { visible: true }, speech: { visible: false } }"
 *   @send="handleSend"
 *   @file-list-change="handleFileListChange"
 * />
 */

import { SpeechRecognizerWrapper } from '@/ai-core/audio/SpeechRecognizer';
import AIAttachments from '@/ai-ui/attachments/AIAttachments.vue';
import AILottie from '@/ai-ui/lottie/AILottie.vue';
import speechAnimationData from '@/assets/lottery/speech.json';

// 导入图标资源
import attachmentIcon from '@svg/attachment.svg';
import deleteIcon from '@svg/delete.svg';
import voiceIcon from '@svg/voice.svg';
import pauseIcon from '@images/pause@3x.png';
import sendIcon from '@images/send-msg.png';
import sendDisabledIcon from '@images/send_msg_disabled.png';
import imageIcon from '@svg/image.svg';
import videoIcon from '@svg/video.svg';
import documentIcon from '@svg/document.svg';
import starIcon from '@images/star@3x.png';

export default {
  name: 'AIInput',
  components: {
    AIAttachments,
    AILottie
  },
  props: {
    /** 输入框的值（v-model） */
    value: {
      type: String,
      default: ''
    },
    /** 输入框占位符 */
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    /** 是否禁用整个输入框 */
    disabled: {
      type: Boolean,
      default: false
    },
    /** 是否处于加载状态（会影响发送按钮的禁用状态） */
    loading: {
      type: Boolean,
      default: false
    },
    /** 是否启用停止按钮（如果为 true，loading 时显示停止按钮而非禁用的发送按钮） */
    enableStopButton: {
      type: Boolean,
      default: false
    },
    /** 最大字符长度 */
    maxLength: {
      type: Number,
      default: 2000
    },
    /** 提交方式：'enter' 表示按 Enter 提交，'shiftEnter' 表示按 Shift+Enter 提交 */
    submitType: {
      type: String,
      default: 'enter'
    },
    /** 
     * 语音识别配置提供者
     * 函数签名：async () => ({ secretId, secretKey, appId })
     * 如果为 null，则语音按钮会被禁用
     */
    speechConfigProvider: {
      type: Function,
      default: null
    },
    /** 
     * 文件上传前钩子
     * 函数签名：async (rawFiles: File[], { updateItem: (idx, patch) => void }) => Promise<UploadedItem[] | void>
     * 用于在文件进入附件列表前进行上传处理（如上传到 OSS）
     * updateItem 可用于更新上传进度：updateItem(0, { percent: 50, status: 'uploading' })
     */
    beforeAddAttachments: {
      type: Function,
      default: null
    },
    /** 
     * 允许的文件类型配置
     * 格式1: 字符串，如 ".jpg,.jpeg,.png,.mp4"
     * 格式2: 对象，如 { image: true, video: true, document: true }
     * 格式3: 数组，如 ['image', 'video'] 或 ['image'] (单一类型)
     * 如果为 null 或 undefined，默认支持所有类型
     */
    allowedTypes: {
      type: [String, Object, Array],
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
    /** 最大文件大小（字节），全局限制 */
    maxSize: {
      type: Number,
      default: null
    },
    /** 最大文件数量限制，null 表示不限制 */
    maxFileCount: {
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
     * 发送按钮是否禁用（快速控制，优先级高于 buttonConfig 和内部逻辑）
     * null 表示使用内部逻辑自动判断
     */
    sendDisabled: {
      type: Boolean,
      default: null
    },
    /** 
     * 发送前钩子，用于校验或拦截
     * 函数签名：(data: { text: string, attachments: FileItem[] }) => boolean | Promise<boolean>
     * 返回 false 或 Promise.reject 则中断发送流程（不清空输入框）
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
     *   video: { maxSize: 200 * 1024 * 1024, extensions: ['mp4'] },
     *   document: { maxSize: 50 * 1024 * 1024, extensions: ['pdf', 'doc'] }
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
    },
    /** 
     * 上传下拉菜单配置（控制标准菜单项的显示和禁用）
     * {
     *   image: { visible: true, disabled: false, label: '图片' },
     *   video: { visible: true, disabled: false, label: '视频' },
     *   document: { visible: true, disabled: false, label: '文档' }
     * }
     */
    uploadMenu: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      /** 输入框的值（内部状态） */
      inputValue: this.value || '',
      /** 文件列表（与 AIAttachments 组件双向绑定） */
      fileList: [],
      /** 输入框是否获得焦点 */
      isFocused: false,
      /** 是否正在录音 */
      isRecording: false,
      /** 语音停止的 Promise resolver */
      pendingStopResolver: null,
      /** 语音识别器实例 */
      recognizer: null,
      /** 临时存储实时识别的文本（句子未结束时） */
      tempRecognitionText: '',
      /** 已确认的文本（句子结束后） */
      confirmedText: '',
      /** Lottie 动画数据 */
      speechAnimationData,
      // 图标资源
      attachmentIcon,
      deleteIcon,
      voiceIcon,
      pauseIcon,
      sendIcon,
      sendDisabledIcon,
      imageIcon,
      videoIcon,
      documentIcon,
      starIcon,
      /** 是否显示上传下拉菜单 */
      showUploadMenu: false,
      /** 当前已选择的文件类型（用于单一类型模式锁定） */
      currentFileType: null
    };
  },
  watch: {
    /** 监听外部传入的 value 变化，同步到内部状态 */
    value(val) {
      this.inputValue = val || '';
    },
    /** 监听内部输入值变化，触发 input 事件并调整高度 */
    inputValue(val) {
      this.$emit('input', val);
      this.$nextTick(this.adjustHeight);
    },
    /** 监听文件列表变化，触发 file-list-change 事件，并在列表为空时重置类型锁定 */
    fileList: {
      handler(newList) {
        this.$emit('file-list-change', newList);
        if (newList.length === 0) {
          this.currentFileType = null;
        }
      },
      deep: true
    },
    /** 监听自定义菜单项变化，强制更新视图 */
    customMenuItems: {
      handler() {
        this.$forceUpdate();
      },
      deep: true
    },
    /** 监听录音状态变化，控制 Lottie 动画播放/停止 */
    isRecording(newVal) {
      if (this.$refs.speechAnimation) {
        if (newVal) {
          this.$refs.speechAnimation.play();
        } else {
          this.$refs.speechAnimation.stop();
        }
      }
    }
  },
  computed: {
    /** 是否有附件 */
    hasAttachments() {
      return this.fileList && this.fileList.length > 0;
    },
    /** 是否有正在上传的文件 */
    hasUploading() {
      return this.fileList && this.fileList.some(f => f.status === 'uploading');
    },
    /** 发送按钮是否应该被禁用（内部逻辑） */
    isSubmitDisabled() {
      const text = this.inputValue || '';
      return (
        this.disabled || 
        this.loading || 
        this.hasUploading ||
        (!text.trim() && !this.hasAttachments)
      );
    },
    /** 
     * 附件卡片显示模式
     * 'default': 完整卡片模式（用于文档等）
     * 'mini': 缩略图模式（用于图片/视频）
     */
    attachmentCardMode() {
      if (!this.fileList || this.fileList.length === 0) return 'default';
      const hasDocument = this.fileList.some(f => {
        const fileType = this.getFileTypeFromItem(f);
        return fileType === 'document' || fileType === 'file';
      });
      return hasDocument ? 'default' : 'mini';
    },
    /** 
     * 解析 allowedTypes prop，统一转为对象格式
     * 返回值：{ image: boolean, video: boolean, document: boolean }
     * 注意：如果明确传了空数组 []，则表示不允许任何标准类型进入校验。
     */
    parsedAllowedTypes() {
      const config = this.allowedTypes;
      const defaultTypes = { image: true, video: true, document: true };
      
      if (config === null || config === undefined) return defaultTypes;
      
      // 如果明确传了空数组，表示不允许任何标准类型校验通过
      if (Array.isArray(config) && config.length === 0) {
        return { image: false, video: false, document: false };
      }
      
      const configStr = typeof config === 'string' ? config.toLowerCase() : JSON.stringify(config).toLowerCase();
      const isArr = Array.isArray(config);

      return {
        image: isArr ? config.includes('image') : (config.image === true || configStr.includes('image') || configStr.includes('.jpg') || configStr.includes('.png')),
        video: isArr ? config.includes('video') : (config.video === true || configStr.includes('video') || configStr.includes('.mp4')),
        document: isArr ? (config.includes('document') || config.includes('file')) : (config.document === true || config.file === true || configStr.includes('doc') || configStr.includes('pdf') || configStr.includes('txt'))
      };
    },
    /** 
     * 合并标准菜单项配置
     * 结合了 parsedAllowedTypes（逻辑准入）和 uploadMenu（展示配置）
     */
    standardMenuOptions() {
      const defaultMenu = {
        image: { visible: true, disabled: false, label: '图片', icon: imageIcon },
        video: { visible: true, disabled: false, label: '视频', icon: videoIcon },
        document: { visible: true, disabled: false, label: '文档', icon: documentIcon }
      };

      const merged = {};
      Object.keys(defaultMenu).forEach(key => {
        const config = this.uploadMenu[key] || {};
        // 只有在逻辑准入允许，且配置未隐藏时，才显示
        const isAllowedByLogic = this.parsedAllowedTypes[key];
        const isVisibleByConfig = config.visible !== false;
        
        merged[key] = {
          ...defaultMenu[key],
          ...config,
          visible: isAllowedByLogic && isVisibleByConfig
        };
      });
      return merged;
    },
    /** 可见的标准菜单项列表 */
    visibleStandardMenuItems() {
      return Object.keys(this.standardMenuOptions)
        .filter(key => this.standardMenuOptions[key].visible)
        .map(key => ({ key, ...this.standardMenuOptions[key] }));
    },
    /** 支持的文件类型列表（用于单类型判断等） */
    supportedTypes() {
      return Object.keys(this.parsedAllowedTypes).filter(key => this.parsedAllowedTypes[key]);
    },
    /** 是否只支持单一类型（决定是否直接触发上传而不开菜单） */
    isSingleTypeOnly() {
      // 这里的单类型判断需要结合可见菜单项
      return (this.visibleStandardMenuItems.length + this.visibleCustomMenuItems.length) === 1;
    },
    /** 上传按钮显示的图标 */
    uploadActionIcon() {
      // 如果只支持单一类型，使用该类型对应的图标
      if (this.isSingleTypeOnly) {
        if (this.visibleStandardMenuItems.length === 1) {
          return this.visibleStandardMenuItems[0].icon;
        }
        if (this.visibleCustomMenuItems.length === 1) {
          return this.visibleCustomMenuItems[0].iconSrc || this.attachmentIcon;
        }
      }
      // 否则使用默认的附件图标
      return this.attachmentIcon;
    },
    /** 
     * 统一按钮状态控制
     * 合并默认配置和用户传入的 buttonConfig，返回所有按钮的显示/禁用状态
     */
    actionButtons() {
      const defaultConfig = {
        upload: { visible: true, disabled: false },
        clear: { visible: true, disabled: false },
        speech: { visible: true, disabled: false },
        stop: { visible: true, disabled: false },
        send: { visible: true, disabled: false }
      };
      
      const config = { ...defaultConfig };
      if (this.buttonConfig) {
        Object.keys(this.buttonConfig).forEach(key => {
          if (config[key]) {
            config[key] = { ...config[key], ...this.buttonConfig[key] };
          }
        });
      }

      return {
        upload: {
          visible: config.upload.visible,
          disabled: config.upload.disabled
        },
        clear: {
          visible: config.clear.visible && (this.inputValue || this.hasAttachments),
          disabled: config.clear.disabled
        },
        speech: {
          visible: config.speech.visible,
          disabled: config.speech.disabled || !this.speechConfigProvider
        },
        stop: {
          visible: this.enableStopButton && config.stop.visible && this.loading,
          disabled: config.stop.disabled
        },
        send: {
          visible: config.send.visible && (this.enableStopButton ? !this.loading : true),
          disabled: this.sendDisabled !== null ? this.sendDisabled : this.isSubmitDisabled
        }
      };
    },
    /** 可见的自定义菜单项（过滤掉 visible: false 的项） */
    visibleCustomMenuItems() {
      return (this.customMenuItems || []).filter(item => item.visible !== false);
    }
  },
  mounted() {
    // 初始化语音识别器
    this.recognizer = new SpeechRecognizerWrapper({
      /** 识别文本回调（实时和最终结果） */
      onText: (text, isFinal) => {
        if (isFinal) {
          // 句子结束，确认文本
          let nextConfirmed = this.confirmedText + text;
          if (this.maxLength && nextConfirmed.length > this.maxLength) {
            nextConfirmed = nextConfirmed.substring(0, this.maxLength);
          }
          this.confirmedText = nextConfirmed;
          this.tempRecognitionText = '';
          this.inputValue = this.confirmedText;
        } else {
          // 实时识别结果
          let nextInput = this.confirmedText + text;
          if (this.maxLength && nextInput.length > this.maxLength) {
            nextInput = nextInput.substring(0, this.maxLength);
          }
          this.tempRecognitionText = text;
          this.inputValue = nextInput;
        }
        this.$nextTick(() => {
          this.adjustHeight();
          this.focusToEnd();
        });
      },
      /** 录音开始回调 */
      onStart: () => {
        // 录音开始时，保存当前输入框内容
        this.confirmedText = this.inputValue || '';
        this.tempRecognitionText = '';
      },
      /** 录音停止回调 */
      onStop: () => {
        this.isRecording = false;
        // 停止时，确认所有临时文本
        if (this.tempRecognitionText) {
          this.confirmedText += this.tempRecognitionText;
          this.inputValue = this.confirmedText;
          this.tempRecognitionText = '';
        }
        // 处理等待停止的 Promise
        if (this.pendingStopResolver) {
          this.pendingStopResolver();
          this.pendingStopResolver = null;
        }
      },
      /** 识别错误回调 */
      onError: (err) => {
        this.isRecording = false;
        this.$message && this.$message.error('语音识别失败：' + err.message);
        // 处理等待停止的 Promise
        if (this.pendingStopResolver) {
          this.pendingStopResolver();
          this.pendingStopResolver = null;
        }
      }
    });
    
    // 点击外部关闭上传菜单
    this.handleClickOutside = (e) => {
      if (this.showUploadMenu && !this.$el.contains(e.target)) {
        this.showUploadMenu = false;
      }
    };
    document.addEventListener('click', this.handleClickOutside);
    
    // 初始化输入框高度
    this.adjustHeight();
  },
  beforeDestroy() {
    // 清理语音识别器
    if (this.recognizer) {
      // 停止识别（stop 内部已包含 destroyStream 释放麦克风逻辑）
      this.recognizer.stop();
      this.isRecording = false;
    }
    // 移除事件监听器
    if (this.handleClickOutside) {
      document.removeEventListener('click', this.handleClickOutside);
    }
  },
  methods: {
    /* ========== 输入框相关方法 ========== */
    
    /** 处理输入框输入事件 */
    handleInput(e) {
      this.inputValue = e.target.value;
    },
    /** 处理输入框获得焦点 */
    handleFocus() {
      this.isFocused = true;
    },
    /** 处理输入框失去焦点 */
    handleBlur() {
      this.isFocused = false;
    },
    /** 聚焦到输入框 */
    focusInput() {
      this.$refs.textarea.focus();
    },
    /** 聚焦到输入框末尾 */
    focusToEnd() {
      const el = this.$refs.textarea;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    },
    /** 自动调整输入框高度（根据内容） */
    adjustHeight() {
      const textarea = this.$refs.textarea;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    },
    /** 处理键盘按键事件（Enter 提交） */
    handleKeyDown(e) {
      if (e.keyCode === 13) {
        if (this.submitType === 'enter' && !e.shiftKey) {
          e.preventDefault();
          this.submit();
        } else if (this.submitType === 'shiftEnter' && e.shiftKey) {
          e.preventDefault();
          this.submit();
        }
      }
    },
    /** 处理粘贴事件（支持粘贴图片） */
    async handlePaste(e) {
      const files = e.clipboardData?.files;
      if (files?.length) {
        e.preventDefault();
        const validFiles = this.validateFiles(Array.from(files));
        if (validFiles.length > 0) {
          await this.processFiles(validFiles);
        }
      }
    },
    /** 清空输入框和文件列表 */
    clear() {
      this.inputValue = '';
      this.fileList = [];
      this.currentFileType = null;
      this.confirmedText = '';
      this.tempRecognitionText = '';
      this.adjustHeight();
      this.$emit('clear');
    },
    
    /* ========== 文件处理相关方法 ========== */
    
    /** 
     * 统一文件校验逻辑
     * @param {File[]} files - 待校验的文件数组
     * @returns {File[]} 通过校验的文件数组
     */
    validateFiles(files) {
      if (!files || files.length === 0) return [];
      const validFiles = [];
      const currentCount = this.fileList.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = this.getFileType(file);

        if (this.maxFileCount !== null && (currentCount + validFiles.length) >= this.maxFileCount) {
          this.$message?.warning(`最多只能上传 ${this.maxFileCount} 个文件`);
          break;
        }

        if (!this.parsedAllowedTypes[fileType]) {
          const allowedLabels = Object.keys(this.parsedAllowedTypes)
            .filter(k => this.parsedAllowedTypes[k])
            .map(k => this.getTypeLabel(k)).join('、');
          this.$message?.warning(`不支持文件 ${file.name}`);
          continue;
        }

        if (this.singleTypeMode) {
          const lockedType = this.currentFileType || this.getFileType(files[0]);
          if (fileType !== lockedType) {
            this.$message?.warning(`当前模式下只能上传 ${this.getTypeLabel(lockedType)} 类型文件`);
            continue;
          }
          if (!this.currentFileType) this.currentFileType = lockedType;
        }

        const limitConfig = this.fileLimit[fileType] || (fileType === 'document' ? this.fileLimit.file : null);
        const maxSize = limitConfig?.maxSize || this.maxSize;
        if (maxSize && file.size > maxSize) {
          this.$message?.warning(`文件 ${file.name} 超过大小限制 (${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
          continue;
        }

        if (limitConfig?.extensions?.length > 0) {
          const ext = file.name.split('.').pop().toLowerCase();
          if (!limitConfig.extensions.map(e => e.replace('.', '').toLowerCase()).includes(ext)) {
            this.$message?.warning(`文件 ${file.name} 格式不正确，仅支持: ${limitConfig.extensions.join(', ')}`);
            continue;
          }
        }
        validFiles.push(file);
      }
      return validFiles;
    },
    /** 处理文件选择器的 change 事件 */
    async handleFileChange(e) {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) {
        e.target.value = '';
        return;
      }
      const validFiles = this.validateFiles(files);
      if (validFiles.length > 0) {
        await this.processFiles(validFiles);
      }
      e.target.value = ''; // 重置 input，允许重复选择同一文件
    },
    /** 获取文件类型的中文标签 */
    getTypeLabel(type) {
      const labels = { image: '图片', video: '视频', document: '文档', file: '文档' };
      return labels[type] || '文件';
    },
    /** 
     * 处理文件（创建占位条目，调用上传钩子）
     * @param {File[]} files - 要处理的文件数组
     */
    async processFiles(files) {
      const rawFiles = Array.from(files);
      const baseIndex = this.fileList.length;
      rawFiles.forEach(file => {
        this.fileList.push({
          uid: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: this.getFileType(file),
          rawFile: file,
          url: '',
          status: this.beforeAddAttachments ? 'uploading' : 'done',
          percent: this.beforeAddAttachments ? 0 : 100
        });
      });

      if (this.beforeAddAttachments) {
        const updateItem = (idx, patch) => {
          const target = this.fileList[baseIndex + idx];
          if (target) Object.assign(target, patch);
        };
        try {
          const maybeResult = await this.beforeAddAttachments(rawFiles, { updateItem });
          if (Array.isArray(maybeResult)) {
            maybeResult.forEach((file, i) => {
              const target = this.fileList[baseIndex + i];
              if (target) Object.assign(target, { ...file, status: file.status || 'done', percent: file.percent || 100 });
            });
          }
        } catch (e) {
          rawFiles.forEach((file, i) => {
            const target = this.fileList[baseIndex + i];
            if (target && target.status !== 'error') Object.assign(target, { status: 'done', percent: 100 });
          });
        }
      }
    },
    /** 
     * 判断文件类型
     * @param {File} file - 文件对象
     * @returns {string} 'image' | 'video' | 'document'
     */
    getFileType(file) {
      if (!file) return 'document';
      const type = (file.type || '').toLowerCase();
      if (type.startsWith('image/')) return 'image';
      if (type.startsWith('video/')) return 'video';
      // 根据扩展名兜底判断
      const ext = file.name?.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) return 'video';
      return 'document';
    },
    /** 
     * 从文件条目判断文件类型（用于展示模式）
     * @param {Object} fileItem - 文件条目对象（可能包含 rawFile 属性）
     * @returns {string} 'image' | 'video' | 'document'
     */
    getFileTypeFromItem(fileItem) {
      return this.getFileType(fileItem.rawFile || fileItem);
    },
    
    /* ========== 文件上传相关方法 ========== */
    
    /** 处理上传按钮点击（显示/隐藏下拉菜单或直接触发文件选择） */
    handleUploadClick() {
      if (this.showUploadMenu) {
        this.showUploadMenu = false;
        return;
      }
      
      // 如果总共只有一个可见项（标准项 + 自定义项），直接触发对应的动作
      if (this.isSingleTypeOnly) {
        if (this.visibleStandardMenuItems.length === 1) {
          const item = this.visibleStandardMenuItems[0];
          if (!item.disabled) this.triggerFileSelect(item.key);
        } else if (this.visibleCustomMenuItems.length === 1) {
          const item = this.visibleCustomMenuItems[0];
          if (!item.disabled) this.handleCustomMenuItemClick(item);
        }
      } else {
        // 多项则显示菜单
        this.showUploadMenu = true;
      }
    },
    /** 从下拉菜单选择文件类型 */
    selectFileType(type) {
      this.showUploadMenu = false;
      this.triggerFileSelect(type);
    },
    /** 
     * 触发文件选择器
     * @param {string} type - 文件类型：'image' | 'video' | 'document'
     */
    triggerFileSelect(type) {
      const input = this.$refs.fileInput;
      if (!input) return;
      let accept = '*/*';
      const limitConfig = this.fileLimit[type] || (type === 'document' ? this.fileLimit.file : null);
      if (limitConfig?.extensions) {
        accept = limitConfig.extensions.map(ext => ext.startsWith('.') ? ext : `.${ext}`).join(',');
        if (type === 'image') accept = 'image/*,' + accept;
        if (type === 'video') accept = 'video/*,' + accept;
      } else {
        const acceptMap = {
          image: 'image/*,.jpg,.jpeg,.png,.gif,.webp',
          video: 'video/*,.mp4,.avi,.mov,.wmv,.flv,.mkv',
          document: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv'
        };
        accept = acceptMap[type] || '*/*';
      }
      input.accept = accept;
      input.click();
    },
    
    /* ========== 语音识别相关方法 ========== */
    
    /** 切换录音状态（开始/停止） */
    async toggleRecord() {
      if (this.isRecording) {
        await this.stopRecording();
      } else {
        if (!this.speechConfigProvider) return;
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
    /** 停止录音（统一入口） */
    stopRecording() {
      if (this.isRecording && this.recognizer) {
        return new Promise((resolve) => {
          this.pendingStopResolver = resolve;
          this.recognizer.stop();
          // 立即同步状态，防止重复触发
          this.isRecording = false;
          
          // 安全兜底：1.5秒后如果还没触发 onStop 则强制 resolve
          setTimeout(() => {
            if (this.pendingStopResolver === resolve) {
              resolve();
              this.pendingStopResolver = null;
            }
          }, 1500);
        });
      }
      return Promise.resolve();
    },
    
    /* ========== 提交相关方法 ========== */
    
    /** 提交表单（发送消息） */
    async submit() {
      if (this.isRecording) {
        // 等待语音识别完全停止并同步最后一段文字
        await this.stopRecording();
      }
      if (this.isSubmitDisabled) return;
      const data = { text: this.inputValue, attachments: this.fileList };
      if (this.beforeSend) {
        try {
          const shouldContinue = await this.beforeSend(data);
          if (shouldContinue === false) return;
        } catch (e) {
          return;
        }
      }
      this.$emit('send', data);
      this.$emit('submit', data.text);
      this.clear();
    },
    /** 停止生成（触发 stop 事件） */
    stopGeneration() {
      this.$emit('stop');
    },
    
    /* ========== 公开方法（供外部调用） ========== */
    
    /** 
     * 从外部添加文件（如通道抓取回传的文件）
     * @param {File[]} files - 要添加的文件数组
     */
    async addFiles(files) {
      if (!files || files.length === 0) return;
      const validFiles = this.validateFiles(Array.from(files));
      if (validFiles.length > 0) await this.processFiles(validFiles);
    },
    /** 
     * 设置输入框文本
     * @param {string} text - 要设置的文本
     */
    setText(text) {
      let val = text || '';
      if (this.maxLength && val.length > this.maxLength) {
        val = val.substring(0, this.maxLength);
      }
      this.inputValue = val;
    },
    
    /* ========== 菜单相关方法 ========== */
    
    /** 处理自定义菜单项点击 */
    handleCustomMenuItemClick(item) {
      if (item.disabled) return;
      this.showUploadMenu = false;
      if (typeof item.onClick === 'function') {
        item.onClick({ inputValue: this.inputValue, fileList: this.fileList, hasAttachments: this.hasAttachments });
      }
      this.$emit('custom-menu-item-click', { key: item.key, item, inputValue: this.inputValue, fileList: this.fileList });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/style/mixins.scss';

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
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.12);
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
      padding: 12px 0 12px 16px;
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
        margin-top: 2px;
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
          color: rgba(0, 0, 0, 0.7);
          max-height: 110px;
          overflow-y: auto;
          overflow-x: hidden;
          background: transparent;
          font-family: inherit;
          padding-right: 4px;
          
          &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          &::-webkit-scrollbar-track {
            background: transparent;
          }
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.7);
            border-radius: 4px;
          }
          &::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.5);
          }
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
        padding-right: 16px;

        .action-left,
        .action-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .upload-btn-wrapper {
          position: relative;
          border: 1px solid #dcdfe6;
          border-radius: 8px;

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
            padding: 4px 0;

            .menu-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              cursor: pointer;
              transition: background-color 0.2s;
              font-size: 14px;
              color: #606266;

              &:hover:not(.disabled) {
                background: rgba(0,0,0,0.04);
              }

              &.disabled {
                cursor: not-allowed;
                opacity: 0.6;
                color: #c0c4cc;
              }

              .menu-icon {
                width: 24px;
                height: 24px;
                margin-right: 8px;
                object-fit: contain;
                flex-shrink: 0;
              }
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
            width: 24px;
            height: 24px;
            object-fit: contain;
            display: block;
          }

          &:hover {
            background: rgba(224,224,224,1);
          }

          &.send-btn {
            &:hover {
              background: transparent;
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
          }

          &.speech-btn {
            &.recording {
              animation: pulse 1.5s infinite;
            }
            .speech-animation {
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
        }

        .char-count {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.2);
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
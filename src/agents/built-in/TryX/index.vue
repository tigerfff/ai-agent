<template>
  <div class="try-agent" :class="{ 'is-mini': isMini }">
    <!-- 消息区域 -->
    <div class="chat-area">
      <AIWelcome
        v-if="messages.length === 0 && !isInitialLoading"
        v-bind="welcomeConfig"
        class="content-wrapper"
        @select="handleWelcomeSelect"
      >
        <div class="welcome-prompts">
          <div
            v-for="(card, index) in fullCustomMenuItems"
            :key="index"
            class="prompt-card"
            @click="handleWelcomeSelect(card)"
            :class="{ 'prompt-card-disabled': (fileListUploadType!== '' && card.mineType.indexOf(fileListUploadType) < 0) || fileListUploadType==='video'}"
          >
            <img :src="card.icon" alt="" class="card_icon" />
            <div class="prompt-desc">{{ card.text }}</div>
            <div class="prompt-tips">{{ card.tips }}</div>
            <div class="bg" :style="{ backgroundImage: 'url(' + getBgImage(card.bg) + ')' }"></div>
          </div>
        </div>
      </AIWelcome>
      
      <ChatSkeleton style="margin-top: 40px;" v-else-if="isInitialLoading && messages.length === 0" class="content-wrapper" />

      <AIHistory
        v-else
        ref="history"
        :list="messages"
        :loading="loadingHistory"
        :no-more="allHistoryLoaded"
        :back-button-threshold="50"
        @complete="handleFinish"
        @load-more="handleLoadMore"
        enableActions
        class="history-full-width"
      >
        <template  #footer="{ item, index, isLast }" >
          <div style="display: flex; align-items: center; gap: 4px;">
            <BubbleFooter
              v-show="shouldShowFooter(item)"
              :item="item"
              :actions="getActions(item)"
              :is-last="isLast"
              @action="handleAction($event, item, index)"
            >
            </BubbleFooter>
          </div>
        </template>
      </AIHistory>
    </div>
    <!-- 输入区域 -->
    <div class="footer">
      <div class="content-wrapper">
        <!-- 
          mode="file" 开启文件上传支持
          accepts 限制上传类型
        -->
        <AIInput 
          ref="aiInput"
          v-model="aiInputText"
          :loading="isStreaming || isUploading"
          :showClearButton="false"
          :enable-stop-button="false"
          :placeholder="inputPlaceholder"
          :allowed-types="['image', 'video']"
          :upload-menu="{
            image: { visible: false },
            video: { visible: false },
            document: { visible: false }
          }"
          :customMenuItems="displayCustomMenuItems"
          :max-size="200 * 1024 * 1024"
          :singleTypeMode="true"
          :maxFileCount="30"
          :file-limit="{
            image: { maxSize: 10 * 1024 * 1024, extensions: ['jpg', 'png', 'jpeg'] },
            video: { maxSize: 200 * 1024 * 1024, extensions: ['mp4'] }
          }"
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="asrConfigProvider"
          :before-send="handleBeforeSend"
          :send-disabled="sendBtnDisabled"
          :buttonConfig="dynamicButtonConfig"
          @send="handleSend" 
          @stop="handleStop"
          @file-list-change="fileListChange"
          @custom-menu-item-click="customMenuItemClick"
        />

        <p class="footer-text">内容由AI生成，仅供参考</p>
      </div>
    </div>
    <simulateVerifyModal :visible.sync="simulateVerifyModalVisible" @simulateVerifyFileUpload="simulateVerifyFileUpload" 
      :limitImgsCanNumber="currentImgFileCount" :limitVideosCanNumber="currentVideoFileCount" :fileListUploadType="fileListUploadType"></simulateVerifyModal>
  </div>
</template>

<script>
import imageIcon from '@svg/imgae.svg';
import videoIcon from '@svg/video.svg';
import channelIcon from '@svg/channel.svg';
import imageBigIcon from './images/imageBig.svg';
import videoBigIcon from './images/videoBig.svg';
import channelBigIcon from './images/channelBig.svg';
import channelBg from './images/channel_bg.png';
import imageBg from './images/image_bg.png';
import videoBg from './images/video_bg.png';
import { TryApi } from './api';
import trainingSquareIcon from '@/assets/images/try.png';
import simulateVerifyModal from './modal/simulateVerifyModal.vue'
import { AgentBaseMixin } from '@/mixins/AgentBaseMixin';

export default {
  name: 'TryAgent',
  inject: ['sessionApi'],
  mixins: [AgentBaseMixin],
  components: {
    simulateVerifyModal
  },
  props: {
    // 由父组件 (AgentContainer) 传入，指示当前选中的会话 ID
    conversationId: {
      type: String,
      default: ''
    },
    isMini: {
      type: Boolean,
      default: false
    },
    businessLine: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      imageIcon,
      videoIcon,
      channelIcon,
      imageBigIcon,
      videoBigIcon,
      channelBigIcon,
      channelBg,
      imageBg,
      videoBg,
      fileListUploadType: '',
      currentImgFileCount: 0,
      currentVideoFileCount: 0,
      simulateVerifyModalVisible: false,
      trainingSquareIcon,

      welcomeConfig: {
        icon: trainingSquareIcon,
        title: 'AI试用',
        description: '我可以识别图片和视频中的内容，判断是否存在您关注的特定对象或行为。上传图片或视频并提出问题，我将给出检测结果。现在就来试试吧！',
      },
      actionConfig: {
        user: ['copy'],
        bot: ['fresh', 'copy', 'like', 'dislike']
      },
      buttonConfig: { upload: { visible: true, disabled: false }, speech: { visible: false, disabled: false }, clear: { visible: false, disabled: false } },
      inputPlaceholder: '您可以问我任何问题，比如“图片中是否有员工违规”'
    };
  },
  computed: {
    fullCustomMenuItems() {
      const menuItems = [
        {label: '通道抓取', visible: true, iconSrc: channelIcon, dataSource: 'uikit', mineType: 'img, video', disabled: false,  text: '通道抓取', tips: ' ', icon: channelBigIcon, bg: 'channel_bg.png'},
        {label: '图片', visible: true, iconSrc: imageIcon, dataSource: 'uploadImg', mineType: 'img', disabled: false, text: '上传图片', tips: ' ', icon: imageBigIcon, bg: 'image_bg.png' },
        {label: '视频', visible: true, iconSrc: videoIcon, dataSource: 'uploadVideo', mineType: 'video', disabled: false, text: '上传视频', tips: '大小限200M以内', icon: videoBigIcon, bg: 'video_bg.png' }
      ]
      if (['portal'].includes(this.businessLine)) {
        return menuItems.filter(item => item.dataSource !== 'uikit')
      }
      
      return menuItems
    },
    // 计算最终要显示的自定义菜单项（处理禁用逻辑）
    displayCustomMenuItems() {
      const hasMessages = this.messages.length > 0;
      
      return this.fullCustomMenuItems.map(item => {
        let disabled = false;
        
        // 1. 已有消息时全部禁用（TryX 业务规则：开始对话后不可再传文件）
        if (hasMessages) {
          disabled = true;
        } 
        // 2. 根据当前已选文件类型进行互斥禁用
        else if (this.inputFilesList.length > 0) {
          const type = this.inputFilesList[0].type === 'image' ? 'img' : 'video';
          if (type === 'video') {
            disabled = true; // 传了视频，禁掉所有（包括图片和通道抓取）
          } else {
            // 传了图片，只能继续传图片（禁掉不支持 img 的项）
            disabled = item.mineType.indexOf('img') < 0;
          }
        }
        
        return { ...item, disabled };
      });
    },
    // 动态计算上传按钮配置 
    dynamicButtonConfig() {
      const hasMessages = this.messages.length > 0;
      return {
        ...this.buttonConfig,
        upload: {
          visible: !hasMessages, // 有消息后隐藏上传按钮
          disabled: false
        }
      };
    }
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        this.aiInputText = ''
        this.$refs.aiInput && this.$refs.aiInput.clear()
      }
    }
  },
  created() {
  },
  methods: {
    /**
     * 提供 API 实例给 Mixin
     */
    getAgentApi() {
      return TryApi;
    },

    /**
     * 重写 Mixin 的 newSession 处理
     */
    onNewSession() {
      this.customMenuItems = JSON.parse(JSON.stringify(this.fullCustomMenuItems));
    },

    /**
     * 新建对话前的钩子，返回 false 可以阻止新建对话
     * @returns {boolean} true-允许新建，false-阻止新建
     */
    async beforeNewChat() {
      // this.$message.warning('AI 正在回复中，请稍后再试');
      const {data} = await TryApi.remainingChatTimes(this.$aiClient)
      if(!data.isRemaining) {
        this.$message.warning('今天无剩余次数，请明天再来！')
      }
      
      return data.isRemaining;
    },

    getActions(item) {
      // 根据 placement 判断角色：'end' 是用户，'start' 是机器人
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },
    customMenuItemClick(item) {
      let data = item.item
      this.handleWelcomeSelect(data)
    },
    fileListChange(file) {
      this.inputFilesList = file || []
      if(this.inputFilesList.length > 0) {
        this.fileListUploadType = this.inputFilesList[0].type === 'image' ? 'img' : 'video'
        if(this.fileListUploadType === 'video') {
          this.inputPlaceholder = "询问视频内容..."
        } else {
          this.inputPlaceholder = "询问图片内容..."
        }
      } else {
        this.fileListUploadType = ''
        this.inputPlaceholder = "您可以问我任何问题，比如“图片中是否有员工违规”"
      }
    },
    shouldShowFooter(item) {
      if(item.placement === 'start' && item.role === 'ai') {
        if(!item.msgId) {
          return false
        }
      }
      if (!item || !item.content) {
        return false;
      }
      return true
    },
    
    // 执行之前
    handleBeforeSend(data) {
      // 检查是否有上传失败的文件
      const hasError = data.attachments && data.attachments.some(f => f.status === 'error');
      if (hasError) {
        this.$message.warning('存在上传失败的文件，请删除或重试后再发送');
        return false; // 阻止发送，不清空输入框
      }
      
      // 检查是否有正在上传的文件（可选，通常 AIInput 已经禁用了发送按钮）
      const isUploading = data.attachments && data.attachments.some(f => f.status === 'uploading');
      if (isUploading) {
        this.$message.warning('文件正在上传中，请稍候');
        return false;
      }

      return true; // 允许发送
    },

    /**
     * 处理欢迎页选项选择
     * 如果选项需要上传文件（如"图片分析"），则触发文件选择并传递到 AIInput
     */
    async handleWelcomeSelect(data) {
      const aiInput = this.$refs.aiInput;
      if (!aiInput) return;

      const inputFiles = aiInput.fileList || [];
      this.currentImgFileCount = inputFiles.filter(_ => _.type === 'image').length;
      this.currentVideoFileCount = inputFiles.filter(_ => _.type === 'video').length;

      if (['uploadImg', 'uploadVideo'].includes(data.dataSource)) {
        if (['uploadVideo', 'uikit'].includes(data.dataSource) && this.currentVideoFileCount > 0) {
          this.$message.warning(`最多只能上传1个视频`);
          return false;
        }
        
        // 使用 AIInput 暴露的标准方法触发文件选择，不再手动创建 input 标签
        const type = data.dataSource === 'uploadImg' ? 'image' : 'video';
        aiInput.triggerFileSelect(type);
      } else { // 通道抓取
        this.simulateVerifyModalVisible = true;
      }
    },

    async simulateVerifyFileUpload(fileList) {
      if(!fileList || !fileList.length) {
        return false
      }
      
      // 将 base64 图片和视频 blob 转换为 File 对象
      const files = await Promise.all(
        fileList.map(async (item, index) => {
          if (item.mineType === 'img' && item.base64Url) {
            // 将 base64 转换为 Blob
            const response = await fetch(item.base64Url);
            const blob = await response.blob();
            
            // 创建 File 对象
            const fileName = item.name || `capture_${index + 1}.jpg`;
            return new File([blob], fileName, { type: 'image/jpeg' });
          }
          if(item.mineType === 'video' && item.blobInfo) {
            // 视频已经是 Blob 对象，直接创建 File 对象
            const fileName = item.name || `video_${index + 1}.mp4`;
            return new File([item.blobInfo], fileName, { type: 'video/mp4' });
          }
          return null;
        })
      );
      
      // 过滤掉 null 值
      const validFiles = files.filter(file => file !== null);
      
      // 如果有有效的文件且 AIInput 组件存在，添加到输入框
      if (validFiles.length > 0 && this.$refs.aiInput) {
        await this.$refs.aiInput.addFiles(validFiles);
        
        // 关闭模态框
        this.simulateVerifyModalVisible = false;
        
        return true;
      }
      
      return false;
    },
    /**
     * 获取背景图片
     */
    getBgImage(bgFileName) {
      const bgMap = {
        'channel_bg.png': this.channelBg,
        'image_bg.png': this.imageBg,
        'video_bg.png': this.videoBg
      };
      return bgMap[bgFileName] || '';
    }
  }
};
</script>

<style lang="scss" scoped>
.try-agent {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  // 小窗模式适配
  &.is-mini {
    .chat-area .content-wrapper,
    .footer .content-wrapper {
      padding: 0 32px;
      max-width: 100%;
    }
  }

  .chat-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    width: 100%;

    .content-wrapper {
      max-width: 960px;
      margin: 0 auto;
      height: 100%;
      padding: 0 32px;
    }

    .loading-history {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
    }

    .history-full-width {
      width: 100%;
      height: 100%;
    }

    // 自定义欢迎页卡片样式
    .welcome-prompts {
      display: flex;
      margin-top: 20px;
      width: 100%;
      justify-content: space-between;

      .prompt-card {
        background: #fff;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s;
        flex: 1;
        height: 177px;
        background: #FFFFFF7F;
        border: 1px dashed #00000033;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        .bg{
          position: absolute;
          right: 0;
          bottom: 0;
          width: 110px;
          height: 100px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: bottom right;
        }
        .card_icon{
          width: 32px;
          height: 32px;
        }
        .prompt-desc {
          color: #000000B2;
          font-size: 14px;
          height: 22px;
        }
        .prompt-tips{
          color: #00000066;
          font-size: 12px;
          height: 20px;
        }
      }
      .prompt-card-disabled{
        background-color: #f5f7fa;
        pointer-events: none;
        opacity: 0.6;
      }
    }
  }

  .footer {
    flex-shrink: 0;
    width: 100%;
    padding: 16px 0 12px;

    .footer-text {
      font-size: 12px;
      color: rgba($color: #000000, $alpha: .2);
      text-align: center;
      margin-top: 12px;
    }

    .content-wrapper {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 32px;
    }
  }

  .custom-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: #eee;

    &.user {
      background: #dbefff;
    }

    &.ai {
      background: #e6f7ff;
    }
  }
}
</style>

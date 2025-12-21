<template>
  <div class="try-agent" :class="{ 'is-mini': isMini }">
    <!-- 消息区域 -->
    <div class="chat-area">
      <AIWelcome
        v-if="messages.length === 0 && !loadingHistory"
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
      
      <ChatSkeleton style="margin-top: 40px;" v-else-if="loadingHistory" class="content-wrapper" />

      <AIHistory
        v-else
        ref="history"
        :list="messages"
        :back-button-threshold="50"
        @complete="handleFinish"
        enableActions
        class="history-full-width"
      >
        <template  #footer="{ item, index }" >
          <div style="display: flex; align-items: center; gap: 4px;">
            <BubbleFooter
              :item="item"
              :actions="getActions(item)"
              @action="handleAction($event, item, index)"
            >
              <!-- 在AI回答前面添加刷新按钮 -->
              <template #before-custom-actions>
                <div
                  v-if="item.role === 'ai' && !item.loading"
                  class="action-item regenerate-btn"
                  @click="handleRegenerate(item, index)"
                  title="重新生成"
                >
                  <AIIcon size="24" :src="regenerateIcon" class="action-icon" />
                </div>
              </template>
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
          placeholder="有问题尽管问我~"
          :allowed-types="[]"
          :customMenuItems="customMenuItems"
          :max-size="200 * 1024 * 1024"
          :singleTypeMode="true"
          :maxFileCount="30"
          :file-limit="{
            image: { maxSize: 10 * 1024 * 1024, extensions: ['jpg', 'png', 'jpeg'] },
            video: { maxSize: 200 * 1024 * 1024, extensions: ['mp4'] }
          }"
          :before-add-attachments="handlePreUpload"
          :speech-config-provider="getAsrConfig"
          :before-send="handleBeforeSend"
          :send-disabled="sendBtnDisabled"
          @send="handleSend" 
          @stop="handleStop"
          @file-list-change="fileListChange"
          @custom-menu-item-click="customMenuItemClick"
        />
      </div>
    </div>
    <simulateVerifyModal :visible.sync="simulateVerifyModalVisible" @simulateVerifyFileUpload="simulateVerifyFileUpload" 
      :limitImgsCanNumber="currentImgFileCount" :limitVideosCanNumber="currentVideoFileCount"></simulateVerifyModal>
  </div>
</template>

<script>
import imageIcon from '@svg/image.svg';
import videoIcon from '@svg/video.svg';
import channelIcon from '@svg/channel.svg';
import imageBigIcon from './images/imageBig.svg';
import videoBigIcon from './images/videoBig.svg';
import channelBigIcon from './images/channelBig.svg';
import channelBg from './images/channel_bg.png';
import imageBg from './images/image_bg.png';
import videoBg from './images/video_bg.png';
import AIWelcome from '@/ai-ui/welcome/AIWelcome.vue';
import ChatSkeleton from '@/ai-ui/skeleton/ChatSkeleton.vue';
import { OssUploader } from '@/utils/oss-uploader.js';
import { TryApi } from './api';
import { formatConversationTime } from '@/utils';
import trainingSquareIcon from '@/assets/images/inspect-square.png';
import simulateVerifyModal from './modal/simulateVerifyModal.vue'
// import trainingSquareIcon from '@/assets/images/try.png';
import { handleAgentPreUpload } from '@/utils/agent-upload';
import BubbleFooter from '@/ai-ui/history/BubbleFooter.vue';
import AIIcon from '@/ai-ui/icon/AIIcon.vue';
import regenerateIcon from '@svg/regenerate.svg';
export default {
  name: 'TryAgent',
  inject: ['sessionApi'],
  components: {
    AIWelcome,
    ChatSkeleton,
    simulateVerifyModal,
    BubbleFooter,
    AIIcon
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
      aiInputText: '',
      customMenuItems: [],
      fileListUploadType: '',
      inputFilesList: [],
      currentImgFileCount: 0,
      currentVideoFileCount: 0,
      simulateVerifyModalVisible: false,
      messages: [],
      chatId: '', // 当前会话的真实 chatId，用于 SSE 请求
      isStreaming: false,
      isUploading: false,
      loadingHistory: false,
      abortController: null,
      isCreatingSession: false, // 防止重复创建会话的标志位
      trainingSquareIcon,
      // 操作栏配置
      actionConfig: {
        user: ['copy'],
        bot: ['copy', 'like', 'dislike']
      },
      // OSS 上传器实例
      ossUploader: null,

      regenerateIcon,

      welcomeConfig: {
        icon: trainingSquareIcon,
        title: 'AI试用',
        description: '我可以识别图片和视频中的内容，判断是否存在您关注的特定对象或行为。上传图片或视频并提出问题，我将给出检测结果。现在就来试试吧！',
      }
    };
  },
  computed: {
    fullCustomMenuItems() {
      const menuItems = [
        {label: '通道抓取', visible: true, iconSrc: channelIcon, dataSource: 'uikit', mineType: 'img, video', disabled: false,  text: '通道抓取', tips: ' ', icon: channelBigIcon, bg: 'channel_bg.png'},
        {label: '图片', visible: true, iconSrc: imageIcon, dataSource: 'uploadImg', mineType: 'img', disabled: false, text: '上传图片', tips: ' ', icon: imageBigIcon, bg: 'image_bg.png' },
        {label: '视频', visible: true, iconSrc: videoIcon, dataSource: 'uploadVideo', mineType: 'video', disabled: false, text: '上传视频', tips: '大小限200M以内', icon: videoBigIcon, bg: 'video_bg.png' }
      ]
      // 如果 businessLine 为 'portal'，不显示通道抓取
      if (['portal', 'retail'].includes(this.businessLine)) {
        return menuItems.filter(item => item.dataSource !== 'uikit')
      }
      
      return menuItems
    },
    sendBtnDisabled() {
      return Boolean((!this.messages.length && (!this.inputFilesList.length || !this.aiInputText.length)) || (this.messages.length && !this.aiInputText.length))
    }
  },
  watch: {
    conversationId: {
      immediate: true,
      handler(val) {
        this.aiInputText = ''
        this.$refs.aiInput && this.$refs.aiInput.clear()
        this.customMenuItems = JSON.parse(JSON.stringify(this.fullCustomMenuItems))
        if (val) {
          // 如果当前已有 chatId 且和传入的一样，则不重复加载
          // 注意：首次进入时 this.chatId 是空的，所以即使 val 是一样也会加载
          // 但为了防止在列表里点击当前会话时重复刷新，加个判断
          if (this.chatId === val) return;

          this.chatId = val;
          // 当外部传入新的会话 ID 时，加载对应的历史记录
          this.loadHistory();
        } else {
          // 如果没有 ID（或者是新会话状态），则清空消息显示欢迎页
          this.chatId = '';
          this.messages = [];
        }
        if (this.chatId.startsWith('conv-') || !this.chatId) { // 新建对话
          this.fetchConversationList();
        }
      }
    },
    messages: {
      immediate: true,
      handler(val) {
        if (val) {
          this.customMenuItems = this.fullCustomMenuItems.map(item => ({ ...item, disabled: true }))
        }
      }
    }
  },
  created() {
    this.initUploader();
    // 主动获取列表并通知父组件更新 Sidebar
    this.fetchConversationList();
    this.customMenuItems = JSON.parse(JSON.stringify(this.fullCustomMenuItems))
  },
  methods: {
    /**
     * 新建对话前的钩子，返回 false 可以阻止新建对话
     * @returns {boolean} true-允许新建，false-阻止新建
     */
    beforeNewChat() {
      // this.$message.warning('AI 正在回复中，请稍后再试');
      
      return true;
    },

    getActions(item) {
      // 根据 placement 判断角色：'end' 是用户，'start' 是机器人
      const role = item.placement === 'end' ? 'user' : 'bot';
      return this.actionConfig[role] || [];
    },
    customMenuItemClick(item) {
      console.log("item", item)
      let data = item.item
      this.handleWelcomeSelect(data)
    },
    fileListChange(file) {
      this.inputFilesList = file || []
       if(this.inputFilesList.length > 0) {
        this.fileListUploadType = this.inputFilesList[0].type === 'image' ? 'img' : 'video'
        if(this.fileListUploadType === 'video') {
          this.customMenuItems = this.fullCustomMenuItems.map(item => ({ ...item, disabled: true }))
        } else {
          this.customMenuItems = this.fullCustomMenuItems.map(item => ({ ...item, disabled: item.mineType.indexOf('img') < 0 }))
        }
       } else {
        this.fileListUploadType = ''
        this.customMenuItems = JSON.parse(JSON.stringify(this.fullCustomMenuItems))
       }
    },
    initUploader() {
      this.ossUploader = new OssUploader({
        tokenProvider: async () => {
          try {
            const res = await TryApi.getOssToken(this.$aiClient);
            if (res.code === 0) {
              return res.data;
            }
            return null;
          } catch (e) {
            return null;
          }
        }
      });
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
     * 预上传钩子：在文件进入附件栏前先上传到 OSS
     * 新协议：handlePreUpload(rawFiles, { updateItem })
     *  - rawFiles: 原始 File[]
     *  - updateItem(index, patch): 由 AIInput 提供，用于更新对应附件的 status / percent / url 等
     */
    async handlePreUpload(rawFiles, context = {}) {
      return handleAgentPreUpload(rawFiles, context, this.ossUploader, (val) => {
        this.isUploading = val;
      });
    },

    /**
     * 获取会话列表，emit 给父组件 (AgentContainer)
     */
    async fetchConversationList() {
      try {
        const res = await TryApi.getConversationList(this.$aiClient);
        if (res.code === 0 && Array.isArray(res.data)) {
          const map = new Map();
          
          res.data.forEach(item => {
            const chatId = item.chatId || item.id;
            if (!chatId) return;

            if (!map.has(chatId)) {
              map.set(chatId, {
                id: chatId,
                // 适配后端字段：title -> label
                label: (item.title || item.userText || '新会话').slice(0, 20),
                // 保留原始时间字段，供组件内部自动分组使用
                createTime: item.createTime,
                updateTime: item.updateTime,
                // 保留置顶字段（兼容 pinned 和 top 字段）
                top: item.pinned === true || item.pinned === 'true',
                // 格式化显示时间（用于 label slot 中显示）
                time: formatConversationTime(item.createTime)
              });
            }
          });

          const list = Array.from(map.values());
          this.$emit('update-list', list);
        }
      } catch (e) {
      }
    },

    /**
     * 处理欢迎页选项选择
     * 如果选项需要上传文件（如"图片分析"），则触发文件选择并传递到 AIInput
     */
    async handleWelcomeSelect(data) {
      if (['uploadImg', 'uploadVideo'].includes(data.dataSource)) {
        // 创建一个隐藏的文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = data.mineType === 'img' ?  '.jpg,.jpeg,.png' : '.mp4'
        input.multiple = data.mineType === 'img' ? true: false
        input.style.display = 'none';
        
        // 等待用户选择文件
        const files = await new Promise((resolve) => {
          input.onchange = (e) => {
            const selectedFiles = Array.from(e.target.files || []);
            resolve(selectedFiles);
            document.body.removeChild(input);
            this.$refs.aiInput.handleFileChange(e);
          };
          input.oncancel = () => {
            resolve([]);
            document.body.removeChild(input);
          };
          document.body.appendChild(input);
          input.click();
        });

        // 如果用户选择了文件，添加到 AIInput
        if (files.length > 0 && this.$refs.aiInput) {
          // await this.$refs.aiInput.addFiles(files);
          // 添加文件
        }
      } else { // 通道抓取
        let inputFiles = this.$refs.aiInput ? this.$refs.aiInput.fileList : []
        // 获取当前已有的图片和视频文件数量
        this.currentImgFileCount = inputFiles.filter(_ => _.type === 'image').length
        this.currentVideoFileCount = inputFiles.filter(_ => _.type === 'video').length
        this.simulateVerifyModalVisible = true
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
     * 加载当前 chatId 的历史记录
     */
    async loadHistory() {
      if (!this.chatId) return;

      // 如果是临时会话ID（AgentContainer 生成的），则不加载历史，直接显示欢迎页
      if (this.chatId.startsWith('conv-')) {
        this.messages = [];
        this.loadingHistory = false;
        return;
      }

      this.loadingHistory = true;
      this.messages = [];

      try {
        const res = await TryApi.getHistory(this.$aiClient, this.chatId);

        if (res && res.code === 0 && Array.isArray(res.data)) {
          // 如果后端返回的是按时间倒序的（最新的在前面），需要反转
          // 或者先按 createTime 排序
          const rawList = res.data;
          // 简单的判断：如果第一条比最后一条时间晚，说明是倒序
          if (rawList.length > 1) {
             const t1 = new Date(rawList[0].createTime).getTime();
             const t2 = new Date(rawList[rawList.length - 1].createTime).getTime();
             if (t1 > t2) {
               rawList.reverse();
             }
          }

          const list = [];
          rawList.forEach(item => {
            const pair = this.adaptMessage(item);
            // 过滤无效的用户消息：有文本或有附件才显示，且 promptVisible 不为 false
            const hasUserText = pair.user.content && pair.user.content.trim();
            const hasUserAttachments = pair.user.attachments && pair.user.attachments.length > 0;
            const shouldShowUserMessage = item.promptVisible !== false; // 默认显示，只有明确为 false 时才隐藏
            if ((hasUserText || hasUserAttachments) && shouldShowUserMessage) {
              list.push(pair.user);
            }

            // 过滤无效的 AI 消息：有文本或有附件才显示
            const hasAiText = pair.ai.content && pair.ai.content.trim();
            const hasAiAttachments = pair.ai.attachments && pair.ai.attachments.length > 0;
            if (hasAiText || hasAiAttachments) {
              list.push(pair.ai);
            }
          });
          this.messages = list;
        } 
      } catch (e) {
        this.messages = [];
      } finally {
        this.loadingHistory = false;
      }
    },
    /**
     * 适配历史消息格式
     * 后端数据结构示例：
     * {
     *   chatId: string,
     *   files: { image: [{ url }], video: [{ url }] | null },
     *   userText: string,
     *   assistantText: string,
     *   ...
     * }
     * 目标：拆成「用户一条 + AI 一条」
     */
    adaptMessage(msg) {
      const images = (msg.files && Array.isArray(msg.files.image)) ? msg.files.image : [];
      const videos = (msg.files && Array.isArray(msg.files.video)) ? msg.files.video : [];

      const userAttachments = [];

      images.forEach((item, idx) => {
        if (item && item.url) {
          userAttachments.push({
            type: 'image',
            url: item.url,
            name: `图片${idx + 1}`
          });
        }
      });

      videos.forEach((item, idx) => {
        if (item && item.url) {
          userAttachments.push({
            type: 'video',
            url: item.url,
            name: `视频${idx + 1}`
          });
        }
      });

      const user = {
        key: `${msg.msgId || msg.chatId || 'user'}-u`,
        role: 'user',
        content: msg.userText || '',
        attachments: userAttachments,
        variant: 'filled',
        placement: 'end',
        time: msg.createTime
      };

      // 将后端的 userEvaluation 映射为前端的 likeStatus
      // 后端: "UPVOTE" | "DOWNVOTE" | "NO_EVAL"
      // 前端: "like" | "dislike" | ""
      let likeStatus = '';
      if (msg.userEvaluation === 'UPVOTE') {
        likeStatus = 'like';
      } else if (msg.userEvaluation === 'DOWNVOTE') {
        likeStatus = 'dislike';
      }

      const ai = {
        key: `${msg.msgId || msg.chatId || 'ai'}-a`,
        role: 'ai',
        content: msg.assistantText || '',
        attachments: [], // 目前后端没给出 AI 侧附件，就先留空
        variant: 'filled',
        placement: 'start',
        time: msg.createTime,
        msgId: msg.msgId, // 保存 msgId，用于评价接口
        likeStatus // 保存点赞状态
      };

      return { user, ai };
    },

    /**
     * 发送消息处理
     */
    async handleSend(data) {
      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      if (!data.text && attachments.length === 0) return;

      // 1. 如果当前没有会话ID 或 是临时ID，先创建会话
      if (!this.chatId || this.chatId.startsWith('conv-')) {
        // 防止重复创建会话
        if (this.isCreatingSession) {
          console.log('[TryX] 正在创建会话，请稍候...');
          return;
        }
        
        this.isCreatingSession = true;
        try {
          let mineTypeParams = data.attachments[0].type
          // 创建新会话
          const res = await TryApi.getChatId(this.$aiClient, {
            mineType: mineTypeParams
          });
          if (res.code === 0 && res.data) {
             // 假设返回的是 chatId 字符串或包含 chatId 的对象
             this.chatId = typeof res.data === 'string' ? res.data : res.data.chatId;
             
             // 通知父组件选中新会话（这一步可选，如果 fetchConversationList 能及时更新）
             // 但为了 URL 同步，建议 emit select
             this.$emit('select-conversation', this.chatId);
             
             // 刷新列表，让 Sidebar 出现新会话
             this.fetchConversationList();
          } else {
            this.$message.error('创建会话失败');
            return;
          }
        } catch (e) {
          console.error('[TryX] Create session failed', e);
          this.$message.error('创建会话失败，请重试');
          return;
        } finally {
          this.isCreatingSession = false;
        }
      }

      const userMsgKey = Date.now();
      
      // 2. 立即显示用户消息
      const userMsg = {
        key: userMsgKey,
        role: 'user',
        content: data.text,
        attachments: attachments,
        placement: 'end',
        variant: 'filled',
        time: userMsgKey
      };
      this.messages.push(userMsg);

      // 3. 构造请求参数
      let uploadType = 'img'; 
      const imageUrls = attachments
        .filter(a => a.type === 'image' && a.url)
        .map(a => a.url);
      const videoUrls = attachments
        .filter(a => a.type === 'video' && a.url)
        .map(a => a.url);

      if (videoUrls.length > 0) {
        uploadType = 'video';
      }

      // 4. 准备 AI 占位消息
      const aiMsgKey = Date.now() + '_ai';
      const aiMsg = {
        key: aiMsgKey,
        role: 'ai',
        content: '',
        loading: true,
        typing: true,
        placement: 'start',
        variant: 'filled',
        time: Date.now()
      };
      this.messages.push(aiMsg);

      // 5. 发起 SSE 请求
      this.isStreaming = true;
      this.abortController = new AbortController();

      const requestBody = {
        chatId: this.chatId,
        input: {
          prompt: data.text,
          imageList: imageUrls,
          videoList: videoUrls
        }
      };

      try {
        await TryApi.chatStream(this.$aiClient, {
          data: requestBody,
          signal: this.abortController.signal,
          uploadType,
          onMessage: (msgData) => {
            console.log('[TryX] onMessage', msgData);
            aiMsg.loading = false;
            if (!msgData) return;

            if (msgData.text) {
              aiMsg.content += msgData.text;
            }

            // 记录消息 ID，用于点赞评价
            if (msgData.msgId && !aiMsg.msgId) {
              aiMsg.msgId = msgData.msgId;
            }

            // 更新 chatId（如果后端返回了新的 chatId）
            if (msgData.chatId && msgData.chatId !== this.chatId) {
              this.chatId = msgData.chatId;
              // 通知父组件更新会话 ID
              this.$emit('select-conversation', this.chatId);
            }

            if (msgData.status !== 0) {
              this.isStreaming = false;
              this.handleFinish({ index: this.messages.indexOf(aiMsg) });
            }
          },
          onComplete: () => {
            this.handleFinish({ index: this.messages.indexOf(aiMsg) });
          },
          onError: (err) => {
            aiMsg.loading = false;
            aiMsg.content += '\n[网络错误，连接断开]';
            this.isStreaming = false;
          }
        });
      } catch (e) {
        aiMsg.loading = false;
        aiMsg.content = '服务暂时不可用，请稍后再试。';
        this.isStreaming = false;
      }
    },

    /**
     * 置顶/取消置顶会话
     */
    async pinSession(id, pinned) {
      try {
        const res = await TryApi.pinnedChat(this.$aiClient, { chatId: id, pinned });
        if (res.code === 0) {
          this.$message.success(pinned ? '置顶成功' : '已取消置顶');
          this.fetchConversationList();
        }
      } catch (e) {
        console.error('[TryAgent] pinSession failed', e);
        this.$message.error('操作失败');
      }
    },

    /**
     * 重命名会话
     */
    async renameSession(id, title) {
      try {
        const res = await TryApi.renameChatTitle(this.$aiClient, { chatId: id, title });
        if (res.code === 0) {
          this.$message.success('重命名成功');
          this.fetchConversationList();
        }
      } catch (e) {
        this.$message.error('重命名失败');
      }
    },

    /**
     * 删除会话
     * @param {string} id 会话ID
     */
    async deleteSession(id) {
      try {
        const res = await TryApi.deleteHistory(this.$aiClient, { chatId: id });
        if (res.code === 0) {
          // 如果删除的是当前会话，清空显示
          if (id === this.chatId) {
            this.chatId = '';
            this.messages = [];
            // 通知父组件清空选中状态（或由父组件自己处理）
          }
          // 刷新列表
          this.fetchConversationList();
        }
      } catch (e) {
      }
    },

    handleStop() {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
      this.isStreaming = false;
      this.isUploading = false;
    },

    /**
     * 获取 ASR 配置（用于语音识别）
     * 优先使用 window.config 中的测试密钥，否则调用后端接口获取签名
     */
    async getAsrConfig() {
      // 生产环境：调用后端接口获取签名
      try {
        const res = await TryApi.getAsrSign(this.$aiClient, {});
        
        if (res.code === 0 && res.data) {
          const { appId, sign } = res.data;
          
          if (!appId || !sign) {
            return null;
          }

          // 返回配置，使用签名回调方式
          return {
            appId,
            sign, // 直接使用后端返回的签名
            signCallback: async () => {
              // 如果需要动态获取签名，可以在这里调用后端接口
              const refreshRes = await TryApi.getAsrSign(this.$aiClient, {});
              if (refreshRes.code === 0 && refreshRes.data) {
                return refreshRes.data.sign;
              }
              return sign; // 降级使用初始签名
            },
            engineModelType: '16k_zh' // 默认使用中文16k
          };
        }
        
        return null;
      } catch (e) {
        return null;
      }
    },

    /**
     * 处理消息操作（复制、编辑、点赞等）
     */
    async handleAction(type, payload, index) {
      
      console.log('Action Clicked:', type, payload, index);
      
      if (type === 'edit') {
        // 更新本地消息内容
        if (this.messages[index]) {
          this.$set(this.messages[index], 'content', payload.content);
          this.$message.success('内容已更新');
        }
      } else if (type === 'like' || type === 'dislike' || type === 'cancel-like') {
        const message = this.messages[index];
        if (!message) return;
        
        // 只有 AI 的消息才能评价（placement === 'start' 表示 AI 消息）
        if (message.placement !== 'start') {
          return;
        }

        // 更新本地点赞状态
        this.$set(message, 'likeStatus', type === 'cancel-like' ? '' : type);
        console.log(this.chatId,message.msgId,'this.chatId,message.msgId')
        // 调用评价接口
        if (this.chatId && message.msgId) {
         
          try {
            if (type === 'cancel-like') {
              const res = await TryApi.evaluateMessage(this.$aiClient, {
                chatId: this.chatId,
                msgId: message.msgId,
                userEvaluation: 'NO_EVAL'
              });
              if (res.code === 0) {
              } else {
                // 取消评价失败，回滚本地状态
                this.$set(message, 'likeStatus', '');
                this.$message.error('取消评价失败，请重试');
              }
              return;
            }
            const userEvaluation = type === 'like' ? 'UPVOTE' : 'DOWNVOTE';
            const res = await TryApi.evaluateMessage(this.$aiClient, {
              chatId: this.chatId,
              msgId: message.msgId,
              userEvaluation
            });

            if (res.code === 0) {
            } else {
              // 评价失败，回滚本地状态
              this.$set(message, 'likeStatus', '');
              this.$message.error('评价失败，请重试');
            }
          } catch (e) {
            console.error('[TryX] Evaluate message failed:', e);
            // 评价失败，回滚本地状态
            this.$set(message, 'likeStatus', '');
            this.$message.error('评价失败，请重试');
          }
        } else {
          // 没有 chatId 或 msgId，可能是新消息，只更新本地状态
          console.warn('[TryX] Cannot evaluate message: missing chatId or msgId', {
            chatId: this.chatId,
            msgId: message.msgId
          });
        }
      }
    },

    handleFinish({ index }) {
      if (index === this.messages.length - 1) {
        this.isStreaming = false;
        // 更新会话标题 (仅对第一条消息或新会话)
        if (this.messages.length <= 2 && this.sessionApi) {
          const userMsg = this.messages.find(m => m.role === 'user');
          if (userMsg && userMsg.content) {
             this.sessionApi.updateCurrentTitle(userMsg.content.slice(0, 10));
          }
        }
      }
    },

    /**
     * 处理重新生成AI回答
     */
    async handleRegenerate(item, index) {
      // 找到对应的用户消息（通常是前一条消息）
      const userIndex = index - 1;
      if (userIndex < 0 || !this.messages[userIndex] || this.messages[userIndex].role !== 'user') {
        this.$message.warning('无法重新生成回答');
        return;
      }
      const userMsg = this.messages[userIndex];
      // 重新发送用户消息，只发送文字内容
      await this.handleSend({
        text: userMsg.content || '',
        attachments: [] // 不包含图片等附件
      });
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
      padding: 0 16px;
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
    padding: 16px 0 44px;

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

<template>
  <el-dialog custom-class="simulateVerifyModal" title="通道抓取" :visible="visible" @close="close">
    <div class="wrap">
      <div class="left">
        <div class="title">监控点列表</div>
        <AreaTreeSelect @onSelect='getClickData' style="width:342px" :panelWidth="342" v-if="visible" :isOnlyChooseLeaf="true"></AreaTreeSelect>
        <div class="channel_list">
          <el-scrollbar wrap-class="demo-scrollbar-wrap-2">
            <div v-for="(item,index) in channelList" :key="index" @click="clickChannelCard(index)" class="main_card_wrap">
              <div :class="{'card': true, 'active_card': currentCardIndex === index}">
                <div class="line">
                  <div class="jiankongdian"></div>
                  <div class="chan_name ellipsis" :title="item.channelName">{{ item.channelName }}</div>
                </div>
                <div class="line">
                  <div class="pre-text">所属</div>
                  <div class="split"></div>
                  <div class="name ellipsis" :title="item.groupName">{{ item.groupName }}</div>
                </div>
              </div>
            </div>
            <div class="empty" v-show="!channelList.length">
              <img src="../images/empty.png">
              <div class="txt">暂无点位</div>
              <div>请重新选择</div>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="middle">
        <div class="video_wrap" v-if="visible">
          <HKVideo id="playWnd" ref="hkvideo" @captureImgFromUikit="captureImgFromUikit" @getVideoSaveFile="getVideoSaveFile" @playSuccess="playSuccess"></HKVideo>
        </div>
      </div>
      <div class="right">
        <div class="oper_wrap">
          <div class="o_right">
            <el-button icon="h-icon-add" plain @click="getPicture" :disabled="getPictureDisabled">{{ `抓图(${imgList.length}/${MAX_IMAGES - limitImgsCanNumber})` }}</el-button>
            <el-button icon="h-icon-liveview" plain @click="getVideo" :disabled="getVideoDisabled">{{ `${videoSaveText}(${videoList.length}/${MAX_VIDEOS - limitVideosCanNumber})` }}</el-button>
          </div>
        </div>
        <div class="img_cards">
          <el-scrollbar wrap-class="demo-scrollbar-wrap-3">
            <div class="img_list_wrap" v-if="bgImgList&&bgImgList.length">
              <div v-for="(item,index) in bgImgList" :key="index" class="card_item" @click="onPreview(index)">
                <img v-if="item.mineType==='img'" :src="item.base64Url" :alt="item.name || '图片'">
                <div v-if="item.mineType==='video'" class="video-cover-wrapper">
                  <img :src="getVideoThumbnail(item)" :alt="item.name || '视频'" @error="handleThumbnailError">
                  <div class="play-icon-overlay">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div class="pic_size" v-show="item.mineType==='video'">{{ item.formattedDuration }}<span style="margin-left: 6px;">{{ item.fileSize }}</span></div>
                <div class="close_icon" @click.stop="deleteImg(index)">x</div>
              </div>
              <div class="img_empty" v-show="!bgImgList.length"><img src="../images/empty1.png"></div>
            </div>
          </el-scrollbar>
        </div>
        <div class="foot-btns">
          <el-button type="primary" @click="confirm" :disabled="captureing || !bgImgList.length || btnLoading">确定</el-button>
          <el-button @click="close" :disabled="captureing||btnLoading">取消</el-button>
        </div>
      </div>
      <!-- 预览弹窗 -->
      <AttachmentsPreview
        :visible="previewVisible"
        :file-list="normalizedFileList"
        :initial-index="previewIndex"
        @close="closePreview"
      />
    </div>
  </el-dialog>
</template>
<script>
import rsaSign from './rsaSign'
import HKVideo from './uikitVideo.vue'
import { TryApi } from '../api';
import AreaTreeSelect from './areaTreeSelect.vue'
import AttachmentsPreview from '@/ai-ui/attachments/AttachmentsPreview.vue';
export default {
  components: {
    AreaTreeSelect, HKVideo, AttachmentsPreview
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    limitImgsCanNumber: {
      type: Number,
      default: 0
    },
    limitVideosCanNumber: {
      type: Number,
      default: 0
    },
    fileListUploadType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      btnLoading: false,
      videoStartSaveing: false,
      currentCardIndex: null,
      channelList: [],
      currentLeftCard: {},
      bgImgList: [],
      currentImg: {},
      captureing: false, // 抓图、录制视频是否进行中
      validateCode: '',
      dobounceTime: false,
      videoThumbnails: new Map(), // 存储视频缩略图
      previewVisible: false,
      previewIndex: 0,
      startTime: '',
      endTime: '',
      playSuccessFinish: false,
      refreshTokenTimer: null // 刷新token定时器
    }
  },
  watch: {
    visible (val) {
      if (!val) {
        this.currentCardIndex = null
        this.channelList = []
        this.bgImgList = []
        this.currentLeftCard = {}
        this.btnLoading = false
        this.captureing = false
        this.playSuccessFinish = false
        // 停止刷新token定时器
        if (this.refreshTokenTimer) {
          clearInterval(this.refreshTokenTimer)
          this.refreshTokenTimer = null
        }
      }
    }
  },
  computed: {
    videoSaveText() {
      return this.videoStartSaveing ? '录制中...' : '录制视频'
    },
    getPictureDisabled() {
      return this.captureing || !this.currentLeftCard.channelId || this.videoStartSaveing || (this.bgImgList.length >= (this.MAX_IMAGES - this.limitImgsCanNumber)) || (this.bgImgList.length > 0 && this.bgImgList[0].mineType === 'video')
    },
    getVideoDisabled() {
      return this.captureing || !this.currentLeftCard.channelId || this.bgImgList.length >= 1 || (this.MAX_VIDEOS - this.limitVideosCanNumber) < 1
    },
    imgList() {
      return this.bgImgList.filter(_ => _.mineType === 'img')
    },
    videoList() {
      return this.bgImgList.filter(_ => _.mineType === 'video')
    },
    MAX_IMAGES() {
      return 30
    },
    MAX_VIDEOS() {
      return this.fileListUploadType === 'img' ? 0 : 1
    },
    normalizedFileList() {
      return this.bgImgList.map(file => ({
        rawFile: {
          name: file.name,
          type: file.mineType === 'img' ? 'image/jpeg' : 'video/mp4',
          size: file.sizeBytes || 0,
          blob: file.blobInfo,
          base64Url: file.base64Url
        },
        url: file.base64Url || URL.createObjectURL(file.blobInfo),
        name: file.name,
      }));
    }
  },
  methods: {
    playSuccess(finish) {
      this.playSuccessFinish = finish
      if(this.videoStartSaveing) {
        this.stopGetVideo()
      }
    },
    getVideoThumbnail(item) {
      // 如果已经有缓存的缩略图，直接返回
      if (this.videoThumbnails.has(item.name)) {
        return this.videoThumbnails.get(item.name);
      }
      
      // 如果正在生成缩略图，返回空字符串
      if (item._thumbnailGenerating) {
        return '';
      }
      
      // 检查视频文件是否有效
      if (!item.blobInfo || item.blobInfo.size === 0) {
        console.warn('视频文件无效，使用默认缩略图');
        const placeholder = this.generateDefaultThumbnail(item.name || '视频');
        this.videoThumbnails.set(item.name, placeholder);
        return placeholder;
      }
      
      // 标记为正在生成缩略图
      item._thumbnailGenerating = true;
      
      // 异步生成缩略图，增加重试机制
      const generateWithRetry = (retryCount = 0) => {
        const maxRetries = 2;
        
        this.generateVideoThumbnail(item).then(thumbnailUrl => {
          if (thumbnailUrl && !thumbnailUrl.includes('data:image/svg+xml')) {
            // 成功生成真实缩略图
            this.videoThumbnails.set(item.name, thumbnailUrl);
            this.$forceUpdate();
          } else if (retryCount < maxRetries) {
            // 生成了默认缩略图，但还有重试机会
            setTimeout(() => generateWithRetry(retryCount + 1), 500 * (retryCount + 1));
            return;
          } else {
            // 重试次数用完，使用默认缩略图
            const placeholder = this.generateDefaultThumbnail(item.name || '视频');
            this.videoThumbnails.set(item.name, placeholder);
            this.$forceUpdate();
          }
          item._thumbnailGenerating = false;
        }).catch(error => {
          console.error('生成视频缩略图失败:', error);
          if (retryCount < maxRetries) {
            setTimeout(() => generateWithRetry(retryCount + 1), 500 * (retryCount + 1));
          } else {
            // 重试次数用完，使用默认缩略图
            const placeholder = this.generateDefaultThumbnail(item.name || '视频');
            this.videoThumbnails.set(item.name, placeholder);
            item._thumbnailGenerating = false;
            this.$forceUpdate();
          }
        });
      };
      
      // 开始生成缩略图
      generateWithRetry(0);
      
      // 返回空字符串，等待缩略图生成完成
      return '';
    },
    
    async generateVideoThumbnail(item) {
      return new Promise((resolve, reject) => {
        if (!item.blobInfo) {
          reject(new Error('视频文件不存在'));
          return;
        }
        
        // 创建视频元素
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置视频源
        const videoUrl = URL.createObjectURL(item.blobInfo);
        video.src = videoUrl;
        
        let timeoutId = null;
        let attempts = 0;
        const maxAttempts = 3;
        const timePoints = [0.1, 0.3, 0.5, 1, 2]; // 增加更多时间点，提高成功率
        
        // 定义readyState常量（兼容性处理）
        const HAVE_NOTHING = 0;
        const HAVE_METADATA = 1;
        const HAVE_CURRENT_DATA = 2;
        const HAVE_FUTURE_DATA = 3;
        const HAVE_ENOUGH_DATA = 4;
        
        // 定义事件处理函数（提前定义以便清理）
        const onLoadedData = () => {
          tryCaptureFrame(0);
        };
        
        const onLoadedMetadata = () => {
          // 如果loadeddata没有触发，这里作为备用
          if (video.readyState >= HAVE_METADATA) {
            setTimeout(() => tryCaptureFrame(0), 100);
          }
        };
        
        const onCanPlay = () => {
          // 作为最终备用方案
          if (video.readyState >= HAVE_CURRENT_DATA) {
            setTimeout(() => tryCaptureFrame(0), 200);
          }
        };
        
        const onError = (e) => {
          console.error('视频加载错误:', e, video.error);
          cleanup();
          resolve(this.generateDefaultThumbnail(item.name || '视频'));
        };
        
        // 清理函数
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          URL.revokeObjectURL(videoUrl);
          video.removeEventListener('loadeddata', onLoadedData);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('canplay', onCanPlay);
          video.removeEventListener('error', onError);
        };
        
        // 设置总超时时间（延长到5秒）
        timeoutId = setTimeout(() => {
          console.warn('视频缩略图生成超时');
          cleanup();
          resolve(this.generateDefaultThumbnail(item.name || '视频'));
        }, 5000);
        
        const tryCaptureFrame = (timeIndex = 0) => {
          if (timeIndex >= timePoints.length || attempts >= maxAttempts) {
            console.warn('所有时间点尝试失败，使用默认缩略图');
            cleanup();
            resolve(this.generateDefaultThumbnail(item.name || '视频'));
            return;
          }
          
          attempts++;
          const time = timePoints[timeIndex];
          
          // 检查视频是否已准备好
          if (video.readyState < HAVE_METADATA) {
            console.warn(`视频未准备好，延迟尝试时间点 ${time} 秒`);
            setTimeout(() => tryCaptureFrame(timeIndex), 500);
            return;
          }
          
          video.currentTime = time;
          
          let seekTimeoutId = null;
          let seekHandled = false;
          
          const handleSeekSuccess = () => {
            if (seekHandled) return;
            seekHandled = true;
            
            if (seekTimeoutId) clearTimeout(seekTimeoutId);
            video.removeEventListener('seeked', handleSeekSuccess);
            
            try {
              // 检查视频尺寸是否有效
              if (!video.videoWidth || !video.videoHeight || video.videoWidth === 0 || video.videoHeight === 0) {
                console.warn(`时间点 ${time} 秒：无效的视频尺寸`);
                throw new Error('无效的视频尺寸');
              }
              
              // 设置画布尺寸与视频一致
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              
              // 绘制当前帧到画布
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // 转换为base64 URL
              const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              cleanup();
              resolve(thumbnailUrl);
            } catch (error) {
              console.warn(`在时间点 ${time} 秒生成缩略图失败:`, error);
              // 当前时间点失败，尝试下一个时间点
              tryCaptureFrame(timeIndex + 1);
            }
          };
          
          const handleSeekTimeout = () => {
            if (seekHandled) return;
            seekHandled = true;
            
            video.removeEventListener('seeked', handleSeekSuccess);
            console.warn(`时间点 ${time} 秒seek超时`);
            tryCaptureFrame(timeIndex + 1);
          };
          
          video.addEventListener('seeked', handleSeekSuccess);
          
          // 设置seek超时（延长到1.5秒）
          seekTimeoutId = setTimeout(handleSeekTimeout, 1500);
        };
        
        // 注册多个加载事件监听器
        video.addEventListener('loadeddata', onLoadedData);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('error', onError);
        
        // 设置静音以避免自动播放限制
        video.muted = true;
        video.preload = 'auto'; // 改为auto，确保加载更多数据
        video.crossOrigin = 'anonymous'; // 避免CORS问题
        video.playsInline = true; // 添加playsInline属性
        
        // 尝试播放以触发加载（静音状态下）
        video.play().catch(err => {
          // 这不是错误，继续处理
        });
        
        // 如果视频已经准备好，立即开始处理
        if (video.readyState >= HAVE_METADATA) {
          setTimeout(() => tryCaptureFrame(0), 100);
        }
      });
    },
    onPreview(index) {
      this.previewIndex = index;
      this.previewVisible = true;
    },
    closePreview() {
      this.previewVisible = false;
    },
    async getLeftList (node) {
      this.channelList = []
      let res = await TryApi.getMonitors(this.$aiClient, {...node, pageSize: 2000, pageNo: 1, taskType: 'DCT4', modelTypeEnum: 'DETECT', taskAnalysisMode: 'CLOUD_POLLING_SNAP'})
      if(res.code === 0 && res.data.rows && res.data.rows.length) {
        this.channelList = res.data.rows || []
        this.clickChannelCard(0)
      }
    },
    async clickChannelCard(index) {
      if(this.videoStartSaveing) {
        this.stopGetVideo()
      }
      this.currentCardIndex = index
      this.currentLeftCard = this.channelList[this.currentCardIndex]
      let data = { ...this.currentLeftCard }
      let validateCode = data.validateCode
      if (data.deviceSerial && !data.validateCode) {
        const res = await TryApi.getDeviceValidateCode(this.$aiClient, {
          deviceSerial: data.deviceSerial,
          publicKeyStr: rsaSign.getPurePubKey()
        })
        if (+res.code === 0 && res.data) {
          validateCode = rsaSign.decodeData(res.data.validateCode)
        }
      }
      data.validateCode = validateCode
      this.$refs.hkvideo.playMacVideo(data)
    },
    getClickData(node)  {
      this.getLeftList(node)
    },
    deleteImg (index) {
      this.bgImgList.splice(index, 1)
    },
    async stopGetVideo() {
      this.$message.info("视频录制已取消")
      this.videoStartSaveing = false
      await this.$refs.hkvideo.stopSaveVideo()
      this.endTime = Date.now()
      // 停止刷新token定时器
      if (this.refreshTokenTimer) {
        clearInterval(this.refreshTokenTimer)
        this.refreshTokenTimer = null
      }
    },
    getVideo() {
      if(!this.playSuccessFinish) {
        this.$message.warning('请等待视频正常播放~')
        return false
      }
      this.videoStartSaveing = !this.videoStartSaveing
      if(this.videoStartSaveing) {
        this.$refs.hkvideo.startSaveVideo()
        this.startTime = Date.now()
        // 开启定时器，每5分钟请求一次refreshToken接口
        this.refreshTokenTimer = setInterval(() => {
          TryApi.refreshToken(this.$aiClient, {})
        }, 5 * 60 * 1000)
      } else {
        this.$refs.hkvideo.stopSaveVideo()
        this.endTime = Date.now()
        // 停止定时器
        if (this.refreshTokenTimer) {
          clearInterval(this.refreshTokenTimer)
          this.refreshTokenTimer = null
        }
      }
    },
    getVideoSaveFile(res) {
      if(res && res.code === 0 && res.data && res.data.file) {
        // 计算视频文件大小并格式化显示
        let fileSize = ''
        try {
          const fileSizeInBytes = res.data.file.size
          // 格式化文件大小显示
          if (fileSizeInBytes < 1024) {
            // 小于1KB，显示字节
            fileSize = fileSizeInBytes + 'B'
          } else if (fileSizeInBytes < 1024 * 1024) {
            // 不足1MB，显示KB（四舍五入到整数）
            fileSize = Math.round(fileSizeInBytes / 1024) + 'KB'
          } else {
            // 超过1024KB，显示MB（保留1位小数）
            fileSize = (fileSizeInBytes / (1024 * 1024)).toFixed(1) + 'MB'
          }
        } catch (error) {
          fileSize = '未知大小'
        }
        // 生成文件名（使用时间戳避免重复）
        const fileName = `video_${Date.now()}.mp4`
        // 确保blob数据正确保存
        const videoItem = {
          name: fileName,
          mineType: 'video',
          fileSize: fileSize,
          blobInfo: res.data.file,
          sizeBytes: res.data.file.size || 0,
          _thumbnailGenerating: false, // 标记缩略图生成状态
          formattedDuration: res.formattedDuration || this.formatDuration(this.endTime - this.startTime)
        }
        this.bgImgList.push(videoItem)
        // 重置录制状态
        this.videoStartSaveing = false
      } else {
        this.$message.warning('录制失败，录制时间请不要太短~')
      }
    },
    // 抓图
    async getPicture () {
      if(!this.playSuccessFinish) {
        this.$message.warning('请等待视频正常播放~')
        return false
      }
      try {
        if (this.captureing) {
          this.$message.warning('正在抓图，请稍后')
          return
        }
        if (this.currentLeftCard.channelId === 'null') {
          this.$message.warning('请选择有视频的窗口进行抓图')
          return
        }
        this.captureing = true
        this.$refs.hkvideo.capturePictureFile()
      } catch (e) {
        this.captureing = false
      }
    },
    captureImgFromUikit(imgObj) {
      this.captureing = false
      if(imgObj) {
        // 计算图片大小并格式化显示
        let fileSize = ''
        if (imgObj.base64) {
          try {
            // 计算base64字符串的实际字节大小
            // 减去base64前缀（如"data:image/jpeg;base64,"）的长度
            const base64Data = imgObj.base64.split(',')[1] || imgObj.base64
            const fileSizeInBytes = Math.floor(base64Data.length * 3 / 4)
            // 格式化文件大小显示
            if (fileSizeInBytes < 1024) {
              // 小于1KB，显示字节
              fileSize = fileSizeInBytes + 'B'
            } else if (fileSizeInBytes < 1024 * 1024) {
              // 不足1MB，显示KB（四舍五入到整数）
              fileSize = Math.round(fileSizeInBytes / 1024) + 'KB'
            } else {
              // 超过1024KB，显示MB（保留1位小数）
              fileSize = (fileSizeInBytes / (1024 * 1024)).toFixed(1) + 'MB'
            }
          } catch (error) {
            fileSize = '未知大小'
          }
        } else {
          fileSize = '未知大小'
        }
        this.bgImgList.push({
          name: imgObj.fileName,
          base64Url: imgObj.base64,
          mineType: 'img',
          fileSize: fileSize
        })
      }
    },
    
    confirm() {
      let videos = this.bgImgList.filter(_ => _.mineType === 'video')
      if(videos.length > 0 && videos[0].sizeBytes > 200 * 1024 * 1024) {
        this.$message.warning('视频大小超过200M，无法分析')
        return false
      }
      this.btnLoading = true
      this.$emit('simulateVerifyFileUpload', this.bgImgList)
    },
    handleThumbnailError(event) {
      // 缩略图加载失败时，设置默认的占位图
      const imgElement = event.target;
      
      // 找到对应的视频项
      let videoName = '视频';
      const allImages = Array.from(document.querySelectorAll('.card_item img'));
      const index = allImages.indexOf(imgElement);
      
      if (index !== -1 && this.bgImgList[index]) {
        videoName = this.bgImgList[index].name || '视频';
      }
      
      imgElement.src = this.generateDefaultThumbnail(videoName);
      imgElement.onerror = null; // 防止无限循环
    },
    
    formatDuration(milliseconds) {
      // 将毫秒转换为秒
      const totalSeconds = Math.floor(milliseconds / 1000);
      
      // 计算分钟和秒（小时通常不会涉及到）
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      // 格式化为00:00格式（分钟:秒）
      return [
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
    },
    
    generateDefaultThumbnail(videoName) {
      // 创建SVG缩略图，只显示视频名称，去掉上面的图案
      const displayName = videoName || '视频';
      const svgContent = `
        <svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="320" height="180" fill="#F3F4F6"/>
          <text x="160" y="90" text-anchor="middle" fill="#9CA3B4" font-family="Arial, sans-serif" font-size="14" font-weight="bold" dominant-baseline="middle">${displayName}</text>
        </svg>
      `;
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
    },
    
    close () {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .middle{
    flex: 1;
    // display: flex;
    flex-direction: column;
    .video_wrap{
      width: 100%;
      height: calc(100% - 10px);
      display: flex;
    }
  }
  .right{
    width: 368px;
    padding-left: 24px;
    .foot-btns{
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
    .oper_wrap{
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .img_cards{
      height: calc(100% - 160px);
    }
    .img_list_wrap{
      display: flex;
      flex-wrap: wrap;
      .card_item{
        margin-bottom: 12px;
        position: relative;
        .video-cover-wrapper {
          position: relative;
          cursor: pointer;
          display: inline-block;

          .play-icon-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 48px;
            height: 48px;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(2px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            transition: all 0.2s;
            pointer-events: none;

            svg {
              margin-left: 2px; /* 视觉修正 */
            }
          }

          &:hover .play-icon-overlay {
            background: rgba(0, 0, 0, 0.6);
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        .close_icon{
          position: absolute;
          right: 0;
          top: 0;
          width: 20px;
          height: 20px;
          background: #0000007F;
          color: #fff;
          text-align: center;
          cursor: pointer;
          border-bottom-left-radius: 10px;
        }
        .pic_size{
          height: 32px;
          line-height: 32px;
          padding-left: 12px;
          padding-right: 12px;
          position: absolute;
          left: 8px;
          bottom: 8px;
          color: #fff;
          border-radius: 4px;
          background: #000000B2;
        }
        img{
          width: 320px;
          height: 180px;
        }
        .time{
          height: 20px;
          margin-top: 4px;
          color: rgba(0,0,0,0.70);
        }
      }
      .card_item:nth-child(3n) {
        margin-right: 0;
      }
      .img_empty{
        width: 100%;
        img{
          width: 136px;
          height: 136px;
          margin: 45% auto 0;
        }
      }
    }
  }
  .left{
    width: 390px;
    padding-left: 24px;
    .title{
      color: rgba(0,0,0,0.90);
      font-weight: 600;
      margin-top:16px;
      margin-bottom:12px
    }
    .channel_list{
      .main_card_wrap{
        padding-right: 14px;
      }
      .card{
        width: 100%;
        height: 62px;
        border-radius: 4px;
        cursor: pointer;
        padding: 10px 9px 0;
        margin-top: 8px;
        &:hover{
          background: rgba(0,0,0,0.02);
        }
        .line{
          display: flex;
          align-items: center;
          margin-bottom: 2px;
        }
        .pre-text{
          font-size: 12px;
          color: rgba(0,0,0,0.40);
        }
        .split{
          width: 1px;
          height: 10px;
          background: #E2E3E6;
          margin: 0 6px;
        }
        .name{
          width: 280px;
        }
        .chan_name{
          width: 290px;
          color: rgba(0,0,0,0.90);
        }
        .jiankongdian{
          width: 24px;
          height: 24px;
          background: url(../images/channel.png) no-repeat;
          background-size: cover;
          margin-right: 8px;
        }
      }
      .active_card{
        background: rgba(27,88,244,0.04);
        .chan_name{
          color: rgba(30,127,255,0.90);
        }
      }
    }
    .empty{
      color: #ccc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-right: 16px;
      img{
        width:92px;
        height: 83px;
        margin-top: 160px;
      }
      .txt{
        margin: 16px 0 8px
      }
    }
  }
}
</style>
<style lang="scss">
.simulateVerifyModal{
  margin: 0 !important;
  width: calc(100vw - 100px)!important;
  height: calc(100vh - 100px);
  top: 50px !important;
  left: 50px!important;
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .channel_list{
    height: calc(100% - 90px);
    .demo-scrollbar-wrap-2{
      height: 100%;
      overflow-x: hidden;
    }
  }
  .demo-scrollbar-wrap-3{
    overflow-x: hidden;
    height: 100%;
  }
  .el-button.is-icon-text{
    padding-left: 8px;
    padding-right: 12px;
  }
  .el-dialog__header {
    height: 56px;
    border-radius: 8px 8px 0 0;
    .el-dialog__title {
      line-height: 56px;
      font-size: 16px;
      color: rgba(0,0,0,0.90);
      letter-spacing: 0.15px;
      text-align: left;
      font-weight: 600;
      padding-left: 24px;
    }
    .el-dialog__headerbtn {
      right: 24px;
      top: 10px;
    }
  }
  .el-dialog__body {
    padding: 0;
    height: calc(100% - 56px);
    .el-dialog__body-wrapper {
      height: 100%;
      padding: 0;
    }
  }
}
</style>

<template>
  <div class="agent-x-container">
    <div class="video-switch">
      <div class="video-switch-tab">
        <div class="video-switch-tab-line" :style="switchLineStyle">
        </div>
        <div class="video-switch-tab-btn" @click="switchTo(0)" :class="{'tab-active': (switchVideo===0?true : false )}">实时预览</div>
        <div class="video-switch-tab-btn" @click="switchTo(1)" :class="{'tab-active':(switchVideo===1?true : false )}">录像回放</div>
      </div>
    </div>
    <div class="players" :class="`screen_${playerCount}`" ref="container" >
      <div v-for="(p, idx) in playerControllers"
        :key="p.containerID"
        class="player"
        :class="{selected: idx === currentPlayerControllerIndex}"
        @click="currentPlayerControllerIndex = idx"
        v-show="playerCount > idx">
        <div :id="p.containerID">
          <span class="tips">请选择监控点</span>
        </div>
      </div>
      <waterMark v-if="watermarkStatus" ref="watermark" v-show="false"></waterMark>
    </div>
  </div>
</template>

<script>
import { TryApi } from '../api';
// import { getDeviceRamAccount, getCredentials, getTokenStrategy, getTkToken } from './proxy'
// import { getClient, dataURLtoBlob } from '@/utils/index.js'
import waterMark from './simpleWaterMark.vue'
import { v1 as uuidv1 } from 'uuid'
import moment from 'moment'
import _ from 'lodash'

export default {
  name: 'uikitComponent',
  components: {
    waterMark,
  },
  props: {
    feedbackReason: {
      type: Boolean,
      default: false,
    },
    pictureFeedbackReason: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      switchVideo: 0, // 0实时预览 1录像回放
      // 是否已获取tokenMode
      isTokenModeInit: false,
      // 1原先逻辑，2使用小权限token
      tokenMode: 1,
      capturePictureTimer: null,
      localPlayerCountKey: 'Chain_UikitPlayerCount',
      downloadTimer: undefined,
      playerCount: 1,
      currentPlayerControllerIndex: 0,
      playerControllers: [],
      container: {
        width: 0,
        height: 0,
      },
      themeData: {},
      resizeObserver: undefined,
      isUikitFullScreen: false,
      feedbackReasonEnable: false,
      // 是否记忆监控点清晰度
      videoLevelEnable: false,
      localChannelVideoLevelKey: 'Chain_UikitChannelVideoLevel',
      localChannelVideoLevel: {},
      // 是否按分屏自适应清晰度
      adaptiveEnable: false,
      adaptiveScreen: 4,
      watermarkStatus: ''
    }
  },
  created() {
    this.playerCount = 1
    // 目前最多4个，先生成未实例化的对象，根据需要再实例化uikit实例
    this.playerControllers = new Array(1).fill(1).map((e, idx) => this.genPlayerController(idx))
  },
  mounted() {
    this.getThemeData()
    this.resizeObserver = new ResizeObserver((entries) => {
      this.resizeTrigger()
    })
    this.resizeObserver.observe(this.$refs.container)
  },
  beforeDestroy() {
    if (this.capturePictureTimer) {
      clearTimeout(this.capturePictureTimer)
      this.capturePictureTimer = null
    }
    this.resizeObserver.unobserve(this.$refs.container)
  },
  destroyed() {
    this.playerControllers.forEach(pc => {
      window.EZUIKit[pc.containerID] && (window.EZUIKit[pc.containerID].state.EZUIKitPlayer.themeInit = false)
      pc.player && pc.player.stop()
    })
  },
  computed: {
    isHD() {
      // return this.$store.state.userInfo.videoLevelStatus === 2
      return true
    },
    currentPlayerController() {
      return this.playerControllers[this.currentPlayerControllerIndex]
    },
    resizeTrigger() {
      return _.debounce(this.resizeHandler, 300)
    },
    playModelTag() {
      return ['live', 'rec'][this.switchVideo]
    },
    currentThemeData() {
      
      let td = this.themeData[['previewTheme', 'playBackTheme'][this.switchVideo]] || { header: {btnList: []}, footer: {btnList: []}}
      if (this.feedbackReasonEnable) {
        td.footer.btnList = td.footer.btnList.filter(btn => btn.iconId != 'recordvideo')
        if (this.pictureFeedbackReason) {
          td.footer.btnList = td.footer.btnList.filter(btn => btn.iconId != 'capturePicture')
        }
      }
      return td
    },
    switchLineStyle: function () {
      if (this.switchVideo === 0) {
        return {
          transform: 'translateX(0px)'
        }
      }
      return {
        transform: 'translateX(88px)'
      }
    }
  },
  watch: {
    playerCount(nv, ov) {
      if (nv > ov) {
        this.playerControllers.forEach((pc, idx) => {
          if (this.adaptiveEnable&&nv>=this.adaptiveScreen && pc.player) {
            const levels = pc.player.getVideoLevelList()
            if (levels && levels.length) {
              let lowestLevel = levels.sort((a, b) => a.level - b.level)[0].level
              pc.channelVideoLevel = lowestLevel
              pc.player.changeVideoLevel(lowestLevel)
            }
          }
          if (idx < ov || idx >= nv || !pc.player) return
          this.playVideo(pc)
        })
      } else {
        this.playerControllers.forEach((pc, idx) => {
          if (!pc.player || idx < this.playerCount) return
          pc.player.stop()
        })
        if (this.currentPlayerControllerIndex >= this.playerCount) {
          this.currentPlayerControllerIndex = 0
        }
      }
      this.resizeTrigger()
      localStorage.setItem(this.localPlayerCountKey, nv)
    },
    switchVideo() {
      this.playerControllers.forEach((pc, idx) => {
        if (!pc.player || idx >= this.playerCount) return
        this.playVideo(pc)
      })
    },
    currentPlayerController(nv) {
      if (!nv.playInfo.deviceSerial) return
      this.reportPlayInfo(nv.playInfo)
    },
  },
  methods: {
    switchTo (num) {
      this.switchVideo = num
      this.playSuccessCallback(false)
    },
    updateLocalChannelVideoLevel(pc) {
      if (!this.videoLevelEnable) return
      this.localChannelVideoLevel[pc.playInfo.channelId] = {
        deviceSerial: pc.playInfo.deviceSerial,
        channelNo: pc.playInfo.channelNo,
        videoLevel: pc.player.getVideoLevel()
      }
      localStorage.setItem(this.localChannelVideoLevelKey, JSON.stringify(this.localChannelVideoLevel))
    },
    showFeedbackReasonIfNeeded(data, recordType) {
      if (!this.feedbackReasonEnable) return Promise.resolve()
      if (!this.pictureFeedbackReason && recordType === 2) return Promise.resolve()
      const { channelId, storeId, groupId } = data
      return this.$refs.videoReasonDialog.open({
        channelId,
        storeId,
        groupId,
      }, recordType)
    },
    reportPlayInfo(playInfo) {
    },
    resizeHandler() {
      this.syncSize()
      if (this.isUikitFullScreen) return
      this.playerControllers.forEach((pc, idx) => {
        if (!pc.player || this.playerCount <= idx) return
        pc.player.reSize(this.container.uikitWidth, this.container.uikitHeight)
      })
    },
    syncSize() {
      let containerWidth = this.$refs.container.clientWidth
      let containerHeight = this.$refs.container.clientHeight
      let container = {
        containerWidth,
        containerHeight,
        uikitWidth: (this.playerCount >= 2 ? containerWidth / 2 : containerWidth) - 2,
        uikitHeight: (this.playerCount >= 4 ? containerHeight / 2 : containerHeight) - 2,
      }

      this.container = container
    },
    clearIntervalFun () {
      this.downloadTimer && clearInterval(this.downloadTimer)
      this.downloadTimer = null 
    },
    startExtraBtnDownload (pc, downloadVideoName) { // 扩展的录制按钮开始的一些状态设置
      pc.player.Theme.countTime('add', 0)
      if (downloadVideoName) {
        pc.player.startSave(downloadVideoName)
      } else {
        pc.player.startSave()
      }
    },
    stopExtraBtnDownload (pc) { // 扩展的录制按钮停止的一些状态清除，
      pc.player.stopSave()
      pc.player.Theme.countTime('destroy', 0)
      pc.player.pluginStatus.loadingClear()
    },
    /**
     * 获取tokenMode
     */
    async tokenModeInit() {
      const {code, data} = await TryApi.getTokenStrategy(this.$aiClient)
      if (code===0) {
        this.tokenMode = data.uikit || 1
        this.isTokenModeInit = true
      }
    },
    /**
     * 获取token信息
     * @param apiMap 请求接口map {1: xxx, 2: getTkToken}
     * @param apiParams 请求参数map {1:xxx, 2: [{deviceSerial: '', channelNoList[]}]}
     */
    async genTokenInfo(apiMap, apiParams) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!this.isTokenModeInit) {
            await this.tokenModeInit()
          }
          const apiFunc = apiMap[this.tokenMode]
          const res = await apiFunc(this.$aiClient, apiParams[this.tokenMode])
          resolve(res)
        } catch(e) {
          if (this.tokenMode===2) {
            this.$message.error('取流失败，请稍后重试')
          }
          reject(e)
        }
      })
    },
    genPlayerController(i) {
      return {
        containerID: `uikit_${i}`,
        url: undefined,
        accessToken: undefined,
        token: {
          streamToken: {
            live: undefined,
            rec: undefined,
            talk: undefined
          },
          deviceToken: {
            video: undefined,
            global: undefined
          },
          httpToken: {
            url: undefined
          },
        },
        player: undefined,
        playing: false,
        playbackRecording: false,
        playInfo: {
          deviceSerial: undefined,
          channelNo: undefined,
          storeId: undefined,
          channelId: undefined,
        },
        watermarkInjected: false,
      }
    },
    /// 外部调用方法
    playMacVideo(videoData) {
      let index = this.playerControllers.findIndex(pc => pc.playInfo.deviceSerial === videoData.deviceSerial && pc.playInfo.channelNo === videoData.channelNo)
      if (index > -1) {
        this.currentPlayerControllerIndex = index
        return
      }
      this.requestAT(this.currentPlayerController, videoData)
    },
    startSaveVideo() {
      let pc = this.currentPlayerController
      if (!pc.player) {
        callback({}, '请先选择播放中的画面')
        return
      }
      pc.player.startSave()
    },
    stopSaveVideo() {
      let pc = this.currentPlayerController
      pc.player.stopSave()
    },
    getVideoSaveFile(res) {
      this.$emit('getVideoSaveFile', res)
    },
    capturePictureFile() {
      let pc = this.currentPlayerController
      let picCapturedEmitted = false
      let callback = (data, errMsg) => {
        if (picCapturedEmitted) return
        picCapturedEmitted = true
        if (errMsg) {
          this.$message.error(errMsg)
        }
        this.$emit('captureImgFromUikit')
      }
      if (!pc.player) {
        callback({}, '请选择播放中的画面抓图')
        return
      }
      if (this.capturePictureTimer) {
        clearTimeout(this.capturePictureTimer)
        this.capturePictureTimer = null
      }
      this.capturePictureTimer = setTimeout(() => {
        // 某些情况下抓图报错，不会触发回调，也不会被catch到，需要给外部事件，不然业务层会判断还在抓图中，拦截后续抓图操作的触发，正常考虑5秒足够抓图且上传，没有办法的办法
        callback({}, '抓图失败，请确认视频是否正常播放，再进行重试')
      }, 5000)
      pc.player.capturePicture('default',async img => {
        if (!img) return
        clearTimeout(this.capturePictureTimer)
        this.capturePictureTimer = null
        this.$emit('captureImgFromUikit', img)
      }, false).catch(e => {
        callback({}, '抓图失败，请确认视频是否正常播放，再进行重试')
      })
    },
    async uploadFile(imgObject, ossCode) {
      try {
        const ossSign = await this.getCredentials(ossCode)
        if (!this.client) {
          this.client = getClient(ossSign)
        }
        const objectPath = ossSign.object + uuidv1() + imgObject.fileName.substring(imgObject.fileName.lastIndexOf('.'))
        let file = new File([dataURLtoBlob(imgObject.base64)], "default", {
          type: "image/jpeg",
        })
        const result = await this.client.multipartUpload(objectPath, file)
        return `${ossSign.domain}/${result.name}`
      } catch (e) {
        this.$message.error('上传出错，请重新上传')
      }
    },
    async getCredentials(ossCode) {
      const { code, data } = await TryApi.getCredentials(this.$aiClient, ossCode)
      if (code !== 0) throw new Error('获取上传信息错误')
      return data
    },
    async requestAT(pc, videoData) {
      const apiMap = {
        1: TryApi.getDeviceRamAccount,
        2: TryApi.getTkToken,
      }
      const apiParams ={
        1: {
          deviceSerial: videoData.deviceSerial
        },
        2: [
          {
            deviceSerial: videoData.deviceSerial,
            channelNoList: [videoData.channelNo]
          }
        ]
      }
      let { code, data} = await this.genTokenInfo(apiMap, apiParams)
      if (code !== 0) {
        pc.player && pc.player.stop()
        return
      }
      if (pc.playInfo.deviceSerial === videoData.deviceSerial && pc.playInfo.channelNo === videoData.channelNo) {
        // 接口返回前对同一个监控点触发多次播放，则playMacVideo方法无法成功拦截，这里再做一层拦截 - - 
        return
      }
      pc.accessToken = this.tokenMode===2?undefined:data.token
      if (this.tokenMode === 2&&data&&data.length) {
        // 设备不存在、设备不在当前租户等异常情况处理
        if(!data[0].deviceSerial) {
          this.$message.error(data[0].errorMsg || '取流失败，请稍后重试')
          pc.player && pc.player.stop()
          return
        }
        const streamToken = (data[0].streamTkTokenInfoList||[]).find(_ => +_.channelNo === +videoData.channelNo)
        pc.token = {
          streamToken: {
            live: streamToken?streamToken.streamTokenPreview:undefined,
            rec: streamToken?streamToken.streamTokenPlayback:undefined,
            talk: streamToken?streamToken.streamTokenTalk:undefined,
          },
          deviceToken: {
            video: data[0].deviceTokenVideo,
            global: data[0].deviceTokenGlobal,
          },
          httpToken: {
            url: data[0].httpToken,
          },
        }
      } else {
        pc.token = {
          streamToken: {
            live: undefined,
            rec: undefined,
            talk: undefined
          },
          deviceToken: {
            video: undefined,
            global: undefined
          },
          httpToken: {
            url: undefined
          },
        }
      }
      pc.playInfo = videoData
      this.currentPlayerControllerIndex = (this.currentPlayerControllerIndex + 1) % this.playerCount
      // 一分屏或者下一屏未播放的情况下，需要主动上报一次
      if (this.playerCount == 1 || !this.playerControllers[this.currentPlayerControllerIndex].playInfo.deviceSerial) {
        this.reportPlayInfo(videoData)
      }
      this.showFeedbackReasonIfNeeded(pc.playInfo, 0).then(() => {
        this.playVideo(pc)
      })
    },
    // 内部方法，播放视频请使用playMacVideo
    playVideo(pc) {
      let isHD = this.isHD
      // let channelVideoLevel = this.$store.state.userInfo.videoLevelStatus
      let channelVideoLevel = 3
      if (this.videoLevelEnable && this.localChannelVideoLevel[pc.playInfo.channelId]) {
        channelVideoLevel = this.localChannelVideoLevel[pc.playInfo.channelId]?.videoLevel
        isHD = channelVideoLevel >= 2
      }
      if (this.adaptiveEnable&&this.playerCount>this.adaptiveScreen) {
        isHD = false
        channelVideoLevel = 0
      }
      pc.channelVideoLevel = channelVideoLevel
      pc.hasChangedLevel = false
      pc.url = `ezopen://${pc.playInfo.validateCode ? pc.playInfo.validateCode + '@' : ''}open.ys7.com/${pc.playInfo.deviceSerial}/${pc.playInfo.channelNo}${isHD ? '.hd' : ''}.${this.playModelTag}`
      let playUrl = pc.url
      if (this.switchVideo && pc.playInfo.startTime) {
        // 控件的回放时间是秒级，这里兼容下，外部可以统一处理
        playUrl += `?begin=${moment(+pc.playInfo.startTime * 1000).format('yyyyMMDDHHmmss')}`
      }
      // 你问我为什么这么写而不是最开始初始化，然后每次播放的时候传url和at。。。。那是因为初始化的时候解码器会正则解析url，不传url就报错block，凉凉
      if (pc.player) {
        pc.player.changePlayUrl({
          url: playUrl,
          accessToken: pc.accessToken,
          token: pc.token,
        }, () => {}, false).then(() => {
          pc.player.Talk.changeTalkChannelNo(pc.playInfo.channelNo)
        }).finally(() => {
          pc.player.Theme.changeTheme(this.currentThemeData)
        })
        return
      }
      this.syncSize()
      try {
        pc.player = new EZUIKit.EZUIKitPlayer({
          id: pc.containerID, // 视频容器ID
          url: playUrl,
          accessToken: pc.accessToken,
          token: pc.token,
          themeData: this.currentThemeData,
          width: this.container.uikitWidth,
          height: this.container.uikitHeight,
          useSeek: false,
          talkChannelNo: pc.playInfo.channelNo,
          downloadRecord: false,
          handleSuccess: (params) => {
            pc.playing = true
            const currentLevel = pc.player.getVideoLevel()
            if (pc.channelVideoLevel===-1||pc.channelVideoLevel === currentLevel) {
              pc.hasChangedLevel = true
            }
            if (!pc.hasChangedLevel && pc.channelVideoLevel>-1 &&pc.channelVideoLevel !== currentLevel) {
              const levels = pc.player.getVideoLevelList()
              if (levels && levels.length) {
                let lowestLevel = levels.sort((a, b) => a.level - b.level)[0].level
                if (pc.channelVideoLevel<lowestLevel) {
                  pc.channelVideoLevel = lowestLevel
                }
              }
              pc.player.changeVideoLevel(pc.channelVideoLevel)
            }
            this.updateLocalChannelVideoLevel(pc)
            this.injectWatermarkIfNeeded(pc)
            let hideId = document.getElementsByClassName('header-controls')[0]
            hideId.style.display = 'none'
            this.playSuccessCallback(true)
          },
          handleError: (params) => {
            pc.playing = false
            this.injectWatermarkIfNeeded(pc)
            // 录制的时候触发播放报错，会导致录制按钮无法停止录制，这里手动停止一下
            if (pc.playbackRecording) {
              this.clearIntervalFun()
              pc.playbackRecording = false
              this.stopExtraBtnDownload(pc, true)
            }
            if (params&&+params.code===10001&&pc.playInfo.validateCode&&!(/^[A-Za-z0-9]+$/.test(pc.playInfo.validateCode))) {
              this.$message.error('播放失败，请检查设备验证码是否含有特殊字符')
            }
            this.playSuccessCallback(false)
          },
        })
        // 初始化时，验证码错误不会在handleError中触发，这里单独判断一下
        if (pc.playInfo.validateCode && !(/^[A-Za-z0-9]+$/.test(pc.playInfo.validateCode))) {
          this.$message.error('播放失败，请检查设备验证码是否含有特殊字符')
        }
        // 监听开启录制事件
        pc.player.eventEmitter.on(EZUIKit.EZUIKitPlayer.EVENTS.startSave, () => {
          pc.playbackRecording = true
        });
        pc.player.eventEmitter.on(EZUIKit.EZUIKitPlayer.EVENTS.stopSave, (res) => {
          pc.playbackRecording = true
          this.getVideoSaveFile(res)
        });
        pc.player.eventEmitter.on(EZUIKit.EZUIKitPlayer.EVENTS.fullscreen, (res) => {
          this.isUikitFullScreen = true
        })
        pc.player.eventEmitter.on(EZUIKit.EZUIKitPlayer.EVENTS.exitFullscreen, (res) => {
          this.isUikitFullScreen = false
        })
        pc.player.eventEmitter.on('changeVideoLevel', (res) => {
          pc.hasChangedLevel = true
          this.updateLocalChannelVideoLevel(pc)
        })
      } catch (error) {
        // 清理可能创建的部分资源
        if (pc.player) {
          try {
            pc.player.stop()
          } catch (e) {
          }
          pc.player = null
        }
      }
    },
    playSuccessCallback(flag) {
      this.$emit('playSuccess', flag)
    },
    injectWatermarkIfNeeded(pc) {
      if (!this.watermarkStatus || pc.watermarkInjected) return
      pc.watermarkInjected = true
      let node = this.$refs.watermark.$el.cloneNode(true)
      node.style.display = ''
      document.getElementById(pc.containerID).appendChild(node)
    },
    getThemeData(){
      this.themeData = {
        "previewTheme": {
          "header": {
              "color": "#FFFFFF",
              "activeColor": "#FFCD29",
              "backgroundColor": "#0000004b",
              "btnList": [
                  {
                      "iconId": "deviceID",
                      "part": "left",
                      "memo": "顶部设备ID",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "deviceName",
                      "part": "left",
                      "memo": "顶部设备名称",
                      "isrender": 1,
                      "defaultActive": 0
                  }
              ]
          },
          "footer": {
              "color": "#FFFFFF",
              "activeColor": "#FFCD29",
              "backgroundColor": "#0000004b",
              "btnList": [
                  {
                      "iconId": "play",
                      "part": "left",
                      "memo": "播放",
                      "isrender": 1,
                      "defaultActive": 1
                  },
                  {
                      "iconId": "capturePicture",
                      "part": "left",
                      "memo": "截屏按钮",
                      "isrender": 0,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "sound",
                      "part": "left",
                      "memo": "声音按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "pantile",
                      "part": "left",
                      "memo": "云台控制按钮",
                      "isrender": 0,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "recordvideo",
                      "part": "left",
                      "memo": "录制按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "talk",
                      "part": "left",
                      "memo": "对讲按钮",
                      "isrender": 0,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "hd",
                      "part": "right",
                      "memo": "清晰度切换按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "webExpend",
                      "part": "right",
                      "memo": "网页全屏按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "expend",
                      "part": "right",
                      "memo": "全局全屏按钮",
                      "isrender": 0,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "zoom",
                      "part": "left",
                      "memo": "电子放大",
                      "isrender": 0,
                      "defaultActive": 0
                  }
              ]
          }
        },
        "playBackTheme": {
          "header": {
              "color": "#FFFFFF",
              "activeColor": "#FFCD29",
              "backgroundColor": "#0000004b",
              "btnList": [
                  {
                      "iconId": "deviceID",
                      "part": "left",
                      "memo": "顶部设备ID",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "deviceName",
                      "part": "left",
                      "memo": "顶部设备名称",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "cloudRec",
                      "part": "right",
                      "memo": "顶部云存储回放",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "rec",
                      "part": "right",
                      "memo": "顶部SD回放",
                      "isrender": 1,
                      "defaultActive": 0
                  }
              ]
          },
          "footer": {
              "color": "#FFFFFF",
              "activeColor": "#FFCD29",
              "backgroundColor": "#0000004b",
              "btnList": [
                  {
                      "iconId": "speed",
                      "part": "right",
                      "memo": "倍速按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "play",
                      "part": "left",
                      "memo": "播放",
                      "isrender": 1,
                      "defaultActive": 1
                  },
                  {
                      "iconId": "capturePicture",
                      "part": "left",
                      "memo": "截屏按钮",
                      "isrender": 0,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "sound",
                      "part": "left",
                      "memo": "声音按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "recordvideo",
                      "part": "left",
                      "memo": "录制按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "webExpend",
                      "part": "right",
                      "memo": "网页全屏按钮",
                      "isrender": 1,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "expend",
                      "part": "right",
                      "memo": "全局全屏按钮",
                      "isrender": 0,
                      "defaultActive": 0
                  },
                  {
                      "iconId": "zoom",
                      "part": "left",
                      "memo": "电子放大",
                      "isrender": 0,
                      "defaultActive": 0
                  }
              ]
          }
        }
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.agent-x-container{
  ::v-deep #uikit_0-speed, #uikit_1-speed, #uikit_2-speed, #uikit_3-speed {
    display: none;
  }

  ::v-deep .theme-icon-item span[id*="-recordvideo"] {
    display: none !important;
  }
}
.agent-x-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  .video-switch {
    height: 36px;
    background: #333333;
    display: flex;
    align-items: center;
  }
  .video-switch-tab {
    height: 36px;
    margin: 0 auto;
    transition: transform 0.3s;
    position: relative;
  }
  .video-switch-tab-line {
    position: absolute;
    width: 88px;
    top: 0;
    left: 0;
    height: 3px;
    background-color: #e72528;
    z-index: 1;
    transition: 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  .video-switch-tab-btn {
    font-size: 12px;
    font-weight: 800;
    float: left;
    line-height: 36px;
    color: #fff;
    opacity: 0.6;
    width: 88px;
    box-sizing: content-box;
    text-align: center;
    cursor: pointer;
  }
  .tab-active {
    opacity: 1;
  }
  .players {
    flex: 1;
    overflow: hidden;
    position: relative;
    line-height: 0px;
    &.screen_1 > .player {
      width: 100%;
      height: 100%;
    }
    &.screen_2 > .player {
      width: 50%;
      height: 100%;
    }
    &.screen_4 > .player {
      width: 50%;
      height: 50%;
    }
  }
  .player {
    background:black;
    border: 1px solid #444;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    overflow: hidden;
    &:nth-child(1) {
      left: 0;
      top: 0;
    }
    &:nth-child(2) {
      left: 50%;
      top: 0;
    }
    &:nth-child(3) {
      left: 0;
      top: 50%;
    }
    &:nth-child(4) {
      left: 50%;
      top: 50%;
    }
    &.selected {
      border-color: yellow;
    }
    .tips {
      color: white;
    }
  }
}
</style>

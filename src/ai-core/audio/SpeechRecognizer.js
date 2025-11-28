/**
 * 腾讯云实时语音识别 & 录音管理器
 */
export class SpeechRecognizer {
  constructor(options = {}) {
    this.ws = null;
    this.mediaStream = null;
    this.audioContext = null;
    this.scriptProcessor = null;
    this.config = options;
    
    // 静音检测相关
    this.silenceTimer = null;
    this.silenceThreshold = options.silenceThreshold || 0.02; // 音量阈值
    this.silenceDuration = options.silenceDuration || 3000; // 静音持续多久自动断开(ms)
    
    // 回调
    this.onText = options.onText || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * 开始录音识别
   * @param {string} url - 腾讯云带签名的 WSS URL
   */
  async start(url) {
    if (!url) {
      this.onError(new Error('WebSocket URL is required'));
      return;
    }

    try {
      // 1. 获取麦克风权限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. 初始化 AudioContext 处理音频流
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      
      // 创建 ScriptProcessor 用于获取音频数据 (缓冲区大小 4096)
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      // 3. 连接 WebSocket
      this.ws = new WebSocket(url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.onStart();
        // 连接建立后，开始处理音频流
        source.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);
      };

      this.ws.onmessage = (e) => {
        const res = JSON.parse(e.data);
        if (res.code !== 0) {
          this.onError(new Error(res.message));
          return;
        }
        // 腾讯云返回的字段: result.voice_text_str
        if (res.result) {
          this.onText(res.result.voice_text_str, res.final === 1);
        }
      };

      this.ws.onerror = (e) => this.onError(e);

      // 4. 实时音频处理
      this.scriptProcessor.onaudioprocess = (e) => {
        if (this.ws.readyState !== WebSocket.OPEN) return;

        const inputBuffer = e.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // 单声道

        // A. 发送数据 (这里简化处理，实际需要降采样到 16k 并转 16bit PCM)
        // 为了演示逻辑，这里假设输入已经是符合要求的，实际项目需引入 recorder-core 等库进行转换
        const pcmData = this._floatTo16BitPCM(inputData);
        this.ws.send(pcmData);

        // B. 静音检测
        this._checkSilence(inputData);
      };

    } catch (error) {
      this.onError(error);
      this.stop();
    }
  }

  /**
   * 停止录音
   */
  stop() {
    // 1. 发送结束帧 (腾讯云协议)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'end' }));
      this.ws.close();
    }

    // 2. 停止音频流
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    this.ws = null;
    this.mediaStream = null;
    this.onStop();
  }

  /**
   * 简单的静音检测逻辑
   */
  _checkSilence(data) {
    let sum = 0.0;
    for (let i = 0; i < data.length; ++i) {
      sum += data[i] * data[i];
    }
    const volume = Math.sqrt(sum / data.length);

    if (volume < this.silenceThreshold) {
      // 声音很小，开启倒计时
      if (!this.silenceTimer) {
        this.silenceTimer = setTimeout(() => {
          console.log('[ASR] Auto stop due to silence');
          this.stop();
        }, this.silenceDuration);
      }
    } else {
      // 有声音，清除倒计时
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    }
  }

  /**
   * Float32 转 Int16 PCM
   */
  _floatTo16BitPCM(input) {
    let output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
  }
}


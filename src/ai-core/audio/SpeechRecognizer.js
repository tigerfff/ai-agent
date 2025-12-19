/**
 * 腾讯云语音识别 SDK 封装
 * 依赖：需要在 index.html 中引入 speechrecognizer.js
 * 文档: https://github.com/TencentCloud/tencentcloud-speech-sdk-js
 */
export class SpeechRecognizerWrapper {
  constructor(options = {}) {
    this.recognizer = null;
    this.options = options;
    
    // 从 window 对象获取 SDK 类（由 speechrecognizer.js 全局注册）
    this.SpeechRecognizerClass = window.WebAudioSpeechRecognizer;

    if (!this.SpeechRecognizerClass) {
      console.error('WebAudioSpeechRecognizer not found. Please ensure speechrecognizer.js is loaded in index.html');
    }
    
    // 回调函数
    this.onText = options.onText || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * 开始识别
   * @param {Object} config - 鉴权配置
   * @param {string} config.secretId - 腾讯云 SecretId
   * @param {string} config.secretKey - 腾讯云 SecretKey
   * @param {number} config.appId - 应用ID（必须是数字）
   * @param {string} [config.engineModelType='16k_zh'] - 引擎模式
   * @param {string} [config.hotwordId] - 热词ID
   */
  start(config) {
    if (this.recognizer) {
      this.stop();
    }

    try {
      // 检查 SDK 是否已加载
      if (!this.SpeechRecognizerClass) {
        throw new Error('WebAudioSpeechRecognizer not found. Please ensure speechrecognizer.js is loaded.');
      }

      // 根据官方示例配置参数
      const params = {
          secretid: config.secretId,
          secretkey: config.secretKey,
          appid: config.appId,
        engine_model_type: config.engineModelType || '16k_zh',
        // 以下为可选参数
        voice_format: config.voice_format || 1,
          hotword_id: config.hotwordId || '',
        needvad: config.needvad !== undefined ? config.needvad : 1,
        filter_dirty: config.filter_dirty !== undefined ? config.filter_dirty : 1,
        filter_modal: config.filter_modal !== undefined ? config.filter_modal : 1,
        filter_punc: config.filter_punc !== undefined ? config.filter_punc : 0,
        convert_num_mode: config.convert_num_mode !== undefined ? config.convert_num_mode : 1,
        word_info: config.word_info !== undefined ? config.word_info : 0
      };

      console.log('[ASR] Creating WebAudioSpeechRecognizer with params:', {
        appid: params.appid,
        engine_model_type: params.engine_model_type,
        hasSecretId: !!params.secretid,
        hasSecretKey: !!params.secretkey
      });

      // 创建识别器实例（根据官方示例）
      this.recognizer = new this.SpeechRecognizerClass(params);

      // 绑定事件监听器（参照官方示例的命名）
      this.recognizer.OnRecognitionStart = (res) => {
        console.log('[ASR] 开始识别', res);
        this.onStart();
      };

      this.recognizer.OnSentenceBegin = (res) => {
        console.log('[ASR] 一句话开始', res);
      };

      this.recognizer.OnRecognitionResultChange = (res) => {
        console.log('[ASR] 识别变化时', res);
        // 实时变化的结果
        if (res && res.result && res.result.voice_text_str) {
          this.onText(res.result.voice_text_str, false);
        }
      };

      this.recognizer.OnSentenceEnd = (res) => {
        console.log('[ASR] 一句话结束', res);
        // 句子结束（最终结果）
        if (res && res.result && res.result.voice_text_str) {
          this.onText(res.result.voice_text_str, true);
        }
      };

      this.recognizer.OnRecognitionComplete = (res) => {
        console.log('[ASR] 识别结束', res);
        this.onStop();
      };

      this.recognizer.OnError = (res) => {
        console.error('[ASR] 识别失败', res);
        this.onError(new Error(res.error_msg || res.message || 'ASR Error'));
      };

      // 开始识别（WebAudioSpeechRecognizer 会自动处理录音）
      this.recognizer.start();

    } catch (e) {
      console.error('[ASR] Start failed:', e);
      this.onError(e);
    }
  }

  stop() {
    if (this.recognizer) {
      try {
        // WebAudioSpeechRecognizer 会自动停止录音和识别
      this.recognizer.stop();
        console.log('[ASR] 已停止识别');
      } catch (e) {
        console.warn('[ASR] Stop error:', e);
      }
      this.recognizer = null;
    }
    // 不需要调用 onStop()，因为 OnRecognitionComplete 会触发
  }

  /**
   * 销毁录音流（释放麦克风权限）
   */
  destroyStream() {
    if (this.recognizer && typeof this.recognizer.destroyStream === 'function') {
      try {
        this.recognizer.destroyStream();
        console.log('[ASR] 已销毁音频流');
      } catch (e) {
        console.warn('[ASR] DestroyStream error:', e);
      }
    }
  }
}

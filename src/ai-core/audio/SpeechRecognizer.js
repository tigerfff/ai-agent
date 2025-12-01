// 这是一个旧式 UMD/Global 库，需要副作用导入
import 'tencentcloud-speech-sdk-js/dist/speechrecognizer';

/**
 * 腾讯云语音识别 SDK 封装
 * 文档: https://github.com/TencentCloud/tencentcloud-speech-sdk-js
 */
export class SpeechRecognizerWrapper {
  constructor(options = {}) {
    this.recognizer = null;
    this.options = options;
    
    // 从 window 对象获取 SDK 类
    this.SpeechRecognizerClass = window.SpeechRecognizer;

    if (!this.SpeechRecognizerClass) {
      console.error('Tencent Speech SDK not loaded correctly.');
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
   * @param {string} config.secretId
   * @param {string} config.secretKey
   * @param {string} config.appId
   * @param {string} [config.engine_model_type='16k_zh']
   */
  start(config) {
    if (this.recognizer) {
      this.stop();
    }

    try {
      // 实例化 SDK
      if (!this.SpeechRecognizerClass) {
        throw new Error('SpeechRecognizer SDK not found on window object');
      }

      this.recognizer = new this.SpeechRecognizerClass({
        params: {
          signCallback: null, // 如果需要后端签名，可扩展此逻辑
          secretid: config.secretId,
          secretkey: config.secretKey,
          appid: config.appId,
          engine_model_type: config.engineModelType || '16k_zh', // 引擎模式
          voice_format: 1, // PCM
          hotword_id: config.hotwordId || '',
          needvad: 1, // 开启 VAD 静音检测
          filter_dirty: 1,
          filter_modal: 1,
          filter_punc: 0,
          convert_num_mode: 1,
          word_info: 0
        }
      });

      // 绑定事件
      this.recognizer.OnRecognitionStart = (res) => {
        console.log('ASR Start:', res);
        this.onStart();
      };

      this.recognizer.OnRecognitionResultChange = (res) => {
        // 实时变化的结果
        if (res && res.result && res.result.voice_text_str) {
          this.onText(res.result.voice_text_str, false);
        }
      };

      this.recognizer.OnSentenceEnd = (res) => {
        // 句子结束（最终结果）
        if (res && res.result && res.result.voice_text_str) {
          this.onText(res.result.voice_text_str, true);
        }
      };

      this.recognizer.OnRecognitionComplete = (res) => {
        console.log('ASR Complete:', res);
        this.onStop();
      };

      this.recognizer.OnError = (res) => {
        console.error('ASR Error:', res);
        this.onError(new Error(res.error_msg || 'ASR Error'));
        this.stop();
      };

      // 开始识别
      this.recognizer.start();

    } catch (e) {
      this.onError(e);
    }
  }

  stop() {
    if (this.recognizer) {
      this.recognizer.stop();
      this.recognizer = null;
    }
    this.onStop();
  }
}

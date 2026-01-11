/**
 * 腾讯云语音识别 SDK 封装
 * 文档: https://github.com/TencentCloud/tencentcloud-speech-sdk-js
 * 注意：本组件库不包含 SDK 源码，需在父项目中自行引入（如通过 <script> 标签引入）
 */
import { buildUrl } from '@/utils/api-prefix';

export class SpeechRecognizerWrapper {
  constructor(options = {}) {
    this.recognizer = null;
    this.options = options;
    
    // 回调函数
    this.onText = options.onText || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * 获取 SDK 类，假定已由父项目加载到全局 window
   * @returns {Promise<Function>}
   */
  async getSDKClass() {
    if (window.WebAudioSpeechRecognizer) {
      return window.WebAudioSpeechRecognizer;
    }

    throw new Error('WebAudioSpeechRecognizer not found. Please ensure the Tencent Cloud ASR SDK is loaded in the parent project.');
  }

  /**
   * 开始识别
   * @param {Object} config - 鉴权配置
   * @param {string} config.secretId - 腾讯云 SecretId（SDK 需要，即使使用签名方式）
   * @param {Function} [config.signCallback] - 签名回调函数 (stringToSign) => Promise<string> | string
   * @param {number} config.appId - 应用ID（必须是数字）
   * @param {string} [config.engineModelType='16k_zh'] - 引擎模式
   * @param {string} [config.hotwordId] - 热词ID
   */
  async start(config) {
    if (this.recognizer) {
      this.stop();
    }

    this.isErrorOccurred = false; // 重置错误标记

    try {
      // 确保 SDK 已加载
      const SpeechRecognizerClass = await this.getSDKClass();

      // ... 后面逻辑保持不变
      // (为了准确匹配，我需要包含更多代码或分开替换)

      // 验证必要参数
      if (!config.appId) {
        throw new Error('appId is required');
      }

      // 根据官方示例配置参数
      const appId = typeof config.appId === 'string' ? Number(config.appId) : config.appId;
      const params = {
        appid: appId,
        engine_model_type: config.engineModelType || '16k_zh',
        voice_format: config.voice_format || 1,
        hotword_id: config.hotwordId || '',
        needvad: config.needvad !== undefined ? config.needvad : 1,
        filter_dirty: config.filter_dirty !== undefined ? config.filter_dirty : 1,
        filter_modal: config.filter_modal !== undefined ? config.filter_modal : 1,
        filter_punc: config.filter_punc !== undefined ? config.filter_punc : 0,
        convert_num_mode: config.convert_num_mode !== undefined ? config.convert_num_mode : 1,
        word_info: config.word_info !== undefined ? config.word_info : 0
      };

      // SDK 需要 secretid
      if (config.secretId) {
        params.secretid = config.secretId;
      }

      // 直接传递 signCallback，SDK 内部会正确处理 await
      if (config.signCallback) {
        params.signCallback = config.signCallback;
      }

      // 创建识别器实例
      this.recognizer = new SpeechRecognizerClass(params);

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
        if (this.isErrorOccurred) return;
        this.isErrorOccurred = true;

        console.error('[ASR] 识别失败', res);
        const error = new Error(res.error_msg || res.message || 'ASR Error');
        error.code = res.code || res.error_id;
        
        // 报错后立即停止识别，释放资源，防止二次报错
        this.stop();
        this.onError(error);
      };

      // 开始识别（WebAudioSpeechRecognizer 会自动处理录音）
      this.recognizer.start();

    } catch (e) {
      console.error('[ASR] Start failed:', e);
      this.isErrorOccurred = true;
      this.stop();
      this.onError(e);
    }
  }

  stop() {
    if (this.recognizer) {
      const recognizer = this.recognizer;
      this.recognizer = null; // 立即置空，防止重入

      console.log('[ASR] 停止并清理识别器...');
      try {
        // 1. 尝试调用 stop
        if (typeof recognizer.stop === 'function') {
          recognizer.stop();
        }
        // 2. 必须销毁音频流
        if (typeof recognizer.destroyStream === 'function') {
          recognizer.destroyStream();
        }
        // 3. 某些版本的 SDK 可能需要调用 destroy
        if (typeof recognizer.destroy === 'function') {
          recognizer.destroy();
        }
      } catch (e) {
        console.warn('[ASR] Stop error:', e);
      }
    }
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

  /**
   * 创建 ASR 配置提供器（使用签名回调方式）
   * 封装了接口调用逻辑，组件只需要传入 aiClient 即可
   * 
   * @param {AIClient} aiClient - AI 客户端实例
   * @returns {Function} 配置提供函数，返回 Promise<Object|null>
   * 
   * @example
   * const configProvider = SpeechRecognizerWrapper.createConfigProvider(this.$aiClient);
   * <AIInput :speech-config-provider="configProvider" />
   */
  static createConfigProvider(aiClient) {
    /**
     * 获取 ASR 配置（用于语音识别）
     * 流程：
     * 1. 调用 getAsrLint 获取 appId 和 secretId
     * 2. SDK 内部生成待签名字符串 (strToBeSigned)
     * 3. 在 signCallback 中调用 getAsrSign 获取最终签名
     * 
     * @returns {Promise<Object|null>} ASR 配置对象或 null
     */
    return async function getAsrConfig() {
      try {
        // 1. 先获取基础配置 (appId, secretId)
        const lintRes = await aiClient.send({
          url: buildUrl(aiClient, `/inspect/chat/web/asr/actions/asrInit`, 'chain'),
          method: 'get',
          data: {}
        });
        
        if (lintRes.code !== 0 || !lintRes.data) {
          console.error('[ASR] Failed to get ASR lint config:', lintRes);
          return null;
        }

        const { appId, secretId, secretid } = lintRes.data;
        const finalAppId = typeof appId === 'string' ? Number(appId) : appId;
        const finalSecretId = secretId || secretid || '';

        if (!finalAppId) {
          console.error('[ASR] ASR config missing appId');
          return null;
        }

        // 2. 返回配置，SDK 在需要签名时会触发 signCallback
        return {
          appId: finalAppId,
          secretId: finalSecretId,
          // 腾讯云 SDK 在连接时会生成待签名字符串并通过此回调传递
          signCallback: async (stringToSign) => {
            try {
              const signRes = await aiClient.send({
                url: buildUrl(aiClient, `/inspect/chat/web/asr/actions/getSign`, 'chain'),
                method: 'post',
                data: {
                  strToBeSigned: stringToSign
                }
              });
              
              if (signRes.code === 0 && signRes.data) {
                // 如果返回的是对象，提取 sign 字段；否则直接返回
                return signRes.data.sign || signRes.data;
              }
              console.error('[ASR] getAsrSign returned invalid data:', signRes);
            } catch (e) {
              console.error('[ASR] getAsrSign request failed:', e);
            }
            return ''; // 失败返回空字符串
          },
          engineModelType: '16k_zh' // 默认使用中文16k
        };
      } catch (e) {
        console.error('[ASR] getAsrConfig failed:', e);
        return null;
      }
    };
  }
}

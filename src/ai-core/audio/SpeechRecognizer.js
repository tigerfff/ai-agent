/**
 * 腾讯云语音识别 SDK 封装
 * 依赖：需要在 index.html 中引入 speechrecognizer.js
 * 文档: https://github.com/TencentCloud/tencentcloud-speech-sdk-js
 */
import { buildUrl } from '@/utils/api-prefix';

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
   * 
   * 方式1（使用 secretKey）：
   * @param {string} config.secretId - 腾讯云 SecretId
   * @param {string} config.secretKey - 腾讯云 SecretKey
   * @param {number} config.appId - 应用ID（必须是数字）
   * 
   * 方式2（使用签名）：
   * @param {string} config.secretId - 腾讯云 SecretId（SDK 需要，即使使用签名方式）
   * @param {string} [config.sign] - 签名字符串（可选，如果提供了 signCallback 则不需要）
   * @param {Function} [config.signCallback] - 签名回调函数 (stringToSign) => Promise<string> | string（可选）
   * @param {number} config.appId - 应用ID（必须是数字）
   * 
   * 通用参数：
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

      // 判断使用哪种认证方式
      const useSignCallback = !!(config.signCallback || config.sign);
      const useSecretKey = !!(config.secretId && config.secretKey);

      // 验证必要参数
      if (!config.appId) {
        throw new Error('appId is required');
      }

      if (!useSignCallback && !useSecretKey) {
        throw new Error('Either secretId+secretKey or sign/signCallback is required');
      }

      // 根据官方示例配置参数
      const params = {
        appid: typeof config.appId === 'string' ? Number(config.appId) : config.appId,
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

      // 方式1：使用 secretKey 认证
      if (useSecretKey) {
        params.secretid = config.secretId;
        params.secretkey = config.secretKey;
      }
      // 方式2：使用签名认证
      else if (useSignCallback) {
        // SDK 需要 secretid（即使使用签名方式）
        if (config.secretId) {
          params.secretid = config.secretId;
        }
        
        // 设置 signCallback（优先级高于 sign）
        if (config.signCallback) {
          params.signCallback = config.signCallback;
        } else if (config.sign) {
          // 如果没有 signCallback，但提供了 sign，创建一个简单的回调函数
          params.signCallback = () => Promise.resolve(config.sign);
        }
      }

      console.log('[ASR] Creating WebAudioSpeechRecognizer with params:', {
        appid: params.appid,
        engine_model_type: params.engine_model_type,
        authMode: useSignCallback ? 'sign' : 'secretKey',
        hasSecretId: !!params.secretid,
        hasSecretKey: !!params.secretkey,
        hasSignCallback: !!params.signCallback
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
          url: buildUrl(aiClient, `/inspect/chat/web/asr/actions/asrlint`, 'chain'),
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
              // 3. 调用 getAsrSign 将待签名字符串传给后端进行 HmacSHA1 签名
              const signRes = await aiClient.send({
                url: buildUrl(aiClient, `/inspect/chat/web/asr/actions/getSign`, 'chain'),
                method: 'post',
                data: {
                  strToBeSigned: stringToSign
                }
              });
              
              if (signRes.code === 0 && signRes.data && signRes.data.sign) {
                return signRes.data.sign;
              }
              console.error('[ASR] getAsrSign returned invalid data:', signRes);
            } catch (e) {
              console.error('[ASR] getAsrSign request failed:', e);
            }
            return ''; // 失败返回空，SDK 会报错
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

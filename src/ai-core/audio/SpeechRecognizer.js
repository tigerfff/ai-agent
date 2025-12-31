/**
 * 腾讯云语音识别 SDK 封装
 * 文档: https://github.com/TencentCloud/tencentcloud-speech-sdk-js
 */
import { buildUrl } from '@/utils/api-prefix';

// SDK 加载状态管理
let sdkLoadPromise = null;

/**
 * 动态加载 speechrecognizer.js SDK
 * @param {string} sdkPath - SDK 脚本路径，默认为 /libs/speechrecognizer.js
 * @returns {Promise<void>}
 */
function loadSDK(sdkPath = '/libs/speechrecognizer.js') {
  // 如果已经加载，直接返回
  if (window.WebAudioSpeechRecognizer) {
    return Promise.resolve();
  }

  // 如果正在加载，返回现有的 Promise
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  // 创建新的加载 Promise
  sdkLoadPromise = new Promise((resolve, reject) => {
    // 检查是否已经存在 script 标签
    const existingScript = document.querySelector(`script[src="${sdkPath}"]`);
    if (existingScript) {
      // 如果脚本已存在，等待其加载完成
      if (window.WebAudioSpeechRecognizer) {
        resolve();
      } else {
        existingScript.onload = () => resolve();
        existingScript.onerror = () => reject(new Error('Failed to load speechrecognizer.js'));
      }
      return;
    }

    // 创建 script 标签
    const script = document.createElement('script');
    script.src = sdkPath;
    script.async = true;
    
    script.onload = () => {
      if (window.WebAudioSpeechRecognizer) {
        resolve();
      } else {
        reject(new Error('WebAudioSpeechRecognizer not found after loading script'));
      }
    };
    
    script.onerror = () => {
      sdkLoadPromise = null; // 重置，允许重试
      reject(new Error(`Failed to load SDK from ${sdkPath}`));
    };

    // 添加到 head
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

export class SpeechRecognizerWrapper {
  constructor(options = {}) {
    this.recognizer = null;
    this.options = options;
    this.sdkPath = options.sdkPath || '/libs/speechrecognizer.js';
    
    // 回调函数
    this.onText = options.onText || (() => {});
    this.onStart = options.onStart || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * 获取 SDK 类，如果未加载则先加载
   * @returns {Promise<Function>}
   */
  async getSDKClass() {
    if (window.WebAudioSpeechRecognizer) {
      return window.WebAudioSpeechRecognizer;
    }

    // 动态加载 SDK
    await loadSDK(this.sdkPath);
    
    if (!window.WebAudioSpeechRecognizer) {
      throw new Error('WebAudioSpeechRecognizer not found after loading SDK');
    }

    return window.WebAudioSpeechRecognizer;
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

    try {
      // 确保 SDK 已加载
      const SpeechRecognizerClass = await this.getSDKClass();

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

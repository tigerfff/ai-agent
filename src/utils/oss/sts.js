'use strict';

var _rollupPluginBabelHelpers = require('./chunks/_rollupPluginBabelHelpers-CLQ70nLH.js');
var CryptoJS = require('crypto-js');
var jsrsasign = require('jsrsasign');
var secCrypto = require('sec-crypto');

var STSProvider = /*#__PURE__*/function () {
  function STSProvider() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _rollupPluginBabelHelpers._classCallCheck(this, STSProvider);
    // 支持实例级配置或使用全局配置
    this.httpClient = options.httpClient || STSProvider.globalHttpClient;
    this.baseURL = options.baseURL || STSProvider.globalBaseURL || '';
    if (!this.httpClient) {
      console.warn('STSProvider: httpClient not provided, please set it via constructor or STSProvider.config()');
    }

    // 缓存公钥信息，避免重复请求
    this.cache = {
      modulus: null,
      exponent: null,
      cacheTime: null,
      cacheExpire: 30 * 60 * 1000 // 缓存30分钟
    };

    // 凭证缓存池 (key: bizCode, value: { data, expireTime })
    this.credentialPool = STSProvider.credentialPool;
    // 并发锁 (key: bizCode, value: Promise)
    this.locks = STSProvider.locks;
  }

  // 静态缓存池
  return _rollupPluginBabelHelpers._createClass(STSProvider, [{
    key: "getCredentials",
    value: (
    /**
     * 获取 STS 凭证（带缓存和并发锁）
     * @param {Object} params
     * @param {string} params.bizCode - 业务编码
     * @returns {Promise<Object>}
     */
    function () {
      var _getCredentials = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee(_ref) {
        var _this = this;
        var bizCode, cached, now, requestPromise;
        return _rollupPluginBabelHelpers._regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              bizCode = _ref.bizCode;
              if (bizCode) {
                _context.n = 1;
                break;
              }
              throw new Error('STSProvider: bizCode is required');
            case 1:
              // 1. 检查缓存
              cached = this.credentialPool.get(bizCode);
              now = Date.now(); // 提前 60 秒失效，确保上传过程中凭证有效
              if (!(cached && cached.expireTime && now < cached.expireTime - 60000)) {
                _context.n = 2;
                break;
              }
              return _context.a(2, cached.data);
            case 2:
              if (!this.locks.has(bizCode)) {
                _context.n = 3;
                break;
              }
              return _context.a(2, this.locks.get(bizCode));
            case 3:
              requestPromise = this._doGetCredentials(bizCode).finally(function () {
                _this.locks.delete(bizCode);
              });
              this.locks.set(bizCode, requestPromise);
              return _context.a(2, requestPromise);
          }
        }, _callee, this);
      }));
      function getCredentials(_x) {
        return _getCredentials.apply(this, arguments);
      }
      return getCredentials;
    }()
    /**
     * 内部执行获取逻辑
     */
    )
  }, {
    key: "_doGetCredentials",
    value: (function () {
      var _doGetCredentials2 = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee2(bizCode) {
        var _yield$this$getModulu, modulus, exponent, secretKey, iv, encryptedKey, encryptedIv, response, decrypted, expireTime, _t;
        return _rollupPluginBabelHelpers._regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              if (this.httpClient) {
                _context2.n = 1;
                break;
              }
              throw new Error('STSProvider: httpClient is not configured. Please call STSProvider.config() first.');
            case 1:
              _context2.p = 1;
              _context2.n = 2;
              return this.getModulusExponent();
            case 2:
              _yield$this$getModulu = _context2.v;
              modulus = _yield$this$getModulu.modulus;
              exponent = _yield$this$getModulu.exponent;
              // 2. 生成随机密钥
              secretKey = this.generateRandomKey(16);
              iv = this.generateRandomKey(16); // 3. RSA 加密
              encryptedKey = this.rsaEncrypt(secretKey, modulus, exponent);
              encryptedIv = this.rsaEncrypt(iv, modulus, exponent); // 4. 请求接口
              _context2.n = 3;
              return this.fetchOssCredential({
                bizCode: bizCode,
                key: encryptedKey,
                iv: encryptedIv
              });
            case 3:
              response = _context2.v;
              // 5. SM4 解密
              decrypted = this.decryptCredentials(response.data, secretKey, iv); // 6. 存入缓存池 (使用接口返回的 expireTime)
              expireTime = decrypted.expireTime || Date.now() + 3600 * 1000;
              this.credentialPool.set(bizCode, {
                data: decrypted,
                expireTime: expireTime
              });
              return _context2.a(2, decrypted);
            case 4:
              _context2.p = 4;
              _t = _context2.v;
              console.error('STSProvider: Failed to get credentials', _t);
              throw _t;
            case 5:
              return _context2.a(2);
          }
        }, _callee2, this, [[1, 4]]);
      }));
      function _doGetCredentials(_x2) {
        return _doGetCredentials2.apply(this, arguments);
      }
      return _doGetCredentials;
    }()
    /**
     * 获取公钥质数对
     * @returns {Promise<{modulus: string, exponent: string}>}
     */
    )
  }, {
    key: "getModulusExponent",
    value: (function () {
      var _getModulusExponent = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee3() {
        var now, res;
        return _rollupPluginBabelHelpers._regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              // 检查缓存是否有效
              now = Date.now();
              if (!(this.cache.modulus && this.cache.exponent && this.cache.cacheTime && now - this.cache.cacheTime < this.cache.cacheExpire)) {
                _context3.n = 1;
                break;
              }
              return _context3.a(2, {
                modulus: this.cache.modulus,
                exponent: this.cache.exponent
              });
            case 1:
              _context3.n = 2;
              return this.httpClient('get', "".concat(this.baseURL, "/v1/ossManager/ossManager/actions/getModulusExponent"));
            case 2:
              res = _context3.v;
              if (!(res && +res.code === 0)) {
                _context3.n = 3;
                break;
              }
              this.cache.modulus = res.data.modulus;
              this.cache.exponent = res.data.exponent;
              this.cache.cacheTime = now;
              return _context3.a(2, {
                modulus: res.data.modulus,
                exponent: res.data.exponent
              });
            case 3:
              throw new Error('STSProvider: Failed to get modulus and exponent');
            case 4:
              return _context3.a(2);
          }
        }, _callee3, this);
      }));
      function getModulusExponent() {
        return _getModulusExponent.apply(this, arguments);
      }
      return getModulusExponent;
    }()
    /**
     * RSA 加密
     * @param {string} data - 要加密的数据
     * @param {string} modulus - 公钥模数（Base64）
     * @param {string} exponent - 公钥指数（Base64）
     * @returns {string} Base64 编码的加密结果
     */
    )
  }, {
    key: "rsaEncrypt",
    value: function rsaEncrypt(data, modulus, exponent) {
      try {
        // 创建 RSA 密钥对象
        var rsa = new jsrsasign.RSAKey();

        // 将 Base64 编码的模数和指数转换为十六进制
        var modulusHex = this.base64ToHex(modulus);
        var exponentHex = this.base64ToHex(exponent);

        // 设置公钥
        rsa.setPublic(modulusHex, exponentHex);

        // 加密数据（返回十六进制字符串）
        var encrypted = rsa.encrypt(data);

        // 将十六进制转换为 Base64
        return this.hexToBase64(encrypted);
      } catch (error) {
        console.error('STSProvider: RSA encryption failed', error);
        throw new Error('RSA encryption failed: ' + error.message);
      }
    }

    /**
     * Base64 转十六进制
     * @param {string} base64 - Base64 字符串
     * @returns {string} 十六进制字符串
     */
  }, {
    key: "base64ToHex",
    value: function base64ToHex(base64) {
      var raw = atob(base64);
      var hex = '';
      for (var i = 0; i < raw.length; i++) {
        var byte = raw.charCodeAt(i).toString(16);
        hex += byte.length === 2 ? byte : '0' + byte;
      }
      return hex;
    }

    /**
     * 十六进制转 Base64
     * @param {string} hex - 十六进制字符串
     * @returns {string} Base64 字符串
     */
  }, {
    key: "hexToBase64",
    value: function hexToBase64(hex) {
      var bytes = [];
      for (var i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
      var binary = String.fromCharCode.apply(null, bytes);
      return btoa(binary);
    }

    /**
     * 生成随机密钥
     * @param {number} length - 密钥长度
     * @returns {string} 随机密钥
     */
  }, {
    key: "generateRandomKey",
    value: function generateRandomKey(length) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var result = '';
      for (var i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    /**
     * 调用获取 STS 凭证接口
     * @param {Object} params - 请求参数
     * @returns {Promise<Object>} 接口响应
     */
  }, {
    key: "fetchOssCredential",
    value: (function () {
      var _fetchOssCredential = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee4(params) {
        var res;
        return _rollupPluginBabelHelpers._regenerator().w(function (_context4) {
          while (1) switch (_context4.n) {
            case 0:
              _context4.n = 1;
              return this.httpClient('post', "".concat(this.baseURL, "/v1/ossManager/ossManager/actions/getOssCredential"), params);
            case 1:
              res = _context4.v;
              if (!(res && +res.code === 0)) {
                _context4.n = 2;
                break;
              }
              return _context4.a(2, res);
            case 2:
              throw new Error((res === null || res === void 0 ? void 0 : res.message) || 'Failed to get OSS credentials');
            case 3:
              return _context4.a(2);
          }
        }, _callee4, this);
      }));
      function fetchOssCredential(_x3) {
        return _fetchOssCredential.apply(this, arguments);
      }
      return fetchOssCredential;
    }()
    /**
     * 解密 STS 凭证中的加密字段
     * @param {Object} data - 原始数据
     * @param {string} secretKey - 密钥
     * @param {string} iv - IV
     * @returns {Object} 解密后的数据
     */
    )
  }, {
    key: "decryptCredentials",
    value: function decryptCredentials(data, secretKey, iv) {
      var _this2 = this;
      var encryptedFields = ['accessKeyId', 'accessKeySecret', 'bucket', 'domain', 'endpoint', 'object'];
      var decrypted = _rollupPluginBabelHelpers._objectSpread2({}, data);
      encryptedFields.forEach(function (field) {
        if (data[field]) {
          try {
            decrypted[field] = _this2.sm4Decrypt(data[field], secretKey, iv);
          } catch (error) {
            console.error("STSProvider: Failed to decrypt field [".concat(field, "]"), error);
            // 解密失败时保留原值
          }
        }
      });
      return decrypted;
    }

    /**
     * SM4 解密 (CBC 模式)
     * @param {string} encrypted - 加密的 Base64 字符串
     * @param {string} key - 16 字节原始密钥字符串
     * @param {string} iv - 16 字节原始 IV 字符串
     * @returns {string} 解密后的字符串
     */
  }, {
    key: "sm4Decrypt",
    value: function sm4Decrypt(encrypted, key, iv) {
      // 1. Base64 -> Hex
      var encryptedHex = CryptoJS.enc.Base64.parse(encrypted).toString(CryptoJS.enc.Hex);

      // 2. Key/IV -> Hex
      var keyHex = CryptoJS.enc.Utf8.parse(key).toString(CryptoJS.enc.Hex);
      var ivHex = CryptoJS.enc.Utf8.parse(iv).toString(CryptoJS.enc.Hex);

      // 3. 执行解密
      var decryptedHex = secCrypto.sm4.decrypt(encryptedHex, keyHex, {
        mode: 'cbc',
        iv: ivHex,
        padding: 'pkcs7'
      });
      if (!decryptedHex) return '';
      try {
        // 4. Hex -> Utf8
        var result = CryptoJS.enc.Hex.parse(decryptedHex).toString(CryptoJS.enc.Utf8);

        // 5. 【关键修复】手动剔除末尾的 PKCS7 填充字符
        // PKCS7 填充的字符编码通常在 0x01 到 0x10 (16) 之间
        // 使用正则匹配末尾的所有不可见控制字符并替换为空
        // eslint-disable-next-line no-control-regex
        return result.replace(/[\x00-\x1F\x7F]+$/g, '');
      } catch (e) {
        console.error('STSProvider: Decryption or encoding conversion failed', e);
        return decryptedHex;
      }
    }

    /**
     * 清除缓存
     */
  }, {
    key: "clearCache",
    value: function clearCache() {
      this.cache = {
        modulus: null,
        exponent: null,
        cacheTime: null,
        cacheExpire: 30 * 60 * 1000
      };
    }
  }], [{
    key: "config",
    value:
    /**
     * 全局配置 STSProvider
     * @param {Object} options
     * @param {Function} options.httpClient - HTTP 客户端函数
     * @param {string} options.baseURL - API 基础路径
     */
    function config() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      if (options.httpClient) {
        STSProvider.globalHttpClient = options.httpClient;
      }
      if (options.baseURL !== undefined) {
        STSProvider.globalBaseURL = options.baseURL;
      }
    }

    /**
     * 清除所有缓存
     */
  }, {
    key: "clearCache",
    value: function clearCache() {
      STSProvider.credentialPool.clear();
      STSProvider.locks.clear();
    }
  }]);
}();

// 初始化静态属性
_rollupPluginBabelHelpers._defineProperty(STSProvider, "credentialPool", new Map());
_rollupPluginBabelHelpers._defineProperty(STSProvider, "locks", new Map());
STSProvider.globalHttpClient = null;
STSProvider.globalBaseURL = '';

exports.STSProvider = STSProvider;
//# sourceMappingURL=sts.js.map

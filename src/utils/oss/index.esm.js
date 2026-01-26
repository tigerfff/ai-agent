import OSS from 'ali-oss';
import CryptoJS from 'crypto-js';
import { RSAKey } from 'jsrsasign';
import { sm4 } from 'sec-crypto';
import { v4 } from 'uuid';
import COS from 'cos-js-sdk-v5';

function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: false
  }), e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: true,
    configurable: true,
    writable: true
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _regenerator() {
  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
  var e,
    t,
    r = "function" == typeof Symbol ? Symbol : {},
    n = r.iterator || "@@iterator",
    o = r.toStringTag || "@@toStringTag";
  function i(r, n, o, i) {
    var c = n && n.prototype instanceof Generator ? n : Generator,
      u = Object.create(c.prototype);
    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
      var i,
        c,
        u,
        f = 0,
        p = o || [],
        y = false,
        G = {
          p: 0,
          n: 0,
          v: e,
          a: d,
          f: d.bind(e, 4),
          d: function (t, r) {
            return i = t, c = 0, u = e, G.n = r, a;
          }
        };
      function d(r, n) {
        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
          var o,
            i = p[t],
            d = G.p,
            l = i[2];
          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
        }
        if (o || r > 1) return a;
        throw y = true, n;
      }
      return function (o, p, l) {
        if (f > 1) throw TypeError("Generator is already running");
        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
          try {
            if (f = 2, i) {
              if (c || (o = "next"), t = i[o]) {
                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
                if (!t.done) return t;
                u = t.value, c < 2 && (c = 0);
              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
              i = e;
            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
          } catch (t) {
            i = e, c = 1, u = t;
          } finally {
            f = 1;
          }
        }
        return {
          value: t,
          done: y
        };
      };
    }(r, o, i), true), u;
  }
  var a = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  t = Object.getPrototypeOf;
  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
      return this;
    }), t),
    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
  function f(e) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
    return this;
  }), _regeneratorDefine(u, "toString", function () {
    return "[object Generator]";
  }), (_regenerator = function () {
    return {
      w: i,
      m: f
    };
  })();
}
function _regeneratorDefine(e, r, n, t) {
  var i = Object.defineProperty;
  try {
    i({}, "", {});
  } catch (e) {
    i = 0;
  }
  _regeneratorDefine = function (e, r, n, t) {
    function o(r, n) {
      _regeneratorDefine(e, r, function (e) {
        return this._invoke(r, n, e);
      });
    }
    r ? i ? i(e, r, {
      value: n,
      enumerable: !t,
      configurable: !t,
      writable: !t
    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
  }, _regeneratorDefine(e, r, n, t);
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r);
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

var STSProvider = /*#__PURE__*/function () {
  function STSProvider() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, STSProvider);
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
  return _createClass(STSProvider, [{
    key: "getCredentials",
    value: (
    /**
     * 获取 STS 凭证（带缓存和并发锁）
     * @param {Object} params
     * @param {string} params.bizCode - 业务编码
     * @returns {Promise<Object>}
     */
    function () {
      var _getCredentials = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(_ref) {
        var _this = this;
        var bizCode, cached, now, requestPromise;
        return _regenerator().w(function (_context) {
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
      var _doGetCredentials2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(bizCode) {
        var _yield$this$getModulu, modulus, exponent, secretKey, iv, encryptedKey, encryptedIv, response, decrypted, expireTime, _t;
        return _regenerator().w(function (_context2) {
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
      var _getModulusExponent = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        var now, res;
        return _regenerator().w(function (_context3) {
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
        var rsa = new RSAKey();

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
      var _fetchOssCredential = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(params) {
        var res;
        return _regenerator().w(function (_context4) {
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
      var decrypted = _objectSpread2({}, data);
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
      var decryptedHex = sm4.decrypt(encryptedHex, keyHex, {
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
_defineProperty(STSProvider, "credentialPool", new Map());
_defineProperty(STSProvider, "locks", new Map());
STSProvider.globalHttpClient = null;
STSProvider.globalBaseURL = '';

/**
 * 读取 File 为 ArrayBuffer
 */
function readFileAsArrayBuffer$2(_x) {
  return _readFileAsArrayBuffer$2.apply(this, arguments);
}
/**
 * Base64 转 HEX
 */
function _readFileAsArrayBuffer$2() {
  _readFileAsArrayBuffer$2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(file) {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          return _context4.a(2, new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
              return resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          }));
      }
    }, _callee4);
  }));
  return _readFileAsArrayBuffer$2.apply(this, arguments);
}
function base64toHEX$2(base64) {
  var raw = window.atob(base64);
  var HEX = "";
  for (var i = 0; i < raw.length; i++) {
    var _hex = raw.charCodeAt(i).toString(16);
    HEX += _hex.length === 2 ? _hex : "0" + _hex;
  }
  return HEX;
}

/**
 * DataURL (Base64) 转 Blob
 */
function dataURLtoBlob$2(dataurl) {
  if (!dataurl || typeof dataurl !== 'string') {
    throw new Error('dataURLtoBlob: dataurl must be a non-empty string');
  }
  var arr = dataurl.split(",");
  if (arr.length < 2) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing comma separator');
  }
  var mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing MIME type');
  }
  var mime = mimeMatch[1];
  var bstr = window.atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}

/**
 * 使用 SM4 对二进制数据加密
 */
function sm4Encrypt$2(arrayBuffer, kmsDataKey) {
  var bytes = new Uint8Array(arrayBuffer);
  var hexData = Array.from(bytes).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
  var hexDataKey = base64toHEX$2(kmsDataKey.dataKey);
  var encryptedHex = sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
    iv: hexDataKey.slice(32, 64),
    mode: "cbc"
  });
  var result = new Uint8Array(encryptedHex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  return result;
}

/**
 * 将 File 加密后构造新的 Blob
 */
function createEncryptedBlob$2(_x2, _x3) {
  return _createEncryptedBlob$2.apply(this, arguments);
}
function _createEncryptedBlob$2() {
  _createEncryptedBlob$2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(file, _ref) {
    var kmsDataKey, arrayBuffer, encryptedData;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          kmsDataKey = _ref.kmsDataKey;
          _context5.n = 1;
          return readFileAsArrayBuffer$2(file);
        case 1:
          arrayBuffer = _context5.v;
          encryptedData = sm4Encrypt$2(arrayBuffer, kmsDataKey);
          return _context5.a(2, new Blob([encryptedData], {
            type: file.type
          }));
      }
    }, _callee5);
  }));
  return _createEncryptedBlob$2.apply(this, arguments);
}
var OssUploader = /*#__PURE__*/function () {
  function OssUploader() {
    _classCallCheck(this, OssUploader);
    this.stsProvider = new STSProvider();
  }

  /**
   * 全局配置
   */
  return _createClass(OssUploader, [{
    key: "upload",
    value: (
    /**
     * 上传单个文件 (使用分片上传模式)
     * @param {File|Blob|string} file - 要上传的文件 (File, Blob, 或 Base64 字符串)
     * @param {string} bizCode - 业务编码
     * @param {Object} options - 配置项
     * @param {string} options.fileName - 自定义文件名
     * @param {string} options.strictNameMode - 严格名称
     * @param {Object} options.checkpoint - 断点信息（用于续传）
     * @param {Function} options.onProgress - 进度回调 (percent, checkpoint) => {}
     * @param {Function} options.onCancelTask - 获取取消句柄的回调 (cancelHandle) => {}
     * @returns {Promise<Object>} OSS 上传结果
     */
    function () {
      var _upload = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(file, bizCode) {
        var options,
          normalizedFile,
          checkName,
          checkType,
          isHtml,
          errorMsg,
          stsData,
          uploadFile,
          meta,
          _yield$options$extern,
          encryptedFile,
          extraMeta,
          client,
          originalName,
          fileName,
          objectKey,
          latestCheckpoint,
          _isUploadActive,
          result,
          finalUrl,
          originUrl,
          domain,
          key,
          separator,
          accessKey,
          _args2 = arguments,
          _t;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              options = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
              if (!(!file || !bizCode)) {
                _context2.n = 1;
                break;
              }
              throw new Error("OssUploader: file and bizCode are required");
            case 1:
              _context2.p = 1;
              // 0. 归一化输入：如果是 base64 字符串，转换为 Blob
              normalizedFile = file;
              if (typeof file === "string" && file.startsWith("data:")) {
                normalizedFile = dataURLtoBlob$2(file);
              }

              // --- 新增：HTML 文件校验逻辑 ---
              checkName = normalizedFile.name || "";
              checkType = normalizedFile.type || "";
              isHtml = checkName.toLowerCase().endsWith('.html') || checkName.toLowerCase().endsWith('.htm') || checkType === 'text/html';
              if (!(isHtml && !options.allowHTML)) {
                _context2.n = 2;
                break;
              }
              errorMsg = "暂不支持上传 HTML 格式文件";
              if (typeof window !== 'undefined' && window.alert) {
                window.alert(errorMsg);
              }
              throw new Error("OssUploader: ".concat(errorMsg));
            case 2:
              _context2.n = 3;
              return this.stsProvider.getCredentials({
                bizCode: bizCode
              });
            case 3:
              stsData = _context2.v;
              // 2. 处理文件加密 (注意：分片上传建议先完成整体加密)
              uploadFile = normalizedFile;
              meta = {};
              if (!stsData.encryptEnable) {
                _context2.n = 8;
                break;
              }
              if (!(stsData.kmsDataKey && stsData.kmsDataKey.sm4Supported)) {
                _context2.n = 5;
                break;
              }
              _context2.n = 4;
              return createEncryptedBlob$2(normalizedFile, stsData);
            case 4:
              uploadFile = _context2.v;
              meta = {
                'encrypted-version': String(stsData.kmsDataKey.version),
                'encrypted-data-key': String(stsData.kmsDataKey.dataKeyEncrypted),
                'sm4-supported': '1'
              };
              _context2.n = 8;
              break;
            case 5:
              if (!(typeof options.externalEncrypt === 'function')) {
                _context2.n = 7;
                break;
              }
              _context2.n = 6;
              return options.externalEncrypt(normalizedFile, stsData);
            case 6:
              _yield$options$extern = _context2.v;
              encryptedFile = _yield$options$extern.encryptedFile;
              extraMeta = _yield$options$extern.meta;
              uploadFile = encryptedFile;
              meta = extraMeta || {};
              _context2.n = 8;
              break;
            case 7:
              // 3. 否则：仅告警，不做加密，交给调用方自己决定要不要用这个类
              console.warn('OssUploader: encryptEnable=true 但不支持 SM4，且未提供 externalEncrypt 回调，按未加密处理');
            case 8:
              // 3. 准备 OSS 客户端
              client = new OSS({
                accessKeyId: stsData.accessKeyId,
                accessKeySecret: stsData.accessKeySecret,
                stsToken: stsData.securityToken,
                bucket: stsData.bucket,
                endpoint: stsData.endpoint,
                cname: !!stsData.cname,
                region: stsData.region || undefined,
                secure: true
              }); // 4. 路径处理
              // 注意：Blob 没有 name 属性，需要处理
              originalName = normalizedFile.name || (normalizedFile.type ? "upload.".concat(normalizedFile.type.split('/')[1]) : "unnamed");
              fileName = options.strictNameMode && options.fileName || this.generateUniqueFileName(originalName, options.fileName);
              objectKey = "".concat(stsData.object, "/").concat(fileName).replace(/\/+/g, "/"); // 关键信息：保存最新的 checkpoint（里面有 uploadId）
              latestCheckpoint = options.checkpoint || null;
              _isUploadActive = true; // 先把 abort 函数暴露给外面（里面用的是闭包里的 latestCheckpoint）
              if (options.onAbortHandler) {
                options.onAbortHandler(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
                  return _regenerator().w(function (_context) {
                    while (1) switch (_context.n) {
                      case 0:
                        if (_isUploadActive) {
                          _context.n = 1;
                          break;
                        }
                        return _context.a(2);
                      case 1:
                        _isUploadActive = false;
                        if (!client) {
                          _context.n = 2;
                          break;
                        }
                        // 先尝试取消当前请求
                        if (typeof client.cancel === 'function') {
                          client.cancel();
                        }
                        if (!(latestCheckpoint && latestCheckpoint.uploadId)) {
                          _context.n = 2;
                          break;
                        }
                        _context.n = 2;
                        return client.abortMultipartUpload(objectKey, latestCheckpoint.uploadId);
                      case 2:
                        return _context.a(2);
                    }
                  }, _callee);
                })));
              }

              // 提供暂停（仅取消请求，保留分片）句柄
              if (options.onPauseHandler) {
                options.onPauseHandler(function () {
                  if (!_isUploadActive) return;
                  if (client && typeof client.cancel === 'function') {
                    client.cancel();
                  }
                });
              }

              // 5. 执行分片上传
              _context2.n = 9;
              return client.multipartUpload(objectKey, uploadFile, {
                checkpoint: options.checkpoint,
                meta: meta,
                progress: function progress(p, cpt) {
                  // cpt 里包含 uploadId 和已上传的分片信息
                  latestCheckpoint = cpt || latestCheckpoint; // 更新最新的 checkpoint
                  if (options.onProgress) {
                    // 返回进度百分比和当前的 checkpoint
                    options.onProgress(Math.floor(p * 100), cpt);
                  }
                }
              });
            case 9:
              result = _context2.v;
              _isUploadActive = false;

              // 优先使用后端返回的 domain + objectKey 组合 URL（而不是 endpoint）
              finalUrl = "";
              originUrl = "";
              if (stsData.domain) {
                domain = stsData.domain.replace(/\/+$/, "");
                key = objectKey.replace(/^\/+/, "");
                finalUrl = "".concat(domain, "/").concat(key);
                originUrl = "".concat(domain, "/").concat(key);
              } else if (result.url) {
                finalUrl = result.url;
                originUrl = result.url;
              } else if (result.res && result.res.requestUrls && result.res.requestUrls[0]) {
                finalUrl = result.res.requestUrls[0];
                originUrl = result.res.requestUrls[0];
              }

              // 如果开启了加密，追加访问参数
              if (stsData.encryptEnable && stsData.kmsDataKey) {
                separator = finalUrl.includes("?") ? "&" : "?";
                accessKey = stsData.kmsDataKey.accessKey || "";
                finalUrl = "".concat(finalUrl).concat(separator, "accessKey=").concat(accessKey, "&v=1&encrypted=1");
              }
              return _context2.a(2, _objectSpread2(_objectSpread2({}, result), {}, {
                fileName: fileName,
                url: finalUrl,
                originUrl: originUrl,
                stsData: stsData
              }));
            case 10:
              _context2.p = 10;
              _t = _context2.v;
              if (typeof isUploadActive !== 'undefined') {
                isUploadActive = false;
              }
              // 判断是否是主动取消
              if (_t.name === "cancel") {
                console.log("OssUploader: Upload canceled by user");
              }
              console.error("OssUploader: Upload failed", _t);
              throw _t;
            case 11:
              return _context2.a(2);
          }
        }, _callee2, this, [[1, 10]]);
      }));
      function upload(_x4, _x5) {
        return _upload.apply(this, arguments);
      }
      return upload;
    }()
    /**
     * 上传多个文件
     * @param {Array<File>} files
     * @param {string} bizCode
     * @param {Object} options
     */
    )
  }, {
    key: "uploadMultiple",
    value: (function () {
      var _uploadMultiple = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(files, bizCode) {
        var _this = this;
        var options,
          promises,
          _args3 = arguments;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              options = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : {};
              promises = files.map(function (file, index) {
                // 注意：多文件上传时，如果需要分别控制暂停，options 里的回调需要处理 index
                return _this.upload(file, bizCode, _objectSpread2(_objectSpread2({}, options), {}, {
                  onProgress: function onProgress(p, cpt) {
                    if (options.onItemProgress) {
                      options.onItemProgress(index, p, cpt);
                    }
                  },
                  onCancelTask: function onCancelTask(cancel) {
                    if (options.onItemCancelTask) {
                      options.onItemCancelTask(index, cancel);
                    }
                  },
                  // 新增：传递暂停句柄
                  onPauseHandler: function onPauseHandler(pauseFn) {
                    if (options.onItemPauseTask) {
                      options.onItemPauseTask(index, pauseFn);
                    }
                  },
                  // 新增：传递中止句柄
                  onAbortHandler: function onAbortHandler(abortFn) {
                    if (options.onItemAbortTask) {
                      options.onItemAbortTask(index, abortFn);
                    }
                  }
                }));
              });
              return _context3.a(2, Promise.allSettled(promises));
          }
        }, _callee3);
      }));
      function uploadMultiple(_x6, _x7) {
        return _uploadMultiple.apply(this, arguments);
      }
      return uploadMultiple;
    }()
    /**
     * 生成唯一文件名
     */
    )
  }, {
    key: "generateUniqueFileName",
    value: function generateUniqueFileName(originalName, fileName) {
      var randomStr = v4();
      var ext = originalName.split(".").pop();
      if (ext === 'unnamed' && fileName) {
        ext = fileName.split(".").pop();
      }
      return "".concat(randomStr, ".").concat(ext);
    }

    /**
     * 清除所有 STS 缓存
     */
  }], [{
    key: "config",
    value: function config(options) {
      STSProvider.config(options);
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      STSProvider.clearCache();
    }
  }]);
}();

/**
 * 读取 File 为 ArrayBuffer
 */
function readFileAsArrayBuffer$1(_x) {
  return _readFileAsArrayBuffer$1.apply(this, arguments);
}
/**
 * Base64 转 HEX
 */
function _readFileAsArrayBuffer$1() {
  _readFileAsArrayBuffer$1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(file) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          return _context3.a(2, new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
              return resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          }));
      }
    }, _callee3);
  }));
  return _readFileAsArrayBuffer$1.apply(this, arguments);
}
function base64toHEX$1(base64) {
  var raw = window.atob(base64);
  var HEX = "";
  for (var i = 0; i < raw.length; i++) {
    var _hex = raw.charCodeAt(i).toString(16);
    HEX += _hex.length === 2 ? _hex : "0" + _hex;
  }
  return HEX;
}

/**
 * DataURL (Base64) 转 Blob
 */
function dataURLtoBlob$1(dataurl) {
  if (!dataurl || typeof dataurl !== 'string') {
    throw new Error('dataURLtoBlob: dataurl must be a non-empty string');
  }
  var arr = dataurl.split(",");
  if (arr.length < 2) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing comma separator');
  }
  var mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing MIME type');
  }
  var mime = mimeMatch[1];
  var bstr = window.atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}

/**
 * 使用 SM4 对二进制数据加密
 */
function sm4Encrypt$1(arrayBuffer, kmsDataKey) {
  var bytes = new Uint8Array(arrayBuffer);
  var hexData = Array.from(bytes).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
  var hexDataKey = base64toHEX$1(kmsDataKey.dataKey);
  var encryptedHex = sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
    iv: hexDataKey.slice(32, 64),
    mode: "cbc"
  });
  var result = new Uint8Array(encryptedHex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  return result;
}

/**
 * 将 File 加密后构造新的 Blob
 */
function createEncryptedBlob$1(_x2, _x3) {
  return _createEncryptedBlob$1.apply(this, arguments);
}
function _createEncryptedBlob$1() {
  _createEncryptedBlob$1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(file, _ref) {
    var kmsDataKey, arrayBuffer, encryptedData;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          kmsDataKey = _ref.kmsDataKey;
          _context4.n = 1;
          return readFileAsArrayBuffer$1(file);
        case 1:
          arrayBuffer = _context4.v;
          encryptedData = sm4Encrypt$1(arrayBuffer, kmsDataKey);
          return _context4.a(2, new Blob([encryptedData], {
            type: file.type
          }));
      }
    }, _callee4);
  }));
  return _createEncryptedBlob$1.apply(this, arguments);
}
var CosUploader = /*#__PURE__*/function () {
  function CosUploader() {
    _classCallCheck(this, CosUploader);
    this.stsProvider = new STSProvider();
  }

  /**
   * 全局配置
   */
  return _createClass(CosUploader, [{
    key: "upload",
    value: (
    /**
     * 上传单个文件
     * @param {File|Blob|string} file - 要上传的文件
     * @param {string} bizCode - 业务编码
     * @param {Object} options - 配置项
     */
    function () {
      var _upload = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(file, bizCode) {
        var options,
          normalizedFile,
          checkName,
          checkType,
          isHtml,
          errorMsg,
          stsData,
          uploadFile,
          headers,
          _yield$options$extern,
          encryptedFile,
          extraMeta,
          client,
          originalName,
          fileName,
          objectKey,
          _args = arguments,
          _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
              if (!(!file || !bizCode)) {
                _context.n = 1;
                break;
              }
              throw new Error("CosUploader: file and bizCode are required");
            case 1:
              _context.p = 1;
              // 0. 归一化输入
              normalizedFile = file;
              if (typeof file === "string" && file.startsWith("data:")) {
                normalizedFile = dataURLtoBlob$1(file);
              }

              // --- 新增：HTML 文件校验逻辑 ---
              checkName = normalizedFile.name || "";
              checkType = normalizedFile.type || "";
              isHtml = checkName.toLowerCase().endsWith('.html') || checkName.toLowerCase().endsWith('.htm') || checkType === 'text/html';
              if (!(isHtml && !options.allowHTML)) {
                _context.n = 2;
                break;
              }
              errorMsg = "暂不支持上传 HTML 格式文件";
              if (typeof window !== 'undefined' && window.alert) {
                window.alert(errorMsg);
              }
              throw new Error("OssUploader: ".concat(errorMsg));
            case 2:
              _context.n = 3;
              return this.stsProvider.getCredentials({
                bizCode: bizCode
              });
            case 3:
              stsData = _context.v;
              // 2. 处理文件加密
              uploadFile = normalizedFile;
              headers = {};
              if (!stsData.encryptEnable) {
                _context.n = 8;
                break;
              }
              if (!(stsData.kmsDataKey && stsData.kmsDataKey.sm4Supported)) {
                _context.n = 5;
                break;
              }
              _context.n = 4;
              return createEncryptedBlob$1(normalizedFile, stsData);
            case 4:
              uploadFile = _context.v;
              headers = {
                'x-cos-meta-encrypted-version': String(stsData.kmsDataKey.version),
                'x-cos-meta-encrypted-data-key': String(stsData.kmsDataKey.dataKeyEncrypted),
                'x-cos-meta-sm4-supported': '1'
              };
              _context.n = 8;
              break;
            case 5:
              if (!(typeof options.externalEncrypt === 'function')) {
                _context.n = 7;
                break;
              }
              _context.n = 6;
              return options.externalEncrypt(normalizedFile, stsData);
            case 6:
              _yield$options$extern = _context.v;
              encryptedFile = _yield$options$extern.encryptedFile;
              extraMeta = _yield$options$extern.meta;
              uploadFile = encryptedFile;
              // 将 meta 转换为 x-cos-meta- 前缀
              if (extraMeta) {
                Object.keys(extraMeta).forEach(function (key) {
                  headers["x-cos-meta-".concat(key)] = extraMeta[key];
                });
              }
              _context.n = 8;
              break;
            case 7:
              console.warn('CosUploader: encryptEnable=true 但不支持 SM4，按未加密处理');
            case 8:
              // 3. 准备 COS 客户端
              client = new COS({
                getAuthorization: function getAuthorization(options, callback) {
                  var now = Math.floor(Date.now() / 1000);
                  var expiredTime;

                  // 逻辑：如果 expireTime 是 10 位及以上的数字，直接当作秒使用；
                  // 否则尝试用 Date 对象解析（支持 ISO 字符串如 stsData.expiration）
                  if (typeof stsData.expireTime === 'number' && stsData.expireTime > 1000000000) {
                    expiredTime = stsData.expireTime;
                  } else {
                    var expDate = new Date(stsData.expiration || stsData.expireTime);
                    expiredTime = Math.floor(expDate.getTime() / 1000);
                  }

                  // 最终容错：如果解析失败或时间戳不合理，默认 1 小时过期
                  if (isNaN(expiredTime) || expiredTime <= now) {
                    expiredTime = now + 3600;
                  }
                  callback({
                    TmpSecretId: stsData.accessKeyId,
                    TmpSecretKey: stsData.accessKeySecret,
                    SecurityToken: stsData.securityToken,
                    StartTime: now,
                    ExpiredTime: expiredTime
                  });
                }
              }); // 4. 路径处理
              originalName = normalizedFile.name || (normalizedFile.type ? "upload.".concat(normalizedFile.type.split('/')[1]) : "unnamed");
              fileName = options.strictNameMode && options.fileName || this.generateUniqueFileName(originalName, options.fileName);
              objectKey = "".concat(stsData.object, "/").concat(fileName).replace(/\/+/g, "/"); // 5. 执行上传
              return _context.a(2, new Promise(function (resolve, reject) {
                var uploadTaskId = null;
                var isUploadActive = true;

                // 暴露中止句柄
                if (options.onAbortHandler) {
                  options.onAbortHandler(function () {
                    if (!isUploadActive) return;
                    isUploadActive = false;
                    if (uploadTaskId) {
                      client.cancelTask(uploadTaskId);
                    }
                  });
                }

                // 暴露暂停句柄
                if (options.onPauseHandler) {
                  options.onPauseHandler(function () {
                    if (!isUploadActive) return;
                    isUploadActive = false;
                    if (uploadTaskId) {
                      client.pauseTask(uploadTaskId);
                    }
                  });
                }
                client.uploadFile({
                  Bucket: stsData.bucket,
                  Region: stsData.region,
                  Key: objectKey,
                  Body: uploadFile,
                  Headers: headers,
                  SliceSize: options.sliceSize || 1024 * 1024 * 10,
                  // 默认 10MB 分片
                  onTaskReady: function onTaskReady(taskId) {
                    uploadTaskId = taskId;
                  },
                  onProgress: function onProgress(progressData) {
                    if (options.onProgress && isUploadActive) {
                      var percent = Math.floor(progressData.percent * 100);
                      options.onProgress(percent, progressData);
                    }
                  }
                }, function (err, data) {
                  isUploadActive = false;
                  if (err) {
                    if (err.name === 'cancel') {
                      console.log("CosUploader: Upload canceled by user");
                    } else {
                      console.error("CosUploader: Upload failed", err);
                    }
                    return reject(err);
                  }

                  // 构造结果
                  var finalUrl = stsData.domain ? "".concat(stsData.domain.replace(/\/+$/, ""), "/").concat(objectKey.replace(/^\/+/, "")) : "https://".concat(data.Location);
                  resolve(_objectSpread2(_objectSpread2({}, data), {}, {
                    fileName: fileName,
                    url: finalUrl,
                    originUrl: finalUrl,
                    stsData: stsData
                  }));
                });
              }));
            case 9:
              _context.p = 9;
              _t = _context.v;
              console.error("CosUploader: Upload failed", _t);
              throw _t;
            case 10:
              return _context.a(2);
          }
        }, _callee, this, [[1, 9]]);
      }));
      function upload(_x4, _x5) {
        return _upload.apply(this, arguments);
      }
      return upload;
    }()
    /**
     * 上传多个文件
     */
    )
  }, {
    key: "uploadMultiple",
    value: (function () {
      var _uploadMultiple = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(files, bizCode) {
        var _this = this;
        var options,
          promises,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              options = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
              promises = files.map(function (file, index) {
                return _this.upload(file, bizCode, _objectSpread2(_objectSpread2({}, options), {}, {
                  onProgress: function onProgress(p, cpt) {
                    if (options.onItemProgress) {
                      options.onItemProgress(index, p, cpt);
                    }
                  },
                  onPauseHandler: function onPauseHandler(pauseFn) {
                    if (options.onItemPauseTask) {
                      options.onItemPauseTask(index, pauseFn);
                    }
                  },
                  onAbortHandler: function onAbortHandler(abortFn) {
                    if (options.onItemAbortTask) {
                      options.onItemAbortTask(index, abortFn);
                    }
                  }
                }));
              });
              return _context2.a(2, Promise.allSettled(promises));
          }
        }, _callee2);
      }));
      function uploadMultiple(_x6, _x7) {
        return _uploadMultiple.apply(this, arguments);
      }
      return uploadMultiple;
    }()
    /**
    * 生成唯一文件名
    */
    )
  }, {
    key: "generateUniqueFileName",
    value: function generateUniqueFileName(originalName, fileName) {
      var randomStr = v4();
      var ext = originalName.split(".").pop();
      if (ext === 'unnamed' && fileName) {
        ext = fileName.split(".").pop();
      }
      return "".concat(randomStr, ".").concat(ext);
    }

    /**
     * 清除所有 STS 缓存
     */
  }], [{
    key: "config",
    value: function config(options) {
      STSProvider.config(options);
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      STSProvider.clearCache();
    }
  }]);
}();

/**
 * 读取 File 为 ArrayBuffer
 */
function readFileAsArrayBuffer(_x) {
  return _readFileAsArrayBuffer.apply(this, arguments);
}
/**
 * Base64 转 HEX
 */
function _readFileAsArrayBuffer() {
  _readFileAsArrayBuffer = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(file) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          return _context3.a(2, new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
              return resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          }));
      }
    }, _callee3);
  }));
  return _readFileAsArrayBuffer.apply(this, arguments);
}
function base64toHEX(base64) {
  var raw = window.atob(base64);
  var HEX = "";
  for (var i = 0; i < raw.length; i++) {
    var _hex = raw.charCodeAt(i).toString(16);
    HEX += _hex.length === 2 ? _hex : "0" + _hex;
  }
  return HEX;
}

/**
 * DataURL (Base64) 转 Blob
 */
function dataURLtoBlob(dataurl) {
  if (!dataurl || typeof dataurl !== 'string') {
    throw new Error('dataURLtoBlob: dataurl must be a non-empty string');
  }
  var arr = dataurl.split(",");
  if (arr.length < 2) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing comma separator');
  }
  var mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch || !mimeMatch[1]) {
    throw new Error('dataURLtoBlob: invalid data URL format, missing MIME type');
  }
  var mime = mimeMatch[1];
  var bstr = window.atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}

/**
 * 使用 SM4 对二进制数据加密
 */
function sm4Encrypt(arrayBuffer, kmsDataKey) {
  var bytes = new Uint8Array(arrayBuffer);
  var hexData = Array.from(bytes).map(function (b) {
    return b.toString(16).padStart(2, "0");
  }).join("");
  var hexDataKey = base64toHEX(kmsDataKey.dataKey);
  var encryptedHex = sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
    iv: hexDataKey.slice(32, 64),
    mode: "cbc"
  });
  var result = new Uint8Array(encryptedHex.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }));
  return result;
}

/**
 * 将 File 加密后构造新的 Blob
 */
function createEncryptedBlob(_x2, _x3) {
  return _createEncryptedBlob.apply(this, arguments);
}
function _createEncryptedBlob() {
  _createEncryptedBlob = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(file, _ref) {
    var kmsDataKey, arrayBuffer, encryptedData;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          kmsDataKey = _ref.kmsDataKey;
          _context4.n = 1;
          return readFileAsArrayBuffer(file);
        case 1:
          arrayBuffer = _context4.v;
          encryptedData = sm4Encrypt(arrayBuffer, kmsDataKey);
          return _context4.a(2, new Blob([encryptedData], {
            type: file.type
          }));
      }
    }, _callee4);
  }));
  return _createEncryptedBlob.apply(this, arguments);
}
var OssFormUploader = /*#__PURE__*/function () {
  function OssFormUploader() {
    _classCallCheck(this, OssFormUploader);
  }
  return _createClass(OssFormUploader, [{
    key: "upload",
    value: (
    /**
     * 上传单个文件 (使用表单 POST 模式)
     * @param {File|Blob|string} file - 要上传的文件 (File, Blob, 或 Base64 字符串)
     * @param {Object} stsData - 从后端获取的表单上传凭证
     * @param {Object} options - 配置项
     * @param {string} options.fileName - 自定义文件名
     * @param {boolean} options.strictNameMode - 严格名称（如果为 true 且提供了 fileName，则直接使用 fileName）
     * @param {boolean} options.allowHTML - 是否允许上传 HTML 文件
     * @returns {Promise<Object>} 上传结果
     */
    function () {
      var _upload = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(file, stsData) {
        var options,
          normalizedFile,
          checkName,
          checkType,
          isHtml,
          errorMsg,
          originalName,
          fileName,
          objectKey,
          uploadFile,
          meta,
          _yield$options$extern,
          encryptedFile,
          extraMeta,
          formData,
          endpoint,
          response,
          errorText,
          finalUrl,
          domain,
          key,
          separator,
          accessKey,
          _args = arguments,
          _t;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              options = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
              if (!(!file || !stsData)) {
                _context.n = 1;
                break;
              }
              throw new Error("OssFormUploader: file and stsData are required");
            case 1:
              _context.p = 1;
              // 0. 归一化输入：如果是 base64 字符串，转换为 Blob
              normalizedFile = file;
              if (typeof file === "string" && file.startsWith("data:")) {
                normalizedFile = dataURLtoBlob(file);
              }

              // --- 新增：HTML 文件校验逻辑 ---
              checkName = normalizedFile.name || "";
              checkType = normalizedFile.type || "";
              isHtml = checkName.toLowerCase().endsWith('.html') || checkName.toLowerCase().endsWith('.htm') || checkType === 'text/html';
              if (!(isHtml && !options.allowHTML)) {
                _context.n = 2;
                break;
              }
              errorMsg = "暂不支持上传 HTML 格式文件";
              if (typeof window !== 'undefined' && window.alert) {
                window.alert(errorMsg);
              }
              throw new Error("OssFormUploader: ".concat(errorMsg));
            case 2:
              // 路径处理
              // 注意：Blob 没有 name 属性，需要处理
              originalName = normalizedFile.name || (normalizedFile.type ? "upload.".concat(normalizedFile.type.split('/')[1]) : "unnamed");
              fileName = options.strictNameMode && options.fileName || this.generateUniqueFileName(originalName, options.fileName);
              objectKey = "".concat(stsData.object, "/").concat(fileName).replace(/\/+/g, "/"); // 1. 处理文件加密
              uploadFile = normalizedFile;
              meta = {};
              if (!stsData.encryptEnable) {
                _context.n = 6;
                break;
              }
              if (!(stsData.kmsDataKey && stsData.kmsDataKey.sm4Supported)) {
                _context.n = 4;
                break;
              }
              _context.n = 3;
              return createEncryptedBlob(normalizedFile, stsData);
            case 3:
              uploadFile = _context.v;
              meta = {
                'x-oss-meta-encrypted-version': String(stsData.kmsDataKey.version),
                'x-oss-meta-encrypted-data-key': String(stsData.kmsDataKey.dataKeyEncrypted),
                'x-oss-meta-sm4-supported': '1'
              };
              _context.n = 6;
              break;
            case 4:
              if (!(typeof options.externalEncrypt === 'function')) {
                _context.n = 6;
                break;
              }
              _context.n = 5;
              return options.externalEncrypt(normalizedFile, stsData);
            case 5:
              _yield$options$extern = _context.v;
              encryptedFile = _yield$options$extern.encryptedFile;
              extraMeta = _yield$options$extern.meta;
              uploadFile = encryptedFile;
              if (extraMeta) {
                Object.keys(extraMeta).forEach(function (key) {
                  meta["x-oss-meta-".concat(key)] = extraMeta[key];
                });
              }
            case 6:
              // 2. 构造 FormData
              formData = new FormData(); // 注意：OSS 表单上传字段顺序有要求，file 必须在最后
              formData.append('key', objectKey);
              formData.append('policy', stsData.policy);
              formData.append('OSSAccessKeyId', stsData.accessKeyId);
              formData.append('success_action_status', '200'); // 让 OSS 返回 200 而不是 204
              formData.append('signature', stsData.signature);
              if (stsData.securityToken) {
                formData.append('x-oss-security-token', stsData.securityToken);
              }

              // 添加加密元数据
              Object.keys(meta).forEach(function (key) {
                formData.append(key, meta[key]);
              });

              // 最后添加文件
              formData.append('file', uploadFile);

              // 3. 执行上传请求
              endpoint = stsData.endpoint.replace(/\/+$/, "");
              _context.n = 7;
              return fetch(endpoint, {
                method: 'POST',
                body: formData
              });
            case 7:
              response = _context.v;
              if (response.ok) {
                _context.n = 9;
                break;
              }
              _context.n = 8;
              return response.text();
            case 8:
              errorText = _context.v;
              throw new Error("OssFormUploader: Upload failed with status ".concat(response.status, ". ").concat(errorText));
            case 9:
              // 4. 拼接最终访问地址
              finalUrl = "";
              if (stsData.domain) {
                domain = stsData.domain.replace(/\/+$/, "");
                key = objectKey.replace(/^\/+/, "");
                finalUrl = "".concat(domain, "/").concat(key);
              } else {
                // 如果没有 domain，尝试从 endpoint 拼接 (仅供参考，生产建议使用 domain)
                finalUrl = "".concat(endpoint, "/").concat(objectKey.replace(/^\/+/, ""));
              }

              // 如果开启了加密，追加访问参数
              if (stsData.encryptEnable && stsData.kmsDataKey) {
                separator = finalUrl.includes("?") ? "&" : "?";
                accessKey = stsData.kmsDataKey.accessKey || "";
                finalUrl = "".concat(finalUrl).concat(separator, "accessKey=").concat(accessKey, "&v=1&encrypted=1");
              }
              return _context.a(2, {
                url: finalUrl,
                fileName: fileName,
                stsData: stsData
              });
            case 10:
              _context.p = 10;
              _t = _context.v;
              console.error("OssFormUploader: Upload failed", _t);
              throw _t;
            case 11:
              return _context.a(2);
          }
        }, _callee, this, [[1, 10]]);
      }));
      function upload(_x4, _x5) {
        return _upload.apply(this, arguments);
      }
      return upload;
    }()
    /**
     * 上传多个文件
     * @param {Array<Object>} items - 每个 item 包含 { file, stsData }
     */
    )
  }, {
    key: "uploadMultiple",
    value: (function () {
      var _uploadMultiple = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(items) {
        var _this = this;
        var options,
          promises,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              options = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
              promises = items.map(function (item, index) {
                return _this.upload(item.file, item.stsData, options);
              });
              return _context2.a(2, Promise.allSettled(promises));
          }
        }, _callee2);
      }));
      function uploadMultiple(_x6) {
        return _uploadMultiple.apply(this, arguments);
      }
      return uploadMultiple;
    }()
    /**
     * 生成唯一文件名
     */
    )
  }, {
    key: "generateUniqueFileName",
    value: function generateUniqueFileName(originalName, fileName) {
      var randomStr = v4();
      var ext = originalName.split(".").pop();
      if (ext === 'unnamed' && fileName) {
        ext = fileName.split(".").pop();
      }
      return "".concat(randomStr, ".").concat(ext);
    }
  }]);
}();

export { CosUploader, OssFormUploader, OssUploader, STSProvider };
//# sourceMappingURL=index.esm.js.map

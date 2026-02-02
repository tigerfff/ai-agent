import { _ as _createClass, a as _asyncToGenerator, b as _classCallCheck, c as _regenerator, d as _objectSpread2 } from './chunks/_rollupPluginBabelHelpers-BNeGiYUC.esm.js';
import COS from 'cos-js-sdk-v5';
import { STSProvider } from './sts.esm.js';
import { sm4 } from 'sec-crypto';
import { v4 } from 'uuid';
import 'crypto-js';
import 'jsrsasign';

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
              return createEncryptedBlob(normalizedFile, stsData);
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

export { CosUploader };
//# sourceMappingURL=cos.esm.js.map

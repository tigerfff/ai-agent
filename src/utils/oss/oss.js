'use strict';

var _rollupPluginBabelHelpers = require('./chunks/_rollupPluginBabelHelpers-CLQ70nLH.js');
var OSS = require('ali-oss');
var sts = require('./sts.js');
var secCrypto = require('sec-crypto');
var uuid = require('uuid');
require('crypto-js');
require('jsrsasign');

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
  _readFileAsArrayBuffer = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee4(file) {
    return _rollupPluginBabelHelpers._regenerator().w(function (_context4) {
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
  var encryptedHex = secCrypto.sm4.encrypt(hexData, hexDataKey.slice(0, 32), {
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
  _createEncryptedBlob = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee5(file, _ref) {
    var kmsDataKey, arrayBuffer, encryptedData;
    return _rollupPluginBabelHelpers._regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          kmsDataKey = _ref.kmsDataKey;
          _context5.n = 1;
          return readFileAsArrayBuffer(file);
        case 1:
          arrayBuffer = _context5.v;
          encryptedData = sm4Encrypt(arrayBuffer, kmsDataKey);
          return _context5.a(2, new Blob([encryptedData], {
            type: file.type
          }));
      }
    }, _callee5);
  }));
  return _createEncryptedBlob.apply(this, arguments);
}
var OssUploader = /*#__PURE__*/function () {
  function OssUploader() {
    _rollupPluginBabelHelpers._classCallCheck(this, OssUploader);
    this.stsProvider = new sts.STSProvider();
  }

  /**
   * 全局配置
   */
  return _rollupPluginBabelHelpers._createClass(OssUploader, [{
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
      var _upload = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee2(file, bizCode) {
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
        return _rollupPluginBabelHelpers._regenerator().w(function (_context2) {
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
                normalizedFile = dataURLtoBlob(file);
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
              return createEncryptedBlob(normalizedFile, stsData);
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
                options.onAbortHandler(/*#__PURE__*/_rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee() {
                  return _rollupPluginBabelHelpers._regenerator().w(function (_context) {
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
                  console.log(p, cpt, "progress");
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
              return _context2.a(2, _rollupPluginBabelHelpers._objectSpread2(_rollupPluginBabelHelpers._objectSpread2({}, result), {}, {
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
      var _uploadMultiple = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee3(files, bizCode) {
        var _this = this;
        var options,
          promises,
          _args3 = arguments;
        return _rollupPluginBabelHelpers._regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              options = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : {};
              promises = files.map(function (file, index) {
                // 注意：多文件上传时，如果需要分别控制暂停，options 里的回调需要处理 index
                return _this.upload(file, bizCode, _rollupPluginBabelHelpers._objectSpread2(_rollupPluginBabelHelpers._objectSpread2({}, options), {}, {
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
      var randomStr = uuid.v4();
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
      sts.STSProvider.config(options);
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      sts.STSProvider.clearCache();
    }
  }]);
}();

exports.OssUploader = OssUploader;
//# sourceMappingURL=oss.js.map

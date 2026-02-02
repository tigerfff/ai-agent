'use strict';

var _rollupPluginBabelHelpers = require('./chunks/_rollupPluginBabelHelpers-CLQ70nLH.js');
var secCrypto = require('sec-crypto');
var uuid = require('uuid');

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
  _readFileAsArrayBuffer = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee3(file) {
    return _rollupPluginBabelHelpers._regenerator().w(function (_context3) {
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
  _createEncryptedBlob = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee4(file, _ref) {
    var kmsDataKey, arrayBuffer, encryptedData;
    return _rollupPluginBabelHelpers._regenerator().w(function (_context4) {
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
    _rollupPluginBabelHelpers._classCallCheck(this, OssFormUploader);
  }
  return _rollupPluginBabelHelpers._createClass(OssFormUploader, [{
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
      var _upload = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee(file, stsData) {
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
        return _rollupPluginBabelHelpers._regenerator().w(function (_context) {
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
      var _uploadMultiple = _rollupPluginBabelHelpers._asyncToGenerator(/*#__PURE__*/_rollupPluginBabelHelpers._regenerator().m(function _callee2(items) {
        var _this = this;
        var options,
          promises,
          _args2 = arguments;
        return _rollupPluginBabelHelpers._regenerator().w(function (_context2) {
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
      var randomStr = uuid.v4();
      var ext = originalName.split(".").pop();
      if (ext === 'unnamed' && fileName) {
        ext = fileName.split(".").pop();
      }
      return "".concat(randomStr, ".").concat(ext);
    }
  }]);
}();

exports.OssFormUploader = OssFormUploader;
//# sourceMappingURL=form.js.map

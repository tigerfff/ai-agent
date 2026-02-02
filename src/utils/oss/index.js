'use strict';

var oss = require('./oss.js');
var cos = require('./cos.js');
var form = require('./form.js');
var sts = require('./sts.js');
require('./chunks/_rollupPluginBabelHelpers-CLQ70nLH.js');
require('ali-oss');
require('sec-crypto');
require('uuid');
require('cos-js-sdk-v5');
require('crypto-js');
require('jsrsasign');



exports.OssUploader = oss.OssUploader;
exports.CosUploader = cos.CosUploader;
exports.OssFormUploader = form.OssFormUploader;
exports.STSProvider = sts.STSProvider;
//# sourceMappingURL=index.js.map

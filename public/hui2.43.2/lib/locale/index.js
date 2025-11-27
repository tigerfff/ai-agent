"use strict";

exports.__esModule = true;
exports.use = exports.t = exports.i18n = exports.default = void 0;

var _en = _interopRequireDefault(require("hui/lib/locale/lang/en"));

var _vue = _interopRequireDefault(require("vue"));

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _format = _interopRequireDefault(require("./format"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var format = (0, _format.default)(_vue.default);
var lang = _en.default;
var merged = false;

var i18nHandler = function i18nHandler() {
  var vuei18n = Object.getPrototypeOf(this || _vue.default).$t;

  if (typeof vuei18n === 'function' && !!_vue.default.locale) {
    if (!merged) {
      merged = true;

      _vue.default.locale(_vue.default.config.lang, (0, _deepmerge.default)(lang, _vue.default.locale(_vue.default.config.lang) || {}, {
        clone: true
      }));
    }

    return vuei18n.apply(this, arguments);
  }
};

var t = function t(path, options) {
  var value = i18nHandler.apply(this, arguments);
  if (value !== null && value !== undefined) return value;
  var array = path.split('.');
  var current = lang;

  for (var i = 0, j = array.length; i < j; i++) {
    var property = array[i];
    value = current[property];
    if (i === j - 1) return format(value, options);
    if (!value) return '';
    current = value;
  }

  return '';
};

exports.t = t;

var use = function use(l) {
  lang = l || lang;
};

exports.use = use;

var i18n = function i18n(fn) {
  i18nHandler = fn || i18nHandler;
};

exports.i18n = i18n;
var _default = {
  use: use,
  t: t,
  i18n: i18n
};
exports.default = _default;
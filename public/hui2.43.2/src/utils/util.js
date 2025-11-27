const hasOwnProperty = Object.prototype.hasOwnProperty;

export function noop() {}

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

function extend(to, _from) {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}

export function toObject(arr) {
  var res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

export const getValueByPath = function(object, prop) {
  prop = prop || '';
  const paths = prop.split('.');
  let current = object;
  let result = null;
  for (let i = 0, j = paths.length; i < j; i++) {
    const path = paths[i];
    if (!current) break;

    if (i === j - 1) {
      result = current[path];
      break;
    }
    current = current[path];
  }
  return result;
};

export function getPropByPath(obj, path, strict, keyIncludePoint = false) {
  let tempObj = obj;
  path = path.replace(/\[(\w+)\]/g, '.$1');
  path = path.replace(/^\./, '');

  let keyArr = path.split('.');
  let i = 0;
  if (keyIncludePoint) {
    keyArr = [path];
  }
  for (let len = keyArr.length; i < len - 1; ++i) {
    const key = keyArr[i];
    if (key in tempObj) {
      tempObj = tempObj[key];
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!');
      }
      break;
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj[keyArr[i]]
  };
}

/**
 * 原生ajax
 * add by zhangxiaogang 2017-09-27
 * @param {string} opt.method http连接的方式，包括POST和GET两种方式
 * @param {string} opt.url 发送请求的url
 * @param {boolean} opt.async 是否为异步请求，true为异步的，false为同步的
 * @param {object} opt.data 发送的参数，格式为对象类型
 * @param {object} opt.dataType 返回的数据格式，默认json，如果返回原生text格式请传入dataType:'text'

 * @param {function} opt.success ajax发送并接收成功调用的回调函数
 * @param {function} opt.error ajax请求失败的回调
 */
function ajax(opt) {
  opt = opt || {};
  opt.type = (opt.method && opt.method.toUpperCase()) || 'GET';
  opt.url = opt.url || '';
  opt.async = !!opt.async;
  opt.data = opt.data || opt.params || {};
  var xmlHttp = null;
  if (XMLHttpRequest) {
    xmlHttp = new XMLHttpRequest();
  } else {
    xmlHttp = new window.ActiveXObject('Microsoft.XMLHTTP');
  }
  var params = [];
  for (var key in opt.data) {
    params.push(key + '=' + opt.data[key]);
  }
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState === 4) {
      if (xmlHttp.status === 200) {
        var resp = xmlHttp.responseText;
        if (opt.dataType !== 'text') {
          resp = JSON.parse(resp);
        }
        opt.success && opt.success(resp);
      } else {
        opt.error && opt.error(new Error(xmlHttp.statusText));
      }
    }
  };
  var postData = params.join('&');
  if (opt.type.toUpperCase() === 'POST') {
    xmlHttp.open(opt.type, opt.url, opt.async);
    xmlHttp.setRequestHeader(
      'Content-Type',
      'application/x-www-form-urlencoded;charset=utf-8'
    );
    if (opt.headers) {
      for (const c in opt.headers) {
        xmlHttp.setRequestHeader(c, opt.headers[c]);
      }
    }
    xmlHttp.send(postData);
  } else if (opt.type.toUpperCase() === 'GET') {
    var connector = ~opt.url.indexOf('?') ? '&' : '?';
    xmlHttp.open(
      opt.type,
      opt.url + (postData && connector) + postData,
      opt.async
    );
    xmlHttp.send(null);
  }
}

/**
 * 返回包含ajax功能的promise函数对象
 * add by zhangxiaogang 2017-09-27
 * @param {object} opt ajax请求传参
 */
export function defaultPromise(opt) {
  if (Object.prototype.toString.call(opt) !== '[object Object]') return null;
  return new window.Promise((resolve, reject) => {
    opt.success = resolve;
    opt.error = reject;
    ajax(opt);
  });
}

/**
 * 深度合并对象
 * add by zhangxiaogang 2018-05-04
 */
export function objectMerge(to, from) {
  for (var key in from) {
    to[key] =
      to[key] && to[key].toString() === '[object Object]'
        ? objectMerge(to[key], from[key])
        : (to[key] = from[key]);
  }
  return to;
}

// TODO: use native Array.find, Array.findIndex when IE support is dropped
export const arrayFindIndex = function(arr, pred) {
  for (let i = 0; i !== arr.length; ++i) {
    if (pred(arr[i])) {
      return i;
    }
  }
  return -1;
};

export const arrayFind = function(arr, pred) {
  const idx = arrayFindIndex(arr, pred);
  return idx !== -1 ? arr[idx] : undefined;
};

// coerce truthy value to array
export const coerceTruthyValueToArray = function(val) {
  if (Array.isArray(val)) {
    return val;
  } else if (val) {
    return [val];
  } else {
    return [];
  }
};

export const generateId = function() {
  return Math.floor(Math.random() * 10000);
};

/**
 * @desc 找到子组件中的目标组件
 * @author chenguanbin
 * @param {Object} context 父组件
 * @param {String} componentName 子组件名称
 */
export const findComponentsDownward = (context, componentName) => {
  return context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child);
    const foundChilds = findComponentsDownward(child, componentName);
    return components.concat(foundChilds);
  }, []);
};

/**
 * Check if the given variable is a function
 * @function
 * @author fanzhuohua
 * @argument {*} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
export function isFunction(functionToCheck) {
  var getType = {};
  return (
    functionToCheck &&
    getType.toString.call(functionToCheck) === '[object Function]'
  );
}

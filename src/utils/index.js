export function getVideoFrameUrl(url, t = 0, w = 0, h = 0, f = 'png') {
  if (!url) return ''
  const str = ["video/snapshot", `t_${t}`, `w_${w}`, `h_${h}`, `f_${f}`].join(
    ","
  );
  return `${url}${url.includes('?') ? '&' : '?'}x-oss-process=${str}`;
}

/**
 * 格式化会话时间
 * 规则：
 * - 今天：今天 HH:mm:ss
 * - 昨天：昨天 HH:mm:ss
 * - 其他：YYYY/MM/DD HH:mm:ss
 * @param {string|number|Date} dateStr 
 * @returns {string}
 */
export function formatConversationTime(dateStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const pad = (n) => n.toString().padStart(2, '0');
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  
  // 今天
  if (date >= today) {
    return `今天 ${timeStr}`;
  }
  
  // 昨天
  if (date >= yesterday && date < today) {
    return `昨天 ${timeStr}`;
  }
  
  // 其他 (30天内及更早)
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  
  return `${year}/${month}/${day} ${timeStr}`;
}

/**
 * Cookie 操作工具函数
 */
export const cookieUtils = {
  /**
   * 设置 cookie
   * @param {string} name - cookie 名称
   * @param {string} value - cookie 值
   * @param {Object} options - 选项 { expires: 天数, path: '/', domain: '', secure: false, sameSite: 'Lax' }
   */
  set(name, value, options = {}) {
    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.expires) {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieStr += `; expires=${date.toUTCString()}`;
    }
    
    if (options.path) {
      cookieStr += `; path=${options.path}`;
    } else {
      cookieStr += '; path=/';
    }
    
    if (options.domain) {
      cookieStr += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookieStr += '; secure';
    }
    
    if (options.sameSite) {
      cookieStr += `; sameSite=${options.sameSite}`;
    }
    
    document.cookie = cookieStr;
  },
  
  /**
   * 获取 cookie
   * @param {string} name - cookie 名称
   * @returns {string|null}
   */
  get(name) {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
      }
    }
    return null;
  },
  
  /**
   * 删除 cookie
   * @param {string} name - cookie 名称
   * @param {Object} options - 选项 { path: '/', domain: '' }
   */
  remove(name, options = {}) {
    this.set(name, '', {
      ...options,
      expires: -1
    });
  }
};

/**
 * 从 URL 参数中获取 token 并写入 cookie
 * @param {string} paramName - URL 参数名，默认为 'token'
 * @param {string} cookieName - Cookie 名称，默认为 'accessToken'
 * @param {Object} cookieOptions - Cookie 选项
 */
export function syncTokenFromUrl(paramName = 'token', cookieName = 'accessToken', cookieOptions = {}) {
  // 获取 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get(paramName);
  
  if (token) {
    // 将 token 写入 cookie
    cookieUtils.set(cookieName, token, {
      expires: 30, // 默认 30 天过期
      path: '/',
      ...cookieOptions
    });
    
    // 可选：从 URL 中移除 token 参数（避免 token 暴露在地址栏）
    if (window.history && window.history.replaceState) {
      urlParams.delete(paramName);
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
    }
    
    return token;
  }
  
  return null;
}

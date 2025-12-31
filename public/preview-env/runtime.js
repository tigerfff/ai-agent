/**
 * 预览环境运行时
 * 负责接收代码、编译、渲染
 */

(function() {
  'use strict'
  
  console.log('🚀 预览环境运行时启动')
  
  var currentApp = null // 当前 Vue 实例
  var registeredComponents = {} // 已注册的自定义组件
  var initStartTime = Date.now() // 初始化开始时间
  var maxInitTime = 10000 // 最大初始化时间（10秒）
  
  /**
   * 初始化预览环境
   */
  function init() {
    console.log('📦 检查依赖...')
    
    // 检查是否超时
    if (Date.now() - initStartTime > maxInitTime) {
      console.error('❌ 预览环境初始化超时')
      showError('预览环境初始化超时', '请检查网络连接或刷新页面重试')
      // 即使超时，也发送 READY 消息，让父窗口知道
      sendMessageToParent({
        type: 'PREVIEW_READY',
        error: '初始化超时'
      })
      return
    }
    
    // 检查 Vue
    if (typeof Vue === 'undefined') {
      console.error('❌ Vue 未加载，等待中...')
      setTimeout(init, 100)
      return
    }
    console.log('✅ Vue 已加载:', Vue.version)
    
    // 注册 hui2.43.2
    if (window.hui) {
      var HUI = window.hui.default || window.hui
      if (HUI) {
        if (typeof HUI.install === 'function') {
          Vue.use(HUI)
          console.log('✅ hui2.43.2 已注册 (Vue.use)')
        } else {
          // 手动注册组件
          var count = 0
          Object.keys(HUI).forEach(function(key) {
            var component = HUI[key]
            if (component && component.name && typeof component.name === 'string') {
              Vue.component(component.name, component)
              count++
            }
          })
          console.log('✅ hui2.43.2 已手动注册 ' + count + ' 个组件')
        }
      } else {
        console.warn('⚠️ window.hui 存在但无法访问')
      }
    } else {
      console.warn('⚠️ window.hui 未找到，可能还在加载中')
      // 等待一下再试
      setTimeout(function() {
        if (window.hui) {
          console.log('🔄 检测到 hui 已加载，重新初始化')
          init()
        } else {
          console.warn('⚠️ hui2.43.2 加载超时，继续初始化（部分功能可能不可用）')
          continueInit()
        }
      }, 1000) // 增加到 1 秒
      return
    }
    
    // 注册 hui-pro
    if (window.page) {
      var PagePlugin = window.page.default || window.page
      if (PagePlugin) {
        if (typeof PagePlugin === 'function') {
          Vue.use(PagePlugin)
          console.log('✅ hui-pro 已注册 (function)')
        } else if (PagePlugin.install) {
          Vue.use(PagePlugin)
          console.log('✅ hui-pro 已注册 (install)')
        } else {
          console.warn('⚠️ window.page 存在但无法注册')
        }
      }
    } else {
      console.warn('⚠️ window.page 未找到')
    }
    
    continueInit()
  }
  
  /**
   * 继续初始化（依赖注册完成后）
   */
  function continueInit() {
    console.log('🚀 继续初始化...')
    
    // 监听来自父窗口的消息
    window.addEventListener('message', handleMessage)
    console.log('✅ 消息监听器已就绪')
    
    // 隐藏加载提示
    var loading = document.getElementById('preview-loading')
    if (loading) {
      loading.style.display = 'none'
    }
    
    // 通知父窗口准备就绪
    console.log('📤 发送 PREVIEW_READY 消息给父窗口')
    sendMessageToParent({
      type: 'PREVIEW_READY'
    })
    console.log('✅ 预览环境初始化完成')
  }
  
  /**
   * 处理来自父窗口的消息
   */
  function handleMessage(event) {
    var data = event.data
    
    if (!data || !data.type) return
    
    console.log('📨 收到消息:', data.type)
    
    switch (data.type) {
      case 'RENDER_CODE':
        renderCode(data.code, data.customComponents)
        break
      case 'CLEAR_PREVIEW':
        clearPreview()
        break
      default:
        console.warn('未知消息类型:', data.type)
    }
  }
  
  /**
   * 渲染代码
   */
  function renderCode(code, customComponents) {
    console.log('🎨 开始渲染代码')
    
    try {
      // 1. 清除之前的实例
      if (currentApp) {
        currentApp.$destroy()
        currentApp = null
      }
      
      // 2. 注册自定义组件
      if (customComponents && customComponents.length > 0) {
        console.log('📦 注册自定义组件:', customComponents.length, '个')
        customComponents.forEach(function(comp) {
          try {
            var compiled = compileComponent(comp.code, comp.name)
            Vue.component(comp.name, compiled)
            registeredComponents[comp.name] = compiled
            console.log('✅ 已注册自定义组件:', comp.name)
          } catch (err) {
            console.error('❌ 注册自定义组件失败:', comp.name, err)
          }
        })
      }
      
      // 3. 编译主组件
      var mainComponent = compileComponent(code, 'PreviewComponent')
      
      // 4. 处理代码中的 import 语句（替换为全局变量）
      mainComponent = processImports(mainComponent)
      
      // 5. 创建 Vue 实例
      var root = document.getElementById('preview-root')
      root.innerHTML = '<div id="preview-app"></div>'
      
      currentApp = new Vue({
        el: '#preview-app',
        render: function(h) {
          return h(mainComponent)
        }
      })
      
      console.log('✅ 渲染成功')
      sendMessageToParent({
        type: 'RENDER_SUCCESS'
      })
      
    } catch (error) {
      console.error('❌ 渲染失败:', error)
      showError(error.message, error.stack)
      sendMessageToParent({
        type: 'RENDER_ERROR',
        error: error.message,
        stack: error.stack
      })
    }
  }
  
  /**
   * 编译 Vue 组件
   */
  function compileComponent(code, componentName) {
    console.log('🔨 编译组件:', componentName)
    
    // 解析 SFC
    var parsed = parseSFC(code)
    
    if (!parsed.template && !parsed.script) {
      throw new Error('组件代码必须包含 template 或 script')
    }
    
    // 处理 script
    var componentOptions = {}
    
    if (parsed.script) {
      // 移除 import 语句
      var processedScript = parsed.script
        .split('\n')
        .filter(function(line) {
          var trimmed = line.trim()
          return !trimmed.startsWith('import ') && !trimmed.startsWith('// import')
        })
        .join('\n')
      
      // 移除 export default
      processedScript = processedScript.replace(/export\s+default\s+/, '')
      
      // 确保脚本被括号包裹（将代码块转换为对象字面量）
      processedScript = processedScript.trim()
      if (processedScript.startsWith('{') && !processedScript.startsWith('({')) {
        processedScript = '(' + processedScript + ')'
      }
      
      // 执行 script 获取组件选项
      try {
        console.log('📝 处理后的脚本（前100字符）:', processedScript.substring(0, 100))
        // eslint-disable-next-line no-new-func
        var optionsFn = new Function('return ' + processedScript)
        componentOptions = optionsFn()
        console.log('✅ 组件选项解析成功')
      } catch (err) {
        console.error('执行组件脚本失败:', err)
        console.error('问题脚本:', processedScript)
        throw new Error('组件脚本解析失败: ' + err.message)
      }
    }
    
    // 添加 template
    if (parsed.template) {
      componentOptions.template = '<div class="preview-component">' + parsed.template + '</div>'
    }
    
    // 添加组件名称
    if (!componentOptions.name) {
      componentOptions.name = componentName
    }
    
    // 注入样式
    if (parsed.styles && parsed.styles.length > 0) {
      injectStyles(parsed.styles, componentName)
    }
    
    return componentOptions
  }
  
  /**
   * 解析 Vue SFC
   */
  function parseSFC(source) {
    var templateMatch = source.match(/<template[^>]*>([\s\S]*)<\/template>/)
    var scriptMatch = source.match(/<script[^>]*>([\s\S]*)<\/script>/)
    var styleMatches = []
    
    var styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g
    var match
    while ((match = styleRegex.exec(source)) !== null) {
      var isScoped = match[0].includes('scoped')
      styleMatches.push({
        content: match[1].trim(),
        scoped: isScoped
      })
    }
    
    return {
      template: templateMatch ? templateMatch[1].trim() : '',
      script: scriptMatch ? scriptMatch[1].trim() : '',
      styles: styleMatches
    }
  }
  
  /**
   * 注入样式
   */
  function injectStyles(styles, componentName) {
    var styleContainer = document.getElementById('preview-styles')
    
    styles.forEach(function(style, index) {
      var styleId = 'style-' + componentName + '-' + index
      var existingStyle = document.getElementById(styleId)
      
      if (existingStyle) {
        existingStyle.remove()
      }
      
      var styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.textContent = style.content
      styleContainer.appendChild(styleEl)
    })
  }
  
  /**
   * 处理 import 语句（替换为全局变量）
   */
  function processImports(componentOptions) {
    // 在 methods 执行时，确保可以访问 utils 和 validators
    if (componentOptions.methods) {
      var originalMethods = componentOptions.methods
      componentOptions.methods = {}
      
      Object.keys(originalMethods).forEach(function(key) {
        var originalMethod = originalMethods[key]
        componentOptions.methods[key] = function() {
          // 注入 utils 和 validators 到当前作用域
          var formatDate = window.__previewUtils.formatDate
          var formatMoney = window.__previewUtils.formatMoney
          var formatNumber = window.__previewUtils.formatNumber
          
          return originalMethod.apply(this, arguments)
        }
      })
    }
    
    return componentOptions
  }
  
  /**
   * 清除预览
   */
  function clearPreview() {
    if (currentApp) {
      currentApp.$destroy()
      currentApp = null
    }
    
    var root = document.getElementById('preview-root')
    root.innerHTML = '<div id="preview-loading">预览已清除</div>'
    
    console.log('🧹 预览已清除')
  }
  
  /**
   * 显示错误
   */
  function showError(message, stack) {
    var root = document.getElementById('preview-root')
    root.innerHTML = 
      '<div id="preview-error">' +
      '  <h3>❌ 预览错误</h3>' +
      '  <p>' + message + '</p>' +
      (stack ? '  <pre>' + stack + '</pre>' : '') +
      '</div>'
  }
  
  /**
   * 发送消息给父窗口
   */
  function sendMessageToParent(data) {
    try {
      if (window.parent && window.parent !== window) {
        console.log('📤 向父窗口发送消息:', data.type)
        window.parent.postMessage(data, '*')
      } else {
        console.warn('⚠️ 无法发送消息：父窗口不存在')
      }
    } catch (error) {
      console.error('❌ 发送消息失败:', error)
    }
  }
  
  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
  
})()


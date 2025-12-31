const isUndefined = (val)=>typeof val === 'undefined';

const isServer$1 = typeof window !== 'undefined' ? isUndefined(window || document) : false;

const isNull = (val)=>val === null;

const isNil = (val)=>isUndefined(val) || isNull(val);

const isWindow = (el)=>!isNil(el) ? el === el.window : false;

/**
 * @desc 移除监听元素大小变化
 * @author zhanghuiqi
 * @param {Document} el 监听的元素
 * @param {Function} fn 回调函数
 */ const offResize = (el, fn)=>{
    if (!el || !el.__resizeListeners__) return;
    el.__resizeListeners__.splice(el.__resizeListeners__.indexOf(fn), 1);
    if (!el.__resizeListeners__.length) {
        if (el.__ro__ && el.__ro__.disconnect) {
            el.__ro__.disconnect();
        } else if (el.__ro__ && el.__ro__.disconnect === undefined) {
            // 降级方案的清理
            if (el.__resizeTimer__) {
                clearInterval(el.__resizeTimer__);
                delete el.__resizeTimer__;
            }
        }
        delete el.__ro__;
        delete el.__resizeLast__;
    }
};

const polyfill$1 = (el, event, fn)=>{
    if (event === 'resize') {
        if (!isWindow(el)) {
            offResize(el, fn);
        }
    }
};
const off = function() {
    if (isServer$1 || typeof window === 'undefined') {
        return;
    }
    if (window.removeEventListener) {
        return function(el, event, fn, capture = false) {
            polyfill$1(el, event, fn);
            el.removeEventListener(event, fn, capture);
        };
    } else {
        return function(el, event, fn) {
            polyfill$1(el, event, fn);
            el.detachEvent(`on${event}`, fn.prototype[`$$${event}`].$$function);
            if (fn.prototype[`$$${event}`].$$el.length === 1) {
                delete fn.prototype[`$$${event}`];
            } else {
                for(const i in fn.prototype[`$$${event}`].$$el){
                    if (fn.prototype[`$$${event}`].$$el[i] === el) {
                        fn.prototype[`$$${event}`].$$el.splice(i, 1);
                        break;
                    }
                }
            }
        };
    }
}();

const isServer = typeof window === 'undefined';
// 检查浏览器是否支持 ResizeObserver
const hasResizeObserver = ()=>{
    return typeof ResizeObserver !== 'undefined';
};
/**
 * @desc 元素大小变化时的动作
 * @param {Array} entries 监听元素的集合
 */ const resizeHandler = (entries)=>{
    for (const entry of entries){
        const listeners = entry.target.__resizeListeners__ || [];
        if (listeners.length) {
            listeners.forEach((fn)=>{
                fn();
            });
        }
    }
};
/**
 * @desc 监听元素大小变化
 * @param {Document} el 监听的元素
 * @param {Function} fn 回调函数
 */ const onResize = (el, fn)=>{
    if (isServer) return;
    if (!el.__resizeListeners__) {
        el.__resizeListeners__ = [];
        // 使用原生 ResizeObserver，如果不支持则使用降级方案
        if (hasResizeObserver()) {
            el.__ro__ = new ResizeObserver(resizeHandler);
            el.__ro__.observe(el);
        } else {
            // 降级方案：使用定时器检测元素大小变化
            el.__ro__ = {
                observe: ()=>{
                    // 记录初始尺寸
                    el.__resizeLast__ = {
                        width: el.offsetWidth,
                        height: el.offsetHeight
                    };
                    // 定时检测尺寸变化
                    el.__resizeTimer__ = setInterval(()=>{
                        const current = {
                            width: el.offsetWidth,
                            height: el.offsetHeight
                        };
                        if (el.__resizeLast__.width !== current.width || el.__resizeLast__.height !== current.height) {
                            el.__resizeLast__ = current;
                            resizeHandler([
                                {
                                    target: el
                                }
                            ]);
                        }
                    }, 100);
                },
                disconnect: ()=>{
                    if (el.__resizeTimer__) {
                        clearInterval(el.__resizeTimer__);
                        delete el.__resizeTimer__;
                    }
                }
            };
            el.__ro__.observe();
        }
    }
    el.__resizeListeners__.push(fn);
};

const polyfill = (el, event, fn)=>{
    if (event === 'resize') {
        if (!isWindow(el)) {
            onResize(el, fn);
        }
    }
};
const on = function() {
    if (isServer$1 || typeof window === 'undefined') {
        return;
    }
    if (window.addEventListener) {
        return function(el, event, fn, capture = false) {
            polyfill(el, event, fn);
            el.addEventListener(event, fn, capture);
        };
    } else {
        return function(el, event, fn) {
            polyfill(el, event, fn);
            if (!fn.prototype[`$$${event}`]) {
                fn.prototype[`$$${event}`] = {
                    $$function: function(event) {
                        fn.call(el, event);
                    },
                    $$el: [
                        el
                    ]
                };
                el.attachEvent(`on${event}`, fn.prototype[`$$${event}`].$$function);
            } else {
                let hasListener = true;
                for(const i in fn.prototype[`$$${event}`].$$el){
                    if (fn.prototype[`$$${event}`].$$el[i] === el) {
                        hasListener = false;
                        break;
                    }
                }
                if (hasListener === true) {
                    el.attachEvent(`on${event}`, fn.prototype[`$$${event}`].$$function);
                } else {
                    let hasListener = true;
                    for(const i in fn.prototype[`$$${event}`].$$el){
                        if (fn.prototype[`$$${event}`].$$el[i] === el) {
                            hasListener = false;
                            break;
                        }
                    }
                    if (hasListener === true) {
                        el.attachEvent(`on${event}`, fn.prototype[`$$${event}`].$$function);
                        fn.prototype[`$$${event}`].$$el.push(el);
                    }
                }
            }
        };
    }
}();

const throttle = (func, wait = 16, opts = {
    noStart: false,
    noEnd: false
})=>{
    let context, args, result;
    let timeout = null;
    let previous = 0;
    const later = function() {
        previous = opts.noStart ? 0 : +new Date();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) {
            context = args = null;
        }
    };
    return function() {
        const now = +new Date();
        if (!previous && opts.noStart) {
            previous = now;
        }
        const remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
            if (!timeout) {
                context = args = null;
            }
        } else if (!timeout && !opts.noEnd) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

//
//
//
//
//
//
//
//
//
//
//
//
//
var script = {
    name: 'HikCloudPageContent',
    provide () {
        return {
            pageContent: this
        };
    },
    props: {
        // 内部是否使用 flex 布局
        flex: {
            type: Boolean,
            default: true
        },
        // 使用 flex 布局时，水平方向是否居中
        alignCenter: {
            type: Boolean,
            default: false
        },
        // 使用 flex 布局时，内部是水平排列还是垂直排列，默认为'垂直排列'
        direction: {
            type: String,
            default: 'vertical',
            validator: function(value) {
                return [
                    'vertical',
                    'horizontal'
                ].includes(value);
            }
        }
    },
    data () {
        return {
            searchIconExist: false,
            searchIconActive: false,
            searchIconLazy: false,
            actionAffix: false,
            actionHeight: 44,
            innerWidth: 0,
            innerHeight: 0
        };
    },
    mounted () {
        this.resize();
        on(this.$el, 'resize', this.resize);
    },
    beforeDestroy () {
        off(this.$el, 'resize', this.resize);
    },
    methods: {
        /**
     * @desc 响应页面宽度变化，修改内容区域宽度
     * @author chenguanbin
     */ resize () {
            throttle(()=>{
                const gutter = 24; // 左右间距各12px，共24px
                this.innerWidth = this.$el.offsetWidth - gutter;
                this.innerHeight = this.$el.offsetHeight;
            })();
        }
    }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */ , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
    }
    return script;
}

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-page-content",
        class: {
            'is-flex': _vm.flex,
            'is-horizontal': _vm.direction === 'horizontal',
            'is-align-center': _vm.alignCenter
        }
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

__vue_component__.install = function(Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

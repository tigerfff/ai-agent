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

const getDocument = (el)=>{
    return el && el.ownerDocument || (typeof window !== 'undefined' ? document : null);
};

const contains = function(context, el) {
    if (isServer$1 || typeof window === 'undefined') {
        return;
    }
    const doc = getDocument(el);
    const docElem = doc.documentElement;
    const nativeReg = /^[^{]+\{\s*\[native \w/;
    const isNativeSupport = nativeReg.test(docElem.compareDocumentPosition) || nativeReg.test(docElem.contains);
    return isNativeSupport ? function(context, el) {
        const ele = context.nodeType === 9 ? context.documentElement : context;
        const parentNode = el && el.parentNode;
        return context === parentNode || !!(parentNode && parentNode.nodeType === 1 && (ele.contains ? ele.contains(parentNode) : context.compareDocumentPosition && context.compareDocumentPosition(parentNode) & 16));
    } : function(context, el) {
        if (el) {
            while(el = el.parentNode){
                if (el === context) {
                    return true;
                }
            }
            return false;
        }
    };
}();

const isDocument = (el)=>!isNil(el) ? el.nodeType === 9 : false;

const getWindow = (el)=>{
    return el && isDocument(el) ? el.defaultView || el.parentWindow : getWindow(getDocument(el));
};

const scroll = (el, type, val)=>{
    const win = getWindow(el);
    const isWin = isWindow(el);
    const doc = getDocument(el);
    if (isUndefined(val)) {
        if (isWin) {
            return 'pageYOffset' in win ? win.pageYOffset : doc.documentElement[type] || doc.body[type];
        } else if (el === doc.documentElement || el === doc.body) {
            return doc.documentElement[type] || doc.body[type];
        } else {
            return el[type];
        }
    } else {
        type = type === 'scrollTop' ? 'scrollLeft' : 'scrollTop';
        const x = 0;
        const y = val;
        if (isWin || el === doc.documentElement || el === doc.body) {
            win.scrollTo(x, y);
        } else {
            el[type] = val;
        }
        return val;
    }
};
const scrollTop = (el, val)=>scroll(el, 'scrollTop', val);
const scrollLeft = (el, val)=>scroll(el, 'scrollLeft', val);

const offset = (el, container)=>{
    const doc = getDocument(el);
    container = container || doc.documentElement || doc.body;
    let rect = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };
    if (!contains(container, el)) {
        return rect;
    }
    if (el.getBoundingClientRect) {
        rect = el.getBoundingClientRect();
    }
    const clientTop = container.clientTop || 0;
    const clientLeft = container.clientLeft || 0;
    let top, left;
    // 存在容器时，获取元素到容器左上角的相对位置
    if (container === doc.documentElement || container === doc.body) {
        top = scrollTop(container);
        left = scrollLeft(container);
    } else {
        const containerRect = container.getBoundingClientRect();
        top = scrollTop(container) - containerRect.top;
        left = scrollLeft(container) - containerRect.left;
    }
    rect = {
        top: rect.top + top - clientTop,
        left: rect.left + left - clientLeft,
        right: rect.right + left - clientLeft,
        bottom: rect.bottom + top - clientTop
    };
    return rect;
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
var script$1 = {
    name: 'HikCloudPageSidebar',
    inject: [
        'pageContainer'
    ],
    props: {
        // 侧边栏类型，可选: ['list']
        type: {
            type: String,
            default: 'default',
            validator: function(value) {
                return [
                    'default',
                    'list'
                ].includes(value);
            }
        },
        // 是否开启固定模式
        affix: {
            type: Boolean,
            default: false
        },
        // 距离窗口顶部达到指定偏移量后触发
        offsetTop: {
            type: Number,
            default: 0
        },
        // 侧边栏宽度
        width: {
            type: String,
            default: '240px'
        },
        // 是否使用内置滚动条
        inlineScroll: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            fixed: false,
            height: null // 侧边栏实际高度，侧边栏不固定且页面在滚动时，需要实时修改高度
        };
    },
    computed: {
        // 页面滚动距离
        scrollTop () {
            return this.pageContainer.scrollTop;
        },
        showScrollbar () {
            return this.inlineScroll || this.type === 'list';
        }
    },
    watch: {
        // 监听页面滚动距离
        scrollTop () {
            this.setSidebarStyle();
        }
    },
    created () {
        // 将侧边栏状态保存到 page-container 控件
        this.pageContainer.sidebarAffix = true;
    },
    mounted () {
        this.setSidebarStyle();
        // 监控容器宽度变化
        on(this.$el, 'resize', this.setSidebarStyle);
    },
    beforeDestroy () {
        off(this.$el, 'resize', this.setSidebarStyle);
    },
    methods: {
        /**
     * @desc 设置侧边栏的固定状态
     * @author chenguanbin
     */ setSidebarStyle () {
            if (!this.affix) return;
            // keep-alive的情况下，切换到其他页面，侧边栏还是会计算，需要用 offsetHeight 来判断是否在当前页面
            if (!this.$el.offsetHeight) return;
            const scrollTop = this.scrollTop;
            const spacingTop = offset(this.$el).top; // 容器到页面顶部的距离
            const offsetHeight = this.$el.offsetHeight; // 容器实际所占的高度
            // 若页面滚动距离超过容器顶部，则侧边栏固定
            if (scrollTop >= spacingTop - this.offsetTop) {
                this.fixed = true;
            } else {
                this.fixed = false;
                this.height = offsetHeight + scrollTop;
            }
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

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('aside', {
        staticClass: "hik-cloud-page-sidebar-wrapper",
        style: {
            width: _vm.width
        }
    }, [
        _c('div', {
            staticClass: "hik-cloud-page-sidebar",
            class: {
                'is-fixed': _vm.fixed
            },
            style: {
                width: _vm.width,
                height: _vm.fixed ? 'auto' : _vm.height + "px",
                top: _vm.fixed && _vm.offsetTop + "px"
            }
        }, [
            _vm.$slots.pageSidebarAction ? _c('div', {
                staticClass: "hik-cloud-page-sidebar__action"
            }, [
                _vm._t("pageSidebarAction")
            ], 2) : _vm._e(),
            _vm.$slots.pageSidebarSearch ? _c('div', {
                staticClass: "hik-cloud-page-sidebar__search"
            }, [
                _vm._t("pageSidebarSearch")
            ], 2) : _vm._e(),
            _c('div', {
                staticClass: "hik-cloud-page-sidebar__main",
                class: {
                    'hik-cloud-page-sidebar__list': _vm.type === 'list',
                    'is-inline-scroll': _vm.showScrollbar
                }
            }, [
                _vm.showScrollbar ? _c('el-scrollbar', {
                    attrs: {
                        "wrap-class": "page-scrollbar__wrap"
                    }
                }, [
                    _c('div', {
                        staticClass: "hik-cloud-page-sidebar__main--content"
                    }, [
                        _vm._t("default")
                    ], 2)
                ]) : _vm._t("default")
            ], 2)
        ])
    ]);
};
var __vue_staticRenderFns__$1 = [];
/* style */ const __vue_inject_styles__$1 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$1 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1);

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
//
//
//
//
//
var script = {
    name: 'HikCloudPageSidebar',
    components: {
        PageSidebarMain: __vue_component__$1
    },
    props: {
        useResizeBox: {
            type: Boolean,
            default: false
        },
        defaultW: {
            type: Number,
            default: 240
        },
        minW: {
            type: Number,
            default: 240
        },
        maxW: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            width: this.defaultW
        };
    },
    methods: {
        widthChanged (width) {
            this.width = width;
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('hik-cloud-resize-box', {
        attrs: {
            "defaultW": _vm.defaultW,
            "minW": _vm.minW,
            "maxW": _vm.maxW,
            "disabled": !_vm.useResizeBox
        },
        on: {
            "widthChanged": _vm.widthChanged
        }
    }, [
        _c('page-sidebar-main', _vm._g(_vm._b({
            attrs: {
                "width": _vm.width + 'px'
            }
        }, 'page-sidebar-main', _vm.$attrs, false), _vm.$listeners), [
            _vm._t("pageSidebarAction", null, {
                "slot": "pageSidebarAction"
            }),
            _vm._t("pageSidebarSearch", null, {
                "slot": "pageSidebarSearch"
            }),
            _vm._t("default")
        ], 2)
    ], 1);
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

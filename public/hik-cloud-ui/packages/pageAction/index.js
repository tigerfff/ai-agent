const getDocument = (el)=>{
    return el && el.ownerDocument || (typeof window !== 'undefined' ? document : null);
};

const isUndefined = (val)=>typeof val === 'undefined';

const isServer = typeof window !== 'undefined' ? isUndefined(window || document) : false;

const contains = function(context, el) {
    if (isServer || typeof window === 'undefined') {
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

const isNull = (val)=>val === null;

const isNil = (val)=>isUndefined(val) || isNull(val);

const isWindow = (el)=>!isNil(el) ? el === el.window : false;

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

const isElement = (el)=>{
    if (isNil(el)) {
        return false;
    }
    const div = document.createElement('div');
    try {
        div.appendChild(el.cloneNode(true));
        return el.nodeType === 1;
    } catch (e) {
        return isWindow(el) || isDocument(el);
    }
};

const scrollTo = (el, to, duration = 0)=>{
    const doc = getDocument(el);
    if (!isElement(el)) {
        duration = to || 0;
        to = el;
        el = doc.documentElement || doc.body;
    }
    const requestAnimationFrame = window.requestAnimationFrame || function requestAnimationFrameTimeout() {
        return setTimeout(arguments[0], 10);
    };
    // jump to target if duration zero
    if (duration <= 0) {
        el.scrollTop = to;
        return;
    }
    const difference = to - el.scrollTop;
    const perTick = difference / duration * 10;
    requestAnimationFrame(()=>{
        el.scrollTop += perTick;
        if (el.scrollTop === to) return;
        scrollTo(el, to, duration - 10);
    });
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
var script = {
    name: 'HikCloudPageAction',
    inject: [
        'pageContainer',
        'pageContent'
    ],
    props: {
        // 是否开启固定模式
        affix: {
            type: Boolean,
            default: true
        },
        // 距离窗口顶部达到指定偏移量后触发
        offsetTop: {
            type: Number,
            default: 0
        },
        // 是否显示搜索图标
        searchIcon: {
            type: Boolean,
            default: false
        },
        // 搜索图标提示信息
        searchIconTips: {
            type: String,
            default: 'filter'
        },
        // 是否隐藏搜索图标提示信息
        hideSearchIconTips: {
            type: Boolean,
            default: false
        },
        // 搜索图标是否激活
        searchIconActive: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            spacingTop: 0,
            searchAction: this.searchIconActive,
            rightActionWidth: 0
        };
    },
    computed: {
        // 固定模式下使用 Affix 图钉控件
        wrapperComponent () {
            return this.affix ? 'h-affix' : 'div';
        },
        // 获取操作栏宽度
        contentWidth () {
            return this.pageContent.innerWidth;
        },
        // 页面滚动距离
        scrollTop () {
            return this.pageContainer.scrollTop;
        },
        // 页面是否滚动超过搜索栏底部
        searchIconLazy () {
            return this.pageContent.searchIconLazy;
        },
        leftActionStyle () {
            const ret = {};
            // ret.width = this.$slots.rightAction
            //   ? `calc(100% - ${this.rightActionWidth + gutter}px)`
            //   : '100%';
            return ret;
        }
    },
    watch: {
        // 监听容器宽度
        contentWidth (width) {
        // 非固定模式直接返回
        // if (!this.affix) return;
        // const gutter = 12; // 内容区域的 padding-left 为 12px
        // const left = offset(this.pageContent.$el).left + gutter; // 内容区域到页面左边的距离，加上区域的左边距
        // this.$refs.affix.updateAffixStyle({ left, width });
        },
        searchIconActive () {
            this.handleClickSearchIcon();
        }
    },
    created () {
        if (this.searchIcon) this.pageContent.searchIconExist = true;
    },
    mounted () {
        this.spacingTop = offset(this.$el).top;
        this.pageContent.searchIconActive = this.searchAction;
        if (this.$refs.rightAction) {
            this.$nextTick(()=>{
                this.resize();
            });
        }
    },
    updated () {
        if (this.$refs.rightAction) {
            this.$nextTick(()=>{
                this.resize();
            });
        }
    },
    // keep-alive 情况下进行路由切换
    activated () {
    // if (this.affix) this.$refs.affix.handleScroll();
    },
    methods: {
        /**
     * @desc 重新计算操作栏宽度
     * @author chenguanbin
     */ resize () {
            this.rightActionWidth = this.$refs.rightAction.clientWidth;
        },
        /**
     * @desc 点击搜索图标
     * @author chenguanbin
     */ handleClickSearchIcon () {
            const oldWidth = this.contentWidth;
            const lazy = this.searchIconLazy;
            // 若页面滚动超过操作栏顶部，向上滚动到操作栏顶部
            if (this.scrollTop > this.spacingTop) scrollTo(this.spacingTop, 200);
            // 若页面滚动未超过搜索栏底部，切换搜索图标激活状态
            if (!lazy) this.searchAction = !this.searchAction;
            this.pageContent.searchIconActive = this.searchAction;
            this.$emit('search-collapse', this.searchAction);
            // 若容器宽度有变化，更新 tooltip 位置
            setTimeout(()=>{
                if (this.contentWidth !== oldWidth) this.$refs.tooltip.updatePopper();
            }, 300);
        },
        /**
     * @author chenguanbin
     * @date 2020-03-16 10:36:49
     * @desc 按钮组折叠/展开事件
     */ handleChangeButtonStatus (status) {
            this.$emit(status);
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
        staticClass: "hik-cloud-page-action",
        attrs: {
            "slot-width": 10,
            "offset-top": _vm.offsetTop
        }
    }, [
        _c('div', {
            staticClass: "hik-cloud-page-action__main",
            class: {
                'is-show-search-icon': _vm.searchIcon
            }
        }, [
            _vm.$slots.default ? _c('div', {
                staticClass: "hik-cloud-page-action__left-action",
                style: _vm.leftActionStyle
            }, [
                _vm._t("default")
            ], 2) : _vm._e(),
            _vm.$slots.leftAction ? _c('div', {
                staticClass: "hik-cloud-page-action__left-action",
                style: _vm.leftActionStyle
            }, [
                _vm._t("leftAction")
            ], 2) : _vm._e(),
            _vm.$slots.rightAction ? _c('div', {
                ref: "rightAction",
                staticClass: "hik-cloud-page-action__right-action"
            }, [
                _vm._t("rightAction")
            ], 2) : _vm._e(),
            _vm.searchIcon ? [
                _vm.hideSearchIconTips ? _c('div', {
                    staticClass: "hik-cloud-page-action__search-icon",
                    class: {
                        'is-active': _vm.searchAction && !_vm.searchIconLazy
                    },
                    on: {
                        "click": _vm.handleClickSearchIcon
                    }
                }, [
                    _c('i', {
                        staticClass: "h-icon-filter"
                    })
                ]) : _c('el-tooltip', {
                    ref: "tooltip",
                    attrs: {
                        "content": _vm.searchIconTips,
                        "placement": "top",
                        "popper-class": "hik-cloud-page-action__tooltip"
                    }
                }, [
                    _c('div', {
                        staticClass: "hik-cloud-page-action__search-icon",
                        class: {
                            'is-active': _vm.searchAction && !_vm.searchIconLazy
                        },
                        on: {
                            "click": _vm.handleClickSearchIcon
                        }
                    }, [
                        _c('i', {
                            staticClass: "h-icon-filter"
                        })
                    ])
                ])
            ] : _vm._e()
        ], 2)
    ]);
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

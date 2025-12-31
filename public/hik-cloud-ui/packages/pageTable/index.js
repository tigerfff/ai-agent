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

const hasClass = (el, cls)=>{
    if (!el || !cls || cls.indexOf(' ') !== -1) {
        return false;
    }
    if (el.classList) {
        return el.classList.contains(cls);
    } else {
        return ` ${el.className} `.indexOf(` ${cls} `) > -1;
    }
};

const addClass = (el, cls)=>{
    let curClass = el.className;
    const classes = (cls).split(' ');
    for(let i = 0, j = classes.length; i < j; i++){
        const clsName = classes[i];
        if (!clsName) {
            continue;
        }
        if (el.classList) {
            el.classList.add(clsName);
        } else if (!hasClass(el, clsName)) {
            curClass += ` ${clsName}`;
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
};

const trim = (string)=>{
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

const removeClass = (el, cls)=>{
    const classes = cls.split(' ');
    let curClass = ` ${el.className} `;
    for(let i = 0, j = classes.length; i < j; i++){
        const clsName = classes[i];
        if (!clsName) {
            continue;
        }
        if (el.classList) {
            el.classList.remove(clsName);
        } else if (hasClass(el, clsName)) {
            curClass = curClass.replace(` ${clsName} `, ' ');
        }
    }
    if (!el.classList) {
        el.className = trim(curClass);
    }
};

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
    name: 'HikCloudPageTable',
    inject: [
        'pageContainer',
        'pageContent'
    ],
    props: {
        // 表格是否占据容器的剩余空间
        full: {
            type: Boolean,
            default: false
        },
        // 表格左右是否有边框
        border: {
            type: Boolean,
            default: false
        },
        hideBottomBorder: {
            type: Boolean,
            default: false
        },
        // 表格头部是否开启固定模式
        headerAffix: {
            type: Boolean,
            default: true
        },
        // 表格头部开启固定模式时，距离窗口顶部达到指定偏移量后触发
        headerOffsetTop: {
            type: Number,
            default: null
        },
        // 滚动条是否开启固定模式
        scrollbarAffix: {
            type: Boolean,
            default: true
        },
        // 滚动条开启固定模式时，距离窗口底部达到指定偏移量后触发
        scrollbarOffsetBottom: {
            type: Number,
            default: 0
        },
        // 分页栏是否开启固定模式
        paginationAffix: {
            type: Boolean,
            default: false
        },
        // 分页栏开启固定模式时，距离窗口底部达到指定偏移量后触发
        paginationOffsetBottom: {
            type: Number,
            default: 0
        },
        usePagination: {
            type: Boolean,
            default: true
        },
        currentPage: {
            type: Number,
            default: 1
        },
        pageSize: {
            type: Number,
            default: 20
        },
        total: {
            type: Number,
            default: 0
        },
        simpleLayout: {
            type: Boolean,
            default: false
        },
        pageSizes: {
            type: Array,
            default: ()=>[
                    10,
                    20,
                    50,
                    100
                ]
        }
    },
    data () {
        return {
            pHeight: 0,
            affixLeft: 0,
            affixRight: 0,
            scFixed: false,
            scrolling: false,
            scrollTimer: null,
            localPage: 1
        };
    },
    computed: {
        // 获取 h-page 控件
        page () {
            let { $parent } = this;
            while($parent.$options.name !== 'HPage'){
                $parent = $parent.$parent;
                if (!$parent) return null;
            }
            return $parent;
        },
        // 页面滚动距离
        scrollTop () {
            return this.pageContainer.scrollTop;
        },
        contentWidth () {
            return this.pageContent.innerWidth;
        },
        contentHeight () {
            return this.pageContent.innerHeight;
        },
        layout () {
            return this.simpleLayout ? 'total, sizes, huiPager' : 'total, sizes, huiPager, jumper';
        }
    },
    watch: {
        // 监听页面滚动距离
        scrollTop () {
            if (!this.$el.offsetHeight) return;
            this.setHeaderFixed();
            // 滚动条开启固定模式，但分页栏未使用插槽，或者分页栏未开启固定模式，页面滚动时要实时设置滚动条固定状态
            if (this.scrollbarAffix && (!this.$slots.pagination || !this.paginationAffix)) this.setScrollbarFixed();
        },
        // 监控页面是否在滚动
        scrolling (scrolling) {
            if (scrolling) return;
            // 获取页面上所有的表格
            const $tableAll = Array.from(this.$el.querySelectorAll('.el-table'));
            if (!$tableAll || !$tableAll.length) return;
            for (const $table of $tableAll){
                const $tHeader = $table.querySelector('.el-table__header-wrapper'); // 表格的头部
                // 表格固定情况下的头部，可能有左右两个
                const $tFixedHeader = $table.querySelectorAll('.el-table__fixed-header-wrapper');
                // 若表格头部固定
                if (this.headerAffix) {
                    this._setTableHeaderStyle($tHeader, $tFixedHeader, 'opacity', 1);
                }
            }
        },
        contentWidth () {
            this.resize();
        },
        // 监听容器高度变化，因为页面高度变化时 main 元素不会调用 resize 方法
        contentHeight () {
            this.resize();
        },
        currentPage: {
            handler: function(val) {
                this.localPage = val;
            },
            immediate: true
        },
        localPage (val) {
            this.$emit('update:currentPage', val);
        }
    },
    mounted () {
        if (this.$refs.affix) this.pHeight = this.$refs.affix.scrollHeight;
        on(this.$refs.main, 'resize', this.resize);
        // 若分页栏开启固定模式，给每页显示条数下拉框添加样式类
        if (this.$slots.pagination && this.paginationAffix) {
            for (const slot of this.$slots.pagination){
                if (slot.componentOptions.tag === 'el-pagination') {
                    slot.componentInstance.popperClass = `${slot.componentInstance.popperClass} hik-cloud-page-table__pagination-dropdown`;
                }
            }
        }
    },
    beforeDestroy () {
        off(this.$refs.main, 'resize', this.resize);
    },
    // keep-alive 情况下进行路由切换
    activated () {
        this.setHeaderFixed();
    },
    methods: {
        handleSizeChange (pageSize, oldPageSize) {
            this.$emit('size-change', pageSize, oldPageSize);
        },
        handleCurrentChange (pageNo, oldPageNo) {
            this.$emit('current-change', pageNo, oldPageNo);
        },
        /**
     * @desc 响应表格内容大小变化
     * @author chenguanbin
     */ resize () {
            this.setPaginationFixed();
            this.setScrollbarFixed();
            this.setHeaderFixed();
        },
        /**
     * @desc 设置表格区域的样式（方法已废弃，考虑到外部可能有人使用，暂时保留空方法）
     * @author chenguanbin
     */ setTableStyle () {},
        /**
     * @desc 设置表格分页栏的固定状态
     * @author chenguanbin
     */ setPaginationFixed () {
            if (!this.$slots.pagination || !this.paginationAffix) return;
            if (this.$refs.affix) this.pHeight = this.$refs.affix.scrollHeight;
            const scrollWidth = this.page ? this.page.$el.scrollWidth : this.pageContainer.$el.scrollWidth;
            const elOffset = offset(this.$el);
            this.affixLeft = `${elOffset.left}px`;
            this.affixRight = `${scrollWidth - elOffset.right}px`;
        },
        /**
     * @desc 设置表格滚动条的固定状态
     * @author chenguanbin
     */ setScrollbarFixed () {
            if (!this.scrollbarAffix) return;
            this.$nextTick(()=>{
                const $scrollbar = this.$el.querySelector('.el-table__body-wrapper > .el-scrollbar > .el-scrollbar__bar.is-horizontal');
                if (!$scrollbar) return;
                const scrollWidth = this.page ? this.page.$el.scrollWidth : this.pageContainer.$el.scrollWidth;
                const elOffset = offset(this.$el);
                this._setScFixedStatus();
                Object.assign($scrollbar.style, {
                    left: this.scFixed ? `${elOffset.left}px` : '0',
                    right: this.scFixed ? `${scrollWidth - elOffset.right}px` : '0',
                    bottom: this.scFixed ? `${this.scrollbarOffsetBottom || this.pHeight + this.paginationOffsetBottom}px` // scrollbarOffsetBottom 属性优先级最高
                     : '0'
                });
            });
        },
        /**
     * @desc 设置滚动条是否固定
     * @author chenguanbin
     */ _setScFixedStatus () {
            const bodyHeight = document.body.offsetHeight;
            const elOffset = offset(this.$el);
            const tableOffset = offset(this.$el.querySelector('.el-table'));
            const pgOffset = offset(this.$refs.pagination);
            // 若设置 scrollbarOffsetBottom 属性，优先根据属性值计算滚动条是否固定
            if (this.scrollbarOffsetBottom) {
                this.scFixed = bodyHeight + this.scrollTop < tableOffset.bottom + this.scrollbarOffsetBottom;
            } else {
                // 若分页开启固定模式，根据表格是否超出来屏幕，来设置滚动条是否固定
                // 若分页未开启固定模式，根据分页是否出现在屏幕中，来设置滚动条是否固定
                this.scFixed = this.$slots.pagination && this.paginationAffix ? bodyHeight <= elOffset.bottom : pgOffset.top > bodyHeight + this.scrollTop;
            }
        },
        /**
     * @desc 设置表格头部的固定状态
     * @author chenguanbin
     */ setHeaderFixed () {
            // 若表格头部需要固定
            if (this.headerAffix) {
                this.scrolling = true;
                this._setScrollTimer();
                this.fixedTable();
            }
        },
        /**
     * @desc 设置滚动计时器，500ms后设置为不滚动
     * @author chenguanbin
     */ _setScrollTimer () {
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(()=>{
                this.scrolling = false;
            }, 500);
        },
        /**
     * @desc 固定页面表格上的元素
     * @author chenguanbin
     */ fixedTable () {
            // 获取页面上所有的表格
            const $table = this.$el.querySelector('.el-table');
            // 若页面上没有表格，直接返回
            if (!$table) return;
            const { top: offsetTop } = offset($table); // 表格距离页面左上角的距离
            this.fixedTableHeader($table, offsetTop);
        },
        /**
     * @desc 固定表格头部
     * @author chenguanbin
     * @param {Document} $table 表格
     * @param {Number} offsetTop 表格到页面左上角的距离
     */ fixedTableHeader ($table, offsetTop) {
            const { pageContent: { actionAffix, actionHeight } } = this;
            const $tHeader = $table.querySelector('.el-table__header-wrapper'); // 表格的头部
            // 表格固定情况下的头部，可能有左右两个
            const $tFixedHeader = $table.querySelectorAll('.el-table__fixed-header-wrapper');
            const offsetHeight = $table.offsetHeight; // 表格的高度
            const headerHeight = 36; // 表格头部高度
            // 表格头部固定时到页面顶部的距离（表格头部和页面顶部有1px的偏差）
            // headerOffsetTop 属性优先，然后判断操作栏是否固定
            const gutter = this.headerOffsetTop ? this.headerOffsetTop - 1 : actionAffix ? actionHeight - 1 : -1;
            // 若页面滚动到表格头部，表头固定
            if (this.scrollTop > offsetTop - gutter) {
                const targetTop = `${this.scrollTop - offsetTop + gutter}px`;
                this._setTableHeaderStyle($tHeader, $tFixedHeader, 'top', targetTop);
            }
            // 若页面滚到未超过表格头部，表头显示
            if (this.scrollTop <= offsetTop + headerHeight - gutter) {
                this._setTableHeaderStyle($tHeader, $tFixedHeader, 'opacity', 1);
                removeClass($table, 'fixed-header');
            }
            // 若页面滚动超过表格头部，且正在滚动中，表头隐藏
            if (this.scrollTop > offsetTop + headerHeight - gutter) {
                this._setTableHeaderStyle($tHeader, $tFixedHeader, 'opacity', 0);
                addClass($table, 'fixed-header');
            }
            // 若页面滚动未到达表格头部，或者页面滚动超过表格，表头不固定
            if (this.scrollTop <= offsetTop - gutter || this.scrollTop > offsetTop + offsetHeight - headerHeight) {
                this._setTableHeaderStyle($tHeader, $tFixedHeader, 'top', '0');
            }
        },
        /**
     * 设置表格头部样式
     * @author chenguanbin
     * @param {Node} $tHeader 表格头部
     * @param {NodeList} $tFixedHeader 左右固定的表格头部
     * @param {String} property 样式属性
     * @param {String|Number} value 样式值
     */ _setTableHeaderStyle ($tHeader, $tFixedHeader, property, value) {
            $tHeader.style[property] = value;
            if ($tFixedHeader && $tFixedHeader.length) {
                if ($tFixedHeader[0]) $tFixedHeader[0].style[property] = value;
                if ($tFixedHeader[1]) $tFixedHeader[1].style[property] = value;
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

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-page-table",
        class: {
            'is-full': _vm.full,
            'has-border': _vm.border,
            'hide-bottom-border': _vm.hideBottomBorder,
            'is-scrollbar-fixed': _vm.scFixed
        }
    }, [
        _c('div', {
            ref: "main",
            staticClass: "hik-cloud-page-table__main"
        }, [
            _vm._t("default"),
            _vm.$slots.pagination || _vm.usePagination ? [
                _c('div', {
                    ref: "pagination",
                    staticClass: "hik-cloud-page-table__pagination",
                    style: {
                        height: _vm.paginationAffix ? _vm.pHeight + "px" : null
                    }
                }, [
                    _vm.paginationAffix ? _c('div', {
                        ref: "affix",
                        staticClass: "hik-cloud-page-table__pagination--affix",
                        style: {
                            left: _vm.affixLeft,
                            right: _vm.affixRight,
                            bottom: _vm.paginationOffsetBottom + "px"
                        }
                    }, [
                        _vm._t("pagination")
                    ], 2) : _vm._t("pagination", function() {
                        return [
                            _c('el-pagination', {
                                attrs: {
                                    "currentPage": _vm.localPage,
                                    "page-sizes": _vm.pageSizes,
                                    "page-size": _vm.pageSize,
                                    "layout": _vm.layout,
                                    "total": _vm.total
                                },
                                on: {
                                    "update:currentPage": function($event) {
                                        _vm.localPage = $event;
                                    },
                                    "update:current-page": function($event) {
                                        _vm.localPage = $event;
                                    },
                                    "size-change": _vm.handleSizeChange,
                                    "current-change": _vm.handleCurrentChange
                                }
                            })
                        ];
                    })
                ], 2)
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

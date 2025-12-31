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
    name: 'HikCloudPageSearch',
    inject: [
        'pageContainer',
        'pageContent'
    ],
    provide () {
        return {
            HikCloudPageSearch: this
        };
    },
    props: {
        // Form 控件的 model 参数
        model: {
            type: Object,
            default: undefined
        },
        // Form 控件的 rules 参数
        rules: {
            type: Object,
            default: undefined
        },
        // Form 控件的 labelPosition 参数
        labelPosition: {
            type: String,
            default: 'top'
        },
        // Form 控件的 labelWidth 参数
        labelWidth: {
            type: String,
            default: null
        },
        // 断点参数
        options: {
            type: Object,
            default: ()=>{}
        },
        // 高低频搜索图标
        hlfIcon: {
            type: String,
            default: 'h-icon-angles_down_sm'
        }
    },
    data () {
        return {
            show: false,
            showMoreItem: false,
            hlfSearch: false,
            // 影响断点的因素：门户最小宽度 1280px，门户菜单收起时 48px，滚动条宽度 17px，侧边栏宽度 256px，h-page-content 左右 padding 各 12px
            xl: 1408,
            lg: 935,
            md: 708,
            sm: 472,
            items: [],
            rowAmount: 6,
            actionWidth: '100%' // 操作项宽度
        };
    },
    computed: {
        // 页面滚动距离
        scrollTop () {
            return this.pageContainer.scrollTop;
        },
        // 搜索栏宽度
        searchWidth () {
            return this.pageContent.innerWidth;
        },
        // 搜索图标是否存在
        searchIconExist () {
            return this.pageContent.searchIconExist;
        },
        // 搜索图标是否激活
        searchIconActive () {
            return this.pageContent.searchIconActive;
        },
        // 获取所有显示的菜单项
        existItems () {
            return this.items.filter((item)=>{
                return !item.hidden;
            });
        }
    },
    watch: {
        // 监听页面滚动距离
        scrollTop (top) {
            const { actionAffix, actionHeight } = this.pageContent;
            // 搜索栏隐藏，或者操作栏不固定时，直接返回
            if (!this.show || !actionAffix) return;
            const sTop = top + actionHeight; // 页面滚动距离加上操作栏高度（操作栏）
            const offsetTop = offset(this.$refs.pageSearch).top; // 搜索栏顶部到页面顶部距离
            const oTop = offsetTop + this.$refs.pageSearch.offsetHeight; // 搜索栏底部到页面顶部距离
            this.pageContent.searchIconLazy = sTop > oTop; // 判断页面是否滚动超过搜索栏底部
        },
        // 监听搜索栏宽度
        searchWidth () {
            this.resize();
        },
        // 监听搜索栏激活状态
        searchIconActive (newVal) {
            this.show = newVal;
        },
        // 监控断点参数变化
        options () {
            this._setOptions();
            this.resize();
        },
        // 菜单项数据变化
        existItems () {
            this.setHlfStatus();
        }
    },
    created () {
        // 不存在搜索图标，或者搜索图标激活时，搜索栏为显示状态
        if (!this.searchIconExist || this.searchIconActive) this.show = true;
        // 设置断点参数
        if (this.options) this._setOptions();
    },
    mounted () {
        this.setHlfStatus();
    },
    methods: {
        /**
     * @desc 获取搜索栏使用的表单控件
     * @author chenguanbin
     */ getForm () {
            return this.$refs.form;
        },
        /**
     * @desc 对整个表单进行重置，清空所有字段并移除校验结果
     * @author chenguanbin
     */ resetFields (isEmpty = false) {
            this.$refs.form.resetFields(isEmpty);
        },
        /**
     * @desc 重置搜索栏显隐性状态
     * @author chenguanbin
     */ resetStatus () {
            this.showMoreItem = false;
        },
        /**
     * @desc 重置搜索栏
     * @author chenguanbin
     */ reset () {
            this.resetFields();
            this.resetStatus();
        },
        /**
     * @desc 修改搜索项和操作项所占栅格数
     * @author chenguanbin
     */ resize () {
            const width = this.searchWidth;
            // 宽度不存在时，不进行后续计算
            if (width <= 0) return;
            // 判断页面是否存在滚动条，若存在滚动条在计算断点宽度时减去 17px
            const isBodyScroll = document.body.scrollHeight > document.body.clientHeight;
            const shiftWidth = isBodyScroll ? -17 : 0;
            // 通过宽度设置一行显示多少个搜索项
            if (width >= this.xl + shiftWidth) this.rowAmount = 6;
            else if (width >= this.lg + shiftWidth) this.rowAmount = 4;
            else if (width >= this.md + shiftWidth) this.rowAmount = 3;
            else if (width >= this.sm + shiftWidth) this.rowAmount = 2;
            else this.rowAmount = 1;
            if (this.$slots.pageSearchAction) this._setActionWidth();
        },
        /**
     * @desc 设置高低频状态
     * @author chenguanbin
     */ setHlfStatus () {
            // 若搜索项中有默认不显示项，则显示展开收起图标，开启高低频搜索
            this.hlfSearch = !!this.existItems.some((item)=>{
                return !item.show;
            });
            this.resize();
        },
        /**
     * @desc 显示/隐藏高低频搜索项
     * @author chenguanbin
     */ collapse () {
            this.showMoreItem = !this.showMoreItem;
            this.$emit('collapse', this.showMoreItem);
        },
        /**
     * @desc 页面宽度变化后，修改操作项宽度
     * @author chenguanbin
     */ _setActionWidth () {
            const itemCount = this.showMoreItem ? this.existItems.length : this.existItems.filter((item)=>{
                return item.show;
            }).length;
            const { rowAmount } = this;
            const percent = 1 / rowAmount * 100; // 每列占据的宽度百分比
            const piece = rowAmount - itemCount % rowAmount; // 给操作项预留下的列数
            this.actionWidth = piece === rowAmount ? null : `${piece * percent}%`;
        },
        /**
     * @desc 设置断点参数
     * @author chenguanbin
     */ _setOptions () {
            Object.assign(this, this.options);
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
    var _obj;
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('el-collapse-transition', [
        _c('div', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.show,
                    expression: "show"
                }
            ],
            ref: "pageSearch",
            staticClass: "hik-cloud-page-search",
            class: (_obj = {
                'is-collapse': _vm.searchIconExist
            }, _obj["row-amount-" + _vm.rowAmount] = _vm.rowAmount !== 1, _obj)
        }, [
            _c('el-form', {
                ref: "form",
                staticClass: "hik-cloud-page-search__form",
                attrs: {
                    "model": _vm.model,
                    "rules": _vm.rules,
                    "label-position": _vm.labelPosition,
                    "label-width": _vm.labelWidth
                },
                nativeOn: {
                    "submit": function($event) {
                        $event.preventDefault();
                    }
                }
            }, [
                _vm._t("default"),
                _vm.$slots.pageSearchAction ? _c('div', {
                    staticClass: "hik-cloud-page-search__action",
                    style: {
                        width: _vm.actionWidth
                    }
                }, [
                    _vm._t("pageSearchAction"),
                    _vm.hlfSearch ? [
                        _vm.$slots.pageSearchHlf ? _vm._t("pageSearchHlf") : _c('span', {
                            staticClass: "hik-cloud-page-search__action--more",
                            class: {
                                'is-active': _vm.showMoreItem
                            },
                            on: {
                                "click": _vm.collapse
                            }
                        }, [
                            _c('i', {
                                class: _vm.hlfIcon
                            })
                        ])
                    ] : _vm._e()
                ], 2) : _vm._e()
            ], 2)
        ], 1)
    ]);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

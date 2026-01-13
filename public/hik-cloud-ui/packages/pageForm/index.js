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
var script$4 = {
    name: "HikCloudPageForm",
    provide () {
        return {
            pageForm: this,
            footer: this.$slots.pageFormFooter,
            pageFormFooter: this.$slots.pageFormFooter
        };
    },
    props: {
        /** 布局模式 */ layout: {
            type: String,
            default: "center",
            validator (value) {
                return [
                    "center",
                    "left",
                    "full",
                    "compact",
                    "light"
                ].includes(value);
            }
        },
        footerFixed: {
            type: Boolean,
            default: false
        },
        pageBackgroundColor: {
            type: String,
            default: "#f8f9fb"
        },
        padding: {
            type: [
                Array,
                Number
            ],
            default: ()=>[],
            validator: (value)=>{
                if (typeof value === 'number') {
                    return true;
                }
                if (Array.isArray(value)) {
                    return value.every((item)=>typeof item === 'number');
                }
                return false;
            }
        }
    },
    data () {
        return {
            contentWidth: null,
            contentHasBlockGroup: false
        };
    },
    computed: {
        formClass () {
            return [
                `hik-cloud-page-form--${this.layout}`
            ];
        },
        formStyle () {
            const style = {
                backgroundColor: this.pageBackgroundColor
            };
            // style.width = this.width;
            // 根据父组件的布局模式设置样式
            switch(this.layout){
                // 居中对齐
                case "center":
                    style.padding = "16px";
                    break;
                // 左对齐
                case "left":
                    style.padding = "16px";
                    break;
                // 全屏模式
                case "full":
                    style.padding = "16px";
                    break;
                // 轻量模式
                case "light":
                    style.padding = "0";
                    break;
                // 紧凑模式
                case "compact":
                    style.padding = "0";
                    break;
                default:
                    style.padding = "16px";
            }
            if (this.padding || this.padding === 0) {
                if (typeof this.padding === 'number') {
                    style.padding = this.padding + 'px';
                } else if (Array.isArray(this.padding) && this.padding.length > 0) {
                    // 处理数组，如果某一项不是数字则默认为16 或 0 
                    const defaultPadding = this.layout === 'compact' || this.layout === 'light' ? 0 : 16;
                    const processedPadding = this.padding.map((item)=>typeof item === 'number' ? item : defaultPadding);
                    const [top, right = top, bottom = top, left = right] = processedPadding;
                    if (this.padding.length === 1) {
                        style.padding = `${top}px`;
                    } else if (this.padding.length === 2) {
                        style.padding = `${top}px ${right}px`;
                    } else if (this.padding.length === 3) {
                        style.padding = `${top}px ${right}px ${bottom}px`;
                    } else {
                        style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
                    }
                }
            }
            if (this.$slots.pageFormFooter && this.footerFixed) {
                style.paddingBottom = 0;
            }
            if (this.$slots.pageFormHeader) {
                style.paddingTop = 0;
            }
            return style;
        },
        footerStyle () {
            const style = {};
            switch(this.layout){
                // 居中对齐
                case "center":
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.display = "flex";
                    style.justifyContent = "center";
                    style.paddingBottom = "64px";
                    break;
                // 左对齐
                case "left":
                    style.paddingLeft = "80px";
                    style.paddingBottom = "64px";
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.display = "flex";
                    style.justifyContent = "flex-start";
                    break;
                // 全屏模式
                case "full":
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.paddingBottom = "24px";
                    style.display = "flex";
                    style.justifyContent = "center";
                    break;
                // 紧凑模式
                case "compact":
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.paddingBottom = "0";
                    style.display = "flex";
                    style.justifyContent = "center";
                    break;
                default:
                    style.margin = "16px";
                    style.padding = "0 0";
            }
            // 使用与 content 相同的宽度
            if (this.contentWidth) {
                style.width = this.contentWidth;
                style.maxWidth = "100%";
            } else {
                style.width = "100%";
                style.maxWidth = "100%";
            }
            return style;
        },
        footerFixedStyle () {
            const style = {
                boxSizing: "border-box"
            };
            switch(this.layout){
                // 居中对齐
                case "center":
                    style.display = "flex";
                    style.justifyContent = "center";
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.padding = "0 80px"; // 与 content 的水平 padding 保持一致，垂直 padding 为 0
                    break;
                // 左对齐
                case "left":
                    style.padding = "0 80px"; // 与 content 的水平 padding 保持一致，垂直 padding 为 0
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.display = "flex";
                    style.justifyContent = "flex-start";
                    break;
                // 全屏模式
                case "full":
                    style.padding = "0 24px"; // 与 content 的水平 padding 保持一致，垂直 padding 为 0
                    style.display = "flex";
                    style.justifyContent = "center";
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    break;
                // 紧凑模式
                case "compact":
                    style.padding = "0"; // 与 content 的 padding 保持一致
                    style.display = "flex";
                    style.justifyContent = "center";
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    break;
                default:
                    style.display = "flex";
                    style.justifyContent = "center";
                    style.marginLeft = "auto";
                    style.marginRight = "auto";
                    style.padding = "0";
            }
            // 使用与 content 相同的宽度
            if (this.contentWidth) {
                style.width = this.contentWidth;
                style.maxWidth = this.contentWidth;
            } else {
                style.width = "100%";
                style.maxWidth = "100%";
            }
            return style;
        }
    },
    methods: {
        setContentWidth (width) {
            this.contentWidth = width;
        },
        setContentHasBlockGroup (block) {
            this.contentHasBlockGroup = block;
        },
        updateFooterWidth () {
        // 这个方法可以用于额外的 footer 宽度更新逻辑
        // 目前通过计算属性已经可以处理
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

const __vue_script__$4 = script$4;
/* template */ var __vue_render__$4 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-page-form-wrap"
    }, [
        _c('div', {
            staticClass: "hik-cloud-page-form",
            class: _vm.formClass,
            style: _vm.formStyle
        }, [
            _vm.$slots.pageFormHeader ? _c('div', {
                ref: "page-form__header",
                staticClass: "hik-cloud-page-form__header"
            }, [
                _vm._t("pageFormHeader")
            ], 2) : _vm._e(),
            _c('div', {
                staticClass: "hik-cloud-page-form__content",
                style: {
                    background: _vm.contentHasBlockGroup || _vm.layout === 'light' ? 'transparent' : '#ffffff'
                }
            }, [
                _c('el-scrollbar', {
                    attrs: {
                        "wrapStyle": "height:100%;overflow-x:hidden;margin-bottom:0;"
                    }
                }, [
                    _vm._t("default"),
                    _vm.$slots.pageFormFooter && !_vm.footerFixed ? _c('div', {
                        ref: "page-form__footer",
                        staticClass: "hik-cloud-page-form__footer",
                        style: _vm.footerStyle
                    }, [
                        _vm._t("pageFormFooter")
                    ], 2) : _vm._e()
                ], 2)
            ], 1)
        ]),
        _vm.$slots.pageFormFooter && _vm.footerFixed ? _c('div', {
            ref: "page-form__footer",
            staticClass: "hik-cloud-page-form__footer--fixed"
        }, [
            _c('div', {
                style: _vm.footerFixedStyle
            }, [
                _vm._t("pageFormFooter")
            ], 2)
        ]) : _vm._e()
    ]);
};
var __vue_staticRenderFns__$4 = [];
/* style */ const __vue_inject_styles__$4 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$4 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$4,
    staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$4);

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
var script$3 = {
    name: "HikCloudPageFormContent",
    inject: {
        pageForm: {
            default: ()=>({})
        },
        footer: {
            default: null
        },
        pageFormFooter: {
            default: null
        }
    },
    provide () {
        return {
            pageFormContent: this,
            registerGroup: this.registerGroup
        };
    },
    props: {
        /** 背景颜色 */ backgroundColor: {
            type: String,
            default: "#ffffff"
        },
        width: {
            type: String,
            default: null
        },
        // 外层容器自定义类名
        wrapClass: {
            type: [
                String,
                Array,
                Object
            ],
            default: ""
        }
    },
    data () {
        return {
            footerFixed: false,
            groups: []
        };
    },
    computed: {
        contentStyle () {
            const style = {
                backgroundColor: this.backgroundColor
            };
            style.width = this.width;
            // 根据父组件的布局模式设置样式
            if (this.pageForm) {
                const { layout, footerFixed } = this.pageForm;
                switch(layout){
                    // 居中对齐
                    case "center":
                        style.padding = "48px 80px";
                        break;
                    // 左对齐
                    case "left":
                        style.padding = "48px 80px";
                        break;
                    // 全屏模式
                    case "full":
                        style.padding = "24px";
                        break;
                    // 紧凑模式
                    case "compact":
                        style.padding = "24px";
                        style.paddingBottom = "0";
                        break;
                    // 轻量模式
                    case "light":
                        style.padding = "0";
                        style.backgroundColor = "transparent";
                        break;
                    default:
                        style.padding = "48px 0";
                }
                style.maxWidth = "100%";
                if (this.footer && !footerFixed) {
                    style.paddingBottom = 0;
                }
                // 如果有card为true的分组，content背景色为透明
                if (this.hasBlockGroup()) {
                    style.padding = "0";
                    style.backgroundColor = "transparent";
                }
            }
            return style;
        }
    },
    mounted () {
        // 将 content 的实际渲染宽度传递给父组件
        this.updateContentWidth();
        // 监听窗口大小变化
        window.addEventListener("resize", this.updateContentWidth);
    },
    beforeDestroy () {
        // 移除事件监听
        window.removeEventListener("resize", this.updateContentWidth);
    },
    methods: {
        registerGroup (group) {
            this.groups.push(group);
        },
        hasBlockGroup () {
            const block = this.groups.some((group)=>group.block && group.title);
            if (this.pageForm && this.pageForm.setContentHasBlockGroup) {
                this.pageForm.setContentHasBlockGroup(block);
            }
            return block;
        },
        updateContentWidth () {
            this.$nextTick(()=>{
                if (this.pageForm && this.pageForm.setContentWidth) {
                    // 获取实际渲染的宽度
                    const actualWidth = this.getActualWidth();
                    this.pageForm.setContentWidth(actualWidth);
                // const contentWidth = this.groups.map((group) => group.contentWidth);
                // this.pageForm.setContentWidth(contentWidth[0] || actualWidth);
                }
            });
        },
        getActualWidth () {
            try {
                // 获取 DOM 元素的实际宽度
                const element = this.$el;
                if (element) {
                    const computedStyle = window.getComputedStyle(element);
                    const width = computedStyle.width;
                    // 如果设置了具体宽度且不是 auto，则使用设置的宽度
                    if (this.width && this.width !== "auto" && this.width !== "100%") {
                        // 检查实际渲染宽度是否与设置宽度一致
                        const actualPixelWidth = element.offsetWidth;
                        const setPixelWidth = this.parsePixelWidth(this.width);
                        // 如果设置的宽度太大，实际渲染宽度会被限制，使用实际宽度
                        if (setPixelWidth > actualPixelWidth) {
                            return `${actualPixelWidth}px`;
                        }
                        return this.width;
                    }
                    // 如果没有设置宽度或设置为 100%/auto，使用实际渲染宽度
                    return `${element.offsetWidth}px`;
                }
            } catch (error) {
                console.warn("Failed to get actual width:", error);
            }
            // 降级处理：使用设置的宽度或默认值
            return this.width || "100%";
        },
        parsePixelWidth (widthStr) {
            // 解析像素值
            if (typeof widthStr === "string") {
                const match = widthStr.match(/^(\d+(?:\.\d+)?)px$/);
                if (match) {
                    return parseFloat(match[1]);
                }
            }
            return null;
        }
    },
    watch: {
        width: {
            handler () {
                // 当宽度变化时，重新计算实际宽度
                this.updateContentWidth();
            },
            immediate: true
        }
    }
};

const __vue_script__$3 = script$3;
/* template */ var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-page-form-content",
        class: _vm.wrapClass,
        style: _vm.contentStyle
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__$3 = [];
/* style */ const __vue_inject_styles__$3 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$3 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$3,
    staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$3);

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
var script$2 = {
    name: "HikCloudPageFormGroup",
    inject: [
        "pageForm",
        "pageFormContent"
    ],
    provide () {
        return {
            pageFormGroup: this
        };
    },
    props: {
        /** 分组标题 */ title: {
            type: String,
            default: ""
        },
        /** 是否显示豆腐块样式 */ block: {
            type: Boolean,
            default: true
        },
        /** 背景颜色 */ backgroundColor: {
            type: String,
            default: "#ffffff"
        },
        contentWidth: {
            type: String,
            default: "100%"
        }
    },
    computed: {
        notGroupStyle () {
            const style = {};
            // 根据父组件的布局模式设置样式
            if (this.pageForm) {
                if (this.block) {
                    const { layout } = this.pageForm;
                    style.backgroundColor = this.backgroundColor;
                    switch(layout){
                        // 居中对齐
                        case "center":
                            style.display = "flex";
                            style.justifyContent = "center";
                            break;
                        // 左对齐
                        case "left":
                            break;
                        // 全屏模式
                        case "full":
                            break;
                        // 紧凑模式
                        case "compact":
                            style.padding = "0";
                            break;
                    }
                // style.marginBottom = "16px";
                }
            }
            return style;
        },
        groupStyle () {
            const style = {};
            // 根据父组件的布局模式设置样式
            if (this.pageForm) {
                const { layout } = this.pageForm;
                style.backgroundColor = this.backgroundColor;
                if (this.block) {
                    switch(layout){
                        // 居中对齐
                        case "center":
                            style.padding = "48px 80px";
                            style.display = "flex";
                            style.alignItems = "center";
                            break;
                        // 左对齐
                        case "left":
                            style.padding = "48px 80px";
                            break;
                        // 全屏模式
                        case "full":
                            style.padding = "24px";
                            break;
                        // 紧凑模式
                        case "compact":
                            style.padding = "24px";
                            break;
                        // 轻量模式
                        case "light":
                            style.padding = "24px";
                            break;
                        default:
                            style.padding = "48px 0";
                    }
                    style.marginBottom = "16px";
                } else {
                    switch(layout){
                        case "compact":
                            style.padding = "0";
                            break;
                        // 轻量模式
                        case "light":
                            style.backgroundColor = "transparent";
                            break;
                    }
                }
            }
            return style;
        }
    },
    mounted () {
        if (this.pageFormContent) {
            this.pageFormContent.registerGroup(this);
        }
    },
    methods: {}
};

const __vue_script__$2 = script$2;
/* template */ var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _vm.title ? _c('div', {
        staticClass: "hik-cloud-page-form-group",
        style: [
            _vm.groupStyle
        ]
    }, [
        _c('div', {
            staticStyle: {
                "margin": "0 auto"
            },
            style: {
                width: _vm.block ? _vm.contentWidth : '100%'
            }
        }, [
            _vm.title ? _c('div', {
                ref: "groupTitle",
                staticClass: "hik-cloud-page-form-group__title"
            }, [
                _vm._v(" " + _vm._s(_vm.title) + " ")
            ]) : _vm._e(),
            _vm._t("default")
        ], 2)
    ]) : _c('div', {
        staticClass: "hik-cloud-page-form-not-block-group",
        staticStyle: {
            "width": "100%"
        },
        style: [
            _vm.notGroupStyle
        ]
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__$2 = [];
/* style */ const __vue_inject_styles__$2 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$2 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$2,
    staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2);

//
//
//
//
//
//
var script$1 = {
    name: "HikCloudPageFormRow",
    inject: {
        pageFormGroup: {
            default: null
        },
        pageForm: {
            default: ()=>({})
        }
    },
    provide () {
        return {
            pageFormRow: this,
            registerCol: this.registerCol
        };
    },
    props: {
        /** 宽度 */ width: {
            type: String,
            default: "100%"
        }
    },
    data () {
        return {
            colCount: 0,
            colsWithWidth: []
        };
    },
    computed: {},
    watch: {
        width: {
            handler (val) {
                if (this.pageFormGroup && this.pageFormGroup.$refs.groupTitle) {
                    this.pageFormGroup.$refs.groupTitle.style.width = val;
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted () {
        this.calculateColCount();
    },
    updated () {
        // 在组件更新时重新计算列的数量
        this.$nextTick(()=>{
            this.calculateColCount();
        });
    },
    methods: {
        // 计算子元素中 hik-cloud-page-form-col 的数量
        calculateColCount () {
            this.$nextTick(()=>{
                if (this.$slots.default) {
                    // 过滤出 hik-cloud-page-form-col 组件
                    const cols = this.$slots.default.filter((vnode)=>vnode.componentOptions && vnode.componentOptions.tag === "hik-cloud-page-form-col");
                    const newColCount = cols.length;
                    // 重置有指定宽度的列数组
                    const oldColsWithWidth = [
                        ...this.colsWithWidth
                    ];
                    this.colsWithWidth = [];
                    // 检查子组件是否已经注册，如果没有则手动注册
                    cols.forEach((vnode)=>{
                        if (vnode.componentInstance && vnode.componentInstance.width && vnode.componentInstance.width !== "100%") {
                            // 检查是否已经注册
                            if (!this.colsWithWidth.includes(vnode.componentInstance)) {
                                this.colsWithWidth.push(vnode.componentInstance);
                            }
                        }
                    });
                    // 检查是否有变化，如果有则更新并强制重新渲染
                    const hasColCountChanged = newColCount !== this.colCount;
                    const hasColsWithWidthChanged = oldColsWithWidth.length !== this.colsWithWidth.length || !oldColsWithWidth.every((col)=>this.colsWithWidth.includes(col));
                    if (hasColCountChanged || hasColsWithWidthChanged) {
                        this.colCount = newColCount;
                        // 强制更新以重新计算列宽
                        this.$forceUpdate();
                    }
                }
            });
        },
        // 注册col组件
        registerCol (col) {
            // 检查是否已经注册
            if (!this.colsWithWidth.includes(col)) {
                this.colsWithWidth.push(col);
            }
        },
        // 计算每个列的宽度
        calculateColWidth (colInstance = null) {
            const count = this.colCount;
            if (count <= 1) return "100%";
            // 如果有指定宽度的列
            if (this.colsWithWidth.length > 0) {
                // 检查当前列是否指定了宽度
                const hasFixedWidth = colInstance && colInstance.width && colInstance.width !== "100%";
                if (hasFixedWidth) {
                    // 返回指定的宽度
                    return colInstance.width;
                } else {
                    // 计算固定宽度列的总宽度
                    let fixedWidthTotal = 0;
                    let fixedColCount = 0;
                    this.colsWithWidth.forEach((col)=>{
                        if (col.width && col.width !== "100%") {
                            // 尝试提取数值部分
                            const match = col.width.match(/^(\d+(\.\d+)?)px$/);
                            if (match) {
                                fixedWidthTotal += parseFloat(match[1]);
                                fixedColCount++;
                            }
                        }
                    });
                    // 计算可变宽度列的数量
                    const flexibleColCount = count - fixedColCount;
                    if (flexibleColCount <= 0) return "100%";
                    // 计算总边距（除最后一个列外，每个列都有右边距）
                    const totalMargin = (count - 1) * 32;
                    // 计算剩余空间：100% - 固定宽度总和 - 总边距
                    return `calc((100% - ${fixedWidthTotal}px - ${totalMargin}px) / ${flexibleColCount})`;
                }
            } else {
                // 没有指定宽度的列，平均分配
                // 计算总边距（除最后一个列外，每个列都有右边距）
                const totalMargin = (count - 1) * 32;
                // 计算每列的宽度
                return `calc((100% - ${totalMargin}px) / ${count})`;
            }
        }
    }
};

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-page-form-row",
        style: {
            width: _vm.width
        }
    }, [
        _vm._t("default")
    ], 2);
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
var script = {
    name: "HikCloudPageFormCol",
    inject: [
        "pageFormRow",
        "registerCol"
    ],
    props: {
        /** 宽度 */ width: {
            type: String,
            default: "100%"
        }
    },
    computed: {
        colStyle () {
            const style = {};
            // 如果父组件是 pageFormRow，则使用其计算的宽度
            if (this.pageFormRow && this.pageFormRow.calculateColWidth) {
                style.width = this.pageFormRow.calculateColWidth(this);
            } else {
                // 默认宽度
                style.width = this.width || "100%";
            }
            return style;
        }
    },
    watch: {
        width: {
            handler (newVal) {
                // 当width变化时，重新注册
                if (this.pageFormRow && this.pageFormRow.registerCol && newVal && newVal !== "100%") {
                    // 先从数组中移除
                    const index = this.pageFormRow.colsWithWidth.indexOf(this);
                    if (index > -1) {
                        this.pageFormRow.colsWithWidth.splice(index, 1);
                    }
                    // 重新注册
                    this.pageFormRow.registerCol(this);
                }
            }
        }
    },
    mounted () {
        // 如果有指定宽度且不是默认值，注册到父组件
        if (this.pageFormRow && this.pageFormRow.registerCol && this.width && this.width !== "100%") {
            this.pageFormRow.registerCol(this);
        }
    },
    updated () {
    // // 确保在更新时也能正确注册
    // if (this.pageFormRow && this.pageFormRow.registerCol && this.width && this.width !== "100%" &&
    //     !this.pageFormRow.colsWithWidth.includes(this)) {
    //   this.pageFormRow.registerCol(this);
    // }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-page-form-col",
        style: _vm.colStyle
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

/* istanbul ignore next */ __vue_component__$4.install = function(Vue) {
    Vue.component(__vue_component__$4.name, __vue_component__$4);
    Vue.component(__vue_component__$3.name, __vue_component__$3);
    Vue.component(__vue_component__$2.name, __vue_component__$2);
    Vue.component(__vue_component__$1.name, __vue_component__$1);
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as PageFormCol, __vue_component__$3 as PageFormContent, __vue_component__$2 as PageFormGroup, __vue_component__$1 as PageFormRow, __vue_component__$4 as default };

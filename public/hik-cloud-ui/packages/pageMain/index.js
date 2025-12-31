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
    name: "HikCloudPageMain",
    props: {
        /**
     * retail - 连锁
     * enterprise - 企业
     * training - 培训
     * device-ops 设备运维
     * ai-inspect - 智能分析
     * info-publish - 信息发布
     * minerva - 普教
     * hbl - 社区
     */ project: {
            type: String,
            default: "retail",
            validator: (value)=>[
                    "retail",
                    "enterprise",
                    "training",
                    "device-ops",
                    "ai-inspect",
                    "info-publish",
                    "minerva",
                    "hbl"
                ].includes(value)
        },
        width: {
            type: String,
            default: "100%"
        },
        // 外层容器自定义类名
        wrapClass: {
            type: [
                String,
                Array,
                Object
            ],
            default: ""
        },
        // 内容容器自定义类名
        containerClass: {
            type: [
                String,
                Array,
                Object
            ],
            default: ""
        },
        /** 内部是否使用 flex 布局 */ flex: {
            type: Boolean,
            default: true
        },
        /** 使用 flex 布局时，主轴方向是否居中 */ justifyCenter: {
            type: Boolean,
            default: false
        },
        /** 使用 flex 布局时，副轴方向是否居中 */ alignCenter: {
            type: Boolean,
            default: false
        },
        /** 使用 flex 布局时，内部是水平排列还是垂直排列，默认为'垂直排列' */ direction: {
            type: String,
            default: "vertical",
            validator: function(value) {
                return [
                    "vertical",
                    "horizontal"
                ].includes(value);
            }
        }
    },
    data () {
        return {
            styleObject: [
                {
                    key: "retail",
                    styles: {
                        background: "#F9F8FB",
                        padding: "16px 16px 0 16px"
                    },
                    contentStyles: {
                        borderRadius: "4px"
                    }
                },
                {
                    key: "enterprise",
                    styles: {
                        background: "#F9F8FB",
                        padding: "16px 16px 0 16px"
                    },
                    contentStyles: {
                        borderRadius: "4px"
                    }
                },
                {
                    key: "training",
                    styles: {
                        background: "#FFFFFF",
                        padding: 0
                    },
                    contentStyles: {
                        borderRadius: 0
                    }
                },
                {
                    key: "device-ops",
                    styles: {
                        background: "#FFFFFF",
                        padding: 0
                    },
                    contentStyles: {
                        borderRadius: 0
                    }
                },
                {
                    key: "ai-inspect",
                    styles: {
                        background: "#FFFFFF",
                        padding: 0
                    },
                    contentStyles: {
                        borderRadius: 0
                    }
                },
                {
                    key: "info-publish",
                    styles: {
                        background: "#FFFFFF",
                        padding: 0
                    },
                    contentStyles: {
                        borderRadius: 0
                    }
                },
                {
                    key: "minerva",
                    styles: {
                        background: "#F4F7FA",
                        padding: "16px"
                    },
                    contentStyles: {
                        borderRadius: "12px"
                    }
                },
                {
                    key: "hbl",
                    styles: {
                        background: "#F7F8FC",
                        padding: "12px"
                    },
                    contentStyles: {
                        borderRadius: 0
                    }
                }
            ]
        };
    },
    computed: {
        // 根据 project 获取对应的样式配置
        currentStyleConfig () {
            return this.styleObject.find((item)=>item.key === this.project) || {};
        },
        // 获取外层容器的样式
        currentStyles () {
            return this.currentStyleConfig.styles || {};
        },
        // 获取内容容器的样式
        styleObjectContainer () {
            return this.currentStyleConfig.contentStyles || {};
        }
    },
    mounted () {},
    methods: {}
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
        staticClass: "hik-cloud-page__wrap",
        class: _vm.wrapClass,
        style: Object.assign({}, {
            width: _vm.width
        }, _vm.currentStyles)
    }, [
        _c('div', {
            staticClass: "hik-cloud-page__main",
            class: [
                _vm.containerClass,
                {
                    'is-flex': _vm.flex,
                    'is-vertical': _vm.direction === 'vertical',
                    'is-align-center': _vm.alignCenter,
                    'is-justify-center': _vm.justifyCenter
                }
            ],
            style: _vm.styleObjectContainer
        }, [
            _vm._t("default")
        ], 2)
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

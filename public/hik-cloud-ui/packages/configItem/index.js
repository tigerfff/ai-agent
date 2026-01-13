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
//
//
//
//
//
//
//
var script = {
    name: "HikCloudConfigItem",
    props: {
        // 组件属性定义
        configType: {
            default: "",
            type: String
        },
        // 组件属性定义
        title: {
            default: "",
            type: String
        },
        subTitle: {
            default: "",
            type: String
        },
        empty: {
            default: false,
            type: Boolean
        },
        multiple: {
            default: true,
            type: Boolean
        },
        width: {
            default: "100%",
            type: String
        },
        /**
     * 格式只支持
     * {label: "", value: ""}
     */ configMap: {
            default: ()=>[],
            type: Array
        },
        // 当前配置值（用于显示）
        value: {
            default: "",
            type: [
                String,
                Array,
                Object
            ]
        }
    },
    data () {
        return {
            configEdit: false,
            configTxt: "",
            form: {
                configItems: [],
                configText: ""
            },
            rules: {
                configItems: [
                    {
                        required: !this.empty,
                        message: "配置项不能为空"
                    }
                ]
            },
            loading: false,
            dialogVisible: false
        };
    },
    computed: {
        formatConfigText () {
            if (this.configType === "input" || this.configType === "select") {
                return this.formatValue(this.value);
            }
            return this.value || "无";
        }
    },
    watch: {
        value: {
            handler (newVal) {
                if (newVal) {
                    this.form.configItems = newVal;
                }
            },
            immediate: true
        },
        configEdit: {
            handler (newVal) {
                if (newVal) {
                    this.form.configItems = this.value;
                }
            },
            immediate: true
        }
    },
    methods: {
        // 格式化显示值
        formatValue (value) {
            if (Array.isArray(value)) {
                const config = this.configMap.map((item)=>{
                    const res = value.filter((config)=>config === item.value) || [];
                    if (res.length) {
                        return item.label;
                    }
                });
                return config.filter((item)=>item).join("、") || "无";
            }
            if (typeof value === "object" && value !== null) {
                return value.label || JSON.stringify(value);
            }
            if (value && this.configType === 'select' && !this.multiple) {
                const config = this.configMap.filter((item)=>item.value === value);
                if (config.length) return config[0].label || "无";
            }
            return value || "无";
        },
        // 处理编辑按钮点击
        handleEditClick () {
            this.configEdit = true;
            this.$emit("handleEdit");
        },
        onConfirm () {
            this.$refs.formRef.validate((val)=>{
                if (val) {
                    this.loading = true;
                    this.$emit("handleConfirm", this.form.configItems, ()=>{
                        this.loading = false;
                        this.configEdit = false;
                    });
                }
            });
        },
        onCancel () {
            this.configEdit = false;
            this.$emit("handleCancel");
        },
        onEditSuccess () {
            this.configEdit = false;
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
        staticClass: "hik-config-item",
        style: {
            width: _vm.width
        }
    }, [
        _c('div', {
            staticClass: "hik-config-item__header"
        }, [
            _vm.title ? _c('div', {
                staticClass: "hik-config-item__title",
                class: {
                    'hik-config-item__title--required': !_vm.empty
                }
            }, [
                _vm._v(" " + _vm._s(_vm.title) + " ")
            ]) : _vm._e(),
            _c('el-button', {
                directives: [
                    {
                        name: "show",
                        rawName: "v-show",
                        value: !_vm.configEdit,
                        expression: "!configEdit"
                    }
                ],
                attrs: {
                    "size": "mini",
                    "icon": "h-icon-edit"
                },
                on: {
                    "click": _vm.handleEditClick
                }
            })
        ], 1),
        _vm.subTitle ? _c('div', {
            staticClass: "hik-config-item__desc"
        }, [
            _vm._v(" " + _vm._s(_vm.subTitle) + " ")
        ]) : _vm._e(),
        _c('span', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: !_vm.configEdit,
                    expression: "!configEdit"
                }
            ],
            staticClass: "hik-config-item__content"
        }, [
            _vm._v(_vm._s(_vm.formatConfigText))
        ]),
        _c('div', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.configEdit,
                    expression: "configEdit"
                }
            ],
            staticClass: "hik-cloud-config-card"
        }, [
            [
                'input',
                'select'
            ].includes(_vm.configType) ? _c('el-form', {
                ref: "formRef",
                attrs: {
                    "model": _vm.form,
                    "rules": _vm.rules
                }
            }, [
                _vm.configType === 'select' ? _c('el-form-item', {
                    attrs: {
                        "prop": "configItems"
                    }
                }, [
                    _c('el-select', {
                        attrs: {
                            "multiple": _vm.multiple,
                            "clearable": "",
                            "clear": "",
                            "filterable": ""
                        },
                        model: {
                            value: _vm.form.configItems,
                            callback: function($$v) {
                                _vm.$set(_vm.form, "configItems", $$v);
                            },
                            expression: "form.configItems"
                        }
                    }, _vm._l(_vm.configMap, function(item) {
                        return _c('el-option', {
                            key: item.value,
                            attrs: {
                                "label": item.label,
                                "value": item.value
                            }
                        });
                    }), 1)
                ], 1) : _vm._e(),
                _vm.configType === 'input' ? _c('el-form-item', {
                    attrs: {
                        "prop": "configItems"
                    }
                }, [
                    _c('el-input', {
                        model: {
                            value: _vm.form.configItems,
                            callback: function($$v) {
                                _vm.$set(_vm.form, "configItems", $$v);
                            },
                            expression: "form.configItems"
                        }
                    })
                ], 1) : _vm._e(),
                _c('div', {
                    staticClass: "edit-actions"
                }, [
                    _c('el-button', {
                        attrs: {
                            "loading": _vm.loading,
                            "type": "primary"
                        },
                        on: {
                            "click": _vm.onConfirm
                        }
                    }, [
                        _vm._v(" 确定 ")
                    ]),
                    _c('el-button', {
                        on: {
                            "click": _vm.onCancel
                        }
                    }, [
                        _vm._v(" 取消 ")
                    ])
                ], 1)
            ], 1) : _vm._t("edit-content")
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
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

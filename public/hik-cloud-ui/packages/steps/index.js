function createNamespace(name) {
    name = 'hik-cloud-' + name;
    return [
        createBEM(name),
        kebabToPascal(name)
    ];
}
/**
 * 将短横线命名转换为驼峰命名（首字母大写）
 * @param {string} str - 短横线命名的字符串（例如：page-dual-table-transfer）
 * @returns {string} 驼峰命名的字符串（例如：PageDualTableTransfer）
 */ function kebabToPascal(str) {
    if (!str || typeof str !== 'string') return str;
    return str.split('-') // 按短横线分割
    .map((word)=>word.charAt(0).toUpperCase() + word.slice(1)) // 每个单词首字母大写
    .join(''); // 拼接成完整字符串
}
function gen(name, mods) {
    if (!mods) {
        return '';
    }
    if (typeof mods === 'string') {
        return ` ${name}--${mods}`;
    }
    if (Array.isArray(mods)) {
        return mods.reduce((ret, item)=>ret + gen(name, item), '');
    }
    return Object.keys(mods).reduce((ret, key)=>ret + (mods[key] ? gen(name, key) : ''), '');
}
function createBEM(name) {
    return function(el, mods) {
        if (el && typeof el !== 'string') {
            mods = el;
            el = '';
        }
        el = el ? `${name}__${el}` : name;
        return `${el}${gen(el, mods)}`;
    };
}

function ParentMixin(parentName) {
    return {
        provide () {
            return {
                [`${parentName}Key`]: this,
                [`${parentName}Props`]: this.$props // Vue3 的 props 需要特殊处理
            };
        },
        data () {
            return {
                children: []
            };
        },
        created () {},
        methods: {
            addChild (child) {
                this.children.push(child);
            },
            removeChild (child) {
                const index = this.children.indexOf(child);
                if (index !== -1) {
                    this.children.splice(index, 1);
                }
            }
        }
    };
}
function ChildrenMixin(parentName) {
    return {
        inject: {
            parent: {
                from: `${parentName}Key`,
                default: null
            },
            parentProps: {
                from: `${parentName}Props`,
                default: null
            }
        },
        created () {
            if (this.parent) {
                this.parent.addChild(this);
            }
        },
        beforeDestroy () {
            this.unregisterParent();
        },
        methods: {
            unregisterParent () {
                if (this.parent) {
                    this.parent.removeChild(this);
                }
            }
        },
        computed: {
            index () {
                return this.parent ? this.parent.children.indexOf(this) : null;
            }
        }
    };
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
const [bem$1, name$1] = createNamespace('step');
var script$1 = {
    name: name$1,
    mixins: [
        ChildrenMixin('Steps')
    ],
    props: {
        title: {
            type: String,
            default: ''
        },
        desc: {
            type: String,
            default: ''
        },
        circleColor: {
            type: String,
            default: ''
        }
    },
    computed: {
        status () {
            const active = +this.parentProps.active;
            if (this.index < active) {
                return 'finish';
            }
            return this.index === active ? 'process' : 'waiting';
        },
        isActive () {
            return this.status === 'process';
        },
        direction () {
            return this.parentProps.direction;
        },
        iconPrefix () {
            return this.parentProps.iconPrefix;
        },
        finishIcon () {
            return this.parentProps.finishIcon;
        },
        activeIcon () {
            return this.parentProps.activeIcon;
        },
        inactiveIcon () {
            return this.parentProps.inactiveIcon;
        },
        activeColor () {
            return this.parentProps.activeColor;
        },
        circleStyle () {
            return {
                background: this.circleColor || (this.status === 'finish' ? this.parentProps.activeColor : this.parentProps.inactiveColor)
            };
        },
        iconStyle () {
            return {
                color: this.circleColor || (this.status === 'finish' ? this.parentProps.activeColor : this.parentProps.inactiveColor)
            };
        },
        titleStyle () {
            if (this.isActive) {
                return {
                    color: this.parentProps.activeColor
                };
            }
            if (this.status === 'waiting') {
                return {
                    color: this.parentProps.inactiveColor
                };
            }
            return {
                color: this.parentProps.inactiveColor
            };
        }
    },
    created () {},
    methods: {
        bem: bem$1,
        onClickStep () {
            this.parent.$emit('click-step', this.index);
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
    var _obj;
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        class: [
            _vm.bem([
                _vm.direction,
                (_obj = {}, _obj[_vm.status] = true, _obj)
            ])
        ]
    }, [
        _vm.title || _vm.desc ? _c('div', {
            class: _vm.bem('header'),
            on: {
                "click": _vm.onClickStep
            }
        }, [
            _c('div', {
                class: _vm.bem('header', [
                    'title'
                ])
            }, [
                _vm._v(" " + _vm._s(_vm.title) + " ")
            ]),
            _c('div', {
                class: _vm.bem('header', [
                    'desc'
                ])
            }, [
                _vm._v(" " + _vm._s(_vm.desc) + " ")
            ])
        ]) : _vm._e(),
        _c('div', {
            class: _vm.bem('content'),
            on: {
                "click": _vm.onClickStep
            }
        }, [
            _vm._t("default")
        ], 2),
        _c('div', {
            class: _vm.bem('circle-container'),
            on: {
                "click": _vm.onClickStep
            }
        }, [
            _vm.status === 'process' ? [
                _vm.$slots['active-icon'] ? _vm._t("active-icon") : _vm.activeIcon ? _c('i', {
                    class: [
                        _vm.iconPrefix,
                        _vm.activeIcon,
                        _vm.bem('icon', 'active')
                    ]
                }) : _c('i', {
                    class: _vm.bem('circle'),
                    style: _vm.circleStyle
                })
            ] : _vm.status === 'finish' && (_vm.finishIcon || _vm.$slots['finish-icon']) ? [
                _vm.$slots['finish-icon'] ? _vm._t("finish-icon") : _c('i', {
                    class: [
                        _vm.iconPrefix,
                        _vm.finishIcon,
                        _vm.bem('icon', 'finish')
                    ]
                })
            ] : [
                _vm.$slots['inactive-icon'] ? _vm._t("inactive-icon") : _vm.inactiveIcon ? _c('i', {
                    class: [
                        _vm.iconPrefix,
                        _vm.inactiveIcon,
                        _vm.bem('icon')
                    ],
                    style: _vm.iconStyle
                }) : _c('i', {
                    class: _vm.bem('circle'),
                    style: _vm.circleStyle
                })
            ]
        ], 2),
        _c('div', {
            class: _vm.bem('line')
        })
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
const [bem, name] = createNamespace('steps');
var script = {
    name,
    mixins: [
        ParentMixin('Steps')
    ],
    props: {
        // 当前步骤
        active: {
            type: [
                Number,
                String
            ],
            default: 0
        },
        // 显示方向
        direction: {
            type: String,
            default: 'vertical',
            validator: (value)=>[
                    'vertical'
                ].includes(value)
        },
        // 激活状态图标
        activeIcon: {
            type: String,
            default: ''
        },
        // 图标类名前缀
        iconPrefix: {
            type: String,
            default: ''
        },
        // 完成状态图标
        finishIcon: {
            type: String,
            default: ''
        },
        // 激活状态颜色
        activeColor: {
            type: String,
            default: ''
        },
        // 未激活状态图标
        inactiveIcon: {
            type: String,
            default: ''
        },
        // 未激活状态颜色
        inactiveColor: {
            type: String,
            default: ''
        }
    },
    methods: {
        bem,
        // 点击步骤时触发
        onClickStep (index) {
            this.$emit('click-step', index);
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        class: _vm.bem([
            _vm.direction
        ])
    }, [
        _c('div', {
            class: _vm.bem('items')
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

__vue_component__$1.install = function(Vue) {
    Vue.component(__vue_component__$1.name, __vue_component__$1);
};
__vue_component__.install = function(Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

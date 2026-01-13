import { PopupManager } from 'hui/src/utils/popup';

function getNextZIndex() {
    const hui = window && window.hui;
    return hui && typeof hui.nextZIndex === 'function' ? hui.nextZIndex() : PopupManager.nextZIndex();
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
//
//
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
    name: 'HikCloudDrawer',
    props: {
        title: {
            type: String,
            default: ''
        },
        zIndex: {
            type: Number,
            default: null
        },
        size: {
            type: String,
            default: 'large'
        },
        width: {
            type: String,
            default: ''
        },
        height: {
            type: String,
            default: ''
        },
        visible: {
            type: Boolean,
            default: false
        },
        placement: {
            type: String,
            default: 'right',
            validator: (value)=>[
                    'left',
                    'right',
                    'top',
                    'bottom'
                ].includes(value)
        },
        mask: {
            type: Boolean,
            default: true
        },
        maskClosable: {
            type: Boolean,
            default: false
        },
        appendToBody: {
            type: Boolean,
            default: false
        },
        customClass: {
            type: String,
            default: ''
        },
        beforeClose: {
            type: Function,
            default: null
        },
        showClose: {
            type: Boolean,
            default: true
        },
        gray: {
            type: Boolean,
            default: true
        },
        noPadding: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            containerZIndex: this.zIndex !== null ? this.zIndex : getNextZIndex()
        };
    },
    computed: {
        paddingClass () {
            return this.noPadding ? 'no-padding' : '';
        },
        drawerStyle () {
            if (this.placement === 'left' || this.placement === 'right') {
                if (!this.width) {
                    return {};
                } else {
                    return {
                        width: this.width
                    };
                }
            } else {
                if (!this.height) {
                    return {};
                } else {
                    return {
                        height: this.height
                    };
                }
            }
        },
        getDirection () {
            switch(this.placement){
                case 'right':
                    return 'rtl';
                case 'left':
                    return 'ltr';
                case 'top':
                    return 'ttb';
                case 'bottom':
                    return 'btt';
                default:
                    return 'ltr';
            }
        },
        sizeStyle () {
            if (![
                'small',
                'medium',
                'large'
            ].includes(this.size)) {
                return {};
            }
            const attrName = this.placement === 'left' || this.placement === 'right' ? 'width' : 'height';
            return ({
                'small': {
                    [attrName]: '480px'
                },
                'medium': {
                    [attrName]: '680px'
                },
                'large': {
                    [attrName]: '880px'
                }
            })[this.size];
        }
    },
    watch: {
        visible: {
            handler: function(val) {
                if (val) {
                    this.containerZIndex = this.zIndex !== null ? this.zIndex : getNextZIndex();
                    this.$emit('open');
                } else {
                    this.$emit('close');
                }
            }
        }
    },
    mounted () {
        if (this.appendToBody) {
            document.body.appendChild(this.$el);
        }
    },
    beforeDestroy () {
        document.body.style.overflow = '';
        if (this.appendToBody && this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
    },
    methods: {
        async close () {
            if (typeof this.beforeClose === 'function') {
                try {
                    await this.beforeClose(()=>{
                        this.$emit('update:visible', false);
                    });
                } catch  {
                // 用户取消关闭
                // 用户取消关闭
                }
            } else {
                this.$emit('update:visible', false);
            }
        },
        handleWrapperClick () {
            if (this.mask && this.maskClosable) {
                this.close();
            }
        },
        afterEnter () {
            this.$emit('opened');
        },
        afterLeave () {
            this.$emit('closed');
        },
        setScroll (x, y, duration) {
            this.$refs.scrollbar.setScroll(x, y, duration);
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
    return _c('transition', {
        attrs: {
            "name": "hik-cloud-drawer-fade"
        },
        on: {
            "after-enter": _vm.afterEnter,
            "after-leave": _vm.afterLeave
        }
    }, [
        _c('div', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.visible,
                    expression: "visible"
                }
            ],
            class: [
                'hik-cloud-drawer__wrapper',
                {
                    'no-mask': !_vm.mask
                }
            ],
            style: {
                zIndex: _vm.containerZIndex
            },
            on: {
                "click": function($event) {
                    if ($event.target !== $event.currentTarget) {
                        return null;
                    }
                    return _vm.handleWrapperClick.apply(null, arguments);
                }
            }
        }, [
            _c('div', {
                staticClass: "hik-cloud-drawer",
                class: [
                    _vm.placement,
                    _vm.getDirection,
                    _vm.customClass
                ],
                style: Object.assign({}, _vm.sizeStyle, _vm.drawerStyle, {
                    zIndex: _vm.containerZIndex + 1
                })
            }, [
                _c('div', {
                    staticClass: "hik-cloud-drawer__header",
                    class: {
                        'hik-cloud-drawer__header__bb': !_vm.gray
                    }
                }, [
                    _c('span', {
                        staticClass: "hik-cloud-drawer__title"
                    }, [
                        _vm._v(_vm._s(_vm.title))
                    ]),
                    _vm.showClose ? _c('el-button', {
                        staticClass: "hik-cloud-drawer__close",
                        attrs: {
                            "type": "button",
                            "icon": "h-icon-close",
                            "size": "mini"
                        },
                        on: {
                            "click": _vm.close
                        }
                    }) : _vm._e()
                ], 1),
                _vm._t("header"),
                _c('div', {
                    staticClass: "hik-cloud-drawer__body"
                }, [
                    _c('el-scrollbar', {
                        ref: "scrollbar",
                        attrs: {
                            "wrapClass": _vm.gray ? "hik-cloud-drawer__scrollbar-wrap--gray " + _vm.paddingClass : "hik-cloud-drawer__scrollbar-wrap " + _vm.paddingClass
                        }
                    }, [
                        _vm._t("default")
                    ], 2)
                ], 1),
                _vm.$slots.footer ? _c('div', {
                    class: [
                        _vm.gray ? 'hik-cloud-drawer__footer' : 'hik-cloud-drawer__footer--gray'
                    ]
                }, [
                    _vm._t("footer")
                ], 2) : _vm._e()
            ], 2)
        ])
    ]);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

// console.log('drawer')
/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudResizeBox',
    props: {
        defaultW: {
            type: Number,
            require: true,
            default: 0
        },
        defaultBG: {
            type: String,
            default: 'rgba(0,0,0,0.12)'
        },
        activeBG: {
            type: String,
            default: ''
        },
        minW: {
            type: Number,
            default: 0
        },
        maxW: {
            type: Number,
            default: 0
        },
        type: {
            type: String,
            default: 'right',
            validator: (value)=>[
                    'left',
                    'right',
                    'both'
                ].includes(value)
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            width: undefined,
            rightInfo: {
                resizing: false
            },
            leftInfo: {
                resizing: false
            }
        };
    },
    computed: {
        _activeBG () {
            return this.activeBG || 'var(--ym-primary)';
        },
        rightEnable () {
            return this.type == 'right' || this.type == 'both';
        },
        leftEnable () {
            return this.type == 'left' || this.type == 'both';
        },
        currentWidth () {
            let width = Number.isFinite(this.width) ? this.width : this.defaultW;
            width = Math.max(this.minW, width);
            if (this.maxW) {
                width = Math.min(this.maxW, width);
            }
            return width;
        }
    },
    watch: {
        currentWidth () {
            this.$emit('widthChanged', this.currentWidth);
        }
    },
    methods: {
        setCurrentWidth (width) {
            this.width = width;
        },
        leftBeginSliding (e) {
            let leftBar = this.$refs.leftBar;
            leftBar.onpointermove = this.leftTriggerResize;
            leftBar.setPointerCapture(e.pointerId);
            this.leftInfo.resizing = true;
            this.$emit('start', 'left');
        },
        leftTriggerResize (e) {
            let box = this.$refs.box;
            this.width = box.getBoundingClientRect().right - e.clientX;
        },
        rightBeginSliding (e) {
            let rightBar = this.$refs.rightBar;
            rightBar.onpointermove = this.rightTriggerResize;
            rightBar.setPointerCapture(e.pointerId);
            this.rightInfo.resizing = true;
            this.$emit('start', 'right');
        },
        rightTriggerResize (e) {
            let box = this.$refs.box;
            this.width = e.clientX - box.getBoundingClientRect().x;
        },
        stopSliding (e) {
            e.target.onpointermove = null;
            e.target.releasePointerCapture(e.pointerId);
            this.rightInfo.resizing = false;
            this.leftInfo.resizing = false;
            this.$emit('stop', this.currentWidth);
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
        ref: "box",
        staticClass: "hik-cloud-resize_box",
        style: {
            width: _vm.currentWidth + "px"
        }
    }, [
        _vm._t("default"),
        _vm.leftEnable ? _c('div', {
            ref: "leftBar",
            staticClass: "line",
            class: {
                disabled: _vm.disabled
            },
            staticStyle: {
                "left": "0"
            },
            style: {
                background: _vm.leftInfo.resizing ? _vm._activeBG : _vm.defaultBG
            },
            on: {
                "pointerdown": _vm.leftBeginSliding,
                "pointerup": _vm.stopSliding
            }
        }) : _vm._e(),
        _vm.rightEnable ? _c('div', {
            ref: "rightBar",
            staticClass: "line",
            class: {
                disabled: _vm.disabled
            },
            staticStyle: {
                "right": "0"
            },
            style: {
                background: _vm.rightInfo.resizing ? _vm._activeBG : _vm.defaultBG
            },
            on: {
                "pointerdown": _vm.rightBeginSliding,
                "pointerup": _vm.stopSliding
            }
        }) : _vm._e()
    ], 2);
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

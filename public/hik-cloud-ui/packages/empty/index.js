var img$1 = "data:image/png;base64,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";

var img = "data:image/png;base64,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";

//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudEmpty',
    props: {
        imgSrc: {
            type: String,
            default: ''
        },
        title: {
            type: String,
            default: "暂无数据"
        },
        size: {
            type: String,
            required: true,
            default: "small",
            validator: (value)=>[
                    "small",
                    "large"
                ].includes(value)
        },
        width: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
        };
    },
    computed: {
        imgWidth () {
            if (this.width) return this.width;
            return this.size === "small" ? 60 : 180;
        },
        localIMG () {
            if (this.imgSrc) {
                return this.imgSrc;
            } else {
                return this.size === "large" ? img : img$1;
            }
        }
    },
    watch: {},
    mounted () {
    // this.addEventListenerByView();
    // window.addEventListener("resize", this.addEventListenerByView);
    },
    methods: {
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
        staticClass: "hik-cloud-empty"
    }, [
        _c('div', {
            staticClass: "hik-cloud-empty__main"
        }, [
            _c('img', {
                class: [
                    'empty-img',
                    _vm.size + "-img"
                ],
                style: {
                    width: _vm.imgWidth + "px"
                },
                attrs: {
                    "src": "" + _vm.localIMG,
                    "alt": ""
                }
            }),
            _c('p', {
                class: [
                    'empty-txt',
                    _vm.size + "-txt"
                ]
            }, [
                _vm._v(" " + _vm._s(_vm.title) + " ")
            ]),
            _vm.$slots.default ? _c('div', {
                class: [
                    'empty-btn',
                    _vm.size + "-btn__margin"
                ]
            }, [
                _vm._t("default")
            ], 2) : _vm._e()
        ])
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

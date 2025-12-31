//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudProgressStepCircle',
    props: {
        progressInfo: {
            type: Object,
            default: ()=>{}
        },
        paddingTop: {
            type: String,
            default: '20px'
        }
    },
    data () {
        return {};
    },
    methods: {
        mousemoveProgress (ev, progress, progressInfo) {
            this.$emit('mousemove', ev, progress, progressInfo);
        },
        mouseleaveProgress (ev, progress, progressInfo) {
            this.$emit('mouseleave', ev, progress, progressInfo);
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
    return _c('el-scrollbar', [
        _c('div', {
            staticClass: "produce-schedule-cell"
        }, [
            _vm._l(_vm.progressInfo.produceSchedule || [], function(progress, index) {
                return _c('div', {
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.progressInfo.produceSchedule && _vm.progressInfo.produceSchedule.length,
                            expression: "progressInfo.produceSchedule && progressInfo.produceSchedule.length"
                        }
                    ],
                    key: index,
                    staticClass: "produce-schedule-progress"
                }, [
                    _c('div', {
                        staticClass: "production-wrap"
                    }, [
                        _c('el-progress', {
                            attrs: {
                                "type": "circle",
                                "percentage": +progress.schedule > 100 ? 100 : +progress.schedule < 0 ? 0 : +progress.schedule,
                                "color": _vm.progressInfo.color || '#2196F3',
                                "status": "success"
                            },
                            nativeOn: {
                                "mousemove": function($event) {
                                    return (function(ev) {
                                        return _vm.mousemoveProgress(ev, progress, _vm.progressInfo.produceOrderNo);
                                    }).apply(null, arguments);
                                },
                                "mouseleave": function($event) {
                                    return (function(ev) {
                                        return _vm.mouseleaveProgress(ev, progress, _vm.progressInfo.produceOrderNo);
                                    }).apply(null, arguments);
                                }
                            }
                        }, [
                            progress.showInnerText ? _c('span', {
                                staticClass: "progress-percentage",
                                attrs: {
                                    "slot": "text"
                                },
                                slot: "text"
                            }, [
                                _vm._v(_vm._s(+progress.schedule) + "%")
                            ]) : _vm._e(),
                            progress.showInnerTick ? _c('i', {
                                staticClass: "progress-success h-icon-done",
                                attrs: {
                                    "slot": "text"
                                },
                                slot: "text"
                            }) : _vm._e()
                        ]),
                        _c('div', {
                            staticClass: "production-name"
                        }, [
                            _vm._v(" " + _vm._s(progress.circleName) + " ")
                        ])
                    ], 1),
                    (_vm.progressInfo.produceSchedule || []).length !== index + 1 ? _c('i', {
                        staticClass: "icon iconfont iconjiantou",
                        style: {
                            'padding-top': _vm.paddingTop
                        }
                    }) : _vm._e()
                ]);
            }),
            _c('span', {
                directives: [
                    {
                        name: "show",
                        rawName: "v-show",
                        value: !_vm.progressInfo.produceSchedule || !_vm.progressInfo.produceSchedule.length,
                        expression: "!progressInfo.produceSchedule || !progressInfo.produceSchedule.length"
                    }
                ],
                staticClass: "produce-schedule-cell-default"
            }, [
                _vm._v("- -")
            ])
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

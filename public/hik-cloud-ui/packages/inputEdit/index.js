//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudInputEdit',
    components: {},
    props: {
        value: {
            type: String,
            default: ''
        },
        maxlength: {
            type: Number,
            default: 32
        },
        fontSize: {
            type: Number,
            default: 16
        },
        iconSize: {
            type: Number,
            default: 22
        },
        width: {
            type: [
                Number,
                String
            ],
            default: ''
        },
        maxWidth: {
            type: [
                Number,
                String
            ],
            default: 1200
        },
        disabled: {
            type: Boolean,
            default: false
        },
        isAlwaysShowEdit: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            name: '',
            isEdit: false,
            isHover: false
        };
    },
    watch: {
        value (val) {
            this.name = val;
        }
    },
    mounted () {
        this.name = this.value;
        if (this.isAlwaysShowEdit) {
            this.isHover = true;
        }
    },
    methods: {
        handleEnter () {
            this.$refs.elInput.$el.querySelector('input').blur();
        },
        /**
     * 外部接口失败时重置
     */ reset () {
            this.name = this.value;
        },
        handleMouseenter () {
            this.isHover = true;
        },
        handleMouseleave () {
            if (!this.isAlwaysShowEdit) {
                this.isHover = false;
            }
        },
        handleSubmit () {
            this.$emit('endEdit');
            if (!this.name) {
                this.$message.warning('名称不能为空');
                this.name = this.value;
                this.isEdit = false;
                return;
            }
            this.isEdit = false;
            if (this.name === this.value) return;
            this.$emit('update', this.name);
        },
        goEdit () {
            if (this.disabled) return;
            this.isEdit = true;
            this.$emit('startEdit');
            this.$nextTick(()=>{
                this.$refs.elInput.$el.querySelector('input').style.fontSize = this.fontSize + 'px';
                this.$refs.elInput.$el.querySelector('input').focus();
                this.$refs.elInput.$el.querySelector('input').select();
            });
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
        staticClass: "hik-cloud-inputEdit",
        style: {
            'fontSize': _vm.fontSize + 'px',
            'width': _vm.width ? _vm.width + 'px' : 'auto',
            'max-width': (_vm.maxWidth < _vm.width ? _vm.width : _vm.maxWidth) + 'px'
        },
        on: {
            "mouseenter": function($event) {
                return _vm.handleMouseenter($event);
            },
            "mouseleave": function($event) {
                return _vm.handleMouseleave($event);
            }
        }
    }, [
        !_vm.isEdit ? _c('span', {
            staticClass: "hik-cloud-inputEdit__nameText",
            attrs: {
                "title": _vm.name
            }
        }, [
            _vm._v(_vm._s(_vm.name))
        ]) : _vm._e(),
        _c('i', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.isHover && !_vm.isEdit && !_vm.disabled,
                    expression: "isHover && !isEdit && !disabled"
                }
            ],
            staticClass: "h-icon-edit hik-cloud-inputEdit__editIcon",
            style: {
                'fontSize': _vm.iconSize + 'px'
            },
            on: {
                "click": _vm.goEdit
            }
        }),
        _vm.isEdit ? _c('el-input', {
            ref: "elInput",
            style: {
                'fontSize': _vm.fontSize + 'px'
            },
            attrs: {
                "maxlength": _vm.maxlength
            },
            on: {
                "blur": _vm.handleSubmit
            },
            nativeOn: {
                "keyup": function($event) {
                    if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
                        return null;
                    }
                    return _vm.handleEnter.apply(null, arguments);
                }
            },
            model: {
                value: _vm.name,
                callback: function($$v) {
                    _vm.name = $$v;
                },
                expression: "name"
            }
        }) : _vm._e(),
        _vm.isEdit ? _c('span', {
            staticClass: "hik-cloud-inputEdit__inputNameEditNumber"
        }, [
            _c('span', {
                staticClass: "txt"
            }, [
                _vm._v(_vm._s(_vm.name.length))
            ]),
            _vm._v("/" + _vm._s(_vm.maxlength))
        ]) : _vm._e()
    ], 1);
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

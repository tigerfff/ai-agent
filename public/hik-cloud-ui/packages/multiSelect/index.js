//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudMultiSelect',
    props: {
        value: {
            required: true,
            type: Array,
            default: ()=>[]
        },
        disabled: {
            type: Boolean,
            default: false
        },
        isTranslate: {
            type: Boolean,
            default: false
        },
        clearable: {
            type: Boolean,
            default: false
        },
        collapseTags: {
            type: Boolean,
            default: false
        },
        multipleLimit: {
            type: Number,
            default: 10
        },
        valueKey: {
            type: String,
            default: 'id'
        },
        labelKey: {
            type: String,
            default: 'name'
        },
        decsValueKey: {
            type: String,
            default: 'roleNames'
        },
        readonly: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: true
        },
        placeholder: {
            type: String,
            default: ''
        },
        visible: {
            type: Boolean,
            default: false
        },
        showArrow: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            inputValue: '',
            selectedLabel: '',
            cachedOptions: [],
            selected: [],
            inputHovering: false,
            inputWidth: 0,
            slotWidth: 0,
            collapseTagsContainerWidth: 0,
            resizeObserver: null
        };
    },
    computed: {
        hasValue () {
            return this.value.length > 0;
        },
        showClearIcon () {
            return !this.disabled && !this.readonly && this.inputHovering && this.hasValue;
        },
        iconClass () {
            return this.showClearIcon ? 'h-icon-close_f' : 'h-icon-angle_down_sm';
        },
        inputWidthMin () {
            return this.clearable ? 50 : 32;
        },
        trans () {
            return this.isTranslate;
        },
        tagContainerWidth () {
            return this.inputWidth - this.inputWidthMin - this.slotWidth;
        },
        tagMaxWidth () {
            return Math.max(this.tagContainerWidth - this.collapseTagsContainerWidth - 48, 40);
        }
    },
    watch: {
        value: {
            handler () {
                this.setSelected();
            },
            immediate: true,
            deep: true
        }
    },
    mounted () {
        this.initResizeObserver();
        this.$nextTick(()=>{
            this.updateSlotWidth();
            this.reComputeLayout();
        });
    },
    updated () {
        this.$nextTick(this.updateSlotWidth);
    },
    beforeDestroy () {
        this.destroyObserver();
    },
    methods: {
        // 初始化容器尺寸监听
        initResizeObserver () {
            if (window.ResizeObserver) {
                this.resizeObserver = new ResizeObserver(()=>{
                    this.$nextTick(this.reComputeLayout);
                });
                this.resizeObserver.observe(this.$refs.selectContainer);
            } else {
                window.addEventListener('resize', this.reComputeLayout);
            }
        },
        destroyObserver () {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            } else {
                window.removeEventListener('resize', this.reComputeLayout);
            }
        },
        // 计算输入框宽度
        computeInputWidth () {
            const refEl = this.$refs.reference && this.$refs.reference.$el;
            if (refEl) {
                this.inputWidth = refEl.getBoundingClientRect().width;
            }
        },
        // 计算折叠标签宽度
        computeCollapseTagsWidth () {
            if (this.$refs.collapseTagsRef) {
                this.collapseTagsContainerWidth = this.$refs.collapseTagsRef.$el.offsetWidth;
            } else {
                this.collapseTagsContainerWidth = 0;
            }
        },
        // 调整输入框样式
        adjustInputStyle () {
            if (!this.$refs.reference || this.collapseTags || !this.$refs.tags) return;
            const refEl = this.$refs.reference.$el;
            const inputs = refEl.querySelectorAll('.el-input__inner');
            if (inputs.length) {
                const input = inputs[inputs.length - 1];
                const tagsHeight = this.$refs.tags.clientHeight || 0;
                const tagsWidth = this.$refs.tags.clientWidth || 0;
                input.style.height = Math.max(tagsHeight, 32) + 'px';
                input.style.width = tagsWidth + 40 + 'px';
            }
        },
        // 统一布局计算入口
        reComputeLayout () {
            this.$nextTick(()=>{
                this.computeInputWidth();
                this.computeCollapseTagsWidth();
                this.adjustInputStyle();
            });
        },
        // 精确计算 prepend 插槽总宽度
        updateSlotWidth () {
            this.$nextTick(()=>{
                const vnodes = this.$slots.prepend;
                if (!vnodes) {
                    this.slotWidth = 0;
                    return;
                }
                let totalWidth = 0;
                vnodes.forEach((vnode)=>{
                    // 更安全的访问方式
                    if (vnode.elm && vnode.elm.nodeType === 1) {
                        try {
                            const rect = vnode.elm.getBoundingClientRect();
                            totalWidth += rect.width;
                        } catch (error) {
                        // 忽略计算错误
                        }
                    }
                });
                this.slotWidth = Math.max(totalWidth, 40);
            });
        },
        getTitle (item) {
            if (this.trans) return '' // ww-open-data 不显示 title
            ;
            const desc = item[this.decsValueKey];
            if (Array.isArray(desc) && desc.length) {
                return `${item[this.labelKey]}(${desc.join('、')})`;
            }
            return item[this.labelKey] || '';
        },
        handleIconClick (event) {
            if (this.showClearIcon) {
                this.deleteSelected(event);
            } else {
                this.toggleMenu();
            }
        },
        toggleMenu () {
            if (this.disabled || this.readonly) return;
            this.$emit('open');
            this.$emit('update:visible', !this.visible);
        },
        deleteSelected (event) {
            event && event.stopPropagation();
            this.$emit('input', []);
            this.$emit('change', []);
            this.$emit('clear');
        },
        handleClose () {
            this.$emit('update:visible', false);
        },
        handleMouseDown (event) {
            if (event.target.tagName !== 'INPUT') return;
            if (this.visible) {
                this.handleClose();
                event.preventDefault();
            }
        },
        handleDeleteKey () {
            const input = this.$refs.reference && this.$refs.reference.$el && this.$refs.reference.$el.querySelector('input');
            if (!input || input.value) return; // 有输入时不触发
            this.deleteAllTag();
        },
        getValueKey (item) {
            return this.getValueByPath(item, this.valueKey);
        },
        deleteTag (event, tag) {
            const index = this.selected.indexOf(tag);
            if (index === -1 || this.disabled) return;
            const newValue = [
                ...this.value
            ];
            newValue.splice(index, 1);
            this.$emit('input', newValue);
            this.$emit('change', newValue);
            this.$emit('remove-tag', tag);
            event.stopPropagation();
        },
        deleteAllTag () {
            if (!this.hasValue || this.disabled) return;
            this.$emit('input', []);
            this.$emit('change', []);
            this.selected.forEach((item)=>{
                this.$emit('remove-tag', item);
            });
            this.$nextTick(()=>{
                this.reComputeLayout();
            });
        },
        setSelected () {
            const result = [];
            this.value.forEach((val)=>{
                result.push(val);
            });
            this.selected = result;
            // 更新显示文本
            this.selectedLabel = this.selected.map((item)=>item[this.labelKey]).join(', ');
            this.$nextTick(()=>{
                this.reComputeLayout();
                this.renderWechatDom();
            });
        },
        handleAfterLeave () {
            this.$nextTick(()=>{
                this.reComputeLayout();
            });
        },
        getValueByPath (object, prop) {
            prop = prop || '';
            const paths = prop.split('.');
            let current = object;
            let result = null;
            for(let i = 0, j = paths.length; i < j; i++){
                const path = paths[i];
                if (!current) break;
                if (i === j - 1) {
                    result = current[path];
                    break;
                }
                current = current[path];
            }
            return result;
        },
        renderWechatDom () {
        // 可扩展
        },
        // 暴露 focus/blur 方法
        focus () {
            this.$refs.reference && this.$refs.reference.focus();
        },
        blur () {
            this.$refs.reference && this.$refs.reference.blur();
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
        ref: "selectContainer",
        staticClass: "hik-cloud-multi-select"
    }, [
        _c('div', {
            ref: "tags",
            staticClass: "el-select__tags__container",
            class: {
                'input-not-allowed': _vm.disabled
            },
            style: {
                'max-width': _vm.tagContainerWidth + 'px',
                'left': _vm.slotWidth + 'px'
            },
            on: {
                "click": function($event) {
                    $event.stopPropagation();
                    return _vm.toggleMenu.apply(null, arguments);
                }
            }
        }, [
            _vm.collapseTags && _vm.selected.length ? _c('span', [
                _c('el-tag', {
                    class: {
                        'disabled-cursor': _vm.disabled
                    },
                    attrs: {
                        "closable": _vm.closable && !_vm.disabled && !_vm.readonly,
                        "maxWidth": _vm.tagMaxWidth + "px",
                        "title": _vm.getTitle(_vm.selected[0]),
                        "type": "primary",
                        "close-transitions": ""
                    },
                    on: {
                        "close": function($event) {
                            return _vm.deleteTag($event, _vm.selected[0]);
                        }
                    }
                }, [
                    _vm.trans ? _c('ww-open-data', {
                        staticClass: "HKWWOpenData",
                        attrs: {
                            "type": _vm.selected[0].opentype,
                            "openid": _vm.selected[0].openid,
                            "lang": "zh_CN"
                        }
                    }) : _c('span', {
                        staticClass: "el-select__tags-text"
                    }, [
                        _vm._v(" " + _vm._s(_vm.selected[0][_vm.labelKey]) + " "),
                        _vm.selected[0][_vm.decsValueKey] && _vm.selected[0][_vm.decsValueKey].length ? _c('span', [
                            _vm._v(" (" + _vm._s(_vm.selected[0][_vm.decsValueKey].join('、')) + ") ")
                        ]) : _vm._e()
                    ])
                ], 1),
                _vm.selected.length > 1 ? _c('el-tag', {
                    ref: "collapseTagsRef",
                    class: {
                        'disabled-cursor': _vm.disabled
                    },
                    attrs: {
                        "type": "primary",
                        "close-transitions": ""
                    }
                }, [
                    _c('span', {
                        staticClass: "el-select__tags-text"
                    }, [
                        _vm._v("+ " + _vm._s(_vm.selected.length - 1))
                    ])
                ]) : _vm._e()
            ], 1) : _c('transition-group', {
                on: {
                    "after-leave": _vm.handleAfterLeave
                }
            }, _vm._l(_vm.selected, function(item) {
                return _c('el-tag', {
                    key: _vm.getValueKey(item),
                    ref: "expendTag",
                    refInFor: true,
                    class: {
                        'disabled-cursor': _vm.disabled
                    },
                    attrs: {
                        "maxWidth": _vm.tagMaxWidth + "px",
                        "title": _vm.getTitle(item),
                        "closable": _vm.closable && !_vm.disabled && !_vm.readonly,
                        "type": "primary",
                        "close-transition": ""
                    },
                    on: {
                        "close": function($event) {
                            return _vm.deleteTag($event, item);
                        }
                    }
                }, [
                    _vm.trans ? _c('ww-open-data', {
                        staticClass: "HKWWOpenData",
                        attrs: {
                            "type": item.opentype,
                            "openid": item.openid,
                            "lang": "zh_CN"
                        }
                    }) : _c('span', {
                        staticClass: "el-select__tags-text"
                    }, [
                        _vm._v(" " + _vm._s(item[_vm.labelKey]) + " "),
                        item[_vm.decsValueKey] && item[_vm.decsValueKey].length ? _c('span', [
                            _vm._v(" (" + _vm._s(item[_vm.decsValueKey].join('、')) + ") ")
                        ]) : _vm._e()
                    ])
                ], 1);
            }), 1)
        ], 1),
        _c('el-input', {
            ref: "reference",
            attrs: {
                "disabled": _vm.disabled,
                "title": _vm.selectedLabel,
                "placeholder": _vm.value.length === 0 ? _vm.placeholder : '',
                "readonly": _vm.readonly,
                "unselectable": 'off',
                "validate-event": false,
                "clearable": _vm.clearable,
                "type": "text"
            },
            nativeOn: {
                "keydown": [
                    function($event) {
                        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "delete", [
                            8,
                            46
                        ], $event.key, [
                            "Backspace",
                            "Delete",
                            "Del"
                        ])) {
                            return null;
                        }
                        $event.preventDefault();
                        return _vm.handleDeleteKey.apply(null, arguments);
                    },
                    function($event) {
                        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "esc", 27, $event.key, [
                            "Esc",
                            "Escape"
                        ])) {
                            return null;
                        }
                        $event.stopPropagation();
                        $event.preventDefault();
                        return _vm.handleClose.apply(null, arguments);
                    },
                    function($event) {
                        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "down", 40, $event.key, [
                            "Down",
                            "ArrowDown"
                        ])) {
                            return null;
                        }
                        $event.preventDefault();
                        return _vm.navigateOptions('next');
                    },
                    function($event) {
                        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "up", 38, $event.key, [
                            "Up",
                            "ArrowUp"
                        ])) {
                            return null;
                        }
                        $event.preventDefault();
                        return _vm.navigateOptions('prev');
                    },
                    function($event) {
                        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "tab", 9, $event.key, "Tab")) {
                            return null;
                        }
                        return _vm.handleClose.apply(null, arguments);
                    }
                ],
                "mousedown": function($event) {
                    return _vm.handleMouseDown.apply(null, arguments);
                },
                "mouseenter": function($event) {
                    _vm.inputHovering = true;
                },
                "mouseleave": function($event) {
                    _vm.inputHovering = false;
                }
            },
            model: {
                value: _vm.inputValue,
                callback: function($$v) {
                    _vm.inputValue = $$v;
                },
                expression: "inputValue"
            }
        }, [
            _c('template', {
                slot: "prepend"
            }, [
                _vm._t("prepend")
            ], 2),
            _vm.showArrow ? _c('i', {
                class: [
                    'el-input__icon',
                    'select-mian-input__icon',
                    _vm.iconClass,
                    {
                        'is-reverse': !_vm.showClearIcon && _vm.visible
                    }
                ],
                attrs: {
                    "slot": "suffix"
                },
                on: {
                    "click": _vm.handleIconClick
                },
                slot: "suffix"
            }) : _vm._e()
        ], 2)
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

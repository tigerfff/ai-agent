//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: "HikCloudDescriptionList",
    props: {
        dataSource: {
            type: Array,
            required: true,
            validator: (value)=>{
                return value.every((item)=>{
                    // 验证条件：必须有label或labelSlot，以及value或valueSlot
                    return ("label" in item || "labelSlot" in item) && ("value" in item || "valueSlot" in item);
                });
            }
        },
        column: {
            type: Number,
            default: 4,
            validator: (value)=>value > 0
        },
        showDivider: {
            type: Boolean,
            default: true
        },
        single: {
            type: Boolean,
            default: false
        },
        layout: {
            type: String,
            default: "horizontal",
            validator: (value)=>[
                    "horizontal",
                    "vertical"
                ].includes(value)
        },
        labelWidth: {
            type: String,
            default: "56px"
        },
        itemSpans: {
            type: Array,
            default: ()=>[],
            validator: (value)=>value.every((span)=>span > 0)
        }
    },
    computed: {
        formattedData () {
            if (this.single) {
                return this.dataSource.map((item)=>[
                        item
                    ]);
            }
            const result = [];
            let currentRow = [];
            let currentCol = 0;
            (this.dataSource || []).forEach((item, index)=>{
                const span = Math.min(this.getItemSpanByIndex(index), this.column);
                if (currentCol + span > this.column) {
                    result.push(currentRow);
                    currentRow = [];
                    currentCol = 0;
                }
                currentRow.push(item);
                currentCol += span;
            });
            if (currentRow.length > 0) {
                result.push(currentRow);
            }
            return result;
        }
    },
    methods: {
        getItemSpanByIndex (index) {
            return this.itemSpans[index] || 1;
        },
        getItemColumnSpan (rowIndex, itemIndex) {
            const globalIndex = this.getGlobalIndex(rowIndex, itemIndex);
            const span = Math.min(this.getItemSpanByIndex(globalIndex), this.column);
            return span >= this.column ? "1 / -1" : `span ${span}`;
        },
        getGlobalIndex (rowIndex, itemIndex) {
            let globalIndex = 0;
            for(let i = 0; i < rowIndex; i++){
                globalIndex += this.formattedData[i].length;
            }
            return globalIndex + itemIndex;
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
        staticClass: "hik-cloud-description-list"
    }, _vm._l(_vm.formattedData, function(row, rowIndex) {
        return _c('div', {
            key: rowIndex,
            staticClass: "hik-cloud-description-list-row",
            style: {
                'grid-template-columns': _vm.single ? '1fr' : "repeat(" + _vm.column + ", minmax(0, 1fr))"
            }
        }, _vm._l(row, function(item, itemIndex) {
            return _c('div', {
                key: itemIndex,
                staticClass: "hik-cloud-description-list-item",
                class: {
                    'vertical-layout': _vm.layout === 'vertical',
                    'horizontal-layout': _vm.layout === 'horizontal'
                },
                style: {
                    'grid-column': _vm.single ? '1 / -1' : _vm.getItemColumnSpan(rowIndex, itemIndex)
                }
            }, [
                _vm.showDivider && itemIndex > 0 && !_vm.single ? _c('div', {
                    staticClass: "hik-cloud-description-list-divider"
                }) : _vm._e(),
                _c('div', {
                    staticClass: "hik-cloud-description-list-label",
                    style: {
                        minWidth: _vm.labelWidth
                    }
                }, [
                    item.labelSlot ? [
                        _vm._t(item.labelSlot, null, {
                            "item": item
                        })
                    ] : [
                        _vm._v(" " + _vm._s(item.label || "- -") + " ")
                    ]
                ], 2),
                _c('div', {
                    staticClass: "hik-cloud-description-list-content"
                }, [
                    item.valueSlot ? [
                        _vm._t(item.valueSlot, null, {
                            "item": item
                        })
                    ] : [
                        _vm._v(" " + _vm._s(item.value || "- -") + " ")
                    ]
                ], 2)
            ]);
        }), 0);
    }), 0);
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

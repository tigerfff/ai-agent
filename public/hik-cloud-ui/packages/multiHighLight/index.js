//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudMultiHighlight',
    props: {
        highlightKeys: {
            type: Array,
            default: ()=>[]
        },
        colors: {
            type: Array,
            default: ()=>[]
        },
        notCaseInsensitive: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            slotText: '' // 存储从插槽提取的文本
        };
    },
    computed: {
        processedText () {
            const { highlightKeys, colors, notCaseInsensitive } = this;
            const text = this.slotText;
            if (highlightKeys.length === 0 || !text) {
                return [
                    {
                        text,
                        isHighlight: false,
                        color: ''
                    }
                ];
            }
            if (highlightKeys.length !== colors.length) {
                return [
                    {
                        text,
                        isHighlight: false,
                        color: ''
                    }
                ];
            }
            const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
            const keys = highlightKeys.map((key)=>String(key).replace(matchOperatorsRe, '\\$&'));
            const flags = notCaseInsensitive ? 'g' : 'gi';
            const regex = new RegExp(keys.join('|'), flags);
            const strArr = text.split(regex).join('*-*-*|*-*-*').split('*-*-*').filter(Boolean);
            const matches = text.match(regex) || [];
            return strArr.map((item)=>{
                if (item === '|') {
                    const matchedText = matches.shift();
                    const colorIndex = highlightKeys.findIndex((key)=>notCaseInsensitive ? key === matchedText : key.toLowerCase() === matchedText.toLowerCase());
                    return {
                        text: matchedText,
                        isHighlight: true,
                        color: colors[colorIndex] || ''
                    };
                }
                return {
                    text: item,
                    isHighlight: false,
                    color: ''
                };
            });
        }
    },
    mounted () {
        this.extractSlotText();
        // 设置MutationObserver监听插槽内容变化
        this.observer = new MutationObserver(this.extractSlotText);
        this.observer.observe(this.$refs.slotContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
    },
    beforeDestroy () {
        this.observer.disconnect();
    },
    methods: {
        extractSlotText () {
            this.slotText = this.$refs.slotContainer.textContent;
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
    return _c('span', {
        ref: "container"
    }, [
        _c('span', {
            ref: "slotContainer",
            staticStyle: {
                "display": "none"
            }
        }, [
            _vm._t("default")
        ], 2),
        _vm._l(_vm.processedText, function(item, index) {
            return [
                item.isHighlight ? _c('span', {
                    key: index + '_highlight',
                    staticClass: "hik-cloud-multiHighlight__highlight",
                    style: {
                        color: item.color
                    }
                }, [
                    _vm._v(" " + _vm._s(item.text) + " ")
                ]) : _c('span', {
                    key: index + '_normal'
                }, [
                    _vm._v(" " + _vm._s(item.text) + " ")
                ])
            ];
        })
    ], 2);
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

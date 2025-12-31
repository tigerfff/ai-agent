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

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
const [bem, name] = createNamespace('text-ellipsis');
var script = {
    name,
    props: {
        rows: {
            type: [
                Number,
                String
            ],
            default: 1
        },
        dots: {
            type: String,
            default: '...'
        },
        content: {
            type: String,
            default: ''
        },
        expandText: {
            type: String,
            default: ''
        },
        collapseText: {
            type: String,
            default: ''
        },
        position: {
            type: String,
            default: 'end'
        }
    },
    data () {
        return {
            displayText: this.content,
            expanded: false,
            hasAction: false,
            needRecalculate: false,
            windowWidth: window.innerWidth
        };
    },
    computed: {
        actionText () {
            return this.expanded ? this.collapseText : this.expandText;
        },
        bemClass () {
            return bem();
        },
        actionClass () {
            return bem('action');
        }
    },
    watch: {
        content: {
            handler () {
                this.calcEllipsised();
            },
            immediate: false
        },
        rows () {
            this.calcEllipsised();
        },
        position () {
            this.calcEllipsised();
        },
        windowWidth () {
            this.calcEllipsised();
        }
    },
    mounted () {
        this.calcEllipsised();
        if (this.$slots.action) {
            this.$nextTick(()=>{
                this.calcEllipsised();
            });
        }
        // 监听窗口大小变化
        this.handleResize = ()=>{
            this.windowWidth = window.innerWidth;
        };
        window.addEventListener('resize', this.handleResize);
    },
    activated () {
        if (this.needRecalculate) {
            this.needRecalculate = false;
            this.calcEllipsised();
        }
    },
    beforeDestroy () {
        if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize);
        }
    },
    methods: {
        pxToNum (value) {
            if (!value) return 0;
            const match = value.match(/^\d*(\.\d*)?/);
            return match ? Number(match[0]) : 0;
        },
        cloneContainer () {
            if (!this.$refs.root || !this.$refs.root.isConnected) return;
            const originStyle = window.getComputedStyle(this.$refs.root);
            const container = document.createElement('div');
            const styleNames = Array.prototype.slice.apply(originStyle);
            styleNames.forEach((name)=>{
                container.style.setProperty(name, originStyle.getPropertyValue(name));
            });
            container.style.position = 'fixed';
            container.style.zIndex = '-9999';
            container.style.top = '-9999px';
            container.style.height = 'auto';
            container.style.minHeight = 'auto';
            container.style.maxHeight = 'auto';
            container.innerText = this.content;
            document.body.appendChild(container);
            return container;
        },
        calcEllipsisText (container, maxHeight) {
            const { content, position, dots } = this;
            const end = content.length;
            const middle = 0 + end >> 1;
            const actionHTML = this.$slots.action ? this.$refs.actionRef && this.$refs.actionRef.outerHTML || '' : this.expandText;
            const calcEllipse = ()=>{
                const tail = (left, right)=>{
                    if (right - left <= 1) {
                        if (position === 'end') {
                            return content.slice(0, left) + dots;
                        }
                        return dots + content.slice(right, end);
                    }
                    const middle = Math.round((left + right) / 2);
                    if (position === 'end') {
                        container.innerText = content.slice(0, middle) + dots;
                    } else {
                        container.innerText = dots + content.slice(middle, end);
                    }
                    container.innerHTML += actionHTML;
                    if (container.offsetHeight > maxHeight) {
                        if (position === 'end') {
                            return tail(left, middle);
                        }
                        return tail(middle, right);
                    }
                    if (position === 'end') {
                        return tail(middle, right);
                    }
                    return tail(left, middle);
                };
                return tail(0, end);
            };
            const middleTail = (leftPart, rightPart)=>{
                if (leftPart[1] - leftPart[0] <= 1 && rightPart[1] - rightPart[0] <= 1) {
                    return content.slice(0, leftPart[0]) + dots + content.slice(rightPart[1], end);
                }
                const leftMiddle = Math.floor((leftPart[0] + leftPart[1]) / 2);
                const rightMiddle = Math.ceil((rightPart[0] + rightPart[1]) / 2);
                container.innerText = this.content.slice(0, leftMiddle) + this.dots + this.content.slice(rightMiddle, end);
                container.innerHTML += actionHTML;
                if (container.offsetHeight >= maxHeight) {
                    return middleTail([
                        leftPart[0],
                        leftMiddle
                    ], [
                        rightMiddle,
                        rightPart[1]
                    ]);
                }
                return middleTail([
                    leftMiddle,
                    leftPart[1]
                ], [
                    rightPart[0],
                    rightMiddle
                ]);
            };
            return this.position === 'middle' ? middleTail([
                0,
                middle
            ], [
                middle,
                end
            ]) : calcEllipse();
        },
        calcEllipsised () {
            const container = this.cloneContainer();
            if (!container) {
                this.needRecalculate = true;
                return;
            }
            const { paddingBottom, paddingTop, lineHeight } = container.style;
            const maxHeight = Math.ceil((Number(this.rows) + 0.5) * this.pxToNum(lineHeight) + this.pxToNum(paddingTop) + this.pxToNum(paddingBottom));
            if (maxHeight < container.offsetHeight) {
                this.hasAction = true;
                this.displayText = this.calcEllipsisText(container, maxHeight);
            } else {
                this.hasAction = false;
                this.displayText = this.content;
            }
            document.body.removeChild(container);
        },
        toggle (isExpanded = !this.expanded) {
            this.expanded = isExpanded;
        },
        onClickAction (event) {
            this.toggle();
            this.$emit('clickAction', event);
        },
        // 暴露给外部的方法
        expose () {
            return {
                toggle: this.toggle
            };
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
        ref: "root",
        class: _vm.bemClass
    }, [
        _vm._v(" " + _vm._s(_vm.expanded ? _vm.content : _vm.displayText) + " "),
        _vm.hasAction ? _c('span', {
            ref: "actionRef",
            class: _vm.actionClass,
            on: {
                "click": _vm.onClickAction
            }
        }, [
            _vm.$slots.action ? _vm._t("action", null, {
                "expanded": _vm.expanded
            }) : [
                _vm._v(_vm._s(_vm.actionText))
            ]
        ], 2) : _vm._e()
    ]);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

__vue_component__.install = function(Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

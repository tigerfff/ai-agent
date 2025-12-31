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
//
//
//
//
//
//
//
//
const [bem, name] = createNamespace('flex-layout-box');
var script = {
    name,
    inheritAttrs: false,
    props: {
        showTop: {
            type: Boolean,
            default: true
        },
        showBottom: {
            type: Boolean,
            default: true
        },
        scroll: {
            type: Boolean,
            default: false
        },
        actionStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        searchStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        midStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        footerStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        slotDefaultClass: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        rootStyle () {
            return {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0
            };
        }
    },
    methods: {
        bem
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
    var _obj;
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        ref: "root",
        class: _vm.bem(),
        style: _vm.rootStyle
    }, [
        _vm.$slots.action ? _c('div', {
            class: _vm.slotDefaultClass && _vm.bem('action'),
            style: _vm.actionStyle
        }, [
            _vm._t("action")
        ], 2) : _vm._e(),
        _vm.$slots.search ? _c('div', {
            class: _vm.slotDefaultClass && _vm.bem('search'),
            style: _vm.searchStyle
        }, [
            _vm._t("search")
        ], 2) : _vm._e(),
        _vm.$slots.default ? _c('div', {
            class: [
                _vm.bem('mid'),
                (_obj = {}, _obj[_vm.bem('mid', 'scroll')] = _vm.scroll, _obj)
            ],
            style: _vm.midStyle
        }, [
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.$slots.footer ? _c('div', {
            class: _vm.slotDefaultClass && _vm.bem('footer'),
            style: _vm.footerStyle
        }, [
            _vm._t("footer")
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

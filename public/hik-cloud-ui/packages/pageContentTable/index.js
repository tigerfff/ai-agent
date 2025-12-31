//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: "HikCloudPageContentTable",
    props: {},
    data () {
        return {
            show: false
        };
    },
    computed: {
        hasPageAction () {
            return !!this.$slots.hPageAction;
        },
        hasRightAction () {
            return !!this.$slots.rightAction;
        }
    },
    mounted () {},
    methods: {}
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
    return _c('hik-cloud-page-content', [
        _c('div', {
            staticClass: "hik-cloud-page-content-table"
        }, [
            _c('div', {
                staticClass: "hik-cloud-page-content-table__search"
            }, [
                _vm._t("hPageSearch")
            ], 2),
            _vm.hasPageAction || _vm.hasRightAction ? _c('div', {
                staticClass: "hik-cloud-page-content-table__opts"
            }, [
                _vm.hasPageAction ? _c('div', {
                    staticClass: "hik-cloud-page-content-table__opts--left"
                }, [
                    _vm._t("hPageAction")
                ], 2) : _vm._e(),
                _vm.hasRightAction ? _c('div', {
                    staticClass: "hik-cloud-page-content-table__opts--right"
                }, [
                    _vm._t("rightAction")
                ], 2) : _vm._e()
            ]) : _vm._e(),
            _c('div', {
                staticClass: "hik-cloud-page-content-table__table"
            }, [
                _vm._t("hPageTable")
            ], 2),
            _c('div', {
                staticClass: "hik-cloud-page-content-table__pagination"
            }, [
                _vm._t("pagination")
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

/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

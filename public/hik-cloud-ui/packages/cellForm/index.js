import { Form } from 'hui';

//
//
//
//
//
//
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
    name: 'HikCloudCellForm',
    extends: Form,
    props: {
        ...Form.props,
        rowItemNum: {
            type: Number,
            default: 4
        }
    },
    created () {
        this.cellFormId = 'cell-form_' + new Date().getTime();
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
    return _c('form', {
        staticClass: "el-form hik-cloud-cell-form",
        class: [
            _vm.gridLayout ? 'el-form--grid-layout' : '',
            _vm.labelPosition ? 'el-form--label-' + _vm.labelPosition : '',
            _vm.messagePosition !== 'bottom' ? 'el-form--error-' + _vm.messagePosition : '',
            _vm.textForm ? 'text-form' : '',
            {
                'el-form--inline': _vm.inline
            }
        ]
    }, [
        _vm._t("default")
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

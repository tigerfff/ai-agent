const isNull = (val)=>val === null;

const isBuffer = (val)=>{
    if (val.constructor && typeof val.constructor.isBuffer === 'function') {
        return val.constructor.isBuffer(val);
    }
    return false;
};

const isError = (val)=>{
    return val instanceof Error || typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number';
};

const isArguments = (val)=>{
    try {
        if (typeof val.length === 'number' && typeof val.callee === 'function') {
            return true;
        }
    } catch (err) {
        if (err.message.indexOf('callee') !== -1) {
            return true;
        }
    }
    return false;
};

const type = (val)=>{
    if (val === void 0) {
        return 'Undefined';
    }
    if (val === null) {
        return 'Null';
    }
    const ctorName = (val)=>{
        return val.constructor ? val.constructor.name : null;
    };
    switch(ctorName(val)){
        case 'Symbol':
            return 'Symbol';
        case 'Promise':
            return 'Promise';
        case 'Map':
            return 'Map';
        case 'Set':
            return 'Set';
        case 'WeakMap':
            return 'WeakMap';
        case 'WeakSet':
            return 'WeakSet';
    }
    if (isBuffer(val)) {
        return 'Buffer';
    }
    if (isError(val)) {
        return 'Error';
    }
    if (isArguments(val)) {
        return 'Arguments';
    }
    const type = Object.prototype.toString.call(val).slice(8, -1).replace(/\s/g, '');
    if (type === 'Number' && val % 1 === 0) {
        return 'Integer';
    }
    if (type === 'Number' && /.*\..*/.test(val)) {
        return 'Float';
    }
    return type;
};

const isVNode = (node)=>{
    return !isNull(node) && type(node) === 'Object' && hasOwnProperty.call(node, 'componentOptions');
};

//
//
//
//
//
//
var script$4 = {
    name: 'HikCloudLayout',
    provide () {
        return {
            layout: this
        };
    },
    props: {
        // 内部是水平排列还是垂直排列，默认为'水平排列'
        direction: {
            type: String,
            default: null,
            validator: function(value) {
                return [
                    'vertical',
                    'horizontal'
                ].includes(value);
            }
        }
    },
    computed: {
        isVertical () {
            if (this.direction === 'vertical') {
                return true;
            } else if (this.direction === 'horizontal') {
                return false;
            }
            return this.$slots && this.$slots.default ? this.$slots.default.some((vNode)=>{
                const tag = isVNode(vNode) && vNode.componentOptions && vNode.componentOptions.tag;
                return tag === 'hik-cloud-layout-header' || tag === 'hik-cloud-layout-footer';
            }) : false;
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

const __vue_script__$4 = script$4;
/* template */ var __vue_render__$4 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('section', {
        staticClass: "hik-cloud-layout",
        class: {
            'is-vertical': _vm.isVertical
        }
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__$4 = [];
/* style */ const __vue_inject_styles__$4 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$4 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$4,
    staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$4);

//
//
//
//
//
//
var script$3 = {
    name: 'HikCloudLayoutHeader',
    props: {
        // 高度
        height: {
            type: String,
            default: undefined
        }
    }
};

const __vue_script__$3 = script$3;
/* template */ var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-layout-header",
        style: {
            height: _vm.height
        }
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__$3 = [];
/* style */ const __vue_inject_styles__$3 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$3 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$3,
    staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$3);

//
//
//
//
//
//
var script$2 = {
    name: 'HikCloudLayoutAside',
    props: {
        // 宽度
        width: {
            type: String,
            default: undefined
        }
    }
};

const __vue_script__$2 = script$2;
/* template */ var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('aside', {
        staticClass: "hik-cloud-layout-aside",
        style: {
            width: _vm.width
        }
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__$2 = [];
/* style */ const __vue_inject_styles__$2 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$2 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$2,
    staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2);

//
//
//
//
//
//
//
//
//
//
//
//
//
var script$1 = {
    name: 'HikCloudLayoutContent',
    props: {
        // 内部是否使用 flex 布局
        flex: {
            type: Boolean,
            default: false
        },
        // 使用 flex 布局时，内部是水平排列还是垂直排列，默认为'水平排列'
        direction: {
            type: String,
            default: 'horizontal',
            validator: function(value) {
                return [
                    'vertical',
                    'horizontal'
                ].includes(value);
            }
        },
        // 是否出现滚动条
        overflow: {
            type: Boolean,
            default: false
        }
    }
};

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-layout-content",
        class: {
            'is-flex': _vm.flex,
            'is-vertical': _vm.direction === 'vertical',
            'is-overflow': _vm.overflow
        }
    }, [
        _vm._t("default")
    ], 2);
};
var __vue_staticRenderFns__$1 = [];
/* style */ const __vue_inject_styles__$1 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$1 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1);

//
//
//
//
//
//
var script = {
    name: 'HikCloudLayoutFooter',
    props: {
        // 高度
        height: {
            type: String,
            default: undefined
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-layout-footer",
        style: {
            height: _vm.height
        }
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

__vue_component__$4.install = function(Vue) {
    Vue.component(__vue_component__$4.name, __vue_component__$4);
    Vue.component(__vue_component__$3.name, __vue_component__$3);
    Vue.component(__vue_component__$2.name, __vue_component__$2);
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__$4 as Layout, __vue_component__$2 as LayoutAside, __vue_component__$1 as LayoutContent, __vue_component__ as LayoutFooter, __vue_component__$3 as LayoutHeader };

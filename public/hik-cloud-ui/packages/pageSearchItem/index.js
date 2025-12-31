//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudPageSearchItem',
    inject: [
        'HikCloudPageSearch'
    ],
    props: {
        // Form-Item 控件的 prop 参数
        prop: {
            type: String,
            default: null
        },
        // Form-Item 控件的 rules 参数
        rules: {
            type: Object,
            default: undefined
        },
        // Form-Item 控件的 label 参数
        label: {
            type: String,
            default: ''
        },
        // Form-Item 控件的 required 参数
        required: {
            type: Boolean,
            default: false
        },
        // Form-Item 控件的 requiredRight 参数
        requiredRight: {
            type: Boolean,
            default: false
        },
        // Form-Item 控件的 labelWidth 参数
        labelWidth: {
            type: String,
            default: null
        },
        // 菜单项是否默认显示（高低频过滤）
        show: {
            type: Boolean,
            default: true
        },
        // 菜单项是否隐藏，取代 v-if 和 v-show 实现隐藏功能
        hidden: {
            type: Boolean,
            default: false
        },
        // Form-Item 控件的 introduction 参数
        introduction: {
            type: String,
            default: ''
        },
        // Form-Item 控件的 introduction-icon 参数
        introductionIcon: {
            type: String,
            default: 'h-icon-info'
        }
    },
    data () {
        return {
            span: 4,
            showMore: false // 是否显示搜索项
        };
    },
    computed: {
        itemLabelWidth () {
            return this.labelWidth || this.HikCloudPageSearch.labelWidth;
        },
        // 是否是高低频搜索
        hlfSearch () {
            return this.HikCloudPageSearch.hlfSearch;
        },
        // 是否显示更多搜索项
        showMoreItem () {
            return this.HikCloudPageSearch.showMoreItem;
        },
        rowAmount () {
            return this.HikCloudPageSearch.rowAmount;
        }
    },
    watch: {
        // 监控菜单项的显示状态
        showMoreItem (showMore) {
            this.showMore = showMore;
            // 菜单项若默认隐藏，会影响搜索栏布局，需要重新计算栅格
            if (this.show !== true) this.HikCloudPageSearch.resize();
        },
        show () {
            this.HikCloudPageSearch.setHlfStatus();
        }
    },
    mounted () {
        this.HikCloudPageSearch.items.push(this);
    },
    destroyed () {
        const index = this.HikCloudPageSearch.items.indexOf(this);
        this.HikCloudPageSearch.items.splice(index, 1);
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
        staticClass: "hik-cloud-page-search-item",
        style: {
            display: _vm.hidden ? 'none' : _vm.show || _vm.showMore ? null : 'none'
        }
    }, [
        _c('el-form-item', {
            attrs: {
                "label": _vm.label,
                "prop": _vm.prop,
                "rules": _vm.rules,
                "required": _vm.required,
                "required-right": _vm.requiredRight,
                "label-width": _vm.itemLabelWidth,
                "introduction": _vm.introduction,
                "introduction-icon": _vm.introductionIcon
            }
        }, [
            _vm._t("default")
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
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

import Vue from 'vue';
import deepmerge from 'deepmerge';

var defaultLang = {
    ym: {
        ym: {
            title: '云眸组件'
        },
        base: {
            all: '全部',
            noData: '暂无数据',
            pleaseSelect: '请选择',
            search: '搜索',
            cancel: '取消',
            confirm: '确定',
            searchTipSpecialCharacter: '搜索字符串不能包含特殊字符'
        },
        http: {
            timeOut: '请求超时，请重试！',
            loginAgain: '登录超时，请重新登录！',
            networkAnomaly: '网络异常，请检查网络！'
        },
        tree: {
            searchNoData: '未查询到任何结果！'
        },
        dialog: {
            test: '测试'
        },
        syncExport: {
            export: '导出',
            ensureText: '确定',
            exportSubmitText: '导出任务已提交，请前往',
            exportDownloadText: '导出报表下载',
            exportGoText: '进行下载'
        },
        customItemConfig: {
            setDefault: '恢复默认',
            selectMinLimit: '至少选择{value}项',
            custom: '自定义',
            customColumn: '自定义列项'
        },
        customGroupItemConfig: {
            customTable: '自定义表格',
            dragTip: '长按并拖动以重新排序',
            selectedCount: '已选（{value}）'
        },
        inputTag: {
            placeholder: "请输入",
            errorMsg: '请输入 {value} 个以内关键词'
        },
        targetSelector: {
            select: '选择'
        },
        rolePersonnelSelector: {
            role: {
                title: '选择角色',
                searchPlaceholder: '搜索角色名称',
                alertContent: '所选角色将根据自己的所在的班级权限范围收到相应推送提醒',
                selectedCount: '已选择：',
                clear: '清空',
                confirm: '确 定',
                cancel: '取 消',
                confirmClear: '确认清空数据？'
            },
            user: {
                searchPlaceholder: '请输入教师名称或手机号'
            },
            main: {
                byRole: '按角色',
                byUser: '按用户'
            },
            participantDisplay: {
                select: '选择',
                selectedCount: '已选择',
                unit: '个角色/用户',
                clear: '清空',
                roleTooltip: '该角色已由管理员添加，属于该角色的人员将收到其所在班级的巡课推送',
                userTooltip: '该人员已由管理员添加'
            }
        },
        dualTableTransfer: {
            allCount: '全部({count})',
            selectedCount: '已选择({count})',
            selectedCountWithLimit: '已选择({selected}/{limit})',
            clearCurrentPage: '清除当前页',
            clearAll: '清空',
            searchPlaceholder: '请输入姓名',
            leftEmptyText: '暂无数据',
            maxLimitMessage: '已达到最大选择数量限制',
            selectAll: '全选所有',
            selectCurrentPage: '全选当前页',
            clearConfirmTitle: '确定清空全部选项吗?',
            clearPageConfirmTitle: '确定清除当前页选项吗?',
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            action: '操作',
            clearSuccess: '已清除当前页 {count} 项数据',
            selectAllSuccess: '已全选所有数据',
            selectAllLimitError: '全选所有仅支持小于{limit}条的数据',
            fetchDataError: '获取数据失败',
            selectAllError: '全选操作失败'
        },
        organizer: {
            operation: '操作',
            delete: '删除',
            selected: '已选择',
            lowerLevel: '下级',
            toBeSelected: '待选择',
            loading: '加载中'
        }
    }
};

const RE_NARGS = /(%|)\{([0-9a-zA-Z_]+)\}/g;
/**
 *  String format template
 *  - Inspired:
 *    https://github.com/Matt-Esch/string-template/index.js
 */ function Format() {
    /**
   * template
   *
   * @param {String} string
   * @param {Array} ...args
   * @return {String}
   */ function template(string, ...args) {
        if (args.length === 1 && typeof args[0] === 'object') {
            args = args[0];
        }
        if (!args || !args.hasOwnProperty) {
            args = {};
        }
        return string.replace(RE_NARGS, (match, prefix, i, index)=>{
            let result;
            if (string[index - 1] === '{' && string[index + match.length] === '}') {
                return i;
            } else {
                result = Object.prototype.hasOwnProperty.call(args, i) ? args[i] : null;
                if (result === null || result === undefined) {
                    return '';
                }
                return result;
            }
        });
    }
    return template;
}

const format = Format();
let lang = defaultLang;
let merged = false;
let i18nHandler = function() {
    const vuei18n = Object.getPrototypeOf(this || Vue).$t;
    if (typeof vuei18n === 'function' && !!Vue.locale) {
        if (!merged) {
            merged = true;
            Vue.locale(Vue.config.lang, deepmerge(lang, Vue.locale(Vue.config.lang) || {}, {
                clone: true
            }));
        }
        return vuei18n.apply(this, arguments);
    }
};
const t = function(path, options) {
    let value = i18nHandler.apply(this, arguments);
    if (value !== null && value !== undefined) return value;
    const array = path.split('.');
    let current = lang;
    for(let i = 0, j = array.length; i < j; i++){
        const property = array[i];
        value = current[property];
        if (i === j - 1) return format(value, options);
        if (!value) return '';
        current = value;
    }
    return '';
};

var Locale = {
    methods: {
        t (...args) {
            return t.apply(this, args);
        }
    }
};

/**
 * @param {string} block - 块名，如 'button'
 * @returns {Object} bem 工具集
 */ function createBEM(block) {
    function BEM(element, modifier) {
        if (!element && !modifier) return block;
        const elem = element ? `${block}__${element}` : '';
        const mod = modifier ? `${elem || block}--${modifier}` : '';
        return mod || elem;
    }
    BEM.b = ()=>block;
    BEM.e = (element)=>element ? `${block}__${element}` : '';
    BEM.m = (modifier)=>modifier ? `${block}--${modifier}` : '';
    BEM.em = (element, modifier)=>element && modifier ? `${block}__${element}--${modifier}` : BEM.e(element);
    BEM.classes = (...args)=>{
        return args.filter(Boolean).join(' ');
    };
    return BEM;
}

//
//
//
//
//
//
//
//
var script = {
    name: 'HikCloudYm',
    mixins: [
        Locale
    ],
    computed: {
        bem () {
            const b = createBEM('hik-cloud-ym');
            return {
                b: b.b,
                e: b.e,
                m: b.m,
                em: b.em,
                classes: b.classes
            };
        }
    },
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
    return _c('div', {
        class: _vm.bem.b()
    }, [
        _c('h1', {
            class: _vm.bem.e('title')
        }, [
            _vm._t("default", function() {
                return [
                    _c('span', {
                        class: _vm.bem.m('title')
                    }, [
                        _vm._v(_vm._s(_vm.t('ym.ym.title')))
                    ])
                ];
            })
        ], 2)
    ]);
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

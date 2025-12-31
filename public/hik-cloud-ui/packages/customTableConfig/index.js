import draggable from 'vuedraggable';
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
var script$1 = {
    name: 'CustomConfig',
    components: {
        draggable
    },
    mixins: [
        Locale
    ],
    props: {
        label: {
            type: String,
            default: t('ym.customItemConfig.custom')
        },
        popPlacement: {
            type: String,
            default: 'bottom-end'
        },
        popTitle: {
            type: String,
            default: ''
        },
        // [{ label: '', value: 1, checked: true }]
        defaultOptions: {
            type: Array,
            require: true,
            default: undefined
        },
        currentOptions: {
            type: Array,
            default: undefined
        },
        minLimit: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            customConfigPopVisible: false,
            localOptions: [],
            dragOptions: {
                filter: '.dragDisabled',
                move: this.handleMove
            }
        };
    },
    computed: {
        effectOptions () {
            return this.currentOptions || this.defaultOptions;
        }
    },
    methods: {
        popShow () {
            let ops = JSON.parse(JSON.stringify(this.effectOptions));
            ops.forEach((op)=>{
                if (!Object.prototype.hasOwnProperty.call(op, 'checked')) {
                    op.checked = false;
                }
                //checkedDisabled 默认选中 不可取消勾选 dragDisabled 不可拖动
                if (Object.prototype.hasOwnProperty.call(op, 'checkedDisabled') && op.checkedDisabled) {
                    op.checked = true;
                }
            });
            this.localOptions = ops;
            this.$emit('open');
        },
        ensure () {
            if (this.minLimit > 0) {
                let checkedLength = this.localOptions.filter((e)=>e.checked).length;
                if (this.minLimit > checkedLength) {
                    this.$message.error(this.t('ym.customItemConfig.selectMinLimit', {
                        value: this.minLimit
                    }));
                    return;
                }
            }
            this.$emit('changed', this.localOptions);
            this.cancel();
        },
        resetOptions () {
            this.$emit('changed', this.defaultOptions);
            this.cancel();
        },
        cancel () {
            this.$emit('close');
            this.$refs.customConfigPop.doClose();
        },
        handleClick (option) {
            if (option.checkedDisabled) {
                return false;
            }
            option.checked = !option.checked;
        },
        handleMove (e) {
            const relatedDisabled = e.relatedContext.element.dragDisabled;
            if (relatedDisabled) {
                return false;
            }
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

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', [
        _c('el-popover', {
            ref: "customConfigPop",
            attrs: {
                "popper-class": "hik-cloud-table-config-ppover",
                "placement": _vm.popPlacement
            },
            on: {
                "show": _vm.popShow
            }
        }, [
            _c('div', {
                staticClass: "container"
            }, [
                _vm.popTitle ? _c('div', {
                    staticClass: "header"
                }, [
                    _vm._v(" " + _vm._s(_vm.popTitle) + " ")
                ]) : _vm._e(),
                _c('div', {
                    staticClass: "content"
                }, [
                    _c('el-scrollbar', {
                        attrs: {
                            "wrapStyle": ";height:100%;padding: 4px 0;max-height:290px;"
                        }
                    }, [
                        _c('draggable', _vm._b({
                            attrs: {
                                "group": "customConfig",
                                "animation": "300"
                            },
                            model: {
                                value: _vm.localOptions,
                                callback: function($$v) {
                                    _vm.localOptions = $$v;
                                },
                                expression: "localOptions"
                            }
                        }, 'draggable', _vm.dragOptions, false), _vm._l(_vm.localOptions, function(option) {
                            return _c('div', {
                                key: option.label,
                                staticClass: "item",
                                class: option.dragDisabled ? 'dragDisabled' : 'active',
                                on: {
                                    "click": function(option) {
                                        _vm.handleClick(option);
                                    }
                                }
                            }, [
                                _c('div', {
                                    on: {
                                        "click": function($event) {
                                            $event.stopPropagation();
                                        }
                                    }
                                }, [
                                    _c('el-checkbox', {
                                        attrs: {
                                            "disabled": !!option.checkedDisabled
                                        },
                                        model: {
                                            value: option.checked,
                                            callback: function($$v) {
                                                _vm.$set(option, "checked", $$v);
                                            },
                                            expression: "option.checked"
                                        }
                                    })
                                ], 1),
                                _c('div', {
                                    staticClass: "item-label"
                                }, [
                                    _vm._v(" " + _vm._s(option.label) + " ")
                                ]),
                                _c('i', {
                                    staticClass: "icon iconfont iconic_common_move2x sp"
                                })
                            ]);
                        }), 0)
                    ], 1)
                ], 1),
                _c('div', {
                    staticClass: "footer"
                }, [
                    _c('div', {
                        staticClass: "default",
                        on: {
                            "click": _vm.resetOptions
                        }
                    }, [
                        _vm._v(" " + _vm._s(_vm.t('ym.customItemConfig.setDefault')) + " ")
                    ]),
                    _c('div', [
                        _c('el-button', {
                            on: {
                                "click": _vm.cancel
                            }
                        }, [
                            _vm._v(" " + _vm._s(_vm.t('ym.base.cancel')) + " ")
                        ]),
                        _c('el-button', {
                            attrs: {
                                "type": "primary"
                            },
                            nativeOn: {
                                "mousedown": function($event) {
                                    return _vm.ensure.apply(null, arguments);
                                }
                            }
                        }, [
                            _vm._v(" " + _vm._s(_vm.t('ym.base.confirm')) + " ")
                        ])
                    ], 1)
                ])
            ])
        ]),
        _c('el-button', {
            directives: [
                {
                    name: "popover",
                    rawName: "v-popover:customConfigPop",
                    arg: "customConfigPop"
                }
            ],
            staticStyle: {
                "border": "1px solid rgba(0, 0, 0, 0.08)"
            },
            attrs: {
                "icon": "h-icon-control_pole"
            }
        }, [
            _vm._v(" " + _vm._s(_vm.label) + " ")
        ])
    ], 1);
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
//
//
//
//
//
//
var script = {
    name: 'HikCloudCustomTableConfig',
    components: {
        customConfig: __vue_component__$1
    },
    mixins: [
        Locale
    ],
    inheritAttrs: false,
    props: {
        projectName: {
            type: String,
            default: 'Chain'
        },
        uniTableKey: {
            type: String,
            require: true,
            default: undefined
        },
        defaultOptions: {
            type: Array,
            require: true,
            default: undefined
        }
    },
    data () {
        return {
            currentTableConfig: undefined
        };
    },
    computed: {
        projectLSKey () {
            return `${this.projectName}_CustomTableColumnConfig`;
        },
        filteredListeners () {
            const { ...otherListeners } = this.$listeners;
            delete otherListeners.changed;
            return otherListeners;
        }
    },
    mounted () {
        this.loadCurrentTableConfig();
        this.$emit('inited', (this.currentTableConfig || this.defaultOptions).flatMap((op)=>{
            if (!op.checked) return [];
            return {
                ...op
            };
        }));
    },
    methods: {
        // 以后如果有表格切换的场景，可以监听uniTableKey调用该方法
        loadCurrentTableConfig () {
            let allTableConfigStr = localStorage.getItem(this.projectLSKey);
            if (!allTableConfigStr) {
                this.currentTableConfig = undefined;
                return;
            }
            let allTableConfig = JSON.parse(allTableConfigStr);
            this.currentTableConfig = this.mergeOptions(this.defaultOptions, allTableConfig[this.uniTableKey]);
        },
        changed (options) {
            this.currentTableConfig = options;
            const dealData = (data)=>({
                    id: data.id,
                    checked: data.checked
                });
            this.$emit('changed', options.flatMap((op)=>{
                if (!op.checked) return [];
                return dealData(op);
            }));
            let localObj = {};
            let allTableConfigStr = localStorage.getItem(this.projectLSKey);
            if (allTableConfigStr) {
                localObj = JSON.parse(allTableConfigStr);
            }
            localObj[this.uniTableKey] = options.map((op)=>dealData(op));
            localStorage.setItem(this.projectLSKey, JSON.stringify(localObj));
        },
        reset () {
            this.loadCurrentTableConfig();
            this.$emit('inited', (this.currentTableConfig || this.defaultOptions).flatMap((op)=>{
                if (!op.checked) return [];
                return {
                    ...op
                };
            }));
        },
        mergeOptions (defaultOptions, memoryOptions) {
            if (!memoryOptions || memoryOptions.length == 0) return defaultOptions;
            let map = defaultOptions.reduce((m, op)=>{
                m[op.id] = op;
                return m;
            }, {});
            let options = memoryOptions.filter((op)=>!!map[op.id]);
            options.forEach((op)=>{
                // op.label = map[op.id].label
                Object.assign(op, map[op.id], {
                    checked: op.checked
                });
                delete map[op.id];
            });
            options.push(...Object.values(map));
            return options;
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('customConfig', _vm._g(_vm._b({
        ref: "customConfig",
        attrs: {
            "popTitle": _vm.t('ym.customItemConfig.customColumn'),
            "defaultOptions": _vm.defaultOptions,
            "currentOptions": _vm.currentTableConfig
        },
        on: {
            "changed": _vm.changed
        }
    }, 'customConfig', _vm.$attrs, false), _vm.filteredListeners));
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

// console.log('drawer')
/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

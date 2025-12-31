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
    name: "CustomGroupConfig",
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
        dialogTitle: {
            type: String,
            default: t('ym.customGroupItemConfig.customTable')
        },
        // [{ title: '', options: [{ label: '', id: 1, checked: true }] }]
        defaultOptions: {
            type: Array,
            require: true,
            default: undefined
        },
        // 右侧一维的数据
        currentOptions: {
            type: Array,
            default: undefined
        },
        minLimit: {
            type: Number,
            default: 0
        },
        hideCode: {
            type: Array,
            default: ()=>[]
        },
        // { open: '', confirm: '', sort: '' }
        lcMap: {
            type: Object,
            default: ()=>{}
        },
        beforeOpen: {
            type: Function,
            default: undefined
        }
    },
    data () {
        return {
            customConfigDialogVisible: false,
            localOptions: [],
            localCurrentOptions: [],
            dragOptions: {
                filter: ".dragDisabled",
                move: this.handleMove
            }
        };
    },
    computed: {
        optionsMap () {
            return this.localOptions.reduce((map, group)=>{
                group.options.forEach((op)=>{
                    map[op.id] = op;
                });
                return map;
            }, {});
        }
    },
    watch: {
        customConfigDialogVisible (nv) {
            if (nv) this.dialogShow();
            this.$emit(nv ? 'open' : 'close');
        },
        localCurrentOptions () {
            this.localOptions.forEach((group)=>{
                let totalLen = group.options.length;
                let checkedLen = group.options.filter((op)=>op.checked).length;
                this.$set(group, "checked", totalLen == checkedLen);
                this.$set(group, "indeterminate", totalLen != checkedLen && checkedLen > 0);
            });
        }
    },
    methods: {
        cloneDeep (obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        eventTrigger (type) {
            if (this.lcMap && this.lcMap[type]) {
                this.sendClickMessage({
                    lc: this.lcMap[type]
                });
            }
        },
        open () {
            this.eventTrigger("open");
            if (this.beforeOpen && typeof this.beforeOpen === 'function') {
                this.beforeOpen(this.openDialog);
            } else {
                this.openDialog();
            }
        },
        openDialog () {
            this.customConfigDialogVisible = true;
        },
        groupClicked (group) {
            group.indeterminate = false;
            if (group.checked) {
                let changeOptions = group.options.filter((op)=>!op.checked);
                changeOptions.forEach((op)=>op.checked = true);
                this.localCurrentOptions.push(...changeOptions);
            } else {
                let changeOptions = group.options.filter((op)=>op.checked);
                let map = {};
                changeOptions.forEach((op)=>{
                    op.checked = false;
                    map[op.id] = true;
                });
                this.localCurrentOptions = this.localCurrentOptions.filter((op)=>!map[op.id]);
            }
        },
        dialogShow () {
            let ops = this.cloneDeep(this.defaultOptions);
            let cOps = this.currentOptions ? this.cloneDeep(this.currentOptions) : [];
            if (cOps.length) {
                // 有设置的选中状态，以设置的为准
                let ids = cOps.reduce((map, op)=>{
                    map[op.id] = 1;
                    return map;
                }, {});
                ops.forEach((group)=>{
                    group.options.forEach((op)=>{
                        op.checked = !!ids[op.id];
                    });
                });
            } else {
                // 没有设置的选中状态，以默认的为准
                cOps = this.genDefaultOptions(ops);
            }
            this.localOptions = ops;
            this.localCurrentOptions = cOps;
        },
        genDefaultOptions (groupOptions) {
            let cOps = [];
            groupOptions.forEach((group)=>{
                group.options.forEach((op)=>{
                    if (op.checked) {
                        cOps.push({
                            ...op
                        });
                    }
                });
            });
            return cOps;
        },
        checkChange (option) {
            if (option.checked) {
                this.localCurrentOptions.push(option);
            } else {
                this.localCurrentOptions = this.localCurrentOptions.filter((op)=>op.id != option.id);
            }
        },
        removeOption (option) {
            let newOp = this.optionsMap[option.id];
            newOp.checked = false;
            this.checkChange(newOp);
        },
        ensure () {
            //点击才能触发
            if (this.minLimit > 0 && this.minLimit > this.localCurrentOptions.length) {
                this.$message.error(this.t('ym.customItemConfig.selectMinLimit', {
                    value: this.minLimit
                }));
                return;
            }
            this.eventTrigger("confirm");
            this.$emit("changed", this.dealDataByCheckedOptions(this.localCurrentOptions));
            this.customConfigDialogVisible = false;
        },
        resetOptions () {
            this.localOptions = this.cloneDeep(this.defaultOptions);
            this.localCurrentOptions = this.genDefaultOptions(this.defaultOptions);
        // this.$emit('changed', this.dealDataByCheckedOptions(this.genDefaultOptions(this.defaultOptions)))
        // this.customConfigDialogVisible = false
        },
        dealDataByCheckedOptions (checkedOptions) {
            let tempOptionsMap = this.cloneDeep(this.optionsMap);
            checkedOptions.forEach((op)=>{
                delete tempOptionsMap[op.id];
            });
            const _arr = Object.values(tempOptionsMap);
            _arr.forEach((option)=>option.checked = false);
            return [
                ...checkedOptions,
                ..._arr
            ];
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
        _c('el-button', {
            staticStyle: {
                "border": "1px solid rgba(0, 0, 0, 0.08)"
            },
            attrs: {
                "icon": "h-icon-control_pole"
            },
            on: {
                "click": _vm.open
            }
        }, [
            _vm._v(" " + _vm._s(_vm.label) + " ")
        ]),
        _c('el-dialog', {
            attrs: {
                "visible": _vm.customConfigDialogVisible,
                "area": [
                    880,
                    540
                ],
                "custom-class": "hik-cloud-group-table-config-dialog"
            },
            on: {
                "update:visible": function($event) {
                    _vm.customConfigDialogVisible = $event;
                }
            }
        }, [
            _c('div', {
                staticClass: "title",
                attrs: {
                    "slot": "title"
                },
                slot: "title"
            }, [
                _vm._v(" " + _vm._s(_vm.dialogTitle) + " ")
            ]),
            _c('span', {
                staticClass: "footer",
                attrs: {
                    "slot": "footer"
                },
                slot: "footer"
            }, [
                _c('el-button', {
                    staticStyle: {
                        "background": "white"
                    },
                    attrs: {
                        "icon": "h-icon-reset"
                    },
                    on: {
                        "click": _vm.resetOptions
                    }
                }, [
                    _vm._v(" " + _vm._s(_vm.t('ym.customItemConfig.setDefault')) + " ")
                ]),
                _c('div', [
                    _c('el-button', {
                        attrs: {
                            "type": "primary"
                        },
                        on: {
                            "click": _vm.ensure
                        }
                    }, [
                        _vm._v(" " + _vm._s(_vm.t('ym.base.confirm')) + " ")
                    ]),
                    _c('el-button', {
                        on: {
                            "click": function($event) {
                                _vm.customConfigDialogVisible = false;
                            }
                        }
                    }, [
                        _vm._v(" " + _vm._s(_vm.t('ym.base.cancel')) + " ")
                    ])
                ], 1)
            ], 1),
            _c('div', {
                staticClass: "main flex-row"
            }, [
                _c('div', {
                    staticClass: "op_area"
                }, [
                    _c('el-scrollbar', {
                        attrs: {
                            "wrapStyle": ";height:100%;overflow-x:hidden;"
                        }
                    }, _vm._l(_vm.localOptions, function(group) {
                        return _c('div', {
                            directives: [
                                {
                                    name: "show",
                                    rawName: "v-show",
                                    value: !(group.options.map(function(itme) {
                                        return itme.id;
                                    }).toString() == _vm.hideCode.toString()),
                                    expression: "!(group.options.map((itme) => itme.id).toString() == hideCode.toString())"
                                }
                            ],
                            key: group.title,
                            staticClass: "op_block"
                        }, [
                            _c('div', {
                                staticClass: "group"
                            }, [
                                _c('el-checkbox', {
                                    attrs: {
                                        "indeterminate": group.indeterminate
                                    },
                                    on: {
                                        "change": function($event) {
                                            return _vm.groupClicked(group);
                                        }
                                    },
                                    model: {
                                        value: group.checked,
                                        callback: function($$v) {
                                            _vm.$set(group, "checked", $$v);
                                        },
                                        expression: "group.checked"
                                    }
                                }, [
                                    _vm._v(" " + _vm._s(group.title) + " ")
                                ])
                            ], 1),
                            _c('div', {
                                staticClass: "options"
                            }, _vm._l(group.options, function(op) {
                                return _c('el-checkbox', {
                                    directives: [
                                        {
                                            name: "show",
                                            rawName: "v-show",
                                            value: !(op.id && _vm.hideCode.includes(op.id)),
                                            expression: "!(op.id && hideCode.includes(op.id))"
                                        }
                                    ],
                                    key: op.id,
                                    staticClass: "option",
                                    attrs: {
                                        "disabled": !!op.checkedDisabled
                                    },
                                    on: {
                                        "change": function($event) {
                                            return _vm.checkChange(op);
                                        }
                                    },
                                    model: {
                                        value: op.checked,
                                        callback: function($$v) {
                                            _vm.$set(op, "checked", $$v);
                                        },
                                        expression: "op.checked"
                                    }
                                }, [
                                    _vm._v(" " + _vm._s(op.label) + " ")
                                ]);
                            }), 1)
                        ]);
                    }), 0)
                ], 1),
                _c('div', {
                    staticClass: "op_checked"
                }, [
                    _c('div', {
                        staticClass: "checked-title"
                    }, [
                        _vm._v(" " + _vm._s(_vm.t('ym.customGroupItemConfig.selectedCount', {
                            value: _vm.localCurrentOptions.length
                        })) + " ")
                    ]),
                    _c('div', {
                        staticClass: "checked-tip"
                    }, [
                        _vm._v(" " + _vm._s(_vm.t('ym.customGroupItemConfig.dragTip')) + " ")
                    ]),
                    _c('el-scrollbar', {
                        staticStyle: {
                            "flex": "1"
                        },
                        attrs: {
                            "wrapStyle": ";height:100%;overflow-x:hidden;"
                        }
                    }, [
                        _c('draggable', _vm._b({
                            attrs: {
                                "group": "customConfig",
                                "animation": "300"
                            },
                            on: {
                                "sort": function($event) {
                                    return _vm.eventTrigger('sort');
                                }
                            },
                            model: {
                                value: _vm.localCurrentOptions,
                                callback: function($$v) {
                                    _vm.localCurrentOptions = $$v;
                                },
                                expression: "localCurrentOptions"
                            }
                        }, 'draggable', _vm.dragOptions, false), _vm._l(_vm.localCurrentOptions, function(option) {
                            return _c('div', {
                                directives: [
                                    {
                                        name: "show",
                                        rawName: "v-show",
                                        value: !(option.id && _vm.hideCode.includes(option.id)),
                                        expression: "!(option.id && hideCode.includes(option.id))"
                                    }
                                ],
                                key: option.label,
                                staticClass: "item",
                                class: option.dragDisabled ? 'dragDisabled' : 'active',
                                on: {
                                    "click": function(option) {
                                        return _vm.handleClick(option);
                                    }
                                }
                            }, [
                                _c('i', {
                                    staticClass: "icon iconfont iconic_common_move2x sp"
                                }),
                                _c('div', {
                                    staticClass: "item-label"
                                }, [
                                    _vm._v(" " + _vm._s(option.label) + " ")
                                ]),
                                _c('i', {
                                    staticClass: "h-icon-close_sm close",
                                    on: {
                                        "click": function($event) {
                                            return _vm.removeOption(option);
                                        }
                                    }
                                })
                            ]);
                        }), 0)
                    ], 1)
                ], 1)
            ])
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
    name: 'HikCloudCustomGroupTableConfig',
    components: {
        customGroupConfig: __vue_component__$1
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
    watch: {
        uniTableKey: {
            handler: function() {
                this.loadCurrentTableConfig();
                this.$emit('inited', this.currentTableConfig.map((op)=>({
                        ...op
                    })));
            }
        },
        defaultOptions: {
            handler: function() {
                this.loadCurrentTableConfig();
            },
            deep: true
        }
    },
    mounted () {
        this.loadCurrentTableConfig();
        this.$emit('inited', this.currentTableConfig.map((op)=>({
                ...op
            })));
    },
    methods: {
        // 以后如果有表格切换的场景，可以监听uniTableKey调用该方法
        loadCurrentTableConfig () {
            let allTableConfigStr = localStorage.getItem(this.projectLSKey);
            let memoryOptions;
            if (allTableConfigStr) {
                let allTableConfig = JSON.parse(allTableConfigStr);
                memoryOptions = allTableConfig[this.uniTableKey];
            }
            this.currentTableConfig = this.mergeGroupOptions(this.defaultOptions, memoryOptions);
        },
        changed (options) {
            this.currentTableConfig = options.filter((op)=>op.checked);
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
        mergeGroupOptions (defaultOptions, memoryOptions) {
            if (!defaultOptions) return [];
            if (!memoryOptions || memoryOptions.length == 0) {
                return defaultOptions.reduce((arr, group)=>{
                    arr.push(...group.options.filter((op)=>op.checked).map((op)=>({
                            ...op
                        })));
                    return arr;
                }, []);
            }
            let optionMap = defaultOptions.reduce((map, group)=>{
                group.options.forEach((op)=>{
                    map[op.id] = op;
                });
                return map;
            }, {});
            let options = memoryOptions.filter((op)=>!!optionMap[op.id] && op.checked);
            options.forEach((op)=>{
                op.label = optionMap[op.id].label;
            });
            return options;
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('customGroupConfig', _vm._g(_vm._b({
        ref: "customConfig",
        attrs: {
            "popTitle": _vm.t('ym.customItemConfig.customColumn'),
            "defaultOptions": _vm.defaultOptions,
            "currentOptions": _vm.currentTableConfig
        },
        on: {
            "changed": _vm.changed
        }
    }, 'customGroupConfig', _vm.$attrs, false), _vm.filteredListeners));
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

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
var script$3 = {
    mixins: [
        Locale
    ],
    props: {
        participants: {
            type: Array,
            default: ()=>[]
        },
        showSelectButton: {
            type: Boolean,
            default: true
        },
        showClearButton: {
            type: Boolean,
            default: true
        },
        showTagClose: {
            type: Boolean,
            default: true
        },
        maxTagLength: {
            type: Number,
            default: 6
        },
        maxTagWidth: {
            type: String,
            default: '310px'
        },
        containerClickable: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            default: 'light' // 'light' 或 'dark' 或 'gray'
        }
    },
    computed: {
        containerClass () {
            return {
                'hik-cloud-push-target-selector__container': true,
                'hik-cloud-push-target-selector__light-theme': this.theme === 'light',
                'hik-cloud-push-target-selector__dark-theme': this.theme === 'dark',
                'hik-cloud-push-target-selector__gray-theme': this.theme === 'gray'
            };
        }
    },
    methods: {
        onSelectClick () {
            this.$emit('select-click');
        },
        onClear () {
            this.$emit('clear');
        },
        onCloseTag (e, tag) {
            this.$emit('close-tag', e, tag);
        },
        formatTagName (name) {
            if (name && name.length > this.maxTagLength) {
                return name.substring(0, this.maxTagLength) + "...";
            }
            return name;
        },
        getTooltipContent (tag) {
            // 支持外部传入的getTooltipContent函数
            if (this.$parent && typeof this.$parent.getTooltipContent === 'function') {
                return this.$parent.getTooltipContent(tag);
            }
            // 默认提示内容
            if (tag.pushObjType === 0) {
                return t('ym.rolePersonnelSelector.participantDisplay.roleTooltip');
            } else if (tag.pushObjType === 1) {
                return t('ym.rolePersonnelSelector.participantDisplay.userTooltip');
            }
            return '';
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
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    return script;
}

const __vue_script__$3 = script$3;
/* template */ var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        class: _vm.containerClass
    }, [
        _vm.showSelectButton ? _c('el-button', {
            attrs: {
                "type": "default"
            },
            on: {
                "click": _vm.onSelectClick
            }
        }, [
            _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.participantDisplay.select')))
        ]) : _vm._e(),
        _c('div', {
            staticClass: "participants_header"
        }, [
            _c('span', [
                _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.participantDisplay.selectedCount'))),
                _c('b', [
                    _vm._v(_vm._s(_vm.participants.length))
                ]),
                _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.participantDisplay.unit')))
            ]),
            _vm.showClearButton ? _c('el-button', {
                staticClass: "clear",
                attrs: {
                    "icon": "h-icon-delete",
                    "type": "default"
                },
                on: {
                    "click": function($event) {
                        $event.stopPropagation();
                        return _vm.onClear.apply(null, arguments);
                    }
                }
            }, [
                _vm._v(" " + _vm._s(_vm.t('ym.rolePersonnelSelector.participantDisplay.clear')) + " ")
            ]) : _vm._e()
        ], 1),
        _c('div', {
            staticClass: "participants_conatiner",
            class: {
                'no-click': !_vm.containerClickable
            }
        }, [
            _c('el-scrollbar', {
                attrs: {
                    "wrap-class": "participants_content"
                }
            }, _vm._l(_vm.participants, function(tag) {
                return _c('el-tag', {
                    key: tag.pushObjId,
                    staticClass: "teacher_tag",
                    class: {
                        'can-hover': !tag.isInitial,
                        'role-tag': tag.pushObjType === 0,
                        'user-tag': tag.pushObjType === 1
                    },
                    attrs: {
                        "title": tag.pushObjName,
                        "maxWidth": _vm.maxTagWidth,
                        "closable": _vm.showTagClose && !tag.isInitial
                    },
                    on: {
                        "close": function(e) {
                            return _vm.onCloseTag(e, tag);
                        },
                        "click": function($event) {
                            $event.stopPropagation();
                        }
                    }
                }, [
                    tag.isInitial ? _c('el-tooltip', {
                        attrs: {
                            "content": _vm.getTooltipContent(tag),
                            "placement": "top-start"
                        }
                    }, [
                        _c('span', [
                            tag.pushObjType === 0 ? [
                                _c('span', {
                                    class: {
                                        'role-prefix': tag.pushObjType === 0,
                                        'user-prefix': tag.pushObjType === 1
                                    }
                                }, [
                                    _vm._v("角色 ")
                                ]),
                                _c('span', {
                                    staticClass: "participant-name"
                                }, [
                                    _vm._v(_vm._s(_vm.formatTagName(tag.pushObjName)))
                                ])
                            ] : _vm._e(),
                            tag.pushObjType === 1 ? [
                                _c('span', {
                                    class: {
                                        'role-prefix': tag.pushObjType === 1,
                                        'user-prefix': tag.pushObjType === 1
                                    }
                                }, [
                                    _vm._v("用户 ")
                                ]),
                                _c('span', {
                                    staticClass: "participant-name"
                                }, [
                                    _vm._v(_vm._s(_vm.formatTagName(tag.pushObjName)))
                                ])
                            ] : _vm._e()
                        ], 2)
                    ]) : _c('span', [
                        tag.pushObjType === 0 ? [
                            _c('span', {
                                class: {
                                    'role-prefix': tag.pushObjType === 0,
                                    'user-prefix': tag.pushObjType === 1
                                }
                            }, [
                                _vm._v("角色 ")
                            ]),
                            _c('span', {
                                staticClass: "participant-name"
                            }, [
                                _vm._v(_vm._s(_vm.formatTagName(tag.pushObjName)))
                            ])
                        ] : _vm._e(),
                        tag.pushObjType === 1 ? [
                            _c('span', {
                                class: {
                                    'role-prefix': tag.pushObjType === 1,
                                    'user-prefix': tag.pushObjType === 1
                                }
                            }, [
                                _vm._v("用户 ")
                            ]),
                            _c('span', {
                                staticClass: "participant-name"
                            }, [
                                _vm._v(_vm._s(_vm.formatTagName(tag.pushObjName)))
                            ])
                        ] : _vm._e()
                    ], 2)
                ], 1);
            }), 1)
        ], 1)
    ], 1);
};
var __vue_staticRenderFns__$3 = [];
/* style */ const __vue_inject_styles__$3 = undefined;
/* scoped */ const __vue_scope_id__$3 = "data-v-5bc24a0d";
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$3 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$3,
    staticRenderFns: __vue_staticRenderFns__$3
}, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3);

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
var script$2 = {
    name: 'ByRole',
    mixins: [
        Locale
    ],
    components: {
        ParticipantDisplay: __vue_component__$3
    },
    props: {
        form: {
            type: Object,
            default () {
                return {
                    [this.formKey || 'pushObjList']: [],
                    [this.formTypeKey || 'pushObjType']: 0
                };
            }
        },
        formKey: {
            type: String,
            default: 'pushObjList'
        },
        formTypeKey: {
            type: String,
            default: 'pushObjType'
        },
        selectorLabel: {
            type: String,
            default: 'pushObjName'
        },
        selectorValue: {
            type: String,
            default: 'pushObjId'
        },
        title: {
            type: String,
            default: ()=>t('ym.rolePersonnelSelector.role.title')
        },
        area: {
            type: Array,
            default: ()=>[
                    640,
                    460
                ]
        },
        theme: {
            type: String,
            default: 'light'
        },
        maxTagLength: {
            type: Number,
            default: 6
        },
        showAlert: {
            type: Boolean,
            default: true
        },
        alertContent: {
            type: String,
            default: ()=>t('ym.rolePersonnelSelector.role.alertContent')
        },
        searchPlaceholder: {
            type: String,
            default: ()=>t('ym.rolePersonnelSelector.role.searchPlaceholder')
        },
        roleList: {
            type: Array,
            default: ()=>[]
        },
        roleApiUrl: {
            type: String,
            default: '/api/v1/minerva/basic/roles/actions/listAllRoles'
        }
    },
    data () {
        return {
            dialogVisible: false,
            filterText: '',
            allRoles: [],
            selectedRoles: []
        };
    },
    computed: {
        filteredRoles () {
            const roles = this.roleList.length > 0 ? this.roleList : this.allRoles;
            if (!this.filterText) return roles;
            return roles.filter((role)=>role[this.selectorLabel].toLowerCase().includes(this.filterText.toLowerCase()));
        }
    },
    mounted () {
        this.$nextTick(()=>{
            if (this.roleList.length === 0) {
                this.getDefaultRoles();
            } else {
                this.allRoles = this.roleList;
            }
        });
    },
    watch: {
        form: {
            handler (newVal) {
                if (newVal && newVal[this.formKey]) {
                    this.selectedRoles = newVal[this.formKey].filter((item)=>item[this.formTypeKey] === 0);
                }
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async getDefaultRoles () {
            try {
                let { code, data } = await this._http({
                    url: this.roleApiUrl,
                    method: 'get'
                });
                if (code === 0 && data) {
                    this.allRoles = data.map((role)=>{
                        return {
                            [this.formTypeKey]: 0,
                            [this.selectorValue]: role.roleId,
                            [this.selectorLabel]: role.roleName
                        };
                    });
                }
            } catch (error) {}
        },
        async onCloseTag (e, teach) {
            try {
                this.removeRole(teach);
                if (this.form && this.form[this.formKey] && Array.isArray(this.form[this.formKey])) {
                    const formIndex = this.form[this.formKey].findIndex((item)=>item[this.selectorValue] === teach[this.selectorValue]);
                    if (formIndex > -1) {
                        this.form[this.formKey].splice(formIndex, 1);
                    }
                }
            } catch (ex) {}
        },
        OpenSelectDialog () {
            this.dialogVisible = true;
        },
        toggleRoleSelection (role) {
            const index = this.selectedRoles.findIndex((r)=>r[this.selectorValue] === role[this.selectorValue]);
            if (index === -1) {
                this.selectedRoles.push(role);
            } else {
                this.selectedRoles.splice(index, 1);
            }
        },
        removeRole (role) {
            this.selectedRoles = this.selectedRoles.filter((r)=>r[this.selectorValue] !== role[this.selectorValue]);
        },
        clearAll () {
            this.$confirm(t('ym.rolePersonnelSelector.role.confirmClear'), {
                confirmButtonText: t('ym.base.confirm'),
                cancelButtonText: t('ym.base.cancel'),
                type: 'question'
            }).then(()=>{
                this.selectedRoles = [];
                if (this.form) {
                    this.$set(this.form, this.formKey, this.form[this.formKey].filter((item)=>item.isInitial));
                }
            }).catch(()=>{});
        },
        beforeOpen () {
            this.filterText = '';
            this.selectedRoles = (this.form[this.formKey] || []).filter((item)=>item[this.formTypeKey] === 0);
        },
        handleClose () {
            this.dialogVisible = false;
        },
        onOk () {
            const otherItems = (this.form[this.formKey] || []).filter((item)=>item[this.formTypeKey] !== 0);
            const roleItems = this.selectedRoles.map((role)=>({
                    [this.formTypeKey]: 0,
                    [this.selectorValue]: role[this.selectorValue],
                    [this.selectorLabel]: role[this.selectorLabel]
                }));
            this.$set(this.form, this.formKey, [
                ...otherItems,
                ...roleItems
            ]);
            this.$emit('check-select');
            this.dialogVisible = false;
        },
        onCancel () {
            this.dialogVisible = false;
        }
    }
};

const __vue_script__$2 = script$2;
/* template */ var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-by-role"
    }, [
        _c('participant-display', {
            attrs: {
                "participants": _vm.form[_vm.formKey] || [],
                "show-select-button": true,
                "show-clear-button": true,
                "show-tag-close": true,
                "max-tag-length": _vm.maxTagLength,
                "max-tag-width": "310px",
                "container-clickable": true,
                "theme": _vm.theme
            },
            on: {
                "select-click": _vm.OpenSelectDialog,
                "clear": _vm.clearAll,
                "close-tag": _vm.onCloseTag
            }
        }),
        _c('el-dialog', {
            attrs: {
                "title": _vm.title,
                "visible": _vm.dialogVisible,
                "area": _vm.area,
                "before-close": _vm.handleClose,
                "custom-class": "hik-cloud-by-role__dialog"
            },
            on: {
                "update:visible": function($event) {
                    _vm.dialogVisible = $event;
                },
                "opened": _vm.beforeOpen
            }
        }, [
            _vm.showAlert ? _c('el-alert', {
                attrs: {
                    "title": _vm.alertContent,
                    "type": "info",
                    "simple": "",
                    "closable": false,
                    "show-icon": ""
                }
            }) : _vm._e(),
            _c('div', {
                staticClass: "hik-cloud-by-role__dialog-body"
            }, [
                _c('div', {
                    staticClass: "hik-cloud-by-role__dialog-left"
                }, [
                    _c('div', {
                        staticClass: "hik-cloud-by-role__search-container"
                    }, [
                        _c('el-input', {
                            staticClass: "hik-cloud-by-role__filter-input",
                            attrs: {
                                "placeholder": _vm.searchPlaceholder,
                                "suffix-icon": "h-icon-search",
                                "clearable": ""
                            },
                            model: {
                                value: _vm.filterText,
                                callback: function($$v) {
                                    _vm.filterText = $$v;
                                },
                                expression: "filterText"
                            }
                        })
                    ], 1),
                    _c('el-scrollbar', {
                        staticClass: "hik-cloud-by-role__role-scroll",
                        attrs: {
                            "wrapStyle": "height:100%;overflow-x:hidden;"
                        }
                    }, _vm._l(_vm.filteredRoles, function(role) {
                        return _c('div', {
                            key: role[_vm.selectorValue],
                            staticClass: "hik-cloud-by-role__role-item",
                            class: {
                                'hik-cloud-by-role__role-item--active': _vm.selectedRoles.some(function(r) {
                                    return r[_vm.selectorValue] === role[_vm.selectorValue];
                                })
                            },
                            on: {
                                "click": function($event) {
                                    return _vm.toggleRoleSelection(role);
                                }
                            }
                        }, [
                            _vm._v(" " + _vm._s(role[_vm.selectorLabel]) + " "),
                            _vm.selectedRoles.some(function(r) {
                                return r[_vm.selectorValue] === role[_vm.selectorValue];
                            }) ? _c('i', {
                                staticClass: "iconfont iconrightsel"
                            }) : _vm._e()
                        ]);
                    }), 0)
                ], 1),
                _c('div', {
                    staticClass: "hik-cloud-by-role__dialog-right"
                }, [
                    _c('div', {
                        staticClass: "hik-cloud-by-role__selected-header"
                    }, [
                        _c('span', [
                            _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.role.selectedCount')) + _vm._s(_vm.selectedRoles.length))
                        ]),
                        _c('span', {
                            staticClass: "hik-cloud-by-role__clear-all",
                            on: {
                                "click": _vm.clearAll
                            }
                        }, [
                            _c('i', {
                                staticClass: "h-icon-delete"
                            }),
                            _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.role.clear')) + " ")
                        ])
                    ]),
                    _c('el-scrollbar', {
                        staticClass: "hik-cloud-by-role__selected-scroll",
                        attrs: {
                            "wrapStyle": "height:100%;overflow-x:hidden;",
                            "viewStyle": "height:100%;"
                        }
                    }, _vm._l(_vm.selectedRoles, function(role) {
                        return _c('div', {
                            key: role[_vm.selectorValue],
                            staticClass: "hik-cloud-by-role__selected-item"
                        }, [
                            _vm._v(" " + _vm._s(role[_vm.selectorLabel]) + " "),
                            _c('span', {
                                staticClass: "hik-cloud-by-role__clear-btn",
                                on: {
                                    "click": function($event) {
                                        $event.stopPropagation();
                                        return _vm.removeRole(role);
                                    }
                                }
                            }, [
                                _vm._v("×")
                            ])
                        ]);
                    }), 0)
                ], 1)
            ]),
            _c('div', {
                staticClass: "dialog-footer",
                attrs: {
                    "slot": "footer"
                },
                slot: "footer"
            }, [
                _c('el-button', {
                    attrs: {
                        "type": "primary"
                    },
                    on: {
                        "click": _vm.onOk
                    }
                }, [
                    _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.role.confirm')))
                ]),
                _c('el-button', {
                    on: {
                        "click": _vm.onCancel
                    }
                }, [
                    _vm._v(_vm._s(_vm.t('ym.rolePersonnelSelector.role.cancel')))
                ])
            ], 1)
        ], 1)
    ], 1);
};
var __vue_staticRenderFns__$2 = [];
/* style */ const __vue_inject_styles__$2 = undefined;
/* scoped */ const __vue_scope_id__$2 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$2 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$2,
    staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2);

/**
 * 自定义 debounce 函数
 * @param {Function} func 要防抖的函数
 * @param {Number} wait 等待毫秒数
 * @param {Boolean} immediate 是否立即执行（可选，默认 false）
 * @returns {Function} 包装后的防抖函数
 */ function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = ()=>{
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
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
//
var script$1 = {
    name: 'ByUser',
    components: {
        ParticipantDisplay: __vue_component__$3
    },
    mixins: [
        Locale
    ],
    props: {
        form: {
            type: Object,
            default: ()=>null
        },
        formKey: {
            type: String,
            default: 'pushObjList'
        },
        formTypeKey: {
            type: String,
            default: 'pushObjType'
        },
        selectorLabel: {
            type: String,
            default: 'pushObjName'
        },
        selectorValue: {
            type: String,
            default: 'pushObjId'
        },
        theme: {
            type: String,
            default: 'light' // 'light' 或 'dark'
        },
        maxTagLength: {
            type: Number,
            default: 6
        },
        userList: {
            type: Array,
            default: ()=>[]
        },
        // 用户查询接口URL，支持外部传入自定义接口
        userApiUrl: {
            type: String,
            default: '/api/v1/control/patrol/config/getPushUser'
        },
        // 用户查询参数字段名，支持外部传入自定义字段名
        userSearchKey: {
            type: String,
            default: 'searchKey'
        }
    },
    data () {
        return {
            participants: [],
            isEdit: false,
            teach: ''
        };
    },
    computed: {
        teachProps () {
            return {
                value: this.selectorLabel,
                label: this.selectorValue
            };
        },
        containerClass () {
            return {
                'hik-cloud-push-target-selector__container': true,
                'hik-cloud-push-target-selector__light-theme': this.theme === 'light',
                'hik-cloud-push-target-selector__dark-theme': this.theme === 'dark',
                'hik-cloud-push-target-selector__gray-theme': this.theme === 'gray'
            };
        }
    },
    watch: {
        form: {
            handler (newVal) {
                if (newVal && newVal[this.formKey]) {
                    this.participants = Array.isArray(newVal[this.formKey]) ? [
                        ...newVal[this.formKey]
                    ] : [];
                }
            },
            immediate: true,
            deep: true
        }
    },
    mounted () {
        // 动态创建自定义组件以支持动态字段名
        this.$nextTick(()=>{
            Vue.component('my-item', {
                functional: true,
                props: {
                    item: Object
                },
                render: (h, ctx)=>{
                    const item = ctx.props.item;
                    const selectorLabel = ctx.parent.selectorLabel || 'pushObjName';
                    return h('li', ctx.data, [
                        h('div', {
                            attrs: {
                                class: 'el-autocomplete-suggestion__item_info'
                            }
                        }, [
                            h('span', {
                                attrs: {
                                    class: 'el-autocomplete-suggestion__item_name',
                                    title: item[selectorLabel]
                                }
                            }, [
                                item[selectorLabel]
                            ]),
                            h('span', {
                                attrs: {
                                    style: 'margin-right: 6px;',
                                    title: item.phoneNum
                                }
                            }, [
                                item.phoneNum
                            ])
                        ]),
                        ''
                    ]);
                }
            });
        });
    },
    methods: {
        /**
     * 添加参与者（同步到 form[formKey]）
     */ addParticipant (teach) {
            // 构造只包含必要字段的对象，不包含 isInitial 标记
            const participant = {
                [this.formTypeKey]: teach[this.formTypeKey],
                [this.selectorValue]: teach[this.selectorValue],
                [this.selectorLabel]: teach[this.selectorLabel]
            };
            // 添加到本地 participants（可能含额外字段）
            this.participants.push(teach);
            // 同步到 form[formKey]
            if (this.form) {
                if (!this.form[this.formKey]) {
                    this.$set(this.form, this.formKey, []);
                }
                this.form[this.formKey].push(participant);
            }
        },
        /**
     * 移除参与者（同步到 form[formKey]）
     */ removeParticipant (teach) {
            // 从 participants 中移除
            const index = this.participants.findIndex((item)=>item[this.selectorValue] === teach[this.selectorValue]);
            if (index > -1) {
                // 检查是否是初始数据，如果是则不允许删除
                if (this.participants[index].isInitial) {
                    return;
                }
                this.participants.splice(index, 1);
            }
            // 同步到 form[formKey]
            if (this.form && this.form[this.formKey] && Array.isArray(this.form[this.formKey])) {
                const formIndex = this.form[this.formKey].findIndex((item)=>item[this.selectorValue] === teach[this.selectorValue]);
                if (formIndex > -1) {
                    // 检查是否是初始数据，如果是则不允许删除
                    if (this.form[this.formKey][formIndex].isInitial) {
                        return;
                    }
                    this.form[this.formKey].splice(formIndex, 1);
                }
            }
        },
        //#region 参备人员相关
        /**
     * 清空
     */ onClear () {
            this.$confirm(t('ym.rolePersonnelSelector.role.confirmClear'), {
                confirmButtonText: t('ym.base.confirm'),
                cancelButtonText: t('ym.base.cancel'),
                type: 'question'
            }).then(()=>{
                // 只清除非初始数据
                this.participants = this.participants.filter((item)=>item.isInitial);
                if (this.form) {
                    this.$set(this.form, this.formKey, this.form[this.formKey].filter((item)=>item.isInitial));
                }
            }).catch(()=>{
            // 取消操作不执行任何动作
            });
        },
        /**
     * 教师选中
     */ onSelect (teach) {
            const exist = this.participants.some((item)=>item[this.selectorValue] === teach[this.selectorValue]);
            if (exist) {
                this.teach = '';
                return;
            }
            this.addParticipant(teach);
            this.teach = '';
            this.$emit('check-select');
        },
        /**
     * 教师查询
     */ onQuerySearch: debounce(async function(queryString1, cb1) {
            try {
                const keyword = queryString1.replace(/\s*/g, "");
                if (keyword === '') {
                    cb1([]);
                    return;
                }
                // 如果有传入userList，则使用userList进行过滤
                if (this.userList.length > 0) {
                    const list = this.userList.map((item)=>({
                            [this.formTypeKey]: 1,
                            [this.selectorValue]: item[this.selectorValue],
                            [this.selectorLabel]: item[this.selectorLabel],
                            phoneNum: item.phoneNum || ''
                        }));
                    let filteredList = this.removeSelctTeach(list);
                    cb1(filteredList);
                } else {
                    // 使用默认的API获取用户列表
                    try {
                        const { data } = await this._http({
                            url: this.userApiUrl,
                            method: 'get',
                            params: {
                                [this.userSearchKey]: keyword
                            },
                            opts: {
                                params: {
                                    [this.userSearchKey]: keyword
                                }
                            }
                        });
                        const list = data.map((item)=>({
                                [this.formTypeKey]: 1,
                                [this.selectorValue]: item.userId,
                                [this.selectorLabel]: item.userName,
                                phoneNum: item.phone || ''
                            }));
                        let filteredList = this.removeSelctTeach(list);
                        cb1(filteredList);
                    } catch (ex) {
                        cb1([]);
                    }
                }
            } catch (ex) {
                cb1([]);
            }
        }, 500),
        /**
     * 获取默认用户列表
     */ async getDefaultUsers () {
            try {
                const keyword = queryString.replace(/\s*/g, "");
                if (keyword === '') {
                    cb([]);
                    return;
                }
                const { data } = await getPushUser(keyword);
                const list = data.map((item)=>({
                        [this.formTypeKey]: 1,
                        [this.selectorValue]: item.userId,
                        [this.selectorLabel]: item.userName,
                        phoneNum: item.phone || ''
                    }));
            } catch (ex) {}
        },
        /**
     * 移除已选择的教师
     */ removeSelctTeach (list) {
            return list.filter((v)=>this.participants.every((val)=>{
                    if (val[this.selectorValue] === v[this.selectorValue]) {
                        return false;
                    } else {
                        return true;
                    }
                }));
        },
        /**
     * 移除教师
     */ async onCloseTag (e, teach) {
            try {
                this.removeParticipant(teach);
            } catch (ex) {}
        }
    }
};

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        class: _vm.containerClass
    }, [
        _c('el-autocomplete', {
            attrs: {
                "popper-class": "hik-cloud-push-target-selector__autocomplete",
                "fetch-suggestions": _vm.onQuerySearch,
                "placeholder": _vm.t('ym.rolePersonnelSelector.user.searchPlaceholder'),
                "trigger-on-focus": false,
                "custom-item": "my-item",
                "popper-append-to-body": false,
                "props": _vm.teachProps,
                "maxlength": 100
            },
            on: {
                "select": _vm.onSelect
            },
            model: {
                value: _vm.teach,
                callback: function($$v) {
                    _vm.teach = $$v;
                },
                expression: "teach"
            }
        }),
        _c('participant-display', {
            attrs: {
                "participants": _vm.participants,
                "show-select-button": false,
                "show-clear-button": !_vm.isEdit,
                "max-tag-length": _vm.maxTagLength,
                "max-tag-width": "310px",
                "container-clickable": false,
                "theme": _vm.theme
            },
            on: {
                "clear": _vm.onClear,
                "close-tag": _vm.onCloseTag
            }
        })
    ], 1);
};
var __vue_staticRenderFns__$1 = [];
/* style */ const __vue_inject_styles__$1 = undefined;
/* scoped */ const __vue_scope_id__$1 = "data-v-d436b76c";
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$1 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1);

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
const defaultProps = {
    publishTypeKey: 'pushObjType',
    roleKey: 'pushObjList',
    roleSelectorLabel: 'pushObjName',
    roleSelectorValue: 'pushObjId',
    roleTitle: '选择角色',
    roleArea: [
        640,
        460
    ],
    roleShowAlert: true,
    roleAlertContent: '所选角色将根据自己的所在的班级权限范围收到相应推送提醒',
    roleSearchPlaceholder: '搜索角色名称',
    roleApiUrl: '/api/v1/minerva/basic/roles/actions/listAllRoles',
    userKey: 'pushObjList',
    userSelectorLabel: 'pushObjName',
    userSelectorValue: 'pushObjId',
    userApiUrl: '/api/v1/control/patrol/config/getPushUser',
    userSearchKey: 'searchKey'
};
var script = {
    name: 'HikCloudPushTargetSelector',
    components: {
        ByRole: __vue_component__$2,
        ByUser: __vue_component__$1
    },
    props: {
        options: {
            type: Array,
            default: ()=>[
                    0,
                    1
                ]
        },
        optionLabels: {
            type: Object,
            default: ()=>({
                    0: '按角色',
                    1: '按用户'
                })
        },
        props: {
            type: Object,
            default: ()=>({})
        },
        form: {
            type: Object,
            default: ()=>null
        },
        theme: {
            type: String,
            default: 'light'
        },
        maxTagLength: {
            type: Number,
            default: 6
        },
        tabsShow: {
            type: Boolean,
            default: true
        },
        roleList: {
            type: Array,
            default: ()=>[]
        },
        userList: {
            type: Array,
            default: ()=>[]
        },
        // 支持外部传入的获取提示内容的函数
        getTooltipContent: {
            type: Function,
            default: null
        },
        // 角色标签主色配置
        roleTagColor: {
            type: String,
            default: '#0091FF'
        },
        // 用户标签主色配置
        userTagColor: {
            type: String,
            default: '#16BE7C'
        }
    },
    data () {
        return {
            map: {
                ...defaultProps,
                ...this.props
            }
        };
    },
    computed: {
        tagColorStyles () {
            // 根据主色生成完整的色系配置
            const generateColorScheme = (mainColor)=>{
                return {
                    border: mainColor,
                    color: mainColor,
                    prefixBorder: mainColor,
                    prefixBg: mainColor + '33',
                    prefixColor: mainColor
                };
            };
            const roleColors = generateColorScheme(this.roleTagColor);
            const userColors = generateColorScheme(this.userTagColor);
            return {
                '--role-tag-border': roleColors.border,
                '--role-tag-color': roleColors.color,
                '--role-prefix-border': roleColors.prefixBorder,
                '--role-prefix-bg': roleColors.prefixBg,
                '--role-prefix-color': roleColors.prefixColor,
                '--user-tag-border': userColors.border,
                '--user-tag-color': userColors.color,
                '--user-prefix-border': userColors.prefixBorder,
                '--user-prefix-bg': userColors.prefixBg,
                '--user-prefix-color': userColors.prefixColor
            };
        }
    },
    methods: {
        radioInput (val) {
            this.updateForm({
                ...this.form,
                [this.map.publishTypeKey]: val
            });
        },
        radioChange (val) {
            this.$emit('radio-change', val);
        },
        updateForm (val) {
            this.$emit('update:form', val);
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-push-target-selector",
        style: _vm.tagColorStyles
    }, [
        _vm.tabsShow ? _c('el-radio-group', {
            staticClass: "hik-cloud-push-target-selector__tabs",
            attrs: {
                "value": _vm.form[_vm.map.publishTypeKey],
                "type": "simple"
            },
            on: {
                "input": _vm.radioInput,
                "change": _vm.radioChange
            }
        }, _vm._l(_vm.options, function(item) {
            return _c('el-radio-button', {
                key: item,
                attrs: {
                    "label": item
                }
            }, [
                _vm._v(" " + _vm._s(_vm.optionLabels[item]) + " ")
            ]);
        }), 1) : _vm._e(),
        _c('ByRole', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.form[_vm.map.publishTypeKey] === 0,
                    expression: "form[map.publishTypeKey] === 0"
                }
            ],
            key: "role",
            attrs: {
                "form": _vm.form,
                "formKey": _vm.map.roleKey,
                "formTypeKey": _vm.map.publishTypeKey,
                "selectorLabel": _vm.map.roleSelectorLabel,
                "selectorValue": _vm.map.roleSelectorValue,
                "title": _vm.map.roleTitle,
                "area": _vm.map.roleArea,
                "theme": _vm.theme,
                "maxTagLength": _vm.maxTagLength,
                "showAlert": _vm.map.roleShowAlert,
                "alertContent": _vm.map.roleAlertContent,
                "searchPlaceholder": _vm.map.roleSearchPlaceholder,
                "roleList": _vm.roleList,
                "roleApiUrl": _vm.map.roleApiUrl
            },
            on: {
                "check-select": function($event) {
                    return _vm.$emit('check-select');
                },
                "update:form": _vm.updateForm
            }
        }),
        _c('ByUser', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.form[_vm.map.publishTypeKey] === 1,
                    expression: "form[map.publishTypeKey] === 1"
                }
            ],
            key: "user",
            attrs: {
                "form": _vm.form,
                "formKey": _vm.map.userKey,
                "formTypeKey": _vm.map.publishTypeKey,
                "selectorLabel": _vm.map.userSelectorLabel,
                "selectorValue": _vm.map.userSelectorValue,
                "theme": _vm.theme,
                "maxTagLength": _vm.maxTagLength,
                "userList": _vm.userList,
                "userApiUrl": _vm.map.userApiUrl,
                "userSearchKey": _vm.map.userSearchKey
            },
            on: {
                "check-select": function($event) {
                    return _vm.$emit('check-select');
                },
                "update:form": _vm.updateForm
            }
        })
    ], 1);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* scoped */ const __vue_scope_id__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__);

/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

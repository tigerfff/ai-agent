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
var script$5 = {
    name: 'HBatchSelector',
    mixins: [
        Locale
    ],
    props: {
        maxNum: {
            type: Number,
            default: 20
        },
        labelWidth: {
            type: Number,
            default: 0
        },
        value: {
            type: Array,
            default () {
                return [];
            }
        },
        defaultParams: {
            type: Object,
            default () {
                return {
                    name: 'name',
                    id: 'id'
                };
            }
        },
        selectText: {
            type: String,
            default: ''
        }
    },
    watch: {
        value () {
            // 用于重新计算滚动条高度
            this.$refs.scrollbar && this.$refs.scrollbar.setScroll();
        }
    },
    methods: {
        removeItem (type) {
            if (type === 'all') ; else {
                // 删除个别
                const fliterList = this.value.filter((item)=>{
                    return item[this.defaultParams.id] !== type;
                });
                this.$emit('update', fliterList);
            }
        },
        // 添加点击事件
        click () {
            this.$emit('click');
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

const __vue_script__$5 = script$5;
/* template */ var __vue_render__$5 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-target-selector__batch-selector"
    }, [
        _c('el-button', {
            staticStyle: {
                "width": "88px"
            },
            on: {
                "click": _vm.click
            }
        }, [
            _vm._v(" " + _vm._s(_vm.t('ym.targetSelector.select')) + " ")
        ]),
        _c('div', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.value.length > 0,
                    expression: "value.length > 0"
                }
            ],
            staticClass: "hik-cloud-target-selector__batch-container"
        }, [
            _c('div', {
                staticClass: "select-num"
            }, [
                _c('span', {
                    staticClass: "select-text"
                }, [
                    _vm._v(" " + _vm._s(_vm.selectText) + " ")
                ])
            ]),
            _c('div', {
                staticClass: "selectd-tag-list"
            }, [
                _c('el-scrollbar', {
                    ref: "scrollbar",
                    attrs: {
                        "wrap-class": "selectd-tag-container-warp"
                    }
                }, _vm._l(_vm.value, function(item, index) {
                    return _c('div', {
                        key: index,
                        staticClass: "selected-item",
                        style: {
                            width: _vm.labelWidth ? _vm.labelWidth + "px" : 'auto'
                        }
                    }, [
                        _c('span', {
                            staticClass: "item-content",
                            attrs: {
                                "title": item[_vm.defaultParams.name]
                            }
                        }, [
                            _vm._v(" " + _vm._s(item[_vm.defaultParams.name]) + " ")
                        ]),
                        _c('i', {
                            staticClass: "h-icon-close",
                            on: {
                                "click": function($event) {
                                    return _vm.removeItem(item[_vm.defaultParams.id]);
                                }
                            }
                        })
                    ]);
                }), 0)
            ], 1)
        ])
    ], 1);
};
var __vue_staticRenderFns__$5 = [];
/* style */ const __vue_inject_styles__$5 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$5 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$5,
    staticRenderFns: __vue_staticRenderFns__$5
}, __vue_inject_styles__$5, __vue_script__$5);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var script$4 = {
    name: 'ByClass',
    components: {
        BatchSelector: __vue_component__$5
    },
    props: {
        form: {
            type: Object,
            default: ()=>null
        },
        formKey: {
            type: String,
            required: true
        },
        treeLabel: {
            type: String,
            required: true
        },
        selectorLabel: {
            type: String,
            required: true
        },
        selectorValue: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: '选择发布对象'
        },
        authFlag: {
            type: String,
            default: 'school'
        },
        navName: {
            type: String,
            default: ''
        },
        moduleName: {
            type: String,
            default: ()=>null
        },
        selectMessage: {
            type: String,
            default: ''
        },
        filterClass: {
            type: [
                String,
                Array
            ],
            default: ''
        },
        treeUrl: {
            type: String,
            default: ''
        },
        selectedUrl: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            unwatch: null,
            defaultParams: {
                name: this.selectorLabel,
                id: this.selectorValue // 唯一标示id
            },
            defaultProps: {
                children: 'children',
                label: this.treeLabel
            },
            dialogVisible: false,
            filterText: '',
            treeData: [],
            allClassArr: [],
            selectText: '已选择0个班级'
        };
    },
    computed: {
        checkAll () {
            return this.form[this.formKey].length === 1 && this.form[this.formKey][0].nodeId === 'allClass';
        }
    },
    watch: {
        filterText (val) {
            this.$refs.classTree.filter(val, !this.filterText);
        }
    },
    mounted () {
        this.watchForm();
        this.getClassesData();
    },
    beforeDestroy () {
        this.unwatch && this.unwatch();
    },
    methods: {
        watchForm () {
            this.unwatch = this.$watch(`form.${this.formKey}`, (val)=>{
                if (this.filterClass !== '') {
                    this.filterTree();
                } else {
                    this.$nextTick(()=>{
                        if (this.checkAll) {
                            this.selectText = '已选择' + this.allClassArr.length + '个班级';
                        } else {
                            this.selectText = '已选择' + val.length + '个班级';
                        }
                    });
                }
                if (val.length === 0) {
                    this.$emit('none-selected');
                }
            });
        },
        async getClassesData () {
            const url = this.treeUrl || (this.navName === 'classbrand' ? '/api/v1/teach/datamanage/classes/actions/getClassBrandClassTree' : '/api/v1/teach/datamanage/classes/actions/getClassTreeByAuth' // 智慧班牌的用1.4.4的新接口，其他模块用老接口
            );
            let { code, message, data } = await this._http({
                url,
                method: 'get',
                params: {
                    authFlag: this.authFlag
                },
                opts: {
                    params: {
                        authFlag: this.authFlag
                    }
                }
            });
            if (code === 0) {
                this.allTreeData = data;
                if (this.filterClass !== '') {
                    this.filterTree();
                } else {
                    this.treeData = data;
                    this.resetClassInfo(this.treeData);
                }
            } else {
                this.$message.error(message);
            }
        },
        async lastSelected () {
            let { data } = await this._http({
                url: this.selectedUrl || '/api/classbrand/moduleclassrel',
                method: 'get',
                params: {
                    moduleName: this.moduleName,
                    publishType: 'class'
                },
                opts: {
                    params: {
                        moduleName: this.moduleName,
                        publishType: 'class'
                    }
                }
            });
            if (data.length === 0) {
                this.$message.info('暂无上次操作记录');
            } else {
                let arr = [];
                data.forEach((item)=>{
                    arr.push({
                        nodeId: item
                    });
                });
                this.$refs.classTree.setCheckedNodes(arr);
            }
        },
        onOk () {
            // 获取班级节点
            const nodes = this.$refs.classTree.getCheckedNodes(true, true);
            const classNodes = nodes.filter((node)=>node.type === 'class');
            // 设置选中标签
            if (classNodes.length === this.allClassArr.length) {
                this.$emit('update:form', {
                    ...this.form,
                    [this.formKey]: [
                        {
                            fullName: '全部',
                            nodeId: 'allClass'
                        }
                    ]
                });
            } else {
                this.$emit('update:form', {
                    ...this.form,
                    [this.formKey]: classNodes
                });
            }
            // 触发父组件校验校验
            this.$emit('check-select');
            this.dialogVisible = false;
        },
        // 取消
        onCancel () {
            this.dialogVisible = false;
        },
        filterTree () {
            this.treeData = this.allTreeData.filter((item)=>{
                if (item.studySectionId === this.filterClass || item.type === 'school') {
                    return item;
                }
            });
            if (this.treeData.length === 1) {
                this.treeData = [];
            }
            this.resetClassInfo(this.treeData);
        },
        resetClassInfo (data) {
            this.allClassArr = data.filter((node)=>node.type === 'class');
            // 将完整树数据缓存到父组件，提交表单时若为“全部”，则进行手动替换
            this.$emit('cache-all-data', {
                class: this.allClassArr
            });
            // 更新已选计数
            this.$nextTick(()=>{
                if (this.checkAll) {
                    this.selectText = '已选择' + this.allClassArr.length + '个班级';
                } else {
                    this.selectText = '已选择' + this.form[this.formKey].length + '个班级';
                }
            });
        },
        beforeOpen () {
            if (this.filterClass !== '') {
                this.filterTree();
            }
            this.$nextTick(()=>{
                this.filterText = '';
                this.$refs.classTree.setCheckedNodes(this.checkAll ? this.allClassArr : this.form[this.formKey]);
            });
        },
        OpenSelectDialog () {
            if (this.selectMessage) {
                return this.$message(this.selectMessage);
            }
            this.dialogVisible = true;
        },
        filterNode (value, data) {
            if (!value) return true;
            return data.nodeName.indexOf(value) !== -1;
        },
        update (val) {
            this.$emit('update:form', {
                ...this.form,
                [this.formKey]: val
            });
        }
    }
};

const __vue_script__$4 = script$4;
/* template */ var __vue_render__$4 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-target-selector__container"
    }, [
        _c('BatchSelector', {
            attrs: {
                "id": "class-selector",
                "value": _vm.form[_vm.formKey],
                "max-num": _vm.allClassArr.length,
                "defaultParams": _vm.defaultParams,
                "selectText": _vm.selectText
            },
            on: {
                "click": _vm.OpenSelectDialog,
                "update": _vm.update
            }
        }),
        _c('el-dialog', {
            attrs: {
                "title": _vm.title,
                "visible": _vm.dialogVisible,
                "area": [
                    480,
                    510
                ]
            },
            on: {
                "update:visible": function($event) {
                    _vm.dialogVisible = $event;
                },
                "opened": _vm.beforeOpen
            }
        }, [
            _c('el-input', {
                staticClass: "filter-tree-input",
                attrs: {
                    "placeholder": "搜索组织名称",
                    "prefix-icon": "h-icon-search"
                },
                model: {
                    value: _vm.filterText,
                    callback: function($$v) {
                        _vm.filterText = $$v;
                    },
                    expression: "filterText"
                }
            }),
            _c('el-scrollbar', {
                attrs: {
                    "wrap-class": "hik-cloud-target-selector__dialog-select"
                }
            }, [
                _c('el-button', {
                    attrs: {
                        "type": "default"
                    },
                    on: {
                        "click": _vm.lastSelected
                    }
                }, [
                    _vm._v(" 选择上次已选 ")
                ]),
                _c('div', {
                    staticClass: "tree-wrap"
                }, [
                    _c('el-tree', {
                        ref: "classTree",
                        attrs: {
                            "node-key": "nodeId",
                            "parent-key": "parentId",
                            "simple-data": "",
                            "show-checkbox": "",
                            "default-expand-all": "",
                            "data": _vm.treeData,
                            "props": _vm.defaultProps,
                            "filter-node-method": _vm.filterNode
                        },
                        on: {
                            "update:data": function($event) {
                                _vm.treeData = $event;
                            }
                        }
                    })
                ], 1)
            ], 1),
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
                    _vm._v(" 确 定 ")
                ]),
                _c('el-button', {
                    on: {
                        "click": _vm.onCancel
                    }
                }, [
                    _vm._v(" 取 消 ")
                ])
            ], 1)
        ], 1)
    ], 1);
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'BySite',
    components: {
        BatchSelector: __vue_component__$5
    },
    props: {
        form: {
            type: Object,
            default: ()=>null
        },
        formKey: {
            type: String,
            required: true
        },
        treeLabel: {
            type: String,
            required: true
        },
        selectorLabel: {
            type: String,
            required: true
        },
        selectorValue: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: '选择发布对象'
        },
        authFlag: {
            type: String,
            default: 'school'
        },
        navName: {
            type: String,
            default: ''
        },
        moduleName: {
            type: String,
            default: ()=>null
        },
        treeUrl: {
            type: String,
            default: ''
        },
        selectedUrl: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            unwatch: null,
            // ---h-batch-selector配置项---
            defaultParams: {
                name: this.selectorLabel,
                id: this.selectorValue // 唯一标示id
            },
            // ---h-batch-selector配置项---
            dialogVisible: false,
            filterText: '',
            treeData: [],
            allClassroomArr: [],
            // 树组件配置项
            defaultProps: {
                children: 'children',
                label: this.treeLabel
            },
            selectText: '已选择0个场地'
        };
    },
    computed: {
        // 判定全选
        checkAll () {
            return this.form[this.formKey].length === 1 && this.form[this.formKey][0].nodeId === 'allClassroom';
        }
    },
    watch: {
        // 执行树的过滤动作
        filterText (val) {
            this.$refs.classroomTree.filter(val, !this.filterText);
        }
    },
    mounted () {
        this.watchForm();
        this.getClassroomData();
    },
    beforeDestroy () {
        this.unwatch && this.unwatch();
    },
    methods: {
        watchForm () {
            this.unwatch = this.$watch(`form.${this.formKey}`, (val)=>{
                // 更新已选计数
                this.$nextTick(()=>{
                    if (this.checkAll) {
                        this.selectText = '已选择' + this.allClassroomArr.length + '个场地';
                    } else {
                        this.selectText = '已选择' + val.length + '个场地';
                    }
                });
                if (val.length === 0) {
                    this.$emit('none-selected');
                }
            });
        },
        // 获取教室树
        async getClassroomData () {
            const url = this.treeUrl || (this.navName === 'classbrand' ? '/api/v1/teach/datamanage/classrooms/actions/findClassBrandClassroomTree' : '/api/v1/teach/datamanage/classrooms/actions/findClassroomTree');
            let params = this.navName === 'classbrand' ? this.authFlag : '';
            let { code, message, data } = await this._http({
                url,
                method: 'get',
                params: {
                    authFlag: params
                },
                opts: {
                    params: {
                        authFlag: params
                    }
                }
            });
            if (code === 0) {
                this.treeData = data;
                this.allClassroomArr = data.filter((node)=>node.type === 1); // type=1:教室节点
                // 将完整树数据缓存到父组件，提交表单时若为“全部”，则进行手动替换
                this.$emit('cache-all-data', {
                    site: this.allClassroomArr
                });
                // 更新已选计数
                this.$nextTick(()=>{
                    if (this.checkAll) {
                        this.selectText = '已选择' + this.allClassroomArr.length + '个场地';
                    } else {
                        this.selectText = '已选择' + this.form[this.formKey].length + '个场地';
                    }
                });
            } else {
                this.$message.error(message);
            }
        },
        // 打开选择弹窗
        OpenSelectDialog () {
            this.dialogVisible = true;
        },
        // 加载上次已选中
        async lastSelected () {
            let { data } = await this._http({
                url: this.selectedUrl || '/api/classbrand/moduleclassrel',
                method: 'get',
                params: {
                    moduleName: this.moduleName,
                    publishType: 'site'
                },
                opts: {
                    params: {
                        moduleName: this.moduleName,
                        publishType: 'site'
                    }
                }
            });
            if (data.length === 0) {
                this.$message.info('暂无上次操作记录');
            } else {
                let arr = [];
                data.forEach((item)=>{
                    arr.push({
                        nodeId: item
                    });
                });
                this.$refs.classroomTree.setCheckedNodes(arr);
            }
        },
        // 树的过滤方式
        filterNode (value, data) {
            if (!value) return true;
            return data.nodeName.indexOf(value) !== -1;
        },
        // 打开弹窗前，将当前展示的标签与弹窗中的勾选状态同步
        beforeOpen () {
            this.filterText = '';
            if (this.checkAll) {
                this.$refs.classroomTree.setCheckedNodes(this.allClassroomArr);
            } else {
                this.$refs.classroomTree.setCheckedNodes(this.form[this.formKey]);
            }
        },
        // 确定
        onOk () {
            // 获取教室节点
            const nodes = this.$refs.classroomTree.getCheckedNodes(true, true);
            const classNodes = nodes.filter((node)=>node.type === 1);
            // 设置选中标签
            if (classNodes.length === this.allClassroomArr.length) {
                this.$emit('update:form', {
                    ...this.form,
                    [this.formKey]: [
                        {
                            fullName: '全部',
                            nodeId: 'allClassroom'
                        }
                    ]
                });
            } else {
                this.$emit('update:form', {
                    ...this.form,
                    [this.formKey]: classNodes
                });
            }
            // 触发校验
            this.$emit('check-select');
            this.dialogVisible = false;
        },
        // 取消
        onCancel () {
            this.dialogVisible = false;
        },
        update (val) {
            this.$emit('update:form', {
                ...this.form,
                [this.formKey]: val
            });
        }
    }
};

const __vue_script__$3 = script$3;
/* template */ var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-target-selector__container"
    }, [
        _c('BatchSelector', {
            attrs: {
                "id": "site-selector",
                "value": _vm.form[_vm.formKey],
                "max-num": _vm.allClassroomArr.length,
                "defaultParams": _vm.defaultParams,
                "selectText": _vm.selectText
            },
            on: {
                "click": _vm.OpenSelectDialog,
                "update": _vm.update
            }
        }),
        _c('el-dialog', {
            attrs: {
                "title": _vm.title,
                "visible": _vm.dialogVisible,
                "area": [
                    480,
                    510
                ]
            },
            on: {
                "update:visible": function($event) {
                    _vm.dialogVisible = $event;
                },
                "opened": _vm.beforeOpen
            }
        }, [
            _c('el-input', {
                staticClass: "filter-tree-input",
                attrs: {
                    "placeholder": "搜索组织名称",
                    "prefix-icon": "h-icon-search"
                },
                model: {
                    value: _vm.filterText,
                    callback: function($$v) {
                        _vm.filterText = $$v;
                    },
                    expression: "filterText"
                }
            }),
            _c('el-scrollbar', {
                attrs: {
                    "wrap-class": "hik-cloud-target-selector__dialog-select"
                }
            }, [
                _c('el-button', {
                    attrs: {
                        "type": "default"
                    },
                    on: {
                        "click": _vm.lastSelected
                    }
                }, [
                    _vm._v(" 选择上次已选 ")
                ]),
                _c('div', {
                    staticClass: "tree-wrap"
                }, [
                    _c('el-tree', {
                        ref: "classroomTree",
                        attrs: {
                            "data": _vm.treeData,
                            "props": _vm.defaultProps,
                            "simple-data": "",
                            "node-key": "nodeId",
                            "parent-key": "parentId",
                            "default-expand-all": "",
                            "filter-node-method": _vm.filterNode,
                            "show-checkbox": ""
                        },
                        on: {
                            "update:data": function($event) {
                                _vm.treeData = $event;
                            }
                        }
                    })
                ], 1)
            ], 1),
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
                    _vm._v(" 确 定 ")
                ]),
                _c('el-button', {
                    on: {
                        "click": _vm.onCancel
                    }
                }, [
                    _vm._v(" 取 消 ")
                ])
            ], 1)
        ], 1)
    ], 1);
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'ByGrade',
    components: {
        BatchSelector: __vue_component__$5
    },
    props: {
        form: {
            type: Object,
            default: ()=>null
        },
        formKey: {
            type: String,
            required: true
        },
        treeLabel: {
            type: String,
            required: true
        },
        selectorLabel: {
            type: String,
            required: true
        },
        selectorValue: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: '选择发布对象'
        },
        authFlag: {
            type: String,
            default: 'school'
        },
        navName: {
            type: String,
            default: ''
        },
        moduleName: {
            type: String,
            default: ()=>null
        },
        selectMessage: {
            type: String,
            default: ''
        },
        filterGrade: {
            type: [
                String,
                Array
            ],
            default: ''
        },
        treeUrl: {
            type: String,
            default: ''
        },
        selectedUrl: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            unwatch: null,
            defaultParams: {
                name: this.selectorLabel,
                id: this.selectorValue // 唯一标示id
            },
            defaultProps: {
                children: 'children',
                label: this.treeLabel
            },
            allTreeData: [],
            dialogVisible: false,
            filterText: '',
            treeData: [],
            allClassroomArr: [],
            selectText: '已选择0个年级'
        };
    },
    computed: {
        checkAll () {
            return this.form[this.formKey].length === 1 && this.form[this.formKey][0].nodeId === 'allClassroom';
        }
    },
    watch: {
        filterText (val) {
            this.$refs.classroomTree.filter(val, !this.filterText);
        }
    },
    mounted () {
        this.watchForm();
        this.getClassroomData();
    },
    beforeDestroy () {
        this.unwatch && this.unwatch();
    },
    methods: {
        watchForm () {
            this.unwatch = this.$watch(`form.${this.formKey}`, (val)=>{
                this.$nextTick(()=>{
                    if (this.checkAll) {
                        this.selectText = '已选择' + this.allClassroomArr.length + '个年级';
                    } else {
                        this.selectText = '已选择' + val.length + '个年级';
                    }
                });
            });
        },
        async getClassroomData () {
            const url = this.treeUrl || '/api/v1/teach/datamanage/grades/actions/findGradeTreeByTenantId';
            let { code, message, data } = await this._http({
                url,
                method: 'get'
            });
            if (code === 0) {
                this.allTreeData = data;
                if (this.filterGrade !== '') {
                    this.filterTree();
                } else {
                    this.treeData = data;
                    this.resetClassInfo(this.treeData);
                }
            } else {
                this.$message.error(message);
            }
        },
        async lastSelected () {
            let { data } = await this._http({
                url: this.selectedUrl || '/api/classbrand/moduleclassrel',
                method: 'get',
                params: {
                    moduleName: this.moduleName,
                    publishType: 'grade'
                },
                opts: {
                    params: {
                        moduleName: this.moduleName,
                        publishType: 'grade'
                    }
                }
            });
            if (data.length === 0) {
                this.$message.info('暂无上次操作记录');
            } else {
                let arr = [];
                data.forEach((item)=>{
                    arr.push({
                        nodeId: item
                    });
                });
                this.$refs.classroomTree.setCheckedNodes(arr);
            }
        },
        onOk () {
            // 获取教室节点
            const nodes = this.$refs.classroomTree.getCheckedNodes(true, true);
            const classNodes = nodes.filter((node)=>node.type === 'grade');
            // 设置选中标签
            if (classNodes.length === this.allClassroomArr.length) {
                this.$emit('update:form', {
                    ...this.form,
                    [this.formKey]: [
                        {
                            nodeName: '全部',
                            nodeId: 'allClassroom'
                        }
                    ]
                });
            } else {
                this.$emit('update:form', {
                    ...this.form,
                    [this.formKey]: classNodes
                });
            }
            // 触发校验
            this.$emit('check-select');
            this.dialogVisible = false;
        },
        onCancel () {
            this.dialogVisible = false;
        },
        filterTree () {
            if (Array.isArray(this.filterGrade)) {
                if (this.filterGrade.length === 0) {
                    this.treeData = [];
                } else {
                    var needGradeId = this.filterGrade.map((item)=>item.gradeId);
                    this.treeData = this.allTreeData.filter((item)=>{
                        if (item.type !== 'grade' || item.type === 'grade' && needGradeId.includes(item.nodeId)) {
                            return item;
                        }
                    });
                }
                this.resetClassInfo(this.treeData);
            }
        },
        resetClassInfo (data) {
            this.allClassroomArr = data.filter((node)=>node.type === 'grade');
            // 将完整树数据缓存到父组件，提交表单时若为“全部”，则进行手动替换
            this.$emit('cache-all-data', {
                grade: this.allClassroomArr
            });
            // 更新已选计数
            this.$nextTick(()=>{
                if (this.checkAll) {
                    this.selectText = '已选择' + this.allClassroomArr.length + '个年级';
                } else {
                    this.selectText = '已选择' + this.form[this.formKey].length + '个年级';
                }
            });
        },
        beforeOpen () {
            if (this.filterGrade !== '') {
                this.filterTree();
            }
            this.$nextTick(()=>{
                this.filterText = '';
                this.$refs.classroomTree.setCheckedNodes(this.checkAll ? this.allClassroomArr : this.form[this.formKey]);
            });
        },
        OpenSelectDialog () {
            if (this.selectMessage) {
                return this.$message(this.selectMessage);
            }
            this.dialogVisible = true;
        },
        filterNode (value, data) {
            if (!value) return true;
            return data.nodeName.indexOf(value) !== -1;
        },
        update (val) {
            this.$emit('update:form', {
                ...this.form,
                [this.formKey]: val
            });
        }
    }
};

const __vue_script__$2 = script$2;
/* template */ var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-target-selector__container"
    }, [
        _c('BatchSelector', {
            attrs: {
                "id": "site-selector",
                "value": _vm.form[_vm.formKey],
                "max-num": _vm.allClassroomArr.length,
                "defaultParams": _vm.defaultParams,
                "selectText": _vm.selectText
            },
            on: {
                "click": _vm.OpenSelectDialog,
                "update": _vm.update
            }
        }),
        _c('el-dialog', {
            attrs: {
                "title": _vm.title,
                "visible": _vm.dialogVisible,
                "area": [
                    480,
                    510
                ]
            },
            on: {
                "update:visible": function($event) {
                    _vm.dialogVisible = $event;
                },
                "opened": _vm.beforeOpen
            }
        }, [
            _c('el-input', {
                staticClass: "filter-tree-input",
                attrs: {
                    "placeholder": "搜索组织名称",
                    "prefix-icon": "h-icon-search"
                },
                model: {
                    value: _vm.filterText,
                    callback: function($$v) {
                        _vm.filterText = $$v;
                    },
                    expression: "filterText"
                }
            }),
            _c('el-scrollbar', {
                attrs: {
                    "wrap-class": "hik-cloud-target-selector__dialog-select"
                }
            }, [
                _c('el-button', {
                    attrs: {
                        "type": "default"
                    },
                    on: {
                        "click": _vm.lastSelected
                    }
                }, [
                    _vm._v(" 选择上次已选 ")
                ]),
                _c('div', {
                    staticClass: "tree-wrap"
                }, [
                    _c('el-tree', {
                        ref: "classroomTree",
                        attrs: {
                            "node-key": "nodeId",
                            "parent-key": "parentId",
                            "simple-data": "",
                            "show-checkbox": "",
                            "default-expand-all": "",
                            "data": _vm.treeData,
                            "props": _vm.defaultProps,
                            "filter-node-method": _vm.filterNode
                        },
                        on: {
                            "update:data": function($event) {
                                _vm.treeData = $event;
                            }
                        }
                    })
                ], 1)
            ], 1),
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
                    _vm._v(" 确 定 ")
                ]),
                _c('el-button', {
                    on: {
                        "click": _vm.onCancel
                    }
                }, [
                    _vm._v(" 取 消 ")
                ])
            ], 1)
        ], 1)
    ], 1);
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'ByDevice',
    components: {
        BatchSelector: __vue_component__$5
    },
    props: {
        form: {
            type: Object,
            default: ()=>null
        },
        formKey: {
            type: String,
            required: true
        },
        treeLabel: {
            type: String,
            required: true
        },
        selectorLabel: {
            type: String,
            required: true
        },
        selectorValue: {
            type: String,
            required: true
        },
        title: {
            type: String,
            default: '选择发布对象'
        },
        authFlag: {
            type: String,
            default: 'school'
        },
        navName: {
            type: String,
            default: ''
        },
        moduleName: {
            type: String,
            default: ()=>null
        },
        label: {
            type: String,
            default: '设备名称'
        },
        treeUrl: {
            type: String,
            default: ''
        },
        selectedUrl: {
            type: String,
            default: ''
        },
        deviceUrl: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            unwatch: null,
            // ---h-batch-selector配置项---
            defaultParams: {
                name: this.selectorLabel,
                id: this.selectorValue // 唯一标示id
            },
            // ---h-batch-selector配置项---
            dialogVisible: false,
            // 设备页面
            filterText: '',
            dataFilter: [],
            defaultProps: {
                label: this.treeLabel
            },
            leftTableSearchKeyword: '',
            leftData: [],
            rightData: [],
            currentNode: {},
            selectText: '已选择0个设备'
        };
    },
    watch: {
        // 执行树的过滤动作
        filterText (val) {
            this.$refs.deviceTree.filter(val, !this.filterText);
        },
        dialogVisible (val) {
            if (val) {
                this.$nextTick(()=>{
                    if (this.$refs.deviceTree.getSelectedNode()) {
                        this.rightData = JSON.parse(JSON.stringify(this.form[this.formKey]));
                        this.handleNodeClick(this.currentNode, true);
                    }
                });
            }
        }
    },
    mounted () {
        this.watchForm();
        this.getDeviceTree();
    },
    beforeDestroy () {
        this.unwatch && this.unwatch();
    },
    methods: {
        watchForm () {
            this.unwatch = this.$watch(`form.${this.formKey}`, (val)=>{
                // 更新已选计数
                this.$nextTick(()=>{
                    this.selectText = '已选择' + val.length + '个设备';
                });
                if (val.length === 0) {
                    this.$emit('none-selected');
                }
            });
        },
        // 打开选择弹窗
        OpenSelectDialog () {
            this.dialogVisible = true;
        },
        // 确定
        onOk () {
            this.$emit('update:form', {
                ...this.form,
                [this.formKey]: this.$refs.tableTransfer.getCacheData().rightTableCacheData
            });
            this.$emit('check-select');
            this.dialogVisible = false;
        },
        // 取消
        onCancel () {
            this.dialogVisible = false;
        },
        reset () {
            this.filterText = '';
            this.leftTableSearchKeyword = '';
            this.leftData = [];
            this.rightData = [];
            this.currentNode = {};
            this.$refs.deviceTree && this.$refs.deviceTree.setCurrentKey(null);
        },
        clear () {
            this.leftTableSearchKeyword = '';
            this.searchDevice();
        },
        filterNode (value, data) {
            if (!value) return true;
            return data.nodeName.indexOf(value) !== -1;
        },
        async getDeviceTree () {
            let { data } = await this._http({
                url: this.treeUrl || '/api/device/deviceOrgs/actions/findClassBrandAuthOrg',
                method: 'get'
            }) // 获取设备树
            ;
            this.dataFilter = data;
            this.$nextTick(()=>{
                this.selectText = '已选择' + this.form[this.formKey].length + '个设备';
            });
        },
        handleNodeClick (data, isDel) {
            if (this.currentNode.nodeId !== data.nodeId) {
                this.currentNode = data;
                this.searchDevice();
            } else {
                if (isDel === true) {
                    this.searchDevice();
                }
            }
        },
        async searchDevice () {
            let { data } = await this._http({
                url: this.deviceUrl || '/api/device/devices/actions/findClassbrandDevice',
                method: 'get',
                params: {
                    deviceOrgId: this.currentNode.parentId ? this.currentNode.nodeId : ''
                },
                opts: {
                    params: {
                        deviceOrgId: this.currentNode.parentId ? this.currentNode.nodeId : ''
                    }
                }
            });
            if (data) {
                let arr = data.map((item)=>{
                    return Object.assign(item, {
                        belongOrg: 'root'
                    });
                });
                this.leftData = arr;
            } else {
                this.leftData = [];
            }
        },
        update (val) {
            this.$emit('update:form', {
                ...this.form,
                [this.formKey]: val
            });
        }
    }
};

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-target-selector__container"
    }, [
        _c('BatchSelector', {
            attrs: {
                "id": "equipment-selector",
                "value": _vm.form[_vm.formKey],
                "defaultParams": _vm.defaultParams,
                "selectText": _vm.selectText
            },
            on: {
                "click": _vm.OpenSelectDialog,
                "update": _vm.update
            }
        }),
        _c('el-dialog', {
            attrs: {
                "title": _vm.title,
                "visible": _vm.dialogVisible,
                "area": [
                    900,
                    560
                ]
            },
            on: {
                "update:visible": function($event) {
                    _vm.dialogVisible = $event;
                }
            }
        }, [
            _c('div', {
                staticClass: "hik-cloud-target-selector__device-transfer"
            }, [
                _c('div', {
                    staticClass: "tree_wrap"
                }, [
                    _c('div', {
                        staticClass: "tree_title"
                    }, [
                        _vm._v(" 所属设备组织 ")
                    ]),
                    _c('el-input', {
                        staticClass: "filter-tree-input",
                        attrs: {
                            "placeholder": "搜索",
                            "clearable": ""
                        },
                        model: {
                            value: _vm.filterText,
                            callback: function($$v) {
                                _vm.filterText = $$v;
                            },
                            expression: "filterText"
                        }
                    }),
                    _c('div', {
                        staticClass: "tree_wrap_div"
                    }, [
                        _c('el-tree', {
                            ref: "deviceTree",
                            staticClass: "tree_self",
                            attrs: {
                                "data": _vm.dataFilter,
                                "props": _vm.defaultProps,
                                "default-expand-all": "",
                                "simple-data": "",
                                "node-key": "nodeId",
                                "parent-key": "parentId",
                                "filter-node-method": _vm.filterNode
                            },
                            on: {
                                "node-click": _vm.handleNodeClick
                            }
                        })
                    ], 1)
                ], 1),
                _c('div', {
                    staticClass: "class-table"
                }, [
                    _c('h-table-transfer', {
                        ref: "tableTransfer",
                        attrs: {
                            "left-table-data": _vm.leftData,
                            "right-table-data": _vm.rightData,
                            "left-table-input-ph": "搜索",
                            "cacheRightData": false,
                            "right-table-input-ph": "搜索",
                            "belong-field": "belongOrg",
                            "tree-node-id": "root",
                            "row-key": "deviceSerial",
                            "name-key": [
                                'deviceName'
                            ],
                            "left-table-title": "待选择",
                            "right-table-title": "已选择"
                        }
                    }, [
                        _c('template', {
                            slot: "leftTableColumn"
                        }, [
                            _c('el-table-column', {
                                attrs: {
                                    "prop": "deviceName",
                                    "label": _vm.label,
                                    "show-overflow-title": ""
                                }
                            })
                        ], 1),
                        _c('template', {
                            slot: "rightTableColumn"
                        }, [
                            _c('el-table-column', {
                                attrs: {
                                    "label": _vm.label,
                                    "prop": "deviceName",
                                    "show-overflow-title": ""
                                }
                            })
                        ], 1)
                    ], 2)
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
                    _vm._v(" 确 定 ")
                ]),
                _c('el-button', {
                    on: {
                        "click": _vm.onCancel
                    }
                }, [
                    _vm._v(" 取 消 ")
                ])
            ], 1)
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    class: '按班级',
    grade: '按年级',
    site: '按场地',
    device: '按设备',
    publishTypeKey: 'publishType',
    classKey: 'classTags',
    classSelectorLabel: 'fullName',
    classSelectorValue: 'nodeId',
    classTreeLabel: 'nodeName',
    classTreeUrl: '',
    classSelectedUrl: '',
    gradeKey: 'classroomTags',
    gradeSelectorLabel: 'nodeName',
    gradeSelectorValue: 'nodeId',
    gradeTreeLabel: 'nodeName',
    gradeTreeUrl: '',
    gradeSelectedUrl: '',
    siteKey: 'classroomTags',
    siteSelectorLabel: 'fullName',
    siteSelectorValue: 'nodeId',
    siteTreeLabel: 'nodeName',
    siteTreeUrl: '',
    siteSelectedUrl: '',
    deviceKey: 'deviceTags',
    deviceSelectorLabel: 'deviceName',
    deviceSelectorValue: 'deviceSerial',
    deviceTreeLabel: 'nodeName',
    deviceTreeUrl: '',
    deviceSelectedUrl: '',
    deviceUrl: ''
};
var script = {
    name: 'HikCloudTargetSelector',
    components: {
        ByClass: __vue_component__$4,
        BySite: __vue_component__$3,
        ByGrade: __vue_component__$2,
        ByDevice: __vue_component__$1
    },
    props: {
        options: {
            type: Array,
            default: ()=>[
                    'class',
                    'grade',
                    'site',
                    'device'
                ]
        },
        props: {
            type: Object,
            default: ()=>({})
        },
        form: {
            type: Object,
            default: ()=>null
        },
        moduleName: {
            type: String,
            default: ()=>null
        },
        authFlag: {
            type: String,
            default: 'school'
        },
        navName: {
            type: String,
            default: ''
        },
        selectMessage: {
            type: String,
            default: ''
        },
        filterClass: {
            type: [
                String,
                Array
            ],
            default: ''
        },
        filterGrade: {
            type: [
                String,
                Array
            ],
            default: ''
        },
        tabsShow: {
            type: Boolean,
            default: true
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
        cacheAllData (val) {
            this.$emit('cache-all-data', val);
        },
        noneSelected (val) {
            this.$emit('none-selected', val);
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
    return _c('div', [
        _vm.tabsShow ? _c('el-radio-group', {
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
                _vm._v(" " + _vm._s(_vm.map[item]) + " ")
            ]);
        }), 1) : _vm._e(),
        _c('ByClass', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.form[_vm.map.publishTypeKey] === 'class',
                    expression: "form[map.publishTypeKey] === 'class'"
                }
            ],
            key: "class",
            attrs: {
                "form": _vm.form,
                "formKey": _vm.map.classKey,
                "treeLabel": _vm.map.classTreeLabel,
                "selectorLabel": _vm.map.classSelectorLabel,
                "selectorValue": _vm.map.classSelectorValue,
                "moduleName": _vm.moduleName,
                "authFlag": _vm.authFlag,
                "navName": _vm.navName,
                "selectMessage": _vm.selectMessage,
                "filterClass": _vm.filterClass,
                "treeUrl": _vm.map.classTreeUrl,
                "selectedUrl": _vm.map.classSelectedUrl
            },
            on: {
                "check-select": function($event) {
                    return _vm.$emit('check-select');
                },
                "cache-all-data": _vm.cacheAllData,
                "none-selected": _vm.noneSelected,
                "update:form": _vm.updateForm
            }
        }),
        _c('ByGrade', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.form.publishType === 'grade',
                    expression: "form.publishType === 'grade'"
                }
            ],
            key: "grade",
            attrs: {
                "title": "选择年级",
                "form": _vm.form,
                "formKey": _vm.map.gradeKey,
                "treeLabel": _vm.map.gradeTreeLabel,
                "selectorLabel": _vm.map.gradeSelectorLabel,
                "selectorValue": _vm.map.gradeSelectorValue,
                "moduleName": _vm.moduleName,
                "authFlag": _vm.authFlag,
                "navName": _vm.navName,
                "selectMessage": _vm.selectMessage,
                "filterGrade": _vm.filterGrade,
                "treeUrl": _vm.map.gradeTreeUrl,
                "selectedUrl": _vm.map.gradeSelectedUrl
            },
            on: {
                "cache-all-data": _vm.cacheAllData,
                "check-select": function($event) {
                    return _vm.$emit('check-select');
                },
                "update:form": _vm.updateForm
            }
        }),
        _c('BySite', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.form[_vm.map.publishTypeKey] === 'site',
                    expression: "form[map.publishTypeKey] === 'site'"
                }
            ],
            key: "site",
            attrs: {
                "form": _vm.form,
                "formKey": _vm.map.siteKey,
                "treeLabel": _vm.map.siteTreeLabel,
                "selectorLabel": _vm.map.siteSelectorLabel,
                "selectorValue": _vm.map.siteSelectorValue,
                "moduleName": _vm.moduleName,
                "authFlag": _vm.authFlag,
                "navName": _vm.navName,
                "treeUrl": _vm.map.siteTreeUrl,
                "selectedUrl": _vm.map.siteSelectedUrl
            },
            on: {
                "check-select": function($event) {
                    return _vm.$emit('check-select');
                },
                "cache-all-data": _vm.cacheAllData,
                "none-selected": _vm.noneSelected,
                "update:form": _vm.updateForm
            }
        }),
        _c('ByDevice', {
            directives: [
                {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.form[_vm.map.publishTypeKey] === 'device',
                    expression: "form[map.publishTypeKey] === 'device'"
                }
            ],
            key: "device",
            ref: "device",
            attrs: {
                "form": _vm.form,
                "formKey": _vm.map.deviceKey,
                "treeLabel": _vm.map.deviceTreeLabel,
                "selectorLabel": _vm.map.deviceSelectorLabel,
                "selectorValue": _vm.map.deviceSelectorValue,
                "moduleName": _vm.moduleName,
                "authFlag": _vm.authFlag,
                "navName": _vm.navName,
                "treeUrl": _vm.map.deviceTreeUrl,
                "selectedUrl": _vm.map.deviceSelectedUrl,
                "deviceUrl": _vm.map.deviceUrl
            },
            on: {
                "check-select": function($event) {
                    return _vm.$emit('check-select');
                },
                "cache-all-data": _vm.cacheAllData,
                "none-selected": _vm.noneSelected,
                "update:form": _vm.updateForm
            }
        })
    ], 1);
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

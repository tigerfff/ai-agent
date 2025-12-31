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

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: "HikCloudInputTag",
    model: {
        prop: "value",
        event: "change"
    },
    props: {
        placeholder: {
            type: String,
            default: t("ym.inputTag.placeholder")
        },
        value: {
            type: Array,
            default: ()=>[]
        },
        tagsLength: {
            type: Number,
            default: 3
        },
        width: {
            type: String,
            default: "100%"
        }
    },
    data () {
        return {
            tags: [
                ...this.value
            ],
            inputVal: "",
            editingIndex: -1,
            showHint: false,
            showErrorMsg: false,
            msg: ""
        };
    },
    watch: {
        value: {
            handler (newVal) {
                if (JSON.stringify(newVal) !== JSON.stringify(this.tags)) {
                    this.tags = [
                        ...newVal
                    ];
                }
            },
            immediate: true
        },
        tags: {
            handler (newVal) {
                this.$emit("change", [
                    ...newVal
                ]);
            },
            deep: true,
            immediate: true
        }
    },
    methods: {
        handleBlur (e) {
            this.addTag(e);
            this.showHint = false;
        },
        addTag (e) {
            if (e && e.keyCode === 32 || e.type === "blur" || e.key === "Enter") {
                const value = this.inputVal.trim();
                if (this.editingIndex >= 0) {
                    // 编辑现有标签
                    if (value) {
                        this.tags.splice(this.editingIndex, 1, value);
                    } else {
                        this.tags.splice(this.editingIndex, 1);
                    }
                    this.editingIndex = -1;
                } else if (value) {
                    if (this.tags.length >= this.tagsLength) {
                        this.showErrorMsg = true;
                        this.msg = t("ym.inputTag.errorMsg", {
                            value: this.tagsLength
                        });
                        return;
                    }
                    this.showErrorMsg = false;
                    this.msg = "";
                    this.tags.push(value);
                }
                this.showErrorMsg = false;
                this.msg = "";
                this.inputVal = "";
            }
        },
        deleteTag (index) {
            this.tags.splice(index, 1);
        },
        startEdit (index) {
            if (this.editingIndex >= 0) {
                this.addTag({
                    type: "blur"
                });
            }
            this.editingIndex = index;
            this.inputVal = this.tags[index];
            // this.tags.splice(index, 1)
            this.$nextTick(()=>{
                this.$refs.input.focus();
            });
        },
        handleDelete () {
            if (!this.inputVal && this.tags.length > 0) {
                this.tags.pop();
            }
        },
        // 新增清空全部标签方法
        deleteAllTags () {
            this.tags = [];
            this.inputVal = "";
            this.editingIndex = -1;
            this.$nextTick(()=>{
                this.$refs.input.focus();
            });
        },
        focusInput () {
            this.$refs.input.focus();
        }
    }
};

var img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAOCAYAAAAvxDzwAAAAAXNSR0IArs4c6QAAAY1JREFUOBGdkr9Kw1AUxr1trNWA2ECxEEgdQpA8QBcXh06Z3dTNbJnyAr5GwSVIXBwlW9xEKB06dBdKO5aipbQg/onnCzntNUKpPfBxzr3nO7/cJFdsLUMsy0WFPRY2E0lYy4FeapazbCjQgsUPw9C3JNmPOpGfLjcBUkhF5MFg4KJpGMYNpU/SV5YB/xMM5QxIiaSSKu12+2w+n39AqLGX9eCBl+c4/9qQYVoQBCfT6fRtNpslEGrsEURbAV0AGbZH5orneceTyeSFYZyxhx48JHjzJ02BDNslw4FlWfpoNHpiSD6jBw+8JMzI0PRP4geUM0NtOBze5iH5NTzkr2UzmAWjwNcCix1SqdfrXWmadkn1yoAHXjLhdJhdAPG622jEcdw0TfOa6rUCXsyQGVAwioDhG5RbrZbtOE4ohMCHXjcKuq436/X6YxRFrzSUALjvuu6h7/v3iqLgm/wr6ABl27ZPx+PxQ7fbfRdHFJ1OJ1RVFfdr46Cf9txoNC5Ev98Pq9Xq+cYkaZCu090PiV/D3i3TpY8AAAAASUVORK5CYII=";

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
var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        style: {
            width: _vm.width
        }
    }, [
        _c('div', {
            staticClass: "hik-cloud-tag-input",
            class: {
                error: _vm.showErrorMsg
            }
        }, [
            _c('div', {
                staticClass: "hik-cloud-tag-wrapper"
            }, [
                _c('div', {
                    ref: "inputWrapper",
                    staticClass: "input-wrapper",
                    on: {
                        "click": _vm.focusInput
                    }
                }, [
                    _vm._l(_vm.tags, function(tag, index) {
                        return _c('span', {
                            key: index,
                            staticClass: "tag-item",
                            class: {
                                editing: _vm.editingIndex === index
                            },
                            on: {
                                "click": function($event) {
                                    $event.stopPropagation();
                                    return _vm.startEdit(index);
                                }
                            }
                        }, [
                            _vm.editingIndex !== index ? _c('span', [
                                _vm._v(_vm._s(tag))
                            ]) : _vm._e(),
                            _c('span', {
                                staticClass: "delete",
                                on: {
                                    "click": function($event) {
                                        $event.stopPropagation();
                                        return _vm.deleteTag(index);
                                    }
                                }
                            }, [
                                _vm._v("×")
                            ])
                        ]);
                    }),
                    _c('input', {
                        directives: [
                            {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.inputVal,
                                expression: "inputVal"
                            }
                        ],
                        ref: "input",
                        staticClass: "inner-input",
                        attrs: {
                            "placeholder": !_vm.tags.length ? _vm.placeholder : '',
                            "type": "text"
                        },
                        domProps: {
                            "value": _vm.inputVal
                        },
                        on: {
                            "keydown": [
                                function($event) {
                                    if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "delete", [
                                        8,
                                        46
                                    ], $event.key, [
                                        "Backspace",
                                        "Delete",
                                        "Del"
                                    ])) {
                                        return null;
                                    }
                                    return _vm.handleDelete.apply(null, arguments);
                                },
                                function($event) {
                                    if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "space", 32, $event.key, [
                                        " ",
                                        "Spacebar"
                                    ])) {
                                        return null;
                                    }
                                    $event.preventDefault();
                                    return _vm.addTag.apply(null, arguments);
                                },
                                function($event) {
                                    if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
                                        return null;
                                    }
                                    $event.preventDefault();
                                    return _vm.addTag.apply(null, arguments);
                                }
                            ],
                            "blur": _vm.handleBlur,
                            "focus": function($event) {
                                _vm.showHint = true;
                            },
                            "input": function($event) {
                                if ($event.target.composing) {
                                    return;
                                }
                                _vm.inputVal = $event.target.value;
                            }
                        }
                    })
                ], 2),
                _vm.tags.length > 0 ? _c('span', {
                    staticClass: "clear-all h-icon-close_f",
                    on: {
                        "click": function($event) {
                            $event.stopPropagation();
                            return _vm.deleteAllTags.apply(null, arguments);
                        }
                    }
                }) : _vm._e()
            ]),
            _vm.showHint && !_vm.inputVal && !_vm.tags.length ? _c('div', {
                staticClass: "bubble-hint"
            }, [
                _vm._v(" 可使用键盘 "),
                _c('span', {
                    staticStyle: {
                        "color": "#ff5e34"
                    }
                }, [
                    _vm._v(" \"空格键\" ")
                ]),
                _vm._v(" 间隔多个关键词内容进行搜索 "),
                _c('img', {
                    staticClass: "bubble-hint-img",
                    attrs: {
                        "src": img,
                        "alt": ""
                    }
                })
            ]) : _vm._e()
        ]),
        _vm.showErrorMsg ? _c('div', {
            staticClass: "hik-cloud-tag-error-msg"
        }, [
            _vm._v(" " + _vm._s(_vm.msg) + " ")
        ]) : _vm._e()
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

import Vue from 'vue';
import deepmerge from 'deepmerge';
import emitter from 'hui/src/mixins/emitter';

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudLevelBread',
    components: {},
    props: {
        isTranslate: {
            type: Boolean,
            default: false
        },
        maxLevel: {
            type: Number,
            default: 3
        },
        propMap: {
            type: Object,
            default: undefined
        }
    },
    data () {
        return {
            breads: [
                {}
            ],
            maxWidth: 100,
            map: {
                nodeId: 'nodeId',
                nodeName: 'nodeName'
            }
        };
    },
    computed: {
        disPlayBread () {
            return this.breads.length > this.maxLevel ? this.breads.slice(this.breads.length - this.maxLevel) : this.breads;
        }
    },
    mounted () {
        window.addEventListener('resize', this.resize);
        this.resize();
        if (this.propMap) {
            Object.assign(this.map, this.propMap);
        }
    },
    destroyed () {
        window.removeEventListener('resize', this.resize);
    },
    methods: {
        resize () {
            this.maxWidth = Math.floor((this.$refs.eBreadcrumb.clientWidth - 40 - 20 * (this.maxLevel - 1)) / this.maxLevel);
        },
        // 初始化数据
        init (breads) {
            this.breads = JSON.parse(JSON.stringify(breads));
        // this.$renderWeChat()
        },
        // 压入数据
        push (map) {
            this.breads.push(map);
            this.breadChangeEvent();
        // this.$renderWeChat()
        },
        breadChangeEvent () {
            this.$emit('change', this.breads);
        },
        // 定位到当前部门
        toDepartment (bread) {
            const idx = this.breads.findIndex((b)=>{
                return b[this.map.nodeId] === bread[this.map.nodeId];
            });
            if (idx === this.breads.length - 1) return;
            this.$emit('click', bread, ()=>{
                this.breads = this.breads.splice(0, idx + 1);
                this.breadChangeEvent();
            });
        },
        forwardLevel () {
            this.toDepartment(this.breads[this.breads.length - 2]);
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

const __vue_script__$2 = script$2;
/* template */ var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        ref: "eBreadcrumb",
        staticClass: "hik-cloud-eBreadcrumb"
    }, [
        _vm.breads.length > _vm.maxLevel ? _c('div', {
            staticClass: "arrow",
            on: {
                "click": _vm.forwardLevel
            }
        }, [
            _c('i', {
                staticClass: "touchable icon iconfont iconcommon_back back-btn",
                staticStyle: {
                    "margin-right": "5px"
                }
            })
        ]) : _vm._e(),
        _c('div', {
            staticClass: "bodyPart",
            attrs: {
                "id": "bodyPart"
            }
        }, [
            _c('div', {
                staticClass: "el-breadcrumb",
                attrs: {
                    "id": "elBreadcrumb"
                }
            }, _vm._l(_vm.disPlayBread, function(bread, idx) {
                return _c('span', {
                    key: bread[_vm.map.nodeId],
                    staticClass: "el-breadcrumb__item"
                }, [
                    _c('span', {
                        staticClass: "el-breadcrumb__item__inner touchable",
                        style: {
                            'max-width': _vm.maxWidth + 'px'
                        },
                        attrs: {
                            "title": "",
                            "role": "link"
                        },
                        on: {
                            "click": function($event) {
                                return _vm.toDepartment(bread);
                            }
                        }
                    }, [
                        _vm.isTranslate && !(!bread.openid && idx === 0) ? _c('ww-open-data', {
                            attrs: {
                                "type": bread.opentype,
                                "openid": bread.openid,
                                "lang": "zh_CN"
                            }
                        }) : _c('span', [
                            _vm._v(_vm._s(bread[_vm.map.nodeName]))
                        ])
                    ], 1),
                    _c('span', {
                        staticClass: "el-breadcrumb__separator h-icon-angle_right"
                    })
                ]);
            }), 0)
        ])
    ]);
};
var __vue_staticRenderFns__$2 = [];
/* style */ const __vue_inject_styles__$2 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$2 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$2,
    staticRenderFns: __vue_staticRenderFns__$2
}, __vue_inject_styles__$2, __vue_script__$2);

function createNamespace(name) {
    name = 'hik-cloud-' + name;
    return [
        createBEM(name),
        kebabToPascal(name)
    ];
}
/**
 * 将短横线命名转换为驼峰命名（首字母大写）
 * @param {string} str - 短横线命名的字符串（例如：page-dual-table-transfer）
 * @returns {string} 驼峰命名的字符串（例如：PageDualTableTransfer）
 */ function kebabToPascal(str) {
    if (!str || typeof str !== 'string') return str;
    return str.split('-') // 按短横线分割
    .map((word)=>word.charAt(0).toUpperCase() + word.slice(1)) // 每个单词首字母大写
    .join(''); // 拼接成完整字符串
}
function gen(name, mods) {
    if (!mods) {
        return '';
    }
    if (typeof mods === 'string') {
        return ` ${name}--${mods}`;
    }
    if (Array.isArray(mods)) {
        return mods.reduce((ret, item)=>ret + gen(name, item), '');
    }
    return Object.keys(mods).reduce((ret, key)=>ret + (mods[key] ? gen(name, key) : ''), '');
}
function createBEM(name) {
    return function(el, mods) {
        if (el && typeof el !== 'string') {
            mods = el;
            el = '';
        }
        el = el ? `${name}__${el}` : name;
        return `${el}${gen(el, mods)}`;
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
const [bem, name] = createNamespace('flex-layout-box');
var script$1 = {
    name,
    inheritAttrs: false,
    props: {
        showTop: {
            type: Boolean,
            default: true
        },
        showBottom: {
            type: Boolean,
            default: true
        },
        scroll: {
            type: Boolean,
            default: false
        },
        actionStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        searchStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        midStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        footerStyle: {
            type: [
                String,
                Object
            ],
            default: ()=>({})
        },
        slotDefaultClass: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        rootStyle () {
            return {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0
            };
        }
    },
    methods: {
        bem
    }
};

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _obj;
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        ref: "root",
        class: _vm.bem(),
        style: _vm.rootStyle
    }, [
        _vm.$slots.action ? _c('div', {
            class: _vm.slotDefaultClass && _vm.bem('action'),
            style: _vm.actionStyle
        }, [
            _vm._t("action")
        ], 2) : _vm._e(),
        _vm.$slots.search ? _c('div', {
            class: _vm.slotDefaultClass && _vm.bem('search'),
            style: _vm.searchStyle
        }, [
            _vm._t("search")
        ], 2) : _vm._e(),
        _vm.$slots.default ? _c('div', {
            class: [
                _vm.bem('mid'),
                (_obj = {}, _obj[_vm.bem('mid', 'scroll')] = _vm.scroll, _obj)
            ],
            style: _vm.midStyle
        }, [
            _vm._t("default")
        ], 2) : _vm._e(),
        _vm.$slots.footer ? _c('div', {
            class: _vm.slotDefaultClass && _vm.bem('footer'),
            style: _vm.footerStyle
        }, [
            _vm._t("footer")
        ], 2) : _vm._e()
    ]);
};
var __vue_staticRenderFns__$1 = [];
/* style */ const __vue_inject_styles__$1 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$1 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1);

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

// 数组去重
function matchArr(arr1, nodeId = 'nodeId') {
    const arr = [];
    for(let i = 0; i < arr1.length; i++){
        const idx = arr.findIndex((a)=>{
            return a[nodeId] === arr1[i][nodeId];
        });
        if (idx === -1) {
            arr.push(arr1[i]);
        }
    }
    return arr;
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudOrganizer',
    components: {
        // 面包屑组件
        bread: __vue_component__$2,
        FlexLayoutBox: __vue_component__$1
    },
    mixins: [
        emitter,
        Locale
    ],
    props: {
        isTranslate: {
            type: Boolean,
            default: false
        },
        // 待选列表
        waitSelect: {
            type: Array,
            default: ()=>[]
        },
        tableHeadName: {
            type: String,
            default: '部门/人员名称'
        },
        // 加载提示
        loading: {
            type: Boolean,
            default: false
        },
        // 头部面包属性配置
        breadProps: {
            type: Object,
            default: undefined
        },
        // 默认映射key
        nodeMap: {
            type: Object,
            default: ()=>{
                return {
                    nodeId: 'nodeId',
                    nodeName: 'nodeName',
                    nodeType: 'type'
                };
            }
        },
        validateEvent: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            loadText: this.t('ym.organizer.loading'),
            // 待选择数据
            optionsDataList: [],
            // 缓存的待选择列表
            cacheWaitRows: [],
            // 已选择列表
            alreadyRows: [],
            // 缓存的已选择列表
            cacheAlreadyRows: [],
            // 已选择列表过滤条件
            acondition: '',
            // 带选择列表过滤条件
            wcondition: '',
            plain: true,
            // 是否有校验错误
            breads: [
                {}
            ]
        };
    },
    computed: {
        // 已选择列表
        arows () {
            const rows = JSON.parse(JSON.stringify(this.alreadyRows));
            const arr = rows.filter((r)=>{
                if (!r[this.nodeMap.nodeName]) {
                    r[this.nodeMap.nodeName] = '';
                }
                return r[this.nodeMap.nodeName].search(this.acondition) !== -1;
            });
            return matchArr(arr, this.nodeMap.nodeId);
        },
        breadMap () {
            return this.nodeMap;
        },
        /**
     * 当前列表勾选项
     */ currentListSelect () {
            const _list = [];
            const rows = JSON.parse(JSON.stringify(this.alreadyRows));
            rows.forEach((a)=>{
                const r = this.waitSelect.find((b)=>a[this.nodeMap.nodeId] === b[this.nodeMap.nodeId]);
                if (r) _list.push(r);
            });
            return _list;
        }
    },
    watch: {
        waitSelect: {
            handler: function(val) {
                this.optionsDataList = val;
            },
            immediate: true
        },
        alreadyRows: {
            handler: function(val) {
                if (val) {
                    if (this.validateEvent) this.dispatch('ElFormItem', 'el.form.change', [
                        val
                    ]);
                }
            }
        }
    },
    created () {
        if (this.breadProps) Object.assign(this.breadMap, this.breadProps);
    },
    mounted () {
        this.initBread();
    },
    methods: {
        initBread (breads) {
            this.$refs.breadComponents.init(breads || [
                {
                    [this.nodeMap.nodeName]: '全部'
                }
            ]);
        },
        // 初始化所选数据
        initSelected (data) {
            this.optionsDataList = [];
            this.$refs.waitSelect.clearSelection();
            this.alreadyRows = data;
            this.alreadyRows.forEach((val)=>{
                this.$refs.waitSelect.toggleRowSelection(val, true);
            });
            // 首次待选数据中存在已选项时，选中选项，不清楚table内部机制，暂时这么处理
            this.$nextTick(()=>{
                this.optionsDataList = this.waitSelect;
            });
        },
        /**
     * 获取table-key
     */ getRowKey (row) {
            return row.nodeId;
        // return `${row[this.nodeMap.nodeId]}`
        },
        /**
     * 改变选选择
     */ handleSelectChange (select) {
            this.alreadyRows = select;
            this.$emit('selectionChange', select);
        },
        /**
     * 搜索
     */ searchDataByCondition (e) {
            if (e && e.isTrusted) {
                if (this.wcondition) this.$emit('search', this.wcondition, this.initBread);
            }
        },
        // 当前节点是否可选中
        selectable (row) {
            return !row.disable;
        },
        /**
     * 勾选后disable下级按钮
     */ disabledItem (row) {
            return this.alreadyRows.filter((val)=>val[this.nodeMap.nodeId] === row[this.nodeMap.nodeId]).length !== 0;
        },
        /**
     * Y轴滚动事件回调
     * 懒加载数据
     * 暂时不做此功能
     */ handleScrollY (scrollTop, percentY) {
        },
        // 初始化数据
        init (rows) {
            this.alreadyRows = JSON.parse(JSON.stringify(rows));
        },
        // 外部设置搜索内容，用于状态切换或者代码发起的搜索
        setSearchCondition (keyword) {
            this.wcondition = keyword;
        },
        // 清除搜索条件出发事件
        clearSearch () {
            this.wcondition = '';
            this.$emit('clearSearch', this.wcondition, this.initBread);
            // this.$emit('search', this.wcondition, this.initBread)
            this.initBread();
        },
        handleClearSearch () {
            if (this.wcondition === '') {
                this.$emit('clearSearch', this.wcondition, this.initBread);
                this.initBread();
            }
        },
        // 加载下机架
        loadNextDepart (node) {
            this.$emit('departmentChange', node, ()=>{
                this.$refs.breadComponents.push(node);
            });
        },
        // 获取所选
        getSelected () {
            return this.alreadyRows;
        },
        // 删除人员或部门
        delItem (row) {
            const idx = this.alreadyRows.findIndex((b)=>{
                return b[this.nodeMap.nodeId] === row[this.nodeMap.nodeId];
            });
            this.alreadyRows.splice(idx, 1);
            this.$refs.waitSelect.toggleRowSelection(row, false);
            this.$emit('selectionChange', this.alreadyRows);
        },
        // 监听面包屑的点击事件
        breadClick (bread, cb) {
            // todo: 处理面包线
            this.$emit('breadClick', bread, cb);
        },
        breadChange (breads) {
            this.$emit('breadChange', breads);
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-organizer"
    }, [
        _c('div', {
            staticClass: "contentPart"
        }, [
            _c('div', {
                staticClass: "box waitWarp"
            }, [
                _c('flex-layout-box', {
                    attrs: {
                        "slotDefaultClass": false
                    },
                    scopedSlots: _vm._u([
                        {
                            key: "action",
                            fn: function() {
                                return [
                                    _c('div', {
                                        staticClass: "titlePart"
                                    }, [
                                        _c('div', [
                                            _vm._v(" " + _vm._s(_vm.t('ym.organizer.toBeSelected')) + "（" + _vm._s(_vm.waitSelect.length - _vm.currentListSelect.length) + " / " + _vm._s(_vm.waitSelect.length) + "） ")
                                        ]),
                                        _vm._t("leftOpear")
                                    ], 2)
                                ];
                            },
                            proxy: true
                        },
                        {
                            key: "search",
                            fn: function() {
                                return [
                                    _c('div', {
                                        staticClass: "filterPart"
                                    }, [
                                        _c('el-input', {
                                            attrs: {
                                                "placeholder": _vm.t('ym.base.search'),
                                                "suffix-icon": "h-icon-search",
                                                "on-icon-click": _vm.searchDataByCondition,
                                                "clear-icon-click": _vm.clearSearch,
                                                "clearable": ""
                                            },
                                            nativeOn: {
                                                "keyup": [
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
                                                        return _vm.handleClearSearch.apply(null, arguments);
                                                    },
                                                    function($event) {
                                                        if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
                                                            return null;
                                                        }
                                                        return _vm.searchDataByCondition.apply(null, arguments);
                                                    }
                                                ]
                                            },
                                            model: {
                                                value: _vm.wcondition,
                                                callback: function($$v) {
                                                    _vm.wcondition = $$v;
                                                },
                                                expression: "wcondition"
                                            }
                                        })
                                    ], 1),
                                    _c('div', {
                                        staticClass: "breadPart"
                                    }, [
                                        _c('bread', {
                                            ref: "breadComponents",
                                            attrs: {
                                                "propMap": _vm.breadMap,
                                                "isTranslate": _vm.isTranslate
                                            },
                                            on: {
                                                "click": _vm.breadClick,
                                                "change": _vm.breadChange
                                            }
                                        })
                                    ], 1)
                                ];
                            },
                            proxy: true
                        },
                        {
                            key: "default",
                            fn: function() {
                                return [
                                    _c('el-table', {
                                        directives: [
                                            {
                                                name: "loading",
                                                rawName: "v-loading",
                                                value: _vm.loading,
                                                expression: "loading"
                                            }
                                        ],
                                        ref: "waitSelect",
                                        attrs: {
                                            "element-loading-text": _vm.loadText,
                                            "force-scroll": "",
                                            "data": _vm.optionsDataList,
                                            "row-key": _vm.nodeMap.nodeId,
                                            "show-overflow-title": ""
                                        },
                                        on: {
                                            "selection-change": _vm.handleSelectChange,
                                            "on-scrolling-y": _vm.handleScrollY
                                        }
                                    }, [
                                        _c('el-table-column', {
                                            attrs: {
                                                "reserve-selection": "",
                                                "type": "selection",
                                                "selectable": _vm.selectable
                                            }
                                        }),
                                        _c('el-table-column', {
                                            attrs: {
                                                "label": _vm.tableHeadName
                                            },
                                            scopedSlots: _vm._u([
                                                {
                                                    key: "default",
                                                    fn: function(scope) {
                                                        return [
                                                            _vm._t("leftContent", function() {
                                                                return [
                                                                    _c('div', {
                                                                        staticClass: "colWarp"
                                                                    }, [
                                                                        _vm.isTranslate ? _c('div', {
                                                                            staticClass: "rowline"
                                                                        }, [
                                                                            _c('i', {
                                                                                class: scope.row.icon
                                                                            }),
                                                                            _c('ww-open-data', {
                                                                                attrs: {
                                                                                    "type": scope.row.opentype,
                                                                                    "openid": scope.row.openid,
                                                                                    "lang": "zh_CN"
                                                                                }
                                                                            })
                                                                        ], 1) : _c('div', {
                                                                            staticClass: "rowline"
                                                                        }, [
                                                                            _c('i', {
                                                                                class: scope.row.icon
                                                                            }),
                                                                            _c('span', [
                                                                                _vm._v(_vm._s(scope.row[_vm.nodeMap.nodeName]))
                                                                            ])
                                                                        ])
                                                                    ])
                                                                ];
                                                            }, {
                                                                "row": scope.row
                                                            })
                                                        ];
                                                    }
                                                }
                                            ], null, true)
                                        }),
                                        _c('el-table-column', {
                                            attrs: {
                                                "min-width": "55px",
                                                "width": "80",
                                                "label": _vm.t('ym.organizer.operation')
                                            },
                                            scopedSlots: _vm._u([
                                                {
                                                    key: "default",
                                                    fn: function(scope) {
                                                        return [
                                                            _c('div', {
                                                                staticClass: "warp"
                                                            }, [
                                                                scope.row[_vm.nodeMap.nodeType] === 0 ? _c('el-button', {
                                                                    attrs: {
                                                                        "type": "link",
                                                                        "disabled": _vm.disabledItem(scope.row)
                                                                    },
                                                                    on: {
                                                                        "click": function($event) {
                                                                            return _vm.loadNextDepart(scope.row, true);
                                                                        }
                                                                    }
                                                                }, [
                                                                    _vm._v(" " + _vm._s(_vm.t('ym.organizer.lowerLevel')) + " ")
                                                                ]) : _vm._e()
                                                            ], 1)
                                                        ];
                                                    }
                                                }
                                            ])
                                        })
                                    ], 1)
                                ];
                            },
                            proxy: true
                        }
                    ], null, true)
                })
            ], 1),
            _c('div', {
                staticClass: "box alreadyWarp"
            }, [
                _c('flex-layout-box', {
                    attrs: {
                        "slotDefaultClass": false
                    },
                    scopedSlots: _vm._u([
                        {
                            key: "action",
                            fn: function() {
                                return [
                                    _c('div', {
                                        staticClass: "titlePart"
                                    }, [
                                        _c('div', [
                                            _vm._v(_vm._s(_vm.t('ym.organizer.selected')) + "（" + _vm._s(_vm.alreadyRows.length) + "）")
                                        ]),
                                        _vm._t("rightOpear")
                                    ], 2)
                                ];
                            },
                            proxy: true
                        },
                        {
                            key: "search",
                            fn: function() {
                                return [
                                    _c('div', {
                                        staticClass: "filterPart"
                                    }, [
                                        _c('el-input', {
                                            attrs: {
                                                "placeholder": _vm.t('ym.base.search'),
                                                "suffix-icon": "h-icon-search",
                                                "clearable": ""
                                            },
                                            model: {
                                                value: _vm.acondition,
                                                callback: function($$v) {
                                                    _vm.acondition = $$v;
                                                },
                                                expression: "acondition"
                                            }
                                        })
                                    ], 1)
                                ];
                            },
                            proxy: true
                        },
                        {
                            key: "default",
                            fn: function() {
                                return [
                                    _c('el-table', {
                                        staticClass: "alreadyWarp-table",
                                        attrs: {
                                            "element-loading-text": _vm.loadText,
                                            "force-scroll": "",
                                            "data": _vm.arows,
                                            "show-overflow-title": ""
                                        }
                                    }, [
                                        _c('el-table-column', {
                                            attrs: {
                                                "label": _vm.tableHeadName
                                            },
                                            scopedSlots: _vm._u([
                                                {
                                                    key: "default",
                                                    fn: function(scope) {
                                                        return [
                                                            _vm._t("rightContent", function() {
                                                                return [
                                                                    _c('div', {
                                                                        staticClass: "colWarp"
                                                                    }, [
                                                                        _vm.isTranslate ? _c('div', {
                                                                            staticClass: "rowline"
                                                                        }, [
                                                                            _c('i', {
                                                                                class: scope.row.icon
                                                                            }),
                                                                            _c('ww-open-data', {
                                                                                attrs: {
                                                                                    "type": scope.row.opentype,
                                                                                    "openid": scope.row.openid,
                                                                                    "lang": "zh_CN"
                                                                                }
                                                                            })
                                                                        ], 1) : _c('div', {
                                                                            staticClass: "rowline"
                                                                        }, [
                                                                            _c('i', {
                                                                                class: scope.row.icon
                                                                            }),
                                                                            _c('span', [
                                                                                _vm._v(_vm._s(scope.row[_vm.nodeMap.nodeName]))
                                                                            ])
                                                                        ])
                                                                    ])
                                                                ];
                                                            }, {
                                                                "row": scope.row
                                                            })
                                                        ];
                                                    }
                                                }
                                            ], null, true)
                                        }),
                                        _c('el-table-column', {
                                            attrs: {
                                                "width": "80px",
                                                "label": _vm.t('ym.organizer.operation')
                                            },
                                            scopedSlots: _vm._u([
                                                {
                                                    key: "default",
                                                    fn: function(scope) {
                                                        return [
                                                            _c('el-button', {
                                                                attrs: {
                                                                    "type": "text",
                                                                    "title": _vm.t('ym.organizer.delete'),
                                                                    "icon": "h-icon-delete"
                                                                },
                                                                on: {
                                                                    "click": function($event) {
                                                                        return _vm.delItem(scope.row);
                                                                    }
                                                                }
                                                            })
                                                        ];
                                                    }
                                                }
                                            ])
                                        })
                                    ], 1)
                                ];
                            },
                            proxy: true
                        }
                    ], null, true)
                })
            ], 1)
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
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

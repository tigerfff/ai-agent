import emitter from 'hui/src/mixins/emitter';
import Vue from 'vue';
import deepmerge from 'deepmerge';

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
const [bem, name$1] = createNamespace('flex-layout-box');
var script$1 = {
    name: name$1,
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
const [b, name] = createNamespace('dual-selection-table');
var script = {
    name,
    components: {
        FlexLayoutBox: __vue_component__$1
    },
    mixins: [
        emitter
    ],
    props: {
        // 接口请求方法，需返回Promise，传入参数: {page, pageSize, keyword}
        fetchMethod: {
            type: Function,
            required: true
        },
        fetchOtherParams: {
            type: Object,
            default: ()=>{}
        },
        // v-model绑定值
        value: {
            type: Array,
            default: ()=>[]
        },
        // 处理接口返回值的方法
        responseHandler: {
            type: Function,
            default: (response)=>// 默认处理方法，假设返回格式为 {data: [], total: 0}
                ({
                    data: response.data || [],
                    total: response.total || 0
                })
        },
        searchPlaceholder: {
            type: String,
            default: t('ym.dualTableTransfer.searchPlaceholder')
        },
        rightSearchPlaceholder: {
            type: String,
            default: t('ym.dualTableTransfer.searchPlaceholder')
        },
        // 左侧表格空数据时显示的文本内容
        leftEmptyText: {
            type: String,
            default: t('ym.dualTableTransfer.leftEmptyText')
        },
        // 左侧表格数据是否可以勾选方法
        selectable: {
            type: Function,
            default: null
        },
        // 行主键（用于唯一标识一行数据）
        rowKey: {
            type: String,
            default: 'id'
        },
        // 左侧table的搜索key值
        leftSearchKey: {
            type: String,
            default: 'keyword'
        },
        // 表格高度
        tableHeight: {
            type: [
                String,
                Number
            ],
            default: '100%'
        },
        // 是否显示搜索框
        showSearch: {
            type: Boolean,
            default: true
        },
        // 是否显示左侧分页器
        showPagination: {
            type: Boolean,
            default: true
        },
        // 是否显示右侧分页器
        showRightPagination: {
            type: Boolean,
            default: true
        },
        // 默认分页大小
        defaultPageSize: {
            type: Number,
            default: 10
        },
        // 搜索的字段列表
        searchFields: {
            type: Array,
            default: ()=>[
                    'name'
                ]
        },
        // form校验字段
        validateEvent: {
            type: Boolean,
            default: true
        },
        // 最大可选数量，为0表示不限制
        maxSelectionLimit: {
            type: Number,
            default: 0
        },
        maxLimitMessage: {
            type: String,
            default: t('ym.dualTableTransfer.maxLimitMessage')
        },
        // 2.45和安全中心约定最大值1万，超过这个数字不展示全选全部
        maxListLimit: {
            type: Number,
            default: 10000
        },
        // 是否可以左边数据传右边
        moveToLeftButtonFlag: {
            type: Boolean,
            default: true
        },
        // 是否可以右边传左边
        moveToRightButtonFlag: {
            type: Boolean,
            default: true
        },
        initFetch: {
            type: Boolean,
            default: false
        },
        // 右侧删除按钮是否固定
        deleteFixed: {
            type: [
                Boolean,
                String
            ],
            default: false
        },
        // 是否展示底部插槽
        showFooter: {
            type: Boolean,
            default: true
        },
        // 是否启用虚拟滚动
        enableVirtualScroll: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            // 左侧表格数据 (从后端获取的当前页数据)
            leftTableData: [],
            // 已选择的所有数据（维护所有选中项）
            selectedData: [],
            // 左侧表格搜索关键字
            leftSearchKeyword: '',
            // 右侧表格搜索关键字
            rightSearchKeyword: '',
            // 左侧表格分页当前页
            leftCurrentPage: 1,
            // 左侧表格分页大小
            leftPageSize: this.defaultPageSize,
            // 右侧表格分页当前页
            rightCurrentPage: 1,
            // 右侧表格分页大小
            rightPageSize: this.defaultPageSize,
            // 左侧表格总数据量
            leftTotalCount: 0,
            // 标记是否是内部操作，避免无限循环
            isInternalUpdate: false,
            // 左侧加载状态
            leftLoading: false,
            // 标记当前页的选中ID (用于优化左侧表格selection显示)
            currentPageSelectedIds: [],
            // 左边table的当页选择数量
            currentLeftPageData: [],
            selections: [
                {
                    value: 'all',
                    text: t('ym.dualTableTransfer.selectAll'),
                    onClick: ()=>{
                        this.handleSelect('all');
                    }
                },
                {
                    value: 'page',
                    text: t('ym.dualTableTransfer.selectCurrentPage'),
                    onClick: ()=>{
                        this.handleSelect('page');
                    }
                }
            ]
        };
    },
    computed: {
        // 右侧表格过滤后的数据
        filteredSelectedData () {
            if (!this.rightSearchKeyword.trim()) {
                return this.selectedData;
            }
            // 前端搜索过滤
            return this.selectedData.filter((item)=>this.searchFields.some((field)=>{
                    if (item[field]) {
                        return item[field].toString().toLowerCase().includes(this.rightSearchKeyword.toLowerCase());
                    }
                    return false;
                }));
        },
        // 过滤后的右侧数据总数
        filteredSelectedDataTotal () {
            return this.filteredSelectedData.length;
        },
        // 右侧表格分页后的数据
        filteredRightTableData () {
            if (!this.showRightPagination) {
                return this.filteredSelectedData;
            }
            const startIndex = (this.rightCurrentPage - 1) * this.rightPageSize;
            const endIndex = startIndex + this.rightPageSize;
            return this.filteredSelectedData.slice(startIndex, endIndex);
        }
    },
    watch: {
        selectedData: {
            handler (val) {
                if (this.validateEvent) this.dispatch('ElFormItem', 'el.form.change', [
                    val
                ]);
            },
            deep: true
        },
        fetchOtherParams: {
            handler () {
                this.leftCurrentPage = 1;
                this.loadLeftTableData();
            },
            deep: true
        },
        value: {
            handler (newVal) {
                if (newVal && JSON.stringify(newVal) !== JSON.stringify(this.selectedData)) {
                    this.selectedData = [
                        ...newVal
                    ];
                    this.$nextTick(()=>{
                        this.updateLeftTableSelection();
                    });
                }
            },
            deep: true
        }
    },
    created () {
        // 初始化选中数据，使用v-model值
        this.selectedData = [
            ...this.value || []
        ];
        if (this.initFetch) this.loadLeftTableData();
    },
    mounted () {
        // 初始化选中状态
        this.$nextTick(()=>{
            this.updateLeftTableSelection();
        });
    },
    methods: {
        b,
        t,
        actualSelectable (row, index) {
            // moveToLeftButtonFlag优先级高
            if (this.moveToLeftButtonFlag === false) return false;
            // 如果用户传入了selectable就使用用户的，否则使用moveToLeftButtonFlag的值
            return this.selectable !== null ? this.selectable(row, index) : ()=>this.moveToLeftButtonFlag;
        },
        // 加载左侧表格数据
        async loadLeftTableData () {
            if (!this.fetchMethod) return;
            this.leftLoading = true;
            try {
                const params = {
                    pageNo: this.leftCurrentPage,
                    pageSize: this.leftPageSize,
                    [this.leftSearchKey]: this.leftSearchKeyword,
                    ...this.fetchOtherParams
                };
                const result = await this.fetchMethod(params);
                // 使用自定义处理方法处理返回结果
                const processedResult = await this.responseHandler(result);
                // 这里新增了一个返回数据的方法，主要用于拿到一些接口返回数据
                this.$emit('getProcessedResult', processedResult, result);
                // 处理返回结果
                if (processedResult) {
                    this.leftTableData = processedResult.data || [];
                    this.leftTotalCount = processedResult.total || 0;
                    // 更新选中状态
                    this.$nextTick(()=>{
                        // 兼容企微
                        this.isWeChat && this.$renderWeChat();
                        // 更新
                        this.updateLeftTableSelection();
                    });
                }
            } catch (error) {
                this.$message.error(t('ym.dualTableTransfer.fetchDataError'));
            } finally{
                this.leftLoading = false;
            }
        },
        // 左侧表格选择变化处理
        handleLeftSelectionChange (selection) {
            this.currentLeftPageData = selection;
            // 标记内部操作，不去执行change事件，否则会造成dom渲染卡死
            if (this.isInternalUpdate) return;
            // 获取当前页显示的数据ID
            const currentPageIds = this.leftTableData.map((item)=>item[this.rowKey]);
            // 找出当前页中选中的项ID
            const selectedIds = selection.map((item)=>item[this.rowKey]);
            // 检查是否会超出最大选择限制
            if (this.maxSelectionLimit > 0) {
                // 计算新增选中的数量
                const currentPageSelectedCount = selectedIds.filter((id)=>!this.selectedData.some((item)=>item[this.rowKey] === id)).length;
                // 检查是否会超过限制
                if (this.selectedData.length + currentPageSelectedCount > this.maxSelectionLimit) {
                    // 超出限制，提示用户并恢复选择状态
                    this.$message.error(this.maxLimitMessage);
                    // 恢复之前的选择状态
                    this.$nextTick(()=>{
                        this.updateLeftTableSelection();
                    });
                    return;
                }
            }
            // 处理当前页中的选择变化
            (currentPageIds || []).forEach((itemId)=>{
                // 是否选中
                const isSelected = selectedIds.includes(itemId);
                // 在selectedData中的索引
                const index = this.selectedData.findIndex((item)=>item[this.rowKey] === itemId);
                // 当前数据项
                const item = this.leftTableData.find((item)=>item[this.rowKey] === itemId);
                if (isSelected && index === -1 && item) {
                    // 新选中的项，添加到selectedData
                    this.selectedData.push(item);
                } else if (!isSelected && index !== -1) {
                    // 取消选中的项，从selectedData中移除
                    this.selectedData.splice(index, 1);
                }
            });
            // 通知父组件
            this.$emit('selection-change', [
                ...this.selectedData
            ]);
            // v-model双向绑定更新
            this.$emit('input', [
                ...this.selectedData
            ]);
        },
        // 更新左侧表格选择状态
        updateLeftTableSelection () {
            this.isInternalUpdate = true;
            this.$nextTick(()=>{
                if (this.$refs.leftTable) {
                    // 先清除当前页所有选择
                    this.$refs.leftTable.clearSelection();
                    // 获取已选中项的ID列表
                    const selectedIds = this.selectedData.map((item)=>item[this.rowKey]);
                    // 为当前页中已在selectedData中的项设置选中状态
                    (this.leftTableData || []).forEach((row)=>{
                        if (selectedIds.includes(row[this.rowKey])) {
                            this.$refs.leftTable.toggleRowSelection(row, true);
                        }
                    });
                }
                this.isInternalUpdate = false;
            });
        },
        // 从右侧移除选中项
        removeSelectedItem (row) {
            const index = this.selectedData.findIndex((item)=>item[this.rowKey] === row[this.rowKey]);
            if (index !== -1) {
                this.selectedData.splice(index, 1);
                // 通知父组件
                this.$emit('selection-change', [
                    ...this.selectedData
                ]);
                // v-model双向绑定更新
                this.$emit('input', [
                    ...this.selectedData
                ]);
                // 更新左侧表格选择状态
                this.$nextTick(()=>{
                    this.updateLeftTableSelection();
                });
                // 处理右侧分页
                const totalPages = Math.ceil(this.filteredSelectedDataTotal / this.rightPageSize);
                if (this.rightCurrentPage > totalPages && totalPages > 0) {
                    this.rightCurrentPage = totalPages;
                }
            }
        },
        // 左侧表格页码变化
        handleLeftCurrentChange (page) {
            this.leftCurrentPage = page;
            this.loadLeftTableData();
        },
        // 右侧表格页码变化
        handleRightCurrentChange (page) {
            this.rightCurrentPage = page;
        },
        // 左侧搜索处理
        handleLeftSearch () {
            this.leftCurrentPage = 1;
            // 触发后端搜索
            this.loadLeftTableData();
        },
        // 右侧搜索处理
        handleRightSearch () {
            this.rightCurrentPage = 1;
        },
        // 对外暴露的方法：获取所有已选择的数据
        getSelectedData () {
            return [
                ...this.selectedData
            ];
        },
        // 对外暴露的方法：设置已选择的数据
        setSelectedData (data) {
            if (this.maxSelectionLimit > 0 && data.length > this.maxSelectionLimit) {
                this.$message.error(this.maxLimitMessage);
                return;
            }
            this.selectedData = [
                ...data
            ];
            // 更新左侧表格选择状态
            this.$nextTick(()=>{
                this.updateLeftTableSelection();
            });
            // 通知父组件
            this.$emit('selection-change', [
                ...this.selectedData
            ]);
            // v-model双向绑定更新
            this.$emit('input', [
                ...this.selectedData
            ]);
        },
        // 对外暴露的方法：清空所有选择
        clearSelection () {
            this.selectedData = [];
            if (this.$refs.leftTable) {
                this.$refs.leftTable.clearSelection();
            }
            // 通知父组件
            this.$emit('selection-change', []);
            // v-model双向绑定更新
            this.$emit('input', []);
        },
        // 删除当前页弹框
        clearSelectionConfirm () {
            this.$confirm(t('ym.dualTableTransfer.clearConfirmTitle'), {
                type: 'question',
                confirmButtonText: t('ym.dualTableTransfer.confirmButtonText'),
                cancelButtonText: t('ym.dualTableTransfer.cancelButtonText')
            }).then(()=>{
                this.clearSelection();
            });
        },
        // 清除右侧当前页的数据
        clearCurrentPage () {
            if (this.filteredRightTableData.length === 0) return;
            // 获取当前页数据的ID列表
            const currentPageIds = this.filteredRightTableData.map((item)=>item[this.rowKey]);
            // 确认删除
            this.$confirm(t('ym.dualTableTransfer.clearPageConfirmTitle'), {
                type: 'question',
                confirmButtonText: t('ym.dualTableTransfer.confirmButtonText'),
                cancelButtonText: t('ym.dualTableTransfer.cancelButtonText')
            }).then(()=>{
                // 记录原始数据长度
                const originalLength = this.selectedData.length;
                // 逐个删除当前页的数据（注意：从后向前删除以避免索引变化问题）
                for(let i = this.selectedData.length - 1; i >= 0; i--){
                    if (currentPageIds.includes(this.selectedData[i][this.rowKey])) {
                        this.selectedData.splice(i, 1);
                    }
                }
                // 通知父组件
                this.$emit('selection-change', [
                    ...this.selectedData
                ]);
                // v-model双向绑定更新
                this.$emit('input', [
                    ...this.selectedData
                ]);
                // 更新左侧表格选择状态
                this.$nextTick(()=>{
                    this.updateLeftTableSelection();
                });
                // 处理右侧分页 - 如果当前页被清空且不是第一页，调整页码
                const totalPages = Math.ceil(this.filteredSelectedDataTotal / this.rightPageSize);
                if (this.rightCurrentPage > totalPages && totalPages > 0) {
                    this.rightCurrentPage = totalPages;
                }
                this.$message.success(t('ym.dualTableTransfer.clearSuccess', {
                    count: originalLength - this.selectedData.length
                }));
            }).catch(()=>{});
        },
        // 选择所有的数据
        handleSelect (value) {
            switch(value){
                case 'all':
                    this.handleSelectAll();
                    break;
                case 'page':
                    if (this.maxSelectionLimit > 0 && this.defaultPageSize > this.maxSelectionLimit) {
                        this.$message.error(this.maxLimitMessage);
                        return;
                    }
                    if (this.maxSelectionLimit > 0 && this.selectedData.length + this.leftTableData.length > this.maxSelectionLimit) {
                        this.$message.error(this.maxLimitMessage);
                        return;
                    }
                    this.handleSelectCurrentPage();
                    break;
            }
        },
        // 添加全选当前页方法
        handleSelectCurrentPage () {
            // 设置内部更新标志，避免触发 handleLeftSelectionChange
            this.isInternalUpdate = true;
            try {
                // 找出当前页中未选中的项
                const currentSelectedIds = this.selectedData.map((item)=>item[this.rowKey]);
                const newSelectedItems = this.leftTableData.filter((item, index)=>!currentSelectedIds.includes(item[this.rowKey]) && this.actualSelectable(item, index));
                // 批量添加到选中数据
                if (newSelectedItems.length > 0) {
                    this.selectedData.push(...newSelectedItems);
                    // 批量更新表格选择状态
                    this.$nextTick(()=>{
                        if (this.$refs.leftTable) {
                            // 先清除选择
                            this.$refs.leftTable.clearSelection();
                            // 批量设置选中状态
                            this.leftTableData.forEach((row)=>{
                                this.$refs.leftTable.toggleRowSelection(row, true);
                            });
                        }
                        // 重置标志
                        this.isInternalUpdate = false;
                        // 一次性触发事件通知
                        this.$emit('selection-change', [
                            ...this.selectedData
                        ]);
                        this.$emit('input', [
                            ...this.selectedData
                        ]);
                    });
                } else {
                    // 如果没有新增项，直接重置标志
                    this.isInternalUpdate = false;
                }
            } catch (error) {
                this.isInternalUpdate = false;
            }
        },
        // 添加全选方法
        async handleSelectAll () {
            if (!this.fetchMethod) return;
            if (this.maxSelectionLimit > 0 && this.leftTotalCount > this.maxSelectionLimit) {
                this.$message.error(this.maxLimitMessage);
                return;
            }
            // 这里为什么要加leftTotalCount，是因为可能他全选所有不一定是在根节点的，可能只是某个节点的所有
            if (this.maxSelectionLimit > 0 && this.selectedData.length + this.leftTotalCount > this.maxSelectionLimit) {
                this.$message.error(this.maxLimitMessage);
                return;
            }
            if (this.maxListLimit < this.leftTotalCount) {
                this.$message.error(t('ym.dualTableTransfer.selectAllLimitError', {
                    limit: this.maxListLimit
                }));
                return;
            }
            this.leftLoading = true;
            try {
                // 调用接口获取所有数据
                const params = {
                    pageNo: 1,
                    pageSize: 999999,
                    [this.leftSearchKey]: this.leftSearchKeyword,
                    ...this.fetchOtherParams
                };
                const result = await this.fetchMethod(params);
                const processedResult = await this.responseHandler(result);
                if (processedResult && processedResult.data) {
                    // 获取当前已选中的ID
                    const currentSelectedIds = this.selectedData.map((item)=>item[this.rowKey]);
                    // 找出未选中的数据
                    const newItems = processedResult.data.filter((item, index)=>!currentSelectedIds.includes(item[this.rowKey]) && this.actualSelectable(item, index));
                    // 将新数据添加到已选列表中
                    this.selectedData = [
                        ...this.selectedData,
                        ...newItems
                    ];
                    // 更新选中状态
                    this.$nextTick(()=>{
                        this.updateLeftTableSelection();
                    });
                    // 通知父组件
                    this.$emit('selection-change', [
                        ...this.selectedData
                    ]);
                    this.$emit('input', [
                        ...this.selectedData
                    ]);
                    this.$message.success(t('ym.dualTableTransfer.selectAllSuccess'));
                }
            } catch (error) {
                this.$message.error(t('ym.dualTableTransfer.selectAllError'));
            } finally{
                this.leftLoading = false;
            }
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        class: _vm.b()
    }, [
        _c('div', {
            class: _vm.b('container')
        }, [
            _c('FlexLayoutBox', {
                class: _vm.b('left-wrapper'),
                attrs: {
                    "slotDefaultClass": false
                },
                scopedSlots: _vm._u([
                    {
                        key: "action",
                        fn: function() {
                            return [
                                _c('div', {
                                    class: _vm.b('action')
                                }, [
                                    _c('h4', [
                                        _vm._v(_vm._s(_vm.t('ym.dualTableTransfer.allCount', {
                                            count: _vm.leftTotalCount
                                        })))
                                    ]),
                                    _vm._t("left-action")
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
                                    class: _vm.b('search')
                                }, [
                                    _vm.showSearch ? _c('el-input', {
                                        attrs: {
                                            "placeholder": _vm.searchPlaceholder,
                                            "suffix-icon": "h-icon-search",
                                            "clearable": "",
                                            "on-icon-click": _vm.handleLeftSearch
                                        },
                                        on: {
                                            "input": _vm.handleLeftSearch
                                        },
                                        model: {
                                            value: _vm.leftSearchKeyword,
                                            callback: function($$v) {
                                                _vm.leftSearchKeyword = $$v;
                                            },
                                            expression: "leftSearchKeyword"
                                        }
                                    }) : _vm._e()
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
                                            value: _vm.leftLoading,
                                            expression: "leftLoading"
                                        }
                                    ],
                                    ref: "leftTable",
                                    class: _vm.b('table'),
                                    attrs: {
                                        "data": _vm.leftTableData,
                                        "height": _vm.tableHeight,
                                        "enable-virtual-scroll": _vm.enableVirtualScroll,
                                        "row-key": _vm.rowKey,
                                        "empty-text": _vm.leftEmptyText
                                    },
                                    on: {
                                        "selection-change": _vm.handleLeftSelectionChange
                                    }
                                }, [
                                    _c('el-table-column', {
                                        attrs: {
                                            "type": "selection",
                                            "selectable": _vm.actualSelectable,
                                            "reserve-selection": true,
                                            "selections": _vm.selections,
                                            "width": "50"
                                        }
                                    }),
                                    _vm._t("left-columns")
                                ], 2)
                            ];
                        },
                        proxy: true
                    },
                    _vm.showFooter ? {
                        key: "footer",
                        fn: function() {
                            return [
                                _vm._t("left-footer", function() {
                                    return [
                                        _c('div', {
                                            class: _vm.b('pagination')
                                        }, [
                                            _c('el-pagination', {
                                                attrs: {
                                                    "small": "",
                                                    "layout": "prev, miniPager, next",
                                                    "pageSize": _vm.defaultPageSize,
                                                    "total": _vm.leftTotalCount
                                                },
                                                on: {
                                                    "current-change": _vm.handleLeftCurrentChange
                                                }
                                            })
                                        ], 1)
                                    ];
                                })
                            ];
                        },
                        proxy: true
                    } : null
                ], null, true)
            }),
            _c('FlexLayoutBox', {
                class: _vm.b('right-wrapper'),
                attrs: {
                    "slotDefaultClass": false
                },
                scopedSlots: _vm._u([
                    {
                        key: "action",
                        fn: function() {
                            return [
                                _c('div', {
                                    class: _vm.b('action')
                                }, [
                                    _c('h4', [
                                        _vm.maxSelectionLimit ? _c('span', [
                                            _vm._v(" " + _vm._s(_vm.t('ym.dualTableTransfer.selectedCountWithLimit', {
                                                selected: _vm.selectedData.length,
                                                limit: _vm.maxSelectionLimit
                                            })) + " ")
                                        ]) : _c('span', [
                                            _vm._v(" " + _vm._s(_vm.t('ym.dualTableTransfer.selectedCount', {
                                                count: _vm.selectedData.length
                                            })) + " ")
                                        ])
                                    ]),
                                    _vm._t("right-action", function() {
                                        return [
                                            _c('div', [
                                                _c('el-button', {
                                                    attrs: {
                                                        "type": "text",
                                                        "disabled": _vm.filteredRightTableData.length === 0
                                                    },
                                                    on: {
                                                        "click": _vm.clearCurrentPage
                                                    }
                                                }, [
                                                    _vm._v(" " + _vm._s(_vm.t('ym.dualTableTransfer.clearCurrentPage')) + " ")
                                                ]),
                                                _c('el-button', {
                                                    attrs: {
                                                        "type": "text",
                                                        "disabled": _vm.filteredRightTableData.length === 0
                                                    },
                                                    on: {
                                                        "click": _vm.clearSelectionConfirm
                                                    }
                                                }, [
                                                    _vm._v(" " + _vm._s(_vm.t('ym.dualTableTransfer.clearAll')) + " ")
                                                ])
                                            ], 1)
                                        ];
                                    })
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
                                    class: _vm.b('search')
                                }, [
                                    _vm.showSearch ? _c('el-input', {
                                        attrs: {
                                            "placeholder": _vm.rightSearchPlaceholder,
                                            "suffix-icon": "h-icon-search",
                                            "clearable": "",
                                            "on-icon-click": _vm.handleRightSearch
                                        },
                                        on: {
                                            "input": _vm.handleRightSearch
                                        },
                                        model: {
                                            value: _vm.rightSearchKeyword,
                                            callback: function($$v) {
                                                _vm.rightSearchKeyword = $$v;
                                            },
                                            expression: "rightSearchKeyword"
                                        }
                                    }) : _vm._e()
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
                                    ref: "rightTable",
                                    class: _vm.b('table'),
                                    attrs: {
                                        "data": _vm.filteredRightTableData,
                                        "enable-virtual-scroll": _vm.enableVirtualScroll,
                                        "height": _vm.tableHeight,
                                        "row-key": _vm.rowKey
                                    }
                                }, [
                                    _vm._t("right-columns"),
                                    _c('el-table-column', {
                                        attrs: {
                                            "width": "60",
                                            "label": _vm.t('ym.dualTableTransfer.action'),
                                            "fixed": _vm.deleteFixed
                                        },
                                        scopedSlots: _vm._u([
                                            {
                                                key: "default",
                                                fn: function(scope) {
                                                    return [
                                                        _c('el-button', {
                                                            attrs: {
                                                                "icon": "h-icon-delete",
                                                                "disabled": !_vm.moveToRightButtonFlag
                                                            },
                                                            on: {
                                                                "click": function($event) {
                                                                    return _vm.removeSelectedItem(scope.row);
                                                                }
                                                            }
                                                        })
                                                    ];
                                                }
                                            }
                                        ])
                                    })
                                ], 2)
                            ];
                        },
                        proxy: true
                    },
                    _vm.showFooter ? {
                        key: "footer",
                        fn: function() {
                            return [
                                _vm._t("right-footer", function() {
                                    return [
                                        _c('div', {
                                            class: _vm.b('pagination')
                                        }, [
                                            _c('el-pagination', {
                                                attrs: {
                                                    "small": "",
                                                    "layout": "prev, miniPager, next",
                                                    "pageSize": _vm.defaultPageSize,
                                                    "total": _vm.filteredSelectedDataTotal
                                                },
                                                on: {
                                                    "current-change": _vm.handleRightCurrentChange
                                                }
                                            })
                                        ], 1)
                                    ];
                                })
                            ];
                        },
                        proxy: true
                    } : null
                ], null, true)
            })
        ], 1)
    ]);
};
var __vue_staticRenderFns__ = [];
/* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__);

__vue_component__.install = function(Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

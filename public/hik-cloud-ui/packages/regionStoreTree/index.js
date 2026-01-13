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
// import { createNamespace } from 'hik-cloud-ui/src/utils/create';
// const [bem, name] = createNamespace('regions-store-container');
const Method = "get";
var script = {
    name: "HikCloudRegionStoreTree",
    mixins: [
        Locale
    ],
    props: {
        // 组件主要配置属性
        // 位置相关
        // 组件顶部距离
        top: {
            type: String,
            default: "0"
        },
        // 是否显示复选框
        checkBox: {
            type: Boolean,
            default: false
        },
        // 是否在挂载时自动初始化树数据
        isInit: {
            type: Boolean,
            default: true
        },
        // 是否显示搜索输入框
        isFilter: {
            type: Boolean,
            default: true
        },
        // 是否默认选中树的第一个根节点
        isInitSelected: {
            type: Boolean,
            default: false
        },
        // 当前选中节点的ID(受控属性)
        currentNode: {
            type: String,
            default: ""
        },
        // 默认选中的节点对象(包含nodeId属性)
        checkedNode: {
            type: Object,
            default: ()=>{
                return {
                    nodeId: ""
                };
            }
        },
        // 是否点击节点时展开/折叠(默认只通过箭头图标控制)
        isExpandClickNode: {
            type: Boolean,
            default: false
        },
        // 是否强制刷新树数据(监听此属性变化)
        refreshTree: {
            type: Boolean,
            default: false
        },
        isReset: {
            type: Boolean,
            default: false
        },
        baseURL: {
            type: String,
            default: "/api"
        },
        // 异步加载树的配置对象
        // 包含method(请求方法)和params(请求参数)
        treeAnsyProps: {
            type: Object,
            default: ()=>{
                return {
                    method: "get",
                    url: "/horae/silvans/unifiedGroup/actions/findGroupTreeForBusiness",
                    params: {}
                };
            }
        },
        // 搜索配置(单个接口配置对象或多个接口配置数组)
        // 每个配置包含method(请求方法)和params(请求参数)
        storeListProps: {
            type: [
                Object,
                Array
            ],
            default: ()=>{
                return {
                    method: "get",
                    url: "/horae/silvans/unifiedGroup/actions/searchGroupTreeForDevice",
                    params: {}
                };
            }
        },
        areaListProps: {
            type: [
                Object,
                Array
            ],
            default: ()=>{
                return {
                    method: "get",
                    url: "/horae/silvans/areas/actions/findAreaPageListByAreaName",
                    params: {}
                };
            }
        },
        onlyCheckLeaf: {
            type: Boolean,
            default: false
        },
        canRootSelected: {
            type: Boolean,
            default: false
        },
        isStore: {
            type: Boolean,
            default: false
        },
        placeHolder: {
            type: String,
            default: "请输入"
        },
        selectable: {
            type: Function,
            default: null
        },
        forbidden: {
            type: Function,
            default: null
        },
        nodesProcessHook: {
            type: Function,
            default: null
        },
        showStoreStatus: {
            type: Boolean,
            default: false
        },
        checkStrictly: {
            type: Boolean,
            default: false
        },
        isHackReset: {
            type: Boolean,
            default: true
        },
        cascade: {
            type: Boolean,
            default: false
        },
        isLeafHandler: {
            type: Function,
            default: null
        },
        // 地区节点图标类名
        areaIcon: {
            type: String,
            default: "iconplace"
        },
        // 门店节点图标类名
        storeIcon: {
            type: String,
            default: "iconstore"
        },
        // 根节点图标类名
        rootIcon: {
            type: String,
            default: "iconorigin"
        },
        storeStateOption: {
            type: Array,
            default: ()=>[]
        },
        //手风琴模式，默认不开启
        accordion: {
            type: Boolean,
            default: false
        },
        onlyArea: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            defaultProps: {
                children: "children",
                nodeId: "nodeId",
                label: "nodeName",
                isLeaf: this.isLeaf,
                icon: "icon",
                selectable: "selectable",
                disabled: "forbidden"
            },
            type: "",
            rootData: {},
            condition: "",
            // true 显示同步树  false 显示list
            isSearch: false,
            hackReset: true,
            storeFilterList: [],
            treeData: [],
            clickNodeData: {},
            defaultCurrentNode: "",
            defaultExpandedKeys: [],
            /** 保存根节点 */ originArea: "",
            storeStatus: "1",
            searchTreeList: []
        };
    },
    computed: {
        isMultiSearch () {
            if (this.onlyArea) {
                return this.areaListProps instanceof Array;
            } else {
                return this.storeListProps instanceof Array;
            }
        }
    },
    watch: {
        currentNode (n) {
            this.defaultCurrentNode = n;
        },
        refreshTree (n) {
            if (n) {
                this.clearClick();
            }
        },
        isReset (n) {
            if (n) {
                this.clearClick();
                this.$emit("update:isReset", false);
            }
        },
        treeAnsyProps () {
            this.clearClick();
        }
    },
    mounted () {
        if (this.isInit) {
            this.getTree();
        }
    },
    methods: {
        /**
     * 节点点击前的拦截处理
     * @param {Object} data 节点数据
     * @param {Object} node 节点实例
     * @returns {Promise} 返回Promise决定是否允许点击
     */ beforeClick (data, node) {
            if (!data.selectable) {
                return false;
            }
            return new Promise((resolve)=>{
                if (this.onlyCheckLeaf) {
                    this.loadNode(node, (res)=>{
                        if (this.isStore) {
                            if (res.length === 0 && !data.modifyFlag) {
                                resolve(true);
                            } else {
                                this.$refs.tree.expandNode(data);
                                resolve(false);
                            }
                        } else {
                            // res.length === 0
                            // nodeType为 0,表示区域,就无法点击  1表示门店
                            if (data.nodeType === 1 || res.length === 0 && data.nodeType !== 0) {
                                resolve(true);
                            } else {
                                if (!data.parentId && this.canRootSelected) {
                                    resolve(true);
                                } else {
                                    this.$refs.tree.expandNode(data);
                                    resolve(false);
                                }
                            }
                        }
                    });
                } else {
                    if (!this.isStore) {
                        resolve(true);
                        return;
                    }
                    resolve(!data.modifyFlag);
                }
            });
        },
        /**
     * 重新加载指定节点
     * @param {String} key 节点ID
     */ reloadNode (key) {
            this.$refs.tree.reload([
                key
            ]);
        },
        /**
     * 清空搜索条件并重置树
     */ clearClick () {
            this.condition = "";
            this.type = "clear";
            this.handleSearchClick();
        },
        /**
     * 处理搜索结果项的选择
     * @param {Object} data 选中项数据
     * @param {Number} idx 在多搜索时的区块索引
     */ storeSelect (data, idx) {
            if (this.isMultiSearch) {
                this.storeFilterList.forEach((block)=>{
                    block.forEach((item)=>{
                        item.isSelected = false;
                    });
                });
            } else {
                this.storeFilterList.forEach((item)=>{
                    item.isSelected = false;
                });
            }
            data.isSelected = true;
            console.log(data, idx);
            this.$emit("getClickData", data, idx);
            if (this.isHackReset) {
                this.hackReset = false;
                this.$nextTick(()=>{
                    this.hackReset = true;
                });
            }
        },
        /**
     * 判断节点是否为叶子节点
     * @param {Object} data 节点数据
     * @returns {Boolean} 是否为叶子节点
     */ isLeaf (data) {
            if (this.isLeafHandler) {
                return this.isLeafHandler(data);
            }
            return data.nodeType == 1;
        },
        /**
     * 获取树形数据(初始化树)
     */ getTree () {
            let localTreeAnsyProps = {
                ...this.treeAnsyProps
            };
            if (!localTreeAnsyProps.method) {
                localTreeAnsyProps.method = Method;
            }
            localTreeAnsyProps.params.nodeId = "";
            if (this.showStoreStatus) {
                localTreeAnsyProps.params.storeStatus = this.storeStatus;
            }
            this.getTreeNext(localTreeAnsyProps).then((res)=>{
                if (res.code * 1 === 0 && res.data) {
                    res.data.forEach((el)=>{
                        el.selectable = this.selectable ? this.selectable(el) : true;
                        el.forbidden = this.forbidden ? this.forbidden(el) : false;
                    });
                    this.treeData = res.data ? res.data : [];
                    if (this.treeData.parentId === "" || !this.treeData.parentId || this.treeData.parentId === "-1") {
                        this.treeData[0].icon = `icon iconfont ${this.rootIcon}`;
                        this.originArea = res.data[0];
                        this.$emit("getOriginArea", this.originArea.nodeId);
                    }
                    // 默认选中第一条
                    if (this.isInitSelected) {
                        this.treeInit([
                            res.data
                        ], "tree");
                    }
                }
            });
        },
        /**
     * 执行搜索操作
     * 支持单搜索和多搜索模式
     */ searchData () {
            let proxyName = '';
            if (this.onlyArea) {
                proxyName = this.areaListProps;
            } else {
                proxyName = this.storeListProps;
            }
            if (this.isMultiSearch) {
                Promise.all(proxyName.map((prop)=>this.searchStoreList(prop))).then((allData)=>{
                    this.storeFilterList = allData;
                });
            } else {
                this.searchStoreList(proxyName).then((data)=>{
                    this.storeFilterList = data;
                });
            }
        },
        /**
     * 根据配置获取搜索结果列表
     * @param {Object} prop 搜索配置
     * @returns {Promise} 返回搜索结果Promise
     */ searchStoreList (prop) {
            if (!prop.method) {
                prop.method = Method;
            }
            if (prop.params && prop.params.nodeName) {
                prop.params.nodeName = this.condition;
            } else {
                prop.params.condition = this.condition;
                if (!prop.params.limit) {
                    prop.params.limit = 30;
                }
            }
            if (this.cascade) {
                prop.params.nodeName = this.condition;
            }
            this.showStoreStatus && (prop.params.storeStatus = this.storeStatus);
            if (this.onlyArea) {
                prop.params.pageNo = 1;
                prop.params.pageSize = 30;
            }
            return this.getStoreList(prop).then((res)=>{
                if (res.code * 1 === 0) {
                    res.data = this.nodesProcessHook ? this.nodesProcessHook(res.data) : res.data;
                    let storeFilterList = [];
                    if (this.onlyArea) {
                        storeFilterList = res.data.rows || [];
                        storeFilterList.forEach((item)=>{
                            item.nodeId = item.areaId;
                            item.nodeName = item.areaName;
                            item.nodeType = 0;
                            item.parentId = item.parentId;
                            item.isSelected = false;
                            item.selectable = this.selectable ? this.selectable(item) : true;
                        });
                    } else {
                        storeFilterList = res.data;
                        storeFilterList.forEach((item)=>{
                            item.isSelected = false;
                            item.selectable = this.selectable ? this.selectable(item) : true;
                        });
                    }
                    console.log(storeFilterList);
                    return storeFilterList;
                }
                return [];
            });
        },
        /**
     * 初始化树选中状态
     * @param {Array} data 树数据
     * @param {String} tree 树实例引用名
     */ treeInit (data, tree) {
            if (data && data.length > 0) {
                for (let item of data){
                    if (item[0].parentId === "" || !item[0].parentId || item[0].parentId === "-1") {
                        try {
                            // 获取根节点数据
                            this.rootData = item[0];
                            this.$emit("getTreeRoot", {
                                root: this.$refs[tree].root,
                                data: this.rootData
                            });
                            if (this.checkedNode && this.checkedNode.nodeId) {
                                this.defaultCurrentNode = this.checkedNode.nodeId;
                            } else {
                                this.defaultCurrentNode = item[0].nodeId;
                            }
                            this.defaultExpandedKeys = [
                                item[0].nodeId
                            ];
                        } catch (e) {
                        // TODO:
                        }
                        // 缓存选中的节点data 和 node 信息
                        if (!this.checkedNode || !this.checkedNode.nodeId) {
                            this.clickNodeData = item[0];
                            // true 树加载默认选中标识
                            if (this.type) {
                                // 清除搜索框，避免直接关闭下拉菜单（用于下拉树）
                                this.$emit("getClickData", item[0], 1, this.type);
                                this.type = "";
                            } else {
                                this.$emit("getClickData", item[0], 1);
                            }
                        }
                    }
                }
            }
        },
        loadNode (node, resolve) {
            if (node.level === 0) {
                return resolve(this.treeData);
            } else {
                let localTreeAnsyProps = {
                    ...this.treeAnsyProps
                };
                !localTreeAnsyProps.method && (localTreeAnsyProps.method = Method);
                localTreeAnsyProps.params.nodeId = node.data.nodeId;
                this.getTreeNext(localTreeAnsyProps).then((res)=>{
                    if (res.code * 1 === 0 && res.data) {
                        res.data = this.nodesProcessHook ? this.nodesProcessHook(res.data) : res.data;
                        if (this.onlyArea) {
                            res.data = res.data.filter((item)=>item.nodeType != 1);
                        }
                        res.data.forEach((item)=>{
                            if (item.nodeType === 0) {
                                item.icon = `iconfont ${this.areaIcon}`;
                            } else if (item.nodeType === 1) {
                                item.icon = `iconfont ${this.storeIcon}`;
                            } else {
                                item.icon = `iconfont ${this.areaIcon}`;
                            }
                            item.selectable = this.selectable ? this.selectable(item) : true;
                            item.forbidden = this.forbidden ? this.forbidden(item) : false;
                        });
                        resolve(res.data ? res.data : []);
                    }
                });
            }
        },
        // 搜索列表
        // 搜索有值,获取门店列表, 没值获取异步树
        handleSearchClick () {
            if (this.condition) {
                if (this.condition.indexOf("%") !== -1) {
                    this.$message.warning(this.t("ym.base.searchTipSpecialCharacter") + "%");
                    return;
                }
                this.isSearch = true;
                this.searchData();
            } else {
                this.isSearch = false;
                this.getTree();
            }
            this.$emit("clearClick");
        },
        getCheckedKey () {
            let array = this.$refs.tree.getCheckedKeys();
            this.$emit("getCheckedKey", array);
            return array;
        },
        getCheckedNodes () {
            let array = this.$refs.tree.getCheckedNodes();
            this.$emit("getCheckedNodes", array);
            return array;
        },
        getHalfCheckedKeys () {
            let array = this.$refs.tree.getHalfCheckedKeys();
            this.$emit("getHalfCheckedKeys", array);
            return array;
        },
        getHalfCheckedNodes () {
            let array = this.$refs.tree.getHalfCheckedNodes();
            this.$emit("getHalfCheckedNodes", array);
            return array;
        },
        setChecked (key, checked, deep = false) {
            this.$refs.tree.setChecked(key, checked, deep);
        },
        setCurrentKey (key) {
            this.$refs.tree.setCurrentKey(key);
        },
        setCurrentNode (node) {
            this.$refs.tree.setCurrentNode(node);
        },
        setSelected (node) {
            this.$refs.tree.setSelected(node);
        },
        setCheckedKeys (keys, leafOnly, rootOnly = false) {
            this.$refs.tree.setCheckedKeys(keys, leafOnly, rootOnly);
        },
        setCheckedNodes (nodeList) {
            this.$refs.tree.setCheckedNodes(nodeList);
        },
        getSelectedKey () {
            let str = this.$refs.tree.getSelectedKey();
            this.$emit("getSelectedKey", str);
            return str;
        },
        getSelectedNode () {
            let obj = this.$refs.tree.getSelectedNode();
            this.$emit("getSelectedNode", obj);
            return obj;
        },
        handleCheckChange (data) {
            this.$emit("check-change", data);
        },
        getClickNode (data, node) {
            if (!data.selectable) {
                return;
            }
            this.clickNodeData = data;
            this.$emit("handleClick");
            this.$emit("getClickData", data, node.level, node);
        },
        handleStoreStatusChange () {
            this.handleSearchClick();
        },
        getTreeNext (data) {
            if (!this._http) return this.noHttpCallback();
            if (data.method === "post") {
                return this._http.post(`${this.baseURL}${data.url}`, data.params ? data.params : "");
            } else {
                return this._http.get(`${this.baseURL}${data.url}`, {
                    params: data.params ? data.params : ""
                });
            }
        },
        // 搜索列表
        getStoreList (data) {
            if (!this._http) return this.noHttpCallback();
            if (data.method === "post") {
                return this._http.post(`${this.baseURL}${data.url}`, data.params ? data.params : "");
            } else {
                return this._http.get(`${this.baseURL}${data.url}`, {
                    params: data.params ? data.params : ""
                });
            }
        },
        noHttpCallback () {
            return new Promise((resolve)=>{
                resolve([]);
            });
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

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-regions-store-container",
        style: {
            top: _vm.top + 'px'
        }
    }, [
        _c('div', {
            staticClass: "tree-filter"
        }, [
            _c('div', {
                staticClass: "select-area"
            }, [
                _vm.showStoreStatus ? _c('el-select', {
                    staticClass: "tree-store-status",
                    attrs: {
                        "placeholder": _vm.placeHolder,
                        "size": "small"
                    },
                    on: {
                        "change": _vm.handleStoreStatusChange
                    },
                    model: {
                        value: _vm.storeStatus,
                        callback: function($$v) {
                            _vm.storeStatus = $$v;
                        },
                        expression: "storeStatus"
                    }
                }, _vm._l(_vm.storeStateOption, function(item) {
                    return _c('el-option', {
                        key: item.value,
                        attrs: {
                            "label": item.label,
                            "value": item.value
                        }
                    });
                }), 1) : _vm._e(),
                _vm.isFilter ? _c('el-input', {
                    staticClass: "filter-input",
                    attrs: {
                        "placeholder": _vm.placeHolder,
                        "clear-icon-click": _vm.clearClick,
                        "clearable": "",
                        "suffix-icon": "h-icon-search",
                        "on-icon-click": _vm.handleSearchClick
                    },
                    nativeOn: {
                        "keyup": function($event) {
                            if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
                                return null;
                            }
                            $event.stopPropagation();
                            return _vm.handleSearchClick.apply(null, arguments);
                        },
                        "keydown": function($event) {
                            if (!$event.type.indexOf('key') && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
                                return null;
                            }
                            $event.stopPropagation();
                            return (function() {}).apply(null, arguments);
                        }
                    },
                    model: {
                        value: _vm.condition,
                        callback: function($$v) {
                            _vm.condition = $$v;
                        },
                        expression: "condition"
                    }
                }) : _vm._e()
            ], 1),
            _c('el-input', {
                staticStyle: {
                    "display": "none"
                }
            }),
            _c('div', {
                class: _vm.isFilter ? 'tree-wrap' : 'tree-wrap-nofilter'
            }, [
                _c('el-tree', {
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: !_vm.isSearch,
                            expression: "!isSearch"
                        }
                    ],
                    ref: "tree",
                    attrs: {
                        "accordion": _vm.accordion,
                        "show-checkbox": _vm.checkBox,
                        "check-strictly": _vm.checkStrictly,
                        "before-click": _vm.beforeClick,
                        "default-icon": "",
                        "data": _vm.treeData,
                        "simple-data": "",
                        "parent-key": "parentId",
                        "props": _vm.defaultProps,
                        "node-key": "nodeId",
                        "default-expanded-keys": _vm.defaultExpandedKeys,
                        "current-node-key": _vm.defaultCurrentNode,
                        "load": _vm.loadNode,
                        "lazy": "",
                        "expand-on-click-node": _vm.isExpandClickNode
                    },
                    on: {
                        "node-click": _vm.getClickNode,
                        "check-change": _vm.handleCheckChange
                    }
                }),
                _c('el-scrollbar', {
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.isSearch,
                            expression: "isSearch"
                        }
                    ],
                    attrs: {
                        "wrapStyle": "max-height: 100%; overflow-x: hidden !important;"
                    }
                }, [
                    _vm.hackReset ? _c('ul', {
                        staticClass: "f-storeList",
                        on: {
                            "click": function($event) {
                                $event.stopPropagation();
                            }
                        }
                    }, [
                        !_vm.isMultiSearch ? [
                            _c('span', {
                                directives: [
                                    {
                                        name: "show",
                                        rawName: "v-show",
                                        value: _vm.storeFilterList.length === 0,
                                        expression: "storeFilterList.length === 0"
                                    }
                                ],
                                staticClass: "msg-tip"
                            }, [
                                _vm._v(" " + _vm._s(_vm.t("ym.tree.searchNoData")) + " ")
                            ]),
                            _vm.checkBox ? _c('el-checkbox-group', {
                                staticStyle: {
                                    "width": "100%"
                                },
                                attrs: {
                                    "vertical": ""
                                },
                                model: {
                                    value: _vm.searchTreeList,
                                    callback: function($$v) {
                                        _vm.searchTreeList = $$v;
                                    },
                                    expression: "searchTreeList"
                                }
                            }, _vm._l(_vm.storeFilterList, function(item, index) {
                                return _c('el-checkbox', {
                                    key: index,
                                    class: {
                                        itemDisabled: !item.selectable
                                    },
                                    attrs: {
                                        "label": item.nodeId,
                                        "disabled": !item.selectable
                                    },
                                    on: {
                                        "change": function($event) {
                                            item.selectable && _vm.storeSelect(item, index);
                                        }
                                    }
                                }, [
                                    _vm._v(" " + _vm._s(item.storeName || item.nodeName) + " ")
                                ]);
                            }), 1) : _vm._l(_vm.storeFilterList, function(item, index) {
                                return [
                                    item.storeName ? _c('li', {
                                        key: index,
                                        staticClass: "item-chose",
                                        class: {
                                            itemActive: item.isSelected,
                                            itemDisabled: !item.selectable
                                        },
                                        on: {
                                            "click": function($event) {
                                                item.selectable && _vm.storeSelect(item, index);
                                            }
                                        }
                                    }, [
                                        _vm._v(" " + _vm._s(item.storeName) + " ")
                                    ]) : item.nodeName ? _c('li', {
                                        key: index,
                                        staticClass: "item-chose",
                                        class: {
                                            itemActive: item.isSelected,
                                            itemDisabled: !item.selectable
                                        },
                                        on: {
                                            "click": function($event) {
                                                item.selectable && _vm.storeSelect(item, index);
                                            }
                                        }
                                    }, [
                                        _vm._v(" " + _vm._s(item.nodeName) + " ")
                                    ]) : _vm._e()
                                ];
                            })
                        ] : [
                            _c('span', {
                                directives: [
                                    {
                                        name: "show",
                                        rawName: "v-show",
                                        value: _vm.storeFilterList.reduce(function(sum, arr) {
                                            return sum + arr.length;
                                        }, 0) === 0,
                                        expression: "storeFilterList.reduce((sum, arr) => sum + arr.length, 0) === 0"
                                    }
                                ],
                                staticClass: "msg-tip"
                            }, [
                                _vm._v(" " + _vm._s(_vm.t("ym.tree.searchNoData")) + " ")
                            ]),
                            _vm._l(_vm.storeFilterList, function(block, idx) {
                                return [
                                    block.length > 0 ? _c('div', {
                                        key: 'title-' + idx,
                                        staticClass: "mt8 mb8 fw6"
                                    }, [
                                        _vm._v(" " + _vm._s(_vm.storeListProps[idx].title) + " ")
                                    ]) : _vm._e(),
                                    _vm._l(block, function(item) {
                                        return [
                                            item.storeName ? _c('li', {
                                                key: 'store-' + item.index,
                                                staticClass: "item-chose",
                                                class: {
                                                    itemActive: item.isSelected,
                                                    itemDisabled: !item.selectable
                                                },
                                                on: {
                                                    "click": function($event) {
                                                        item.selectable && _vm.storeSelect(item, idx);
                                                    }
                                                }
                                            }, [
                                                _vm._v(" " + _vm._s(item.storeName) + " ")
                                            ]) : item.nodeName ? _c('li', {
                                                key: 'node-' + item.index,
                                                staticClass: "item-chose",
                                                class: {
                                                    itemActive: item.isSelected,
                                                    itemDisabled: !item.selectable
                                                },
                                                on: {
                                                    "click": function($event) {
                                                        item.selectable && _vm.storeSelect(item, idx);
                                                    }
                                                }
                                            }, [
                                                _vm._v(" " + _vm._s(item.nodeName) + " ")
                                            ]) : _vm._e()
                                        ];
                                    })
                                ];
                            })
                        ]
                    ], 2) : _vm._e()
                ])
            ], 1)
        ], 1)
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

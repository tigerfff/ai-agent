import emitter from 'hui/src/mixins/emitter';
import Clickoutside from 'hui/src/utils/clickoutside';
import Vue from 'vue';
import deepmerge from 'deepmerge';
import { PopupManager } from 'hui/src/utils/popup';

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
/* eslint-disable */ var script$4 = {
    name: 'VirtualList',
    props: {
        //所有列表数据
        listData: {
            type: Array,
            default: ()=>[]
        },
        //每项高度
        itemSize: {
            type: Number,
            default: 44
        },
        itemMargin: {
            type: Number,
            default: 4
        }
    },
    data () {
        return {
            //可视区域高度
            screenHeight: 0,
            //偏移量
            startOffset: 0,
            //起始索引
            start: 0,
            //结束索引
            end: null,
            bottomMargin: 8
        };
    },
    computed: {
        //列表总高度
        listHeight () {
            return this.listData.length * this.unitHeight + this.bottomMargin;
        },
        //可显示的列表项数
        visibleCount () {
            return Math.ceil(this.screenHeight / this.unitHeight);
        },
        unitHeight () {
            return this.itemSize + this.itemMargin;
        },
        //偏移量对应的style
        getTransform () {
            return `translate3d(0,${this.startOffset}px,0)`;
        },
        //获取真实显示列表数据
        visibleData () {
            return this.listData.slice(this.start, Math.min(this.end, this.listData.length));
        }
    },
    mounted () {},
    beforeDistroy () {},
    methods: {
        setBase () {
            this.screenHeight = this.$el.clientHeight;
            this.start = 0;
            this.end = this.start + this.visibleCount;
        },
        scrollEvent ({ scrollTop, percentY }) {
            // scrollTop当前滚动位置
            //此时的开始索引
            this.start = Math.floor(scrollTop / this.unitHeight);
            //此时的结束索引
            this.end = this.start + this.visibleCount;
            //此时的偏移量
            this.startOffset = scrollTop - scrollTop % this.unitHeight;
            if (percentY === 1) {
                // debugger;
                this.$emit('end', ()=>{
                    this.$refs.scrollbar.setScroll(scrollTop, -1, 0);
                });
                // this.$emit('end')
                this.$refs.scrollbar.update();
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

const __vue_script__$4 = script$4;
/* template */ var __vue_render__$4 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('el-scrollbar', {
        ref: "scrollbar",
        attrs: {
            "wrap-class": "hik-cloud-infinite-list-container"
        },
        on: {
            "on-scrolling-y": _vm.scrollEvent
        }
    }, [
        _c('div', {
            staticClass: "hik-cloud-infinite-list-phantom",
            style: {
                height: _vm.listHeight + 'px'
            }
        }),
        _c('div', {
            staticClass: "hik-cloud-infinite-list",
            style: {
                transform: _vm.getTransform
            }
        }, _vm._l(_vm.visibleData, function(item, index) {
            return _c('div', {
                key: index,
                staticClass: "hik-cloud-infinite-list-item hik-cloud-infinite-list-item__margin",
                style: {
                    height: _vm.itemSize + 'px'
                }
            }, [
                _vm._t("default", null, {
                    "item": item
                })
            ], 2);
        }), 0)
    ]);
};
var __vue_staticRenderFns__$4 = [];
/* style */ const __vue_inject_styles__$4 = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__$4 = /*#__PURE__*/ normalizeComponent({
    render: __vue_render__$4,
    staticRenderFns: __vue_staticRenderFns__$4
}, __vue_inject_styles__$4, __vue_script__$4);

function getNextZIndex() {
    const hui = window && window.hui;
    return hui && typeof hui.nextZIndex === 'function' ? hui.nextZIndex() : PopupManager.nextZIndex();
}

// default options
var DEFAULTS = {
    // placement of the popper
    placement: 'bottom',
    gpuAcceleration: true,
    // shift popper from its origin by the given amount of pixels (can be negative)
    offset: 0,
    // the element which will act as boundary of the popper
    boundariesElement: 'viewport',
    // amount of pixel used to define a minimum distance between the boundaries and the popper
    boundariesPadding: 0,
    // popper will try to prevent overflow following this order,
    // by default, then, it could overflow on the left and on top of the boundariesElement
    preventOverflowOrder: [
        'left',
        'right',
        'top',
        'bottom'
    ],
    // the behavior used by flip to change the placement of the popper
    flipBehavior: 'flip',
    arrowElement: '[x-arrow]',
    // list of functions used to modify the offsets before they are applied to the popper
    modifiers: [
        'shift',
        'offset',
        'preventOverflow',
        'keepTogether',
        'arrow',
        'flip',
        'applyStyle'
    ],
    modifiersIgnored: [],
    forceAbsolute: false
};
/**
 * Create a new Popper.js instance
 * @constructor Popper
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement|Object} popper
 *      The HTML element used as popper, or a configuration used to generate the popper.
 * @param {String} [popper.tagName='div'] The tag name of the generated popper.
 * @param {Array} [popper.classNames=['popper']] Array of classes to apply to the generated popper.
 * @param {Array} [popper.attributes] Array of attributes to apply, specify `attr:value` to assign a value to it.
 * @param {HTMLElement|String} [popper.parent=window.document.body] The parent element, given as HTMLElement or as query string.
 * @param {String} [popper.content=''] The content of the popper, it can be text, html, or node; if it is not text, set `contentType` to `html` or `node`.
 * @param {String} [popper.contentType='text'] If `html`, the `content` will be parsed as HTML. If `node`, it will be appended as-is.
 * @param {String} [popper.arrowTagName='div'] Same as `popper.tagName` but for the arrow element.
 * @param {Array} [popper.arrowClassNames='popper__arrow'] Same as `popper.classNames` but for the arrow element.
 * @param {String} [popper.arrowAttributes=['x-arrow']] Same as `popper.attributes` but for the arrow element.
 * @param {Object} options
 * @param {String} [options.placement=bottom]
 *      Placement of the popper accepted values: `top(-start, -end), right(-start, -end), bottom(-start, -right),
 *      left(-start, -end)`
 *
 * @param {HTMLElement|String} [options.arrowElement='[x-arrow]']
 *      The DOM Node used as arrow for the popper, or a CSS selector used to get the DOM node. It must be child of
 *      its parent Popper. Popper.js will apply to the given element the style required to align the arrow with its
 *      reference element.
 *      By default, it will look for a child node of the popper with the `x-arrow` attribute.
 *
 * @param {Boolean} [options.gpuAcceleration=true]
 *      When this property is set to true, the popper position will be applied using CSS3 translate3d, allowing the
 *      browser to use the GPU to accelerate the rendering.
 *      If set to false, the popper will be placed using `top` and `left` properties, not using the GPU.
 *
 * @param {Number} [options.offset=0]
 *      Amount of pixels the popper will be shifted (can be negative).
 *
 * @param {String|Element} [options.boundariesElement='viewport']
 *      The element which will define the boundaries of the popper position, the popper will never be placed outside
 *      of the defined boundaries (except if `keepTogether` is enabled)
 *
 * @param {Number} [options.boundariesPadding=5]
 *      Additional padding for the boundaries
 *
 * @param {Array} [options.preventOverflowOrder=['left', 'right', 'top', 'bottom']]
 *      Order used when Popper.js tries to avoid overflows from the boundaries, they will be checked in order,
 *      this means that the last ones will never overflow
 *
 * @param {String|Array} [options.flipBehavior='flip']
 *      The behavior used by the `flip` modifier to change the placement of the popper when the latter is trying to
 *      overlap its reference element. Defining `flip` as value, the placement will be flipped on
 *      its axis (`right - left`, `top - bottom`).
 *      You can even pass an array of placements (eg: `['right', 'left', 'top']` ) to manually specify
 *      how alter the placement when a flip is needed. (eg. in the above example, it would first flip from right to left,
 *      then, if even in its new placement, the popper is overlapping its reference element, it will be moved to top)
 *
 * @param {Array} [options.modifiers=[ 'shift', 'offset', 'preventOverflow', 'keepTogether', 'arrow', 'flip', 'applyStyle']]
 *      List of functions used to modify the data before they are applied to the popper, add your custom functions
 *      to this array to edit the offsets and placement.
 *      The function should reflect the @params and @returns of preventOverflow
 *
 * @param {Array} [options.modifiersIgnored=[]]
 *      Put here any built-in modifier name you want to exclude from the modifiers list
 *      The function should reflect the @params and @returns of preventOverflow
 *
 * @param {Boolean} [options.removeOnDestroy=false]
 *      Set to true if you want to automatically remove the popper when you call the `destroy` method.
 */ function Popper$1(reference, popper, options) {
    this._reference = reference.jquery ? reference[0] : reference;
    this.state = {};
    // if the popper variable is a configuration object, parse it to generate an HTMLElement
    // generate a default popper if is not defined
    var isNotDefined = typeof popper === 'undefined' || popper === null;
    var isConfig = popper && Object.prototype.toString.call(popper) === '[object Object]';
    if (isNotDefined || isConfig) {
        this._popper = this.parse(isConfig ? popper : {});
    } else {
        this._popper = popper.jquery ? popper[0] : popper;
    }
    // with {} we create a new object with the options inside it
    this._options = Object.assign({}, DEFAULTS, options);
    // refactoring modifiers' list
    this._options.modifiers = this._options.modifiers.map((function(modifier) {
        // remove ignored modifiers
        if (this._options.modifiersIgnored.indexOf(modifier) !== -1) return;
        // set the x-placement attribute before everything else because it could be used to add margins to the popper
        // margins needs to be calculated to get the correct popper offsets
        if (modifier === 'applyStyle') {
            this._popper.setAttribute('x-placement', this._options.placement);
        }
        // return predefined modifier identified by string or keep the custom one
        return this.modifiers[modifier] || modifier;
    }).bind(this));
    // make sure to apply the popper position before any computation
    this.state.position = this._getPosition(this._popper, this._reference);
    setStyle(this._popper, {
        position: this.state.position,
        top: 0
    });
    // fire the first update to position the popper in the right place
    this.update();
    // setup event listeners, they will take care of update the position in specific situations
    this._setupEventListeners();
    return this;
}
//
// Methods
//
/**
 * Destroy the popper
 * @method
 * @memberof Popper
 */ Popper$1.prototype.destroy = function() {
    this._popper.removeAttribute('x-placement');
    this._popper.style.left = '';
    this._popper.style.position = '';
    this._popper.style.top = '';
    this._popper.style[getSupportedPropertyName('transform')] = '';
    this._removeEventListeners();
    // remove the popper if user explicity asked for the deletion on destroy
    if (this._options.removeOnDestroy) {
        this._popper.remove();
    }
    return this;
};
/**
 * Updates the position of the popper, computing the new offsets and applying the new style
 * @method
 * @memberof Popper
 */ Popper$1.prototype.update = function() {
    var data = {
        instance: this,
        styles: {}
    };
    // store placement inside the data object, modifiers will be able to edit `placement` if needed
    // and refer to _originalPlacement to know the original value
    data.placement = this._options.placement;
    data._originalPlacement = this._options.placement;
    // compute the popper and reference offsets and put them inside data.offsets
    data.offsets = this._getOffsets(this._popper, this._reference, data.placement);
    // get boundaries
    data.boundaries = this._getBoundaries(data, this._options.boundariesPadding, this._options.boundariesElement);
    data = this.runModifiers(data, this._options.modifiers);
    if (typeof this.state.updateCallback === 'function') {
        this.state.updateCallback(data);
    }
};
/**
 * If a function is passed, it will be executed after the initialization of popper with as first argument the Popper instance.
 * @method
 * @memberof Popper
 * @param {Function} callback
 */ Popper$1.prototype.onCreate = function(callback) {
    // the createCallbacks return as first argument the popper instance
    callback(this);
    return this;
};
/**
 * If a function is passed, it will be executed after each update of popper with as first argument the set of coordinates and informations
 * used to style popper and its arrow.
 * NOTE: it doesn't get fired on the first call of the `Popper.update()` method inside the `Popper` constructor!
 * @method
 * @memberof Popper
 * @param {Function} callback
 */ Popper$1.prototype.onUpdate = function(callback) {
    this.state.updateCallback = callback;
    return this;
};
/**
 * Helper used to generate poppers from a configuration file
 * @method
 * @memberof Popper
 * @param config {Object} configuration
 * @returns {HTMLElement} popper
 */ Popper$1.prototype.parse = function(config) {
    var defaultConfig = {
        tagName: 'div',
        classNames: [
            'popper'
        ],
        attributes: [],
        parent: window.document.body,
        content: '',
        contentType: 'text',
        arrowTagName: 'div',
        arrowClassNames: [
            'popper__arrow'
        ],
        arrowAttributes: [
            'x-arrow'
        ]
    };
    config = Object.assign({}, defaultConfig, config);
    var d = window.document;
    var popper = d.createElement(config.tagName);
    addClassNames(popper, config.classNames);
    addAttributes(popper, config.attributes);
    if (config.contentType === 'node') {
        popper.appendChild(config.content.jquery ? config.content[0] : config.content);
    } else if (config.contentType === 'html') {
        popper.innerHTML = config.content;
    } else {
        popper.textContent = config.content;
    }
    if (config.arrowTagName) {
        var arrow = d.createElement(config.arrowTagName);
        addClassNames(arrow, config.arrowClassNames);
        addAttributes(arrow, config.arrowAttributes);
        popper.appendChild(arrow);
    }
    var parent = config.parent.jquery ? config.parent[0] : config.parent;
    // if the given parent is a string, use it to match an element
    // if more than one element is matched, the first one will be used as parent
    // if no elements are matched, the script will throw an error
    if (typeof parent === 'string') {
        parent = d.querySelectorAll(config.parent);
        if (parent.length > 1) {
            console.warn('WARNING: the given `parent` query(' + config.parent + ') matched more than one element, the first one will be used');
        }
        if (parent.length === 0) {
            throw "ERROR: the given `parent` doesn't exists!";
        }
        parent = parent[0];
    }
    // if the given parent is a DOM nodes list or an array of nodes with more than one element,
    // the first one will be used as parent
    if (parent.length > 1 && parent instanceof Element === false) {
        console.warn('WARNING: you have passed as parent a list of elements, the first one will be used');
        parent = parent[0];
    }
    // append the generated popper to its parent
    parent.appendChild(popper);
    return popper;
    /**
   * Adds class names to the given element
   * @function
   * @ignore
   * @param {HTMLElement} target
   * @param {Array} classes
   */ function addClassNames(element, classNames) {
        classNames.forEach(function(className) {
            element.classList.add(className);
        });
    }
    /**
   * Adds attributes to the given element
   * @function
   * @ignore
   * @param {HTMLElement} target
   * @param {Array} attributes
   * @example
   * addAttributes(element, [ 'data-info:foobar' ]);
   */ function addAttributes(element, attributes) {
        attributes.forEach(function(attribute) {
            element.setAttribute(attribute.split(':')[0], attribute.split(':')[1] || '');
        });
    }
};
/**
 * Helper used to get the position which will be applied to the popper
 * @method
 * @memberof Popper
 * @param config {HTMLElement} popper element
 * @param reference {HTMLElement} reference element
 * @returns {String} position
 */ Popper$1.prototype._getPosition = function(popper, reference) {
    getOffsetParent(reference);
    if (this._options.forceAbsolute) {
        return 'absolute';
    }
    // Decide if the popper will be fixed
    // If the reference element is inside a fixed context, the popper will be fixed as well to allow them to scroll together
    var isParentFixed = isFixed(reference);
    return isParentFixed ? 'fixed' : 'absolute';
};
/**
 * Get offsets to the popper
 * @method
 * @memberof Popper
 * @access private
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */ Popper$1.prototype._getOffsets = function(popper, reference, placement) {
    placement = placement.split('-')[0];
    var popperOffsets = {};
    popperOffsets.position = this.state.position;
    var isParentFixed = popperOffsets.position === 'fixed';
    //
    // Get reference element position
    //
    var referenceOffsets = getOffsetRectRelativeToCustomParent(reference, getOffsetParent(popper), isParentFixed);
    //
    // Get popper sizes
    //
    var popperRect = getOuterSizes(popper);
    //
    // Compute offsets of popper
    //
    // depending by the popper placement we have to compute its offsets slightly differently
    if ([
        'right',
        'left'
    ].indexOf(placement) !== -1) {
        popperOffsets.top = referenceOffsets.top + referenceOffsets.height / 2 - popperRect.height / 2;
        if (placement === 'left') {
            popperOffsets.left = referenceOffsets.left - popperRect.width;
        } else {
            popperOffsets.left = referenceOffsets.right;
        }
    } else {
        popperOffsets.left = referenceOffsets.left + referenceOffsets.width / 2 - popperRect.width / 2;
        if (placement === 'top') {
            popperOffsets.top = referenceOffsets.top - popperRect.height;
        } else {
            popperOffsets.top = referenceOffsets.bottom;
        }
    }
    // Add width and height to our offsets object
    popperOffsets.width = popperRect.width;
    popperOffsets.height = popperRect.height;
    return {
        popper: popperOffsets,
        reference: referenceOffsets
    };
};
/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper
 * @access private
 */ Popper$1.prototype._setupEventListeners = function() {
    // NOTE: 1 DOM access here
    this.state.updateBound = this.update.bind(this);
    window.addEventListener('resize', this.state.updateBound);
    // if the boundariesElement is window we don't need to listen for the scroll event
    if (this._options.boundariesElement !== 'window') {
        var target = getScrollParent(this._reference);
        // here it could be both `body` or `documentElement` thanks to Firefox, we then check both
        if (target === window.document.body || target === window.document.documentElement) {
            target = window;
        }
        target.addEventListener('scroll', this.state.updateBound);
    }
};
/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper
 * @access private
 */ Popper$1.prototype._removeEventListeners = function() {
    // NOTE: 1 DOM access here
    window.removeEventListener('resize', this.state.updateBound);
    if (this._options.boundariesElement !== 'window') {
        var target = getScrollParent(this._reference);
        // here it could be both `body` or `documentElement` thanks to Firefox, we then check both
        if (target === window.document.body || target === window.document.documentElement) {
            target = window;
        }
        target.removeEventListener('scroll', this.state.updateBound);
    }
    this.state.updateBound = null;
};
/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper
 * @access private
 * @param {Object} data - Object containing the property "offsets" generated by `_getOffsets`
 * @param {Number} padding - Boundaries padding
 * @param {Element} boundariesElement - Element used to define the boundaries
 * @returns {Object} Coordinates of the boundaries
 */ Popper$1.prototype._getBoundaries = function(data, padding, boundariesElement) {
    // NOTE: 1 DOM access here
    var boundaries = {};
    var width, height;
    if (boundariesElement === 'window') {
        var body = window.document.body;
        var html = window.document.documentElement;
        height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
        boundaries = {
            top: 0,
            right: width,
            bottom: height,
            left: 0
        };
    } else if (boundariesElement === 'viewport') {
        var offsetParent = getOffsetParent(this._popper);
        var scrollParent = getScrollParent(this._popper);
        var offsetParentRect = getOffsetRect(offsetParent);
        // Thanks the fucking native API, `document.body.scrollTop` & `document.documentElement.scrollTop`
        var getScrollTopValue = function(element) {
            return element == document.body ? Math.max(document.documentElement.scrollTop, document.body.scrollTop) : element.scrollTop;
        };
        var getScrollLeftValue = function(element) {
            return element == document.body ? Math.max(document.documentElement.scrollLeft, document.body.scrollLeft) : element.scrollLeft;
        };
        // if the popper is fixed we don't have to substract scrolling from the boundaries
        var scrollTop = data.offsets.popper.position === 'fixed' ? 0 : getScrollTopValue(scrollParent);
        var scrollLeft = data.offsets.popper.position === 'fixed' ? 0 : getScrollLeftValue(scrollParent);
        boundaries = {
            top: 0 - (offsetParentRect.top - scrollTop),
            right: window.document.documentElement.clientWidth - (offsetParentRect.left - scrollLeft),
            bottom: window.document.documentElement.clientHeight - (offsetParentRect.top - scrollTop),
            left: 0 - (offsetParentRect.left - scrollLeft)
        };
    } else {
        if (getOffsetParent(this._popper) === boundariesElement) {
            boundaries = {
                top: 0,
                left: 0,
                right: boundariesElement.clientWidth,
                bottom: boundariesElement.clientHeight
            };
        } else {
            boundaries = getOffsetRect(boundariesElement);
        }
    }
    boundaries.left += padding;
    boundaries.right -= padding;
    boundaries.top = boundaries.top + padding;
    boundaries.bottom = boundaries.bottom - padding;
    return boundaries;
};
/**
 * Loop trough the list of modifiers and run them in order, each of them will then edit the data object
 * @method
 * @memberof Popper
 * @access public
 * @param {Object} data
 * @param {Array} modifiers
 * @param {Function} ends
 */ Popper$1.prototype.runModifiers = function(data, modifiers, ends) {
    var modifiersToRun = modifiers.slice();
    if (ends !== undefined) {
        modifiersToRun = this._options.modifiers.slice(0, getArrayKeyIndex(this._options.modifiers, ends));
    }
    modifiersToRun.forEach((function(modifier) {
        if (isFunction(modifier)) {
            data = modifier.call(this, data);
        }
    }).bind(this));
    return data;
};
/**
 * Helper used to know if the given modifier depends from another one.
 * @method
 * @memberof Popper
 * @param {String} requesting - name of requesting modifier
 * @param {String} requested - name of requested modifier
 * @returns {Boolean}
 */ Popper$1.prototype.isModifierRequired = function(requesting, requested) {
    var index = getArrayKeyIndex(this._options.modifiers, requesting);
    return !!this._options.modifiers.slice(0, index).filter(function(modifier) {
        return modifier === requested;
    }).length;
};
//
// Modifiers
//
/**
 * Modifiers list
 * @namespace Popper.modifiers
 * @memberof Popper
 * @type {Object}
 */ Popper$1.prototype.modifiers = {};
/**
 * Apply the computed styles to the popper element
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @returns {Object} The same data object
 */ Popper$1.prototype.modifiers.applyStyle = function(data) {
    // apply the final offsets to the popper
    // NOTE: 1 DOM access here
    var styles = {
        position: data.offsets.popper.position
    };
    // round top and left to avoid blurry text
    var left = Math.round(data.offsets.popper.left);
    var top = Math.round(data.offsets.popper.top);
    // if gpuAcceleration is set to true and transform is supported, we use `translate3d` to apply the position to the popper
    // we automatically use the supported prefixed version if needed
    var prefixedProperty;
    if (this._options.gpuAcceleration && (prefixedProperty = getSupportedPropertyName('transform'))) {
        styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
        styles.top = 0;
        styles.left = 0;
    } else {
        styles.left = left;
        styles.top = top;
    }
    // any property present in `data.styles` will be applied to the popper,
    // in this way we can make the 3rd party modifiers add custom styles to it
    // Be aware, modifiers could override the properties defined in the previous
    // lines of this modifier!
    Object.assign(styles, data.styles);
    setStyle(this._popper, styles);
    // set an attribute which will be useful to style the tooltip (use it to properly position its arrow)
    // NOTE: 1 DOM access here
    this._popper.setAttribute('x-placement', data.placement);
    // if the arrow modifier is required and the arrow style has been computed, apply the arrow style
    if (this.isModifierRequired(this.modifiers.applyStyle, this.modifiers.arrow) && data.offsets.arrow) {
        setStyle(data.arrowElement, data.offsets.arrow);
    }
    return data;
};
/**
 * Modifier used to shift the popper on the start or end of its reference element side
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @returns {Object} The data object, properly modified
 */ Popper$1.prototype.modifiers.shift = function(data) {
    var placement = data.placement;
    var basePlacement = placement.split('-')[0];
    var shiftVariation = placement.split('-')[1];
    // if shift shiftVariation is specified, run the modifier
    if (shiftVariation) {
        var reference = data.offsets.reference;
        var popper = getPopperClientRect(data.offsets.popper);
        var shiftOffsets = {
            y: {
                start: {
                    top: reference.top
                },
                end: {
                    top: reference.top + reference.height - popper.height
                }
            },
            x: {
                start: {
                    left: reference.left
                },
                end: {
                    left: reference.left + reference.width - popper.width
                }
            }
        };
        var axis = [
            'bottom',
            'top'
        ].indexOf(basePlacement) !== -1 ? 'x' : 'y';
        data.offsets.popper = Object.assign(popper, shiftOffsets[axis][shiftVariation]);
    }
    return data;
};
/**
 * Modifier used to make sure the popper does not overflows from it's boundaries
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @returns {Object} The data object, properly modified
 */ Popper$1.prototype.modifiers.preventOverflow = function(data) {
    var order = this._options.preventOverflowOrder;
    var popper = getPopperClientRect(data.offsets.popper);
    var check = {
        left: function() {
            var left = popper.left;
            if (popper.left < data.boundaries.left) {
                left = Math.max(popper.left, data.boundaries.left);
            }
            return {
                left: left
            };
        },
        right: function() {
            var left = popper.left;
            if (popper.right > data.boundaries.right) {
                left = Math.min(popper.left, data.boundaries.right - popper.width);
            }
            return {
                left: left
            };
        },
        top: function() {
            var top = popper.top;
            if (popper.top < data.boundaries.top) {
                top = Math.max(popper.top, data.boundaries.top);
            }
            return {
                top: top
            };
        },
        bottom: function() {
            var top = popper.top;
            if (popper.bottom > data.boundaries.bottom) {
                top = Math.min(popper.top, data.boundaries.bottom - popper.height);
            }
            return {
                top: top
            };
        }
    };
    order.forEach(function(direction) {
        data.offsets.popper = Object.assign(popper, check[direction]());
    });
    return data;
};
/**
 * Modifier used to make sure the popper is always near its reference
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by _update method
 * @returns {Object} The data object, properly modified
 */ Popper$1.prototype.modifiers.keepTogether = function(data) {
    var popper = getPopperClientRect(data.offsets.popper);
    var reference = data.offsets.reference;
    var f = Math.floor;
    if (popper.right < f(reference.left)) {
        data.offsets.popper.left = f(reference.left) - popper.width;
    }
    if (popper.left > f(reference.right)) {
        data.offsets.popper.left = f(reference.right);
    }
    if (popper.bottom < f(reference.top)) {
        data.offsets.popper.top = f(reference.top) - popper.height;
    }
    if (popper.top > f(reference.bottom)) {
        data.offsets.popper.top = f(reference.bottom);
    }
    return data;
};
/**
 * Modifier used to flip the placement of the popper when the latter is starting overlapping its reference element.
 * Requires the `preventOverflow` modifier before it in order to work.
 * **NOTE:** This modifier will run all its previous modifiers everytime it tries to flip the popper!
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by _update method
 * @returns {Object} The data object, properly modified
 */ Popper$1.prototype.modifiers.flip = function(data) {
    // check if preventOverflow is in the list of modifiers before the flip modifier.
    // otherwise flip would not work as expected.
    if (!this.isModifierRequired(this.modifiers.flip, this.modifiers.preventOverflow)) {
        console.warn('WARNING: preventOverflow modifier is required by flip modifier in order to work, be sure to include it before flip!');
        return data;
    }
    if (data.flipped && data.placement === data._originalPlacement) {
        // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
        return data;
    }
    var placement = data.placement.split('-')[0];
    var placementOpposite = getOppositePlacement(placement);
    var variation = data.placement.split('-')[1] || '';
    var flipOrder = [];
    if (this._options.flipBehavior === 'flip') {
        flipOrder = [
            placement,
            placementOpposite
        ];
    } else {
        flipOrder = this._options.flipBehavior;
    }
    flipOrder.forEach((function(step, index) {
        if (placement !== step || flipOrder.length === index + 1) {
            return;
        }
        placement = data.placement.split('-')[0];
        placementOpposite = getOppositePlacement(placement);
        var popperOffsets = getPopperClientRect(data.offsets.popper);
        // this boolean is used to distinguish right and bottom from top and left
        // they need different computations to get flipped
        var a = [
            'right',
            'bottom'
        ].indexOf(placement) !== -1;
        // using Math.floor because the reference offsets may contain decimals we are not going to consider here
        if (a && Math.floor(data.offsets.reference[placement]) > Math.floor(popperOffsets[placementOpposite]) || !a && Math.floor(data.offsets.reference[placement]) < Math.floor(popperOffsets[placementOpposite])) {
            // we'll use this boolean to detect any flip loop
            data.flipped = true;
            data.placement = flipOrder[index + 1];
            if (variation) {
                data.placement += '-' + variation;
            }
            data.offsets.popper = this._getOffsets(this._popper, this._reference, data.placement).popper;
            data = this.runModifiers(data, this._options.modifiers, this._flip);
        }
    }).bind(this));
    return data;
};
/**
 * Modifier used to add an offset to the popper, useful if you more granularity positioning your popper.
 * The offsets will shift the popper on the side of its reference element.
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by _update method
 * @returns {Object} The data object, properly modified
 */ Popper$1.prototype.modifiers.offset = function(data) {
    var offset = this._options.offset;
    var popper = data.offsets.popper;
    if (data.placement.indexOf('left') !== -1) {
        popper.top -= offset;
    } else if (data.placement.indexOf('right') !== -1) {
        popper.top += offset;
    } else if (data.placement.indexOf('top') !== -1) {
        popper.left -= offset;
    } else if (data.placement.indexOf('bottom') !== -1) {
        popper.left += offset;
    }
    return data;
};
/**
 * Modifier used to move the arrows on the edge of the popper to make sure them are always between the popper and the reference element
 * It will use the CSS outer size of the arrow element to know how many pixels of conjuction are needed
 * @method
 * @memberof Popper.modifiers
 * @argument {Object} data - The data object generated by _update method
 * @returns {Object} The data object, properly modified
 */ Popper$1.prototype.modifiers.arrow = function(data) {
    var arrow = this._options.arrowElement;
    // if the arrowElement is a string, suppose it's a CSS selector
    if (typeof arrow === 'string') {
        arrow = this._popper.querySelector(arrow);
    }
    // if arrow element is not found, don't run the modifier
    if (!arrow) {
        return data;
    }
    // the arrow element must be child of its popper
    if (!this._popper.contains(arrow)) {
        console.warn('WARNING: `arrowElement` must be child of its popper element!');
        return data;
    }
    // arrow depends on keepTogether in order to work
    if (!this.isModifierRequired(this.modifiers.arrow, this.modifiers.keepTogether)) {
        console.warn('WARNING: keepTogether modifier is required by arrow modifier in order to work, be sure to include it before arrow!');
        return data;
    }
    var arrowStyle = {};
    var placement = data.placement.split('-')[0];
    var popper = getPopperClientRect(data.offsets.popper);
    var reference = data.offsets.reference;
    var isVertical = [
        'left',
        'right'
    ].indexOf(placement) !== -1;
    var len = isVertical ? 'height' : 'width';
    var side = isVertical ? 'top' : 'left';
    var altSide = isVertical ? 'left' : 'top';
    var opSide = isVertical ? 'bottom' : 'right';
    var arrowSize = getOuterSizes(arrow)[len];
    //
    // extends keepTogether behavior making sure the popper and its reference have enough pixels in conjuction
    //
    // top/left side
    if (reference[opSide] - arrowSize < popper[side]) {
        data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowSize);
    }
    // bottom/right side
    if (reference[side] + arrowSize > popper[opSide]) {
        data.offsets.popper[side] += reference[side] + arrowSize - popper[opSide];
    }
    // compute center of the popper
    var center = reference[side] + reference[len] / 2 - arrowSize / 2;
    var sideValue = center - popper[side];
    // zhuxiankang add at 2018/06/01
    // if placement is top or bottom,
    // poper's width is smaller than reference width
    // arrow's left is poper's center
    if (!isVertical && popper.width < reference.width) {
        // chenguanbin edit at 2019/06/18
        // 根据弹出框和响应元素的相对位置，决定尖角的位置
        // 左边对齐（top-start），右边对齐（top-end），否则（top）
        if (popper.left === reference.left) {
            sideValue = 24;
        } else if (popper.right === reference.right) {
            sideValue = popper.width - 56;
        } else {
            sideValue = (popper.width - arrowSize) / 2;
        }
    }
    // prevent arrow from being placed not contiguously to its popper
    sideValue = Math.max(Math.min(popper[len] - arrowSize - 3, sideValue), 3);
    arrowStyle[side] = sideValue;
    arrowStyle[altSide] = ''; // make sure to remove any old style from the arrow
    data.offsets.arrow = arrowStyle;
    data.arrowElement = arrow;
    return data;
};
//
// Helpers
//
/**
 * Get the outer sizes of the given element (offset size + margins)
 * @function
 * @ignore
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */ function getOuterSizes(element) {
    // NOTE: 1 DOM access here
    var _display = element.style.display;
    var _visibility = element.style.visibility;
    element.style.display = 'block';
    element.style.visibility = 'hidden';
    element.offsetWidth;
    // original method
    var styles = window.getComputedStyle(element);
    var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
    var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
    var result = {
        width: element.offsetWidth + y,
        height: element.offsetHeight + x
    };
    // reset element styles
    element.style.display = _display;
    element.style.visibility = _visibility;
    return result;
}
/**
 * Get the opposite placement of the given one/
 * @function
 * @ignore
 * @argument {String} placement
 * @returns {String} flipped placement
 */ function getOppositePlacement(placement) {
    var hash = {
        left: 'right',
        right: 'left',
        bottom: 'top',
        top: 'bottom'
    };
    return placement.replace(/left|right|bottom|top/g, function(matched) {
        return hash[matched];
    });
}
/**
 * Given the popper offsets, generate an output similar to getBoundingClientRect
 * @function
 * @ignore
 * @argument {Object} popperOffsets
 * @returns {Object} ClientRect like output
 */ function getPopperClientRect(popperOffsets) {
    var offsets = Object.assign({}, popperOffsets);
    offsets.right = offsets.left + offsets.width;
    offsets.bottom = offsets.top + offsets.height;
    return offsets;
}
/**
 * Given an array and the key to find, returns its index
 * @function
 * @ignore
 * @argument {Array} arr
 * @argument keyToFind
 * @returns index or null
 */ function getArrayKeyIndex(arr, keyToFind) {
    var i = 0;
    var key;
    for(key in arr){
        if (arr[key] === keyToFind) {
            return i;
        }
        i++;
    }
    return null;
}
/**
 * Get CSS computed property of the given element
 * @function
 * @ignore
 * @argument {Eement} element
 * @argument {String} property
 */ function getStyleComputedProperty(element, property) {
    // NOTE: 1 DOM access here
    var css = window.getComputedStyle(element, null);
    return css[property];
}
/**
 * Returns the offset parent of the given element
 * @function
 * @ignore
 * @argument {Element} element
 * @returns {Element} offset parent
 */ function getOffsetParent(element) {
    // NOTE: 1 DOM access here
    var offsetParent = element.offsetParent;
    return offsetParent === window.document.body || !offsetParent ? window.document.documentElement : offsetParent;
}
/**
 * Returns the scrolling parent of the given element
 * @function
 * @ignore
 * @argument {Element} element
 * @returns {Element} offset parent
 */ function getScrollParent(element) {
    var parent = element.parentNode;
    if (!parent) {
        return element;
    }
    if (parent === window.document) {
        // Firefox puts the scrollTOp value on `documentElement` instead of `body`, we then check which of them is
        // greater than 0 and return the proper element
        if (window.document.body.scrollTop) {
            return window.document.body;
        } else {
            return window.document.documentElement;
        }
    }
    // Firefox want us to check `-x` and `-y` variations as well
    if ([
        'scroll',
        'auto'
    ].indexOf(getStyleComputedProperty(parent, 'overflow')) !== -1 || [
        'scroll',
        'auto'
    ].indexOf(getStyleComputedProperty(parent, 'overflow-x')) !== -1 || [
        'scroll',
        'auto'
    ].indexOf(getStyleComputedProperty(parent, 'overflow-y')) !== -1) {
        // If the detected scrollParent is body, we perform an additional check on its parentNode
        // in this way we'll get body if the browser is Chrome-ish, or documentElement otherwise
        // fixes issue #65
        return parent;
    }
    return getScrollParent(element.parentNode);
}
/**
 * Check if the given element is fixed or is inside a fixed parent
 * @function
 * @ignore
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */ function isFixed(element) {
    if (element === window.document.body) {
        return false;
    }
    if (getStyleComputedProperty(element, 'position') === 'fixed') {
        return true;
    }
    return element.parentNode ? isFixed(element.parentNode) : element;
}
/**
 * Set the style to the given popper
 * @function
 * @ignore
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles - Object with a list of properties and values which will be applied to the element
 */ function setStyle(element, styles) {
    function is_numeric(n) {
        return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
    }
    Object.keys(styles).forEach(function(prop) {
        var unit = '';
        // add unit if the value is numeric and is one of the following
        if ([
            'width',
            'height',
            'top',
            'right',
            'bottom',
            'left'
        ].indexOf(prop) !== -1 && is_numeric(styles[prop])) {
            unit = 'px';
        }
        element.style[prop] = styles[prop] + unit;
    });
}
/**
 * Check if the given variable is a function
 * @function
 * @ignore
 * @argument {*} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */ function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
/**
 * Get the position of the given element, relative to its offset parent
 * @function
 * @ignore
 * @param {Element} element
 * @return {Object} position - Coordinates of the element and its `scrollTop`
 */ function getOffsetRect(element) {
    var elementRect = {
        width: element.offsetWidth,
        height: element.offsetHeight,
        left: element.offsetLeft,
        top: element.offsetTop
    };
    elementRect.right = elementRect.left + elementRect.width;
    elementRect.bottom = elementRect.top + elementRect.height;
    // position
    return elementRect;
}
/**
 * Get bounding client rect of given element
 * @function
 * @ignore
 * @param {HTMLElement} element
 * @return {Object} client rect
 */ function getBoundingClientRect(element) {
    var rect = element.getBoundingClientRect();
    // whether the IE version is lower than 11
    var isIE = navigator.userAgent.indexOf('MSIE') != -1;
    // fix ie document bounding top always 0 bug
    var rectTop = isIE && element.tagName === 'HTML' ? -element.scrollTop : rect.top;
    return {
        left: rect.left,
        top: rectTop,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.right - rect.left,
        height: rect.bottom - rectTop
    };
}
/**
 * Given an element and one of its parents, return the offset
 * @function
 * @ignore
 * @param {HTMLElement} element
 * @param {HTMLElement} parent
 * @return {Object} rect
 */ function getOffsetRectRelativeToCustomParent(element, parent, fixed) {
    var elementRect = getBoundingClientRect(element);
    var parentRect = getBoundingClientRect(parent);
    if (fixed) {
        var scrollParent = getScrollParent(parent);
        parentRect.top += scrollParent.scrollTop;
        parentRect.bottom += scrollParent.scrollTop;
        parentRect.left += scrollParent.scrollLeft;
        parentRect.right += scrollParent.scrollLeft;
    }
    var rect = {
        top: elementRect.top - parentRect.top,
        left: elementRect.left - parentRect.left,
        bottom: elementRect.top - parentRect.top + elementRect.height,
        right: elementRect.left - parentRect.left + elementRect.width,
        width: elementRect.width,
        height: elementRect.height
    };
    return rect;
}
/**
 * Get the prefixed supported property name
 * @function
 * @ignore
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase)
 */ function getSupportedPropertyName(property) {
    var prefixes = [
        '',
        'ms',
        'webkit',
        'moz',
        'o'
    ];
    for(var i = 0; i < prefixes.length; i++){
        var toCheck = prefixes[i] ? prefixes[i] + property.charAt(0).toUpperCase() + property.slice(1) : property;
        if (typeof window.document.body.style[toCheck] !== 'undefined') {
            return toCheck;
        }
    }
    return null;
}
/**
 * The Object.assign() method is used to copy the values of all enumerable own properties from one or more source
 * objects to a target object. It will return the target object.
 * This polyfill doesn't support symbol properties, since ES5 doesn't have symbols anyway
 * Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 * @function
 * @ignore
 */ if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target) {
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }
            var to = Object(target);
            for(var i = 1; i < arguments.length; i++){
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);
                var keysArray = Object.keys(nextSource);
                for(var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++){
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

const PopperJS = Popper$1;
const stop = (e)=>e.stopPropagation();
/**
 * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
 * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
 * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end), left(-start, -end)
 * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
 * @param {Boolean} [visible=false] Visibility of the popup element.
 * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
 */ var Popper = {
    props: {
        placement: {
            type: String,
            default: 'bottom'
        },
        boundariesPadding: {
            type: Number,
            default: 0
        },
        reference: {},
        popper: {},
        offset: {
            default: 0
        },
        value: Boolean,
        visibleArrow: Boolean,
        transition: String,
        appendToBody: {
            type: Boolean,
            default: true
        },
        popperOptions: {
            type: Object,
            default () {
                return {
                    gpuAcceleration: false
                };
            }
        },
        zIndexOffset: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            showPopper: false,
            currentPlacement: ''
        };
    },
    watch: {
        value: {
            immediate: true,
            handler (val) {
                this.showPopper = val;
                this.$emit('input', val);
            }
        },
        showPopper (val) {
            val ? this.updatePopper() : this.destroyPopper();
            this.$emit('input', val);
        }
    },
    methods: {
        createPopper () {
            this.currentPlacement = this.currentPlacement || this.placement;
            if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
                return;
            }
            const options = this.popperOptions;
            const popper = this.popperElm = this.popperElm || this.popper || this.$refs.popper;
            let reference = this.referenceElm || this.reference || this.$refs.reference;
            if (!reference && this.$slots.reference && this.$slots.reference[0]) {
                reference = this.$slots.reference[0].elm;
            }
            if (!popper || !reference) return;
            if (this.visibleArrow) this.appendArrow(popper);
            if (this.appendToBody) {
                document.body.appendChild(this.popperElm);
            }
            if (this.popperJS && this.popperJS.destroy) {
                this.popperJS.destroy();
            }
            options.placement = this.currentPlacement;
            options.offset = this.offset;
            options.arrowOffset = this.arrowOffset;
            this.popperJS = new PopperJS(reference, popper, options);
            this.popperJS.onCreate(()=>{
                this.$emit('created', this);
                this.resetTransformOrigin();
                this.$nextTick(this.updatePopper);
            });
            if (typeof options.onUpdate === 'function') {
                this.popperJS.onUpdate(options.onUpdate);
            }
            this.popperJS._popper.style.zIndex = getNextZIndex() + this.zIndexOffset;
            this.popperElm.addEventListener('click', stop);
        },
        updatePopper () {
            this.popperJS ? this.popperJS.update() : this.createPopper();
        },
        doDestroy () {
            /* istanbul ignore if */ if (this.showPopper || !this.popperJS) return;
            this.popperJS.destroy();
            this.popperJS = null;
        },
        destroyPopper () {
            if (this.popperJS) {
                this.resetTransformOrigin();
            }
        },
        resetTransformOrigin () {
            const placementMap = {
                top: 'bottom',
                bottom: 'top',
                left: 'right',
                right: 'left'
            };
            const placement = this.popperJS._popper.getAttribute('x-placement').split('-')[0];
            const origin = placementMap[placement];
            this.popperJS._popper.style.transformOrigin = [
                'top',
                'bottom'
            ].indexOf(placement) > -1 ? `center ${origin}` : `${origin} center`;
        },
        appendArrow (element) {
            let hash;
            if (this.appended) {
                return;
            }
            this.appended = true;
            for(const item in element.attributes){
                if (/^_v-/.test(element.attributes[item].name)) {
                    hash = element.attributes[item].name;
                    break;
                }
            }
            const arrow = document.createElement('div');
            if (hash) {
                arrow.setAttribute(hash, '');
            }
            arrow.setAttribute('x-arrow', '');
            arrow.className = 'popper__arrow';
            element.appendChild(arrow);
        }
    },
    beforeDestroy () {
        this.doDestroy();
        if (this.popperElm && this.popperElm.parentNode === document.body) {
            this.popperElm.removeEventListener('click', stop);
            document.body.removeChild(this.popperElm);
        }
    },
    // call destroy in keep-alive mode
    deactivated () {
        this.$options.beforeDestroy[0].call(this);
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
var script$3 = {
    name: 'MultiSelectDropdown',
    componentName: 'MultiSelectDropdown',
    mixins: [
        Popper
    ],
    props: {
        placement: {
            type: String,
            default: 'bottom-start'
        },
        width: {
            type: Number,
            default: 0
        },
        boundariesPadding: {
            type: Number,
            default: 0
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        popperOptions: {
            type: null,
            default () {
                return {
                    forceAbsolute: true,
                    gpuAcceleration: false
                };
            }
        },
        // zIndex 偏移量
        zIndexOffset: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 248
        }
    },
    data () {
        return {
            referenceElm: null,
            minWidth: '',
            maxWidth: ''
        };
    },
    computed: {
        popperClass () {
            return this.$parent.popperClass;
        }
    },
    watch: {
        '$parent.selectWidth' () {
            const inputWidth = this.$parent.$el.getBoundingClientRect().width;
            this.minWidth = inputWidth + 'px';
            this.maxWidth = (this.$parent.maxWidth || inputWidth) + 'px';
        }
    },
    mounted () {
        this.$parent.popperElm = this.popperElm = this.$el;
        this.referenceElm = this.$parent.$el;
    },
    methods: {}
};

const __vue_script__$3 = script$3;
/* template */ var __vue_render__$3 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        ref: "popper",
        staticClass: "hik-cloud-select-dropdown",
        class: [
            {
                'is-multiple': _vm.$parent.multiple
            },
            _vm.popperClass
        ],
        style: {
            minWidth: _vm.width + 'px',
            maxWidth: _vm.width + 'px',
            height: _vm.height + 'px'
        }
    }, [
        _vm._t("default")
    ], 2);
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudSingleSelect',
    directives: {
        Clickoutside
    },
    components: {
        MultiSelectDropdown: __vue_component__$3,
        VirualList: __vue_component__$4
    },
    mixins: [
        Locale,
        emitter
    ],
    props: {
        value: {
            type: [
                String,
                Number
            ],
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        clear: {
            type: Boolean,
            default: false
        },
        placeholder: {
            type: String,
            default: ''
        },
        placeholderSearch: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: 'label'
        },
        valueKey: {
            type: String,
            default: 'value'
        },
        options: {
            type: Array,
            default: ()=>[]
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        itemSize: {
            type: Number,
            default: 44
        },
        itemMargin: {
            type: Number,
            default: 4
        },
        isOptionTopFlag: {
            type: String,
            default: ''
        },
        popperClass: {
            type: String,
            default: ''
        },
        filterable: {
            type: Boolean,
            default: true
        },
        zIndexOffset: {
            type: Number,
            default: 0
        },
        visibleCount: {
            type: Number,
            default: 5
        },
        itemClass: {
            type: String,
            default: ''
        },
        validateEvent: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            visible: false,
            keyWord: '',
            headerHeight: 0,
            inputHovering: false,
            localOptions: [],
            selectedOptions: []
        };
    },
    computed: {
        showLocalOptions () {
            return this.localOptions.filter((item)=>{
                return item[this.label].indexOf(this.keyWord) > -1;
            });
        },
        showClearIcon () {
            return this.clear && !this.disabled && !this.readonly && this.inputHovering && this.value !== undefined && this.value !== '';
        },
        iconClass () {
            return this.showClearIcon ? 'h-icon-close_f' : 'h-icon-angle_down_sm';
        },
        valueLable () {
            const targetItem = this.options.find((item)=>item[this.valueKey] === this.value);
            return targetItem ? targetItem[this.label] : '';
        },
        placeholderText () {
            return this.placeholder || this.t('ym.base.pleaseSelect');
        },
        placeholderSearchText () {
            return this.placeholderSearch || this.t('ym.base.search');
        },
        dropDownHeight () {
            const filterableHeight = this.filterable ? 48 : 0;
            return this.visibleCount * this.itemSize + filterableHeight + this.headerHeight + (this.visibleCount - 1) * 4 + 8;
        }
    },
    watch: {
        options: {
            handler: function(val) {
                if (val) {
                    this.initSelectedOptions();
                }
            },
            immediate: true,
            deep: true
        },
        '$slots.header': {
            handler () {
                this.updateHeaderHeight();
            },
            deep: true
        },
        visible: {
            handler: function(val) {
                this.$nextTick(()=>{
                    this.$emit('visible-change', val);
                });
            }
        },
        value: {
            handler: function(val) {
                this.$emit('change', val);
                if (this.validateEvent) this.dispatch('ElFormItem', 'el.form.change', [
                    val
                ]);
            }
        }
    },
    mounted () {
        this.updateHeaderHeight();
    },
    updated () {
        this.updateHeaderHeight();
    },
    methods: {
        updateHeaderHeight () {
            this.$nextTick(()=>{
                if (this.$refs.headerSlot && this.$slots.header) {
                    this.headerHeight = this.$refs.headerSlot.offsetHeight || 0;
                } else {
                    this.headerHeight = 0;
                }
            });
        },
        handleSearchInput () {},
        initSelectedOptions () {
            this.localOptions = this.options;
        },
        clearSelected (event) {
            event && event.stopPropagation();
            this.$emit('input', '');
        },
        toggleMenu () {
            if (!this.disabled && !this.readonly) {
                this.visible = !this.visible;
                this.computedSelectWidth();
                this.$nextTick(()=>{
                    if (this.visible) {
                        this.$refs.popper.updatePopper();
                    }
                });
            }
        },
        handleIconClick (event) {
            if (this.showClearIcon) {
                this.clearSelected(event);
                this.handleClose();
            } else {
                this.toggleMenu();
            }
        },
        handleItemClick (val) {
            this.$emit('input', val[this.valueKey]);
            this.handleClose();
        },
        computedSelectWidth () {
            this.selectWidth = this.$el.getBoundingClientRect().width;
        },
        handleMenuEnter () {},
        hideDropdown () {
            this.visible = false;
        },
        showDropdown () {
            this.visible = true;
        },
        afterEnter () {
            if (this.$refs.virualList) {
                this.$nextTick(()=>{
                    this.$refs.virualList.setBase();
                });
            }
        },
        doDestroy () {},
        handleClose () {
            this.visible = false;
        }
    }
};

const __vue_script__$2 = script$2;
/* template */ var __vue_render__$2 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        directives: [
            {
                name: "clickoutside",
                rawName: "v-clickoutside",
                value: _vm.handleClose,
                expression: "handleClose"
            }
        ],
        staticClass: "hik-cloud-single-select"
    }, [
        _c('div', {
            staticClass: "single-select__tags",
            class: {
                'is-disabled': _vm.disabled
            },
            on: {
                "mouseenter": function($event) {
                    _vm.inputHovering = true;
                },
                "mouseleave": function($event) {
                    _vm.inputHovering = false;
                }
            }
        }, [
            _c('input', {
                directives: [
                    {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.valueLable,
                        expression: "valueLable"
                    }
                ],
                ref: "reference",
                staticClass: "single-select__input",
                attrs: {
                    "type": "text",
                    "disabled": _vm.disabled,
                    "placeholder": _vm.placeholderText,
                    "readonly": "true"
                },
                domProps: {
                    "value": _vm.valueLable
                },
                on: {
                    "click": _vm.toggleMenu,
                    "input": function($event) {
                        if ($event.target.composing) {
                            return;
                        }
                        _vm.valueLable = $event.target.value;
                    }
                }
            }),
            _c('el-button', {
                staticClass: "multi-select__icon",
                class: {
                    'is-reverse': _vm.visible && !_vm.showClearIcon
                },
                staticStyle: {
                    "margin-left": "0px"
                },
                attrs: {
                    "icon": _vm.iconClass,
                    "size": "mini"
                },
                on: {
                    "click": _vm.handleIconClick
                }
            })
        ], 1),
        _c('transition', {
            attrs: {
                "name": "el-zoom-in-top"
            },
            on: {
                "before-enter": _vm.handleMenuEnter,
                "after-enter": _vm.afterEnter,
                "after-leave": _vm.doDestroy
            }
        }, [
            _vm.visible ? _c('MultiSelectDropdown', {
                ref: "popper",
                attrs: {
                    "appendToBody": _vm.appendToBody,
                    "width": _vm.selectWidth,
                    "height": _vm.dropDownHeight,
                    "zIndexOffset": _vm.zIndexOffset
                }
            }, [
                _vm.filterable ? _c('div', {
                    staticClass: "select-search-box"
                }, [
                    _c('el-input', {
                        attrs: {
                            "placeholder": _vm.placeholderSearchText,
                            "clearable": ""
                        },
                        on: {
                            "input": _vm.handleSearchInput
                        },
                        model: {
                            value: _vm.keyWord,
                            callback: function($$v) {
                                _vm.keyWord = $$v;
                            },
                            expression: "keyWord"
                        }
                    })
                ], 1) : _vm._e(),
                _vm.$slots.header ? _c('div', {
                    ref: "headerSlot"
                }, [
                    _vm._t("header")
                ], 2) : _vm._e(),
                _c('VirualList', {
                    ref: "virualList",
                    class: [
                        _vm.popperClass
                    ],
                    attrs: {
                        "listData": _vm.showLocalOptions,
                        "itemSize": _vm.itemSize
                    },
                    scopedSlots: _vm._u([
                        {
                            key: "default",
                            fn: function(scope) {
                                return [
                                    _c('div', {
                                        staticClass: "hik-cloud-select-option-item",
                                        class: [
                                            scope.item[_vm.valueKey] === _vm.value ? 'hik-cloud-select-option-item__selected' : '',
                                            _vm.isOptionTopFlag && scope.item[_vm.isOptionTopFlag] ? 'hik-cloud-select-option-item_top' : ''
                                        ],
                                        on: {
                                            "click": function($event) {
                                                return _vm.handleItemClick(scope.item);
                                            }
                                        }
                                    }, [
                                        _vm._t("default", function() {
                                            return [
                                                _c('div', {
                                                    staticClass: "hik-cloud-select-option-item__main"
                                                }, [
                                                    _c('span', {
                                                        attrs: {
                                                            "title": scope.item[_vm.label]
                                                        }
                                                    }, [
                                                        _vm._v(_vm._s(scope.item[_vm.label]))
                                                    ])
                                                ])
                                            ];
                                        }, {
                                            "row": scope.item
                                        })
                                    ], 2)
                                ];
                            }
                        }
                    ], null, true)
                })
            ], 1) : _vm._e()
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: "HikCloudMultiSelect",
    components: {
        VirualList: __vue_component__$4,
        MultiSelectDropdown: __vue_component__$3
    },
    directives: {
        Clickoutside
    },
    mixins: [
        emitter,
        Locale
    ],
    props: {
        value: {
            type: Array,
            required: true
        },
        options: {
            type: Array,
            default: ()=>[]
        },
        valueKey: {
            type: String,
            default: "value"
        },
        label: {
            type: String,
            default: "label"
        },
        placeholder: {
            type: String,
            default: ""
        },
        placeholderSearch: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        readonly: {
            type: Boolean,
            default: false
        },
        popperClass: {
            type: String,
            default: ""
        },
        clear: {
            type: Boolean,
            default: true
        },
        collapseTags: {
            type: Boolean,
            default: true
        },
        itemSize: {
            type: Number,
            default: 44
        },
        itemMargin: {
            type: Number,
            default: 4
        },
        appendToBody: {
            type: Boolean,
            default: true
        },
        isOptionTopFlag: {
            type: String,
            default: ""
        },
        filterable: {
            type: Boolean,
            default: true
        },
        multipleLimit: {
            type: Number,
            default: 0
        },
        zIndexOffset: {
            type: Number,
            default: 0
        },
        allowSelectAll: {
            type: Boolean,
            default: false
        },
        itemClass: {
            type: String,
            default: ''
        },
        visibleCount: {
            type: Number,
            default: 5
        },
        validateEvent: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            selectWidth: 0,
            containerVal: "",
            keyWord: "",
            visible: false,
            localOptions: [],
            selectedOptions: [],
            allSelect: {
                checked: false,
                indeterminate: false
            },
            headerHeight: 0,
            inputHovering: false
        };
    },
    computed: {
        placeholderText () {
            return this.placeholder || this.t('ym.base.pleaseSelect');
        },
        placeholderSearchText () {
            return this.placeholderSearch || this.t('ym.base.search');
        },
        showLocalOptions () {
            let options = this.localOptions.filter((item)=>{
                return item[this.label].indexOf(this.keyWord) > -1;
            });
            return options;
        },
        showClearIcon () {
            return this.clear && !this.disabled && !this.readonly && this.inputHovering && this.selectedOptions !== undefined && this.selectedOptions.length;
        },
        iconClass () {
            return this.showClearIcon ? 'h-icon-close_f' : 'h-icon-angle_down_sm';
        },
        isLimitReached () {
            return this.multipleLimit > 0 && this.selectedOptions.length >= this.multipleLimit;
        },
        dropDownHeight () {
            const filterableHeight = this.filterable ? 48 : 0;
            const allCheckedHeight = this.allowSelectAll ? this.itemSize : 0;
            return this.visibleCount * this.itemSize + filterableHeight + allCheckedHeight + this.headerHeight + (this.visibleCount - 1) * 4 + 8;
        }
    },
    watch: {
        options: {
            handler: function(val) {
                const _options = JSON.parse(JSON.stringify(val));
                this.localOptions = _options.map((val)=>{
                    val.checked = false;
                    return val;
                });
                this.matchOptions(this.value);
                this.initSelectedOptions();
                // 如果启用了全选功能，需要更新全选状态
                if (this.allowSelectAll) {
                    this.$nextTick(()=>{
                        this.updateSelectAllState();
                    });
                }
            },
            immediate: true,
            deep: true
        },
        value: {
            handler: function(val, oldVal) {
                if (val) {
                    const currentValues = oldVal || [];
                    if (JSON.stringify(currentValues) === JSON.stringify(val)) return;
                    this.matchOptions(val);
                    this.initSelectedOptions();
                    if (this.validateEvent) this.dispatch('ElFormItem', 'el.form.change', [
                        val
                    ]);
                    if (this.allowSelectAll) {
                        this.$emit("change", val, this.allSelect.checked, this.allSelect.indeterminate);
                    } else {
                        this.$emit("change", val);
                    }
                }
            }
        },
        showLocalOptions: {
            handler: function() {
                if (this.allowSelectAll) {
                    this.$nextTick(()=>{
                        this.updateSelectAllState();
                    });
                }
            }
        },
        visible: {
            handler: function(val) {
                this.$nextTick(()=>{
                    this.$emit("visible-change", val);
                });
            }
        }
    },
    mounted () {
        this.computedSelectWidth();
        this.updateHeaderHeight();
    },
    updated () {
        this.updateHeaderHeight();
    },
    methods: {
        updateHeaderHeight () {
            this.$nextTick(()=>{
                if (this.$refs.headerSlot && this.$slots.header) {
                    this.headerHeight = this.$refs.headerSlot.offsetHeight || 0;
                } else {
                    this.headerHeight = 0;
                }
            });
        },
        handleSearchInput () {},
        handleClose () {
            this.visible = false;
        },
        computedSelectWidth () {
            this.selectWidth = this.$el.getBoundingClientRect().width;
        },
        handleItemClick (val) {
            if (this.isLimitReached && !val.checked) return;
            val.checked = !val.checked;
            this.itemCheckChange(val);
        },
        itemCheckChange (val) {
            const _checked = val.checked;
            const targetIndex = this.selectedOptions.findIndex((item)=>item[this.valueKey] === val[this.valueKey]);
            if (targetIndex > -1) {
                if (!_checked) {
                    this.selectedOptions.splice(targetIndex, 1);
                }
            } else {
                if (_checked) {
                    this.selectedOptions.push(val);
                }
            }
            // 如果启用了全选功能，需要更新全选状态
            if (this.allowSelectAll) {
                this.updateSelectAllState();
            }
            this.emitSelectedOptionsValue();
        },
        updateSelectAllState () {
            const visibleOptions = this.showLocalOptions;
            if (this.showLocalOptions.length > 0) {
                const checkedOptions = visibleOptions.filter((item)=>item.checked);
                const allChecked = checkedOptions.length === visibleOptions.length;
                const indeterminate = checkedOptions.length > 0 && checkedOptions.length < visibleOptions.length;
                this.$set(this.allSelect, 'checked', allChecked);
                this.$set(this.allSelect, 'indeterminate', indeterminate);
            }
        },
        delItem (event, target) {
            const targetIndex = this.selectedOptions.findIndex((item)=>item[this.valueKey] === target[this.valueKey]);
            const targetAllIndex = this.localOptions.findIndex((item)=>item[this.valueKey] === target[this.valueKey]);
            if (targetAllIndex > -1) {
                this.localOptions[targetAllIndex].checked = false;
            }
            if (targetIndex > -1) {
                this.selectedOptions.splice(targetIndex, 1);
                this.emitSelectedOptionsValue();
            }
            event.stopPropagation();
        },
        initSelectedOptions () {
            const selectKey = this.selectedOptions.map((item)=>item[this.valueKey]);
            this.localOptions.forEach((localItem)=>{
                this.$set(localItem, "checked", selectKey.includes(localItem[this.valueKey]));
            });
        },
        clearSelected (event) {
            event && event.stopPropagation();
            this.selectedOptions = [];
            this.emitSelectedOptionsValue();
            if (this.allowSelectAll) {
                this.$nextTick(()=>{
                    this.updateSelectAllState();
                });
            }
        },
        handleIconClick (event) {
            if (this.showClearIcon) {
                this.clearSelected(event);
                this.handleClose();
            } else {
                this.toggleMenu();
            }
        },
        toggleMenu () {
            if (!this.disabled && !this.readonly) {
                this.visible = !this.visible;
                this.computedSelectWidth();
                this.$nextTick(()=>{
                    if (this.visible) {
                        this.$refs.popper.updatePopper();
                    }
                });
            }
        },
        toggleSelectAll () {
            // 获取所有可见的选项（排除全选选项本身）
            const visibleOptions = this.showLocalOptions.filter((item)=>item.value !== 'selectAll');
            // 如果所有选项都已选中，则反选（取消全选）
            const allSelected = visibleOptions.every((item)=>item.checked);
            if (allSelected) {
                // 取消全选
                visibleOptions.forEach((item)=>{
                    item.checked = false;
                    this.itemCheckChange(item);
                });
            } else {
                // 全选
                visibleOptions.forEach((item)=>{
                    if (!item.checked) {
                        item.checked = true;
                        this.itemCheckChange(item);
                    }
                });
            }
        },
        handleMenuEnter () {},
        matchOptions (val) {
            const _options = JSON.parse(JSON.stringify(val));
            this.selectedOptions = this.localOptions.filter((val)=>{
                if (_options.includes(val[this.valueKey])) {
                    val.checked = true;
                    return true;
                }
            });
            // 如果启用了全选功能，需要更新全选状态
            if (this.allowSelectAll) {
                this.$nextTick(()=>{
                    this.updateSelectAllState();
                });
            }
        },
        emitSelectedOptionsValue () {
            const values = this.selectedOptions.map((item)=>item[this.valueKey]);
            this.$emit("input", values);
        // if (this.allowSelectAll) {
        //   this.$emit("change", values, this.allSelect.checked, this.allSelect.indeterminate);
        // } else {
        //   this.$emit("change", values);
        // }
        },
        hideDropdown () {
            this.visible = false;
        },
        showDropdown () {
            this.visible = true;
        },
        afterEnter () {
            if (this.$refs.virualList) {
                this.$nextTick(()=>{
                    this.$refs.virualList.setBase();
                });
            }
        },
        doDestroy () {}
    }
};

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        directives: [
            {
                name: "clickoutside",
                rawName: "v-clickoutside",
                value: _vm.handleClose,
                expression: "handleClose"
            }
        ],
        staticClass: "hik-cloud-multi-select"
    }, [
        _c('div', {
            staticClass: "multi-select__tags",
            class: {
                'is-disabled': _vm.disabled
            },
            on: {
                "mouseenter": function($event) {
                    _vm.inputHovering = true;
                },
                "mouseleave": function($event) {
                    _vm.inputHovering = false;
                }
            }
        }, [
            _c('div', {
                staticClass: "value-container",
                on: {
                    "click": function($event) {
                        $event.stopPropagation();
                        return _vm.toggleMenu.apply(null, arguments);
                    }
                }
            }, [
                _vm.collapseTags && _vm.selectedOptions.length ? _c('span', {
                    staticClass: "tag-container"
                }, [
                    _c('el-tag', {
                        attrs: {
                            "closable": !_vm.disabled && !_vm.readonly,
                            "maxWidth": "50px",
                            "title": _vm.selectedOptions[0][_vm.label]
                        },
                        on: {
                            "close": function($event) {
                                return _vm.delItem($event, _vm.selectedOptions[0]);
                            }
                        }
                    }, [
                        _vm._v(" " + _vm._s(_vm.selectedOptions[0][_vm.label]) + " ")
                    ]),
                    _vm.selectedOptions.length > 1 ? _c('el-tag', {
                        attrs: {
                            "closable": false,
                            "type": "primary",
                            "close-transitions": ""
                        }
                    }, [
                        _c('span', {
                            staticClass: "el-select__tags-text"
                        }, [
                            _vm._v(" + " + _vm._s(_vm.selectedOptions.length - 1) + " ")
                        ])
                    ]) : _vm._e()
                ], 1) : _vm._e(),
                !_vm.collapseTags && _vm.selectedOptions.length ? _c('span', {
                    staticClass: "tag-container"
                }, _vm._l(_vm.selectedOptions, function(item) {
                    return _c('el-tag', {
                        key: item.valueKey,
                        attrs: {
                            "closable": !_vm.disabled && !_vm.readonly,
                            "title": item[_vm.label]
                        },
                        on: {
                            "close": function($event) {
                                return _vm.delItem($event, item);
                            }
                        }
                    }, [
                        _vm._v(" " + _vm._s(item[_vm.label]) + " ")
                    ]);
                }), 1) : _vm._e()
            ]),
            _c('input', {
                ref: "reference",
                staticClass: "multi-select__input",
                attrs: {
                    "type": "text",
                    "readonly": true,
                    "disabled": _vm.disabled,
                    "placeholder": _vm.selectedOptions.length ? '' : _vm.placeholderText
                },
                on: {
                    "click": _vm.toggleMenu
                }
            }),
            _c('el-button', {
                staticClass: "multi-select__icon",
                class: {
                    'is-reverse': _vm.visible && !_vm.showClearIcon
                },
                staticStyle: {
                    "margin-left": "0px"
                },
                attrs: {
                    "icon": _vm.iconClass,
                    "size": "mini"
                },
                on: {
                    "click": _vm.handleIconClick
                }
            })
        ], 1),
        _c('transition', {
            attrs: {
                "name": "el-zoom-in-top"
            },
            on: {
                "before-enter": _vm.handleMenuEnter,
                "after-enter": _vm.afterEnter,
                "after-leave": _vm.doDestroy
            }
        }, [
            _vm.visible ? _c('MultiSelectDropdown', {
                ref: "popper",
                attrs: {
                    "appendToBody": _vm.appendToBody,
                    "width": _vm.selectWidth,
                    "height": _vm.dropDownHeight,
                    "zIndexOffset": _vm.zIndexOffset
                }
            }, [
                _vm.filterable || _vm.allowSelectAll ? _c('div', {
                    staticClass: "select-search-box"
                }, [
                    _vm.filterable ? _c('el-input', {
                        attrs: {
                            "placeholder": _vm.placeholderSearchText,
                            "clearable": ""
                        },
                        on: {
                            "input": _vm.handleSearchInput
                        },
                        model: {
                            value: _vm.keyWord,
                            callback: function($$v) {
                                _vm.keyWord = $$v;
                            },
                            expression: "keyWord"
                        }
                    }) : _vm._e()
                ], 1) : _vm._e(),
                _vm.$slots.header ? _c('div', {
                    ref: "headerSlot"
                }, [
                    _vm._t("header")
                ], 2) : _vm._e(),
                _vm.allowSelectAll ? _c('div', {
                    directives: [
                        {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.showLocalOptions.length,
                            expression: "showLocalOptions.length"
                        }
                    ],
                    staticClass: "hik-cloud-select-option-item",
                    style: {
                        'height': _vm.itemSize + 'px',
                        'min-height': _vm.itemSize + 'px'
                    }
                }, [
                    _c('el-checkbox', {
                        attrs: {
                            "indeterminate": _vm.allSelect.indeterminate,
                            "disabled": _vm.isLimitReached && !_vm.allSelect.checked
                        },
                        on: {
                            "change": _vm.toggleSelectAll
                        },
                        model: {
                            value: _vm.allSelect.checked,
                            callback: function($$v) {
                                _vm.$set(_vm.allSelect, "checked", $$v);
                            },
                            expression: "allSelect.checked"
                        }
                    }),
                    _c('div', {
                        staticClass: "hik-cloud-select-option-item__main",
                        on: {
                            "click": _vm.toggleSelectAll
                        }
                    }, [
                        _c('span', {
                            attrs: {
                                "title": _vm.t('ym.base.all')
                            }
                        }, [
                            _vm._v(" " + _vm._s(_vm.t('ym.base.all')) + " ")
                        ])
                    ])
                ], 1) : _vm._e(),
                _c('VirualList', {
                    ref: "virualList",
                    class: [
                        _vm.popperClass
                    ],
                    attrs: {
                        "listData": _vm.showLocalOptions,
                        "itemSize": _vm.itemSize
                    },
                    scopedSlots: _vm._u([
                        {
                            key: "default",
                            fn: function(scope) {
                                return [
                                    _c('div', {
                                        staticClass: "hik-cloud-select-option-item",
                                        class: [
                                            _vm.isOptionTopFlag && scope.item[_vm.isOptionTopFlag] ? 'hik-cloud-select-option-item_top' : '',
                                            _vm.itemClass
                                        ]
                                    }, [
                                        _c('el-checkbox', {
                                            attrs: {
                                                "indeterminate": scope.item.indeterminate,
                                                "disabled": _vm.isLimitReached && !scope.item.checked
                                            },
                                            on: {
                                                "change": function($event) {
                                                    return _vm.itemCheckChange(scope.item);
                                                }
                                            },
                                            model: {
                                                value: scope.item.checked,
                                                callback: function($$v) {
                                                    _vm.$set(scope.item, "checked", $$v);
                                                },
                                                expression: "scope.item.checked"
                                            }
                                        }),
                                        _c('div', {
                                            staticClass: "hik-cloud-select-option-item__main",
                                            on: {
                                                "click": function($event) {
                                                    return _vm.handleItemClick(scope.item);
                                                }
                                            }
                                        }, [
                                            _vm._t("default", function() {
                                                return [
                                                    _c('span', {
                                                        attrs: {
                                                            "title": scope.item[_vm.label]
                                                        }
                                                    }, [
                                                        _vm._v(" " + _vm._s(scope.item[_vm.label]) + " ")
                                                    ])
                                                ];
                                            }, {
                                                "row": scope.item
                                            })
                                        ], 2)
                                    ], 1)
                                ];
                            }
                        }
                    ], null, true)
                })
            ], 1) : _vm._e()
        ], 1)
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
var script = {
    name: 'HikCloudVirtualSelect',
    components: {
        singleSelect: __vue_component__$2,
        MultiSelect: __vue_component__$1
    },
    inheritAttrs: false,
    props: {
        multiple: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {};
    },
    methods: {
        hideDropdown () {
            if (this.multiple) {
                this.$refs.multiple.hideDropdown();
            } else {
                this.$refs.single.hideDropdown();
            }
        },
        showDropdown () {
            if (this.multiple) {
                this.$refs.multiple.showDropdown();
            } else {
                this.$refs.single.showDropdown();
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
        staticClass: "hik-cloud-virtual-select"
    }, [
        _vm.multiple ? _c('MultiSelect', _vm._g(_vm._b({
            ref: "multiple",
            scopedSlots: _vm._u([
                {
                    key: "default",
                    fn: function(ref) {
                        var row = ref.row;
                        return [
                            _vm._t("default", null, {
                                "row": row
                            })
                        ];
                    }
                }
            ], null, true)
        }, 'MultiSelect', _vm.$attrs, false), _vm.$listeners), [
            _c('template', {
                slot: "header"
            }, [
                _vm._t("header")
            ], 2)
        ], 2) : _c('singleSelect', _vm._g(_vm._b({
            ref: "single",
            scopedSlots: _vm._u([
                {
                    key: "default",
                    fn: function(ref) {
                        var row = ref.row;
                        return [
                            _vm._t("default", null, {
                                "row": row
                            })
                        ];
                    }
                }
            ], null, true)
        }, 'singleSelect', _vm.$attrs, false), _vm.$listeners), [
            _c('template', {
                slot: "header"
            }, [
                _vm._t("header")
            ], 2)
        ], 2)
    ], 1);
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

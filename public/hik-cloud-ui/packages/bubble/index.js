import { PopupManager } from 'hui/src/utils/popup';

function getNextZIndex() {
    const hui = window && window.hui;
    return hui && typeof hui.nextZIndex === 'function' ? hui.nextZIndex() : PopupManager.nextZIndex();
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
var script = {
    name: 'HikCloudBubble',
    props: {
        /**
     * 气泡提示框的可见性控制
     * @default false
     * @emits update:visible - 当visible状态变化时触发
     */ visible: {
            type: Boolean,
            default: false
        },
        /**
     * 气泡提示框的标题内容
     * @default '这是一个bubble组件'
     * @description 当没有提供content插槽时显示此标题
     */ title: {
            type: String,
            default: '这是一个bubble组件'
        },
        /**
     * 是否启用暗色主题
     * @default false
     */ dark: {
            type: Boolean,
            default: false
        },
        /**
     * 自定义气泡的z-index层级
     * @default null
     */ zIndex: {
            type: Number,
            default: null
        },
        /**
     * 自定义CSS类名，用于扩展气泡样式
     * @default ''
     */ customClass: {
            type: String,
            default: ''
        },
        /**
     * 目标元素选择器，气泡将监听此元素的鼠标事件
     * 支持'body'或以#开头的ID选择器
     * @required
     */ targetSelector: {
            type: String,
            required: true,
            validator: (value)=>{
                return value === 'body' || value.startsWith('#') && value.length > 1;
            }
        },
        /**
     * 是否手动控制气泡的显示和隐藏
     * 如果为true，则需要通过visible prop手动控制显示状态
     * 如果为false，气泡会根据鼠标事件自动显示/隐藏
     * @default false
     */ manual: {
            type: Boolean,
            default: false
        },
        /**
     * 是否显示箭头指示器
     * @description 启用后会在气泡边缘显示一个小箭头，指向目标元素
     */ showArrow: {
            type: Boolean,
            default: false
        },
        /**
     * 气泡的初始位置
     * @default 'top'
     * @validator {function} 验证位置值，必须是 'top', 'bottom', 'left', 'right' 之一
     * @description 气泡相对于鼠标的初始位置，支持根据边界值自适应调整
     */ placement: {
            type: String,
            default: 'top',
            validator: (value)=>{
                return [
                    'top',
                    'bottom',
                    'left',
                    'right'
                ].includes(value);
            }
        }
    },
    data () {
        return {
            /**
       * 气泡提示框的位置坐标
       * @type {Object}
       * @property {number} x - X轴坐标（像素）
       * @property {number} y - Y轴坐标（像素）
       */ position: {
                x: 0,
                y: 0
            },
            /**
       * 气泡的z-index层级
       * @default 2000
       */ containerZIndex: 2000,
            /**
       * 目标元素DOM引用
       * @type {HTMLElement|null}
       * @default null
       */ targetElement: null,
            /**
       * 当前气泡位置
       * @default ''
       * @description 当前气泡的实际显示位置，由边界检测算法自动确定
       */ currentPosition: '',
            /**
       * 计算出的箭头方向
       * @default 'top'
       * @description 箭头指向的方向，用于指示目标元素位置
       */ computedArrowDirection: 'top'
        };
    },
    watch: {
        /**
     * 监听visible属性变化
     * 当气泡变为可见时，重新计算z-index层级并处理显示逻辑
     * 当气泡变为隐藏时，处理隐藏逻辑
     * @param {boolean} val - 新的可见性状态
     */ visible (val) {
            if (val) {
                this.computeZIndex();
                this.handleShow();
            } else {
                this.handleHide();
            }
        },
        /**
     * 监听targetSelector属性变化
     * 当目标选择器改变时，重新初始化目标元素和事件监听器
     * 注意：在manual模式下，targetSelector的变化不会影响实际的目标元素
     */ targetSelector () {
            // 当manual为true时，targetSelector的变化不会影响实际的目标元素
            if (!this.manual) {
                this.removeEventListeners();
                this.initTargetElement();
                this.addEventListeners();
            }
        }
    },
    /**
   * 组件挂载后执行
   * 将气泡元素添加到body中，并初始化目标元素和事件监听器
   */ mounted () {
        this.$nextTick(()=>{
            this.safeAppendToBody(this.$el);
            this.initTargetElement();
            this.addEventListeners();
            // 如果初始状态是可见的，触发显示动画
            if (this.visible) {
                this.computeZIndex();
            }
        });
    },
    /**
   * 组件销毁前执行
   * 清理资源：从body中移除气泡元素，并移除事件监听器
   */ beforeDestroy () {
        this.safeRemoveFromBody(this.$el);
        this.removeEventListeners();
    },
    methods: {
        /**
     * 安全地将元素添加到body中
     * @param {HTMLElement} element - 要添加的元素
     */ safeAppendToBody (element) {
            if (element && element.parentNode !== document.body) {
                document.body.appendChild(element);
            }
        },
        /**
     * 安全地从body中移除元素
     * @param {HTMLElement} element - 要移除的元素
     */ safeRemoveFromBody (element) {
            if (element && element.parentNode === document.body) {
                document.body.removeChild(element);
            }
        },
        /**
     * 获取目标元素
     * 支持'body'选择器和以#开头的ID选择器
     * @param {string} selector - 选择器字符串
     * @returns {HTMLElement|null} 目标元素或null
     */ getTargetElement (selector) {
            if (selector === 'body') {
                return document.body;
            }
            if (selector.startsWith('#')) {
                const elementId = selector.substring(1);
                return document.getElementById(elementId);
            }
            return null;
        },
        /**
     * 计算气泡的z-index层级
     * 如果props中指定了zIndex，则使用指定值
     */ computeZIndex () {
            this.containerZIndex = this.zIndex !== null ? this.zIndex : getNextZIndex();
        },
        /**
     * 初始化目标元素
     * 根据manual模式和targetSelector配置确定要监听的目标元素
     * 当manual为true时强制使用body作为目标元素
     * 支持body选择器或ID选择器格式
     * @throws {console.warn} 当ID选择器对应的元素不存在时发出警告
     */ initTargetElement () {
            // 当manual为true时，强制使用body作为目标元素
            const selector = this.manual ? 'body' : this.targetSelector;
            this.targetElement = this.getTargetElement(selector);
        },
        /**
     * 添加事件监听器
     * 为目标元素添加mouseenter、mousemove、mouseleave事件监听
     * 仅在非manual模式且目标元素存在时添加监听
     * 保存函数引用以便后续移除
     */ addEventListeners () {
            if (this.targetElement) {
                // 使用相同的函数引用，确保可以正确移除
                this._handleMouseEnter = this.handleMouseEnter.bind(this);
                this._handleMousemove = this.handleMousemove.bind(this);
                this._handleMouseLeave = this.handleMouseLeave.bind(this);
                // 在manual模式下，只添加mousemove事件来更新位置
                // 不添加mouseenter/mouseleave事件，因为显示/隐藏由用户手动控制
                if (this.manual) {
                    this.targetElement.addEventListener('mousemove', this._handleMousemove);
                } else {
                    this.targetElement.addEventListener('mouseenter', this._handleMouseEnter);
                    this.targetElement.addEventListener('mousemove', this._handleMousemove);
                    this.targetElement.addEventListener('mouseleave', this._handleMouseLeave);
                }
            }
        },
        /**
     * 移除事件监听器
     * 清理之前添加的所有鼠标事件监听器
     * 使用保存的函数引用确保正确移除对应的事件处理函数
     * 清理函数引用以避免内存泄漏
     */ removeEventListeners () {
            if (this.targetElement) {
                // 使用保存的函数引用进行移除
                // 在manual模式下，只需要移除mousemove事件
                if (this.manual) {
                    if (this._handleMousemove) {
                        this.targetElement.removeEventListener('mousemove', this._handleMousemove);
                    }
                } else {
                    if (this._handleMouseEnter) {
                        this.targetElement.removeEventListener('mouseenter', this._handleMouseEnter);
                    }
                    if (this._handleMousemove) {
                        this.targetElement.removeEventListener('mousemove', this._handleMousemove);
                    }
                    if (this._handleMouseLeave) {
                        this.targetElement.removeEventListener('mouseleave', this._handleMouseLeave);
                    }
                }
                // 清理函数引用
                this._handleMouseEnter = null;
                this._handleMousemove = null;
                this._handleMouseLeave = null;
            }
        },
        /**
     * 处理鼠标进入目标元素事件
     * 在非manual模式下，当鼠标进入目标元素时显示气泡
     * 触发update:visible事件将visible设置为true
     */ handleMouseEnter () {
            if (!this.manual && !this.visible) {
                this.handleShow();
            }
        },
        /**
     * 处理鼠标离开目标元素事件
     * 在非manual模式下，当鼠标离开目标元素时隐藏气泡
     * 触发update:visible事件将visible设置为false
     */ handleMouseLeave () {
            if (!this.manual && this.visible) {
                this.handleHide();
            }
        },
        /**
     * 处理鼠标移动事件
     * 根据鼠标位置计算并更新气泡的位置
     * 包含边界检测，确保气泡不会超出视窗范围
     * @param {MouseEvent} e - 鼠标事件对象
     * @returns {boolean} 如果气泡不可见或元素不存在，返回false
     */ handleMousemove (e) {
            if (!this.visible) return false;
            // 安全检查：确保bubble元素仍然存在
            if (!this.$refs.bubbleRef) return false;
            const result = this.calculateBubblePosition(e.clientX, e.clientY, this.$refs.bubbleRef, this.placement // 使用placement prop作为首选位置，支持根据边界值自适应
            );
            this.position.x = result.x;
            this.position.y = result.y;
            this.currentPosition = result.position;
            // 计算箭头方向，使其始终指向鼠标的位置
            this.computedArrowDirection = this.calculateArrowDirection(result.x, result.y, e.clientX, e.clientY, this.$refs.bubbleRef, result.position);
        },
        /**
     * 计算气泡位置，考虑边界检测
     * 智能选择最佳显示位置，避免气泡超出视窗边界
     * @param {number} x - 鼠标X坐标
     * @param {number} y - 鼠标Y坐标
     * @param {HTMLElement} bubbleElement - 气泡元素
     * @param {string} preferredPosition - 首选位置 ('top', 'bottom', 'left', 'right')
     * @returns {{x: number, y: number, position: string}} 计算后的位置和最终位置
     */ calculateBubblePosition (x, y, bubbleElement, preferredPosition = 'top') {
            if (!bubbleElement) {
                return {
                    x,
                    y,
                    position: preferredPosition
                };
            }
            const bubbleRect = bubbleElement.getBoundingClientRect();
            // 如果元素不可见，返回默认位置
            if (bubbleRect.width === 0 && bubbleRect.height === 0) {
                return {
                    x,
                    y,
                    position: preferredPosition
                };
            }
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const mouseOffset = 10;
            let left = x + mouseOffset;
            let top = y + mouseOffset;
            let finalPosition = preferredPosition;
            // 计算各个方向的可用空间
            const spaceRight = viewportWidth - x - mouseOffset;
            const spaceLeft = x - mouseOffset;
            const spaceBottom = viewportHeight - y - mouseOffset;
            const spaceTop = y - mouseOffset;
            // 边界调整方法
            const adjustHorizontalPosition = (position)=>{
                // 检查右边界，确保气泡不会超出视窗右边界
                if (position + bubbleRect.width > viewportWidth) {
                    position = viewportWidth - bubbleRect.width - mouseOffset;
                }
                // 检查左边界，确保气泡不会超出视窗左边界
                if (position < 0) {
                    position = mouseOffset;
                }
                return position;
            };
            // 根据首选位置和可用空间智能选择最佳位置
            if (preferredPosition === 'bottom' && spaceBottom >= bubbleRect.height + 25) {
                // 底部有足够空间，增加25px偏移以避免鼠标指针遮挡箭头
                left = adjustHorizontalPosition(x - bubbleRect.width / 2);
                top = y + mouseOffset + 25;
                finalPosition = 'bottom';
            } else if (preferredPosition === 'top' && spaceTop >= bubbleRect.height) {
                // 顶部有足够空间
                left = adjustHorizontalPosition(x - bubbleRect.width / 2);
                top = y - bubbleRect.height - mouseOffset;
                finalPosition = 'top';
            } else if (preferredPosition === 'right' && spaceRight >= bubbleRect.width) {
                // 右侧有足够空间
                left = x + mouseOffset;
                top = y - bubbleRect.height / 2;
                finalPosition = 'right';
            } else if (preferredPosition === 'left' && spaceLeft >= bubbleRect.width) {
                // 左侧有足够空间
                left = x - bubbleRect.width - mouseOffset;
                top = y - bubbleRect.height / 2;
                finalPosition = 'left';
            } else {
                // 首选位置空间不足，自动选择最佳位置
                const availableSpaces = {
                    bottom: spaceBottom,
                    top: spaceTop,
                    right: spaceRight,
                    left: spaceLeft
                };
                // 找到最大可用空间的方向
                const bestPosition = Object.entries(availableSpaces).filter((item)=>item[1] > 50) // 至少需要50px空间
                .sort((a, b)=>b[1] - a[1]);
                const bestPositionValue = bestPosition && bestPosition[0] ? bestPosition[0][0] : 'bottom';
                // 根据最佳位置计算坐标
                switch(bestPositionValue){
                    case 'bottom':
                        left = adjustHorizontalPosition(x - bubbleRect.width / 2);
                        top = y + mouseOffset + 25; // 增加25px偏移以避免鼠标指针遮挡箭头
                        break;
                    case 'top':
                        left = adjustHorizontalPosition(x - bubbleRect.width / 2);
                        top = y - bubbleRect.height - mouseOffset;
                        break;
                    case 'right':
                        left = x + mouseOffset;
                        top = y - bubbleRect.height / 2;
                        break;
                    case 'left':
                        left = x - bubbleRect.width - mouseOffset;
                        top = y - bubbleRect.height / 2;
                        break;
                }
                finalPosition = bestPositionValue;
            }
            // 边界微调 - 确保不超出视窗
            left = Math.max(0, Math.min(left, viewportWidth - bubbleRect.width));
            top = Math.max(0, Math.min(top, viewportHeight - bubbleRect.height));
            return {
                x: left,
                y: top,
                position: finalPosition
            };
        },
        /**
     * 显示处理
     * 触发update:visible事件将visible设置为true
     * @emits update:visible
     */ handleShow () {
            this.$emit('update:visible', true);
        },
        /**
     * 隐藏处理
     * 触发update:visible事件将visible设置为false
     * @emits update:visible
     */ handleHide () {
            this.$emit('update:visible', false);
        },
        /**
     * 清理所有计时器
     * 清除显示和隐藏的延时计时器
     */ clearTimeouts () {
            if (this.showTimeout) {
                clearTimeout(this.showTimeout);
                this.showTimeout = null;
            }
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
                this.hideTimeout = null;
            }
        },
        /**
     * 计算箭头方向，使其始终指向鼠标位置
     * 根据鼠标相对于气泡中心的位置确定箭头方向
     * @param {number} bubbleX - 气泡X坐标
     * @param {number} bubbleY - 气泡Y坐标
     * @param {number} mouseX - 鼠标X坐标
     * @param {number} mouseY - 鼠标Y坐标
     * @param {HTMLElement} bubbleElement - 气泡元素
     * @param {string} currentPosition - 当前气泡位置
     * @returns {string} 箭头方向 ('top', 'bottom', 'left', 'right')
     */ calculateArrowDirection (bubbleX, bubbleY, mouseX, mouseY, bubbleElement, currentPosition) {
            if (!bubbleElement) return currentPosition;
            const bubbleRect = bubbleElement.getBoundingClientRect();
            const bubbleCenterX = bubbleX + bubbleRect.width / 2;
            const bubbleCenterY = bubbleY + bubbleRect.height / 2;
            // 计算鼠标相对于气泡中心的位置
            const deltaX = mouseX - bubbleCenterX;
            const deltaY = mouseY - bubbleCenterY;
            // 根据相对位置确定箭头方向
            // 箭头应该指向鼠标所在的方向
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平方向为主
                return deltaX > 0 ? 'right' : 'left';
            } else {
                // 垂直方向为主
                return deltaY > 0 ? 'bottom' : 'top';
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

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        directives: [
            {
                name: "show",
                rawName: "v-show",
                value: _vm.visible,
                expression: "visible"
            }
        ],
        ref: "bubbleRef",
        staticClass: "hik-cloud-bubble",
        class: [
            _vm.dark ? 'hik-cloud-bubble--dark' : 'hik-cloud-bubble--light',
            _vm.customClass
        ],
        style: {
            left: _vm.position.x + 'px',
            top: _vm.position.y + 'px',
            zIndex: _vm.containerZIndex
        }
    }, [
        _vm.showArrow && _vm.computedArrowDirection ? _c('div', {
            staticClass: "hik-cloud-bubble__arrow",
            class: [
                "hik-cloud-bubble__arrow--" + _vm.computedArrowDirection,
                _vm.dark ? 'hik-cloud-bubble__arrow--dark' : 'hik-cloud-bubble__arrow--light'
            ]
        }) : _vm._e(),
        _vm._t("content", function() {
            return [
                _c('div', {
                    staticClass: "hik-cloud-bubble__content"
                }, [
                    _vm._v(" " + _vm._s(_vm.title) + " ")
                ])
            ];
        })
    ], 2);
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

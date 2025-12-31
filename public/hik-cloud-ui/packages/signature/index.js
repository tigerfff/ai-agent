class Signature {
    // 初始化
    initialize() {
        this.createElements();
        this.getParentElementSize();
        this.initSignature();
    }
    // 创建必要的DOM元素
    createElements() {
        // 清空容器
        this.element.innerHTML = '';
        // 直接使用传入的元素作为签名容器
        this.element.className = 'hik-cloud-signature';
        this.element.style.backgroundColor = this.bgColor;
        // 创建canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'canvas';
        // 创建占位符
        this.placeholderElement = document.createElement('div');
        this.placeholderElement.className = 'placeholder';
        this.placeholderElement.textContent = this.placeHolder;
        this.placeholderElement.style.display = this.showPlaceHolder ? 'block' : 'none';
        // 组装元素
        this.element.appendChild(this.canvas);
        this.element.appendChild(this.placeholderElement);
        // 设置样式
        this.updateStyles();
    }
    // 更新样式
    updateStyles() {
        // 直接设置传入元素的样式
        this.element.style.width = this.canvasWidth + 'px';
        this.element.style.height = this.canvasHeight + 'px';
        this.element.style.backgroundColor = this.bgColor;
    }
    // 获取父元素尺寸
    getParentElementSize() {
        const parentElement = this.element.parentElement;
        if (parentElement) {
            const { width, height } = parentElement.getBoundingClientRect();
            this.canvasWidth = width;
            this.canvasHeight = height;
        } else {
            // 如果没有父元素，使用默认尺寸
            this.canvasWidth = 432;
            this.canvasHeight = 200;
        }
        this.updateStyles();
    }
    // 手动初始化签名组件
    initSignature() {
        this.isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
        this.getCanvas();
        // 创建并保存事件处理器引用
        this.startHandler = this.startDraw.bind(this);
        this.endHandler = this.closeDraw.bind(this);
        this.leaveHandler = this.handleMouseLeave.bind(this);
        this.enterHandler = this.handleMouseEnter.bind(this);
        // 将事件监听器绑定到画布元素上
        this.canvas.addEventListener(this.isMobile ? "touchstart" : "mousedown", this.startHandler);
        this.canvas.addEventListener(this.isMobile ? "touchend" : "mouseup", this.endHandler);
        // 非移动设备添加鼠标离开和进入事件
        if (!this.isMobile) {
            this.canvas.addEventListener("mouseleave", this.leaveHandler);
            this.canvas.addEventListener("mouseenter", this.enterHandler);
        }
        this.updateHasSignCallback(false);
    }
    getCanvas() {
        const { x, y } = this.canvas.getBoundingClientRect();
        this.clientRect = {
            x,
            y
        };
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    // 开始绘制
    startDraw(event) {
        // 如果已经在绘制中，直接返回
        if (this.isDrawing) return;
        const ctx = this.canvas.getContext('2d');
        // 获取偏移量及坐标
        const { offsetX, offsetY, pageX, pageY } = this.isMobile ? event.changedTouches[0] : event;
        const { x, y } = this.clientRect;
        this.client = {
            offsetX: 0,
            offsetY: 0,
            endX: 0,
            endY: 0
        };
        // 修改上次的偏移量及坐标
        this.client.offsetX = offsetX;
        this.client.offsetY = offsetY;
        this.client.endX = pageX;
        this.client.endY = pageY;
        // 清除以上一次 beginPath 之后的所有路径，进行绘制
        ctx.beginPath();
        // 根据配置文件设置相应配置
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        // 设置画线起始点位
        ctx.moveTo(this.client.endX - x, this.client.endY - y);
        // 监听 鼠标移动或手势移动，绑定到画布上
        const moveHandler = this.draw.bind(this);
        this.canvas.addEventListener(this.isMobile ? "touchmove" : "mousemove", moveHandler);
        // 保存引用以便后续移除
        this.currentMoveHandler = moveHandler;
        // 设置绘制状态
        this.isDrawing = true;
    }
    draw(event) {
        if (this.showPlaceHolder) {
            this.showPlaceHolder = false;
            this.placeholderElement.style.display = 'none';
        }
        const { x, y } = this.clientRect;
        const ctx = this.canvas.getContext('2d');
        // 获取当前坐标点位
        const { pageX, pageY } = this.isMobile ? event.changedTouches[0] : event;
        // 修改最后一次绘制的坐标点
        this.client.endX = pageX;
        this.client.endY = pageY;
        // 根据坐标点位移动添加线条
        ctx.lineTo(pageX - x, pageY - y);
        // 绘制
        ctx.stroke();
    }
    // 结束绘制
    closeDraw() {
        // 移除鼠标移动或手势移动监听器
        if (this.currentMoveHandler) {
            this.canvas.removeEventListener(this.isMobile ? "touchmove" : "mousemove", this.currentMoveHandler);
            this.currentMoveHandler = null;
        }
        // 重置绘制状态
        this.isDrawing = false;
        this.updateHasSignCallback(true);
    }
    // 处理鼠标离开绘制区域
    handleMouseLeave() {
        if (this.isDrawing) {
            // 如果正在绘制，停止绘制
            this.closeDraw();
        }
    }
    // 处理鼠标进入绘制区域
    handleMouseEnter() {
        // 鼠标进入时重置绘制状态，确保下次点击能正常开始绘制
        this.isDrawing = false;
    }
    getSignatureFile() {
        return new Promise((resolve)=>{
            const dataURL = this.canvas.toDataURL('image/png', 0.6);
            resolve(dataURL);
        });
    }
    clear() {
        const ctx = this.canvas.getContext('2d');
        this.showPlaceHolder = true;
        this.placeholderElement.style.display = 'block';
        if (ctx) {
            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
    }
    // 销毁实例
    destroy() {
        // 移除事件监听器
        if (this.canvas) {
            if (this.startHandler) {
                this.canvas.removeEventListener(this.isMobile ? "touchstart" : "mousedown", this.startHandler);
                this.startHandler = null;
            }
            if (this.endHandler) {
                this.canvas.removeEventListener(this.isMobile ? "touchend" : "mouseup", this.endHandler);
                this.endHandler = null;
            }
            if (this.currentMoveHandler) {
                this.canvas.removeEventListener(this.isMobile ? "touchmove" : "mousemove", this.currentMoveHandler);
                this.currentMoveHandler = null;
            }
            if (this.leaveHandler) {
                this.canvas.removeEventListener("mouseleave", this.leaveHandler);
                this.leaveHandler = null;
            }
            if (this.enterHandler) {
                this.canvas.removeEventListener("mouseenter", this.enterHandler);
                this.enterHandler = null;
            }
        }
        // 清空容器
        if (this.element) {
            this.element.innerHTML = '';
        }
    }
    constructor(elementId, options = {}){
        // 配置选项
        this.lineWidth = options.lineWidth || 1;
        this.lineColor = options.lineColor || '#000000';
        this.bgColor = options.bgColor || '#f8f9fb';
        this.placeHolder = options.placeHolder || '请使用鼠标在此处签名';
        this.manualInit = options.manualInit || false;
        // 状态数据
        this.isMobile = false;
        this.isDrawing = false;
        this.canvas = undefined;
        this.clientRect = {
            x: 0,
            y: 0
        };
        this.client = {
            offsetX: 0,
            offsetY: 0,
            endX: 0,
            endY: 0
        };
        this.showPlaceHolder = true;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        // 事件回调
        this.updateHasSignCallback = options.updateHasSignCallback || (()=>{});
        // 获取DOM元素
        if (typeof elementId === 'string') {
            this.element = document.getElementById(elementId);
            if (!this.element) {
                throw new Error(`Element with id "${elementId}" not found`);
            }
        } else if (elementId instanceof HTMLElement) {
            this.element = elementId;
        } else {
            throw new Error('Invalid element parameter. Expected string (id) or HTMLElement.');
        }
        if (!this.manualInit) {
            this.initialize();
        }
    }
}

//
//
//
//
//
var script = {
    name: 'HikCloudSignature',
    props: {
        lineWidth: {
            type: Number,
            default: 1
        },
        lineColor: {
            type: String,
            default: '#000000'
        },
        bgColor: {
            type: String,
            default: '#f8f9fb'
        },
        placeHolder: {
            type: String,
            default: '请使用鼠标在此处签名'
        },
        manualInit: {
            type: Boolean,
            default: false
        }
    },
    mounted () {
        if (!this.manualInit) {
            this.init();
        }
    },
    beforeDestroy () {
        this.destroy();
    },
    methods: {
        init () {
            // 创建签名实例
            const signature = new Signature(this.$refs.HikCloudSignature, {
                lineWidth: this.lineWidth,
                lineColor: this.lineColor,
                bgColor: this.bgColor,
                placeHolder: this.placeHolder,
                manualInit: false,
                updateHasSignCallback: (hasSign)=>{
                    this.$emit('updateHasSign', hasSign);
                }
            });
            // 保存签名实例以便后续使用
            this.signature = signature;
        },
        async getSignatureFile () {
            if (this.signature) {
                const base64 = await this.signature.getSignatureFile();
                return base64;
            }
            return '';
        },
        clear () {
            this.signature && this.signature.clear();
        },
        destroy () {
            this.signature && this.signature.destroy();
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
        ref: "HikCloudSignature"
    });
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

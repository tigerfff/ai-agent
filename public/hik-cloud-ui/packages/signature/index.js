class Signature {
    init() {
        // 创建容器和canvas元素
        this.createElements();
        // 初始化canvas
        this.initCanvas();
        // 绑定事件
        this.bindEvents();
        // 监听窗口大小变化
        this.resizeHandler = this.onResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
    }
    createElements() {
        // 清空容器
        this.element.innerHTML = '';
        // 设置容器样式
        this.element.className = 'hik-cloud-signature';
        this.element.style.width = '100%';
        this.element.style.height = '100%';
        this.element.style.backgroundColor = this.backgroundColor;
        // 创建canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'hik-cloud-signature__canvas';
        // 创建占位符
        this.placeholderElement = document.createElement('div');
        this.placeholderElement.className = 'hik-cloud-signature__placeholder';
        this.placeholderElement.textContent = this.placeholder;
        this.placeholderElement.style.color = this.placeholderColor;
        this.placeholderElement.style.display = 'block';
        // 组装元素
        this.element.appendChild(this.canvas);
        this.element.appendChild(this.placeholderElement);
    }
    initCanvas() {
        if (!this.canvas) return;
        // 设置canvas尺寸
        this.resize();
        // 保存初始尺寸
        this.initialWidth = this.canvas.width;
        this.initialHeight = this.canvas.height;
        const ctx = this.canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
    }
    bindEvents() {
        if (!this.canvas) return;
        // 鼠标事件
        this.mouseDownHandler = this.onMouseDown.bind(this);
        this.mouseMoveHandler = this.onMouseMove.bind(this);
        this.mouseUpHandler = this.onMouseUp.bind(this);
        this.mouseLeaveHandler = this.onMouseLeave.bind(this);
        // 绑定事件
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
        // 鼠标进入事件
        this.canvas.addEventListener('mouseenter', this.mouseEnterHandler);
    }
    getPointFromEvent(event) {
        if (!this.canvas) return {
            x: 0,
            y: 0
        };
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
    startDrawing(point) {
        this.isDrawing = true;
        this.placeholderElement.style.display = 'none';
        this.lastPoint = point;
        // 开始新的笔画
        this.currentStroke = [
            point
        ];
        this.strokes.push(this.currentStroke);
        this.startCallback();
    }
    drawLineToPoint(point) {
        if (!this.isDrawing || !this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        this.lastPoint = point;
        // 记录路径点
        if (this.currentStroke) {
            this.currentStroke.push(point);
        }
    }
    stopDrawing() {
        this.isDrawing = false;
        this.hasSignatureCallback(true);
        this.endCallback();
    }
    onMouseDown(event) {
        const point = this.getPointFromEvent(event);
        this.startDrawing(point);
    }
    onMouseMove(event) {
        if (!this.isDrawing) return;
        const point = this.getPointFromEvent(event);
        this.drawLineToPoint(point);
    }
    onMouseUp() {
        this.stopDrawing();
    }
    onMouseLeave() {
        this.stopDrawing();
    }
    onResize() {
        // 使用防抖，避免频繁触发
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(()=>{
            this.resize();
        }, 100);
    }
    // 获取签名图像数据URL
    getDataURL() {
        if (!this.canvas) return '';
        return this.canvas.toDataURL('image/png');
    }
    // 获取签名图像Blob对象
    getBlob() {
        return new Promise((resolve)=>{
            if (!this.canvas) {
                resolve(null);
                return;
            }
            this.canvas.toBlob(resolve, 'image/png');
        });
    }
    // 清空签名
    clear() {
        if (!this.canvas) return;
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 清空笔画数据
        this.strokes = [];
        this.currentStroke = null;
        this.hasSignatureCallback(false);
        this.placeholderElement.style.display = 'block';
        this.clearCallback();
    }
    // 重置canvas尺寸
    resize() {
        if (!this.canvas || !this.element) return;
        // 获取容器的实际尺寸
        const width = this.element.clientWidth;
        const height = this.element.clientHeight;
        // 直接设置 canvas 的 width 和 height 属性
        this.canvas.width = width;
        this.canvas.height = height;
        // 设置 canvas 的 CSS 样式确保视觉上也填满容器
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        // 重新设置绘图上下文属性
        const ctx = this.canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;
        // 根据新的画布尺寸重新绘制所有笔画
        this.redrawStrokes(width, height);
    }
    // 重新绘制所有笔画
    redrawStrokes(newWidth, newHeight) {
        if (!this.strokes || this.strokes.length === 0) return;
        const ctx = this.canvas.getContext('2d');
        // 计算缩放比例（基于初始尺寸）
        const scaleX = newWidth / this.initialWidth;
        const scaleY = newHeight / this.initialHeight;
        // 遍历所有笔画并重新绘制
        this.strokes.forEach((stroke)=>{
            if (stroke.length < 2) return;
            ctx.beginPath();
            // 缩放第一个点
            const firstPoint = stroke[0];
            ctx.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);
            // 绘制后续点
            for(let i = 1; i < stroke.length; i++){
                const point = stroke[i];
                ctx.lineTo(point.x * scaleX, point.y * scaleY);
            }
            ctx.stroke();
        });
    }
    // 销毁实例
    destroy() {
        // 移除事件监听器
        if (this.canvas) {
            if (this.mouseDownHandler) {
                this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
            }
            if (this.mouseMoveHandler) {
                this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
            }
            if (this.mouseUpHandler) {
                this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
            }
            if (this.mouseLeaveHandler) {
                this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
            }
            if (this.mouseEnterHandler) {
                this.canvas.removeEventListener('mouseenter', this.mouseEnterHandler);
            }
        }
        // 移除窗口大小变化监听器
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        // 清空容器
        if (this.element) {
            this.element.innerHTML = '';
        }
    }
    constructor(element, options = {}){
        // 配置选项
        this.element = element;
        this.lineWidth = options.lineWidth || 2;
        this.lineColor = options.lineColor || '#000';
        this.backgroundColor = options.backgroundColor || '#f8f9fb';
        this.placeholder = options.placeholder || '请使用鼠标在此处签名';
        this.placeholderColor = options.placeholderColor || '#000000';
        this.startCallback = options.startCallback || (()=>{});
        this.endCallback = options.endCallback || (()=>{});
        this.clearCallback = options.clearCallback || (()=>{});
        this.hasSignatureCallback = options.hasSignatureCallback || (()=>{});
        // 状态数据
        this.isDrawing = false;
        this.lastPoint = null;
        this.canvas = null;
        this.container = null;
        this.resizeTimer = null;
        // 存储所有笔画路径数据，用于resize时重绘
        this.strokes = [];
        this.currentStroke = null;
        // 保存初始画布尺寸，用于计算缩放比例
        this.initialWidth = 0;
        this.initialHeight = 0;
        // 事件处理器引用
        this.mouseDownHandler = null;
        this.mouseMoveHandler = null;
        this.mouseUpHandler = null;
        this.mouseLeaveHandler = null;
        this.resizeHandler = null;
        // 初始化
        this.init();
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
            default: 2
        },
        lineColor: {
            type: String,
            default: '#000000'
        },
        backgroundColor: {
            type: String,
            default: '#f8f9fb'
        },
        placeholder: {
            type: String,
            default: '请使用鼠标在此处签名'
        },
        placeholderColor: {
            type: String,
            default: '#000000'
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
                backgroundColor: this.backgroundColor,
                placeholder: this.placeholder,
                placeholderColor: this.placeholderColor,
                hasSignatureCallback: (hasSignature)=>{
                    this.$emit('hasSignature', hasSignature);
                },
                startCallback: ()=>{
                    this.$emit('start');
                },
                endCallback: ()=>{
                    this.$emit('end');
                },
                clearCallback: ()=>{
                    this.$emit('clear');
                }
            });
            // 保存签名实例以便后续使用
            this.signature = signature;
        },
        async getDataURL () {
            if (this.signature) {
                const base64 = await this.signature.getDataURL();
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

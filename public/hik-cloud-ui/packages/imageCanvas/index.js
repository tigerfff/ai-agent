function drawInfoParamsPolygon(data) {
    if (!data || !data.polygons || !(data.polygons instanceof Array)) {
        return null;
    }
    const _polygons = data.polygons.map((item)=>{
        return {
            x: item.x,
            y: item.y
        };
    });
    return {
        type: 'polygon',
        color: data.color,
        points: _polygons
    };
}
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}

/**
 * Canvas 绘图类：处理图像、涂鸦绘制
 * @params options.canvas 元素对象
 */ /* eslint-disable */ function CanvasDrawer(options = {}) {
    this.canvas = options.canvas;
    this.context = this.canvas.getContext('2d');
    this.backgroundColor = options.backgroundColor || '#222';
    this.lineWidth = options.lineWidth || 1.5;
    this.fontSize = options.fontSize || 14;
    this.heightRate = options.heightRate || 1.3;
    this.drawColor = options.drawColor || '#FA3239';
    this.lineColor = options.lineColor || '#FA3239';
    this.arrowHeight = options.arrowHeight || 10;
    this.arrowAngle = options.arrowAngle || Math.PI / 4;
    this.originWidth = options.originWidth || 0;
    this.originHeight = options.originHeight || 0;
    this.offsetW = options.offsetW || 0;
    this.offsetH = options.offsetH || 0;
    this.iWidth = options.iWidth || 0;
    this.iHeight = options.iHeight || 0;
    this.inOutPXRate = options.inOutPXRate || 1;
    this.showLabel = options.showLabel || false;
    this.font = options.font || '';
}
// 计算画笔线宽（缩放兼容）
Object.defineProperty(CanvasDrawer.prototype, 'iLineWidth', {
    get: function() {
        return Math.max(this.lineWidth / this.canvas.clientWidth * this.iWidth, 1);
    }
});
Object.defineProperty(CanvasDrawer.prototype, 'iArrowHeight', {
    get: function() {
        return this.inOutPXRate * Math.min(this.canvas.height / 20, this.arrowHeight);
    }
});
// 清除画布
CanvasDrawer.prototype.clear = function() {
    this.context.clearRect(0, 0, this.iWidth, this.iHeight);
};
// 绘制背景
CanvasDrawer.prototype.drawBackground = function() {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.iWidth, this.iHeight);
};
// 绘制图像
CanvasDrawer.prototype.drawImage = function(img, isFill = false) {
    if (isFill) {
        this.context.drawImage(img, 0, 0, this.iWidth, this.iHeight);
    } else {
        this.context.drawImage(img, this.offsetW, this.offsetH, this.originWidth, this.originHeight);
    }
};
// 根据信息绘制图形
CanvasDrawer.prototype.drawWithInfo = function(infoList = []) {
    var self = this;
    infoList.forEach(function(item) {
        self.context.beginPath();
        var color = item.color === 'null' ? self.lineColor : item.color || self.lineColor;
        self.context.strokeStyle = color;
        self.context.fillStyle = color;
        self.context.lineWidth = self.iLineWidth;
        if (!item.type) {
            self.drawRegion(item);
        } else if (item.type === 'polygon') {
            self.drawPolygon(item);
        } else if (item.type === 'arrow') {
            self.drawArrow(item);
        } else if (item.type === 'rec') {
            self.drawRect(item);
        } else if (item.type === 'circle') {
            self.drawEllipse((item.x + item.a) * self.originWidth + self.offsetW, (item.y + item.b) * self.originHeight + self.offsetH, Math.abs(item.a * self.originWidth), Math.abs(item.b * self.originHeight));
        } else if (item.type === 'text') {
            self.drawText(item);
        }
        self.context.stroke();
    });
};
CanvasDrawer.prototype.drawRegion = function(item) {
    if (this.font) {
        this.context.font = this.font;
    }
    this.context.strokeStyle = item.regionColor;
    this.context.fillStyle = item.regionColor;
    if (typeof item.region === 'string') {
        item.region = JSON.parse(item.region);
    }
    var self = this;
    item.region.forEach(function(point) {
        self.context.lineTo(point.x * self.iWidth, point.y * self.iHeight);
    });
    this.context.closePath();
    var point = this.getPolygonAreaCenter(item.region);
    this.context.textAlign = 'center';
    this.context.fillText(item.areaName, point.x * this.iWidth, point.y * this.iHeight);
};
CanvasDrawer.prototype.drawPolygon = function(item) {
    var self = this;
    item.points.forEach(function(point) {
        self.context.lineTo(+point.x * (self.iWidth - 2 * self.offsetW) + self.offsetW, +point.y * (self.iHeight - 2 * self.offsetH) + self.offsetH);
    });
    this.context.closePath();
    if (this.showLabel && item.labels && item.labels.length > 0) {
        this.drawLabel(item);
    }
};
CanvasDrawer.prototype.drawArrow = function(item) {
    var startX = item.x * (this.iWidth - 2 * this.offsetW) + this.offsetW;
    var startY = item.y * (this.iHeight - 2 * this.offsetH) + this.offsetH;
    var endX = (item.x + item.w) * (this.iWidth - 2 * this.offsetW) + this.offsetW;
    var endY = (item.y + item.h) * (this.iHeight - 2 * this.offsetH) + this.offsetH;
    this.context.moveTo(startX, startY);
    this.context.lineTo(endX, endY);
    if (item.w || item.h) {
        this.context.save();
        this.context.translate(endX, endY);
        var angle = Math.atan2(item.h * this.originHeight, item.w * this.originWidth) + Math.PI / 2;
        this.context.rotate(angle);
        this.context.moveTo(0, 0);
        this.context.lineTo(-Math.tan(this.arrowAngle / 2) * this.iArrowHeight, this.iArrowHeight);
        this.context.lineTo(Math.tan(this.arrowAngle / 2) * this.iArrowHeight, this.iArrowHeight);
        this.context.closePath();
        this.context.fill();
        this.context.restore();
    }
};
CanvasDrawer.prototype.drawRect = function(item) {
    this.context.rect(item.x * this.originWidth + this.offsetW, item.y * this.originHeight + this.offsetH, item.w * this.originWidth, item.h * this.originHeight);
};
CanvasDrawer.prototype.drawEllipse = function(x, y, a, b) {
    this.context.save();
    var r = Math.max(a, b);
    var ratioX = a / r;
    var ratioY = b / r;
    this.context.scale(ratioX, ratioY);
    this.context.beginPath();
    this.context.arc(x / ratioX, y / ratioY, r, 0, Math.PI * 2, false);
    this.context.closePath();
    this.context.restore();
};
CanvasDrawer.prototype.drawText = function(item) {
    var fs = item.fs * this.originWidth;
    this.context.textBaseline = 'top';
    this.context.font = this.font || fs + 'px Arial';
    var self = this;
    item.content.split('\n').forEach(function(str, i) {
        self.context.fillText(str, item.x * self.originWidth + self.offsetW, item.y * self.originHeight + self.offsetH + fs * self.heightRate * i);
    });
};
CanvasDrawer.prototype.drawLabel = function(item) {
    var fs = 14 * this.inOutPXRate;
    this.context.textBaseline = 'top';
    this.context.font = fs + 'px Arial';
    // 计算文本最大宽度和总高度
    var self = this;
    var txtMaxWidth = item.labels.reduce(function(r, l) {
        return Math.max(r, self.context.measureText(l).width);
    }, 0);
    var totalTextHeight = fs * this.heightRate * item.labels.length;
    // 寻找最佳锚点位置
    var bestAnchorPoint = this.findBestAnchorPoint(item.points, txtMaxWidth, totalTextHeight);
    // 设置文本对齐方式（textAlign已在findBestAnchorPoint中计算）
    this.context.textAlign = bestAnchorPoint.textAlign;
    var self = this;
    item.labels.forEach(function(str, i) {
        var txtWidth = self.context.measureText(str).width;
        var currentTxtEXTOffsetX = 0;
        // 根据对齐方式计算偏移量
        if (bestAnchorPoint.textAlign === 'right') {
            currentTxtEXTOffsetX = txtMaxWidth - txtWidth;
        } else if (bestAnchorPoint.textAlign === 'left') {
            currentTxtEXTOffsetX = 0;
        }
        self.context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        self.context.fillRect(bestAnchorPoint.x + bestAnchorPoint.offsetX + currentTxtEXTOffsetX, bestAnchorPoint.y + bestAnchorPoint.offsetY + fs * self.heightRate * i, txtWidth, fs * self.heightRate);
        self.context.fillStyle = 'rgb(48, 143, 240)';
        self.context.fillText(str, bestAnchorPoint.x + bestAnchorPoint.offsetX + bestAnchorPoint.textOffsetX, bestAnchorPoint.y + bestAnchorPoint.offsetY + fs * (self.heightRate * i + (self.heightRate - 1) / 2));
    });
    // 恢复默认文本对齐方式
    this.context.textAlign = 'left';
};
CanvasDrawer.prototype.findBestAnchorPoint = function(points, txtMaxWidth, totalTextHeight) {
    // 计算多边形的边界
    var minX = Math.min.apply(Math, points.map(function(p) {
        return +p.x;
    }));
    var maxX = Math.max.apply(Math, points.map(function(p) {
        return +p.x;
    }));
    var minY = Math.min.apply(Math, points.map(function(p) {
        return +p.y;
    }));
    var maxY = Math.max.apply(Math, points.map(function(p) {
        return +p.y;
    }));
    // 转换为画布坐标
    var polyLeft = minX * this.originWidth + this.offsetW;
    var polyRight = maxX * this.originWidth + this.offsetW;
    var polyTop = minY * this.originHeight + this.offsetH;
    var polyBottom = maxY * this.originHeight + this.offsetH;
    // 按照点位数组顺序为锚点进行判断
    for(var i = 0; i < points.length; i++){
        var point = points[i];
        var pointX = +point.x * this.originWidth + this.offsetW;
        var pointY = +point.y * this.originHeight + this.offsetH;
        // 定义四个外部位置（基于多边形边界）
        var externalPositions = [
            // 上方显示
            {
                x: pointX,
                y: polyTop - totalTextHeight - 2,
                offsetX: 0,
                offsetY: 0,
                positionType: 'top'
            },
            // 左侧显示
            {
                x: polyLeft - txtMaxWidth - 2,
                y: pointY,
                offsetX: 0,
                offsetY: 0,
                positionType: 'left'
            },
            // 右侧显示
            {
                x: polyRight + 2,
                y: pointY,
                offsetX: 0,
                offsetY: 0,
                positionType: 'right'
            },
            // 下方显示
            {
                x: pointX,
                y: polyBottom + 2,
                offsetX: 0,
                offsetY: 0,
                positionType: 'bottom'
            }
        ];
        // 优先尝试外部位置
        for(var j = 0; j < externalPositions.length; j++){
            var pos = externalPositions[j];
            var labelRight = pos.x + txtMaxWidth;
            var labelBottom = pos.y + totalTextHeight;
            // 检查是否能在画布上完整显示
            if (pos.x >= 0 && labelRight <= this.iWidth && pos.y >= 0 && labelBottom <= this.iHeight) {
                // 根据位置类型确定对齐方式
                var textAlign = 'left';
                var textOffsetX = 0;
                if (pos.positionType === 'left') {
                    // 标签在多边形左侧的外部，则标签右对齐
                    textAlign = 'right';
                    textOffsetX = txtMaxWidth;
                } else if (pos.positionType === 'right') {
                    // 标签在多边形右侧的外部，则标签左对齐
                    textAlign = 'left';
                    textOffsetX = 0;
                } else if (pos.positionType === 'top' || pos.positionType === 'bottom') {
                    // 标签在多边形顶/底的位置，根据水平位置决定对齐方式
                    var labelCenterX = pos.x + txtMaxWidth / 2;
                    var polyCenterX = (polyLeft + polyRight) / 2;
                    if (labelCenterX < polyCenterX) {
                        // 标签在多边形顶/底的内部靠左，则标签左对齐
                        textAlign = 'left';
                        textOffsetX = 0;
                    } else {
                        // 标签在多边形顶/底的内部靠右，则标签右对齐
                        textAlign = 'right';
                        textOffsetX = txtMaxWidth;
                    }
                }
                return {
                    x: pos.x,
                    y: pos.y,
                    offsetX: pos.offsetX,
                    offsetY: pos.offsetY,
                    textAlign: textAlign,
                    textOffsetX: textOffsetX
                };
            }
        }
        // 如果外部位置不能完整显示，尝试内部位置（基于当前顶点）
        var internalPositions = [
            // 顶点右侧
            {
                x: pointX + 2,
                y: pointY,
                offsetX: 0,
                offsetY: 0,
                positionType: 'right'
            },
            // 顶点左侧
            {
                x: pointX - txtMaxWidth - 2,
                y: pointY,
                offsetX: 0,
                offsetY: 0,
                positionType: 'left'
            },
            // 顶点上方
            {
                x: pointX,
                y: pointY - totalTextHeight - 2,
                offsetX: 0,
                offsetY: 0,
                positionType: 'top'
            },
            // 顶点下方
            {
                x: pointX,
                y: pointY + 2,
                offsetX: 0,
                offsetY: 0,
                positionType: 'bottom'
            }
        ];
        for(var k = 0; k < internalPositions.length; k++){
            var pos = internalPositions[k];
            var labelRight = pos.x + txtMaxWidth;
            var labelBottom = pos.y + totalTextHeight;
            // 检查是否能在画布上完整显示
            if (pos.x >= 0 && labelRight <= this.iWidth && pos.y >= 0 && labelBottom <= this.iHeight) {
                // 根据位置类型确定对齐方式
                var textAlign = 'left';
                var textOffsetX = 0;
                if (pos.positionType === 'left') {
                    // 标签在多边形左侧的外部，则标签右对齐
                    textAlign = 'right';
                    textOffsetX = txtMaxWidth;
                } else if (pos.positionType === 'right') {
                    // 标签在多边形右侧的外部，则标签左对齐
                    textAlign = 'left';
                    textOffsetX = 0;
                } else if (pos.positionType === 'top' || pos.positionType === 'bottom') {
                    // 标签在多边形顶/底的位置，根据水平位置决定对齐方式
                    var labelCenterX = pos.x + txtMaxWidth / 2;
                    var polyCenterX = (polyLeft + polyRight) / 2;
                    if (labelCenterX < polyCenterX) {
                        // 标签在多边形顶/底的内部靠左，则标签左对齐
                        textAlign = 'left';
                        textOffsetX = 0;
                    } else {
                        // 标签在多边形顶/底的内部靠右，则标签右对齐
                        textAlign = 'right';
                        textOffsetX = txtMaxWidth;
                    }
                }
                return {
                    x: pos.x,
                    y: pos.y,
                    offsetX: pos.offsetX,
                    offsetY: pos.offsetY,
                    textAlign: textAlign,
                    textOffsetX: textOffsetX
                };
            }
        }
    }
    // 如果所有位置都不能完整显示，使用第一个顶点并强制调整到画布内
    var firstPoint = points[0];
    var firstX = +firstPoint.x * this.originWidth + this.offsetW;
    var firstY = +firstPoint.y * this.originHeight + this.offsetH;
    var finalX = firstX;
    var finalY = firstY;
    // 水平方向调整
    if (firstX + txtMaxWidth > this.iWidth) {
        finalX = this.iWidth - txtMaxWidth - 2;
    } else if (firstX < 0) {
        finalX = 2;
    }
    // 垂直方向调整
    if (firstY + totalTextHeight > this.iHeight) {
        finalY = this.iHeight - totalTextHeight - 2;
    } else if (firstY < 0) {
        finalY = 2;
    }
    return {
        x: finalX,
        y: finalY,
        offsetX: 0,
        offsetY: 0,
        textAlign: 'left',
        textOffsetX: 0
    };
};
// 高斯定理
CanvasDrawer.prototype.Area = function(p0, p1, p2) {
    var area = p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p1.x * p0.y - p2.x * p1.y - p0.x * p2.y;
    return area / 2;
};
// 计算多边形质心
CanvasDrawer.prototype.getPolygonAreaCenter = function(points) {
    var sumX = 0;
    var sumY = 0;
    var sumArea = 0;
    var p1 = points[1];
    for(var i = 2; i < points.length; i++){
        var p2 = points[i];
        var area = this.Area(points[0], p1, p2);
        sumArea += area;
        sumX += (points[0].x + p1.x + p2.x) * area;
        sumY += (points[0].y + p1.y + p2.y) * area;
        p1 = p2;
    }
    return {
        x: sumX / sumArea / 3,
        y: sumY / sumArea / 3
    };
};

let watermark = {
    /**
   * 配置参数，均可重置
   * textArr必填
   */ settings: {
        textArr: [
            'test',
            '自定义水印'
        ],
        font: "'微软雅黑'",
        fillStyle: 'rgba(170,170,170,0.4)',
        maxWidth: 500,
        minWidth: 120,
        lineHeight: 24,
        deg: -45,
        marginRight: 150,
        marginBottom: 50,
        left: 20,
        top: 20 // 整体背景距上边的距离
    },
    drawForCanvas: function(canvas, options) {
        let _this = this;
        _this.settings = Object.assign(_this.settings, options || {});
        _this.settings.minWidth = Math.min(_this.settings.maxWidth, _this.settings.minWidth); // 重置最小宽度
        let textArr = _this.settings.textArr;
        if (Object.prototype.toString.call(textArr) !== '[object Array]') {
            throw Error('水印文本必须放在数组中');
        }
        // 动态创建隐藏的canvas
        let c = _this._createCanvas();
        // 绘制canvas内容
        _this._draw(c, _this.settings);
        _this._drawWatermark(canvas, c);
    // 把canvas内容转为图片并绘制
    // _this._convertCanvasToImage(c)
    },
    // 动态创建canvas
    _createCanvas: function() {
        let c = document.createElement('canvas');
        return c;
    },
    _drawWatermark: function(canvas, watermark) {
        let wWidth = watermark.width;
        let wHeight = watermark.height;
        let xBlockNum = Math.ceil(canvas.width / wWidth);
        let yBlockNum = Math.ceil(canvas.height / wHeight);
        let ctx = canvas.getContext('2d');
        for(let i = 0; i < xBlockNum; i++){
            for(let j = 0; j < yBlockNum; j++){
                ctx.drawImage(watermark, wWidth * i, wHeight * j);
            }
        }
    },
    _draw: function(c, settings) {
        let _this = this;
        let ctx = c.getContext("2d");
        // 切割超过最大宽度的文本并获取最大宽度
        let textArr = settings.textArr || [];
        let wordBreakTextArr = [];
        let maxWidthArr = [];
        textArr.forEach(function(text) {
            let result = _this._breakLinesForCanvas(ctx, text + '', settings.maxWidth, settings.font);
            wordBreakTextArr = wordBreakTextArr.concat(result.textArr);
            maxWidthArr.push(result.maxWidth);
        });
        maxWidthArr.sort(function(a, b) {
            return b - a;
        });
        // 根据需要切割结果，动态改变canvas的宽和高
        let maxWidth = Math.max(maxWidthArr[0], _this.settings.minWidth);
        let lineHeight = settings.lineHeight;
        let height = wordBreakTextArr.length * lineHeight;
        let degToPI = Math.PI * settings.deg / 180;
        let absDeg = Math.abs(degToPI);
        // 根据旋转后的矩形计算最小画布的宽高
        let hSinDeg = height * Math.sin(absDeg);
        let hCosDeg = height * Math.cos(absDeg);
        let wSinDeg = maxWidth * Math.sin(absDeg);
        let wCosDeg = maxWidth * Math.cos(absDeg);
        c.width = parseInt(hSinDeg + wCosDeg + settings.marginRight);
        c.height = parseInt(wSinDeg + hCosDeg + settings.marginBottom);
        // 宽高重置后，样式也需重置
        ctx.font = settings.font;
        ctx.fillStyle = settings.fillStyle;
        ctx.textBaseline = 'hanging'; // 默认是alphabetic,需改基准线为贴着线的方式
        // 移动并旋转画布
        ctx.translate(0, wSinDeg);
        ctx.rotate(degToPI);
        // 绘制文本
        wordBreakTextArr.forEach(function(text, index) {
            ctx.fillText(text, 0, lineHeight * index);
        });
    },
    // 将绘制好的canvas转成图片
    _convertCanvasToImage: function(canvas) {
        let _this = this;
        let imgData = canvas.toDataURL("image/png");
        let divMask = document.createElement('div');
        divMask.style.cssText = 'position:fixed; left:0; top:0; right:0; bottom:0; z-index:9999; pointer-events:none;';
        divMask.style.backgroundImage = 'url(' + imgData + ')';
        divMask.style.backgroundPosition = _this.settings.left + 'px ' + _this.settings.top + 'px';
        document.body.appendChild(divMask);
    },
    // 寻找切换断点
    _findBreakPoint: function(text, width, context) {
        let min = 0;
        let max = text.length - 1;
        while(min <= max){
            let middle = Math.floor((min + max) / 2);
            let middleWidth = context.measureText(text.substr(0, middle)).width;
            let oneCharWiderThanMiddleWidth = context.measureText(text.substr(0, middle + 1)).width;
            if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
                return middle;
            }
            if (middleWidth < width) {
                min = middle + 1;
            } else {
                max = middle - 1;
            }
        }
        return -1;
    },
    // 根据最大宽度切割文字
    _breakLinesForCanvas: function(context, text, width, font) {
        let result = [];
        let maxWidth = 0; // 计算最大宽度
        if (font) {
            context.font = font;
        }
        let breakPoint = this._findBreakPoint(text, width, context);
        while(breakPoint !== -1){
            result.push(text.substr(0, breakPoint));
            text = text.substr(breakPoint);
            maxWidth = width;
            breakPoint = this._findBreakPoint(text, width, context);
        }
        if (text) {
            result.push(text);
            let lastTextWidth = context.measureText(text).width;
            maxWidth = maxWidth !== 0 ? maxWidth : lastTextWidth;
        }
        return {
            textArr: result,
            maxWidth: maxWidth
        };
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
var script = {
    name: 'HikCloudImageCanvas',
    props: {
        crossWhiteList: {
            type: Array,
            default: ()=>[
                    'hikvision.oss-cn-hangzhou.aliyuncs.com',
                    'pic.hik-cloud.com',
                    'load.hik-cloud.com'
                ]
        },
        url: {
            type: String,
            default: ''
        },
        zoomable: {
            type: Boolean,
            default: false
        },
        info: {
            type: Array,
            default: ()=>[]
        },
        width: {
            type: [
                String,
                Number
            ],
            default: 200
        },
        height: {
            type: [
                String,
                Number
            ],
            default: 200
        },
        drawColor: {
            type: String,
            default: '#FA3239'
        },
        lineColor: {
            type: String,
            default: '#FA3239'
        },
        lineWidth: {
            type: Number,
            default: 1.5
        },
        fontSize: {
            type: Number,
            default: 14
        },
        heightRate: {
            type: Number,
            default: 1.3
        },
        opModel: {
            type: String,
            default: ''
        },
        drawInfo: {
            type: Array,
            default: ()=>[]
        },
        aiInfo: {
            type: Array,
            default: ()=>[]
        },
        ruleInfo: {
            type: Array,
            default: ()=>[]
        },
        isRenderDraw: {
            type: Boolean,
            default: true
        },
        isRenderAIDraw: {
            type: Boolean,
            default: true
        },
        isRenderRule: {
            type: Boolean,
            default: true
        },
        isFill: {
            type: Boolean,
            default: false
        },
        font: {
            type: String,
            default: ''
        },
        backgroundColor: {
            type: String,
            default: '#222'
        },
        showLabel: {
            type: Boolean,
            default: false
        },
        watermark: {
            type: Array,
            default: ()=>[]
        }
    },
    data () {
        return {
            picUrl: '',
            radom: generateUUID(),
            context: null,
            img: new Image(),
            canvasMoveUse: false,
            canvasDragging: false,
            offsetW: 0,
            offsetH: 0,
            dealStyle: null,
            drawing: false,
            originWidth: 0,
            originHeight: 0,
            iWidth: 0,
            iHeight: 0,
            maxScale: 9.6,
            scaleRate: 1.2,
            scaleTimes: 0,
            offsetX: 0,
            offsetY: 0,
            arrowHeight: 10,
            arrowAngle: Math.PI / 4,
            drawer: null
        };
    },
    computed: {
        inOutPXRate () {
            return this.iHeight / this.height;
        },
        iLineWidth () {
            if (!this.iWidth || !this.width) return this.lineWidth;
            return Math.max(this.lineWidth / this.width * this.iWidth, 1);
        },
        iArrowHeight () {
            return this.inOutPXRate * Math.min(+this.height / 20, this.arrowHeight);
        },
        currentScale () {
            let scale = Math.min(Math.pow(this.scaleRate, this.scaleTimes), this.maxScale);
            scale = +scale.toFixed(2);
            return scale;
        },
        lineType () {
            return ({
                "draw-rec": "rec",
                "draw-circle": "circle",
                "draw-arrow": "arrow"
            })[this.opModel] || "";
        },
        cursor () {
            return ({
                drag: 'move',
                text: 'text',
                "draw-rec": "crosshair",
                "draw-circle": "crosshair",
                "draw-arrow": "auto"
            })[this.opModel];
        },
        draggable () {
            return this.opModel === 'drag';
        },
        drawable () {
            return this.opModel.startsWith('draw-');
        }
    },
    watch: {
        canvasMoveUse (nv) {
            this.$emit('drawStatusChanged', nv);
        },
        info () {
            this.reDraw();
        },
        drawInfo () {
            this.reDraw();
        },
        isRenderDraw () {
            this.reDraw();
        },
        isRenderRule () {
            this.reDraw();
        },
        isRenderAIDraw () {
            this.reDraw();
        },
        url () {
            this.initDraw();
        },
        scaleTimes () {
            let scaleStatus = this.scaleTimes === 0 ? -1 : this.currentScale === this.maxScale ? 1 : 0;
            this.$emit('scaleChanged', {
                scale: this.currentScale,
                scaleStatus
            });
        },
        height () {
            this.$nextTick(()=>{
                this.initDraw();
            });
        },
        width () {
            this.$nextTick(()=>{
                this.initDraw();
            });
        }
    },
    mounted () {
        this.initDraw();
    },
    methods: {
        // 根据图像原始宽高 (x, y) 和容器显示区域 (this.width, this.height)，计算出适配的绘图分辨率与偏移量
        deal (x, y) {
            let iWidth, iHeight;
            this.offsetW = 0;
            this.offsetH = 0;
            if (x / y >= this.width / this.height) {
                iWidth = Math.max(x, this.width);
                iHeight = iWidth * this.height / this.width;
                this.originWidth = iWidth;
                this.originHeight = iWidth * y / x;
                this.offsetH = (iHeight - this.originHeight) / 2;
                this.dealStyle = 1;
            } else {
                iHeight = Math.max(y, this.height);
                iWidth = iHeight * this.width / this.height;
                this.originHeight = iHeight;
                this.originWidth = iHeight * x / y;
                this.offsetW = (iWidth - this.originWidth) / 2;
                this.dealStyle = 2;
            }
            this.iWidth = iWidth;
            this.iHeight = iHeight;
        },
        initDraw () {
            if (this.drawing) return;
            this.resetZoom();
            this.drawing = true;
            this.picUrl = this.url;
            const canvas = document.getElementById(this.radom);
            if (!canvas) return;
            this.context = canvas.getContext('2d');
            if (this.crossWhiteList.some((e)=>this.picUrl.includes(e))) {
                this.img.setAttribute('crossOrigin', 'anonymous');
                this.picUrl += (this.picUrl.includes('?') ? '&' : '?') + 'tail';
            } else {
                this.img.removeAttribute('crossOrigin');
            }
            this.img.src = this.picUrl;
            this.img.onerror = ()=>{
                this.drawing = false;
            };
            this.img.onload = ()=>{
                this.drawing = false;
                this.scaleTimes = 0;
                this.setOffset(0, 0);
                this.deal(this.img.width, this.img.height);
                this.initCanvasDrawer(canvas);
                this.$nextTick(this.reDraw);
            };
        },
        initCanvasDrawer (canvas) {
            this.drawer = new CanvasDrawer({
                canvas,
                backgroundColor: this.backgroundColor,
                lineWidth: this.lineWidth,
                fontSize: this.fontSize,
                heightRate: this.heightRate,
                drawColor: this.drawColor,
                lineColor: this.lineColor,
                arrowHeight: this.arrowHeight,
                arrowAngle: this.arrowAngle,
                originWidth: this.originWidth,
                originHeight: this.originHeight,
                offsetW: this.offsetW,
                offsetH: this.offsetH,
                iWidth: this.iWidth,
                iHeight: this.iHeight,
                inOutPXRate: this.inOutPXRate,
                showLabel: this.showLabel,
                font: this.font
            });
        },
        reCalculateOffset (x, y, isZoomIn) {
            let scale;
            let n = Math.log(this.maxScale) / Math.log(this.scaleRate);
            if (isZoomIn && this.scaleTimes === Math.ceil(n) || !isZoomIn && this.scaleTimes === Math.floor(n)) {
                scale = this.maxScale / Math.pow(this.scaleRate, Math.floor(n));
                scale = isZoomIn ? scale : 1 / scale;
            } else {
                scale = isZoomIn ? this.scaleRate : 1 / this.scaleRate;
            }
            let ox = this.offsetX - (x - this.width / 2 - this.offsetX) * (scale - 1);
            let oy = this.offsetY - (y - this.height / 2 - this.offsetY) * (scale - 1);
            this.setOffset(ox, oy);
        },
        setOffset (x, y) {
            let wLimit = this.width * (this.currentScale - 1) / 2;
            let hLimit = this.height * (this.currentScale - 1) / 2;
            this.offsetX = Math.min(Math.max(-wLimit, x), wLimit);
            this.offsetY = Math.min(Math.max(-hLimit, y), hLimit);
        },
        canvasWheel (e) {
            if (!this.zoomable) return;
            e.preventDefault();
            this.zoom(e.wheelDelta < 0, [
                e.layerX,
                e.layerY
            ]);
        },
        zoom (out, point) {
            if (!this.zoomable) return;
            if (!point) point = [
                this.width / 2,
                this.height / 2
            ];
            if (out) {
                if (this.scaleTimes === 0) return;
                this.scaleTimes -= 1;
                this.reCalculateOffset(point[0], point[1], false);
            } else {
                if (this.currentScale === this.maxScale) return;
                this.scaleTimes += 1;
                this.reCalculateOffset(point[0], point[1], true);
            }
        },
        resetZoom () {
            this.scaleTimes = 0;
            this.setOffset(0, 0);
        },
        canvasDown (e) {
            if (this.draggable) {
                this.canvasDragging = true;
                return;
            }
            if (!this.drawable) return;
            this.canvasMoveUse = true;
            const canvasX = e.offsetX || e.layerX;
            const canvasY = e.offsetY || e.layerY;
            // eslint-disable-next-line
            this.drawInfo.push({
                x: (canvasX * this.iWidth / this.width - this.offsetW) / this.originWidth,
                y: (canvasY * this.iHeight / this.height - this.offsetH) / this.originHeight,
                color: this.drawColor,
                type: this.lineType
            });
        },
        canvasMove (e) {
            if (this.draggable && this.canvasDragging) {
                this.setOffset(e.movementX + this.offsetX, e.movementY + this.offsetY);
                return;
            }
            if (this.canvasMoveUse && this.drawable) {
                const canvasX = e.offsetX || e.layerX;
                const canvasY = e.offsetY || e.layerY;
                let info = this.drawInfo[this.drawInfo.length - 1];
                if ([
                    'rec',
                    'arrow'
                ].includes(this.lineType)) {
                    info.w = (canvasX * this.iWidth / this.width - this.offsetW) / this.originWidth - info.x;
                    info.h = (canvasY * this.iHeight / this.height - this.offsetH) / this.originHeight - info.y;
                } else if (this.lineType === 'circle') {
                    info.a = ((canvasX * this.iWidth / this.width - this.offsetW) / this.originWidth - info.x) / 2;
                    info.b = ((canvasY * this.iHeight / this.height - this.offsetH) / this.originHeight - info.y) / 2;
                }
                this.reDraw();
            }
        },
        mouseLeave () {
            if (this.draggable && this.canvasDragging) {
                this.canvasDragging = false;
                return;
            }
            if (!this.canvasMoveUse) return;
            this.canvasMoveUse = false;
            this.$emit('drawInfoUpdated', this.drawInfo);
        },
        canvasUp () {
            if (this.draggable && this.canvasDragging) {
                this.canvasDragging = false;
                return;
            }
            if (!this.drawable) return;
            const lastGraffiti = this.drawInfo[this.drawInfo.length - 1];
            if (!lastGraffiti) return;
            if ([
                'rec',
                'arrow'
            ].includes(lastGraffiti.type) && !lastGraffiti.w || lastGraffiti.type === 'circle' && !lastGraffiti.a) {
                // eslint-disable-next-line
                this.drawInfo.pop();
            } else {
                [
                    'x',
                    'y',
                    'w',
                    'h',
                    'a',
                    'b'
                ].forEach((key)=>{
                    if (lastGraffiti[key]) {
                        lastGraffiti[key] = +lastGraffiti[key].toFixed(8);
                    }
                });
            }
            this.canvasMoveUse = false;
            this.$emit('drawInfoUpdated', this.drawInfo);
        },
        textTranslate (textInfo) {
            const { x, y, content, scale } = textInfo;
            if (!content) return;
            let info = {
                x,
                y,
                content,
                type: 'text',
                color: this.drawColor
            };
            info.x = +((info.x * this.inOutPXRate - this.offsetW) / this.originWidth).toFixed(8);
            info.y = +((info.y * this.inOutPXRate - this.offsetH) / this.originHeight).toFixed(8);
            info.fs = +(this.fontSize * scale * this.inOutPXRate / this.originWidth).toFixed(8);
            // eslint-disable-next-line
            this.drawInfo.push(info);
            this.reDraw();
            this.$emit('drawInfoUpdated', this.drawInfo);
        },
        paintingCheck () {
            if (this.drawInfo.length + this.info.length >= this.maxGraffitiCount) {
                this.$message.warning(`单张图片涂鸦框及文本超过${this.maxGraffitiCount}个，无法再添加`);
                return;
            }
            return true;
        },
        getEditTextInfo (e) {
            let x = e.offsetX || e.layerX;
            let y = e.offsetY || e.layerY;
            if (x < 0 || y < 0 || x > this.width || y > this.height) return;
            let ix = x * this.inOutPXRate;
            let iy = y * this.inOutPXRate;
            let index = [
                ...this.drawInfo
            ].reverse().findIndex((info)=>{
                if (info.type !== 'text') return false;
                let rect = this.caclRectForTextInfo(info);
                return ix >= rect.x && iy >= rect.y && ix <= rect.x + rect.w && iy <= rect.y + rect.h;
            });
            if (index < 0) return;
            // eslint-disable-next-line
            let textInfo = this.drawInfo.splice(this.drawInfo.length - 1 - index, 1)[0];
            this.reDraw();
            return {
                x: Math.round((textInfo.x * this.originWidth + this.offsetW) / this.inOutPXRate),
                y: Math.round((textInfo.y * this.originHeight + this.offsetH) / this.inOutPXRate),
                scale: textInfo.fs * this.originWidth / this.inOutPXRate / this.fontSize,
                content: textInfo.content
            };
        },
        caclRectForTextInfo (info) {
            const fs = info.fs * this.originWidth;
            this.context.font = `${fs}px Arial`;
            let lineTexts = info.content.split('\n');
            let maxWidth = lineTexts.reduce((res, text)=>{
                return Math.max(res, this.context.measureText(text).width);
            }, 0);
            return {
                x: info.x * this.originWidth + this.offsetW,
                y: info.y * this.originHeight + this.offsetH,
                w: maxWidth,
                h: fs * this.heightRate * lineTexts.length - fs * (this.heightRate - 1)
            };
        },
        getCanvas () {
            let canvas = document.createElement('canvas');
            canvas.width = this.originWidth;
            canvas.height = this.originHeight;
            let ctx = canvas.getContext('2d');
            let img = this.context.getImageData(this.offsetW, this.offsetH, this.originWidth, this.originHeight);
            ctx.putImageData(img, 0, 0);
            if (this.watermark.length) {
                watermark.drawForCanvas(canvas, {
                    textArr: this.watermark
                });
            }
            return canvas;
        },
        getInfo () {
            return this.drawInfo;
        },
        clean () {
            // eslint-disable-next-line
            this.drawInfo.length = 0;
            this.reDraw();
        },
        reDraw () {
            if (!this.drawer) return;
            this.drawer.clear();
            this.drawer.drawBackground();
            if (this.img.complete && this.img.naturalWidth > 0) {
                this.drawer.drawImage(this.img, this.isFill);
            }
            this.drawer.drawWithInfo(this.drawInfo);
            if (this.isRenderDraw) {
                this.drawer.drawWithInfo(this.info);
            }
            if (this.isRenderAIDraw) {
                this.drawer.drawWithInfo(this.aiInfo);
            }
            if (this.isRenderRule) {
                const ruleData = this.ruleInfo.some((e)=>!e.points && e.polygons) ? this.ruleInfo.map(drawInfoParamsPolygon) : this.ruleInfo;
                this.drawer.drawWithInfo(ruleData);
            }
        },
        checkImage (url) {
            if (this.picUrl !== url && url === this.url) {
                this.initDraw();
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
        staticClass: "hik-cloud-image-canvas",
        style: {
            width: _vm.width + "px",
            height: _vm.height + "px",
            overflow: 'hidden'
        }
    }, [
        _c('canvas', {
            style: {
                width: _vm.width + "px",
                height: _vm.height + "px",
                cursor: _vm.cursor,
                transform: "translate(" + _vm.offsetX + "px, " + _vm.offsetY + "px) scale(" + _vm.currentScale + ")"
            },
            attrs: {
                "id": _vm.radom,
                "title": _vm.zoomable ? '鼠标滚轮缩放查看' : '',
                "width": _vm.iWidth,
                "height": _vm.iHeight
            },
            on: {
                "mousedown": function($event) {
                    return _vm.canvasDown($event);
                },
                "mouseup": function($event) {
                    return _vm.canvasUp($event);
                },
                "mousemove": function($event) {
                    return _vm.canvasMove($event);
                },
                "mouseleave": function($event) {
                    return _vm.mouseLeave($event);
                },
                "touchstart": function($event) {
                    return _vm.canvasDown($event);
                },
                "touchend": function($event) {
                    return _vm.canvasUp($event);
                },
                "touchmove": function($event) {
                    return _vm.canvasMove($event);
                },
                "mousewheel": function($event) {
                    return _vm.canvasWheel($event);
                }
            }
        })
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

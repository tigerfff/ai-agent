//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/**
 * 文本跑马灯组件
 * 支持水平和垂直两种滚动模式
 * 自动检测内容是否需要滚动，只在必要时启用动画
 */ var script = {
    name: 'HikCloudTextMarquee',
    props: {
        /** 显示的文本内容 */ content: {
            type: String,
            default: ''
        },
        /** 容器宽度 */ width: {
            type: String,
            default: '100%'
        },
        /** 容器高度（垂直模式有效） */ height: {
            type: String,
            default: '24px'
        },
        /** 文字大小 */ fontSize: {
            type: String,
            default: '14px'
        },
        /** 文字颜色 */ color: {
            type: String,
            default: '#4d4d4d'
        },
        /** 是否启用垂直滚动模式 */ vertical: {
            type: Boolean,
            default: false
        },
        /**
     * 水平滚动速度系数
     * 值越大，动画速度越快
     */ speedFactor: {
            type: Number,
            default: 20,
            validator: (value)=>value > 0
        },
        /**
     * 垂直滚动速度系数
     * 值越大，动画速度越快
     */ verticalSpeedFactor: {
            type: Number,
            default: 5,
            validator: (value)=>value > 0
        },
        /**
     * 动画模式
     * seamless: 无缝滚动（默认）
     * bounce: 往复滚动（从开始到结束，再从结束到开始）
     */ animationMode: {
            type: String,
            default: 'seamless',
            validator: (value)=>[
                    'seamless',
                    'bounce'
                ].includes(value)
        },
        /** 自定义CSS类名 */ customClass: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            /** 是否需要运行动画 */ shouldAnimate: false,
            /** 动画样式字符串 */ animationStyle: '',
            /** 防抖定时器ID */ updateTimeout: null,
            /** 用户手动控制的动画状态 */ isAnimationManuallyStopped: false
        };
    },
    computed: {
        /** 是否为无缝滚动模式 */ isSeamless ({ animationMode }) {
            return animationMode === 'seamless';
        }
    },
    watch: {
        content () {
            this.debouncedAnimationUpdate();
        },
        height () {
            this.debouncedAnimationUpdate();
        },
        vertical () {
            this.debouncedAnimationUpdate();
        }
    },
    mounted () {
        this.debouncedAnimationUpdate();
        // 添加窗口大小变化监听
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy () {
        // 清理定时器和事件监听
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        /**
     * 处理窗口大小变化事件
     * 重新计算动画参数
     */ handleResize () {
            this.debouncedAnimationUpdate();
        },
        /**
     * 防抖的动画更新调度
     * 避免频繁更新导致的性能问题
     */ debouncedAnimationUpdate () {
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }
            this.updateTimeout = setTimeout(()=>{
                this.scheduleAnimationUpdate();
            }, 100);
        },
        /**
     * 调度动画更新
     * 在下一个DOM更新周期执行
     */ scheduleAnimationUpdate () {
            this.$nextTick(()=>{
                this.updateAnimation();
            });
        },
        /**
     * 更新动画状态
     * 根据内容尺寸和容器尺寸决定是否启用动画
     */ updateAnimation () {
            if (!this.$refs.out || !this.$refs.in) {
                return;
            }
            let containerSize, contentSize;
            try {
                // 根据滚动模式获取尺寸
                if (this.vertical) {
                    containerSize = this.$refs.out.clientHeight;
                    contentSize = this.$refs.in.clientHeight;
                } else {
                    containerSize = this.$refs.out.clientWidth;
                    contentSize = this.$refs.in.clientWidth;
                }
                // 验证尺寸值有效性
                if (isNaN(containerSize) || isNaN(contentSize) || containerSize <= 0) {
                    return;
                }
                // 判断是否需要滚动
                const contentNeedsAnimation = contentSize > containerSize;
                this.shouldAnimate = contentNeedsAnimation && !this.isAnimationManuallyStopped;
                if (this.shouldAnimate) {
                    // 计算动画参数
                    const speedFactor = this.vertical ? this.verticalSpeedFactor : this.speedFactor;
                    const animationDuration = Math.max(1, Math.ceil(contentSize / speedFactor));
                    let animationName;
                    if (this.animationMode === 'bounce') {
                        // 往复动画模式
                        animationName = this.vertical ? 'scroll-bounce' : 'marquee-bounce';
                        // 设置CSS变量用于计算精确的位移
                        if (this.vertical) {
                            this.$refs.wrapper.style.setProperty('--container-height', `${containerSize}px`);
                        } else {
                            this.$refs.wrapper.style.setProperty('--container-width', `${containerSize}px`);
                        }
                    } else {
                        // 无缝滚动模式
                        animationName = this.vertical ? 'scroll' : 'marquee';
                    }
                    this.animationStyle = `${animationName} ${animationDuration}s linear infinite`;
                } else {
                    // 不需要滚动时清空动画
                    this.animationStyle = '';
                    // 清除CSS变量
                    if (this.$refs.wrapper) {
                        this.$refs.wrapper.style.removeProperty('--container-width');
                        this.$refs.wrapper.style.removeProperty('--container-height');
                    }
                }
            } catch (error) {
                this.animationStyle = '';
            }
        },
        /**
     * 启动跑马灯动画 仅内容超出容器才会生效
     * 如果内容需要滚动，则启用动画效果
     */ startAnimation () {
            this.isAnimationManuallyStopped = false;
            this.updateAnimation();
        },
        /**
     * 停止跑马灯动画
     * 无论内容是否需要滚动，都停止动画
     */ stopAnimation () {
            this.isAnimationManuallyStopped = true;
            this.animationStyle = '';
            this.shouldAnimate = false;
        },
        /**
     * 检查动画是否正在运行
     * @returns {boolean} 动画是否正在运行
     */ isAnimating () {
            return this.shouldAnimate;
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
        staticClass: "hik-cloud-text-marquee",
        class: _vm.customClass,
        style: {
            fontSize: _vm.fontSize,
            color: _vm.color
        }
    }, [
        _vm.vertical ? _c('div', {
            ref: "out",
            staticClass: "hik-cloud-text-marquee__scroll",
            class: {
                'hik-cloud-text-marquee--no-scroll': !_vm.shouldAnimate
            },
            style: {
                width: _vm.width,
                height: _vm.height
            }
        }, [
            _c('div', {
                ref: "wrapper",
                staticClass: "hik-cloud-text-marquee__text",
                class: {
                    'hik-cloud-text-marquee__text--seamless': _vm.shouldAnimate && _vm.isSeamless
                },
                style: {
                    animation: _vm.animationStyle
                }
            }, [
                _c('p', {
                    ref: "in",
                    staticClass: "hik-cloud-text-marquee__text-item",
                    style: {
                        fontSize: _vm.fontSize,
                        color: _vm.color
                    }
                }, [
                    _vm._v(" " + _vm._s(_vm.content) + " ")
                ]),
                _vm._l(_vm.shouldAnimate && _vm.isSeamless ? 2 : 0, function(i) {
                    return _c('p', {
                        key: i,
                        staticClass: "hik-cloud-text-marquee__text-item hik-cloud-text-marquee__text-item--copy"
                    }, [
                        _vm._v(" " + _vm._s(_vm.content) + " ")
                    ]);
                })
            ], 2)
        ]) : _c('div', {
            ref: "out",
            staticClass: "hik-cloud-text-marquee__content",
            style: {
                width: _vm.width
            }
        }, [
            _c('p', {
                ref: "wrapper",
                style: {
                    animation: _vm.animationStyle
                }
            }, [
                _c('span', {
                    ref: "in",
                    staticClass: "hik-cloud-text-marquee__text-item",
                    style: {
                        fontSize: _vm.fontSize,
                        color: _vm.color
                    }
                }, [
                    _vm._v(" " + _vm._s(_vm.content) + " ")
                ]),
                _vm.shouldAnimate && _vm.isSeamless ? _c('span', {
                    staticClass: "hik-cloud-text-marquee__text-item hik-cloud-text-marquee__text-item--copy"
                }, [
                    _vm._v(" " + _vm._s(_vm.content) + " ")
                ]) : _vm._e()
            ])
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
    // 安装国际化支持
    // 注册组件
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

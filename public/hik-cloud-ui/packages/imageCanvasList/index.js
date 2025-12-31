//
//
//
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
    props: {
        src: {
            type: String,
            default: ''
        },
        width: {
            type: Number,
            default: 72
        },
        height: {
            type: Number,
            default: 72
        },
        duration: {
            type: Number,
            default: 0
        },
        ms: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            imgSize: "",
            imgSrc: ""
        };
    },
    computed: {
        formatDuration () {
            // 后端返回的时间单位是秒
            // let temp = Math.floor(this.duration/1000)
            let temp = this.duration;
            if (this.ms) temp = Math.floor(temp / 1000);
            let minute = Math.floor(temp / 60);
            let second = temp % 60;
            return `${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`;
        }
    },
    watch: {
        src () {
            this.refreshImage();
        }
    },
    created () {
        this.refreshImage();
    },
    methods: {
        handleClick () {
            this.$emit("click");
        },
        refreshImage () {
            let img = new Image();
            img.src = this.src;
            img.onload = ()=>{
                this.imgSize = img.width / this.width > img.height / this.height ? `width:${this.width}px;height:${this.width * img.height / img.width}px;` : `width:${this.height * img.width / img.height}px;height:${this.height}px;`;
                this.imgSrc = this.src;
            };
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

const __vue_script__$1 = script$1;
/* template */ var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-canvas-video-thumbnail",
        style: "width:" + _vm.width + "px;height:" + _vm.height + "px;",
        on: {
            "click": _vm.handleClick
        }
    }, [
        _c('img', {
            style: _vm.imgSize,
            attrs: {
                "src": _vm.imgSrc,
                "alt": ""
            }
        }),
        _c('div', {
            staticClass: "video-duration"
        }, [
            _c('span', {
                staticClass: "video-duration-text"
            }, [
                _vm._v(_vm._s(_vm.formatDuration))
            ])
        ])
    ]);
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
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
    name: 'HikCloudImageCanvasList',
    components: {
        videoThumbnail: __vue_component__$1
    },
    props: {
        imgList: {
            type: Array,
            default: ()=>[]
        },
        selectIndex: {
            type: Number,
            default: 0
        },
        secondSelectIndex: {
            type: Number,
            default: 0
        },
        deletable: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            lineWidth: 1.5,
            imgModfyList: [],
            lineType: 'rec',
            offsetX: 0,
            imgSize: 78,
            groupMargin: 52,
            // 弹窗相关数据
            dialogVisible: false,
            dialogTitle: '预览',
            dialogContent: '',
            dialogContentType: 'image',
            showConfirmButton: false,
            /** 0: 删除当前图片 1: 删除整组 */ deleteType: 1,
            targetIndex: 0,
            targetSubIndex: 0
        };
    },
    computed: {
        // 根据 imgList 的结构自动判断是几维数组
        picArrayDimension () {
            if (!Array.isArray(this.imgList)) return 0;
            if (this.imgList.length === 0) return 1;
            // 检查是否所有元素都不是数组（包括null/undefined）
            const isOneDimensional = this.imgList.every((item)=>!Array.isArray(item));
            if (isOneDimensional) return 1;
            // 检查是否所有元素都是数组（不包括null/undefined）
            const isTwoDimensional = this.imgList.every((item)=>item !== null && Array.isArray(item));
            if (isTwoDimensional) return 2;
            return 1;
        },
        // 根据数组维度自动判断 singleDimension
        singleDimension () {
            return this.picArrayDimension === 1;
        },
        doubleDimensionClass () {
            return !this.singleDimension && this.imgList.some((item)=>item.length > 1);
        }
    },
    watch: {
        imgList: {
            handler (val) {
                if (val && val.length) {
                    try {
                        val.forEach((item)=>{
                            if (this.singleDimension) {
                                item.picCoordinate = item.picCoordinate ? JSON.parse(item.picCoordinate) : [];
                            } else {
                                item.forEach((subItem)=>{
                                    subItem.picCoordinate = subItem.picCoordinate ? JSON.parse(subItem.picCoordinate) : [];
                                });
                            }
                        });
                    } catch (e) {
                    }
                }
                this.imgModfyList = val;
            },
            immediate: true
        }
    },
    methods: {
        getVideoFrameUrl (url, t = 0, w = 0, h = 0, f = 'png') {
            if (!url) return '';
            const str = [
                "video/snapshot",
                `t_${t}`,
                `w_${w}`,
                `h_${h}`,
                `f_${f}`
            ].join(",");
            return `${url}${url.includes('?') ? '&' : '?'}x-oss-process=${str}`;
        },
        opened () {
            if (!window.localStorage.getItem('Chain_pic_group_guide') && this.doubleDimensionClass) {
                this.showGuide();
            }
        },
        closeGuide () {
            window.localStorage.setItem('Chain_pic_group_guide', '1');
        },
        showGuide () {
            if (this.$refs.ymGuide) {
                this.$refs.ymGuide.renderGuide();
            }
        },
        videoFirstFrameUrl (item) {
            return item.videoPicUrl || this.getVideoFrameUrl(item.picUrl);
        },
        handleClick (item, index, subIndex) {
            this.$emit('update:selectIndex', index);
            this.$emit('update:secondSelectIndex', subIndex);
            this.$emit('getUrl', index, subIndex);
        },
        xScroll (info) {
            this.offsetX = info.scrollLeft;
        },
        swipeLeft () {
            this.setOffset(this.offsetX + this.imgSize);
        },
        swipeRight () {
            this.setOffset(this.offsetX - this.imgSize);
        },
        setOffset (offset) {
            const totalWidth = this.singleDimension ? this.imgSize * this.imgList.length : this.imgList.reduce((sum, arr)=>sum + arr.length * this.imgSize + this.groupMargin, 0);
            let targetX = Math.max(0, Math.min(offset, totalWidth - this.$refs.container.clientWidth));
            this.$refs.scrollbar.setScroll(0, targetX);
        },
        setSelectImgCenter () {
            if (this.singleDimension) {
                this.setOffset(-this.$refs.container.clientWidth / 2 + this.selectIndex * this.imgSize + this.imgSize / 2);
            } else {
                const groupOffset = this.imgList.slice(0, this.selectIndex).reduce((sum, arr)=>sum + arr.length * this.imgSize + this.groupMargin, 0);
                const itemOffset = this.secondSelectIndex * this.imgSize;
                this.setOffset(-this.$refs.container.clientWidth / 2 + groupOffset + itemOffset + this.imgSize / 2);
            }
        },
        // 显示弹窗
        showDialog (content, type = 'image', title = '预览', showConfirm = false) {
            this.dialogContent = content;
            this.dialogContentType = type;
            this.dialogTitle = title;
            this.showConfirmButton = showConfirm;
            this.dialogVisible = true;
        },
        // 弹窗关闭回调
        handleDialogClose () {
            this.$emit('dialog-close');
        },
        // 确认按钮回调
        handleConfirm () {
            if (this.deleteType) {
                this.$emit('handleDeleteItem', this.imgList[this.targetIndex]);
                this.setCenter(this.targetIndex, this.targetSubIndex, true);
            } else {
                this.$emit('handleDeleteItem', this.imgList[this.targetIndex], this.targetSubIndex);
                this.setCenter(this.targetIndex, this.targetSubIndex);
            }
            this.dialogVisible = false;
        },
        handleDeleteItem (index, item, subIndex) {
            this.targetIndex = index;
            this.targetSubIndex = subIndex;
            if (!this.singleDimension) {
                if (this.doubleDimensionClass) {
                    this.dialogVisible = true;
                    return;
                } else {
                    this.$emit('handleDeleteItem', this.imgList[this.targetIndex]);
                    this.setCenter(index, subIndex, true);
                    return;
                }
            }
            this.$emit('handleDeleteItem', index, item, this.imgList, subIndex);
            this.setCenter(index, subIndex);
        },
        setCenter (index, subIndex, isDeleteGroup = false) {
            if (this.singleDimension) {
                // 一维数组处理
                let newIndex = index >= this.selectIndex ? this.selectIndex : this.selectIndex - 1;
                newIndex = Math.max(0, Math.min(newIndex, this.imgModfyList.length - 1));
                if (newIndex !== this.selectIndex || isDeleteGroup) {
                    this.$nextTick(()=>{
                        this.$emit('getUrl', newIndex, 0);
                    });
                }
            } else {
                // 二维数组处理
                let newIndex = this.selectIndex;
                let newSubIndex = this.secondSelectIndex;
                if (isDeleteGroup) {
                    // 删除整组的情况
                    if (index === this.selectIndex) {
                        // 删除的是当前选中组
                        newIndex = Math.max(0, this.selectIndex - 1);
                        newSubIndex = this.imgModfyList[newIndex] && this.imgModfyList[newIndex].length ? this.imgModfyList[newIndex].length - 1 : 0;
                    } else if (index < this.selectIndex) {
                        // 删除的是当前选中组之前的组
                        newIndex = this.selectIndex - 1;
                    }
                } else {
                    // 删除单个子项的情况
                    if (index === this.selectIndex) {
                        // 删除的是当前选中项
                        if (subIndex === this.secondSelectIndex) {
                            // 如果删除的是当前选中的子项
                            if (this.imgModfyList[this.selectIndex].length > 1) {
                                // 如果当前组还有其他子项
                                newSubIndex = Math.min(this.secondSelectIndex, this.imgModfyList[this.selectIndex].length - 2);
                            } else {
                                // 如果当前组没有其他子项了，需要切换到前一组
                                newIndex = Math.max(0, this.selectIndex - 1);
                                newSubIndex = this.imgModfyList && this.imgModfyList[newIndex] && this.imgModfyList[newIndex].length ? this.imgModfyList[newIndex].length - 1 : 0;
                            }
                        }
                    } else if (index < this.selectIndex) {
                        // 删除的是当前选中项之前的项
                        newIndex = this.selectIndex - 1;
                    }
                }
                // 边界检查
                newIndex = Math.max(0, Math.min(newIndex, this.imgModfyList.length - 1));
                if (this.imgModfyList && this.imgModfyList[newIndex] && this.imgModfyList[newIndex].length) {
                    newSubIndex = Math.min(newSubIndex, this.imgModfyList[newIndex].length - 1);
                } else {
                    newSubIndex = 0;
                }
                if (newIndex !== this.selectIndex || newSubIndex !== this.secondSelectIndex) {
                    this.$nextTick(()=>{
                        this.$emit('getUrl', newIndex, newSubIndex);
                    });
                }
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
        staticClass: "hik-cloud-image-canvas-list"
    }, [
        _c('div', {
            staticClass: "threeImg"
        }, [
            _c('div', {
                directives: [
                    {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.imgList && _vm.imgList.length > 0,
                        expression: "imgList && imgList.length > 0"
                    }
                ],
                staticClass: "iconArrow",
                on: {
                    "click": _vm.swipeRight
                }
            }, [
                _c('i', {
                    staticClass: "h-icon-angle_left"
                })
            ]),
            _c('div', {
                ref: "container",
                staticClass: "container"
            }, [
                _c('el-scrollbar', {
                    ref: "scrollbar",
                    attrs: {
                        "viewStyle": "width:fit-content;"
                    },
                    on: {
                        "on-scrolling-x": _vm.xScroll
                    }
                }, [
                    _vm.singleDimension ? _c('ul', _vm._l(_vm.imgModfyList, function(item, index) {
                        return _c('li', {
                            key: item.filename,
                            style: {
                                'border-color': index == _vm.selectIndex ? '#E44A09' : ''
                            },
                            on: {
                                "click": function($event) {
                                    return _vm.handleClick(item, index);
                                }
                            }
                        }, [
                            item.fileType ? _c('videoThumbnail', {
                                attrs: {
                                    "src": _vm.videoFirstFrameUrl(item),
                                    "width": 68,
                                    "height": 68,
                                    "duration": item.videoDuration,
                                    "ms": !!item.isMillisecond
                                }
                            }) : _c('hik-cloud-image-canvas', {
                                attrs: {
                                    "info": item.aiPicSame ? undefined : item.picCoordinate,
                                    "aiInfo": item.aiPicCoordinate,
                                    "url": item.picUrl,
                                    "width": 68,
                                    "height": 68,
                                    "lineWidth": _vm.lineWidth,
                                    "lineType": _vm.lineType,
                                    "drawInfo": item.drawInfo
                                }
                            }),
                            _vm.deletable ? _c('i', {
                                staticClass: "h-icon-close close-btn",
                                on: {
                                    "click": function($event) {
                                        $event.stopPropagation();
                                        return (function() {
                                            return _vm.handleDeleteItem(index, item);
                                        }).apply(null, arguments);
                                    }
                                }
                            }) : _vm._e()
                        ], 1);
                    }), 0) : _c('ul', _vm._l(_vm.imgModfyList, function(item, index) {
                        return _c('div', {
                            key: "$item-" + index,
                            staticClass: "img-item",
                            class: {
                                'img-item-doubleDimensionClass': _vm.doubleDimensionClass
                            }
                        }, _vm._l(item, function(subItem, subItemIndex) {
                            return _c('div', {
                                key: subItem.filename,
                                staticClass: "img-item-sub",
                                style: {
                                    'border-color': index == _vm.selectIndex && subItemIndex == _vm.secondSelectIndex ? '#E44A09' : ''
                                },
                                on: {
                                    "click": function($event) {
                                        return _vm.handleClick(item, index, subItemIndex);
                                    }
                                }
                            }, [
                                subItem.fileType ? _c('videoThumbnail', {
                                    attrs: {
                                        "src": _vm.videoFirstFrameUrl(subItem),
                                        "width": 68,
                                        "height": 68,
                                        "duration": subItem.videoDuration,
                                        "ms": !!subItem.isMillisecond
                                    }
                                }) : _c('hik-cloud-image-canvas', {
                                    attrs: {
                                        "info": subItem.aiPicSame ? undefined : subItem.picCoordinate,
                                        "aiInfo": subItem.aiPicCoordinate,
                                        "url": subItem.picUrl,
                                        "width": 68,
                                        "height": 68,
                                        "lineWidth": _vm.lineWidth,
                                        "lineType": _vm.lineType,
                                        "drawInfo": subItem.drawInfo
                                    }
                                }),
                                _vm.deletable ? _c('i', {
                                    staticClass: "h-icon-close close-btn",
                                    on: {
                                        "click": function($event) {
                                            $event.stopPropagation();
                                            return (function() {
                                                return _vm.handleDeleteItem(index, subItem, subItemIndex);
                                            }).apply(null, arguments);
                                        }
                                    }
                                }) : _vm._e()
                            ], 1);
                        }), 0);
                    }), 0)
                ])
            ], 1),
            _c('div', {
                directives: [
                    {
                        name: "show",
                        rawName: "v-show",
                        value: _vm.imgList && _vm.imgList.length > 0,
                        expression: "imgList && imgList.length > 0"
                    }
                ],
                staticClass: "iconArrow",
                on: {
                    "click": _vm.swipeLeft
                }
            }, [
                _c('i', {
                    staticClass: "h-icon-angle_right"
                })
            ])
        ]),
        _c('el-dialog', {
            attrs: {
                "visible": _vm.dialogVisible,
                "area": [
                    360,
                    192
                ],
                "show-close": false,
                "top": "30%",
                "custom-class": "hik-cloud-image-canvas-list-dialog"
            },
            on: {
                "update:visible": function($event) {
                    _vm.dialogVisible = $event;
                },
                "close": _vm.handleDialogClose
            }
        }, [
            _c('div', {
                staticClass: "dialog-content"
            }, [
                _c('h-feedback-icon', {
                    staticClass: "dialog-question-icon",
                    attrs: {
                        "icon-name": "h-icon-feedback_question_lg"
                    }
                }),
                _c('el-form', [
                    _c('p', {
                        staticClass: "dialog-tip"
                    }, [
                        _vm._v(" 图片删除后无法撤销，确定删除？ ")
                    ]),
                    _c('el-form-item', {
                        staticStyle: {
                            "margin-bottom": "0px"
                        }
                    }, [
                        _c('el-radio', {
                            staticClass: "radio",
                            attrs: {
                                "label": 0
                            },
                            model: {
                                value: _vm.deleteType,
                                callback: function($$v) {
                                    _vm.deleteType = $$v;
                                },
                                expression: "deleteType"
                            }
                        }, [
                            _vm._v(" 删除当前图片 ")
                        ]),
                        _c('el-radio', {
                            staticClass: "radio",
                            attrs: {
                                "label": 1
                            },
                            model: {
                                value: _vm.deleteType,
                                callback: function($$v) {
                                    _vm.deleteType = $$v;
                                },
                                expression: "deleteType"
                            }
                        }, [
                            _vm._v(" 删除整组 ")
                        ])
                    ], 1)
                ], 1)
            ], 1),
            _c('div', {
                staticClass: "dialog-footer"
            }, [
                _c('el-button', {
                    attrs: {
                        "type": "primary"
                    },
                    on: {
                        "click": _vm.handleConfirm
                    }
                }, [
                    _vm._v(" 确定 ")
                ]),
                _c('el-button', {
                    on: {
                        "click": function($event) {
                            _vm.dialogVisible = false;
                        }
                    }
                }, [
                    _vm._v(" 取消 ")
                ])
            ], 1)
        ])
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

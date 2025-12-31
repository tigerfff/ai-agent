import moment from 'moment';

function getDateTime(timenow) {
    let time = new Date(timenow) || new Date();
    return moment(time).format('YYYY-MM-DD HH:mm:ss');
}
function getDateHour(val) {
    if (!val) return "";
    const _time = moment(val);
    return _time.format('HH:mm:ss');
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
var script$1 = {
    name: "AsideInfo",
    components: {},
    props: {
        applicationSceneName: {
            type: String,
            default: "门店"
        },
        questionTypeNameMap: {
            type: Array,
            default: ()=>{
                return [
                    '一般问题',
                    '重要问题',
                    '红线问题'
                ];
            }
        },
        hasChangeQuesBtn: {
            type: Boolean,
            default: true
        },
        question: {
            type: Object,
            default: ()=>{}
        },
        pic: {
            type: Object,
            default: ()=>{}
        },
        showEvalBtn: {
            type: Boolean,
            default: false
        },
        changeQuesLeftBtnText: {
            type: String,
            default: "上一条问题"
        },
        changeQuesRightBtnText: {
            type: String,
            default: "下一条问题"
        },
        isSpot: {
            type: Boolean,
            default: false
        },
        forbiddenOverRedLine: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {};
    },
    computed: {
        channelInfo () {
            return this.pic.channelInfo || {};
        },
        displayScore () {
            // questionType 巡查项类别(0:普通项;1:红线项;2:附加) pointType 附加分类别(1:附加加分项;2:附加减分项)
            const { pointType, questionType, score, scoreChange } = this.question;
            let addText = "-", fenShu = scoreChange;
            if (questionType === 2 && pointType === 1) {
                addText = "+";
                fenShu = score + scoreChange;
            }
            return `${addText}${Math.abs(fenShu).toFixed(1)}分`;
        },
        evalText () {
            return this.isSpot ? '点检详情' : [
                3,
                4,
                5,
                7
            ].includes(this.question.patrolClassification) ? '点检详情' : '考评详情';
        },
        showMoreQuestion () {
            return this.isSpot || [
                3,
                4,
                5,
                7
            ].includes(this.question.patrolClassification);
        }
    },
    watch: {
        pic: {
            immediate: true,
            deep: true,
            handler (val) {
                if (val) {
                    this.sellingPoints();
                }
            }
        }
    },
    async mounted () {},
    methods: {
        getDateTime,
        getDateHour,
        getModuleName () {
            if (this.$store && this.$store.state && this.$store.breadcrumb) {
                const _breadcrumb = this.$store.state.breadcrumb;
                if (_breadcrumb && _breadcrumb.length > 0) {
                    return _breadcrumb[_breadcrumb.length - 1];
                } else {
                    return '';
                }
            }
        },
        prev () {
            this.$emit("changeQues", "prev", this.question.questionId);
        },
        next () {
            this.$emit("changeQues", "next", this.question.questionId);
        },
        // 刷新数据
        async sellingPoints () {},
        // 查看视频 - 直接跳转到视频页面
        watchVideo () {
            if (!this.channelInfo.channelId) return;
            this.$emit('goRecording', this.channelInfo);
        },
        goEval () {
            this.$emit('goEval', this.question);
        }
    }
};

var img$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAC+lBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////d4OP8/Pzs7vH///8hLkggL0rs9v/8/v8eME4YNV7q9f8eMVDv9/8uYYn1+/8iLUbx+f8fL0zt9/8bMldBvfYcMlQtYYvn9P/z+v8dMVIjLUTi8f8nL0UZM1r3+/8YNFzD4v8lLUP5/f/I5P+13P9KwPYjMEkqMUbm8v/K5v/p9P/k8v+63v+93/8iMUzO5/9EcJIvYIcmNVCw2f+e0f8mMEjQ6P+/4P+k1P/G5P/B4f+n1f8xX4S43f8nN1MtNEjb7v+p1v/M4/vM5v/W5vYeNFY9Q1QgM1MxN0uZzv/k8f42ZIgiMk6y2/8cNFkjLEKt2P8yX4M4PlHE4/+h0v/S5vpHcpSr1//J5P1BbY83Y4ZCR1glMk1LT180Ok3h7vvo6u7h5OgxY4szYIRoanbW6//S6f8yYohVWGZQVGJHTFze7/+b0P/f7v7P5v32+PvY6vvr7fBDdJNkZnJcX2zm5+rN09rHztU+aYpvcXxXW2opN1L09vjc6vjZ5/jw8/bS4fLA1e3Y3ePV2d6Op8R2j608ao43Z406ZogxYIdgY3DF3fXd4OS/x88lRWwlNVLt7/LO3vC50Ol6k7M3gq1bd5lTZn9sbngtUnXc7Py90OO2vsWfsMJ/mrhhgKI2eaJAe5tGeplieZU0bJNhdo1NZ4hDX4JCVXI4SWPv8fRIuu7O2+zJ1+i1yeGtw92owdypvdakutKass4+nMyJnLU7ibV3l6xKgalviaZqgZ1rfJE5VntOXncoSm8sT24jQGcqQ2QtP1vF4fzy9Pfg6PBHruA+otS1ws+VsM0+g6OAhpRVdI9UbYx1eYZjbX8mUnsxSm5BT2gcO2MmOltUuuo+seazy+U6jbtfkLSdpbKRm66EkKV0hJtHZo3Z5PCu1fBtnMExcpsPpQiQAAAAH3RSTlMAB/lz7NKw8O/nzLmSiWJbVUI8MyIaDN9tsWVu3eznac0FgQAACndJREFUWMOck0tqwzAQhhs/E+edOA+yMagghBHeyCDwwishXyP3yElSWmgPULrrMnQbKF0l9+nIonHi2G7aD3lGGkm/R2J018R00HfshWUY1sJ2+oPp3X+YLZ12UKLtLGd/U2kNu0EN3WHrZpm52Qka6Jjz27IxrUBzf0WgscwbsprYWqSGlOZq9uS3dHpaJq0G8SxMdV69xqR8T8skVRDOo7yjpTy/XmfsKpkkvIYKznExTJSUO67TGRkwncZhHIZgfjyVnPOMnGLap7DUGFXrrFQ6TCBEaEwpwZhxRYbiAjUDBggDYFWZj9KJKZIiU9sFk5g2EavjVeQ0NkCHkiqi8lAHKCgZV/fku6BDohJIW3Dao9NQfQSUXL9UP57SQWfg3ETK5gYXYe2hKSXvsp5UHcL1Yr0AA9CRGBqW8OFCR/UhCDMAUZV58S4gEGNAYsmkZEKCExIsg1jexGa7fVgDG1ijlkGQSQobJ2cHg/eVsBxxskK7zfr16X3/+fx2OByPu93H7vjytX+EP2gSeHfF4b6JqrfQpOI4DuB2JYjqIehCD2pFY1nRGup52YNnA+F0GtiTrD2YjFMQDhIs5yWdV9zmNe8uLbNhYLAUy65b9wtdR42IYovRYkFEdKHHvv9zyr6w4Ysfvv/f/+//vwTuti6E6+I4Dv/b8ZHrIsaTF9PVO3dTEolEKpFKd+7cuXXr1q93Lp6+1IWo1e3t+OqS5v2De2OHWq1W4o/j1BxRrNkLj15Mv+mnKIVCJpMRCIFDpBb511unL3Sp20FhcUvX/S+0hXc4pZKDwWVGTzV+Jy19Bzo7KUpgEOLwTEuLXC5/d/ExDi6+tKVZaRHuw11KPoEAp7TqHv767NP391v6IFEaHqKxMKFQC5HkbW3yg7eeKUk2484UprQGhZR+f8APx2rNXpr3+nzHj+v7SSNNs5AUIX2EQm2g2m4/nZ2dtdvL5fQaHlqJQsQhTGb0l8frHRjw6fX9fQeahcDwThM6WL18Mm+PRm22YDAYLa/k3x3MXdnb2+uvB6yZBwsexDtACoGhNArBaS7s/Zc31eqtTxevFuy2yr17ufRMOh20p8krtUks3t6L1OuBzMNEJBJJCk4fHEpwaMF5P3nz5qe4wWDQmlj2ZDQIZyY9PDyci1Y2ANooFrcTaKSeubAwFg5HksQhc+5QKBS8I6UZKdMz/foYEDBaLcuapsr8unKAZmzB5YDwnvoHB0dGMnXdfNgZHkt6fXoL7xwhJ4iW0LSEYZi7U6E4IIfWoD13iGWL+xrn5xpXGkRK26Ir8L5jzwYJlNU1wk5nOOIZOE76dBJHIaNpmmEkzOG7U9cBORwOUqjEsmf3Ia2trflKejhns4vXilbjVLt46EHCmXCOJYnTiT4dCplGBsjMMFJpauojgQyOaxOATEajmzjI6WglV4nmxatFq/Azc7lIoZ/ORC0c8ZI+FNaFLdNgXWaaQNMfARVLhz6oVC+1btZoPPcXOlu2VYL2wpZVouXYfJfr6Eh2dCGRcEYwIDgdWBcczb+tT726fv1GKF4aV6lU988dMhpNbjh85uw2m72QWy7CDdK7d+hoVjdXQyEPnE4KEHZM+G0wZnP34eoNhI2XXqqQiaLRWHTvayXSnj1n8jjbBdsy0XqxeHC/66hO97OGQgN6ywGMuWP82/O3Go1ZI6G7EfMkGwqFTPFj1wg0jhGdFRpBOhHLl/Mx+3oRrhDX0BCg+ZpzzOPDoFFnYjfy/b3ZTBOop3vSFAqxppJjgkDfWZbFhHgGeVrI52OFpSK8QnuH0Gg0UXNi0hYMiKLGd5Pcv9ZDS7tTqZ6eybjJZCoeM2jvA3qO4+h2gxGgH7FCIRZb/KcXcwltIorCMLhw42shguIb0UitFqE+qqMTlaGTTE3bSWdqNJlBS2mSVqNNjHWjaEWlLgQjurFQrW1JiqlKUFoXYhVf9YlCrVVBERRb6wPBN/ifO8lIrFpF8Cfb+fLfc+8995zDQKEagHCGDmxeA0MA3QeGdNNBoIOOZ+GjR8vCOEOPAXqcV3lkyxYTdCeyb18kMghLM0CXGveSITrQi5bNv//EICUm2+24rCfXbt2K07hi602AXudV1gNEGAY6FdkXiY6nYMsEutzYyAyBM39ZYeHKNwwUmzzZ7vU2nw+Hw2VlZSuqbxugLRA4BuhzNBKJTqDt3x7SNmy4fACXbN2q+eXl5dh6h+HoeBUuK+k5MAA11D9ZcvFOXh5xUqB3vmg0enocHUi3ANClHbhk2HvGmXHG4Dgc9pnEab5QyUArqsvq6yvzjqTiQ/piO3X6NEC4IrmPNG3DsR1IiwhROQ51YeFt4pzB1ntnNhPIcn5/OFzd0NBQ3XAEN5ZAy3t6emLdfbE6Wf+0Z+IwurTTFKztUCPSEDYfZxqgBDhfwTFBlgvtMLQc2rjxaKIr1jc1qc63so78P5zSyOJASNcOvWDpDLeMQIUPznbZqxxVVd6Z3uYSC4QHqDeRuB/r9vtzcvwLoakLCdS2XRJQvo1kiU0nS++R75HOwJmxFPe+atIke5UXe0/pvmTOnJLVUNZqv59AOcRhSjyVdRnNhZFq3VxI066x/DoXorxIadp4ES0lJAM0+0dQ3wlN53dNnDjYSP7TVVhq2kn5Ho7Mh8zuhVIgYOAoy5+VAwFjgNo7ZEFBcTM6+Rwp3KOQ9n4VLn7SEGSCLMTBg4iFZUHESRnqapF1XgdgVPKBdDsfhWpqNyHDzjAMUbrHwrwWCwMBAxHGnzTEFLurSTyHlQ1JPdkLnAEs7hYzlFYyQOYLnUVK47Q16bzCoUQaYRYR25wcL9S+II7xkoEDEYaBUhw4MgPdeZg4qpuKCLOsyXCqHB+KvzQjDVBayZACmZHu/vhU0vkAp2agrDELLYqSqgja1ZdmyUAg0xCJYVKGuj62xmVwVKc7WWiZlRbn5EC6cs/wk15UpUd6am97W12trAsK57SpVGelFaPTRCcXEELxDweX9q+FzFAv7O583nIjLkmSADuqzTWNitH08nibaFMVXmq69txBfkwQ45CdB53nTrTUdTRtlyVd4DnVKYqubaw8Ti/YpygumxrgBa224/C9h+BAbGGves+3nzvR1vq0I67JMqMowNhEl5XDwob2ayEWOF1YHlBSU/zq9VuHoZaW1ta6G9evvq1tqpElSOd5XgkgNoTxiRnUQvRvarJFl2hDzHlBl2RJ02pkEgCyDhuCAAaH/TYoVl++NZOamp+1WdNdVkKpnKLwvGCIZ1JggwMDCxINSkWFbxa1WT9v/DLFfKtVJJbK4c8hOOBUlQg2GxBgAAJKMOjLpMbvV61ohjM/32d1uVygpQQPIBgMQPIB8XiKXRnUiv66OZ4iBSvA8llNse9BMBFQUZEwhZrj37bruT6PJ1hRAZyhCqYgMTyMUbR+fXAea9d/P0CAqWKSh8Q+xi9FgAoK1sMODRAGHmlkKkWm8DkAjMC0uyCQaY40Bh6yZAueAlP0Oam0dHdpMZ9tDFn+fOyTG/DgW3z9XcVcrjn2+atBVLZbEINFBaWlBUVBUXBnm4Oo/z0aYxo1dkz/Yd2YAYd1/z4+/AYZDO4f+lOwcgAAAABJRU5ErkJggg==";

var img = "data:image/png;base64,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";

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
var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('div', {
        staticClass: "hik-cloud-aside-info",
        class: {
            'hik-cloud-aside-container-padding': _vm.hasChangeQuesBtn
        }
    }, [
        _c('el-scrollbar', {
            staticStyle: {
                "box-sizing": "border-box"
            },
            attrs: {
                "wrapStyle": "height:100%;overflow-x:hidden;",
                "viewStyle": "padding: 20px;"
            }
        }, [
            _c('div', {
                staticClass: "aside-header"
            }, [
                _vm.question.noticeTime ? _c('div', {
                    staticClass: "noticeTime"
                }, [
                    _vm._v(" 推送时间：" + _vm._s(_vm.getDateTime(_vm.question.noticeTime)) + " ")
                ]) : _vm._e(),
                _vm.question.messageContent ? _c('div', {
                    staticClass: "aside-header-title"
                }, [
                    _vm._v(" " + _vm._s(_vm.question.messageContent) + " ")
                ]) : _vm._e(),
                _vm.question.questionName ? _c('div', {
                    staticClass: "aside-header-title"
                }, [
                    _vm.question.score || _vm.question.questionScore ? _c('span', [
                        _vm._v(" [" + _vm._s(Math.abs(_vm.question.score || _vm.question.questionScore)) + "分] ")
                    ]) : _vm._e(),
                    _vm._v(" " + _vm._s(_vm.question.questionName) + " ")
                ]) : _vm._e(),
                _vm.question.passNot ? _c('div', {
                    staticClass: "tag-area mb24 question-result mt10"
                }, [
                    _c('div', {
                        class: 'vmd ellipsis passNot passNot-' + _vm.question.passNot,
                        attrs: {
                            "title": _vm.question.optionName || [
                                '合格',
                                '不合格',
                                '不适用'
                            ][_vm.question.passNot]
                        }
                    }, [
                        _vm._v(" " + _vm._s(_vm.question.optionName || [
                            "合格",
                            "不合格",
                            "不适用"
                        ][_vm.question.passNot]) + " ")
                    ]),
                    _c('div', {
                        directives: [
                            {
                                name: "show",
                                rawName: "v-show",
                                value: _vm.question.passNot !== 2,
                                expression: "question.passNot !== 2"
                            }
                        ],
                        staticClass: "scoreChange vmd ml0"
                    }, [
                        _vm._v(" " + _vm._s(_vm.displayScore) + " ")
                    ]),
                    _vm.question.passNot !== 0 ? [
                        _vm.question.passNot === 1 && _vm.question.scoreType == 2 || !_vm.forbiddenOverRedLine && _vm.question.overRedLine ? _c('div', {
                            staticClass: "over-red-line vmd ml12"
                        }, [
                            _c('i', {
                                staticClass: "iconfont icon-redwire",
                                staticStyle: {
                                    "color": "#fa3239"
                                }
                            }),
                            _c('span', [
                                _vm._v("触犯" + _vm._s(_vm.questionTypeNameMap[2]))
                            ])
                        ]) : _vm._e(),
                        _vm.question.passNot === 1 && _vm.question.scoreType == 1 ? _c('div', {
                            staticClass: "over-red-line vmd ml12"
                        }, [
                            _c('i', {
                                staticClass: "iconfont icon-caution",
                                staticStyle: {
                                    "color": "#fa3239"
                                }
                            }),
                            _c('span', [
                                _vm._v(_vm._s(_vm.questionTypeNameMap[1]))
                            ])
                        ]) : _vm._e()
                    ] : _vm._e()
                ], 2) : _vm._e(),
                _vm.question.questionInfoList && _vm.question.questionInfoList.length > 1 && _vm.showMoreQuestion ? _c('div', {
                    staticClass: "spot-area"
                }, [
                    _c('el-popover', {
                        attrs: {
                            "placement": "bottom",
                            "width": "200",
                            "trigger": "hover"
                        }
                    }, [
                        _vm._l(_vm.question.questionInfoList, function(item, index) {
                            return _c('p', {
                                directives: [
                                    {
                                        name: "show",
                                        rawName: "v-show",
                                        value: index > 0,
                                        expression: "index > 0"
                                    }
                                ],
                                key: item.questionId + index,
                                staticClass: "spot-area-item"
                            }, [
                                _vm._v(" " + _vm._s(index + 1) + ". " + _vm._s(item.questionName) + " ")
                            ]);
                        }),
                        _c('el-button', {
                            attrs: {
                                "slot": "reference",
                                "type": "link"
                            },
                            slot: "reference"
                        }, [
                            _vm._v(" 查看全部问题 ")
                        ])
                    ], 2)
                ], 1) : _vm._e()
            ]),
            _c('div', {
                staticClass: "aside-area"
            }, [
                _vm.question.lastPatrolPersonName ? _c('div', {
                    staticClass: "aside-area-item"
                }, [
                    _c('span', {
                        staticClass: "item-title"
                    }, [
                        _vm._v("巡查人")
                    ]),
                    _c('span', {
                        staticClass: "item-value"
                    }, [
                        _vm._v(" " + _vm._s(_vm.question.lastPatrolPersonName || "--") + " ")
                    ])
                ]) : _vm._e(),
                _vm.question.storeName ? _c('div', {
                    staticClass: "aside-area-item"
                }, [
                    _c('span', {
                        staticClass: "item-title"
                    }, [
                        _vm._v(_vm._s(_vm.applicationSceneName) + "名称")
                    ]),
                    _c('span', {
                        staticClass: "item-value"
                    }, [
                        _vm._v(_vm._s(_vm.question.storeName || "--"))
                    ])
                ]) : _vm._e(),
                _vm.question.pathName ? _c('div', {
                    staticClass: "aside-area-item"
                }, [
                    _c('span', {
                        staticClass: "item-title"
                    }, [
                        _vm._v("组织信息")
                    ]),
                    _c('span', {
                        staticClass: "item-value"
                    }, [
                        _vm._v(_vm._s(_vm.question.pathName || "--"))
                    ])
                ]) : _vm._e(),
                _vm.channelInfo.channelName ? _c('div', {
                    staticClass: "aside-area-item"
                }, [
                    _c('span', {
                        staticClass: "item-title"
                    }, [
                        _vm._v("通道名称")
                    ]),
                    _c('span', {
                        staticClass: "item-value"
                    }, [
                        _vm._v(" " + _vm._s(_vm.channelInfo.channelName || '--') + " ")
                    ])
                ]) : _vm._e(),
                _vm.pic.localClassTime || _vm.pic.captureTime ? _c('div', {
                    staticClass: "aside-area-item"
                }, [
                    _c('span', {
                        staticClass: "item-title"
                    }, [
                        _vm._v("抓图/传图时间")
                    ]),
                    _c('span', {
                        staticClass: "item-value"
                    }, [
                        _vm._v(" " + _vm._s(_vm.pic.localClassTime || _vm.getDateTime(_vm.pic.captureTime)) + " ")
                    ])
                ]) : _vm._e()
            ]),
            _vm.channelInfo.channelId || _vm.showEvalBtn ? _c('div', {
                staticClass: "aside-opear"
            }, [
                _vm.channelInfo.channelId ? _c('el-button', {
                    staticClass: "chain-local-btn local-btn-icon-container",
                    attrs: {
                        "type": "default"
                    },
                    on: {
                        "click": _vm.watchVideo
                    }
                }, [
                    _c('span', {
                        staticClass: "local-btn-icon icon iconfont iconvideo"
                    }),
                    _vm._v(" 查看录像 ")
                ]) : _vm._e(),
                _vm.showEvalBtn ? _c('el-button', {
                    staticClass: "chain-local-btn local-btn-icon-container",
                    attrs: {
                        "type": "default"
                    },
                    on: {
                        "click": _vm.goEval
                    }
                }, [
                    _c('span', {
                        staticClass: "h-icon-details local-btn-icon"
                    }),
                    _vm._v(" " + _vm._s(_vm.evalText) + " ")
                ]) : _vm._e()
            ], 1) : _vm._e(),
            _vm.pic.pictureRemark || _vm.pic.remark ? _c('div', {
                staticClass: "result-comment"
            }, [
                _c('p', {
                    staticClass: "title"
                }, [
                    _c('img', {
                        attrs: {
                            "src": img$1,
                            "alt": ""
                        }
                    }),
                    _vm._v(" 识别结果 ")
                ]),
                _c('div', {
                    staticClass: "content"
                }, [
                    _vm._v(" " + _vm._s(_vm.pic.pictureRemark || _vm.pic.remark) + " ")
                ])
            ]) : _vm._e(),
            !(_vm.pic.pictureRemark || _vm.pic.remark) && _vm.question.questionComment ? _c('div', {
                staticClass: "remark-comment"
            }, [
                _c('p', {
                    staticClass: "title"
                }, [
                    _c('img', {
                        attrs: {
                            "src": img,
                            "alt": ""
                        }
                    }),
                    _c('span', {
                        staticClass: "ellipsis"
                    }, [
                        _vm._v(" " + _vm._s('问题备注') + " ")
                    ])
                ]),
                _c('div', {
                    staticClass: "content",
                    domProps: {
                        "innerHTML": _vm._s(_vm.question.questionComment)
                    }
                })
            ]) : _vm._e()
        ]),
        _vm.hasChangeQuesBtn ? _c('div', {
            staticClass: "aside-footer"
        }, [
            _c('el-button', {
                staticClass: "prev chain-local-btn",
                on: {
                    "click": _vm.prev
                }
            }, [
                _vm._v(" " + _vm._s(_vm.changeQuesLeftBtnText) + " ")
            ]),
            _c('el-button', {
                staticClass: "next chain-local-btn",
                on: {
                    "click": _vm.next
                }
            }, [
                _vm._v(" " + _vm._s(_vm.changeQuesRightBtnText) + " ")
            ])
        ], 1) : _vm._e()
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
//
//
//
//
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
    name: 'HikCloudImageCanvasPanel',
    components: {
        AsidePanel: __vue_component__$1
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: '图片查看'
        },
        currentSelectIndex: {
            type: Number,
            default: 0
        },
        currentSecondSelectIndex: {
            type: Number,
            default: 0
        },
        models: {
            type: Array,
            default: ()=>[
                    'zoom',
                    'drag',
                    'text',
                    'draw',
                    'color',
                    'revert',
                    'download',
                    'clean'
                ]
        },
        data: {
            type: Object,
            default: ()=>{}
        },
        showRightAside: {
            type: Boolean,
            default: true
        },
        applicationSceneName: {
            type: String,
            default: "门店"
        },
        questionTypeNameMap: {
            type: Array,
            default: ()=>{
                return [
                    '一般问题',
                    '重要问题',
                    '红线问题'
                ];
            }
        },
        hasChangeQuesBtn: {
            type: Boolean,
            default: true
        },
        isSpot: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            maxWidth: 2000,
            maxHeight: 2000,
            viewerSize: [
                800,
                600
            ],
            imageSize: [
                600,
                350
            ],
            localCurrentSelectIndex: 0,
            localSecCurrentSelectIndex: 0
        };
    },
    computed: {
        picArr () {
            return this.data.pics;
        },
        isTwoDimensional () {
            return this.localPicArr.length > 0 && Array.isArray(this.localPicArr[0]);
        },
        localPicArr () {
            const picVideoCode = [
                0,
                1
            ];
            const _pic = [];
            this.picArr.forEach((item)=>{
                if (item.fileType === undefined || item.fileType === null) {
                    _pic.push(item);
                } else if (picVideoCode.includes(item.fileType)) {
                    _pic.push(item);
                } else ;
            });
            return _pic;
        }
    },
    watch: {
        currentSelectIndex: {
            handler (val) {
                this.localCurrentSelectIndex = val;
                this.$emit('update:currentSelectIndex', val);
            },
            immediate: true
        },
        currentSecondSelectIndex: {
            handler (val) {
                this.localSecCurrentSelectIndex = val;
                this.$emit('update:currentSecondSelectIndex', val);
            },
            immediate: true
        },
        visible: {
            handler: function(val) {
                if (val) {
                    this.getSize();
                }
            }
        }
    },
    mounted () {
        this.getSize();
        window.addEventListener('resize', this.getSize);
    },
    beforeDestroy () {
        window.removeEventListener('resize', this.getSize);
    },
    methods: {
        handleClose () {
            this.$emit('update:visible', false);
            this.$emit('close');
            this.$emit('saveGraffitiAtClose', this.picArr);
        },
        getModuleName () {
            if (this.$store && this.$store.state && this.$store.breadcrumb) {
                const _breadcrumb = this.$store.state.breadcrumb;
                if (_breadcrumb && _breadcrumb.length > 0) {
                    return _breadcrumb[_breadcrumb.length - 1];
                } else {
                    return '';
                }
            }
        },
        getSize () {
            if (this.localPicArr.length === 0) {
                this.viewerSize = [
                    480,
                    300
                ];
                return;
            }
            const calculateSize = (innerDimension, offset, maxSize)=>Math.min(innerDimension - offset, maxSize);
            const [width, height] = [
                calculateSize(window.innerWidth, 80, this.maxWidth),
                Math.round(calculateSize(window.innerHeight, 80, this.maxHeight))
            ];
            this.viewerSize = [
                width,
                height
            ];
            let imgWidth = width;
            const rightAsideWidth = 480;
            imgWidth = width - rightAsideWidth;
            let extraHeight = 56 + 40 + 88;
            this.imageSize = [
                imgWidth,
                height - extraHeight
            ];
        },
        handleOpen () {
            this.$nextTick(()=>{
                if (this.$refs.imgCanvas) {
                    this.$refs.imgCanvas.opened();
                }
            });
            if (this.sendClickMessage) {
                this.sendClickMessage({
                    lc: '9_1_1163',
                    ety: 'aac',
                    biz: {
                        a1: '进入页面',
                        a2: this.getModuleName()
                    }
                });
            }
        }
    }
};

const __vue_script__ = script;
/* template */ var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c('el-dialog', {
        attrs: {
            "top": "middle",
            "no-scrollbar": "",
            "custom-class": "hik-cloud-image-canvas-Panel",
            "title": _vm.title,
            "visible": _vm.visible,
            "close-on-click-modal": true,
            "area": _vm.viewerSize,
            "before-close": _vm.handleClose
        },
        on: {
            "open": _vm.handleOpen
        }
    }, [
        _c('div', {
            staticClass: "img-draw-viewer__content"
        }, [
            _vm.localPicArr.length ? _c('hik-cloud-image-canvas-gallery', _vm._g(_vm._b({
                ref: "imgCanvas",
                attrs: {
                    "containerShdow": false,
                    "models": _vm.models,
                    "imgList": _vm.localPicArr,
                    "storeName": _vm.data.storeName,
                    "width": _vm.imageSize[0],
                    "height": _vm.imageSize[1],
                    "selectIndex": _vm.localCurrentSelectIndex,
                    "secondSelectIndex": _vm.localSecCurrentSelectIndex,
                    "showSwitchBtn": true
                },
                on: {
                    "update:selectIndex": function($event) {
                        _vm.localCurrentSelectIndex = $event;
                    },
                    "update:select-index": function($event) {
                        _vm.localCurrentSelectIndex = $event;
                    },
                    "update:secondSelectIndex": function($event) {
                        _vm.localSecCurrentSelectIndex = $event;
                    },
                    "update:second-select-index": function($event) {
                        _vm.localSecCurrentSelectIndex = $event;
                    }
                }
            }, 'hik-cloud-image-canvas-gallery', _vm.$attrs, false), _vm.$listeners)) : _vm._e(),
            _vm.showRightAside ? _c('div', {
                staticClass: "right-aside",
                attrs: {
                    "id": "right-aside-slot"
                }
            }, [
                _vm._t("rightAside", function() {
                    return [
                        _c('aside-panel', _vm._g(_vm._b({
                            attrs: {
                                "applicationSceneName": _vm.applicationSceneName,
                                "pic": _vm.isTwoDimensional ? _vm.localPicArr[_vm.localCurrentSelectIndex][_vm.localSecCurrentSelectIndex] : _vm.localPicArr[_vm.localCurrentSelectIndex],
                                "question": _vm.data
                            }
                        }, 'aside-panel', _vm.$attrs, false), _vm.$listeners))
                    ];
                })
            ], 2) : _vm._e()
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

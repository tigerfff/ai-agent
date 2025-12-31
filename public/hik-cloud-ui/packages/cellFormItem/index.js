import { FormItem } from 'hui';

var script = {
    name: 'HikCloudCellFormItem',
    extends: FormItem,
    props: {
        ...FormItem.props,
        span: {
            type: Number,
            default: 1
        }
    },
    computed: {
        index () {
            return this.owner.fields.indexOf(this);
        },
        /** 单元格是否位于第一行 */ isFirstLine () {
            const fields = this.owner.fields;
            let totalSpan = 0;
            for(let i = 0; i <= this.index; i++){
                totalSpan += fields[i].span;
                if (totalSpan > this.owner.rowItemNum) return false;
            }
            return true;
        },
        /** 单元格是否位于该行的第一项 */ isFirstOfLine () {
            const fields = this.owner.fields;
            let index = 0;
            let totalSpan = 0;
            for(let i = 0; i <= this.index; i++){
                totalSpan += fields[i].span;
                if (totalSpan > this.owner.rowItemNum) {
                    totalSpan = fields[i].span;
                    index = 1;
                } else {
                    index++;
                }
            }
            return index === 1;
        },
        borderStyle () {
            return '1px solid rgba(228, 228, 228, 1)';
        },
        owner () {
            let parent = this.$parent;
            while(parent && !parent.cellFormId){
                parent = parent.$parent;
            }
            return parent;
        },
        itemStyle () {
            const ret = {
                width: `${this.span / this.owner.rowItemNum * 100}%`,
                display: 'flex',
                borderBottom: this.borderStyle,
                marginBottom: 0
            };
            /** 第一排单元格需要增加顶部边框 */ if (this.isFirstLine) ret.borderTop = this.borderStyle;
            /** 每行第一个单元格需要增加左侧边框 */ if (this.isFirstOfLine) ret.borderLeft = this.borderStyle;
            const defaultGutter = 20; // 默认间距为20px
            if (!this.form.gutter) return ret;
            ret.marginBottom = this.validateState !== 'error' ? `${this.form.gutter}px` : `${this.form.gutter - defaultGutter}px`;
            return ret;
        },
        labelStyle () {
            const ret = {
                width: '100px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(249, 249, 249, 1)',
                textAlign: 'left',
                padding: '0 12px'
            };
            return ret;
        },
        contentStyle () {
            const ret = {
                flex: '1',
                height: '45px',
                lineHeight: '45px',
                padding: '0 12px',
                borderLeft: this.borderStyle,
                borderRight: this.borderStyle,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            };
            // 设置栅格布局，content-width 将失效
            if (this.form.gridLayout) return ret;
            const label = this.label;
            const contentWidth = this.contentWidth || this.form.contentWidth;
            if (contentWidth) {
                ret.width = contentWidth;
            }
            if (this.form.labelPosition === 'top' || this.form.inline) return ret;
            if (!label && !this.labelWidth && this.isNested) return ret;
            const labelWidth = this.labelWidth || this.form.labelWidth;
            if (labelWidth) {
                ret.marginLeft = labelWidth;
            }
            return ret;
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
/* template */ /* style */ const __vue_inject_styles__ = undefined;
/* style inject */ /* style inject SSR */ /* style inject shadow dom */ const __vue_component__ = /*#__PURE__*/ normalizeComponent({}, __vue_inject_styles__, __vue_script__);

/* istanbul ignore next */ __vue_component__.install = function(Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
};

export { __vue_component__ as default };

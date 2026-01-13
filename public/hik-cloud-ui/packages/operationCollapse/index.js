var script = {
    name: 'HikCloudOperationCollapse',
    inheritAttrs: false,
    props: {
        maxVisibleNum: {
            type: Number,
            default: 4
        }
    },
    methods: {
        // 负责把用户传入的 default scoped slot 内容，转换成“最多 4 个按钮，多余收起到更多”的结构
        renderOperations (h, scope) {
            let children = this.$scopedSlots.default(scope) || [];
            if (!Array.isArray(children)) {
                children = [
                    children
                ];
            }
            // 只保留有效 vnode（过滤空白文本等）
            const nodes = children.filter((v)=>!!v && (v.tag || v.text && v.text.trim() !== ''));
            // 不超过 4 个，直接原样渲染
            if (nodes.length <= this.maxVisibleNum) {
                return h('div', {
                    class: 'hik-cloud-operation-collapse'
                }, nodes);
            }
            // 超过 4 个：前 3 个直接展示，第 4 个是“更多”，其余在下拉中
            const directButtons = nodes.slice(0, this.maxVisibleNum - 1); // 0,1,2
            const moreNodes = nodes.slice(this.maxVisibleNum - 1); // 从第 4 个开始
            const dropdown = h('el-dropdown', {
                class: 'hik-cloud-operation-collapse__more',
                props: {
                    trigger: 'click',
                    placement: 'bottom'
                }
            }, [
                // 触发按钮
                h('el-button', {
                    class: 'hik-cloud-operation-collapse__more--trigger',
                    props: {
                        type: 'default',
                        icon: 'h-icon-more_hori'
                    }
                }),
                // 下拉菜单
                h('el-dropdown-menu', {
                    slot: 'dropdown',
                    class: 'hik-cloud-operation-collapse__dropdown-menu'
                }, moreNodes.map((node, index)=>this.renderDropdownItem(h, node, index)))
            ]);
            return h('div', {
                class: 'hik-cloud-operation-collapse'
            }, [
                ...directButtons,
                dropdown
            ]);
        },
        // 下拉项的渲染：按钮则提取 icon + 文本平铺；其它组件保持原样
        renderDropdownItem (h, node, index) {
            const clickHandler = this.extractClickHandler(node);
            const nativeOn = clickHandler ? {
                click: (event)=>{
                    event.stopPropagation();
                    clickHandler(event);
                }
            } : {};
            // 判断是否为 el-button
            const isElButton = node && node.componentOptions && (node.componentOptions.Ctor && node.componentOptions.Ctor.options && node.componentOptions.Ctor.options.name === 'ElButton' || node.componentOptions.tag === 'el-button');
            if (isElButton) {
                const propsData = node.componentOptions.propsData || {};
                const iconClass = propsData.icon;
                const text = this.extractText(node.componentOptions.children || node.children || []);
                const content = [];
                if (iconClass) content.push(h('i', {
                    class: `${iconClass} hik-cloud-operation-collapse__more--item-icon`,
                    style: {
                        marginRight: text ? '4px' : 0
                    }
                }));
                if (text) content.push(text);
                return h('el-dropdown-item', {
                    key: index,
                    class: "hik-cloud-operation-collapse__dropdown-item",
                    nativeOn
                }, content.length ? content : [
                    node
                ]); // 如果没有文本，fallback 原节点
            }
            // 其它组件：保持原 vnode，但让整个 item 可点击触发
            return h('el-dropdown-item', {
                key: index,
                class: "hik-cloud-operation-collapse__dropdown-item",
                nativeOn
            }, [
                node
            ]);
        },
        // 提取表格列子组件（仅针对按钮组件）的文字
        extractText (children) {
            if (!Array.isArray(children)) return '';
            return children.map((c)=>{
                if (!c) return '';
                if (c.text) return c.text.trim();
                if (Array.isArray(c.children)) return this.extractText(c.children);
                return '';
            }).filter(Boolean).join('');
        },
        // 提取表格列子组件的点击事件
        extractClickHandler (node) {
            if (!node) return null;
            const on = node.data && node.data.on || node.componentOptions && node.componentOptions.listeners || {};
            const handler = on.click || on['click.native'];
            if (!handler) return null;
            if (Array.isArray(handler)) {
                return (...args)=>handler.forEach((fn)=>fn && fn(...args));
            }
            return (...args)=>handler(...args);
        }
    },
    render (h) {
        return h('el-table-column', {
            attrs: this.$attrs,
            on: this.$listeners,
            scopedSlots: {
                default: (scope)=>{
                    if (!this.$scopedSlots.default) return null;
                    return this.renderOperations(h, scope, this.$scopedSlots.default);
                }
            }
        });
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

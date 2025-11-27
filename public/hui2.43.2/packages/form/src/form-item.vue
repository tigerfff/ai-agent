<script>
import AsyncValidator from 'async-validator';
import emitter from 'hui/src/mixins/emitter';
import ElTooltip from 'hui/packages/tooltip';
import ElCol from 'hui/packages/col';
import {
  noop,
  getPropByPath,
  findComponentsDownward
} from 'hui/src/utils/util';

export default {
  name: 'ElFormItem',

  componentName: 'ElFormItem',

  inject: ['elForm'],

  components: {
    ElTooltip,
    ElCol
  },

  mixins: [emitter],
  props: {
    label: {
      type: String,
      default: ''
    },
    labelWidth: {
      type: String,
      default: null
    },
    prop: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: undefined
    },
    // 必填选项显示在文字右侧
    requiredRight: {
      type: Boolean
    },
    rules: {
      type: [Object, Array],
      default: null
    },
    error: {
      type: String,
      default: null
    },
    validateStatus: {
      type: String,
      default: null
    },
    showMessage: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    },
    descriptionRender: {
      type: Function,
      default: null
    },
    // 内容区域宽度(会覆盖父组件的 contentWidth)
    contentWidth: {
      type: String,
      default: null
    },
    introduction: {
      type: String,
      default: ''
    },
    introductionIcon: {
      type: String,
      default: 'h-icon-info'
    },
    introductionPlacement: {
      type: String,
      default: 'bottom'
    },
    introductionClass: {
      type: String,
      default: ''
    },
    itemGroup: {
      type: Boolean,
      default: false
    },
    labelGrid: {
      type: Object,
      default: null
    },
    contentGrid: {
      type: Object,
      default: null
    },
    // 标签过长是否显示省略号
    labelOverflowTitle: {
      type: Boolean,
      default: true
    },
    // 禁用时，将不再显示必填标识
    disabled: {
      type: Boolean,
      default: false
    },
    beforeValidate: {
      type: Function,
      default: null
    },

    showEllipsis: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      validateState: '',
      validateMessage: '',
      validateDisabled: false,
      validator: {},
      // 标签过长时显示的title
      labelTitle: ''
    };
  },
  computed: {
    // 表单项 style 样式
    itemStyle() {
      const ret = {};
      const defaultGutter = 20; // 默认间距为20px
      if (!this.form.gutter) return ret;
      ret.marginBottom =
        this.validateState !== 'error'
          ? `${this.form.gutter}px`
          : `${this.form.gutter - defaultGutter}px`;
      return ret;
    },
    labelStyle() {
      const ret = {};
      // 设置标签在上方或者栅格布局，label-width 将失效
      if (this.form.labelPosition === 'top' || this.form.gridLayout) return ret;
      const labelWidth = this.labelWidth || this.form.labelWidth;
      if (labelWidth) {
        ret.width = labelWidth;
      }
      return ret;
    },
    labelTextStyle() {
      const ret = {};
      let width = 0;
      // 表单项必填时，高亮红星占9px
      if (this.isRequired() || this.required || this.requiredRight) width += 9;
      // 有介绍信息时，图标占26px
      if (this.introduction) width += 26;
      if (width) ret.maxWidth = `calc(100% - ${width}px)`;
      return ret;
    },
    contentStyle() {
      const ret = {};
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
    },
    // 错误信息的样式
    errorStyle() {
      const ret = {};
      const labelWidth = this.labelWidth || this.form.labelWidth;
      const contentWidth = this.contentWidth || this.form.contentWidth;
      const label = this.label;
      // 判断错误信息出现在底部还是右侧
      if (this.form.messagePosition === 'right') {
        ret.position = 'absolute';
        if (!label && !this.labelWidth && this.isNested) {
          ret.left = parseInt(contentWidth, 10) + 8 + 'px';
        } else {
          ret.left =
            parseInt(labelWidth, 10) + parseInt(contentWidth, 10) + 8 + 'px';
        }
        // 错误信息出现在右侧时，top值设置6px
        ret.top = '6px';
      } else {
        // if (!label && !this.labelWidth && this.isNested) {
        //   ret.left = '0';
        // } else {
        //   ret.left = labelWidth;
        // }
      }
      return ret;
    },
    _labelGrid() {
      return this.labelGrid || this.form.labelGrid;
    },
    _contentGrid() {
      return this.contentGrid || this.form.contentGrid;
    },
    _labelOverflowTitle() {
      if (!this.labelOverflowTitle) return false;
      return this.form.labelOverflowTitle;
    },
    // 是否是嵌套的item
    isNested() {
      let parent = this.$parent;
      let parentName = parent.$options.componentName;
      while (parentName !== 'ElFormItem') {
        parent = parent.$parent;
        if (!parent || !parent.$options) break;
        parentName = parent.$options.componentName;
      }
      if (parentName === 'ElFormItem') return true;
      else return false;
    },
    form() {
      let parent = this.$parent;
      let parentName = parent.$options.componentName;
      while (parentName !== 'ElForm') {
        parent = parent.$parent;
        parentName = parent.$options.componentName;
      }
      return parent;
    },
    fieldValue: {
      cache: false,
      get() {
        var model = this.form.model;
        if (!model || !this.prop) {
          return;
        }

        var path = this.prop;
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.');
        }

        return getPropByPath(model, path, true).v;
      }
    }
  },
  watch: {
    error(value) {
      this.validateMessage = value;
      this.validateState = value ? 'error' : '';
    },
    validateStatus(value) {
      this.validateState = value;
    }
  },
  mounted() {
    if (this.prop) {
      this.dispatch('ElForm', 'el.form.addField', [this]);

      let initialValue = this.fieldValue;
      if (Array.isArray(initialValue)) {
        initialValue = [].concat(initialValue);
      }
      Object.defineProperty(this, 'initialValue', {
        value: initialValue
      });
      this.setItemRule();
    }
  },
  beforeDestroy() {
    this.dispatch('ElForm', 'el.form.removeField', [this]);
  },
  methods: {
    isRequired() {
      const rules = this.getRules();
      let isRequired = false;

      if (rules && rules.length) {
        rules.every(rule => {
          if (rule.required) {
            isRequired = true;
            return false;
          }
          return true;
        });
      }
      return isRequired;
    },
    focusField() {
      const elInput = findComponentsDownward(this, 'ElInput')[0];
      if (elInput) {
        elInput.$el.querySelector('input') &&
          elInput.$el.querySelector('input').focus();
        elInput.$el.querySelector('textarea') &&
          elInput.$el.querySelector('textarea').focus();
      }
    },
    validate(trigger, callback = noop) {
      this.validateDisabled = false;
      var rules = this.getFilteredRule(trigger);
      if ((!rules || rules.length === 0) && this.required === undefined) {
        callback();
        return true;
      }

      const todo = () => {
        this.validateState = 'validating';

        var descriptor = {};
        descriptor[this.prop] = rules;

        var validator = new AsyncValidator(descriptor);
        var model = {};

        // 获取所有字段的值
        for (const field of this.form.fields) {
          model[field.prop] = field.fieldValue;
        }

        validator.validate(
          model,
          { firstFields: true },
          (errors, invalidFields) => {
            this.validateState = !errors ? 'success' : 'error';
            this.validateMessage = errors ? errors[0].message : '';
            callback(this.validateMessage, invalidFields);
            this.elForm && this.elForm.$emit('validate', this.prop, !errors);
          }
        );
      };

      if (this.beforeValidate) {
        let result = this.beforeValidate(this.fieldValue, rules);
        if (result === false) return;
        if (result === undefined) result = true;
        Promise.resolve(result).then(allowed => {
          if (allowed) {
            todo();
          }
        });
      } else {
        todo();
      }
    },
    resetField(isEmpty = false) {
      this.validateState = '';
      this.validateMessage = '';

      const model = this.form.model;
      const value = this.fieldValue;
      let path = this.prop;
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.');
      }

      const prop = getPropByPath(model, path, true, path.indexOf('.') > -1);

      if (Array.isArray(value)) {
        this.validateDisabled = true;
        prop.o[prop.k] = isEmpty ? [] : [].concat(this.initialValue);
      } else {
        this.validateDisabled = true;
        prop.o[prop.k] = isEmpty ? '' : this.initialValue;
      }
    },
    resetValidate(isResetRule = false) {
      this.validateState = '';
      this.validateMessage = '';
      this.validateDisabled = false;

      isResetRule && this.setItemRule();
    },
    getRules() {
      var formRules = this.form.rules;
      var selfRules = this.rules;
      var requiredRule =
        this.required !== undefined ? { required: !!this.required } : [];
      formRules = formRules ? formRules[this.prop] : [];
      return [].concat(selfRules || formRules || []).concat(requiredRule);
    },
    getFilteredRule(trigger) {
      var rules = this.getRules();

      return rules.filter(rule => {
        return !rule.trigger || rule.trigger.indexOf(trigger) !== -1;
      });
    },
    onFieldBlur() {
      this.$nextTick(() => {
        this.validate('blur');
      });
    },
    onFieldChange() {
      if (this.validateDisabled) {
        this.validateDisabled = false;
        return;
      }
      this.$nextTick(() => {
        this.validate('change');
      });
    },
    hoverLabel() {
      const t = this.$refs.formLabelText;
      this.labelTitle = t.clientWidth <= t.scrollWidth ? t.innerText : '';
    },
    /**
     * @desc 获取 content 的断点
     * @param {String} grid 断点值，如xs、sm、md、lg、xl
     */
    getContentGrid(grid) {
      if (!this._contentGrid[grid]) return;
      const result =
        typeof this._contentGrid[grid] === 'number'
          ? { span: this._contentGrid[grid], offset: this._labelGrid[grid] }
          : this._contentGrid[grid];
      return result;
    },

    setItemRule() {
      const rules = this.getRules();

      if (rules.length || this.required !== undefined) {
        this.$off('el.form.blur', this.onFieldBlur);
        this.$off('el.form.change', this.onFieldChange);
        this.$on('el.form.blur', this.onFieldBlur);
        this.$on('el.form.change', this.onFieldChange);
      }
    }
  },

  render(h) {
    const labelCls = {
      'el-form-item__label': true,
      'text-wrap': !this._labelOverflowTitle // 若设置文字超长不显示省略号
    };
    // 表格标签：label
    let labelElm = (
      <label
        for={this.prop}
        class={labelCls}
        style={this.labelStyle}
        onMouseenter={this.hoverLabel}
      >
        <i class='el-form-item__required'>*</i>
        <span
          ref='formLabelText'
          class='el-form-item__label-text'
          title={this.labelTitle}
          style={this.labelTextStyle}
        >
          {this.$slots.label || this.label + this.form.labelSuffix}
        </span>
        <i class='el-form-item__required-right'>*</i>
      </label>
    );

    // 介绍文字
    const introElm = (
      <el-tooltip
        content={this.$slots.introduction ? '' : this.introduction}
        placement={this.introductionPlacement}
        popper-class={this.introductionClass}
      >
        <template slot='content'>{this.$slots.introduction}</template>
        <i class={['el-form-item__introduction', this.introductionIcon]} />
      </el-tooltip>
    );
    if (this.introduction !== '' || this.$slots.introduction) {
      this.form.labelPosition === 'top'
        ? labelElm.children.push(introElm)
        : labelElm.children.splice(0, 0, introElm);
    }

    // 表格内容：content
    let contentElm = (
      <div class='el-form-item__content' style={this.contentStyle}>
        {this.$slots.default}
      </div>
    );

    const errorCls = {
      'el-form-item__error': true,
      'el-form-item__ellipsis': this.showEllipsis
    };
    // 错误信息
    const errorElm = (
      <transition name='form-error-zoom'>
        <div
          title={this.showEllipsis ? this.validateMessage : ''}
          class={errorCls}
          style={this.errorStyle}
        >
          {this.validateMessage}
        </div>
      </transition>
    );
    if (
      this.validateState === 'error' &&
      this.showMessage &&
      this.form.showMessage
    ) {
      contentElm.children.push(errorElm);
    }

    // 描述信息
    const descElm = <div class='el-form-item__description' />;
    if (this.description !== '') {
      descElm.children = [<span>{this.description}</span>];
      contentElm.children.push(descElm);
    }
    if (this.descriptionRender) {
      descElm.children = [this.descriptionRender.call(this._renderProxy, h)];
      contentElm.children.push(descElm);
    }

    // 使用栅格布局
    if (this.form.gridLayout) {
      labelElm = (
        <el-col
          xs={this._labelGrid.xs}
          sm={this._labelGrid.sm}
          md={this._labelGrid.md}
          lg={this._labelGrid.lg}
          xl={this._labelGrid.xl}
        >
          {labelElm}
        </el-col>
      );
      // 没有 label，则内容进行偏移
      contentElm =
        this.$slots.label || this.label ? (
          <el-col
            xs={this._contentGrid.xs}
            sm={this._contentGrid.sm}
            md={this._contentGrid.md}
            lg={this._contentGrid.lg}
            xl={this._contentGrid.xl}
          >
            {contentElm}
          </el-col>
        ) : (
          <el-col
            xs={this.getContentGrid('xs')}
            sm={this.getContentGrid('sm')}
            md={this.getContentGrid('md')}
            lg={this.getContentGrid('lg')}
            xl={this.getContentGrid('xl')}
          >
            {contentElm}
          </el-col>
        );
    }

    const cls = {
      'el-form-item': true,
      'is-item-group': this.itemGroup,
      'is-error': this.validateState === 'error',
      'is-show-error-message':
        this.validateState === 'error' &&
        this.form.showMessage &&
        this.showMessage,
      'is-validating': this.validateState === 'validating',
      'is-required':
        (this.isRequired() || this.required) &&
        // 后续默认定规定位置，考虑把requiredRight属性移除
        !this.requiredRight &&
        this.form.labelPosition !== 'top' &&
        !this.disabled,
      'is-required-right':
        (this.isRequired() || this.required) &&
        (this.requiredRight || this.form.labelPosition === 'top') &&
        !this.disabled,
      'has-introduction': this.introduction !== '',
      'has-description': this.description !== '' || this.descriptionRender
    };

    return this.label || this.$slots.label ? (
      <div class={cls} style={this.itemStyle}>
        {labelElm}
        {contentElm}
      </div>
    ) : (
      <div class={cls} style={this.itemStyle}>
        {contentElm}
      </div>
    );
  }
};
</script>

<template>
  <form
    :class="[
      gridLayout ? 'el-form--grid-layout' : '',
      labelPosition ? 'el-form--label-' + labelPosition : '',
      messagePosition !== 'bottom' ? 'el-form--error-' + messagePosition : '',
      textForm ? 'text-form' : '',
      { 'el-form--inline': inline }
    ]"
    class="el-form"
  >
    <slot />
  </form>
</template>
<script>
import objectAssign from 'hui/src/utils/merge';
export default {
  name: 'ElForm',

  componentName: 'ElForm',

  provide() {
    return {
      elForm: this
    };
  },

  props: {
    model: {
      type: Object,
      default: null
    },
    rules: {
      type: Object,
      default: null
    },
    labelPosition: {
      type: String,
      default: null
    },
    labelWidth: {
      type: String,
      default: null
    },
    labelSuffix: {
      type: String,
      default: ''
    },
    inline: {
      type: Boolean,
      default: null
    },
    showMessage: {
      type: Boolean,
      default: true
    },
    // 内容区域宽度
    contentWidth: {
      type: String,
      default: null
    },
    // 错误提示的位置(bottom/right)
    messagePosition: {
      type: String,
      default: 'bottom'
    },
    // 标签和内容栅格布局
    gridLayout: {
      type: Boolean,
      default: null
    },
    labelGrid: {
      type: Object,
      default() {
        return {};
      }
    },
    contentGrid: {
      type: Object,
      default() {
        return {};
      }
    },
    // 标签过长是否显示省略号
    labelOverflowTitle: {
      type: Boolean,
      default: true
    },
    gutter: {
      type: Number,
      default: null
    },
    textForm: {
      type: Boolean,
      default: null
    },
    // rules 变化时是否进行校验
    validateOnRuleChange: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fields: []
    };
  },
  watch: {
    rules() {
      if (this.validateOnRuleChange) {
        this.validate(() => {});
      }
    }
  },
  created() {
    this.$on('el.form.addField', field => {
      if (field) {
        this.fields.push(field);
      }
    });
    /* istanbul ignore next */
    this.$on('el.form.removeField', field => {
      if (field.prop) {
        this.fields.splice(this.fields.indexOf(field), 1);
      }
    });
  },
  methods: {
    focusFirstField() {
      for (const field of this.fields) {
        if (field.validateState === 'error') {
          field.focusField();
          break;
        }
      }
    },
    resetFields(isEmpty = false) {
      if (!this.model) {
        process.env.NODE_ENV !== 'production' &&
          // eslint-disable-next-line
          console.warn(
            '[HUI Warn][Form]model is required for resetFields to work.'
          );
        return;
      }
      for (const field of this.fields) {
        field.resetField(isEmpty);
      }
    },
    resetValidates() {
      if (!this.model) {
        process.env.NODE_ENV !== 'production' &&
          console.warn(
            '[HUI Warn][Form]model is required for resetValidates to work.'
          );
        return;
      }
      for (const field of this.fields) {
        field.resetValidate();
      }
    },
    resetValidate(prop, isResetRule = false) {
      if (!this.model) {
        process.env.NODE_ENV !== 'production' &&
          console.warn(
            '[HUI Warn][Form]model is required for resetValidates to work.'
          );
        return;
      }

      var field = this.fields.filter(field => field.prop === prop)[0];
      if (!field) {
        throw new Error('must call validateField with valid prop string!');
      }
      field.resetValidate(isResetRule);
    },
    validate(callback) {
      if (!this.model) {
        console.warn('[HUI Warn][Form]model is required for validate to work!');
        return;
      }

      let promise;
      // if no callback, return promise
      if (typeof callback !== 'function' && window.Promise) {
        promise = new window.Promise((resolve, reject) => {
          callback = function(valid) {
            valid ? resolve(valid) : reject(valid);
          };
        });
      }
      let valid = true;
      let count = 0;
      if (this.fields.length === 0 && callback) {
        callback(valid);
      }
      let invalidFields = {};
      this.fields.forEach(field => {
        field.validate('', (message, field) => {
          if (message) {
            valid = false;
          }
          invalidFields = objectAssign({}, invalidFields, field);
          if (
            typeof callback === 'function' &&
            ++count === this.fields.length
          ) {
            callback(valid, invalidFields);
          }
        });
      });
      if (promise) {
        return promise;
      }
    },
    validateField(prop, cb) {
      var field = this.fields.filter(field => field.prop === prop)[0];
      if (!field) {
        throw new Error('must call validateField with valid prop string!');
      }

      field.validate('', cb);
    }
  }
};
</script>

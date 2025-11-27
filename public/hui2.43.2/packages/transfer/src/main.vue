<template>
  <div class="el-transfer">
    <transfer-panel
      ref="leftPanel"
      v-bind="$props"
      :data="sourceData"
      :title="titles[0] || t('el.transfer.titles.0')"
      :default-checked="leftDefaultChecked"
      panel-at="left"
      @checked-change="onSourceCheckedChange"
    >
      <slot name="left-footer" />
    </transfer-panel>
    <div class="el-transfer__buttons">
      <el-button
        :disabled="leftChecked.length === 0"
        class="el-transfer__button"
        @click.native="addToRight"
      >
        <span v-if="buttonTexts[1] !== undefined">
          {{ buttonTexts[1] }}
        </span>
        <i class="h-icon-angle_right" />
      </el-button>
      <el-button
        :disabled="rightChecked.length === 0"
        class="el-transfer__button"
        @click.native="addToLeft"
      >
        <i class="h-icon-angle_left" />
        <span v-if="buttonTexts[0] !== undefined">
          {{ buttonTexts[0] }}
        </span>
      </el-button>
    </div>
    <transfer-panel
      ref="rightPanel"
      v-bind="$props"
      :data="targetData"
      :title="titles[1] || t('el.transfer.titles.1')"
      :default-checked="rightDefaultChecked"
      panel-at="right"
      @checked-change="onTargetCheckedChange"
    >
      <slot name="right-footer" />
    </transfer-panel>
  </div>
</template>

<script>
import ElButton from 'hui/packages/button';
import Emitter from 'hui/src/mixins/emitter';
import Locale from 'hui/src/mixins/locale';
import TransferPanel from './transfer-panel.vue';

export default {
  name: 'ElTransfer',

  components: {
    TransferPanel,
    ElButton
  },

  mixins: [Emitter, Locale],

  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    titles: {
      type: Array,
      default() {
        return [];
      }
    },
    buttonTexts: {
      type: Array,
      default() {
        return [];
      }
    },
    filterPlaceholder: {
      type: String,
      default: ''
    },
    filterMethod: {
      type: Function,
      default: null
    },
    leftDefaultChecked: {
      type: Array,
      default() {
        return [];
      }
    },
    rightDefaultChecked: {
      type: Array,
      default() {
        return [];
      }
    },
    renderContent: {
      type: Function,
      default: null
    },
    value: {
      type: Array,
      default() {
        return [];
      }
    },
    footerFormat: {
      type: [Object, Boolean],
      default() {
        return {};
      }
    },
    filterable: {
      type: Boolean,
      default: null
    },
    props: {
      type: Object,
      default() {
        return {
          label: 'label',
          key: 'key',
          disabled: 'disabled'
        };
      }
    },
    searchPlaceholder: {
      type: String,
      default: ''
    },
    searchMethod: {
      type: Function,
      default: null
    },
    beforeAddToRight: {
      type: Function,
      default: () => new Promise(resolve => resolve())
    },
    beforeAddToLeft: {
      type: Function,
      default: () => new Promise(resolve => resolve())
    }
  },

  data() {
    return {
      leftChecked: [],
      rightChecked: []
    };
  },

  computed: {
    sourceData() {
      return this.data.filter(
        item => this.value.indexOf(item[this.props.key]) === -1
      );
    },

    targetData() {
      return this.data.filter(
        item => this.value.indexOf(item[this.props.key]) > -1
      );
    }
  },

  watch: {
    value(val) {
      this.dispatch('ElFormItem', 'el.form.change', val);
    }
  },

  methods: {
    onSourceCheckedChange(val) {
      this.leftChecked = val;
    },

    onTargetCheckedChange(val) {
      this.rightChecked = val;
    },

    addToLeft() {
      this.beforeAddToLeft()
        .then(() => {
          const currentValue = this.value.slice();
          this.rightChecked.forEach(item => {
            const index = currentValue.indexOf(item);
            if (index > -1) {
              currentValue.splice(index, 1);
            }
          });
          this.$emit('input', currentValue);
          this.$emit('change', currentValue, 'left', this.rightChecked);
        })
        .catch(() => {});
    },

    addToRight() {
      this.beforeAddToRight()
        .then(() => {
          let currentValue = this.value.slice();
          this.leftChecked.forEach(item => {
            if (this.value.indexOf(item) === -1) {
              currentValue = currentValue.concat(item);
            }
          });
          this.$emit('input', currentValue);
          this.$emit('change', currentValue, 'right', this.leftChecked);
        })
        .catch(() => {});
    },

    clearQuery(which) {
      if (which === 'left') {
        this.$refs.leftPanel.query = '';
      } else if (which === 'right') {
        this.$refs.rightPanel.query = '';
      } else if (which === undefined) {
        this.$refs.leftPanel.query = '';
        this.$refs.rightPanel.query = '';
      }
    }
  }
};
</script>

import i18n from 'hui/src/locale';

export default {
  computed: {
    showPrompt() {
      // 如果存在没有赋值的情况，则调过这个步骤，相关issues：831
      // 处理issues:1432,1554问题。初始化的时候value不一定有值，如果判断value和value.length；初始化的时候不执行customValidation
      if (
        typeof this.customValidation === 'function' &&
        ((this.minDate && this.maxDate) ||
          (this.value && this.value.length > 0))
      )
        return this.customValidation(this.calcMinDate, this.calcMaxDate);

      return true;
    },
    prompt() {
      if (this.showAbnormalInfo) {
        return i18n.t('el.datepicker.abnormalInfo');
      }
      return this.customPrompt;
    },
    disabledConfirm() {
      if (this.showAbnormalInfo || !this.showPrompt) {
        return true;
      }
      return !(
        this.leftDate &&
        this.rightDate &&
        !this.selecting &&
        this.isValidValue([this.leftDate, this.rightDate])
      );
    },
    isUnlinkRange() {
      if (!this.unlink) {
        return false;
      }
      return this.unlinkRange;
    }
  },
  methods: {
    emitRange({ newDate, opts }) {
      if (this.unlinkRange) {
        if (this.tableType === 'min') {
          if (
            newDate < this.maxDate ||
            (this.minDate === null && this.maxDate === null) ||
            this.unlinkRange
          ) {
            this.$emit(
              'pick',
              { minDate: newDate, maxDate: this.maxDate },
              opts
            );
          } else {
            this.$emit('pick', { minDate: null, maxDate: this.maxDate }, opts);
          }
        } else {
          if (
            newDate > this.minDate ||
            (this.minDate === null && this.maxDate === null) ||
            this.unlinkRange
          ) {
            this.$emit(
              'pick',
              { minDate: this.minDate, maxDate: newDate },
              opts
            );
          } else {
            this.$emit('pick', { minDate: this.minDate, maxDate: null }, opts);
          }
        }
      } else {
        if (!this.rangeState.selecting) {
          this.$emit('pick', { minDate: newDate, maxDate: null }, opts);
          this.rangeState.selecting = true;
        } else {
          if (newDate >= this.minDate) {
            this.$emit(
              'pick',
              { minDate: this.minDate, maxDate: newDate },
              opts
            );
          } else {
            this.$emit(
              'pick',
              { minDate: newDate, maxDate: this.minDate },
              opts
            );
          }
          this.rangeState.selecting = false;
        }
      }
    }
  },
  data() {
    return {
      customValidation: () => true,
      customPrompt: i18n.t('el.datepicker.abnormalInfo')
    };
  }
};

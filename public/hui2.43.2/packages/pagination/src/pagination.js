import Pager from './pager.vue';
import ElSelect from 'hui/packages/select';
import ElOption from 'hui/packages/option';
import ElButton from 'hui/packages/button';
import ElInput from 'hui/packages/input';
import Locale from 'hui/src/mixins/locale';
import throttle from 'throttle-debounce/throttle';

export default {
  name: 'ElPagination',

  props: {
    pageSize: {
      type: Number,
      default: 10
    },

    small: Boolean,

    extraSmall: Boolean,

    total: Number,

    pageCount: Number,

    pagerCount: {
      type: Number,
      validator(value) {
        return (value | 0) === value && value > 2 && value < 22;
      },
      default: 7
    },

    currentPage: {
      type: Number,
      default: 1
    },

    layout: {
      default: 'prev, pager, next, jumper, ->, total'
    },

    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 40, 50, 100];
      }
    },

    /**
     * 每页显示条目个数变化发请求前的钩子
     * add by yangzhini 2018-06-29
     * @param {Number} val    改变后的值
     * @param {Number} oldVal 改变前的值
     * @return {Boolean} 是否继续发请求
     * @example (val, oldVal) => true
     */
    beforeSizeChange: { type: Function, default: () => true },
    /**
     * 分页跳转发请求前的钩子
     * add by yangzhini 2018-06-29
     * @param {Number} val    改变后的值
     * @param {Number} oldVal 改变前的值
     * @return {Boolean} 是否继续发请求
     * @example (val, oldVal) => true
     */
    beforeCurrentChange: { type: Function, default: () => true },
    /**
     * 设置禁用
     * add by yangzhini 2018-09-06
     */
    disabled: {
      type: Boolean,
      default: false
    },
    prevText: {
      type: String,
      default: ''
    },
    nextText: {
      type: String,
      default: ''
    },
    /**
     * 每页显示条数下拉框的类名
     * add by chenguanbin 2019-05-29
     */
    sizesPopperClass: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      internalCurrentPage: 1,
      internalPageSize: 0,
      popperClass: this.sizesPopperClass
    };
  },

  render() {
    const template = <div class='el-pagination' />;
    const templateInner = <div class='el-pagination-wrapper' />;
    const layout = this.layout || '';
    if (!layout) return;
    const TEMPLATE_MAP = {
      prev: <prev />,
      jumper: <jumper />,
      pager: (
        <pager
          currentPage={this.internalCurrentPage}
          pageCount={this.internalPageCount}
          on-change={this.handleCurrentChange}
          disabled={this.disabled}
          pagerCount={this.pagerCount}
        />
      ),
      // 增加HUI的表格分页组件类型 add by zhangxiaogang 2017-09-27
      huiPager: (
        <huiPager
          currentPage={this.internalCurrentPage}
          pageCount={this.internalPageCount}
          on-goto={this.handleCurrentChange}
        />
      ),
      miniPager: <miniPager />,
      next: <next />,
      first: <first />,
      last: <last />,
      sizes: <sizes pageSizes={this.pageSizes} />,
      slot: <my-slot />,
      total: <total />
    };
    const components = layout.split(',').map(item => item.trim());
    const rightWrapper = <div class='el-pagination__rightwrapper' />;
    let haveRightWrapper = false;

    if (this.small) {
      template.data.class += ' el-pagination--small';
    }
    let tableRightPageWrapper = null;
    // 如果是表格场景的分页，外层容器追加自定义class以便样式覆盖
    if (this.isForTable) {
      template.data.class += ' el-pagination--table';
      tableRightPageWrapper = (
        <div class='el-pagination__tableRightPageWrapper' />
      );
      tableRightPageWrapper.children = tableRightPageWrapper.children || [];
    }
    const insertTarget = this.isForTable ? templateInner : template;

    // https://github.com/vuejs/babel-plugin-transform-vue-jsx/issues/123
    insertTarget.children = insertTarget.children || [];
    template.children = template.children || [];
    rightWrapper.children = rightWrapper.children || [];

    components.forEach(compo => {
      if (compo === '->') {
        haveRightWrapper = true;
      } else {
        if (
          this.isForTable &&
          ['jumper', 'huiPager', 'prev', 'pager', 'next'].indexOf(compo) > -1
        ) {
          tableRightPageWrapper.children.push(TEMPLATE_MAP[compo]);
        } else if (!haveRightWrapper) {
          insertTarget.children.push(TEMPLATE_MAP[compo]);
        } else {
          rightWrapper.children.push(TEMPLATE_MAP[compo]);
        }
      }
    });

    if (haveRightWrapper) {
      insertTarget.children.unshift(rightWrapper);
    }
    if (this.isForTable) {
      insertTarget.children.push(tableRightPageWrapper);
      template.children.push(insertTarget);
    }
    return template;
  },

  components: {
    MySlot: {
      render() {
        return this.$parent.$slots.default
          ? this.$parent.$slots.default[0]
          : '';
      }
    },
    // 跳转到第一页
    First: {
      render() {
        return (
          <button
            type='button'
            class={[
              'btn-first',
              {
                disabled:
                  this.$parent.disabled || this.$parent.internalCurrentPage <= 1
              }
            ]}
            on-click={this.$parent.first}
          >
            <i class='el-icon h-icon-angle_line_left' />
          </button>
        );
      }
    },
    // 跳转到最后一页
    Last: {
      render() {
        return (
          <button
            type='button'
            class={[
              'btn-last',
              {
                disabled:
                  this.$parent.disabled ||
                  this.$parent.internalCurrentPage ===
                    this.$parent.internalPageCount ||
                  this.$parent.internalPageCount === 0
              }
            ]}
            on-click={this.$parent.last}
          >
            <i class='el-icon h-icon-angle_line_right' />
          </button>
        );
      }
    },

    Prev: {
      render() {
        return (
          <button
            type='button'
            class={[
              'btn-prev',
              {
                disabled:
                  this.$parent.disabled || this.$parent.internalCurrentPage <= 1
              }
            ]}
            on-click={this.$parent.prev}
          >
            {this.$parent.prevText ? (
              <span>{this.$parent.prevText}</span>
            ) : (
              <i class='el-icon h-icon-angle_left' />
            )}
          </button>
        );
      }
    },

    Next: {
      render() {
        return (
          <button
            type='button'
            class={[
              'btn-next',
              {
                disabled:
                  this.$parent.disabled ||
                  this.$parent.internalCurrentPage ===
                    this.$parent.internalPageCount ||
                  this.$parent.internalPageCount === 0
              }
            ]}
            on-click={this.$parent.next}
          >
            {this.$parent.nextText ? (
              <span>{this.$parent.nextText}</span>
            ) : (
              <i class='el-icon h-icon-angle_right' />
            )}
          </button>
        );
      }
    },

    Sizes: {
      mixins: [Locale],

      props: {
        pageSizes: Array
      },

      watch: {
        pageSizes: {
          immediate: true,
          handler(value) {
            if (Array.isArray(value)) {
              this.$parent.internalPageSize =
                value.indexOf(this.$parent.pageSize) > -1
                  ? this.$parent.pageSize
                  : this.pageSizes[0];
            }
          }
        }
      },

      render() {
        const popperClass = `el-pagination__paged-select ${this.$parent.popperClass}`;
        return (
          <span class='el-pagination__sizes'>
            <el-select
              popper-class={popperClass}
              value={this.$parent.internalPageSize}
              on-input={this.handleChange}
              disabled={this.$parent.disabled}
            >
              {this.pageSizes.map(item => (
                <el-option
                  value={item}
                  label={item + ' ' + this.t('el.pagination.pagesize')}
                />
              ))}
            </el-select>
          </span>
        );
      },

      components: {
        ElSelect,
        ElOption
      },

      methods: {
        handleChange(val) {
          if (val !== this.$parent.internalPageSize) {
            const oldPageSize = this.$parent.internalPageSize;
            Promise.resolve(
              this.$parent.beforeSizeChange(val, oldPageSize)
            ).then(allowed => {
              if (allowed) {
                this.$parent.internalPageSize = val = parseInt(val, 10);
              }
            });
          }
        }
      }
    },

    Jumper: {
      mixins: [Locale],
      components: {
        ElInput
      },
      data() {
        return {
          oldValue: null,
          newValue: this.$parent.currentPage || 1
        };
      },

      watch: {
        '$parent.internalCurrentPage'(v) {
          if (v) {
            this.newValue = v;
          }
        }
      },

      methods: {
        handleFocus(event) {
          this.oldValue = +event.target.value;
        },
        handleBlur({ target }) {
          if (!target.value) {
            this.newValue = this.oldValue;
            target.value = this.oldValue;
          }
          this.reassignMaxValue(target);
          // 触发before-current-change  yangzhini  2018-12-10
          if (this.newValue !== this.$parent.internalCurrentPage) {
            this.$parent.currentChangeValid(this.newValue).then(allowed => {
              if (!allowed) {
                this.newValue = this.$parent.internalCurrentPage;
              }
            });
          }
          this.oldValue = null;
        },
        handleKeyUp(event) {
          if (event.target.value === '') return;
          const val = +event.target.value;
          // 通过拖拽输入字符, 会出现'01'的情况
          event.target.value = val;
          // if (event.keyCode === 8 && !val) return;
          const key = event.key || '';
          const keyCode = event.keyCode || '';
          const isEnter =
            (key && key === 'Enter') || (keyCode && keyCode === 13);
          if (typeof val === 'number' && !isEnter) {
            if (val > this.$parent.internalPageCount) {
              this.newValue = this.$parent.internalPageCount;
            } else if (val < 1) {
              this.newValue = 1;
            } else {
              this.newValue = val;
            }
            event.target.value = this.newValue;
            this.oldValue = this.newValue;
          } else if (!isEnter) {
            this.newValue = this.oldValue;
            event.target.value = this.oldValue;
          }
          if (isEnter) {
            this.reassignMaxValue(event.target);
            this.goto();
          }
        },
        reassignMaxValue(target) {
          if (+target.value > this.$parent.internalPageCount) {
            target.value = this.$parent.internalPageCount;
            // 页码始终应大于0  zhangxiaogang  2017-12-21
            if (this.$parent.internalPageCount === 0) target.value = 1;
          }
        },
        goto() {
          const temp = this.$parent.internalCurrentPage;
          this.handleBlur({ target: { value: temp } });
        },
        handleInput(event) {
          event.target.value = event.target.value.replace(/[^\d]/g, '');
        }
      },

      /**
       * 增加了HUI表格分页控件的相关按钮
       * modify by zhangxiaogang 2017-09-27
       */
      render() {
        return (
          <span class='el-pagination__jump'>
            {!this.$parent.isForTable && this.t('el.pagination.goto')}
            <el-input
              class='el-pagination__editor'
              min={1}
              v-model={this.newValue}
              disabled={this.$parent.disabled}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              nativeOnKeyup={this.handleKeyUp}
              nativeOnInput={this.handleInput}
            />
            {this.$parent.isForTable && (
              <span>
                /&nbsp;{this.$parent.internalPageCount || 1}
                {this.t('el.pagination.pageClassifier')}
              </span>
            )}
            {!this.$parent.isForTable && this.t('el.pagination.pageClassifier')}
            {this.$parent.isForTable && (
              <el-button on-click={this.goto}>
                {this.t('el.pagination.gotoBtn')}
              </el-button>
            )}
          </span>
        );
      }
    },

    Total: {
      mixins: [Locale],

      render() {
        return typeof this.$parent.total === 'number' ? (
          <span class='el-pagination__total'>
            {this.t('el.pagination.total', { total: this.$parent.total })}
          </span>
        ) : (
          ''
        );
      }
    },

    miniPager: {
      render() {
        return (
          <div class='el-pagination__mini-pager'>
            <div class='el-pagination__mini-pager-num'>
              {this.$parent.internalCurrentPage}
            </div>
            <div class='el-pagination__mini-pager-slash'> / </div>
            <div class='el-pagination__mini-pager-max-num'>
              {this.$parent.internalPageCount}
            </div>
          </div>
        );
      }
    },

    /**
     * 增加HUI的表格分页组件
     * add by zhangxiaogang 2017-09-27
     */
    HuiPager: {
      mixins: [Locale],

      render() {
        const vm = this;
        return this.pageCount > 1 ? (
          <ul class='el-pagination__pager'>
            <li
              class={[
                this.preDisabled ? 'is-disabled' : '',
                'h-icon-angle_line_left'
              ]}
              on-click={function() {
                vm.go('first');
              }}
            />
            <li
              class={[
                this.preDisabled ? 'is-disabled' : '',
                'h-icon-angle_left'
              ]}
              on-click={function() {
                vm.go(-1);
              }}
            />
            <li
              class={[
                this.nexDisabled ? 'is-disabled' : '',
                'h-icon-angle_right'
              ]}
              on-click={function() {
                vm.go(1);
              }}
            />
            <li
              class={[
                this.nexDisabled ? 'is-disabled' : '',
                'h-icon-angle_line_right'
              ]}
              on-click={function() {
                vm.go('last');
              }}
            />
          </ul>
        ) : (
          ''
        );
      },

      methods: {
        go(val) {
          if (this.$parent.disabled) return;
          // 如果进行暴力测试极快速点击翻页可能会导致IE下input输入框中的数字持续变化，哪怕是松开了鼠标
          throttle(100, () => {
            const { currentPage, pageCount } = this;
            if (
              (currentPage === 1 && val === -1) ||
              (currentPage === pageCount && val === 1)
            ) {
              return;
            }
            // this.$parent.internalCurrentPage = val;
            let postVal = null;
            if (val === 'first') postVal = 1;
            else if (val === 'last') postVal = pageCount;
            else postVal = currentPage + val;
            // this.$parent.internalCurrentPage = postVal;
            this.$parent.currentChangeValid(postVal);
          })();
        }
      },

      computed: {
        preDisabled() {
          return this.$parent.disabled || this.currentPage === 1;
        },
        nexDisabled() {
          return this.$parent.disabled || this.currentPage === this.pageCount;
        }
      },

      props: {
        currentPage: Number,

        pageCount: Number
      }
    },

    Pager,

    ElButton
  },

  methods: {
    handleCurrentChange(val) {
      this.currentChangeValid(val);
    },

    first() {
      if (this.disabled) return;
      this.currentChangeValid(1);
    },

    last() {
      if (this.disabled) return;
      this.currentChangeValid(this.internalPageCount);
    },

    prev() {
      if (this.disabled) return;
      const newVal = this.internalCurrentPage - 1;
      this.currentChangeValid(newVal);
    },

    next() {
      if (this.disabled) return;
      const newVal = this.internalCurrentPage + 1;
      this.currentChangeValid(newVal);
    },

    currentChangeValid(val) {
      return Promise.resolve(
        this.beforeCurrentChange(val, this.internalCurrentPage)
      ).then(allowed => {
        if (allowed) {
          this.internalCurrentPage = this.getValidCurrentPage(val);
        }
        return allowed;
      });
    },

    getValidCurrentPage(value) {
      value = parseInt(value, 10);

      const havePageCount = typeof this.internalPageCount === 'number';

      let resetValue;
      if (!havePageCount) {
        if (isNaN(value) || value < 1) resetValue = 1;
      } else {
        if (value < 1) {
          resetValue = 1;
        } else if (value > this.internalPageCount) {
          resetValue = this.internalPageCount;
        }
      }

      if (resetValue === undefined && isNaN(value)) {
        resetValue = 1;
      } else if (resetValue === 0) {
        resetValue = 1;
      }

      return resetValue === undefined ? value : resetValue;
    }
  },

  computed: {
    internalPageCount() {
      if (typeof this.total === 'number') {
        return Math.max(1, Math.ceil(this.total / this.internalPageSize));
      } else if (typeof this.pageCount === 'number') {
        return Math.max(1, this.pageCount);
      }
      return null;
    },
    // 标记是否是表格场景中的分页,以v1.2.0为界分前后两个版本
    isForTable() {
      const layoutNewTable = [
        'total',
        'sizes',
        'prev',
        'pager',
        'next',
        'jumper'
      ].join();
      const layout = this.layout.split(',').map(l => {
        return l.trim();
      });
      return (
        layout.join() === layoutNewTable ||
        this.layout.indexOf('huiPager') !== -1
      );
    }
  },

  watch: {
    currentPage: {
      immediate: true,
      handler(val) {
        this.internalCurrentPage = val;
      }
    },

    pageSize: {
      immediate: true,
      handler(val) {
        this.internalPageSize = val;
      }
    },

    internalPageSize(newVal, oldVal) {
      if (oldVal !== newVal) {
        this.$emit('size-change', newVal, oldVal);
      }
    },

    internalCurrentPage(newVal, oldVal) {
      newVal = parseInt(newVal, 10);

      /* istanbul ignore if */
      if (isNaN(newVal)) {
        newVal = oldVal || 1;
      } else {
        newVal = this.getValidCurrentPage(newVal);
      }

      if (newVal !== undefined) {
        this.$nextTick(() => {
          this.internalCurrentPage = newVal;
          if (oldVal !== newVal) {
            this.$emit('update:currentPage', newVal);
            this.$emit('current-change', this.internalCurrentPage, oldVal);
          }
        });
      } else {
        this.$emit('update:currentPage', newVal);
        this.$emit('current-change', this.internalCurrentPage, oldVal);
      }
    },

    internalPageCount(newVal) {
      /* istanbul ignore if */
      const oldPage = this.internalCurrentPage;
      if (newVal > 0 && oldPage === 0) {
        this.internalCurrentPage = 1;
      } else if (oldPage > newVal) {
        this.internalCurrentPage = newVal === 0 ? 1 : newVal;
      }
    }
  }
};

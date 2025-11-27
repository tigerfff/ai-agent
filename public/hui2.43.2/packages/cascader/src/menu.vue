<script>
import { isDef } from 'hui/src/utils/shared';
import scrollIntoView from 'hui/src/utils/scroll-into-view';

const copyArray = (arr, props) => {
  if (!arr || !Array.isArray(arr) || !props) return arr;
  const result = [];
  const configurableProps = [
    '__IS__FLAT__OPTIONS',
    'label',
    'value',
    'disabled'
  ];
  const childrenProp = props.children || 'children';
  arr.forEach(item => {
    const itemCopy = {};
    configurableProps.forEach(prop => {
      const propName = item.__IS__FLAT__OPTIONS ? prop : props[prop] || prop;
      const value = item[propName];
      if (value !== undefined) itemCopy[propName] = value;
    });
    if (Array.isArray(item[childrenProp])) {
      itemCopy[childrenProp] = copyArray(item[childrenProp], props);
    }
    result.push(itemCopy);
  });
  return result;
};

export default {
  name: 'ElCascaderMenu',

  data() {
    return {
      inputWidth: 0,
      options: [],
      loading: false,
      props: {},
      visible: false,
      activeValue: [],
      value: [],
      check: Function,
      expandTrigger: 'click',
      changeOnSelect: false,
      popperClass: '',
      titleLabel: '',
      noMatch: '',
      filterable: false,
      loadingTitle: ''
    };
  },

  computed: {
    activeOptions: {
      cache: false,
      get() {
        const activeValue = this.activeValue;
        const configurableProps = ['label', 'value', 'children', 'disabled'];

        const formatOptions = options => {
          options.forEach(option => {
            if (option.__IS__FLAT__OPTIONS) return;
            configurableProps.forEach(prop => {
              const value = option[this.props[prop] || prop];
              if (value !== undefined) option[prop] = value;
            });
            if (Array.isArray(option.children)) {
              formatOptions(option.children);
            }
          });
        };

        const loadActiveOptions = (options, activeOptions = []) => {
          const level = activeOptions.length;
          activeOptions[level] = options;
          const active = activeValue[level];
          if (isDef(active)) {
            options = options.filter(option => option.value === active)[0];
            if (options && options.children) {
              loadActiveOptions(options.children, activeOptions);
            }
          }
          return activeOptions;
        };

        const optionsCopy = copyArray(this.options, this.props);
        formatOptions(optionsCopy);
        return loadActiveOptions(optionsCopy);
      }
    }
  },

  watch: {
    visible(value) {
      if (value) {
        this.activeValue = this.value;
      }
    },
    value: {
      immediate: true,
      handler(value) {
        this.activeValue = value;
      }
    }
  },

  methods: {
    select(item, menuIndex) {
      if (item.__IS__FLAT__OPTIONS) {
        this.activeValue = item.value;
      } else if (menuIndex) {
        this.activeValue.splice(
          menuIndex,
          this.activeValue.length - 1,
          item.value
        );
      } else {
        this.activeValue = [item.value];
      }
      this.$emit('pick', this.activeValue.slice(), item.children);
    },
    handleMenuLeave() {
      this.$emit('menuLeave');
    },
    activeItem(item, menuIndex) {
      const len = this.activeOptions.length;
      this.activeValue.splice(menuIndex, len, item.value);
      this.activeOptions.splice(menuIndex + 1, len, item.children);
      this.$emit('activeItemChange', this.activeValue, item);
    },
    scrollMenu(menu, index) {
      scrollIntoView(
        menu,
        menu.getElementsByClassName('is-active')[0],
        index > -1 ? this.$refs.scroll[index] : this.$refs.scroll
      );
    },
    handleMenuEnter() {
      this.$nextTick(() =>
        this.$refs.menus.forEach((menu, index) => this.scrollMenu(menu, index))
      );
    },
    // 最终选中某列事件
    pitchOnItem(item, menuIndex) {
      if (this.check(item, menuIndex)) {
        this.select(item, menuIndex);
      }
      this.$nextTick(() =>
        this.scrollMenu(this.$refs.menus[menuIndex], menuIndex)
      );
    }
  },

  render() {
    const {
      activeValue,
      activeOptions,
      visible,
      expandTrigger,
      popperClass,
      noMatch,
      filterable,
      loadingTitle,
      loading
    } = this;
    const menus = this._l(activeOptions, (menu, menuIndex) => {
      let isFlat = false;
      const items = this._l(menu, item => {
        const events = {
          on: {}
        };

        if (item.__IS__FLAT__OPTIONS) isFlat = true;

        if (!item.disabled) {
          if (item.children) {
            const triggerEvent = {
              click: 'click',
              hover: 'mouseenter'
            }[expandTrigger];
            // if (this.changeOnSelect) {
            //   events.on['mouseenter'] = () => {
            //     const len = this.activeOptions.length;
            //     this.activeValue.splice(menuIndex, len, item.value);
            //     this.activeOptions.splice(menuIndex + 1, len, item.children);
            //     this.$emit('activeItemChange', this.activeValue);
            //     // this.activeItem(item, menuIndex);
            //     this.$nextTick(() => {
            //     // adjust self and next level
            //       this.scrollMenu(this.$refs.menus[menuIndex]);
            //       this.scrollMenu(this.$refs.menus[menuIndex + 1]);
            //     });
            //   };
            // }

            events.on[triggerEvent] = () => {
              if (this.changeOnSelect && this.check(item, menuIndex)) {
                // hover + change-on-select 情况下，mouseenter 不调用select事件
                if (!(expandTrigger === 'hover' && this.changeOnSelect)) {
                  this.select(item, menuIndex);
                }
                // this.$nextTick(() => this.scrollMenu(this.$refs.menus[menuIndex]));
              }
              this.activeItem(item, menuIndex);
              if (triggerEvent === 'click') {
                this.$nextTick(() => {
                  // adjust self and next level
                  this.scrollMenu(this.$refs.menus[menuIndex], menuIndex);
                  this.scrollMenu(
                    this.$refs.menus[menuIndex + 1],
                    menuIndex + 1
                  );
                });
              }
            };
          } else {
            events.on.click = () => {
              this.pitchOnItem(item, menuIndex);
            };
          }

          // hover + change-on-select 情况下，无论是否有子节点(所以不在前面item.children的判断中去加入以下逻辑)，click事件作为选中item的行为
          if (expandTrigger === 'hover' && this.changeOnSelect) {
            events.on.click = () => {
              this.pitchOnItem(item, menuIndex);
            };
          }
        }
        /*
         * 文字超出时显示title否则不显示，后续需要优化为toolTip显示
         * zhangxiaogang  2017-12-13
         */
        events.on.mouseover = e => {
          const t = e.target;
          if (t.tagName === 'LI') {
            if (t.scrollWidth > t.offsetWidth) {
              this.titleLabel = t.innerText;
            } else {
              this.titleLabel = '';
            }
          }
        };
        return (
          <li
            class={{
              'el-cascader-menu__item': true,
              'el-cascader-menu__item--extensible': item.children,
              'is-active': item.value === activeValue[menuIndex],
              'is-disabled': item.disabled
            }}
            {...events}
            title={this.titleLabel}
          >
            {item.label}
            <i
              class={{
                'h-icon-angle_right_sm': item.children
              }}
            />
          </li>
        );
      });
      const menuStyle = {};
      const noDataStyle = {};
      if (isFlat) {
        menuStyle.minWidth = this.inputWidth + 'px';
      }
      noDataStyle.width = this.inputWidth + 'px';
      noDataStyle.height = '94px';

      if (items.length > 0) {
        return (
          <ul
            class={{
              'el-cascader-menu': true,
              'el-cascader-menu--flexible': isFlat
            }}
            style={menuStyle}
            refInFor
            ref='menus'
          >
            <el-scrollbar
              refInFor
              ref='scroll'
              wrap-class='el-cascader-scrollbar__wrap'
              view-class='el-cascader-scrollbar__view'
              isSmall={true}
            >
              {items}
            </el-scrollbar>
          </ul>
        );
      } else if (loading) {
        return (
          <ul
            class={{
              'el-cascader-menu': true,
              'el-cascader-menu--flexible': isFlat,
              'el-cascader-menu--noDate': true
            }}
            style={menuStyle}
            refInFor
            ref='menus'
          >
            <span
              class={{
                'el-cascader-noDate': true
              }}
            >
              {loadingTitle}
            </span>
          </ul>
        );
      } else if (filterable & (activeOptions[0].length === 0)) {
        return (
          <ul
            class={{
              'el-cascader-menu': true,
              'el-cascader-menu--flexible': isFlat,
              'el-cascader-menu--noDate': true
            }}
            style={noDataStyle}
            refInFor
            ref='menus'
          >
            <span
              class={{
                'el-cascader-noDate': true
              }}
            >
              {noMatch}
            </span>
          </ul>
        );
      } else {
        return (
          <ul
            class={{
              'el-cascader-menu': true,
              'el-cascader-menu--flexible': isFlat,
              'el-cascader-menu--noDateFirst': true,
              'el-cascader-menu--noDate': true
            }}
            style={menuStyle}
            refInFor
            ref='menus'
          >
            <span
              class={{
                'el-cascader-noDate': true
              }}
            >
              {noMatch}
            </span>
          </ul>
        );
      }
    });
    const { header, footer } = this.$scopedSlots;
    return (
      <transition
        name='el-zoom-in-top'
        on-before-enter={this.handleMenuEnter}
        on-after-leave={this.handleMenuLeave}
      >
        <div
          v-show={visible}
          class={['el-cascader-menus', popperClass]}
          ref='wrapper'
        >
          {header ? header(this) : ''}
          {menus}
          {footer ? footer(this) : ''}
        </div>
      </transition>
    );
  }
};
</script>

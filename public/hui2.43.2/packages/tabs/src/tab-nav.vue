<script>
import TabBar from './tab-bar';
import {
  addResizeListener,
  removeResizeListener
} from 'hui/src/utils/resize-event';
function noop() {}
const firstUpperCase = str => {
  return str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
};
export default {
  name: 'TabNav',
  components: {
    TabBar
  },
  inject: ['rootTabs'],
  props: {
    panes: {
      type: Array,
      default() {
        return [];
      }
    },
    currentName: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: null
    },
    onTabClick: {
      type: Function,
      default: noop
    },
    onScrollStatusChange: {
      type: Function,
      default: noop
    },
    onTabRemove: {
      type: Function,
      default: noop
    },
    type: {
      type: String,
      default: ''
    },
    stretch: {
      type: Boolean,
      default: null
    },
    labelMaxWidth: {
      type: Number,
      default: 192
    },
    fixWidth: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      scrollable: true,
      navOffset: 0,
      isFocus: false,
      focusable: true,
      scrollableNext: false,
      scrollablePrev: false
    };
  },
  computed: {
    navStyle() {
      const dir =
        ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) !== -1 ? 'X' : 'Y';
      return {
        transform: `translate${dir}(-${this.navOffset}px)`
      };
    },
    sizeName() {
      return ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) !== -1
        ? 'width'
        : 'height';
    }
  },
  watch: {
    scrollable(value) {
      this.onScrollStatusChange(!!value);
    }
  },
  updated() {
    this.update();
  },
  mounted() {
    addResizeListener(this.$el, this.update);
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    window.addEventListener('blur', this.windowBlurHandler);
    window.addEventListener('focus', this.windowFocusHandler);
    setTimeout(() => {
      this.scrollToActiveTab();
    }, 0);
  },
  beforeDestroy() {
    if (this.$el && this.update) removeResizeListener(this.$el, this.update);
    document.removeEventListener(
      'visibilitychange',
      this.visibilityChangeHandler
    );
    window.removeEventListener('blur', this.windowBlurHandler);
    window.removeEventListener('focus', this.windowFocusHandler);
  },
  methods: {
    scrollPrev() {
      const containerSize = this.$refs.navScroll[
        `offset${firstUpperCase(this.sizeName)}`
      ];
      const currentOffset = this.navOffset;
      if (!currentOffset) {
        this.scrollable &&
          this.scrollablePrev &&
          this.$nextTick(function() {
            this.scrollablePrev = false;
            this.$set(this.scrollable, 'prev', false);
          });
        return;
      }

      const newOffset =
        currentOffset > containerSize ? currentOffset - containerSize : 0;
      this.navOffset = newOffset;
    },
    scrollNext() {
      const navSize = this.$refs.nav[`offset${firstUpperCase(this.sizeName)}`];
      const containerSize = this.$refs.navScroll[
        `offset${firstUpperCase(this.sizeName)}`
      ];
      const currentOffset = this.navOffset;
      if (navSize - currentOffset <= containerSize) {
        this.scrollable &&
          this.scrollableNext &&
          this.$nextTick(function() {
            this.scrollableNext = false;
            this.$set(this.scrollable, 'next', false);
          });
        return;
      }

      const newOffset =
        navSize - currentOffset > containerSize * 2
          ? currentOffset + containerSize
          : navSize - containerSize;
      this.navOffset = newOffset;
    },
    scrollToActiveTab() {
      if (!this.scrollable) return;
      const nav = this.$refs.nav;
      const activeTab = this.$el.querySelector('.is-active');
      if (!activeTab) return;
      const navScroll = this.$refs.navScroll;
      const isHorizontal =
        ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) !== -1;
      const activeTabBounding = activeTab.getBoundingClientRect();
      const navScrollBounding = navScroll.getBoundingClientRect();
      const maxOffset = isHorizontal
        ? nav.offsetWidth - navScrollBounding.width
        : nav.offsetHeight - navScrollBounding.height;
      const currentOffset = this.navOffset;
      let newOffset = currentOffset;
      if (isHorizontal) {
        if (activeTabBounding.left < navScrollBounding.left) {
          newOffset =
            currentOffset - (navScrollBounding.left - activeTabBounding.left);
        }
        if (activeTabBounding.right > navScrollBounding.right) {
          newOffset =
            currentOffset + activeTabBounding.right - navScrollBounding.right;
        }
      } else {
        if (activeTabBounding.top < navScrollBounding.top) {
          newOffset =
            currentOffset - (navScrollBounding.top - activeTabBounding.top);
        }
        if (activeTabBounding.bottom > navScrollBounding.bottom) {
          newOffset =
            currentOffset +
            (activeTabBounding.bottom - navScrollBounding.bottom);
        }
      }
      newOffset = Math.max(newOffset, 0);
      this.navOffset = Math.min(newOffset, maxOffset);
    },
    update() {
      if (!this.$refs.nav) return;
      const sizeName = this.sizeName;
      const navSize = this.$refs.nav[`offset${firstUpperCase(sizeName)}`];
      const containerSize = this.$refs.navScroll[
        `offset${firstUpperCase(sizeName)}`
      ];
      const wrapSize = this.$refs.navWrap[`offset${firstUpperCase(sizeName)}`];
      const currentOffset = this.navOffset;
      // 出现滚动条就加入双向箭头
      if (wrapSize < navSize) {
        const currentOffset = this.navOffset;
        this.scrollable = this.scrollable || {};
        this.scrollablePrev = currentOffset;
        this.scrollableNext = currentOffset + containerSize < navSize;
        if (navSize - currentOffset < containerSize) {
          this.navOffset = navSize - containerSize;
        }
      } else {
        this.scrollable = false;
        if (currentOffset > 0) {
          this.navOffset = 0;
        }
      }
    },
    changeTab(e) {
      const keyCode = e.keyCode;
      let nextIndex;
      let currentIndex, tabList;
      if ([37, 38, 39, 40].indexOf(keyCode) !== -1) {
        // 左右上下键更换tab
        tabList = e.currentTarget.querySelectorAll('[role=tab]');
        currentIndex = Array.prototype.indexOf.call(tabList, e.target);
      } else {
        return;
      }
      if (keyCode === 37 || keyCode === 38) {
        // left
        if (currentIndex === 0) {
          // first
          nextIndex = tabList.length - 1;
        } else {
          nextIndex = currentIndex - 1;
        }
      } else {
        // right
        if (currentIndex < tabList.length - 1) {
          // not last
          nextIndex = currentIndex + 1;
        } else {
          nextIndex = 0;
        }
      }
      tabList[nextIndex].focus(); // 改变焦点元素
      tabList[nextIndex].click(); // 选中下一个tab
      this.setFocus();
    },
    setFocus() {
      if (this.focusable) {
        this.isFocus = true;
      }
    },
    removeFocus() {
      this.isFocus = false;
    },
    visibilityChangeHandler() {
      const visibility = document.visibilityState;
      if (visibility === 'hidden') {
        this.focusable = false;
      } else if (visibility === 'visible') {
        setTimeout(() => {
          this.focusable = true;
        }, 50);
      }
    },
    windowBlurHandler() {
      this.focusable = false;
    },
    windowFocusHandler() {
      setTimeout(() => {
        this.focusable = true;
      }, 50);
    }
  },
  render() {
    const {
      type,
      panes,
      editable,
      stretch,
      onTabClick,
      onTabRemove,
      navStyle,
      scrollable,
      scrollableNext,
      scrollablePrev,
      scrollNext,
      scrollPrev,
      changeTab,
      setFocus,
      removeFocus
    } = this;
    const scrollBtn = scrollable
      ? [
          // <span
          //   class={['el-tabs__nav-prev', scrollable.prev ? '' : 'is-disabled']}
          //   on-click={scrollPrev}
          // >
          //   <i class="h-icon-angle_left" />
          // </span>
          <div class='el-tabs__nav-prev'>
            <el-button
              type='iconButton'
              // bottom top ; left/right
              icon={
                this.rootTabs.tabPosition.indexOf('o') > 0
                  ? 'h-icon-angle_left'
                  : 'h-icon-angle_up'
              }
              disabled={!scrollablePrev}
              on-click={scrollPrev}
            />
          </div>,
          <div class='el-tabs__nav-next'>
            <el-button
              type='iconButton'
              // bottom top ; left/right
              icon={
                this.rootTabs.tabPosition.indexOf('o') > 0
                  ? 'h-icon-angle_right'
                  : 'h-icon-angle_down'
              }
              // icon="h-icon-angle_right"
              disabled={!scrollableNext}
              on-click={scrollNext}
            />
          </div>

          // <span
          //   class={['el-tabs__nav-next', scrollable.next ? '' : 'is-disabled']}
          //   on-click={scrollNext}
          // >
          //   <i class="h-icon-angle_right" />
          // </span>
        ]
      : null;

    const notTheOnlyOne = panes.length !== 1;
    const tabs = this._l(panes, (pane, index) => {
      const tabName = pane.name || pane.index || index;
      const closable = pane.isClosable || editable;
      pane.index = `${index}`;
      const btnClose =
        closable && notTheOnlyOne ? (
          <el-button
            // class="h-icon-close"
            icon='h-icon-close_sm'
            on-click={ev => {
              onTabRemove(pane, ev);
            }}
          />
        ) : null;
      const fixWidth = this.fixWidth;
      const labelMaxWidth = pane.labelMaxWidth || this.labelMaxWidth;
      const tabSpanStyle =
        closable && notTheOnlyOne
          ? `max-width: ${
              fixWidth ? fixWidth - 50 : labelMaxWidth && labelMaxWidth - 50
            }px;overflow: hidden;display: inline-block;vertical-align: middle;text-overflow: ellipsis;white-space: nowrap;`
          : '';
      const tabLabelContent = pane.labelIcon ? (
        <i class={['el-tabs__item--icon', pane.labelIcon]} />
      ) : (
        <span style={tabSpanStyle} title={pane.label}>
          {pane.$slots.label || pane.label}
        </span>
      );
      const tabindex = pane.active ? 0 : -1;
      return (
        <div
          class={{
            'el-tabs__item': true,
            [`is-${this.rootTabs.tabPosition}`]: true,
            'is-active': pane.active,
            'is-disabled': pane.disabled,
            'is-closable': closable && notTheOnlyOne,
            'is-focus': this.isFocus
          }}
          id={`tab-${tabName}`}
          key={`tab-${tabName}`}
          aria-controls={`pane-${tabName}`}
          role='tab'
          aria-selected={pane.active}
          ref='tabs'
          tabindex={tabindex}
          refInFor
          style={{
            'min-width': fixWidth && `${fixWidth}px`,
            'max-width': fixWidth
              ? `${fixWidth}px`
              : labelMaxWidth && `${labelMaxWidth}px`
          }}
          on-focus={() => {
            setFocus();
          }}
          on-blur={() => {
            removeFocus();
          }}
          on-click={ev => {
            removeFocus();
            onTabClick(pane, tabName, ev);
          }}
          on-keydown={ev => {
            if (closable && (ev.keyCode === 46 || ev.keyCode === 8)) {
              onTabRemove(pane, ev);
            }
          }}
        >
          {tabLabelContent}
          {btnClose}
        </div>
      );
    });
    return (
      <div
        class={[
          'el-tabs__nav-wrap',
          scrollable ? 'is-scrollable' : '',
          `is-${this.rootTabs.tabPosition}`
        ]}
        ref='navWrap'
      >
        {scrollBtn}
        <div class={['el-tabs__nav-scroll']} ref='navScroll'>
          <div
            class={[
              'el-tabs__nav',
              `is-${this.rootTabs.tabPosition}`,
              stretch &&
              ['top', 'bottom'].indexOf(this.rootTabs.tabPosition) !== -1
                ? 'is-stretch'
                : ''
            ]}
            ref='nav'
            style={navStyle}
            role='tablist'
            on-keydown={changeTab}
          >
            {!type ? <tab-bar tabs={panes} /> : null}
            {tabs}
          </div>
        </div>
      </div>
    );
  }
};
</script>

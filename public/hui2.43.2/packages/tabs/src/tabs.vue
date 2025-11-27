<script>
import TabNav from './tab-nav';

export default {
  name: 'ElTabs',

  components: {
    TabNav
  },

  props: {
    type: {
      type: String,
      default: ''
    },
    activeName: {
      type: String,
      default: ''
    },
    closable: {
      type: Boolean,
      default: null
    },
    addable: {
      type: Boolean,
      default: null
    },
    value: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: null
    },
    tabPosition: {
      type: String,
      default: 'top'
    },
    beforeLeave: {
      type: Function,
      default: () => () => {}
    },
    beforeRemove: {
      type: Function,
      default: () => () => {}
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
    },
    size: {
      type: String,
      default: 'medium'
    }
  },

  provide() {
    return {
      rootTabs: this
    };
  },

  data() {
    return {
      currentName: this.value || this.activeName,
      panes: [],
      isButtonGroup: false
    };
  },

  watch: {
    activeName(value) {
      this.setCurrentName(value);
    },
    value(value) {
      this.setCurrentName(value);
    },
    currentName() {
      if (this.$refs.nav) {
        this.$nextTick(() => {
          this.$refs.nav.$nextTick(() => {
            this.scrollToActiveTab();
          });
        });
      }
    }
  },

  created() {
    if (!this.currentName) {
      this.setCurrentName('0');
    }
    this.$on('tab-nav-update', this.calcPaneInstances.bind(null, true));
  },

  mounted() {
    this.calcPaneInstances();
  },

  updated() {
    this.calcPaneInstances();
  },

  methods: {
    calcPaneInstances(isForceUpdate = false) {
      if (this.$slots.default) {
        const paneSlots = this.$slots.default.filter(
          vnode =>
            vnode.tag &&
            vnode.componentOptions &&
            vnode.componentOptions.Ctor.options.name === 'ElTabPane'
        );
        // update indeed
        const panes = paneSlots.map(
          ({ componentInstance }) => componentInstance
        );
        const panesChanged = !(
          panes.length === this.panes.length &&
          panes.every((pane, index) => pane === this.panes[index])
        );

        if (isForceUpdate || panesChanged) {
          this.panes = panes;
        }
      } else if (this.panes.length !== 0) {
        this.panes = [];
      }
    },
    handleTabClick(tab, tabName, event) {
      if (tab.disabled) return;
      this.setCurrentName(tabName, () => {
        this.$emit('tab-click', tab, event);
      });
    },
    handleTabRemove(pane, ev) {
      if (pane.disabled) return;
      ev.stopPropagation();
      const hdRemove = () => {
        this.$emit('edit', pane.name, 'remove');
        this.$emit('tab-remove', pane.name);
      };
      const before = this.beforeRemove(pane.name);
      if (before && before.then) {
        before.then(() => {
          hdRemove();
        });
      } else {
        hdRemove();
      }
    },
    handleTabAdd() {
      this.$emit('edit', null, 'add');
      this.$emit('tab-add');
    },
    setCurrentName(value, cb) {
      const changeCurrentName = () => {
        this.currentName = value;
        this.$emit('input', value);
        cb && cb();
      };
      if (this.currentName !== value && this.beforeLeave) {
        const before = this.beforeLeave(value, this.currentName);
        if (before && before.then) {
          before.then(() => {
            changeCurrentName();

            this.$refs.nav && this.$refs.nav.removeFocus();
          });
        } else if (before !== false) {
          changeCurrentName();
        }
      } else {
        changeCurrentName();
      }
    },
    scrollChange(value) {
      this.isButtonGroup = value;
    },
    scrollToActiveTab() {
      this.$refs.nav.scrollToActiveTab();
    }
  },

  render() {
    const {
      type,
      handleTabClick,
      handleTabRemove,
      handleTabAdd,
      currentName,
      panes,
      editable,
      addable,
      tabPosition,
      size,
      stretch,
      labelMaxWidth,
      fixWidth,
      scrollChange
    } = this;
    const newButton =
      editable || addable ? (
        // <span
        // class="el-tabs__new-tab"
        // on-click={handleTabAdd}
        // tabindex="0"
        // on-keydown={ev => {
        //   if (ev.keyCode === 13) {
        //     handleTabAdd();
        //   }
        // }}
        // >
        //   <i class="h-icon-add" />
        // </span>
        <div
          class={{
            'el-tabs__new-tab': true,
            isButtonGroup: this.isButtonGroup
          }}
        >
          <el-button
            type='iconButton'
            icon='h-icon-add'
            on-click={handleTabAdd}
            tabindex='0'
            on-keydown={ev => {
              if (ev.keyCode === 13) {
                handleTabAdd();
              }
            }}
          />
        </div>
      ) : null;

    const navData = {
      props: {
        currentName,
        onTabClick: handleTabClick,
        onTabRemove: handleTabRemove,
        onScrollStatusChange: scrollChange,
        editable,
        type,
        panes,
        stretch,
        labelMaxWidth,
        fixWidth
      },
      ref: 'nav'
    };
    const header = (
      <div class={['el-tabs__header', `el-tabs--${size}`, `is-${tabPosition}`]}>
        <tab-nav {...navData} />
        {newButton}
      </div>
    );
    const panels = <div class='el-tabs__content'>{this.$slots.default}</div>;

    return (
      <div
        class={{
          'el-tabs': true,
          'el-tabs--card': type === 'card',
          [`el-tabs--${tabPosition}`]: true,
          'el-tabs--border-card': type === 'border-card'
        }}
      >
        {tabPosition !== 'bottom' ? [header, panels] : [panels, header]}
      </div>
    );
  }
};
</script>

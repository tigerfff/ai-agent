import { createVue, destroyVM, triggerEvent } from '@/src/utils/test-util';

/* 以下 Demo 无法测试：有滚动条、树节点的选择、自定义节点内容、节点过滤 */
/* 以下事件无法测试：拖拽系列事件、滚动条系列事件 */

describe('Tree', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-tree :data="data" />
      `,
      data() {
        return {
          data: [
            {
              label: '一级 1',
              children: [{ label: '二级 1-1' }]
            }
          ]
        };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', () => {
    vm = createVue({
      template: `
        <el-tree :data="data" :defaultProps="defaultProps" :render-after-expand="false" />
      `,
      data() {
        return {
          data: [
            {
              label: '一级 1',
              children: [
                { label: '二级 1-1', children: [{ label: '三级 1-1-1' }] }
              ]
            },
            {
              label: '一级 2',
              children: [
                { label: '二级 2-1', children: [{ label: '三级 2-1-1' }] },
                { label: '二级 2-2', children: [{ label: '三级 2-2-1' }] }
              ]
            },
            {
              label: '一级 3',
              children: [
                { label: '二级 3-1', children: [{ label: '三级 3-1-1' }] },
                { label: '二级 3-2', children: [{ label: '三级 3-2-1' }] }
              ]
            }
          ],
          defaultProps: {
            children: 'children',
            label: 'label'
          }
        };
      }
    });
    expect(vm.$el.querySelectorAll('.el-tree-node').length).toBe(13);
  });

  test('带图标', () => {
    vm = createVue({
      template: `
        <el-tree :data="data" :props="defaultProps" default-icon="h-icon-internet" :render-after-expand="false" />
      `,
      data() {
        return {
          data: [
            {
              label: 'Icon 1',
              icon: 'h-icon-menu_f',
              children: [
                {
                  label: 'Icon 1-1',
                  icon: 'h-icon-setting',
                  children: [
                    {
                      label: 'DefaultIcon 1-1-1'
                    }
                  ]
                }
              ]
            },
            {
              label: 'SvgIcon 2',
              svgIcon: ['svg-box-camera', 'svg-state-cascade'],
              children: [
                {
                  label: 'SvgIcon 2-1',
                  svgIcon: 'svg-box-camera',
                  children: [
                    {
                      label: 'DefaultIcon 2-1-1'
                    }
                  ]
                },
                {
                  label: 'SvgIcon-offline 2-2',
                  svgIcon: [
                    'svg-box-camera',
                    'svg-state-no-longitude-and-latitude'
                  ],
                  svgIconOffline: true,
                  children: [
                    {
                      label: 'DefaultIcon 2-2-1'
                    }
                  ]
                }
              ]
            }
          ],
          defaultProps: {
            children: 'children',
            label: 'label',
            icon: 'icon',
            svgIcon: 'svgIcon',
            svgIconOffline: 'svgIconOffline'
          }
        };
      }
    });
    const $icons = vm.$el.querySelectorAll('.el-tree-node__icon');
    expect($icons[0].className).toContain('h-icon-menu_f');
    expect($icons[1].className).toContain('h-icon-setting');
    expect($icons[2].className).toContain('h-icon-internet');
    expect($icons[3].querySelectorAll('.h-svg-icon__main').length).toBe(2);
    expect($icons[4].querySelectorAll('.h-svg-icon__main').length).toBe(1);
    expect($icons[5].className).toContain('h-icon-internet');
    expect($icons[6].querySelectorAll('.h-svg-icon__main').length).toBe(2);
    expect($icons[6].className).toContain('is-offline');
    expect($icons[7].className).toContain('h-icon-internet');
  });

  test('简单数据结构', () => {
    vm = createVue({
      template: `
        <el-tree
          :data.sync="simpleData"
          node-key="id"
          parent-key="pId"
          :props="defaultProps"
          simple-data
          show-checkbox
          :render-after-expand="false"
        />
      `,
      data() {
        return {
          simpleData: [
            { id: 1, label: '一级 1' },
            { id: 4, pId: 1, label: '二级 1-1' },
            { id: 9, pId: 4, label: '三级 1-1-1' },
            { id: 10, pId: 4, label: '三级 1-1-2' },
            { id: 2, label: '一级 2' },
            { id: 5, pId: 2, label: '二级 2-1' },
            { id: 6, pId: 2, label: '二级 2-2' }
          ],
          defaultProps: {
            children: 'children',
            label: 'label',
            icon: 'icon'
          }
        };
      }
    });
    expect(vm.$el.querySelectorAll('.el-tree-node').length).toBe(7);
  });

  test('异步树', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-tree
          ref="lazyTree"
          :data="dataAsync"
          :props="props"
          simple-data
          node-key="id"
          parent-key="pid"
          :load="loadNode"
          show-checkbox
          lazy
          lazy-check-descendants
          :render-after-expand="false"
        />
      `,
        data() {
          return {
            dataAsync: [
              { id: 1, name: 'region1' },
              { id: 11, pid: 1, name: 'region11' },
              { id: 2, name: 'region2' }
            ],
            props: {
              label: 'name',
              children: 'zones'
            },
            count: 1
          };
        },
        methods: {
          loadNode(node, resolve) {
            if (node.level === 0) {
              return resolve([
                { id: 1, name: 'region1' },
                { id: 11, pid: 1, name: 'region11' },
                { id: 2, name: 'region2' }
              ]);
            }
            if (node.level > 3) return resolve([]);

            var hasChild;
            if (node.data.name === 'region11') {
              hasChild = true;
            } else if (node.data.name === 'region2') {
              hasChild = false;
            } else {
              hasChild = Math.random() > 0.5;
            }

            setTimeout(() => {
              var data;
              if (hasChild) {
                data = [
                  {
                    id: 'id' + this.count,
                    name: 'zone' + this.count++,
                    isLeaf: true
                  },
                  {
                    id: 'id' + this.count,
                    name: 'zone' + this.count++
                  }
                ];
              } else {
                data = [];
              }

              resolve(data);
            }, 500);
          }
        }
      });
      expect(vm.$el.querySelectorAll('.el-tree-node').length).toBe(3);
      vm.$el.querySelector('.el-tree-node__expand-icon').click();
      vm.$el.querySelectorAll('.el-tree-node__expand-icon')[1].click();
      setTimeout(() => {
        expect(vm.$el.querySelectorAll('.el-tree-node').length).toBe(5);
        done();
      }, 700);
    });
  });

  test('默认展开和默认选中', () => {
    vm = createVue({
      template: `
        <el-tree
          :data="dataDefault"
          show-checkbox
          node-key="id"
          :default-expanded-keys="[2]"
          :default-checked-keys="[5]"
          :props="defaultProps"
        />
      `,
      data() {
        return {
          dataDefault: [
            {
              id: 1,
              label: '一级 1',
              children: [
                {
                  id: 4,
                  label: '二级 1-1',
                  children: [
                    { id: 9, label: '三级 1-1-1' },
                    { id: 10, label: '三级 1-1-2' }
                  ]
                }
              ]
            },
            {
              id: 2,
              label: '一级 2',
              children: [
                { id: 5, label: '二级 2-1' },
                { id: 6, label: '二级 2-2' }
              ]
            }
          ],
          defaultProps: {
            children: 'children',
            label: 'label'
          }
        };
      }
    });
    const $node2 = vm.$el.querySelectorAll('.el-tree .el-tree-node')[1];
    expect($node2.className).toContain('is-expanded');
    expect(
      $node2.querySelector('.el-tree-node__content .el-checkbox__input')
        .className
    ).toContain('is-indeterminate');
    expect(
      $node2.querySelector('.el-tree-node__children .el-checkbox__input')
        .className
    ).toContain('is-checked');
  });

  test('禁止点击', () => {
    vm = createVue({
      template: `
        <el-tree
          :props="selectableProps"
          :data="selectableData"
          node-key="id"
          :default-expanded-keys="[1, 3]"
        ></el-tree>
      `,
      data() {
        return {
          selectableData: [
            {
              id: 1,
              label: '一级 2（禁点击）',
              selectable: false,
              children: [
                {
                  id: 3,
                  label: '二级 2-1',
                  children: [
                    { id: 4, label: '三级 3-1-1（禁点击）', selectable: false },
                    { id: 5, label: '三级 3-1-2' }
                  ]
                }
              ]
            }
          ],
          selectableProps: {
            children: 'children',
            label: 'label',
            selectable: 'selectable'
          }
        };
      }
    });
    expect(
      vm.$el.querySelector('.el-tree > .el-tree-node').className
    ).toContain('is-nonselectable');
    vm.$el.querySelector('.el-tree > .el-tree-node').click();
    setTimeout(() => {
      expect(
        vm.$el.querySelector('.el-tree > .el-tree-node')
          .className
      ).not.toContain('is-current');
    }, 200)
  });

  test('禁用状态', () => {
    vm = createVue({
      template: `
        <el-tree
          :props="disabledProps"
          :data="dataDisabled"
          show-checkbox
          node-key="id"
          :default-expanded-keys="[2, 3, 8, 11, 14]"
          :default-checked-keys="[2, 5]">
        </el-tree>
      `,
      data() {
        return {
          dataDisabled: [
            { id: 1, label: '一级 2', children: [
              { id: 3, label: '二级 2-1', children: [
                { id: 4, label: '三级 3-1-1' },
                { id: 5, label: '三级 3-1-2（禁勾选）', forbidden: true }
              ] },
              { id: 2, label: '二级 2-2（禁勾选）', forbidden: true, children: [
                { id: 6, label: '三级 3-2-1' },
                { id: 7, label: '三级 3-2-2' }
              ] },
              { id: 8, label: '二级 2-2', children: [
                { id: 9, label: '三级 3-2-1' },
                { id: 10, label: '三级 3-2-2' }
              ] },
              { id: 11, label: '二级 2-2-fff', children: [
                { id: 12, label: '三级 3-2-1', forbidden: true },
                { id: 13, label: '三级 3-2-2', forbidden: true }
              ] },
              { id: 14, label: '二级 2-2', children: [
                { id: 15, label: '三级 3-2-1', forbidden: true },
                { id: 16, label: '三级 3-2-2' },
                { id: 17, label: '三级 3-2-2' }
              ] }
            ] }
          ],
          disabledProps: {
            children: 'children',
            label: 'label',
            disabled: 'forbidden'
          }
        };
      }
    });
    expect(
      vm.$el.querySelector(
        '.el-tree > .el-tree-node > .el-tree-node__children > .el-tree-node:nth-child(2)'
      ).className
    ).toContain('is-disabled');
  });

  test('手风琴模式', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-tree :data="dataAccordion" :props="defaultProps" accordion />
      `,
        data() {
          return {
            dataAccordion: [
              {
                label: '一级 1',
                children: [
                  { label: '二级 1-1', children: [{ label: '三级 1-1-1' }] }
                ]
              },
              {
                label: '一级 2',
                children: [
                  { label: '二级 2-1', children: [{ label: '三级 2-1-1' }] },
                  { label: '二级 2-2', children: [{ label: '三级 2-2-1' }] }
                ]
              },
              {
                label: '一级 3',
                children: [
                  { label: '二级 3-1', children: [{ label: '三级 3-1-1' }] },
                  { label: '二级 3-2', children: [{ label: '三级 3-2-1' }] }
                ]
              }
            ],
            defaultProps: {
              children: 'children',
              label: 'label'
            }
          };
        }
      });
      vm.$el
        .querySelector(
          '.el-tree > .el-tree-node:nth-child(1) .el-tree-node__expand-icon'
        )
        .click();
      setTimeout(() => {
        expect(
          vm.$el.querySelector('.el-tree > .el-tree-node:nth-child(1)')
            .className
        ).toContain('is-expanded');
        vm.$el
          .querySelector(
            '.el-tree > .el-tree-node:nth-child(2) .el-tree-node__expand-icon'
          )
          .click();
        setTimeout(() => {
          expect(
            vm.$el.querySelector('.el-tree > .el-tree-node:nth-child(1)')
              .className
          ).not.toContain('is-expanded');
          expect(
            vm.$el.querySelector('.el-tree > .el-tree-node:nth-child(2)')
              .className
          ).toContain('is-expanded');
          done();
        }, 200);
      }, 200);
    });
  });

  test('测试 node-click、current-change、node-dbclick、node-contextmenu 事件', () => {
    vm = createVue({
      template: `
        <el-tree
          :data="data"
          :render-after-expand="false"
          @node-click="handleNodeClick"
          @current-change="handleCurrentChange"
          @node-dbclick="handleNodeDbClick"
          @node-contextmenu="handleContextmenu"
        />
      `,
      data() {
        return {
          event1: '',
          event2: '',
          event3: '',
          event4: '',
          data: [
            {
              label: '一级 1',
              children: [
                { label: '二级 1-1', children: [{ label: '三级 1-1-1' }] }
              ]
            }
          ]
        };
      },
      methods: {
        handleNodeClick() {
          this.event1 = 'node-click';
        },
        handleCurrentChange() {
          this.event2 = 'current-change';
        },
        handleNodeDbClick() {
          this.event3 = 'node-dbclick';
        },
        handleContextmenu() {
          this.event4 = 'node-contextmenu';
        }
      }
    });
    const $node = vm.$el.querySelector(
      '.el-tree > .el-tree-node:first-child .el-tree-node__content'
    );

    $node.click();
    expect(vm.event1).toBe('node-click');
    expect(vm.event2).toBe('current-change');
    triggerEvent($node, 'dblclick');
    expect(vm.event3).toBe('node-dbclick');
    triggerEvent($node, 'contextmenu');
    expect(vm.event4).toBe('node-contextmenu');
  });

  test('测试 node-mouseenter、node-mouseleave 事件', async () => {
    vm = createVue({
      template: `
        <el-tree
          :data="data"
          :render-after-expand="false"
          @node-mouseenter="handleMouseenter"
          @node-mouseleave="handleMouseleave"
        />
      `,
      data() {
        return {
          event1: '',
          event2: '',
          data: [
            {
              label: '一级 1',
              children: [
                { label: '二级 1-1', children: [{ label: '三级 1-1-1' }] }
              ]
            }
          ]
        };
      },
      methods: {
        handleMouseenter() {
          this.event1 = 'node-mouseenter';
        },
        handleMouseleave() {
          this.event2 = 'node-mouseleave';
        }
      }
    });

    const $node = vm.$el.querySelector(
      '.el-tree > .el-tree-node:first-child .el-tree-node__content'
    );

    $node.click();
    triggerEvent($node, 'mouseenter');
    expect(vm.event1).toBe('node-mouseenter');
    triggerEvent($node, 'mouseleave');
    expect(vm.event2).toBe('node-mouseleave');
  });

  test('测试 check、check-change 事件', async () => {
    vm = createVue({
      template: `
        <el-tree :data="data" :render-after-expand="false" show-checkbox @check="handleCheck" @check-change="handleCheckChange" />
      `,
      data() {
        return {
          event1: '',
          event2: '',
          data: [
            {
              label: '一级 1',
              children: [
                { label: '二级 1-1', children: [{ label: '三级 1-1-1' }] }
              ]
            }
          ]
        };
      },
      methods: {
        handleCheck() {
          this.event1 = 'check';
        },
        handleCheckChange() {
          this.event2 = 'check-change';
        }
      }
    });
    vm.$el.querySelector('.el-tree > .el-tree-node:first-child input').click();
    await Promise.resolve();
    expect(vm.event1).toBe('check');
    expect(vm.event2).toBe('check-change');
  });

  test('测试 node-expand、node-collapse 事件', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-tree :data="data" :render-after-expand="false" @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse" />
      `,
        data() {
          return {
            event: '',
            data: [
              {
                label: '一级 1',
                children: [
                  { label: '二级 1-1', children: [{ label: '三级 1-1-1' }] }
                ]
              }
            ]
          };
        },
        methods: {
          handleNodeExpand() {
            this.event = 'node-expand';
          },
          handleNodeCollapse() {
            this.event = 'node-collapse';
          }
        }
      });
      const $expandIcon = vm.$el.querySelector(
        '.el-tree > .el-tree-node:first-child .el-tree-node__expand-icon'
      );
      $expandIcon.click();
      vm.$nextTick(() => {
        expect(vm.event).toBe('node-expand');
        setTimeout(() => {
          $expandIcon.click();
          expect(vm.event).toBe('node-collapse');
          done();
        }, 50);
      });
    });
  });
});

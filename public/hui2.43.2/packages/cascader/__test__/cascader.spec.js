import { createVue, destroyVM, triggerEvent } from '@/src/utils/test-util';
import { base, disabled, province } from './data';

describe('Cascader', () => {
  let vm;
  const delay = 500;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-cascader
          :options="base">
        </el-cascader>
      `,
      data() {
        return { base };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('默认 click 触发子菜单', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-cascader
          v-model="selectedOptions"
          :options="base">
        </el-cascader>
      `,
          data() {
            return { base, selectedOptions: [] };
          }
        },
        true
      );
      vm.$el.querySelector('.el-input').click();

      setTimeout(() => {
        document
          .querySelector('.el-cascader-menu .el-cascader-menu__item')
          .click();

        setTimeout(() => {
          document
            .querySelector(
              '.el-cascader-menu:nth-child(2) .el-cascader-menu__item'
            )
            .click();
          setTimeout(() => {
            document
              .querySelector(
                '.el-cascader-menu:nth-child(3) .el-cascader-menu__item'
              )
              .click();
            expect(vm.selectedOptions).toEqual([
              'zhinan',
              'shejiyuanze',
              'yizhi'
            ]);
            done();
          }, delay);
        }, delay);
      }, delay);
    });
  });

  test('hover 触发子菜单', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-cascader
          expand-trigger="hover"
          :options="base">
        </el-cascader>
      `,
          data() {
            return { base };
          }
        },
        true
      );
      vm.$el.querySelector('.el-input').click();

      setTimeout(() => {
        triggerEvent(
          document.querySelector('.el-cascader-menu .el-cascader-menu__item'),
          'mouseenter'
        );

        setTimeout(() => {
          expect(
            document.querySelector(
              '.el-cascader-menu:nth-child(2) .el-cascader-menu__item'
            )
          ).not.toBe(null);
          expect(
            document.querySelector(
              '.el-cascader-menu:nth-child(3) .el-cascader-menu__item'
            )
          ).toBe(null);
          done();
        }, delay);
      }, delay);
    });
  });

  test('禁用选项', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-cascader
          :options="disabled">
        </el-cascader>
      `,
          data() {
            return { disabled };
          }
        },
        true
      );
      vm.$el.querySelector('.el-input').click();

      setTimeout(() => {
        expect(
          document
            .querySelector('.el-cascader-menu .el-cascader-menu__item')
            .classList.contains('is-disabled')
        ).toBe(true);

        triggerEvent(
          document.querySelector('.el-cascader-menu .el-cascader-menu__item'),
          'mouseenter'
        );
        setTimeout(() => {
          expect(
            document.querySelector(
              '.el-cascader-menu:nth-child(2) .el-cascader-menu__item'
            )
          ).toBe(null);
          done();
        }, delay);
      }, delay);
    });
  });

  test('默认值', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-cascader
          v-model="selectOptions"
          :options="base">
        </el-cascader>
      `,
        data() {
          return { base, selectOptions: ['zhinan', 'shejiyuanze', 'yizhi'] };
        }
      });
      expect(
        vm.$el.querySelector('.el-cascader__label').innerHTML
      ).toMatchSnapshot();
      done();
    });
  });

  test('选择即改变', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-cascader
          change-on-select
          :options="base">
        </el-cascader>
      `,
          data() {
            return { base };
          }
        },
        true
      );

      vm.$el.querySelector('.el-input').click();

      setTimeout(() => {
        document.querySelector('.el-cascader-menu__item').click();
        setTimeout(() => {
          expect(
            vm.$el.querySelector('.el-cascader__label').innerHTML
          ).toMatchSnapshot();
          done();
        }, delay);
      }, delay);
    });
  });

  test('动态加载', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-cascader
          :options="province"
          :props="props"
          @active-item-change="getCity">
        </el-cascader>
      `,
          data() {
            return {
              province,
              props: {
                value: 'label',
                children: 'cities'
              }
            };
          },
          methods: {
            getCity() {
              return this.province.map(val => {
                val.cities = [{ label: 'city1' }, { label: 'city2' }];
                return val;
              });
            }
          }
        },
        true
      );

      vm.$el.querySelector('.el-input').click();

      setTimeout(() => {
        document.querySelector('.el-cascader-menu__item').click();
        setTimeout(() => {
          expect(
            document.querySelector(
              '.el-cascader-menu:nth-child(2) .el-cascader-menu__item'
            )
          ).toMatchSnapshot();
          done();
        }, delay);
      }, delay);
    });
  });
});

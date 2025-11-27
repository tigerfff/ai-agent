import { createVue, destroyVM, triggerClick } from '@/src/utils/test-util';

describe('InputNumber', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-input-number v-model="number" />
      `,
      data() {
        return { number: 1 };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', () => {
    vm = createVue({
      template: `
        <el-input-number v-model="number" :min="1" :max="10" />
      `,
      data() {
        return { number: 1 };
      }
    });
    vm.number = -1;
    vm.$nextTick(() => {
      expect(vm.$el.querySelector('input').value).toBe('1');
      expect(
        vm.$el.querySelector('.el-input-number__decrease').className
      ).toContain('is-disabled');

      vm.number = 20;
      vm.$nextTick(() => {
        expect(vm.$el.querySelector('input').value).toBe('10');
        expect(
          vm.$el.querySelector('.el-input-number__increase').className
        ).toContain('is-disabled');
      });
    });
  });

  test('超出最小值', async () => {
    vm = createVue({
      template: `
      <el-input-number v-model="number" :min="10" :max="99" />
      `,
      data() {
        return { number: 10 };
      }
    });
    vm.number = 5;
    await Promise.resolve();
    expect(vm.$el.querySelector('input').value).toBe('10');
  });

  test('超出最大值', async () => {
    vm = createVue({
      template: `
      <el-input-number v-model="number" :min="10" :max="99" />
      `,
      data() {
        return { number: 10 };
      }
    });
    vm.number = 500;
    await Promise.resolve();
    expect(vm.$el.querySelector('input').value).toBe('99');
  });

  test('设置范围10-99，测试输入56', async () => {
    vm = createVue({
      template: `
      <el-input-number v-model="number" :min="10" :max="99" />
      `,
      data() {
        return { number: 10 };
      }
    });
    vm.number = 5;
    // 异步不应该用`nextTick`，应该用await吧？
    // 上面"基础用法"用了`nextTick`，造成没通过也标注为PASS
    await Promise.resolve();
    expect(vm.$el.querySelector('input').value).toBe('10');
    vm.number = 56;
    await Promise.resolve();
    expect(vm.$el.querySelector('input').value).toBe('56');
  });

  test('禁用状态', () => {
    vm = createVue({
      template: `
        <el-input-number v-model="number" disabled />
      `,
      data() {
        return { number: 1 };
      }
    });
    expect(vm.$el.className).toContain('is-disabled');
    expect(vm.$el.querySelector('.el-input').className).toContain(
      'is-disabled'
    );
    expect(
      vm.$el.querySelector('.el-input-number__decrease').className
    ).toContain('is-disabled');
    expect(
      vm.$el.querySelector('.el-input-number__increase').className
    ).toContain('is-disabled');
  });

  test('步数', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-input-number v-model="number" :step="2" />
      `,
        data() {
          return { number: 1 };
        }
      });
      triggerClick(vm.$el.querySelectorAll('button')[1]);
      setTimeout(() => {
        expect(vm.number).toBe(3);
        done();
      }, 150);
    });
  });

  test('测试 focus 和 blur 事件', () => {
    vm = createVue({
      template: `
        <el-input-number v-model="number"  @focus="handleFocus" @blur="handleBlur" />
      `,
      data() {
        return { number: 1, event: '' };
      },
      methods: {
        handleFocus() {
          this.event = 'focus';
        },
        handleBlur() {
          this.event = 'blur';
        }
      }
    });
    vm.$el.querySelector('.el-input input').focus();
    expect(vm.event).toBe('focus');
    vm.$el.querySelector('.el-input input').blur();
    expect(vm.event).toBe('blur');
  });

  test('测试 change 事件', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-input-number v-model="number"  @change="handleChange" />
      `,
        data() {
          return { number: 1, event: '' };
        },
        methods: {
          handleChange() {
            this.event = 'change';
          }
        }
      });
      triggerClick(vm.$el.querySelectorAll('button')[1]);
      setTimeout(() => {
        expect(vm.event).toBe('change');
        done();
      }, 150);
    });
  });
});

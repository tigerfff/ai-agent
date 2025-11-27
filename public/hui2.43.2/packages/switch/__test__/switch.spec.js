import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Switch', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-switch v-model="value" > </el-switch>
      `,
      data() {
        return {
          value: true
        };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', () => {
    vm = createVue({
      template: `
        <el-switch v-model="value" />
      `,
      data() {
        return {
          value: true
        };
      }
    });
    expect(vm.$el.className).toContain('is-checked');
  });

  test('三种大小', () => {
    vm = createVue({
      template: `
        <div>
          <el-switch v-model="value4" />
          <el-switch v-model="value5" size="small" />
          <el-switch v-model="value6" size="mini" />
        </div>
      `,
      data() {
        return {
          value4: true,
          value5: true,
          value6: true
        };
      }
    });
    const $switchs = vm.$el.querySelectorAll('.el-switch');
    expect($switchs[0].className).toContain('el-switch--medium');
    expect($switchs[1].className).toContain('el-switch--small');
    expect($switchs[2].className).toContain('el-switch--mini');
  });

  test('禁用状态', () => {
    vm = createVue({
      template: `
        <div>
          <el-switch v-model="value7" disabled />
          <el-switch v-model="value8" disabled />
        </div>
      `,
      data() {
        return {
          value7: true,
          value8: false
        };
      }
    });
    const $switchs = vm.$el.querySelectorAll('.el-switch');
    expect($switchs[0].className).toContain('is-checked');
    expect($switchs[0].className).toContain('is-disabled');
    expect($switchs[1].className).toContain('is-disabled');
  });

  test('扩展的 value 类型', () => {
    vm = createVue({
      template: `
        <el-switch
          v-model="value9"
          active-color="#2080f7"
          inactive-color="#CCCCCC"
          active-value="100"
          inactive-value="0"
        />
      `,
      data() {
        return {
          value9: '100'
        };
      }
    });
    expect(vm.$el.querySelector('.el-switch__core').style.backgroundColor).toBe(
      'rgb(32, 128, 247)'
    );
    vm.$el.click();
    vm.$nextTick(() => {
      vm.value9 = '0';
      expect(
        vm.$el.querySelector('.el-switch__core').style.backgroundColor
      ).toBe('rgb(204, 204, 204)');
    });
  });

  test('测试 change 事件', () => {
    vm = createVue({
      template: `
        <el-switch v-model="value" @change="handleChange" />
      `,
      data() {
        return { value: true, event: '' };
      },
      methods: {
        handleChange() {
          this.event = 'change';
        }
      }
    });
    vm.$el.click();
    expect(vm.event).toBe('change');
  });

  test('测试 focus 和 blur 事件', () => {
    vm = createVue({
      template: `
        <el-switch v-model="value" allow-focus @focus="handleFocus" @blur="handleBlur" />
      `,
      data() {
        return { value: true, event: '' };
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
    vm.$el.querySelector('input').focus();
    expect(vm.event).toBe('focus');
    vm.$el.querySelector('input').blur();
    expect(vm.event).toBe('blur');
  });
});

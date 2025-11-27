import { createVue, destroyVM } from '@/src/utils/test-util';

describe('IpInput', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <h-ip-input v-model="ip" />
      `,
      data() {
        return { ip: '192.168.0.1' };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', () => {
    vm = createVue({
      template: `
        <h-ip-input v-model="ip" tips="分为4段，每段范围为0~255的整数，参考格式：127.0.0.1。" />
      `,
      data() {
        return { ip: '192.168.0.1' };
      }
    });
    const $inputs = vm.$el.querySelectorAll('input');
    expect($inputs[0].value).toBe('192');
    expect($inputs[1].value).toBe('168');
    expect($inputs[2].value).toBe('0');
    expect($inputs[3].value).toBe('1');
  });

  test('禁用状态', () => {
    vm = createVue({
      template: `
        <h-ip-input v-model="ip" disabled />
      `,
      data() {
        return { ip: '192.168.0.1' };
      }
    });
    const $elInputs = vm.$el.querySelectorAll('.el-input');
    const $inputs = vm.$el.querySelectorAll('input');
    expect($elInputs[0].className).toContain('is-disabled');
    expect($elInputs[1].className).toContain('is-disabled');
    expect($elInputs[2].className).toContain('is-disabled');
    expect($elInputs[3].className).toContain('is-disabled');
    expect($inputs[0].disabled).toBeTruthy();
    expect($inputs[1].disabled).toBeTruthy();
    expect($inputs[2].disabled).toBeTruthy();
    expect($inputs[3].disabled).toBeTruthy();
  });

  test('指定每项宽度', () => {
    vm = createVue({
      template: `
      <h-ip-input v-model="ip" item-width="50px" />
      `,
      data() {
        return { ip: '192.168.0.1' };
      }
    });
    const $elInputs = vm.$el.querySelectorAll('.el-input');
    expect($elInputs[0].style.width).toBe('50px');
    expect($elInputs[1].style.width).toBe('50px');
    expect($elInputs[2].style.width).toBe('50px');
    expect($elInputs[3].style.width).toBe('50px');
  });
});

import { createVue } from '@/src/utils/test-util';

describe('Alert', () => {
  let vm;
  const onClose = jest.fn();

  beforeEach(() => {
    vm = createVue({
      template: `
        <el-alert title="成功提示的文案" type="success" simple show-icon v-on:close="onClose"></el-alert>
      `,
      methods: {
        onClose
      }
    });
  });
  it('snapshot test', () => {
    expect(vm.$el.outerHTML).toMatchSnapshot();

    vm = createVue({
      template: `
        <el-alert type="error" center :closable="false">
          <span slot="title" simple>系统部分授权将于2019-03-26 23:59:59过期，请联系管理员，详情请查看<a href="#" class="link">运行管理中心</a>。</span>
        </el-alert>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
  it('close test', () => {
    vm.$el.querySelector('.el-alert__closebtn').click();

    expect(vm.$children[0].visible).toBe(false);
    expect(onClose).toBeCalled();
  });
});

import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Badge', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-badge :value="12">
          <el-button size="small">评论</el-button>
        </el-badge>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('最大值', () => {
    vm = createVue({
      template: `
        <el-badge :value="200" :max="99">
          <el-button size="small">评论</el-button>
        </el-badge>
      `
    });

    expect(vm.$el.querySelector('.el-badge__content').innerHTML.trim()).toBe(
      '99+'
    );
  });

  test('自定义内容', () => {
    vm = createVue({
      template: `
        <el-badge value="new">
          <el-button size="small">评论</el-button>
        </el-badge>
      `
    });

    expect(vm.$el.querySelector('.el-badge__content').innerHTML.trim()).toBe(
      'new'
    );
  });
});

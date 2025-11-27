import { createVue, destroyVM } from '@/src/utils/test-util';

describe('CheckboxButton', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-checkbox-group>
          <el-checkbox label="复选框 A"></el-checkbox>
          <el-checkbox label="复选框 B"></el-checkbox>
          <el-checkbox label="复选框 C"></el-checkbox>
          <el-checkbox label="禁用" disabled></el-checkbox>
          <el-checkbox label="选中且禁用" disabled></el-checkbox>
        </el-checkbox-group>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});

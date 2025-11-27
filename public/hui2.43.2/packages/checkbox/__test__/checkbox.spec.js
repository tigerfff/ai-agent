import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Checkbox', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <div>
          <el-checkbox v-model="checked">备选项</el-checkbox>
          <el-checkbox v-model="checked" disabled>备选项1</el-checkbox>
        </div>
      `,
      data() {
        return { checked: false };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});

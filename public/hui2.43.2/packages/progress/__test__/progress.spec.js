import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Progress', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue(
      {
        template: `
        <div>
          <el-progress :percentage="0"></el-progress>
          <el-progress :percentage="100"></el-progress>
          <el-progress :percentage="50" status="exception" status-text="异常"></el-progress>
        </div>
      `
      },
      true
    );
    expect(
      vm.$el.querySelectorAll('.el-progress-bar__inner')[0].style.width
    ).toBe('0%');
    expect(
      vm.$el.querySelectorAll('.el-progress-bar__inner')[1].style.width
    ).toBe('100%');
    expect(
      vm.$el.querySelectorAll('.el-progress-bar__inner')[2].style.width
    ).toBe('50%');
  });
});

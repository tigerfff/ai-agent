import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Dialog', () => {
  let vm;
  const timeout = 200;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-dialog>
          你好啊
        </el-dialog>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基本用法', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-dialog :visible.sync="dialogVisible">
          <span>你好啊</span>
        </el-dialog>
      `,
          data() {
            return {
              dialogVisible: true
            };
          }
        },
        true
      );
      expect(document.querySelector('.el-dialog__wrapper').style.display).toBe(
        ''
      );

      vm.dialogVisible = false;
      setTimeout(() => {
        expect(
          document.querySelector('.el-dialog__wrapper').style.display
        ).toBe('none');
        done();
      }, timeout);
    });
  });

  test('指定宽度', () => {
    vm = createVue({
      template: `
        <el-dialog :visible.sync="dialogFormVisible" :area="[480,300]">
          你好啊
        </el-dialog>
      `,
      data() {
        return {
          dialogFormVisible: true
        };
      }
    });
    expect(document.querySelector('.el-dialog').style.height).toBe('300px');
    expect(document.querySelector('.el-dialog').style.width).toBe('480px');
  });
});

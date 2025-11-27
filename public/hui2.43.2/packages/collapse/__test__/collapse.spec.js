import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Collapse', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
      <el-collapse>
        <el-collapse-item title="a" name="1">
          aaa
        </el-collapse-item>
        <el-collapse-item title="b" name="2">
          bbb
        </el-collapse-item>
      </el-collapse>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基本用法', () => {
    return new Promise(done => {
      const mockCallback = jest.fn();
      vm = createVue({
        template: `
      <el-collapse v-model="activeNames" @change="mockCallback">
        <el-collapse-item title="a" name="1">
          aaa
        </el-collapse-item>
        <el-collapse-item title="b" name="2">
          bbb
        </el-collapse-item>
      </el-collapse>
      `,
        data() {
          return { activeNames: ['1'] };
        },
        methods: { mockCallback }
      });

      expect(
        vm.$el.querySelectorAll('.el-collapse-item__wrap')[0].style.display
      ).toBe('');
      expect(
        vm.$el.querySelectorAll('.el-collapse-item__wrap')[1].style.display
      ).toBe('none');

      vm.$el.querySelectorAll('.el-collapse-item__header')[1].click();
      setTimeout(() => {
        expect(
          vm.$el.querySelectorAll('.el-collapse-item__wrap')[0].style.display
        ).toBe('');
        expect(
          vm.$el.querySelectorAll('.el-collapse-item__wrap')[1].style.display
        ).toBe('');
        expect(mockCallback.mock.calls.length).toBe(1);
        done();
      }, 200);
    });
  });

  test('手风琴效果', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item title="a" name="1">
          aaa
        </el-collapse-item>
        <el-collapse-item title="b" name="2">
          bbb
        </el-collapse-item>
      </el-collapse>
      `,
        data() {
          return { activeNames: '1' };
        }
      });
      vm.$el.querySelectorAll('.el-collapse-item__header')[1].click();
      setTimeout(() => {
        expect(
          vm.$el.querySelectorAll('.el-collapse-item__wrap')[0].style.display
        ).toBe('none');
        expect(
          vm.$el.querySelectorAll('.el-collapse-item__wrap')[1].style.display
        ).toBe('');
        done();
      }, 200);
    });
  });
});

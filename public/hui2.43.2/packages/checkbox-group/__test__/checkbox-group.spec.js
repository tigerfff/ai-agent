import { createVue, destroyVM } from '@/src/utils/test-util';

describe('CheckboxGroup', () => {
  let vm;
  const cityOptions = ['上海', '北京', '广州', '深圳'];

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-checkbox-group>
          <el-checkbox v-for="city in cities" :label="city" :key="city">{{city}}</el-checkbox>
        </el-checkbox-group>
      `,
      data() {
        return { cities: cityOptions };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  // TODO: indeterminate

  test('可选项目数量的限制', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-checkbox-group v-model="checkList" :min="1" :max="2">
          <el-checkbox label="a" ref="a"></el-checkbox>
          <el-checkbox label="b" ref="b"></el-checkbox>
          <el-checkbox label="c" ref="c"></el-checkbox>
          <el-checkbox label="d" ref="d"></el-checkbox>
        </el-checkbox-group>
      `,
          data() {
            return {
              checkList: ['a', 'b']
            };
          }
        },
        true
      );

      expect(vm.checkList.length).toBe(2);
      vm.$refs.c.$el.click();

      vm.$nextTick(_ => {
        expect(vm.checkList.length).toBe(2);
        vm.$refs.b.$el.click();
        vm.$nextTick(_ => {
          vm.$refs.a.$el.click();

          expect(vm.checkList.length).toBe(1);
          done();
        });
      });
    });
  });
});

import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Form', () => {
  let vm;
  const timeout = 100;

  afterEach(() => {
    destroyVM(vm);
  });

  test('标签位置', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <div>
          <el-form ref="normal">
            <el-form-item label="活动名称">
              <el-input></el-input>
            </el-form-item>
          </el-form>
          <el-form label-position="top" ref="top">
            <el-form-item label="活动名称">
              <el-input></el-input>
            </el-form-item>
          </el-form>
        </div>
      `
        },
        true
      );

      expect(vm.$el.outerHTML).toMatchSnapshot();

      const normal = vm.$refs.normal;
      const top = vm.$refs.top;

      expect(top.$el.className).toMatch(/el-form--label-top/);
      expect(normal.$el.className).not.toMatch(/el-form--label-top/);
      done();
    });
  });

  test('提示信息', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-form>
          <el-form-item label="基本用法" >
            <el-input tips="这是个最基本的提示信息" ></el-input>
          </el-form-item>
        </el-form>
      `
        },
        true
      );

      vm.$el.querySelector('input').focus();

      setTimeout(() => {
        expect(document.querySelector('.el-popover').style.display).toBe('');
        done();
      }, timeout);
    });
  });

  test('表单验证', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
          <el-form :model="form" :rules="rules" ref="form">
            <el-form-item label="活动名称" prop="name" ref="field">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="活动名称" prop="ellipsis" ref="ellipsis" :showEllipsis=true>
              <el-input v-model="form.name"></el-input>
            </el-form-item>
          </el-form>
        `,
          data() {
            return {
              form: {
                name: ''
              },
              rules: {
                name: [
                  {
                    required: true,
                    message: '请输入活动名称',
                    trigger: 'change',
                    min: 3,
                    max: 6
                  }
                ],
                ellipsis: [
                  {
                    required: true,
                    message:
                      '这是一条很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的错误信息',
                    trigger: 'blur'
                  }
                ]
              }
            };
          },
          methods: {
            setValue(value) {
              this.form.name = value;
            }
          }
        },
        true
      );

      vm.$refs.form.validate(valid => {
        const field = vm.$refs.field;
        const ellipsis = vm.$refs.ellipsis;
        expect(valid).not.toBe(true);
        vm.$refs.form.$nextTick(_ => {
          expect(field.validateMessage).toBe('请输入活动名称');

          expect(ellipsis.validateMessage.length > 20).toBeTruthy();
          expect(ellipsis.$el.outerHTML.includes('el-form-item__ellipsis')).toBeTruthy();
          vm.setValue('aaaaa');

          setTimeout(() => {
            expect(field.validateMessage).toBe('');
            vm.setValue('aa');

            setTimeout(() => {
              expect(field.validateMessage).toBe('请输入活动名称');
              done();
            }, timeout);
          }, timeout);
        });
      });
    });
  });
});

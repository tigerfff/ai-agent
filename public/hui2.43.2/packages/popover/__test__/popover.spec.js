import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Popover', () => {
  const timeout = 200;
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('click test', () => {
    return new Promise(done => {
      const show = jest.fn();
      const hide = jest.fn();
      vm = createVue(
        {
          template: `
        <div>
          <el-popover
            @show="show"
            @hide="hide"
            ref="popover2"
            placement="bottom"
            title="标题"
            width="200"
            trigger="click"
            content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。"
          ></el-popover>
          <el-button v-popover:popover2>click 激活</el-button>
        </div>
      `,
          methods: {
            show,
            hide
          }
        },
        true
      );
      expect(document.body.outerHTML).toMatchSnapshot();
      expect(show).not.toBeCalled();
      expect(hide).not.toBeCalled();
      expect(document.querySelector('.el-popover').style.display).toBe('none');

      document.querySelector('button').click();
      vm.$nextTick(_ => {
        expect(document.querySelector('.el-popover').style.display).toBe('');
        expect(show).toBeCalled();

        document.querySelector('button').click();
        // TODO: 这里用nextTick不行，真的是奇怪 xx
        setTimeout(() => {
          expect(document.querySelector('.el-popover').style.display).toBe(
            'none'
          );
          expect(hide).toBeCalled();
          done();
        }, timeout);
      });
    });
  });

  test('nest test', () => {
    vm = createVue(
      {
        template: `
        <div>
          <el-popover ref="popover5" placement="top" width="160" v-model="visible2">
            <p>这是一段内容这是一段内容确定删除吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button type="link" size="mini" @click="visible2 = false">
                确定
              </el-button>
              <el-button size="mini" type="text" @click="visible2 = false">
                取消
              </el-button>
            </div>
          </el-popover>
          <el-button v-popover:popover5>删除</el-button>
        </div>
      `,
        data() {
          return {
            visible2: false
          };
        }
      },
      true
    );
    expect(document.body.outerHTML).toMatchSnapshot();
  });
});

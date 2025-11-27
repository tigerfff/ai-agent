import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Card', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <div>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span style="line-height: 36px;">卡片名称</span>
              <el-button style="float: right;" type="primary">操作按钮</el-button>
            </div>
            <div v-for="o in 4" :key="o" class="text card-item">
              {{'列表内容 ' + o }}
            </div>
          </el-card>

          <el-row>
            <el-col
              :span="8"
              v-for="(o, index) in 2"
              :key="o"
              :offset="index > 0 ? 2 : 0"
            >
              <el-card :body-style="{ padding: '0px' }">
                <img :src="'/images/hamburger.png'" class="image" />
                <div style="padding: 14px;">
                  <span>好吃的汉堡</span>
                  <div class="bottom clearfix">
                    <time class="time">2020-01-01</time>
                    <el-button type="text" class="button">操作按钮</el-button>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});

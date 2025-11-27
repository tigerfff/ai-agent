import {
  createVue,
  destroyVM,
  triggerEvent,
  triggerClick
} from '@/src/utils/test-util';

/* 以下事件无法测试: drag-end */

describe('Slider', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-slider v-model="value" />
      `,
      data() {
        return { value: 0 };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', async () => {
    vm = createVue({
      template: `
        <div>
          <div class="block">
            <span class="demonstration">默认</span>
            <el-slider v-model="value1"></el-slider>
          </div>
          <div class="block">
            <span class="demonstration">自定义初始值</span>
            <el-slider v-model="value2"></el-slider>
          </div>
          <div class="block">
            <span class="demonstration">隐藏 Tooltip</span>
            <el-slider v-model="value3" :show-tooltip="false"></el-slider>
          </div>
          <div class="block">
            <span class="demonstration">格式化 Tooltip</span>
            <el-slider v-model="value4" :format-tooltip="formatTooltip"></el-slider>
          </div>
          <div class="block">
            <span class="demonstration">禁用</span>
            <el-slider v-model="value5" disabled></el-slider>
          </div>
        </div>
      `,
      data() {
        return {
          value1: 0,
          value2: 50,
          value3: 36,
          value4: 48,
          value5: 42
        };
      },
      methods: {
        formatTooltip(val) {
          return val / 100;
        }
      }
    });
    const $sliders = vm.$el.querySelectorAll('.el-slider');
    await Promise.resolve();
    expect(
      $sliders[0].querySelector('.el-slider__button-wrapper').style.left
    ).toBe('0%');
    expect(
      $sliders[1].querySelector('.el-slider__button-wrapper').style.left
    ).toBe('50%');
    expect($sliders[4].querySelector('.el-slider__runway').className).toContain(
      'disabled'
    );
    /* 隐藏 Tooltip 和 格式化 Tooltip 需要鼠标移动到滑块上，无法测试 */
  });

  test('离散值', async () => {
    vm = createVue({
      template: `
        <div>
          <div class="block">
            <span class="demonstration">不显示间断点</span>
            <el-slider
              v-model="value6"
              :step="10">
            </el-slider>
          </div>
          <div class="block">
            <span class="demonstration">显示间断点</span>
            <el-slider
              v-model="value7"
              :step="10"
              show-stops>
            </el-slider>
          </div>
        </div>
      `,
      data() {
        return {
          value6: 0,
          value7: 0
        };
      }
    });
    const $sliders = vm.$el.querySelectorAll('.el-slider');
    await Promise.resolve();
    expect($sliders[1].querySelectorAll('.el-slider__stop-wrap').length).toBe(
      11
    );
    /* 不显示间断点 需要鼠标拖动滑块看到效果，无法测试 */
  });

  test('带有输入框', async () => {
    vm = createVue({
      template: `
        <el-slider
          v-model="value8"
          show-input>
        </el-slider>
      `,
      data() {
        return {
          value8: 0
        };
      }
    });
    expect(vm.$el.className).toContain('el-slider--with-input');
    vm.value8 = 10;
    await Promise.resolve();
    expect(vm.$el.querySelector('.el-slider__button-wrapper').style.left).toBe(
      '10%'
    );
    expect(vm.$el.querySelector('.el-input input').value).toBe('10');
  });

  test('微调滑块', async done => {
    vm = createVue({
      template: `
        <el-slider
          show-button
          v-model="value"
          :step="2"
          :max="10">
        </el-slider>
      `,
      data() {
        return {
          value: 1
        };
      }
    });
    await Promise.resolve();
    expect(vm.$el.className).toContain('el-slider--with-button');
    expect(vm.$el.querySelector('.el-slider__button-wrapper').style.left).toBe(
      '10%'
    );
    triggerClick(vm.$el.querySelectorAll('button')[1]);
    setTimeout(() => {
      expect(
        vm.$el.querySelector('.el-slider__button-wrapper').style.left
      ).toBe('30%');
      done();
    }, 150);
  });

  test('范围选择', async () => {
    vm = createVue({
      template: `
        <el-slider
          v-model="value9"
          range
          :max="10">
        </el-slider>
      `,
      data() {
        return {
          value9: [3, 8]
        };
      }
    });
    await Promise.resolve();
    expect(vm.$el.querySelector('.el-slider__bar').style.width).toBe('50%');
    expect(vm.$el.querySelector('.el-slider__bar').style.left).toBe('30%');
    expect(
      vm.$el.querySelectorAll('.el-slider__button-wrapper')[0].style.left
    ).toBe('30%');
    expect(
      vm.$el.querySelectorAll('.el-slider__button-wrapper')[1].style.left
    ).toBe('80%');
  });

  test('范围选择带输入框', async () => {
    vm = createVue({
      template: `
        <el-slider
          v-model="value9"
          show-input
          range
          :max="10">
        </el-slider>
      `,
      data() {
        return {
          value9: [3, 8]
        };
      }
    });
    await Promise.resolve();
    const $rangeInput = document.querySelectorAll('.el-slider__range-input');
    expect($rangeInput[0].querySelector('input').value).toBe('3');
    expect($rangeInput[1].querySelector('input').value).toBe('8');
  });

  test('竖向模式', async () => {
    vm = createVue({
      template: `
        <el-slider
          v-model="value11"
          vertical
          :max="10"
          height="200px">
        </el-slider>
      `,
      data() {
        return {
          value11: 4
        };
      }
    });
    await Promise.resolve();
    expect(vm.$el.className).toContain('is-vertical');
    expect(vm.$el.querySelector('.el-slider__runway').style.height).toBe(
      '200px'
    );
    expect(vm.$el.querySelector('.el-slider__bar').style.height).toBe('40%');
  });

  test('测试 change 事件', async () => {
    vm = createVue({
      template: `
        <el-slider v-model="value" show-input @change="handleChange" />
      `,
      data() {
        return {
          value: 0,
          event: ''
        };
      },
      methods: {
        handleChange() {
          this.event = 'change';
        }
      }
    });
    vm.value = 5;
    await Promise.resolve();
    expect(vm.event).toBe('change');
  });

  test('测试 drag-start 事件', async () => {
    vm = createVue({
      template: `
        <el-slider v-model="value" @drag-start="handleDragStart" />
      `,
      data() {
        return {
          value: 0,
          event: ''
        };
      },
      methods: {
        handleDragStart() {
          this.event = 'drag-start';
        }
      }
    });
    await Promise.resolve();
    triggerEvent(
      vm.$el.querySelector('.el-slider__button-wrapper'),
      'mousedown'
    );
    await Promise.resolve();
    expect(vm.event).toBe('drag-start');
  });

  test('测试 before-click 和 slider-click 事件', async () => {
    vm = createVue({
      template: `
        <el-slider v-model="value" @before-click="handleBeforeClick" @slider-click="handleSliderClick" />
      `,
      data() {
        return {
          value: 0,
          event1: '',
          event2: ''
        };
      },
      methods: {
        handleBeforeClick() {
          this.event1 = 'before-click';
        },
        handleSliderClick() {
          this.event2 = 'slider-click';
        }
      }
    });
    await Promise.resolve();
    vm.$el.querySelector('.el-slider__runway-click-area').click();
    await Promise.resolve();
    expect(vm.event1).toBe('before-click');
    expect(vm.event2).toBe('slider-click');
  });
});

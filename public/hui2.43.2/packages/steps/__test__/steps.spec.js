import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Steps', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-input-number v-model="number" />
      `,
      data() {
        return { number: 1 };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', async () => {
    vm = createVue({
      template: `
        <div>
          <el-row>
            <el-col :span="100">
              <el-steps :space="140" :active="active" finish-status="success">
                <el-step title="步骤 1"></el-step>
                <el-step title="步骤 2"></el-step>
                <el-step title="步骤 3"></el-step>
              </el-steps>
            </el-col>
          </el-row>
          <el-button @click="next">下一步</el-button>
        </div>
      `,
      data() {
        return {
          active: 0
        };
      },
      methods: {
        next() {
          if (this.active++ > 1) this.active = 0;
        }
      }
    });
    const $steps = vm.$el.querySelectorAll('.el-step__head');
    await Promise.resolve();
    expect($steps[0].className).toContain('is-process');
    expect($steps[1].className).toContain('is-wait');
    expect($steps[2].className).toContain('is-wait');

    vm.$el.querySelector('.el-button').click();
    await Promise.resolve();
    expect($steps[0].className).toContain('is-success');
    expect($steps[1].className).toContain('is-process');
    expect($steps[2].className).toContain('is-wait');

    vm.$el.querySelector('.el-button').click();
    await Promise.resolve();
    expect($steps[0].className).toContain('is-success');
    expect($steps[1].className).toContain('is-success');
    expect($steps[2].className).toContain('is-process');
  });

  test('可点击的步骤条 & 测试 step-click 事件', async () => {
    vm = createVue({
      template: `
        <el-row>
          <el-col :span="100">
            <el-steps :space="140" :active="active" finish-status="success" @step-click="hdClick">
              <el-step title="步骤 1"></el-step>
              <el-step title="步骤 2"></el-step>
              <el-step title="步骤 3"></el-step>
            </el-steps>
          </el-col>
        </el-row>
      `,
      data() {
        return {
          active: 0
        };
      },
      methods: {
        hdClick(index) {
          if (index === 2) {
            return;
          }
          this.active = index;
        }
      }
    });
    const $steps = vm.$el.querySelectorAll('.el-step__head');

    await Promise.resolve();
    expect($steps[0].className).toContain('is-process');
    expect($steps[1].className).toContain('is-wait');
    expect($steps[2].className).toContain('is-wait');

    $steps[1].click();
    await Promise.resolve();
    expect($steps[0].className).toContain('is-success');
    expect($steps[1].className).toContain('is-process');
    expect($steps[2].className).toContain('is-wait');

    $steps[2].click();
    await Promise.resolve();
    expect($steps[0].className).toContain('is-success');
    expect($steps[1].className).toContain('is-process');
    expect($steps[2].className).toContain('is-wait');

    $steps[0].click();
    await Promise.resolve();
    expect($steps[0].className).toContain('is-process');
    expect($steps[1].className).toContain('is-wait');
    expect($steps[2].className).toContain('is-wait');
  });

  test('有描述的步骤条', () => {
    vm = createVue({
      template: `
        <el-steps :space="140" :active="active" finish-status="finish">
          <el-step title="步骤 1" description="填写基本信息"></el-step>
          <el-step title="步骤 2" description="添加设备"></el-step>
          <el-step title="步骤 3" description="添加出入口"></el-step>
        </el-steps>
      `,
      data() {
        return {
          active: 0
        };
      }
    });
    const $steps = vm.$el.querySelectorAll('.el-step');

    expect($steps[0].querySelector('.el-step__title').textContent).toBe(
      '步骤 1'
    );
    expect($steps[1].querySelector('.el-step__title').textContent).toBe(
      '步骤 2'
    );
    expect($steps[2].querySelector('.el-step__title').textContent).toBe(
      '步骤 3'
    );
    expect($steps[0].querySelector('.el-step__description').textContent).toBe(
      '填写基本信息'
    );
    expect($steps[1].querySelector('.el-step__description').textContent).toBe(
      '添加设备'
    );
    expect($steps[2].querySelector('.el-step__description').textContent).toBe(
      '添加出入口'
    );
  });

  test('带图标的步骤条', () => {
    vm = createVue({
      template: `
        <el-steps :space="100" :active="active" finish-status="finish">
          <el-step title="步骤 1" icon="edit"></el-step>
          <el-step title="步骤 2" icon="upload"></el-step>
          <el-step title="步骤 3" icon="picture"></el-step>
        </el-steps>
      `,
      data() {
        return {
          active: 0
        };
      }
    });
    const $steps = vm.$el.querySelectorAll('.el-step__head');

    expect($steps[0].querySelector('.el-step__icon i').className).toContain(
      'h-icon-edit'
    );
    expect($steps[1].querySelector('.el-step__icon i').className).toContain(
      'h-icon-upload'
    );
    expect($steps[2].querySelector('.el-step__icon i').className).toContain(
      'h-icon-picture'
    );
  });

  test('竖式步骤条', async () => {
    vm = createVue({
      template: `
        <el-steps :space="100" :direction="direction" :active="active">
          <el-step title="步骤 1" description="填写基本信息"></el-step>
          <el-step title="步骤 2" description="填写基本信息"></el-step>
          <el-step title="步骤 3" description="填写基本信息"></el-step>
        </el-steps>
      `,
      data() {
        return {
          active: 0,
          direction: 'horizontal'
        };
      }
    });
    expect(vm.$el.className).toContain('is-horizontal');
    vm.direction = 'vertical';
    await Promise.resolve();
    expect(vm.$el.className).toContain('is-vertical');
  });
});

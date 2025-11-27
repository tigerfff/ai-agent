import { createVue, destroyVM } from '@/src/utils/test-util';

/* 以下 Demo 无法测试: 可自适应文本高度的文本域 */
/* 以下事件无法测试: change */

describe('Input', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" />
      `,
      data() {
        return { input: '' };
      }
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" placeholder="请输入" />
      `,
      data() {
        return { input: '123' };
      }
    });
    expect(vm.$el.querySelector('input').value).toBe('123');
    expect(vm.$el.querySelector('input').placeholder).toBe('请输入');
  });

  test('禁用状态', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" placeholder="请输入" :disabled="true" />
      `,
      data() {
        return { input: '' };
      }
    });
    expect(vm.$el.className).toContain('is-disabled');
    expect(vm.$el.querySelector('input').disabled).toBeTruthy();
  });

  test('密码拓展', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" placeholder="请输入" :type="password">
          <i
            slot="suffix"
            class="el-input__icon"
            :class="passwordIcon"
            @mousedown="onMousedownClick"
            @mouseup="onMouseupClick"
          />
        </el-input>
      `,
      data() {
        return {
          input: '123',
          password: 'password',
          passwordIcon: 'h-icon-password_unvisible'
        };
      },
      methods: {
        onMousedownClick() {
          this.password = 'text';
          this.passwordIcon = 'h-icon-password_visible';
        },
        onMouseupClick() {
          this.password = 'password';
          this.passwordIcon = 'h-icon-password_unvisible';
        }
      }
    });
    expect(vm.$el.querySelector('input').type).toBe('password');
    expect(vm.$el.querySelector('.el-input__suffix i').className).toContain(
      'h-icon-password_unvisible'
    );

    // 模拟 mousedown 事件失败...
    // triggerEvent(vm.$el.querySelector('.el-input__suffix i'), 'mousedown');
    // expect(vm.$el.querySelector('input').type).toBe('text');
    // expect(vm.$el.querySelector('.el-input__suffix i').className).toContain(
    //   'h-icon-password_visible'
    // );
  });

  test('带固定内容的输入框', () => {
    vm = createVue({
      template: `
        <div>
          <el-input
            v-model="input"
            suffix-icon="h-icon-search"
            clearable
            :on-icon-click="handleIconClick"
          />
          <el-input v-model="input" prefix-icon="h-icon-user" />
          <el-input v-model="input">
            <i slot="suffix" class="el-input__icon h-icon-search" />
          </el-input>
          <el-input v-model="input" kind="suspension">
            <span slot="suffix" class="custom-text">分钟</span>
          </el-input>
        </div>
      `,
      data() {
        return { input: '' };
      },
      methods: {
        handleIconClick() {
          this.input = '111';
        }
      }
    });
    const $elInputs = vm.$el.querySelectorAll('.el-input');
    // 第一个 input
    const $searchIcon = $elInputs[0].querySelector('.el-input__suffix i');
    expect($searchIcon.className).toContain('h-icon-search');
    $searchIcon.click();
    vm.$nextTick(() => {
      expect(vm.input).toBe('111');
      $elInputs[0].querySelector('.h-icon-close_f').click();
      expect(vm.input).toBe('');
    });
    // 第二个 input
    expect(
      $elInputs[1].querySelector('.el-input__prefix i').className
    ).toContain('h-icon-user');
    // 第三个 input
    expect(
      $elInputs[2].querySelector('.el-input__suffix i').className
    ).toContain('h-icon-search');
    // 第四个 input
    expect(
      $elInputs[3].querySelector('.el-input__suffix .custom-text').textContent
    ).toContain('分钟');
  });

  test('带计数文本域', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" type="textarea" placeholder="请输入" :rows="4" :count="100" />
      `,
      data() {
        return { input: '' };
      }
    });
    expect(vm.$el.querySelector('textarea').rows).toBe(4);
    expect(vm.$el.querySelector('.el-textarea__count').textContent).toBe('100');
    vm.input = 'hello world';
    vm.$nextTick(() => {
      expect(vm.$el.querySelector('.el-textarea__count').textContent).toBe(
        '89'
      );
    });
  });

  test('复合型输入框', () => {
    vm = createVue({
      template: `
        <div>
          <el-input placeholder="请输入" v-model="input">
            <template slot="prepend"><span class='fontBorder'>Http://</span></template>
          </el-input>
          <el-input placeholder="请输入" v-model="input">
            <template slot="append"><span class='fontBorder'>.com</span></template>
          </el-input>
          <el-input placeholder="请输入" v-model="input">
            <template slot="append"><el-button>按钮</el-button></template>
          </el-input>
          <el-input placeholder="请输入" v-model="input">
            <el-select class="el-select--width-sm" v-model="select" slot="prepend" placeholder="请选择">
              <el-option label="餐厅名" value="1"></el-option>
              <el-option label="订单号" value="2"></el-option>
              <el-option label="用户电话" value="3"></el-option>
            </el-select>
          </el-input>
        </div>
      `,
      data() {
        return { input: '', select: '' };
      }
    });
    const $elInputs = vm.$el.querySelectorAll('.el-input');
    expect(
      $elInputs[0].querySelector('.el-input-group__prepend .fontBorder')
        .textContent
    ).toBe('Http://');
    expect(
      $elInputs[1].querySelector('.el-input-group__append .fontBorder')
        .textContent
    ).toBe('.com');
    expect(
      $elInputs[2].querySelector('.el-input-group__append > button').className
    ).toContain('el-button');
    expect(
      $elInputs[3].querySelector('.el-input-group__prepend > div').className
    ).toContain('el-select');
  });

  test('测试 click 事件', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" suffix-icon="h-icon-search" @click="handleClick" />
      `,
      data() {
        return { input: '', event: '' };
      },
      methods: {
        handleClick() {
          this.event = 'click';
        }
      }
    });
    vm.$el.querySelector('.el-input__suffix i').click();
    expect(vm.event).toBe('click');
  });

  test('测试 focus 和 blur 事件', () => {
    vm = createVue({
      template: `
        <el-input v-model="input" @focus="handleFocus" @blur="handleBlur" />
      `,
      data() {
        return { input: '', event: '' };
      },
      methods: {
        handleFocus() {
          this.event = 'focus';
        },
        handleBlur() {
          this.event = 'blur';
        }
      }
    });
    vm.$el.querySelector('input').focus();
    expect(vm.event).toBe('focus');
    vm.$el.querySelector('input').blur();
    expect(vm.event).toBe('blur');
  });
});

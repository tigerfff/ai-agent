import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Radio', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-radio class="radio" v-model="radio" label="1">备选项</el-radio>
      `,
        data() {
          return {
            radio: '1'
          };
        }
      });
      expect(vm.$el.outerHTML).toMatchSnapshot();
      done();
    });
  });

  test('基础用法', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <div>
          <el-radio class="radio" v-model="radio" label="1">备选项</el-radio>
          <el-radio class="radio" v-model="radio" label="2">备选项</el-radio>
        </div>
      `,
        data() {
          return {
            radio: '1'
          };
        }
      });
      const $radios = vm.$el.querySelectorAll('.el-radio');
      expect($radios.length).toBe(2);
      expect($radios[0].className).toContain('is-checked');
      $radios[1].click();
      vm.$nextTick(() => {
        expect($radios[0].className).not.toContain('is-checked');
        expect($radios[1].className).toContain('is-checked');
        done();
      });
    });
  });

  test('禁用状态', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <div>
          <el-radio disabled v-model="radio1" label="禁用">备选项</el-radio>
          <el-radio disabled v-model="radio1" label="选中且禁用">备选项</el-radio>
        </div>
      `,
        data() {
          return {
            radio1: '选中且禁用'
          };
        }
      });
      const $radios = vm.$el.querySelectorAll('.el-radio');
      expect($radios[0].className).toContain('is-disabled');
      expect($radios[1].className).toContain('is-disabled');
      expect($radios[1].className).toContain('is-checked');
      done();
    });
  });

  test('单选框组', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-radio-group v-model="radio4" size='small' type="simple">
          <el-radio-button label="上海"></el-radio-button>
          <el-radio-button label="北京"></el-radio-button>
          <el-radio-button label="广州"></el-radio-button>
          <el-radio-button label="深圳" disabled></el-radio-button>
          <el-radio-button label="杭州"></el-radio-button>
        </el-radio-group>
      `,
        data() {
          return {
            radio4: '上海'
          };
        }
      });
      const $radios = vm.$el.querySelectorAll('.el-radio-button');
      expect($radios[0].className).toContain('is-checked');
      expect($radios[3].className).toContain('is-disabled');
      $radios[1].click();
      vm.$nextTick(() => {
        expect($radios[0].className).not.toContain('is-checked');
        expect($radios[1].className).toContain('is-checked');
        done();
      });
    });
  });

  test('测试 change 事件', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <div>
          <el-radio class="radio" v-model="radio" label="1" @change="handleChange">备选项</el-radio>
          <el-radio class="radio" v-model="radio" label="2" @change="handleChange">备选项</el-radio>
        </div>
      `,
        data() {
          return {
            radio: '1',
            event: ''
          };
        },
        methods: {
          handleChange() {
            this.event = 'change';
          }
        }
      });
      const $radios = vm.$el.querySelectorAll('.el-radio');
      $radios[1].click();
      vm.$nextTick(() => {
        expect(vm.event).toBe('change');
        done();
      });
    });
  });
});

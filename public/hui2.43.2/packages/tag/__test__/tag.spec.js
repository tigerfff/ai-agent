import { createVue, destroyVM } from '@/src/utils/test-util';

/* 以下 Demo 无法测试：动态编辑标签 */

describe('Tag', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <el-tag>标签一</el-tag>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基础用法', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag>标签一</el-tag>
          <el-tag type="info">标签二</el-tag>
          <el-tag type="primary">标签三</el-tag>
          <el-tag type="success">标签四</el-tag>
          <el-tag type="warning">标签五</el-tag>
          <el-tag type="danger">标签六</el-tag>
        </div>
      `
    });
    const $tags = vm.$el.querySelectorAll('.el-tag');
    expect($tags[0].querySelector('span').textContent).toBe('标签一');
    expect($tags[1].className).toContain('el-tag--info');
    expect($tags[2].className).toContain('el-tag--primary');
    expect($tags[3].className).toContain('el-tag--success');
    expect($tags[4].className).toContain('el-tag--warning');
    expect($tags[5].className).toContain('el-tag--danger');
  });

  test('可移除标签', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag v-for="tag in tags" :key="tag.name" :type="tag.type" closable>
            {{tag.name}}
          </el-tag>
        </div>
      `,
      data() {
        return {
          tags: [
            { name: '标签一', type: '' },
            { name: '标签二', type: 'gray' },
            { name: '标签三', type: 'primary' },
            { name: '标签四', type: 'success' },
            { name: '标签五', type: 'warning' },
            { name: '标签六', type: 'danger' }
          ]
        };
      }
    });
    expect(vm.$el.querySelectorAll('.el-tag > .el-tag__close').length).toBe(6);
  });

  test('带链接标签', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag v-for="tag in tags" :key="tag.name" :type="tag.type">
            <a>{{tag.name}}</a>
          </el-tag>
        </div>
      `,
      data() {
        return {
          tags: [
            { name: '标签一', type: '' },
            { name: '标签二', type: 'gray' },
            { name: '标签三', type: 'primary' },
            { name: '标签四', type: 'success' },
            { name: '标签五', type: 'warning' },
            { name: '标签六', type: 'danger' }
          ]
        };
      }
    });
    expect(
      vm.$el.querySelectorAll('.el-tag > .el-tag--maxwidth > a').length
    ).toBe(6);
  });

  test('自定义颜色', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag v-for="tag in tagWithColor" :key="tag.name" :color="tag.color">
            {{tag.name}}
          </el-tag>
        </div>
      `,
      data() {
        return {
          tagWithColor: [
            { name: '色值名', color: 'LimeGreen' },
            { name: '十六进制', color: '#ff952c' },
            { name: 'RGB', color: 'rgb(250, 50, 57)' }
          ]
        };
      }
    });
    const $tags = vm.$el.querySelectorAll('.el-tag');
    expect($tags[0].style.backgroundColor).toBe('LimeGreen');
    expect($tags[1].style.backgroundColor).toBe('rgb(255, 149, 44)');
    expect($tags[2].style.backgroundColor).toBe('rgb(250, 50, 57)');
  });

  test('选择尺寸', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag v-for="tag in tagWithSize" :key="tag.name" :size="tag.size">
            {{tag.name}}
          </el-tag>
        </div>
      `,
      data() {
        return {
          tagWithSize: [
            { name: '大型标签', size: 'large' },
            { name: '默认标签', size: '' },
            { name: '小型标签', size: 'small' }
          ]
        };
      }
    });
    const $tags = vm.$el.querySelectorAll('.el-tag');
    expect($tags[0].className).toContain('el-tag--large');
    expect($tags[1].className).not.toContain('el-tag--large');
    expect($tags[1].className).not.toContain('el-tag--small');
    expect($tags[2].className).toContain('el-tag--small');
  });

  test('maxWidth 溢出省略', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag v-for="tag in tagWithMaxSize" :key="tag.name" :title="tag.title" :maxWidth="tag.maxWidth">
            {{tag.name}}
          </el-tag>
        </div>
      `,
      data() {
        return {
          tagWithMaxSize: [
            { name: '有省略的1234567', maxWidth: '90px', closable: true },
            { name: '没设置省略的标签的标签标签' },
            {
              name: '中等带title标签中等标签中等标签中等标签',
              maxWidth: '115px',
              title: '这是一个带 title 的标签'
            },
            { name: '有省略的标签不超过最大宽度', maxWidth: '200px' }
          ]
        };
      }
    });
    const $tags = vm.$el.querySelectorAll('.el-tag > .el-tag--maxwidth');
    expect($tags[0].style.maxWidth).toBe('90px');
    expect($tags[1].style.maxWidth).toBe('200px');
    expect($tags[2].style.maxWidth).toBe('115px');
    expect($tags[3].style.maxWidth).toBe('200px');
  });

  test('测试 close 事件', () => {
    vm = createVue({
      template: `
        <div>
          <el-tag closable @close="handleClose">标签一</el-tag>
        </div>
      `,
      data() {
        return {
          event: ''
        };
      },
      methods: {
        handleClose() {
          this.event = 'close';
        }
      }
    });
    vm.$el.querySelector('.el-tag > .el-tag__close').click();
    expect(vm.event).toBe('close');
  });
});

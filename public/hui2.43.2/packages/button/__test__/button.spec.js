import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Button', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    // TODO: 还缺少按钮组的demo
    vm = createVue({
      template: `
        <div>
          <el-button type="primary">主要按钮</el-button>
          <el-button type="default">白色次按钮</el-button>
          <el-button type="primary" :radius="true">圆角按钮</el-button>
          <el-button type="text">文字按钮</el-button>
          <el-button type="link">文字链接</el-button>

          <el-button icon="h-icon-search" />
          <el-button icon="h-icon-search">Search</el-button>
          <el-button icon="h-icon-search" type="primary">Search</el-button>

          <el-button type="primary" :loading="true">加载中</el-button>
          <el-button type="text" :loading="true">文字按钮</el-button>

          <el-button type="primary" size="large">large</el-button>
          <el-button type="primary">default</el-button>
          <el-button type="primary" size="small">small</el-button>
          <el-button type="primary" size="mini">mini</el-button>

          <el-button type="success" >成功按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
          <el-button type="info">信息按钮</el-button>
        </div>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });
});

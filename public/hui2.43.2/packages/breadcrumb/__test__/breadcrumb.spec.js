import { createVue, destroyVM } from '@/src/utils/test-util';

describe('Breadcrumb', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/' }">活动管理</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/' }">活动列表</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/' }">活动详情</el-breadcrumb-item>
      </el-breadcrumb>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  // 还有bug对应的issuesid http://iris.hikvision.com.cn/hui-vue/hui-vue/issues/228
  //   test('图标分隔', () => {
  //     vm = createVue(
  //       {
  //         template: `
  //       <el-breadcrumb separator="/" separatorClass="h-icon-angle_line_right">
  //   <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  //   <el-breadcrumb-item>活动管理</el-breadcrumb-item>
  //   <el-breadcrumb-item>活动列表</el-breadcrumb-item>
  //   <el-breadcrumb-item>活动详情</el-breadcrumb-item>
  // </el-breadcrumb>
  //       `
  //       },
  //       true
  //     );
  //     expect(vm.$el.outerHTML).toMatchSnapshot();
  //     expect(
  //       vm.$el.querySelector('.el-breadcrumb__separator.h-icon-angle_line_right')
  //     ).not.toBeNull();
  //   });

  test('省略导航', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>活动管理</el-breadcrumb-item>
        <el-breadcrumb-item type="dropdown">
          <el-breadcrumb-sub-item :to="{ path: '/' }">活动a管理</el-breadcrumb-sub-item>
          <el-breadcrumb-sub-item>活动管理</el-breadcrumb-sub-item>
          <el-breadcrumb-sub-item :to="{ path: '/' }">活动管理</el-breadcrumb-sub-item>
        </el-breadcrumb-item>
        <el-breadcrumb-item>活动详情</el-breadcrumb-item>
      </el-breadcrumb>
      `
        },
        true
      );

      const button = vm.$el.querySelector('.el-button--iconButton');

      expect(button).not.toBeNull();

      button.click();

      vm.$nextTick(() => {
        expect(
          document.querySelectorAll('.el-dropdown-menu__item').length
        ).toBe(3);
        done();
      });
    });
  });

  test('省略展示', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>活动管理</el-breadcrumb-item>
          <el-breadcrumb-item type="tooltip">
              <el-breadcrumb-sub-item>活动b管理</el-breadcrumb-sub-item>
              <el-breadcrumb-sub-item>活动管理</el-breadcrumb-sub-item>
              <el-breadcrumb-sub-item>活动管理</el-breadcrumb-sub-item>
          </el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/' }">活动详情</el-breadcrumb-item>
        </el-breadcrumb>
      `
        },
        true
      );

      const button = vm.$el.querySelector('.el-button--iconButton');

      expect(button).not.toBeNull();

      button.click();

      vm.$nextTick(() => {
        // 这里的弹框实现还和导航省略的不同有待研究，测试代码写的比较别扭
        expect(
          document.querySelectorAll('.el-breadcrumb')[1]
        ).toMatchSnapshot();
        done();
      });
    });
  });
});

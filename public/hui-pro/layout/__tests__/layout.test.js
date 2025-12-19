/**
 * @Author chenlong6
 * @Date 2020-05-18 10:35:23
 * @Desc layout 测试用例
 */
import { createVue, destroyVM } from '@/jest/test-utils';

describe('Layout 布局', () => {
  let vm;
  afterEach(() => {
    destroyVM(vm);
  });

  /**
   * @author chenlong6
   * @date 2020-05-18 16:48:05
   * @desc 创建模板配置参数
   */
  const createVueConfig = () => {
    return Object.assign({
      template: `
        <h-layout style="height: 360px;">
          <h-layout-aside width="200px" style="line-height: 360px;">Aside</h-layout-aside>
          <h-layout>
            <h-layout-header height="80px">Header</h-layout-header>
            <h-layout-content flex direction="vertical" overflow>Content</h-layout-content>
            <h-layout-footer height="80px">Footer</h-layout-footer>
          </h-layout>
        </h-layout>
        `
    });
  };

  it('snapshot test', () => {
    vm = createVue(createVueConfig());
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  it('create', () => {
    vm = createVue(createVueConfig());
    expect(vm.$el.classList.contains('h-layout')).toBeTruthy();
  });

  it('direction default', () => {
    vm = createVue({ template: `<h-layout></h-layout>` });
    expect(vm.$el.querySelector('.is-vertical')).toBeFalsy();
  });

  it('direction with header / footer', () => {
    vm = createVue(createVueConfig());
    const hasHeaderOrFooter =
      vm.$el.querySelector('.h-layout-header') ||
      vm.$el.querySelector('.h-layout-footer');
    expect(
      hasHeaderOrFooter && vm.$el.querySelector('.is-vertical')
    ).toBeTruthy();
  });

  it('layout-aside width', () => {
    expect(vm.$el.querySelector('.h-layout-aside').style.width).toBe('200px');
  });

  it('layout-header height', () => {
    expect(vm.$el.querySelector('.h-layout-header').style.height).toBe('80px');
  });

  it('layout-footer height', () => {
    expect(vm.$el.querySelector('.h-layout-footer').style.height).toBe('80px');
  });

  it('layout-content flex', () => {
    expect(
      vm.$el.querySelector('.h-layout-content') &&
        vm.$el.querySelector('.is-flex')
    ).toBeTruthy();
  });

  it('layout-content direction', () => {
    expect(
      vm.$el.querySelector('.h-layout-content') &&
        vm.$el.querySelector('.is-vertical')
    ).toBeTruthy();
  });

  it('layout-content overflow', () => {
    expect(
      vm.$el.querySelector('.h-layout-content') &&
        vm.$el.querySelector('.is-overflow')
    ).toBeTruthy();
  });
});

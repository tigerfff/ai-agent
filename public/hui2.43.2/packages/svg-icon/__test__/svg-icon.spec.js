import { createVue, destroyVM } from '@/src/utils/test-util';

// /* 以下 Demo 无法测试：外部引入图标（测试环境无法配置 svg-loader） */

describe('SvgIcon', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
        <h-svg-icon><svg-box-camera /></h-svg-icon>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('预定义图标', () => {
    vm = createVue({
      template: `
        <div>
          <h-svg-icon>
            <svg-box-camera />
          </h-svg-icon>
          <h-svg-icon>
            <svg-box-camera />
            <svg-state-cascade />
          </h-svg-icon>
          <h-svg-icon>
            <svg-box-camera />
            <svg-state-no-longitude-and-latitude />
          </h-svg-icon>
          <h-svg-icon>
            <svg-box-camera />
            <svg-state-cascade />
            <svg-state-no-longitude-and-latitude />
          </h-svg-icon>
        </div>
      `
    });
    const $wrapper = vm.$el.querySelectorAll('.h-svg-icon-wrapper');
    expect($wrapper[0].querySelectorAll('svg').length).toBe(1);
    expect($wrapper[1].querySelectorAll('svg').length).toBe(2);
    expect($wrapper[2].querySelectorAll('svg').length).toBe(2);
    expect($wrapper[3].querySelectorAll('svg').length).toBe(3);
  });

  test('离线状态', () => {
    vm = createVue({
      template: `
        <div>
          <h-svg-icon offline>
            <svg-box-camera />
          </h-svg-icon>
          <h-svg-icon offline>
            <svg-box-camera />
            <svg-state-cascade />
          </h-svg-icon>
          <h-svg-icon offline>
            <svg-box-camera />
            <svg-state-no-longitude-and-latitude />
          </h-svg-icon>
          <h-svg-icon offline>
            <svg-box-camera />
            <svg-state-cascade />
            <svg-state-no-longitude-and-latitude />
          </h-svg-icon>
        </div>
      `
    });
    const $wrapper = vm.$el.querySelectorAll('.h-svg-icon-wrapper');
    expect($wrapper[0].className).toContain('is-offline');
    expect($wrapper[1].className).toContain('is-offline');
    expect($wrapper[2].className).toContain('is-offline');
    expect($wrapper[3].className).toContain('is-offline');
  });

  test('修改颜色', () => {
    vm = createVue({
      template: `
        <div>
          <h-svg-icon>
            <svg-box-camera color="#2196f3" />
          </h-svg-icon>
          <h-svg-icon>
            <svg-box-camera color="#6f7e91" />
            <svg-state-cascade color="#e72528" />
          </h-svg-icon>
          <h-svg-icon>
            <svg-box-camera color="#2196f3" />
            <svg-state-no-longitude-and-latitude />
          </h-svg-icon>
          <h-svg-icon>
            <svg-box-camera color="#e72528" />
            <svg-state-cascade color="#ff952c" />
            <svg-state-no-longitude-and-latitude color="#2196f3" />
          </h-svg-icon>
        </div>
      `
    });
    const $wrapper = vm.$el.querySelectorAll('.h-svg-icon-wrapper');
    expect($wrapper[0].querySelector('svg path').style.fill).toBe('#2196f3');
    expect($wrapper[1].querySelector('svg:first-child path').style.fill).toBe(
      '#6f7e91'
    );
    expect(
      $wrapper[1].querySelector('svg:last-child path:last-child').style.fill
    ).toBe('#e72528');
    expect($wrapper[2].querySelector('svg:first-child path').style.fill).toBe(
      '#2196f3'
    );
    expect(
      $wrapper[2].querySelector('svg:last-child path:last-child').style.fill
    ).toBe('');
    expect($wrapper[3].querySelector('svg:first-child path').style.fill).toBe(
      '#e72528'
    );
    expect(
      $wrapper[3].querySelector('svg:nth-child(2) path:last-child').style.fill
    ).toBe('#ff952c');
    expect(
      $wrapper[3].querySelector('svg:last-child path:last-child').style.fill
    ).toBe('#2196f3');
  });
});

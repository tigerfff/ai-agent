import { createVue, destroyVM, triggerEvent } from '@/src/utils/test-util';

describe('Carousel', () => {
  let vm;

  afterEach(() => {
    destroyVM(vm);
  });

  test('snapshot test', () => {
    vm = createVue({
      template: `
      <el-carousel>
        <el-carousel-item v-for="item in 4" :key="item">
          <h3>{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
      `
    });
    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  test('基本功能', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
      <el-carousel>
        <el-carousel-item v-for="item in 4" :key="item">
          <h3>{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
      `
      });

      triggerEvent(vm.$el, 'mouseenter');
      vm.$nextTick(() => {
        expect(
          vm.$el.querySelector('.el-carousel__item.is-active h3').innerHTML
        ).toBe('1');

        expect(
          vm.$el.querySelector('.el-carousel__arrow--left').style.display
        ).toBe('');
        expect(
          vm.$el.querySelector('.el-carousel__arrow--right').style.display
        ).toBe('');

        vm.$el.querySelector('.el-carousel__arrow--right').click();
        vm.$nextTick(() => {
          expect(
            vm.$el.querySelector('.el-carousel__item.is-active h3').innerHTML
          ).toBe('2');
          done();
        });
      });
    });
  });

  test('默认 Hover 指示器触发', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
      <el-carousel>
        <el-carousel-item v-for="item in 4" :key="item">
          <h3>{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
      `
      });

      vm.$nextTick(() => {
        triggerEvent(
          vm.$el.querySelectorAll('.el-carousel__indicator')[1],
          'mouseenter'
        );
        vm.$nextTick(() => {
          expect(
            vm.$el.querySelector('.el-carousel__item.is-active h3').innerHTML
          ).toBe('2');
          done();
        });
      });
    });
  });

  test('默认 click 指示器触发', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
      <el-carousel trigger="click">
        <el-carousel-item v-for="item in 4" :key="item">
          <h3>{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
      `
      });

      vm.$nextTick(() => {
        triggerEvent(
          vm.$el.querySelectorAll('.el-carousel__indicator')[1],
          'mouseenter'
        );
        vm.$nextTick(() => {
          expect(
            vm.$el.querySelector('.el-carousel__item.is-active h3').innerHTML
          ).toBe('1');
          done();
        });
      });
    });
  });

  test('指示器', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
        <el-carousel indicator-position="outside">
          <el-carousel-item v-for="item in 4" :key="item">
            <h3>{{ item }}</h3>
          </el-carousel-item>
        </el-carousel>
      `
      });

      expect(
        vm.$el.querySelector('.el-carousel__container').nextElementSibling
          .className
      ).toContain('el-carousel__indicators--outside');
      done();
    });
  });

  test('箭头始终显示', () => {
    return new Promise(done => {
      vm = createVue({
        template: `
      <el-carousel :interval="5000" arrow="always">
        <el-carousel-item v-for="item in 4" :key="item">
          <h3>{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
      `
      });

      expect(
        vm.$el.querySelector('.el-carousel__arrow--left').style.display
      ).toBe('');
      expect(
        vm.$el.querySelector('.el-carousel__arrow--right').style.display
      ).toBe('');

      done();
    });
  });

  // TODO:卡片化测试
});

import { createVue, destroyVM, triggerEvent } from '@/src/utils/test-util';

describe('Dropdown', () => {
  let vm;
  const timeout = 400;

  afterEach(() => {
    destroyVM(vm);
  });

  test('触发对象 1', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-dropdown ref="dropdown">
          <el-button>
            下拉菜单
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      `
        },
        true
      );
      const dropdown = vm.$refs.dropdown;
      const triggerElm = vm.$el.querySelector('.el-button');

      triggerEvent(triggerElm, 'mouseenter');

      setTimeout(() => {
        expect(dropdown.visible).toBe(true);

        triggerEvent(triggerElm, 'mouseleave');
        setTimeout(() => {
          expect(dropdown.visible).toBe(false);
          done();
        }, timeout);
      }, timeout);
    });
  });

  test('触发对象 2', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-dropdown split-button ref="dropdown">
            下拉菜单
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      `
        },
        true
      );
      const dropdown = vm.$refs.dropdown;
      const triggerElm = vm.$el.querySelector('.el-dropdown__caret-button');

      triggerEvent(triggerElm, 'mouseenter');

      setTimeout(() => {
        expect(dropdown.visible).toBe(true);

        triggerEvent(triggerElm, 'mouseleave');
        setTimeout(() => {
          expect(dropdown.visible).toBe(false);
          done();
        }, timeout);
      }, timeout);
    });
  });

  test('触发方式', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-dropdown trigger="click" ref="dropdown">
          <el-button class="el-dropdown-link" type="iconButton">
            下拉菜单
            <i class="h-icon-angle_down_sm el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      `
        },
        true
      );
      const dropdown = vm.$refs.dropdown;
      const triggerElm = vm.$el.querySelector('.el-button');

      triggerElm.click();

      setTimeout(() => {
        expect(dropdown.visible).toBe(true);

        triggerElm.click();
        setTimeout(() => {
          expect(dropdown.visible).toBe(false);
          done();
        }, timeout);
      }, timeout);
    });
  });

  test('菜单隐藏方式', () => {
    return new Promise(done => {
      vm = createVue(
        {
          template: `
        <el-dropdown ref="dropdown" :hide-on-click="false">
          <el-button>
            下拉菜单
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item disabled>双皮奶</el-dropdown-item>
            <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      `
        },
        true
      );
      const dropdown = vm.$refs.dropdown;
      const triggerElm = vm.$el.querySelector('.el-button');

      triggerEvent(triggerElm, 'mouseenter');

      setTimeout(() => {
        expect(dropdown.visible).toBe(true);

        document.querySelector('.el-dropdown-menu__item').click();
        setTimeout(() => {
          expect(dropdown.visible).toBe(true);
          done();
        }, timeout);
      }, timeout);
    });
  });
});

import { createVue } from '@/src/utils/test-util';

describe('Affix', () => {
  it('snapshot test', () => {
    const vm = createVue({
      template: `
        <h-affix>
          <span class="demo-affix-block">Fixed at the top</span>
        </h-affix>
      `
    });

    expect(vm.$el.outerHTML).toMatchSnapshot();
  });

  // TODO: scroll test fail
  // it('scroll test', () => {
  //   const vm = createVue({
  //     template: `
  //       <h-affix>
  //         <span class="demo-affix-block">Fixed at the top</span>
  //       </h-affix>
  //     `
  //   });
  //   // expect(wrapper.contains('span')).toBe(true);
  // });
});

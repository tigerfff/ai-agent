import { createVue } from '@/src/utils/test-util';

describe('notification', () => {
  const timeout = 4000;

  it('基础用法', () => {
    createVue({
      template: '<div/>',
      mounted() {
        this.$notify({
          title: '标题名称',
          message: '这是一条定时关闭的消息'
        });
      }
    });
    expect(document.querySelectorAll('.el-notification')).toMatchSnapshot();
  });
  it('自动关闭', () => {
    createVue({
      template: '<div/>',
      mounted() {
        this.$notify({
          title: '标题名称',
          message: '这是一条定时关闭的消息'
        });
        this.$notify({
          title: '提示',
          message: '这是一条不会自动关闭的消息',
          duration: 0
        });
      }
    });

    setTimeout(() => {
      expect(document.querySelectorAll('.el-notification').length).toBe(1);
    }, timeout);
  });
  it('使用 HTML 片段', () => {
    createVue({
      template: '<div/>',
      mounted() {
        this.$notify({
          title: '标题名称',
          message:
            '<i style="color: teal">这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案</i>',
          dangerouslyUseHTMLString: true
        });
      }
    });

    expect(document.querySelectorAll('.el-notification')).toMatchSnapshot();
  });
});

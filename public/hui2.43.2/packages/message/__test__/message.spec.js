import { createVue } from '@/src/utils/test-util';

describe('Message', () => {
  it('基础用法', () => {
    createVue({
      template: '<div/>',
      mounted() {
        this.$message('这是一条消息提示');
        const h = this.$createElement;
        this.$message({
          message: h('p', null, [
            h('span', null, '内容可以是 '),
            h('i', { style: 'color: teal' }, 'VNode')
          ])
        });
      }
    });
    expect(document.querySelectorAll('.el-message')).toMatchSnapshot();
  });

  it('不同状态', () => {
    createVue({
      template: '<div/>',
      mounted() {
        this.$message('这是一条消息提示');
        this.$message({
          message: '恭喜你，这是一条成功消息',
          type: 'success'
        });
        this.$message({
          message: '警告哦，这是一条警告消息',
          type: 'warning'
        });
        this.$message.error('错了哦，这是一条错误消息');
      }
    });
    expect(document.querySelectorAll('.el-message')).toMatchSnapshot();
  });

  it('可关闭', () => {
    createVue({
      template: '<div/>',
      mounted() {
        this.$message({
          showClose: true,
          message: '恭喜你，这是一条成功消息',
          type: 'success'
        });
      }
    });
    expect(document.querySelectorAll('.el-message')).toMatchSnapshot();
  });
});

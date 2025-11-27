import { triggerKeyDown } from '@/src/utils/test-util';
import MessageBox from '../index';

function sleep(ms = 800) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

describe('', () => {
  afterEach(() => {
    MessageBox.close();
  });

  test('snapshot test', async () => {
    MessageBox({
      title: '消息',
      message: '这是一条success消息'
    });
    expect(document.querySelectorAll('.el-message-box')).toMatchSnapshot();
  });

  test('测试-small、middle、large尺寸弹框', async () => {
    MessageBox({
      title: '消息',
      size: 'small',
      message: '这是一条small消息'
    });
    await Promise.resolve();
    expect(document.querySelectorAll('.el-message-box')).toMatchSnapshot();

    MessageBox.close(); // 等待上一个弹框关闭
    await Promise.resolve();

    MessageBox({
      title: '消息',
      size: 'middle',
      message: '这是一条middle消息'
    });
    await Promise.resolve();
    expect(document.querySelectorAll('.el-message-box')).toMatchSnapshot();

    MessageBox.close(); // 等待上一个弹框关闭
    await Promise.resolve();

    MessageBox({
      title: '消息',
      size: 'large',
      message: '这是一条large消息'
    });
    await Promise.resolve();
    expect(document.querySelectorAll('.el-message-box')).toMatchSnapshot();
  });

  test('测试-sucess弹框有对应的Icon ', async () => {
    MessageBox({
      title: '消息',
      type: 'success',
      message: '这是一条success消息'
    });
    await Promise.resolve();
    expect(
      document.querySelector('.el-message-box__wrapper').querySelector('i')
        .className
    ).toContain('h-icon-feedback_success_lg');

    MessageBox.close(); // 等待上一个弹框关闭
    await Promise.resolve();

    MessageBox({
      title: '消息',
      type: 'info',
      message: '这是一条info消息'
    });
    await Promise.resolve();
    expect(
      document.querySelector('.el-message-box__wrapper').querySelector('i')
        .className
    ).toContain('h-icon-feedback_info_lg');

    MessageBox.close(); // 等待上一个弹框关闭
    await Promise.resolve();

    MessageBox({
      title: '消息',
      type: 'warning',
      message: '这是一条warning消息'
    });
    await Promise.resolve();
    expect(
      document.querySelector('.el-message-box__wrapper').querySelector('i')
        .className
    ).toContain('h-icon-feedback_warning_lg');

    MessageBox.close(); // 等待上一个弹框关闭
    await Promise.resolve();

    MessageBox({
      title: '消息',
      type: 'error',
      message: '这是一条error消息'
    });
    await Promise.resolve();
    expect(
      document.querySelector('.el-message-box__wrapper').querySelector('i')
        .className
    ).toContain('h-icon-feedback_error_lg');
  });

  test('测试-confirm, 点击“确认”要关闭弹框以及触发回调', async () => {
    const messageAction = MessageBox.confirm(
      '此操作将永久删除该文件, 是否继续?',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }
    );
    await Promise.resolve();

    const msgbox = document.querySelector('.el-message-box__wrapper');
    const buts = msgbox.querySelectorAll('.el-button');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    buts[0].click();
    expect(messageAction).resolves.toMatch('confirm');
    expect(msgbox.__vue__.$parent.visible).toBe(false);
  });

  test('测试-confirm, 点击“取消”要关闭弹框以及触发回调', async () => {
    const messageAction = MessageBox.confirm(
      '此操作将永久删除该文件, 是否继续?',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }
    );
    await Promise.resolve();

    const msgbox = document.querySelector('.el-message-box__wrapper');
    const buts = msgbox.querySelectorAll('.el-button');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    buts[1].click();
    await expect(messageAction).rejects.toMatch('cancel');
    expect(msgbox.__vue__.$parent.visible).toBe(false);
  });

  test('测试-onCancel, 点击“取消”存在onCancel要执行并关闭弹窗', async () => {
    let cancelFlag = false
    const messageAction = MessageBox.confirm(
      '此操作将永久删除该文件, 是否继续?',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question',
        onCancel: () => {cancelFlag = true}
      }
    );
    await Promise.resolve();

    const msgbox = document.querySelector('.el-message-box__wrapper');
    const buts = msgbox.querySelectorAll('.el-button');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    buts[1].click();
    expect(cancelFlag).toBe(true);
    expect(msgbox.__vue__.$parent.visible).toBe(false);
  });

  test('测试-beforeClose不触发done()不关闭弹框，触发done()关闭弹框', async () => {
    MessageBox({
      title: '消息',
      message: '这是一条消息',
      beforeClose: (action, instance, done) => {
        done(); // 触发done
      }
    });

    await sleep();

    let msgbox = document.querySelector('.el-message-box__wrapper');
    let buts = msgbox.querySelectorAll('.el-button');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    buts[0].click();

    await sleep();
    expect(msgbox.__vue__.$parent.visible).toBe(false);

    MessageBox({
      title: '消息',
      message: '这是一条消息',
      beforeClose: (action, instance, done) => {
        // 不触发done
      }
    });

    await sleep();

    msgbox = document.querySelector('.el-message-box__wrapper');
    buts = msgbox.querySelectorAll('.el-button');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    buts[0].click();

    await sleep();

    expect(msgbox.__vue__.$parent.visible).toBe(true);
  });

  test('测试-closeOnClickModal为true时点击遮罩层可以关闭弹框，为false时不可以', async () => {
    const messageAction = MessageBox({
      title: '消息',
      message: '这是一条消息',
      closeOnClickModal: true
    });
    await Promise.resolve();

    let msgbox = document.querySelector('.el-message-box__wrapper');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    msgbox.click();
    await Promise.resolve();
    expect(msgbox.__vue__.$parent.visible).toBe(false);

    await expect(messageAction).rejects.toBe('cancel');

    MessageBox.close();

    MessageBox({
      title: '消息',
      message: '这是一条消息',
      closeOnClickModal: false
    });
    await Promise.resolve();

    msgbox = document.querySelector('.el-message-box__wrapper');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    msgbox.click();
    await Promise.resolve();
    expect(msgbox.__vue__.$parent.visible).toBe(true);
  });

  test('测试-closeOnPressEscape为true时按下ESC可以关闭弹框，为false时不可以', async () => {
    const messageAction = MessageBox({
      title: '消息',
      message: '这是一条消息',
      closeOnPressEscape: true
    });

    await sleep();

    let msgbox = document.querySelector('.el-message-box__wrapper');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    triggerKeyDown(msgbox, 27); // ESC

    await expect(messageAction).rejects.toBe('cancel');

    await sleep();

    expect(msgbox.__vue__.$parent.visible).toBe(false);

    MessageBox({
      title: '消息',
      message: '这是一条消息',
      closeOnPressEscape: false
    });

    await sleep();

    msgbox = document.querySelector('.el-message-box__wrapper');
    expect(msgbox.__vue__.$parent.visible).toBe(true);
    triggerKeyDown(msgbox, 27); // ESC

    await sleep();
    expect(msgbox.__vue__.$parent.visible).toBe(true);
  });
});

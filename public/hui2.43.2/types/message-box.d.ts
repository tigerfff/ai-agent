/* eslint-disable no-unused-vars */
import Vue, { VNode } from 'vue';
import { ComponentType, ComponentSize, ComponentInputType } from './common';

export type MessageBoxCloseAction = 'confirm' | 'cancel';
export type MessageBoxSize = ComponentSize | 'middle';
export type MessageBoxType = ComponentType | 'question';

export type MessageBoxPromptData =
  | MessageBoxCloseAction
  | MessageBoxPromptInputValue;

// $prompt的输入框的返回值
export interface MessageBoxPromptInputValue {
  value: string | undefined;
  action: MessageBoxCloseAction;
}

export interface MessageBoxInputValidator {
  (value: string): boolean | string;
}

export interface ElMessageBoxComponent extends Vue {
  title: string;
  message: string;
  type: ComponentType;
  customClass: string;
  showInput: boolean;
  showClose: boolean;
  inputValue: string;
  inputPlaceholder: string;
  inputType: string;
  inputPattern: RegExp;
  inputValidator: MessageBoxInputValidator;
  inputErrorMessage: string;
  showConfirmButton: boolean;
  showCancelButton: boolean;
  action: MessageBoxCloseAction;
  dangerouslyUseHTMLString: boolean;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmButtonLoading: boolean;
  cancelButtonLoading: boolean;
  confirmButtonClass: string;
  confirmButtonDisabled: boolean;
  cancelButtonClass: string;
  editorErrorMessage: string;
}

export interface ElMessageBoxOptions {
  // MessageBox 标题
  title?: string;
  // MessageBox 消息正文内容($confirm非必填)
  message?: string | VNode;
  // 是否将 message 属性作为 HTML 片段处理
  dangerouslyUseHTMLString?: boolean;
  // 消息类型，用于显示图标
  type?: MessageBoxType;
  // 尺寸
  size?: MessageBoxSize;
  // MessageBox 的自定义类名
  customClass?: string;

  /**
   * @description: 若不使用 Promise，可以使用此参数指定 MessageBox 关闭后的回调
   * @param: action的值为'confirm'或'cancel',  instance为 MessageBox 实例
   * @returns:
   */
  callback?: (
    action: MessageBoxCloseAction,
    instance: ElMessageBoxComponent
  ) => void;

  /**
   * @description: MessageBox 关闭前的回调，会暂停实例的关闭
   * @param: function(action, instance, done)，action 的值为'confirm'或'cancel'；instance 为 MessageBox 实例，可以通过它访问实例上的属性和方法；done 用于关闭 MessageBox 实例
   * @returns:
   */
  beforeClose?: (
    action: MessageBoxCloseAction,
    instance: ElMessageBoxComponent,
    done: () => void
  ) => void;

  // 是否将取消（点击取消按钮）与关闭（点击关闭按钮或遮罩层、按下 ESC 键）进行区分
  distinguishCancelAndClose?: boolean;
  // 是否在 MessageBox 出现时将 body 滚动锁定
  lockScroll?: boolean;
  // 是否显示取消按钮
  showCancelButton?: boolean;
  // 是否显示确定按钮
  showConfirmButton?: boolean;
  // 取消按钮的文本内容
  cancelButtonText?: string;
  // 确定按钮的文本内容
  confirmButtonText?: string;
  // 取消按钮的自定义类名
  cancelButtonClass?: string;
  // 确定按钮的自定义类名
  confirmButtonClass?: string;
  // 是否可通过点击遮罩关闭 MessageBox
  closeOnClickModal?: boolean;
  // 是否可通过按下 ESC 键关闭 MessageBox
  closeOnPressEscape?: boolean;
  // 是否在 hashchange 时关闭 MessageBox
  closeOnHashChange?: boolean;
  // 是否显示输入框
  showInput?: boolean;
  // 输入框的占位符
  inputPlaceholder?: string;
  // 输入框的类型
  inputType?: ComponentInputType;
  // 输入框的初始文本
  inputValue?: string;
  // 输入框的校验表达式
  inputPattern?: RegExp;
  // 输入框的校验函数。可以返回布尔值或字符串，若返回一个字符串, 则返回结果会被赋值给 inputErrorMessage
  inputValidator?: MessageBoxInputValidator;
  // 校验未通过时的提示文本
  inputErrorMessage?: string;
  // 确认按钮回调
  onConfirm?: () => void;
  // 取消按钮回调
  onCancel?: () => void;
}

export interface ElMessageBoxShortcutMethod {
  // this.$alert(message, title, options)
  // this.$prompt(message, title, options)
  (
    message: string,
    title: string | undefined,
    options: ElMessageBoxOptions
  ): Promise<MessageBoxPromptData>;
  // this.$[type](title, options)  type指代alert、prompt以及confirm
  (title: string | undefined, options: ElMessageBoxOptions): Promise<
    MessageBoxPromptData
  >;
  // this.$comfirm(options)
  (options: ElMessageBoxOptions): Promise<MessageBoxPromptData>;
}

// Promise<T>
// T是泛型，这里指resolve的参数
// resolve<T>(value: T | PromiseLike<T>): Promise<T>;
// https://www.tslang.cn/docs/handbook/generics.html#泛型
// https://www.jianshu.com/p/4f78b2a294cc
export interface ElMessageBox {
  // this.$msgbox(message, title, type)
  (message: string | VNode, title?: string, type?: string): Promise<
    MessageBoxPromptData
  >;
  // this.$msgbox(options, callback)
  (
    options: ElMessageBoxOptions,
    callback?: ElMessageBoxOptions['callback']
  ): Promise<MessageBoxPromptData>;
  // this.$msgbox(message, callback)
  (
    message: string | VNode,
    callback?: ElMessageBoxOptions['callback']
  ): Promise<MessageBoxPromptData>;
}

declare module 'vue/types/vue' {
  interface Vue {
    $msgbox: ElMessageBox;
    $alert: ElMessageBoxShortcutMethod;
    $confirm: ElMessageBoxShortcutMethod;
    $prompt: ElMessageBoxShortcutMethod;
  }
}

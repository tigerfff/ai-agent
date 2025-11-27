/* eslint-disable no-unused-vars */
import Vue, { VNode } from 'vue';
import { ComponentType } from './common';

export declare class ElMessageComponent extends Vue {
  close(): void;
}

// https://www.tslang.cn/docs/handbook/interfaces.html#函数类型
export interface CloseEventHandler {
  (instance: ElMessageComponent): void;
}

export interface ElMessageOptions {
  // 消息文字
  message: string | VNode;
  // 主题
  type?: ComponentType;
  // 自定义图标的类名，会覆盖 type
  iconClass?: string;
  // 是否将 message 属性作为 HTML 片段处理
  dangerouslyUseHTMLString?: boolean;
  // 自定义类名
  customClass?: string;
  // 显示时间, 毫秒。设为 0 则不会自动关闭
  duration?: number;
  // 是否显示关闭按钮
  showClose?: boolean;
  // 关闭时的回调函数, 参数为被关闭的 message 实例
  onClose?: CloseEventHandler;
}

// https://www.tslang.cn/docs/handbook/interfaces.html#混合类型
export interface ElMessage {
  // this.$message('string')
  (message: string): ElMessageComponent;
  // this.$message({message, type, ...})
  (options: ElMessageOptions): ElMessageComponent;
  // this.$message.[type]()   type指代success、warning、info以及error
  success(message: string): ElMessageComponent;
  success(options: ElMessageOptions): ElMessageComponent;
  warning(message: string): ElMessageComponent;
  warning(options: ElMessageOptions): ElMessageComponent;
  info(message: string): ElMessageComponent;
  info(options: ElMessageOptions): ElMessageComponent;
  error(message: string): ElMessageComponent;
  error(options: ElMessageOptions): ElMessageComponent;
}

declare module 'vue/types/vue' {
  interface Vue {
    $message: ElMessage;
  }
}

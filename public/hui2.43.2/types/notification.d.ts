/* eslint-disable no-unused-vars */
import Vue, { VNode } from 'vue';
import { ComponentSize } from './common';

export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export type NotificationSize = ComponentSize | 'middle';

export declare class ElNotificationComponent extends Vue {
  close(): void;
}

export interface ElNotificationOptions {
  // 标题
  title: string;
  // 尺寸
  size?: NotificationSize;
  // 说明文字
  message: string | VNode;
  // 是否将 message 属性作为 HTML 片段处理
  dangerouslyUseHTMLString?: boolean;
  // 自定义类名
  customClass?: string;
  // 显示时间, 毫秒。设为 0 则不会自动关闭
  duration?: number;
  // 自定义弹出位置
  position: NotificationPosition;
  // 关闭时的回调函数
  onClose?: () => void;
  // 点击 Notification 时的回调函数
  onClick?: () => void;
  // 偏移的距离，在同一时刻，所有的 Notification 实例应当具有一个相同的偏移量
  offset?: number;
  // 是否开启分页
  pagination?: boolean;
  // 是否展示关闭按钮
  showClose?: boolean;
}

export interface ElNotification {
  // this.$notify(options)
  (options: ElNotificationOptions): ElNotificationComponent;
}

declare module 'vue/types/vue' {
  interface Vue {
    $notify: ElNotification;
  }
}

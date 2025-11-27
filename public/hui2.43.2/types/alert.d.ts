import { HuiComponent } from './components';
// eslint-disable-next-line no-unused-vars
import { ComponentType } from './common';

export declare class ElAlert extends HuiComponent {
  // 标题
  title: string;
  // 辅助性文字。也可通过默认 slot 传入
  description: string;
  // 主题
  type: ComponentType;
  // 是否居中显示文本
  center: boolean;
  // 是否可关闭
  closable: boolean;
  // 关闭按钮自定义文本
  closeText: string;
  // 自定义关闭按钮图标
  closeIcon: string;
  // 是否显示图标
  showIcon: boolean;
  // 自定义图标
  icon: string;
  // 是否启用简单模式
  simple: string;
}

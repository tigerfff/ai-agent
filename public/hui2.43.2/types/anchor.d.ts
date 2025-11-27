import { HuiComponent } from './components';

export declare class HAnchor extends HuiComponent {
  // 固定模式
  affix?: boolean;
  // 面板高度（当存在高度且内容超出时，会出现滚动条）
  height?: string | number;
}

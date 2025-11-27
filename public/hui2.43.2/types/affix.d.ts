import { HuiComponent } from './components';

export interface AffixStyle {
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  width?: string | number;
}

export declare class HAffix extends HuiComponent {
  // 距离窗口顶部达到指定偏移量后触发
  offsetTop: number;
  // 距离窗口底部达到指定偏移量后触发
  offsetBottom: number;
  // 固定时，占位元素的宽度，可以不设置，不设置则固定时使用元素的原宽度
  slotWidth: number;
  // 固定时，占位元素的高度，可以不设置，不设置则固定时使用元素的原高度
  slotHeight: number;
  // 外层滚动容器（参数为选择器）
  container: string;

  /**
   * @description: 在固定状态下修改图钉样式
   * @param: 共一个参数，图钉样式，能设置样式 top bottom left width
   * @returns:
   */
  updateAffixStyle(affixStyle: AffixStyle): void;
}

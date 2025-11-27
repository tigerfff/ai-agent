/* eslint-disable no-unused-vars */
import Vue, { VNodeDirective, PluginObject } from 'vue';
import { ComponentSize } from './common';

export type LoadingSize = ComponentSize | 'mini';
export type LoadingColor = 'primary' | 'gray';

export interface LoadingServiceOptions {
  // Loading 需要覆盖的 DOM 节点。可传入一个 DOM 对象或字符串；若传入字符串，则会将其作为参数传入 document.querySelector以获取到对应 DOM 节点
  target?: HTMLElement | string;
  // 同 v-loading 指令中的 body 修饰符
  body?: boolean;
  // 同 v-loading 指令中的 fullscreen 修饰符
  fullscreen?: boolean;
  // 同 v-loading 指令中的 lock 修饰符
  lock?: boolean;
  // 显示在加载图标下方的加载文案
  text?: string;
  // Loading 的自定义类名
  customClass?: string;
  // v-loading 指令中的修饰符, 分别对应的 icon 大小为 16/24/80
  small?: boolean;
  mini?: boolean;
  large?: boolean;
  // 传入的 size 尺寸
  size?: LoadingSize;
  // v-loading 指令中的修饰符, 指示 loading 的颜色
  primary?: boolean;
  gray?: boolean;
  // 传入的颜色
  color?: LoadingColor;
}

export declare class ElLoadingComponent extends Vue {
  close(): void;
}

export interface ElLoadingDirective extends VNodeDirective {
  name: 'loading';
  value: boolean;
  modifiers: {
    body: boolean;
    fullscreen: boolean;
    lock: boolean;
    small: boolean;
    mini: boolean;
    large: boolean;
    primary: boolean;
    gray: boolean;
  };
}

export interface ElLoading {
  install(vue: typeof Vue): void;
  directive: PluginObject<never>;
  service(options: LoadingServiceOptions): ElLoadingComponent;
}

// https://cn.vuejs.org/v2/guide/typescript.html#增强类型以配合插件使用
// https://www.tslang.cn/docs/handbook/declaration-merging.html#模块扩展
// 在vue/types/vue的Vue接口基础上补充$loading方法(原型方法)
// 疑惑：接口和类的区别，如果这里是类很好理解（类中的方法都是原型链上的方法，实例的属性和方法在contructor构建函数里）
// 自我解答：这跟外部TS的使用相关，在外部一般声明组件都是class ComponentName extends Vue
// 这样的话class类就拥有了Vue接口里的方法，而这些方法在类中的表现形式就是原型链上的方法
declare module 'vue/types/vue' {
  interface Vue {
    $loading(options: LoadingServiceOptions): ElLoadingComponent;
  }
}

# 如何编写HUI2.x的TypeScript声明文件

> 关于组件的声明可参考Element的组件声明进行书写，如果遇到以上不能满足的情况，可参考复杂组件的声明，例如`message-box.d.ts`。
> 书写TypeScript声明文件，强烈建议仔细阅读https://www.tslang.cn/docs/handbook/declaration-files/introduction.html


## 什么是声明文件

个人的理解是类似于C语言的`*.h`头文件。

举个简单的例子：

当你制作第三方库并对外抛出一些API时需要告诉使用者API的使用方式（有几个参数，参数的类型是什么，返回值是什么），声明文件用于告诉使用者这些API的信息，如果使用者的用法不规范，那么就会产生错误提示（利用了TypeScript的类型检查等功能）。

如果第三方库是采用JavaScript编写，那么在TypeScript环境中引入这些库的时候可以通过声明文件识别它们的API以及变量信息。


## HUI声明文件的结构

``` javascript
types
├── index.d.ts            # 声明入口文件
├── hui.d.ts              # 组件引入文件
├── common.d.ts           # 通用类型文件
├── ...                   # HUI组件声明文件
```

## 如何为组件新建一个类型声明

例如这里以Affix组件为例，在types文件夹下新建`affix.d.ts`声明文件，并对外抛出一个类

``` javascript
// 这是对Vue接口的扩展，新增静态install方法，具体可查看Affix组件的index.js中的HAffix.install
import { HuiComponent } from './components';

// HAffix类继承HuiComponent
export declare class HAffix extends HuiComponent {
  // 这里是对外抛出的属性（Attributes）和方法
  // 具体参考http://hui.dev.hikhub.net/zh/others/affix.html#api官方文档的抛出属性和方法


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

```

Affix组件的声明写完之后，在`hui.d.ts`中引入该声明文件，并对外抛出

``` javascript
import { HAffix } from './affix';

// Affix 图钉
export class Affix extends HAffix {}
```

## 小技巧之类型别名

个人理解是类似于C语言的宏定义。

举个简单的例子：

例如Button有一个属性叫`type`，可选值包括`primary,success,warning,danger,info,text,link,ghost`

那么可以在`button.d.ts`中先定义一个类型别名

``` javascript
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'link' | 'ghost';
```

如果是经常会用到的类型，例如'primary' | 'success' | 'warning' | 'danger' | 'info' ，可以先在`common.d.ts`定义，然后在`button.d.ts`中引入并使用：

``` javascript
// common.d.ts
export type ComponentType = 'success' | 'warning' | 'info' | 'danger';

// button.d.ts
import { ComponentType } from './common';
export type ButtonType = ComponentType | 'info' | 'text' | 'link' | 'ghost';
```

> 文档地址： https://www.tslang.cn/docs/handbook/advanced-types.html  类型别名





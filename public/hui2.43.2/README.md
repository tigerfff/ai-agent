# HUI-VUE

HUI-VUE 整合了海康前端设计以及前端资源，致力于统一前端 UI 控件库，提供给 web 前端开发愉悦的开发体验。

## 安装

使用 `npm` 或 `yarn` 的方式安装能更好地和 [webpack](https://webpack.js.org/) 打包工具配合使用。

### npm 安装

```bash
# 切换到公司仓库源
$ npm config set registry http://af.hikvision.com.cn/artifactory/api/npm/npm-down/
$ npm i hui // 2.x版本
```

### yarn 安装

```bash
# 切换到公司仓库源
$ yarn  config set registry http://af.hikvision.com.cn/artifactory/api/npm/npm-down/
$ yarn add hui
```

### 完整引入

在项目入口文件`main.js`中全局注册 HUI 及其样式：

```javascript
import Vue from 'vue';
import HUI from 'hui';
import 'hui/lib/hui.css';

Vue.use(HUI);
```

## 问题反馈

如有任何使用上的问题，请联系相霄3

## 💕CONTRIBUTING

[如何参与贡献](http://10.12.81.18:8080/zh/guide/CONTRIBUTING.html#%E5%B7%A5%E4%BD%9C%E6%B5%81)
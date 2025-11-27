import { hasOwn } from 'hui/src/utils/util';
/**
 * 合并对象
 * @param {Object} target 要合并到的对象
 * @returns {Object} 合并后的新对象
 */
export default function(target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    // 从第二个参数开始
    const source = arguments[i] || {}; // 获取该对象
    for (const prop in source) {
      if (hasOwn(source, prop)) {
        // 只处理不是从原型链上继承来的属性
        const value = source[prop];
        if (value !== undefined) {
          target[prop] = value; // 覆盖
        }
      }
    }
  }

  return target;
}

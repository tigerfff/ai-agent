function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    /**
     * @desc 若存在指定的父控件，触发他的指定事件
     * @example Form中使用Input控件，Input失去焦点，触发Form的失去焦点事件
     * @param {String} componentName 父控件的名称
     * @param {String} eventName 需要触发的事件名称
     * @param {Object} params 事件参数
     */
    dispatch(componentName, eventName, params) {
      // 获取父组件，如果是根组件，则是$root
      var parent = this.$parent || this.$root;
      // 获取父节点的组件名
      var name = parent.$options.componentName;

      // 当父组件不是所需组件时继续向上寻找
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      // 找到所需组件后调用$emit触发当前事件
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    // 与dispatch相反
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};

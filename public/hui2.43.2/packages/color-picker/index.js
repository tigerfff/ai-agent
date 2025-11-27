import ElColorPicker from './src/main';

/* istanbul ignore next */
ElColorPicker.install = function(Vue) {
  Vue.component(ElColorPicker.name, ElColorPicker);
};

export default ElColorPicker;

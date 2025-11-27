import HAnchor from './src/anchor';

HAnchor.install = function(Vue) {
  Vue.component(HAnchor.name, HAnchor);
};

export default HAnchor;

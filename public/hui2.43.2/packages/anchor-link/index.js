import HAnchorLink from '../anchor/src/anchor-link';

HAnchorLink.install = function(Vue) {
  Vue.component(HAnchorLink.name, HAnchorLink);
};

export default HAnchorLink;

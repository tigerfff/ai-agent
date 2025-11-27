import ElMenuCollapse from '../menu/src/menu-collapse';

/* istanbul ignore next */
ElMenuCollapse.install = function(Vue) {
  Vue.component(ElMenuCollapse.name, ElMenuCollapse);
};

export default ElMenuCollapse;

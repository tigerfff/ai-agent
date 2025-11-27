import ElLoadIcon from '../icon/src/loading-icon.vue';

/* istanbul ignore next */
ElLoadIcon.install = function(Vue) {
  Vue.component(ElLoadIcon.name, ElLoadIcon);
};

export default ElLoadIcon;

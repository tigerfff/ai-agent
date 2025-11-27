import HSvgIcon from './src/svg-icon.vue';

/* istanbul ignore next */
HSvgIcon.install = function(Vue) {
  Vue.component(HSvgIcon.name, HSvgIcon);
};

export default HSvgIcon;

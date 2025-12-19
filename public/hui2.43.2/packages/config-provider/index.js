import ConfigProvider from './src/config-provider';

/* istanbul ignore next */
ConfigProvider.install = function(Vue) {
  Vue.component(ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider;

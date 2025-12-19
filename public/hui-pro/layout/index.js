import Layout from './src/layout.vue';
import LayoutAside from './src/layout-aside.vue';
import LayoutContent from './src/layout-content.vue';
import LayoutHeader from './src/layout-header.vue';
import LayoutFooter from './src/layout-footer.vue';

const install = function(Vue) {
  Vue.component(Layout.name, Layout);
  Vue.component(LayoutAside.name, LayoutAside);
  Vue.component(LayoutContent.name, LayoutContent);
  Vue.component(LayoutHeader.name, LayoutHeader);
  Vue.component(LayoutFooter.name, LayoutFooter);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install
};

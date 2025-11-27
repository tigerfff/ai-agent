import Ellipsis from '@hui-pro/ellipsis/index.js';

import Page from './src/page.vue';
import PageMenu from './src/page-menu.vue';
import PageSubmenu from './src/page-submenu.vue';
import PageMenuItem from './src/page-menu-item.vue';
import PageContainer from './src/page-container.vue';
import PageHeader from './src/page-header.vue';
import PageContent from './src/page-content.vue';
import PageFooter from './src/page-footer.vue';
import PageSidebar from './src/page-sidebar.vue';
import PageAction from './src/page-action.vue';
import PageSearch from './src/page-search.vue';
import PageSearchItem from './src/page-search-item.vue';
import PageGroup from './src/page-group.vue';
import PageTable from './src/page-table.vue';
import PageButtonGroup from './src/page-button-group.vue';
import PageDetail from './src/page-detail.vue';
import PageDetailItem from './src/page-detail-item.vue';

const install = function(Vue) {
  Vue.use(Ellipsis);

  Vue.component(Page.name, Page);
  Vue.component(PageMenu.name, PageMenu);
  Vue.component(PageSubmenu.name, PageSubmenu);
  Vue.component(PageMenuItem.name, PageMenuItem);
  Vue.component(PageContainer.name, PageContainer);
  Vue.component(PageHeader.name, PageHeader);
  Vue.component(PageContent.name, PageContent);
  Vue.component(PageFooter.name, PageFooter);
  Vue.component(PageSidebar.name, PageSidebar);
  Vue.component(PageAction.name, PageAction);
  Vue.component(PageSearch.name, PageSearch);
  Vue.component(PageSearchItem.name, PageSearchItem);
  Vue.component(PageGroup.name, PageGroup);
  Vue.component(PageTable.name, PageTable);
  Vue.component(PageButtonGroup.name, PageButtonGroup);
  Vue.component(PageDetail.name, PageDetail);
  Vue.component(PageDetailItem.name, PageDetailItem);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install
};

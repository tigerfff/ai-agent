import PagedTable from './src/paged-table';

/* istanbul ignore next */
PagedTable.install = function(Vue) {
  Vue.component(PagedTable.name, PagedTable);
};

export default PagedTable;

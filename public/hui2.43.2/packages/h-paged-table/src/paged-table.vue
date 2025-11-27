<template>
  <div class="el-paged-table">
    <div class="el-paged-table__table">
      <slot :data="tableData" />
    </div>
    <el-pagination
      :page-sizes="pageSizes"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-count="pagination.pageCount"
      :current-page="pagination.currentPage"
      :layout="layout"
      :before-current-change="beforeCurrentChange"
      :before-size-change="beforeSizeChange"
      class="el-paged-table__pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
import { defaultPromise } from 'hui/src/utils/util';

export default {
  name: 'HPagedTable',
  props: {
    /**
     * 构建 url 的函数
     * 当 props 的 fetch 未提供时，url 必填（为函数）
     * @param  {Number} pageSize    每页几条
     * @param  {Number} currentPage 第几页
     * @return {String} url 地址
     * @example (pageSize, currentPage, reloadOpt) => `https://api.example.com/items?perPage=${pageSize}&page=${currentPage}`
     */
    url: { type: [Function, String], default: '' },
    /**
     * 自定义请求函数
     * @param  {String} url         当前 url（由 props 的 url 返回的字符串）
     * @param  {Number} pageSize    每页几条
     * @param  {Number} currentPage 第几页
     * @param  {*} reloadOpt        调用 reload 方法时传进来的参数
     * @return {Promise<*>} 一个 Promise 对象，then 里接到的值为响应返回的数据
     * @example (url, pageSize, currentPage, reloadOpt) => axios.get(url)
     */
    fetch: { type: Function, default: url => defaultPromise({ url }) },
    /**
     * 当前是否正在请求
     */
    loading: { type: Boolean, default: false },
    /**
     * 分页跳转发请求前的钩子
     * @param {Number} val    改变后的值
     * @param {Number} oldVal 改变前的值
     * @return {Boolean} 是否继续发请求
     * @example (val, oldVal) => true
     */
    beforeCurrentChange: { type: Function, default: () => true },
    /**
     * 每页显示条目个数变化发请求前的钩子
     * @param {Number} val    改变后的值
     * @param {Number} oldVal 改变前的值
     * @return {Boolean} 是否继续发请求
     * @example (val, oldVal) => true
     */
    beforeSizeChange: { type: Function, default: () => true },
    /**
     * 获取表格数据的函数
     * @param {*} json 响应返回的数据
     * @return {Array} ElTable 的 props 中 data 所需的数据
     * @example (json) => json.items
     */
    data: { type: Function, required: true },
    /**
     * 获取总条目数的函数
     * @param {*} json 响应返回的数据
     * @return {Number} ElPagination 的 props 中 total 所需的数据
     * @example (json) => json.total
     */
    total: { type: Function, default: () => 0 },
    /**
     * 获取总页数的函数
     * @param {*} json 响应返回的数据
     * @return {Number} ElPagination 的 props 中 page-count 所需的数据
     * @example (json) => json.pageCount
     */
    pageCount: { type: Function, default: () => 0 },

    // 以下为 ElPagination 的 props
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    pageSize: { type: Number, default: 10 },
    pageSizes: { type: Array, default: () => [10, 20, 30, 40, 50, 100] },
    // 用于用户对当前页的设置 add by yangzhini 2018-11-30
    currentPage: { type: Number, default: 1 }
  },
  data() {
    return {
      tableData: [],
      pagination: {
        pageSize: this.pageSize || this.pageSizes[0] || 10,
        total: 0,
        pageCount: 0,
        currentPage: this.currentPage || 1
      }
    };
  },
  watch: {
    pageSize(val) {
      this.pagination.pageSize = val;
    },
    currentPage(val) {
      this.pagination.currentPage = val;
    }
  },
  mounted() {
    this.jump();
  },
  methods: {
    /**
     * 重新加载表格
     * @public
     */
    reload(opt) {
      return this.jump(opt);
    },
    jump(reloadOpt) {
      this.$emit('update:loading', true);
      const { pageSize, currentPage } = this.pagination;
      const url =
        typeof this.url === 'string'
          ? this.url
          : this.url(pageSize, currentPage, reloadOpt);
      return this.fetch(url, pageSize, currentPage, reloadOpt)
        .then(json => {
          this.pagination.total = this.total(json);
          this.pagination.pageCount = this.pageCount(json);
          this.tableData = this.data(json);
          this.$emit('fetch-success', json);
        })
        .catch(err => this.$emit('fetch-error', err))
        .then(() => this.$emit('update:loading', false));
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val;
      this.$emit('size-change', val);
      this.jump();
    },
    handleCurrentChange(val) {
      this.pagination.currentPage = val;
      this.$emit('update:currentPage', val);
      this.$emit('current-change', val);
      this.jump();
    }
  }
};
</script>

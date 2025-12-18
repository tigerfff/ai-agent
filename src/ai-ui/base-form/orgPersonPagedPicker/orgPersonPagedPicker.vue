<template>
  <div class="org-person-picker-container">
    <!-- 下面三联穿梭 -->
    <div class="left-tree">
      <div class="tree-action">
        <h4>所属组织</h4>
        <el-checkbox v-model="containSubOrgUsers" label="包含下级" @change="handleChangeContainSubOrg" />
      </div>
      <el-input
        v-model="leftTreeOrgName"
        placeholder="请输入组织名称搜索"
        suffix-icon="h-icon-search"
        clearable
        @click="handleSearchTree"
        @clear="initOrgTree"
      />

      <el-scrollbar wrap-class="left-tree-scrollbar-wrap">
        <el-tree
          ref="orgTree"
          :data="orgTreeData"
          :props="{ label: 'nodeName' }"
          node-key="nodeId"
          :load="loadOrgNode"
          lazy
          @current-change="handleOrgTreeChange"
        >
          <template #default="{ data }">
            <span class="el-tree-node__label ellipsis"> {{ data.nodeName }}</span>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>

    <PageDualTableTransfer
      ref="dualTable"
      style="width: 67%"
      :value="selectUser"
      :fetchMethod="findUserListMethod"
      :responseHandler="userListResHandler"
      :fetchOtherParams="customParams"
      :selectable="selectable"
      leftSearchKey="userName"
      :searchFields="['userName']"
      :defaultPageSize="defaultPageSize"
      :rowKey="rowKey"
      :maxSelectionLimit="selectLimit"
      :maxLimitMessage="maxLimitMessage"
      :maxListLimit="maxListLimit"
      @input="handleChangeUser"
    >
      <template #left-action>
        <el-dropdown 
          placement="bottom-end" 
          trigger="click" 
          @command="handleChangeRole" 
          @visible-change="()=>roleValueChange()">
          <span class="roles-select">
            <span class="role-name">{{ authRoleName }}</span>
            <i class="h-icon-angle_down_sm el-icon--right" style="font-size: 20px"></i>
          </span>
          <template slot="dropdown">
            <el-dropdown-menu class="org-more-roles">
              <div class="drop-list-header" style="padding: 0 12px">
                <el-input 
                  v-model="roleSearchValue"
                  clearable
                  placeholder="请输入职位进行搜索"
                  @change="roleValueChange"
                  :clear-icon-click="clearIconClick">
                </el-input>
              </div>
              <ul class="drop-list">
                <el-dropdown-item v-for="item in filterRoleList" :key="item.positionId" :command="item" :title="item.positionName">{{
                item.positionName
              }}</el-dropdown-item>
              </ul>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <template #left-columns>
        <el-table-column prop="userName" label="用户姓名">
          <template #default="{ row }">
            <span>{{ row.userName }}</span>
          </template>
        </el-table-column>
      </template>

      <template #right-columns>
        <el-table-column label="用户姓名" prop="userName" show-overflow-title>
          <template #default="{ row }">
            <span>{{ row.userName }}</span>
          </template>
        </el-table-column>
      </template>
    </PageDualTableTransfer>


   
  </div>
</template>
<script>
  // 组件设计思路： 因为传入的key情况较多。所以组件内部需要做一层转换，将传入的值统一转换为userId，然后输出的时候再转一道，转成用户希望的值。
  import { orgPersonPagedPickerApi } from './api';
  import emitter from '@/mixins/emitter';
  import PageDualTableTransfer from './PageDualTableTransfer.vue';

  export default {
    components: { PageDualTableTransfer },
    mixins: [emitter],
    props: {
      value: {
        type: Array,
        default: () => [],
      },
      // leftTable的key值
      rowKey: {
        type: String,
        default: 'userId',
      },
      validateEvent: {
        type: Boolean,
        default: true,
      },
      // 兼容旧组件-personnel-pick
      // 输出的值
      valueKey: {
        default: 'roleId',
        type: String,
      },
      labelKey: {
        default: 'roleName',
        type: String,
      },
      // 最大限制
      selectLimit: {
        type: Number,
        default: 0,
      },
      defaultPageSize: {
        type: Number,
        default: 50,
      },
      filterAdmin:{
        type: Boolean,
        default: false,
      },
      maxListLimit:{
        type: Number,
        default: 2000,
      },
      selectable: {
        type: Function,
        default: null
      },
      userList: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        selectUser: [],
        currentOrganizationId: '',
        // 职位列表
        roleList: [],
        filterRoleList: [],
        roleSearchValue: '',
        // 传给左侧Table
        findUserListMethod: orgPersonPagedPickerApi.findUserListAdminAuthority,
        // 是否包含下级节点
        containSubOrgUsers: true,
        // 自定义参数
        customParams: null,
        authRoleName: '全部职位',
        leftTreeOrgName: '',
        // 组织树的数据
        orgTreeData: [],
      };
    },
    watch: {
      value: {
        handler(newVal) {
          try {
            // 确保newVal是数组
            if (!Array.isArray(newVal)) {
              this.selectUser = [];
              return;
            }

            if(!newVal.length) {
              this.selectUser = [];
              return;
            }

            // 因为上层组件传过来的是valueKey是userId，但是实际上用到的值是roleId，具他妈离谱。 所以这里会先算出哪个才是真正传入进来的key值。
            this.realLabelKey = this.getFirstLabelProperty(newVal[0])
            this.realValueKey = this.getFirstValidProperty(newVal[0])

            // 安全地获取ID进行比较
            const getIds = (arr) =>
              Array.isArray(arr) ? arr.map((item) => item && (item.userId || item[this.valueKey] ||  item.roleId)).filter(Boolean) : [];

            const currentValueIds = getIds(this.selectUser).sort().join(',');
            const newValueIds = getIds(newVal).sort().join(',');
            if (currentValueIds !== newValueIds) {
              this.transformAndSetValue(newVal);
            }
          } catch (error) {
          }
        },
        deep: true,
        immediate: true,
      },
    },
    
    computed: {
      maxLimitMessage() {
        return '所选数量超过最大限度' + this.selectLimit + '，请重新选择';
      }
    },
    created() {
      // 初始化时转换value格式
      this.transformAndSetValue(this.value);
    },
    mounted() {},

    methods: {
      roleValueChange(value) {
        if (!value) {
          this.filterRoleList = this.roleList;
          this.roleSearchValue = ''
          return
        }
        this.filterRoleList = this.roleList.filter(item=>item.positionName.includes(value))
      },

      clearIconClick() {
        this.roleValueChange()
      },
      // 拿到真实的传参valueKey
      getFirstValidProperty(item) {
        if (item.userId) return 'userId';
        if (item[this.valueKey]) return this.valueKey;
        if (item.roleId) return 'roleId';
        return '';
      },

      getFirstLabelProperty(item) {
        if (item.userName) return 'userName';
        if (item[this.labelKey]) return this.labelKey;
        if (item.roleName) return 'roleName';
        return '';
      },
      // 转换输入值并设置到组件内部
      async transformAndSetValue(inputValue) {
        
        // 首先确保inputValue是一个数组
        if (!inputValue || !Array.isArray(inputValue) || inputValue.length === 0) {
          this.selectUser = [];
          return;
        }

        try {
          // 深复制防止修改原始数据
          let transformedData = this.cloneDeep(inputValue);

          // 转换字段 - 确保每一项都有正确的格式
          transformedData = transformedData
            .map((item) => {
              if (!item) return null; // 跳过空项

              const userId = item[this.realValueKey] || '';
              const userName = item[this.realLabelKey] || '';
              
              return {
                ...item, // 保留原始数据的其他字段
                userId,
                userName,
              };
            })
            .filter(Boolean); // 过滤掉可能的null项

          this.selectUser = transformedData;
        } catch (error) {
          this.selectUser = []; // 出错时设为空数组
        }
      },

      // 转换输出数据格式
      transformOutputValue(users) {
        if (!users || !Array.isArray(users) || users.length === 0) return [];

        try {
          return users
            .map((user) => {
              if (!user) return null;

              const result = this.cloneDeep(user);

              // 使用指定的valueKey/labelKey作为输出字段
              result[this.realValueKey] = user.userId || '';
              result[this.realLabelKey] = user.userName || '';

              // 用户第一次进入的时候可能拿不到this.realValueKey，和拿realValueKey的原因一致，都是为了兼容旧版本
              result.roleId = user.userId || '';
              result.roleName= user.userName || '';

              return result;
            })
            .filter(Boolean);
        } catch (error) {
          return [];
        }
      },

      // 处理用户选择变化
      handleChangeUser(users) {
        try {
          // 确保users是数组
          if (!Array.isArray(users)) {
            return;
          }

          // 转换为所需的输出格式
          const outputUsers = this.transformOutputValue(users);

          // 触发表单验证
          if (this.validateEvent) this.dispatch('ElFormItem', 'el.form.change', [outputUsers]);

          // 更新内部状态
          this.selectUser = users;

          // 向外发送事件
          this.$emit('input', outputUsers);
          this.$emit('change', outputUsers);
        } catch (error) {
        }
      },

      init() {
        this.leftTreeOrgName = '';
        this.containSubOrgUsers = true;
        this.currentOrganizationId = '';

        // 这部分逻辑移到了transformAndSetValue方法中，但仍然保留兼容性
        try {
          if (Array.isArray(this.selectUser) && this.selectUser.length) {
            this.transformAndSetValue(this.selectUser);
          }
        } catch (error) {
        }
      },


      // 可以通过实例获取选择结果
      getSelectedList() {
        try {
          return this.transformOutputValue(this.selectUser);
        } catch (error) {
          return [];
        }
      },

      // 获取全部组织
      async getRoleList() {
        this.authRoleIds = 'all';
        const { data } = await orgPersonPagedPickerApi.getRoleList(this.$aiClient);
        const dataList = data || [];
        dataList.unshift({
          positionName: '全部职位',
          positionId: 'all',
        });
        this.roleList = dataList;
        this.roleValueChange()
      },
      // 所属组织加载节点
      async loadOrgNode(node, resolve) {
        if (node.level === 0) {
          await this.getRoleList();
          const { data } = await orgPersonPagedPickerApi.findOrgTreeByParentId(this.$aiClient);
          this.orgTreeData = data;
          if (this.orgTreeData.length > 0) {
            this.$nextTick(() => {
              this.$refs.orgTree.expandNode(this.orgTreeData[0].nodeId);
              this.$refs.orgTree.setSelected(this.orgTreeData[0].nodeId);
            });
          }
          return resolve(this.orgTreeData);
        }
        const { data } = await orgPersonPagedPickerApi.findOrgTreeByParentId(this.$aiClient, { nodeId: node.data.nodeId });
        resolve(data);
      },

      // 返回结果
      async userListResHandler(response) {
        const data = response.data;

        const userListData = data.rows.map((_) => ({
          userName: _.userName,
          userId: _.userId,
        }));
        return {
          data: userListData,
          total: data.total,
        };
      },

      // 树的节点改变
      async handleOrgTreeChange(node) {
        this.currentOrganizationId = node.nodeId || node.groupId;
        const positionId = this.authRoleIds === 'all' ? '' : [this.authRoleIds];
        this.customParams = {
          active: 'active',
          organizationId: node.nodeId || node.groupId,
          positionId: positionId,
          containSubOrgUsers: this.containSubOrgUsers,
          filterAdmin: this.filterAdmin,
          userIds: this.userList
          // ban: this.$route.path.includes('inspect') ? false : undefined,
        };
      },

      // 初始化树
      async initOrgTree() {
        const { data } = await orgPersonPagedPickerApi.findOrgTreeByParentId(this.$aiClient, undefined);
        this.orgTreeData = data;
        if (this.orgTreeData.length > 0) {
          this.$nextTick(() => {
            this.$refs.orgTree.expandNode(this.orgTreeData[0].nodeId);
            this.$refs.orgTree.setSelected(this.orgTreeData[0].nodeId);
          });
        }
      },

      // 搜索树
      async handleSearchTree() {
        const params = {
          limit: 100,
          condition: this.leftTreeOrgName,
        };
        const { data } = await orgPersonPagedPickerApi.findOrgTreeByParentId(this.$aiClient, params);
        this.orgTreeData = data;
      },

      // 是否包括下级节点
      handleChangeContainSubOrg(value) {
        this.containSubOrgUsers = value;
        if (!this.currentOrganizationId) return;
        this.handleOrgTreeChange({ nodeId: this.currentOrganizationId });
      },

      // 改变职位
      handleChangeRole(command) {
        this.authRoleIds = command.positionId;
        this.authRoleName = command.positionName;
        if (!this.currentOrganizationId) return;
        this.handleOrgTreeChange({ nodeId: this.currentOrganizationId });
      },
      
      // 深拷贝工具方法
      cloneDeep(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.cloneDeep(item));
        if (typeof obj === 'object') {
          const copy = {};
          Object.keys(obj).forEach(key => {
            copy[key] = this.cloneDeep(obj[key]);
          });
          return copy;
        }
      }
    },
  };
</script>
<style lang="scss" scoped>
  @use '@/style/mixins.scss';
  .org-person-picker-container {
    display: flex;
    align-items: center;
    height: 480px;
    min-width: 600px;
    .left-tree {
      width: 33%;
      height: 480px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-right: none;
      padding: 8px 16px;
      display: flex;
      flex-direction: column;
      ::v-deep .el-tree--highlight-current .el-tree-node.is-current:not(.is-drag)>.el-tree-node__content {
        background-color: var(--ym-ai-primary-color) !important;
      }
      .tree-action {
        height: 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        line-height: 24px;
        flex-shrink: 0;
        .el-checkbox {
          line-height: 24px;
          display: flex;
          align-items: center;
        }
        h4 {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.9);
          letter-spacing: 0;
          line-height: 20px;
          font-weight: 600;
        }
      }
      .el-input {
        width: 100%;
        margin-bottom: 8px;
      }
      .el-tree-node__label {
        display: inline-block;
        max-width: 50%;
      }
      ::v-deep .left-tree-scrollbar-wrap {
        overflow-x: hidden;
        height: 100%;
        padding-right: 12px;
        .el-scrollbar__view {
          line-height: initial !important;
        }
      }
    }
    .roles-select {
      cursor: pointer;
      line-height: 32px;
      height: 32px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      .role-name {
        display: inline-block;
        max-width: 150px;
        @extend %ellipsis;
      }
    }
  }
</style>
<style lang="scss">
  @use '@/style/mixins.scss';
  .org-more-roles {
    height: 260px;
    width: 240px;
    display: flex;
    flex-direction: column;
    .drop-list-header{
      height: 44px;
      display: flex;
      align-items: center;
    }
    .drop-list{
      height: 0;
      flex: 1;
      overflow: auto;
      @extend %scrollbar;
    }
    .el-dropdown-menu__item {
      max-width: 100%;
      @extend %ellipsis;
    }
    .el-dropdown-menu__item:active:not(.is-disabled) {
      background: var(--ym-ai-primary-color);
      color: #fff;
    }
    .el-dropdown-menu__item:hover:not(.is-disabled) {
      background-color: var( --ym-ai-primary-color);
      color: #fff;
    }
  }
</style>

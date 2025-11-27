/* eslint-disable no-unused-vars */
import Vue from 'vue';
import { ElLoading } from './loading';
import { ElMessage } from './message';
import { ElMessageBox } from './message-box';
import { ElNotification } from './notification';
import { HAffix } from './affix';
import { ElAlert } from './alert';
import { HAnchor } from './anchor';
import { HAnchorLink } from './anchor-link';
// import { ElAutocomplete } from './autocomplete';
// import { ElBadge } from './badge';
// import { ElBreadcrumb } from './breadcrumb';
// import { ElBreadcrumbItem } from './breadcrumb-item';
// import { ElBreadcrumbSubItem } from './breadcrumb-subitem';
// import { ElButton } from './button';
// import { ElButtonGroup } from './button-group';
// import { ElCard } from './card';
// import { ElCarousel } from './carousel';
// import { ElCarouselItem } from './carousel-item';
// import { ElCascader } from './cascader';
// import { ElCheckbox } from './checkbox';
// import { ElCheckboxButton } from './checkbox-button';
// import { ElCheckboxGroup } from './checkbox-group';
// import { ElCol } from './col';
// import { ElCollapse } from './collapse';
// import { ElCollapseItem } from './collapse-item';
// import { ElColorPicker } from './color-picker';
// import { ElDatePicker } from './date-picker';
// import { ElDialog } from './dialog';
// import { ElDropdown } from './dropdown';
// import { ElDropdownItem } from './dropdown-item';
// import { ElDropdownMenu } from './dropdown-menu';
// import { HFeedbackIcon } from './feedback-icon';
// import { ElForm } from './form';
// import { ElFormItem } from './form-item';
// import { HPagedTable } from './page-table';
// import { HUpload, ElUpload } from './upload';
// import { ElIcon } from './icon';
// import { ElInput } from './input';
// import { ElInputNumber } from './input-number';
// import { HIpInput } from './ip-input';
// import { ElLoadIcon } from './load-icon';
// import { ElMenu } from './menu';
// import { ElMenuCollapse } from './menu-collapse';
// import { ElMenuItem } from './menu-item';
// import { ElMenuItemGroup } from './menu-item-group';
// import { ElOption } from './option';
// import { ElOptionGroup } from './option-group';
// import { ElPagination } from './pagination';
// import { ElPopover } from './popover';
// import { ElProgress } from './progress';
// import { ElRadio } from './radio';
// import { ElRadioButton } from './radio-button';
// import { ElRadioGroup } from './radio-group';
// import { ElRate } from './rate';
// import { ElRow } from './row';
// import { ElSelect } from './select';
// import { ElSlider } from './slider';
// import { ElSpinner } from './spinner';
// import { ElStep } from './step';
// import { ElSteps } from './steps';
// import { HSubanchor } from './subanchor';
// import { ElSubmenu } from './submenu';
// import { HSvgIcon } from './svg-icon';
// import { ElSwitch } from './switch';
// import { ElTabPane } from './tab-pane';
// import { ElTable } from './table';
// import { ElTableColumn } from './table-column';
// import { ElTabs } from './tabs';
// import { ElTag } from './tag';
// import { ElTimePicker } from './time-picker';
// import { ElTimeSelect } from './time-select';
// import { ElTooltip } from './tooltip';
// import { ElTransfer } from './transfer';
// import { ElTree } from './tree';

interface InstallationOptions {
  locale: any;
  i18n: any;
}

/**
 * 在Vue中安装所有的Hui组件
 * 不要直接调用这个方法
 * 使用Vue.use(Hui)安装
 */
export function install(vue: typeof Vue, options: InstallationOptions): void;

// Loading 加载
export const Loading: ElLoading;
// Message 消息提示
export const Message: ElMessage;
// MessageBox 弹框
export const MessageBox: ElMessageBox;
// Notification 通知
export const Notification: ElNotification;
// Affix 图钉
export class Affix extends HAffix {}
// Alert 警告
export class Alert extends ElAlert {}
// Anchor 锚点
export class Anchor extends HAnchor {}
export class AnchorLink extends HAnchorLink {}

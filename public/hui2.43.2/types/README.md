### 最新版本的HUI对于TypeScript支持程度说明

#### 支持组件挂载在原型上的API

``` javascript
Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;
```


``` javascript
// succsss
this.$loading({
  fullscreen: true
})

// (method) Vue.$loading(options: LoadingServiceOptions): ElLoadingComponent
// Expected 1 arguments, but got 0.
// 提示方法错误，期望有参数，但是没有提供
this.$loading()

// (property) fullscreen1: boolean
// Argument of type '{ fullscreen1: boolean; }' is not assignable to parameter of type 'LoadingServiceOptions'.
// Object literal may only specify known properties, but 'fullscreen1' does not exist in type 'LoadingServiceOptions'. 
// Did you mean to write 'fullscreen'?
// 提示不存在参数fullscreen1，但是会询问你是否想要传入参数 fullscreen
this.$loading({ 
  fullscreen1: true
})
```

![image](/uploads/ade4515572e2255a5ec1d9c053861603/image.png)




#### 支持从HUI中直接引入的组件(非Template模板使用的情况)


``` javascript
import { Message, Loading, Notification, MessageBox } from 'hui'

// success
Message('212121')

// (alias) Message(message: string): ElMessageComponent (+1 overload)
// import Message 
// Expected 1 arguments, but got 0.
Message()

// Argument of type '{ a: number; }' is not assignable to parameter of type 'ElMessageOptions'.
// Object literal may only specify known properties, and 'a' does not exist in type 'ElMessageOptions'.
Message({a: 111})

```

![image](/uploads/6890c6482e7b6b4235fdeeac989b9c39/image.png)



#### HUI暂时不支持控件的按需引入提示

考虑到目前按需引入的场景较少，HUI暂时不支持大部分按需引入的控件，目前支持的列表如下：

``` javascript
export default {
  locale: locale.use,
  i18n: locale.i18n,
  install,
  Loading,
  MessageBox,
  Notification,
  Message,
  Affix,
  Alert,
}
```

不支持的列表如下：

``` javascript
export default {
  version: packageJson.version,
  CollapseTransition,
  nextZIndex: PopupManager.nextZIndex,
  Pagination,
  Dialog,
  Autocomplete,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  MenuCollapse,
  Input,
  InputNumber,
  IpInput,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  TableColumn,
  HPagedTable,
  DatePicker,
  TimeSelect,
  TimePicker,
  Popover,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Tree,
  Slider,
  Icon,
  SvgIcon,
  LoadingIcon,
  FeedbackIcon,
  Row,
  Col,
  HUpload,
  Upload,
  Progress,
  Spinner,
  Badge,
  Card,
  Rate,
  Steps,
  Step,
  Carousel,
  Scrollbar,
  CarouselItem,
  Collapse,
  CollapseItem,
  Cascader,
  ColorPicker,
  Transfer,
  Anchor,
  Subanchor,
  AnchorLink
};
```
# AIEmpty 空状态组件

`AIEmpty` 用于显示空状态页面，支持多种空状态类型（默认、建设中、未购买服务等）。

## 基本用法

```vue
<template>
  <AIEmpty 
    type="default"
    title="暂无数据"
    description="还没有任何数据"
  />
</template>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 空状态类型：'default' | 'building' | 'no-service' | String | 'default' |
| title | 标题 | String | '' |
| description | 描述文本 | String | '' |

## 使用示例

### 默认空状态

```vue
<AIEmpty 
  type="default"
  title="暂无会话"
  description="开始一个新的对话吧"
/>
```

### 建设中状态

```vue
<AIEmpty 
  type="building"
  title="智能体名称"
  description="该智能体正在建设中,敬请期待..."
/>
```

### 未购买服务状态

```vue
<AIEmpty 
  type="no-service"
  title="你还未购买「服务名称」"
  description="请联系管理员扫码添加销售人员进行购买"
/>
```

## 注意事项

1. `type="building"` 时，如果没有提供 `title`，会使用智能体名称
2. `type="building"` 时，如果没有提供 `description`，会使用默认描述："该智能体正在建设中,敬请期待..."


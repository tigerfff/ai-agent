
# AiImageGroup 组件文档

## 组件功能
- 按时间步进方式展示图片组
- 支持自定义头部内容
- 自动按图片分组并排序

## 基本用法

```vue
<template>
  <AiImageGroup 
    stepByTime 
    :images="images"
    :containerWidth="400"
  >
    <!-- 默认会使用内置的头部样式 -->
  </AiImageGroup>
</template>

<script>
export default {
  data() {
    return {
      images: [...] // 图片数据数组
    }
  }
}
</script>
```

## 使用作用域插槽自定义头部

```vue
<template>
  <AiImageGroup 
    stepByTime 
    :images="images1"
    :containerWidth="400"
  >
    <template #header="{ time }">
      <div class="custom-header" style="margin-bottom: 4px">
        <span>自定义时间显示: {{ formatTime(time) }}</span>
        <span>其他内容</span>
      </div>
    </template>
  </AiImageGroup>
</template>

<script>
export default {
  data() {
    return {
      images1: [...] // 图片数据数组
    }
  },
  methods: {
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString()
    }
  }
}
</script>

<style>
.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
```

## Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|------|------|
| images | 图片数据数组 | Array | [] | 是 |
| stepByTime | 是否按时间步进显示 | Boolean | false | 否 |
| width | 图片宽度 | Number | 140 | 否 |
| height | 图片高度 | Number | 140 | 否 |
| containerWidth | 容器宽度 | Number | 140 | 否 |

## 图片数据格式

```javascript
[
  {
    picRelId: '分组ID', // 相同ID的图片会被分到同一组
    picUrl: '图片URL',
    captureTime: 时间戳, // 用于排序
    // 其他图片属性...
  },
  // 更多图片...
]
```

## 插槽

| 名称 | 说明 | 作用域参数 |
|------|------|------|
| header | 自定义头部内容 | { time: 时间戳 } |

## 完整示例

```vue
<template>
  <div>
    <h2>默认样式</h2>
    <AiImageGroup 
      stepByTime 
      :images="images1"
      :containerWidth="400"
    />
    
    <h2>自定义头部</h2>
    <AiImageGroup 
      stepByTime 
      :images="images1"
      :containerWidth="400"
    >
      <template #header="{ time }">
        <div class="custom-header">
          <span>自定义时间: {{ formatTime(time) }}</span>
          <span>共 {{ getGroupCount(time) }} 张图片</span>
        </div>
      </template>
    </AiImageGroup>
  </div>
</template>

<script>
export default {
  data() {
    return {
      images1: [
        {
          picRelId: 'a',
          picUrl: 'https://example.com/1.jpg',
          captureTime: 1750840211000,
          // 其他属性...
        },
        {
          picRelId: 'a',
          picUrl: 'https://example.com/2.jpg',
          captureTime: 1750839911000,
          // 其他属性...
        },
        // 更多图片...
      ]
    }
  },
  methods: {
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString()
    },
    getGroupCount(time) {
      // 根据时间获取组内图片数量
      const group = this.images1.filter(img => 
        new Date(img.captureTime).toLocaleString() === new Date(time).toLocaleString()
      )
      return group.length
    }
  }
}
</script>

<style>
.custom-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f0f7ff;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 14px;
}
</style>
```

## 注意事项

1. 确保 `images` 数组中的每张图片都有 `picRelId` 和 `captureTime` 属性
2. 时间戳应为毫秒级时间戳
3. 使用作用域插槽时，可以通过 `{ time }` 获取当前组的时间数据
4. 组件内部已经处理了图片分组和排序逻辑

## 兼容性
- Vue 2.6+
- 现代浏览器

这个文档包含了组件的所有关键使用场景和API说明，你可以根据需要调整或扩展内容。
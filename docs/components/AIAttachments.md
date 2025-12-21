# AIAttachments 附件列表组件

`AIAttachments` 用于显示附件列表，支持图片、视频、文档等类型的预览和操作。

## 基本用法

```vue
<template>
  <AIAttachments 
    v-model="fileList"
    :card-mode="cardMode"
    overflow="scrollX"
  />
</template>

<script>
export default {
  data() {
    return {
      fileList: [
        {
          uid: 1,
          name: 'image.jpg',
          url: '/path/to/image.jpg',
          type: 'image',
          status: 'done'
        }
      ],
      cardMode: 'default'
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 文件列表（支持 v-model） | Array | [] |
| overflow | 滚动布局模式：'scrollX' | 'scrollY' | 'wrap' | String | 'scrollX' |
| readonly | 是否只读（隐藏删除按钮） | Boolean | false |
| cardMode | 卡片展示模式：'default' | 'mini' | 'single-image' | String | 'default' |
| iconSize | 图标大小 | String | '42px' |

### 文件项数据结构

```typescript
interface FileItem {
  uid: string | number       // 唯一标识
  name: string              // 文件名
  url?: string              // 文件 URL
  localUrl?: string         // 本地预览 URL（用于 File 对象）
  type?: string             // 文件类型：'image' | 'video' | 'file'
  size?: number             // 文件大小（字节）
  status?: string           // 状态：'uploading' | 'done' | 'error'
  percent?: number          // 上传进度 0-100
  rawFile?: File            // 原始 File 对象（用于预览）
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 文件列表变化（用于 v-model） | (fileList: Array) |
| change | 文件列表变化 | (fileList: Array) |

## 使用示例

### 基础用法

```vue
<AIAttachments v-model="fileList" />
```

### 不同布局模式

```vue
<!-- 横向滚动 -->
<AIAttachments 
  v-model="fileList"
  overflow="scrollX"
/>

<!-- 纵向滚动 -->
<AIAttachments 
  v-model="fileList"
  overflow="scrollY"
/>

<!-- 自动换行 -->
<AIAttachments 
  v-model="fileList"
  overflow="wrap"
/>
```

### 不同卡片模式

```vue
<!-- 完整卡片（默认） -->
<AIAttachments 
  v-model="fileList"
  card-mode="default"
/>

<!-- 缩略图模式 -->
<AIAttachments 
  v-model="fileList"
  card-mode="mini"
/>

<!-- 单图模式（只显示第一张图片） -->
<AIAttachments 
  v-model="fileList"
  card-mode="single-image"
/>
```

**单图模式特性**：
- 只显示第一张图片或视频
- 视频会显示播放图标（根据图标大小自动调整）
- 图片在鼠标悬停时会显示预览图标
- 图标大小会根据 `iconSize` 自动调整

**图标大小规则**：
- 如果 `iconSize >= 100px` 或包含 `%`：使用 28px 图标（大图模式）
- 如果 `iconSize < 100px`：使用 14px 图标（小图模式）

这样可以确保在不同尺寸的卡片中，图标都有合适的显示效果。
```

### 显示上传进度

```vue
<AIAttachments v-model="fileList" />

<script>
export default {
  data() {
    return {
      fileList: [
        {
          uid: 1,
          name: 'large-file.mp4',
          type: 'video',
          status: 'uploading',
          percent: 45
        }
      ]
    }
  },
  methods: {
    async uploadFile(file) {
      // 添加到列表
      const item = {
        uid: Date.now(),
        name: file.name,
        type: 'video',
        status: 'uploading',
        percent: 0,
        rawFile: file
      }
      this.fileList.push(item)
      
      // 上传文件
      const url = await this.uploadWithProgress(file, (percent) => {
        item.percent = percent
      })
      
      // 更新状态
      item.url = url
      item.status = 'done'
      item.percent = 100
    }
  }
}
</script>
```

### 只读模式

```vue
<AIAttachments 
  v-model="fileList"
  :readonly="true"
/>
```

## 注意事项

1. 组件会自动识别文件类型（根据 MIME type 或文件扩展名）
2. `rawFile` 存在时，会优先使用它进行预览
3. `status` 为 'uploading' 时会显示进度条
4. 点击文件会打开预览弹窗（图片/视频）
5. 在 `single-image` 模式下，播放/预览图标大小会根据 `iconSize` 自动调整


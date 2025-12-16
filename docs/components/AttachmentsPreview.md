# AttachmentsPreview 附件预览组件

`AttachmentsPreview` 用于预览附件（图片、视频、文档），支持全屏显示和导航切换。

## 基本用法

```vue
<template>
  <AttachmentsPreview
    :visible="previewVisible"
    :file-list="fileList"
    :initial-index="previewIndex"
    @close="closePreview"
  />
</template>

<script>
export default {
  data() {
    return {
      previewVisible: false,
      previewIndex: 0,
      fileList: [
        {
          name: 'image.jpg',
          url: '/path/to/image.jpg',
          type: 'image'
        }
      ]
    }
  },
  methods: {
    openPreview(index) {
      this.previewIndex = index
      this.previewVisible = true
    },
    closePreview() {
      this.previewVisible = false
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示预览 | Boolean | false |
| fileList | 文件列表 | Array | [] |
| initialIndex | 初始预览的文件索引 | Number | 0 |

### 文件项数据结构

```typescript
interface FileItem {
  name: string              // 文件名
  url?: string              // 文件 URL
  localUrl?: string         // 本地预览 URL
  type: 'image' | 'video' | 'file'  // 文件类型
  size?: number             // 文件大小（字节）
  rawFile?: File            // 原始 File 对象（用于本地预览）
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| close | 关闭预览 | - |

## 使用示例

### 基础用法

```vue
<AttachmentsPreview
  :visible="visible"
  :file-list="fileList"
  :initial-index="index"
  @close="visible = false"
/>
```

### 从文件列表打开预览

```vue
<template>
  <div>
    <AIAttachments 
      v-model="fileList"
      @preview="openPreview"
    />
    <AttachmentsPreview
      :visible="previewVisible"
      :file-list="fileList"
      :initial-index="previewIndex"
      @close="closePreview"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      fileList: [],
      previewVisible: false,
      previewIndex: 0
    }
  },
  methods: {
    openPreview(index) {
      this.previewIndex = index
      this.previewVisible = true
    },
    closePreview() {
      this.previewVisible = false
    }
  }
}
</script>
```

## 功能特性

1. **图片预览**：支持常见图片格式（jpg、png、gif 等）
2. **视频预览**：支持视频播放，带控制栏
3. **文档预览**：显示文档图标和文件信息
4. **导航切换**：当文件列表包含多个文件时，支持左右箭头或键盘方向键切换
5. **快捷键**：
   - `ESC`：关闭预览
   - `←`：上一个文件
   - `→`：下一个文件

## 注意事项

1. 组件会自动识别文件类型
2. 如果有 `rawFile`，会优先使用它进行本地预览
3. 导航功能仅在文件列表长度大于 1 时显示


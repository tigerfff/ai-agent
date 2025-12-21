# AIInput 输入框组件

`AIInput` 是一个功能丰富的输入框组件，支持文本输入、文件上传、语音识别等功能。

## 基本用法

```vue
<template>
  <AIInput 
    v-model="inputValue"
    placeholder="请输入内容..."
    @send="handleSend"
  />
</template>

<script>
export default {
  data() {
    return {
      inputValue: ''
    }
  },
  methods: {
    handleSend(data) {
      console.log('发送内容:', data.text)
      console.log('附件:', data.attachments)
    }
  }
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 输入框的值（支持 v-model） | String | '' |
| placeholder | 占位符文本 | String | '请输入内容...' |
| disabled | 是否禁用 | Boolean | false |
| loading | 是否显示加载状态 | Boolean | false |
| maxLength | 最大字符数 | Number | 2000 |
| submitType | 提交方式：'enter' 回车发送，'shiftEnter' Shift+回车发送 | String | 'enter' |
| allowedTypes | 允许的文件类型，支持字符串、对象或数组格式 | String/Object/Array | null |
| accepts | 兼容旧版：文件类型限制（字符串格式） | String | null |
| singleTypeMode | 单一类型模式：开启后只能上传一种类型的文件 | Boolean | false |
| maxSize | 最大文件大小（字节） | Number | null |
| maxCount | 最大文件数量限制 | Number | null |
| fileLimit | 分类型的文件限制配置 | Object | {} |
| beforeAddAttachments | 文件上传前钩子 | Function | null |
| beforeSend | 发送前钩子 | Function | null |
| speechConfigProvider | 语音识别配置提供者 | Function | null |
| buttonConfig | 按钮配置对象 | Object | {} |
| sendDisabled | 发送按钮是否禁用 | Boolean | null |
| customMenuItems | 自定义菜单项数组 | Array | [] |

### allowedTypes 配置说明

**格式1：字符串**
```javascript
allowedTypes=".jpg,.jpeg,.png,.mp4"
```

**格式2：对象**
```javascript
allowedTypes: {
  image: true,
  video: true,
  document: true
}
```

**格式3：数组**
```javascript
allowedTypes: ['image', 'video']
```

### fileLimit 配置说明

```javascript
fileLimit: {
  image: {
    maxSize: 10 * 1024 * 1024,  // 10MB
    extensions: ['jpg', 'png', 'jpeg']
  },
  video: {
    maxSize: 200 * 1024 * 1024,  // 200MB
    extensions: ['mp4']
  }
}
```

### buttonConfig 配置说明

```javascript
buttonConfig: {
  upload: { visible: true, disabled: false },
  clear: { visible: true, disabled: false },
  speech: { visible: true, disabled: false },
  stop: { visible: true, disabled: false },
  send: { visible: true, disabled: false }
}
```

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 输入框内容变化 | (value: String) |
| send | 发送消息 | (data: { text: String, attachments: Array }) |
| submit | 提交（兼容旧版） | (text: String) |
| stop | 停止生成 | - |
| clear | 清空内容 | - |
| file-list-change | 文件列表变化 | (fileList: Array) |
| custom-menu-item-click | 自定义菜单项点击 | (event: Object) |

## Methods

通过 ref 可以调用以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| addFiles | 添加文件 | (files: File[]) |
| setText | 设置输入框文本 | (text: String) |
| focusInput | 聚焦输入框 | - |
| clear | 清空内容 | - |

## Slots

| 插槽名 | 说明 |
|--------|------|
| prefix | 输入框前缀内容 |
| footer | 底部内容 |

## 使用示例

### 基础用法

```vue
<AIInput 
  v-model="text"
  placeholder="请输入..."
  @send="handleSend"
/>
```

### 限制文件类型和大小

```vue
<AIInput 
  :allowed-types="['image', 'video']"
  :max-size="200 * 1024 * 1024"
  :max-count="5"
  :file-limit="{
    image: { maxSize: 10 * 1024 * 1024, extensions: ['jpg', 'png'] },
    video: { maxSize: 200 * 1024 * 1024, extensions: ['mp4'] }
  }"
  :before-add-attachments="handlePreUpload"
  @send="handleSend"
/>
```

### 单一类型模式

开启 `singleTypeMode` 后，一旦选择了某种文件类型，就只能继续选择该类型。

**工作原理**：
1. 首次上传文件时，根据第一个文件的类型锁定类型（image/video/file）
2. 后续上传的文件必须与锁定的类型一致
3. 如果类型不一致，会提示错误并阻止上传

**重要说明**：
- 类型锁定只在文件通过所有验证（大小、格式等）后才会生效
- 如果文件验证失败（如超过大小限制），不会锁定类型
- 清空文件列表后，类型锁定会重置
- 这样可以避免因为验证失败的文件导致类型锁定错误

**使用场景**：
- 需要确保一次对话中只上传图片或只上传视频
- 避免混合类型导致的处理复杂度

**示例**：

```vue
<AIInput 
  :single-type-mode="true"
  :allowed-types="['image', 'video']"
  @send="handleSend"
/>
```

**行为示例**：
1. 用户选择一张图片 → 类型锁定为 `image`
2. 用户再选择一张图片 → ✅ 允许
3. 用户选择视频 → ❌ 提示"当前模式下只能上传图片类型文件"
4. 用户清空文件列表 → 类型锁定重置
5. 用户选择视频（超过大小限制）→ ❌ 验证失败，但不会锁定类型
6. 用户再选择图片 → ✅ 允许（因为类型未锁定）

### 语音输入

```vue
<AIInput 
  :speech-config-provider="getAsrConfig"
  @send="handleSend"
/>

<script>
export default {
  methods: {
    async getAsrConfig() {
      // 返回语音识别配置
      return {
        appId: 'your-app-id',
        sign: 'your-sign',
        engineModelType: '16k_zh'
      }
    }
  }
}
</script>
```

### 发送前校验

```vue
<AIInput 
  :before-send="handleBeforeSend"
  @send="handleSend"
/>

<script>
export default {
  methods: {
    handleBeforeSend(data) {
      // 校验逻辑
      if (!data.text && data.attachments.length === 0) {
        this.$message.warning('请输入内容或上传文件')
        return false
      }
      
      // 检查附件状态
      const hasError = data.attachments.some(f => f.status === 'error')
      if (hasError) {
        this.$message.warning('存在上传失败的文件')
        return false
      }
      
      return true
    }
  }
}
</script>
```

### 文件上传

```vue
<AIInput 
  :before-add-attachments="handlePreUpload"
  @send="handleSend"
/>

<script>
export default {
  methods: {
    async handlePreUpload(rawFiles, context) {
      const { updateItem } = context
      
      // 上传文件到服务器
      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i]
        try {
          const url = await this.uploadFile(file, (percent) => {
            updateItem(i, { status: 'uploading', percent })
          })
          updateItem(i, { url, status: 'done', percent: 100 })
        } catch (e) {
          updateItem(i, { status: 'error', percent: 0 })
        }
      }
    }
  }
}
</script>
```

## 文件列表数据结构

文件列表中的每个文件对象包含以下字段：

```typescript
interface FileItem {
  uid: number | string      // 唯一标识
  name: string             // 文件名
  url: string              // 文件 URL（上传后）
  type: 'image' | 'video' | 'file'  // 文件类型
  size: number             // 文件大小（字节）
  status: 'uploading' | 'done' | 'error'  // 上传状态
  percent: number          // 上传进度 0-100
  rawFile?: File           // 原始 File 对象
}
```

## 注意事项

1. `singleTypeMode` 开启后，一旦选择了某种文件类型，就只能继续选择该类型
2. `maxCount` 限制的是总文件数量，包括已上传和待上传的文件
3. `beforeSend` 返回 `false` 或抛出错误会阻止发送，且不会清空输入框
4. `beforeAddAttachments` 是异步的，需要在回调中更新文件状态


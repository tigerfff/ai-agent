# AIInput 组件方法功能说明

本文档列出了 `AIInput.vue` 组件中所有方法的功能和用途。

---

## 📝 一、输入框相关方法

### 1. `handleInput(e)`
**功能**：处理输入框输入事件  
**用途**：当用户在输入框中输入文字时，同步更新内部状态 `inputValue`  
**调用时机**：`@input` 事件触发时

### 2. `handleFocus()`
**功能**：处理输入框获得焦点  
**用途**：设置 `isFocused = true`，用于显示焦点样式和隐藏前缀图标  
**调用时机**：输入框获得焦点时

### 3. `handleBlur()`
**功能**：处理输入框失去焦点  
**用途**：设置 `isFocused = false`，恢复默认样式  
**调用时机**：输入框失去焦点时

### 4. `focusInput()`
**功能**：聚焦到输入框  
**用途**：主动让输入框获得焦点（点击容器区域时调用）  
**调用时机**：用户点击输入框容器区域时

### 5. `focusToEnd()`
**功能**：聚焦到输入框末尾  
**用途**：将光标移动到输入框文本的末尾，用于语音识别后自动定位  
**调用时机**：语音识别文本更新后

### 6. `adjustHeight()`
**功能**：自动调整输入框高度（根据内容）  
**用途**：根据输入内容自动调整 textarea 高度，实现自适应高度效果  
**调用时机**：输入内容变化、粘贴内容、语音识别文本更新后

### 7. `handleKeyDown(e)`
**功能**：处理键盘按键事件（Enter 提交）  
**用途**：监听 Enter 键，根据 `submitType` 配置决定是否提交表单  
- `submitType === 'enter'`：按 Enter 提交，Shift+Enter 换行
- `submitType === 'shiftEnter'`：按 Shift+Enter 提交，Enter 换行  
**调用时机**：用户在输入框中按下键盘时

### 8. `handlePaste(e)`
**功能**：处理粘贴事件（支持粘贴图片）  
**用途**：当用户粘贴内容时，检测是否有文件（如图片），如果有则自动添加到文件列表  
**调用时机**：用户在输入框中粘贴内容时

### 9. `clear()`
**功能**：清空输入框和文件列表  
**用途**：重置所有输入状态，清空文本和文件，重置类型锁定，触发 `clear` 事件  
**调用时机**：点击清空按钮、发送消息成功后

---

## 📁 二、文件处理相关方法

### 10. `validateFiles(files)`
**功能**：统一文件校验逻辑  
**用途**：对文件进行多维度校验，包括：
- 文件数量限制（`maxFileCount`）
- 文件类型允许判断（`allowedTypes`）
- 单一类型模式锁定（`singleTypeMode`）
- 文件大小限制（`maxSize` 和 `fileLimit.maxSize`）
- 文件后缀名限制（`fileLimit.extensions`）

**返回**：通过校验的文件数组  
**调用时机**：文件选择、粘贴文件、外部添加文件时

### 11. `handleFileChange(e)`
**功能**：处理文件选择器的 change 事件  
**用途**：当用户通过文件选择器选择文件后，进行校验和处理  
**调用时机**：`<input type="file">` 的 `@change` 事件触发时

### 12. `getTypeLabel(type)`
**功能**：获取文件类型的中文标签  
**用途**：将文件类型（'image'、'video'、'document'）转换为中文显示（'图片'、'视频'、'文档'）  
**返回**：中文标签字符串  
**调用时机**：显示错误提示信息时

### 13. `processFiles(files)`
**功能**：处理文件（创建占位条目，调用上传钩子）  
**用途**：
1. 为每个文件创建占位条目（包含 uid、name、size、type、rawFile 等）
2. 如果提供了 `beforeAddAttachments` 钩子，则调用它进行上传处理
3. 支持通过 `updateItem` 回调更新上传进度

**调用时机**：文件校验通过后

### 14. `getFileType(file)`
**功能**：判断文件类型  
**用途**：根据文件的 MIME type 或扩展名，判断文件是图片、视频还是文档  
**返回**：'image' | 'video' | 'document'  
**调用时机**：
- 文件校验时（`validateFiles`）
- 创建文件条目时（`processFiles`）
- 判断附件卡片模式时（`attachmentCardMode` computed）

**设计目的**：用于确定文件类型，从而决定：
- 文件校验规则（不同类型有不同的限制）
- 附件卡片显示模式（图片/视频用 mini 模式，文档用 default 模式）
- 文件选择器的 accept 属性

### 15. `getFileTypeFromItem(fileItem)`
**功能**：从文件条目判断文件类型（用于展示模式）  
**用途**：从文件条目对象（可能包含 `rawFile` 属性）中提取文件类型  
**返回**：'image' | 'video' | 'document'  
**调用时机**：计算 `attachmentCardMode` 时，判断附件列表中是否有文档类型

---

## 📤 三、文件上传相关方法

### 16. `handleUploadClick()`
**功能**：处理上传按钮点击（显示/隐藏下拉菜单或直接触发文件选择）  
**用途**：
- 如果菜单已显示，则关闭菜单
- 如果只支持单一类型且没有自定义菜单项，直接触发文件选择
- 否则显示下拉菜单

**调用时机**：点击上传按钮时

### 17. `selectFileType(type)`
**功能**：从下拉菜单选择文件类型  
**用途**：关闭菜单并触发对应类型的文件选择器  
**调用时机**：点击下拉菜单中的"图片"、"视频"、"文档"选项时

### 18. `triggerFileSelect(type)`
**功能**：触发文件选择器  
**用途**：
1. 根据文件类型和 `fileLimit` 配置，设置文件选择器的 `accept` 属性
2. 程序化触发文件选择器的点击事件

**调用时机**：
- 从下拉菜单选择类型后
- 单一类型模式下直接点击上传按钮
- 外部调用（如 `TryX` 的 `handleWelcomeSelect`）

---

## 🎤 四、语音识别相关方法

### 19. `toggleRecord()`
**功能**：切换录音状态（开始/停止）  
**用途**：
- 如果正在录音，则停止录音
- 如果未录音，则获取语音配置并开始录音

**调用时机**：点击语音按钮时

### 20. `stopRecording()`
**功能**：停止录音（统一入口）  
**用途**：统一停止录音的逻辑，确保录音状态正确更新  
**调用时机**：
- 用户再次点击语音按钮停止录音
- 发送消息时自动停止录音

---

## ✉️ 五、提交相关方法

### 21. `submit()`
**功能**：提交表单（发送消息）  
**用途**：
1. 如果正在录音，先停止录音
2. 检查是否应该禁用提交
3. 调用 `beforeSend` 钩子进行发送前校验
4. 触发 `send` 和 `submit` 事件
5. 清空输入框

**调用时机**：
- 点击发送按钮
- 按 Enter 键（根据 `submitType` 配置）

### 22. `stopGeneration()`
**功能**：停止生成（触发 stop 事件）  
**用途**：通知父组件停止 AI 生成过程  
**调用时机**：点击停止按钮时

---

## 🔌 六、公开方法（供外部调用）

### 23. `addFiles(files)`
**功能**：从外部添加文件（如通道抓取回传的文件）  
**用途**：允许外部组件（如 `TryX`）通过 ref 调用此方法，将文件添加到输入框  
**使用场景**：
- 通道抓取功能回传文件
- 其他业务逻辑产生的文件需要添加到输入框

**调用示例**：
```javascript
this.$refs.aiInput.addFiles([file1, file2]);
```

### 24. `setText(text)`
**功能**：设置输入框文本  
**用途**：允许外部组件通过 ref 设置输入框的文本内容  
**调用示例**：
```javascript
this.$refs.aiInput.setText('预设文本');
```

---

## 🎨 七、菜单相关方法

### 25. `shouldShowStandardType(type)`
**功能**：判断是否显示标准菜单项（图片/视频/文档）  
**用途**：
- 如果用户明确传了空数组 `allowedTypes: []`，则认为要完全自定义菜单，隐藏标准项
- 否则根据 `parsedAllowedTypes` 判断是否支持该类型

**返回**：boolean  
**调用时机**：渲染下拉菜单时，决定是否显示"图片"、"视频"、"文档"选项

### 26. `handleCustomMenuItemClick(item)`
**功能**：处理自定义菜单项点击  
**用途**：
1. 关闭上传菜单
2. 如果菜单项有 `onClick` 回调，则调用它
3. 触发 `custom-menu-item-click` 事件，通知父组件

**调用时机**：点击自定义菜单项（如"通道抓取"）时

---

## 📊 方法调用关系图

```
用户操作流程：
1. 点击上传按钮 → handleUploadClick()
   ├─ 单一类型 → triggerFileSelect()
   └─ 多种类型 → 显示菜单 → selectFileType() → triggerFileSelect()

2. 选择文件 → handleFileChange()
   → validateFiles() → processFiles()
      ├─ getFileType() (判断类型)
      └─ beforeAddAttachments() (上传处理)

3. 粘贴文件 → handlePaste()
   → validateFiles() → processFiles()

4. 外部添加文件 → addFiles()
   → validateFiles() → processFiles()

5. 点击发送 → submit()
   ├─ stopRecording() (如果正在录音)
   ├─ beforeSend() (发送前校验)
   └─ clear() (清空输入)

6. 语音输入 → toggleRecord()
   ├─ 开始录音 → recognizer.start()
   └─ 停止录音 → stopRecording()
```

---

## 🎯 核心方法总结

| 方法名 | 核心作用 | 使用频率 |
|--------|---------|---------|
| `getFileType()` | **判断文件类型**，决定校验规则和显示模式 | ⭐⭐⭐⭐⭐ |
| `validateFiles()` | **统一文件校验**，确保文件符合所有限制条件 | ⭐⭐⭐⭐⭐ |
| `processFiles()` | **处理文件**，创建条目并触发上传 | ⭐⭐⭐⭐⭐ |
| `submit()` | **提交消息**，核心业务逻辑 | ⭐⭐⭐⭐⭐ |
| `addFiles()` | **外部注入文件**，支持业务扩展 | ⭐⭐⭐⭐ |
| `triggerFileSelect()` | **触发文件选择器**，支持程序化选择 | ⭐⭐⭐⭐ |
| `getFileTypeFromItem()` | **从条目判断类型**，用于展示模式判断 | ⭐⭐⭐ |

---

## 💡 设计要点

1. **`getFileType()` 的设计目的**：
   - 统一文件类型判断逻辑，避免重复代码
   - 支持 MIME type 和扩展名两种判断方式
   - 为文件校验、卡片显示模式、文件选择器 accept 属性提供基础

2. **`validateFiles()` 的设计目的**：
   - 集中所有文件校验逻辑，确保一致性
   - 支持多种校验维度（数量、类型、大小、后缀）
   - 提供清晰的错误提示

3. **`processFiles()` 的设计目的**：
   - 统一文件处理流程，支持同步和异步上传
   - 通过 `updateItem` 回调支持上传进度更新
   - 兼容有无 `beforeAddAttachments` 钩子的情况


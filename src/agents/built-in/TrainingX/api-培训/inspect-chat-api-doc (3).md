# 智能分析聊天服务inspect-chat inspect-chat

**版本** 

**描述**



## AI试一试

### 查询AI试一试会话列表

**描述**


**请求地址:** `POST` /manage/web/agent/chat/list



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;subTenantId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;tenantId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;title | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userId | string | 否 |   |  |  |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 新增AI试一试会话

**描述**


**请求地址:** `POST` /manage/web/agent/chat/add



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 是 |   |  | 会话id |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;title | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userId | string | 否 |   |  |  |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### 查询AI试一试会话历史记录

**描述**


**请求地址:** `GET` /manage/web/agent/chat/history

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| chatId | STRING | query | 是 |  |


**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userText | string | 否 |   |  | 用户提问 |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;files | object | 否 |   |  | 文件url |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;image | array[object] | 否 |   |  | 图片信息 |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video | array[object] | 否 |   |  | 视频信息 |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;assistantText | string | 否 |   |  | 助手回答 |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  | 消息状态，0：对话中，1：结束，2：中断，3：异常 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### AI试一试会话应用流式输出[图片]

**描述**
目前只支持图片视觉分析

**请求地址:** `POST` /manage/web/agent/chat/app/stream/completion


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|input | object | 否 |   |  | 输入 |
|&nbsp;&nbsp;&nbsp;&nbsp;prompt | string | 否 |   |  | 用户输入 |
|&nbsp;&nbsp;&nbsp;&nbsp;imageList | array[string] | 否 |   | ["https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg"] | 图片url地址 |
|chatId | string | 是 |   |  |  |
|msgId | string | 否 |   |  | 如果重新生成，需要传入指定的msgId |
|parameters | object | 否 |   |  | 参数配置 |
|&nbsp;&nbsp;&nbsp;&nbsp;incrementalOutput | boolean | 否 |   | true | true:增量输出，false：全量输出，默认为true |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  | 会话id |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  | agent返回的请求id |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  | 消息id |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  | 上下文id |
|&nbsp;&nbsp;&nbsp;&nbsp;text | string | 否 |   |  | 文字内容 |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  | 0：对话中，1：结束，2：中断，3：异常 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### AI试一试会话多模态流式输出[视频]

**描述**


**请求地址:** `POST` /manage/web/agent/chat/multimodal/stream/completion


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|input | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;videoList | array[string] | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;prompt | string | 否 |   |  |  |
|chatId | string | 是 |   |  |  |
|msgId | string | 否 |   |  | 重新生成，需要传入之前的id |
|parameters | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;incrementalOutput | string | 否 |   |  | 默认为true |

### 删除AI试一试会话

**描述**


**请求地址:** `GET` /manage/web/agent/chat/delete

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| chatId | STRING | query | 是 |  |


## 用户端-AI试一试

### 删除AI试一试会话

**描述**


**请求地址:** `GET` /web/agent/chat/delete

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| chatId | STRING | query | 是 |  |


### AI试一试会话应用流式输出[图片]

**描述**
目前只支持图片视觉分析

**请求地址:** `POST` /web/agent/chat/app/stream/completion


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|input | object | 否 |   |  | 用户输入 |
|&nbsp;&nbsp;&nbsp;&nbsp;prompt | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;imageList | array | 否 |   | ["https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg"] |  |
|chatId | string | 否 |   |  |  |
|msgId | string | 否 |   |  |  |
|parameters | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;incrementalOutput | boolean | 否 |   | true | true:增量输出，false：全量输出，默认为true |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  | 会话id |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  | agent返回的请求id |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  | 消息id |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  | 上下文id |
|&nbsp;&nbsp;&nbsp;&nbsp;text | string | 否 |   |  | 文字内容 |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  | 0：对话中，1：结束，2：中断，3：异常 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 查询AI试一试会话历史记录

**描述**


**请求地址:** `GET` /web/agent/chat/history

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| chatId | STRING | query | 是 |  |


**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userText | string | 否 |   |  | 用户提问 |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;files | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;image | array[object] | 否 |   |  | 图片信息 |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video | array[object] | 否 |   |  | 视频信息 |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;assistantText | string | 否 |   |  | 助手回答 |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  | 消息状态，0：对话中，1：结束，2：中断，3：异常 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 查询AI试一试会话列表

**描述**


**请求地址:** `POST` /web/agent/chat/list



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;subTenantId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;tenantId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;title | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userId | string | 否 |   |  |  |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### AI试一试会话多模态流式输出[视频]

**描述**


**请求地址:** `POST` /web/agent/chat/multimodal/stream/completion


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|input | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;videoList | array | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;prompt | string | 否 |   |  |  |
|chatId | string | 否 |   |  |  |
|msgId | string | 否 |   |  |  |
|parameters | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;incrementalOutput | string | 否 |   |  |  |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;text | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  |  |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 新增AI试一试会话

**描述**


**请求地址:** `POST` /web/agent/chat/add


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|mineType | string | 是 |   | 图片：image；视频：video | 分析媒体类型：image、video |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 |  |
|data | object | 是 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 是 |   |  | 会话id |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;title | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userId | string | 否 |   |  |  |
|success | boolean | 是 |   | true |  |
|message | string | 是 |   |  |  |
### 查询门店列表信息

**描述**


**请求地址:** `GET` /web/agent/chat/channels

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| storeName | STRING | query | 否 |  门店名称 |


**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | array[object] | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;storeName | string | 否 |   | 测试团队21 |  |
|&nbsp;&nbsp;&nbsp;&nbsp;storeId | string | 否 |   | d4b990d179bb46fda4d3030b90e345bb |  |
|success | boolean | 否 |   | true |  |
|message | object | 否 |   |  |  |
### AI试一试查看会话次数

**描述**


**请求地址:** `GET` /web/agent/chat/remainingChatTimes



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;isRemaining | boolean | 否 |   | ture或false | false -无剩余，true-有剩余 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   | success |  |
### 新增AI试一试会话-点踩

**描述**


**请求地址:** `POST` /web/agent/chat/userEvaluation


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|msgId | string | 是 |   |  | 消息id |
|feedbackType | string | 否 |   |  | 点踩类型：UPVOTE--点赞；DOWNVOTE--不喜欢 |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   | success |  |
### 查询AI试一试会话历史记录

**描述**


**请求地址:** `GET` /web/agent/chat/history



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userEvaluation | string | 否 |   |  | 未评价：NO_EVAL；UPVOTE-赞；DOWNVOTE-踩 |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userText | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;files | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;image | array[object] | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video | array[object] | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;assistantText | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  |  |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
## 用户端-ASR

### 获取asr签名

**描述**
获取asr签名

**请求地址:** `POST` /web/asr/actions/getSign


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|body | string | 否 |   |  | 待签名字符串 |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|&nbsp;&nbsp;&nbsp;&nbsp;appId | string | 是 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;sign | string | 是 |   |  |  |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
## 用户端-智能体

### 添加智能体聊天

**描述**
添加智能体聊天

**请求地址:** `POST` /web/agentV2/{agentId}/chat/add


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|mineType | string | 是 |   | image |  |
|source | string | 否 |   |  | system |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 是 |   |  | 聊天id |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 是 |   |  | 创建时间 |
|&nbsp;&nbsp;&nbsp;&nbsp;upadteTime | string | 是 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;title | string | 是 |   |  | 标题 |
|&nbsp;&nbsp;&nbsp;&nbsp;userId | string | 是 |   |  | 用户id |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 删除聊天

**描述**
删除聊天

**请求地址:** `POST` /web/agentV2/{agentId}/chat/delete



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### 查询AI试一试会话历史记录

**描述**
查询智能体会话历史记录

**请求地址:** `GET` /web/agentV2/{agentId}/chat/history

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| chatId | STRING | header | 否 |  |


**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userEvaluation | string | 否 |   |  | 用户评价 |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;userText | string | 否 |   |  | 用户提问 |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;files | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;image | array[object] | 否 |   |  | 图片 |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;video | array[object] | 否 |   |  | 视频 |
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;url | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;sessionId | string | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;assistantText | string | 否 |   |  | 助手回答 |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  | 消息状态，0：对话中，1：结束，2：中断，3：异常 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 查询智能体会话列表

**描述**
查询智能体会话列表

**请求地址:** `GET` /web/agentV2/{agentId}/chat/list



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;hasUnread | string | 否 |   |  | 是否有未读消息 |
|&nbsp;&nbsp;&nbsp;&nbsp;chatId | string | 否 |   |  | 对话id |
|&nbsp;&nbsp;&nbsp;&nbsp;createTime | string | 否 |   |  | 创建时间 |
|&nbsp;&nbsp;&nbsp;&nbsp;tenantId | string | 否 |   |  | 租户id |
|&nbsp;&nbsp;&nbsp;&nbsp;updateTime | string | 否 |   |  | 更新时间 |
|&nbsp;&nbsp;&nbsp;&nbsp;title | string | 否 |   |  | 对话标题 |
|&nbsp;&nbsp;&nbsp;&nbsp;userId | string | 否 |   |  | 用户id |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |
### 聊天已读

**描述**
聊天已读

**请求地址:** `PUT` /web/agentV2/{agentId}/chat/{chat}/actions/read



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### 获取智能体推荐的提示词

**描述**
获取智能体推荐的提示词

**请求地址:** `GET` /web/agentV2/{agentId}/suggestions



**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | array[string] | 是 |   |  | 返回包体 |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### 用户评价

**描述**
用户评价

**请求地址:** `POST` /web/agentV2/{agentId}/chat/{chatId}/userEvaluation

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| agentId | STRING | query | 否 |  |
| chatId | STRING | query | 否 |  |

**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|userEvaluation | string | 是 |   |  | UPVOTE/DOWNVOTE |
|msgId | string | 是 |   |  | 消息id |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### 聊天置顶

**描述**
聊天置顶

**请求地址:** `PUT` /web/agentV2/{agentId}/chat/{chatId}/action/pinned

**参数**

| 参数   | 类型   | in   | 是否必须 | 描述   |
| --- | ---- | ---- | ---- | ---- |
| pinned | BOOLEAN | query | 否 | true/false |


**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### 重命名聊天

**描述**
重命名聊天

**请求地址:** `POST` /web/agentV2/{agentId}/chat/{chatId}/actions/renameChatTitle


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|title | string | 否 |   |  | XXX |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 是 |   | 0 | 消息码 |
|data | object | 是 |   |  | 返回包体 |
|success | boolean | 是 |   | true | 是否正常返回 |
|message | string | 是 |   |  | 提示信息。主要用于开发调试，不建议显示给用户 |
### AI试一试会话应用流式输出

**描述**
AI试一试会话应用流式输出

**请求地址:** `POST` /web/agentV2/{agentId}/chat/app/stream/completion


**请求Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|input | object | 否 |   |  | 输入 |
|&nbsp;&nbsp;&nbsp;&nbsp;prompt | string | 否 |   |  | 用户输入 |
|&nbsp;&nbsp;&nbsp;&nbsp;imageList | array | 否 |   |  | 图片url地址 |
|chatId | string | 否 |   |  |  |
|msgId | string | 否 |   |  | 如果重新生成，需要传入指定的msgId |

**响应Body**

| 参数   | 类型   | 是否必须 | 长度 | 缺省值 | 描述   |
| --- | ---- | ---- | ----| ----| ----|
|code | number | 否 |   | 0 |  |
|data | object | 否 |   |  |  |
|&nbsp;&nbsp;&nbsp;&nbsp;requestId | string | 否 |   |  | agent返回的请求id |
|&nbsp;&nbsp;&nbsp;&nbsp;msgId | string | 否 |   |  | 消息id |
|&nbsp;&nbsp;&nbsp;&nbsp;text | string | 否 |   |  | 文字内容 |
|&nbsp;&nbsp;&nbsp;&nbsp;status | string | 否 |   |  | 0：对话中，1：结束，2：中断，3：异常 |
|success | boolean | 否 |   | true |  |
|message | string | 否 |   |  |  |

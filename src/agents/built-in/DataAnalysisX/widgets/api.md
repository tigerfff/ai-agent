# 查发生不合格问题次数最多的问题 API 文档

## 基本信息

- **接口版本**: V2.53.0
- **接口描述**: 查询发生不合格问题次数最多的问题
- **维护人**: zhuxiaoqiang7
- **请求方式**: POST
- **接口路径**: `/v1/chain/statistic/aiAgent/actions/queryPatrolAgentMostQuestion`
- **认证方式**: Token 认证

## 请求参数

### Body 参数

| 参数名    | 是否必须 | 类型   | 长度 | 示例 | 说明               |
| --------- | -------- | ------ | ---- | ---- | ------------------ |
| endTime   | 必须     | number | --   | --   | 结束时间戳，毫秒数 |
| offLine   | 可选     | number | --   | --   | 线上、线下         |
| startTime | 必须     | number | --   | --   | 开始时间戳，毫秒数 |

## 响应参数

### Body 参数

| 参数名       | 是否必须 | 类型    | 长度 | 示例 | 说明                                         |
| ------------ | -------- | ------- | ---- | ---- | -------------------------------------------- |
| code         | 必须     | number  | --   | 0    | 消息码                                       |
| data         | 必须     | object  | --   | --   | 返回包体                                     |
| questionId   | 可选     | string  | --   | --   | 问题ID                                       |
| questionName | 可选     | string  | --   | --   | 问题名称                                     |
| message      | 必须     | string  | --   | --   | 提示信息。主要用于开发调试，不建议显示给用户 |
| success      | 必须     | boolean | --   | true | 是否正常返回                                 |


# topN问题概览 API 文档

## 基本信息

- **接口版本**: V2.53.0
- **接口描述**: topN问题概览
- **维护人**: zhuxiaoqiang7
- **请求方式**: POST
- **接口路径**: `/v1/chain/statistic/aiAgent/actions/queryPatrolAgentStoreQuestionData`
- **认证方式**: Token 认证

## 请求参数

### Body 参数

| 参数名    | 是否必须 | 类型   | 长度 | 示例 | 说明               |
| --------- | -------- | ------ | ---- | ---- | ------------------ |
| endTime   | 必须     | number | --   | --   | 结束时间戳，毫秒数 |
| startTime | 必须     | number | --   | --   | 开始时间戳，毫秒数 |

## 响应参数

### Body 参数

| 参数名  | 是否必须 | 类型          | 长度 | 示例 | 说明                                         |
| ------- | -------- | ------------- | ---- | ---- | -------------------------------------------- |
| code    | 必须     | number        | --   | 0    | 消息码                                       |
| data    | 必须     | array[object] | --   | --   | 返回包体                                     |
| message | 必须     | string        | --   | --   | 提示信息。主要用于开发调试，不建议显示给用户 |
| success | 必须     | boolean       | --   | true | 是否正常返回                                 |

### data 数组对象结构

| 参数名       | 是否必须 | 类型          | 长度 | 示例 | 说明         |
| ------------ | -------- | ------------- | ---- | ---- | ------------ |
| questionData | 可选     | array[object] | --   | --   | topN问题概览 |
| storeId      | 可选     | string        | --   | --   | 门店ID       |
| storeName    | 可选     | string        | --   | --   | 门店名称     |

### questionData 数组对象结构

| 参数名        | 是否必须 | 类型   | 长度 | 示例 | 说明     |
| ------------- | -------- | ------ | ---- | ---- | -------- |
| questionCount | 可选     | number | --   | --   | 发生次数 |
| questionId    | 可选     | string | --   | --   | 问题ID   |
| questionName  | 可选     | string | --   | --   | 问题名称 |


# 查看topN问题图片 API 文档

## 基本信息

- **接口版本**: V2.53.0
- **接口描述**: 查看topN问题图片
- **维护人**: zhuxiaoqiang7
- **请求方式**: POST
- **接口路径**: `/v1/chain/statistic/aiAgent/actions/queryPatrolAgentStoreQuestionPics`
- **认证方式**: Token 认证

## 请求参数

### Body 参数

| 参数名      | 是否必须 | 类型          | 长度 | 示例 | 说明               |
| ----------- | -------- | ------------- | ---- | ---- | ------------------ |
| endTime     | 必须     | number        | --   | --   | 结束时间戳，毫秒数 |
| questionIds | 必须     | array[string] | --   | --   | 问题项ID（s）      |
| startTime   | 必须     | number        | --   | --   | 开始时间戳，毫秒数 |
| storeId     | 必须     | string        | --   | --   | 门店ID             |

## 响应参数

### Body 参数

| 参数名  | 是否必须 | 类型          | 长度 | 示例 | 说明                                         |
| ------- | -------- | ------------- | ---- | ---- | -------------------------------------------- |
| code    | 必须     | number        | --   | 0    | 消息码                                       |
| data    | 必须     | array[object] | --   | --   | 返回包体                                     |
| message | 必须     | string        | --   | --   | 提示信息。主要用于开发调试，不建议显示给用户 |
| success | 必须     | boolean       | --   | true | 是否正常返回                                 |

### data 数组对象结构

| 参数名     | 是否必须 | 类型          | 长度 | 示例 | 说明     |
| ---------- | -------- | ------------- | ---- | ---- | -------- |
| pics       | 可选     | array[object] | --   | --   | 图片列表 |
| questionId | 可选     | string        | --   | --   | 问题项ID |

### pics 数组对象结构

| 参数名                   | 是否必须 | 类型   | 长度 | 示例 | 说明                   |
| ------------------------ | -------- | ------ | ---- | ---- | ---------------------- |
| aiPicCoordinate          | 可选     | string | --   | --   | ai分析框               |
| captureTime              | 可选     | number | --   | --   | 图片时间               |
| channelId                | 可选     | string | --   | --   | 通道ID                 |
| channelName              | 可选     | string | --   | --   | 通道名称               |
| multiAnalysisAreaPolygon | 可选     | string | --   | --   | 区域框                 |
| patrolId                 | 可选     | string | --   | --   | 考评/点检ID            |
| picCoordinate            | 可选     | string | --   | --   | 涂鸦信息               |
| picOrder                 | 可选     | number | --   | --   | 图片顺序编号           |
| picUrl                   | 可选     | string | --   | --   | 图片URL                |
| recordTime               | 可选     | number | --   | --   | 图片所属考评/点检时间  |
| sourceType               | 可选     | number | --   | --   | 图片类型，0抓图，1拍照 |

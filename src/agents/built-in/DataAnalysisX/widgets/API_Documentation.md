# DataAnalysisX API 接口文档

本文档整理了 `DataAnalysisX` 智能体相关的所有后端 API 接口，主要用于巡查统计、问题分析、客流分析及其数据导出。

## 1. 巡查统计与问题分析

### 1.1 查发生不合格问题次数最多的问题

- **方法名**: `queryMostQuestion`
- **接口路径**: `/chain/statistic/aiAgent/actions/queryPatrolAgentMostQuestion`
- **请求方式**: `POST`
- **功能说明**: 获取在指定时间范围内，出现不合格问题次数最多的问题项。

### 1.2 获取异常门店预警

- **方法名**: `queryPatrolAgentMostStore`
- **接口路径**: `/chain/statistic/aiAgent/actions/queryPatrolAgentMostStore`
- **请求方式**: `POST`
- **功能说明**: 获取出现次数最多的那个问题项所对应的 Top 3 异常门店，用于异常预警提醒。

### 1.3 TopN 问题概览数据

- **方法名**: `queryStoreQuestionData`
- **接口路径**: `/chain/statistic/aiAgent/actions/queryPatrolAgentStoreQuestionData`
- **请求方式**: `POST`
- **功能说明**: 获取巡查问题 TopN 的统计概览数据。

### 1.4 查看 TopN 问题图片

- **方法名**: `queryStoreQuestionPics`
- **接口路径**: `/chain/statistic/aiAgent/actions/queryPatrolAgentStoreQuestionPics`
- **请求方式**: `POST`
- **功能说明**: 根据问题 ID 获取对应的巡查问题图片列表。

### 1.5 查询门店评分排行

- **方法名**: `queryStoreRank`
- **接口路径**: `/chain/statistic/patrols/actions/queryStoreRank`
- **请求方式**: `POST`
- **功能说明**: 查询区域下门店的巡查得分排行（TopN 或 LastN）。

### 1.6 查询问题项排行统计

- **方法名**: `queryQuestionRank`
- **接口路径**: `/chain/statistic/patrols/template/question`
- **请求方式**: `POST`
- **功能说明**: 统计巡查模板下各个问题项的出现频次排行。

---

## 2. 客流分析相关

### 2.1 获取门店客流重点变化 TopN

- **方法名**: `getPassengerChanges`
- **接口路径**: `/chain/statistic/aiAgent/actions/getPassengerChangesForDataAnalysis`
- **请求方式**: `POST`
- **功能说明**: 分析并返回客流波动明显（增长或下滑严重）的门店列表，用于重点提醒。

### 2.2 获取客流环比 Top/Bottom

- **方法名**: `getPassengerChainRateTopBottom`
- **接口路径**: `/cha`in/statistic/aiAgent/actions/getPassengerChainRateTopBottom``
- **请求方式**: `POST`
- **功能说明**: 获取客流环比增长率最高和最低的门店（通常为 Top 3 / Bottom 3）。

### 2.3 客流排行统计

- **方法名**: `queryPassengerRank`
- **接口路径**: `/chain/passenger/ranks/actions/agentPassengerRank`
- **请求方式**: `POST`
- **功能说明**: 获取指定区域或门店的详细客流进入人数排行。

---

## 3. 基础数据与搜索

### 3.1 获取区域门店树

- **方法名**: `getAreaTree`
- **接口路径**: `/chain/basic/areas/actions/findAreaStoreTree`
- **请求方式**: `GET`
- **功能说明**: 获取完整的区域和门店树结构，常用于获取根节点 ID。

### 3.2 模糊查询区域或门店列表

- **方法名**: `searchAreaList`
- **接口路径**: `/chain/basic/users/actions/findUserAreaStoreListByNodeName`
- **请求方式**: `GET`
- **功能说明**: 根据名称模糊搜索区域或门店。

---

## 4. 数据导出接口

### 4.1 客流排行数据导出

- **方法名**: `exportPassengerRank`
- **接口路径**: `/chain/passenger/exports/actions/agentExportRankData`
- **请求方式**: `POST`
- **功能说明**: 导出客流排行统计数据到下载中心。

### 4.2 巡查区域报表导出

- **方法名**: `exportPatrolAreaOverview`
- **接口路径**: `/chain/statistic/patrols/center/export/actions/patrolAreaOverview`
- **请求方式**: `POST`
- **功能说明**: 导出巡查区域统计总览数据。

### 4.3 推送报告 PDF 导出

- **方法名**: `pdfExport`
- **接口路径**: `/chain/export/patrol/aiAgent/pdf/export`
- **请求方式**: `POST`
- **功能说明**: 将智能体生成的巡查分析报告导出为 PDF 文件。

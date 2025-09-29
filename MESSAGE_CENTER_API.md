# 消息中心API接口文档

## 接口概述

消息中心提供了一套完整的API接口，用于管理系统的各类消息通知。

## 接口列表

### 1. 获取消息列表

**接口地址**: `GET /api/admin/api/v1/messages`

**请求参数**:
| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认为1 |
| pageSize | integer | 否 | 每页数量，默认为10 |
| type | string | 否 | 消息类型(system, notification, alert, update) |
| status | string | 否 | 消息状态(unread, read, archived) |
| category | string | 否 | 消息分类 |
| search | string | 否 | 搜索关键词 |

**响应数据**:
```json
{
  "messages": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "type": "string",
      "status": "string",
      "createdAt": "string",
      "readAt": "string",
      "priority": "integer",
      "sender": "string",
      "category": "string",
      "link": "string"
    }
  ],
  "total": "integer",
  "page": "integer",
  "pageSize": "integer"
}
```

### 2. 标记消息为已读

**接口地址**: `PUT /api/admin/api/v1/messages/{messageId}/read`

**请求参数**:
| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| messageId | string | 是 | 消息ID |

**响应数据**:
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "type": "string",
  "status": "string",
  "createdAt": "string",
  "readAt": "string",
  "priority": "integer",
  "sender": "string",
  "category": "string",
  "link": "string"
}
```

### 3. 批量标记消息为已读

**接口地址**: `POST /api/admin/api/v1/messages/read`

**请求参数**:
```json
{
  "messageIds": ["string"]
}
```

**响应数据**:
```json
{
  "code": "integer",
  "msg": "string"
}
```

### 4. 删除消息

**接口地址**: `DELETE /api/admin/api/v1/messages/{messageId}`

**请求参数**:
| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| messageId | string | 是 | 消息ID |

**响应数据**:
```json
{
  "code": "integer",
  "msg": "string"
}
```

### 5. 批量删除消息

**接口地址**: `POST /api/admin/api/v1/messages/delete`

**请求参数**:
```json
{
  "messageIds": ["string"]
}
```

**响应数据**:
```json
{
  "code": "integer",
  "msg": "string"
}
```

### 6. 获取未读消息数量

**接口地址**: `GET /api/admin/api/v1/messages/unread-count`

**响应数据**:
```json
{
  "count": "integer"
}
```

## 消息类型枚举

| 类型 | 值 | 说明 |
|------|----|------|
| 系统消息 | system | 系统级别的通知消息 |
| 通知 | notification | 一般性通知消息 |
| 警告 | alert | 警告类消息 |
| 更新 | update | 系统更新相关消息 |

## 消息状态枚举

| 状态 | 值 | 说明 |
|------|----|------|
| 未读 | unread | 消息未被阅读 |
| 已读 | read | 消息已被阅读 |
| 已归档 | archived | 消息已被归档 |

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### 获取消息列表
```bash
curl -X GET "https://api.example.com/api/admin/api/v1/messages?page=1&pageSize=10&type=system" \
  -H "Authorization: Bearer {token}"
```

### 标记消息为已读
```bash
curl -X PUT "https://api.example.com/api/admin/api/v1/messages/{messageId}/read" \
  -H "Authorization: Bearer {token}"
```

### 批量删除消息
```bash
curl -X POST "https://api.example.com/api/admin/api/v1/messages/delete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"messageIds": ["id1", "id2", "id3"]}'
```
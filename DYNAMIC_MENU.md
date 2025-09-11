# 动态菜单系统使用指南

## 概述

本项目采用混合菜单系统：
- **静态菜单**: Dashboard2 作为固定的第一个菜单项
- **动态菜单**: 其他菜单项通过 `/api/admin/api/v1/menus/new/route` 接口获取

## 菜单显示顺序

1. **Dashboard2** (静态菜单 - 始终显示)
2. **动态菜单项** (通过接口获取，按 sort 字段排序)

## 核心特性

- ✅ **混合菜单系统**: 支持静态菜单与动态菜单混合使用
- ✅ **Dashboard2 静态菜单**: Dashboard2 始终作为第一个菜单项显示
- ✅ **二级菜单支持**: 支持无 component 字段的二级菜单展开/收起
- ✅ **权限控制**: 支持基于权限的菜单显示/隐藏
- ✅ **懒加载**: 页面组件按需加载，提升性能
- ✅ **排序支持**: 支持菜单项的 `sort` 字段排序
- ✅ **图标系统**: 支持 Lucide 图标库的图标显示
- ✅ **管理员路径支持**: 支持所有路径，包括 /admin 开头的路径

## 接口数据结构

### 普通页面菜单
```json
{
  "data": [
    {
      "name": "1",
      "path": "/dashboard",
      "component": "/client/pages/Dashboard2.tsx",
      "hidden": false,
      "meta": {
        "title": "仪表盘",
        "icon": "BarChart3"
      },
      "permissions": ["dashboard:view"],
      "sort": 1
    }
  ]
}
```

### 二级菜单结构
```json
{
  "data": [
    {
      "name": "user-management",
      "path": "/users",
      "hidden": false,
      "meta": {
        "title": "用户管理",
        "icon": "Users"
      },
      "sort": 2,
      "children": [
        {
          "name": "user-list",
          "path": "/users/list",
          "component": "/client/pages/UserList.tsx",
          "meta": {
            "title": "用户列表",
            "icon": "List"
          },
          "sort": 1
        },
        {
          "name": "user-profile",
          "path": "/users/profile",
          "component": "/client/pages/UserProfile.tsx",
          "meta": {
            "title": "用户资料",
            "icon": "User"
          },
          "sort": 2
        }
      ]
    }
  ]
}
```

## 关键字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 菜单项唯一标识 |
| `path` | string | ✅ | 路由路径 |
| `component` | string | ✅ | 组件文件路径 |
| `hidden` | boolean | ❌ | 是否隐藏菜单（默认false） |
| `meta.title` | string | ✅ | 菜单显示名称 |
| `meta.icon` | string | ❌ | 图标名称（Lucide图标） |
| `permissions` | string[] | ❌ | 权限列表 |
| `sort` | number | ❌ | 排序权重 |
| `children` | array | ❌ | 子菜单 |

## 组件路径映射

页面组件必须在 `client/utils/clientPageLoader.ts` 中注册：

```typescript
const CLIENT_PAGES_MAP = {
  '/client/pages/Dashboard2.tsx': () => import('@/pages/Dashboard2'),
  '/client/pages/UserList.tsx': () => import('@/pages/UserList'),
  // ... 更多页面
}
```

## 可用图标

支持所有 Lucide React 图标，常用的包括：
- `BarChart3` - 仪表盘
- `Users` - 用户管理  
- `Bot` - AI功能
- `Target` - 目标追踪
- `Activity` - 监控
- `Settings` - 设置
- `Shield` - 权限

## 添加新页面步骤

1. **创建页面组件**
   ```tsx
   // client/pages/NewPage.tsx
   export default function NewPage() {
     return <div>新页面</div>;
   }
   ```

2. **注册到页面加载器**
   ```typescript
   // client/utils/clientPageLoader.ts
   '/client/pages/NewPage.tsx': () => import('@/pages/NewPage'),
   ```

3. **配置接口数据**
   ```json
   {
     "name": "new-page",
     "path": "/new-page", 
     "component": "/client/pages/NewPage.tsx",
     "meta": {
       "title": "新页面",
       "icon": "FileText"
     },
     "sort": 10
   }
   ```

## 注意事项

- 🚨 **Dashboard2 为静态菜单**: 始终显示，无需在接口中配置
- 🚨 **登录后加载**: 动态菜单只有登录后才会获取并显示
- 🚨 **组件路径必须注册**: 未在 clientPageLoader 中注册的组件路径会加载失败

## 故障排除

1. **Dashboard2 不显示**: 检查 Layout.tsx 中的 baseMenuItems 配置
2. **动态菜单不显示**: 检查用户是否已登录
3. **页面加载失败**: 确认组件路径在 clientPageLoader 中已注册
4. **图标不显示**: 确认图标名称在 Lucide 图标库中存在
5. **排序不正确**: 检查接口返回的 sort 字段数值
6. **默认页面**: 登录后会自动跳转到 Dashboard2 (/dashboard2)
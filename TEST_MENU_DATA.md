# 动态菜单测试数据示例

## 测试二级菜单的接口数据

将以下数据配置到 `/api/admin/api/v1/menus/new/route` 接口中：

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "name": "dashboard",
      "path": "/dashboard",
      "component": "/client/pages/Dashboard2.tsx",
      "hidden": false,
      "meta": {
        "title": "仪表盘",
        "icon": "BarChart3"
      },
      "permissions": ["dashboard:view"],
      "sort": 1
    },
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
          "hidden": false,
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
          "hidden": false,
          "meta": {
            "title": "用户资料",
            "icon": "User"
          },
          "sort": 2
        },
        {
          "name": "user-detail",
          "path": "/users/detail",
          "component": "/client/pages/UserDetail.tsx", 
          "hidden": false,
          "meta": {
            "title": "用户详情",
            "icon": "FileText"
          },
          "sort": 3
        }
      ]
    },
    {
      "name": "ai-marketing",
      "path": "/ai-marketing",
      "hidden": false,
      "meta": {
        "title": "AI营销",
        "icon": "Bot"
      },
      "sort": 3,
      "children": [
        {
          "name": "scenarios",
          "path": "/ai-marketing/scenarios",
          "component": "/client/pages/AIMarketing/ScenariosList.tsx",
          "hidden": false,
          "meta": {
            "title": "营销场景",
            "icon": "Target"
          },
          "sort": 1
        },
        {
          "name": "monitoring",
          "path": "/ai-marketing/monitoring-center", 
          "component": "/client/pages/AIMarketing/MonitoringCenter.tsx",
          "hidden": false,
          "meta": {
            "title": "监控中心",
            "icon": "Activity"
          },
          "sort": 2
        }
      ]
    },
    {
      "name": "system-management",
      "path": "/system",
      "hidden": false,
      "meta": {
        "title": "系统管理",
        "icon": "Settings"
      },
      "sort": 4,
      "children": [
        {
          "name": "organization-members",
          "path": "/organization/members",
          "component": "/client/pages/Organization/MemberManagement.tsx",
          "hidden": false,
          "meta": {
            "title": "成员管理",
            "icon": "Users"
          },
          "sort": 1
        },
        {
          "name": "organization-settings",
          "path": "/organization/settings",
          "component": "/client/pages/Organization/OrganizationSettings.tsx", 
          "hidden": false,
          "meta": {
            "title": "组织设置",
            "icon": "Settings"
          },
          "sort": 2
        },
        {
          "name": "organization-permissions",
          "path": "/organization/permissions",
          "component": "/client/pages/Organization/GranularPermissionManagement.tsx",
          "hidden": false,
          "meta": {
            "title": "权限管理",
            "icon": "Shield"
          },
          "sort": 3
        }
      ]
    },
    {
      "name": "effect-tracking",
      "path": "/effect-tracking",
      "component": "/client/pages/EffectTracking.tsx",
      "hidden": false,
      "meta": {
        "title": "效果追踪",
        "icon": "TrendingUp"
      },
      "sort": 5
    }
  ]
}
```

## 测试要点

1. **二级菜单展示**: `user-management` 和 `ai-marketing`、`system-management` 应该显示为可展开的菜单项
2. **图标渲染**: 每个菜单项都应该显示对应的 Lucide 图标
3. **排序**: 菜单项应该按照 `sort` 字段排序
4. **路由**: 点击子菜单项应该正确跳转到对应页面
5. **展开/收起**: 点击二级菜单应该能展开/收起子菜单
6. **当前页面标记**: 当前访问的页面在菜单中应该高亮显示

## 预期效果

- 仪表盘 (普通菜单)
- 用户管理 ▼ (二级菜单，可展开)
  - 用户列表
  - 用户资料  
  - 用户详情
- AI营销 ▼ (二级菜单，可展开)
  - 营销场景
  - 监控中心
- 系统管理 ▼ (二级菜单，可展开)
  - 成员管理
  - 组织设置
  - 权限管理
- 效果追踪 (普通菜单)
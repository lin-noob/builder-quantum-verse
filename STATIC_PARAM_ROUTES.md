# 静态路由配置系统

## 概述

静态路由已被抽离到独立的配置文件中，所有静态路由都使用 Layout 框架，确保左侧菜单和 Tab 功能正常工作。

## 配置文件

静态路由配置位于：`/client/config/staticRoutes.tsx`

### 路由特点
- ✅ **统一管理**: 所有静态路由集中配置
- ✅ **Layout 包装**: 所有路由都使用 Layout，包含左侧菜单
- ✅ **Tab 支持**: 每个页面打开时都会创建独立的 Tab
- ✅ **懒加载**: 支持组件懒加载，提升性能

## 已配置的静态路由

### 基础功能页面
1. **Dashboard2** - `/dashboard2`
   - 组件: `Dashboard2`
   - 静态菜单项: 是

2. **个人设置** - `/account/settings`
   - 组件: `PersonalSettings`
   - 静态菜单项: 否

3. **项目列表** - `/projects`
   - 组件: `ProjectList`
   - 静态菜单项: 否

4. **项目详情** - `/projects/:id`
   - 组件: `ProjectDetail`
   - 静态菜单项: 否

### 带参数的业务页面
5. **组织详情** - `/admin/organizations/:organizationId`
   - 组件: `OrganizationDetail`
   - 静态菜单项: 否

6. **用户详情分析** - `/admin/users/:userId/details`
   - 组件: `UserDetailsAnalytics`
   - 静态菜单项: 否

7. **用户详情（新版）** - `/users1/:cdpId`
   - 组件: `UserDetail_New`
   - 静态菜单项: 否

8. **AI营销场景配置** - `/ai-marketing/scenarios/:scenarioId`
   - 组件: `ScenarioConfig`
   - 静态菜单项: 否

## 使用方法

### 添加新的静态路由
在 `staticRoutes.tsx` 中添加新路由：

```tsx
{
  path: '/new-page/:id',
  element: (
    <Layout>
      <LazyRoute>
        <NewPageComponent />
      </LazyRoute>
    </Layout>
  ),
}
```

### 路由导航
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// 导航到带参数的页面
navigate('/users1/123');
navigate('/admin/organizations/456');
navigate('/ai-marketing/scenarios/scenario-001');
```

### 获取路由参数
```tsx
import { useParams } from 'react-router-dom';

function MyComponent() {
  const { cdpId, organizationId, scenarioId } = useParams();
  
  return (
    <div>
      <h1>参数值: {cdpId || organizationId || scenarioId}</h1>
    </div>
  );
}
```

## 系统架构

```
App.tsx
  ├── 认证路由 (无 Layout)
  ├── 静态路由 (使用 Layout)
  ├── 管理后台 (AdminApp)
  ├── 动态路由 (使用 Layout)
  └── 默认路由
```

## Layout 框架功能

所有静态路由都包含：
- 🎯 **左侧菜单**: 动态菜单 + Dashboard2 静态菜单
- 🎯 **Tab 管理**: 每个页面独立 Tab
- 🎯 **用户信息**: 顶部用户信息和项目选择
- 🎯 **响应式**: 移动端和桌面端适配

## 注意事项

- 🚨 **所有静态路由都使用 Layout**: 确保界面一致性
- 🚨 **路由优先级**: 静态路由优先于动态路由和通配符路由
- 🚨 **参数路由**: 支持动态参数，如 `:id`, `:userId` 等
- 🚨 **懒加载**: 建议大型组件使用懒加载提升性能

## 工具函数

配置文件还提供了实用函数：

- `getStaticRoutePaths()`: 获取所有静态路由路径
- `isStaticRoute(pathname)`: 检查路径是否为静态路由
# 添加审批管理菜单项操作指南

本文档详细说明了如何通过管理后台将审批管理功能添加到左侧菜单栏中。

## 菜单结构设计

审批管理将作为一个主菜单，包含以下子菜单：

```
审批管理 (主菜单/目录)
├── 审批配置 (子菜单)
├── 审批监控 (子菜单)
├── 模板管理 (子菜单)
└── 审批统计 (子菜单)
```

## 操作步骤

### 1. 登录管理后台
- 使用超级管理员账号登录系统
- 进入管理后台界面

### 2. 进入菜单管理
- 在左侧导航栏中找到"系统管理"分类
- 点击"菜单管理"菜单项

### 3. 添加主菜单（审批管理）

点击"添加菜单"按钮，填写以下信息：

- **菜单名称**: 审批管理
- **父级菜单**: 无（顶级菜单）
- **菜单类型**: 目录
- **菜单图标**: FileCheck
- **菜单排序**: 5
- **是否显示**: 是
- **菜单状态**: 启用

### 4. 添加子菜单

#### 4.1 审批配置
- **菜单名称**: 审批配置
- **父级菜单**: 选择"审批管理"
- **菜单类型**: 菜单
- **页面路由**: `/approval/config`
- **组件路径**: `/client/pages/Approval/ApprovalConfig.tsx`
- **菜单图标**: Settings
- **菜单排序**: 1
- **是否显示**: 是

#### 4.2 审批监控
- **菜单名称**: 审批监控
- **父级菜单**: 选择"审批管理"
- **菜单类型**: 菜单
- **页面路由**: `/approval/monitor`
- **组件路径**: `/client/pages/Approval/ApprovalMonitor.tsx`
- **菜单图标**: Monitor
- **菜单排序**: 2
- **是否显示**: 是

#### 4.3 模板管理
- **菜单名称**: 模板管理
- **父级菜单**: 选择"审批管理"
- **菜单类型**: 菜单
- **页面路由**: `/approval/templates`
- **组件路径**: `/client/pages/Approval/ProcessTemplateManagement.tsx`
- **菜单图标**: FileTemplate
- **菜单排序**: 3
- **是否显示**: 是

#### 4.4 审批统计
- **菜单名称**: 审批统计
- **父级菜单**: 选择"审批管理"
- **菜单类型**: 菜单
- **页面路由**: `/approval/statistics`
- **组件路径**: `/client/pages/Approval/ApprovalStatistics.tsx`
- **菜单图标**: BarChart3
- **菜单排序**: 4
- **是否显示**: 是

## 组件路径映射

确保以下组件已在 `client/utils/clientPageLoader.ts` 中注册：

```typescript
// 审批管理相关页面
'/client/pages/Approval/ApprovalConfig.tsx': () => import('@/pages/Approval/ApprovalConfig'),
'/client/pages/Approval/ApprovalMonitor.tsx': () => import('@/pages/Approval/ApprovalMonitor'),
'/client/pages/Approval/ProcessTemplateManagement.tsx': () => import('@/pages/Approval/ProcessTemplateManagement'),
'/client/pages/Approval/ApprovalStatistics.tsx': () => import('@/pages/Approval/ApprovalStatistics'),
```

## 权限配置

为每个菜单项配置相应的权限：

### 审批配置权限
- **权限名称**: 审批配置管理
- **权限类型**: 功能
- **URL权限**: `/approval/config`
- **按钮权限**: `approval:config:view,approval:config:edit`

### 审批监控权限
- **权限名称**: 审批监控查看
- **权限类型**: 功能
- **URL权限**: `/approval/monitor`
- **按钮权限**: `approval:monitor:view,approval:monitor:operate`

### 模板管理权限
- **权限名称**: 模板管理
- **权限类型**: 功能
- **URL权限**: `/approval/templates`
- **按钮权限**: `approval:template:view,approval:template:edit,approval:template:delete`

### 审批统计权限
- **权限名称**: 审批统计查看
- **权限类型**: 功能
- **URL权限**: `/approval/statistics`
- **按钮权限**: `approval:statistics:view,approval:statistics:export`

## 角色权限分配

根据 `marketingPermissionService.ts` 中的配置，为不同角色分配权限：

- **super_admin**: 所有审批管理权限
- **marketing_manager**: 审批配置、监控、统计权限
- **marketing_specialist**: 审批监控、统计权限（只读）
- **data_analyst**: 审批统计权限（只读）

## 验证步骤

1. **菜单显示验证**
   - 刷新前端页面
   - 在左侧导航栏中应该能看到"审批管理"主菜单
   - 展开后应该显示4个子菜单项

2. **路由访问验证**
   - 点击各个子菜单项
   - 确认能正确跳转到对应页面
   - 验证页面内容正常显示

3. **权限验证**
   - 使用不同角色的账号登录
   - 验证菜单项的显示/隐藏是否符合权限配置
   - 测试各项功能的访问权限

## 注意事项

1. **组件路径**: 确保组件路径与实际文件路径一致
2. **权限配置**: 添加菜单后需要配置相应的权限
3. **角色分配**: 为不同角色分配适当的菜单访问权限
4. **图标选择**: 建议使用语义化的图标名称
5. **排序设置**: 合理设置菜单排序，保持界面整洁

## 故障排除

如果菜单不显示或无法访问：

1. 检查组件路径是否正确
2. 确认权限配置是否完整
3. 验证用户角色是否有相应权限
4. 检查菜单状态是否为启用
5. 确认菜单可见性设置是否正确

完成以上步骤后，审批管理功能将成功集成到系统的左侧菜单栏中。
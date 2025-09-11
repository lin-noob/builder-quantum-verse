import { adminAuthService } from "@/services/adminAuthService";

// 营销管理后台角色定义
export type MarketingRole = 
  | "super_admin"     // 超级管理员
  | "marketing_manager"  // 营销经理
  | "marketing_specialist"  // 营销专员
  | "data_analyst";   // 数据分析师

// 菜单权限项定义
export interface MarketingMenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode | null;
  requiredRole: MarketingRole;
  badge?: string;
}

// 角色权限映射
const rolePermissions: Record<MarketingRole, string[]> = {
  // 超级管理员 - 所有菜单项
  "super_admin": [
    "dashboard",
    "user-profile",
    "ai-strategy",
    "effect-tracking",
    "user-list",
    "real-time-monitoring",
    "response-actions",
    "organization",
    "security-permissions"
  ],
  
  // 营销经理 - 核心功能
  "marketing_manager": [
    "dashboard",
    "user-profile",
    "ai-strategy",
    "effect-tracking",
    "user-list",
    "real-time-monitoring",
    "response-actions"
  ],
  
  // 营销专员 - 执行任务
  "marketing_specialist": [
    "dashboard",
    "user-profile",
    "user-list"
  ],
  
  // 数据分析师 - 数据分析功能
  "data_analyst": [
    "dashboard",
    "user-profile",
    "effect-tracking",
    "real-time-monitoring"
  ]
};

// 菜单配置
export const marketingMenuItems: MarketingMenuItem[] = [
  {
    id: "dashboard",
    label: "系统概览",
    path: "/admin/marketing",
    icon: null,
    requiredRole: "super_admin"
  },
  {
    id: "user-profile",
    label: "用户画像",
    path: "/admin/marketing/user-profile",
    icon: null,
    requiredRole: "marketing_manager"
  },
  {
    id: "ai-strategy",
    label: "AI营销策略",
    path: "/admin/marketing/ai-strategy",
    icon: null,
    requiredRole: "marketing_manager"
  },
  {
    id: "effect-tracking",
    label: "效果追踪",
    path: "/admin/marketing/effect-tracking",
    icon: null,
    requiredRole: "marketing_manager"
  },
  {
    id: "user-list",
    label: "用户列表",
    path: "/admin/marketing/user-list",
    icon: null,
    requiredRole: "marketing_manager"
  },
  {
    id: "real-time-monitoring",
    label: "实时监控",
    path: "/admin/marketing/real-time-monitoring",
    icon: null,
    requiredRole: "marketing_manager"
  },
  {
    id: "response-actions",
    label: "响应动作",
    path: "/admin/marketing/response-actions",
    icon: null,
    requiredRole: "marketing_manager"
  },
  {
    id: "organization",
    label: "组织管理",
    path: "/admin/marketing/organization",
    icon: null,
    requiredRole: "super_admin"
  },
  {
    id: "security-permissions",
    label: "安全与权限",
    path: "/admin/marketing/security-permissions",
    icon: null,
    requiredRole: "super_admin"
  }
];

// 权限服务类
class MarketingPermissionService {
  // 获取当前用户角色
  getCurrentUserRoles(): MarketingRole[] {
    const adminUser = adminAuthService.getCurrentAdminUser();
    if (!adminUser) {
      return [];
    }
    
    // 这里应该根据实际用户信息获取角色
    // 目前简化处理，超级管理员有所有权限
    if (adminUser.isAdmin) {
      return ["super_admin"];
    }
    
    // 默认返回营销经理角色
    return ["marketing_manager"];
  }
  
  // 检查用户是否具有指定菜单权限
  hasMenuPermission(menuId: string): boolean {
    const userRoles = this.getCurrentUserRoles();
    
    // 如果用户没有任何角色，则没有权限
    if (userRoles.length === 0) {
      return false;
    }
    
    // 超级管理员拥有所有权限
    if (userRoles.includes("super_admin")) {
      return true;
    }
    
    // 检查用户的角色是否具有该菜单权限
    return userRoles.some(role => {
      const permissions = rolePermissions[role] || [];
      return permissions.includes(menuId);
    });
  }
  
  // 获取用户可访问的菜单列表
  getAccessibleMenus(): MarketingMenuItem[] {
    return marketingMenuItems.filter(item => this.hasMenuPermission(item.id));
  }
  
  // 获取所有菜单项（用于权限配置）
  getAllMenus(): MarketingMenuItem[] {
    return marketingMenuItems;
  }
  
  // 获取所有角色
  getAllRoles(): MarketingRole[] {
    return ["super_admin", "marketing_manager", "marketing_specialist", "data_analyst"];
  }
  
  // 获取角色对应的菜单权限
  getRolePermissions(role: MarketingRole): string[] {
    return rolePermissions[role] || [];
  }
  
  // 更新角色权限（模拟实现）
  updateRolePermissions(role: MarketingRole, permissions: string[]): void {
    // 在实际应用中，这里会调用API更新角色权限
    console.log(`更新角色 ${role} 的权限:`, permissions);
    // 注意：在实际实现中，我们需要更新 rolePermissions 对象
    // 但由于这是常量，我们需要使用可变对象或状态管理
  }
}

// 导出单例实例
export const marketingPermissionService = new MarketingPermissionService();
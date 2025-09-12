import React from 'react';

// 页面组件映射表
const CLIENT_PAGES_MAP: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  // Dashboard
  '/client/pages/Dashboard.tsx': () => import('@/pages/Dashboard'),
  '/client/pages/Dashboard2.tsx': () => import('@/pages/Dashboard2'),
  
  // User Management
  '/client/pages/UserList.tsx': () => import('@/pages/UserList'),
  '/client/pages/UserList2.tsx': () => import('@/pages/UserList2'),
  '/client/pages/UserListOptimized.tsx': () => import('@/pages/UserListOptimized'),
  '/client/pages/UserDetail.tsx': () => import('@/pages/UserDetail'),
  '/client/pages/UserDetail2.tsx': () => import('@/pages/UserDetail2'),
  '/client/pages/UserDetail_New.tsx': () => import('@/pages/UserDetail_New'),
  
  // AI Marketing
  '/client/pages/AIMarketingStrategies.tsx': () => import('@/pages/AIMarketingStrategies'),
  '/client/pages/AIMarketingStrategyCreate.tsx': () => import('@/pages/AIMarketingStrategyCreate'),
  '/client/pages/AIMarketingStrategyDetail.tsx': () => import('@/pages/AIMarketingStrategyDetail'),
  '/client/pages/AIMarketing/ScenariosList.tsx': () => import('@/pages/AIMarketing/ScenariosList'),
  '/client/pages/AIMarketing/ScenarioConfig.tsx': () => import('@/pages/AIMarketing/ScenarioConfig'),
  '/client/pages/AIMarketing/FullyAuto.tsx': () => import('@/pages/AIMarketing/FullyAuto'),
  '/client/pages/AIMarketing/SemiAuto.tsx': () => import('@/pages/AIMarketing/SemiAuto'),
  '/client/pages/AIMarketing/MonitoringCenter.tsx': () => import('@/pages/AIMarketing/MonitoringCenter'),
  '/client/pages/AIMarketing/LiveMonitoring.tsx': () => import('@/pages/AIMarketing/LiveMonitoring'),
  '/client/pages/AIMarketing/StrategyGoals.tsx': () => import('@/pages/AIMarketing/StrategyGoals'),
  '/client/pages/AIMarketing/PerformanceAnalytics.tsx': () => import('@/pages/AIMarketing/PerformanceAnalytics'),
  '/client/pages/AIMarketing/ScriptCreate.tsx': () => import('@/pages/AIMarketing/ScriptCreate'),
  
  // Features
  '/client/pages/features/AIMarketing.tsx': () => import('@/pages/features/AIMarketing'),
  '/client/pages/features/AIMarketingOptimized.tsx': () => import('@/pages/features/AIMarketingOptimized'),
  '/client/pages/features/EffectTracking.tsx': () => import('@/pages/features/EffectTracking'),
  '/client/pages/features/EffectTrackingOptimized.tsx': () => import('@/pages/features/EffectTrackingOptimized'),
  '/client/pages/features/RealTimeMonitoring.tsx': () => import('@/pages/features/RealTimeMonitoring'),
  '/client/pages/features/UserProfiling.tsx': () => import('@/pages/features/UserProfiling'),
  
  // Solutions
  '/client/pages/solutions/EnterpriseSolution.tsx': () => import('@/pages/solutions/EnterpriseSolution'),
  '/client/pages/solutions/FinancialSolution.tsx': () => import('@/pages/solutions/FinancialSolution'),
  '/client/pages/solutions/ContentSolution.tsx': () => import('@/pages/solutions/ContentSolution'),
  '/client/pages/solutions/EcommerceSolution.tsx': () => import('@/pages/solutions/EcommerceSolution'),
  
  // Effect Tracking
  '/client/pages/EffectTracking.tsx': () => import('@/pages/EffectTracking'),
  
  // Response Actions
  '/client/pages/ResponseActions.tsx': () => import('@/pages/ResponseActions'),
  '/client/pages/ResponseActionCreate.tsx': () => import('@/pages/ResponseActionCreate'),
  '/client/pages/ResponseActionEdit.tsx': () => import('@/pages/ResponseActionEdit'),
  '/client/pages/ResponseActionDetail.tsx': () => import('@/pages/ResponseActionDetail'),
  
  // Projects
  '/client/pages/ProjectList.tsx': () => import('@/pages/ProjectList'),
  '/client/pages/ProjectDetail.tsx': () => import('@/pages/ProjectDetail'),
  
  // Organization
  '/client/pages/Organization/OrganizationSettings.tsx': () => import('@/pages/Organization/OrganizationSettings'),
  '/client/pages/Organization/MemberManagement.tsx': () => import('@/pages/Organization/MemberManagement'),
  '/client/pages/Organization/GranularPermissionManagement.tsx': () => import('@/pages/Organization/GranularPermissionManagement'),
  
  // Account
  '/client/pages/Account/PersonalSettings.tsx': () => import('@/pages/Account/PersonalSettings'),
  
  // Integration & SDK
  '/client/pages/Integration/SDKIntegration.tsx': () => import('@/pages/Integration/SDKIntegration'),
  '/client/pages/SDK.tsx': () => import('@/pages/SDK'),
  
  // Import/Export
  '/client/pages/ImportCenter.tsx': () => import('@/pages/ImportCenter'),
  '/client/pages/ExportCenter.tsx': () => import('@/pages/ExportCenter'),
  
  // Order History
  '/client/pages/OrderHistoryDemo.tsx': () => import('@/pages/OrderHistoryDemo'),
  
  // Marketing Home
  '/client/pages/MarketingHome.tsx': () => import('@/pages/MarketingHome'),
  
  // Test Pages
  '/client/pages/I18nTest.tsx': () => import('@/pages/I18nTest'),
  '/client/pages/TranslationTest.tsx': () => import('@/pages/TranslationTest'),
  '/client/pages/DynamicMenuTest.tsx': () => import('@/pages/DynamicMenuTest'),
  
  // Index
  '/client/pages/Index.tsx': () => import('@/pages/Index'),


  '/client/admin/pages/AdminDashboard.tsx': () => import('@/admin/pages/AdminDashboard.tsx'),
  '/client/admin/pages/OrganizationManagement.tsx': () => import('@/admin/pages/OrganizationManagement.tsx'),
  '/client/admin/pages/SubscriptionManagement.tsx': () => import('@/admin/pages/SubscriptionManagement.tsx'),
  '/client/admin/pages/AdminProfile.tsx': () => import('@/admin/pages/AdminProfile.tsx'),
  '/client/pages/Organization/SubscriptionRecharge.tsx': () => import('@/pages/Organization/SubscriptionRecharge.tsx'),
  '/client/pages/Organization/OperationLogs.tsx': () => import('@/pages/Organization/OperationLogs.tsx'),
  '/client/admin/pages/RechargeRecords.tsx': () => import('@/admin/pages/RechargeRecords.tsx'),
  '/client/admin/pages/UserFeedback.tsx': () => import('@/admin/pages/UserFeedback.tsx'),
};

export function loadLazyClientComponent(componentPath?: string): React.LazyExoticComponent<React.ComponentType<any>> | null {
  if (!componentPath) {
    return null;
  }

  // 尝试从映射表中找到对应的组件
  const loader = CLIENT_PAGES_MAP[componentPath];
  
  if (loader) {
    return React.lazy(loader);
  }

  // 如果映射表中没有找到，尝试根据路径规则动态构造
  const normalizedPath = componentPath.replace(/^\/client\/pages\//, '@/pages/');
  
  try {
    return React.lazy(() => import(/* @vite-ignore */ componentPath));
  } catch (error) {
    console.warn(`无法加载动态组件: ${componentPath}`, error);
    return null;
  }
}

export function isValidClientComponent(componentPath?: string): boolean {
  if (!componentPath) {
    return false;
  }
  
  return CLIENT_PAGES_MAP.hasOwnProperty(componentPath);
}

// 获取所有可用的客户端页面路径
export function getAvailableClientPages(): string[] {
  return Object.keys(CLIENT_PAGES_MAP);
}
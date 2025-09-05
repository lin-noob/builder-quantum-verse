import "./global.css";

import React, { Suspense } from "react";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { usePageRequestManager } from "./hooks/useRequestManager";
import { ContactModalProvider, useContactModal } from "./contexts/ContactModalContext";
import ContactFormModal from "./components/ContactFormModal";

// 🚀 懒加载组件 - 首屏必需的组件保持静态导入
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MarketingHome from "./pages/MarketingHome";
import I18nTest from "./pages/I18nTest";
import TranslationTest from "./pages/TranslationTest";

// 🎯 路由级懒加载 - 将大型页面组件延迟加载
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Dashboard2 = React.lazy(() => import("./pages/Dashboard2"));
const UserList = React.lazy(() => import("./pages/UserList"));
const UserList2 = React.lazy(() => import("./pages/UserList2"));
const UserListOptimized = React.lazy(() => import("./pages/UserListOptimized"));
const UserDetail = React.lazy(() => import("./pages/UserDetail"));
const UserDetailNew = React.lazy(() => import("./pages/UserDetail_New"));
const UserDetail2 = React.lazy(() => import("./pages/UserDetail2"));
const AIMarketingStrategies = React.lazy(() => import("./pages/AIMarketingStrategies"));
const AIMarketingStrategyCreate = React.lazy(() => import("./pages/AIMarketingStrategyCreate"));
const AIMarketingStrategyDetail = React.lazy(() => import("./pages/AIMarketingStrategyDetail"));
const ResponseActions = React.lazy(() => import("./pages/ResponseActions"));
const ResponseActionDetail = React.lazy(() => import("./pages/ResponseActionDetail"));
const ResponseActionCreate = React.lazy(() => import("./pages/ResponseActionCreate"));
const MonitoringCenter = React.lazy(() => import("./pages/AIMarketing/MonitoringCenter"));
const FullyAuto = React.lazy(() => import("./pages/AIMarketing/FullyAuto"));
const SemiAuto = React.lazy(() => import("./pages/AIMarketing/SemiAuto"));
const ScriptCreate = React.lazy(() => import("./pages/AIMarketing/ScriptCreate"));
const ScenariosList = React.lazy(() => import("./pages/AIMarketing/ScenariosList"));
const ScenarioConfig = React.lazy(() => import("./pages/AIMarketing/ScenarioConfig"));
const PerformanceAnalytics = React.lazy(() => import("./pages/AIMarketing/PerformanceAnalytics"));
const LiveMonitoring = React.lazy(() => import("./pages/AIMarketing/LiveMonitoring"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const EffectTracking = React.lazy(() => import("./pages/EffectTracking"));
const SDKIntegration = React.lazy(() => import("./pages/Integration/SDKIntegration"));
const MemberManagement = React.lazy(() => import("./pages/Organization/MemberManagement"));
const OrganizationSettings = React.lazy(() => import("./pages/Organization/OrganizationSettings"));
const GranularPermissionManagement = React.lazy(() => import("./pages/Organization/GranularPermissionManagement"));
const PersonalSettings = React.lazy(() => import("./pages/Account/PersonalSettings"));

// 🚀 管理后台��加载 - AdminApp通常很大
const AdminApp = React.lazy(() => import("./admin/AdminApp"));

// 🎯 特性页面懒加载
const AIMarketingFeature = React.lazy(() => import("./pages/features/AIMarketingOptimized"));
const UserProfilingFeature = React.lazy(() => import("./pages/features/UserProfiling"));
const RealTimeMonitoringFeature = React.lazy(() => import("./pages/features/RealTimeMonitoring"));
const EffectTrackingFeature = React.lazy(() => import("./pages/features/EffectTrackingOptimized"));

// 🎯 解决方案页面懒加载
const EcommerceSolution = React.lazy(() => import("./pages/solutions/EcommerceSolution"));
const ContentSolution = React.lazy(() => import("./pages/solutions/ContentSolution"));
const FinancialSolution = React.lazy(() => import("./pages/solutions/FinancialSolution"));
const EnterpriseSolution = React.lazy(() => import("./pages/solutions/EnterpriseSolution"));

// 🚀 优化的QueryClient配置 - 减少不必要的重新获取
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟后数据才过期
      cacheTime: 10 * 60 * 1000, // 10分钟后从缓存移除
      refetchOnWindowFocus: false, // 窗口焦点不重新获取
      refetchOnReconnect: false, // 重新连接不重新获取
      retry: 1, // 仅重试1次
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// 🎯 通用的加载组件
const PageLoader: React.FC<{ message?: string }> = ({ message = "加载中..." }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-gray-600">{message}</div>
    </div>
  </div>
);

// 🎯 懒加载路由包装器
const LazyRoute: React.FC<{ 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <Suspense fallback={fallback || <PageLoader />}>
    {children}
  </Suspense>
);

// 内部应用组件，使用Context
const AppContent: React.FC = () => {
  const { isOpen, closeModal, modalTitle, modalDescription } = useContactModal();

  return (
    <>
      <BrowserRouter>
            <Routes>
              {/* 首页重定向 */}
              <Route path="/" element={<Navigate to="/marketing" replace />} />

              {/* 营销首页 - 保持静态导入以确保快速首屏 */}
              <Route path="/marketing" element={<MarketingHome />} />

              {/* 多语言测试页面 */}
              <Route path="/i18n-test" element={<I18nTest />} />
              <Route path="/translation-test" element={<TranslationTest />} />

              {/* 认证相关路由 - 保持静态导入 */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🚀 主应用路由 - 使用懒加载 */}
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    <LazyRoute fallback={<PageLoader message="加载仪表盘..." />}>
                      <Dashboard />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/dashboard1"
                element={
                  <Layout>
                    <LazyRoute>
                      <Dashboard />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/dashboard2"
                element={
                  <Layout>
                    <LazyRoute>
                      <Dashboard2 />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 🎯 用户管理路由 */}
              <Route
                path="/users"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserList />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/users2"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserList2 />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/users1"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserListOptimized />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/users/:cdpId"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserDetail />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/users2/:cdpId"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserDetail2 />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/users1/:cdpId"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserDetail />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/user-detail-new/:cdpId"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserDetailNew />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 🎯 AI营销策略路由 */}
              <Route
                path="/ai-marketing-strategies"
                element={
                  <Layout>
                    <LazyRoute>
                      <AIMarketingStrategies />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing-strategies/create"
                element={
                  <Layout>
                    <LazyRoute>
                      <AIMarketingStrategyCreate />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing-strategies/:id"
                element={
                  <Layout>
                    <LazyRoute>
                      <AIMarketingStrategyDetail />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 🎯 响应动作路由 */}
              <Route
                path="/response-actions"
                element={
                  <Layout>
                    <LazyRoute>
                      <ResponseActions />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/response-actions/:id"
                element={
                  <Layout>
                    <LazyRoute>
                      <ResponseActionDetail />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/response-actions/create"
                element={
                  <Layout>
                    <LazyRoute>
                      <ResponseActionCreate />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 🚀 AI营销模块路由 - 懒加载重型组件 */}
              <Route
                path="/ai-marketing/monitoring-center"
                element={
                  <Layout>
                    <LazyRoute fallback={<PageLoader message="加载监控中心..." />}>
                      <MonitoringCenter />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/fully-auto"
                element={
                  <Layout>
                    <LazyRoute>
                      <FullyAuto />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/semi-auto"
                element={
                  <Layout>
                    <LazyRoute>
                      <SemiAuto />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/semi-auto/create"
                element={
                  <Layout>
                    <LazyRoute>
                      <ScriptCreate />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/scenarios"
                element={
                  <Layout>
                    <LazyRoute>
                      <ScenariosList />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/scenarios/:scenarioId"
                element={
                  <Layout>
                    <LazyRoute>
                      <ScenarioConfig />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/performance-analytics"
                element={
                  <Layout>
                    <LazyRoute>
                      <PerformanceAnalytics />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/ai-marketing/live-monitoring"
                element={
                  <Layout>
                    <LazyRoute>
                      <LiveMonitoring />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 其他路由 */}
              <Route
                path="/user-profile"
                element={
                  <Layout>
                    <LazyRoute>
                      <UserProfile />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/effect-tracking"
                element={
                  <Layout>
                    <LazyRoute>
                      <EffectTracking />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* SDK集成 */}
              <Route
                path="/integration/sdk"
                element={
                  <Layout>
                    <LazyRoute>
                      <SDKIntegration />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 组织管理 */}
              <Route
                path="/organization/members"
                element={
                  <Layout>
                    <LazyRoute>
                      <MemberManagement />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/organization/settings"
                element={
                  <Layout>
                    <LazyRoute>
                      <OrganizationSettings />
                    </LazyRoute>
                  </Layout>
                }
              />
              <Route
                path="/organization/permissions"
                element={
                  <Layout>
                    <LazyRoute>
                      <GranularPermissionManagement />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 个人设置 */}
              <Route
                path="/account/settings"
                element={
                  <Layout>
                    <LazyRoute>
                      <PersonalSettings />
                    </LazyRoute>
                  </Layout>
                }
              />

              {/* 🚀 管理后台路由 - AdminApp是最大的组件，必须懒加载 */}
              <Route
                path="/admin/*"
                element={
                  <LazyRoute fallback={<PageLoader message="加载管理后台..." />}>
                    <AdminApp />
                  </LazyRoute>
                }
              />

              {/* 🎯 特性页面路由 */}
              <Route
                path="/features/ai-marketing"
                element={
                  <LazyRoute>
                    <AIMarketingFeature />
                  </LazyRoute>
                }
              />
              <Route
                path="/features/user-profiling"
                element={
                  <LazyRoute>
                    <UserProfilingFeature />
                  </LazyRoute>
                }
              />
              <Route
                path="/features/real-time-monitoring"
                element={
                  <LazyRoute>
                    <RealTimeMonitoringFeature />
                  </LazyRoute>
                }
              />
              <Route
                path="/features/effect-tracking"
                element={
                  <LazyRoute>
                    <EffectTrackingFeature />
                  </LazyRoute>
                }
              />

              {/* 🎯 解决方案页面路由 */}
              <Route
                path="/solutions/ecommerce"
                element={
                  <LazyRoute>
                    <EcommerceSolution />
                  </LazyRoute>
                }
              />
              <Route
                path="/solutions/content-marketing"
                element={
                  <LazyRoute>
                    <ContentSolution />
                  </LazyRoute>
                }
              />
              <Route
                path="/solutions/financial-marketing"
                element={
                  <LazyRoute>
                    <FinancialSolution />
                  </LazyRoute>
                }
              />
              <Route
                path="/solutions/enterprise-services"
                element={
                  <LazyRoute>
                    <EnterpriseSolution />
                  </LazyRoute>
                }
              />
            </Routes>
      </BrowserRouter>

      {/* 全局联系表单弹窗 */}
      <ContactFormModal
        open={isOpen}
        onOpenChange={closeModal}
        title={modalTitle}
        description={modalDescription}
      />

      {/* Toast组件 */}
      <Toaster />
      <Sonner />
    </>
  );
};

export default function App() {
  usePageRequestManager();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ContactModalProvider>
            <AppContent />
          </ContactModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// 注意：createRoot 调用应该在应用入口点（main.tsx）中，而不是这里

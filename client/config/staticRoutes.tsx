import React from "react";
import { Navigate, RouteObject } from "react-router-dom";
import Layout from "@/components/Layout";
import AIMarketingStrategies from "@/pages/AIMarketingStrategies";
import MarketingHome from "@/pages/MarketingHome";
import AIMarketingOptimized from "@/pages/features/AIMarketingOptimized";
import UserProfiling from "@/pages/features/UserProfiling";
import RealTimeMonitoring from "@/pages/features/RealTimeMonitoring";
import EffectTrackingOptimized from "@/pages/features/EffectTrackingOptimized";
import EcommerceSolution from "@/pages/solutions/EcommerceSolution";
import ContentSolution from "@/pages/solutions/ContentSolution";
import FinancialSolution from "@/pages/solutions/FinancialSolution";
import EnterpriseSolution from "@/pages/solutions/EnterpriseSolution";
import AdminProfile from "@/admin/pages/AdminProfile";

// 帮助中心页面组件
const HelpCenter = React.lazy(() => import("@/pages/HelpCenter/HelpCenter"));
const DocumentDetail = React.lazy(
  () => import("@/pages/HelpCenter/DocumentDetail"),
);
const MarketingHelpCenter = React.lazy(
  () => import("@/pages/MarketingHelpCenter"),
);
const MarketingDocumentDetail = React.lazy(
  () => import("@/pages/MarketingDocumentDetail"),
);

// 懒加载组件
import Dashboard2 from "@/pages/Dashboard2"; // 改为直接导入解决模块加载问题
// const Dashboard2 = React.lazy(() => import("@/pages/Dashboard2"));
const PersonalSettings = React.lazy(
  () => import("@/pages/Account/PersonalSettings"),
);
const ProjectList = React.lazy(() => import("@/pages/ProjectList"));
const ProjectDetail = React.lazy(() => import("@/pages/ProjectDetail"));

// 带参数的页面组件
const OrganizationDetail = React.lazy(
  () => import("@/admin/pages/OrganizationDetail"),
);
const UserDetailsAnalytics = React.lazy(
  () => import("@/admin/pages/UserDetailsAnalytics"),
);
const UserDetail_New = React.lazy(() => import("@/pages/UserDetail_New"));
const ScenarioConfig = React.lazy(
  () => import("@/pages/AIMarketing/ScenarioConfig"),
);
const I18nConfig = React.lazy(() => import("@/pages/Organization/I18nConfig"));
const I18nTranslationManager = React.lazy(
  () => import("@/pages/Organization/I18nTranslationManager"),
);
const HelpDocumentI18nManager = React.lazy(
  () => import("@/pages/Organization/HelpDocumentI18nManager"),
);

const Events = React.lazy(() => import("@/pages/events"));
const Tasks = React.lazy(() => import("@/pages/MyTasks"));
const Calendar = React.lazy(() => import("@/pages/TeamCalendar"));
const EmailManualProcessing = React.lazy(() => import("@/pages/EmailManualProcessing"));
const LegacyAppPlaceholder = React.lazy(
  () => import("@/pages/LegacyAppPlaceholder"),
);

// LazyRoute 包装组件
const LazyRoute: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => (
  <React.Suspense
    fallback={
      fallback || (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">加载中...</div>
          </div>
        </div>
      )
    }
  >
    {children}
  </React.Suspense>
);

// 静态路由配置
export const staticRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/marketing" replace />,
  },
  {
    path: "/marketing",
    element: <MarketingHome />,
  },
  // 帮助中心路由
  {
    path: "/marketing/help",
    element: (
      <LazyRoute>
        <MarketingHelpCenter />
      </LazyRoute>
    ),
  },
  {
    path: "/marketing/help/:documentId",
    element: (
      <LazyRoute>
        <MarketingHelpCenter />
      </LazyRoute>
    ),
  },
  {
    path: "/marketing/help/documents/:documentId",
    element: (
      <LazyRoute>
        <MarketingDocumentDetail />
      </LazyRoute>
    ),
  },
  // 基础静态路由
  {
    path: "/dashboard2",
    element: (
      <Layout>
        <Dashboard2 />
      </Layout>
    ),
  },
  {
    path: "/account/settings",
    element: (
      <Layout>
        <LazyRoute>
          <AdminProfile></AdminProfile>
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/projects",
    element: (
      <Layout>
        <LazyRoute>
          <ProjectList />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/projects/:id",
    element: (
      <Layout>
        <LazyRoute>
          <ProjectDetail />
        </LazyRoute>
      </Layout>
    ),
  },

  // 带参数的页面路由（使用Layout框架）
  {
    path: "/admin/organizations/:organizationId",
    element: (
      <Layout>
        <LazyRoute>
          <OrganizationDetail />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/admin/users/:userId/details",
    element: (
      <Layout>
        <LazyRoute>
          <UserDetailsAnalytics />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/users1/:cdpId",
    element: (
      <Layout>
        <LazyRoute>
          <UserDetail_New />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/ai-marketing/scenarios/:scenarioId",
    element: (
      <Layout>
        <LazyRoute>
          <ScenarioConfig />
        </LazyRoute>
      </Layout>
    ),
  },

  {
    path: "/ai-marketing-strategies",
    element: (
      <Layout>
        <LazyRoute>
          <AIMarketingStrategies />
        </LazyRoute>
      </Layout>
    ),
  },

  {
    path: "/features/ai-marketing",
    element: (
      <LazyRoute>
        <AIMarketingOptimized />
      </LazyRoute>
    ),
  },
  {
    path: "/features/user-profiling",
    element: (
      <LazyRoute>
        <UserProfiling />
      </LazyRoute>
    ),
  },
  {
    path: "/features/real-time-monitoring",
    element: (
      <LazyRoute>
        <RealTimeMonitoring />
      </LazyRoute>
    ),
  },
  {
    path: "/features/effect-tracking",
    element: (
      <LazyRoute>
        <EffectTrackingOptimized />
      </LazyRoute>
    ),
  },
  {
    path: "/solutions/ecommerce",
    element: (
      <LazyRoute>
        <EcommerceSolution />
      </LazyRoute>
    ),
  },
  {
    path: "/solutions/content-marketing",
    element: (
      <LazyRoute>
        <ContentSolution />
      </LazyRoute>
    ),
  },
  {
    path: "/solutions/financial-marketing",
    element: (
      <LazyRoute>
        <FinancialSolution />
      </LazyRoute>
    ),
  },
  {
    path: "/solutions/enterprise-services",
    element: (
      <LazyRoute>
        <EnterpriseSolution />
      </LazyRoute>
    ),
  },
  {
    path: "/organization/i18n",
    element: (
      <Layout>
        <LazyRoute>
          <I18nConfig />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/organization/i18n/translation",
    element: (
      <Layout>
        <LazyRoute>
          <I18nTranslationManager />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/organization/help-documents/i18n",
    element: (
      <Layout>
        <LazyRoute>
          <HelpDocumentI18nManager />
        </LazyRoute>
      </Layout>
    ),
  },

  {
    path: "/events",
    element: (
      <Layout>
        <LazyRoute>
          <Events />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/tasks",
    element: (
      <Layout>
        <LazyRoute>
          <Tasks />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/calendar",
    element: (
      <Layout>
        <LazyRoute>
          <Calendar />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/email-manual-processing",
    element: (
      <Layout>
        <LazyRoute>
          <EmailManualProcessing />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: "/legacy-app-placeholder",
    element: (
      <Layout>
        <LazyRoute>
          <LegacyAppPlaceholder />
        </LazyRoute>
      </Layout>
    ),
  },
];

// 获取所有静态路由路径（用于路由匹配）
export const getStaticRoutePaths = (): string[] => {
  return staticRoutes.map((route) => route.path as string);
};

// 检查路径是否为静态路由
export const isStaticRoute = (pathname: string): boolean => {
  return staticRoutes.some((route) => {
    const routePath = route.path as string;

    // 处理带参数的路由
    if (routePath.includes(":")) {
      const pathPattern = routePath.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${pathPattern}$`);
      return regex.test(pathname);
    }

    // 精确匹配
    return routePath === pathname;
  });
};

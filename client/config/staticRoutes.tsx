import React from 'react';
import { RouteObject } from 'react-router-dom';
import Layout from '@/components/Layout';

// 懒加载组件
const Dashboard2 = React.lazy(() => import('@/pages/Dashboard2'));
const PersonalSettings = React.lazy(() => import('@/pages/Account/PersonalSettings'));
const ProjectList = React.lazy(() => import('@/pages/ProjectList'));
const ProjectDetail = React.lazy(() => import('@/pages/ProjectDetail'));

// 带参数的页面组件
const OrganizationDetail = React.lazy(() => import('@/admin/pages/OrganizationDetail'));
const UserDetailsAnalytics = React.lazy(() => import('@/admin/pages/UserDetailsAnalytics'));
const UserDetail_New = React.lazy(() => import('@/pages/UserDetail_New'));
const ScenarioConfig = React.lazy(() => import('@/pages/AIMarketing/ScenarioConfig'));

// LazyRoute 包装组件
const LazyRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <React.Suspense fallback={fallback || <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-gray-600">加载中...</div>
    </div>
  </div>}>{children}</React.Suspense>
);

// 静态路由配置
export const staticRoutes: RouteObject[] = [
  // 基础静态路由
  {
    path: '/dashboard2',
    element: (
      <Layout>
        <LazyRoute>
          <Dashboard2 />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: '/account/settings',
    element: (
      <Layout>
        <LazyRoute>
          <PersonalSettings />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: '/projects',
    element: (
      <Layout>
        <LazyRoute>
          <ProjectList />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: '/projects/:id',
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
    path: '/admin/organizations/:organizationId',
    element: (
      <Layout>
        <LazyRoute>
          <OrganizationDetail />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: '/admin/users/:userId/details',
    element: (
      <Layout>
        <LazyRoute>
          <UserDetailsAnalytics />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: '/users1/:cdpId',
    element: (
      <Layout>
        <LazyRoute>
          <UserDetail_New />
        </LazyRoute>
      </Layout>
    ),
  },
  {
    path: '/ai-marketing/scenarios/:scenarioId',
    element: (
      <Layout>
        <LazyRoute>
          <ScenarioConfig />
        </LazyRoute>
      </Layout>
    ),
  },
];

// 获取所有静态路由路径（用于路由匹配）
export const getStaticRoutePaths = (): string[] => {
  return staticRoutes.map(route => route.path as string);
};

// 检查路径是否为静态路由
export const isStaticRoute = (pathname: string): boolean => {
  return staticRoutes.some(route => {
    const routePath = route.path as string;
    
    // 处理带参数的路由
    if (routePath.includes(':')) {
      const pathPattern = routePath.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pathPattern}$`);
      return regex.test(pathname);
    }
    
    // 精确匹配
    return routePath === pathname;
  });
};
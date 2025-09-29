import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { usePageRequestManager } from "./hooks/useRequestManager";
import { ContactModalProvider, useContactModal } from "./contexts/ContactModalContext";
import ContactFormModal from "./components/ContactFormModal";

import { staticRoutes, isStaticRoute } from "./config/staticRoutes";

// 基础页（登录相关与管理后台）
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
const AdminApp = React.lazy(() => import("./admin/AdminApp"));

// 前台动态菜单与懒加载工具
import { fetchClientMenus, filterClientMenus, flattenClientMenus, type ClientMenuApiItem } from "./services/clientMenuService";
import { loadLazyClientComponent } from "./utils/clientPageLoader";
import { useAuthStore } from "./stores";
import { useRoleStore } from "./stores/roleStore";
import AdminAuth from "./admin/pages/AdminAuth";

const queryClient = new QueryClient();

const PageLoader: React.FC<{ message?: string }> = ({ message = "加载中..." }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <div className="text-gray-600">{message}</div>
    </div>
  </div>
);

const LazyRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <Suspense fallback={fallback || <PageLoader />}>{children}</Suspense>
);

// 智能路由保护组件，避免刷新时错误重定向
const SmartRouteGuard: React.FC<{
  isAuthenticated: boolean;
  menus: ClientMenuApiItem[] | null;
}> = ({ isAuthenticated, menus }) => {
  const location = useLocation();
  
  // 如果未认证，重定向到认证页面
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  // 特殊处理 dashboard2 路径，避免模块加载问题
  if (location.pathname === "/dashboard2") {
    return <PageLoader message="正在加载仪表盘..." />;
  }
  
  // 检查是否为静态路由
  if (isStaticRoute(location.pathname)) {
    // 静态路由存在但可能还没渲染，显示加载页面而不是重定向
    return <PageLoader message="正在加载页面..." />;
  }
  
  // 检查是否为动态路由
  if (menus) {
    const flatMenus = flattenClientMenus(menus);
    const isDynamicRoute = flatMenus.some(menu => menu.path === location.pathname);
    if (isDynamicRoute) {
      // 动态路由存在但可能还没渲染，显示加载页面而不是重定向
      return <PageLoader message="正在加载页面..." />;
    }
  } else {
    // 菜单还在加载中，等待而不是重定向
    return <PageLoader message="正在加载菜单..." />;
  }
  
  // 只有确认是无效路由时才重定向到默认页面
  return <Navigate to="/dashboard2" replace />;
};

function AppContent() {
  const { isOpen, closeModal, modalTitle, modalDescription } = useContactModal();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { setFilteredMenus } = useRoleStore();
  const [menus, setMenus] = useState<ClientMenuApiItem[] | null>(null);

  // 登录完成后再获取并构建动态路由
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated) {
        setMenus(null);
        setFilteredMenus([]);
        return;
      }
      const rawMenus = await fetchClientMenus();
      const filteredMenus = filterClientMenus(rawMenus);
      if (mounted) {
        setMenus(filteredMenus);
        setFilteredMenus(filteredMenus); // 存储到 roleStore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const dynamicRoutes = useMemo(() => {
    if (!menus) return null;

    const built: JSX.Element[] = [];
    const addRoute = (m: ClientMenuApiItem) => {
      if (m.path && m.component) {
        const LazyComp = loadLazyClientComponent(m.component);
        if (LazyComp) {
          built.push(
            <Route
              key={m.path}
              path={m.path}
              element={
                <Layout>
                  <Suspense fallback={<PageLoader message="加载页面..." />}>
                    <LazyComp />
                  </Suspense>
                </Layout>
              }
            />,
          );
        }
      } else if (m.path && m.redirect) {
        built.push(
          <Route
            key={`${m.path}_redirect`}
            path={m.path}
            element={<Navigate to={m.redirect!} replace />}
          />,
        );
      }
      if (m.children) m.children.forEach(addRoute);
    };

    menus.forEach(addRoute);
    return <>{built}</>;
  }, [menus]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* 认证路���（保留） */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* <Route path="/admin/auth" element={<AdminAuth />} /> */}
          <Route path="/admin/auth" element={<AdminAuth />} />
          {/* 静态路由 */}
          {staticRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* 管理后台 */}
          <Route
            path="/admin/*"
            element={
              <LazyRoute fallback={<PageLoader message="加载管理后台..." />}>
                <AdminApp />
              </LazyRoute>
            }
          />

          {/* 动态路由（登录后构建） */}
          {dynamicRoutes}

          {/* 默认路由：优先跳转到Dashboard2 */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={
                  isAuthenticated 
                    ? "/dashboard2"
                    : "/auth"
                } 
                replace 
              />
            } 
          />
          <Route 
            path="*" 
            element={<SmartRouteGuard isAuthenticated={isAuthenticated} menus={menus} />}
          />
        </Routes>
      </BrowserRouter>

      <ContactFormModal open={isOpen} onOpenChange={closeModal} title={modalTitle} description={modalDescription} />
      <Toaster />
      <Sonner />
    </>
  );
}

export default function App() {
  usePageRequestManager();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <I18nextProvider i18n={i18n}>
            <ContactModalProvider>
              <AppContent />
            </ContactModalProvider>
          </I18nextProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

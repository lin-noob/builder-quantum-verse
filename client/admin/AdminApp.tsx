import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizationManagement from "./pages/OrganizationManagement";
import OrganizationDetail from "./pages/OrganizationDetail";
import UserManagement from "./pages/UserManagement";
import UserDetailsAnalytics from "./pages/UserDetailsAnalytics";
import AIModelManagement from "./pages/AIModelManagement";
import ScenarioConfiguration from "./pages/ScenarioConfiguration";
import SecurityPermissions from "./pages/SecurityPermissions";
import AdminProfile from "./pages/AdminProfile";
import SystemConfig from "./pages/SystemConfig";
import GranularPermissionManagement from "./pages/GranularPermissionManagement";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import MenuManagement from "./pages/MenuManagement";
import { AdminMenuApiItem, fetchAdminMenus } from "./services/menuRouteService";
import { loadLazyComponentByPath } from "./utils/dynamicRouteLoader";
import { useAdminStore } from "@/stores";

export default function AdminApp() {
  // 动态路由：仅登录后构建
  const isAdminAuthenticated = useAdminStore((s) => s.isAdminAuthenticated);
  const [menus, setMenus] = useState<AdminMenuApiItem[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAdminAuthenticated) {
        setMenus(null);
        return;
      }
      const data = await fetchAdminMenus();
      if (mounted) setMenus(data);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isAdminAuthenticated]);

  // 静态路由片段
  const staticRoutes = (
    <>
      <Route index element={<AdminDashboard />} />
      <Route path="menus" element={<MenuManagement />} />
      <Route path="organizations" element={<OrganizationManagement />} />
      <Route path="organizations/:organizationId" element={<OrganizationDetail />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="users/:userId/details" element={<UserDetailsAnalytics />} />
      <Route path="ai-models" element={<AIModelManagement />} />
      <Route path="scenarios" element={<ScenarioConfiguration />} />
      <Route path="security" element={<SecurityPermissions />} />
      <Route path="granular-permissions" element={<GranularPermissionManagement />} />
      <Route path="subscriptions" element={<SubscriptionManagement />} />
      <Route path="config" element={<SystemConfig />} />
      <Route path="profile" element={<AdminProfile />} />
    </>
  );

  // 动态路由片段（根据接口）
  const dynamicRoutes = useMemo(() => {
    if (!menus) return null;

    const normalizeChildPath = (p: string) => {
      if (!p || !p.startsWith("/admin")) return null;
      let child = p.replace(/^\/admin\/?/, "");
      child = child.replace(/^\/+/, "");
      return child; // 空字符串表示 index
    };

    const built: JSX.Element[] = [];
    const addRoute = (m: AdminMenuApiItem) => {
      if (m.path && m.component) {
        const childPath = normalizeChildPath(m.path);
        if (childPath !== null) {
          const LazyComp = loadLazyComponentByPath(m.component);
          if (LazyComp) {
            const el = (
              <Suspense fallback={<div className="p-4 text-sm text-gray-500">加载中...</div>}>
                <LazyComp />
              </Suspense>
            );
            if (childPath === "") {
              built.push(<Route key="dyn-index" index element={el} />);
            } else {
              built.push(<Route key={m.path} path={childPath} element={el} />);
            }
          }
        }
      }
      if (m.children) m.children.forEach(addRoute);
    };

    menus.forEach(addRoute);
    return <>{built}</>;
  }, [menus]);

  return (
    <Routes>
      {/* 管理员认证页面（不需要Layout和路由保护） */}
      <Route path="/admin/auth" element={<AdminAuth />} />

      {/* 受保护的管理员路由（静态 + 动态） */}
      <Route
        path="/admin/*"
        element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }
      >
        {staticRoutes}
        {dynamicRoutes}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
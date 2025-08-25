import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminRouteGuard from "./components/AdminRouteGuard";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizationManagement from "./pages/OrganizationManagement";
import OrganizationDetail from "./pages/OrganizationDetail";
import SystemConfig from "./pages/SystemConfig";
import AIModelManagement from "./pages/AIModelManagement";
import ScenarioConfiguration from "./pages/ScenarioConfiguration";
import SecurityPermissions from "./pages/SecurityPermissions";
import UserDetailsAnalytics from "./pages/UserDetailsAnalytics";
import UserManagement from "./pages/UserManagement";

// 临时占位页面组件
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600">此页面正在开发中...</p>
    </div>
  </div>
);

export default function AdminApp() {
  return (
    <Routes>
      {/* 管理员认证页面（不需要Layout和路由保护） */}
      <Route path="/auth" element={<AdminAuth />} />

      {/* 受保护的管理员路由 */}
      <Route
        path="/*"
        element={
          <AdminRouteGuard>
            <AdminLayout>
              <Routes>
                {/* 系统概览 */}
                <Route path="/" element={<AdminDashboard />} />

                {/* 组织管理 */}
                <Route path="/organizations" element={<OrganizationManagement />} />
                <Route path="/organizations/:organizationId" element={<OrganizationDetail />} />

                {/* 用户管理 */}
                <Route path="/users" element={<UserManagement />} />
                <Route
                  path="/users/:userId/details"
                  element={<UserDetailsAnalytics />}
                />

                {/* AI模型管理 */}
                <Route path="/ai-models" element={<AIModelManagement />} />

                {/* 场景配置管理 */}
                <Route path="/scenarios" element={<ScenarioConfiguration />} />

                {/* 数据源管理 */}
                <Route
                  path="/data-sources"
                  element={<PlaceholderPage title="数据源管理" />}
                />

                {/* 安全与权限 */}
                <Route path="/security" element={<SecurityPermissions />} />

                {/* 系统监控 */}
                <Route
                  path="/monitoring"
                  element={<PlaceholderPage title="系统监控" />}
                />

                {/* 系统配置 */}
                <Route path="/config" element={<SystemConfig />} />

                {/* 默认重定向 */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </AdminRouteGuard>
        }
      />
    </Routes>
  );
}

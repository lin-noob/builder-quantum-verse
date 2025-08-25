import React, { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  Database,
  Shield,
  BarChart3,
  Bot,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Cog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminAuthService } from "@/services/adminAuthService";
import TabManager from "@/components/TabManager";

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminMenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  badge?: string;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] = useState(adminAuthService.getCurrentAdminUser());

  // 监听管理员用户状态变化
  useEffect(() => {
    const adminUser = adminAuthService.getCurrentAdminUser();
    setCurrentAdminUser(adminUser);
  }, [location]);

  const menuItems: AdminMenuItem[] = [
    {
      id: "dashboard",
      label: "系统概览",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: "organizations",
      label: "组织管理",
      path: "/admin/organizations",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "ai-models",
      label: "AI模型管理",
      path: "/admin/ai-models",
      icon: <Bot className="h-5 w-5" />,
    },
    {
      id: "scenarios",
      label: "场景配置",
      path: "/admin/scenarios",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: "data-sources",
      label: "数据源管理",
      path: "/admin/data-sources",
      icon: <Database className="h-5 w-5" />,
    },
    {
      id: "security",
      label: "安全与权限",
      path: "/admin/security",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "monitoring",
      label: "系统监控",
      path: "/admin/monitoring",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  // 主平台入口菜单项（临时）
  const mainPlatformMenuItem = {
    id: "main-platform",
    label: "主平台入口（临时）",
    path: "/dashboard",
    icon: <ChevronRight className="h-5 w-5" />,
  };

  const isActiveRoute = (path: string) => {
    return (
      location.pathname === path ||
      (path !== "/admin" && location.pathname.startsWith(path))
    );
  };

  return (
    <div className="flex h-screen bg-background-secondary">
      {/* 移动��头部 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          {/* Admin User Profile Icon */}
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              currentAdminUser
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-200 border border-dashed border-gray-400",
            )}
            title={currentAdminUser ? `${currentAdminUser.username} - 超级管理员` : "未登录"}
          >
            <User
              className={cn(
                "h-4 w-4",
                currentAdminUser ? "text-white" : "text-gray-500",
              )}
            />
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AI营销管理后台</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* 移动端菜单遮罩 */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActiveRoute(item.path)
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                      )}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}

                {/* 分隔线 */}
                <li className="my-4">
                  <div className="border-t border-gray-300"></div>
                </li>

                {/* 主平台入口（临时） */}
                <li>
                  <Link
                    to={mainPlatformMenuItem.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-800"
                  >
                    {mainPlatformMenuItem.icon}
                    <span className="font-semibold">{mainPlatformMenuItem.label}</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* 左侧边栏 */}
      <div
        className={cn(
          "hidden lg:flex bg-card border-r border-border flex-col transition-all duration-300 ease-in-out relative",
          isSidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden">
                AI营销管理后台
              </span>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-2 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors relative group",
                    isSidebarCollapsed
                      ? "gap-0 px-3 py-2 justify-center"
                      : "gap-3 px-3 py-2",
                    isActiveRoute(item.path)
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isSidebarCollapsed && (
                    <>
                      <span className="whitespace-nowrap flex-1">
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}

                  {/* 悬浮提示 */}
                  {isSidebarCollapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                      {item.label}
                      {item.badge && ` (${item.badge})`}
                    </div>
                  )}
                </Link>
              </li>
            ))}

            {/* 分隔线 */}
            <li className="my-4">
              <div className="border-t border-gray-300"></div>
            </li>

            {/* 主平台入口（临时） */}
            <li>
              <Link
                to={mainPlatformMenuItem.path}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors relative group",
                  "border-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100",
                  "text-orange-700 hover:text-orange-800",
                  isSidebarCollapsed
                    ? "gap-0 px-3 py-2 justify-center"
                    : "gap-3 px-3 py-2",
                )}
                title={isSidebarCollapsed ? mainPlatformMenuItem.label : undefined}
              >
                {mainPlatformMenuItem.icon}
                {!isSidebarCollapsed && (
                  <span className="whitespace-nowrap flex-1 font-semibold">
                    {mainPlatformMenuItem.label}
                  </span>
                )}

                {/* 悬浮提示 */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap">
                    {mainPlatformMenuItem.label}
                  </div>
                )}
              </Link>
            </li>
          </ul>
        </nav>

        {/* 管理员信息 */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          {currentAdminUser ? (
            <>
              <div
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg text-gray-700",
                  isSidebarCollapsed ? "justify-center" : "justify-start",
                )}
                title={
                  isSidebarCollapsed ? `${currentAdminUser.username} - 超级管理员` : ""
                }
              >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentAdminUser.username}
                    </p>
                    <p className="text-xs text-red-600 truncate font-medium">
                      超级管理员
                    </p>
                  </div>
                )}
              </div>
              {/* 退出登录按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  adminAuthService.adminLogout();
                  window.location.href = "/admin/auth";
                }}
                className={cn(
                  "w-full flex items-center gap-2 p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors",
                  isSidebarCollapsed ? "justify-center" : "justify-start",
                )}
                title={isSidebarCollapsed ? "退出登录" : ""}
              >
                <LogOut className="h-4 w-4" />
                {!isSidebarCollapsed && (
                  <span className="text-sm">退出登录</span>
                )}
              </Button>
            </>
          ) : (
            <Link
              to="/admin/auth"
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border border-dashed border-gray-300",
                isSidebarCollapsed ? "justify-center" : "justify-start",
              )}
              title={isSidebarCollapsed ? "点击登录" : ""}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm text-gray-600">点击登录</p>
                </div>
              )}
            </Link>
          )}
        </div>

        {/* 折叠按钮 */}
        <div className="border-t border-gray-200 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            title={isSidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Manager - Hidden on mobile */}
        <div className="hidden lg:block">
          <TabManager />
        </div>

        {/* 顶部导航栏 */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 mt-16 lg:mt-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {menuItems.find((item) => isActiveRoute(item.path))?.label ||
                "系统管理"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* 通知铃铛 */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">3</span>
              </div>
            </div>

          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}

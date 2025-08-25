import React, { ReactNode, useState } from "react";
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
      badge: "12",
    },
    {
      id: "ai-models",
      label: "AI模型管理",
      path: "/admin/ai-models",
      icon: <Bot className="h-5 w-5" />,
      badge: "8",
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
      badge: "NEW",
    },
  ];

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
          </ul>
        </nav>

        {/* 管理员信息 */}
        <div className="border-t border-gray-200 p-3">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer",
              isSidebarCollapsed ? "justify-center" : "justify-start",
            )}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  系统管理员
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@company.com
                </p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <LogOut className="h-4 w-4 text-gray-400" />
            )}
          </div>
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
        {/* 顶部导航栏 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 mt-16 lg:mt-0">
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

            {/* 返回主平台 */}
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                返回主平台
              </Button>
            </Link>
          </div>
        </header>

        {/* 主内容 */}
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

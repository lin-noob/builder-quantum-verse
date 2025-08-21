import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Home,
  Menu,
  X,
  MessageSquare,
  Bot,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
  User,
  Settings,
} from "lucide-react";
import TabManager from "./TabManager";
// import { ThemeToggle } from "./ThemeToggle"; // 已隐藏主题切换功能
import { authService } from "@/services/authService";

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // 监听用户状态变化
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, [location]); // 当路由变化时重新检查用户状态

  // 基础菜单项
  const baseMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "仪表盘",
      path: "/dashboard2",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "users",
      label: "用户画像",
      path: "/users2",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "ai-marketing-scenarios",
      label: "AI营销",
      path: "/ai-marketing/scenarios",
      icon: <Bot className="h-5 w-5" />,
    },
    {
      id: "monitoring-center",
      label: "监控中心",
      path: "/ai-marketing/monitoring-center",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: "effect-tracking",
      label: "效果追踪",
      path: "/effect-tracking",
      icon: <Target className="h-5 w-5" />,
    },
  ];

  // 管理员专用菜单项
  const adminMenuItems: MenuItem[] = [
    {
      id: "admin",
      label: "系统管理",
      path: "/admin",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // 根据用户权限组合菜单
  const menuItems: MenuItem[] = [
    ...baseMenuItems,
    ...(currentUser && currentUser.isAdmin ? adminMenuItems : []),
  ];

  return (
    <div className="flex h-screen bg-background-secondary">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          {/* User Profile Icon */}
          <Link
            to={currentUser ? "/profile" : "/auth"}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              currentUser
                ? "bg-primary hover:bg-primary/90"
                : "bg-gray-200 hover:bg-gray-300 border border-dashed border-gray-400",
            )}
            title={currentUser ? "个人信息" : "点击登录"}
          >
            <User
              className={cn(
                "h-4 w-4",
                currentUser ? "text-primary-foreground" : "text-gray-500",
              )}
            />
          </Link>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AI营销平台</span>
        </div>
        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
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
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.id === "dashboard" && (location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/dashboard2")) ||
                    (item.id === "users" && (location.pathname === "/users" || location.pathname === "/users2" || location.pathname.startsWith("/users/"))) ||
                    (item.id === "response-actions" &&
                      location.pathname.startsWith("/response-actions")) ||
                    (item.id === "ai-marketing-strategies" &&
                      location.pathname.startsWith(
                        "/ai-marketing-strategies",
                      )) ||
                    (item.id === "fully-auto" &&
                      location.pathname.startsWith(
                        "/ai-marketing/fully-auto",
                      )) ||
                    (item.id === "monitoring-center" &&
                      location.pathname.startsWith(
                        "/ai-marketing/monitoring-center",
                      )) ||
                    (item.id === "effect-tracking" &&
                      location.pathname.startsWith("/effect-tracking"));

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
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
                AI营销平台
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.id === "dashboard" && (location.pathname === "/" || location.pathname === "/dashboard" || location.pathname === "/dashboard2")) ||
                (item.id === "users" && (location.pathname === "/users" || location.pathname === "/users2" || location.pathname.startsWith("/users/"))) ||
                (item.id === "response-actions" &&
                  location.pathname.startsWith("/response-actions")) ||
                (item.id === "ai-marketing-strategies" &&
                  location.pathname.startsWith("/ai-marketing-strategies")) ||
                (item.id === "fully-auto" &&
                  location.pathname.startsWith("/ai-marketing/fully-auto")) ||
                (item.id === "monitoring-center" &&
                  location.pathname.startsWith(
                    "/ai-marketing/monitoring-center",
                  )) ||
                (item.id === "effect-tracking" &&
                  location.pathname.startsWith("/effect-tracking"));

              return (
                <li key={item.id} className="relative group">
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-colors relative",
                      isSidebarCollapsed
                        ? "gap-0 px-3 py-2 justify-center"
                        : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {/* AI Marketing Submenu */}
                  {item.id === "ai-marketing" && (
                    <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2">
                        <Link
                          to="/ai-marketing/monitoring-center"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Activity className="h-4 w-4" />
                          监控中心
                        </Link>
                        <Link
                          to="/ai-marketing/fully-auto"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Bot className="h-4 w-4" />
                          全动模式
                        </Link>
                        <Link
                          to="/ai-marketing/semi-auto"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Target className="h-4 w-4" />
                          半自动模式
                        </Link>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          {/* 主题切换 - 已隐��� */}
          {/*
          <div className={cn(
            "flex",
            isSidebarCollapsed ? "justify-center" : "justify-between items-center"
          )}>
            {!isSidebarCollapsed && (
              <span className="text-xs text-muted-foreground">主题模式</span>
            )}
            <ThemeToggle />
          </div>
          */}

          {/* 用户信息 */}
          {currentUser ? (
            <Link
              to="/profile"
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors",
                isSidebarCollapsed ? "justify-center" : "justify-start",
              )}
              title={
                isSidebarCollapsed ? `${currentUser.username} - ��人信息` : ""
              }
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.isAdmin ? "管理员" : "用户"}
                  </p>
                </div>
              )}
              {!isSidebarCollapsed && (
                <Settings className="h-4 w-4 text-gray-400" />
              )}
            </Link>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border border-dashed border-gray-300",
                isSidebarCollapsed ? "justify-center" : "justify-start",
              )}
              title={isSidebarCollapsed ? "点��登录" : ""}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    点击登录
                  </p>
                  <p className="text-xs text-gray-500 truncate">未登录状态</p>
                </div>
              )}
            </Link>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Manager - Hidden on mobile */}
        <div className="hidden lg:block">
          <TabManager />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}

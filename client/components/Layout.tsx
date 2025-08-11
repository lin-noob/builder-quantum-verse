import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Users, Home, Menu, X, MessageSquare, Bot, Target, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import TabManager from './TabManager';

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

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: '仪表盘',
      path: '/dashboard',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'users',
      label: '用户画像',
      path: '/users',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'response-actions',
      label: '响应动作库',
      path: '/response-actions',
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      id: 'ai-marketing',
      label: 'AI自动营销',
      path: '/ai-marketing/monitoring-center',
      icon: <Bot className="h-5 w-5" />
    },
    {
      id: 'dashboard2',
      label: '仪表盘2.0',
      path: '/dashboard2',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'users2',
      label: '用户画像2.0',
      path: '/users2',
      icon: <Users className="h-5 w-5" />
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">CDP Pro</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path ||
                    (item.path === '/dashboard' && location.pathname === '/') ||
                    (item.id === 'ai-marketing' && location.pathname.startsWith('/ai-marketing'));

                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>

                      {/* AI Marketing Sub-links for Mobile */}
                      {item.id === 'ai-marketing' && (
                        <div className="ml-6 mt-2 space-y-1">
                          <Link
                            to="/ai-marketing/strategy-goals"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Target className="h-3 w-3" />
                            战���与目标
                          </Link>
                          <Link
                            to="/ai-marketing/live-monitoring"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <Activity className="h-3 w-3" />
                            实时监控
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className={cn(
        "hidden lg:flex bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out relative",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center px-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden">CDP Pro</span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/dashboard' && location.pathname === '/') ||
                (item.id === 'ai-marketing' && location.pathname.startsWith('/ai-marketing'));

              return (
                <li key={item.id} className="relative group">
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-colors relative",
                      isSidebarCollapsed ? "gap-0 px-3 py-2 justify-center" : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                    )}
                  </Link>

                  {/* AI Marketing Submenu */}
                  {item.id === 'ai-marketing' && (
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
                    全���动模式
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
        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

import { ReactNode, useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Shield,
  ChevronDown,
  LogOut,
  Code,
  Building,
  Check,
  CreditCard,
  HelpCircle,
  Bell,
} from "lucide-react";


import TabManager from "./TabManager";
import { useRoleStore } from "@/stores/roleStore";
import type { ClientMenuApiItem } from "@/services/clientMenuService";
// import { ThemeToggle } from "./ThemeToggle"; // 已隐藏主题切换功能
import { authService } from "@/services/authService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { request } from "@/lib/request";
import useProjectStore from "@/stores/projectStore";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { LanguageSwitcher } from "./LanguageSwitcher";
import MessageCenterDrawer from "@/admin/components/MessageCenterDrawer";
import { mockMessageCenterService as messageCenterService } from "@/admin/services/mockMessageCenterService";

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  subItems?: MenuItem[];
  isSpecial?: boolean;
}

import { getIconByName } from "./IconRenderer";

interface Project {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<string>>(
    new Set(),
  );
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [isDialogClosable, setIsDialogClosable] = useState(true);
  const [dynamicMenuItems, setDynamicMenuItems] = useState<MenuItem[]>([]);
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 从 roleStore 获取 filteredMenus
  const filteredMenus = useRoleStore((state) => state.filteredMenus);

  const [hasInitializedProjects, setHasInitializedProjects] = useState(false);

  // 使用store管理项目状态
  const {
    projects,
    currentProject,
    loading,
    setCurrentProject,
    fetchProjects,
    createProject,
  } = useProjectStore();

  // 处理项目创建
  const handleCreateProject = async (project: { name: string }) => {
    try {
      setShowCreateProjectDialog(false);
      setIsDialogClosable(true);
    } catch (error) {
      console.error("创建项目失败:", error);
    }
  };

  // 检查用户状态并初始化项目数据
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // 如果是非管理员用户，获取项目数据
    if (user && user.usertype !== "admin") {
      fetchProjects().finally(() => {
        setHasInitializedProjects(true);
      });
    } else {
      setHasInitializedProjects(true);
    }
  }, []); // 只在组件挂载时执行

  // 监听 projects 变化，当非管理员用户没有项目时显示创建对话框
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.usertype !== "admin" && hasInitializedProjects) {
      if (projects.length === 0) {
        setShowCreateProjectDialog(true);
        setIsDialogClosable(true);
      } else {
        setShowCreateProjectDialog(false);
      }
    }
  }, [projects, hasInitializedProjects]); // 依赖 projects 和 hasInitializedProjects 状态

  // 获取未读消息数量
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await messageCenterService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("获取未读消息数量失败:", error);
      }
    };

    fetchUnreadCount();
    // 每30秒更新一次未读数量
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // 自动展开包含当前页面的二级菜单
  useEffect(() => {
    const newExpanded = new Set<string>();

    // 检查动态菜单项
    dynamicMenuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const hasActiveChild = item.subItems.some(
          (subItem) =>
            location.pathname === subItem.path ||
            location.pathname.startsWith(subItem.path + "/"),
        );
        if (hasActiveChild) {
          newExpanded.add(item.id);
        }
      }
    });

    // 特殊处理：组织管理菜单
    if (location.pathname.startsWith("/organization/")) {
      newExpanded.add("system-management");
    }

    setExpandedMenuItems(newExpanded);
  }, [location.pathname, dynamicMenuItems]);

  // Dashboard2 作为静态菜单项
  const baseMenuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "dashboard2",
        label: "仪表盘",
        path: "/dashboard2",
        icon: <BarChart3 className="h-5 w-5" />,
      },
    ],
    [],
  );

  // 管理员菜单也设置为空，完全依赖动态菜单
  const adminMenuItems: MenuItem[] = useMemo(() => [], []);

  // 使用 roleStore 中的 filteredMenus 构建动态菜单
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || filteredMenus.length === 0) {
      setDynamicMenuItems([]);
      return;
    }

    const buildDynamic = (menus: ClientMenuApiItem[]): MenuItem[] => {
      const result: MenuItem[] = [];

      const add = (m: ClientMenuApiItem, level = 0) => {
        if (m.hidden) return;

        const label = (m.meta?.title as string) || m.name || m.path;
        if (!label) return;

        // 如果没有 component 但有 children，则作为二级菜单处理
        if (!m.component && m.children && m.children.length > 0) {
          const subItems: MenuItem[] = [];
          m.children.forEach((child) => {
            if (!child.hidden && child.path) {
              const childLabel =
                (child.meta?.title as string) || child.name || child.path;
              if (childLabel) {
                subItems.push({
                  id: `dyn-${child.path}`,
                  label: childLabel,
                  path: child.path,
                  icon: getIconByName(child.meta?.icon),
                });
              }
            }
          });

          // 如果有有效的子菜单，添加二级菜单
          if (subItems.length > 0) {
            result.push({
              id: `dyn-parent-${m.name}`,
              label,
              path: m.path || `#${m.name}`, // 如果没有path，使用锚点
              icon: getIconByName(m.meta?.icon),
              subItems: subItems.sort((a, b) => {
                const aSort =
                  m.children?.find((c) => c.path === a.path)?.sort ?? 0;
                const bSort =
                  m.children?.find((c) => c.path === b.path)?.sort ?? 0;
                return aSort - bSort;
              }),
            });
          }
        }
        // 普通菜单项（有 component 或没有 children）
        else if (m.path) {
          result.push({
            id: `dyn-${m.path}`,
            label,
            path: m.path,
            icon: getIconByName(m.meta?.icon),
          });
        }

        // 如果有 component 且有 children，也处理子菜单（深层嵌套）
        if (m.component && m.children && m.children.length > 0) {
          m.children.forEach((child) => add(child, level + 1));
        }
      };

      menus.forEach((menu) => add(menu));
      return result.sort((a, b) => {
        const aSort =
          menus.find(
            (m) =>
              m.path === a.path || m.name === a.id.replace("dyn-parent-", ""),
          )?.sort ?? 0;
        const bSort =
          menus.find(
            (m) =>
              m.path === b.path || m.name === b.id.replace("dyn-parent-", ""),
          )?.sort ?? 0;
        return aSort - bSort;
      });
    };

    const items = buildDynamic(filteredMenus);
    setDynamicMenuItems(items);
  }, [filteredMenus]); // 依赖 filteredMenus 而不是重新获取

  // 合并静态菜单和动态菜单，静态菜单在前
  const menuItems: MenuItem[] = useMemo(() => {
    return [...dynamicMenuItems];
  }, [dynamicMenuItems]);

  function changeProject(project: Project) {
    setCurrentProject(project);
    navigate(0);
  }

  return (
    <div className="flex h-screen bg-background-secondary">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          {/* User Profile Dropdown */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 p-1 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  title="个人信息"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentProject?.name || "未选择项目"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* Project Selector - 二级菜单形式 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>项目列表</span>
                    {currentProject && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {currentProject.name}
                      </span>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          setCurrentProject(project);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span>{project.name}</span>
                        </div>
                        {currentProject?.id === project.id && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/projects"
                        className="flex items-center gap-2 cursor-pointer text-primary"
                      >
                        <Settings className="h-3 w-3" />
                        <span>项目管理</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to="/account/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    个人设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={() => {
                    authService.logout();
                    window.location.href = "/auth";
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-gray-200 hover:bg-gray-300 border border-dashed border-gray-400"
              title="点击登录"
            >
              <User className="h-4 w-4 text-gray-500" />
            </Link>
          )}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AI营销平台</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 多语言切换 */}
          <LanguageSwitcher />

          {/* Message Center Button */}
          <button
            onClick={() => setIsMessageCenterOpen(true)}
            className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="消息中心"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Help Icon */}
          <Link
            to="/marketing/help"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            title="帮助中心"
          >
            <HelpCircle className="h-5 w-5" />
          </Link>
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
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.id}>
                      {/* 动态二级菜单或静态二级菜单 */}
                      {item.subItems && item.subItems.length > 0 ? (
                        <div>
                          <button
                            onClick={() => {
                              // 切换当前菜单项的展开状态
                              setExpandedMenuItems((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(item.id)) {
                                  newSet.delete(item.id);
                                } else {
                                  newSet.add(item.id);
                                }
                                return newSet;
                              });
                            }}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              {item.label}
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedMenuItems.has(item.id)
                                  ? "rotate-180"
                                  : "",
                              )}
                            />
                          </button>

                          {/* 二级菜单 */}
                          {expandedMenuItems.has(item.id) && item.subItems && (
                            <div className="mt-1 ml-6 space-y-1 max-h-60 overflow-y-auto">
                              {item.subItems.map((subItem) => {
                                const subIsActive =
                                  location.pathname === subItem.path ||
                                  location.pathname.startsWith(
                                    subItem.path + "/",
                                  );

                                return (
                                  <Link
                                    key={subItem.id}
                                    to={subItem.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                                      subIsActive
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                    )}
                                  >
                                    {subItem.icon || (
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                      </div>
                                    )}
                                    {subItem.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* 普通菜单项 */
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            /* 特殊样式处理 */
                            item.isSpecial
                              ? isActive
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200"
                              : isActive
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
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
      <div
        className={cn(
          "hidden lg:flex bg-card border-r border-border flex-col transition-all duration-300 ease-in-out relative",
          isSidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* User Profile and Project Section */}
        <div className="border-b border-gray-200 p-3 space-y-3">
          {/* User Information */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors w-full",
                    isSidebarCollapsed ? "justify-center" : "justify-start",
                  )}
                  title={
                    isSidebarCollapsed
                      ? `${currentUser.username} - 个人信息`
                      : ""
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
                      {currentProject && (
                        <p className="text-xs text-primary truncate">
                          {currentProject.name}
                        </p>
                      )}
                    </div>
                  )}
                  {!isSidebarCollapsed && (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isSidebarCollapsed ? "start" : "end"}
                className="w-64"
              >
                {/* Project Selector - 二级菜单形式 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>项目列表</span>
                    {currentProject && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {currentProject.name}
                      </span>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => changeProject(project)}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3" />
                          <span>{project.name}</span>
                        </div>
                        {currentProject?.id === project.id && (
                          <Check className="h-3 w-3 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/projects"
                        className="flex items-center gap-2 cursor-pointer text-primary"
                      >
                        <Settings className="h-3 w-3" />
                        <span>项目管理</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to="/account/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    个人设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={() => {
                    authService.logout();
                    window.location.href = "/auth";
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    点击登录
                  </p>
                  <p className="text-xs text-gray-500 truncate">未登录状态</p>
                </div>
              )}
            </Link>
          )}

          {/* Logo - Only show when sidebar is collapsed */}
          {isSidebarCollapsed && (
            <div className="h-16 flex items-center justify-center px-3 border-t border-gray-200 mt-3 pt-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.id === "dashboard2" &&
                  (location.pathname === "/" ||
                    location.pathname === "/dashboard2")) ||
                // 对于动态菜单项，只需要简单的路径匹配
                location.pathname.startsWith(item.path + "/");

              return (
                <li key={item.id} className="relative group">
                  {/* 动态二级菜单或静态二级菜单（包含子菜单项） */}
                  {item.subItems && item.subItems.length > 0 ? (
                    <div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // 切换当前菜单项的展开状态
                          setExpandedMenuItems((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(item.id)) {
                              newSet.delete(item.id);
                            } else {
                              newSet.add(item.id);
                            }
                            return newSet;
                          });
                        }}
                        className={cn(
                          "w-full flex items-center rounded-lg text-sm font-medium transition-colors relative",
                          isSidebarCollapsed
                            ? "gap-0 px-3 py-2 justify-center"
                            : "gap-3 px-3 py-2 justify-between",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                        )}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {!isSidebarCollapsed && (
                            <span className="whitespace-nowrap overflow-hidden">
                              {item.label}
                            </span>
                          )}
                        </div>
                        {!isSidebarCollapsed && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedMenuItems.has(item.id)
                                ? "rotate-180"
                                : "",
                            )}
                          />
                        )}
                      </button>

                      {/* 二级菜单 */}
                      {!isSidebarCollapsed &&
                        expandedMenuItems.has(item.id) &&
                        item.subItems && (
                          <div className="mt-1 ml-6 space-y-1 max-h-60 overflow-y-auto">
                            {item.subItems.map((subItem) => {
                              const subIsActive =
                                location.pathname === subItem.path ||
                                location.pathname.startsWith(
                                  subItem.path + "/",
                                );

                              return (
                                <Link
                                  key={subItem.id}
                                  to={subItem.path}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                                    subIsActive
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                                  )}
                                >
                                  {subItem.icon || (
                                    <div className="w-4 h-4 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                    </div>
                                  )}
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                      {/* 项目管理或系统管理悬浮二级菜单 - 仅在折���状态下显示 */}
                      {isSidebarCollapsed && item.subItems && (
                        <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="p-2 max-h-60 overflow-y-auto">
                            {item.subItems.map((subItem) => {
                              const subIsActive =
                                location.pathname === subItem.path ||
                                location.pathname.startsWith(
                                  subItem.path + "/",
                                );

                              return (
                                <Link
                                  key={subItem.id}
                                  to={subItem.path}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                                    subIsActive
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                                  )}
                                >
                                  {subItem.icon || (
                                    <div className="w-4 h-4 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                    </div>
                                  )}
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 普通菜单项 */
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium transition-colors relative",
                        isSidebarCollapsed
                          ? "gap-0 px-3 py-2 justify-center"
                          : "gap-3 px-3 py-2",
                        /* 特殊样式处理 */
                        item.isSpecial
                          ? isActive
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200"
                          : isActive
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
                  )}

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

        {/* Message Center and Help Links */}
        <div className="border-t border-gray-200 p-2 space-y-1">
          {/* Message Center Button */}
          <button
            onClick={() => setIsMessageCenterOpen(true)}
            className={cn(
              "w-full flex items-center rounded-lg text-sm font-medium transition-colors relative",
              isSidebarCollapsed
                ? "gap-0 px-3 py-2 justify-center"
                : "gap-3 px-3 py-2",
              "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
            title={isSidebarCollapsed ? "消息中心" : undefined}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                消息中心
              </span>
            )}
          </button>

          {/* Help Center Link */}
          <a
            href="/marketing/help"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors relative",
              isSidebarCollapsed
                ? "gap-0 px-3 py-2 justify-center"
                : "gap-3 px-3 py-2",
              "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
            )}
            title={isSidebarCollapsed ? "帮助中心" : undefined}
          >
            <HelpCircle className="h-5 w-5" />
            {!isSidebarCollapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                帮助中心
              </span>
            )}
          </a>
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

      {/* 创建项目弹框 - 当没有项目时强制显示 */}
      {showCreateProjectDialog && (
        <CreateProjectDialog
          open={showCreateProjectDialog}
          onOpenChange={(open) => {
            if (isDialogClosable) {
              setShowCreateProjectDialog(open);
            }
          }}
          onProjectCreate={handleCreateProject}
          closable={isDialogClosable}
        />
      )}

      {/* 消息中心抽屉 */}
      <MessageCenterDrawer
        open={isMessageCenterOpen}
        onOpenChange={setIsMessageCenterOpen}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}

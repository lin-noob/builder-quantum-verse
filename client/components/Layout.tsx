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
} from "lucide-react";
import TabManager from "./TabManager";
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
import useProjectStore from "@/store/projectStore";
import { CreateProjectDialog } from "./CreateProjectDialog";

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
  const [isSystemManagementExpanded, setIsSystemManagementExpanded] =
    useState(false);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [isDialogClosable, setIsDialogClosable] = useState(true);

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

  // 只在组件挂载时检查用户状态和获取项目
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // 如果用户已登录，获取项目列表
    if (user) {
      fetchProjects()
        .then(() => {
          // 检查是否需要显示创建项目对话框
          const currentProjects = useProjectStore.getState().projects;
          if (currentProjects.length === 0) {
            setShowCreateProjectDialog(true);
            setIsDialogClosable(false);
          }
        })
        .catch(() => {
          // 如果获取失败且没有缓存的项目，显示创建项目弹框
          if (projects.length === 0) {
            setShowCreateProjectDialog(true);
            setIsDialogClosable(false);
          }
        });
    }
  }, []); // 移除location依赖，避免每次路由切换都重新检查

  // 自动展开系统管理菜单 - 只在初始化或从其他页面导航到组织页面时展开
  useEffect(() => {
    const shouldExpand = location.pathname.startsWith("/organization/");
    // 只在应该展开但当前未展开时才自动展开
    if (shouldExpand && !isSystemManagementExpanded) {
      setIsSystemManagementExpanded(true);
    }
  }, [location.pathname]);

  // 基础菜单项 - 使用useMemo缓存，避免重复创建
  const baseMenuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "仪表盘",
        path: "/dashboard2",
        icon: <BarChart3 className="h-5 w-5" />,
      },
      // {
      //   id: "dashboard1",
      //   label: "仪表盘 1.0",
      //   path: "/dashboard1",
      //   icon: <Home className="h-5 w-5" />,
      // },
      // {
      //   id: "users",
      //   label: "用户画像",
      //   path: "/users2",
      //   icon: <Users className="h-5 w-5" />,
      // },
      {
        id: "users1",
        label: "用户画像 1.0",
        path: "/users1",
        icon: <User className="h-5 w-5" />,
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
      // {
      //   id: "sdk",
      //   label: "开发者工具",
      //   path: "/sdk",
      //   icon: <Zap className="h-5 w-5" />,
      // },
    ],
    [],
  );

  // 管理员专用菜单项 - 使用useMemo缓存，避免重复创建
  const adminMenuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "system-management",
        label: "系统管理",
        path: "/organization/members", // 默认跳转到成员管理
        icon: <Settings className="h-5 w-5" />,
        subItems: [
          {
            id: "organization-members",
            label: "成员管理",
            path: "/organization/members",
            icon: <Users className="h-5 w-5" />,
          },
          {
            id: "organization-settings",
            label: "组织设置",
            path: "/organization/settings",
            icon: <Settings className="h-5 w-5" />,
          },
        ],
      },
      // {
      //   id: "admin",
      //   label: "管理后台入口（临时）",
      //   path: "/admin",
      //   icon: <Shield className="h-5 w-5" />,
      //   isSpecial: true,
      // },
    ],
    [],
  );

  // 根据用户权限组合菜单 - 使用useMemo缓存，只在用户状态变化时重新计算
  const menuItems: MenuItem[] = useMemo(
    () => [
      ...baseMenuItems,
      ...(currentUser && currentUser.isAdmin ? adminMenuItems : []),
    ],
    [baseMenuItems, adminMenuItems, currentUser],
  );

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
                    (item.id === "dashboard" &&
                      (location.pathname === "/" ||
                        location.pathname === "/dashboard" ||
                        location.pathname === "/dashboard2")) ||
                    (item.id === "dashboard1" &&
                      location.pathname === "/dashboard1") ||
                    (item.id === "users" &&
                      (location.pathname === "/users" ||
                        location.pathname === "/users2" ||
                        location.pathname.startsWith("/users2/"))) ||
                    (item.id === "users1" &&
                      (location.pathname === "/users1" ||
                        location.pathname.startsWith("/users1/"))) ||
                    (item.id === "projects" &&
                      (location.pathname === "/projects" ||
                        location.pathname.startsWith("/projects/"))) ||
                    (item.id === "ai-marketing-scenarios" &&
                      location.pathname.startsWith(
                        "/ai-marketing/scenarios",
                      )) ||
                    (item.id === "monitoring-center" &&
                      location.pathname.startsWith(
                        "/ai-marketing/monitoring-center",
                      )) ||
                    (item.id === "effect-tracking" &&
                      location.pathname.startsWith("/effect-tracking")) ||
                    (item.id === "sdk" &&
                      location.pathname.startsWith("/sdk")) ||
                    (item.id === "admin" &&
                      location.pathname.startsWith("/admin")) ||
                    (item.id === "system-management" &&
                      (location.pathname.startsWith("/organization/members") ||
                        location.pathname.startsWith(
                          "/organization/settings",
                        )));

                  return (
                    <li key={item.id}>
                      {/* 项目管理菜单或系统管理菜单 */}
                      {item.id === "projects" ||
                      item.id === "system-management" ? (
                        <div>
                          <button
                            onClick={() =>
                              item.id === "system-management" &&
                              setIsSystemManagementExpanded(
                                !isSystemManagementExpanded,
                              )
                            }
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
                                item.id === "system-management" &&
                                  isSystemManagementExpanded
                                  ? "rotate-180"
                                  : "",
                              )}
                            />
                          </button>

                          {/* 二级菜单 */}
                          {(item.id === "system-management" &&
                            isSystemManagementExpanded) ||
                            (item.id === "projects" && item.subItems && (
                              <div className="mt-1 ml-6 space-y-1 max-h-60 overflow-y-auto">
                                {item.subItems.map((subItem) => {
                                  const subIsActive =
                                    location.pathname === subItem.path ||
                                    (item.id === "projects" &&
                                      location.pathname.startsWith(
                                        `/projects/${subItem.id.split("-")[1]}`,
                                      )) ||
                                    (subItem.id === "organization-members" &&
                                      location.pathname.startsWith(
                                        "/organization/members",
                                      )) ||
                                    (subItem.id === "organization-settings" &&
                                      location.pathname.startsWith(
                                        "/organization/settings",
                                      ));

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
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                      </div>
                                      {subItem.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            ))}
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
                (item.id === "dashboard" &&
                  (location.pathname === "/" ||
                    location.pathname === "/dashboard" ||
                    location.pathname === "/dashboard2")) ||
                (item.id === "dashboard1" &&
                  location.pathname === "/dashboard1") ||
                (item.id === "users" &&
                  (location.pathname === "/users" ||
                    location.pathname === "/users2" ||
                    location.pathname.startsWith("/users2/"))) ||
                (item.id === "users1" &&
                  (location.pathname === "/users1" ||
                    location.pathname.startsWith("/users1/"))) ||
                (item.id === "ai-marketing-scenarios" &&
                  location.pathname.startsWith("/ai-marketing/scenarios")) ||
                (item.id === "monitoring-center" &&
                  location.pathname.startsWith(
                    "/ai-marketing/monitoring-center",
                  )) ||
                (item.id === "effect-tracking" &&
                  location.pathname.startsWith("/effect-tracking")) ||
                (item.id === "sdk" && location.pathname.startsWith("/sdk")) ||
                (item.id === "admin" &&
                  location.pathname.startsWith("/admin")) ||
                (item.id === "system-management" &&
                  (location.pathname.startsWith("/organization/members") ||
                    location.pathname.startsWith("/organization/settings")));

              return (
                <li key={item.id} className="relative group">
                  {/* 项目管理菜单或系统管理菜单（包含二级菜单） */}
                  {item.id === "projects" || item.id === "system-management" ? (
                    <div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (item.id === "system-management") {
                            setIsSystemManagementExpanded((prev) => !prev);
                          }
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
                        {!isSidebarCollapsed &&
                          item.id === "system-management" && (
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                isSystemManagementExpanded ? "rotate-180" : "",
                              )}
                            />
                          )}
                      </button>

                      {/* 二级菜单 */}
                      {!isSidebarCollapsed &&
                        ((item.id === "system-management" &&
                          isSystemManagementExpanded) ||
                          item.id === "projects") &&
                        item.subItems && (
                          <div className="mt-1 ml-6 space-y-1 max-h-60 overflow-y-auto">
                            {item.subItems.map((subItem) => {
                              const subIsActive =
                                location.pathname === subItem.path ||
                                (item.id === "projects" &&
                                  location.pathname.startsWith(
                                    `/projects/${subItem.id.split("-")[1]}`,
                                  )) ||
                                (subItem.id === "organization-members" &&
                                  location.pathname.startsWith(
                                    "/organization/members",
                                  )) ||
                                (subItem.id === "organization-settings" &&
                                  location.pathname.startsWith(
                                    "/organization/settings",
                                  ));

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
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                  </div>
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                      {/* 项目管理或系统管理悬浮二级菜单 - 仅在折叠状态下显示 */}
                      {isSidebarCollapsed && item.subItems && (
                        <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="p-2 max-h-60 overflow-y-auto">
                            {item.subItems.map((subItem) => {
                              const subIsActive =
                                location.pathname === subItem.path ||
                                (item.id === "projects" &&
                                  location.pathname.startsWith(
                                    `/projects/${subItem.id.split("-")[1]}`,
                                  )) ||
                                (subItem.id === "organization-members" &&
                                  location.pathname.startsWith(
                                    "/organization/members",
                                  )) ||
                                (subItem.id === "organization-settings" &&
                                  location.pathname.startsWith(
                                    "/organization/settings",
                                  ));

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
                                  {subItem.icon}
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
    </div>
  );
}

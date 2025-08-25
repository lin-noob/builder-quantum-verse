import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, Home } from "lucide-react";

interface Tab {
  id: string;
  title: string;
  path: string;
  isHome?: boolean;
  isActive?: boolean;
}

interface ContextMenu {
  isOpen: boolean;
  x: number;
  y: number;
  targetTab: Tab | null;
}

export default function TabManager() {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路径动态设置首页
  const getDefaultTabs = (): Tab[] => {
    const isAdminPlatform = location.pathname.startsWith('/admin');
    return [
      {
        id: "home",
        title: isAdminPlatform ? "系统概览" : "首页",
        path: isAdminPlatform ? "/admin" : "/dashboard",
        isHome: true,
        isActive: true,
      },
    ];
  };

  const [tabs, setTabs] = useState<Tab[]>(getDefaultTabs());
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    isOpen: false,
    x: 0,
    y: 0,
    targetTab: null,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // 监听路径变化，更新首页标签
  useEffect(() => {
    const isAdminPlatform = location.pathname.startsWith('/admin');
    const homePath = isAdminPlatform ? "/admin" : "/dashboard";
    const homeTitle = isAdminPlatform ? "系统概览" : "首页";

    setTabs(prevTabs => {
      const updatedTabs = prevTabs.map(tab => {
        if (tab.isHome) {
          return {
            ...tab,
            path: homePath,
            title: homeTitle,
          };
        }
        return tab;
      });
      return updatedTabs;
    });
  }, [location.pathname]);

  // 页面路��到标题的映射
  const pathToTitle = {
    "/dashboard": "仪表盘",
    "/": "仪表盘",
    "/dashboard2": "仪表盘",
    "/admin": "系统概览",
    "/users": "用户画像",
    "/users2": "用户画像",
    "/response-actions": "响应动作库",
    "/ai-marketing-strategies": "营销策略",
    "/ai-marketing/monitoring-center": "监控中心",
    "/ai-marketing/fully-auto": "全自动营销",
    "/ai-marketing/semi-auto": "半自动模式",
    "/ai-marketing/semi-auto/create": "创建剧本",
    "/ai-marketing/strategy-goals": "战略与目标",
    "/ai-marketing/live-monitoring": "实时监控",
    "/ai-marketing/performance-analytics": "效果分析",
    "/ai-marketing/scenarios": "AI营销场景",
    "/ai-marketing/scenarios/add_to_cart": "加入购物车",
    "/ai-marketing/scenarios/view_product": "查看商品",
    "/ai-marketing/scenarios/user_signup": "用户注册",
    "/ai-marketing/scenarios/user_login": "用户登录",
    "/effect-tracking": "效果追踪",
    "/account/settings": "个人设置",
    // 组织管理页面
    "/organization/members": "成员管理",
    "/organization/settings": "组织设置",
    // 管理后台页面
    "/admin": "系统概览",
    "/admin/organizations": "组织管理",
    "/admin/ai-models": "AI模型管理",
    "/admin/scenarios": "场景配置",
    "/admin/data-sources": "数据源管理",
    "/admin/security": "安全与权限",
    "/admin/monitoring": "系统监控",
    "/admin/users": "用户管理",
  };

  // 检查滚动状态
  const checkScrollStatus = useCallback(() => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    }
  }, []);

  // 滚动标签页
  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 监听路由变化，自动添加或切换标签页
  useEffect(() => {
    const currentPath = location.pathname;
    const existingTab = tabs.find((tab) => tab.path === currentPath);

    if (existingTab) {
      // 如果标签页已存在，切换到该标签页
      setTabs((prev) =>
        prev.map((tab) => ({
          ...tab,
          isActive: tab.id === existingTab.id,
        })),
      );
    } else {
      // 如果标��页不存在，创建新标签页
      let title = pathToTitle[currentPath as keyof typeof pathToTitle];

      // 如果没有预定义标题，尝试从路径生成友好的标题
      if (!title) {
        if (
          currentPath.includes("/users/") ||
          currentPath.includes("/users2/")
        ) {
          title = "用户详情";
        } else if (currentPath.includes("/response-actions/")) {
          if (currentPath.includes("/create")) {
            title = "创建响应动作";
          } else if (currentPath.includes("/edit/")) {
            title = "编辑响应动作";
          } else {
            title = "响应动作详情";
          }
        } else if (currentPath.includes("/ai-marketing-strategies/")) {
          if (currentPath.includes("/create")) {
            title = "创建营销策略";
          } else if (currentPath.includes("/edit/")) {
            title = "编辑营销策略";
          } else {
            title = "营销策略详情";
          }
        } else if (currentPath.includes("/ai-marketing/scenarios/")) {
          // 处理AI营销场景的动态路��
          const scenarioId = currentPath.split("/").pop();
          const scenarioNames = {
            add_to_cart: "加入购物车",
            view_product: "查看商品",
            user_signup: "用户注册",
            user_login: "用户登录",
            start_checkout: "开始结账",
            purchase: "完成购买",
            search: "��行搜索",
            exit_intent: "离开意图",
          };
          title =
            scenarioNames[scenarioId as keyof typeof scenarioNames] ||
            "AI营销场景";
        } else if (currentPath.includes("/response-actions")) {
          title = "响应动作库";
        } else if (currentPath.includes("/ai-marketing-strategies")) {
          title = "营销策略";
        } else if (currentPath.includes("/ai-marketing")) {
          title = "AI营销";
        } else {
          // 默认使用路径最后一部分作为标题，但尝试转换为中文
          const pathParts = currentPath.split("/").filter(Boolean);
          const lastPart = pathParts[pathParts.length - 1] || "页面";

          // ��单的英文到中文映射
          const englishToChinese = {
            scenarios: "场景列表",
            monitoring: "监控",
            analytics: "分析",
            strategies: "策略",
            dashboard: "仪表盘",
            organizations: "组织管理",
            models: "模型管理",
            users: "用户管理",
            security: "安全权限",
            config: "系统配置",
            admin: "管理后台",
            ai: "AI管理",
            data: "数据管理",
            members: "成员管理",
            settings: "组织设置",
          };

          title =
            englishToChinese[lastPart as keyof typeof englishToChinese] ||
            lastPart;
        }
      }

      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title,
        path: currentPath,
        isActive: true,
      };

      setTabs((prev) => [
        ...prev.map((tab) => ({ ...tab, isActive: false })),
        newTab,
      ]);
    }
  }, [location.pathname]);

  // 监听容器滚动
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container) {
      checkScrollStatus();
      container.addEventListener("scroll", checkScrollStatus);
      return () => container.removeEventListener("scroll", checkScrollStatus);
    }
  }, [checkScrollStatus]);

  // 监听窗口大小变化
  useEffect(() => {
    window.addEventListener("resize", checkScrollStatus);
    return () => window.removeEventListener("resize", checkScrollStatus);
  }, [checkScrollStatus]);

  // 点击标签页
  const handleTabClick = (tab: Tab) => {
    setTabs((prev) => prev.map((t) => ({ ...t, isActive: t.id === tab.id })));
    navigate(tab.path);
  };

  // ���闭标签页
  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const tabToClose = tabs.find((tab) => tab.id === tabId);
    if (!tabToClose || tabToClose.isHome) return;

    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    // 如果关闭的是激活标签页，需要切换到其他标签页
    if (tabToClose.isActive && newTabs.length > 0) {
      let nextActiveTab;
      // 优先切换到左侧标签页
      if (tabIndex > 0) {
        nextActiveTab = newTabs[tabIndex - 1];
      } else {
        nextActiveTab = newTabs[0];
      }

      nextActiveTab.isActive = true;
      navigate(nextActiveTab.path);
    }

    setTabs(newTabs);
  };

  // 刷新当前标签页
  const refreshCurrentTab = () => {
    window.location.reload();
  };

  // 关闭其他标签页
  const closeOtherTabs = () => {
    const activeTab = tabs.find((tab) => tab.isActive);
    const homeTabs = tabs.filter((tab) => tab.isHome);

    if (activeTab) {
      const newTabs = activeTab.isHome ? homeTabs : [...homeTabs, activeTab];
      setTabs(newTabs);
    }
  };

  // 关闭所有标签页（除首页）
  const closeAllTabs = () => {
    const homeTabs = tabs.filter((tab) => tab.isHome);
    setTabs(homeTabs.map((tab) => ({ ...tab, isActive: true })));
    navigate("/dashboard");
  };

  // 关闭右侧标签页
  const closeRightTabs = (targetTabId: string) => {
    const targetIndex = tabs.findIndex((tab) => tab.id === targetTabId);
    const newTabs = tabs.slice(0, targetIndex + 1);
    setTabs(newTabs);
  };

  // 右键菜单
  const handleContextMenu = (e: React.MouseEvent, tab: Tab) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      targetTab: tab,
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, targetTab: null });
  };

  // 点击页面其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.isOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [contextMenu.isOpen]);

  return (
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center relative">
      {/* 左侧滚动箭头 */}
      {canScrollLeft && (
        <button
          onClick={() => scrollTabs("left")}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* 标签页容器 */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-0 px-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all group min-w-0",
                "border-r border-gray-200 last:border-r-0",
                tab.isActive
                  ? "bg-white text-gray-900 font-semibold border-t-2 border-t-blue-500"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
              onClick={() => handleTabClick(tab)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
            >
              {/* 标签页图标 */}
              {tab.isHome && <Home className="h-3 w-3 flex-shrink-0" />}

              {/* 标签页标题 */}
              <span className="truncate max-w-32">{tab.title}</span>

              {/* 关闭按钮 */}
              {!tab.isHome && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧滚动箭头 */}
      {canScrollRight && (
        <button
          onClick={() => scrollTabs("right")}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* 右键菜单 */}
      {contextMenu.isOpen && contextMenu.targetTab && (
        <div
          className="fixed bg-white border border-gray-200 rounded shadow-lg py-1 z-50 w-20"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              refreshCurrentTab();
              closeContextMenu();
            }}
          >
            刷新
          </button>
          {!contextMenu.targetTab.isHome && (
            <button
              className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                closeTab(contextMenu.targetTab!.id);
                closeContextMenu();
              }}
            >
              关闭
            </button>
          )}
          <button
            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => {
              closeOtherTabs();
              closeContextMenu();
            }}
          >
            关闭其他
          </button>
        </div>
      )}
    </div>
  );
}

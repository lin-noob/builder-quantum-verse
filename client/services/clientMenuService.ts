import { request } from "@/lib/request";
import { useRoleStore } from "@/stores/roleStore";

export interface ClientMenuMeta {
  title: string;
  icon?: string;
  permissions?: string[];
  [key: string]: any;
}

export interface ClientMenuApiItem {
  name: string;
  path: string;
  component?: string;
  redirect?: string;
  hidden?: boolean;
  meta?: ClientMenuMeta;
  permissions?: string[];
  sort?: number;
  children?: ClientMenuApiItem[];
}

export interface ClientMenuApiResponse {
  code?: string | number;
  msg?: string;
  data?: ClientMenuApiItem[];
}

async function fetchMenusFrom(path: string): Promise<ClientMenuApiItem[]> {
  try {
    const res = await request.get<ClientMenuApiResponse>(path);
    const payload = res.data as ClientMenuApiResponse;
    
    if (Array.isArray(payload)) {
      return payload as unknown as ClientMenuApiItem[];
    }
    
    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }
    
    return [];
  } catch (error) {
    console.error('Failed to fetch menus from:', path, error);
    return [];
  }
}

export async function fetchClientMenus(): Promise<ClientMenuApiItem[]> {
  const menuPath = "/api/admin/api/v1/menus/new/route";
  const menus = await fetchMenusFrom(menuPath);
  
  // 提取权限码并设置到store
  if (menus.length > 0 && menus[0]?.meta?.permissions) {
    const permissions = menus[0].meta.permissions;
    const { setPermissions } = useRoleStore.getState();
    setPermissions(permissions);
  }
  
  return menus;
}

export function filterClientMenus(menus: ClientMenuApiItem[]): ClientMenuApiItem[] {
  const result: ClientMenuApiItem[] = [];
  
  const processMenu = (menu: ClientMenuApiItem): ClientMenuApiItem | null => {
    // 排除隐藏的菜单
    if (menu.hidden) {
      return null;
    }
    
    const processedMenu: ClientMenuApiItem = {
      ...menu,
      children: []
    };
    
    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      const validChildren = menu.children
        .map(child => processMenu(child))
        .filter(Boolean) as ClientMenuApiItem[];
      
      processedMenu.children = validChildren;
    }
    
    return processedMenu;
  };
  
  for (const menu of menus) {
    const processedMenu = processMenu(menu);
    if (processedMenu) {
      result.push(processedMenu);
    }
  }
  
  // 按 sort 字段排序
  return result.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

export function flattenClientMenus(menus: ClientMenuApiItem[]): ClientMenuApiItem[] {
  const result: ClientMenuApiItem[] = [];
  
  const walk = (nodes: ClientMenuApiItem[]) => {
    for (const node of nodes) {
      if (!node.hidden && node.path) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  };
  
  walk(menus);
  return result.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}
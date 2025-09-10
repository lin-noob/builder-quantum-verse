import { request } from "@/lib/request";

export interface AdminMenuMeta {
  title: string;
  icon?: string;
  [key: string]: any;
}

export interface AdminMenuApiItem {
  name: string;
  path: string; // e.g. "/admin" or "/admin/menus"
  component?: string; // e.g. "/client/admin/pages/AdminDashboard.tsx"
  redirect?: string;
  hidden?: boolean;
  meta?: AdminMenuMeta;
  permissions?: string[];
  sort?: number;
  children?: AdminMenuApiItem[];
}

export interface AdminMenuApiResponse {
  code?: string | number;
  msg?: string;
  data?: AdminMenuApiItem[];
}

async function fetchMenusFrom(path: string) {
  const res = await request.get<AdminMenuApiResponse>(path);
  const payload = res.data as AdminMenuApiResponse;
  if (Array.isArray(payload)) {
    // Some APIs may return array directly
    return payload as unknown as AdminMenuApiItem[];
  }
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  // Defensive: if data field not present but res.data is array
  return [] as AdminMenuApiItem[];
}

export async function fetchAdminMenus(): Promise<AdminMenuApiItem[]> {
  // Prefer the pattern used across the project, but try the user-provided path as fallback
  const primary = "/api/admin/api/v1/menus/new/route";
  try {
    return await fetchMenusFrom(primary);
  } catch (_e) {
    return [];
  }
}

export function flattenVisibleMenus(
  menus: AdminMenuApiItem[],
): AdminMenuApiItem[] {
  const result: AdminMenuApiItem[] = [];
  const walk = (nodes?: AdminMenuApiItem[]) => {
    if (!nodes) return;
    for (const n of nodes) {
      if (!n.hidden) result.push(n);
      if (n.children && n.children.length) walk(n.children);
    }
  };
  walk(menus);
  // Sort by sort field when present
  return result.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

import { ApiResponse } from "./../../../shared/organizationData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { request } from "@/lib/request";

interface FieldPermission {
  id: string;
  name: string;
  description: string;
  view: boolean;
  edit: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  menuIds: string[]; // 改为 number[] 类型以匹配菜单 ID
  permissionIds: string[];
  type: string;
  shopId?: string;
  // 以下���段用于前端显示，可能需要从 API 数据转换
  permissions?: string[];
  fieldPermissions?: Record<string, FieldPermission[]>;
}

// 定义 API 响应结构
export interface RoleListResponse {
  code: string;
  data: Role[];
  msg: string;
  total: number;
}

// 定义请求参数
export interface RoleListParams {
  page: number;
  limit: number;
  name?: string;
}

// 获取角色列表
export const fetchRoles = async (params: any): Promise<RoleListResponse> => {
  const data = (
    await request.get<RoleListResponse>("/admin/api/v1/roles/page", params)
  ).data;
  return data;
};

// 删除角色
export const deleteRole = async (id: string): Promise<RoleListResponse> => {
  return (await request.delete<RoleListResponse>(`/admin/api/v1/roles/${id}`))
    .data;
};

// 创建角色
export const createRole = async (roleData: {
  name: string;
}): Promise<RoleListResponse> => {
  return (await request.post<RoleListResponse>("/admin/api/v1/roles", roleData))
    .data;
};

// 更新角色
export const updateRole = async (
  id: string,
  roleData: Partial<Role>,
): Promise<RoleListResponse> => {
  return (
    await request.put<RoleListResponse>(`/admin/api/v1/roles/${id}`, roleData)
  ).data;
};

// 使用角色列表的自定义 hook
export const useRoles = (params: RoleListParams) => {
  return useQuery<RoleListResponse, Error>({
    queryKey: ["roles", params],
    queryFn: () => fetchRoles(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

// 使用删除角色的自定义 hook
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: (data) => {
      if (data.code === "200" || data.code === "201") {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast({
          title: "删除成功",
          description: "角色已成功删除",
        });
      } else {
        toast({
          title: "删除失败",
          description: data.msg || "删除角色失败",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// 使用创建角色的自定义 hook
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: (data) => {
      if (data.code === "200" || data.code === "201") {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast({
          title: "创建成功",
          description: "角色已成功创建",
        });
      } else {
        toast({
          title: "创建失败",
          description: data.msg || "创建角色失败",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// 使用更新角色的自定义 hook
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      updateRole(id, data),
    onSuccess: (data) => {
      if (data.code === "200" || data.code === "201") {
        queryClient.invalidateQueries({ queryKey: ["roles"] });
        toast({
          title: "更新成功",
          description: "角色已成功更新",
        });
      } else {
        toast({
          title: "更新失败",
          description: data.msg || "更新角色失败",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

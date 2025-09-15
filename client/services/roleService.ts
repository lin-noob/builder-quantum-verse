import { request } from "@/lib/request";
import type { Role, RoleListResponse } from "@/types/role";

class RoleService {
  async getRoles(companyId?: string): Promise<Role[]> {
    const response = await request.get("/admin/api/v1/roles/list", {
      companyId,
    });
    return response.data.data;
  }

  async getRoleById(id: string): Promise<Role> {
    const response = await request.get(`/admin/api/v1/roles/${id}`);
    return response;
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const response = await request.post("/admin/api/v1/roles", roleData);
    return response;
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    const response = await request.put(`/admin/api/v1/roles/${id}`, roleData);
    return response;
  }

  async deleteRole(id: string): Promise<void> {
    await request.delete(`/admin/api/v1/roles/${id}`);
  }

  async assignPermissions(
    roleId: string,
    permissions: string[],
  ): Promise<void> {
    await request.post(`/admin/api/v1/roles/${roleId}/permissions`, {
      permissions,
    });
  }
}

export const roleService = new RoleService();

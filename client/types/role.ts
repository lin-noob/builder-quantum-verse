export interface Role {
  id: string;
  isSystem: boolean;
  menuIds: string[];
  name: string;
  permissionIds: string[];
  shopId: string;
  type: string;
}

export interface RoleListResponse {
  roles: Role[];
  total?: number;
}
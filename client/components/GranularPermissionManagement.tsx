import React, { useState, useEffect } from "react";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, Role } from "@/admin/hooks/useRoleManagement";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Shield,
  Users,
  Eye,
  Edit3,
  Save,
  X,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";
import "antd/dist/reset.css";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import { useRoleStore } from "@/stores";
import useProjectStore from "@/stores/projectStore";
import { useTranslation } from "react-i18next";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

interface ApiPermissionItem {
  id: string;
  name: string;
  type: number | string;
  menuId: number | string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface Module {
  id: string;
  name: string;
  resource?: string;
  children?: Module[];
}

interface GranularPermissionManagementProps {
  title?: string;
  description?: string;
}

interface ProjectReportViewItem {
  check: boolean;
  menuId: string | null;
  projectId: string;
  reportId: string;
  reportName: string;
  roleId: string | null;
  tenantId: string | null;
}

export default function GranularPermissionManagement({ title }: GranularPermissionManagementProps) {
  const { t } = useTranslation();
  const resolvedTitle = title || t("organization.permissions.title");
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: rolesData, isLoading, isError, error } = useRoles({ page, limit, name: searchTerm });
  const { fetchRoles } = useRoleStore();
  const { projects, fetchProjects, currentProject } = useProjectStore();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");
  const [roleMenuPermissions, setRoleMenuPermissions] = useState<string[]>([]);
  const [loadingMenuPermissions, setLoadingMenuPermissions] = useState(false);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeMenuComponent, setActiveMenuComponent] = useState<string | null>(null);
  const [permissionItems, setPermissionItems] = useState<ApiPermissionItem[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [newRole, setNewRole] = useState({ id: "", name: "", description: "" });
  const [isEditingRole, setIsEditingRole] = useState(false);

  const [menuTreeData, setMenuTreeData] = useState<TreeDataNode[]>([]);
  const [loadingMenuTree, setLoadingMenuTree] = useState(true);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const roles = rolesData?.data;

  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [projectReportData, setProjectReportData] = useState<ProjectReportViewItem[]>([]);

  const fetchProjectReportView = async (projectId: string, menuId: string, roleId: string) => {
    try {
      const response = await request.get("/quote/api/v1/menu-report/view", {
        projectId,
        menuId,
        roleId,
      });
      setProjectReportData(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch project report view:", error);
      setProjectReportData([]);
    }
  };

  const handleToggleReport = async (reportId: string, checked: boolean) => {
    const updatedData = projectReportData.map((item) =>
      item.reportId === reportId ? { ...item, check: checked } : item,
    );
    setProjectReportData(updatedData);

    const selectedReports = updatedData.filter((item) => item.check).map((item) => ({ reportId: item.reportId }));

    try {
      await request.post("/quote/api/v1/menu-report", {
        menuId: activeMenuId,
        projectId: activeProjectId,
        roleId: selectedRole?.id,
        menuTenantReports: selectedReports,
      });
      toast({
        title: t("common.success"),
        description: t("common.saveSuccess"),
      });
    } catch (error) {
      console.error("Failed to update project report permissions:", error);
      toast({
        title: t("common.error"),
        description: t("common.saveFailed"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (
      activeMenuComponent === "/client/pages/AttributionReport.tsx" &&
      activeProjectId &&
      activeMenuId &&
      selectedRole
    ) {
      fetchProjectReportView(activeProjectId, activeMenuId, selectedRole.id);
    }
  }, [activeMenuComponent, activeProjectId, activeMenuId, selectedRole]);

  useEffect(() => {
    if (currentProject) {
      setActiveProjectId(currentProject.id);
    } else if (projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [currentProject, projects]);

  const fetchMenuTreeData = async () => {
    try {
      setLoadingMenuTree(true);
      const response = await request.get("/admin/api/v1/menus/companytree");
      const menuData = response.data.data || [];
      setMenuTreeData(convertToTreeData(menuData));
    } catch (error) {
      setMenuTreeData([]);
    } finally {
      setLoadingMenuTree(false);
    }
  };

  const convertToTreeData = (menuData: any[]): TreeDataNode[] => {
    return menuData.map(
      (item) =>
        ({
          key: item.id,
          title: item.name,
          component: item.component,
          children: item.children ? convertToTreeData(item.children) : undefined,
        }) as any,
    );
  };

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    fetchMenuTreeData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRoleMenuPermissions(selectedRole.id);
    } else {
      setRoleMenuPermissions([]);
    }
  }, [selectedRole?.id]);

  const filterActualCheckedNodes = (returnedMenuIds: string[]): string[] => {
    if (!returnedMenuIds || returnedMenuIds.length === 0) return [];

    const findNodeInTree = (nodes: TreeDataNode[], key: string): TreeDataNode | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children) {
          const found = findNodeInTree(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };

    const getAllChildKeys = (node: TreeDataNode): string[] => {
      const keys: string[] = [];
      if (node.children) {
        node.children.forEach((child) => {
          keys.push(child.key as string);
          keys.push(...getAllChildKeys(child));
        });
      }
      return keys;
    };

    return returnedMenuIds.filter((menuId) => {
      const node = findNodeInTree(menuTreeData, menuId);
      if (!node || !node.children || node.children.length === 0) {
        return true;
      }
      const allChildKeys = getAllChildKeys(node);
      const allChildrenSelected = allChildKeys.every((childKey) => returnedMenuIds.includes(childKey));
      return allChildrenSelected;
    });
  };

  const fetchRoleMenuPermissions = async (roleId: string) => {
    try {
      setLoadingMenuPermissions(true);
      const response = await request.get(`/admin/api/v1/roles/${roleId}/menus`);
      const rawMenuIds = response.data.data || [];
      const filteredMenuIds = filterActualCheckedNodes(rawMenuIds);
      setRoleMenuPermissions(filteredMenuIds);
      setSelectedRole(
        (prv) =>
          ({
            ...prv,
            menuIds: filteredMenuIds,
          }) as any,
      );
    } catch (error) {
      setRoleMenuPermissions([]);
    } finally {
      setLoadingMenuPermissions(false);
    }
  };

  const handleSelectRole = (role: Role) => {
    if (selectedRole && role.id === selectedRole.id) return;
    setSelectedRole(role);
  };

  const handleCreateRole = () => {
    setIsEditingRole(false);
    setNewRole({ id: "", name: "", description: "" });
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setIsEditingRole(true);
    setNewRole({ id: role.id, name: role.name, description: role.description });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    setDeleteTarget({ id: role.id, name: role.name });
    setIsDeleteDialogOpen(true);
  };

  const handleSaveRole = () => {
    const trimmedName = newRole.name.trim();
    if (!trimmedName) {
      toast({
        title: t("organization.permissions.validations.fillName", { title: resolvedTitle }),
        variant: "destructive",
      });
      return;
    }

    if (isEditingRole && newRole.id) {
      const base = roles?.find((r) => r.id === newRole.id) || selectedRole;
      const payload = {
        id: newRole.id,
        issystem: base?.isSystem ?? true,
        menuIds: null,
        name: trimmedName,
        permissionIds: null,
        shopid: base?.shopId ?? "",
        type: base?.type ?? "manager",
      };
      updateRoleMutation.mutate(
        { id: newRole.id, data: payload as any },
        {
          onSuccess: (data) => {
            if (data.code === "200" || data.code === "201") {
              fetchRoles();
            }
          },
        },
      );
    } else {
      createRoleMutation.mutate(
        { name: trimmedName },
        {
          onSuccess: (data) => {
            if (data.code === "200" || data.code === "201") {
              fetchRoles();
            }
          },
        },
      );
    }

    setIsRoleDialogOpen(false);
  };

  const togglePermission = async (permissionId: string) => {
    if (!selectedRole || !activeMenuId) return;

    const prev = selectedRole.permissionIds || [];
    const updatedPermissions = prev.includes(permissionId)
      ? prev.filter((id) => id !== permissionId)
      : [...prev, permissionId];

    setSelectedRole({
      ...selectedRole,
      permissionIds: updatedPermissions,
    });

    const selectedSet = new Set(updatedPermissions);
    const permissionNames = permissionItems.filter((p) => selectedSet.has(p.id)).map((p) => p.name);

    try {
      await request.put(`/admin/api/v1/roles/${selectedRole.id}/permissions`, {
        menuId: activeMenuId,
        roleId: selectedRole.id,
        permissionIds: updatedPermissions,
        permissionNames,
      });
      toast({ title: t("organization.permissions.toasts.saveSuccess") });
    } catch (e: any) {
      setSelectedRole((curr) => (curr ? { ...curr, permissionIds: prev } : curr));
      toast({
        title: t("organization.permissions.toasts.saveFailed"),
        description: e?.message || t("organization.permissions.unknownError"),
        variant: "destructive",
      });
    }
  };

  const openFieldPermissionConfig = (resource: string) => {
    setSelectedResource(resource);
  };

  const toggleFieldViewPermission = (fieldId: string) => {
    if (!selectedRole) return;
    const updatedFieldPermissions = { ...selectedRole.fieldPermissions };
    const resourceFields = updatedFieldPermissions[selectedResource] || [];
    const fieldIndex = resourceFields.findIndex((f) => f.id === fieldId);
    if (fieldIndex !== -1) {
      const updatedField = { ...resourceFields[fieldIndex], view: !resourceFields[fieldIndex].view };
      if (!updatedField.view) {
        updatedField.edit = false;
      }
      resourceFields[fieldIndex] = updatedField;
      updatedFieldPermissions[selectedResource] = resourceFields;
      setSelectedRole({ ...selectedRole, fieldPermissions: updatedFieldPermissions });
    }
  };

  const toggleFieldEditPermission = (fieldId: string) => {
    if (!selectedRole) return;
    const updatedFieldPermissions = { ...selectedRole.fieldPermissions };
    const resourceFields = updatedFieldPermissions[selectedResource] || [];
    const fieldIndex = resourceFields.findIndex((f) => f.id === fieldId);
    if (fieldIndex !== -1) {
      const updatedField = { ...resourceFields[fieldIndex] };
      if (!updatedField.view) {
        updatedField.view = true;
      }
      updatedField.edit = !updatedField.edit;
      resourceFields[fieldIndex] = updatedField;
      updatedFieldPermissions[selectedResource] = resourceFields;
      setSelectedRole({ ...selectedRole, fieldPermissions: updatedFieldPermissions });
    }
  };

  const handleSavePermissions = () => {
    if (selectedRole) {
      // Reserved for future API call
      // console.log("保存权限配置:", selectedRole);
    }
  };

  const handleAssignRole = (userId: string, roleId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const updatedRoles = user.roles.includes(roleId)
            ? user.roles.filter((id) => id !== roleId)
            : [...user.roles, roleId];
          return { ...user, roles: updatedRoles };
        }
        return user;
      }),
    );
  };

  const [fieldPermissionPage, setFieldPermissionPage] = useState(1);
  const fieldPermissionsPerPage = 5;

  const getResourceFieldPermissions = (resource: string) => {
    if (selectedRole) {
      return selectedRole.fieldPermissions[resource] || [];
    }
    return [];
  };

  const getCurrentPageFieldPermissions = () => {
    const allFieldPermissions = getResourceFieldPermissions(selectedResource);
    const startIndex = (fieldPermissionPage - 1) * fieldPermissionsPerPage;
    const endIndex = startIndex + fieldPermissionsPerPage;
    return allFieldPermissions.slice(startIndex, endIndex);
  };

  const getFieldPermissionTotalPages = () => {
    const allFieldPermissions = getResourceFieldPermissions(selectedResource);
    return Math.ceil(allFieldPermissions.length / fieldPermissionsPerPage);
  };

  const handleFieldPermissionPageChange = (page: number) => {
    setFieldPermissionPage(page);
  };

  const getAllLeafNodes = (nodes: TreeDataNode[]): string[] => {
    const leafNodes: string[] = [];
    const traverse = (nodeList: TreeDataNode[]) => {
      nodeList.forEach((node) => {
        if (!node.children || node.children.length === 0) {
          leafNodes.push(node.key as string);
        } else {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return leafNodes;
  };

  const areAllChildrenChecked = (nodeKey: string, checkedKeys: string[]): boolean => {
    const findNode = (nodes: TreeDataNode[], key: string): TreeDataNode | null => {
      for (const node of nodes) {
        if (node.key === key) return node;
        if (node.children) {
          const found = findNode(node.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(menuTreeData, nodeKey);
    if (!node || !node.children || node.children.length === 0) {
      return false;
    }
    const allChildKeys = getAllLeafNodes([node]);
    return allChildKeys.every((childKey) => checkedKeys.includes(childKey));
  };

  const getFullyCheckedNodes = (checkedKeys: string[], halfCheckedKeys: string[] = []) => {
    return checkedKeys.filter((key) => {
      if (halfCheckedKeys.includes(key)) return false;
      const allLeafNodes = getAllLeafNodes(menuTreeData);
      if (allLeafNodes.includes(key)) return true;
      return areAllChildrenChecked(key, checkedKeys);
    });
  };

  const handleMenuSelectionChange = async (checkedKeysInfo: any) => {
    if (!selectedRole) return;
    const checkedKeys = Array.isArray(checkedKeysInfo) ? checkedKeysInfo : checkedKeysInfo.checked;
    const halfCheckedKeys = checkedKeysInfo.halfChecked || [];
    const fullySelectedMenuIds = getFullyCheckedNodes(checkedKeys, halfCheckedKeys);
    const prevMenuIds = selectedRole.menuIds || [];

    setSelectedRole({ ...selectedRole, menuIds: fullySelectedMenuIds });

    try {
      const payload = {
        id: selectedRole.id,
        issystem: selectedRole.isSystem,
        menuIds: fullySelectedMenuIds.map((id) => String(id)),
        name: selectedRole.name,
        permissionIds: selectedRole.permissionIds?.length ? selectedRole.permissionIds : null,
        shopid: selectedRole.shopId ?? "",
        type: selectedRole.type,
      };
      await request.put(`/admin/api/v1/roles/${selectedRole.id}/menus`, payload);
      toast({ title: t("organization.permissions.toasts.saveSuccess") });
      if (!activeMenuId && fullySelectedMenuIds.length > 0) {
        setActiveMenuId(fullySelectedMenuIds[fullySelectedMenuIds.length - 1]);
      }
    } catch (err: any) {
      setSelectedRole((curr) => (curr ? { ...curr, menuIds: prevMenuIds } : curr));
      const message = err?.message || t("organization.permissions.unknownError");
      toast({ title: t("organization.permissions.toasts.saveFailed"), description: message, variant: "destructive" });
    }
  };

  const fetchPermissionsByMenu = async (menuId: string) => {
    try {
      setLoadingPermissions(true);
      const res = await request.get<ApiPermissionItem[]>("/admin/api/v1/permissions", { menuId });
      const list = (res as any)?.data?.data ?? (res as any)?.data ?? [];
      setPermissionItems(list);
    } catch (e: any) {
      toast({
        title: t("organization.permissions.toasts.loadPermFailed"),
        description: e?.message || t("organization.permissions.unknownError"),
        variant: "destructive",
      });
      setPermissionItems([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (activeMenuId) {
      fetchPermissionsByMenu(activeMenuId);
      const fetchRolePermissionIdsByMenu = async () => {
        if (!selectedRole) return;
        try {
          const res = await request.get<string[]>(`/admin/api/v1/roles/${selectedRole.id}/permissions`, {
            menuId: activeMenuId,
          });
          const ids: string[] = (res as any)?.data?.data ?? (res as any)?.data ?? [];
          setSelectedRole((curr) => (curr ? { ...curr, permissionIds: ids } : curr));
        } catch (e: any) {
          toast({
            title: t("organization.permissions.toasts.loadRolePermFailed"),
            description: e?.message || t("organization.permissions.unknownError"),
            variant: "destructive",
          });
          setSelectedRole((curr) => (curr ? { ...curr, permissionIds: [] } : curr));
        }
      };
      fetchRolePermissionIdsByMenu();
    }
  }, [activeMenuId]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t("organization.permissions.list.title", { title: resolvedTitle })}</CardTitle>
                <CardDescription>{t("organization.permissions.list.desc", { title: resolvedTitle })}</CardDescription>
              </div>
              <Button onClick={handleCreateRole} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t("organization.permissions.actions.new")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder={t("organization.permissions.searchPlaceholder", { title: resolvedTitle })!}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : isError ? (
                  <div className="text-center text-red-500 py-4">
                    {t("organization.permissions.loadFailed", { title: resolvedTitle })}:{" "}
                    {error?.message || t("organization.permissions.unknownError")}
                  </div>
                ) : (
                  roles
                    .filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((role) => (
                      <div
                        key={role.id}
                        className={`${selectedRole?.id === role.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"} p-4 rounded-lg border cursor-pointer transition-colors`}
                        onClick={() => handleSelectRole(role)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{role.name}</h3>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRole(role);
                                }}
                              >
                                {t("organization.permissions.actions.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRole(role);
                                }}
                              >
                                {t("organization.permissions.actions.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-9">
          <CardHeader>
            <CardTitle>
              {selectedRole
                ? t("organization.permissions.rightPanel.titleSelected", { name: selectedRole.name })
                : t("organization.permissions.rightPanel.title")}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? t("organization.permissions.rightPanel.descSelected", {
                    name: selectedRole.name,
                    title: resolvedTitle,
                  })
                : t("organization.permissions.rightPanel.desc", { title: resolvedTitle })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-4/12">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t("organization.permissions.menu.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingMenuTree ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-500">{t("organization.permissions.menu.loading")}</span>
                          </div>
                        ) : (
                          <Tree
                            checkable
                            checkedKeys={selectedRole?.menuIds || []}
                            onCheck={(checkedKeysInfo) => {
                              handleMenuSelectionChange(checkedKeysInfo);
                            }}
                            onSelect={(selectedKeys, info) => {
                              if (selectedKeys.length > 0) {
                                setActiveMenuId(selectedKeys[0] as string);
                                setActiveMenuComponent((info.node as any).component);
                              }
                            }}
                            treeData={menuTreeData}
                            height={400}
                            defaultExpandAll
                            checkStrictly={false}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:w-8/12">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{t("organization.permissions.permissions.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activeMenuId ? (
                          <>
                            {activeMenuComponent === "/client/pages/AttributionReport.tsx" ? (
                              <Tabs
                                defaultValue={currentProject?.id || (projects.length > 0 ? projects[0].id : "")}
                                value={activeProjectId}
                                onValueChange={setActiveProjectId}
                                className="space-y-6"
                              >
                                <TabsList className="flex w-full">
                                  {activeMenuComponent === "/client/pages/AttributionReport.tsx" &&
                                    projects.map((project) => (
                                      <TabsTrigger key={project.id} value={project.id}>
                                        {project.name}
                                      </TabsTrigger>
                                    ))}
                                </TabsList>
                                {projects.map((project) => (
                                  <TabsContent
                                    key={project.id}
                                    value={project.id}
                                    className="space-y-6 h-[500px] overflow-y-auto overflow-x-hidden"
                                  >
                                    <div className="grid grid-cols-1 gap-2">
                                      {projectReportData.map((item) => (
                                        <div
                                          key={item.reportId}
                                          className="flex items-center space-x-2 p-3 border rounded-lg"
                                        >
                                          <Checkbox
                                            id={`report-${item.reportId}`}
                                            checked={item.check}
                                            onCheckedChange={(checked) => {
                                              handleToggleReport(item.reportId, checked as boolean);
                                            }}
                                          />
                                          <Label htmlFor={`report-${item.reportId}`} className="text-sm">
                                            {item.reportName}
                                          </Label>
                                        </div>
                                      ))}
                                      {projectReportData.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                          <p>No reports found for project: {project.name}</p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                ))}
                              </Tabs>
                            ) : (
                              <>
                                <Tabs
                                  defaultValue="fieldPermissions"
                                  onValueChange={setActiveProjectId}
                                  className="space-y-6"
                                >
                                  <TabsList className="grid w-full grid-cols-2 hidden">
                                    <TabsTrigger value="permissions">
                                      {t("organization.permissions.tabs.permissions")}
                                    </TabsTrigger>
                                    <TabsTrigger value="fieldPermissions">
                                      {t("organization.permissions.tabs.fieldPermissions")}
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="permissions" className="space-y-6">
                                    <div className="space-y-4">
                                      {loadingPermissions ? (
                                        <div className="flex justify-center items-center py-8">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                          {permissionItems.filter((p) => String(p.type) === "1").length > 0 ? (
                                            permissionItems
                                              .filter((p) => String(p.type) === "1")
                                              .map((p) => (
                                                <div
                                                  key={p.id}
                                                  className="flex items-center space-x-2 p-3 border rounded-lg"
                                                >
                                                  <Checkbox
                                                    id={`perm-${p.id}`}
                                                    checked={!!selectedRole?.permissionIds?.includes(p.id)}
                                                    onCheckedChange={() => togglePermission(p.id)}
                                                  />
                                                  <Label htmlFor={`perm-${p.id}`} className="text-sm">
                                                    {p.name}
                                                  </Label>
                                                </div>
                                              ))
                                          ) : (
                                            <div className="text-center text-gray-500 py-4">
                                              {t("organization.permissions.empty.feature")}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="fieldPermissions" className="space-y-6">
                                    <div className="space-y-4">
                                      {loadingPermissions ? (
                                        <div className="flex justify-center items-center py-8">
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                          {permissionItems.filter((p) => String(p.type) === "2").length > 0 ? (
                                            permissionItems
                                              .filter((p) => String(p.type) === "2")
                                              .map((p) => (
                                                <div
                                                  key={p.id}
                                                  className="flex items-center space-x-2 p-3 border rounded-lg"
                                                >
                                                  <Checkbox
                                                    id={`perm-${p.id}`}
                                                    checked={!!selectedRole?.permissionIds?.includes(p.id)}
                                                    onCheckedChange={() => togglePermission(p.id)}
                                                  />
                                                  <Label htmlFor={`perm-${p.id}`} className="text-sm">
                                                    {p.name}
                                                  </Label>
                                                </div>
                                              ))
                                          ) : (
                                            <div className="text-center text-gray-500 py-4">
                                              {t("organization.permissions.empty.field")}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mb-4" />
                            <p>{t("organization.permissions.selectMenuHint")}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mb-4" />
                <p>{t("organization.permissions.rightPanel.desc", { title: resolvedTitle })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingRole
                ? t("organization.permissions.dialogs.role.editTitle", { title: resolvedTitle })
                : t("organization.permissions.dialogs.role.newTitle", { title: resolvedTitle })}
            </DialogTitle>
            <DialogDescription>
              {isEditingRole
                ? t("organization.permissions.dialogs.role.editDesc", { title: resolvedTitle })
                : t("organization.permissions.dialogs.role.newDesc", { title: resolvedTitle })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">
                {t("organization.permissions.dialogs.role.nameLabel", { title: resolvedTitle })}
              </Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder={t("organization.permissions.dialogs.role.namePlaceholder", { title: resolvedTitle })!}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              {t("organization.permissions.dialogs.role.cancel")}
            </Button>
            <Button onClick={handleSaveRole}>
              <Save className="h-4 w-4 mr-2" />
              {t("organization.permissions.dialogs.role.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("organization.permissions.dialogs.delete.title", { title: resolvedTitle })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("organization.permissions.dialogs.delete.desc", { title: resolvedTitle, name: deleteTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              {t("organization.permissions.dialogs.delete.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteRoleMutation.mutate(deleteTarget.id, {
                    onSuccess: (data) => {
                      if (data.code === "200" || data.code === "201") {
                        fetchRoles();
                        if (selectedRole && selectedRole.id === deleteTarget.id) {
                          setSelectedRole(null);
                        }
                      }
                    },
                  });
                }
                setIsDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              {t("organization.permissions.dialogs.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

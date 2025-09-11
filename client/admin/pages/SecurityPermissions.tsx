import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Users, 
  Eye, 
  Save,
  Crown,
  User,
  Bot,
  Target,
  BarChart3,
  Settings,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { marketingPermissionService, MarketingRole } from "@/admin/services/marketingPermissionService";

// 角色定义
interface Role {
  id: MarketingRole;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  color: string;
}

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: "super_admin",
    name: "超级管理员",
    description: "拥有营销管理后台所有权限，可以管理系统的所有功能和设置",
    isSystem: true,
    userCount: 1,
    color: "bg-red-100 text-red-800"
  },
  {
    id: "marketing_manager",
    name: "营销经理",
    description: "负责营销策略制定和管理，拥有核心功能权限",
    isSystem: true,
    userCount: 3,
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "marketing_specialist",
    name: "营销专员",
    description: "执行具体的营销任务，拥有基础功能权限",
    isSystem: true,
    userCount: 8,
    color: "bg-green-100 text-green-800"
  },
  {
    id: "data_analyst",
    name: "数据分析师",
    description: "负责数据分析和报表，拥有数据相关功能权限",
    isSystem: true,
    userCount: 2,
    color: "bg-purple-100 text-purple-800"
  }
];

export default function SecurityPermissions() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(mockRoles[1]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const allMenus = marketingPermissionService.getAllMenus();
  
  // 新角色表单状态
  const [newRole, setNewRole] = useState({
    name: "",
    description: ""
  });
  
  // 角色权限状态
  const [rolePermissions, setRolePermissions] = useState<Record<MarketingRole, string[]>>(() => {
    const initialPermissions: Record<MarketingRole, string[]> = {} as Record<MarketingRole, string[]>;
    mockRoles.forEach(role => {
      initialPermissions[role.id] = marketingPermissionService.getRolePermissions(role.id);
    });
    return initialPermissions;
  });
  
  // 获取角色图标
  const getRoleIcon = (roleName: string) => {
    if (roleName.includes("超级")) return <Crown className="h-4 w-4" />;
    if (roleName.includes("经理")) return <Shield className="h-4 w-4" />;
    if (roleName.includes("专员")) return <User className="h-4 w-4" />;
    if (roleName.includes("分析师")) return <BarChart3 className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };
  
  // 获取菜单图标
  const getMenuIcon = (menuId: string) => {
    switch (menuId) {
      case "dashboard":
        return <LayoutDashboard className="h-4 w-4" />;
      case "user-profile":
        return <User className="h-4 w-4" />;
      case "ai-strategy":
        return <Bot className="h-4 w-4" />;
      case "effect-tracking":
        return <Target className="h-4 w-4" />;
      case "user-list":
        return <Users className="h-4 w-4" />;
      case "real-time-monitoring":
        return <BarChart3 className="h-4 w-4" />;
      case "response-actions":
        return <Settings className="h-4 w-4" />;
      case "organization":
        return <Users className="h-4 w-4" />;
      case "security-permissions":
        return <Shield className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };
  
  // 处理角色选择
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };
  
  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };
  
  // 处理删除角色
  const handleDeleteRole = (roleId: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      // 过滤掉要删除的角色
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      
      // 如果删除的是当前选中的角色，清空选中
      if (selectedRole && selectedRole.id === roleId) {
        setSelectedRole(null);
      }
      
      // 从权限状态中移除该角色
      const updatedPermissions = { ...rolePermissions };
      delete updatedPermissions[roleId as MarketingRole];
      setRolePermissions(updatedPermissions);
    }
  };
  
  // 处理创建角色
  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;
    
    // 生成新的角色ID（在实际应用中可能需要服务器生成）
    const newRoleId = `custom_role_${Date.now()}` as MarketingRole;
    
    // 创建新角色
    const role: Role = {
      id: newRoleId,
      name: newRole.name,
      description: newRole.description,
      isSystem: false, // 自定义角色
      userCount: 0,
      color: "bg-gray-100 text-gray-800"
    };
    
    // 添加到角色列表
    setRoles([...roles, role]);
    
    // 初始化该角色的权限为空
    setRolePermissions({
      ...rolePermissions,
      [newRoleId]: []
    });
    
    // 重置表单并关闭对话框
    setNewRole({ name: "", description: "" });
    setIsRoleDialogOpen(false);
  };
  
  // 切换菜单权限
  const toggleMenuPermission = (menuId: string) => {
    if (!selectedRole) return;
    
    setRolePermissions(prev => {
      const currentPermissions = [...(prev[selectedRole.id] || [])];
      const index = currentPermissions.indexOf(menuId);
      
      if (index > -1) {
        // 移除权限
        currentPermissions.splice(index, 1);
      } else {
        // 添加权限
        currentPermissions.push(menuId);
      }
      
      return {
        ...prev,
        [selectedRole.id]: currentPermissions
      };
    });
  };
  
  // 检查角色是否具有菜单权限
  const hasMenuPermission = (roleId: MarketingRole, menuId: string): boolean => {
    return rolePermissions[roleId]?.includes(menuId) || false;
  };
  
  // 保存权限配置
  const handleSavePermissions = () => {
    if (!selectedRole) return;
    
    // 在实际应用中，这里会调用API保存权限配置
    marketingPermissionService.updateRolePermissions(selectedRole.id, rolePermissions[selectedRole.id]);
    alert("权限配置已保存");
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* 移除了页面标题和副标题，但保留了适当的顶部间距 */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧角色列表 (25%宽度) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>角色列表</CardTitle>
                <Button size="sm" onClick={() => setIsRoleDialogOpen(true)} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  创建
                </Button>
              </div>
              <CardDescription>
                管理系统中的用户角色
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedRole?.id === role.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                    onClick={() => handleSelectRole(role)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-gray-100">
                        {getRoleIcon(role.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{role.name}</h3>
                          {role.isSystem && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                              系统
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {role.userCount} 用户
                          </span>
                        </div>
                      </div>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧权限配置区域 (75%宽度) */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getRoleIcon(selectedRole.name)}
                      {selectedRole.name} - 权限配置
                    </CardTitle>
                    <CardDescription>
                      为 {selectedRole.name} 分配菜单访问权限
                    </CardDescription>
                  </div>
                  <Button onClick={handleSavePermissions} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    保存配置
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 搜索框 */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search">搜索菜单项</Label>
                      <Input
                        id="search"
                        placeholder="输入菜单名称..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="w-40">
                      <Label htmlFor="filter">筛选角色</Label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="所有角色" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有角色</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 菜单权限列表 */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>菜单项</TableHead>
                          <TableHead>描述</TableHead>
                          <TableHead className="w-32">权限状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allMenus
                          .filter(menu => 
                            menu.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((menu) => (
                            <TableRow key={menu.id}>
                              <TableCell>
                                <div className="p-2 rounded-md bg-gray-100 w-8 h-8 flex items-center justify-center">
                                  {getMenuIcon(menu.id)}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {menu.label}
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {/* 这里可以添加菜单项的描述 */}
                                {menu.id === "dashboard" && "营销后台首页仪表盘"}
                                {menu.id === "user-profile" && "用户画像管理"}
                                {menu.id === "ai-strategy" && "AI驱动的营销策略制定"}
                                {menu.id === "effect-tracking" && "营销效果追踪分析"}
                                {menu.id === "user-list" && "用户管理列表"}
                                {menu.id === "real-time-monitoring" && "实时监控中心"}
                                {menu.id === "response-actions" && "响应动作管理"}
                                {menu.id === "organization" && "组织架构管理"}
                                {menu.id === "security-permissions" && "权限管理配置"}
                              </TableCell>
                              <TableCell>
                                <Checkbox
                                  checked={hasMenuPermission(selectedRole.id, menu.id)}
                                  onCheckedChange={() => toggleMenuPermission(menu.id)}
                                  disabled={selectedRole.isSystem && menu.id === "security-permissions"}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* 权限说明 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">权限说明</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 勾选菜单项表示该角色可以访问对应功能</li>
                      <li>• 系统角色的权限配置不可修改</li>
                      <li>• 超级管理员拥有所有菜单项的访问权限</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    请选择一个角色
                  </h3>
                  <p className="text-gray-500">
                    从左侧角色列表中选择一个角色来配置权限
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 创建角色对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新角色</DialogTitle>
            <DialogDescription>
              为营销管理后台创建一个新的用户角色
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">角色名称</Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="输入角色名称"
              />
            </div>
            <div>
              <Label htmlFor="role-description">角色描述</Label>
              <Input
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="描述角色的用途和权限范围"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateRole}>创建角色</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
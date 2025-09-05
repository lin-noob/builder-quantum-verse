import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
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
  ChevronDown
} from "lucide-react";

// 模拟数据类型定义
interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string; // 套餐时长
  features: string[]; // 包含的功能ID列表
  isActive: boolean;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
}

// 模拟功能数据（营销平台的所有功能）
const mockFeatures: Feature[] = [
  // AI营销模块
  {
    id: "ai_strategy_view_list",
    name: "查看AI策略列表",
    description: "查看AI营销策略列表",
    category: "AI营销",
    resource: "ai_strategies"
  },
  {
    id: "ai_strategy_view_detail",
    name: "查看AI策略详情",
    description: "查看AI营销策略详细信息",
    category: "AI营销",
    resource: "ai_strategies"
  },
  {
    id: "ai_strategy_create",
    name: "创建AI策略",
    description: "创建新的AI营销策略",
    category: "AI营销",
    resource: "ai_strategies"
  },
  {
    id: "ai_strategy_edit",
    name: "编辑AI策略",
    description: "编辑AI营销策略",
    category: "AI营销",
    resource: "ai_strategies"
  },
  {
    id: "ai_strategy_delete",
    name: "删除AI策略",
    description: "删除AI营销策略",
    category: "AI营销",
    resource: "ai_strategies"
  },
  // 数据分析模块
  {
    id: "analytics_view_dashboard",
    name: "查看仪表盘",
    description: "查看数据分析仪表盘",
    category: "数据分析",
    resource: "analytics"
  },
  {
    id: "analytics_export_report",
    name: "导出报告",
    description: "导出数据分析报告",
    category: "数据分析",
    resource: "analytics"
  },
  {
    id: "analytics_create_report",
    name: "创建报告",
    description: "创建新的数据分析报告",
    category: "数据分析",
    resource: "analytics"
  },
  // 用户管理模块
  {
    id: "user_view_list",
    name: "查看用户列表",
    description: "查看用户列表",
    category: "用户管理",
    resource: "users"
  },
  {
    id: "user_view_detail",
    name: "查看用户详情",
    description: "查看用户详细信息",
    category: "用户管理",
    resource: "users"
  },
  {
    id: "user_edit",
    name: "编辑用户",
    description: "编辑用户信息",
    category: "用户管理",
    resource: "users"
  },
  {
    id: "user_delete",
    name: "删除用户",
    description: "删除用户",
    category: "用户管理",
    resource: "users"
  },
  // 系统管理模块
  {
    id: "system_settings_view",
    name: "查看系统设置",
    description: "查看系统配置信息",
    category: "系统管理",
    resource: "settings"
  },
  {
    id: "system_settings_edit",
    name: "编辑系统设置",
    description: "编辑系统配置信息",
    category: "系统管理",
    resource: "settings"
  },
  {
    id: "permission_manage",
    name: "权限管理",
    description: "管理用户权限",
    category: "系统管理",
    resource: "permissions"
  },
  {
    id: "role_manage",
    name: "角色管理",
    description: "管理用户角色",
    category: "系统管理",
    resource: "roles"
  }
];

// 模拟套餐数据
const mockPackages: Package[] = [
  {
    id: "basic",
    name: "基础版",
    description: "适合小型团队使用的基础功能",
    price: 99,
    duration: "月付",
    features: ["ai_strategy_view_list", "ai_strategy_view_detail", "user_view_list", "user_view_detail"],
    isActive: true
  },
  {
    id: "pro",
    name: "专业版",
    description: "适合中型团队使用的专业功能",
    price: 299,
    duration: "月付",
    features: [
      "ai_strategy_view_list", 
      "ai_strategy_view_detail", 
      "ai_strategy_create", 
      "ai_strategy_edit",
      "user_view_list", 
      "user_view_detail", 
      "user_edit",
      "analytics_view_dashboard",
      "analytics_export_report"
    ],
    isActive: true
  },
  {
    id: "enterprise",
    name: "企业版",
    description: "适合大型企业使用的全部功能",
    price: 999,
    duration: "月付",
    features: mockFeatures.map(f => f.id),
    isActive: true
  }
];

// 定义功能模块树状结构
interface Module {
  id: string;
  name: string;
  resource?: string;
  children?: Module[];
}

// 模拟功能模块树状结构数据
const mockModules: Module[] = [
  {
    id: "ai_marketing",
    name: "AI营销",
    children: [
      { id: "ai_strategy", name: "AI策略", resource: "ai_strategies" },
      { id: "marketing_campaign", name: "营销活动", resource: "campaigns" }
    ]
  },
  {
    id: "data_analysis",
    name: "数据分析",
    children: [
      { id: "dashboard", name: "仪表盘", resource: "analytics" },
      { id: "reports", name: "报告", resource: "reports" }
    ]
  },
  {
    id: "user_management",
    name: "用户管理",
    children: [
      { id: "user_list", name: "用户列表", resource: "users" }
    ]
  },
  {
    id: "system_management",
    name: "系统管理",
    children: [
      { id: "system_settings", name: "系统设置", resource: "settings" },
      { id: "permission_management", name: "权限管理", resource: "permissions" },
      { id: "role_management", name: "角色管理", resource: "roles" }
    ]
  }
];

export default function SubscriptionManagement() {
  // 状态管理
  const [packages, setPackages] = useState<Package[]>(mockPackages);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(mockPackages[0]);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPackage, setNewPackage] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    duration: "月付"
  });
  
  // 添加折叠状态管理
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "ai_marketing": true,
    "data_analysis": true,
    "user_management": true,
    "system_management": true
  });

  // 获取功能分类
  const categories = Array.from(new Set(mockFeatures.map(f => f.category)));

  // 处理套餐选择
  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  // 处理创建新套餐
  const handleCreatePackage = () => {
    setNewPackage({
      id: "",
      name: "",
      description: "",
      price: 0,
      duration: "月付"
    });
    setSelectedPackage(null);
    setIsPackageDialogOpen(true);
  };

  // 处理编辑套餐
  const handleEditPackage = (pkg: Package) => {
    setNewPackage({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration
    });
    setSelectedPackage(pkg);
    setIsPackageDialogOpen(true);
  };

  // 处理复制套餐
  const handleCopyPackage = (pkg: Package) => {
    const copiedPackage = {
      ...pkg,
      id: `copy_of_${pkg.id}`,
      name: `复制-${pkg.name}`
    };
    setPackages([...packages, copiedPackage]);
  };

  // 处理删除套餐
  const handleDeletePackage = (packageId: string) => {
    if (confirm("确定要删除这个套餐吗？")) {
      setPackages(packages.filter(pkg => pkg.id !== packageId));
      if (selectedPackage && selectedPackage.id === packageId) {
        setSelectedPackage(packages.length > 1 ? packages[0] : null);
      }
    }
  };

  // 保存套餐
  const handleSavePackage = () => {
    if (selectedPackage) {
      // 编辑现有套餐
      setPackages(packages.map(pkg => 
        pkg.id === selectedPackage.id ? {...selectedPackage, ...newPackage} : pkg
      ));
    } else {
      // 创建新套餐
      const newPackageObj: Package = {
        id: newPackage.name.toLowerCase().replace(/\s+/g, "_"),
        name: newPackage.name,
        description: newPackage.description,
        price: newPackage.price,
        duration: newPackage.duration,
        features: [],
        isActive: true
      };
      setPackages([...packages, newPackageObj]);
    }
    setIsPackageDialogOpen(false);
  };

  // 切换功能权限
  const toggleFeature = (featureId: string) => {
    if (!selectedPackage) return;
    
    const updatedFeatures = selectedPackage.features.includes(featureId)
      ? selectedPackage.features.filter(id => id !== featureId)
      : [...selectedPackage.features, featureId];
      
    setSelectedPackage({
      ...selectedPackage,
      features: updatedFeatures
    });
  };

  // 切换模块权限（一级菜单）
  const toggleModule = (moduleId: string) => {
    if (!selectedPackage) return;
    
    // 获取该模块下的所有功能
    const module = mockModules.find(m => m.id === moduleId);
    if (!module || !module.children) return;
    
    const moduleFeatures = module.children
      .filter(child => child.resource)
      .flatMap(child => 
        mockFeatures
          .filter(f => f.resource === child.resource)
          .map(f => f.id)
      );
    
    // 检查是否所有功能都已选中
    const allFeaturesSelected = moduleFeatures.every(id => selectedPackage.features.includes(id));
    
    let updatedFeatures;
    if (allFeaturesSelected) {
      // 如果所有功能都已选中，则取消选中所有功能
      updatedFeatures = selectedPackage.features.filter(id => !moduleFeatures.includes(id));
    } else {
      // 如果不是所有功能都已选中，则选中所有功能
      updatedFeatures = [...selectedPackage.features];
      moduleFeatures.forEach(id => {
        if (!updatedFeatures.includes(id)) {
          updatedFeatures.push(id);
        }
      });
    }
    
    setSelectedPackage({
      ...selectedPackage,
      features: updatedFeatures
    });
  };

  // 保存套餐配置
  const handleSaveConfiguration = () => {
    if (selectedPackage) {
      setPackages(packages.map(pkg => 
        pkg.id === selectedPackage.id ? selectedPackage : pkg
      ));
    }
  };

  // 检查模块是否全部选中
  const isModuleFullySelected = (moduleId: string) => {
    if (!selectedPackage) return false;
    
    const module = mockModules.find(m => m.id === moduleId);
    if (!module || !module.children) return false;
    
    const moduleFeatures = module.children
      .filter(child => child.resource)
      .flatMap(child => 
        mockFeatures
          .filter(f => f.resource === child.resource)
          .map(f => f.id)
      );
    
    return moduleFeatures.every(id => selectedPackage.features.includes(id));
  };

  // 检查模块是否部分选中
  const isModulePartiallySelected = (moduleId: string) => {
    if (!selectedPackage) return false;
    
    const module = mockModules.find(m => m.id === moduleId);
    if (!module || !module.children) return false;
    
    const moduleFeatures = module.children
      .filter(child => child.resource)
      .flatMap(child => 
        mockFeatures
          .filter(f => f.resource === child.resource)
          .map(f => f.id)
      );
    
    const selectedCount = moduleFeatures.filter(id => selectedPackage.features.includes(id)).length;
    return selectedCount > 0 && selectedCount < moduleFeatures.length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* 移除主标题和副标题 */}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧套餐列表 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>套餐列表</CardTitle>
                {/* 移除副标题 */}
              </div>
              <Button onClick={handleCreatePackage} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                新建
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="搜索套餐..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {packages
                  .filter(pkg => 
                    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedPackage?.id === pkg.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectPackage(pkg)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{pkg.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-lg font-bold text-blue-600">¥{pkg.price}</span>
                            <span className="text-sm text-gray-500 ml-2">/{pkg.duration}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditPackage(pkg);
                            }}>
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPackage(pkg);
                            }}>
                              复制
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePackage(pkg.id);
                            }}>
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧权限配置面板 */}
        <div className="lg:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedPackage ? `${selectedPackage.name} 功能配置` : "功能配置"}
              </CardTitle>
              {/* 移除副标题 */}
            </CardHeader>
            <CardContent>
              {selectedPackage ? (
                <div className="space-y-6">
                  {/* 功能模块树状结构 */}
                  <div className="space-y-2">
                    {mockModules.map((module) => (
                      <div key={module.id} className="border rounded-lg">
                        {/* 一级菜单 */}
                        <div 
                          className="flex items-center p-3 hover:bg-gray-50 rounded-t-lg cursor-pointer"
                          onClick={() => {
                            // 切换折叠状态
                            setExpandedModules(prev => ({
                              ...prev,
                              [module.id]: !prev[module.id]
                            }));
                          }}
                        >
                          <Checkbox
                            checked={isModuleFullySelected(module.id)}
                            indeterminate={isModulePartiallySelected(module.id)}
                            onCheckedChange={() => toggleModule(module.id)}
                            className="mr-3"
                          />
                          <div className="flex-1 font-medium">{module.name}</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 切换折叠状态
                              setExpandedModules(prev => ({
                                ...prev,
                                [module.id]: !prev[module.id]
                              }));
                            }}
                          >
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform",
                                expandedModules[module.id] ? "rotate-180" : ""
                              )}
                            />
                          </Button>
                        </div>
                        
                        {/* 二级菜单 */}
                        {module.children && module.children.length > 0 && expandedModules[module.id] && (
                          <div className="border-t">
                            {module.children.map((child) => {
                              // 获取该子模块下的功能数量
                              const childFeatures = mockFeatures.filter(f => f.resource === child.resource);
                              
                              return (
                                <div 
                                  key={child.id} 
                                  className="flex items-center p-3 pl-8 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // 如果该子模块有对应的功能，切换所有功能的选中状态
                                    if (child.resource) {
                                      const features = mockFeatures.filter(f => f.resource === child.resource);
                                      const allSelected = features.every(f => selectedPackage.features.includes(f.id));
                                      
                                      let updatedFeatures;
                                      if (allSelected) {
                                        // 如果所有功能都已选中，则取消选中所有功能
                                        updatedFeatures = selectedPackage.features.filter(id => 
                                          !features.map(f => f.id).includes(id)
                                        );
                                      } else {
                                        // 如果不是所有功能都已选中，则选中所有功能
                                        updatedFeatures = [...selectedPackage.features];
                                        features.forEach(f => {
                                          if (!updatedFeatures.includes(f.id)) {
                                            updatedFeatures.push(f.id);
                                          }
                                        });
                                      }
                                      
                                      setSelectedPackage({
                                        ...selectedPackage,
                                        features: updatedFeatures
                                      });
                                    }
                                  }}
                                >
                                  <Checkbox
                                    checked={childFeatures.length > 0 && childFeatures.every(f => selectedPackage.features.includes(f.id))}
                                    indeterminate={childFeatures.some(f => selectedPackage.features.includes(f.id)) && !childFeatures.every(f => selectedPackage.features.includes(f.id))}
                                    onCheckedChange={(e) => {
                                      e.stopPropagation();
                                      // 如果该子模块有对应的功能，切换所有功能的选中状态
                                      if (child.resource) {
                                        const features = mockFeatures.filter(f => f.resource === child.resource);
                                        const allSelected = features.every(f => selectedPackage.features.includes(f.id));
                                        
                                        let updatedFeatures;
                                        if (allSelected) {
                                          // 如果所有功能都已选中，则取消选中所有功能
                                          updatedFeatures = selectedPackage.features.filter(id => 
                                            !features.map(f => f.id).includes(id)
                                          );
                                        } else {
                                          // 如果不是所有功能都已选中，则选中所有功能
                                          updatedFeatures = [...selectedPackage.features];
                                          features.forEach(f => {
                                            if (!updatedFeatures.includes(f.id)) {
                                              updatedFeatures.push(f.id);
                                            }
                                          });
                                        }
                                        
                                        setSelectedPackage({
                                          ...selectedPackage,
                                          features: updatedFeatures
                                        });
                                      }
                                    }}
                                    className="mr-3"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium">{child.name}</div>
                                    {/* 移除功能选中数量显示 */}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveConfiguration}>
                      <Save className="h-4 w-4 mr-2" />
                      保存修改
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Shield className="h-12 w-12 mb-4" />
                  <p>请选择一个套餐进行功能配置</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 套餐编辑对话框 */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPackage ? "编辑套餐" : "新建套餐"}</DialogTitle>
            <DialogDescription>
              {selectedPackage ? "修改套餐信息" : "创建一个新的套餐"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="package-name">套餐名称</Label>
              <Input
                id="package-name"
                value={newPackage.name}
                onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                placeholder="输入套餐名称"
              />
            </div>
            <div>
              <Label htmlFor="package-description">套餐描述</Label>
              <Textarea
                id="package-description"
                value={newPackage.description}
                onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                placeholder="输入套餐描述"
              />
            </div>
            <div>
              <Label htmlFor="package-price">套餐价格</Label>
              <Input
                id="package-price"
                type="number"
                value={newPackage.price}
                onChange={(e) => setNewPackage({...newPackage, price: Number(e.target.value)})}
                placeholder="输入套餐价格"
              />
            </div>
            <div>
              <Label htmlFor="package-duration">套餐时长</Label>
              <Select value={newPackage.duration} onValueChange={(value) => setNewPackage({...newPackage, duration: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="选择套餐时长" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="月付">月付</SelectItem>
                  <SelectItem value="年付">年付</SelectItem>
                  <SelectItem value="永久">永久</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackageDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleSavePackage}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
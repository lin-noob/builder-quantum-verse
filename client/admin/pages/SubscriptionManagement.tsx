import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ApiResponse, request } from "@/lib/request";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useRoleStore } from "@/stores/roleStore";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { useToast } from "@/hooks/use-toast";

// API套餐数据类型定义
export interface TariffPackage {
  anysisProductCount: number;
  controlProductCount: number;
  dayOpenAdvCount: number;
  id: number;
  isdefault: boolean;
  lastUpdateTime: string;
  lastUpdateUser: string;
  maxMarketCount: number;
  maxMember: number;
  maxOrderCount: number;
  maxProductCount: number;
  maxProfitPlanCount: number;
  maxShopCount: number;
  monthprice: number;
  name: string;
  orderMemoryCount: string;
  roleId: number;
  yearprice: number;
  features?: string[]; // 可选的功能ID列表，用于权限配置
}

// API调用函数
export const fetchTariffPackages = async (): Promise<TariffPackage[]> => {
  try {
    // 使用业务请求方法，自动处理标准业务响应格式
    const data = await request.get<ApiResponse<TariffPackage[]>>(
      "/admin/api/v1/sysTariffPackages/list",
    );
    return data.data.data;
  } catch (error) {
    console.error("Failed to fetch tariff packages:", error);
    throw error;
  }
};

export default function SubscriptionManagement() {
  // 状态管理
  const [packages, setPackages] = useState<TariffPackage[]>([]);
  const { toast } = useToast();
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<number | null>(null);
  const [newPackage, setNewPackage] = useState({
    id: 0,
    name: "",
    monthprice: 0,
    yearprice: 0,
    maxMember: 0,
    maxShopCount: 0,
    maxProductCount: 0,
    maxOrderCount: 0,
    maxMarketCount: 0,
    maxProfitPlanCount: 0,
    anysisProductCount: 0,
    controlProductCount: 0,
    dayOpenAdvCount: 0,
    orderMemoryCount: "",
    roleId: '',
    isdefault: false,
  });
  const [selectedPackage, setSelectedPackage] = useState<TariffPackage | null>(
    null,
  );

  // 获取角色数据
  const { roles, fetchRoles } = useRoleStore();

  // 处理套餐选择
  const handleSelectPackage = (pkg: TariffPackage) => {
    setSelectedPackage(pkg);
  };

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTariffPackages();
      setPackages(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "获取套餐列表失败");
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  // 加载套餐数据和角色数据
  useEffect(() => {
    loadPackages();
    fetchRoles(); // 获取角色数据
  }, [fetchRoles]);

  // 处理创建新套餐
  const handleCreatePackage = () => {
    setNewPackage({
      id: 0,
      name: "",
      monthprice: 0,
      yearprice: 0,
      maxMember: 0,
      maxShopCount: 0,
      maxProductCount: 0,
      maxOrderCount: 0,
      maxMarketCount: 0,
      maxProfitPlanCount: 0,
      anysisProductCount: 0,
      controlProductCount: 0,
      dayOpenAdvCount: 0,
      orderMemoryCount: "",
      roleId: 0,
      isdefault: false,
    });
    setSelectedPackage(null);
    setIsPackageDialogOpen(true);
  };

  // 处理编辑套餐
  const handleEditPackage = (pkg: TariffPackage) => {
    setNewPackage({
      id: pkg.id,
      name: pkg.name,
      monthprice: pkg.monthprice,
      yearprice: pkg.yearprice,
      maxMember: pkg.maxMember,
      maxShopCount: pkg.maxShopCount,
      maxProductCount: pkg.maxProductCount,
      maxOrderCount: pkg.maxOrderCount,
      maxMarketCount: pkg.maxMarketCount,
      maxProfitPlanCount: pkg.maxProfitPlanCount,
      anysisProductCount: pkg.anysisProductCount,
      controlProductCount: pkg.controlProductCount,
      dayOpenAdvCount: pkg.dayOpenAdvCount,
      orderMemoryCount: pkg.orderMemoryCount,
      roleId: pkg.roleId,
      isdefault: pkg.isdefault,
    });
    setSelectedPackage(pkg);
    setIsPackageDialogOpen(true);
  };

  // 处理复制套餐
  const handleCopyPackage = (pkg: TariffPackage) => {
    const copiedPackage = {
      ...pkg,
      id: 0, // 新套餐ID由后端生成
      name: `复制-${pkg.name}`,
      isdefault: false,
    };
    setPackages([...packages, copiedPackage]);
  };

  // 处理删除套餐 - 使用自定义确认弹窗
  const handleRequestDelete = (packageId: number) => {
    setPackageToDelete(packageId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (packageToDelete == null) return;
    try {
      setLoading(true);

      await request.post("/admin/api/v1/sysTariffPackages/delete", {
        id: packageToDelete,
      });

      setPackages(packages.filter((pkg) => pkg.id !== packageToDelete));

      if (selectedPackage && selectedPackage.id === packageToDelete) {
        setSelectedPackage(packages.length > 1 ? packages[0] : null);
      }

      await loadPackages();
    } catch (error) {
      console.error("删除套餐失败:", error);
      setError(error instanceof Error ? error.message : "删除套餐失败");
    } finally {
      setDeleteConfirmOpen(false);
      setPackageToDelete(null);
      setLoading(false);
    }
  };

  // 保存套餐
  const handleSavePackage = async () => {
    // 基础校验（新增/编辑通用）
    if (!newPackage.name.trim()) {
      toast({ title: "请填写套餐名称" });
      return;
    }
    if (!newPackage.roleId || Number.isNaN(Number(newPackage.roleId))) {
      toast({ title: "请选择角色" });
      return;
    }
    if (newPackage.monthprice === undefined || newPackage.monthprice === null || isNaN(Number(newPackage.monthprice)) || Number(newPackage.monthprice) < 0) {
      toast({ title: "请填写有效的月价格（可为0或正数）" });
      return;
    }
    if (newPackage.yearprice === undefined || newPackage.yearprice === null || isNaN(Number(newPackage.yearprice)) || Number(newPackage.yearprice) < 0) {
      toast({ title: "请填写有效的年价格（可为0或正数）" });
      return;
    }

    try {
      setLoading(true);

      if (selectedPackage) {
        // 编辑现有套餐
        const updatedPackage = {
          ...selectedPackage,
          ...newPackage,
        };

        // 调用编辑接口（POST /update）
        await request.post("/admin/api/v1/sysTariffPackages/update", updatedPackage);

        setPackages(
          packages.map((pkg) =>
            pkg.id === selectedPackage.id ? updatedPackage : pkg,
          ),
        );
        setSelectedPackage(updatedPackage);
      } else {
        // 创建新套餐
        const newPackageObj = {
          ...newPackage,
          lastUpdateTime: new Date().toISOString().split("T")[0],
          lastUpdateUser: "admin",
          features: [],
        };

        // 调用保存接口
        const response = await request.post<ApiResponse<TariffPackage>>(
          "/admin/api/v1/sysTariffPackages/save", 
          newPackageObj
        );
        
        // 获取保存后的套餐数据（包含后端生成的ID）
        const savedPackage = response.data.data;
        setPackages([...packages, savedPackage]);
      }
      
      setIsPackageDialogOpen(false);
      
      // 重新加载套餐列表以确保数据同步
      await loadPackages();
      
    } catch (error) {
      console.error("保存套餐失败:", error);
      setError(error instanceof Error ? error.message : "保存套餐失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 移除主标题和副标题 */}

      <div className="grid grid-cols-1 gap-6">
        {/* 套餐列表 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>套餐列表</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">加载中...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-red-500">
                    <p className="text-sm mb-2">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadPackages();
                      }}
                    >
                      重试
                    </Button>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                    <p className="text-sm">暂无套餐数据</p>
                  </div>
                ) : (
                  packages
                    .filter((pkg) =>
                      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((pkg) => (
                      <SubscriptionCard
                        key={pkg.id}
                        id={pkg.id}
                        name={pkg.name}
                        monthprice={pkg.monthprice}
                        yearprice={pkg.yearprice}
                        isdefault={pkg.isdefault}
                        onEdit={() => handleEditPackage(pkg)}
                        onCopy={() => handleCopyPackage(pkg)}
                        onDelete={() => handleRequestDelete(pkg.id)}
                      />
                    ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 套餐编辑对话框 */}
      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPackage ? "编辑套餐" : "新建套餐"}
            </DialogTitle>
            <DialogDescription>
              {selectedPackage ? "修改套餐信息" : "创建一个新的套餐"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="package-name">套餐名称 *</Label>
              <Input
                id="package-name"
                value={newPackage.name}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, name: e.target.value })
                }
                placeholder="输入套餐名称"
                required
              />
            </div>

            <div>
              <Label htmlFor="package-role">版本 *</Label>
              <Select
                value={newPackage.roleId.toString()}
                onValueChange={(value) =>
                  setNewPackage({
                    ...newPackage,
                    roleId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="package-monthprice">月价格 *</Label>
                <Input
                  id="package-monthprice"
                  type="number"
                  min={0}
                  value={newPackage.monthprice}
                  onChange={(e) =>
                    setNewPackage({
                      ...newPackage,
                      monthprice: Number(e.target.value),
                    })
                  }
                  placeholder="输入月价格"
                  required
                />
              </div>
              <div>
                <Label htmlFor="package-yearprice">年价格 *</Label>
                <Input
                  id="package-yearprice"
                  type="number"
                  min={0}
                  value={newPackage.yearprice}
                  onChange={(e) =>
                    setNewPackage({
                      ...newPackage,
                      yearprice: Number(e.target.value),
                    })
                  }
                  placeholder="输入年价格"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="package-default"
                checked={newPackage.isdefault}
                onCheckedChange={(checked) =>
                  setNewPackage({
                    ...newPackage,
                    isdefault: checked as boolean,
                  })
                }
              />
              <Label htmlFor="package-default">设为默认套餐</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPackageDialogOpen(false)}
            >
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

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除套餐「{packages.find((p) => p.id === packageToDelete)?.name ?? ""}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

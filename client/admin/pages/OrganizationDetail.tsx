import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberTable } from "../components/MemberTable";
import { ProjectTable } from "../components/ProjectTable";
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
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  Save,
  Users,
  Calendar,
  Building2,
  Shield,
  Crown,
  Building,
} from "lucide-react";
import {
  Organization,
  AccountStatus,
  SubscriptionPlan,
} from "../../../shared/organizationData";
import { getOrganizationDetail } from "../services/organizationDetailService";
import { organizationService } from "../services/organizationService";

const OrganizationDetail = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 组织信息状态
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 表单状态
  const [orgFormData, setOrgFormData] = useState({
    name: "",
    accountStatus: false,
    subscriptionPlan: SubscriptionPlan.INTERNAL_TRIAL,
  });

  useEffect(() => {
    if (organizationId) {
      loadOrganization();
    }
  }, [organizationId]);

  const loadOrganization = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const orgData = await getOrganizationDetail(organizationId);

      setOrganization(orgData);
      setOrgFormData({
        name: orgData.name,
        accountStatus: orgData.accountStatus,
        subscriptionPlan: orgData.subscriptionPlan,
      });
    } catch (error: any) {
      console.error("Failed to load organization:", error);
      toast({
        title: "加载失败",
        description: error.message || "无法加载组织信息，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!organization || !organizationId) return;

    try {
      setSaving(true);

      const updateRequest: Organization = {
        ...organization,
        name: orgFormData.name,
      };

      const bool = await organizationService.updateOrganization(updateRequest);

      if (bool) {
        toast({
          title: "保存成功",
          description: "组织信息已更新",
        });
        setIsEditing(false);
        loadOrganization(); // 重新加载数据
      } else {
        toast({
          title: "保存失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save organization:", error);
      toast({
        title: "保存失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: boolean) => {
    if (status === false) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          已启用
        </Badge>
      );
    } else if (status === true) {
      return <Badge variant="destructive">已禁用</Badge>;
    }
  };

  const getSubscriptionBadge = (plan: SubscriptionPlan) => {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        内部试用
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            组织不存在
          </h2>
          <p className="text-gray-600 mb-4">未找到指定的组织信息</p>
          <Button onClick={() => navigate("/admin/organizations")}>
            返回组织列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 组织概览 */}
      <div className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                基本信息
              </CardTitle>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setOrgFormData({
                          name: organization.name,
                          accountStatus: organization.accountStatus,
                          subscriptionPlan: organization.subscriptionPlan,
                        });
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveOrganization}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "保存中..." : "保存"}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑组织
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orgId">组织ID</Label>
                <Input
                  id="orgId"
                  value={organization.id}
                  readOnly
                  className="bg-gray-50 text-gray-600 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="createdAt">创建时间</Label>
                <Input
                  id="createdAt"
                  value={organization.createdAt}
                  readOnly
                  className="bg-gray-50 text-gray-600 mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="orgName">组织名称</Label>
                <Input
                  id="orgName"
                  value={orgFormData.name}
                  onChange={(e) =>
                    setOrgFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  readOnly={!isEditing}
                  className={`mt-1 ${!isEditing ? "bg-gray-50 text-gray-600" : ""}`}
                />
              </div>

              <div>
                <Label htmlFor="accountStatus">账户状态</Label>
                <div className="mt-2">
                  {getStatusBadge(organization.accountStatus)}
                </div>
              </div>

              <div>
                <Label htmlFor="subscriptionPlan">订阅套餐</Label>
                <div className="mt-2">
                  {getSubscriptionBadge(organization.subscriptionPlan)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 成员和项目管理 */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              成员管理
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              项目管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MemberTable
              organizationId={organizationId}
              apiEndpoint="/admin/api/v1/company/user/list"
              enableEndpoint="/admin/api/v1/users/enable"
              disableEndpoint="/admin/api/v1/users/disable"
              title="成员管理"
            />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectTable
              organizationId={organizationId}
              title="项目管理"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default OrganizationDetail;

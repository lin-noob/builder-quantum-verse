import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import {
  Building2,
  Calendar,
  Users,
  Crown,
  Save,
  Shield,
  Info,
  Mail,
  User,
} from "lucide-react";
import { OrganizationInfo } from "@shared/organizationData";

// Type definitions for legacy code
type AccountStatus = "ACTIVE" | "SUSPENDED";
type SubscriptionPlan =
  | "INTERNAL_TRIAL"
  | "BASIC"
  | "PROFESSIONAL"
  | "ENTERPRISE";

// API response types

const OrganizationSettings = () => {
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
  });

  const { toast } = useToast();

  // 当前组织ID（实际应用中应该从认证上下文获取）
  const currentOrganizationId = "org_demo_001";

  useEffect(() => {
    loadOrganizationInfo();
  }, []);

  const loadOrganizationInfo = async () => {
    try {
      setLoading(true);
      const response = await request.get("/admin/api/v1/users/info");
      const res = response.data;
      if (res) {
        setOrgInfo(res.data);
        setFormData({
          name: res.data.company.name || "",
        });
      }
    } catch (error) {
      console.error("Failed to load organization info:", error);
      toast({
        title: "加载失败",
        description: "无法加载组织信息，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!orgInfo) return;

    if (!formData.name.trim()) {
      toast({
        title: "验证失败",
        description: "组织名称不能为空",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Update organization name using the API
      const response = await request.post(
        `/admin/api/v1/users/updateSelf`,
        {
          company: formData.name.trim(),
        },
      );

      const res = response.data;

      if (res && res.code === "201") {
        toast({
          title: "保存成功",
          description: "组织信息已更新",
        });

        // Refresh the data
        loadOrganizationInfo();
      } else {
        toast({
          title: "保存失败",
          description: res?.msg || "更新失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast({
        title: "保存失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubscriptionBadge = () => {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        内部试用
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserTypeBadge = (usertype: string) => {
    if (usertype === "manager") {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          管理员
        </Badge>
      );
    } else if (usertype === "member") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          成员
        </Badge>
      );
    } else {
      return <Badge variant="secondary">{usertype}</Badge>;
    }
  };

  const getUserStatusBadge = (disable: boolean) => {
    if (disable) {
      return <Badge variant="destructive">已禁用</Badge>;
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          活跃
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!orgInfo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            无法加载组织信息
          </h2>
          <p className="text-gray-600">请刷新页面重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgId">组织ID</Label>
              <Input
                id="orgId"
                value={orgInfo.company.id}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                组织的唯一标识符，不可修改
              </p>
            </div>

            <div>
              <Label htmlFor="orgName">组织名称</Label>
              <Input
                id="orgName"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="请输入组织名称"
              />
              <p className="text-xs text-gray-500 mt-1">
                组织的显示名称，可以修改
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving || formData.name === orgInfo.name}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "保存中..." : "保存更改"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 状态信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              状态信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">用户类型</span>
              {getUserTypeBadge(orgInfo.usertype)}
            </div>

            {/* <div className="flex justify-between items-center">
              <span className="text-sm font-medium">订阅套餐</span>
              {getSubscriptionBadge()}
            </div> */}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">创建时间</span>
              <span className="text-sm text-gray-600">
                {orgInfo.company.gmtCreate}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">最后更新</span>
              <span className="text-sm text-gray-600">
                {orgInfo.company.gmtModified}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 成员统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              成员统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {orgInfo.total}
                </div>
                <div className="text-sm text-blue-600">总成员数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {orgInfo.activeMember}
                </div>
                <div className="text-sm text-green-600">活跃成员</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 权限说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              权限说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="mb-2">作为组织管理员，您可以：</p>
              <ul className="space-y-1 text-xs list-disc list-inside pl-4">
                <li>修改组织名称和基本信息</li>
                <li>邀请新成员加入组织</li>
                <li>管理成员的角色和权限</li>
                <li>启用或禁用成员账户</li>
                <li>查看组织的使用统计</li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>重要提醒：</strong>
                  请谨慎管理管理员权限，确保组织始终至少有一个活跃的管理员账户。
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationSettings;

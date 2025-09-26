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
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

// Type definitions for legacy code
type AccountStatus = "ACTIVE" | "SUSPENDED";
type SubscriptionPlan =
  | "INTERNAL_TRIAL"
  | "BASIC"
  | "PROFESSIONAL"
  | "ENTERPRISE";

// API response types

const OrganizationSettings = () => {
  const { t } = useTranslation();
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
  });

  const { toast } = useToast();

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
        title: t("organization.settings.loadError.title"),
        description: t("organization.settings.loadError.desc"),
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
        title: t("organization.settings.validationError.title"),
        description: t("organization.settings.validationError.nameRequired"),
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
          title: t("organization.settings.save.successTitle"),
          description: t("organization.settings.save.successDesc"),
        });

        // Refresh the data
        loadOrganizationInfo();
      } else {
        toast({
          title: t("organization.settings.save.failTitle"),
          description: res?.msg || t("organization.settings.save.failDesc"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast({
        title: t("organization.settings.save.failTitle"),
        description: t("organization.settings.save.networkErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubscriptionBadge = () => {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        {t("organization.settings.subscription.internalTrial")}
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
          {t("organization.settings.userType.manager")}
        </Badge>
      );
    } else if (usertype === "member") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {t("organization.settings.userType.member")}
        </Badge>
      );
    } else {
      return <Badge variant="secondary">{usertype}</Badge>;
    }
  };

  const getUserStatusBadge = (disable: boolean) => {
    if (disable) {
      return <Badge variant="destructive">{t("organization.settings.userStatus.disabled")}</Badge>;
    } else {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          {t("organization.settings.userStatus.active")}
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
            {t("organization.settings.emptyState.title")}
          </h2>
          <p className="text-gray-600">{t("organization.settings.emptyState.desc")}</p>
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
              {t("organization.settings.section.basicInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgId">{t("organization.settings.labels.orgId")}</Label>
              <Input
                id="orgId"
                value={orgInfo.company.id}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("organization.settings.helpers.orgId")}
              </p>
            </div>

            <div>
              <Label htmlFor="orgName">{t("organization.settings.labels.orgName")}</Label>
              <Input
                id="orgName"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t("organization.settings.placeholders.orgName") || undefined}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("organization.settings.helpers.orgName")}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving || formData.name === orgInfo.company.name}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? t("organization.settings.save.saving") : t("organization.settings.save.saveChanges")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 状态信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t("organization.settings.section.statusInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="flex justify-between items-center">
              <span className="text-sm font-medium">用户类型</span>
              {getUserTypeBadge(orgInfo.usertype)}
            </div> */}

            {/* <div className="flex justify-between items-center">
              <span className="text-sm font-medium">订阅套餐</span>
              {getSubscriptionBadge()}
            </div> */}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("organization.settings.status.createdAt")}</span>
              <span className="text-sm text-gray-600">
                {orgInfo.company.gmtCreate}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t("organization.settings.status.updatedAt")}</span>
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
              {t("organization.settings.section.memberStats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {orgInfo.total}
                </div>
                <div className="text-sm text-blue-600">{t("organization.settings.memberStats.total")}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {orgInfo.activeMember}
                </div>
                <div className="text-sm text-green-600">{t("organization.settings.memberStats.active")}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 权限说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("organization.settings.section.permissionsInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="mb-2">{t("organization.settings.permissions.intro")}</p>
              <ul className="space-y-1 text-xs list-disc list-inside pl-4">
                <li>{t("organization.settings.permissions.items.modifyInfo")}</li>
                <li>{t("organization.settings.permissions.items.inviteMembers")}</li>
                <li>{t("organization.settings.permissions.items.manageRoles")}</li>
                <li>{t("organization.settings.permissions.items.toggleAccounts")}</li>
                <li>{t("organization.settings.permissions.items.viewStats")}</li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-800">
                  <strong>{t("organization.settings.permissions.warningTitle")}</strong>
                  {t("organization.settings.permissions.warningDesc")}
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

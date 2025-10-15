import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  User,
  Building,
  MapPin,
  Mail,
  Copy,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import OrderHistory from "@/components/OrderHistory";
import SessionTimeline from "@/components/SessionTimeline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getProfileView,
  type ApiUser,
  addProfileLabel,
  deleteProfileLabel,
  ApiLabel,
} from "@/lib/profile";
import { toast } from "@/hooks/use-toast";
import { getDaysBetween } from "@/lib/utils";
import useProjectStore from "@/stores/projectStore";
import { useRoleStore } from "@/stores";


export default function UserDetail() {
  const { t } = useTranslation();
  const { cdpId } = useParams<{ cdpId: string }>();
  const [loading, setLoading] = useState(false);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentProject } = useProjectStore();
  // 权限检查
  const { hasPermission } = useRoleStore();


  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!cdpId) return;
      setLoading(true);
      setError(null);
      try {
        // 检查 currentProject ���否存在或 id 是否为空
        if (!currentProject || !currentProject.id) {
          setError(t("userDetail.error.selectProject"));
          return;
        }

        // 调用真实API
        const data = await getProfileView(cdpId);
        if (mounted) setApiUser(data);
      } catch (e: any) {
        console.error("Failed to load user detail:", e);
        if (mounted) {
          setError(e?.message || t("userDetail.error.loadFailed"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [cdpId, currentProject]);

  const user = useMemo(() => {
    if (!apiUser) return null;
    return {
      // old UI-compatible fields
      userId: apiUser.userId ?? "",
      cdpId: String(apiUser.cdpUserId ?? cdpId ?? ""),
      name: apiUser.fullName,
      company: apiUser.companyName,
      country: apiUser.location?.split("/")[0] || "",
      city: apiUser.location?.split("/")[1] || "",
      contact: apiUser.contactInfo,
      totalSpent: apiUser.totalOrders ?? 0,
      totalOrders: apiUser.orderCount ?? 0,
      averageOrderValue:
        apiUser.totalOrders && apiUser.orderCount
          ? Number(apiUser.totalOrders) /
            Math.max(1, Number(apiUser.orderCount))
          : 0,
      lastPurchaseDate: apiUser.maxBuyTime || "",
      maxOrderAmount: apiUser.maxOrderAmount,
      averagePurchaseCycle: (() => {
        const daysSpan = getDaysBetween(apiUser.maxBuyTime, apiUser.minBuyTime);
        const orders = Number(apiUser.orderCount) || 0;
        if (!daysSpan || Number.isNaN(daysSpan)) return 0;
        if (orders <= 1) return daysSpan; // t("userDetail.comments.cantCalculateInterval")
        const cycle = daysSpan / (orders - 1);
        return Math.max(1, Math.round(cycle));
      })(),
      firstVisitTime: apiUser.createGmt,
      registrationTime: apiUser.signTime,
      firstPurchaseTime: apiUser.minBuyTime,
      lastActiveTime: apiUser.loginDate,
      currency: apiUser.currencySymbol,
      tags: [],
      sessions: [],
      orders: [],
      sessionId: apiUser.sessionId
    } as any;
  }, [apiUser, cdpId]);

  const [userTags, setUserTags] = useState<ApiLabel[]>(user?.tags || []);
  const [labelNameToId, setLabelNameToId] = useState<Record<string, number>>(
    {},
  );
  const [newTag, setNewTag] = useState("");
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [openSessions, setOpenSessions] = useState<Set<string>>(new Set());
  const [tagSaving, setTagSaving] = useState(false);

  const refetchUser = async () => {
    if (!cdpId || !currentProject || !currentProject.id) return;
    try {
      // 调用真实API
      const fresh = await getProfileView(cdpId);
      if (fresh) setApiUser(fresh);
    } catch {}
  };

  useEffect(() => {
    if (apiUser?.labelList && Array.isArray(apiUser.labelList)) {
      setUserTags(apiUser.labelList);
    }
  }, [apiUser?.labelList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-600">{t("userDetail.loading.text")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">{t("userDetail.error.loadFailed")}</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/users" className="text-blue-600 hover:text-blue-800">
            {t("userDetail.actions.backToUserList")}
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">{t("userDetail.error.userNotFound")}</p>
          <p className="text-gray-600 mb-4">{t("userDetail.error.userIdNotExist")}</p>
          <Link to="/users" className="text-blue-600 hover:text-blue-800">
            {t("userDetail.actions.backToUserList")}
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.cdpId);
    toast({ title: t("userDetail.toast.copied"), description: t("userDetail.toast.cdpIdCopied") });
  };

  const addTag = async () => {
    const value = newTag.trim();
    if (!value) return;
    setTagSaving(true);
    setNewTag("");

    try {
      if (!currentProject || !currentProject.id) {
        toast({ title: t("userDetail.error.addFailed"), description: t("userDetail.error.selectProject") });
        return;
      }

      // 调用真实API
      await addProfileLabel(String(user.cdpId), value);
      setIsTagPopoverOpen(false);
      await refetchUser();
      toast({ title: t("userDetail.toast.addSuccess"), description: `${t("userDetail.toast.addedTag")}${value}` });
    } catch (e: any) {
      toast({ title: t("userDetail.error.addFailed"), description: e?.message || t("userDetail.error.retryLater") });
    } finally {
      setTagSaving(false);
    }
  };

  const removeTag = async (id: string) => {
    setTagSaving(true);
    try {
      if (!currentProject || !currentProject.id) {
        toast({ title: t("userDetail.error.deleteFailed"), description: t("userDetail.error.selectProject") });
        return;
      }

      // 调用真实API
      await deleteProfileLabel(id);
      await refetchUser();
      toast({ title: t("userDetail.toast.deleteSuccess") });
    } catch (e: any) {
      toast({ title: t("userDetail.error.deleteFailed"), description: e?.message || t("userDetail.error.retryLater") });
    } finally {
      setTagSaving(false);
    }
  };

  const toggleSession = (sessionId: string) => {
    const newOpenSessions = new Set(openSessions);
    if (newOpenSessions.has(sessionId)) {
      newOpenSessions.delete(sessionId);
    } else {
      newOpenSessions.add(sessionId);
    }
    setOpenSessions(newOpenSessions);
  };

  function formatWithSymbol(amount: number, symbol?: string) {
    if (!symbol) {
      return amount;
    }
    const formatted = new Intl.NumberFormat("en-US", {
      style: "decimal", // t("userDetail.comments.formatNumberOnly")
      minimumFractionDigits: 2, // t("userDetail.comments.keepTwoDecimals")
      maximumFractionDigits: 2,
    }).format(amount);

    return `${symbol}${formatted}`;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        <div className="space-y-6">
          {/* Core Identity Card - Full Width */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {user.name || user.cdpId.substring(0, 8)}
                  </h2>

                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">CDP ID:</span>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {user.userId}
                    </code>
                    <button
                      onClick={handleCopyId}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tag Management */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {t("userDetail.labels.statusTags")}
                      </h4>
                      <Popover
                        open={isTagPopoverOpen}
                        onOpenChange={setIsTagPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">{t("userDetail.labels.addNewTag")}</h4>
                              <p className="text-sm text-muted-foreground">
                                {t("userDetail.labels.addNewTagDescription")}
                              </p>
                            </div>
                            <Input
                              placeholder={t("userDetail.labels.inputTagName")}
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && addTag()}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsTagPopoverOpen(false)}
                              >
                                {t("userDetail.actions.cancel")}
                              </Button>
                              <Button
                                size="sm"
                                onClick={addTag}
                                disabled={!newTag.trim() || tagSaving}
                              >
                                {t("userDetail.actions.add")}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {userTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag.labelName}
                          <button
                            onClick={() => removeTag(tag.id as string)}
                            className="ml-1 hover:text-red-600"
                            disabled={tagSaving}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Basic Info Grid - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-600">{t("userDetail.labels.company")}</div>
                        <div className="text-sm">{user.companyName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-600">{t("userDetail.labels.location")}</div>
                        <div className="text-sm">
                          {user.country}/{user.city}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-600">{t("userDetail.labels.contact")}</div>
                        <div className="text-sm">{user.contact}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Business Metrics - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("userDetail.metrics.keyBusinessMetrics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {hasPermission("user.amountspent") && <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatWithSymbol(user.totalSpent, user.currency)}
                  </div>
                  <div className="text-xs text-gray-600">{t("userDetail.metrics.totalAmount")}</div>
                </div>
}
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {user.totalOrders}
                  </div>
                  <div className="text-xs text-gray-600">{t("userDetail.metrics.totalOrders")}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatWithSymbol(user.averageOrderValue, user.currency)}
                  </div>
                  <div className="text-xs text-gray-600">{t("userDetail.metrics.averageOrderValue")}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-bold text-gray-900">
                    {user.lastPurchaseDate}
                  </div>
                  <div className="text-xs text-gray-600">{t("userDetail.metrics.lastPurchaseTime")}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatWithSymbol(user.maxOrderAmount, user.currency)}
                  </div>
                  <div className="text-xs text-gray-600">{t("userDetail.metrics.maxOrderAmount")}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {user.averagePurchaseCycle}{t("userDetail.units.days")}
                  </div>
                  <div className="text-xs text-gray-600">{t("userDetail.metrics.averagePurchaseCycle")}</div>
                </div>
              </div>

              {/* Time-based Information */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t("userDetail.metrics.timelineInfo")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.firstVisitTime}
                    </div>
                    <div className="text-xs text-gray-600">{t("userDetail.metrics.firstVisitTime")}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.registrationTime}
                    </div>
                    <div className="text-xs text-gray-600">{t("userDetail.metrics.registrationTime")}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.firstPurchaseTime}
                    </div>
                    <div className="text-xs text-gray-600">{t("userDetail.metrics.firstPurchaseTime")}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.lastActiveTime}
                    </div>
                    <div className="text-xs text-gray-600">{t("userDetail.metrics.lastActiveTime")}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Data - Full Width */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timeline">{t("userDetail.tabs.accessTimeline")}</TabsTrigger>
                  <TabsTrigger value="statistics">{t("userDetail.tabs.businessStatistics")}</TabsTrigger>
                </TabsList>

                {/* Access Timeline Tab - NOW WITH SESSION TIMELINE */}
                <TabsContent value="timeline" className="space-y-6">
                  <SessionTimeline cdpUserId={user.cdpId} sessionId={user.sessionId} />
                </TabsContent>

                {/* Business Statistics Tab - NOW WITH ORDER HISTORY */}
                <TabsContent value="statistics">
                  <OrderHistory cdpUserId={user.cdpId} sessionId={user.sessionId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

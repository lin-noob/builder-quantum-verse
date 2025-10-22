import { useEffect, useMemo, useState } from "react";
import React from "react";
import { createPortal } from "react-dom";
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
  Calendar,
  Clock,
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
import { MockDataService } from "@/services/mockDataService";
// 添加用于日期格式化的工具函数
import { formatDateYMD } from "@/lib/utils";
// 引入事件类型以计算会话/转化/活跃指标
import { type ApiEvent, getUserEventList } from "@/lib/profile";

// TooltipIcon: 使用Portal将提示层渲染到body，避免被overflow或表格单元格裁剪
const TooltipIcon = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  const iconRef = React.useRef<SVGSVGElement>(null);
  const timerRef = React.useRef<number>();

  const open = () => {
    window.clearTimeout(timerRef.current);
    setShow(true);
  };
  const close = () => {
    timerRef.current = window.setTimeout(() => setShow(false), 100);
  };

  const [styles, setStyles] = useState<React.CSSProperties>({});
  React.useEffect(() => {
    if (!show || !iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    setStyles({
      position: 'fixed',
      top: rect.top - 6,
      left: rect.left + rect.width / 2,
      transform: 'translate(-50%, -100%)',
      zIndex: 9999,
    });
  }, [show]);

  return (
    <div className="inline-block">
      <svg
        ref={iconRef}
        className="w-3 h-3 text-gray-400 cursor-help"
        fill="currentColor"
        viewBox="0 0 20 20"
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {show &&
        createPortal(
          <div
            className="px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none"
            style={styles}
            onMouseEnter={open}
            onMouseLeave={close}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
};


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
        // 始终使用 Mock 数据加载用户详情
        const demo = await MockDataService.getApiUserById(cdpId);
        if (mounted) {
          if (demo) {
            setApiUser(demo);
          } else {
            setError(t("userDetail.error.userNotFound"));
          }
        }
      } catch (e: any) {
        console.error("Failed to load user detail (mock):", e);
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
  }, [cdpId]);

  const user = useMemo(() => {
    if (!apiUser) return null;
    return {
      // old UI-compatible fields
      userId: apiUser.userId ?? "",
      distinctId: apiUser.distinctId ?? "",
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
      firstVisitSource: apiUser.firstVisitSource || "",
      firstVisitMedium: apiUser.firstVisitMedium || "",
      ltv90Days: apiUser.ltv90Days ?? 0,
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
  // 新增：用于总览指标计算的事件数据
  const [behaviorEvents, setBehaviorEvents] = useState<ApiEvent[]>([]);
  const [orderEvents, setOrderEvents] = useState<ApiEvent[]>([]);

  // 拉取近200条行为事件与订单事件用于总览指标计算
  useEffect(() => {
    const loadMetrics = async () => {
      if (!user?.cdpId) return;
      try {
        // 始终使用 Mock 事件列表
        const beh = await MockDataService.getMockEventList(String(user.cdpId), String(user.distinctId), 1, 200, 2);
        const ord = await MockDataService.getMockEventList(String(user.cdpId), String(user.distinctId), 1, 200, 1);
        setBehaviorEvents(Array.isArray(beh?.records) ? beh!.records : []);
        setOrderEvents(Array.isArray(ord?.records) ? ord!.records : []);
      } catch (e) {
        console.warn("Failed to load overview metrics events (mock):", e);
        setBehaviorEvents([]);
        setOrderEvents([]);
      }
    };
    loadMetrics();
  }, [user?.cdpId, user?.distinctId]);

  // 计算近7天/30天相关指标（粗略）
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const behaviorLast7Days = behaviorEvents.filter(e => {
    const t = new Date(e.gmtCreate);
    return !isNaN(t.getTime()) && t >= sevenDaysAgo;
  });
  const behaviorLast30Days = behaviorEvents.filter(e => {
    const t = new Date(e.gmtCreate);
    return !isNaN(t.getTime()) && t >= thirtyDaysAgo;
  });
  const sessions7d = behaviorLast7Days.filter(e => e.eventName === "$pageview").length; // 粗略：以页面浏览近似会话次数
  const avgEventsPerSession7d = Math.round((behaviorLast7Days.length / Math.max(1, sessions7d)) * 10) / 10;
  const activeDays30d = (() => {
    const set = new Set<string>();
    behaviorLast30Days.forEach(e => set.add(formatDateYMD(e.gmtCreate)));
    return set.size;
  })();
  const ordersLast30Days = orderEvents.filter(e => {
    const t = new Date(e.gmtCreate);
    return !isNaN(t.getTime()) && t >= thirtyDaysAgo;
  });
  const ordersCount30d = ordersLast30Days.length;
  const conversionRate30d = Math.round((ordersCount30d / Math.max(1, behaviorLast30Days.length)) * 1000) / 10; // %
  const eventsCount7d = behaviorLast7Days.length;
  const eventsCount30d = behaviorLast30Days.length;
  const pageviews7d = behaviorLast7Days.filter(e => e.eventName === "$pageview").length;
  const pageviews30d = behaviorLast30Days.filter(e => e.eventName === "$pageview").length;
  const ordersAmount30d = ordersLast30Days.reduce((sum, e) => sum + (typeof e.price === "number" ? e.price : 0), 0);
  const aov30d = ordersCount30d ? ordersAmount30d / ordersCount30d : 0;
  const activeRate30d = Math.round((activeDays30d / 30) * 1000) / 10;
  const lastActiveYMD = behaviorEvents.length
    ? formatDateYMD(
        behaviorEvents.reduce((max, e) => (new Date(e.gmtCreate) > new Date(max) ? e.gmtCreate : max), behaviorEvents[0].gmtCreate)
    )
    : "-";

  const refetchUser = async () => {
    if (!cdpId) return;
    try {
      const demo = await MockDataService.getApiUserById(cdpId);
      if (demo) setApiUser(demo);
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
      // 本地更新标签，不调用真实 API
      const newTagObj = { id: `label-${Date.now()}`, labelName: value } as ApiLabel;
      setUserTags((prev) => [...prev, newTagObj]);
      setApiUser((prev) => prev ? { ...prev, labelList: [...(prev.labelList || []), newTagObj] } : prev);
      setIsTagPopoverOpen(false);
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
      // 本地更新标签，不调用真实 API
      setUserTags((prev) => prev.filter((tag) => tag.id !== id));
      setApiUser((prev) => prev ? { ...prev, labelList: (prev.labelList || []).filter((tag) => (tag.id as string) !== id) } : prev);
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
          {/* Main Content: Two-column layout - Identity left, Tabs right */}
          <Tabs defaultValue="overview" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            {/* Left: Core Identity (sticky) */}
            <div className="md:col-span-1">
              <div className="sticky top-4">
                <Card id="overview">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">
                        {user.name || String(user.cdpId).substring(0, 8)}
                      </h2>

                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">CDP ID:</span>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {user.userId}
                        </code>
                        <button onClick={handleCopyId} className="text-gray-400 hover:text-gray-600">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{t("userDetail.labels.statusTags")}</h4>
                          <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Plus className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">{t("userDetail.labels.addNewTag")}</h4>
                                  <p className="text-sm text-muted-foreground">{t("userDetail.labels.addNewTagDescription")}</p>
                                </div>
                                <Input
                                  placeholder={t("userDetail.labels.inputTagName")}
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setIsTagPopoverOpen(false)}>
                                    {t("userDetail.actions.cancel")}
                                  </Button>
                                  <Button size="sm" onClick={addTag} disabled={!newTag.trim() || tagSaving}>
                                    {t("userDetail.actions.add")}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {userTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {tag.labelName}
                              <button onClick={() => removeTag(tag.id as string)} className="ml-1 hover:text-red-600" disabled={tagSaving}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Basic Info */}
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
                            <div className="text-sm">{user.country}/{user.city}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-xs text-gray-600">{t("userDetail.labels.contact")}</div>
                            <div className="text-sm">{user.contact}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Time Information moved from Overview */}
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-600">{t("userDetail.metrics.firstVisitTime")}</div>
                          <div className="text-sm">{user.firstVisitTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-600">{t("userDetail.metrics.registrationTime")}</div>
                          <div className="text-sm">{user.registrationTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-600">{t("userDetail.metrics.firstPurchaseTime")}</div>
                          <div className="text-sm">{user.firstPurchaseTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-600">{t("userDetail.metrics.lastActiveTime")}</div>
                          <div className="text-sm">{user.lastActiveTime}</div>
                        </div>
                      </div>

                    </div>

                  <div className="mt-4 pt-2 border-t border-gray-200">
                    <TabsList className="flex flex-col w-full h-auto bg-transparent p-0 gap-1">
                      <TabsTrigger
                        className="w-full justify-start rounded-md px-3 py-2 text-sm hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-l-2 data-[state=active]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value="overview"
                      >
                        {t("userDetail.tabs.overview", "总览")}
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-full justify-start rounded-md px-3 py-2 text-sm hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-l-2 data-[state=active]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value="timeline"
                      >
                        访问时间线
                      </TabsTrigger>
                      <TabsTrigger
                        className="w-full justify-start rounded-md px-3 py-2 text-sm hover:bg-primary/5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-l-2 data-[state=active]:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value="statistics"
                      >
                        {t("userDetail.tabs.businessStatistics", "业务统计")}
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Tabbed Content */}
            <div className="md:col-span-1">
              <Card id="content">
                <CardContent className="p-6">
                  {/* Tabs navigation moved to left side */}

                  <TabsContent value="overview" className="space-y-6">
                      <div className="text-base font-semibold text-gray-900 mb-4">总览</div>
                      
                      {/* 用户档案表格 */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">用户档案</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-visible">
                          <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed">
                              <colgroup>
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                              </colgroup>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">公司</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.company || "-"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">地区</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{(user.country && user.city) ? `${user.country}/${user.city}` : (user.country || user.city || "-")}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">联系方式</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.contact || "-"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">首次访问时间</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.firstVisitTime || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">注册时间</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.registrationTime || "-"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">最后活跃时间</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.lastActiveTime || "-"}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* 90天内首访表格 */}
                      <div className="mb-6">
                        <hr className="border-gray-200 mb-4" />
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">90天内首访</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-visible">
                          <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed">
                              <colgroup>
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                              </colgroup>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>归因渠道类型</span>
                                      <TooltipIcon text="根据UTM参数和Referrer自动识别的流量渠道分类，包括付费广告、自然搜索、直接访问等" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {(() => {
                                      const source = user.firstVisitSource || "";
                                      const medium = user.firstVisitMedium || "";
                                      const referrer = user.firstReferrer || "";
                                      
                                      // 付费广告识别
                                      if (/cpc|ppc|paid|ads|sem|banner|email|social-paid/i.test(medium) || 
                                          /google-ads|baidu-sem|facebook-ads/i.test(source)) {
                                        return "付费广告";
                                      }
                                      
                                      // 自然搜索识别
                                      if ((/google\.com|baidu\.com|bing\.com|sogou\.com|360\.cn|yahoo\.com/i.test(referrer) ||
                                           /baidu|google|bing|sogou|yahoo|search/i.test(source)) &&
                                          !/cpc|ppc|paid|ads|sem/i.test(medium)) {
                                        return "自然搜索";
                                      }
                                      
                                      // 直接访问识别
                                      if ((!referrer || referrer.includes(window.location.hostname)) && 
                                          !source && !medium) {
                                        return "直接访问";
                                      }
                                      
                                      // 其他渠道
                                      return source || medium ? "其他渠道" : "直接访问";
                                    })()}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>具体来源平台</span>
                                      <TooltipIcon text="识别出的具体流量来源平台，如Google、百度、微信、抖音等" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {(() => {
                                      const source = user.firstVisitSource || "";
                                      const referrer = user.firstReferrer || "";
                                      
                                      if (/google/i.test(source) || /google\.com/i.test(referrer)) return "Google";
                                      if (/baidu/i.test(source) || /baidu\.com/i.test(referrer)) return "百度";
                                      if (/bing/i.test(source) || /bing\.com/i.test(referrer)) return "Bing";
                                      if (/facebook/i.test(source)) return "Facebook";
                                      if (/wechat|weixin/i.test(source)) return "微信";
                                      if (/douyin|tiktok/i.test(source)) return "抖音";
                                      
                                      try {
                                        return source || (referrer ? new URL(referrer).hostname : "-");
                                      } catch {
                                        return source || referrer || "-";
                                      }
                                    })()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>首访UTM来源</span>
                                      <TooltipIcon text="用户首次访问时URL中的utm_source参数值，标识流量来源" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.firstVisitSource || "-"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>首访UTM媒介</span>
                                      <TooltipIcon text="用户首次访问时URL中的utm_medium参数值，标识流量媒介类型" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.firstVisitMedium || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>首访Referrer</span>
                                      <TooltipIcon text="用户首次访问时的来源页面URL，即从哪个网站跳转过来的" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {user.firstReferrer ? (
                                      <span title={user.firstReferrer} className="truncate block">
                                        {(() => {
                                          try {
                                            return new URL(user.firstReferrer).hostname;
                                          } catch {
                                            return user.firstReferrer;
                                          }
                                        })()}
                                      </span>
                                    ) : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>搜索关键词</span>
                                      <TooltipIcon text="用户通过搜索引擎搜索时使用的关键词（如果可获取）" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.searchKeywords || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>是否付费流量</span>
                                      <TooltipIcon text="根据UTM参数自动判断是否为付费推广流量，如CPC、SEM等" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {/cpc|ppc|paid|ads|sem|banner|email|social-paid/i.test(user.firstVisitMedium || "") ||
                                     /google-ads|baidu-sem|facebook-ads/i.test(user.firstVisitSource || "") ? "是" : "否"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                    <div className="flex items-center gap-1">
                                      <span>归因锁定状态</span>
                                      <TooltipIcon text="表示当前用户的归因渠道是否被锁定。锁定后，后续来源不会覆盖上一次归因渠道。" />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {user.firstVisitTime ? "已锁定" : "未锁定"}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* 会话与参与度表格 */}
                      <div className="mb-6">
                        <hr className="border-gray-200 mb-4" />
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">会话与参与度</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed">
                              <colgroup>
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                              </colgroup>
                              <tbody className="divide-y divide-gray-200">
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天会话次数<TooltipIcon text="最近30天内的总会话数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.sessions30d ?? 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">跳出率<TooltipIcon tip="只浏览一个页面就离开的会话占比" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.bounceRate ?? 0}%</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近7天事件数<TooltipIcon text="最近7天内的总事件数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.eventsCount7d ?? 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">页面浏览量<TooltipIcon text="累计浏览的页面总数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.pageViews ?? 0}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天事件数<TooltipIcon text="最近30天内的总事件数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.eventsCount30d ?? 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天页面浏览<TooltipIcon text="最近30天内浏览的页面总数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.pageviews30d ?? 0}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* 转化相关表格 */}
                      <div className="mb-6">
                        <hr className="border-gray-200 mb-4" />
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">转化相关</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full table-fixed">
                              <colgroup>
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                                <col className="w-1/4" />
                              </colgroup>
                              <tbody className="divide-y divide-gray-200">
                                {hasPermission("user.amountspent") && (
                                  <tr>
                                    <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">总消费金额</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{formatWithSymbol(user.totalSpent, user.currency)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">总订单数</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{user.totalOrders}</td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">平均订单价值</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatWithSymbol(user.averageOrderValue, user.currency)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">最后购买时间</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user.lastPurchaseDate}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">90天LTV<TooltipIcon text="最近90天的生命周期总价值（下单金额总和）" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatWithSymbol(user.ltv90Days ?? 0, user.currency)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天下单次数</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{ordersCount30d}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天订单金额</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatWithSymbol(ordersAmount30d, user.currency)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天AOV<TooltipIcon text="最近30天内每笔订单的平均金额" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{formatWithSymbol(aov30d, user.currency)}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">下单转化率（事件/订单）</td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{isFinite(conversionRate30d) ? `${conversionRate30d}%` : "-"}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50"></td>
                                  <td className="px-4 py-3 text-sm text-gray-900"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>


  </TabsContent>

                    <TabsContent value="timeline" className="space-y-6">
                      <div className="text-base font-semibold text-gray-900 mb-3">访问时间线</div>
                      <SessionTimeline cdpUserId={user.cdpId} sessionId={user.distinctId} />
                    </TabsContent>

                    <TabsContent value="statistics">
                      <div className="text-base font-semibold text-gray-900 mb-3">{t("userDetail.tabs.businessStatistics", "业务统计")}</div>
                      <OrderHistory cdpUserId={user.cdpId} sessionId={user.distinctId} />
                    </TabsContent>
                </CardContent>
              </Card>
            </div>
          </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

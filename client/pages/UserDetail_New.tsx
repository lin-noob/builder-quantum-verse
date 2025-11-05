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
      sessionId: apiUser.sessionId,
      userEngagement: apiUser.userEngagement
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
  // 新增：首访字段折叠/展开状态
  const [showAllFirstVisitFields, setShowAllFirstVisitFields] = useState(false);

  // 渠道类型判断逻辑 - 按照优先级和详细判断条件实现
  const getChannelType = useMemo(() => {
    // 获取所有相关字段
    const source = apiUser?.firstVisitSource || user?.firstVisitSource || "";
    const medium = apiUser?.firstVisitMedium || user?.firstVisitMedium || "";
    const campaign = apiUser?.firstVisitCampaign || "";
    const content = apiUser?.firstVisitContent || "";
    const term = apiUser?.firstVisitTerm || "";
    const referrer = apiUser?.firstReferrer || "";
    
    // 所有 Click ID 字段（以 clid 结尾的字段）
    const clickIds = {
      gclid: apiUser?.gclid || "",
      fbclid: apiUser?.fbclid || "",
      msclkid: apiUser?.msclkid || "",
      ttclid: apiUser?.ttclid || "",
      twclid: apiUser?.twclid || "",
      dclid: apiUser?.dclid || "",
      qclid: apiUser?.qclid || "",
      rdt_cid: apiUser?.rdt_cid || "",
      irclid: apiUser?.irclid || "",
      li_fat_id: apiUser?.li_fat_id || "",
      mc_cid: apiUser?.mc_cid || "",
      sccid: apiUser?.sccid || "",
      // 其他相关广告标识
      gad_source: apiUser?.gad_source || "",
      gbraid: apiUser?.gbraid || "",
      wbraid: apiUser?.wbraid || "",
      epik: apiUser?.epik || "",
      _kx: apiUser?._kx || ""
    };
    
    // 步骤 1: 付费广告 (Click ID 自动追踪) - 最高优先级
    const hasClickId = Object.values(clickIds).some(id => Boolean(id));
    if (hasClickId) {
      return { type: "付费广告", color: "bg-red-100 text-red-800" };
    }
    
    // 步骤 2: 付费广告 (UTM 标记) - 检查 utm_medium 是否标记了明确的付费渠道
    const paidMediums = ['cpc', 'ppc', 'paid', 'banner', 'email', 'display'];
    const isPaidMedium = paidMediums.some(paidType => 
      medium.toLowerCase().includes(paidType.toLowerCase())
    );
    if (isPaidMedium) {
      return { type: "付费广告", color: "bg-red-100 text-red-800" };
    }
    
    // 步骤 3: 自然搜索 (Organic) - 基于 Referrer 判断
    const searchEngines = ['google.com', 'bing.com', 'baidu.com', 'yahoo.com', 'duckduckgo.com', 'yandex.com'];
    const isFromSearchEngine = searchEngines.some(engine => 
      referrer.toLowerCase().includes(engine)
    );
    // 确保不是付费媒介且来自搜索引擎
    if (isFromSearchEngine && !isPaidMedium && !hasClickId) {
      return { type: "自然搜索", color: "bg-green-100 text-green-800" };
    }
    
    // 步骤 4: 其他渠道 (UTM 标记) - 有明确的 UTM 标记但不是付费广告或自然搜索
    const hasUtmParams = Boolean(source || medium || campaign || content || term);
    if (hasUtmParams) {
      return { type: "其他渠道", color: "bg-gray-100 text-gray-800" };
    }
    
    // 步骤 5: 直接访问 (Direct) - 最低优先级，排除所有其他情况后的默认分类
    // 所有 Click ID 字段均为空，所有 UTM 参数均为空，Referrer 为空或内部页面
    const isInternalReferrer = referrer && (
      referrer.includes(window.location.hostname) || 
      referrer.startsWith('/') ||
      referrer === ''
    );
    
    if (!hasClickId && !hasUtmParams && (!referrer || isInternalReferrer)) {
      return { type: "直接访问", color: "bg-blue-100 text-blue-800" };
    }
    
    // 兜底情况：如果有 referrer 但不符合其他条件，归为其他渠道
    return { type: "其他渠道", color: "bg-gray-100 text-gray-800" };
  }, [apiUser, user]);

  // 新增：首访字段定义（按需求给定顺序与提示文案）
  const firstVisitFieldDefs = useMemo(() => {
    const gbraidWbraid = [apiUser?.gbraid, apiUser?.wbraid].filter(Boolean).join(" / ");
    return [
      { key: "referrer", label: "Referrer", hint: "HTTP 引用来源，标识用户是从哪个网页链接点击进入当前页面的完整 URL", value: apiUser?.firstReferrer || "" },
      { key: "utm_source", label: "utm_source", hint: "流量来源，标识用户是从哪个网站或平台来的（如 google、facebook、newsletter）", value: apiUser?.utm_source || "" },
      { key: "utm_medium", label: "utm_medium", hint: "流量媒介，标识用户是通过什么方式来的（如 cpc、email、social）", value: apiUser?.utm_medium || "" },
      { key: "utm_campaign", label: "utm_campaign", hint: "营销活动名称，标识具体的推广活动（如 summer_sale、product_launch）", value: apiUser?.utm_campaign || "" },
      { key: "utm_content", label: "utm_content", hint: "广告内容标识，用于区分同一活动中不同版本或位置的广告（如 banner_a、link_b）", value: apiUser?.utm_content || "" },
      { key: "utm_term", label: "utm_term", hint: "关键词，主要用于付费搜索广告，标识用户搜索的关键词（如 running+shoes）", value: apiUser?.utm_term || "" },
      { key: "gclid", label: "gclid", hint: "Google Ads 自动标记参数，用于追踪 Google 广告点击", value: apiUser?.gclid || "" },
      { key: "gad_source", label: "gad_source", hint: "Google 广告平台的来源标识符", value: apiUser?.gad_source || "" },
      { key: "gclsrc", label: "gclsrc", hint: "Google 广告来源标识符，用于标识广告来源", value: apiUser?.gclsrc || "" },
      { key: "gbraid/wbraid", label: "gbraid/wbraid", hint: "Google 隐私保护型广告点击标识符，用于替代 gclid（iOS 14 之后）", value: gbraidWbraid || "" },
      // { key: "token", label: "token", hint: "内部系统生成的唯一标识符，用于追踪或验证用户行为或会话", value: apiUser?.token || "" },
      // { key: "title", label: "title", hint: "页面或活动的标题，用于标识当前页面或活动名称", value: apiUser?.title || "" },
      { key: "fbclid", label: "fbclid", hint: "Facebook 广告点击标识符，用于追踪 Facebook 广告点击", value: apiUser?.fbclid || "" },
      { key: "msclkid", label: "msclkid", hint: "Microsoft Advertising（Bing）广告点击标识符", value: apiUser?.msclkid || "" },
      { key: "ttclid", label: "ttclid", hint: "TikTok 广告点击标识符，用于追踪 TikTok 广告点击", value: apiUser?.ttclid || "" },
      { key: "twclid", label: "twclid", hint: "Twitter 广告点击标识符，用于追踪 Twitter 广告点击", value: apiUser?.twclid || "" },
      { key: "qclid", label: "qclid", hint: "可能是某个广告平台的点击标识符，非标准字段", value: apiUser?.qclid || "" },
      { key: "dclid", label: "dclid", hint: "DoubleClick 广告点击标识符，用于追踪 DoubleClick 广告点击", value: apiUser?.dclid || "" },
      { key: "rdt_cid", label: "rdt_cid", hint: "Reddit 广告点击标识符，用于追踪 Reddit 广告点击", value: apiUser?.rdt_cid || "" },
      { key: "irclid", label: "irclid", hint: "Impact Radius 广告点击标识符，用于追踪 Impact Radius 广告点击", value: apiUser?.irclid || "" },
      { key: "li_fat_id", label: "li_fat_id", hint: "LinkedIn 广告点击标识符，用于追踪 LinkedIn 广告点击", value: apiUser?.li_fat_id || "" },
      { key: "mc_cid", label: "mc_cid", hint: "Mailchimp 活动 ID，用于追踪 Mailchimp 邮件活动", value: apiUser?.mc_cid || "" },
      { key: "sccid", label: "sccid", hint: "Snapchat 广告点击标识符，用于追踪 Snapchat 广告点击", value: apiUser?.sccid || "" },
      { key: "igshid", label: "igshid", hint: "Instagram 分享或广告点击标识符，用于追踪 Instagram 相关行为", value: apiUser?.igshid || "" },
      { key: "_kx", label: "_kx", hint: "可能是某个内部系统或第三方工具的标识符，非标准字段", value: apiUser?._kx || "" },
      { key: "epik", label: "epik", hint: "可能是某个广告平台或内部系统的标识符，非标准字段", value: apiUser?.epik || "" },
    ];
  }, [apiUser, user]);

  // 拉取近200条行为事件与订单事件用于总览指标计算
  // useEffect(() => {
  //   const loadMetrics = async () => {
  //     if (!user?.cdpId) return;
  //     try {
  //       // 始终使用 Mock 事件列表
  //       const beh = await MockDataService.getMockEventList(String(user.cdpId), String(user.distinctId), 1, 200, 2);
  //       const ord = await MockDataService.getMockEventList(String(user.cdpId), String(user.distinctId), 1, 200, 1);
  //       setBehaviorEvents(Array.isArray(beh?.records) ? beh!.records : []);
  //       setOrderEvents(Array.isArray(ord?.records) ? ord!.records : []);
  //     } catch (e) {
  //       console.warn("Failed to load overview metrics events (mock):", e);
  //       setBehaviorEvents([]);
  //       setOrderEvents([]);
  //     }
  //   };
  //   loadMetrics();
  // }, [user?.cdpId, user?.distinctId]);

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
                            <div className="text-sm">{user.company}</div>
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">90天内首访</h3>
                            <Badge className={`text-xs ${getChannelType.color}`}>
                              {getChannelType.type}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowAllFirstVisitFields(v => !v)}>
                            {showAllFirstVisitFields ? "收起" : "展开全部"}
                          </Button>
                        </div>
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
                                {(() => {
                                  const fields = showAllFirstVisitFields ? firstVisitFieldDefs : firstVisitFieldDefs.slice(0, 8);
                                  const rows = [];
                                  for (let i = 0; i < fields.length; i += 2) {
                                    const field1 = fields[i];
                                    const field2 = fields[i + 1];
                                    rows.push(
                                      <tr key={`row-${i}`}>
                                        <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                          <div className="flex items-center gap-1">
                                            <span>{field1.label}</span>
                                            <TooltipIcon text={field1.hint} />
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{field1.value || "-"}</td>
                                        {field2 ? (
                                          <>
                                            <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">
                                              <div className="flex items-center gap-1">
                                                <span>{field2.label}</span>
                                                <TooltipIcon text={field2.hint} />
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{field2.value || "-"}</td>
                                          </>
                                        ) : (
                                          <>
                                            <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50"></td>
                                            <td className="px-4 py-3 text-sm text-gray-900"></td>
                                          </>
                                        )}
                                      </tr>
                                    );
                                  }
                                  return rows;
                                })()}
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
                                  <td className="px-4 py-3 text-sm text-gray-900">{user?.userEngagement?.sessionCount30d ?? 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">跳出率<TooltipIcon text="只浏览一个页面就离开的会话占比" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user?.userEngagement?.bounceRate30d ?? 0}%</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近7天事件数<TooltipIcon text="最近7天内的总事件数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user?.userEngagement?.eventCount7d ?? 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">页面浏览量<TooltipIcon text="累计浏览的页面总数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user?.userEngagement?.pageView30dTotal ?? 0}</td>
                                </tr>
                                <tr>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天事件数<TooltipIcon text="最近30天内的总事件数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user?.userEngagement?.eventCount30d ?? 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-900 bg-gray-50">近30天页面浏览<TooltipIcon text="最近30天内浏览的页面总数" /></td>
                                  <td className="px-4 py-3 text-sm text-gray-900">{user?.userEngagement?.pageView30d ?? 0}</td>
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
                      <SessionTimeline cdpUserId={user.cdpId} sessionId={user.distinctId} />
                    </TabsContent>

                    <TabsContent value="statistics">
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

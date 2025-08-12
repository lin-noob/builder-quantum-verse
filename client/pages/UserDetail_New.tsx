import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function UserDetail() {
  const { cdpId } = useParams<{ cdpId: string }>();
  const [loading, setLoading] = useState(false);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!cdpId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getProfileView(cdpId);
        if (mounted) setApiUser(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "加载失败");
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
      lastPurchaseDate: apiUser.maxBuyTime,
      maxOrderAmount: apiUser.maxOrderAmount,
      averagePurchaseCycle: (() => {
        const daysSpan = getDaysBetween(apiUser.maxBuyTime, apiUser.minBuyTime);
        const orders = Number(apiUser.orderCount) || 0;
        if (!daysSpan || Number.isNaN(daysSpan)) return 0;
        if (orders <= 1) return daysSpan; // 无法计算间隔，用跨度天数
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
    if (!cdpId) return;
    try {
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
        <div className="text-center text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">加载失败</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/users" className="text-blue-600 hover:text-blue-800">
            返回用户列表
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">用户未找到</p>
          <p className="text-gray-600 mb-4">指定的用户ID不存在</p>
          <Link to="/users" className="text-blue-600 hover:text-blue-800">
            返回用户列表
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.cdpId);
    toast({ title: "已复制", description: "CDP ID已复制到剪贴板" });
  };

  const addTag = async () => {
    const value = newTag.trim();
    if (!value) return;
    // if (userTags.includes(value)) {
    //   toast({ title: "重复标签", description: "该标签已存在" });
    //   setNewTag("");
    //   setIsTagPopoverOpen(false);
    //   return;
    // }
    setTagSaving(true);

    setNewTag("");
    try {
      await addProfileLabel(String(user.cdpId), value);
      // optimistic update
      // setUserTags((prev) => [...prev, value]);

      // Close input immediately for better UX
      setIsTagPopoverOpen(false);

      // then refetch to get server ids
      await refetchUser();
      toast({ title: "添加成功", description: `已添加标签：${value}` });
    } catch (e: any) {
      toast({ title: "添加失败", description: e?.message || "请稍后重试" });
    } finally {
      setTagSaving(false);
    }
  };

  const removeTag = async (id: string) => {
    setTagSaving(true);
    try {
      await deleteProfileLabel(id);
      // setUserTags((prev) => prev.filter((t) => t !== tagToRemove));
      // setLabelNameToId((prev) => {
      //   const { [tagToRemove]: _, ...rest } = prev;
      //   return rest;
      // });
      // refresh from server to keep一致
      await refetchUser();
      toast({ title: "删除成功" });
    } catch (e: any) {
      toast({ title: "删除失败", description: e?.message || "请稍后重试" });
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

  function formatWithSymbol(amount: number, symbol: string) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "decimal", // 只格式化数字，不加货币
      minimumFractionDigits: 2, // 保留两位小数
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
                      {user.cdpId}
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
                        状态标签
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
                              <h4 className="font-medium">添加新标签</h4>
                              <p className="text-sm text-muted-foreground">
                                用户添加一个新的状态标签
                              </p>
                            </div>
                            <Input
                              placeholder="输入标签名称"
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
                                取消
                              </Button>
                              <Button
                                size="sm"
                                onClick={addTag}
                                disabled={!newTag.trim() || tagSaving}
                              >
                                添加
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
                            onClick={() => removeTag(tag.id)}
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
                        <div className="text-xs text-gray-600">公司</div>
                        <div className="text-sm">{user.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-xs text-gray-600">位置</div>
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
                        <div className="text-xs text-gray-600">联系</div>
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
              <CardTitle className="text-lg">关键业务指标</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatWithSymbol(user.totalSpent, user.currency)}
                  </div>
                  <div className="text-xs text-gray-600">总消费金额</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {user.totalOrders}
                  </div>
                  <div className="text-xs text-gray-600">总订单数</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatWithSymbol(user.averageOrderValue, user.currency)}
                  </div>
                  <div className="text-xs text-gray-600">平均客单价</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-bold text-gray-900">
                    {user.lastPurchaseDate}
                  </div>
                  <div className="text-xs text-gray-600">上次购买时间</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatWithSymbol(user.maxOrderAmount, user.currency)}
                  </div>
                  <div className="text-xs text-gray-600">最高单笔订单</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {user.averagePurchaseCycle}天
                  </div>
                  <div className="text-xs text-gray-600">平均购买周期</div>
                </div>
              </div>

              {/* Time-based Information */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  时间轴信息
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.firstVisitTime}
                    </div>
                    <div className="text-xs text-gray-600">首次访问时间</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.registrationTime}
                    </div>
                    <div className="text-xs text-gray-600">注册时间</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.firstPurchaseTime}
                    </div>
                    <div className="text-xs text-gray-600">首次购买时间</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">
                      {user.lastActiveTime}
                    </div>
                    <div className="text-xs text-gray-600">最后活跃时间</div>
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
                  <TabsTrigger value="timeline">访问时间线</TabsTrigger>
                  <TabsTrigger value="statistics">业务统计</TabsTrigger>
                </TabsList>

                {/* Access Timeline Tab - NOW WITH SESSION TIMELINE */}
                <TabsContent value="timeline" className="space-y-6">
                  <SessionTimeline />
                </TabsContent>

                {/* Business Statistics Tab - NOW WITH ORDER HISTORY */}
                <TabsContent value="statistics">
                  <OrderHistory />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

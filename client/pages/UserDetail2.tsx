import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchUserDetail,
  type UserDetailResponse,
} from "@shared/userProfileData";
import { toast } from "@/hooks/use-toast";

// Mock activity data for the chart
const mockActivityData = [
  { date: "2025-07-15", sessions: 3, pageViews: 12, duration: 25 },
  { date: "2025-07-16", sessions: 1, pageViews: 5, duration: 8 },
  { date: "2025-07-17", sessions: 4, pageViews: 18, duration: 42 },
  { date: "2025-07-18", sessions: 2, pageViews: 8, duration: 15 },
  { date: "2025-07-19", sessions: 0, pageViews: 0, duration: 0 },
  { date: "2025-07-20", sessions: 5, pageViews: 22, duration: 55 },
  { date: "2025-07-21", sessions: 3, pageViews: 14, duration: 28 },
];

export default function UserDetail2() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const loadUserDetail = async () => {
      if (!userId) return;

      try {
        const detail = await fetchUserDetail(userId);
        setUserDetail(detail);
        // Extract tags from the profile data
        const tagsFromProfile =
          detail.allProfileData.value["标签与分层"]["手动标签"];
        if (tagsFromProfile) {
          setUserTags(tagsFromProfile.split(", "));
        }
      } catch (error) {
        console.error("Failed to load user detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserDetail();
  }, [userId]);

  const handleCopyId = () => {
    if (userId) {
      navigator.clipboard.writeText(userId);
      toast({ title: "已复制", description: "CDP ID已复制到剪贴板" });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !userTags.includes(newTag.trim())) {
      setUserTags([...userTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUserTags(userTags.filter((tag) => tag !== tagToRemove));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-full">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary rounded mb-6 w-32"></div>
          <div className="h-8 bg-secondary rounded mb-6 w-48"></div>
          <div className="space-y-4">
            <div className="h-64 bg-secondary rounded"></div>
            <div className="h-48 bg-secondary rounded"></div>
            <div className="h-96 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground font-medium mb-2">用户未找到</p>
          <p className="text-muted-foreground mb-4">指定的用户ID不存在</p>
          <Button onClick={() => navigate("/users2")}>返回用户列表</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {userDetail.basicInfo.email.split("@")[0]}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Identity Information Card - Full Width */}
        <Card className="bg-background rounded-lg border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {userDetail.basicInfo.email.split("@")[0]}
                </h2>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">CDP ID:</span>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {userId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Tag Management */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    标签管理
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {userTags.map((tag, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="添加新标签"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="text-sm"
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Basic Info Grid - 3 columns */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">邮箱</dt>
                    <dd className="text-sm text-foreground">
                      {userDetail.basicInfo.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">手机</dt>
                    <dd className="text-sm text-foreground">
                      {userDetail.basicInfo.phone}
                    </dd>
                  </div>
                </dl>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">公司</dt>
                    <dd className="text-sm text-foreground">
                      {userDetail.basicInfo.company}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">职位</dt>
                    <dd className="text-sm text-foreground">
                      {userDetail.basicInfo.title}
                    </dd>
                  </div>
                </dl>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">性别</dt>
                    <dd className="text-sm text-foreground">
                      {userDetail.basicInfo.gender}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">年龄</dt>
                    <dd className="text-sm text-foreground">
                      {userDetail.basicInfo.age}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Card - Full Width */}
        <Card className="bg-background rounded-lg border">
          <CardHeader>
            <CardTitle className="text-lg">关键指标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">总消费金额</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.totalSpend}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">总订单数</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.totalOrders}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">平均客单价</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.avgValue}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">最后购买</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.lastPurchaseDays}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">平均周期</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.avgCycle}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">LTV分位</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.ltvQuintile}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">RFM分群</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.rfmSegment}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">生命周期</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.lifecycleStage}
                </dd>
              </dl>
              <dl className="text-center">
                <dt className="text-xs text-muted-foreground">复购率</dt>
                <dd className="text-sm font-semibold text-foreground">
                  {userDetail.kpis.repurchaseRate}
                </dd>
              </dl>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Data - Full Width */}
        <Card className="bg-background rounded-lg border">
          <CardContent className="p-6">
            <Tabs defaultValue="dossier" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dossier">用户档案</TabsTrigger>
                <TabsTrigger value="timeline">访问与行为时间线</TabsTrigger>
                <TabsTrigger value="orders">业务与订单统计</TabsTrigger>
              </TabsList>

              {/* User Dossier Tab */}
              <TabsContent value="dossier" className="space-y-4">
                <Tabs defaultValue="identity" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="identity">身份与标签</TabsTrigger>
                    <TabsTrigger value="value">价值与生命周期</TabsTrigger>
                    <TabsTrigger value="behavior">行为与意图</TabsTrigger>
                    <TabsTrigger value="tech">技术环境</TabsTrigger>
                  </TabsList>

                  <TabsContent value="identity" className="space-y-4">
                    {Object.entries(userDetail.allProfileData.identity).map(
                      ([groupName, data]) => (
                        <div key={groupName}>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            {groupName}
                          </h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <dt className="text-xs text-muted-foreground">
                                  {key}
                                </dt>
                                <dd className="text-sm text-foreground">
                                  {value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ),
                    )}
                  </TabsContent>

                  <TabsContent value="value" className="space-y-4">
                    {Object.entries(userDetail.allProfileData.value).map(
                      ([groupName, data]) => (
                        <div key={groupName}>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            {groupName}
                          </h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <dt className="text-xs text-muted-foreground">
                                  {key}
                                </dt>
                                <dd className="text-sm text-foreground">
                                  {value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ),
                    )}
                  </TabsContent>

                  <TabsContent value="behavior" className="space-y-4">
                    {Object.entries(userDetail.allProfileData.behavior).map(
                      ([groupName, data]) => (
                        <div key={groupName}>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            {groupName}
                          </h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <dt className="text-xs text-muted-foreground">
                                  {key}
                                </dt>
                                <dd className="text-sm text-foreground">
                                  {value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ),
                    )}
                  </TabsContent>

                  <TabsContent value="tech" className="space-y-4">
                    {Object.entries(userDetail.allProfileData.tech).map(
                      ([groupName, data]) => (
                        <div key={groupName}>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            {groupName}
                          </h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {Object.entries(data).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <dt className="text-xs text-muted-foreground">
                                  {key}
                                </dt>
                                <dd className="text-sm text-foreground">
                                  {value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ),
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                {/* Activity Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickCount={5} minTickGap={5} />
                      <YAxis tickCount={5} minTickGap={5} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="pageViews"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Session Details */}
                <Accordion type="single" collapsible className="w-full">
                  {userDetail.sessions.map((session, index) => (
                    <AccordionItem key={index} value={`session-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex justify-between w-full pr-4">
                          <div>
                            <div className="font-medium">{session.time}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.duration} • {session.source} •{" "}
                              {session.device}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {session.events.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className="p-3 bg-muted rounded text-sm"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {event.desc}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {event.url}
                                  </div>
                                  {event.duration && (
                                    <div className="text-xs text-muted-foreground">
                                      停留时长: {event.duration}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {event.time}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {userDetail.orders.map((order, index) => (
                    <AccordionItem key={index} value={`order-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex justify-between w-full pr-4">
                          <div>
                            <div className="font-medium">{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.time}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(order.total)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.status}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">支付方式:</span>{" "}
                              {order.payment}
                            </div>
                            <div>
                              <span className="font-medium">订单状态:</span>{" "}
                              {order.status}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2">商品明细</h5>
                            <div className="space-y-2">
                              {order.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex justify-between items-center p-3 bg-muted rounded text-sm"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {item.name}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {formatCurrency(item.price)} × {item.qty}
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(item.total)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

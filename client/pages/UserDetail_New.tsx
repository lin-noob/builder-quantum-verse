import { useState } from "react";
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
import { getUserById, type User as UserType } from "@shared/userData";
import { toast } from "@/hooks/use-toast";

export default function UserDetail() {
  const { cdpId } = useParams<{ cdpId: string }>();
  const user: UserType | undefined = cdpId ? getUserById(cdpId) : undefined;

  const [userTags, setUserTags] = useState<string[]>(user?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [openSessions, setOpenSessions] = useState<Set<string>>(new Set());

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

  const addTag = () => {
    if (newTag.trim() && !userTags.includes(newTag.trim())) {
      setUserTags([...userTags, newTag.trim()]);
      setNewTag("");
      setIsTagPopoverOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUserTags(userTags.filter((tag) => tag !== tagToRemove));
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/users"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
        </div>

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
                                disabled={!newTag.trim()}
                              >
                                添加
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {userTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
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
                    {formatCurrency(user.totalSpent)}
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
                    {formatCurrency(user.averageOrderValue)}
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
                    {formatCurrency(user.maxOrderAmount)}
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

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
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUserById, type User as UserType } from "@shared/userData";
import { toast } from "@/hooks/use-toast";

export default function UserDetail() {
  const { cdpId } = useParams<{ cdpId: string }>();
  const user: UserType | undefined = cdpId ? getUserById(cdpId) : undefined;
  
  const [userTags, setUserTags] = useState<string[]>(user?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [openSessions, setOpenSessions] = useState<Set<string>>(new Set());
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const ordersPerPage = 5;

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
      setIsTagDialogOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setUserTags(userTags.filter(tag => tag !== tagToRemove));
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

  const toggleOrder = (orderNumber: string) => {
    const newOpenOrders = new Set(openOrders);
    if (newOpenOrders.has(orderNumber)) {
      newOpenOrders.delete(orderNumber);
    } else {
      newOpenOrders.add(orderNumber);
    }
    setOpenOrders(newOpenOrders);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Order pagination logic
  const totalOrderPages = Math.ceil(user.orders.length / ordersPerPage);
  const startOrderIndex = (currentOrderPage - 1) * ordersPerPage;
  const endOrderIndex = startOrderIndex + ordersPerPage;
  const currentOrders = user.orders.slice(startOrderIndex, endOrderIndex);

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
                    <button onClick={handleCopyId} className="text-gray-400 hover:text-gray-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tag Management */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">状态标签</h4>
                      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            添加标签
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] absolute top-full left-0 mt-2">
                          <DialogHeader>
                            <DialogTitle>添加新标签</DialogTitle>
                            <DialogDescription>
                              为用户添加一个新的状态标签
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              placeholder="输入标签名称"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                                取消
                              </Button>
                              <Button onClick={addTag} disabled={!newTag.trim()}>
                                添加
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {userTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
                        <div className="text-sm">{user.country}/{user.city}</div>
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
                  <div className="text-lg font-bold text-gray-900">{user.totalOrders}</div>
                  <div className="text-xs text-gray-600">总订单数</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(user.averageOrderValue)}
                  </div>
                  <div className="text-xs text-gray-600">平均客单价</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm font-bold text-gray-900">{user.lastPurchaseDate}</div>
                  <div className="text-xs text-gray-600">上次购买时间</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(user.maxOrderAmount)}
                  </div>
                  <div className="text-xs text-gray-600">最高单笔订单</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{user.averagePurchaseCycle}天</div>
                  <div className="text-xs text-gray-600">平均购买周期</div>
                </div>
              </div>

              {/* Time-based Information */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">时间轴信息</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">{user.firstVisitTime}</div>
                    <div className="text-xs text-gray-600">首次访问时间</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">{user.registrationTime}</div>
                    <div className="text-xs text-gray-600">注册时间</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">{user.firstPurchaseTime}</div>
                    <div className="text-xs text-gray-600">首次购买时间</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-bold text-gray-700">{user.lastActiveTime}</div>
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

                {/* Access Timeline Tab */}
                <TabsContent value="timeline" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>近期动态摘要</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.sessions.length > 0 ? (
                        <div className="space-y-3">
                          {user.sessions.slice(0, 3).map((session) => (
                            <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-sm">页面访问</div>
                                <div className="text-xs text-gray-600">{session.summary}</div>
                              </div>
                              <div className="text-xs text-gray-500">{session.date}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">暂无访问记录</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>详细访问会话</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.sessions.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                          {user.sessions.map((session) => (
                            <Collapsible key={session.id}>
                              <CollapsibleTrigger 
                                className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                                onClick={() => toggleSession(session.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {openSessions.has(session.id) ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                  <div className="text-left">
                                    <div className="font-medium">{session.date}</div>
                                    <div className="text-sm text-gray-600">{session.summary}</div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {session.source} • {session.deviceType}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="px-4 pb-4">
                                <div className="mt-4 space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                                    <div><strong>操作系统:</strong> {session.os}</div>
                                    <div><strong>浏览器:</strong> {session.browser}</div>
                                    <div><strong>位置:</strong> {session.location}</div>
                                    <div><strong>IP地址:</strong> {session.ipAddress}</div>
                                  </div>
                                  <div className="border-t pt-3">
                                    <h5 className="font-medium mb-2">事件时间线</h5>
                                    <div className="space-y-2">
                                      {session.events.map((event, index) => (
                                        <div key={index} className="text-sm bg-white p-3 rounded border">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <div className="font-medium">{event.pageTitle}</div>
                                              <div className="text-gray-600">{event.pageUrl}</div>
                                              <div className="text-xs text-gray-500">
                                                停留时长: {event.stayDuration} • 滚动深度: {event.scrollDepth}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-500">{event.timestamp}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">暂无访问会话记录</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Business Statistics Tab */}
                <TabsContent value="statistics">
                  <Card>
                    <CardHeader>
                      <CardTitle>订单统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {user.orders.length > 0 ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {currentOrders.map((order) => (
                              <Collapsible key={order.orderNumber}>
                                <CollapsibleTrigger
                                  className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                                  onClick={() => toggleOrder(order.orderNumber)}
                                >
                                  <div className="flex items-center gap-3">
                                    {openOrders.has(order.orderNumber) ?
                                      <ChevronDown className="h-4 w-4" /> :
                                      <ChevronRight className="h-4 w-4" />
                                    }
                                    <div className="text-left">
                                      <div className="font-medium">{order.orderNumber}</div>
                                      <div className="text-sm text-gray-600">{order.orderDate}</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                                    <div className="text-sm text-gray-600">{order.status}</div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="px-4 pb-4">
                                  <div className="mt-4 space-y-4">
                                    {/* 基础信息 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                                      <div><strong>币种:</strong> {order.currency}</div>
                                      <div><strong>支付方式:</strong> {order.paymentMethod}</div>
                                      {order.discountCode && (
                                        <div><strong>优惠码:</strong> <span className="text-green-600">{order.discountCode}</span></div>
                                      )}
                                    </div>

                                    {/* 金额明细 */}
                                    <div className="border-t pt-3">
                                      <h5 className="font-medium mb-2">金额明细</h5>
                                      <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>商品总价:</span>
                                          <span>{formatCurrency(order.subtotalAmount || order.totalAmount)}</span>
                                        </div>
                                        {(order.shippingAmount && order.shippingAmount > 0) && (
                                          <div className="flex justify-between">
                                            <span>运费:</span>
                                            <span>{formatCurrency(order.shippingAmount)}</span>
                                          </div>
                                        )}
                                        {(order.taxAmount && order.taxAmount > 0) && (
                                          <div className="flex justify-between">
                                            <span>税费:</span>
                                            <span>{formatCurrency(order.taxAmount)}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between font-medium text-base border-t border-gray-200 pt-2">
                                          <span>订单总金额:</span>
                                          <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 商品明细 */}
                                    <div className="border-t pt-3">
                                      <h5 className="font-medium mb-2">商品明细</h5>
                                      <div className="space-y-2">
                                        {order.items.map((item, index) => (
                                          <div key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded border">
                                            <div>
                                              <div className="font-medium">{item.productName}</div>
                                              <div className="text-gray-600">
                                                {formatCurrency(item.unitPrice)} × {item.quantity}
                                              </div>
                                            </div>
                                            <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 地址信息 */}
                                    {(order.shippingAddress || order.billingAddress) && (
                                      <div className="border-t pt-3">
                                        <h5 className="font-medium mb-3">地址信息</h5>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                          {/* 收货地址 */}
                                          {order.shippingAddress && (
                                            <div className="bg-gray-50 p-3 rounded">
                                              <h6 className="font-medium text-sm mb-2 text-gray-700">收货地址</h6>
                                              <div className="text-sm space-y-1">
                                                <div className="font-medium">{order.shippingAddress.name}</div>
                                                <div>{order.shippingAddress.street}</div>
                                                <div>
                                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                                </div>
                                                <div>{order.shippingAddress.country}</div>
                                                {order.shippingAddress.phone && (
                                                  <div className="text-gray-600">电话: {order.shippingAddress.phone}</div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          {/* 账单地址 */}
                                          {order.billingAddress && (
                                            <div className="bg-gray-50 p-3 rounded">
                                              <h6 className="font-medium text-sm mb-2 text-gray-700">账单地址</h6>
                                              <div className="text-sm space-y-1">
                                                <div className="font-medium">{order.billingAddress.name}</div>
                                                <div>{order.billingAddress.street}</div>
                                                <div>
                                                  {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}
                                                </div>
                                                <div>{order.billingAddress.country}</div>
                                                {order.billingAddress.phone && (
                                                  <div className="text-gray-600">电话: {order.billingAddress.phone}</div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>

                          {/* Order Pagination */}
                          {totalOrderPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
                              <div className="text-sm text-gray-700 order-2 sm:order-1">
                                正在显示 {startOrderIndex + 1} - {Math.min(endOrderIndex, user.orders.length)} ��，共 {user.orders.length} 条订单
                              </div>
                              <div className="flex items-center gap-2 order-1 sm:order-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentOrderPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentOrderPage === 1}
                                >
                                  上一页
                                </Button>
                                <span className="text-sm text-gray-600 px-2">
                                  {currentOrderPage} / {totalOrderPages}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCurrentOrderPage(prev => Math.min(totalOrderPages, prev + 1))}
                                  disabled={currentOrderPage === totalOrderPages}
                                >
                                  下一页
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">暂无订单记录</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shopping Cart Statistics */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>购物车统计</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Cart Summary Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(user.totalCartValue || 0)}
                          </div>
                          <div className="text-sm text-blue-600">当前购物车金额</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {user.cartItems?.length || 0}
                          </div>
                          <div className="text-sm text-green-600">购物车商品数量</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrency(user.averageCartValue || 0)}
                          </div>
                          <div className="text-sm text-purple-600">平均购物车价值</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {user.cartAbandonCount || 0}
                          </div>
                          <div className="text-sm text-orange-600">购物车放弃次数</div>
                        </div>
                      </div>

                      {/* Cart Timeline Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-200">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-bold text-gray-700">{user.cartCreatedTime || '暂无数据'}</div>
                          <div className="text-xs text-gray-600">购物车创建时间</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-bold text-gray-700">{user.lastCartUpdate || '暂无数据'}</div>
                          <div className="text-xs text-gray-600">最后更新时间</div>
                        </div>
                      </div>

                      {/* Current Cart Items */}
                      {user.cartItems && user.cartItems.length > 0 ? (
                        <div>
                          <h5 className="font-medium mb-3">当前购物车商品</h5>
                          <div className="space-y-3">
                            {user.cartItems.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.productName}</div>
                                  <div className="text-xs text-gray-600">
                                    {formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    加入时间: {item.addedTime} | 最后更新: {item.lastUpdated}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-lg">{formatCurrency(item.totalPrice)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center text-lg font-semibold">
                              <span>购物车总金额:</span>
                              <span className="text-blue-600">{formatCurrency(user.totalCartValue || 0)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 text-sm">购物车暂时为空</p>
                          <p className="text-xs text-gray-400 mt-1">该用户当前没有添加商品到购物车</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

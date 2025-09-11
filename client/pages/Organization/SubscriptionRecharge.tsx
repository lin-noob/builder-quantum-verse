import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard,
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Check,
  Calendar,
  User,
  Zap,
  Star,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 数据模型
interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string; // "月付" | "年付" | "永久"
  features: string[];
  isActive: boolean;
  expiryDate?: string; // 到期时间
}

interface CurrentSubscription {
  package: SubscriptionPackage;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "pending";
}

interface RechargeRecord {
  orderId: string;
  orderTime: string;
  amount: number;
  paymentMethod: "微信支付" | "支付宝" | "银行转账" | "企业转账";
  status: "成功" | "失败" | "处理中";
  currency: string;
  description?: string; // 充值描述
}

// 模拟套餐数据
const mockPackages: SubscriptionPackage[] = [
  {
    id: "basic",
    name: "基础版",
    description: "适合小型团队使用的基础功能",
    price: 99,
    duration: "月付",
    features: ["AI策略查看", "用户列表查看", "基础数据分析"],
    isActive: true
  },
  {
    id: "pro",
    name: "专业版",
    description: "适合中型团队使用的专业功能",
    price: 299,
    duration: "月付",
    features: ["AI策略创建编辑", "用户管理", "高级数据分析", "报告导出"],
    isActive: true
  },
  {
    id: "enterprise",
    name: "企业版",
    description: "适合大型企业使用的全部功能",
    price: 999,
    duration: "月付",
    features: ["全部AI功能", "用户管理", "数据分析", "报告导出", "专属客服", "定制功能"],
    isActive: true
  },
  {
    id: "ultimate",
    name: "旗舰版",
    description: "适合超大型企业使用的旗舰功能",
    price: 1999,
    duration: "月付",
    features: ["全部企业版功能", "AI模型定制", "专属技术支持", "SLA保障", "培训服务"],
    isActive: true
  }
];

// 模拟数据
const mockCurrentSubscription: CurrentSubscription = {
  package: {
    id: "enterprise",
    name: "企业版",
    description: "适合大型企业使用的全部功能",
    price: 999,
    duration: "月付",
    features: [
      "全部AI功能",
      "用户管理",
      "数据分析",
      "报告导出",
      "专属客服",
      "定制功能"
    ],
    isActive: true,
    expiryDate: "2024-02-15"
  },
  startDate: "2024-01-15",
  expiryDate: "2024-02-15",
  status: "active"
};

const mockRechargeHistory: RechargeRecord[] = [
  {
    orderId: "ORD001",
    orderTime: "2024-01-15 10:30",
    amount: 999.00,
    paymentMethod: "微信支付",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    orderId: "ORD002",
    orderTime: "2023-12-15 09:15",
    amount: 999.00,
    paymentMethod: "支付宝",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    orderId: "ORD003",
    orderTime: "2023-11-15 14:20",
    amount: 999.00,
    paymentMethod: "银行转账",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    orderId: "ORD004",
    orderTime: "2023-10-15 11:45",
    amount: 999.00,
    paymentMethod: "企业转账",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    orderId: "ORD005",
    orderTime: "2023-09-15 08:30",
    amount: 999.00,
    paymentMethod: "微信支付",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  }
];

export default function SubscriptionRecharge() {
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof RechargeRecord; direction: 'asc' | 'desc' } | null>(null);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // 每页显示5条记录
  
  // 弹窗状态
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"微信支付" | "支付宝" | "银行转账" | "企业转账">("微信支付");

  // 计算当前页的记录
  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage, itemsPerPage]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(filteredHistory.length / itemsPerPage);
  }, [filteredHistory, itemsPerPage]);

  // 处理页面切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理上一页
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 处理下一页
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setCurrentSubscription(mockCurrentSubscription);
      setRechargeHistory(mockRechargeHistory);
      setFilteredHistory(mockRechargeHistory);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // 过滤和排序逻辑
    let result = [...rechargeHistory];
    
    // 搜索过滤
    if (searchTerm) {
      result = result.filter(record => 
        record.orderId.includes(searchTerm) || 
        (record.description && record.description.includes(searchTerm))
      );
    }
    
    // 排序
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredHistory(result);
    // 重置到第一页
    setCurrentPage(1);
  }, [searchTerm, rechargeHistory, sortConfig]);

  const handleSort = (key: keyof RechargeRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRenew = () => {
    // 处理续费逻辑
    setIsRenewDialogOpen(true);
  };

  const handleUpgrade = () => {
    // 处理升级逻辑
    setIsUpgradeDialogOpen(true);
  };

  const handleConfirmRenew = () => {
    // 确认续费逻辑
    console.log("确认续费:", currentSubscription?.package.name);
    setIsRenewDialogOpen(false);
  };

  const handleConfirmUpgrade = () => {
    // 确认升级逻辑
    console.log("确认升级到:", selectedPackage?.name);
    setIsUpgradeDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "成功":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">成功</Badge>;
      case "处理中":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">处理中</Badge>;
      case "失败":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* 删除页面主标题和副标题 */}

      <div className="space-y-6">
        {/* 订阅套餐卡片 - 改为上下布局 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              当前订阅套餐
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSubscription && (
              <>
                {/* 套餐基本信息 - 更丰富的内容 */}
                <div className="border-b pb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Star className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{currentSubscription.package.name}</h3>
                        <p className="text-gray-500">{currentSubscription.package.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg py-2 px-4">
                      {currentSubscription.status === "active" ? "使用中" : "已过期"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">套餐价格</p>
                        <p className="font-bold text-lg">￥{currentSubscription.package.price}/月</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">到期时间</p>
                        <p className="font-bold text-lg">{currentSubscription.expiryDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">订阅时长</p>
                        <p className="font-bold text-lg">{currentSubscription.package.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 套餐功能详情 */}
                <div className="border-b pb-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    包含功能
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSubscription.package.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="border-b pb-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    订阅信息
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">订阅开始时间</p>
                        <p className="font-medium">{currentSubscription.startDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">订阅到期时间</p>
                        <p className="font-medium">{currentSubscription.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleRenew} className="flex-1">
                    续费套餐
                  </Button>
                  <Button variant="outline" onClick={handleUpgrade} className="flex-1">
                    升级套餐
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 充值记录表格 - 改为上下布局 */}
        <Card>
          <CardHeader>
            <CardTitle>充值记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索订单号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('orderId')}
                    >
                      <div className="flex items-center">
                        订单号
                        {sortConfig?.key === 'orderId' && (
                          sortConfig.direction === 'asc' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('orderTime')}
                    >
                      <div className="flex items-center">
                        充值时间
                        {sortConfig?.key === 'orderTime' && (
                          sortConfig.direction === 'asc' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        金额
                        {sortConfig?.key === 'amount' && (
                          sortConfig.direction === 'asc' 
                            ? <ChevronUp className="ml-1 h-4 w-4" /> 
                            : <ChevronDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>支付方式</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.map((record) => (
                    <TableRow key={record.orderId}>
                      <TableCell className="font-medium">{record.orderId}</TableCell>
                      <TableCell>{record.orderTime}</TableCell>
                      <TableCell>¥{record.amount.toFixed(2)}</TableCell>
                      <TableCell>{record.paymentMethod}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无充值记录
              </div>
            )}

            {/* 分页控件 */}
            {filteredHistory.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  共 {filteredHistory.length} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </Button>
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    // 只显示当前页和前后各2页，以及第一页和最后一页
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    }
                    // 显示省略号
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <span key={page} className="px-2 py-1 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 续费弹窗 */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>续费套餐</DialogTitle>
            <DialogDescription>
              确认续费当前套餐: {currentSubscription?.package.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{currentSubscription?.package.name}</p>
                <p className="text-sm text-gray-500">套餐价格</p>
              </div>
              <p className="text-xl font-bold">¥{currentSubscription?.package.price}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">支付方式</label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="微信支付">微信支付</SelectItem>
                  <SelectItem value="支付宝">支付宝</SelectItem>
                  <SelectItem value="银行转账">银行转账</SelectItem>
                  <SelectItem value="企业转账">企业转账</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmRenew}>
              确认支付
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 升级套餐弹窗 */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">升级套餐</DialogTitle>
            <DialogDescription className="text-base">
              选择您想要升级到的套餐
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockPackages.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPackage?.id === pkg.id 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {pkg.name}
                          {currentSubscription?.package.id === pkg.id && (
                            <Badge variant="secondary" className="text-xs">当前套餐</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pkg.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                        selectedPackage?.id === pkg.id 
                          ? "bg-blue-500 border-blue-500" 
                          : "border-gray-300"
                      }`}>
                        {selectedPackage?.id === pkg.id && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-blue-600">¥{pkg.price}</span>
                          <span className="text-sm text-gray-500 ml-2">/{pkg.duration}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={selectedPackage?.id === pkg.id ? "default" : "outline"}
                        disabled={currentSubscription?.package.id === pkg.id}
                        className="h-9 px-3 text-sm"
                      >
                        {currentSubscription?.package.id === pkg.id ? "当前套餐" : "选择套餐"}
                      </Button>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-bold mb-3">包含功能:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)} className="text-base py-2 px-4">
              取消
            </Button>
            <Button 
              onClick={handleConfirmUpgrade}
              disabled={!selectedPackage || selectedPackage.id === currentSubscription?.package.id}
              className="text-base py-2 px-4"
            >
              确认升级
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
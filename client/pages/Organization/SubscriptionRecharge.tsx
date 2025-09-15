import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Check,
  Calendar,
  Zap,
  Star,
  Clock,
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
import { request } from "@/lib/request";
import { formatDateYMD } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import RechargeRecordsTable from "@/components/RechargeRecordsTable";

interface Subscription {
  id: string;
  createtime: string; // 订阅开始时间
  losingEffeet: number; // 订阅结束时间
  tariffname: string; // 套餐名称
  yearprice: number; //年付价格
  status: "active" | "expired" | "pending";
  sysMenus: {
    name;
  }[];
  tariffpackage: string;
  paymentMethod: number;
  expiry?: string;
  name?: string;
}

export default function SubscriptionRecharge() {
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // 弹窗状态
  const [packageList, setPackageList] = useState<Subscription[]>([]);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Subscription | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "微信支付" | "支付宝" | "银行转账" | "企业转账"
  >("微信支付");

  const load = async () => {
    try {
      setLoading(true);
      const resp = await request.get(
        "/admin/api/v1/managerLimit/getMyManagerLimitmeal",
      );
      const body: any = resp?.data;
      const payload = body?.data;
      const expiry = formatDateYMD(payload.losingEffect);
      const bool = Date.now() > payload.losingEffect;
      setCurrentSubscription({
        ...payload,
        status: bool ? "expired" : "active",
        expiry,
      });
    } catch (e) {
      console.error("Failed to load subscription data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => {};
  }, []);

  const handleRenew = () => {
    // 处理续费逻辑
    setIsRenewDialogOpen(true);
  };

  const handleUpgrade = async () => {
    // 处理升级逻辑
    setIsUpgradeDialogOpen(true);

    try {
      const resp = await request.get(
        "/admin/api/v1/sysTariffPackages/check/list",
      );
      const res = resp.data;
      setPackageList(res.data);
    } catch (error) {}
  };

  const handleConfirmRenew = async () => {
    // 确认续费逻辑
    setIsRenewDialogOpen(false);

    try {
      const data = {
        id: currentSubscription.id,
      };
      const resp = await request.post(
        "/admin/api/v1/managerLimit/renewal",
        data,
      );
      const res = resp.data;
      toast({
        title: "续费成功",
      });
      load();
    } catch (error) {}
  };

  const handleConfirmUpgrade = async () => {
    // 确认升级逻辑
    setIsUpgradeDialogOpen(false);

    try {
      const data = {
        tariffpackage: selectedPackage.id,
        id: currentSubscription.id,
      };
      const resp = await request.post(
        "/admin/api/v1/managerLimit/upgrade",
        data,
      );
      const res = resp.data;
      toast({
        title: "升级成功",
      });
      load();
    } catch (error) {}
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
                        <h3 className="text-xl font-bold">
                          {currentSubscription.tariffname}
                        </h3>
                        {/* <p className="text-gray-500">
                          {currentSubscription.package.description}
                        </p> */}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg py-2 px-4">
                      {currentSubscription.status === "active"
                        ? "使用中"
                        : "已过期"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">套餐价格</p>
                        <p className="font-bold text-lg">
                          ${currentSubscription.yearprice}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">订阅开始时间</p>
                        <p className="font-medium">
                          {currentSubscription.createtime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">订阅到期时间</p>
                        <p className="font-medium">
                          {currentSubscription.expiry}
                        </p>
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
                    {currentSubscription.sysMenus.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleRenew} className="flex-1">
                    续费套餐
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUpgrade}
                    className="flex-1"
                  >
                    升级套餐
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 充值记录表格 - 使用独立组件 */}
        <RechargeRecordsTable />
      </div>

      {/* 续费弹窗 */}
      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>续费套餐</DialogTitle>
            <DialogDescription>
              确认续费当前套餐: {currentSubscription.tariffname}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{currentSubscription?.tariffname}</p>
                <p className="text-sm text-gray-500">套餐价格</p>
              </div>
              <p className="text-xl font-bold">
                ${currentSubscription?.yearprice}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">支付方式</label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as any)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  {/* <SelectItem value="微信支付">微信支付</SelectItem>
                  <SelectItem value="支付宝">支付宝</SelectItem>
                  <SelectItem value="银行转账">银行转账</SelectItem>
                  <SelectItem value="企业转账">企业转账</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenewDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleConfirmRenew}>确认支付</Button>
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
              {packageList.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPackage?.id === pkg.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    String(currentSubscription.tariffpackage) !== pkg.id &&
                    setSelectedPackage(pkg)
                  }
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {pkg.name}
                          {String(currentSubscription.tariffpackage) ===
                            pkg.id && (
                            <Badge variant="secondary" className="text-xs">
                              当前套餐
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                          selectedPackage?.id === pkg.id
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPackage?.id === pkg.id && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-blue-600">
                            ${pkg.yearprice}/年
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={
                          selectedPackage?.id === pkg.id ? "default" : "outline"
                        }
                        disabled={
                          String(currentSubscription.tariffpackage) === pkg.id
                        }
                        className="h-9 px-3 text-sm"
                      >
                        {String(currentSubscription.tariffpackage) === pkg.id
                          ? "当前套餐"
                          : "选择套餐"}
                      </Button>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-bold mb-3">包含功能:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {pkg.sysMenus.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature.name}</span>
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
            <Button
              variant="outline"
              onClick={() => setIsUpgradeDialogOpen(false)}
              className="text-base py-2 px-4"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={
                !selectedPackage ||
                selectedPackage.id === String(currentSubscription.tariffpackage)
              }
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
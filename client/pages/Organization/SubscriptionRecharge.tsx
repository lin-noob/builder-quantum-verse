import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Calendar, Zap, Star, Clock } from "lucide-react";
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
import { useTranslation } from "react-i18next";

interface Subscription {
  id: string;
  createtime: string;
  losingEffeet: number;
  tariffname: string;
  yearprice: number;
  status: "active" | "expired" | "pending";
  sysMenus: {
    name: string;
  }[];
  tariffpackage: string;
  paymentMethod: number;
  expiry?: string;
  name?: string;
}

export default function SubscriptionRecharge() {
  const { t } = useTranslation();

  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const [packageList, setPackageList] = useState<Subscription[]>([]);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Subscription | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState("PayPal");

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
    setIsRenewDialogOpen(true);
  };

  const handleUpgrade = async () => {
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
    setIsRenewDialogOpen(false);

    try {
      const data = {
        id: currentSubscription!.id,
      };
      const resp = await request.post(
        "/admin/api/v1/managerLimit/renewal",
        data,
      );
      const res = resp.data;
      payment(res.data);
    } catch (error) {}
  };

  const handleConfirmUpgrade = async () => {
    setIsUpgradeDialogOpen(false);

    try {
      const data = {
        tariffpackage: selectedPackage!.id,
        id: currentSubscription!.id,
      };
      const resp = await request.post(
        "/admin/api/v1/managerLimit/upgrade",
        data,
      );
      const res = resp.data;
      payment(res.data);
      toast({
        title: t("organization.subscriptionRecharge.toast.upgradeSuccess"),
      });
      load();
    } catch (error) {}
  };

  const payment = (parameterMap: Record<string, string>) => {
    const formEl = document.createElement("form");
    formEl.style.display = "none";
    formEl.action = "https://www.sandbox.paypal.com/cgi-bin/webscr";
    formEl.method = "post";
    const map = {
      ...parameterMap,
      return: `${window.location.origin}/subscription-recharge`,
      notify_url: `${window.location.origin}/subscription-recharge`,
      cancel_return: `${window.location.origin}/subscription-recharge`,
    } as Record<string, string>;
    for (const prop in map) {
      const inputEl = document.createElement("input");
      inputEl.type = "hidden";
      inputEl.name = prop;
      if (prop === "country") {
        inputEl.value = ",";
      } else {
        inputEl.value = map[prop];
      }
      formEl.appendChild(inputEl);
    }
    document.body.appendChild(formEl);
    formEl.submit();
  };

  if (loading) {
    return <div className="p-6">{t("organization.subscriptionRecharge.loading")}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("organization.subscriptionRecharge.card.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentSubscription && (
              <>
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
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg py-2 px-4">
                      {currentSubscription.status === "active"
                        ? t("organization.subscriptionRecharge.card.statusActive")
                        : t("organization.subscriptionRecharge.card.statusExpired")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">{t("organization.subscriptionRecharge.card.price")}</p>
                        <p className="font-bold text-lg">${currentSubscription.yearprice}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">{t("organization.subscriptionRecharge.card.startAt")}</p>
                        <p className="font-medium">{currentSubscription.createtime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">{t("organization.subscriptionRecharge.card.endAt")}</p>
                        <p className="font-medium">{currentSubscription.expiry}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    {t("organization.subscriptionRecharge.card.features")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(currentSubscription?.sysMenus || []).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={handleRenew} className="flex-1">
                    {t("organization.subscriptionRecharge.actions.renew")}
                  </Button>
                  <Button variant="outline" onClick={handleUpgrade} className="flex-1">
                    {t("organization.subscriptionRecharge.actions.upgrade")}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <RechargeRecordsTable />
      </div>

      <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("organization.subscriptionRecharge.renewDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("organization.subscriptionRecharge.renewDialog.desc", { name: currentSubscription?.tariffname })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{currentSubscription?.tariffname}</p>
                <p className="text-sm text-gray-500">{t("organization.subscriptionRecharge.renewDialog.price")}</p>
              </div>
              <p className="text-xl font-bold">${currentSubscription?.yearprice}</p>
            </div>

            <div>
              <label className="text-sm font-medium">{t("organization.subscriptionRecharge.renewDialog.paymentMethod")}</label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>
              {t("organization.subscriptionRecharge.actions.cancel")}
            </Button>
            <Button onClick={handleConfirmRenew}>{t("organization.subscriptionRecharge.actions.confirmPay")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("organization.subscriptionRecharge.upgradeDialog.title")}</DialogTitle>
            <DialogDescription className="text-base">{t("organization.subscriptionRecharge.upgradeDialog.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packageList.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPackage?.id === pkg.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    String(currentSubscription!.tariffpackage) !== pkg.id && setSelectedPackage(pkg)
                  }
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {pkg.name}
                          {String(currentSubscription!.tariffpackage) === pkg.id && (
                            <Badge variant="secondary" className="text-xs">
                              {t("organization.subscriptionRecharge.actions.currentPlan")}
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                        selectedPackage?.id === pkg.id ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}>
                        {selectedPackage?.id === pkg.id && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-blue-600">${pkg.yearprice}/年</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={selectedPackage?.id === pkg.id ? "default" : "outline"}
                        disabled={String(currentSubscription!.tariffpackage) === pkg.id}
                        className="h-9 px-3 text-sm"
                      >
                        {String(currentSubscription!.tariffpackage) === pkg.id
                          ? t("organization.subscriptionRecharge.actions.currentPlan")
                          : t("organization.subscriptionRecharge.actions.selectPlan")}
                      </Button>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-bold mb-3">{t("organization.subscriptionRecharge.upgradeDialog.features")}</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {pkg?.sysMenus.map((feature, index) => (
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

            {selectedPackage && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t("organization.subscriptionRecharge.upgradeDialog.paymentMethod")}</label>
                    <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)} className="text-base py-2 px-4">
              {t("organization.subscriptionRecharge.actions.cancel")}
            </Button>
            <Button
              onClick={handleConfirmUpgrade}
              disabled={!selectedPackage || selectedPackage.id === String(currentSubscription!.tariffpackage)}
              className="text-base py-2 px-4"
            >
              {t("organization.subscriptionRecharge.actions.confirmUpgrade")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

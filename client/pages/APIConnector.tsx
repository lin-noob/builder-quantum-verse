import React, { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

type AuthType = "apiKey" | "basic" | "oauth";

const standardFields: { key: string; label: string; required?: boolean }[] = [
  { key: "orderId", label: "订单ID", required: true },
  { key: "orderNumber", label: "订单编号" },
  { key: "orderDate", label: "下单时间", required: true },
  { key: "customerId", label: "客户ID", required: true },
  { key: "status", label: "订单状态", required: true },
  { key: "totalAmount", label: "订单金额", required: true },
  { key: "currency", label: "币种" },
];

export default function APIConnector() {
  const { toast } = useToast();

  // 基础配置与认证
  const [connectorName, setConnectorName] = useState("独立站订单API");
  const [baseUrl, setBaseUrl] = useState("");
  const [authType, setAuthType] = useState<AuthType>("apiKey");
  const [apiKey, setApiKey] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPassword, setBasicPassword] = useState("");

  // 订单端点与参数
  const [ordersEndpoint, setOrdersEndpoint] = useState("/api/orders");
  const [pageParam, setPageParam] = useState("page");
  const [pageSizeParam, setPageSizeParam] = useState("pageSize");
  const [startTimeParam, setStartTimeParam] = useState("startTime");
  const [statusParam, setStatusParam] = useState("status");
  const [pageSize, setPageSize] = useState<number>(50);

  // 字段映射
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    orderId: "id",
    orderNumber: "order_no",
    orderDate: "created_at",
    customerId: "customer.id",
    status: "status",
    totalAmount: "amount_total",
    currency: "currency",
  });

  // 同步控制
  const [fullSync, setFullSync] = useState(false);
  const [daysBack, setDaysBack] = useState<number>(30);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [lastFetchedCount, setLastFetchedCount] = useState<number>(0);
  const [log, setLog] = useState<string>("");

  const authSummary = useMemo(() => {
    switch (authType) {
      case "apiKey":
        return apiKey ? `API Key 已填写（${apiKey.length}位）` : "API Key 未填写";
      case "basic":
        return basicUser && basicPassword ? "Basic Auth 已填写" : "Basic Auth 未填写";
      case "oauth":
        return "OAuth 需后续对接（暂不在MVP范围）";
    }
  }, [authType, apiKey, basicUser, basicPassword]);

  const saveConfig = () => {
    const config = {
      connectorName,
      baseUrl,
      authType,
      apiKey,
      basicUser,
      basicPassword,
      ordersEndpoint,
      pageParam,
      pageSizeParam,
      startTimeParam,
      statusParam,
      pageSize,
      fieldMapping,
      fullSync,
      daysBack,
    };
    localStorage.setItem("apiConnectorConfig", JSON.stringify(config));
    toast({ title: "配置已保存", description: "已保存到浏览器本地（MVP原型）" });
  };

  const testConnection = () => {
    if (!baseUrl) {
      toast({ title: "测试失败", description: "请填写基础地址 Base URL" });
      return;
    }
    // 原型：不实际发请求，仅做最小反馈
    setLog((prev) => prev + `\n[测试连接] 尝试连接 ${baseUrl}${ordersEndpoint}`);
    setTimeout(() => {
      toast({ title: "连接成功", description: authSummary });
      setLog((prev) => prev + "\n[测试连接] 连接成功，认证通过\n");
    }, 600);
  };

  const startSyncOnce = () => {
    const now = new Date();
    setLastRunAt(now.toLocaleString());
    // 原型：模拟记录条数
    const simulated = Math.max(5, Math.round(Math.random() * pageSize));
    setLastFetchedCount(simulated);
    setLog((prev) =>
      prev +
      `\n[拉取一次] 基于 ${fullSync ? "全量同步" : `${daysBack}天增量`}，分页 ${pageSize}，端点 ${ordersEndpoint}\n映射：${JSON.stringify(
        fieldMapping,
      )}\n=> 模拟获取 ${simulated} 条记录\n`,
    );
    toast({ title: "拉取完成", description: `本次获取 ${simulated} 条记录（原型模拟）` });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">API连接器</h1>
            <p className="text-sm text-muted-foreground mt-1">
              目标：接入独立站订单数据，完成标准化映射与最小同步控制。
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={saveConfig}>保存配置</Button>
            <Button onClick={testConnection}>测试连接</Button>
          </div>
        </div>

        {/* 基础配置与认证 */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium">1. 基础配置与认证</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="connectorName">连接器名称</Label>
              <Input id="connectorName" value={connectorName} onChange={(e) => setConnectorName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input id="baseUrl" placeholder="https://yourdomain.com" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>认证方式</Label>
              <Select value={authType} onValueChange={(v) => setAuthType(v as AuthType)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择认证方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apiKey">API Key</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="oauth">OAuth（占位）</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{authSummary}</p>
            </div>
            {authType === "apiKey" && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
              </div>
            )}
            {authType === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basicUser">用户名</Label>
                  <Input id="basicUser" value={basicUser} onChange={(e) => setBasicUser(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basicPassword">密码</Label>
                  <Input id="basicPassword" type="password" value={basicPassword} onChange={(e) => setBasicPassword(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 订单端点与参数 */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium">2. 订单端点与参数</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ordersEndpoint">订单列表端点</Label>
              <Input id="ordersEndpoint" value={ordersEndpoint} onChange={(e) => setOrdersEndpoint(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageParam">分页参数名（页码）</Label>
              <Input id="pageParam" value={pageParam} onChange={(e) => setPageParam(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSizeParam">分页参数名（每页条数）</Label>
              <Input id="pageSizeParam" value={pageSizeParam} onChange={(e) => setPageSizeParam(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pageSize">每页条数</Label>
              <Input id="pageSize" type="number" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTimeParam">开始时间参数名（增量）</Label>
              <Input id="startTimeParam" value={startTimeParam} onChange={(e) => setStartTimeParam(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusParam">状态过滤参数名</Label>
              <Input id="statusParam" value={statusParam} onChange={(e) => setStatusParam(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* 字段映射 */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium">3. 字段映射（源字段 → 标准字段）</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标准字段</TableHead>
                <TableHead>源字段路径（支持点号，如 customer.id）</TableHead>
                <TableHead className="w-24">是否必填</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standardFields.map((f) => (
                <TableRow key={f.key}>
                  <TableCell className="font-medium">{f.label}</TableCell>
                  <TableCell>
                    <Input
                      value={fieldMapping[f.key] || ""}
                      onChange={(e) =>
                        setFieldMapping((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                      placeholder="如：id / order_no / created_at"
                    />
                  </TableCell>
                  <TableCell>
                    {f.required ? (
                      <span className="text-xs text-red-600">必填</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">可选</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* 同步控制与最小反馈 */}
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-medium">4. 同步控制与最小反馈</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex items-center space-x-3">
              <Switch checked={fullSync} onCheckedChange={setFullSync} id="fullSync" />
              <Label htmlFor="fullSync">全量同步</Label>
            </div>
            {!fullSync && (
              <div className="space-y-2">
                <Label htmlFor="daysBack">增量范围（天）</Label>
                <Input id="daysBack" type="number" value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} />
              </div>
            )}
            <div className="md:col-span-2">
              <Button onClick={startSyncOnce}>开始一次拉取</Button>
              <p className="text-xs text-muted-foreground mt-2">
                最小化反馈：显示最近一次拉取的时间与条数，不展示图表与复杂监控。
              </p>
            </div>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">最近一次拉取信息</h3>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p>时间：{lastRunAt || "—"}</p>
                <p>记录数：{lastFetchedCount || 0}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">执行日志（原型）</h3>
              <Textarea className="mt-2 h-32" value={log} onChange={(e) => setLog(e.target.value)} placeholder="这里显示测试与拉取的简单日志" />
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
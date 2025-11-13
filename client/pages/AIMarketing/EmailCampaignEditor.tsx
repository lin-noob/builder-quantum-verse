import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, ArrowLeft, Save, Rocket, TestTube } from "lucide-react";

export default function EmailCampaignEditor() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = !campaignId;
  const templateId = searchParams.get("templateId");
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [segment, setSegment] = useState("all");
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduleTime, setScheduleTime] = useState("");
  const [content, setContent] = useState("");

  // 结构化内容块（简化版，提升预览与观感）
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSub, setHeroSub] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [productNames, setProductNames] = useState<string>(""); // 逗号分隔

  // 分步导航
  const [activeTab, setActiveTab] = useState<string>("basic");
  const tabsOrder = ["basic", "audience", "content"] as const;

  const pageTitle = useMemo(() => (isNew ? "新建邮件活动" : `编辑邮件活动 #${campaignId}`), [isNew, campaignId]);

  // 若为新建并携带模板参数，则进行基础初始化填充
  useEffect(() => {
    if (isNew && templateId) {
      setName((prev) => (prev || `基于模板 ${templateId} 的活动`));
      setSubject((prev) => (prev || "请根据模板建议完善主题"));
      setContent((prev) => (
        prev || `此活动基于模板 ${templateId} 初始化。可在此粘贴模板生成的内容或根据模板结构进行完善。`
      ));
    }
  }, [isNew, templateId]);

  const handleSave = () => {
    toast({ title: "草稿已保存", description: "可在列表页继续编辑。" });
    navigate("/ai-marketing/email-campaigns");
  };

  const canPublish = useMemo(() => {
    const hasContentBlocks = heroTitle || heroSub || ctaText || productNames.trim().length > 0;
    const hasBody = content.trim().length > 0;
    const scheduleOk = scheduleType === "now" || !!scheduleTime.trim();
    return !!name.trim() && !!subject.trim() && (hasContentBlocks || hasBody) && scheduleOk;
  }, [name, subject, content, heroTitle, heroSub, ctaText, productNames, scheduleType, scheduleTime]);

  const handlePublish = () => {
    if (!canPublish) {
      toast({ title: "无法发布", description: "请完善必填项：名称、主题、内容与发送方式。", variant: "destructive" });
      return;
    }
    toast({ title: scheduleType === "now" ? "已提交发送任务" : "已创建排期", description: scheduleType === "now" ? "系统将尽快发送。" : `计划时间：${scheduleTime}` });
    navigate("/ai-marketing/email-campaigns");
  };

  // 测试发送弹窗
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const handleTestSend = async () => {
    const email = testEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "邮箱不合法", description: "请输入有效的测试收件邮箱。", variant: "destructive" });
      return;
    }
    if (!subject.trim()) {
      toast({ title: "缺少主题", description: "请先填写邮件主题后再测试发送。", variant: "destructive" });
      return;
    }
    const hasBlocks = heroTitle || heroSub || ctaText || productNames.trim().length > 0;
    const hasBody = content.trim().length > 0;
    if (!hasBlocks && !hasBody) {
      toast({ title: "内容为空", description: "请完善内容或内容块后再测试发送。", variant: "destructive" });
      return;
    }
    // 模拟调用测试发送接口
    toast({ title: "已发送测试邮件", description: `收件人：${email}` });
    setTestOpen(false);
    setTestEmail("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/ai-marketing/email-campaigns" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> 返回列表
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> 保存草稿
          </Button>
          <Button variant="secondary" onClick={() => setTestOpen(true)} className="flex items-center gap-2">
            <TestTube className="h-4 w-4" /> 测试发送
          </Button>
          <Button onClick={handlePublish} disabled={!canPublish} className="flex items-center gap-2">
            <Rocket className="h-4 w-4" /> {scheduleType === "now" ? "发布并发送" : "发布并排期"}
          </Button>
        </div>
      </div>

      {/* Main layout: left steps + right live preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Step form */}
        <Card>
          <CardHeader>
            <CardTitle>配置步骤</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="audience">受众与发送</TabsTrigger>
                <TabsTrigger value="content">内容编辑</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="campaign-name">活动名称</Label>
                    <Input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：双十一预热邮件" />
                  </div>
                  <div>
                    <Label htmlFor="campaign-subject">邮件主题</Label>
                    <Input id="campaign-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="例如：本周新品推荐与优惠" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setActiveTab("audience")}>下一步</Button>
                </div>
              </TabsContent>

              <TabsContent value="audience" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label>受众分群</Label>
                    <Select value={segment} onValueChange={setSegment}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分群" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部用户</SelectItem>
                        <SelectItem value="new">近30天新用户</SelectItem>
                        <SelectItem value="vip">VIP高价值用户</SelectItem>
                        <SelectItem value="churn">流失预警用户</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>发送方式</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant={scheduleType === "now" ? "default" : "outline"} onClick={() => setScheduleType("now")}>立即发送</Button>
                      <Button variant={scheduleType === "later" ? "default" : "outline"} onClick={() => setScheduleType("later")}>排期发送</Button>
                    </div>
                    {scheduleType === "later" && (
                      <div className="mt-2">
                        <Label htmlFor="schedule-time">发送时间</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input id="schedule-time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} placeholder="例如：2025-11-08 10:00" className="pl-10" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("basic")}>上一步</Button>
                  <Button variant="secondary" onClick={() => setActiveTab("content")}>下一步</Button>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="hero-title">首屏标题</Label>
                    <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="例如：双十一限时优惠来袭" />
                  </div>
                  <div>
                    <Label htmlFor="hero-sub">副标题</Label>
                    <Input id="hero-sub" value={heroSub} onChange={(e) => setHeroSub(e.target.value)} placeholder="例如：满减加码，会员专享券" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cta-text">主CTA文案</Label>
                      <Input id="cta-text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="例如：立即抢购" />
                    </div>
                    <div>
                      <Label htmlFor="cta-url">主CTA链接</Label>
                      <Input id="cta-url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="例如：https://example.com/promo" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="products">推荐商品（用逗号分隔）</Label>
                    <Input id="products" value={productNames} onChange={(e) => setProductNames(e.target.value)} placeholder="例如：智能吸尘器, 空气净化器, 语音中控" />
                  </div>
                  <div>
                    <Label htmlFor="content">正文（可选）</Label>
                    <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="在此编辑或粘贴邮件内容..." className="min-h-[200px]" />
                    <p className="mt-2 text-xs text-muted-foreground">可同时使用上方结构化内容块与正文，预览会智能合并展示。</p>
                  </div>
                </div>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("audience")}>上一步</Button>
                  <Button variant="secondary" onClick={() => setActiveTab("basic")}>返回顶部</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right: Live preview */}
        <Card>
          <CardHeader>
            <CardTitle>实时预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 border-b px-4 py-2">
                <div className="text-sm text-muted-foreground">主题</div>
                <div className="font-medium truncate">{subject || "(未设置主题)"}</div>
              </div>
              <div className="p-4 space-y-4">
                {(heroTitle || heroSub) && (
                  <div className="space-y-1">
                    <div className="text-xl font-bold">{heroTitle}</div>
                    {heroSub && <div className="text-sm text-muted-foreground">{heroSub}</div>}
                  </div>
                )}
                {productNames.trim() && (
                  <div>
                    <div className="text-sm font-medium mb-2">推荐商品</div>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {productNames.split(",").map((p, i) => (
                        <li key={i}>{p.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {ctaText && (
                  <div>
                    <a href={ctaUrl || "#"} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      {ctaText}
                    </a>
                  </div>
                )}
                {content.trim() && (
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm whitespace-pre-wrap">{content}</div>
                  </div>
                )}
                {!(heroTitle || heroSub || ctaText || productNames.trim() || content.trim()) && (
                  <div className="text-xs text-muted-foreground">暂无可预览内容，请在左侧填写信息。</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Send Dialog */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>测试发送</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="test-email">收件邮箱</Label>
              <Input id="test-email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="例如：tester@example.com" />
            </div>
            <div className="text-xs text-muted-foreground">系统将发送当前主题与内容的测试邮件（模拟）。</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>取消</Button>
            <Button onClick={handleTestSend}>发送</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import KPICard from "@/components/KPICard";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Ban,
  Reply,
  ReplyAll,
  Forward,
  Search,
  Star,
  Inbox,
  FileText,
  Send,
  Sparkles,
  Brain,
  Clock,
  AlertTriangle,
} from "lucide-react";

type FolderKey =
  | "inbox"
  | "starred"
  | "drafts"
  | "sent"
  | "deleted"
  | "spam";

type MailStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

interface MailItem {
  id: string;
  subject: string;
  from: string;
  labels: string[];
  folder: FolderKey;
  status: MailStatus;
  recipients: number; // 分群或列表人数
  updatedAt: string;
  starred?: boolean;
  html?: string; // 预览用
  metrics?: {
    delivered: number;
    openRate: number; // 0-1
    clickRate: number; // 0-1
    unsubRate: number; // 0-1
    bounceRate: number; // 0-1
  };
  // AI 字段（前端演示用）
  aiScore?: number; // 0-100 内容质量/相关性评分
  openRatePred?: number; // 0-1 预测打开率
  clickRatePred?: number; // 0-1 预测点击率
  bestSendWindow?: string; // 如 "18:00–20:00"
  spamRisk?: "low" | "medium" | "high"; // 垃圾风险
  suggestions?: string[]; // 文案/结构建议
  aiSummary?: string; // 简短AI说明
}

const mockMails: MailItem[] = [
  {
    id: "m_001",
    subject: "双十一预热：抢先领券",
    from: "marketing@hzfro.com",
    labels: ["促销", "双十一"],
    folder: "drafts",
    status: "draft",
    recipients: 12000,
    updatedAt: "2025-11-05 14:22",
    html: "<h1>双十一来啦</h1><p>提前领券，限时优惠。</p>",
    aiScore: 72,
    openRatePred: 0.35,
    clickRatePred: 0.14,
    suggestions: ["主题加入明确优惠幅度", "正文首屏放置主CTA按钮"],
  },
  {
    id: "m_002",
    subject: "新品上架：智能家居套装",
    from: "marketing@hzfro.com",
    labels: ["新品"],
    folder: "sent",
    status: "sent",
    recipients: 8500,
    updatedAt: "2025-11-02 10:10",
    html: "<h2>新品来袭</h2><p>点击查看详情</p>",
    metrics: {
      delivered: 8400,
      openRate: 0.36,
      clickRate: 0.12,
      unsubRate: 0.008,
      bounceRate: 0.012,
    },
    aiScore: 82,
    openRatePred: 0.4,
    clickRatePred: 0.13,
    bestSendWindow: "18:00–20:00",
    suggestions: ["主题加入数字提高吸引力", "增加首屏产品图与价格锚点"],
  },
  {
    id: "m_003",
    subject: "VIP专享：老客回访券",
    from: "marketing@hzfro.com",
    labels: ["VIP", "复购"],
    folder: "inbox",
    status: "sent",
    recipients: 15600,
    updatedAt: "2025-11-01 18:30",
    html: "<p>亲爱的VIP用户，感谢你的支持</p>",
    metrics: {
      delivered: 15320,
      openRate: 0.41,
      clickRate: 0.17,
      unsubRate: 0.006,
      bounceRate: 0.009,
    },
    aiScore: 79,
    openRatePred: 0.42,
    clickRatePred: 0.18,
    bestSendWindow: "20:00–22:00",
  },
  {
    id: "m_004",
    subject: "季度会员提醒：福利更新",
    from: "service@hzfro.com",
    labels: ["会员", "公告"],
    folder: "inbox",
    status: "sending",
    recipients: 21000,
    updatedAt: "2025-11-03 08:45",
    html: "<p>亲爱的会员，本季度福利已更新，欢迎查看。</p>",
    aiScore: 65,
    bestSendWindow: "09:00–11:00",
    suggestions: ["主题突出具体福利亮点", "减少正文段落长度，使用项目符号"]
  },
  {
    id: "m_005",
    subject: "黑五预告：星标优先查看",
    from: "marketing@hzfro.com",
    labels: ["黑五", "促销"],
    folder: "starred",
    status: "sent",
    recipients: 30000,
    updatedAt: "2025-11-04 09:12",
    starred: true,
    html: "<p>黑五大促，星标用户优先知晓。</p>",
    metrics: {
      delivered: 29600,
      openRate: 0.52,
      clickRate: 0.21,
      unsubRate: 0.007,
      bounceRate: 0.006,
    },
    aiScore: 88,
    openRatePred: 0.55,
    clickRatePred: 0.22,
    bestSendWindow: "08:00–10:00",
  },
  {
    id: "m_006",
    subject: "双十一爆款榜单（草稿）",
    from: "marketing@hzfro.com",
    labels: ["爆款", "草稿"],
    folder: "starred",
    status: "draft",
    recipients: 12000,
    updatedAt: "2025-11-05 07:20",
    starred: true,
    html: "<p>草稿内容：榜单与推荐位。</p>",
    aiScore: 74,
    openRatePred: 0.38,
    clickRatePred: 0.16,
    suggestions: ["加入Top3商品卖点与价格对比", "CTA按钮文字更具行动性"]
  },
  {
    id: "m_007",
    subject: "系统通知：退信报告",
    from: "noreply@hzfro.com",
    labels: ["系统", "报告"],
    folder: "deleted",
    status: "failed",
    recipients: 0,
    updatedAt: "2025-11-03 22:10",
    html: "<p>部分邮件退信，请核查地址质量。</p>",
  },
  {
    id: "m_008",
    subject: "回访问卷：赢取积分奖励",
    from: "survey@hzfro.com",
    labels: ["问卷"],
    folder: "sent",
    status: "sent",
    recipients: 9800,
    updatedAt: "2025-11-02 15:55",
    html: "<p>完成问卷即可获得积分。</p>",
    metrics: {
      delivered: 9700,
      openRate: 0.33,
      clickRate: 0.25,
      unsubRate: 0.012,
      bounceRate: 0.01,
    },
  },
  {
    id: "m_009",
    subject: "节日问候（草稿）",
    from: "marketing@hzfro.com",
    labels: ["节日", "祝福"],
    folder: "drafts",
    status: "draft",
    recipients: 5000,
    updatedAt: "2025-11-06 11:03",
    html: "<p>节日快乐，感谢一路相伴。</p>",
  },
  {
    id: "m_010",
    subject: "客服满意度调查（可能为垃圾）",
    from: "unknown@spam-mail.com",
    labels: ["调查"],
    folder: "spam",
    status: "failed",
    recipients: 0,
    updatedAt: "2025-11-01 12:01",
    html: "<p>这是一封可疑邮件，请谨慎点击。</p>",
    spamRisk: "high",
    aiSummary: "疑似垃圾来源，建议隔离",
  },
  {
    id: "m_011",
    subject: "新手指南：功能快速上手",
    from: "support@hzfro.com",
    labels: ["教程"],
    folder: "inbox",
    status: "sent",
    recipients: 14000,
    updatedAt: "2025-11-05 16:40",
    html: "<p>三分钟了解核心功能。</p>",
    metrics: {
      delivered: 13800,
      openRate: 0.44,
      clickRate: 0.18,
      unsubRate: 0.004,
      bounceRate: 0.008,
    },
  },
  {
    id: "m_012",
    subject: "活动回放：精彩不容错过",
    from: "event@hzfro.com",
    labels: ["活动", "视频"],
    folder: "sent",
    status: "sent",
    recipients: 7600,
    updatedAt: "2025-11-03 19:26",
    html: "<p>点击观看活动精彩片段。</p>",
    metrics: {
      delivered: 7500,
      openRate: 0.39,
      clickRate: 0.29,
      unsubRate: 0.006,
      bounceRate: 0.007,
    },
  },
  {
    id: "m_013",
    subject: "付款提醒：账期将到",
    from: "billing@hzfro.com",
    labels: ["账单", "提醒"],
    folder: "inbox",
    status: "scheduled",
    recipients: 3200,
    updatedAt: "2025-11-06 08:18",
    html: "<p>您的账期将在三天后到期。</p>",
    aiScore: 58,
    openRatePred: 0.34,
    bestSendWindow: "17:00–19:00",
  },
  {
    id: "m_014",
    subject: "升级通知：版本 2.1 发布",
    from: "product@hzfro.com",
    labels: ["版本", "公告"],
    folder: "sent",
    status: "sent",
    recipients: 22000,
    updatedAt: "2025-11-04 20:07",
    html: "<p>新版本带来性能与体验提升。</p>",
    metrics: {
      delivered: 21700,
      openRate: 0.47,
      clickRate: 0.23,
      unsubRate: 0.009,
      bounceRate: 0.005,
    },
  },
  {
    id: "m_015",
    subject: "订单通知：#A123456",
    from: "orders@hzfro.com",
    labels: ["订单"],
    folder: "deleted",
    status: "sent",
    recipients: 1,
    updatedAt: "2025-11-02 09:33",
    html: "<p>订单已创建，详情请查看后台。</p>",
  },
];

export default function EmailMarketingMailbox() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [folder, setFolder] = useState<FolderKey>("inbox");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState<"none" | "reply" | "replyAll" | "forward">("none");
  const [aiView, setAiView] = useState<"none" | "insights" | "predict" | "schedule">("none");
  const enableAI = true; // 前端演示：是否显示AI入口

  // 收敛列表徽章到最多两项核心指标，优先级：高风险垃圾 > 预测打开 > 最佳时段 > 预测点击
  const renderBadges = (m: MailItem) => {
    const nodes: JSX.Element[] = [];
    const push = (el: JSX.Element) => {
      if (nodes.length < 2) nodes.push(el);
    };
    if (m.spamRisk === "high") {
      push(
        <Badge key="spam" variant="destructive" className="px-1 py-0 h-5 text-[10px] flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> 疑似垃圾
        </Badge>
      );
    }
    if (typeof m.openRatePred === "number") {
      push(
        <Badge key="open" variant="secondary" className="px-1 py-0 h-5 text-[10px]">
          预测打开 {Math.round(m.openRatePred * 100)}%
        </Badge>
      );
    }
    if (m.bestSendWindow) {
      push(
        <Badge key="window" variant="outline" className="px-1 py-0 h-5 text-[10px]">
          最佳时段 {m.bestSendWindow}
        </Badge>
      );
    }
    if (typeof m.clickRatePred === "number") {
      push(
        <Badge key="click" variant="outline" className="px-1 py-0 h-5 text-[10px]">
          预测点击 {Math.round(m.clickRatePred * 100)}%
        </Badge>
      );
    }
    return <div className="flex flex-wrap gap-1">{nodes}</div>;
  };

  const data = useMemo(() => {
    const byFolder = mockMails.filter((m) => m.folder === folder);
    if (!search) return byFolder;
    const q = search.toLowerCase();
    return byFolder.filter(
      (m) => m.subject.toLowerCase().includes(q) || m.labels.some((l) => l.toLowerCase().includes(q))
    );
  }, [folder, search]);

  const active = useMemo(() => data.find((d) => d.id === activeId) ?? null, [data, activeId]);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const selectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map((d) => d.id) : []);
  };

  const handleNew = () => {
    navigate("/ai-marketing/email/compose");
  };

  // 按状态控制 AI 面板入口可见性（必须在 active 定义之后）
  const canShowInsights = !!(active && ["draft", "scheduled", "sending", "sent"].includes(active.status));
  const canShowPredict = !!(active && ["scheduled", "sent"].includes(active.status));
  const canShowSchedule = !!(active && ["draft", "scheduled"].includes(active.status));

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    toast({ title: "已移动到已删除", description: `共 ${selectedIds.length} 封` });
    // 前端演示：不改动 mock 数据，仅提示
    setSelectedIds([]);
  };

  const handleReject = () => {
    if (selectedIds.length === 0) return;
    toast({ title: "已加入抑制名单", description: `选中 ${selectedIds.length} 封的收件人将被过滤` });
  };

  const handleReply = () => {
    if (!active) return;
    setComposeMode("reply");
  };

  const handleReplyAll = () => {
    if (!active) return;
    setComposeMode("replyAll");
  };

  const handleForward = () => {
    if (!active) return;
    setComposeMode("forward");
  };

  return (
    <div className="p-6 space-y-4">
      {/* 顶部工具栏 */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={handleNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> 新建邮件
          </Button>
          <Button size="sm" variant="outline" onClick={handleDelete} disabled={selectedIds.length === 0} className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> 删除
          </Button>
          <Button size="sm" variant="outline" onClick={handleReject} disabled={selectedIds.length === 0} className="flex items-center gap-2">
            <Ban className="h-4 w-4" /> 拒收
          </Button>
          <Button size="sm" variant="outline" onClick={handleReply} disabled={!active} className="flex items-center gap-2">
            <Reply className="h-4 w-4" /> 回复
          </Button>
          <Button size="sm" variant="outline" onClick={handleReplyAll} disabled={!active} className="flex items-center gap-2">
            <ReplyAll className="h-4 w-4" /> 回复全部
          </Button>
          <Button size="sm" variant="outline" onClick={handleForward} disabled={!active} className="flex items-center gap-2">
            <Forward className="h-4 w-4" /> 转发
          </Button>

          {enableAI && (
            <>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              {canShowInsights && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setAiView((prev) => (prev === "insights" ? "none" : "insights"))}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" /> AI建议
                </Button>
              )}
              {canShowPredict && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setAiView((prev) => (prev === "predict" ? "none" : "predict"))}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" /> 预测
                </Button>
              )}
              {canShowSchedule && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setAiView((prev) => (prev === "schedule" ? "none" : "schedule"))}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" /> 发送时段
                </Button>
              )}
            </>
          )}

          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索主题/标签" className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* 三栏布局（合并为一个卡片，分割线区分，每栏有内边距）*/}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* 左侧文件夹（12%）*/}
            <div className="md:basis-[12%] p-3">
              <div className="text-sm font-medium mb-2">liguoshuai@hzfro..</div>
              <div className="space-y-2">
            {(
              [
                { key: "inbox", name: "收件箱", icon: Inbox },
                { key: "starred", name: "星标邮件", icon: Star },
                { key: "drafts", name: "草稿箱", icon: FileText },
                { key: "sent", name: "已发送", icon: Send },
                { key: "deleted", name: "已删除", icon: Trash2 },
                { key: "spam", name: "垃圾邮件", icon: Ban },
              ] as { key: FolderKey; name: string; icon: any }[]
            ).map((f) => {
              const Icon = f.icon;
              return (
                <Button
                  key={f.key}
                  variant={folder === f.key ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setFolder(f.key);
                    setSelectedIds([]);
                    setActiveId(null);
                    setComposeMode("none");
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {f.name}
                </Button>
              );
            })}

            <div className="mt-4">
              {/* 保留占位的间距以维持顶部与列表的分隔，可按需删除 */}
            </div>
            {/* 标签与自定义文件夹区域已移除 */}
              </div>
            </div>

            {/* 中间列表（13%）*/}
            <div className="md:basis-[13%] p-3 md:border-l md:border-border">
              <div className="text-sm font-medium mb-2">{folder === "sent" ? "已发送" : folder === "drafts" ? "草稿" : "邮件列表"}</div>
              <div className="space-y-2">
                {data.map((m) => {
                  const sender = m.from.split("@")[0] || m.from;
                  const snippet = (m.html || "")
                    .replace(/<[^>]+>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
                  const dateMD = m.updatedAt?.slice(5, 10) || ""; // 显示月-日
                  return (
                    <div
                      key={m.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() => setActiveId(m.id)}
                    >
                      <Avatar className="h-6 w-6 mt-0.5">
                        <AvatarImage src="" alt={sender} />
                        <AvatarFallback>{(sender[0] || "?").toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                          <span className="truncate">{sender}</span>
                          <span className="ml-1 w-12 text-right tabular-nums whitespace-nowrap shrink-0">{dateMD}</span>
                        </div>
                  <div className="text-sm font-medium truncate flex items-center gap-1">
                    {m.starred && <Star className="h-3 w-3 text-yellow-500" />}
                    {m.subject}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{snippet || "(无正文)"}</div>
                  {enableAI && (
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {typeof m.openRatePred === "number" && (
                        <Badge variant="secondary" className="px-1 py-0 h-5 text-[10px]">预测打开 {Math.round(m.openRatePred * 100)}%</Badge>
                      )}
                      {renderBadges(m)}
                    </div>
                  )}
                  </div>
                </div>
              );
                })}
                {data.length === 0 && (
                  <div className="text-center text-muted-foreground py-6 text-xs">暂无数据</div>
                )}
              </div>
            </div>

            {/* 右侧预览区（75%）*/}
            <div className="md:basis-[75%] p-3 md:border-l md:border-border">
              <div className="text-sm font-medium mb-2">预览</div>
              <div className="space-y-4">
              {!active && <div className="text-sm text-muted-foreground">请选择左侧列表中的一封邮件进行预览</div>}

              {active && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">{active.subject}</h2>
                    <p className="text-xs text-muted-foreground">来自 {active.from} · 收件人数 {active.recipients.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReply} className="gap-2">
                      <Reply className="h-4 w-4" /> 回复
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleReplyAll} className="gap-2">
                      <ReplyAll className="h-4 w-4" /> 回复全部
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleForward} className="gap-2">
                      <Forward className="h-4 w-4" /> 转发
                    </Button>
                  </div>
                </div>

                {enableAI && aiView !== "none" && (
                  <div className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {aiView === "insights" && <Sparkles className="h-4 w-4 text-purple-500" />}
                        {aiView === "predict" && <Brain className="h-4 w-4 text-blue-500" />}
                        {aiView === "schedule" && <Clock className="h-4 w-4 text-green-500" />}
                        <span className="text-sm font-medium">
                          {aiView === "insights" && "AI建议"}
                          {aiView === "predict" && "AI预测"}
                          {aiView === "schedule" && "最佳发送时段"}
                        </span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setAiView("none")}>收起</Button>
                    </div>
                    {aiView === "insights" && (
                      <div className="space-y-2 text-sm">
                        {active.suggestions && active.suggestions.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {active.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-muted-foreground">暂无AI建议（模拟数据）</div>
                        )}
                        {typeof active.aiScore === "number" && (
                          <div className="text-xs text-muted-foreground">内容质量评分：{active.aiScore}/100</div>
                        )}
                      </div>
                    )}
                    {aiView === "predict" && (
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">预测打开率</div>
                          <div className="font-medium">{typeof active.openRatePred === "number" ? `${Math.round(active.openRatePred * 100)}%` : "--"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">预测点击率</div>
                          <div className="font-medium">{typeof active.clickRatePred === "number" ? `${Math.round(active.clickRatePred * 100)}%` : "--"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">内容评分</div>
                          <div className="font-medium">{typeof active.aiScore === "number" ? `${active.aiScore}/100` : "--"}</div>
                        </div>
                      </div>
                    )}
                    {aiView === "schedule" && (
                      <div className="text-sm">
                        <div className="text-xs text-muted-foreground">建议发送时间窗</div>
                        <div className="font-medium mb-2">{active.bestSendWindow || "--"}</div>
                        <div className="text-xs text-muted-foreground">说明：基于历史打开行为预测的高活跃时段（演示）。</div>
                      </div>
                    )}
                  </div>
                )}

                {active.status === "sent" && active.metrics && (
                  <div className="grid grid-cols-2 gap-3">
                    <KPICard title="投递" value={active.metrics.delivered.toLocaleString()} change={0} isPositive={true} />
                    <KPICard title="打开率" value={`${Math.round(active.metrics.openRate * 100)}%`} change={0} isPositive={true} />
                    <KPICard title="点击率" value={`${Math.round(active.metrics.clickRate * 100)}%`} change={0} isPositive={true} />
                    <KPICard title="退订率" value={`${(active.metrics.unsubRate * 100).toFixed(1)}%`} change={0} isPositive={false} />
                    <KPICard title="退信率" value={`${(active.metrics.bounceRate * 100).toFixed(1)}%`} change={0} isPositive={false} />
                  </div>
                )}

                <div className="border rounded p-3 bg-muted">
                  <div dangerouslySetInnerHTML={{ __html: active.html ?? "<p>无预览内容</p>" }} />
                </div>

                {composeMode !== "none" && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {composeMode === "reply" && "回复"}
                      {composeMode === "replyAll" && "回复全部"}
                      {composeMode === "forward" && "转发"}
                    </div>
                    <Input placeholder="主题（自动带入）" defaultValue={`Re: ${active.subject}`} />
                    <textarea className="w-full min-h-[160px] rounded border p-2" defaultValue={`\n\n> ${active.subject}\n`}></textarea>
                    <div className="flex gap-2">
                      <Button size="sm">发送测试</Button>
                      <Button size="sm" variant="outline" onClick={() => setComposeMode("none")}>取消</Button>
                    </div>
                  </div>
                )}

                {/* 预览区底部操作按钮已按需求移除 */}
                </div>
              )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
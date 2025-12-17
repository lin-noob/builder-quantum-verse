import { useMemo, useState, useEffect } from "react";
import { request } from "@/lib/request";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KPICard from "@/components/KPICard";
import { useToast } from "@/hooks/use-toast";
import EmailEditor from "@/components/EmailEditor";
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
  RefreshCcw,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Image,
  Paperclip,
  Smile,
  MoreHorizontal,
  List,
  ListOrdered,
  AlignLeft,
  Type,
  Undo,
  Redo,
  X,
} from "lucide-react";

type FolderKey = "inbox" | "starred" | "drafts" | "sent" | "deleted" | "spam";

type MailStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

interface EmailConfig {
  id: string;
  username: string;
  configName: string;
  emailProvider: string;
  protocol: string;
  serverAddress: string;
  port: number;
  encryption: string;
}

interface MailItem {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  htmlBody: string;
  receivedTime: number;
  sendDate: number;
  status: number;
  recipient: string;
  recipientEmail: string;
  content: string;

  // AI 字段（前端演示用，API暂未返回，保留可选）
  aiScore?: number; // 0-100 内容质量/相关性评分
  openRatePred?: number; // 0-1 预测打开率
  clickRatePred?: number; // 0-1 预测点击率
  bestSendWindow?: string; // 如 "18:00–20:00"
  spamRisk?: "low" | "medium" | "high"; // 垃圾风险
  suggestions?: string[]; // 文案/结构建议
  aiSummary?: string; // 简短AI说明

  // 兼容旧字段（可选或移除）
  starred?: boolean;
  labels?: string[]; // API暂无，暂且保留
  metrics?: {
    delivered: number;
    openRate: number;
    clickRate: number;
    unsubRate: number;
    bounceRate: number;
  };
}

const mockMails: MailItem[] = [];

export default function EmailMarketingMailbox() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  // Infinite Scroll State
  const [mails, setMails] = useState<MailItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageSize = 20;

  const [folder, setFolder] = useState<FolderKey>("inbox");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState<"none" | "reply" | "replyAll" | "forward">("none");
  const [aiView, setAiView] = useState<"none" | "insights" | "predict" | "schedule">("none");
  const enableAI = true; // 前端演示：是否显示AI入口

  // 回复弹框相关 state
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

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
        </Badge>,
      );
    }
    if (typeof m.openRatePred === "number") {
      push(
        <Badge key="open" variant="secondary" className="px-1 py-0 h-5 text-[10px]">
          预测打开 {Math.round(m.openRatePred * 100)}%
        </Badge>,
      );
    }
    if (m.bestSendWindow) {
      push(
        <Badge key="window" variant="outline" className="px-1 py-0 h-5 text-[10px]">
          最佳时段 {m.bestSendWindow}
        </Badge>,
      );
    }
    if (typeof m.clickRatePred === "number") {
      push(
        <Badge key="click" variant="outline" className="px-1 py-0 h-5 text-[10px]">
          预测点击 {Math.round(m.clickRatePred * 100)}%
        </Badge>,
      );
    }
    return <div className="flex flex-wrap gap-1">{nodes}</div>;
  };

  const data = useMemo(() => {
    // const byFolder = mockMails.filter((m) => m.folder === folder);
    // Use fetched mails instead of mockMails
    const byFolder = mails; // Currently ignoring folder filter for API data as per requirement, or should we filter?
    // User asked for pagination interface, usually backend handles filtering.
    // For now, let's assume the API returns what we need or we display what we get.
    // If client-side filtering is needed:
    // const byFolder = mails.filter((m) => m.folder === folder);

    if (!search) return byFolder;
    const q = search.toLowerCase();
    return byFolder.filter(
      (m) => m.subject.toLowerCase().includes(q) || (m.labels && m.labels.some((l) => l.toLowerCase().includes(q))),
    );
  }, [mails, folder, search]);

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
  // 简单映射：status 0=draft, 1=sent. 其他暂不支持
  const canShowInsights = !!(active && [0, 1].includes(active.status));
  const canShowPredict = !!(active && [1].includes(active.status));
  const canShowSchedule = !!(active && [0].includes(active.status));

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    toast({ title: "已移动到已删除", description: `共 ${selectedIds.length} 封` });
    setSelectedIds([]);
  };

  const handleReject = () => {
    if (selectedIds.length === 0) return;
    toast({ title: "已加入抑制名单", description: `选中 ${selectedIds.length} 封的收件人将被过滤` });
  };

  const handleReply = () => {
    if (!active) return;
    setComposeMode("reply");
    setReplySubject(`Re: ${active.subject}`);
    setReplyContent(
      `\n\n\n------- 原始邮件 -------\n发件人: ${active.senderName || active.senderEmail}\n主题: ${active.subject}\n\n${active.htmlBody?.replace(/<[^>]+>/g, "") || ""}`,
    );
    setReplyDialogOpen(true);
  };

  const handleReplyAll = () => {
    if (!active) return;
    setComposeMode("replyAll");
    setReplySubject(`Re: ${active.subject}`);
    setReplyContent(
      `\n\n\n------- 原始邮件 -------\n发件人: ${active.senderName || active.senderEmail}\n主题: ${active.subject}\n\n${active.htmlBody?.replace(/<[^>]+>/g, "") || ""}`,
    );
    setReplyDialogOpen(true);
  };

  const handleForward = () => {
    if (!active) return;
    setComposeMode("forward");
    setReplySubject(`Fwd: ${active.subject}`);
    setReplyContent(
      `\n\n\n------- 转发邮件 -------\n发件人: ${active.senderName || active.senderEmail}\n主题: ${active.subject}\n\n${active.htmlBody?.replace(/<[^>]+>/g, "") || ""}`,
    );
    setReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (!replySubject.trim() || !replyContent.trim()) {
      toast({
        title: "内容不完整",
        description: "请填写主题和内容",
        variant: "destructive",
      });
      return;
    }

    const attachmentInfo = attachments.length > 0 ? `，包含 ${attachments.length} 个附件` : "";

    toast({
      title: composeMode === "forward" ? "转发成功" : "回复成功",
      description: `邮件已${composeMode === "forward" ? "转发" : "发送"}${attachmentInfo}`,
    });
    setReplyDialogOpen(false);
    setComposeMode("none");
    setReplySubject("");
    setReplyContent("");
    setAttachments([]);
  };

  const handleCancelReply = () => {
    setReplyDialogOpen(false);
    setComposeMode("none");
    setReplySubject("");
    setReplyContent("");
    setAttachments([]);
  };

  // Status Enum Mapping
  const FolderStatusMap: Record<FolderKey, number> = {
    drafts: 0,
    sent: 1,
    deleted: 2,
    inbox: 3,
    spam: 4,
    starred: 5,
  };

  const fetchEmails = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    if (!selectedConfigId) return;

    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const status = FolderStatusMap[folder];

      const response = await request.get("/admin/api/user/email/page", {
        configId: selectedConfigId,
        pageSize,
        currentpage: currentPage,
        status,
      });

      const newMails = response.data?.data?.records || []; // Assuming records is the array
      const total = response.data?.data?.total || 0;

      if (reset) {
        setMails(newMails);
        setPage(2);
      } else {
        setMails((prev) => [...prev, newMails]);
        setPage((prev) => prev + 1);
      }

      setHasMore(newMails.length === pageSize); // Simple check, or use total
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEmail = async () => {
    if (!selectedConfigId) return;
    setLoading(true);
    try {
      await request.post("/admin/api/user/email/config/release", { id: selectedConfigId });
      fetchEmails(true);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset and fetch when config or folder changes
  useEffect(() => {
    if (selectedConfigId) {
      setMails([]);
      setPage(1);
      setHasMore(true);
      fetchEmails(true);
    }
  }, [selectedConfigId, folder]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      fetchEmails();
    }
  };

  useEffect(() => {
    const fetchEmailConfig = async () => {
      try {
        const response = await request.get("/admin/api/user/email/config/list");
        const list = response.data?.data || [];
        setEmailConfigs(list);
        if (list.length > 0) {
          setSelectedConfigId(list[0].id);
        }
        console.log("Email Config List Response:", response);
      } catch (error) {
        console.error("Failed to fetch email config list:", error);
      }
    };
    fetchEmailConfig();
  }, []);

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      {/* 顶部工具栏 */}
      {/* <Card>
        <CardContent className="pt-6 flex flex-wrap items-center gap-2">
          <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="选择邮箱" />
            </SelectTrigger>
            <SelectContent>
              {emailConfigs.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> 新建邮件
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" /> 删除
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2"
          >
            <Ban className="h-4 w-4" /> 拒收
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReply}
            disabled={!active}
            className="flex items-center gap-2"
          >
            <Reply className="h-4 w-4" /> 回复
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReplyAll}
            disabled={!active}
            className="flex items-center gap-2"
          >
            <ReplyAll className="h-4 w-4" /> 回复全部
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleForward}
            disabled={!active}
            className="flex items-center gap-2"
          >
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
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索主题/标签"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card> */}

      {/* 三栏布局（合并为一个卡片，分割线区分，每栏有内边距）*/}
      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <div className="flex flex-col md:flex-row items-stretch h-full">
            {/* 左侧文件夹（12%）*/}
            <div className="md:basis-[16%] p-3">
              <div className="flex gap-2">
                <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="选择邮箱" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailConfigs.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={handleFetchEmail} className="flex items-center gap-2 mb-2">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
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

                <div className="mt-4">{/* 保留占位的间距以维持顶部与列表的分隔，可按需删除 */}</div>
                {/* 标签与自定义文件夹区域已移除 */}
              </div>
            </div>

            {/* 中间列表（13%）*/}
            <div className="md:basis-[19%] overflow-auto p-3 md:border-l md:border-border" onScroll={handleScroll}>
              <div className="text-sm font-medium mb-2">
                {folder === "sent" ? "已发送" : folder === "drafts" ? "草稿" : "邮件列表"}
              </div>
              <div className="space-y-2">
                {data.map((m) => {
                  const sender = m.senderName || m.senderEmail;
                  const snippet = m.content;
                  const dateMD = m.receivedTime ? new Date(m.receivedTime).toLocaleDateString() : ""; // 显示日期
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-2 p-2 rounded cursor-pointer ${
                        activeId === m.id ? "bg-muted" : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveId(m.id)}
                    >
                      <Avatar className="h-6 w-6 mt-0.5">
                        <AvatarImage src="" alt={sender} />
                        <AvatarFallback>{(sender[0] || "?").toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div
                          className={`flex items-center gap-2 text-xs min-w-0 ${
                            activeId === m.id ? "text-foreground font-medium" : "text-muted-foreground"
                          }`}
                        >
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
                              <Badge variant="secondary" className="px-1 py-0 h-5 text-[10px]">
                                预测打开 {Math.round(m.openRatePred * 100)}%
                              </Badge>
                            )}
                            {renderBadges(m)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {loading && <div className="text-center text-xs py-2">加载中...</div>}
                {!loading && data.length === 0 && (
                  <div className="text-center text-muted-foreground py-6 text-xs">暂无数据</div>
                )}
                {!hasMore && data.length > 0 && (
                  <div className="text-center text-xs py-2 text-muted-foreground">没有更多了</div>
                )}
              </div>
            </div>

            {/* 右侧预览区（75%）*/}
            <div className="md:basis-[58%] overflow-auto  p-3 md:border-l md:border-border">
              <div className="text-sm font-medium mb-2">预览</div>
              <div className="space-y-4">
                {!active && <div className="text-sm text-muted-foreground">请选择左侧列表中的一封邮件进行预览</div>}

                {active && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold">{active.subject}</h2>
                        <p className="text-xs text-muted-foreground">
                          来自 {active.senderName} &lt;{active.senderEmail}&gt; ·{" "}
                          {new Date(active.receivedTime).toLocaleString()}
                        </p>
                      </div>
                      {/* <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleReply} className="gap-2">
                          <Reply className="h-4 w-4" /> 回复
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleReplyAll} className="gap-2">
                          <ReplyAll className="h-4 w-4" /> 回复全部
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleForward} className="gap-2">
                          <Forward className="h-4 w-4" /> 转发
                        </Button>
                      </div> */}
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
                          <Button size="sm" variant="ghost" onClick={() => setAiView("none")}>
                            收起
                          </Button>
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
                              <div className="font-medium">
                                {typeof active.openRatePred === "number"
                                  ? `${Math.round(active.openRatePred * 100)}%`
                                  : "--"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">预测点击率</div>
                              <div className="font-medium">
                                {typeof active.clickRatePred === "number"
                                  ? `${Math.round(active.clickRatePred * 100)}%`
                                  : "--"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">内容评分</div>
                              <div className="font-medium">
                                {typeof active.aiScore === "number" ? `${active.aiScore}/100` : "--"}
                              </div>
                            </div>
                          </div>
                        )}
                        {aiView === "schedule" && (
                          <div className="text-sm">
                            <div className="text-xs text-muted-foreground">建议发送时间窗</div>
                            <div className="font-medium mb-2">{active.bestSendWindow || "--"}</div>
                            <div className="text-xs text-muted-foreground">
                              说明：基于历史打开行为预测的高活跃时段（演示）。
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {active.status === 1 && active.metrics && (
                      <div className="grid grid-cols-2 gap-3">
                        <KPICard
                          title="投递"
                          value={active.metrics.delivered.toLocaleString()}
                          change={0}
                          isPositive={true}
                        />
                        <KPICard
                          title="打开率"
                          value={`${Math.round(active.metrics.openRate * 100)}%`}
                          change={0}
                          isPositive={true}
                        />
                      </div>
                    )}

                    <div className="border rounded p-4 bg-white">
                      <iframe
                        srcDoc={active.htmlBody || ""}
                        className="w-full min-h-[520px] border-none"
                        title="Email Content"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 回复/转发 弹框 */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {composeMode === "reply" && "回复邮件"}
              {composeMode === "replyAll" && "回复全部"}
              {composeMode === "forward" && "转发邮件"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <EmailEditor
              subject={replySubject}
              setSubject={setReplySubject}
              content={replyContent}
              setContent={setReplyContent}
              attachments={attachments}
              setAttachments={setAttachments}
              onSend={handleSendReply}
              onCancel={handleCancelReply}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

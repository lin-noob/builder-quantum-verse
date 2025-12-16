import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  ListChecks,
  Tags,
  CalendarCheck,
  Languages,
  RefreshCw,
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
  const enableAI = true;
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [tempLabels, setTempLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [lastFetchAt, setLastFetchAt] = useState<string>("");

  const renderSections = () => {
    if (!active) return null;
    if (folder === "inbox") {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><ListChecks className="h-4 w-4" /> 智能归类与优先级</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">用于自动评估邮件重要性、聚类主题，并建议标签与优先级。</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">重要程度评分</div>
                  <div className="font-medium">{typeof active.aiScore === "number" ? `${active.aiScore}/100` : "--"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">主题聚类</div>
                  <div className="font-medium">通用主题</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">建议标签</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">客户</Badge>
                    <Badge variant="secondary">会议</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { const next = Array.from(new Set([...(tempLabels.length ? tempLabels : active.labels), "客户", "会议"])); setTempLabels(next); }}>一键打标签</Button>
                <Button size="sm" variant="outline">设为高优先级</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Sparkles className="h-4 w-4" /> 到达摘要与线程摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">用于快速理解单封与整线程的要点，提取待办、风险与截止日期。</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-medium">待办</div>
                  <ul className="list-disc pl-5">
                    <li>确认报价与发货时间</li>
                    <li>安排会议周四下午</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">风险</div>
                  <ul className="list-disc pl-5">
                    <li>付款条款未确认</li>
                    <li>附件发票信息缺失</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">提取到待办</Button>
                <Button size="sm" variant="outline">复制摘要</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Brain className="h-4 w-4" /> 快捷操作建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于根据上下文生成可执行的快捷动作（回复、待办、会议、转发）。</div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="secondary">生成回复草稿</Button>
                <Button size="sm" variant="secondary">提取任务到待办</Button>
                <Button size="sm" variant="secondary">创建会议</Button>
                <Button size="sm" variant="secondary">转发给合适同事</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> 跟进提醒</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于设置未回复提醒与SLA通知，避免遗漏关键回复。</div>
              <div className="text-xs text-muted-foreground">SLA：48小时未回复提醒</div>
              <div className="flex gap-2">
                <Button size="sm">设置提醒</Button>
                <Button size="sm" variant="outline">取消提醒</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> 附件洞察</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于识别合同/发票等附件中的关键信息，并生成后续操作。</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-medium">识别结果</div>
                  <ul className="list-disc pl-5">
                    <li>合同签署状态：待签</li>
                    <li>发票金额：¥12,800</li>
                    <li>PO号：A-231105</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">操作</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="secondary">提取到待办</Button>
                    <Button size="sm" variant="secondary">推送到协作工具</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> 合规与隐私提示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于发现敏感信息（PII、密钥等）并提供更安全的替代表达。</div>
              <ul className="list-disc pl-5 text-sm">
                <li>检测到可能包含PII或密钥，建议使用替代表达</li>
              </ul>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">一键替换建议表达</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Languages className="h-4 w-4" /> 翻译与双语</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于检测邮件语言并生成英文版或中英双语内容，保持术语与语气一致。</div>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline">检测语言</Button>
                <Button size="sm" variant="outline">生成英文版</Button>
                <Button size="sm" variant="outline">生成中英双语</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (folder === "starred") {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><ListChecks className="h-4 w-4" /> 目标追踪与里程碑</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">用于为星标线程设定目标与里程碑，跟踪进度并推进完成。</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-medium">目标</div>
                  <ul className="list-disc pl-5">
                    <li>签约意向确认</li>
                    <li>技术评审完成</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium">里程碑</div>
                  <ul className="list-disc pl-5">
                    <li>本周评审</li>
                    <li>下周合同草拟</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">新增里程碑</Button>
                <Button size="sm" variant="outline">标记完成</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Star className="h-4 w-4" /> 高优先级队列</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于按重要×紧急排序，聚焦关键待办并快速推进下一步。</div>
              <div className="text-xs text-muted-foreground">重要×紧急权重：高</div>
              <Button size="sm" variant="secondary">推进下一步</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> SLA监控与提醒</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于设定响应时限并提醒相关责任人，避免响应超时。</div>
              <div className="text-xs text-muted-foreground">响应时限：24小时</div>
              <Button size="sm">设置提醒</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> 汇总日报/周报</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于生成星标邮件的进展报告，支持复制与推送到团队频道。</div>
              <div className="text-xs text-muted-foreground">自动生成进展报告（演示）。</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">复制报告</Button>
                <Button size="sm" variant="secondary">推送到团队频道</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (folder === "drafts") {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Sparkles className="h-4 w-4" /> 意图识别与结构化写作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于识别草稿意图并生成结构化大纲（背景/目标/请求/行动项）。</div>
              <div className="text-xs text-muted-foreground">推荐大纲：背景-目标-请求/行动项</div>
              <Button size="sm" variant="secondary">套用大纲到草稿</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Brain className="h-4 w-4" /> 语气与风格调整</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于改写草稿以匹配正式/友好/简洁/双语等语气并保持品牌术语一致。</div>
              <div className="grid grid-cols-4 gap-2">
                <Button size="sm" variant="outline">正式</Button>
                <Button size="sm" variant="outline">友好</Button>
                <Button size="sm" variant="outline">简洁</Button>
                <Button size="sm" variant="outline">双语</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Tags className="h-4 w-4" /> 上下文插入</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于注入相关线程、文件与日程，补齐事实并可引用出处。</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="border rounded p-2">相关线程</div>
                <div className="border rounded p-2">相关文件</div>
                <div className="border rounded p-2">相关日程</div>
              </div>
              <Button size="sm" variant="secondary">注入到草稿</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> 错别字与事实校验</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于统一术语、修正日期与数字不一致，保障内容准确性。</div>
              <ul className="list-disc pl-5 text-sm">
                <li>术语不一致：建议统一为“客户成功”</li>
                <li>日期冲突：提及的周四与会议邀请不一致</li>
              </ul>
              <Button size="sm" variant="secondary">一键修正</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> 模板库</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于快速套用常用场景模板（邀约会议、催款、售后、招聘）。</div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline">邀约会议</Button>
                <Button size="sm" variant="outline">催款提醒</Button>
                <Button size="sm" variant="outline">售后跟进</Button>
                <Button size="sm" variant="outline">招聘沟通</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (folder === "sent") {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Send className="h-4 w-4" /> 投递与互动反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于查看互动KPI与趋势，评估当前邮件的表现与影响。</div>
              {active.metrics ? (
                <div className="grid grid-cols-2 gap-3">
                  <KPICard title="投递" value={active.metrics.delivered.toLocaleString()} change={0} isPositive={true} />
                  <KPICard title="打开率" value={`${Math.round(active.metrics.openRate * 100)}%`} change={0} isPositive={true} />
                  <KPICard title="点击率" value={`${Math.round(active.metrics.clickRate * 100)}%`} change={0} isPositive={true} />
                  <KPICard title="退订率" value={`${(active.metrics.unsubRate * 100).toFixed(1)}%`} change={0} isPositive={false} />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">暂无指标（模拟）</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" /> 跟进建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-2">用于生成后续跟进内容与时机建议，提升响应率与转化。</div>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline">专业语气</Button>
                <Button size="sm" variant="outline">友好语气</Button>
                <Button size="sm" variant="outline">简洁提醒</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><ListChecks className="h-4 w-4" /> 结果对齐（承诺事项）</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于将承诺项转入任务板并跟踪责任人与截止时间，保障落实。</div>
              <ul className="list-disc pl-5 text-sm">
                <li>交付时间：下周三</li>
                <li>试用账号：今日创建</li>
              </ul>
              <Button size="sm" variant="secondary">转入任务板</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Sparkles className="h-4 w-4" /> 效果分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于统计响应与转化并生成复盘建议，可一键回流至块库改进队列。</div>
              <div className="text-xs text-muted-foreground">按主题/客户/团队聚合（演示）。</div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const advice = (active.suggestions && active.suggestions[0]) || `优化${active.subject}的首屏CTA与段落结构`;
                  try {
                    const raw = localStorage.getItem("block_improvement_queue");
                    const list = raw ? JSON.parse(raw) : [];
                    const next = Array.isArray(list) ? [...list, { id: `imp_${Date.now()}`, advice, source: active.id }] : [{ id: `imp_${Date.now()}`, advice, source: active.id }];
                    localStorage.setItem("block_improvement_queue", JSON.stringify(next));
                  } catch {}
                }}
              >
                推送建议到块库
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    if (folder === "deleted") {
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Trash2 className="h-4 w-4" /> 安全删除与快速撤销</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于快速恢复已删除邮件并提供短窗口撤销，降低误删风险。</div>
              <div className="text-xs text-muted-foreground">可恢复窗口：7天</div>
              <div className="flex gap-2">
                <Button size="sm">一键恢复</Button>
                <Button size="sm" variant="outline">撤销</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> 智能保留建议</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于识别误删场景（含附件/未读/含待办）并建议恢复，保留关键信息。</div>
              <ul className="list-disc pl-5 text-sm">
                <li>含附件未读，建议恢复</li>
                <li>含待办项，建议恢复</li>
              </ul>
              <Button size="sm" variant="secondary">恢复并标注原因</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> 清理报告</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">用于输出周期清理与恢复的统计报告，辅助邮箱治理与风险提示。</div>
              <div className="text-xs text-muted-foreground">本周期清理量与恢复量（演示）。</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">复制报告</Button>
                <Button size="sm" variant="secondary">推送到团队频道</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return null;
  };

  const [accounts, setAccounts] = useState<{ id: string; email: string; provider: string }[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("email_accounts");
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed)
        ? parsed.map((a: any) => ({ id: a.id, email: a.email || a.username || "", provider: a.provider }))
        : [];
      setAccounts(list);
      const savedActive = localStorage.getItem("activeEmailAccountId");
      setActiveAccountId(savedActive || (list[0]?.id || "default"));
    } catch {
      setAccounts([]);
      setActiveAccountId("default");
    }
  }, []);

  const activeAccount = useMemo(() => {
    if (activeAccountId === "default") return { id: "default", email: "marketing@hzfro.com", provider: "IMAP" };
    return accounts.find((a) => a.id === activeAccountId) || { id: "default", email: "marketing@hzfro.com", provider: "IMAP" };
  }, [accounts, activeAccountId]);

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
    const domain = activeAccount.email.includes("@") ? activeAccount.email.split("@")[1] : "";
    const byAccount = domain ? byFolder.filter((m) => m.from.endsWith("@" + domain)) : byFolder;
    if (!search) return byAccount;
    const q = search.toLowerCase();
    return byAccount.filter(
      (m) => m.subject.toLowerCase().includes(q) || m.labels.some((l) => l.toLowerCase().includes(q))
    );
  }, [folder, search, activeAccount]);

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
  const handleManualFetch = () => {
    const ts = new Date();
    const tsStr = `${ts.getHours().toString().padStart(2, "0")}:${ts.getMinutes()
      .toString()
      .padStart(2, "0")}:${ts.getSeconds().toString().padStart(2, "0")}`;
    setLastFetchAt(tsStr);
    toast({ title: "已手动拉取", description: `拉取完成（模拟），时间 ${tsStr}` });
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
        <CardContent className="pt-6 flex flex-wrap items-center gap-3 justify-between">
          {/* 左侧：账户相关 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">邮箱账户</span>
            <Select
              value={activeAccountId}
              onValueChange={(v) => {
                setActiveAccountId(v);
                localStorage.setItem("activeEmailAccountId", v);
              }}
            >
              <SelectTrigger className="h-9 w-56">
                <SelectValue placeholder="选择邮箱账户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">marketing@hzfro.com</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.email || `${a.provider} 账户`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" asChild className="h-9">
              <Link to="/account/settings/email">管理账户</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={handleManualFetch} className="flex items-center gap-2 h-9">
              <RefreshCw className="h-4 w-4" /> 手动拉取{lastFetchAt ? `（${lastFetchAt}）` : ""}
            </Button>
          </div>
 
          {/* 中间：动作区 */}
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleNew} className="flex items-center gap-2 h-9">
              <Plus className="h-4 w-4" /> 新建邮件
            </Button>
            <Button size="sm" variant="outline" onClick={handleDelete} disabled={selectedIds.length === 0} className="flex items-center gap-2 h-9">
              <Trash2 className="h-4 w-4" /> 删除
            </Button>
            <Button size="sm" variant="outline" onClick={handleReject} disabled={selectedIds.length === 0} className="flex items-center gap-2 h-9">
              <Ban className="h-4 w-4" /> 拒收
            </Button>
            <Button size="sm" variant="outline" onClick={handleReply} disabled={!active} className="flex items-center gap-2 h-9">
              <Reply className="h-4 w-4" /> 回复
            </Button>
            <Button size="sm" variant="outline" onClick={handleReplyAll} disabled={!active} className="flex items-center gap-2 h-9">
              <ReplyAll className="h-4 w-4" /> 回复全部
            </Button>
            <Button size="sm" variant="outline" onClick={handleForward} disabled={!active} className="flex items-center gap-2 h-9">
              <Forward className="h-4 w-4" /> 转发
            </Button>
            {enableAI && (
              <Button
                size="sm"
                variant="secondary"
                disabled={!active}
                onClick={() => {
                  setAiDrawerOpen(true);
                  setAiTab("review");
                }}
                className="flex items-center gap-2 h-9"
              >
                <Sparkles className="h-4 w-4" /> AI工作台
              </Button>
            )}
          </div>
 
          {/* 右侧：搜索 */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索主题/标签" className="pl-10 h-9" />
          </div>
        </CardContent>
      </Card>
      
      {/* 三栏布局（合并为一个卡片，分割线区分，每栏有内边距）*/}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-stretch">
            {/* 左侧文件夹（12%）*/}
            <div className="md:basis-[12%] p-3">
              <div className="text-sm font-medium mb-2">{activeAccount.email}</div>
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

                {false && (
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

                {false && (
                  <div className="space-y-3 border rounded p-3">
                    <div className="text-sm font-medium">发送前审查</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">合规清单</div>
                        <ul className="list-disc pl-5">
                          <li>包含退订说明</li>
                          <li>隐私与公司信息</li>
                          <li>区域合规提示</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">送达健康</div>
                        <ul className="list-disc pl-5">
                          <li>垃圾词雷达：{active.spamRisk === "high" ? "高" : active.spamRisk === "medium" ? "中" : "低"}</li>
                          <li>文本/图片比例：建议优化</li>
                          <li>链接校验与追踪：建议添加</li>
                        </ul>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">可读性</div>
                        <div className="font-medium">良好</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">品牌一致</div>
                        <div className="font-medium">一般</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">可达性风险</div>
                        <div className="font-medium">低</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">CTA清晰度</div>
                        <div className="font-medium">良好</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">一键改写风险词</Button>
                      <Button size="sm" variant="secondary">插入退订段</Button>
                    </div>
                  </div>
                )}

                {false && (
                  <div className="space-y-3 border rounded p-3">
                    <div className="text-sm font-medium">审批与签发</div>
                    <Input placeholder="审批备注" />
                    <div className="flex gap-2">
                      <Button size="sm">通过并锁定版本</Button>
                      <Button size="sm" variant="outline">退回修改</Button>
                    </div>
                  </div>
                )}

                {false && (
                  <div className="space-y-3 border rounded p-3">
                    <div className="text-sm font-medium">排期与发送</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">建议时间窗</div>
                        <div className="font-medium">{active.bestSendWindow || "--"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">频控提示</div>
                        <div className="font-medium">近期触达正常</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">实验配置</div>
                        <div className="font-medium">A/B 2 变体（模拟）</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">立即发送</Button>
                      <Button size="sm" variant="outline">定时发送</Button>
                    </div>
                  </div>
                )}

                {false && (
                  <div className="space-y-3 border rounded p-3">
                    <div className="text-sm font-medium">发送后分析</div>
                    {active.metrics ? (
                      <div className="grid grid-cols-2 gap-3">
                        <KPICard title="投递" value={active.metrics.delivered.toLocaleString()} change={0} isPositive={true} />
                        <KPICard title="打开率" value={`${Math.round(active.metrics.openRate * 100)}%`} change={0} isPositive={true} />
                        <KPICard title="点击率" value={`${Math.round(active.metrics.clickRate * 100)}%`} change={0} isPositive={true} />
                        <KPICard title="退订率" value={`${(active.metrics.unsubRate * 100).toFixed(1)}%`} change={0} isPositive={false} />
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">暂无指标（模拟）</div>
                    )}
                    <div className="text-xs text-muted-foreground">复盘：建议加强首屏CTA与减少冗长段落（模拟）。</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const advice = (active.suggestions && active.suggestions[0]) || `优化${active.subject}的首屏CTA与段落结构`;
                          try {
                            const raw = localStorage.getItem("block_improvement_queue");
                            const list = raw ? JSON.parse(raw) : [];
                            const next = Array.isArray(list) ? [...list, { id: `imp_${Date.now()}`, advice, source: active.id }] : [{ id: `imp_${Date.now()}`, advice, source: active.id }];
                            localStorage.setItem("block_improvement_queue", JSON.stringify(next));
                            toast({ title: "已推送到改进队列", description: advice });
                          } catch {
                            toast({ title: "推送失败", description: "本地存储不可用" });
                          }
                        }}
                      >
                        推送建议到块库
                      </Button>
                    </div>
                  </div>
                )}

                {false && (
                  <div className="space-y-3 border rounded p-3">
                    <div className="text-sm font-medium">收件智能</div>
                    <div className="text-xs text-muted-foreground">摘要：自动提取来信要点（模拟）。</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">意图</div>
                        <div className="font-medium">咨询</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">情感</div>
                        <div className="font-medium">中性</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">关联活动</div>
                        <div className="font-medium">最近促销（模拟）</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">回复建议：</div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">回复建议A</Button>
                        <Button size="sm" variant="outline">回复建议B</Button>
                        <Button size="sm" variant="outline">回复建议C</Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">生成工单</Button>
                      <Button size="sm" variant="outline">设提醒</Button>
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
      <Sheet open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
        <SheetContent side="right" className="flex h-screen flex-col">
          <SheetHeader>
            <SheetTitle>AI工作台</SheetTitle>
            <SheetDescription>围绕选中邮件提供审查、审批、排期、分析与收件智能功能</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-4 pb-6">
            {active ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> 上下文
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-muted-foreground">主题</div>
                      <div className="font-medium text-sm">{active.subject}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">发件人</div>
                      <div className="font-medium text-sm">{active.from}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">收件人数</div>
                      <div className="font-medium text-sm">{typeof active.recipients === "number" && typeof active.recipients.toLocaleString === "function" ? active.recipients.toLocaleString() : "--"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">文件夹</div>
                      <div className="font-medium text-sm">{folder === "inbox" ? "收件箱" : folder === "starred" ? "星标" : folder === "drafts" ? "草稿" : folder === "sent" ? "已发送" : "已删除"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {active ? renderSections() : <div className="text-xs text-muted-foreground">请选择邮件以查看AI工作台</div>}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, BarChart3, Edit3, Plus, Search } from "lucide-react";

interface CampaignItem {
  id: string;
  name: string;
  status: "draft" | "scheduled" | "sent";
  expectedSends: number;
  updatedAt: string;
  subject?: string;
  summary?: string;
  templateId?: string;
  keyBlocks?: ("hero" | "cta" | "product" | "divider" | "survey")[];
}

const mockCampaigns: CampaignItem[] = [
  {
    id: "cmp_001",
    name: "双十一预热邮件",
    status: "draft",
    expectedSends: 12000,
    updatedAt: "2025-11-05 14:22",
    subject: "双十一限时优惠｜全场满减再加码",
    summary: "包含英雄区与主CTA，建议添加UTM追踪。",
    templateId: "tpl_ecommerce_promo",
    keyBlocks: ["hero", "cta"],
  },
  {
    id: "cmp_002",
    name: "新品上架通知",
    status: "scheduled",
    expectedSends: 8500,
    updatedAt: "2025-11-06 09:10",
    subject: "新品首发体验｜欢迎第一时间试用",
    summary: "主推商品卡与CTA，已配置排期。",
    templateId: "tpl_product_launch",
    keyBlocks: ["product", "cta"],
  },
  {
    id: "cmp_003",
    name: "老客回访优惠券",
    status: "sent",
    expectedSends: 15600,
    updatedAt: "2025-11-01 18:30",
    subject: "专属优惠券回访｜限时领取",
    summary: "包含分割线与问卷，便于偏好收集。",
    templateId: "tpl_event_invite",
    keyBlocks: ["divider", "survey"],
  },
];

const statusLabel: Record<CampaignItem["status"], string> = {
  draft: "草稿",
  scheduled: "已排期",
  sent: "已发送",
};

export default function EmailCampaigns() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mockCampaigns.filter((c) => {
      const matchesStatus = status === "all" ? true : c.status === status;
      const matchesSearch = !search || c.name.includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  return (
    <div className="p-6 space-y-6">
      {/* Page header removed per requirement */}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索活动名称"
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="scheduled">已排期</SelectItem>
                <SelectItem value="sent">已发送</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* New Campaign button placed below filters, left aligned */}
      <div>
        <Button asChild>
          <Link to="/ai-marketing/email-campaigns/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> 新建活动
          </Link>
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>活动列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>预计发送量</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <Fragment key={c.id}>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        {c.templateId && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">模板：{c.templateId}</Badge>
                        )}
                        {c.keyBlocks?.slice(0, 3).map((kb) => (
                          <Badge key={kb} variant="outline" className="text-[10px] px-1 py-0">块：{kb}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {statusLabel[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.expectedSends.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{c.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setExpandedId((prev) => (prev === c.id ? null : c.id))}>预览</Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/ai-marketing/email-campaigns/${c.id}/edit`} className="flex items-center gap-1">
                            <Edit3 className="h-4 w-4" /> 编辑
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/ai-marketing/email-campaigns/${c.id}/analytics`} className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" /> 分析
                          </Link>
                        </Button>
                        <Button size="sm" variant="default" className="flex items-center gap-1" disabled={c.status !== "draft"}>
                          <Mail className="h-4 w-4" /> 发送
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedId === c.id && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="border rounded p-3 space-y-2">
                          <div className="text-sm font-medium">主题：{c.subject || "(未设置)"}</div>
                          <div className="text-xs text-muted-foreground">{c.summary || "暂无摘要"}</div>
                          <div className="text-xs whitespace-pre-line border rounded p-2 mt-2">
                            这是预览示意区，可在阶段B替换为真实渲染或HTML片段。当前活动包含：
                            {" "}
                            {c.keyBlocks?.join("，") || "(未插入内容块)"}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
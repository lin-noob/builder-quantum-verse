import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, LayoutTemplate, Eye, Plus } from "lucide-react";

type TemplateItem = {
  id: string;
  name: string;
  industry: string;
  purpose: string; // 促销、邀请、上新等
  highlights: string[]; // 交互区域摘要
  preview: string; // 简要预览文案
};

const mockTemplates: TemplateItem[] = [
  {
    id: "tpl_ecommerce_promo",
    name: "电商促销（限时优惠）",
    industry: "电商",
    purpose: "促销",
    highlights: ["首屏CTA", "主打商品卡", "优惠提示"],
    preview:
      "您好，\n限时专属优惠：\n- 商品卡展示\n- CTA按钮立即购买\n",
  },
  {
    id: "tpl_event_invite",
    name: "活动邀请（报名引导）",
    industry: "综合",
    purpose: "邀请",
    highlights: ["报名CTA", "日程信息"],
    preview:
      "亲爱的用户，\n本周活动邀请，点击报名参与。\n【CTA】立即报名\n",
  },
  {
    id: "tpl_product_launch",
    name: "新品上新（首发体验）",
    industry: "综合",
    purpose: "上新",
    highlights: ["新品亮点", "体验CTA"],
    preview: "新品上架，欢迎第一时间体验并反馈。\n【CTA】查看新品\n",
  },
];

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [purpose, setPurpose] = useState<string>("all");

  const filtered = useMemo(() => {
    return mockTemplates.filter((t) => {
      const s = !search || t.name.includes(search);
      const i = industry === "all" ? true : t.industry === industry;
      const p = purpose === "all" ? true : t.purpose === purpose;
      return s && i && p;
    });
  }, [search, industry, purpose]);

  const handleInsertToCompose = (tpl: TemplateItem) => {
    // 方案C：在模板构建器打开并预加载该模板
    navigate(`/ai-marketing/template-builder?seedTemplate=${encodeURIComponent(tpl.id)}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 顶部工具区移除，统一将操作按钮移动到筛选卡片下方 */}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索模板名称"
              className="w-full sm:w-64"
            />
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="行业" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部行业</SelectItem>
                <SelectItem value="电商">电商</SelectItem>
                <SelectItem value="综合">综合</SelectItem>
              </SelectContent>
            </Select>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="目的" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部目的</SelectItem>
                <SelectItem value="促销">促销</SelectItem>
                <SelectItem value="邀请">邀请</SelectItem>
                <SelectItem value="上新">上新</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮：筛选区下方左侧，仅保留“新建模板” */}
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-2">
          <Button asChild variant="default">
            <Link to="/ai-marketing/template-builder" className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" /> 新建模板
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                {tpl.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">行业：{tpl.industry}</Badge>
                <Badge variant="outline">目的：{tpl.purpose}</Badge>
                {tpl.highlights.map((h) => (
                  <Badge key={h} variant="secondary" className="capitalize">{h}</Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground whitespace-pre-line border rounded p-3">
                {tpl.preview}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="default" onClick={() => handleInsertToCompose(tpl)} className="gap-1">
                  <LayoutTemplate className="h-4 w-4" /> 在模板构建器打开
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to={`/ai-marketing/email/compose/preview?previewTemplate=${encodeURIComponent(tpl.id)}`} className="gap-1 flex items-center">
                    <Eye className="h-4 w-4" /> 在编辑器预览
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Layers3, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

type BlockStatus = "draft" | "review" | "published" | "deprecated";
type BlockItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  propsHint: string[];
  preview: string;
  richHtml?: string;
  extraFields?: Record<string, string>;
  tags?: string[];
  status?: BlockStatus;
  version?: string;
  usageCount?: number;
};

const mockBlocks: BlockItem[] = [
  {
    id: "blk_hero_basic",
    name: "英雄区（标题+副标题）",
    category: "英雄区",
    description: "首屏展示核心卖点，适合促销或上新",
    propsHint: ["标题", "副标题", "背景图(可选)"],
    preview: "【英雄区】标题：年度大促｜副标题：限时抢购",
    tags: ["电商", "促销"],
    status: "published",
    version: "v1",
    usageCount: 36,
  },
  {
    id: "blk_cta_primary",
    name: "主CTA按钮",
    category: "CTA",
    description: "主要转化入口，强调行动",
    propsHint: ["文案", "链接", "UTM参数"],
    preview: "【CTA】立即购买 → https://example.com",
    tags: ["通用", "CTA"],
    status: "published",
    version: "v2",
    usageCount: 58,
  },
  {
    id: "blk_product_card",
    name: "产品卡（图文+价格）",
    category: "产品卡",
    description: "展示主打商品与价格信息",
    propsHint: ["图片URL", "标题", "价格", "链接"],
    preview: "【商品卡】商品A｜¥199｜点击查看",
    tags: ["电商"],
    status: "review",
    version: "v1",
    usageCount: 12,
  },
  {
    id: "blk_divider",
    name: "分割线",
    category: "结构",
    description: "分隔内容区域，提升版面层次",
    propsHint: ["样式(细/粗)", "颜色"],
    preview: "────────────",
    tags: ["通用"],
    status: "published",
    version: "v1",
    usageCount: 102,
  },
  {
    id: "blk_survey_quick",
    name: "快速问卷（单选）",
    category: "互动",
    description: "获取用户偏好，提升互动",
    propsHint: ["问题", "选项", "提交事件Key"],
    preview: "【问卷】你更关注哪个类目？A/B/C",
    tags: ["互动"],
    status: "draft",
    version: "v0",
    usageCount: 3,
  },
];

export default function ContentBlockLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<BlockStatus | "all">("all");
  const [tagQuery, setTagQuery] = useState<string>("");

  // 用状态管理内容块数据，支持新增后立即显示
  const [blocks, setBlocks] = useState<BlockItem[]>(mockBlocks);

  // 右侧新建内容块表单状态
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string>("英雄区");
  const [newDescription, setNewDescription] = useState("");
  const [newPropsHintText, setNewPropsHintText] = useState("");
  const [newPreview, setNewPreview] = useState("");
  const [newRichHtml, setNewRichHtml] = useState("");
  // 分类可选字段（暂存，不强制）
  const [newBackgroundUrl, setNewBackgroundUrl] = useState("");
  const [newAlign, setNewAlign] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCurrency, setNewCurrency] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newThickness, setNewThickness] = useState("");
  const [newMargin, setNewMargin] = useState("");
  const [newVariant, setNewVariant] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newAnonymousAllowed, setNewAnonymousAllowed] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setNewName("");
    setNewCategory("英雄区");
    setNewDescription("");
    setNewPropsHintText("");
    setNewPreview("");
    setNewRichHtml("");
    setNewBackgroundUrl("");
    setNewAlign("");
    setNewImageUrl("");
    setNewCurrency("");
    setNewBadge("");
    setNewThickness("");
    setNewMargin("");
    setNewVariant("");
    setNewSize("");
    setNewAnonymousAllowed("");
    setFormError(null);
  };

  const filtered = useMemo(() => {
    return blocks.filter((b) => {
      const s = !search || b.name.includes(search) || b.description.includes(search);
      const c = category === "all" ? true : b.category === category;
      const st = status === "all" ? true : (b.status || "draft") === status;
      const tq = !tagQuery ? true : (b.tags || []).some((t) => t.toLowerCase().includes(tagQuery.toLowerCase()));
      return s && c && st && tq;
    });
  }, [search, category, status, tagQuery, blocks]);

  // 识别库内内置块（支持以ID传递），否则以JSON传递给编辑器
  const KNOWN_BLOCK_IDS = new Set(mockBlocks.map((b) => b.id));
  const mapCategoryToType = (
    cat: string
  ): "hero" | "cta" | "product" | "divider" | "survey" | "rich" => {
    if (cat === "英雄区") return "hero";
    if (cat === "CTA") return "cta";
    if (cat === "产品卡") return "product";
    if (cat === "结构") return "divider";
    if (cat === "富文本") return "rich";
    return "survey"; // 互动
  };

  const handleInsertToCompose = (blk: BlockItem) => {
    if (KNOWN_BLOCK_IDS.has(blk.id)) {
      navigate(`/ai-marketing/email/compose?insertBlock=${encodeURIComponent(blk.id)}`);
    } else {
      const type = mapCategoryToType(blk.category);
      const data: any = {
        id: `blk_${Date.now()}`,
        type,
        title: blk.name,
        props: {},
      };
      // 富文本优先：如填写富文本则传递 html
      if (blk.richHtml) {
        data.props.html = blk.richHtml;
      }
      // 分类可选字段透传到 props
      if (blk.extraFields) {
        Object.entries(blk.extraFields).forEach(([k, v]) => {
          data.props[k] = v;
        });
      }
      const q = encodeURIComponent(JSON.stringify(data));
      navigate(`/ai-marketing/email/compose?insertBlockData=${q}`);
    }
  };

  const getPreviewUrlForBlock = (blk: BlockItem) => {
    if (KNOWN_BLOCK_IDS.has(blk.id)) {
      return `/ai-marketing/email/compose/preview?previewBlock=${encodeURIComponent(blk.id)}`;
    }
    const type = mapCategoryToType(blk.category);
    const data: any = {
      id: blk.id,
      type,
      title: blk.name,
      props: {},
    };
    if (blk.richHtml) {
      data.props.html = blk.richHtml;
    }
    if (blk.extraFields) {
      Object.entries(blk.extraFields).forEach(([k, v]) => {
        data.props[k] = v;
      });
    }
    return `/ai-marketing/email/compose/preview?previewBlockData=${encodeURIComponent(JSON.stringify(data))}`;
  };

  const handleCreateBlock = () => {
    if (!newName.trim()) {
      setFormError("请填写名称");
      return;
    }
    if (!newCategory) {
      setFormError("请选择分类");
      return;
    }
    // 富文本为可选：不强制填写
    const id = `blk_${newCategory}_${Math.random().toString(36).slice(2, 8)}`;
    const propsHint = newPropsHintText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 生成预览文本（若填富文本则自动提取纯文本摘要）
    let previewText = newPreview;
    let extra: Partial<BlockItem> = {};
    if (newRichHtml.trim()) {
      const plain = newRichHtml.replace(/<[^>]+>/g, "").trim();
      if (!previewText) {
        previewText = plain ? `${plain.slice(0, 60)}${plain.length > 60 ? "..." : ""}` : "(无预览文本)";
      }
      extra.richHtml = newRichHtml;
    }

    // 分类可选字段聚合
    const extraFields: Record<string, string> = {};
    if (newCategory === "英雄区") {
      if (newBackgroundUrl.trim()) extraFields.backgroundUrl = newBackgroundUrl.trim();
      if (newAlign.trim()) extraFields.align = newAlign.trim();
    }
    if (newCategory === "产品卡") {
      if (newImageUrl.trim()) extraFields.imageUrl = newImageUrl.trim();
      if (newCurrency.trim()) extraFields.currency = newCurrency.trim();
      if (newBadge.trim()) extraFields.badge = newBadge.trim();
    }
    if (newCategory === "结构") {
      if (newThickness.trim()) extraFields.thickness = newThickness.trim();
      if (newMargin.trim()) extraFields.margin = newMargin.trim();
    }
    if (newCategory === "CTA") {
      if (newVariant.trim()) extraFields.variant = newVariant.trim();
      if (newSize.trim()) extraFields.size = newSize.trim();
    }
    if (newCategory === "互动") {
      if (newAnonymousAllowed.trim()) extraFields.anonymousAllowed = newAnonymousAllowed.trim();
    }

    const newBlk: BlockItem = {
      id,
      name: newName.trim(),
      category: newCategory,
      description: newDescription.trim(),
      propsHint,
      preview: previewText,
      ...extra,
      extraFields,
    };
    setBlocks((prev) => [newBlk, ...prev]);
    setOpen(false);
    resetForm();
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
              placeholder="搜索内容块"
              className="w-full sm:w-64"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem value="英雄区">英雄区</SelectItem>
                <SelectItem value="CTA">CTA</SelectItem>
                <SelectItem value="产品卡">产品卡</SelectItem>
                <SelectItem value="结构">结构</SelectItem>
                <SelectItem value="互动">互动</SelectItem>
                <SelectItem value="富文本">富文本</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="review">评审中</SelectItem>
                <SelectItem value="published">已发布</SelectItem>
                <SelectItem value="deprecated">已下线</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              placeholder="按标签筛选"
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮：移动到筛选卡片下方（左侧对齐） */}
      <div className="flex items-center justify-start">
        <div className="flex items-center gap-2">
          {/* 新建内容块：右侧侧栏表单 */}
          <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <SheetTrigger asChild>
              <Button variant="default" className="gap-2" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> 新建内容块
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>新建内容块</SheetTitle>
                <SheetDescription>填写块信息，保存后将加入内容库。</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4 overflow-auto">
                <div className="space-y-2">
                  <div className="text-sm font-medium">名称</div>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例如：优惠券卡片（满减）" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">分类</div>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="英雄区">英雄区</SelectItem>
                      <SelectItem value="CTA">CTA</SelectItem>
                      <SelectItem value="产品卡">产品卡</SelectItem>
                      <SelectItem value="结构">结构</SelectItem>
                      <SelectItem value="互动">互动</SelectItem>
                      <SelectItem value="富文本">富文本</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* 富文本（可选，所有分类通用） */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">富文本内容（可选）</div>
                  <ReactQuill value={newRichHtml} onChange={setNewRichHtml} theme="snow" />
                  <div className="text-xs text-muted-foreground">
                    如填写，将在编辑器以富文本优先渲染。
                  </div>
                  <div className="text-xs text-muted-foreground">
                    解释：如果块携带 <code>props.html</code>（即你在库页填写了富文本），编辑器会优先按富文本渲染，忽略该分类的默认样式预览；如果未填写富文本，则按分类的默认预览渲染（英雄区显示标题/副标题，CTA 显示文案/链接等）。
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">用途说明</div>
                  <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="该内容块的适用场景与说明" rows={3} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">参数提示（逗号分隔）</div>
                  <Input value={newPropsHintText} onChange={(e) => setNewPropsHintText(e.target.value)} placeholder="例如：标题, 链接, 有效期" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">预览文本（可选）</div>
                  <Textarea value={newPreview} onChange={(e) => setNewPreview(e.target.value)} placeholder="用于列表卡片的简要预览，不填将自动生成摘要" rows={3} />
                </div>

                {/* 分类可选字段 */}
                {newCategory === "英雄区" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">英雄区可选字段</div>
                    <Input value={newBackgroundUrl} onChange={(e) => setNewBackgroundUrl(e.target.value)} placeholder="背景图 URL（可选）" />
                    <Input value={newAlign} onChange={(e) => setNewAlign(e.target.value)} placeholder="对齐方式（left/center/right，可选）" />
                  </div>
                )}
                {newCategory === "产品卡" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">产品卡可选字段</div>
                    <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="图片 URL（可选）" />
                    <Input value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)} placeholder="币种（如 CNY，可选）" />
                    <Input value={newBadge} onChange={(e) => setNewBadge(e.target.value)} placeholder="角标文案（可选）" />
                  </div>
                )}
                {newCategory === "结构" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">分割线可选字段</div>
                    <Input value={newThickness} onChange={(e) => setNewThickness(e.target.value)} placeholder="粗细（如 thin/2px，可选）" />
                    <Input value={newMargin} onChange={(e) => setNewMargin(e.target.value)} placeholder="上下间距（如 24px，可选）" />
                  </div>
                )}
                {newCategory === "CTA" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">CTA 可选字段</div>
                    <Input value={newVariant} onChange={(e) => setNewVariant(e.target.value)} placeholder="样式（primary/secondary，可选）" />
                    <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="尺寸（sm/md/lg，可选）" />
                  </div>
                )}
                {newCategory === "互动" && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">互动可选字段</div>
                    <Input value={newAnonymousAllowed} onChange={(e) => setNewAnonymousAllowed(e.target.value)} placeholder="允许匿名（yes/no，可选）" />
                  </div>
                )}

                {formError && (
                  <div className="text-sm text-red-600">{formError}</div>
                )}
              </div>

              <SheetFooter className="mt-4">
                <SheetClose asChild>
                  <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
                </SheetClose>
                <Button onClick={handleCreateBlock}>保存</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* 已移除：打开编辑器与新建活动按钮 */}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((blk) => (
          <Card key={blk.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {blk.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">分类：{blk.category}</Badge>
                {blk.version && <Badge variant="outline">版本：{blk.version}</Badge>}
                {blk.status && <Badge variant="outline">状态：{blk.status}</Badge>}
                {blk.propsHint.map((h) => (
                  <Badge key={h} variant="secondary" className="capitalize">{h}</Badge>
                ))}
                {(blk.tags || []).map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground whitespace-pre-line border rounded p-3">
                {blk.preview}
              </div>
              {typeof blk.usageCount === "number" && (
                <div className="text-xs text-muted-foreground">使用次数：{blk.usageCount}</div>
              )}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="default" onClick={() => handleInsertToCompose(blk)}>
                  插入到编辑器
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={getPreviewUrlForBlock(blk)}>在编辑器预览</Link>
                </Button>
                {/* 删除：基于块组合模板按钮 */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

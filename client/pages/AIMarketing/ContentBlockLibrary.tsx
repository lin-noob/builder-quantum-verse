import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Layers3, Plus, Sparkles, Wand2, RefreshCw, AlignLeft, AlignJustify, Type } from "lucide-react";
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
  favorite?: boolean;
  scoreCard?: { readability: number; consistency: number; risk: number; cta: number; total: number };
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
  const [editorId, setEditorId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

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

  

  const [aiIndustry, setAiIndustry] = useState("SaaS");
  const [aiAudience, setAiAudience] = useState("新用户");
  const [aiGoal, setAiGoal] = useState("注册");
  const [aiTone, setAiTone] = useState("专业");
  const [aiLanguage, setAiLanguage] = useState("中文");

  // AI 模拟处理函数
  const simulateAiAction = (action: string, currentHtml: string): string => {
    const plain = currentHtml.replace(/<[^>]+>/g, "").trim();
    if (!plain) return "<p>AI根据您的要求生成了新的内容...</p>";
    
    switch (action) {
      case "polish":
        return `<p>${plain} (AI已润色：优化了语句通顺度，提升了表达质感)</p>`;
      case "expand":
        return `<p>${plain} ${plain} (AI已扩写：增加了更多细节描述，补充了相关背景信息，使内容更加丰富完整)</p>`;
      case "shorten":
        return `<p>${plain.slice(0, Math.max(10, Math.floor(plain.length / 2)))}... (AI已精简)</p>`;
      case "professional":
        return `<p>【专业版】${plain} (AI已调整为专业语气，适合商务场景)</p>`;
      case "friendly":
        return `<p>Hi~ ${plain} (AI已调整为亲切语气，拉近用户距离)</p>`;
      case "fix":
        return `<p>${plain} (AI已纠错：修正了2处语法错误)</p>`;
      default:
        return currentHtml;
    }
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
    const propsHint = (newPropsHintText || "")
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

    const extraFields: Record<string, string> = {};

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

  

  const handleAiGenerate = () => {
    const variants = Array.from({ length: 3 }).map((_, idx) => {
      const id = `blk_gen_${Date.now()}_${idx}`;
      const name = `${aiIndustry}·${aiGoal}·块${idx + 1}`;
      const content = `${aiTone}语气，面向${aiAudience}，用于${aiGoal}，语言${aiLanguage}`;
      const preview = `【${aiIndustry}/${aiGoal}】${aiTone}｜${aiAudience}｜${aiLanguage}`;
      return {
        id,
        name,
        category: "富文本",
        description: content,
        propsHint: ["html"],
        preview,
        richHtml: `<p>${content}</p>`,
        tags: [aiIndustry, aiGoal, aiTone],
        status: "draft" as BlockStatus,
        version: "v1",
        usageCount: 0,
      } as BlockItem;
    });
    setBlocks((prev) => [...variants, ...prev]);
    setAiOpen(false);
  };

  

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Button variant="default" className="gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> 新建内容块
            </Button>
         </div>
      </div>

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <SheetContent side="right" className="flex flex-col sm:max-w-2xl w-full">
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
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium">内容</div>
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-lg border">
                      <div className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI助手:
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setNewRichHtml(simulateAiAction("polish", newRichHtml))}>
                        <Wand2 className="w-3 h-3" /> 润色
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setNewRichHtml(simulateAiAction("fix", newRichHtml))}>
                        <RefreshCw className="w-3 h-3" /> 纠错
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setNewRichHtml(simulateAiAction("expand", newRichHtml))}>
                        <AlignJustify className="w-3 h-3" /> 扩写
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setNewRichHtml(simulateAiAction("shorten", newRichHtml))}>
                        <AlignLeft className="w-3 h-3" /> 精简
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setNewRichHtml(simulateAiAction("professional", newRichHtml))}>
                        <Type className="w-3 h-3" /> 专业
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => setNewRichHtml(simulateAiAction("friendly", newRichHtml))}>
                        <Type className="w-3 h-3" /> 亲切
                      </Button>
                    </div>
                  </div>
                  <ReactQuill value={newRichHtml} onChange={setNewRichHtml} theme="snow" />
                </div>

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

      <Sheet open={!!editorId} onOpenChange={(v) => { if (!v) setEditorId(null); }}>
        <SheetContent side="right" className="flex flex-col sm:max-w-2xl w-full">
          <SheetHeader>
            <SheetTitle>编辑内容块</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex-1 flex flex-col space-y-4">
            {(() => {
              const blk = blocks.find((b) => b.id === editorId);
              if (!blk) return <div className="text-xs text-muted-foreground">未选中内容块</div>;
              
              const handleAi = (action: string) => {
                 const current = blk.richHtml || blk.preview || "";
                 const newContent = simulateAiAction(action, current);
                 const plain = newContent.replace(/<[^>]+>/g, "").trim();
                 const preview = plain ? `${plain.slice(0, 60)}...` : "";
                 setBlocks(prev => prev.map(b => b.id === blk.id ? { ...b, richHtml: newContent, preview } : b));
              };

              return (
                <div className="flex-1 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">名称</div>
                    <Input 
                      value={blk.name} 
                      onChange={(e) => setBlocks(prev => prev.map(b => b.id === blk.id ? { ...b, name: e.target.value } : b))}
                    />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col">
                     <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">内容</div>
                        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-lg border">
                           <div className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
                             <Sparkles className="w-3 h-3" /> AI助手:
                           </div>
                           <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => handleAi("polish")}>
                             <Wand2 className="w-3 h-3" /> 润色
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => handleAi("fix")}>
                             <RefreshCw className="w-3 h-3" /> 纠错
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => handleAi("expand")}>
                             <AlignJustify className="w-3 h-3" /> 扩写
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => handleAi("shorten")}>
                             <AlignLeft className="w-3 h-3" /> 精简
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => handleAi("professional")}>
                             <Type className="w-3 h-3" /> 专业
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 bg-white" onClick={() => handleAi("friendly")}>
                             <Type className="w-3 h-3" /> 亲切
                           </Button>
                        </div>
                     </div>
                    <ReactQuill 
                      className="flex-1 h-full"
                      value={blk.richHtml || blk.preview || ""} 
                      onChange={(val) => {
                         // Update both richHtml and preview (stripped)
                         const plain = val.replace(/<[^>]+>/g, "").trim();
                         const preview = plain ? `${plain.slice(0, 60)}${plain.length > 60 ? "..." : ""}` : "";
                         setBlocks(prev => prev.map(b => b.id === blk.id ? { ...b, richHtml: val, preview } : b));
                      }} 
                      theme="snow" 
                    />
                  </div>
                </div>
              );
            })()}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={() => setEditorId(null)}>完成</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((blk) => (
          <Card key={blk.id} className="flex flex-col relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`absolute top-2 right-2 h-6 w-6 ${blk.favorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => {
                setBlocks((prev) => prev.map((b) => b.id === blk.id ? { ...b, favorite: !b.favorite } : b));
                try {
                  const raw = localStorage.getItem("block_favorites");
                  const favs = raw ? JSON.parse(raw) : [];
                  const set = new Set(Array.isArray(favs) ? favs : []);
                  if (!blk.favorite) set.add(blk.id); else set.delete(blk.id);
                  localStorage.setItem("block_favorites", JSON.stringify(Array.from(set)));
                } catch {}
              }}
            >
              <span className="sr-only">收藏</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={blk.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </Button>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 pr-6 truncate" title={blk.name}>
                {blk.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="text-xs text-muted-foreground whitespace-pre-line border rounded p-3 bg-muted/20 flex-1 line-clamp-3 overflow-hidden text-ellipsis">
                {blk.preview}
              </div>
              <div className="flex items-center justify-between pt-2">
                {(() => {
                  const t = (blk.preview || "").replace(/\s+/g, "");
                  const h = Math.max(0, Math.min(100, 100 - Math.abs(t.length - 60)));
                  const r = [
                    /免费|保证|最高|无条件|不限制/.test(t) ? 1 : 0,
                    /http(s)?:\/\//.test(t) ? 0 : 1,
                  ].reduce((a, b) => a + b, 0);
                  // 简化显示：只显示圆点
                  return (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground" title={`健康度：${h}，风险项：${r}`}>
                      <span className={`h-2 w-2 rounded-full ${h > 80 ? "bg-green-500" : h > 60 ? "bg-yellow-500" : "bg-red-500"}`} />
                      <span>{h > 80 ? "健康" : "需优化"}</span>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditorId(blk.id)}>编辑</Button>
                  <Button size="sm" onClick={() => handleInsertToCompose(blk)}>使用</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowUp, ArrowDown, X, Layers3 } from "lucide-react";

type BlockItem = {
  id: string;
  type: "hero" | "cta" | "product" | "divider" | "survey" | "rich";
  title: string;
  props: Record<string, string>;
  tracking?: { utm?: string; linkId?: string; eventKey?: string };
};

function genId() {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function buildKnownBlock(blkId: string): BlockItem | null {
  if (blkId === "blk_hero_basic") {
    return { id: genId(), type: "hero", title: "英雄区", props: { title: "年度大促", subtitle: "限时抢购" } };
  }
  if (blkId === "blk_cta_primary") {
    return { id: genId(), type: "cta", title: "主CTA按钮", props: { text: "立即购买", link: "https://example.com" }, tracking: { utm: "utm_source=newsletter" } };
  }
  if (blkId === "blk_product_card") {
    return { id: genId(), type: "product", title: "产品卡", props: { title: "商品A", price: "¥199", link: "https://example.com/a" } };
  }
  if (blkId === "blk_divider") {
    return { id: genId(), type: "divider", title: "分割线", props: { style: "thin", color: "#e5e7eb" } };
  }
  if (blkId === "blk_survey_quick") {
    return { id: genId(), type: "survey", title: "快速问卷", props: { question: "你更关注哪个类目？", options: "A,B,C" }, tracking: { eventKey: "survey_preference" } };
  }
  return null;
}

const palette: { id: string; name: string }[] = [
  { id: "blk_hero_basic", name: "英雄区（标题+副标题）" },
  { id: "blk_cta_primary", name: "主CTA按钮" },
  { id: "blk_product_card", name: "产品卡（图文+价格）" },
  { id: "blk_divider", name: "分割线" },
  { id: "blk_survey_quick", name: "快速问卷（单选）" },
];

export default function TemplateBuilder() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const seedBlockId = params.get("seedBlock");
  const seedBlockData = params.get("seedBlockData");
  const seedTemplateId = params.get("seedTemplate");
  const [blocks, setBlocks] = useState<BlockItem[]>([]);

  function buildTemplateBlocks(tplId: string): BlockItem[] {
    const result: BlockItem[] = [];
    if (tplId === "tpl_ecommerce_promo") {
      const hero = buildKnownBlock("blk_hero_basic");
      const product = buildKnownBlock("blk_product_card");
      const cta = buildKnownBlock("blk_cta_primary");
      if (hero) hero.props = { title: "限时优惠大促", subtitle: "专属折扣" };
      if (product) product.props = { title: "主打商品A", price: "¥199", link: "https://example.com/a" };
      if (cta) cta.props = { text: "立即购买", link: "https://example.com/buy" };
      [hero, product, cta].forEach((b) => b && result.push(b));
    } else if (tplId === "tpl_event_invite") {
      const hero = buildKnownBlock("blk_hero_basic");
      const divider = buildKnownBlock("blk_divider");
      const cta = buildKnownBlock("blk_cta_primary");
      if (hero) hero.props = { title: "活动邀请", subtitle: "点击报名参与" };
      if (cta) cta.props = { text: "立即报名", link: "https://example.com/signup" };
      [hero, divider, cta].forEach((b) => b && result.push(b));
    } else if (tplId === "tpl_product_launch") {
      const hero = buildKnownBlock("blk_hero_basic");
      const product = buildKnownBlock("blk_product_card");
      const cta = buildKnownBlock("blk_cta_primary");
      if (hero) hero.props = { title: "新品首发", subtitle: "欢迎第一时间体验" };
      if (product) product.props = { title: "新品X", price: "¥299", link: "https://example.com/new" };
      if (cta) cta.props = { text: "查看新品", link: "https://example.com/new" };
      [hero, product, cta].forEach((b) => b && result.push(b));
    }
    return result;
  }

  // 初始化种子：模板或块
  useEffect(() => {
    const initial: BlockItem[] = [];
    if (seedTemplateId) {
      const tplBlocks = buildTemplateBlocks(seedTemplateId);
      initial.push(...tplBlocks);
    }
    if (seedBlockData) {
      try {
        const data = JSON.parse(seedBlockData);
        if (data && data.type && data.title) {
          initial.push({
            id: data.id || `blk_${Date.now()}`,
            type: data.type,
            title: data.title,
            props: data.props || {},
            tracking: data.tracking,
          });
        }
      } catch (e) {
        // ignore parse error
      }
    }
    if (!seedTemplateId && seedBlockId) {
      const b = buildKnownBlock(seedBlockId);
      if (b) initial.push(b);
    }
    if (initial.length > 0) setBlocks(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addKnownBlock = (id: string) => {
    const b = buildKnownBlock(id);
    if (b) setBlocks((prev) => [...prev, b]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveUp = (id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx > 0) {
        const next = [...prev];
        [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
        return next;
      }
      return prev;
    });
  };

  const moveDown = (id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx >= 0 && idx < prev.length - 1) {
        const next = [...prev];
        [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
        return next;
      }
      return prev;
    });
  };

  const updateBlock = (id: string, updater: (prev: BlockItem) => BlockItem) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  };

  const exportTemplateJson = () => {
    const payload = {
      title: "自定义模板",
      blocks,
    };
    try {
      const text = JSON.stringify(payload, null, 2);
      navigator.clipboard?.writeText(text);
      alert("模板JSON已复制到剪贴板（前端示例）\n\n" + text);
    } catch (e) {
      alert("导出失败（前端示例）");
    }
  };

  return (
    <div className="px-4 py-3 space-y-3">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4" />
              <span className="text-sm font-medium">模板构建器（Beta）</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-marketing/template-library">返回模板库</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-marketing/block-library">返回内容块库</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={exportTemplateJson}>导出模板JSON</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">素材面板（添加内容块）</div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            {palette.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => addKnownBlock(p.id)}>
                <Plus className="h-4 w-4" /> {p.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">模板块列表（排序与轻度编辑）</div>
            {blocks.length > 0 && <Badge variant="outline">{blocks.length} 个块</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {blocks.length === 0 && (
            <div className="text-xs text-muted-foreground">尚未添加内容块。可通过上方素材面板添加，或从内容块库入口传入种子块。</div>
          )}
          {blocks.map((b, idx) => (
            <Card key={b.id} className="border border-muted">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground">类型：{b.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => moveUp(b.id)} disabled={idx === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => moveDown(b.id)} disabled={idx === blocks.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeBlock(b.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 预览区域（富文本优先） */}
                <div className="text-xs border rounded p-2">
                  {b.props.html ? (
                    <div dangerouslySetInnerHTML={{ __html: b.props.html }} />
                  ) : (
                    <div className="whitespace-pre-line">
                      {b.type === "hero" && `${b.props.title || "(标题)"}｜${b.props.subtitle || "(副标题)"}`}
                      {b.type === "cta" && `【CTA】${b.props.text || "(文案)"} → ${b.props.link || "(链接)"}`}
                      {b.type === "product" && `【商品】${b.props.title || "(标题)"}｜${b.props.price || "(价格)"} → ${b.props.link || "(链接)"}`}
                      {b.type === "divider" && `────────────`}
                      {b.type === "survey" && `【问卷】${b.props.question || "(问题)"}｜选项：${b.props.options || "A,B,C"}`}
                    </div>
                  )}
                </div>

                {/* 轻度编辑（常用字段） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(b.type === "hero" || b.type === "product") && (
                    <div className="space-y-2">
                      <Label className="text-xs">标题</Label>
                      <Input
                        value={b.props.title || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, title: e.target.value } }))}
                      />
                    </div>
                  )}
                  {b.type === "hero" && (
                    <div className="space-y-2">
                      <Label className="text-xs">副标题</Label>
                      <Input
                        value={b.props.subtitle || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, subtitle: e.target.value } }))}
                      />
                    </div>
                  )}
                  {b.type === "product" && (
                    <div className="space-y-2">
                      <Label className="text-xs">价格</Label>
                      <Input
                        value={b.props.price || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, price: e.target.value } }))}
                      />
                    </div>
                  )}
                  {b.type === "cta" && (
                    <div className="space-y-2">
                      <Label className="text-xs">文案</Label>
                      <Input
                        value={b.props.text || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, text: e.target.value } }))}
                      />
                      <Label className="text-xs">链接</Label>
                      <Input
                        value={b.props.link || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, link: e.target.value } }))}
                      />
                    </div>
                  )}
                  {b.type === "survey" && (
                    <div className="space-y-2">
                      <Label className="text-xs">问题</Label>
                      <Input
                        value={b.props.question || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, question: e.target.value } }))}
                      />
                      <Label className="text-xs">选项（逗号分隔）</Label>
                      <Input
                        value={b.props.options || ""}
                        onChange={(e) => updateBlock(b.id, (prev) => ({ ...prev, props: { ...prev.props, options: e.target.value } }))}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
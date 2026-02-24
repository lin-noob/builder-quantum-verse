import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type BlockItem = {
  id: string;
  type: "hero" | "cta" | "product" | "divider" | "survey" | "rich";
  title: string;
  props: Record<string, string>;
  tracking?: { utm?: string; linkId?: string; eventKey?: string };
};

function buildTemplatePreview(tpl: string) {
  const blocks: BlockItem[] = [];
  let subject = "";
  let content = "";

  if (tpl === "tpl_ecommerce_promo") {
    subject = "双十一限时优惠｜全场满减再加码";
    content =
      "您好，\n\n我们为您准备了限时专属优惠：\n- 主打商品1：亮点/价格\n- 主打商品2：亮点/价格\n\n立即查看详情并抢购！\n\n【CTA按钮】立即购买\n\n祝好，\n品牌团队";
    blocks.push({ id: `blk_${Date.now()}`, type: "cta", title: "主CTA按钮", props: { text: "立即购买", link: "https://example.com/promo" }, tracking: { utm: "utm_source=newsletter&utm_campaign=double11" } });
  } else if (tpl === "tpl_event_invite") {
    subject = "本周活动邀请｜报名有礼";
    content = "亲爱的用户，\n\n我们诚挚邀请您参加本周活动，现场有惊喜。\n\n【CTA】立即报名\n";
    blocks.push({ id: `blk_${Date.now()}`, type: "cta", title: "报名CTA", props: { text: "立即报名", link: "https://example.com/event" } });
  } else if (tpl === "tpl_product_launch") {
    subject = "新品首发体验｜欢迎第一时间试用";
    content = "您好，\n\n新品上架，欢迎第一时间体验并反馈。\n\n【CTA】查看新品\n";
    blocks.push({ id: `blk_${Date.now()}`, type: "cta", title: "查看新品CTA", props: { text: "查看新品", link: "https://example.com/new" } });
  }

  return { subject, content, blocks };
}

function buildKnownBlockPreview(blkId: string): BlockItem | null {
  if (blkId === "blk_hero_basic") {
    return { id: `blk_${Date.now()}`, type: "hero", title: "英雄区", props: { title: "年度大促", subtitle: "限时抢购" } };
  }
  if (blkId === "blk_cta_primary") {
    return { id: `blk_${Date.now()}`, type: "cta", title: "主CTA按钮", props: { text: "立即购买", link: "https://example.com" }, tracking: { utm: "utm_source=newsletter" } };
  }
  if (blkId === "blk_product_card") {
    return { id: `blk_${Date.now()}`, type: "product", title: "产品卡", props: { title: "商品A", price: "¥199", link: "https://example.com/a" } };
  }
  if (blkId === "blk_divider") {
    return { id: `blk_${Date.now()}`, type: "divider", title: "分割线", props: { style: "thin", color: "#e5e7eb" } };
  }
  if (blkId === "blk_survey_quick") {
    return { id: `blk_${Date.now()}`, type: "survey", title: "快速问卷", props: { question: "你更关注哪个类目？", options: "A,B,C" }, tracking: { eventKey: "survey_preference" } };
  }
  return null;
}

export default function EmailComposePreview() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const previewTpl = params.get("previewTemplate");
  const previewBlk = params.get("previewBlock");
  const previewBlkData = params.get("previewBlockData");

  const { subject, content, blocks } = useMemo(() => {
    let subject = "";
    let content = "";
    const blocks: BlockItem[] = [];

    if (previewTpl) {
      const t = buildTemplatePreview(previewTpl);
      subject = t.subject;
      content = t.content;
      blocks.push(...t.blocks);
    }

    if (previewBlkData) {
      try {
        const data = JSON.parse(previewBlkData);
        if (data && data.type && data.title) {
          blocks.push({
            id: data.id || `blk_${Date.now()}`,
            type: data.type,
            title: data.title,
            props: data.props || {},
            tracking: data.tracking,
          });
        }
      } catch (e) {
        // ignore parse error in preview
      }
    } else if (previewBlk) {
      const b = buildKnownBlockPreview(previewBlk);
      if (b) blocks.push(b);
    }

    return { subject, content, blocks };
  }, [previewTpl, previewBlk, previewBlkData]);

  return (
    <div className="px-4 py-3 space-y-3">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">编辑器只读预览</div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-marketing/template-library">返回模板库</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-marketing/block-library">返回内容块库</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">主题与正文（示意）</div>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {subject && (
            <div>
              <div className="text-xs text-muted-foreground">主题</div>
              <div className="text-sm">{subject}</div>
            </div>
          )}
          {content && (
            <div>
              <div className="text-xs text-muted-foreground">正文</div>
              <div className="text-sm whitespace-pre-line">{content}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">内容块预览（只读）</div>
            {blocks.length > 0 && <Badge variant="outline">{blocks.length} 个块</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {blocks.length === 0 && (
            <div className="text-xs text-muted-foreground">未提供预览数据。请选择模板或内容块进行预览。</div>
          )}
          {blocks.map((b) => (
            <Card key={b.id} className="border border-muted">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground">类型：{b.type}</div>
                  </div>
                </div>
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
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
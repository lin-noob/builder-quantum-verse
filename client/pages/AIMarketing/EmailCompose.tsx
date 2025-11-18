import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Save, Paperclip, UploadCloud, Settings, Bold, Italic, Underline, Plus, X, Sparkles, Brain, Wand2, Clock } from "lucide-react";
import EmailEditor from "@/components/EmailEditor";

export default function EmailCompose() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [toList, setToList] = useState<string[]>([]);
  const [ccList, setCcList] = useState<string[]>([]);
  const [ccVisible, setCcVisible] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<"suggest" | "rewrite" | "templates" | "summary">("suggest");

  const [toInput, setToInput] = useState<string>("");
  const [ccInput, setCcInput] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);

  // 内容块模型（阶段A：前端演示）
  type BlockItem = {
    id: string;
    type: "hero" | "cta" | "product" | "divider" | "survey" | "rich";
    title: string;
    props: Record<string, string>;
    tracking?: { utm?: string; linkId?: string; eventKey?: string };
  };
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) || null,
    [blocks, selectedBlockId]
  );

  const addBlock = (b: BlockItem) => {
    setBlocks((prev) => [...prev, b]);
    setSelectedBlockId(b.id);
    toast({ title: "已插入内容块", description: b.title });
  };

  const updateBlock = (id: string, updater: (prev: BlockItem) => BlockItem) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  // 解析库页带入（模板/块）
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tpl = params.get("insertTemplate");
    const blk = params.get("insertBlock");
    const blkData = params.get("insertBlockData");
    const previewTpl = params.get("previewTemplate");
    const previewBlk = params.get("previewBlock");

    if (tpl) {
      if (tpl === "tpl_ecommerce_promo") {
        setSubject("双十一限时优惠｜全场满减再加码");
        setContent(
          "您好，\n\n我们为您准备了限时专属优惠：\n- 主打商品1：亮点/价格\n- 主打商品2：亮点/价格\n\n立即查看详情并抢购！\n\n【CTA按钮】立即购买\n\n祝好，\n品牌团队"
        );
        addBlock({ id: `blk_${Date.now()}`, type: "cta", title: "主CTA按钮", props: { text: "立即购买", link: "https://example.com/promo" }, tracking: { utm: "utm_source=newsletter&utm_campaign=double11" } });
      } else if (tpl === "tpl_event_invite") {
        setSubject("本周活动邀请｜报名有礼");
        setContent("亲爱的用户，\n\n我们诚挚邀请您参加本周活动，现场有惊喜。\n\n【CTA】立即报名\n");
        addBlock({ id: `blk_${Date.now()}`, type: "cta", title: "报名CTA", props: { text: "立即报名", link: "https://example.com/event" } });
      } else if (tpl === "tpl_product_launch") {
        setSubject("新品首发体验｜欢迎第一时间试用");
        setContent("您好，\n\n新品上架，欢迎第一时间体验并反馈。\n\n【CTA】查看新品\n");
        addBlock({ id: `blk_${Date.now()}`, type: "cta", title: "查看新品CTA", props: { text: "查看新品", link: "https://example.com/new" } });
      }
      toast({ title: "已应用模板", description: tpl });
      navigate(location.pathname, { replace: true });
    }

    if (blk) {
      if (blk === "blk_hero_basic") {
        addBlock({ id: `blk_${Date.now()}`, type: "hero", title: "英雄区", props: { title: "年度大促", subtitle: "限时抢购" } });
      } else if (blk === "blk_cta_primary") {
        addBlock({ id: `blk_${Date.now()}`, type: "cta", title: "主CTA按钮", props: { text: "立即购买", link: "https://example.com" }, tracking: { utm: "utm_source=newsletter" } });
      } else if (blk === "blk_product_card") {
        addBlock({ id: `blk_${Date.now()}`, type: "product", title: "产品卡", props: { title: "商品A", price: "¥199", link: "https://example.com/a" } });
      } else if (blk === "blk_divider") {
        addBlock({ id: `blk_${Date.now()}`, type: "divider", title: "分割线", props: { style: "thin", color: "#e5e7eb" } });
      } else if (blk === "blk_survey_quick") {
        addBlock({ id: `blk_${Date.now()}`, type: "survey", title: "快速问卷", props: { question: "你更关注哪个类目？", options: "A,B,C" }, tracking: { eventKey: "survey_preference" } });
      }
      toast({ title: "已插入内容块", description: blk });
      navigate(location.pathname, { replace: true });
    }

    // 兼容从内容块库传入的自定义块 JSON
    if (blkData) {
      try {
        const data = JSON.parse(blkData);
        if (data && data.type && data.title) {
          addBlock({
            id: data.id || `blk_${Date.now()}`,
            type: data.type,
            title: data.title,
            props: data.props || {},
            tracking: data.tracking,
          });
          toast({ title: "已插入内容块", description: data.title });
        } else {
          toast({ title: "插入失败", description: "内容块数据不完整" });
        }
      } catch (e) {
        toast({ title: "插入失败", description: "内容块数据解析错误" });
      }
      navigate(location.pathname, { replace: true });
    }

    if (previewTpl || previewBlk) {
      toast({ title: "预览已带入", description: previewTpl || previewBlk || "" });
      navigate(location.pathname, { replace: true });
    }
  }, [location.search]);

  const addToken = (value: string, type: "to" | "cc") => {
    const v = value.trim();
    if (!v) return;
    if (type === "to") setToList((prev) => Array.from(new Set([...prev, v])));
    else setCcList((prev) => Array.from(new Set([...prev, v])));
  };

  const removeToken = (value: string, type: "to" | "cc") => {
    if (type === "to") setToList((prev) => prev.filter((x) => x !== value));
    else setCcList((prev) => prev.filter((x) => x !== value));
  };

  const handleSend = () => {
    toast({ title: "已发送", description: "邮件已模拟发送（前端示例）。" });
  };

  const handleSave = () => {
    toast({ title: "已保存草稿", description: "草稿已保存（前端示例）。" });
  };

  // --- AI 助手交互（前端演示）---
  const handleImportPreviewSuggestions = () => {
    const tips = ["主题增强：加入明确数字与优惠幅度", "CTA前置：第一屏放置主按钮", "结构精简：用项目符号列出卖点"];
    setContent((prev) => `${prev}\n\n[带入预览建议]\n- ${tips.join("\n- ")}`);
    toast({ title: "已带入预览建议", description: "建议已插入正文（前端示例）。" });
  };
  const handleAISubjectSuggest = () => {
    const suggestion = "双十一限时优惠｜全场满减再加码";
    setSubject((prev) => (prev?.trim() ? `${prev}｜优化` : suggestion));
    toast({ title: "已生成主题建议", description: suggestion });
  };

  const handleAIRewrite = () => {
    const addition = "\n\n[AI润色建议] 将首段改为更简洁的利益点描述，并将CTA按钮放在第一屏。";
    setContent((prev) => `${prev}${addition}`);
    toast({ title: "已润色正文", description: "已插入润色建议（前端示例）。" });
  };

  const handleAITemplate = () => {
    const template = `您好，\n\n我们为您准备了限时专属优惠：\n- 主打商品1：亮点/价格\n- 主打商品2：亮点/价格\n\n立即查看详情并抢购！\n\n【CTA按钮】立即购买\n\n祝好，\n品牌团队`;
    setContent(template);
    toast({ title: "已插入模板", description: "已应用电商促销模板（前端示例）。" });
  };

  const handleAISummary = () => {
    const summary = "[AI总结] 本邮件旨在告知限时促销与主打商品信息，鼓励用户点击并购买。";
    setContent((prev) => `${summary}\n\n${prev}`);
    toast({ title: "已生成智能总结", description: "总结已插入正文顶部（前端示例）。" });
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {/* 顶部操作区 */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button className="gap-2" onClick={handleSend}><Send className="h-4 w-4" /> 发送</Button>
              <Button variant="outline" className="gap-2" onClick={handleSave}><Save className="h-4 w-4" /> 保存</Button>
              <Button variant="outline" className="gap-2" onClick={() => document.getElementById("email-editor-attachment-input")?.click()}>
                <Paperclip className="h-4 w-4" /> 附件 {attachments.length > 0 && `(${attachments.length})`}
              </Button>
              <Button variant="outline" className="gap-2"><UploadCloud className="h-4 w-4" /> 超大附件</Button>
              <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> 发送设置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 表单区 */}
      <Card>
        <CardContent className="p-3 space-y-3">
          {/* 收件人 */}
          <div>
            <Label className="text-sm">收件人：</Label>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {toList.map((email) => (
                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                  {email}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeToken(email, "to")} />
                </Badge>
              ))}
              <Input
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addToken(toInput, "to");
                    setToInput("");
                  }
                }}
                placeholder="可以输入你的同事名、部门名"
                className="h-8 w-[280px]"
              />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setCcVisible((v) => !v)}>
                抄送
              </Button>
            </div>
          </div>

          {/* 抄送 */}
          {ccVisible && (
            <div>
              <Label className="text-sm">抄送：</Label>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {ccList.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeToken(email, "cc")} />
                  </Badge>
                ))}
                <Input
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addToken(ccInput, "cc");
                      setCcInput("");
                    }
                  }}
                  placeholder="可添加需要抄送的同事"
                  className="h-8 w-[280px]"
                />
              </div>
            </div>
          )}

          {/* 主题 */}
          <div>
            <Label className="text-sm">主 题：</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="请输入主题" className="mt-1" />
          </div>

          <Separator />

          {/* 工具栏 */}
          <div className="flex items-center gap-4 text-sm">
            <Button variant="ghost" size="sm" className="gap-1"><Bold className="h-4 w-4" /> B</Button>
            <Button variant="ghost" size="sm" className="gap-1"><Italic className="h-4 w-4" /> I</Button>
            <Button variant="ghost" size="sm" className="gap-1"><Underline className="h-4 w-4" /> U</Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setAiOpen((v) => !v); setAiMode("summary"); }}>
              <Sparkles className="h-4 w-4" /> 智能总结 AI+
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={handleImportPreviewSuggestions}>
              <Sparkles className="h-4 w-4" /> 从预览区带入建议
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/ai-marketing/template-library">模板库</Link>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/ai-marketing/block-library">内容块库</Link>
            </Button>
          </div>

          {aiOpen && (
            <div className="mt-3 border rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {aiMode === "suggest" && <Sparkles className="h-4 w-4 text-purple-500" />}
                  {aiMode === "rewrite" && <Wand2 className="h-4 w-4 text-blue-500" />}
                  {aiMode === "templates" && <Brain className="h-4 w-4 text-teal-500" />}
                  {aiMode === "summary" && <Sparkles className="h-4 w-4 text-orange-500" />}
                  <span className="text-sm font-medium">AI助手</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAiOpen(false)}>收起</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={aiMode === "suggest" ? "default" : "outline"} onClick={() => setAiMode("suggest")}>文案建议</Button>
                <Button size="sm" variant={aiMode === "rewrite" ? "default" : "outline"} onClick={() => setAiMode("rewrite")}>润色优化</Button>
                <Button size="sm" variant={aiMode === "templates" ? "default" : "outline"} onClick={() => setAiMode("templates")}>快速模板</Button>
                <Button size="sm" variant={aiMode === "summary" ? "default" : "outline"} onClick={() => setAiMode("summary")}>智能总结</Button>
              </div>

              {aiMode === "suggest" && (
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-muted-foreground">建议：提升主题吸引力、强化第一屏CTA、精简段落。</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={handleAISubjectSuggest}>生成主题建议</Button>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "建议", description: "建议加入价格锚点与倒计时（前端示例）。" })}>加入价格锚点</Button>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "建议", description: "建议将CTA放到第一屏（前端示例）。" })}>优化CTA位置</Button>
                  </div>
                  <div className="text-xs text-muted-foreground">预测：预计打开率 38%–45%，最佳发送时段 18:00–20:00（模拟）。</div>
                </div>
              )}

              {aiMode === "rewrite" && (
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-muted-foreground">润色：更精简、行动导向的文案建议。</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={handleAIRewrite}>插入润色建议</Button>
                    <Button size="sm" variant="outline" onClick={() => setContent((prev) => `${prev}\n\n[AI用词建议] 将“点击查看”替换为“立即抢购”，更具行动力。`)}>用词建议</Button>
                    <Button size="sm" variant="outline" onClick={() => setContent((prev) => `${prev}\n\n[AI结构建议] 使用项目符号列出卖点，降低阅读负担。`)}>结构建议</Button>
                  </div>
                </div>
              )}

              {aiMode === "templates" && (
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-muted-foreground">模板：促销、活动邀请、产品上新等快速套用。</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={handleAITemplate}>电商促销模板</Button>
                    <Button size="sm" variant="outline" onClick={() => setContent("亲爱的用户，\n\n我们诚挚邀请您参加本周活动，现场有惊喜。\n\n【CTA】立即报名\n")}>活动邀请模板</Button>
                    <Button size="sm" variant="outline" onClick={() => setContent("您好，\n\n新品上架，欢迎第一时间体验并反馈。\n\n【CTA】查看新品\n")}>新品上新模板</Button>
                  </div>
                </div>
              )}

              {aiMode === "summary" && (
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-muted-foreground">总结：自动提炼邮件目的与关键信息。</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={handleAISummary}>生成总结并插入</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 正文 */}
          <div className="mt-2">
            <EmailEditor
              content={content}
              onContentChange={setContent}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              height="340px"
              placeholder="在此编写正文..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
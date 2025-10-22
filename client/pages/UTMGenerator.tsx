import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link as LinkIcon, Copy, Check, RotateCcw, Trash2, Search, ExternalLink, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UTMRecord, utmService } from "@/services/utmService";

// 轻量实现：UTM 生成器（前端-only）

type ExtraParam = { key: string; value: string };

const HISTORY_STORAGE_KEY = "utmGenerator.history.v1";

function parseUrl(url: string): URL | null {
  try { return new URL(url); } catch { return null; }
}

function sanitize(v: string, opts: { lowercase: boolean; trim: boolean }) {
  let s = v ?? "";
  if (opts.trim) s = s.trim();
  if (opts.lowercase) s = s.toLowerCase();
  return s;
}

function buildQuery(params: {
  source: string; medium: string; campaign: string; term?: string; content?: string;
  extraParams?: ExtraParam[]; lowercase: boolean; trim: boolean; encode: boolean;
}) {
  const kv: Record<string, string> = {
    utm_source: sanitize(params.source, params),
    utm_medium: sanitize(params.medium, params),
    utm_campaign: sanitize(params.campaign, params),
  };
  if (params.term) kv["utm_term"] = sanitize(params.term, params);
  if (params.content) kv["utm_content"] = sanitize(params.content, params);
  (params.extraParams || []).forEach(({ key, value }) => {
    const k = sanitize(key, params); const v = sanitize(value, params);
    if (k) kv[k] = v;
  });
  const entries = Object.entries(kv).map(([k, v]) => params.encode ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}` : `${k}=${v}`);
  return entries.join("&");
}

function mergeQuery(url: string, q: string) {
  const u = parseUrl(url);
  if (!u) return url ? `${url}${url.includes("?") ? "&" : "?"}${q}` : "";
  const ex = u.search ? u.search.substring(1) : "";
  const merged = ex ? `${ex}&${q}` : q;
  u.search = `?${merged}`;
  return u.toString();
}

function hasUTM(url: string) {
  return /[?&]utm_(source|medium|campaign|term|content)=/i.test(url);
}

export default function UTMGenerator() {
  const { toast } = useToast();

  // 表单
  const [targetUrl, setTargetUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [extraParams, setExtraParams] = useState<ExtraParam[]>([{ key: "", value: "" }]);

  // 标准化开关
  const [lowercase, setLowercase] = useState(true);
  const [trim, setTrim] = useState(true);
  const [encode, setEncode] = useState(true);

  // UI 辅助
  const [copied, setCopied] = useState(false);
  
  // Pagination and data for API
  const [history, setHistory] = useState<UTMRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [showArchived, setShowArchived] = useState<boolean | null>(null); // null=全部, false=未归档, true=已归档
  const [loading, setLoading] = useState(false);

  // 校验
  const [urlError, setUrlError] = useState<string | null>(null);
  const [requiredError, setRequiredError] = useState<string | null>(null);
  const [conflictHint, setConflictHint] = useState<string | null>(null);

  // 生成链接
  const utmQuery = useMemo(() => buildQuery({ source, medium, campaign, term, content, extraParams, lowercase, trim, encode }), [source, medium, campaign, term, content, extraParams, lowercase, trim, encode]);
  const finalUrl = useMemo(() => targetUrl ? mergeQuery(targetUrl, utmQuery) : "", [targetUrl, utmQuery]);

  useEffect(() => {
    const u = parseUrl(targetUrl);
    setUrlError(u ? null : targetUrl ? "URL 格式不正确" : null);
    setConflictHint(hasUTM(targetUrl) ? "目标链接已含 UTM，将追加" : null);
  }, [targetUrl]);

  useEffect(() => {
    if (!source || !medium || !campaign) setRequiredError("请填写 source/medium/campaign"); else setRequiredError(null);
  }, [source, medium, campaign]);

  // 历史 - API loading
  useEffect(() => {
    const loadUTMHistory = async () => {
      setLoading(true);
      try {
        // Convert our showArchived state to backend parameter
        // showArchived: null=all, false=active(status=0), true=archived(status=1)
        let statusFilter: number | undefined;
        if (showArchived === true) {
          statusFilter = 1; // archived
        } else if (showArchived === false) {
          statusFilter = 0; // active
        }
        
        const response = await utmService.getUTMList({
          page: currentPage,
          size: pageSize,
          search: searchText,
          ...(statusFilter !== undefined && { status: statusFilter })
        });
        setHistory(response.records);
        setTotal(response.total);
      } catch (error) {
        console.error("Failed to load UTM history:", error);
        toast({
          title: "加载失败",
          description: "获取UTM记录失败，请重试",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUTMHistory();
  }, [currentPage, pageSize, searchText, showArchived]);

  const copyText = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); toast({ title: "已复制" }); } catch { toast({ title: "复制失败", variant: "destructive" }); }
  };

  const clearForm = () => {
    setTargetUrl(""); setSource(""); setMedium(""); setCampaign(""); setTerm(""); setContent(""); setExtraParams([{ key: "", value: "" }]);
  };

  const saveHistory = async () => {
    if (!targetUrl || urlError || requiredError) { toast({ title: "无法保存", description: "请修复必填项与 URL" , variant: "destructive"}); return; }
    try {
      const newRecord = await utmService.createUTM({
        title: campaign || "未命名活动",
        targetUrl,
        utmSource: source,
        utmMedium: medium,
        utmCampaign: campaign,
        utmTerm: term || undefined,
        utmContent: content || undefined,
        extraParams,
        status: 0, // default status
        companyId: "" // default company id
      });
      
      // Refresh the list to include the new record
      const response = await utmService.getUTMList({
        page: currentPage,
        size: pageSize,
        search: searchText,
        archived: showArchived === null ? undefined : showArchived
      });
      setHistory(response.records);
      setTotal(response.total);
      toast({ title: "已保存到历史" });
    } catch (error) {
      console.error("Failed to save UTM record:", error);
      toast({
        title: "保存失败",
        description: "保存UTM记录失败，请重试",
        variant: "destructive",
      });
    }
  };

  const fillBack = (r: UTMRecord) => {
    // Handle extraParams that might be a JSON string from backend
    let processedExtraParams = [{ key: "", value: "" }]; // default
    if (r.extraParams) {
      if (typeof r.extraParams === 'string') {
        try {
          processedExtraParams = JSON.parse(r.extraParams);
        } catch {
          processedExtraParams = [{ key: "", value: "" }]; // fallback to default
        }
      } else {
        processedExtraParams = r.extraParams;
      }
    }
    
    setTargetUrl(r.targetUrl); setSource(r.utmSource); setMedium(r.utmMedium); setCampaign(r.utmCampaign); setTerm(r.utmTerm || ""); setContent(r.utmContent || ""); setExtraParams(processedExtraParams); toast({ title: "已填回表单" }); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const del = async (id: string) => {
    try {
      await utmService.deleteUTM(id);
      // Refresh the list after deletion
      const response = await utmService.getUTMList({
        page: currentPage,
        size: pageSize,
        search: searchText,
        archived: showArchived === null ? undefined : showArchived
      });
      setHistory(response.records);
      setTotal(response.total);
      toast({ title: "已删除" });
    } catch (error) {
      console.error("Failed to delete UTM record:", error);
      toast({
        title: "删除失败",
        description: "删除UTM记录失败，请重试",
        variant: "destructive",
      });
    }
  };
  
  const toggleArchive = async (id: string) => {
    try {
      // Since the API endpoint for toggleArchive may not exist in the same form
      // Let's try to implement it in a way that fits the new data structure
      // We assume status 1 means archived, 0 means active
      const record = history.find(h => h.id === id);
      if (!record) return;
      
      // Use the new archive API with form data
      const archiveStatus = record.status === 0 ? true : false; // If currently active(0), we want to archive(true), if archived(1), we want to unarchive(false)
      await utmService.toggleArchive(id, archiveStatus);
      
      // Refresh the list after toggling archive
      const response = await utmService.getUTMList({
        page: currentPage,
        size: pageSize,
        search: searchText,
        archived: showArchived === null ? undefined : showArchived
      });
      setHistory(response.records);
      setTotal(response.total);
      toast({ title: record.status === 1 ? "已取消归档" : "已归档" });
    } catch (error) {
      console.error("Failed to toggle archive status:", error);
      toast({
        title: "操作失败",
        description: "更新归档状态失败，请重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 移除面包屑与标题 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-600" />参数设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 使用提示整合到参数卡片 */}
            <div className="rounded-md border bg-white p-3 text-sm text-gray-600">
              <div className="flex items-center gap-2 font-medium">
                <Search className="h-5 w-5 text-gray-600" />使用提示
              </div>
              <div>命名建议：统一小写，避免空格与中文。</div>
              <div>常见错误：URL 缺协议、重复 UTM、未编码。</div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="secondary">source: google</Badge>
                <Badge variant="secondary">medium: cpc</Badge>
                <Badge variant="secondary">campaign: spring_sale</Badge>
              </div>
            </div>
      
            {/* 表单区 */}
            <div className="space-y-2">
              <Label htmlFor="targetUrl">目标链接</Label>
              <Input
                id="targetUrl"
                placeholder="https://example.com/landing"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
              />
              {urlError && <div className="text-red-600 text-xs">{urlError}</div>}
              {conflictHint && (
                <div className="text-amber-600 text-xs">{conflictHint}</div>
              )}
            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utm_source">utm_source</Label>
                <Input
                  id="utm_source"
                  placeholder="如：google"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_medium">utm_medium</Label>
                <Input
                  id="utm_medium"
                  placeholder="如：cpc"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_campaign">utm_campaign</Label>
                <Input
                  id="utm_campaign"
                  placeholder="如：spring_sale"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                />
              </div>
            </div>
            {requiredError && (
              <div className="text-red-600 text-xs">{requiredError}</div>
            )}
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="utm_term">utm_term（可选）</Label>
                <Input
                  id="utm_term"
                  placeholder="关键词"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm_content">utm_content（可选）</Label>
                <Input
                  id="utm_content"
                  placeholder="素材标识"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
      
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>附加参数</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setExtraParams((p) => [...p, { key: "", value: "" }])
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />新增
                </Button>
              </div>
              <div className="space-y-2">
                {extraParams.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      placeholder="参数名"
                      value={p.key}
                      onChange={(e) =>
                        setExtraParams((prev) => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], key: e.target.value };
                          return n;
                        })
                      }
                    />
                    <Input
                      placeholder="参数值"
                      value={p.value}
                      onChange={(e) =>
                        setExtraParams((prev) => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], value: e.target.value };
                          return n;
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setExtraParams((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />删除
                    </Button>
                  </div>
                ))}
              </div>
            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">强制小写</div>
                  <div className="text-xs text-gray-500">统一为小写</div>
                </div>
                <Switch checked={lowercase} onCheckedChange={setLowercase} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">去除空格</div>
                  <div className="text-xs text-gray-500">自动 trim</div>
                </div>
                <Switch checked={trim} onCheckedChange={setTrim} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">URL 编码</div>
                  <div className="text-xs text-gray-500">对参数编码</div>
                </div>
                <Switch checked={encode} onCheckedChange={setEncode} />
              </div>
            </div>
      
            <div className="flex flex-wrap gap-2">
              <Button
                className="flex items-center gap-2"
                onClick={() => copyText(finalUrl)}
                disabled={!finalUrl || !!urlError || !!requiredError}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}复制链接
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={clearForm}
              >
                <RotateCcw className="h-4 w-4" />清空
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open(finalUrl, "_blank")}
                disabled={!finalUrl || !!urlError || !!requiredError}
              >
                <ExternalLink className="h-4 w-4" />新窗口打开
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={saveHistory}
                disabled={!finalUrl || !!urlError || !!requiredError}
              >
                保存到历史
              </Button>
            </div>
      
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-700">实时预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm break-all">
                  {finalUrl || "（请输入目标链接与必填 UTM 参数）"}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* 历史记录卡片保持在下方单列布局 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>历史记录</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="搜索标题/URL/来源/媒介/活动" className="w-64" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <div className="flex items-center gap-1 text-sm">
                <span>筛选:</span>
                <Button variant={showArchived===null?"default":"outline"} size="sm" onClick={() => setShowArchived(null)}>全部</Button>
                <Button variant={showArchived===false?"default":"outline"} size="sm" onClick={() => setShowArchived(false)}>未归档</Button>
                <Button variant={showArchived===true?"default":"outline"} size="sm" onClick={() => setShowArchived(true)}>已归档</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">目标链接</TableHead>
                  <TableHead className="px-6 py-4">来源</TableHead>
                  <TableHead className="px-6 py-4">媒介</TableHead>
                  <TableHead className="px-6 py-4">活动</TableHead>
                  <TableHead className="px-6 py-4">创建时间</TableHead>
                  <TableHead className="px-6 py-4">状态</TableHead>
                  <TableHead className="px-6 py-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {loading ? "加载中..." : "暂无历史记录"}
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      暂无历史记录
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map(h => (
                    <TableRow key={h.id}>
                      <TableCell className="px-6 py-4 text-xs break-all">{h.targetUrl}</TableCell>
                      <TableCell className="px-6 py-4">{h.utmSource}</TableCell>
                      <TableCell className="px-6 py-4">{h.utmMedium}</TableCell>
                      <TableCell className="px-6 py-4">{h.utmCampaign}</TableCell>
                      <TableCell className="px-6 py-4 text-xs">{new Date(h.gmtCreate).toLocaleString()}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={h.status === 1 ? "outline" : "default"}>
                          {h.status === 1 ? "已归档" : "活跃"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            let params = `utm_source=${h.utmSource}&utm_medium=${h.utmMedium}&utm_campaign=${h.utmCampaign}`;
                            if (h.utmTerm) params += `&utm_term=${h.utmTerm}`;
                            if (h.utmContent) params += `&utm_content=${h.utmContent}`;
                            
                            // Handle extraParams that might be a JSON string from backend
                            if (h.extraParams) {
                              let extraParamsArray: ExtraParam[] = [];
                              if (typeof h.extraParams === 'string') {
                                try {
                                  extraParamsArray = JSON.parse(h.extraParams);
                                } catch {
                                  extraParamsArray = []; // fallback to empty array
                                }
                              } else {
                                extraParamsArray = h.extraParams;
                              }
                              
                              if (extraParamsArray && extraParamsArray.length > 0) {
                                extraParamsArray.forEach(param => {
                                  if (param.key) params += `&${param.key}=${param.value || ''}`;
                                });
                              }
                            }
                            
                            copyText(mergeQuery(h.targetUrl, params));
                          }}>
                            <Copy className="h-4 w-4 mr-2" />复制
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => fillBack(h)}>填回</Button>
                          <Button variant="outline" size="sm" onClick={() => toggleArchive(h.id)}>
                            {h.status === 1 ? "取消归档" : "归档"}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => del(h.id)}><Trash2 className="h-4 w-4 mr-2" />删除</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                显示第 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)} 条，共 {total} 条
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(total / pageSize), prev + 1))}
                  disabled={currentPage === Math.ceil(total / pageSize) || total === 0 || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
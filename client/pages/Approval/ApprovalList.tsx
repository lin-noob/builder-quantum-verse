import React, { useMemo, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from '@/components/ui/pagination';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ApprovalInstance, ApprovalStatus, DocumentType } from '@/types/approval';

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: '待审批',
  [ApprovalStatus.APPROVED]: '已通过',
  [ApprovalStatus.REJECTED]: '已拒绝',
  [ApprovalStatus.CANCELLED]: '已撤回',
  [ApprovalStatus.TIMEOUT]: '已超时'
};

const STATUS_CLASS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ApprovalStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ApprovalStatus.REJECTED]: 'bg-red-100 text-red-800',
  [ApprovalStatus.CANCELLED]: 'bg-gray-200 text-gray-800',
  [ApprovalStatus.TIMEOUT]: 'bg-orange-100 text-orange-800'
};

const DOC_LABEL: Record<DocumentType, string> = {
  [DocumentType.EXPENSE_REPORT]: '费用报销',
  [DocumentType.LEAVE_REQUEST]: '请假申请',
  [DocumentType.PURCHASE_ORDER]: '采购申请',
  [DocumentType.CONTRACT_APPROVAL]: '合同审批',
  [DocumentType.GENERAL_REQUEST]: '通用申请'
};

const names = ['王敏','李雷','韩梅','张伟','刘畅','赵雪'];
const types = [
  DocumentType.EXPENSE_REPORT,
  DocumentType.LEAVE_REQUEST,
  DocumentType.PURCHASE_ORDER,
  DocumentType.CONTRACT_APPROVAL,
  DocumentType.GENERAL_REQUEST
];
const statuses = [
  ApprovalStatus.PENDING,
  ApprovalStatus.APPROVED,
  ApprovalStatus.REJECTED,
  ApprovalStatus.CANCELLED,
  ApprovalStatus.TIMEOUT
];

function generateMockItems(): ApprovalInstance[] {
  return Array.from({ length: 36 }).map((_, i) => {
    const created = new Date();
    created.setDate(created.getDate() - (i % 20));
    const updated = new Date(created);
    updated.setHours(created.getHours() + (i % 48));
    return {
      id: String(i + 1),
      title: `${DOC_LABEL[types[i % types.length]]} - 第${i + 1}号`,
      documentId: `DOC-${(20240000 + i + 1).toString()}`,
      workflowId: `wf-${100 + (i % 7)}`,
      workflowName: ['费用报销流程','请假流程','采购流程','合同签署流程','通用审批流程'][i % 5],
      documentType: types[i % types.length],
      status: statuses[i % statuses.length],
      currentNodeId: `node-${(i % 4) + 1}`,
      currentNodeName: ['提交申请','部门经理审批','财务复核','总监最终审批'][i % 4],
      submitter: { id: `u-${i % 12}`, name: names[i % names.length] },
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
    } as ApprovalInstance;
  });
}

function fmt(ts?: string) {
  if (!ts) return '-';
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

const ApprovalList: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<ApprovalInstance[]>(() => generateMockItems());

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>('all');
  const [sortKey, setSortKey] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ApprovalInstance | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = items.filter(it => {
      const matchQ = !q || `${it.title}${it.documentId}${it.submitter?.name || ''}`.toLowerCase().includes(q);
      const matchS = statusFilter === 'all' || it.status === statusFilter;
      const matchT = typeFilter === 'all' || it.documentType === typeFilter;
      return matchQ && matchS && matchT;
    });
    res.sort((a,b) => {
      const va = a[sortKey] || '';
      const vb = b[sortKey] || '';
      const diff = new Date(va).getTime() - new Date(vb).getTime();
      return sortOrder === 'asc' ? diff : -diff;
    });
    return res;
  }, [items, query, statusFilter, typeFilter, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter(i => i.status === ApprovalStatus.PENDING).length,
    approved: items.filter(i => i.status === ApprovalStatus.APPROVED).length,
    rejected: items.filter(i => i.status === ApprovalStatus.REJECTED).length,
  }), [items]);

  const canOperate = (it: ApprovalInstance) => it.status === ApprovalStatus.PENDING;

  const updateStatus = (id: string, status: ApprovalStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
  };

  const handleApprove = (it: ApprovalInstance) => {
    updateStatus(it.id, ApprovalStatus.APPROVED);
    toast({ title: '审批通过', description: `单号 ${it.documentId} 已通过` });
  };

  const handleReject = (it: ApprovalInstance) => {
    updateStatus(it.id, ApprovalStatus.REJECTED);
    toast({ title: '审批拒绝', description: `单号 ${it.documentId} 已拒绝` });
  };

  const openDetail = (item: ApprovalInstance) => {
    setSelected(item);
    setDetailOpen(true);
  };

  const gotoPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="space-y-6">
        <Card>
          <CardContent className="grid gap-3 md:grid-cols-5 px-6 pt-3 pb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="输入标题/单号/提交人" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="pl-8" />
              </div>
            </div>
            <div>
              <Select onValueChange={(v) => { setStatusFilter(v === 'all' ? 'all' : Number(v) as ApprovalStatus); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="按状态" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {Object.values(ApprovalStatus).map((s) => (
                    <SelectItem key={s} value={String(s)}>{STATUS_LABEL[s as ApprovalStatus]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select onValueChange={(v) => { setTypeFilter(v === 'all' ? 'all' : Number(v) as DocumentType); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="按类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.values(DocumentType).map((t) => (
                    <SelectItem key={t} value={String(t)}>{DOC_LABEL[t as DocumentType]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
                <SelectTrigger><SelectValue placeholder="排序字段" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">创建时间</SelectItem>
                  <SelectItem value="updatedAt">更新时间</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                <SelectTrigger><SelectValue placeholder="顺序" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">倒序</SelectItem>
                  <SelectItem value="asc">正序</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-5 flex justify-end gap-2 pt-1">
              <Button variant="default" onClick={() => setPage(1)}>搜索</Button>
              <Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); setTypeFilter('all'); setSortKey('createdAt'); setSortOrder('desc'); setPage(1); toast({ title: '重置完成', description: '筛选条件已重置' }); }}>重置</Button>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>列表</CardTitle>
          </CardHeader>
          <CardContent>
            {pageItems.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">未找到符合条件的审批</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>标题</TableHead>
                    <TableHead>单号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>提交人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{it.title}</TableCell>
                      <TableCell><code className="text-xs">{it.documentId}</code></TableCell>
                      <TableCell>{DOC_LABEL[it.documentType]}</TableCell>
                      <TableCell>{it.submitter?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_CLASS[it.status]}>{STATUS_LABEL[it.status]}</Badge>
                      </TableCell>
                      <TableCell>{fmt(it.createdAt)}</TableCell>
                      <TableCell>{fmt(it.updatedAt)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openDetail(it)}>查看</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" disabled={!canOperate(it)} className="text-white bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" /> 通过
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认通过该审批？</AlertDialogTitle>
                              <AlertDialogDescription>通过后将不可撤销，请确认信息无误。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApprove(it)}>确认</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" disabled={!canOperate(it)} variant="destructive">
                              <XCircle className="h-4 w-4 mr-1" /> 拒绝
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认拒绝该审批？</AlertDialogTitle>
                              <AlertDialogDescription>拒绝后将通知提交人，状态不可直接恢复。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleReject(it)}>确认</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* 分页 */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>每页</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>共 {filtered.length} 条</span>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); gotoPage(currentPage - 1); }} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink href="#" isActive={p === currentPage} onClick={(e) => { e.preventDefault(); gotoPage(p); }}>
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); gotoPage(currentPage + 1); }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {/* 详情抽屉 */}
        <Drawer open={detailOpen} onOpenChange={setDetailOpen} direction="right">
          <DrawerContent side="right" className="w-[720px]">
            <DrawerHeader>
              <DrawerTitle>审批详情</DrawerTitle>
            </DrawerHeader>
            {selected && (
              <div className="space-y-6 px-4 pb-4">
                {/* 标题 */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">标题</div>
                  <div className="font-medium">{selected.title}</div>
                </div>

                {/* 基本信息 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">基本信息</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">单号</div>
                      <div><code className="text-xs">{selected.documentId}</code></div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">类型</div>
                      <div>{DOC_LABEL[selected.documentType]}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">流程</div>
                      <div>{selected.workflowName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">当前节点</div>
                      <div>{selected.currentNodeName}</div>
                    </div>
                  </div>
                </div>

                {/* 提交与审批 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">提交与审批</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">提交人</div>
                      <div>{selected.submitter?.name || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">当前审批人</div>
                      <div>{selected.currentApprover?.name || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">发起时间</div>
                      <div>{fmt(selected.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">更新时间</div>
                      <div>{fmt(selected.updatedAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">审批状态</div>
                      <div><Badge className={STATUS_CLASS[selected.status]}>{STATUS_LABEL[selected.status]}</Badge></div>
                    </div>
                  </div>
                </div>

                {/* 业务字段 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">业务字段</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">金额</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">税率</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">发票号</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">供应商</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">预算编码</div>
                      <div>-</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">费用明细条目</div>
                    <div className="text-sm text-muted-foreground">暂无明细</div>
                  </div>
                </div>

                {/* SLA与时效 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">SLA与时效</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">审批时长</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">逾期标记</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">截止时间</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">剩余时间</div>
                      <div>-</div>
                    </div>
                  </div>
                </div>

                {/* 关联信息 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">关联信息</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">关联单据</div>
                      <div>-</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">附件</div>
                      <div>-</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">备注/补充说明</div>
                    <div>{selected.remark || '-'}</div>
                  </div>
                </div>

                {/* 流程追踪 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">流程追踪</div>
                  <div className="space-y-3">
                    {[
                      { node: '提交申请', actor: selected.submitter?.name || '-', result: '已提交', time: fmt(selected.createdAt) },
                      { node: selected.currentNodeName || '当前节点', actor: selected.currentApprover?.name || '-', result: STATUS_LABEL[selected.status], time: fmt(selected.updatedAt) },
                    ].map((st, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{st.node} · {st.actor}</div>
                          <div className="text-xs text-muted-foreground">{st.result} · {st.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 审计与历史 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">审计与历史</div>
                  <div className="space-y-2">
                    {[
                      { action: '创建单据', actor: selected.submitter?.name || '-', time: fmt(selected.createdAt) },
                      { action: '查看详情', actor: '系统', time: fmt(selected.updatedAt) },
                    ].map((log, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{log.action}</div>
                          <div className="text-xs text-muted-foreground">{log.actor} · {log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DrawerFooter className="border-t">
              <div className="flex justify-end gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" disabled={!selected || !canOperate(selected)} className="text-white bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" /> 通过
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认通过该审批？</AlertDialogTitle>
                      <AlertDialogDescription>通过后将不可撤销，请确认信息无误。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => selected && handleApprove(selected)}>确认</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" disabled={!selected || !canOperate(selected)} variant="destructive">
                      <XCircle className="h-4 w-4 mr-1" /> 拒绝
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认拒绝该审批？</AlertDialogTitle>
                      <AlertDialogDescription>拒绝后将通知提交人，状态不可直接恢复。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={() => selected && handleReject(selected)}>确认</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default ApprovalList;
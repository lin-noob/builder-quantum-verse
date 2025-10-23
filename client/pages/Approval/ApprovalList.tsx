import React, { useMemo, useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, Plus, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// 生成我提交的审批数据
function generateMySubmittedItems(): ApprovalInstance[] {
  return Array.from({ length: 12 }).map((_, i) => {
    const created = new Date();
    created.setDate(created.getDate() - (i % 10));
    const updated = new Date(created);
    updated.setHours(created.getHours() + (i % 24));
    return {
      id: String(100 + i + 1),
      title: `${DOC_LABEL[types[i % types.length]]} - 我的第${i + 1}号申请`,
      documentId: `MY-${(20240000 + i + 1).toString()}`,
      workflowId: `wf-${100 + (i % 7)}`,
      workflowName: ['费用报销流程','请假流程','采购流程','合同签署流程','通用审批流程'][i % 5],
      documentType: types[i % types.length],
      status: statuses[i % statuses.length],
      currentNodeId: `node-${(i % 4) + 1}`,
      currentNodeName: ['提交申请','部门经理审批','财务复核','总监最终审批'][i % 4],
      submitter: { id: 'current-user', name: '当前用户' },
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
  const [myItems, setMyItems] = useState<ApprovalInstance[]>(() => generateMySubmittedItems());

  const [activeTab, setActiveTab] = useState<'approval-list' | 'my-submitted'>('approval-list');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>('all');
  const [sortKey, setSortKey] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ApprovalInstance | null>(null);
  
  // 新增审批对话框状态
  const [newApprovalOpen, setNewApprovalOpen] = useState(false);
  const [newApprovalForm, setNewApprovalForm] = useState({
    title: '',
    documentType: DocumentType.GENERAL_REQUEST,
    content: '',
    amount: '',
    startDate: '',
    endDate: '',
    approver: '',
    contractName: ''
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const currentItems = activeTab === 'approval-list' ? items : myItems;
    let res = currentItems.filter(it => {
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
  }, [items, myItems, activeTab, query, statusFilter, typeFilter, sortKey, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const counts = useMemo(() => {
    const currentItems = activeTab === 'approval-list' ? items : myItems;
    return {
      total: currentItems.length,
      pending: currentItems.filter(i => i.status === ApprovalStatus.PENDING).length,
      approved: currentItems.filter(i => i.status === ApprovalStatus.APPROVED).length,
      rejected: currentItems.filter(i => i.status === ApprovalStatus.REJECTED).length,
    };
  }, [items, myItems, activeTab]);

  const canOperate = (it: ApprovalInstance) => it.status === ApprovalStatus.PENDING;

  const updateStatus = (id: string, status: ApprovalStatus) => {
    if (activeTab === 'approval-list') {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
    } else {
      setMyItems(prev => prev.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
    }
  };

  const handleApprove = (it: ApprovalInstance) => {
    updateStatus(it.id, ApprovalStatus.APPROVED);
    toast({ title: '审批通过', description: `单号 ${it.documentId} 已通过` });
  };

  const handleReject = (it: ApprovalInstance) => {
    updateStatus(it.id, ApprovalStatus.REJECTED);
    toast({ title: '审批拒绝', description: `单号 ${it.documentId} 已拒绝` });
  };

  // 我提交的审批操作
  const handleSubmitApproval = (it: ApprovalInstance) => {
    updateStatus(it.id, ApprovalStatus.PENDING);
    toast({ title: '提交成功', description: `单号 ${it.documentId} 已提交审批` });
  };

  const handleWithdrawApproval = (it: ApprovalInstance) => {
    updateStatus(it.id, ApprovalStatus.CANCELLED);
    toast({ title: '撤回成功', description: `单号 ${it.documentId} 已撤回` });
  };

  const handleDeleteApproval = (id: string) => {
    setMyItems(prev => prev.filter(i => i.id !== id));
    toast({ title: '删除成功', description: '审批已删除' });
  };

  // 新增审批
  const handleCreateApproval = () => {
    if (!newApprovalForm.title.trim()) {
      toast({ title: '请填写标题', variant: 'destructive' });
      return;
    }
    
    const newId = String(Date.now());
    const newApproval: ApprovalInstance = {
      id: newId,
      title: newApprovalForm.title,
      documentId: `MY-${Date.now()}`,
      workflowId: 'wf-100',
      workflowName: DOC_LABEL[newApprovalForm.documentType] + '流程',
      documentType: newApprovalForm.documentType,
      status: ApprovalStatus.PENDING,
      currentNodeId: 'node-1',
      currentNodeName: '提交申请',
      submitter: { id: 'current-user', name: '当前用户' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      remark: newApprovalForm.content
    };
    
    setMyItems(prev => [newApproval, ...prev]);
    setNewApprovalOpen(false);
    setNewApprovalForm({ 
      title: '', 
      documentType: DocumentType.GENERAL_REQUEST, 
      content: '',
      amount: '',
      startDate: '',
      endDate: '',
      approver: '',
      contractName: ''
    });
    toast({ title: '创建成功', description: `审批 ${newApproval.documentId} 已创建` });
  };

  const openDetail = (item: ApprovalInstance) => {
    setSelected(item);
    setDetailOpen(true);
  };

  const gotoPage = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  const toggleSort = (key: 'createdAt' | 'updatedAt') => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="space-y-6">
        {/* Tab页切换与内容 */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'approval-list' | 'my-submitted');
          setPage(1);
        }}>

          <TabsContent value="approval-list" className="space-y-6">
            <Card>
          <CardContent className="grid gap-2 md:grid-cols-5 px-6 pt-3 pb-4">
            <div className="flex items-center">
              <TabsList className="w-auto gap-2">
                <TabsTrigger value="approval-list" className="px-3">
                  审批列表
                </TabsTrigger>
                <TabsTrigger value="my-submitted" className="px-3">
                  我提交的审批
                </TabsTrigger>
              </TabsList>
            </div>
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
                  {types.map((t) => (
                    <SelectItem key={t} value={String(t)}>{DOC_LABEL[t]}</SelectItem>
                  ))}
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
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>创建时间{sortKey==='createdAt' ? (sortOrder==='asc' ? ' ↑' : ' ↓') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('updatedAt')}>更新时间{sortKey==='updatedAt' ? (sortOrder==='asc' ? ' ↑' : ' ↓') : ''}</TableHead>
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
                        {activeTab === 'approval-list' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              disabled={it.status !== ApprovalStatus.CANCELLED && it.status !== ApprovalStatus.REJECTED}
                              onClick={() => handleSubmitApproval(it)}
                              className="text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="h-4 w-4 mr-1" /> 提交
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  disabled={it.status !== ApprovalStatus.PENDING}
                                  variant="outline"
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" /> 撤回
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认撤回该审批？</AlertDialogTitle>
                                  <AlertDialogDescription>撤回后审批流程将终止，可重新提交。</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleWithdrawApproval(it)}>确认</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  disabled={it.status === ApprovalStatus.PENDING}
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> 删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除该审批？</AlertDialogTitle>
                                  <AlertDialogDescription>删除后将无法恢复，请谨慎操作。</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteApproval(it.id)}>确认</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
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
      </TabsContent>

      <TabsContent value="my-submitted" className="space-y-6">
        <Card>
          <CardContent className="grid gap-2 md:grid-cols-5 px-6 pt-3 pb-4">
            <div className="flex items-center">
              <TabsList className="w-auto gap-2">
                <TabsTrigger value="approval-list" className="px-3">
                  审批列表
                </TabsTrigger>
                <TabsTrigger value="my-submitted" className="px-3">
                  我提交的审批
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="输入标题/单号" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="pl-8" />
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
                  {types.map((t) => (
                    <SelectItem key={t} value={String(t)}>{DOC_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-5 flex justify-end gap-2 pt-1">
              <Button variant="default" onClick={() => setPage(1)}>搜索</Button>
              <Button variant="outline" onClick={() => { setQuery(''); setStatusFilter('all'); setTypeFilter('all'); setSortKey('createdAt'); setSortOrder('desc'); setPage(1); toast({ title: '重置完成', description: '筛选条件已重置' }); }}>重置</Button>
            </div>
          </CardContent>
        </Card>

        <div className="px-6">
          <Button variant="default" onClick={() => setNewApprovalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> 新增审批
          </Button>
        </div>

        <Card>
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
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('createdAt')}>创建时间{sortKey==='createdAt' ? (sortOrder==='asc' ? ' ↑' : ' ↓') : ''}</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('updatedAt')}>更新时间{sortKey==='updatedAt' ? (sortOrder==='asc' ? ' ↑' : ' ↓') : ''}</TableHead>
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
                        {activeTab === 'approval-list' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              disabled={it.status !== ApprovalStatus.CANCELLED && it.status !== ApprovalStatus.REJECTED}
                              onClick={() => handleSubmitApproval(it)}
                              className="text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="h-4 w-4 mr-1" /> 提交
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  disabled={it.status !== ApprovalStatus.PENDING}
                                  variant="outline"
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" /> 撤回
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认撤回该审批？</AlertDialogTitle>
                                  <AlertDialogDescription>撤回后审批流程将终止，可重新提交。</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleWithdrawApproval(it)}>确认</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  disabled={it.status === ApprovalStatus.PENDING}
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> 删除
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除该审批？</AlertDialogTitle>
                                  <AlertDialogDescription>删除后将无法恢复，请谨慎操作。</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteApproval(it.id)}>确认</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
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
      </TabsContent>
    </Tabs>

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

        {/* 新增审批抽屉 */}
        <Drawer open={newApprovalOpen} onOpenChange={setNewApprovalOpen} direction="right">
          <DrawerContent side="right" className="w-[720px]">
            <DrawerHeader>
              <DrawerTitle>新增审批</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-6 px-4 pb-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">标题</Label>
                <Input
                  id="title"
                  value={newApprovalForm.title}
                  onChange={(e) => setNewApprovalForm(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="请输入审批标题"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">类型</Label>
                <Select 
                  value={String(newApprovalForm.documentType)} 
                  onValueChange={(v) => setNewApprovalForm(prev => ({ ...prev, documentType: Number(v) as DocumentType }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择审批类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t} value={String(t)}>{DOC_LABEL[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">金额</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newApprovalForm.amount}
                  onChange={(e) => setNewApprovalForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="col-span-3"
                  placeholder="请输入金额（可选）"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">开始时间</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newApprovalForm.startDate}
                  onChange={(e) => setNewApprovalForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">结束时间</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newApprovalForm.endDate}
                  onChange={(e) => setNewApprovalForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="approver" className="text-right">审批人</Label>
                <Select 
                  value={newApprovalForm.approver || ''}
                  onValueChange={(v) => setNewApprovalForm(prev => ({ ...prev, approver: v }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择审批人（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    {names.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newApprovalForm.documentType === DocumentType.CONTRACT_APPROVAL && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contractName" className="text-right">合同名称</Label>
                  <Input
                    id="contractName"
                    value={newApprovalForm.contractName}
                    onChange={(e) => setNewApprovalForm(prev => ({ ...prev, contractName: e.target.value }))}
                    className="col-span-3"
                    placeholder="请输入合同名称"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">内容</Label>
                <Textarea
                  id="content"
                  value={newApprovalForm.content}
                  onChange={(e) => setNewApprovalForm(prev => ({ ...prev, content: e.target.value }))}
                  className="col-span-3"
                  placeholder="请输入审批内容详情"
                  rows={4}
                />
              </div>
            </div>
            <DrawerFooter className="border-t">
              <Button variant="outline" onClick={() => setNewApprovalOpen(false)}>取消</Button>
              <Button onClick={handleCreateApproval} disabled={!newApprovalForm.title || !newApprovalForm.content}>创建审批</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default ApprovalList;
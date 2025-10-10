import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  FileText, 
  Download,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ApprovalStatistics as IApprovalStatistics, DocumentType } from '@/types/approval';

// 模拟统计数据
const mockStatistics: IApprovalStatistics = {
  overview: {
    totalInstances: 1250,
    pendingInstances: 85,
    approvedInstances: 980,
    rejectedInstances: 185,
    averageProcessTime: 36.5,
    approvalRate: 78.4
  },
  byDocumentType: [
    {
      documentType: DocumentType.EXPENSE_REPORT,
      count: 450,
      averageTime: 24.5,
      approvalRate: 85.2
    },
    {
      documentType: DocumentType.LEAVE_REQUEST,
      count: 320,
      averageTime: 18.2,
      approvalRate: 92.1
    },
    {
      documentType: DocumentType.PURCHASE_ORDER,
      count: 280,
      averageTime: 48.6,
      approvalRate: 68.9
    },
    {
      documentType: DocumentType.CONTRACT_APPROVAL,
      count: 200,
      averageTime: 72.3,
      approvalRate: 65.5
    }
  ],
  byDepartment: [
    {
      department: '市场部',
      submitted: 320,
      approved: 280,
      rejected: 40,
      averageTime: 28.5
    },
    {
      department: '技术部',
      submitted: 280,
      approved: 245,
      rejected: 35,
      averageTime: 32.1
    },
    {
      department: '销售部',
      submitted: 250,
      approved: 210,
      rejected: 40,
      averageTime: 35.8
    },
    {
      department: '人事部',
      submitted: 180,
      approved: 165,
      rejected: 15,
      averageTime: 22.3
    },
    {
      department: '财务部',
      submitted: 220,
      approved: 180,
      rejected: 40,
      averageTime: 45.2
    }
  ],
  byTimeRange: [
    { date: '2024-01-01', submitted: 45, approved: 38, rejected: 7 },
    { date: '2024-01-02', submitted: 52, approved: 44, rejected: 8 },
    { date: '2024-01-03', submitted: 38, approved: 32, rejected: 6 },
    { date: '2024-01-04', submitted: 61, approved: 48, rejected: 13 },
    { date: '2024-01-05', submitted: 55, approved: 46, rejected: 9 },
    { date: '2024-01-06', submitted: 42, approved: 35, rejected: 7 },
    { date: '2024-01-07', submitted: 48, approved: 41, rejected: 7 }
  ],
  topApprovers: [
    {
      user: {
        id: 'user-001',
        name: '张经理',
        email: 'zhang@company.com',
        department: '市场部',
        position: '部门经理',
        role: 'manager',
        isActive: true
      },
      processedCount: 156,
      averageTime: 18.5
    },
    {
      user: {
        id: 'user-002',
        name: '李总监',
        email: 'li@company.com',
        department: '技术部',
        position: '技术总监',
        role: 'director',
        isActive: true
      },
      processedCount: 142,
      averageTime: 22.3
    },
    {
      user: {
        id: 'user-003',
        name: '王主管',
        email: 'wang@company.com',
        department: '销售部',
        position: '销售主管',
        role: 'supervisor',
        isActive: true
      },
      processedCount: 128,
      averageTime: 25.8
    }
  ],
  workflowPerformance: [
    {
      workflowId: 'wf-001',
      workflowName: '费用报销流程',
      instanceCount: 450,
      averageTime: 24.5,
      approvalRate: 85.2,
      bottleneckNode: '财务审核'
    },
    {
      workflowId: 'wf-002',
      workflowName: '请假审批流程',
      instanceCount: 320,
      averageTime: 18.2,
      approvalRate: 92.1
    },
    {
      workflowId: 'wf-003',
      workflowName: '采购审批流程',
      instanceCount: 280,
      averageTime: 48.6,
      approvalRate: 68.9,
      bottleneckNode: '总经理审批'
    }
  ]
};

const ApprovalStatistics: React.FC = () => {
  const [statistics, setStatistics] = useState<IApprovalStatistics>(mockStatistics);
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  // 获取文档类型显示名称
  const getDocumentTypeName = (type: DocumentType) => {
    const typeNames = {
      [DocumentType.EXPENSE_REPORT]: '费用报销',
      [DocumentType.LEAVE_REQUEST]: '请假申请',
      [DocumentType.PURCHASE_ORDER]: '采购申请',
      [DocumentType.CONTRACT_APPROVAL]: '合同审批',
      [DocumentType.BUDGET_APPROVAL]: '预算审批',
      [DocumentType.RECRUITMENT]: '招聘申请',
      [DocumentType.PROMOTION]: '晋升申请',
      [DocumentType.TRAINING_REQUEST]: '培训申请',
      [DocumentType.EQUIPMENT_REQUEST]: '设备申请',
      [DocumentType.TRAVEL_REQUEST]: '出差申请',
      [DocumentType.OVERTIME_REQUEST]: '加班申请',
      [DocumentType.RESIGNATION]: '离职申请',
      [DocumentType.CUSTOM]: '自定义'
    };
    return typeNames[type] || type;
  };

  // 刷新数据
  const handleRefresh = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // 导出报告
  const handleExport = () => {
    // 模拟导出功能
    console.log('导出统计报告');
  };

  // 计算审批率颜色
  const getApprovalRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">审批统计</h1>
          <p className="text-muted-foreground">查看审批流程的统计数据和分析报告</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="90d">最近90天</SelectItem>
              <SelectItem value="1y">最近1年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 概览统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总申请数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overview.totalInstances}</div>
            <p className="text-xs text-muted-foreground">
              +12% 相比上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审批</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{statistics.overview.pendingInstances}</div>
            <p className="text-xs text-muted-foreground">
              -5% 相比上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.overview.averageProcessTime}h</div>
            <p className="text-xs text-muted-foreground">
              -8% 相比上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">审批通过率</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{statistics.overview.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              +3% 相比上月
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细统计 */}
      <Tabs defaultValue="document-type" className="space-y-4">
        <TabsList>
          <TabsTrigger value="document-type">按文档类型</TabsTrigger>
          <TabsTrigger value="department">按部门</TabsTrigger>
          <TabsTrigger value="approvers">审批人统计</TabsTrigger>
          <TabsTrigger value="workflow">流程性能</TabsTrigger>
        </TabsList>

        {/* 按文档类型统计 */}
        <TabsContent value="document-type">
          <Card>
            <CardHeader>
              <CardTitle>按文档类型统计</CardTitle>
              <CardDescription>不同文档类型的审批情况分析</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文档类型</TableHead>
                    <TableHead>申请数量</TableHead>
                    <TableHead>平均处理时间</TableHead>
                    <TableHead>通过率</TableHead>
                    <TableHead>趋势</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.byDocumentType.map((item) => (
                    <TableRow key={item.documentType}>
                      <TableCell className="font-medium">
                        {getDocumentTypeName(item.documentType)}
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>{item.averageTime}小时</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getApprovalRateColor(item.approvalRate)}>
                            {item.approvalRate}%
                          </span>
                          <Progress value={item.approvalRate} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">稳定</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 按部门统计 */}
        <TabsContent value="department">
          <Card>
            <CardHeader>
              <CardTitle>按部门统计</CardTitle>
              <CardDescription>各部门的审批申请情况</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>部门</TableHead>
                    <TableHead>提交数量</TableHead>
                    <TableHead>通过数量</TableHead>
                    <TableHead>拒绝数量</TableHead>
                    <TableHead>平均处理时间</TableHead>
                    <TableHead>通过率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.byDepartment.map((item) => {
                    const approvalRate = (item.approved / item.submitted * 100).toFixed(1);
                    return (
                      <TableRow key={item.department}>
                        <TableCell className="font-medium">{item.department}</TableCell>
                        <TableCell>{item.submitted}</TableCell>
                        <TableCell className="text-green-600">{item.approved}</TableCell>
                        <TableCell className="text-red-600">{item.rejected}</TableCell>
                        <TableCell>{item.averageTime}小时</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={getApprovalRateColor(Number(approvalRate))}>
                              {approvalRate}%
                            </span>
                            <Progress value={Number(approvalRate)} className="w-16 h-2" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 审批人统计 */}
        <TabsContent value="approvers">
          <Card>
            <CardHeader>
              <CardTitle>审批人统计</CardTitle>
              <CardDescription>审批人的工作量和效率统计</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>审批人</TableHead>
                    <TableHead>部门</TableHead>
                    <TableHead>处理数量</TableHead>
                    <TableHead>平均处理时间</TableHead>
                    <TableHead>效率评级</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.topApprovers.map((item) => {
                    const efficiency = item.averageTime < 24 ? 'high' : item.averageTime < 48 ? 'medium' : 'low';
                    const efficiencyConfig = {
                      high: { label: '高效', variant: 'success' as const },
                      medium: { label: '一般', variant: 'default' as const },
                      low: { label: '较慢', variant: 'destructive' as const }
                    };
                    
                    return (
                      <TableRow key={item.user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{item.user.name}</div>
                              <div className="text-sm text-muted-foreground">{item.user.position}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.user.department}</TableCell>
                        <TableCell>{item.processedCount}</TableCell>
                        <TableCell>{item.averageTime}小时</TableCell>
                        <TableCell>
                          <Badge variant={efficiencyConfig[efficiency].variant}>
                            {efficiencyConfig[efficiency].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 流程性能 */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>流程性能分析</CardTitle>
              <CardDescription>各审批流程的性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>流程名称</TableHead>
                    <TableHead>实例数量</TableHead>
                    <TableHead>平均处理时间</TableHead>
                    <TableHead>通过率</TableHead>
                    <TableHead>瓶颈节点</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.workflowPerformance.map((item) => (
                    <TableRow key={item.workflowId}>
                      <TableCell className="font-medium">{item.workflowName}</TableCell>
                      <TableCell>{item.instanceCount}</TableCell>
                      <TableCell>{item.averageTime}小时</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={getApprovalRateColor(item.approvalRate)}>
                            {item.approvalRate}%
                          </span>
                          <Progress value={item.approvalRate} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.bottleneckNode ? (
                          <Badge variant="outline">{item.bottleneckNode}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.approvalRate > 80 ? 'success' : 'default'}>
                          {item.approvalRate > 80 ? '良好' : '需优化'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApprovalStatistics;
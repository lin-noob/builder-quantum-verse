import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Users, Filter, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table } from "antd";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { segmentService, Segment } from "@/services/segmentService";
import { User } from "./UserList";
import { formatCurrency } from "@/lib/utils";

// 定义规则类型
export interface Rule {
  field: string;
  operator: string;
  value: string;
}

// 可选字段配置
const FIELD_OPTIONS = [
  { label: "用户姓名", value: "s.full_name", type: "string" },
  { label: "公司", value: "s.company_name", type: "string" },
  { label: "联系方式", value: "s.contact_info", type: "string" },
  { label: "首次访问", value: "s.create_gmt", type: "date" },
  { label: "注册时间", value: "s.sign_time", type: "date" },
  { label: "首次购买", value: "s.min_buy_time", type: "date" },
  { label: "最后活跃", value: "s.login_date", type: "date" },
  // { label: "90天 LTV", value: "ltv90Days", type: "number" },
  { label: "近30天会话", value: "t1.sessionTotal", type: "number" },
  { label: "近30天页面浏览量", value: "t1.pageViewTotal", type: "number" },
  // { label: "近30天AOV", value: "aov30d", type: "number" },
  // { label: "跳出率", value: "bounceRate", type: "number" },
];

// 操作符配置
const OPERATORS = {
  string: [
    { label: "包含", value: "like" },
    { label: "等于", value: "=" },
    { label: "不等于", value: "!=" },
  ],
  number: [
    { label: "大于", value: "&gt;" },
    { label: "小于", value: "&lt;" },
    { label: "等于", value: "=" },
    { label: "大于等于", value: "&gt;=" },
    { label: "小于等于", value: "&lt;=" },
  ],
  date: [
    { label: "早于", value: "&gt;" },
    { label: "晚于", value: "&lt;" },
  ],
};

export default function SegmentBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 页面状态: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");

  // 分群列表数据
  const [segments, setSegments] = useState<Segment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 当前编辑的分群数据
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  const [segmentName, setSegmentName] = useState("");
  const [segmentDesc, setSegmentDesc] = useState("");
  const [rules, setRules] = useState<Rule[]>([]);

  // 删除确认弹窗状态
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 预览用户列表
  const [previewUsers, setPreviewUsers] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // 加载分群列表
  // 加载分群列表
  const fetchSegments = async () => {
    setLoading(true);
    try {
      const { records, total } = await segmentService.getSegmentsPage(currentPage, pageSize);
      setSegments(records);
      setTotal(total);
    } catch (error) {
      console.error("Failed to fetch segments", error);
      toast({
        title: "获取分群列表失败",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "list") {
      fetchSegments();
    }
  }, [viewMode, currentPage, pageSize]);

  // 检查规则是否填写完成（所有规则的 value 都有值）
  const isRulesComplete = useMemo(() => {
    if (rules.length === 0) return false;
    return rules.every((rule) => rule.field && rule.operator && rule.value?.trim());
  }, [rules]);

  // 获取预览用户 - 当筛选规则变更且填写完成时重新获取
  useEffect(() => {
    const fetchPreview = async () => {
      if (viewMode === "list") return;

      // 只有规则填写完成时才请求
      if (!isRulesComplete) {
        setPreviewUsers([]);
        return;
      }

      setIsPreviewLoading(true);
      try {
        const users = await segmentService.getPreviewUsers(rules);
        setPreviewUsers(users);
      } catch (error) {
        console.error("Failed to fetch preview users", error);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    // 防抖500ms，避免频繁请求
    const timer = setTimeout(() => {
      fetchPreview();
    }, 500);

    return () => clearTimeout(timer);
  }, [rules, viewMode, isRulesComplete]);

  // 进入创建模式
  const handleCreate = () => {
    setSegmentName("");
    setSegmentDesc("");
    setRules([{ field: "s.full_name", operator: "=", value: "" }]);
    setCurrentSegmentId(null);
    setViewMode("create");
  };

  // 进入编辑模式
  const handleEdit = (segment: Segment) => {
    setSegmentName(segment.segmentName);
    setSegmentDesc(segment.description);
    setRules(segment.rules);
    setCurrentSegmentId(segment.id);
    setViewMode("edit");
  };

  // 删除分群
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await segmentService.deleteSegment(deleteId);
      toast({ title: "删除成功" });
      // 重新加载列表
      await fetchSegments();
    } catch (error) {
      console.error("Failed to delete segment", error);
      toast({
        title: "删除失败",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // 添加规则
  const addRule = () => {
    const newRule: Rule = {
      field: "s.full_name",
      operator: "=",
      value: "",
    };
    setRules([...rules, newRule]);
  };

  // 删除规则
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // 更新规则
  const updateRule = (index: number, key: keyof Rule, value: string) => {
    setRules(
      rules.map((r, i) => {
        if (i === index) {
          const updatedRule = { ...r, [key]: value };
          if (key === "field") {
            const fieldType = FIELD_OPTIONS.find((f) => f.value === value)?.type || "string";
            updatedRule.operator = fieldType === "number" ? "=" : fieldType === "date" ? "&gt;" : "=";
            updatedRule.value = "";
          }
          return updatedRule;
        }
        return r;
      }),
    );
  };

  // 保存分群
  const handleSave = async () => {
    if (!segmentName.trim()) {
      toast({
        title: "请输入分群名称",
        variant: "destructive",
      });
      return;
    }

    const newSegment: Segment = {
      id: currentSegmentId || "",
      segmentName: segmentName,
      description: segmentDesc,
      rules: rules,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 同步保存到后端API
      await segmentService.createOrUpdateSegment(newSegment);

      toast({
        title: "分群保存成功",
        description: `已保存 "${segmentName}"`,
      });

      setViewMode("list");
    } catch (error) {
      console.error("Failed to save segment:", error);
      toast({
        title: "保存失败",
        description: "保存分群失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  // 渲染列表视图
  if (viewMode === "list") {
    const segmentColumns = [
      {
        title: "分群名称",
        dataIndex: "segmentName",
        key: "segmentName",
        render: (text: string) => <span className="font-medium">{text}</span>,
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description",
        render: (text: string) => text || "-",
      },
      {
        title: "规则数量",
        key: "rules",
        render: (_: any, record: Segment) => record.rules.length,
      },
      {
        title: "创建时间",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (text: string) => new Date(text).toLocaleDateString(),
      },
      {
        title: "操作",
        key: "action",
        align: "right" as const,
        render: (_: any, record: Segment) => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
              <Edit className="h-4 w-4 mr-1" />
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDelete(record.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户分群管理</h1>
            <p className="text-gray-500 mt-1">管理和创建目标受众群体筛选规则</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            新建分群
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table
              columns={segmentColumns}
              dataSource={segments}
              rowKey="id"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                },
              }}
              locale={{ emptyText: "暂无分群，点击右上角新建" }}
            />
          </CardContent>
        </Card>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>您确定要删除这个分群吗？此操作无法撤销。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // 渲染创建/编辑视图
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setViewMode("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{viewMode === "create" ? "新建分群" : "编辑分群"}</h1>
            <p className="text-gray-500 mt-1">通过规则筛选创建目标受众群体</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRules([])}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置规则
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存分群
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：配置区域 */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">分群名称</label>
                <Input
                  placeholder="例如：高价值流失风险用户"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">描述</label>
                <Input
                  placeholder="分群用途描述..."
                  value={segmentDesc}
                  onChange={(e) => setSegmentDesc(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">筛选规则</CardTitle>
              <Button variant="ghost" size="sm" onClick={addRule}>
                <Plus className="h-4 w-4 mr-1" />
                添加规则
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                  暂无规则，点击上方按钮添加
                </div>
              ) : (
                rules.map((rule, index) => {
                  const fieldType = FIELD_OPTIONS.find((f) => f.value === rule.field)?.type || "string";
                  const availableOperators = OPERATORS[fieldType as keyof typeof OPERATORS] || OPERATORS.string;

                  return (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-3 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => removeRule(index)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>

                      <div className="grid grid-cols-1 gap-2">
                        <Select value={rule.field as string} onValueChange={(val) => updateRule(index, "field", val)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="选择字段" />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                          <Select value={rule.operator} onValueChange={(val) => updateRule(index, "operator", val)}>
                            <SelectTrigger className="w-[110px] bg-white">
                              <SelectValue placeholder="操作符" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableOperators.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            className="flex-1 bg-white"
                            placeholder={fieldType === "date" ? "YYYY-MM-DD" : "值"}
                            value={rule.value}
                            onChange={(e) => updateRule(index, "value", e.target.value)}
                            type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预览区域 */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  用户预览
                </CardTitle>
                <Badge variant="secondary" className="text-sm">
                  匹配: {previewUsers.length}
                </Badge>
              </div>
              <CardDescription>实时展示符合当前筛选条件的用户列表</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="rounded-md border overflow-hidden">
                <Table
                  columns={[
                    {
                      title: "姓名",
                      dataIndex: "name",
                      key: "name",
                      ellipsis: true,
                      render: (text: string, record: User) => (
                        <span className="font-medium">{text || record.userId}</span>
                      ),
                    },
                    {
                      title: "公司",
                      dataIndex: "companyName",
                      key: "companyName",
                      ellipsis: true,
                    },
                    {
                      title: "联系方式",
                      dataIndex: "contactInfo",
                      key: "contactInfo",
                      ellipsis: true,
                    },
                    {
                      title: "首次访问",
                      dataIndex: "createGmt",
                      key: "createGmt",
                      ellipsis: true,
                    },
                    {
                      title: "注册时间",
                      dataIndex: "signTime",
                      key: "signTime",
                      ellipsis: true,
                    },
                    {
                      title: "首次购买",
                      dataIndex: "minBuyTime",
                      key: "minBuyTime",
                      ellipsis: true,
                    },
                    {
                      title: "最后活跃",
                      dataIndex: "loginDate",
                      key: "loginDate",
                      ellipsis: true,
                    },
                    {
                      title: "近30天会话",
                      dataIndex: "sessionTotal",
                      key: "sessionTotal",
                      ellipsis: true,
                    },
                    {
                      title: "近30天浏览",
                      dataIndex: "pageViewTotal",
                      key: "pageViewTotal",
                      ellipsis: true,
                    },
                  ]}
                  dataSource={previewUsers}
                  loading={isPreviewLoading}
                  rowKey="userId"
                  pagination={false}
                  scroll={{ y: 400 }}
                  locale={{ emptyText: "没有找到匹配的用户" }}
                  size="small"
                />
              </div>
              {previewUsers.length > 10 && (
                <div className="text-center mt-4 text-sm text-muted-foreground">仅显示前 10 条数据</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  RotateCcw, 
  MoreHorizontal, 
  Layout,
  Filter,
  Calendar,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Types ---

interface BusinessModelSummary {
  id: string;
  name: string;
  version: string;
  status: 'Draft' | 'Active' | 'Archived';
  description: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  entityCount: number;
  ruleCount: number;
}

// --- Mock Data ---

const mockModels: BusinessModelSummary[] = [
  {
    id: "m1",
    name: "电商大促业务模型",
    version: "v1.0.2",
    status: "Draft",
    description: "针对双11大促场景的交易、风控与营销规则模型",
    owner: "Alex Chen",
    createdAt: "2024-10-15T10:00:00Z",
    updatedAt: "2024-10-26T14:30:00Z",
    entityCount: 12,
    ruleCount: 25
  },
  {
    id: "m2",
    name: "新用户注册流程",
    version: "v2.1.0",
    status: "Active",
    description: "标准化的新用户注册、KYC认证及欢迎礼遇流程",
    owner: "Sarah Li",
    createdAt: "2024-09-01T09:00:00Z",
    updatedAt: "2024-10-20T11:15:00Z",
    entityCount: 5,
    ruleCount: 8
  },
  {
    id: "m3",
    name: "信贷审批模型",
    version: "v3.0.5",
    status: "Active",
    description: "小额信贷自动审批与额度计算模型",
    owner: "Mike Wang",
    createdAt: "2024-08-15T16:20:00Z",
    updatedAt: "2024-10-25T09:45:00Z",
    entityCount: 18,
    ruleCount: 42
  },
  {
    id: "m4",
    name: "VIP会员权益体系",
    version: "v1.0.0",
    status: "Archived",
    description: "旧版VIP会员权益规则，已废弃",
    owner: "Alex Chen",
    createdAt: "2023-12-01T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    entityCount: 8,
    ruleCount: 15
  },
  {
    id: "m5",
    name: "全渠道库存同步",
    version: "v0.5.0",
    status: "Draft",
    description: "线上线下库存实时同步与调拨规则",
    owner: "David Zhang",
    createdAt: "2024-10-20T13:00:00Z",
    updatedAt: "2024-10-27T16:00:00Z",
    entityCount: 10,
    ruleCount: 12
  }
];

// --- Components ---

export default function BusinessModelList() {
  const navigate = useNavigate();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  // Derived Data
  const filteredModels = useMemo(() => {
    return mockModels.filter(model => {
      const matchesSearch = 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        model.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || model.status === statusFilter;
      const matchesOwner = ownerFilter === "all" || model.owner === ownerFilter;

      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [searchQuery, statusFilter, ownerFilter]);

  // Unique Owners for Filter
  const owners = useMemo(() => 
    Array.from(new Set(mockModels.map(m => m.owner))), 
  []);

  // Helper Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
      case 'Draft': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
      case 'Archived': return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      
      {/* 1. Page Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-6 h-6 text-blue-600" />
              业务模型管理
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              管理和维护企业级结构化业务模型，支持版本控制与全生命周期管理
            </p>
          </div>
          <Button onClick={() => navigate('/business-model-editor')} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            新建业务模型
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              placeholder="搜索模型名称、版本或描述..." 
              className="pl-9 bg-white border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="w-3.5 h-3.5" />
                  <SelectValue placeholder="状态" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="Active">已生效 (Active)</SelectItem>
                <SelectItem value="Draft">草稿 (Draft)</SelectItem>
                <SelectItem value="Archived">已归档 (Archived)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[140px] bg-white border-slate-200">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-3.5 h-3.5" />
                  <SelectValue placeholder="负责人" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有负责人</SelectItem>
                {owners.map(owner => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setOwnerFilter("all");
            }} title="重置筛选">
              <RotateCcw className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* List Area */}
        <div className="flex-1 overflow-auto p-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[300px]">模型名称 / 描述</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>统计</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.length > 0 ? (
                  filteredModels.map((model) => (
                    <TableRow 
                      key={model.id} 
                      className="cursor-pointer transition-colors hover:bg-blue-50/50"
                      onClick={() => navigate(`/business-model-editor?id=${model.id}`)}
                    >
                      <TableCell className="align-top py-4">
                        <div className="font-semibold text-slate-800 text-base mb-1">{model.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1" title={model.description}>
                          {model.description}
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Badge variant="outline" className="font-mono text-xs bg-slate-50">
                          {model.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <Badge variant="secondary" className={`border ${getStatusColor(model.status)}`}>
                          {model.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-500">
                          <span title="Entities">{model.entityCount} 实体</span>
                          <span title="Rules">{model.ruleCount} 规则</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {model.owner.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700">{model.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4 text-sm text-slate-500">
                        <div className="flex flex-col">
                          <span>{formatDate(model.updatedAt)}</span>
                          <span className="text-xs text-slate-400">创建于 {formatDate(model.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/business-model-editor?id=${model.id}`)}>
                              <Layout className="w-4 h-4 mr-2" />
                              进入编辑器
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">删除模型</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-10 h-10 text-slate-200 mb-4" />
                        <p>没有找到符合条件的业务模型</p>
                        <Button variant="link" onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setOwnerFilter("all");
                        }}>清除筛选</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}

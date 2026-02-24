import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Settings, 
  Mail, 
  Webhook, 
  Activity, 
  Bot, 
  MoreVertical, 
  Trash2, 
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MOCK_RULES } from './types';
import { toast } from "sonner";
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

const getSourceIcon = (source: string) => {
  switch (source) {
    case 'email': return <Mail className="h-5 w-5" />;
    case 'webhook': return <Webhook className="h-5 w-5" />;
    case 'tracking': return <Activity className="h-5 w-5" />;
    default: return <Settings className="h-5 w-5" />;
  }
};

export default function RuleList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [rules, setRules] = React.useState(MOCK_RULES);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    show: boolean;
    ruleId: string | null;
    ruleName: string | null;
  }>({ show: false, ruleId: null, ruleName: null });

  const filteredRules = rules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (e: React.MouseEvent, ruleId: string, currentStatus: boolean) => {
    e.stopPropagation();
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, isActive: !currentStatus } : r
    ));
    toast.success(currentStatus ? "规则已停用" : "规则已启用");
  };

  const handleDeleteClick = (e: React.MouseEvent, ruleId: string, ruleName: string) => {
    e.stopPropagation();
    setDeleteDialog({ show: true, ruleId, ruleName });
  };

  const confirmDelete = () => {
    if (deleteDialog.ruleId) {
      setRules(prev => prev.filter(r => r.id !== deleteDialog.ruleId));
      toast.success("规则已删除");
      setDeleteDialog({ show: false, ruleId: null, ruleName: null });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">映射与识别规则</h1>
          <p className="text-muted-foreground">
            管理事件识别逻辑，将外部信号转化为业务对象
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索规则名称..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/mapping-rules/new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新增规则
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRules.map((rule) => (
          <Card 
            key={rule.id} 
            className={`relative cursor-pointer hover:shadow-md transition-shadow ${!rule.isActive ? "opacity-60 border-muted" : ""}`}
            onClick={() => navigate(`/mapping-rules/${rule.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {getSourceIcon(rule.eventSource)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate" title={rule.name}>
                      {rule.name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={(checked) => handleToggleActive({ stopPropagation: () => {} } as any, rule.id, !checked)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteClick(e, rule.id, rule.name)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除规则
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">识别类型</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {rule.eventType}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em] border-l-2 border-primary/20 pl-2">
                  {rule.description || "暂无描述"}
                </div>

                <div className="flex items-center justify-between pt-1">
                   <div className="flex items-center gap-1.5">
                      <Bot className={`h-4 w-4 ${rule.triggerAI ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${rule.triggerAI ? "text-primary" : "text-muted-foreground"}`}>
                        {rule.triggerAI ? "AI 决策已启用" : "仅结构化"}
                      </span>
                   </div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {rule.lastMatchedAt ? rule.lastMatchedAt.split(' ')[0] : '从未'}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={deleteDialog.show}
        onOpenChange={(open) => !open && setDeleteDialog({ show: false, ruleId: null, ruleName: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除规则</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除规则 "{deleteDialog.ruleName}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

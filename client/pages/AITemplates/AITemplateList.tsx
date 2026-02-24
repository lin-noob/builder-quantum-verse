
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Settings, 
  Activity, 
  Trash2, 
  MoreVertical,
  Users,
  ShoppingCart,
  MessageSquare,
  Bot
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MOCK_TEMPLATES, AITemplate } from './types';

const getObjectIcon = (type: string) => {
  switch (type) {
    case 'Customer': return <Users className="h-5 w-5" />;
    case 'Order': return <ShoppingCart className="h-5 w-5" />;
    case 'Conversation': return <MessageSquare className="h-5 w-5" />;
    default: return <Settings className="h-5 w-5" />;
  }
};

export default function AITemplateList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<AITemplate[]>(MOCK_TEMPLATES);
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; template: AITemplate | null }>({
    show: false,
    template: null
  });

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !currentStatus } : t
    ));
    toast({
      title: currentStatus ? "模板已停用" : "模板已启用",
      description: "模板状态已更新",
    });
  };

  const handleDeleteClick = (template: AITemplate) => {
    setDeleteDialog({ show: true, template });
  };

  const confirmDelete = () => {
    if (deleteDialog.template) {
      setTemplates(prev => prev.filter(t => t.id !== deleteDialog.template?.id));
      toast({
        title: "删除成功",
        description: `模板 "${deleteDialog.template.name}" 已删除`,
      });
      setDeleteDialog({ show: false, template: null });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">AI 分析模板</h1>
          <p className="text-muted-foreground">
            定义 AI 如何理解和判断一类业务对象
          </p>
        </div>
        <Button onClick={() => navigate('/ai-templates/new')} className="gap-2">
          <Plus className="h-4 w-4" /> 新建模板
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`relative cursor-pointer hover:shadow-md transition-shadow ${!template.isActive ? "opacity-60 border-muted" : ""}`}
            onClick={() => navigate(`/ai-templates/${template.id}`)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {getObjectIcon(template.targetObjectType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate" title={template.name}>
                      {template.name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={template.isActive}
                    onCheckedChange={(checked) => handleToggleStatus(template.id, !checked)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => handleDeleteClick(template)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除模板
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
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">适用对象</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {template.targetObjectType}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground border-l-2 border-primary/20 pl-2">
                  {template.description || "暂无描述"}
                </div>

                <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                  <span className="font-medium text-foreground">分析目标：</span>
                  {template.analysisGoal}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>引用次数: {template.referenceCount}</span>
                   </div>
                   <div>
                      {template.lastUsedAt ? `最近使用: ${template.lastUsedAt}` : '从未'}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialog.show} onOpenChange={(open) => !open && setDeleteDialog({ show: false, template: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除模板?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除模板 "{deleteDialog.template?.name}"。
              如果该模板正在被规则引用，删除可能会导致规则失效。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

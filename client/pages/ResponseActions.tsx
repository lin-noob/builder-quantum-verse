import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import {
  actionsData,
  STATUS_DISPLAY,
  formatNumber
} from "@shared/actionLibraryData";
import { useToast } from "@/hooks/use-toast";

export default function ResponseActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 简单的搜索状态
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤数据 - 只保留基本搜索
  const filteredData = actionsData.filter(action =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理操作
  const handleEdit = (actionId: string) => {
    navigate(`/response-actions/edit/${actionId}`);
  };

  const handleView = (actionId: string) => {
    navigate(`/response-actions/${actionId}`);
  };

  const handleToggleStatus = (actionId: string, currentStatus: string) => {
    const action = actionsData.find(a => a.id === actionId);
    if (!action) return;

    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    const statusText = newStatus === 'active' ? '启用' : '停用';
    
    toast({
      title: `${statusText}成功`,
      description: `动作"${action.name}"已${statusText}`
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">时间响应中心</h1>
        <Button 
          className="bg-sky-600 text-white flex items-center gap-2"
          onClick={() => navigate('/response-actions/create')}
        >
          <Plus className="h-4 w-4" />
          创建新动作
        </Button>
      </div>

      {/* 简单搜索 */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索动作名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-600">
            共 {filteredData.length} 条记录
          </div>
        </div>
      </Card>

      {/* 动作列表 */}
      <div className="space-y-4">
        {filteredData.map((action) => (
          <Card key={action.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              {/* 左侧信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{action.name}</h3>
                  <Badge
                    variant={STATUS_DISPLAY[action.status].color === 'green' ? 'default' : 'secondary'}
                    className={STATUS_DISPLAY[action.status].color === 'green' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {STATUS_DISPLAY[action.status].text}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{action.purpose}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>执行次数: <span className="font-medium text-gray-900">{formatNumber(action.totalExecutions)}</span></span>
                  <span>转化数: <span className="font-medium text-gray-900">{formatNumber(action.conversions)}</span></span>
                  <span>更新时间: <span className="font-medium text-gray-900">{action.lastUpdated}</span></span>
                </div>
              </div>

              {/* 右侧操作按钮 */}
              <div className="flex items-center gap-2 ml-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(action.id)}
                >
                  查看详情
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(action.id)}
                >
                  编辑
                </Button>
                {action.status !== 'archived' && (
                  <Button
                    variant={action.status === 'active' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleToggleStatus(action.id, action.status)}
                  >
                    {action.status === 'active' ? '停用' : '启用'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 空状态 */}
      {filteredData.length === 0 && (
        <Card className="bg-white p-12 rounded-lg shadow-sm text-center">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的动作</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? '尝试调整搜索条件' : '还没有创建任何响应动作'}
          </p>
          <Button 
            className="bg-sky-600 text-white"
            onClick={() => navigate('/response-actions/create')}
          >
            创建第一个动作
          </Button>
        </Card>
      )}
    </div>
  );
}
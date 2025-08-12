import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Edit, TrendingUp, MessageSquare, MoreHorizontal, HelpCircle } from "lucide-react";
import { 
  actionsData, 
  ActionData, 
  ActionStatus, 
  MonitoringScope, 
  STATUS_DISPLAY, 
  MONITORING_SCOPE_DISPLAY,
  formatNumber,
  calculateConversionRate,
  COMMON_PURPOSES
} from "@shared/actionLibraryData";
import { useToast } from "@/hooks/use-toast";

// 视图类型
type ViewType = 'list' | 'detail' | 'edit';

// 筛选状态接口
interface FilterState {
  search: string;
  monitoringScope: string;
  status: string;
}

export default function ResponseActions() {
  const { toast } = useToast();
  
  // 当前视图状态
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    monitoringScope: 'all',
    status: 'all'
  });
  
  // 表单数据状态
  const [formData, setFormData] = useState<Partial<ActionData>>({
    name: '',
    monitoringScope: 'real_time_event',
    purpose: '',
    popup: {
      title: '',
      content: '',
      buttonText: '',
      buttonLink: ''
    }
  });
  
  // 下拉菜单状态
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // 过滤后的数据
  const filteredActions = useMemo(() => {
    return actionsData.filter(action => {
      const matchesSearch = filters.search === '' || 
        action.name.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesScope = filters.monitoringScope === 'all' || 
        action.monitoringScope === filters.monitoringScope;
      
      const matchesStatus = filters.status === 'all' || 
        action.status === filters.status;
      
      return matchesSearch && matchesScope && matchesStatus;
    });
  }, [filters]);

  // 获取当前选中的动作数据
  const selectedAction = selectedActionId 
    ? actionsData.find(action => action.id === selectedActionId) 
    : null;

  // 视图切换函数
  const switchView = (view: ViewType, actionId?: string) => {
    setCurrentView(view);
    if (actionId) {
      setSelectedActionId(actionId);
    }
    if (view === 'edit' && actionId) {
      const action = actionsData.find(a => a.id === actionId);
      if (action) {
        setFormData(action);
        setIsCreating(false);
      }
    } else if (view === 'edit' && !actionId) {
      // 创建新动作
      setFormData({
        name: '',
        monitoringScope: 'real_time_event',
        purpose: '',
        popup: {
          title: '',
          content: '',
          buttonText: '',
          buttonLink: ''
        }
      });
      setIsCreating(true);
    }
  };

  // 显示列表视图
  const showListView = () => switchView('list');
  
  // 显示详情视图
  const showDetailView = (actionId: string) => switchView('detail', actionId);
  
  // 显示编辑视图
  const showEditView = (actionId?: string) => switchView('edit', actionId);

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      search: '',
      monitoringScope: 'all',
      status: 'all'
    });
  };

  // 查询函数（刷新数据）
  const renderActionList = () => {
    // 筛选逻辑已在 useMemo 中处理，这里可以添加刷新逻辑
    toast({
      title: "数据已刷新",
      description: `找到 ${filteredActions.length} 条动作记录`
    });
  };

  // 处理操作按钮点击
  const handleActionOperation = (actionId: string, operation: string) => {
    const action = actionsData.find(a => a.id === actionId);
    if (!action) return;

    switch (operation) {
      case 'enable':
        toast({
          title: "启用成功",
          description: `动作"${action.name}"已启用`
        });
        break;
      case 'disable':
        toast({
          title: "停用成功", 
          description: `动作"${action.name}"已停用`
        });
        break;
      case 'delete':
        toast({
          title: "删除成功",
          description: `动作"${action.name}"已删除`
        });
        break;
    }
    setDropdownOpen(null);
  };

  // 保存表单
  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "请填写动作名称",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isCreating ? "创建成功" : "保存成功",
      description: `动作"${formData.name}"已保存`
    });
    
    showListView();
  };

  // 渲染列表视图
  const renderListView = () => (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 筛选区 */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="md:col-span-2">
            <Input
              placeholder="搜索动作名称..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          
          {/* 监控范围筛选 */}
          <div>
            <Select 
              value={filters.monitoringScope} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, monitoringScope: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有监控范围</SelectItem>
                <SelectItem value="real_time_event">实时事件</SelectItem>
                <SelectItem value="user_mode">用户模式</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* 状态筛选 */}
          <div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 操作按钮区 */}
        <div className="flex justify-end mt-4 gap-2">
          <Button 
            variant="outline"
            className="bg-slate-200 text-slate-700"
            onClick={resetFilters}
          >
            重置
          </Button>
          <Button 
            className="bg-sky-600 text-white"
            onClick={renderActionList}
          >
            查询
          </Button>
        </div>
      </Card>

      {/* 主操作区 */}
      <div className="mb-4">
        <Button 
          className="bg-sky-600 text-white flex items-center gap-2"
          onClick={() => showEditView()}
        >
          <Plus className="h-4 w-4" />
          创建新动作
        </Button>
      </div>

      {/* 数据表格 */}
      <Card className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">动作名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">响应动作用途</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">总执行次数</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">转化数</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">最后更新</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody id="action-list-body" className="divide-y divide-gray-200">
            {filteredActions.map((action) => (
              <tr key={action.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{action.name}</td>
                <td className="px-6 py-4">
                  <Badge 
                    variant={STATUS_DISPLAY[action.status].color === 'green' ? 'default' : 'secondary'}
                    className={STATUS_DISPLAY[action.status].color === 'green' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {STATUS_DISPLAY[action.status].text}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{action.purpose}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(action.totalExecutions)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(action.conversions)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{action.lastUpdated}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-sky-600 hover:underline"
                      onClick={() => showDetailView(action.id)}
                    >
                      详情
                    </button>
                    <button 
                      className="text-sky-600 hover:underline"
                      onClick={() => showEditView(action.id)}
                    >
                      编辑
                    </button>
                    <div className="relative">
                      <button 
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => setDropdownOpen(dropdownOpen === action.id ? null : action.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {dropdownOpen === action.id && (
                        <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                          {action.status === 'active' && (
                            <button
                              className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleActionOperation(action.id, 'disable')}
                            >
                              停用
                            </button>
                          )}
                          {action.status === 'draft' && (
                            <>
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleActionOperation(action.id, 'enable')}
                              >
                                启用
                              </button>
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
                                onClick={() => handleActionOperation(action.id, 'delete')}
                              >
                                删除
                              </button>
                            </>
                          )}
                          {action.status === 'archived' && (
                            <button
                              className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => handleActionOperation(action.id, 'delete')}
                            >
                              删除
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredActions.length > 0 && (
          <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
            共 {filteredActions.length} 条记录
            {filters.search || filters.monitoringScope !== 'all' || filters.status !== 'all'
              ? ` (已筛选，共 ${actionsData.length} 条)`
              : ''
            }
          </div>
        )}
      </Card>
    </div>
  );

  // 渲染详情视图
  const renderDetailView = () => {
    if (!selectedAction) return null;

    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-full">
        {/* 基本信息卡片 */}
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-600">规则ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedAction.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">响应动作类型</dt>
                <dd className="mt-1 text-sm text-gray-900">网页弹窗</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">创建时间</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedAction.createdAt}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">更新时间</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedAction.lastUpdated}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">触发器类型</dt>
                <dd className="mt-1 text-sm text-gray-900">{MONITORING_SCOPE_DISPLAY[selectedAction.monitoringScope]}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600">响应动作用途</dt>
                <dd className="mt-1 text-sm text-gray-900">{selectedAction.purpose}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* 效果统计卡片 */}
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              效果统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="detail-kpis" className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(selectedAction.totalExecutions)}
                </div>
                <div className="text-sm text-blue-600">累计执行次数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(selectedAction.interactions)}
                </div>
                <div className="text-sm text-green-600">累计互动次数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(selectedAction.conversions)}
                </div>
                <div className="text-sm text-purple-600">累计转化数</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {calculateConversionRate(selectedAction.conversions, selectedAction.interactions)}
                </div>
                <div className="text-sm text-orange-600">转化率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 响应动作配置卡片 */}
        <Card className="bg-white rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>响应动作配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                网页弹窗
              </h4>
              <dl className="space-y-3 ml-6">
                <div>
                  <dt className="text-sm font-medium text-gray-600">标题：</dt>
                  <dd className="text-sm text-gray-900">{selectedAction.popup.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">内容：</dt>
                  <dd className="text-sm text-gray-900">{selectedAction.popup.content}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">按钮文字：</dt>
                  <dd className="text-sm text-gray-900">{selectedAction.popup.buttonText}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-600">按钮链接：</dt>
                  <dd className="text-sm text-gray-900">{selectedAction.popup.buttonLink}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染编辑视图
  const renderEditView = () => (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full max-w-4xl mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={showListView}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 id="edit-view-title-main" className="text-2xl font-bold text-gray-900">
          {isCreating ? '创建新AI动作' : '编辑AI动作'}
        </h1>
      </div>

      {/* 动作名称卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="pt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">动作名称</label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="请输入动作名称"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI 监控范围卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">AI 监控范围</label>
            <HelpCircle className="h-4 w-4 text-gray-400" title="选择何时触发此动作" />
          </div>
          <Select
            value={formData.monitoringScope}
            onValueChange={(value) => setFormData(prev => ({ ...prev, monitoringScope: value as MonitoringScope }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="real_time_event">实时事件</SelectItem>
              <SelectItem value="user_mode">用户模式</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 响应动作用途卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">响应动作用途</label>
            <p className="text-sm text-gray-600 mb-2">描述此动作的具体用途和触发场景</p>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={3}
              value={formData.purpose || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="请描述动作用途..."
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">常用用途建议</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_PURPOSES.map((purpose, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, purpose }))}
                  className="text-sm"
                >
                  {purpose}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 弹窗内容卡片 */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>弹窗内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">弹窗标题</label>
            <Input
              value={formData.popup?.title || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, title: e.target.value }
              }))}
              placeholder="请输入弹窗标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">弹窗正文</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={4}
              value={formData.popup?.content || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, content: e.target.value }
              }))}
              placeholder="请输入弹窗内容"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">按钮文字</label>
            <Input
              value={formData.popup?.buttonText || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, buttonText: e.target.value }
              }))}
              placeholder="请输入按钮文字"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">按钮链接 (URL)</label>
            <Input
              value={formData.popup?.buttonLink || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                popup: { ...prev.popup!, buttonLink: e.target.value }
              }))}
              placeholder="请输入按钮链接"
            />
          </div>
        </CardContent>
      </Card>

      {/* 页面底部操作栏 */}
      <div className="flex justify-end">
        <Button 
          className="bg-sky-600 text-white"
          onClick={handleSave}
        >
          保存
        </Button>
      </div>
    </div>
  );

  // 根据当前视图渲染对应内容
  return (
    <div>
      {currentView === 'list' && renderListView()}
      {currentView === 'detail' && renderDetailView()}
      {currentView === 'edit' && renderEditView()}
      
      {/* 点击外部关闭下拉菜单 */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
}

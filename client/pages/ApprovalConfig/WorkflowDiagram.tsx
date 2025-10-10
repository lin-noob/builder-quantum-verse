import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowDown,
  User,
  Settings,
  Eye,
  Edit,
  Info
} from 'lucide-react';
import { ApprovalWorkflow, ApprovalNode, ApprovalNodeType } from '@/types/approval';

interface WorkflowDiagramProps {
  workflow: ApprovalWorkflow;
  className?: string;
  interactive?: boolean;
  highlightedNodeId?: string;
  onNodeClick?: (node: ApprovalNode) => void;
  onNodeHover?: (node: ApprovalNode | null) => void;
}

interface NodeDetailDialogProps {
  node: ApprovalNode | null;
  isOpen: boolean;
  onClose: () => void;
}

// 获取节点类型标签
const getNodeTypeLabel = (type: ApprovalNodeType): string => {
  switch (type) {
    case ApprovalNodeType.SINGLE:
      return '单人审批';
    case ApprovalNodeType.MULTIPLE:
      return '多人审批';
    case ApprovalNodeType.ANY:
      return '任一审批';
    case ApprovalNodeType.SEQUENTIAL:
      return '顺序审批';
    default:
      return '未知类型';
  }
};

// 获取节点类型图标
const getNodeTypeIcon = (type: ApprovalNodeType) => {
  switch (type) {
    case ApprovalNodeType.SINGLE:
      return <User className="h-4 w-4" />;
    case ApprovalNodeType.MULTIPLE:
      return <Users className="h-4 w-4" />;
    case ApprovalNodeType.ANY:
      return <CheckCircle className="h-4 w-4" />;
    case ApprovalNodeType.SEQUENTIAL:
      return <Settings className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

// 获取节点类型颜色
const getNodeTypeColor = (type: ApprovalNodeType): string => {
  switch (type) {
    case ApprovalNodeType.SINGLE:
      return 'bg-blue-500 hover:bg-blue-600';
    case ApprovalNodeType.MULTIPLE:
      return 'bg-green-500 hover:bg-green-600';
    case ApprovalNodeType.ANY:
      return 'bg-orange-500 hover:bg-orange-600';
    case ApprovalNodeType.SEQUENTIAL:
      return 'bg-purple-500 hover:bg-purple-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

// 节点详情对话框
const NodeDetailDialog: React.FC<NodeDetailDialogProps> = ({ node, isOpen, onClose }) => {
  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getNodeTypeIcon(node.type)}
            {node.name}
            <Badge variant="secondary">{getNodeTypeLabel(node.type)}</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-3">
            <h4 className="font-semibold">基本信息</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">节点类型：</span>
                <span className="font-medium">{getNodeTypeLabel(node.type)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">审批时限：</span>
                <span className="font-medium">{node.timeLimit} 小时</span>
              </div>
              <div>
                <span className="text-muted-foreground">是否必须：</span>
                <Badge variant={node.isRequired ? "destructive" : "secondary"}>
                  {node.isRequired ? "必须" : "可选"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">审批人数：</span>
                <span className="font-medium">{node.approvers.length} 人</span>
              </div>
            </div>
            {node.description && (
              <div>
                <span className="text-muted-foreground">描述：</span>
                <p className="text-sm mt-1">{node.description}</p>
              </div>
            )}
          </div>

          {/* 审批人员 */}
          <div className="space-y-3">
            <h4 className="font-semibold">审批人员</h4>
            <div className="grid grid-cols-1 gap-2">
              {node.approvers.map((approver: any, index: number) => (
                <div key={approver.userId || approver.id || index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {(approver.userName || approver.name || '?').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{approver.userName || approver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {approver.userRole || approver.role} - {approver.userDepartment || approver.department}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 审批条件 */}
          {node.conditions && node.conditions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">审批条件</h4>
              <div className="space-y-2">
                {node.conditions.map((condition: any, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    {condition.type === 'amount' && `金额 ${condition.operator} ${condition.value}`}
                    {condition.type === 'department' && `部门: ${condition.value}`}
                    {condition.type === 'role' && `角色: ${condition.value}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// 流程图节点组件
const WorkflowNode: React.FC<{
  node: ApprovalNode;
  index: number;
  isHighlighted?: boolean;
  isHovered?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ node, index, isHighlighted, isHovered, onClick, onMouseEnter, onMouseLeave }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isHighlighted) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={`
              w-64 cursor-pointer transition-all duration-300 
              ${isHovered ? 'shadow-xl scale-110 z-10' : 'hover:shadow-lg hover:scale-105'}
              ${isHighlighted ? 'ring-2 ring-primary ring-offset-2' : ''}
              ${isAnimating ? 'animate-pulse' : ''}
              relative
            `}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* 节点头部 */}
                <div className="flex items-center justify-between">
                  <div className={`
                    w-8 h-8 rounded-full ${getNodeTypeColor(node.type)} text-white 
                    flex items-center justify-center text-sm font-bold
                    transition-all duration-300
                    ${isHovered ? 'scale-110' : ''}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getNodeTypeLabel(node.type)}
                    </Badge>
                    {isHovered && (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">查看详情</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 节点名称 */}
                <div>
                  <h4 className="font-semibold text-sm truncate">{node.name}</h4>
                  {node.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {node.description}
                    </p>
                  )}
                </div>

                {/* 节点信息 */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{node.approvers.length}人</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{node.timeLimit}h</span>
                  </div>
                  {node.isRequired && (
                    <Badge variant="destructive" className="text-xs px-1 py-0">
                      必须
                    </Badge>
                  )}
                </div>

                {/* 审批人头像 */}
                <div className="flex -space-x-2">
                  {node.approvers.slice(0, 3).map((approver: any, idx: number) => (
                    <div
                      key={approver.userId || approver.id || idx}
                      className={`
                        w-6 h-6 rounded-full bg-primary text-primary-foreground 
                        flex items-center justify-center text-xs font-medium 
                        border-2 border-white transition-transform duration-200
                        ${isHovered ? 'scale-110' : ''}
                      `}
                    >
                      {(approver.userName || approver.name || '?').charAt(0)}
                    </div>
                  ))}
                  {node.approvers.length > 3 && (
                    <div className={`
                      w-6 h-6 rounded-full bg-muted text-muted-foreground 
                      flex items-center justify-center text-xs font-medium 
                      border-2 border-white transition-transform duration-200
                      ${isHovered ? 'scale-110' : ''}
                    `}>
                      +{node.approvers.length - 3}
                    </div>
                  )}
                </div>

                {/* 悬停时显示的额外信息 */}
                {isHovered && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 animate-bounce">
                    <Info className="h-3 w-3" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{node.name}</p>
            <p className="text-xs">{getNodeTypeLabel(node.type)}</p>
            <div className="flex items-center gap-4 text-xs">
              <span>👥 {node.approvers.length}人</span>
              <span>⏱️ {node.timeLimit}小时</span>
            </div>
            {node.conditions && node.conditions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                📋 {node.conditions.length}个审批条件
              </p>
            )}
            <p className="text-xs text-muted-foreground">点击查看详细信息</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// 连接线组件
const ConnectionLine: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <div className="flex flex-col items-center py-4">
      <div className={`w-0.5 h-8 transition-colors duration-300 ${isActive ? 'bg-primary' : 'bg-border'}`}></div>
      <ArrowDown className={`h-4 w-4 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      <div className={`w-0.5 h-8 transition-colors duration-300 ${isActive ? 'bg-primary' : 'bg-border'}`}></div>
    </div>
  );
};

// 主组件
export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ 
  workflow, 
  className = "",
  interactive = true,
  highlightedNodeId,
  onNodeClick,
  onNodeHover
}) => {
  const [selectedNode, setSelectedNode] = useState<ApprovalNode | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeConnectionIndex, setActiveConnectionIndex] = useState<number | null>(null);

  const handleNodeClick = (node: ApprovalNode) => {
    setSelectedNode(node);
    setIsDetailDialogOpen(true);
    onNodeClick?.(node);
  };

  const handleNodeHover = (node: ApprovalNode | null) => {
    setHoveredNodeId(node?.id || null);
    onNodeHover?.(node);
    
    if (node) {
      const nodeIndex = workflow.nodes.findIndex(n => n.id === node.id);
      setActiveConnectionIndex(nodeIndex);
    } else {
      setActiveConnectionIndex(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedNode(null);
  };

  if (!workflow.nodes || workflow.nodes.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>暂无审批节点</p>
          <p className="text-sm mt-2">请先配置审批流程节点</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 流程图头部 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          开始
        </div>
      </div>

      {/* 流程节点 */}
      <div className="flex flex-col items-center space-y-0">
        {workflow.nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            {index > 0 && (
              <ConnectionLine 
                isActive={activeConnectionIndex !== null && index <= activeConnectionIndex}
              />
            )}
            <WorkflowNode
              node={node}
              index={index}
              isHighlighted={highlightedNodeId === node.id}
              isHovered={hoveredNodeId === node.id}
              onClick={() => interactive && handleNodeClick(node)}
              onMouseEnter={() => interactive && handleNodeHover(node)}
              onMouseLeave={() => interactive && handleNodeHover(null)}
            />
          </React.Fragment>
        ))}
      </div>

      {/* 流程图尾部 */}
      <div className="text-center">
        <ConnectionLine 
          isActive={activeConnectionIndex !== null && activeConnectionIndex >= workflow.nodes.length - 1}
        />
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          结束
        </div>
      </div>

      {/* 交互提示 */}
      {interactive && (
        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>💡 悬停查看节点信息，点击查看详细配置</p>
        </div>
      )}

      {/* 节点详情对话框 */}
      <NodeDetailDialog
        node={selectedNode}
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default WorkflowDiagram;
import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeSelectProps {
  data: TreeNode[];
  value?: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  level,
  selectedValue,
  onSelect,
  expandedNodes,
  onToggleExpand,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedValue === node.id;

  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex items-center cursor-pointer px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="p-1 hover:bg-gray-200 rounded mr-2"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="w-5 mr-2" />
        )}
        <span className="flex-1">{node.label}</span>
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedValue={selectedValue}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeSelect: React.FC<TreeSelectProps> = ({
  data,
  value,
  onValueChange,
  placeholder = "请选择...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 当选中值变化时，自动展开到选中节点的路径
  useEffect(() => {
    if (value && data.length > 0) {
      const expandToNode = (nodes: TreeNode[], targetId: string, currentPath: string[] = []): boolean => {
        for (const node of nodes) {
          const newPath = [...currentPath, node.id];
          
          if (node.id === targetId) {
            // 找到目标节点，展开路径上的所有父节点
            setExpandedNodes(prev => {
              const newExpanded = new Set(prev);
              currentPath.forEach(id => newExpanded.add(id));
              return newExpanded;
            });
            return true;
          }
          
          if (node.children && node.children.length > 0) {
            const found = expandToNode(node.children, targetId, newPath);
            if (found) return true;
          }
        }
        return false;
      };
      
      expandToNode(data, value);
    }
  }, [value, data]);

  const selectedNode = value ? findNodeById(data, value) : null;
  
  // 添加调试信息
  useEffect(() => {
    if (value !== null && value !== undefined) {
      console.log('TreeSelect - Current state:', {
        value,
        valueType: typeof value,
        dataLength: data.length,
        selectedNode,
        expandedNodes: Array.from(expandedNodes)
      });
    }
  }, [value, data, selectedNode, expandedNodes]);

  const handleSelect = (nodeId: string) => {
    onValueChange(nodeId);
    setOpen(false);
  };

  const handleToggleExpand = (nodeId: string) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const handleClear = () => {
    onValueChange(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedNode ? selectedNode.label : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <div className="flex flex-col">
          {/* 固定的清除按钮 */}
          <div className="p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full text-sm text-muted-foreground hover:text-foreground"
            >
              清除选择
            </Button>
          </div>

          {/* 滚动区域 */}
          <div 
            className="h-[300px] overflow-y-auto border-gray-200"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
            onWheel={(e) => {
              // 确保滚轮事件不被阻止
              e.stopPropagation();
            }}
          >
            <div className="p-1">
              {data.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  没有找到数据
                </div>
              ) : (
                data.map((node) => (
                  <TreeItem
                    key={node.id}
                    node={node}
                    level={0}
                    selectedValue={value}
                    onSelect={handleSelect}
                    expandedNodes={expandedNodes}
                    onToggleExpand={handleToggleExpand}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TreeSelect;
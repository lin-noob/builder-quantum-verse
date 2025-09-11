import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { request } from '@/lib/request';

interface MenuItem {
  id: number;
  name: string;
  icon?: string;
  parentId?: number | null;
  sort: number;
  visible: boolean;
  component?: string;
  children?: MenuItem[];
}

interface CheckableTreeMenuProps {
  selectedItems: number[];
  onSelectionChange: (selectedItems: number[]) => void;
  className?: string;
  onFocusItem?: (id: number) => void;
}

interface TreeItemProps {
  item: MenuItem;
  level: number;
  expandedItems: Set<number>;
  selectedItems: number[];
  onToggle: (id: number) => void;
  onSelectionChange: (selectedItems: number[]) => void;
  onFocusItem?: (id: number) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  expandedItems,
  selectedItems,
  onToggle,
  onSelectionChange,
  onFocusItem,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  
  // 检查当前节点是否被选中
  const isSelected = selectedItems.includes(item.id);
  
  // 检查子节点选中情况
  const getChildSelectionState = () => {
    if (!hasChildren) return { allSelected: false, someSelected: false, hasSelected: false };
    
    const childIds = getAllChildIds(item);
    const selectedChildCount = childIds.filter(id => selectedItems.includes(id)).length;
    
    return {
      allSelected: selectedChildCount > 0 && selectedChildCount === childIds.length,
      someSelected: selectedChildCount > 0 && selectedChildCount < childIds.length,
      hasSelected: selectedChildCount > 0
    };
  };
  
  // 获取所有子节点ID
  const getAllChildIds = (menuItem: MenuItem): number[] => {
    let ids: number[] = [];
    if (menuItem.children) {
      menuItem.children.forEach(child => {
        ids.push(child.id);
        ids = ids.concat(getAllChildIds(child));
      });
    }
    console.log(`getAllChildIds for ${menuItem.name} (${menuItem.id}):`, ids);
    return ids;
  };
  
  const { allSelected: childrenAllSelected, someSelected: childrenSomeSelected, hasSelected: childrenHasSelected } = getChildSelectionState();
  
  // 处理选择变化
  const handleSelectionChange = (checked: boolean) => {
    let newSelection = [...selectedItems];
    
    console.log('handleSelectionChange', {
      itemId: item.id,
      itemName: item.name,
      checked,
      currentSelection: selectedItems,
      isSelected,
      hasChildren,
      childrenAllSelected,
      childrenSomeSelected,
      childrenHasSelected
    });
    
    if (checked) {
      // 勾选操作：选中当前节点和所有子节点
      if (!newSelection.includes(item.id)) {
        newSelection.push(item.id);
      }
      
      // 选中所有子节点
      if (hasChildren) {
        const childIds = getAllChildIds(item);
        childIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
      }
    } else {
      // 取消勾选操作：取消选中当前节点和所有子节点
      console.log('Before removing current item:', newSelection);
      newSelection = newSelection.filter(id => id !== item.id);
      console.log('After removing current item:', newSelection);
      
      // 取消选中所有子节点
      if (hasChildren) {
        const childIds = getAllChildIds(item);
        console.log('Removing child IDs:', childIds);
        console.log('Child IDs types:', childIds.map(id => typeof id));
        console.log('Current selection types:', newSelection.map(id => typeof id));
        const beforeChildFilter = [...newSelection];
        newSelection = newSelection.filter(id => !childIds.includes(id));
        console.log('Before child filter:', beforeChildFilter);
        console.log('After child filter:', newSelection);
        console.log('Items that were supposed to be removed:', beforeChildFilter.filter(id => childIds.includes(id)));
      }
    }
    
    console.log('newSelection before onSelectionChange:', newSelection);
    onSelectionChange(newSelection);
  };
  
  return (
    <>
      <div 
        className="flex items-center py-2 hover:bg-gray-50 rounded-sm cursor-pointer"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => onToggle(item.id)}
            className="p-1 hover:bg-gray-200 rounded mr-2"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-6 mr-2" />}
        
        <Checkbox
          checked={isSelected || (hasChildren && childrenAllSelected)}
          onCheckedChange={handleSelectionChange}
          className={cn(
            "mr-3",
            childrenSomeSelected && !isSelected && !childrenAllSelected && "data-[state=unchecked]:bg-blue-100"
          )}
        />
        
        <div className="flex items-center gap-2 flex-1" onClick={() => onFocusItem && onFocusItem(item.id)}>
          <span className="text-sm font-medium text-gray-900">
            {item.name}
          </span>
          {childrenSomeSelected && !isSelected && !childrenAllSelected && (
            <span className="text-xs text-blue-600">(部分选中)</span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && item.children?.map((child) => (
        <TreeItem
          key={child.id}
          item={child}
          level={level + 1}
          expandedItems={expandedItems}
          selectedItems={selectedItems}
          onToggle={onToggle}
          onSelectionChange={onSelectionChange}
          onFocusItem={onFocusItem}
        />
      ))}
    </>
  );
};

const CheckableTreeMenu: React.FC<CheckableTreeMenuProps> = ({
  selectedItems,
  onSelectionChange,
  className,
  onFocusItem,
}) => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await request.get('/admin/api/v1/menus/companytree');
      setMenuData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (items: MenuItem[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(menuData);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const selectAll = () => {
    const allIds: number[] = [];
    const collectIds = (items: MenuItem[]) => {
      items.forEach(item => {
        allIds.push(item.id);
        if (item.children) {
          collectIds(item.children);
        }
      });
    };
    collectIds(menuData);
    onSelectionChange(allIds);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载菜单数据中...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={expandAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            全部展开
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            全部收起
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={selectAll}
            className="text-xs text-green-600 hover:text-green-800"
          >
            全选
          </button>
          <span className="text-xs text-gray-400">|</span>
          <button
            onClick={clearSelection}
            className="text-xs text-red-600 hover:text-red-800"
          >
            清空
          </button>
        </div>
      </div>

      {/* 树形菜单 */}
      <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
        {menuData.length > 0 ? (
          <div>
            {menuData.map((item) => (
              <TreeItem
                key={item.id}
                item={item}
                level={0}
                expandedItems={expandedItems}
                selectedItems={selectedItems}
                onToggle={toggleExpanded}
                onSelectionChange={onSelectionChange}
                onFocusItem={onFocusItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            暂无菜单数��
          </div>
        )}
      </div>

      {/* 选中统计 */}
      <div className="text-sm text-gray-500">
        已选中 {selectedItems.length} 个菜单项
      </div>
    </div>
  );
};

export default CheckableTreeMenu;

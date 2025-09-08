import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Menu, Folder, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import AddMenuDialog from './AddMenuDialog';
import EditMenuDialog from './EditMenuDialog';
import { useToast } from "@/components/ui/use-toast";
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

interface MenuRowProps {
  item: MenuItem;
  level: number;
  expandedItems: Set<number>;
  onToggle: (id: number) => void;
  onDelete: (item: MenuItem) => void;
  onMenuUpdated: () => void;
}

// 图标渲染组件
const IconRenderer: React.FC<{ iconName?: string; isDirectory: boolean }> = ({ iconName, isDirectory }) => {
  // 如果有指定的图标名称，尝试从 lucide-react 中获取
  if (iconName) {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className="h-4 w-4 text-gray-600" />;
    }
  }
  
  // 默认图标
  return isDirectory ? (
    <Folder className="h-4 w-4 text-blue-500" />
  ) : (
    <Menu className="h-4 w-4 text-green-500" />
  );
};

const MenuRow: React.FC<MenuRowProps> = ({ item, level, expandedItems, onToggle, onDelete, onMenuUpdated }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isDirectory = !item.component;
  
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
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
            ) : (
              <div className="w-6 mr-2" />
            )}
            
            <div className="flex items-center gap-2">
              <IconRenderer iconName={item.icon} isDirectory={isDirectory} />
              
              <span className="text-sm font-medium text-gray-900">
                {item.name}
              </span>
            </div>
          </div>
        </td>
        
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
          {item.id}
        </td>
        
        <td className="px-6 py-3 whitespace-nowrap">
          <Badge variant={isDirectory ? "secondary" : "default"}>
            {isDirectory ? "目录" : "菜单"}
          </Badge>
        </td>
        
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
          {item.component || "-"}
        </td>
        
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
          {item.sort}
        </td>
        
        <td className="px-6 py-3 whitespace-nowrap">
          <Badge variant={item.visible ? "default" : "secondary"}>
            {item.visible ? "显示" : "隐藏"}
          </Badge>
        </td>
        
        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <EditMenuDialog menuId={item.id} onMenuUpdated={onMenuUpdated} />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </td>
      </tr>
      
      {hasChildren && isExpanded && item.children?.map((child) => (
        <MenuRow
          key={child.id}
          item={child}
          level={level + 1}
          expandedItems={expandedItems}
          onToggle={onToggle}
          onDelete={onDelete}
          onMenuUpdated={onMenuUpdated}
        />
      ))}
    </>
  );
};

const MenuManagementComponent: React.FC = () => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setMenuData(response.data.data);
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

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const menuName = itemToDelete.name; // 保存菜单名称用于提示

    try {
      setDeleting(true);
      await request.delete(`/admin/api/v1/menus/${itemToDelete.id}`);
      
      // 删除成功后刷新数据
      await fetchMenuData();
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      // 显示成功提示
      toast({
        title: "删除成功",
        description: `菜单 "${menuName}" 已成功删除`,
      });
    } catch (error) {
      console.error('Failed to delete menu:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button onClick={expandAll} variant="outline" size="sm">
            全部展开
          </Button>
          <Button onClick={collapseAll} variant="outline" size="sm">
            全部收起
          </Button>
        </div>
        <AddMenuDialog onMenuAdded={fetchMenuData} />
      </div>

      {/* 树形表格 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                菜单名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                路由
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                排序
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menuData.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                level={0}
                expandedItems={expandedItems}
                onToggle={toggleExpanded}
                onDelete={handleDeleteClick}
                onMenuUpdated={fetchMenuData}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除菜单 "{itemToDelete?.name}" 吗？
              {itemToDelete?.children && itemToDelete.children.length > 0 && (
                <span className="text-red-600 block mt-2">
                  注意：该菜单包含子菜单，删除后所有子菜单也将被删除！
                </span>
              )}
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagementComponent;
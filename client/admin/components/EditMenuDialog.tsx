import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import TreeSelect from './TreeSelect';
import IconPicker from './IconPicker';
import { request } from 'D:/program/builder-quantum-verse/client/lib/request.ts';
import { useToast } from "@/components/ui/use-toast";

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface MenuFormData {
  parentId: string | null;
  name: string;
  type: 'MENU' | 'CATALOG';
  icon: string;
  visible: boolean;
  sort: number;
  path?: string;
  component?: string;
}

interface EditMenuDialogProps {
  menuId: number;
  onMenuUpdated?: () => void;
}

const EditMenuDialog: React.FC<EditMenuDialogProps> = ({ menuId, onMenuUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const { toast } = useToast();
  const [formData, setFormData] = useState<MenuFormData>({
    parentId: null,
    name: '',
    type: 'CATALOG',
    icon: '',
    visible: true,
    sort: 1,
    path: '',
    component: '',
  });

  // 获取树形选择数据
  const fetchTreeData = async () => {
    try {
      const response = await request.get('/admin/api/v1/menus/tree-select');
      setTreeData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tree data:', error);
    }
  };

  // 获取菜单详情
  const fetchMenuDetails = async () => {
    try {
      setLoadingDetails(true);
      const response = await request.get(`/admin/api/v1/menus/${menuId}`);
      const menuData = response.data.data;
      
      // 根据是否有 component 判断类型
      const menuType = menuData.component ? 'MENU' : 'CATALOG';
      
      const processedParentId = menuData.parentId === "0" || menuData.parentId === 0 ? null : menuData.parentId;
      
      console.log('EditMenuDialog - Menu data loaded:', {
        rawParentId: menuData.parentId,
        processedParentId,
        menuType,
        menuData
      });
      
      setFormData({
        parentId: processedParentId,
        name: menuData.name || '',
        type: menuType,
        icon: menuData.icon || '',
        visible: menuData.visible === 1,
        sort: menuData.sort || 1,
        path: menuData.path || '',
        component: menuData.component || '',
      });
    } catch (error) {
      console.error('Failed to fetch menu details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // 打开对话框时获取数据
  useEffect(() => {
    if (open) {
      // 先获取树形数据，然后获取菜单详情
      const loadData = async () => {
        await fetchTreeData();
        await fetchMenuDetails();
      };
      loadData();
    }
  }, [open, menuId]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submitData = {
        id:menuId,
        name: formData.name,
        parentId: formData.parentId === null ? "0" : formData.parentId.toString(),
        icon: formData.icon,
        visible: formData.visible ? 1 : 0,
        sort: formData.sort,
        component: formData.type === 'MENU' ? formData.component : '',
        ...(formData.type === 'MENU' && formData.path && {
          path: formData.path,
        })
      };

      await request.put(`/admin/api/v1/menus/${menuId}`, submitData);
      
      setOpen(false);
      
      // 显示成功提示
      toast({
        title: "编辑成功",
        description: `菜单 "${formData.name}" 已成功更新`,
      });
      
      if (onMenuUpdated) {
        onMenuUpdated();
      }
    } catch (error) {
      console.error('Failed to update menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          编辑
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑菜单</DialogTitle>
          <DialogDescription>
            修改菜单项或目录信息
          </DialogDescription>
        </DialogHeader>
        
        {loadingDetails ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-sm text-muted-foreground">加载菜单详情...</div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {/* 父级菜单选择 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parent" className="text-right">
                父级菜单
              </Label>
              <div className="col-span-3">
                <TreeSelect
                  data={treeData}
                  value={formData.parentId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                  placeholder="请选择父级菜单（可为空）"
                  className="w-full"
                />
              </div>
            </div>

            {/* 菜单名称 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                菜单名称 *
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入菜单名称"
                  className="w-full"
                />
              </div>
            </div>

            {/* 菜单类型 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">菜单类型</Label>
              <div className="col-span-3">
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value: 'MENU' | 'CATALOG') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CATALOG" id="edit-catalog" />
                    <Label htmlFor="edit-catalog">目录</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MENU" id="edit-menu" />
                    <Label htmlFor="edit-menu">菜单</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* 图标 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                图标
              </Label>
              <div className="col-span-3">
                <IconPicker
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* 页面路由 - 仅菜单类型显示 */}
            {formData.type === 'MENU' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="path" className="text-right">
                  页面路由 *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="请输入页面路由（如：/admin/menus）"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* 组件路径 - 仅菜单类型显示 */}
            {formData.type === 'MENU' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="component" className="text-right">
                  组件路径 *
                </Label>
                <div className="col-span-3">
                  <Input
                    id="component"
                    value={formData.component}
                    onChange={(e) => setFormData(prev => ({ ...prev, component: e.target.value }))}
                    placeholder="请输入组件路径（如：/admin/menus）"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* 排序 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sort" className="text-right">
                排序
              </Label>
              <div className="col-span-3">
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort: parseInt(e.target.value) || 1 }))}
                  placeholder="排序值（数字越小越靠前）"
                  className="w-full"
                  min="1"
                />
              </div>
            </div>

            {/* 是否显示 */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visible" className="text-right">
                是否显示
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
                />
                <Label htmlFor="visible" className="text-sm text-muted-foreground">
                  {formData.visible ? '显示' : '隐藏'}
                </Label>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || loadingDetails || !formData.name || (formData.type === 'MENU' && (!formData.path || !formData.component))}
          >
            {loading ? '更新中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMenuDialog;
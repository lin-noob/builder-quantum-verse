import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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

interface AddMenuDialogProps {
  onMenuAdded?: () => void;
}

const AddMenuDialog: React.FC<AddMenuDialogProps> = ({ onMenuAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
  useEffect(() => {
    if (open) {
      fetchTreeData();
    }
  }, [open]);

  const fetchTreeData = async () => {
    try {
      const response = await request.get('/admin/api/v1/menus/tree-select');
      setTreeData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tree data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submitData = {
        name: formData.name,
        parentId: formData.parentId === null ? "0" : formData.parentId.toString(),
        type: formData.type,
        icon: formData.icon,
        visible: formData.visible ? 1 : 0,
        sort: formData.sort,
        component: formData.type === 'MENU' ? formData.component : '',
        ...(formData.type === 'MENU' && formData.path && {
          path: formData.path,
        })
      };

      await request.post('/admin/api/v1/menus', submitData);
      
      setOpen(false);
      resetForm();
      
      // 显示成功提示
      toast({
        title: "新增成功",
        description: `菜单 "${formData.name}" 已成功创建`,
      });
      
      if (onMenuAdded) {
        onMenuAdded();
      }
    } catch (error) {
      console.error('Failed to add menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      parentId: null,
      name: '',
      type: 'CATALOG',
      icon: '',
      visible: true,
      sort: 1,
      path: '',
      component: '',
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加菜单
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加菜单</DialogTitle>
          <DialogDescription>
            添加新的菜单项或目录
          </DialogDescription>
        </DialogHeader>
        
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
                  <RadioGroupItem value="CATALOG" id="catalog" />
                  <Label htmlFor="catalog">目录</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MENU" id="menu" />
                  <Label htmlFor="menu">菜单</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.name || (formData.type === 'MENU' && (!formData.path || !formData.component))}
          >
            {loading ? '提交中...' : '确定'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMenuDialog;
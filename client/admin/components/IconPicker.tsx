import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

// 常用图标列表
const COMMON_ICONS = [
  'Home', 'Settings', 'User', 'Users', 'Menu', 'List', 'Grid3X3',
  'LayoutDashboard', 'BarChart3', 'PieChart', 'TrendingUp', 'Activity',
  'Shield', 'Key', 'Lock', 'Unlock', 'Eye', 'EyeOff',
  'Database', 'Server', 'Cloud', 'HardDrive', 'Folder', 'File',
  'Plus', 'Minus', 'Edit', 'Trash2', 'Save', 'Download', 'Upload',
  'Search', 'Filter', 'Sort', 'Refresh', 'RotateCcw', 'RotateCw',
  'Star', 'Heart', 'Bookmark', 'Tag', 'Flag', 'Bell', 'Mail',
  'Phone', 'MessageCircle', 'Send', 'Share', 'Link', 'Copy',
  'Check', 'X', 'AlertTriangle', 'AlertCircle', 'Info', 'HelpCircle',
  'Calendar', 'Clock', 'Timer', 'Zap', 'Cpu', 'Monitor', 'Smartphone',
  'Camera', 'Image', 'Video', 'Music', 'Play', 'Pause', 'Square',
  'ShoppingCart', 'CreditCard', 'DollarSign', 'Package', 'Truck',
  'MapPin', 'Navigation', 'Compass', 'Globe', 'Wifi', 'Signal',
  'Bot', 'Code', 'Terminal', 'Wrench', 'Cog', 'Sliders'
];

// 图标分类
const ICON_CATEGORIES = {
  '常用': COMMON_ICONS,
  '导航': ['Home', 'Menu', 'List', 'Grid3X3', 'LayoutDashboard', 'Navigation', 'Compass', 'MapPin'],
  '用户': ['User', 'Users', 'UserPlus', 'UserMinus', 'UserCheck', 'UserX', 'Crown', 'Shield'],
  '系统': ['Settings', 'Cog', 'Sliders', 'Wrench', 'Tool', 'Database', 'Server', 'Monitor'],
  '文件': ['Folder', 'FolderOpen', 'File', 'FileText', 'Image', 'Video', 'Music', 'Download'],
  '操作': ['Plus', 'Minus', 'Edit', 'Trash2', 'Save', 'Copy', 'Share', 'Send'],
  '状态': ['Check', 'X', 'AlertTriangle', 'AlertCircle', 'Info', 'HelpCircle', 'Eye', 'EyeOff'],
  '图表': ['BarChart3', 'PieChart', 'TrendingUp', 'TrendingDown', 'Activity', 'Zap'],
};

const IconPicker: React.FC<IconPickerProps> = ({ value, onValueChange, className }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('常用');

  // 获取选中的图标组件
  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  // 过滤图标
  const filteredIcons = useMemo(() => {
    const categoryIcons = ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || [];
    
    if (!searchTerm) return categoryIcons;
    
    return categoryIcons.filter(iconName =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedCategory]);

  const handleIconSelect = (iconName: string) => {
    onValueChange(iconName);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onValueChange('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-start text-left font-normal", className)}
          type="button"
        >
          {SelectedIcon ? (
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4" />
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">选择图标</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="bottom" align="start">
        <div className="flex flex-col h-96">
          {/* 搜索框 */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索图标..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 分类选择 */}
          <div className="flex gap-1 p-2 border-b overflow-x-auto">
            {Object.keys(ICON_CATEGORIES).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* 图标网格 */}
          <ScrollArea className="flex-1 p-2">
            <div className="grid grid-cols-8 gap-1">
              {/* 清除按钮 */}
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-10 w-10 p-0 border-2 border-dashed border-red-200 hover:border-red-400 hover:bg-red-50"
                  title="清除图标"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
              
              {/* 图标列表 */}
              {filteredIcons.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                if (!IconComponent) return null;

                const isSelected = value === iconName;
                
                return (
                  <Button
                    key={iconName}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleIconSelect(iconName)}
                    className={cn(
                      "h-10 w-10 p-0 hover:bg-accent",
                      isSelected && "bg-accent border border-primary"
                    )}
                    title={iconName}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                没有找到匹配的图标
              </div>
            )}
          </ScrollArea>

          {/* 底部信息 */}
          <div className="p-2 border-t text-xs text-muted-foreground">
            {value ? `已选择: ${value}` : '未选择图标'}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
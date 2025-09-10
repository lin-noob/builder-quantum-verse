import React from 'react';
import { Menu, Folder } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  iconName?: string;
  isDirectory?: boolean;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  iconName,
  isDirectory = false,
  className = "h-5 w-5",
  size,
}) => {
  // 构建样式类名
  let iconClassName = className;
  if (size) {
    iconClassName = `w-${size} h-${size}`;
  }

  // 如果有指定的图标名称，尝试从 lucide-react 中获取
  if (iconName) {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={iconClassName} />;
    }
  }

  // 默认图标
  return isDirectory ? (
    <Folder className={`${iconClassName} text-blue-500`} />
  ) : (
    <Menu className={`${iconClassName} text-gray-600`} />
  );
};

// 兼容旧的 getIconByName 函数
export function getIconByName(iconName?: string, className = "h-5 w-5") {
  return <IconRenderer iconName={iconName} className={className} />;
}
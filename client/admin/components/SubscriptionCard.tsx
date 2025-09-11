import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Crown, Star, Sparkles, Zap, Gift } from "lucide-react";

interface SubscriptionCardProps {
  id: number;
  name: string;
  monthprice: number;
  yearprice: number;
  isdefault: boolean;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

// 根据月价格获取样式配置
const getPriceStyleConfig = (monthprice: number) => {
  if (monthprice === 0) {
    return {
      cardClass: "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100",
      titleClass: "text-gray-700",
      priceClass: "text-gray-600",
      badgeClass: "bg-gray-100 text-gray-700",
      badgeText: "免费",
      icon: <Gift className="h-5 w-5" />,
    };
  } else if (monthprice > 0 && monthprice <= 500) {
    return {
      cardClass: "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100",
      titleClass: "text-blue-800",
      priceClass: "text-blue-600",
      badgeClass: "bg-blue-100 text-blue-700",
      badgeText: "入门版",
      icon: <Star className="h-5 w-5" />,
    };
  } else if (monthprice > 500 && monthprice <= 1000) {
    return {
      cardClass: "border-green-300 bg-gradient-to-br from-green-50 to-green-100",
      titleClass: "text-green-800",
      priceClass: "text-green-600",
      badgeClass: "bg-green-100 text-green-700",
      badgeText: "标准版",
      icon: <Sparkles className="h-5 w-5" />,
    };
  } else if (monthprice > 1000 && monthprice <= 1500) {
    return {
      cardClass: "border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100",
      titleClass: "text-purple-800",
      priceClass: "text-purple-600",
      badgeClass: "bg-purple-100 text-purple-700",
      badgeText: "专业版",
      icon: <Zap className="h-5 w-5" />,
    };
  } else {
    return {
      cardClass: "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg",
      titleClass: "text-amber-800",
      priceClass: "text-amber-600",
      badgeClass: "bg-amber-100 text-amber-700",
      badgeText: "旗舰版",
      icon: <Crown className="h-5 w-5" />,
    };
  }
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  id,
  name,
  monthprice,
  yearprice,
  isdefault,
  onEdit,
  onCopy,
  onDelete,
}) => {
  const styleConfig = getPriceStyleConfig(monthprice);

  return (
    <div
      className={cn(
        "relative p-6 rounded-lg border-2 hover:shadow-xl transition-all duration-300 transform hover:scale-105",
        styleConfig.cardClass
      )}
    >
      {/* 默认套餐标识 */}
      {isdefault && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
            默认套餐
          </span>
        </div>
      )}

      {/* 操作菜单 */}
      <div className="absolute top-4 right-4 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>编辑</DropdownMenuItem>

            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 套餐头部 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {styleConfig.icon}
          <h3 className={cn("text-xl font-bold", styleConfig.titleClass)}>
            {name}
          </h3>
        </div>
        <div className="inline-flex items-center">
          <span className={cn("px-2 py-1 text-xs rounded-full font-medium", styleConfig.badgeClass)}>
            {styleConfig.badgeText}
          </span>
        </div>
      </div>

      {/* 价格显示 */}
      <div className="mb-6 space-y-3">
        <div className="flex items-baseline">
          <span className={cn("text-3xl font-bold", styleConfig.priceClass)}>
            ¥{monthprice}
          </span>
          <span className="text-sm text-gray-500 ml-2">/月</span>
        </div>
        
        {yearprice > 0 && (
          <div className="flex items-baseline">
            <span className={cn("text-xl font-semibold", styleConfig.priceClass)}>
              ¥{yearprice}
            </span>
            <span className="text-sm text-gray-500 ml-2">/年</span>
            {monthprice > 0 && (
              <span className="text-xs text-green-600 ml-2 bg-green-100 px-2 py-1 rounded">
                节省 ¥{Math.max(0, monthprice * 12 - yearprice)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 特色标识（仅对高端套餐显示） */}
      {monthprice > 1500 && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-[-28px] w-20 h-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold flex items-center justify-center rotate-45">
            热门
          </div>
        </div>
      )}
    </div>
  );
};

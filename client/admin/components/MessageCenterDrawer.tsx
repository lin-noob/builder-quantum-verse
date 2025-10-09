import React, { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Trash2,
  Check,
  Bell,
  AlertCircle,
  Info,
  RefreshCw,
  X,
} from "lucide-react";
import { mockMessageCenterService as messageCenterService } from "../services/mockMessageCenterService";
import { MessageType, MessageStatus } from "../services/messageCenterService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 消息类型映射
const messageTypeMap = {
  [MessageType.SYSTEM]: { label: "系统消息", icon: Info, color: "bg-blue-100 text-blue-800" },
  [MessageType.NOTIFICATION]: { label: "通知", icon: Bell, color: "bg-green-100 text-green-800" },
  [MessageType.ALERT]: { label: "警告", icon: AlertCircle, color: "bg-red-100 text-red-800" },
  [MessageType.UPDATE]: { label: "更新", icon: RefreshCw, color: "bg-purple-100 text-purple-800" },
};

// 消息状态映射
const messageStatusMap = {
  [MessageStatus.UNREAD]: { label: "未读", color: "bg-red-100 text-red-800" },
  [MessageStatus.READ]: { label: "已读", color: "bg-gray-100 text-gray-800" },
};

interface MessageCenterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function MessageCenterDrawer({ open, onOpenChange, onUnreadCountChange }: MessageCenterDrawerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 获取消息列表
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        pageSize,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (typeFilter !== "all") params.type = Number(typeFilter);
      if (statusFilter !== "all") params.status = Number(statusFilter);
      
      const response = await messageCenterService.getMessages(params);
      setMessages(response.messages);
      setTotal(response.total);
    } catch (err) {
      setError("获取消息列表失败");
      toast.error("获取消息列表失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open, currentPage, searchTerm, typeFilter, statusFilter]);

  // 标记消息为已读
  const markAsRead = async (messageId: string) => {
    try {
      await messageCenterService.markAsRead(messageId);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: MessageStatus.READ } : msg
      ));
      // 更新未读计数
      if (onUnreadCountChange) {
        const count = await messageCenterService.getUnreadCount();
        onUnreadCountChange(count);
      }
    } catch (err) {
      toast.error("标记消息失败");
      console.error(err);
    }
  };

  // 批量标记为已读
  const markMultipleAsRead = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await messageCenterService.markMultipleAsRead(selectedMessages);
      setMessages(messages.map(msg => 
        selectedMessages.includes(msg.id) 
          ? { ...msg, status: MessageStatus.READ } 
          : msg
      ));
      setSelectedMessages([]);
      toast.success(`已标记 ${selectedMessages.length} 条消息为已读`);
    } catch (err) {
      toast.error("批量标记失败");
      console.error(err);
    }
  };

  // 删除消息
  const deleteMessage = async (messageId: string) => {
    try {
      await messageCenterService.deleteMessage(messageId);
      setMessages(messages.filter(msg => msg.id !== messageId));
      setTotal(total - 1);
      toast.success("消息已删除");
    } catch (err) {
      toast.error("删除消息失败");
      console.error(err);
    }
  };

  // 批量删除消息
  const deleteMultipleMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    try {
      await messageCenterService.deleteMultipleMessages(selectedMessages);
      setMessages(messages.filter(msg => !selectedMessages.includes(msg.id)));
      setTotal(total - selectedMessages.length);
      setSelectedMessages([]);
      toast.success(`已删除 ${selectedMessages.length} 条消息`);
    } catch (err) {
      toast.error("批量删除失败");
      console.error(err);
    }
  };

  // 切换消息选择
  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // 切换全选
  const toggleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(msg => msg.id));
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <DrawerHeader className="p-0">
            <DrawerTitle>消息中心</DrawerTitle>
            <DrawerDescription>查看和管理系统消息</DrawerDescription>
          </DrawerHeader>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 搜索和筛选区域 */}
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索消息..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="消息类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {Object.entries(messageTypeMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="消息状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    {Object.entries(messageStatusMap).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 批量操作区域 */}
          {selectedMessages.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedMessages.length} 条消息
              </span>
              <Separator orientation="vertical" className="h-4" />
              <Button
                variant="outline"
                size="sm"
                onClick={markMultipleAsRead}
              >
                <Check className="h-4 w-4 mr-2" />
                标记为已读
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteMultipleMessages}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={fetchMessages}
                  >
                    重新加载
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium mb-1">暂无消息</h3>
                  <p className="text-muted-foreground">您当前没有未读消息</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedMessages.length === messages.length && messages.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead className="w-24">类型</TableHead>
                    <TableHead className="w-24">状态</TableHead>
                    <TableHead className="w-32">发送时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => {
                    const typeInfo = messageTypeMap[message.type as MessageType] || messageTypeMap[MessageType.NOTIFICATION];
                    const statusInfo = messageStatusMap[message.status as MessageStatus] || messageStatusMap[MessageStatus.UNREAD];
                    const TypeIcon = typeInfo.icon;
                    
                    return (
                      <TableRow 
                        key={message.id} 
                        className={cn(
                          "cursor-pointer",
                          message.status === MessageStatus.UNREAD && "bg-muted/50"
                        )}
                        onClick={() => markAsRead(message.id)}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedMessages.includes(message.id)}
                            onCheckedChange={() => toggleMessageSelection(message.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{message.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {message.content}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* 分页 */}
          {messages.length > 0 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                共 {total} 条消息
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  第 {currentPage} 页，共 {Math.ceil(total / pageSize)} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(Math.ceil(total / pageSize), currentPage + 1))}
                  disabled={currentPage === Math.ceil(total / pageSize)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
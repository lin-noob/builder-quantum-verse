import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MessageCenter from "./MessageCenter";
import * as messageCenterService from "../services/messageCenterService";

// Mock the message center service
vi.mock("../services/messageCenterService", () => ({
  messageCenterService: {
    getMessages: vi.fn(),
    markAsRead: vi.fn(),
    markMultipleAsRead: vi.fn(),
    deleteMessage: vi.fn(),
    deleteMultipleMessages: vi.fn(),
    getUnreadCount: vi.fn(),
  },
  MessageType: {
    SYSTEM: "system",
    NOTIFICATION: "notification",
    ALERT: "alert",
    UPDATE: "update",
  },
  MessageStatus: {
    UNREAD: "unread",
    READ: "read",
    ARCHIVED: "archived",
  },
}));

// Mock other dependencies
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody data-testid="table-body">{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td data-testid="table-cell">{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th data-testid="table-head">{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead data-testid="table-header">{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr data-testid="table-row">{children}</tr>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange }: { placeholder?: string; value?: string; onChange?: () => void }) => (
    <input placeholder={placeholder} value={value} onChange={onChange} data-testid="input" />
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: () => void }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <div data-testid="select-value">{placeholder}</div>,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange?: () => void }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckedChange as any}
      data-testid="checkbox"
    />
  ),
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: () => void }) => (
    <div data-testid="alert-dialog" data-open={open}>
      {children}
    </div>
  ),
  AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick} data-testid="alert-dialog-action">
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
}));

vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  MoreHorizontal: () => <div data-testid="more-horizontal-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Trash2: () => <div data-testid="trash2-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Archive: () => <div data-testid="archive-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Info: () => <div data-testid="info-icon" />,
  RefreshCw: () => <div data-testid="refresh-cw-icon" />,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("MessageCenter", () => {
  const mockMessages = [
    {
      id: "1",
      title: "系统更新通知",
      content: "系统将在今晚进行维护更新",
      type: "system",
      status: "unread",
      createdAt: "2023-01-01T10:00:00Z",
      priority: 1,
    },
    {
      id: "2",
      title: "新功能上线",
      content: "我们发布了新的AI分析功能",
      type: "notification",
      status: "read",
      createdAt: "2023-01-02T10:00:00Z",
      priority: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该渲染消息中心页面", async () => {
    (messageCenterService.messageCenterService.getMessages as jest.Mock).mockResolvedValue({
      messages: mockMessages,
      total: 2,
      page: 1,
      pageSize: 10,
    });

    render(<MessageCenter />);

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText("消息中心")).toBeInTheDocument();
    });

    expect(screen.getByText("系统更新通知")).toBeInTheDocument();
    expect(screen.getByText("新功能上线")).toBeInTheDocument();
  });

  it("应该显示空状态", async () => {
    (messageCenterService.messageCenterService.getMessages as jest.Mock).mockResolvedValue({
      messages: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });

    render(<MessageCenter />);

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText("暂无消息")).toBeInTheDocument();
    });
  });

  it("应该处理加载错误", async () => {
    (messageCenterService.messageCenterService.getMessages as jest.Mock).mockRejectedValue(
      new Error("获取消息失败")
    );

    render(<MessageCenter />);

    // 等待错误状态显示
    await waitFor(() => {
      expect(screen.getByText("获取消息列表失败")).toBeInTheDocument();
    });
  });
});
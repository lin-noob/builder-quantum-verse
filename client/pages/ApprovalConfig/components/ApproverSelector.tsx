import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ApproverOption {
  userId: number;
  userName: string;
  roleName?: string;
  deptName?: string;
}

interface ApproverSelectorProps {
  value: ApproverOption[];
  onChange: (value: ApproverOption[]) => void;
  fetchOptions: (params: { page: number; limit: number; keyword?: string }) => Promise<{ users: ApproverOption[]; total: number }>;
  placeholder?: string;
  disabled?: boolean;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZES = [10, 20, 50];

const ApproverSelector: React.FC<ApproverSelectorProps> = ({
  value,
  onChange,
  fetchOptions,
  placeholder = '请选择审批人员',
  disabled = false,
  initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
}) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [options, setOptions] = useState<ApproverOption[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const initialSelectionRef = useRef<ApproverOption[]>([]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selectedIds = useMemo(() => new Set(value.map((user) => user.userId)), [value]);

  const summaryLabel = useMemo(() => {
    if (value.length === 0) {
      return placeholder;
    }
    if (value.length === 1) {
      return value[0].userName;
    }
    if (value.length === 2) {
      return `${value[0].userName}、${value[1].userName}`;
    }
    const previewNames = value.slice(0, 2).map((user) => user.userName).join('、');
    return `${previewNames} 等 ${value.length} 人`;
  }, [placeholder, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchOptions({ page, limit: pageSize, keyword: searchKeyword });
        if (cancelled) {
          return;
        }
        setOptions(result.users);
        setTotal(result.total);

        const nextTotalPages = Math.max(1, Math.ceil(result.total / pageSize));
        if (result.total === 0 && page !== 1) {
          setPage(1);
        } else if (page > nextTotalPages) {
          setPage(nextTotalPages);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        const message = err instanceof Error ? err.message : '加载审批人员失败';
        setError(message);
        setOptions([]);
        setTotal(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open, page, pageSize, searchKeyword, fetchOptions, reloadToken]);

  const toggleOption = (option: ApproverOption) => {
    if (selectedIds.has(option.userId)) {
      onChange(value.filter((item) => item.userId !== option.userId));
    } else {
      onChange([...value, option]);
    }
  };

  const removeApprover = (userId: number) => {
    onChange(value.filter((item) => item.userId !== userId));
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchKeyword(searchInput.trim() ? searchInput.trim() : undefined);
  };

  const handleSearchReset = () => {
    setSearchInput('');
    setSearchKeyword(undefined);
    setPage(1);
  };

  const handlePageSizeChange = (next: number) => {
    setPage(1);
    setPageSize(next);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      initialSelectionRef.current = value.map((item) => ({ ...item }));
    } else {
      setSearchInput('');
      setSearchKeyword(undefined);
      setPage(1);
      setPageSize(initialPageSize);
      setOptions([]);
      setTotal(0);
      setError(null);
      setReloadToken(0);
    }
    if (!disabled) {
      setOpen(nextOpen);
    }
  };

  const handleCancel = () => {
    onChange(initialSelectionRef.current.map((item) => ({ ...item })));
    setOpen(false);
  };

  const handleConfirm = () => {
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            type="button"
            disabled={disabled}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2 truncate text-left text-sm font-normal">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{summaryLabel}</span>
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl space-y-4">
          <DialogHeader>
            <DialogTitle>选择审批人员</DialogTitle>
            <DialogDescription>支持搜索和分页，请勾选需要的人员后点击完成。</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <Input
              placeholder="搜索姓名、角色或ID"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Button type="submit" disabled={loading}>搜索</Button>
            <Button type="button" variant="outline" disabled={!searchInput && !searchKeyword} onClick={handleSearchReset}>
              重置
            </Button>
          </form>

          <div className="rounded-md border">
            <div className="grid grid-cols-[auto,1fr,1fr,1fr] items-center gap-3 border-b bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              <span>选择</span>
              <span>姓名</span>
              <span>角色</span>
            </div>
            <ScrollArea className="max-h-[320px]">
              {loading ? (
                <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在加载成员...
                </div>
              ) : error ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-destructive">
                  <span>{error}</span>
                  <Button variant="outline" onClick={() => setReloadToken((token) => token + 1)}>
                    重试
                  </Button>
                </div>
              ) : options.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  未找到符合条件的人员
                </div>
              ) : (
                <div className="divide-y">
                  {options.map((option) => {
                    const isSelected = selectedIds.has(option.userId);
                    return (
                      <label
                        key={option.userId}
                        className="grid cursor-pointer grid-cols-[auto,1fr,1fr,1fr] items-center gap-3 px-4 py-3 text-sm hover:bg-muted/70"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOption(option)}
                          className="mt-1"
                        />
                        <span className="font-medium text-foreground">{option.userName}</span>
                        <span className="text-muted-foreground">{option.roleName ?? '未分配角色'}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              已选择 {value.length} 人
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                每页显示
                <Select value={String(pageSize)} onValueChange={(val) => handlePageSizeChange(Number(val))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                条
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[80px] text-center text-sm text-muted-foreground">
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {value.length > 0 && (
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">已选人员</div>
              <div className="flex flex-wrap gap-2">
                {value.map((approver) => (
                  <Badge key={approver.userId} variant="secondary" className="flex items-center gap-1 text-xs">
                    <span>{approver.userName}</span>
                    <button
                      type="button"
                      onClick={() => removeApprover(approver.userId)}
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label={`移除${approver.userName}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button type="button" onClick={handleConfirm}>
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApproverSelector;

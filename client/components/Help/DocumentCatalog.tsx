import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  Search,
} from "lucide-react";
import { request } from "@/lib/request";
import { useConfigStore } from "@/stores/configStore";

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
}

export interface DocItem {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  status?: number | string; // 0/1 or "draft"/"published"
  views?: number;
  likes?: number;
  isPopular?: boolean;
  gmtModified?: string;
}

export interface DocumentCatalogProps {
  categories?: CategoryNode[];
  documents?: DocItem[];
  loading?: boolean;
  error?: string | null;
  showStatusFilter?: boolean;
  onCategorySelect?: (categoryId: string | null) => void;
  onDocumentClick?: (doc: DocItem) => void;
  renderDocumentActions?: (doc: DocItem) => React.ReactNode;
  className?: string;
  leftTitle?: string;
  rightTitle?: string;
  // Controlled options
  selectedCategoryId?: string | null;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  statusValue?: string; // "all" | "1" | "0" | "published" | "draft"
  onStatusChange?: (v: string) => void;
  disableInternalFilter?: boolean;
  showSearch?: boolean;
  // Internal fetching options
  fetchFromApi?: boolean; // default true
  languageCode?: string; // override; default from configStore
  onDataChange?: (payload: {
    categories: CategoryNode[];
    documents: DocItem[];
  }) => void;
  refreshKey?: number;
  defaultStatus?: number;
}

// Flatten tree for fast lookup
const flattenCategories = (nodes: CategoryNode[]): CategoryNode[] => {
  const out: CategoryNode[] = [];
  const walk = (arr: CategoryNode[]) => {
    arr.forEach((n) => {
      out.push(n);
      if (n.children && n.children.length) walk(n.children);
    });
  };
  walk(nodes);
  return out;
};

const getStatusDisplay = (status?: number | string) => {
  if (status === undefined || status === null)
    return { text: "", variant: "secondary" as const };
  const num =
    typeof status === "string" ? (status === "published" ? 1 : 0) : status;
  return {
    text: num === 1 ? "已发布" : "草稿",
    variant: num === 1 ? ("default" as const) : ("secondary" as const),
  };
};

export const DocumentCatalog: React.FC<DocumentCatalogProps> = ({
  categories: externalCategories,
  documents: externalDocuments,
  loading: externalLoading,
  error: externalError,
  showStatusFilter = false,
  onCategorySelect,
  onDocumentClick,
  renderDocumentActions,
  className,
  leftTitle = "文档分类",
  rightTitle = "所有文档",
  selectedCategoryId: controlledSelectedCategoryId,
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  disableInternalFilter = false,
  showSearch = true,
  fetchFromApi = true,
  languageCode,
  onDataChange,
  refreshKey = 0,
  defaultStatus,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [uncontrolledSelectedCategoryId, setUncontrolledSelectedCategoryId] =
    useState<string | null>(null);
  const [uncontrolledSearch, setUncontrolledSearch] = useState("");
  const [uncontrolledStatusFilter, setUncontrolledStatusFilter] =
    useState<string>("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const selectedCategoryId =
    controlledSelectedCategoryId !== undefined
      ? controlledSelectedCategoryId
      : uncontrolledSelectedCategoryId;
  const search = searchValue !== undefined ? searchValue : uncontrolledSearch;
  // const statusFilter =
  //   statusValue !== undefined ? statusValue : uncontrolledStatusFilter;

  const langCodeFromStore = useConfigStore((s) => s.langCode);
  const effectiveLang = languageCode || langCodeFromStore;

  // Internal data states
  const [internalCategories, setInternalCategories] = useState<CategoryNode[]>(
    [],
  );
  const [internalDocuments, setInternalDocuments] = useState<DocItem[]>([]);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const categories =
    externalCategories && externalCategories.length
      ? externalCategories
      : internalCategories;
  const documents =
    externalDocuments && externalDocuments.length
      ? externalDocuments
      : internalDocuments;
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;
  const error = externalError !== undefined ? externalError : internalError;

  const flatCats = useMemo(() => flattenCategories(categories), [categories]);

  useEffect(() => {
    // expand all by default when categories change
    const next: Record<string, boolean> = {};
    flatCats.forEach((c) => (next[c.id] = true));
    setExpanded(next);
  }, [flatCats.length]);

  const filteredDocs = useMemo(() => {
    if (disableInternalFilter) return documents;
    let result = documents;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(term) ||
          (d.description
            ? d.description.toLowerCase().includes(term)
            : false) ||
          (d.categoryName
            ? d.categoryName.toLowerCase().includes(term)
            : false),
      );
    }
    if (showStatusFilter && statusFilter !== "all") {
      const target =
        statusFilter === "1" || statusFilter === "published" ? 1 : 0;
      result = result.filter((d) => {
        const s =
          typeof d.status === "string"
            ? d.status === "published"
              ? 1
              : 0
            : (d.status ?? 0);
        return s === target;
      });
    }

    return result;
  }, [
    documents,
    selectedCategoryId,
    search,
    statusFilter,
    showStatusFilter,
    disableInternalFilter,
  ]);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  // Internal API mappers
  const mapCategories = (nodes: any[]): CategoryNode[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.map((n) => ({
      id: String(n.id),
      name: n.name || n.title || n.mainTitle || "",
      children:
        n.children && Array.isArray(n.children)
          ? mapCategories(n.children)
          : [],
    }));
  };
  const flattenDocs = (tree: any[]): any[] => {
    const out: any[] = [];
    const walk = (arr: any[]) => {
      arr.forEach((n) => {
        if (n.children && Array.isArray(n.children) && n.children.length) {
          walk(n.children);
        } else {
          out.push(n);
        }
      });
    };
    walk(Array.isArray(tree) ? tree : []);
    return out;
  };
  const mapDocs = (items: any[]): DocItem[] => {
    if (!Array.isArray(items)) return [];

    const result = [];

    for (let index = 0; index < items.length; index++) {
      const d = items[index];

      if (defaultStatus && defaultStatus !== d.status) {
        continue;
      }

      const item = {
        id: String(d.id),
        title: d.title || d.name || d.mainTitle || "",
        description: d.description || d.viceTitle || "",
        categoryId:
          d.categoryId || d.classifyId
            ? String(d.categoryId || d.classifyId)
            : undefined,
        views: d.browseCount ?? 0,
        likes: d.likes ?? 0,
        status: d.status,
        isPopular: !!d.isPopular,
        gmtModified: d.gmtModified || d.updatedAt || d.lastUpdated,
      };

      result.push(item);
    }

    return result;
  };

  // Fetch effects
  useEffect(() => {
    const shouldFetchCategories =
      fetchFromApi && !(externalCategories && externalCategories.length);
    if (!shouldFetchCategories) return;
    (async () => {
      try {
        setInternalLoading(true);
        setInternalError(null);
        const res = await request.get("/admin/api/v1/article/classify/tree", {
          locale: effectiveLang,
        });
        const raw = res?.data?.data || [];
        const mapped = mapCategories(raw);
        setInternalCategories(mapped);
        onDataChange?.({ categories: mapped, documents: internalDocuments });
      } catch (e: any) {
        console.error(e);
        setInternalError("加载分类失败");
      } finally {
        setInternalLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveLang]);

  useEffect(() => {
    const shouldFetchDocs =
      fetchFromApi && !(externalDocuments && externalDocuments.length);
    if (!shouldFetchDocs) return;
    if (!selectedCategoryId) return;
    (async () => {
      try {
        setInternalLoading(true);
        setInternalError(null);
        const params: any = {};
        if (selectedCategoryId) params.classifyId = selectedCategoryId;
        const res = await request.get("/admin/api/v1/article", params);
        const data = res?.data?.data;
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data?.tree && Array.isArray(data.tree))
          list = flattenDocs(data.tree);
        else if (data?.list && Array.isArray(data.list)) list = data.list;
        const mapped = mapDocs(list);
        setInternalDocuments(mapped);
        onDataChange?.({ categories, documents: mapped });
      } catch (e: any) {
        console.error(e);
      } finally {
        setInternalLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, refreshKey]);

  const renderTree = (nodes: CategoryNode[], level = 0) => (
    <div className={level > 0 ? "ml-4" : ""}>
      {nodes.map((n) => (
        <div key={n.id} className="mb-1">
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors",
              selectedCategoryId === n.id
                ? "bg-blue-50 border border-blue-200"
                : "",
            )}
            onClick={() => {
              const next = selectedCategoryId === n.id ? null : n.id;
              if (controlledSelectedCategoryId === undefined) {
                setUncontrolledSelectedCategoryId(next);
              }
              onCategorySelect?.(next);
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                if (n.children && n.children.length) toggle(n.id);
              }}
            >
              {n.children && n.children.length ? (
                expanded[n.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </Button>
            <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="flex-1 truncate text-sm">{n.name}</span>
          </div>

          {n.children && n.children.length && expanded[n.id] ? (
            <div className="mt-1">{renderTree(n.children, level + 1)}</div>
          ) : null}
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-6", className)}>
      {/* Left: Category tree */}
      <div className="lg:col-span-4 flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {leftTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {categories && categories.length ? (
                <div className="space-y-2">{renderTree(categories)}</div>
              ) : (
                <div className="text-center py-6 text-gray-500">暂无分类</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: Documents list */}
      <div className="lg:col-span-8 flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{rightTitle}</CardTitle>
              <div className="flex items-center gap-2">
                {showSearch && (
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="搜索文档..."
                      value={search}
                      onChange={(e) => {
                        if (onSearchChange) onSearchChange(e.target.value);
                        if (searchValue === undefined)
                          setUncontrolledSearch(e.target.value);
                      }}
                      className="pl-10 w-64"
                    />
                  </div>
                )}
                {showStatusFilter && (
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      if (onStatusChange) onStatusChange(e.target.value);
                      setStatusFilter(e.target.value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="1">已发布</option>
                    <option value="0">草稿</option>
                  </select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  正在加载文档...
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-32 text-red-500">
                  {error}
                </div>
              ) : !filteredDocs.length ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  {search ||
                  (showStatusFilter && statusFilter !== "all") ||
                  selectedCategoryId
                    ? "没有找到匹配的文档"
                    : "暂无文档"}
                </div>
              ) : (
                filteredDocs.map((d) => (
                  <div
                    key={d.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {d.title}
                          </h3>
                          {d.status !== undefined && !defaultStatus && (
                            <Badge variant={getStatusDisplay(d.status).variant}>
                              {getStatusDisplay(d.status).text}
                            </Badge>
                          )}
                          {d.isPopular && (
                            <Badge variant="destructive">热门</Badge>
                          )}
                        </div>
                        {d.description ? (
                          <p className="text-gray-600 text-sm mb-2">
                            {d.description}
                          </p>
                        ) : null}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {d.views !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {d.views}
                            </span>
                          )}
                          {d.gmtModified && <span>更新: {d.gmtModified}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {renderDocumentActions ? (
                          renderDocumentActions(d)
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDocumentClick?.(d)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentCatalog;

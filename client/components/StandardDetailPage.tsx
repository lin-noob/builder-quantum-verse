import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface DetailPageProps {
  // Header configuration
  title: string;
  subtitle?: string;
  backUrl: string;

  // Identity section
  entityId: string;
  entityIdLabel: string;
  primaryInfo: {
    name: string;
    description?: string;
    metadata?: Array<{
      label: string;
      value: string;
    }>;
  };

  // Key metrics
  metrics?: Array<{
    label: string;
    value: string | number;
  }>;

  // Tab content
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
  }>;

  // Actions
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "destructive";
  }>;

  // Tag management (optional)
  tags?: {
    items: string[];
    onAdd?: (tag: string) => void;
    onRemove?: (tag: string) => void;
  };

  loading?: boolean;
}

/**
 * 标准详情页组件
 * 基于 UserDetail2 的设计模式，可用于所有详情页面
 *
 * 使用示例：
 * <StandardDetailPage
 *   title="组织详情"
 *   subtitle="查看和管理组织信息"
 *   backUrl="/admin/organizations"
 *   entityId="org_123"
 *   entityIdLabel="组织ID"
 *   primaryInfo={{
 *     name: "组织名称",
 *     description: "组织描述",
 *     metadata: [
 *       { label: "创建���间", value: "2024-01-01" },
 *       { label: "状态", value: "活跃" }
 *     ]
 *   }}
 *   metrics={[
 *     { label: "成员数量", value: 25 },
 *     { label: "活跃成员", value: 20 }
 *   ]}
 *   tabs={[
 *     { id: "overview", label: "概览", content: <div>概览内容</div> },
 *     { id: "members", label: "成员", content: <div>成员内容</div> }
 *   ]}
 *   actions={[
 *     { label: "编辑", onClick: () => {} },
 *     { label: "删除", onClick: () => {}, variant: "destructive" }
 *   ]}
 * />
 */
export default function StandardDetailPage({
  title,
  subtitle,
  backUrl,
  entityId,
  entityIdLabel,
  primaryInfo,
  metrics,
  tabs,
  actions,
  tags,
  loading = false,
}: DetailPageProps) {
  const navigate = useNavigate();
  const [newTag, setNewTag] = React.useState("");

  const handleCopyId = () => {
    navigator.clipboard.writeText(entityId);
    toast({
      title: "已复制",
      description: `${entityIdLabel}已复制到剪贴板`,
    });
  };

  const addTag = () => {
    if (newTag.trim() && tags?.onAdd && !tags.items.includes(newTag.trim())) {
      tags.onAdd(newTag.trim());
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (tags?.onRemove) {
      tags.onRemove(tagToRemove);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-full">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary rounded mb-6 w-32"></div>
          <div className="h-8 bg-secondary rounded mb-6 w-48"></div>
          <div className="space-y-4">
            <div className="h-64 bg-secondary rounded"></div>
            <div className="h-48 bg-secondary rounded"></div>
            <div className="h-96 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(backUrl)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Identity Information Card - Full Width */}
        <Card className="bg-background rounded-lg border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {primaryInfo.name}
                </h2>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {entityIdLabel}:
                  </span>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {entityId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {primaryInfo.description && (
                  <p className="text-sm text-muted-foreground">
                    {primaryInfo.description}
                  </p>
                )}

                {/* Tag Management */}
                {tags && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      标签管理
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tags.items.map((tag, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {tag}
                          {tags.onRemove && (
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {tags.onAdd && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="添加新标签"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                          className="text-sm"
                        />
                        <Button onClick={addTag} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Metadata Grid - 3 columns */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {primaryInfo.metadata?.map((item, index) => (
                  <dl key={index} className="space-y-2">
                    <dt className="text-xs text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="text-sm text-foreground">{item.value}</dd>
                  </dl>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Card - Full Width */}
        {metrics && metrics.length > 0 && (
          <Card className="bg-background rounded-lg border">
            <CardHeader>
              <CardTitle className="text-lg">关键指标</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`grid gap-4 ${
                  metrics.length <= 3
                    ? "grid-cols-1 md:grid-cols-3"
                    : metrics.length <= 6
                      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
                      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-9"
                }`}
              >
                {metrics.map((metric, index) => (
                  <dl key={index} className="text-center">
                    <dt className="text-xs text-muted-foreground">
                      {metric.label}
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {metric.value}
                    </dd>
                  </dl>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Data - Full Width */}
        <Card className="bg-background rounded-lg border">
          <CardContent className="p-6">
            <Tabs defaultValue={tabs[0]?.id} className="w-full">
              <TabsList
                className={`grid w-full ${
                  tabs.length <= 3
                    ? "grid-cols-3"
                    : tabs.length <= 4
                      ? "grid-cols-4"
                      : "grid-cols-5"
                }`}
              >
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

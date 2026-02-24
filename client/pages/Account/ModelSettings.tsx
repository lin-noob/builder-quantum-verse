import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Play, CheckCircle2, XCircle, AlertCircle, Loader2, Box, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { request } from "@/lib/request";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- Types & Constants ---

export type ProviderType = "openai" | "anthropic" | "google" | "deepseek";

export interface FieldDefinition {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  sensitive: boolean;
}

export const PROVIDERS: { id: ProviderType; name: string }[] = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google", name: "Google" },
  { id: "deepseek", name: "DeepSeek" },
];

export const PROVIDER_FIELD_SCHEMAS: Record<ProviderType, FieldDefinition[]> = {
  openai: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "baseUrl", label: "Base URL", type: "string", required: false, sensitive: false },
  ],
  anthropic: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "baseUrl", label: "Base URL", type: "string", required: false, sensitive: false },
  ],
  google: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "baseUrl", label: "Base URL", type: "string", required: false, sensitive: false },
  ],
  deepseek: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "baseUrl", label: "Base URL", type: "string", required: false, sensitive: false },
  ],
};

export interface ModelConfig {
  id: string;
  provider: ProviderType;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  status: {
    saved: boolean;
    testing: boolean;
    result: "idle" | "success" | "failed";
  };
}

// API 请求参数接口
export interface CreateModelRequest {
  apiKey: string;
  baseUrl: string;
  modelName: string;
  status: number;
  vendorCode: number;
  vendorName: string;
}

// 更新模型请求参数接口（比新增多了 id 参数）
export interface UpdateModelRequest extends CreateModelRequest {
  id: string;
}

// 测试连接请求参数接口
export interface TestConnectionRequest {
  apiKey: string;
  baseUrl: string;
  id: string;
  modelName: string;
  status: number;
  vendorCode: number;
  vendorName: string;
}

// 服务器返回的模型数据结构
export interface ServerModelData {
  id: string;
  gmtCreate: string;
  gmtModified: string;
  baseUrl: string;
  apiKey: string;
  modelName: string;
  status: number;
  companyId: string;
  vendorName: string;
  vendorCode: number;
}

// API 响应结构
export interface ModelListResponse {
  code: string;
  data: Record<string, ServerModelData[]>;
  msg: string;
}

const ModelSettings = () => {
  const { toast } = useToast();

  // --- State ---
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<ProviderType>("openai");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    const loadModels = async () => {
      try {
        // 调用 API 获取模型列表
        const response = await getModelList();
        if (response.code === "201" && response.data) {
          // 将服务器数据转换为本地格式
          const serverModels = convertServerResponseToModels(response);
          setModels(serverModels);
        }
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // --- Handlers ---

  // 刷新模型列表数据
  const refreshModelList = async () => {
    try {
      const response = await getModelList();
      if (response.code === "201" && response.data) {
        const serverModels = convertServerResponseToModels(response);
        setModels(serverModels);
      }
    } catch (error) {
      console.error("Failed to refresh model list:", error);
    }
  };

  // API 调用函数
  const createModel = async (modelData: CreateModelRequest) => {
    try {
      const response = await request.post("/admin/api/v1/model", modelData);
      return response;
    } catch (error) {
      console.error("Failed to create model:", error);
      throw error;
    }
  };

  const getModelList = async (): Promise<ModelListResponse> => {
    try {
      const response = await request.get("/admin/api/v1/model/list");
      return response.data;
    } catch (error) {
      console.error("Failed to get model list:", error);
      throw error;
    }
  };

  const deleteModel = async (id: string) => {
    try {
      const response = await request.delete("/admin/api/v1/model", {
        data: {
          id: id,
        },
      });
      return response;
    } catch (error) {
      console.error("Failed to delete model:", error);
      throw error;
    }
  };

  const updateModel = async (modelData: UpdateModelRequest) => {
    try {
      const response = await request.put("/admin/api/v1/model", modelData);
      return response;
    } catch (error) {
      console.error("Failed to update model:", error);
      throw error;
    }
  };

  const testConnection = async (testData: TestConnectionRequest) => {
    try {
      const response = await request.post("/admin/api/v1/model/connect", testData);
      return response;
    } catch (error) {
      console.error("Failed to test connection:", error);
      throw error;
    }
  };

  // 将服务器数据转换为本地 ModelConfig 格式
  const convertServerDataToModelConfig = (serverData: ServerModelData): ModelConfig => {
    // 根据 vendorCode 映射到 ProviderType
    const vendorCodeToProvider: Record<number, ProviderType> = {
      1: "openai",
      2: "anthropic",
      3: "google",
      4: "deepseek",
    };

    const provider = vendorCodeToProvider[serverData.vendorCode] || "openai";

    return {
      id: serverData.id,
      provider: provider,
      name: serverData.modelName || "Unnamed Model",
      enabled: serverData.status === 1,
      config: {
        apiKey: serverData.apiKey,
        baseUrl: serverData.baseUrl,
      },
      status: {
        saved: true, // 从服务器加载的数据认为是已保存的
        testing: false,
        result: "idle",
      },
    };
  };

  // 将服务器响应数据转换为 ModelConfig 数组
  const convertServerResponseToModels = (response: ModelListResponse): ModelConfig[] => {
    const models: ModelConfig[] = [];

    // 遍历每个厂商的数据
    Object.values(response.data).forEach((vendorModels) => {
      vendorModels.forEach((serverModel) => {
        models.push(convertServerDataToModelConfig(serverModel));
      });
    });

    return models;
  };

  const handleAddModel = () => {
    const newModel: ModelConfig = {
      id: `model_${Date.now()}`,
      provider: selectedProviderId,
      name: "New Model",
      enabled: false,
      config: {},
      status: { saved: false, testing: false, result: "idle" },
    };
    // 将新模型添加到列表最前面
    setModels([newModel, ...models]);
  };

  const handleDeleteModel = (id: string) => {
    setDeleteModelId(id);
  };

  const confirmDeleteModel = async () => {
    if (!deleteModelId) return;

    try {
      const isNewModel = deleteModelId.startsWith("model_");

      // 只有非新建模型才调用删除 API
      if (!isNewModel) {
        await deleteModel(deleteModelId);
      }

      // 刷新列表数据
      await refreshModelList();

      toast({
        title: "Deleted",
        description: "Model configuration deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete model:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete model configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteModelId(null);
    }
  };

  const handleStatusChange = async (id: string, enabled: boolean) => {
    const model = models.find((m) => m.id === id);
    if (!model) return;

    const isNewModel = id.startsWith("model_");

    // 如果是新模型，只更新本地状态
    if (isNewModel) {
      handleUpdateModel(id, { enabled });
      return;
    }

    try {
      // 准备 API 请求数据
      const vendorCodeMap: Record<ProviderType, number> = {
        openai: 1,
        anthropic: 2,
        google: 3,
        deepseek: 4,
      };

      const updateData: UpdateModelRequest = {
        apiKey: model.config.apiKey || "",
        baseUrl: model.config.baseUrl || "",
        modelName: model.name,
        status: enabled ? 1 : 0,
        vendorCode: vendorCodeMap[model.provider],
        vendorName: PROVIDERS.find((p) => p.id === model.provider)?.name || "",
        id: model.id,
      };

      // 调用更新 API
      await updateModel(updateData);

      // 刷新列表数据
      await refreshModelList();

      toast({
        title: "Updated",
        description: `Model ${enabled ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      console.error("Failed to update model status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update model status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateModel = (id: string, updates: Partial<Omit<ModelConfig, "status" | "config">>) => {
    setModels(
      models.map((m) =>
        m.id === id
          ? {
              ...m,
              ...updates,
              status: { ...m.status, saved: false },
            }
          : m,
      ),
    );
  };

  const handleUpdateModelConfig = (id: string, key: string, value: any) => {
    setModels(
      models.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            config: { ...m.config, [key]: value },
            status: { ...m.status, saved: false },
          };
        }
        return m;
      }),
    );
  };

  const handleSaveModel = async (id: string) => {
    // Validate required fields
    const model = models.find((m) => m.id === id);
    if (!model) return;

    const schema = PROVIDER_FIELD_SCHEMAS[model.provider];
    const missingFields = schema.filter((f) => f.required && !model.config[f.key]).map((f) => f.label);

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // 准备 API 请求数据
      const vendorCodeMap: Record<ProviderType, number> = {
        openai: 1,
        anthropic: 2,
        google: 3,
        deepseek: 4,
      };

      const baseModelData = {
        apiKey: model.config.apiKey || "",
        baseUrl: model.config.baseUrl || "",
        modelName: model.name,
        status: model.enabled ? 1 : 0,
        vendorCode: vendorCodeMap[model.provider],
        vendorName: PROVIDERS.find((p) => p.id === model.provider)?.name || "",
      };

      // 判断是新增还是更新操作
      // 如果 ID 以 "model_" 开头，认为是新创建的模型，使用新增接口
      const isNewModel = model.id.startsWith("model_");

      if (isNewModel) {
        // 新增模型
        const createData: CreateModelRequest = baseModelData;
        await createModel(createData);
      } else {
        // 更新模型
        const updateData: UpdateModelRequest = {
          ...baseModelData,
          id: model.id,
        };
        await updateModel(updateData);
      }

      // 刷新列表数据
      await refreshModelList();

      toast({
        title: "Saved",
        description: `Model configuration ${isNewModel ? "created" : "updated"} successfully`,
      });
    } catch (error) {
      console.error("Failed to save model:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save model configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestModel = async (id: string) => {
    const model = models.find((m) => m.id === id);
    if (!model) return;

    setModels(
      models.map((m) =>
        m.id === id
          ? {
              ...m,
              status: { ...m.status, testing: true },
            }
          : m,
      ),
    );

    try {
      // 准备测试连接的数据
      const vendorCodeMap: Record<ProviderType, number> = {
        openai: 1,
        anthropic: 2,
        google: 3,
        deepseek: 4,
      };

      const testData: TestConnectionRequest = {
        apiKey: model.config.apiKey || "",
        baseUrl: model.config.baseUrl || "",
        id: model.id,
        modelName: model.name,
        status: model.enabled ? 1 : 0,
        vendorCode: vendorCodeMap[model.provider],
        vendorName: PROVIDERS.find((p) => p.id === model.provider)?.name || "",
      };

      // 调用测试连接 API
      await testConnection(testData);

      // 测试成功
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: { ...m.status, testing: false, result: "success" },
              }
            : m,
        ),
      );

      toast({
        title: "Connection Successful",
        description: "Successfully connected to the model provider.",
      });
    } catch (error) {
      // 测试失败
      console.error("Connection test failed:", error);
      setModels((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                status: { ...m.status, testing: false, result: "failed" },
              }
            : m,
        ),
      );

      toast({
        title: "Connection Failed",
        description: "Could not connect to the model provider.",
        variant: "destructive",
      });
    }
  };

  const getStatusDisplay = (status: ModelConfig["status"]) => {
    if (status.testing) {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>TESTING</span>
        </div>
      );
    }

    if (!status.saved) {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-3 w-3" />
          <span>UNSAVED</span>
        </div>
      );
    }

    if (status.result === "success") {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>READY</span>
        </div>
      );
    }

    if (status.result === "failed") {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
          <XCircle className="h-3 w-3" />
          <span>ERROR</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
        <CheckCircle2 className="h-3 w-3" />
        <span>SAVED</span>
      </div>
    );
  };

  const selectedProvider = PROVIDERS.find((p) => p.id === selectedProviderId);
  const providerModels = models.filter((m) => m.provider === selectedProviderId);
  const currentSchema = PROVIDER_FIELD_SCHEMAS[selectedProviderId];

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar: Fixed Vendors */}
      <div className="w-64 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <span className="font-semibold text-sm">模型厂商</span>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  selectedProviderId === provider.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-muted text-foreground",
                )}
                onClick={() => setSelectedProviderId(provider.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <Box className="h-4 w-4 opacity-70" />
                  <span className="truncate font-medium">{provider.name}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Models */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {selectedProvider ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b bg-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  {selectedProvider.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">管理 {selectedProvider.name} 下的模型配置</p>
              </div>
              <Button onClick={handleAddModel}>
                <Plus className="h-4 w-4 mr-2" />
                新增模型
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {providerModels.map((model) => {
                  const isNewModel = model.id.startsWith("model_");
                  return (
                    <Card
                      key={model.id}
                      className={cn(
                        "overflow-hidden border-l-4 transition-all",
                        isNewModel
                          ? "border-l-blue-500 border-2 border-blue-200 bg-blue-50/30 hover:border-blue-300"
                          : "border-l-primary/20 hover:border-l-primary",
                      )}
                    >
                      <CardHeader className="pb-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                            <Input
                              value={model.name}
                              onChange={(e) => handleUpdateModel(model.id, { name: e.target.value })}
                              className="h-8 w-[200px] font-semibold text-lg hover:border-input focus:border-primary"
                            />
                            <Badge variant={model.enabled ? "default" : "secondary"}>
                              {model.enabled ? "已启用" : "已停用"}
                            </Badge>
                            {getStatusDisplay(model.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={model.enabled}
                              onCheckedChange={(checked) => handleStatusChange(model.id, checked)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteModel(model.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-4 bg-white/50 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentSchema.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                              </Label>
                              {field.type === "boolean" ? (
                                <div className="flex items-center h-10">
                                  <Switch
                                    checked={model.config[field.key] || false}
                                    onCheckedChange={(checked) => handleUpdateModelConfig(model.id, field.key, checked)}
                                  />
                                </div>
                              ) : (
                                <Input
                                  type={field.sensitive ? "password" : field.type === "number" ? "number" : "text"}
                                  value={model.config[field.key] || ""}
                                  onChange={(e) => handleUpdateModelConfig(model.id, field.key, e.target.value)}
                                  placeholder={`Enter ${field.label}`}
                                  className="bg-white"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestModel(model.id)}
                            disabled={model.status.testing}
                          >
                            {model.status.testing ? (
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 mr-2" />
                            )}
                            测试连接
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveModel(model.id)}
                            disabled={model.status.saved || model.status.testing}
                          >
                            <Save className="h-3 w-3 mr-2" />
                            保存配置
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {providerModels.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Box className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium text-foreground">暂无模型配置</h3>
                    <p className="text-sm text-muted-foreground mb-4">请点击右上角"新增模型"添加配置</p>
                    <Button onClick={handleAddModel}>
                      <Plus className="h-4 w-4 mr-2" />
                      新增模型
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-3">
            <Box className="h-12 w-12 opacity-20" />
            <p>请选择一个模型厂商</p>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteModelId} onOpenChange={() => setDeleteModelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个模型配置吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteModel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModelSettings;

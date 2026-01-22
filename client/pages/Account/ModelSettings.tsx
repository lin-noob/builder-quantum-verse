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
import {
  Plus,
  Trash2,
  Save,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Box,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

export type ProviderType = 'openai' | 'anthropic' | 'google' | 'deepseek';

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  sensitive: boolean;
}

export const PROVIDERS: { id: ProviderType; name: string }[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
  { id: 'deepseek', name: 'DeepSeek' },
];

export const PROVIDER_FIELD_SCHEMAS: Record<ProviderType, FieldDefinition[]> = {
  openai: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "baseUrl", label: "Base URL", type: "string", required: false, sensitive: false },
    { key: "orgId", label: "Organization ID", type: "string", required: false, sensitive: false }
  ],
  anthropic: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "version", label: "API Version", type: "string", required: false, sensitive: false }
  ],
  google: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "projectId", label: "Project ID", type: "string", required: true, sensitive: false }
  ],
  deepseek: [
    { key: "apiKey", label: "API Key", type: "string", required: true, sensitive: true },
    { key: "baseUrl", label: "Base URL", type: "string", required: false, sensitive: false }
  ]
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
    result: 'idle' | 'success' | 'failed';
  };
}

const ModelSettings = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<ProviderType>('openai');
  const [isLoading, setIsLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    // Load from localStorage
    const savedModels = localStorage.getItem('model_configs_v2');
    
    if (savedModels) {
      try {
        setModels(JSON.parse(savedModels));
      } catch (e) {
        console.error("Failed to parse models", e);
      }
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('model_configs_v2', JSON.stringify(models));
    }
  }, [models, isLoading]);

  // --- Handlers ---

  const handleAddModel = () => {
    const newModel: ModelConfig = {
      id: `model_${Date.now()}`,
      provider: selectedProviderId,
      name: "New Model",
      enabled: false,
      config: {},
      status: { saved: false, testing: false, result: 'idle' }
    };
    setModels([...models, newModel]);
  };

  const handleDeleteModel = (id: string) => {
    if (window.confirm("Delete this model configuration?")) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const handleUpdateModel = (id: string, updates: Partial<Omit<ModelConfig, 'status' | 'config'>>) => {
    setModels(models.map(m => m.id === id ? { 
      ...m, 
      ...updates, 
      status: { ...m.status, saved: false } 
    } : m));
  };

  const handleUpdateModelConfig = (id: string, key: string, value: any) => {
    setModels(models.map(m => {
      if (m.id === id) {
        return {
          ...m,
          config: { ...m.config, [key]: value },
          status: { ...m.status, saved: false }
        };
      }
      return m;
    }));
  };

  const handleSaveModel = (id: string) => {
    // Validate required fields
    const model = models.find(m => m.id === id);
    if (!model) return;

    const schema = PROVIDER_FIELD_SCHEMAS[model.provider];
    const missingFields = schema
      .filter(f => f.required && !model.config[f.key])
      .map(f => f.label);
      
    if (missingFields.length > 0) {
      toast({ 
        title: "Validation Error", 
        description: `Missing required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setModels(models.map(m => m.id === id ? { 
      ...m, 
      status: { ...m.status, saved: true } 
    } : m));
    toast({ title: "Saved", description: "Model configuration saved" });
  };

  const handleTestModel = async (id: string) => {
    setModels(models.map(m => m.id === id ? { 
      ...m, 
      status: { ...m.status, testing: true } 
    } : m));
    
    // Mock test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate mock
      setModels(prev => prev.map(m => 
        m.id === id ? { 
          ...m, 
          status: { ...m.status, testing: false, result: success ? 'success' : 'failed' } 
        } : m
      ));
      
      if (success) {
        toast({ title: "Connection Successful", description: "Successfully connected to the model provider." });
      } else {
        toast({ title: "Connection Failed", description: "Could not connect to the model provider.", variant: "destructive" });
      }
    }, 1500);
  };

  const getStatusDisplay = (status: ModelConfig['status']) => {
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
    
    if (status.result === 'success') {
      return (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>READY</span>
        </div>
      );
    }
    
    if (status.result === 'failed') {
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

  const selectedProvider = PROVIDERS.find(p => p.id === selectedProviderId);
  const providerModels = models.filter(m => m.provider === selectedProviderId);
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
            {PROVIDERS.map(provider => (
              <div
                key={provider.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  selectedProviderId === provider.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-foreground"
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
                <p className="text-sm text-muted-foreground mt-1">
                  管理 {selectedProvider.name} 下的模型配置
                </p>
              </div>
              <Button onClick={handleAddModel}>
                <Plus className="h-4 w-4 mr-2" />
                新增模型
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {providerModels.map(model => (
                  <Card key={model.id} className="overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary transition-all">
                    <CardHeader className="pb-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Cpu className="h-5 w-5 text-muted-foreground" />
                          <Input 
                            value={model.name} 
                            onChange={(e) => handleUpdateModel(model.id, { name: e.target.value })}
                            className="h-8 w-[200px] font-semibold text-lg border-transparent hover:border-input focus:border-primary"
                          />
                          <Badge variant={model.enabled ? "default" : "secondary"}>
                            {model.enabled ? "已启用" : "已停用"}
                          </Badge>
                          {getStatusDisplay(model.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={model.enabled}
                            onCheckedChange={(checked) => handleUpdateModel(model.id, { enabled: checked })}
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
                        {currentSchema.map(field => (
                          <div key={field.key} className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {field.type === 'boolean' ? (
                              <div className="flex items-center h-10">
                                <Switch 
                                  checked={model.config[field.key] || false}
                                  onCheckedChange={(checked) => handleUpdateModelConfig(model.id, field.key, checked)}
                                />
                              </div>
                            ) : (
                              <Input 
                                type={field.sensitive ? "password" : field.type === 'number' ? "number" : "text"}
                                value={model.config[field.key] || ''}
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
                          {model.status.testing ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Play className="h-3 w-3 mr-2" />}
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
                ))}
                
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
    </div>
  );
};

export default ModelSettings;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Settings,
  Save,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Loader2,
  Box,
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  sensitive: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  fields: FieldDefinition[];
}

export interface ModelConfig {
  id: string;
  vendorId: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  status: 'saved' | 'unsaved' | 'testing' | 'success' | 'failed';
}

// --- Initial Data ---

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'string', required: true, sensitive: true },
      { key: 'orgId', label: 'Organization ID', type: 'string', required: false, sensitive: false },
      { key: 'baseUrl', label: 'Base URL', type: 'string', required: false, sensitive: false },
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'string', required: true, sensitive: true },
      { key: 'version', label: 'API Version', type: 'string', required: false, sensitive: false },
    ]
  }
];

const ModelSettings = () => {
  const { toast } = useToast();
  
  // --- State ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vendor Dialog State
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorFields, setNewVendorFields] = useState<FieldDefinition[]>([]);

  // --- Effects ---
  useEffect(() => {
    // Load from localStorage
    const savedVendors = localStorage.getItem('model_vendors');
    const savedModels = localStorage.getItem('model_configs');
    
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors));
    } else {
      setVendors(INITIAL_VENDORS);
    }
    
    if (savedModels) {
      setModels(JSON.parse(savedModels));
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('model_vendors', JSON.stringify(vendors));
      localStorage.setItem('model_configs', JSON.stringify(models));
    }
  }, [vendors, models, isLoading]);

  useEffect(() => {
    if (vendors.length > 0 && !selectedVendorId) {
      setSelectedVendorId(vendors[0].id);
    }
  }, [vendors, selectedVendorId]);

  // --- Handlers ---

  const handleAddVendor = () => {
    if (!newVendorName.trim()) {
      toast({ title: "Error", description: "Vendor name is required", variant: "destructive" });
      return;
    }
    
    const newVendor: Vendor = {
      id: `vendor_${Date.now()}`,
      name: newVendorName,
      fields: newVendorFields
    };
    
    setVendors([...vendors, newVendor]);
    setSelectedVendorId(newVendor.id);
    setIsVendorDialogOpen(false);
    setNewVendorName("");
    setNewVendorFields([]);
    toast({ title: "Success", description: "Vendor added successfully" });
  };

  const handleDeleteVendor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? This will delete all models for this vendor.")) {
      setVendors(vendors.filter(v => v.id !== id));
      setModels(models.filter(m => m.vendorId !== id));
      if (selectedVendorId === id) {
        setSelectedVendorId(null);
      }
      toast({ title: "Success", description: "Vendor deleted" });
    }
  };

  const handleAddField = () => {
    setNewVendorFields([
      ...newVendorFields,
      { key: '', label: '', type: 'string', required: false, sensitive: false }
    ]);
  };

  const handleRemoveField = (index: number) => {
    setNewVendorFields(newVendorFields.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index: number, field: Partial<FieldDefinition>) => {
    const updated = [...newVendorFields];
    updated[index] = { ...updated[index], ...field };
    setNewVendorFields(updated);
  };

  const handleAddModel = () => {
    if (!selectedVendorId) return;
    const newModel: ModelConfig = {
      id: `model_${Date.now()}`,
      vendorId: selectedVendorId,
      name: "New Model",
      enabled: false,
      config: {},
      status: 'unsaved'
    };
    setModels([...models, newModel]);
  };

  const handleDeleteModel = (id: string) => {
    if (window.confirm("Delete this model configuration?")) {
      setModels(models.filter(m => m.id !== id));
    }
  };

  const handleUpdateModel = (id: string, updates: Partial<ModelConfig>) => {
    setModels(models.map(m => m.id === id ? { ...m, ...updates, status: 'unsaved' } : m));
  };

  const handleUpdateModelConfig = (id: string, key: string, value: any) => {
    setModels(models.map(m => {
      if (m.id === id) {
        return {
          ...m,
          config: { ...m.config, [key]: value },
          status: 'unsaved'
        };
      }
      return m;
    }));
  };

  const handleSaveModel = (id: string) => {
    // Validate required fields
    const model = models.find(m => m.id === id);
    const vendor = vendors.find(v => v.id === model?.vendorId);
    
    if (model && vendor) {
      const missingFields = vendor.fields
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
    }

    setModels(models.map(m => m.id === id ? { ...m, status: 'saved' } : m));
    toast({ title: "Saved", description: "Model configuration saved" });
  };

  const handleTestModel = async (id: string) => {
    setModels(models.map(m => m.id === id ? { ...m, status: 'testing' } : m));
    
    // Mock test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate mock
      setModels(prev => prev.map(m => 
        m.id === id ? { ...m, status: success ? 'success' : 'failed' } : m
      ));
      
      if (success) {
        toast({ title: "Connection Successful", description: "Successfully connected to the model provider." });
      } else {
        toast({ title: "Connection Failed", description: "Could not connect to the model provider.", variant: "destructive" });
      }
    }, 1500);
  };

  const getStatusColor = (status: ModelConfig['status']) => {
    switch (status) {
      case 'saved': return 'text-green-600';
      case 'unsaved': return 'text-amber-600';
      case 'testing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: ModelConfig['status']) => {
    switch (status) {
      case 'saved': return <CheckCircle2 className="h-4 w-4" />;
      case 'unsaved': return <AlertCircle className="h-4 w-4" />;
      case 'testing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  const vendorModels = models.filter(m => m.vendorId === selectedVendorId);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Sidebar: Vendors */}
      <div className="w-64 border-r bg-muted/10 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <span className="font-semibold text-sm">模型厂商</span>
          <Button variant="ghost" size="icon" onClick={() => setIsVendorDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {vendors.map(vendor => (
              <div
                key={vendor.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                  selectedVendorId === vendor.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "hover:bg-muted text-foreground"
                )}
                onClick={() => setSelectedVendorId(vendor.id)}
              >
                <div className="flex items-center gap-2 truncate">
                  <Box className="h-4 w-4 opacity-70" />
                  <span className="truncate font-medium">{vendor.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedVendorId === vendor.id ? "text-primary-foreground hover:bg-primary-foreground/20" : "hover:bg-background/80"
                  )}
                  onClick={(e) => handleDeleteVendor(vendor.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {vendors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-xs">
                暂无厂商，请添加
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Models */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {selectedVendor ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b bg-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Box className="h-5 w-5 text-primary" />
                  {selectedVendor.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  管理 {selectedVendor.name} 下的模型配置
                </p>
              </div>
              <Button onClick={handleAddModel}>
                <Plus className="h-4 w-4 mr-2" />
                新增模型
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {vendorModels.map(model => (
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
                          <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100", getStatusColor(model.status))}>
                            {getStatusIcon(model.status)}
                            <span className="uppercase">{model.status}</span>
                          </div>
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
                        {selectedVendor.fields.map(field => (
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
                          disabled={model.status === 'testing'}
                        >
                          {model.status === 'testing' ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Play className="h-3 w-3 mr-2" />}
                          测试连接
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveModel(model.id)}
                          disabled={model.status === 'saved' || model.status === 'testing'}
                        >
                          <Save className="h-3 w-3 mr-2" />
                          保存配置
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {vendorModels.length === 0 && (
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
            <p>请在左侧选择或添加一个模型厂商</p>
          </div>
        )}
      </div>

      {/* Add Vendor Dialog */}
      <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增模型厂商</DialogTitle>
            <DialogDescription>定义厂商名称及所需的配置字段</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>厂商名称</Label>
              <Input 
                value={newVendorName} 
                onChange={(e) => setNewVendorName(e.target.value)} 
                placeholder="例如: OpenAI, Anthropic"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>配置字段定义</Label>
                <Button variant="outline" size="xs" onClick={handleAddField}>
                  <Plus className="h-3 w-3 mr-1" /> 添加字段
                </Button>
              </div>
              
              <div className="border rounded-md max-h-[300px] overflow-y-auto p-2 space-y-2 bg-slate-50">
                {newVendorFields.map((field, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-white p-2 rounded border shadow-sm">
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Key</Label>
                      <Input 
                        value={field.key} 
                        onChange={(e) => handleUpdateField(index, { key: e.target.value })}
                        placeholder="api_key"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input 
                        value={field.label} 
                        onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                        placeholder="API Key"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select 
                        value={field.type} 
                        onValueChange={(val: any) => handleUpdateField(index, { type: val })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1 justify-center h-full pb-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`req-${index}`} 
                          checked={field.required}
                          onCheckedChange={(c) => handleUpdateField(index, { required: c as boolean })}
                        />
                        <label htmlFor={`req-${index}`} className="text-xs cursor-pointer">必填</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`sen-${index}`} 
                          checked={field.sensitive}
                          onCheckedChange={(c) => handleUpdateField(index, { sensitive: c as boolean })}
                        />
                        <label htmlFor={`sen-${index}`} className="text-xs cursor-pointer">敏感</label>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end pb-1">
                       <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveField(index)}>
                         <XCircle className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ))}
                {newVendorFields.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    点击右上角添加配置字段
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVendorDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddVendor}>确认添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelSettings;

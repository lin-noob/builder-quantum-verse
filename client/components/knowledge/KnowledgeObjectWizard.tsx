import React, { useState } from "react";
import { 
  Database, 
  ShoppingCart, 
  FileText, 
  Settings2, 
  Plus, 
  Trash2, 
  ArrowRight,
  ChevronRight,
  Box,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { KnowledgeNode, KnowledgeNodeType, PropSource } from "../../types/knowledge";

interface WizardProps {
  initialData?: Partial<KnowledgeNode>;
  onClose: () => void;
  onSave: (data: KnowledgeNode) => void;
  isEditing?: boolean;
}

const WizardStep1 = ({ data, updateData }: { data: Partial<KnowledgeNode>, updateData: (d: Partial<KnowledgeNode>) => void }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-2">
      <h3 className="text-lg font-medium">步骤 1: 基础定义</h3>
      <p className="text-sm text-gray-500">定义知识对象的基本身份与类型。</p>
    </div>

    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
           <Label>对象类型</Label>
           <div className="space-y-2">
             {[
              { id: "Master", name: "主数据 (Master)", icon: Database },
              { id: "Transaction", name: "交易 (Transaction)", icon: ShoppingCart },
              { id: "Result", name: "结果 (Result)", icon: FileText },
            ].map((type) => (
              <div
                key={type.id}
                onClick={() => updateData({ type: type.id as KnowledgeNodeType })}
                className={`cursor-pointer rounded-lg border p-3 flex items-center gap-3 transition-all ${
                  data.type === type.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <type.icon className={`h-4 w-4 ${data.type === type.id ? "text-blue-600" : "text-gray-500"}`} />
                <span className={`font-medium text-sm ${data.type === type.id ? "text-blue-600" : "text-gray-900"}`}>{type.name}</span>
              </div>
            ))}
           </div>
        </div>
        
        <div className="space-y-4">
           <div className="grid gap-2">
            <Label htmlFor="name">对象名称</Label>
            <Input 
              id="name" 
              placeholder="例如：订单" 
              value={data.name || ""} 
              onChange={(e) => updateData({ name: e.target.value })} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="id">对象 ID</Label>
            <Input 
              id="id" 
              placeholder="例如：order" 
              className="font-mono"
              value={data.id || ""} 
              onChange={(e) => updateData({ id: e.target.value })} 
              disabled={!!data.stats} // Hack check for editing mode (stats usually exist on edit)
            />
          </div>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">业务描述</Label>
        <Textarea 
          id="description" 
          placeholder="请详细描述这个对象在知识图谱中的作用..." 
          className="h-24"
          value={data.description || ""} 
          onChange={(e) => updateData({ description: e.target.value })} 
        />
      </div>
    </div>
  </div>
);

const WizardStep2 = ({ data, updateData }: { data: Partial<KnowledgeNode>, updateData: (d: Partial<KnowledgeNode>) => void }) => {
  const addProperty = () => {
    const newProp = {
      id: `prop_${Date.now()}`,
      name: "",
      type: "string",
      source: PropSource.DB_COLUMN,
      sourceLabel: "数据库",
      description: ""
    };
    updateData({ properties: [...(data.properties || []), newProp] });
  };

  const updateProperty = (index: number, field: string, value: any) => {
    const newProps = [...(data.properties || [])];
    (newProps[index] as any)[field] = value;
    updateData({ properties: newProps });
  };

  const removeProperty = (index: number) => {
    const newProps = (data.properties || []).filter((_, i) => i !== index);
    updateData({ properties: newProps });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">步骤 2: 属性定义</h3>
        <p className="text-sm text-gray-500">配置对象的属性及其来源。</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>属性列表</Label>
          <Button size="sm" variant="outline" onClick={addProperty}>
            <Plus className="h-3 w-3 mr-1" /> 添加属性
          </Button>
        </div>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[150px]">属性名</TableHead>
                <TableHead className="w-[120px]">类型</TableHead>
                <TableHead className="w-[140px]">来源</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.properties || []).map((prop, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input 
                      value={prop.name} 
                      onChange={(e) => updateProperty(index, "name", e.target.value)} 
                      placeholder="属性名"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={prop.type} 
                      onValueChange={(val) => updateProperty(index, "type", val)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={prop.source} 
                      onValueChange={(val) => updateProperty(index, "source", val)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PropSource.DB_COLUMN}>DB Column</SelectItem>
                        <SelectItem value={PropSource.COMPUTED}>Computed</SelectItem>
                        <SelectItem value={PropSource.EXTERNAL_SYNC}>External</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={prop.description || ""} 
                      onChange={(e) => updateProperty(index, "description", e.target.value)} 
                      placeholder="描述..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => removeProperty(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(data.properties || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                    暂无属性，请添加
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export const KnowledgeObjectWizard: React.FC<WizardProps> = ({ initialData, onClose, onSave, isEditing = false }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<KnowledgeNode>>(initialData || {
    type: 'Master',
    properties: [],
    relations: [],
    actions: [],
    rules: [],
    stats: { inDegree: 0, outDegree: 0, referenceCount: 0, usageFrequency: 0 }
  });

  const handleFinish = () => {
    // Basic validation
    if (!formData.name || !formData.id) {
      alert("请填写名称和ID");
      return;
    }
    
    // Construct full object
    const finalData = {
      ...formData,
      icon: formData.icon || 'Box', // Default icon
      // Ensure arrays are initialized
      properties: formData.properties || [],
      relations: formData.relations || [],
      actions: formData.actions || [],
      rules: formData.rules || [],
      stats: formData.stats || { inDegree: 0, outDegree: 0, referenceCount: 0, usageFrequency: 0 }
    } as KnowledgeNode;

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEditing ? "编辑知识对象" : "新建知识对象"}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span className={step >= 1 ? "text-blue-600 font-medium" : ""}>1. 基础定义</span>
              <ChevronRight className="h-4 w-4" />
              <span className={step >= 2 ? "text-blue-600 font-medium" : ""}>2. 属性配置</span>
            </div>
          </div>
          <div className="w-48">
             <Progress value={step * 50} className="h-2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {step === 1 && <WizardStep1 data={formData} updateData={(d) => setFormData({...formData, ...d})} />}
          {step === 2 && <WizardStep2 data={formData} updateData={(d) => setFormData({...formData, ...d})} />}
        </div>

        <div className="px-8 py-4 border-t bg-gray-50/50 flex justify-between items-center">
          <Button variant="outline" onClick={() => {
            if (step > 1) setStep(step - 1);
            else onClose();
          }}>
            {step === 1 ? "取消" : "上一步"}
          </Button>
          <Button onClick={() => {
            if (step < 2) setStep(step + 1);
            else handleFinish();
          }} className="bg-blue-600 hover:bg-blue-700">
            {step === 2 ? (
              <><Save className="w-4 h-4 mr-2" /> 保存对象</>
            ) : (
              <><ArrowRight className="w-4 h-4 mr-2" /> 下一步</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

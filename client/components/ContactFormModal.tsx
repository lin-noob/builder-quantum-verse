import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Building, User, MessageCircle } from "lucide-react";

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  requirementType: string;
  requirements: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  open,
  onOpenChange,
  title = "联系我们",
  description = "请填写您的信息和需求，我们将尽快与您联系",
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    company: "",
    position: "",
    requirementType: "",
    requirements: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "请填写姓名",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({
        title: "请填写手机号",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        title: "请填写正确的邮箱地址",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.company.trim()) {
      toast({
        title: "请填写公司名称",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.requirementType) {
      toast({
        title: "请选择需求类型",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 这里可以添加实际的提交逻辑
      // 比如调用API发送表单数据
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      toast({
        title: "提交成功",
        description: "我们已收到您的需求，将在24小时内与您联系。",
      });
      
      // 重置表单
      setFormData({
        name: "",
        phone: "",
        email: "",
        company: "",
        position: "",
        requirementType: "",
        requirements: "",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "提交失败",
        description: "请稍后重试或直接联系我们的客服。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirementTypes = [
    { value: "demo", label: "产品演示" },
    { value: "trial", label: "免费试用" },
    { value: "consultation", label: "专业咨询" },
    { value: "custom", label: "定制需求" },
    { value: "cooperation", label: "商务合作" },
    { value: "other", label: "其他需求" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 flex items-center">
                <User className="h-4 w-4 mr-2" />
                姓名 *
              </Label>
              <Input
                id="name"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                手机号 *
              </Label>
              <Input
                id="phone"
                placeholder="请输入手机号"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              邮箱 *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱地址"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-300 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                公司名称 *
              </Label>
              <Input
                id="company"
                placeholder="请输入公司名称"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-300">
                职位
              </Label>
              <Input
                id="position"
                placeholder="请输入职位"
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirementType" className="text-gray-300">
              需求类型 *
            </Label>
            <Select
              value={formData.requirementType}
              onValueChange={(value) => handleInputChange("requirementType", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-cyan-500">
                <SelectValue placeholder="请选择您的需求类型" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {requirementTypes.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-gray-300 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              具体需求
            </Label>
            <Textarea
              id="requirements"
              placeholder="请详细描述您的需求，我们将为您提供更精准的服务..."
              value={formData.requirements}
              onChange={(e) => handleInputChange("requirements", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 min-h-[100px]"
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25 text-white font-semibold"
            >
              {isSubmitting ? "提交中..." : "提交需求"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;

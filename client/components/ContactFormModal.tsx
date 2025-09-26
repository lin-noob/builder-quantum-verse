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
import { request } from "@/lib/request";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

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
  title,
  description,
}) => {
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('contactForm.validation.nameRequired'),
        variant: "destructive",
      });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({
        title: t('contactForm.validation.phoneRequired'),
        variant: "destructive",
      });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        title: t('contactForm.validation.emailInvalid'),
        variant: "destructive",
      });
      return false;
    }
    if (!formData.company.trim()) {
      toast({
        title: t('contactForm.validation.companyRequired'),
        variant: "destructive",
      });
      return false;
    }
    if (!formData.requirementType) {
      toast({
        title: t('contactForm.validation.typeRequired'),
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
      const inputForm = {
        ...formData,
        username: formData.name,
      }
      await request.post('/admin/api/v1/auth/rfq', inputForm)
      toast({
        title: t('contactForm.toasts.successTitle'),
        description: t('contactForm.toasts.successDesc'),
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
        title: t('contactForm.toasts.failedTitle'),
        description: t('contactForm.toasts.failedDesc'),
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
            {title ?? t('modal.contactTitle')}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {description ?? t('modal.contactDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 flex items-center">
                <User className="h-4 w-4 mr-2" />
                {t('contactForm.fields.name')} *
              </Label>
              <Input
                id="name"
                placeholder={t('contactForm.placeholders.name')}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                {t('contactForm.fields.phone')} *
              </Label>
              <Input
                id="phone"
                placeholder={t('contactForm.placeholders.phone')}
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
              {t('contactForm.fields.email')} *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('contactForm.placeholders.email')}
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
                {t('contactForm.fields.company')} *
              </Label>
              <Input
                id="company"
                placeholder={t('contactForm.placeholders.company')}
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position" className="text-gray-300">
                {t('contactForm.fields.position')}
              </Label>
              <Input
                id="position"
                placeholder={t('contactForm.placeholders.position')}
                value={formData.position}
                onChange={(e) => handleInputChange("position", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirementType" className="text-gray-300">
              {t('contactForm.fields.requirementType')} *
            </Label>
            <Select
              value={formData.requirementType}
              onValueChange={(value) => handleInputChange("requirementType", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-cyan-500">
                <SelectValue placeholder={t('contactForm.placeholders.requirementType')} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {requirementTypes.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    {t(`contactForm.options.${type.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-gray-300 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('contactForm.fields.requirements')}
            </Label>
            <Textarea
              id="requirements"
              placeholder={t('contactForm.placeholders.requirements')}
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
              {t('contactForm.actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25 text-white font-semibold"
            >
              {isSubmitting ? t('contactForm.actions.submitting') : t('contactForm.actions.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Languages,
} from "lucide-react";
import "./I18nTranslationManager.css";
import { request } from "@/lib/request";
import {
  langCodeOptions,
  translateText,
} from "@/services/i18nService";

// 导入组件
import MenuTranslationComponent from "@/components/translation/MenuTranslationComponent";
import BackendExceptionComponent from "@/components/translation/BackendExceptionComponent";

// 类型定义
interface Language {
  id: string;
  name: string;
  code: string;
}

const I18nTranslationManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // 语言列表数据
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );

  // 编辑状态
  const [isEditLanguageDialogOpen, setIsEditLanguageDialogOpen] =
    useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  // 新增语言状态
  const [isAddLanguageDialogOpen, setIsAddLanguageDialogOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState<Omit<Language, "id">>({
    name: "",
    code: "",
  });

  // 初始化数据
  useEffect(() => {
    loadI18nData();
  }, []);

  // 加载多语言数据
  const loadI18nData = async () => {
    try {
      setLoading(true);

      // 获取语言列表
      const languageResponse = await request.get(
        "/admin/api/v1/auth/language",
      );
      const languageData: Language[] = languageResponse.data.data || [];
      setLanguages(languageData);
      if (languageData.length > 0) {
        setSelectedLanguage(languageData[0]); // 默认选择第一个语言
      }
    } catch (error) {
      console.error("Failed to load i18n data:", error);
      toast({
        title: "加载失败",
        description: "无法加载多语言配置数据，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理语言选择
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  // 处理保存编辑语言
  const handleSaveEditLanguage = async () => {
    if (!editingLanguage || !editingLanguage.name || !editingLanguage.code) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      // 调用API编辑语言
      await request.put("/admin/api/v1/language", editingLanguage);

      // 更新本地状态
      setLanguages((prev) =>
        prev.map((lang) =>
          lang.id === editingLanguage.id ? editingLanguage : lang,
        ),
      );

      // 如果编辑的是当前选中的语言，更新选中状态
      if (selectedLanguage && selectedLanguage.id === editingLanguage.id) {
        setSelectedLanguage(editingLanguage);
      }

      setIsEditLanguageDialogOpen(false);
      setEditingLanguage(null);

      toast({
        title: "保存成功",
        description: "语言信息已更新",
      });
    } catch (error) {
      console.error("Failed to update language:", error);
      toast({
        title: "保存失败",
        description: "无法更新语言信息，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理新增语言
  const handleAddLanguage = async () => {
    if (!newLanguage.name || !newLanguage.code) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      // 调用API新增语言
      const response = await request.post(
        "/admin/api/v1/language",
        newLanguage,
      );

      // 更新本地状态
      const language: Language = {
        id: response.data.data.id,
        ...newLanguage,
      };
      setLanguages((prev) => [...prev, language]);
      setIsAddLanguageDialogOpen(false);
      setNewLanguage({ name: "", code: "" });

      toast({
        title: "添加成功",
        description: "新的语言已添加",
      });
    } catch (error) {
      console.error("Failed to add language:", error);
      toast({
        title: "添加失败",
        description: "无法添加语言，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理删除语言
  const handleDeleteLanguage = async (languageId: string) => {
    const language = languages.find((lang) => lang.id === languageId);
    if (!language) return;

    // 显示确认对话框
    const confirmed = window.confirm(
      `确定要删除语言 "${language.name}" 吗？删除后将无法恢复。`,
    );
    if (!confirmed) return;

    try {
      // 调用删除API
      await request.delete(`/admin/api/v1/language/${languageId}`);

      // 更新本地状态
      setLanguages((prev) => prev.filter((lang) => lang.id !== languageId));

      // 如果删除的是当前选中的语言，切换到第一个可用语言
      if (selectedLanguage && selectedLanguage.id === languageId) {
        const remainingLanguages = languages.filter(
          (lang) => lang.id !== languageId,
        );
        setSelectedLanguage(
          remainingLanguages.length > 0 ? remainingLanguages[0] : null,
        );
      }

      toast({
        title: "删除成功",
        description: `语言 "${language.name}" 已删除`,
      });
    } catch (error) {
      console.error("Failed to delete language:", error);
      toast({
        title: "删除失败",
        description: "无法删除语言，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理菜单翻译
  const handleMenuTranslate = async () => {
    if (!selectedLanguage) {
      toast({
        title: "翻译失败",
        description: "请先选择语言",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "翻译中",
        description: "正在翻译菜单项...",
      });

      await translateText(selectedLanguage.id, true, 1);

      toast({
        title: "翻译成功",
        description: "菜单项已翻译完成",
      });
    } catch (error) {
      console.error("Failed to translate menu:", error);
      toast({
        title: "翻译失败",
        description: "菜单翻译失败，请重试",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 h-96 bg-gray-100 rounded"></div>
            <div className="lg:col-span-9 h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：语言列表 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>语言列表</CardTitle>
                <div className="flex gap-2">
                  <Dialog
                    open={isAddLanguageDialogOpen}
                    onOpenChange={setIsAddLanguageDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新增语言</DialogTitle>
                        <DialogDescription>添加新的语言支持</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="language-name">语言名称</Label>
                          <Input
                            id="language-name"
                            value={newLanguage.name}
                            onChange={(e) =>
                              setNewLanguage({
                                ...newLanguage,
                                name: e.target.value,
                              })
                            }
                            placeholder="例如: English"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language-code">
                            语言代码 <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="language-code"
                            value={newLanguage.code}
                            onChange={(e) =>
                              setNewLanguage({
                                ...newLanguage,
                                code: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">请选择语言代码</option>
                            {langCodeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} ({option.value})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddLanguageDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handleAddLanguage}>添加</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={isEditLanguageDialogOpen}
                    onOpenChange={setIsEditLanguageDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>编辑语言</DialogTitle>
                        <DialogDescription>编辑语言信息</DialogDescription>
                      </DialogHeader>
                      {editingLanguage && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-language-name">语言名称</Label>
                            <Input
                              id="edit-language-name"
                              value={editingLanguage.name}
                              onChange={(e) =>
                                setEditingLanguage({
                                  ...editingLanguage,
                                  name: e.target.value,
                                })
                              }
                              placeholder="例如: English"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-language-code">
                              语言代码 <span className="text-red-500">*</span>
                            </Label>
                            <select
                              id="edit-language-code"
                              value={editingLanguage.code}
                              onChange={(e) =>
                                setEditingLanguage({
                                  ...editingLanguage,
                                  code: e.target.value,
                                })
                              }
                              className="w-full p-2 border rounded-md"
                              required
                            >
                              <option value="">请选择语言代码</option>
                              {langCodeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label} ({option.value})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditLanguageDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handleSaveEditLanguage}>保存</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMenuTranslate}
                  disabled={!selectedLanguage}
                >
                  <Languages className="h-4 w-4 mr-2" />
                  翻译菜单
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-2">
                  {languages.map((language) => (
                    <div
                      key={language.id}
                      className={`flex cursor-pointer items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedLanguage?.id === language.id
                          ? "bg-blue-100 text-blue-900 border border-blue-200"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleSelectLanguage(language)}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 min-w-4" />
                        <div>
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {language.code}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLanguage({ ...language });
                            setIsEditLanguageDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLanguage(language.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：Tab 内容区域 */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="menu">菜单</TabsTrigger>
              <TabsTrigger value="backend">后台</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="mt-6">
              <MenuTranslationComponent selectedLanguage={selectedLanguage} />
            </TabsContent>
            
            <TabsContent value="backend" className="mt-6">
              <BackendExceptionComponent selectedLanguage={selectedLanguage} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default I18nTranslationManager;

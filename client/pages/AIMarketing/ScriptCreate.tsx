import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  scriptName: string;
  triggerType: "real_time_event" | "user_segment";
  eventName: string;
  eventField: string;
  eventOperator: string;
  eventValue: string;
  segmentField: string;
  segmentOperator: string;
  segmentValue: string;
  schedule: string;
  actionType: "content_generation" | "smart_recommendation" | "smart_discount";
  prompt: string;
}

export default function ScriptCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    scriptName: "",
    triggerType: "real_time_event",
    eventName: "",
    eventField: "",
    eventOperator: "",
    eventValue: "",
    segmentField: "",
    segmentOperator: "",
    segmentValue: "",
    schedule: "",
    actionType: "content_generation",
    prompt: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate form
      if (!formData.scriptName.trim()) {
        toast({
          title: "请填写剧本名称",
          variant: "destructive",
        });
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: isEditing ? "更新成功" : "创建成功",
        description: `剧本"${formData.scriptName}"已保存`,
      });

      navigate("/ai-marketing/semi-auto");
    } catch (error) {
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Event name options
  const eventNameOptions = [
    { value: "add_to_cart", label: "加入购物车" },
    { value: "page_view", label: "浏览页面" },
    { value: "submit_form", label: "提交表单" },
    { value: "user_register", label: "用户注册" },
    { value: "start_checkout", label: "开始结账" },
  ];

  // Event field options based on selected event
  const getEventFieldOptions = () => {
    switch (formData.eventName) {
      case "add_to_cart":
        return [
          { value: "价格", label: "价格" },
          { value: "商品ID", label: "商品ID" },
          { value: "品类", label: "品类" },
        ];
      case "page_view":
        return [
          { value: "URL", label: "URL" },
          { value: "页面标题", label: "页面标题" },
          { value: "停留时长", label: "停留时长" },
        ];
      case "submit_form":
        return [
          { value: "表单名", label: "表单名" },
          { value: "表单字段", label: "表单字段" },
        ];
      default:
        return [];
    }
  };

  // User segment field options
  const segmentFieldOptions = [
    { value: "总订单数", label: "总订单数" },
    { value: "最后访问", label: "最后访问距今天数" },
    { value: "用户标签", label: "用户标签" },
    { value: "生日", label: "生日" },
    { value: "累计消费", label: "累计消费金额" },
  ];

  // Operator options
  const operatorOptions = [
    { value: "=", label: "等于" },
    { value: "!=", label: "不等于" },
    { value: ">", label: "大于" },
    { value: "<", label: "小于" },
    { value: "包含", label: "包含" },
    { value: "不包含", label: "不包含" },
  ];

  // Schedule options
  const scheduleOptions = [
    { value: "每日", label: "每日" },
    { value: "每周", label: "每周" },
    { value: "每月", label: "每月" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/ai-marketing/semi-auto")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
      </div>

      <div className="space-y-6">
        {/* Step 1: Script Name and Trigger */}
        <Card>
          <CardHeader>
            <CardTitle>步骤一：命名与触发器配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Script Name */}
            <div>
              <Label>剧本名称</Label>
              <Input
                className="mt-1"
                placeholder="例如：高价商品加购挽留"
                value={formData.scriptName}
                onChange={(e) =>
                  handleInputChange("scriptName", e.target.value)
                }
              />
            </div>

            {/* Trigger Type Selection */}
            <div>
              <Label className="text-base font-medium">触发器类型</Label>
              <RadioGroup
                value={formData.triggerType}
                onValueChange={(value: "real_time_event" | "user_segment") =>
                  handleInputChange("triggerType", value)
                }
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="real_time_event" id="real_time" />
                  <Label htmlFor="real_time">实时事件</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user_segment" id="user_segment" />
                  <Label htmlFor="user_segment">用户模式</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Real Time Event Configuration */}
            {formData.triggerType === "real_time_event" && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label>当以下事件发生时</Label>
                  <Select
                    value={formData.eventName}
                    onValueChange={(value) =>
                      handleInputChange("eventName", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择事件类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventNameOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.eventName && (
                  <div>
                    <Label>并且满足条件</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                      <Select
                        value={formData.eventField}
                        onValueChange={(value) =>
                          handleInputChange("eventField", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="字段" />
                        </SelectTrigger>
                        <SelectContent>
                          {getEventFieldOptions().map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={formData.eventOperator}
                        onValueChange={(value) =>
                          handleInputChange("eventOperator", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="操作符" />
                        </SelectTrigger>
                        <SelectContent>
                          {operatorOptions.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="值"
                        value={formData.eventValue}
                        onChange={(e) =>
                          handleInputChange("eventValue", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Segment Configuration */}
            {formData.triggerType === "user_segment" && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label>筛选用户</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    <Select
                      value={formData.segmentField}
                      onValueChange={(value) =>
                        handleInputChange("segmentField", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="字段" />
                      </SelectTrigger>
                      <SelectContent>
                        {segmentFieldOptions.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.segmentOperator}
                      onValueChange={(value) =>
                        handleInputChange("segmentOperator", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="操作类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="值"
                      value={formData.segmentValue}
                      onChange={(e) =>
                        handleInputChange("segmentValue", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>执行频率</Label>
                  <Select
                    value={formData.schedule}
                    onValueChange={(value) =>
                      handleInputChange("schedule", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="选择执行频率" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Configure AI Action */}
        <Card>
          <CardHeader>
            <CardTitle>步骤二：配置AI动作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Type Selection */}
            <div>
              <Label className="text-base font-medium">动作类型</Label>
              <RadioGroup
                value={formData.actionType}
                onValueChange={(
                  value:
                    | "content_generation"
                    | "smart_recommendation"
                    | "smart_discount",
                ) => handleInputChange("actionType", value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="content_generation" id="content_gen" />
                  <Label htmlFor="content_gen">AI内容生成</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="smart_recommendation" id="smart_rec" />
                  <Label htmlFor="smart_rec">AI智能推荐</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="smart_discount" id="smart_discount" />
                  <Label htmlFor="smart_discount">AI智能优惠</Label>
                </div>
              </RadioGroup>
            </div>

            {/* AI Prompt for Content Generation */}
            {formData.actionType === "content_generation" && (
              <div className="border-t pt-4">
                <Label>AI指令简报 (Prompt)</Label>
                <Textarea
                  className="mt-1"
                  placeholder="请描述您希望AI生成什么样的内容。例如：根据用户加购的高价商品，生成个性化的挽留邮件，强调商品价值和限时优惠..."
                  rows={6}
                  value={formData.prompt}
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  请详细描述AI应该如何生成内容，包括语调、重点信息、目标效果等。
                </p>
              </div>
            )}

            {/* Configuration for Smart Recommendation */}
            {formData.actionType === "smart_recommendation" && (
              <div className="border-t pt-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      AI智能推荐
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 mt-2">
                    AI将根据用户行为和偏好，自动推荐最相关的产品或服务。
                  </p>
                </div>
              </div>
            )}

            {/* Configuration for Smart Discount */}
            {formData.actionType === "smart_discount" && (
              <div className="border-t pt-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      AI智能优惠
                    </span>
                  </div>
                  <p className="text-sm text-green-800 mt-2">
                    AI将根据用户价值和行为特征，自动计算并提供个性化的优惠方案。
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "保存中..." : "保存剧本"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import {
  Plus,
  Edit,
  Trash2,
  CopyPlus,
  GripVertical,
  HelpCircle,
  Check,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  eventRuleService,
  starterTemplates,
} from "@/services/eventRuleService";
import {
  EventRule,
  EventType,
  NamedEvent,
  RawEventType,
  summarizeRule,
} from "@shared/eventRuleTypes";
import { ruleService, CreateRuleRequest, BackendRule } from "@/services/ruleService";
import { ruleTypeService } from "@/services/ruleTypeService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const RulesPage = () => {
  const { t } = useTranslation();
  const eventLabels: Record<string, string> = {
    // UserRegister: t("sessionTimeline.eventTypes.UserRegister"),
    // UserLogin: t("sessionTimeline.eventTypes.UserLogin"),
    // ViewProduct: t("sessionTimeline.eventTypes.ViewProduct"),
    // AddToCart: t("sessionTimeline.eventTypes.AddToCart"),
    // RemoveFromCart: t("sessionTimeline.eventTypes.RemoveFromCart"),
    // StartCheckout: t("sessionTimeline.eventTypes.StartCheckout"),
    // CompletePurchase: t("sessionTimeline.eventTypes.CompletePurchase"),
  };

  const rawTypeLabels: Partial<Record<EventType, string>> = {
    Click: t("sessionTimeline.eventTypes.Click"),
    Submit: t("sessionTimeline.eventTypes.SubmitForm"),
    $pageview: t("sessionTimeline.eventTypes.PageView"),
  };
  const [rules, setRules] = useState<EventRule[]>([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<EventRule | null>(null);
  const [customEvents, setCustomEvents] = useState<string[]>([]);
  const [ruleTypes, setRuleTypes] = useState<Map<string, string>>(new Map()); // eventName -> id mapping
  const [resultEvents, setResultEvents] = useState<BackendRule[]>([]); // 结果事件列表
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [showInlineAddEvent, setShowInlineAddEvent] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [draggedRule, setDraggedRule] = useState<string | null>(null);
  const [draggedOutcome, setDraggedOutcome] = useState<string | null>(null);
  const [outcomeNewEventName, setOutcomeNewEventName] = useState("");
  const { toast } = useToast();

  /**
   * Load rules from backend API
   * 从后端API加载规则列表
   */
  const loadRulesFromBackend = async () => {
    try {
      const backendRules = await ruleService.getRules();
      const convertedRules = backendRules.map(convertFromBackendRule);

      // Update state
      setRules(convertedRules);

      return convertedRules;
    } catch (error) {
      console.error("Failed to load rules from backend:", error);
      return [];
    }
  };

  /**
   * Convert frontend EventRule to backend API format
   * 将EventRule格式转换为后端API格式
   */
  const convertToBackendRule = (rule: EventRule): CreateRuleRequest => {
    // Join titleAlias (text aliases) with commas
    const titleAlias =
      rule.conditions.text?.aliases?.filter(Boolean).join(",") || "";

    // Join titleContains (pageTitleIncludes) with commas
    const titleContains =
      rule.conditions.pageTitleIncludes?.filter(Boolean).join(",") || "";

    // Convert selector attributes to string format (key=value,key=value)
    const attributes = rule.conditions.selector?.attributesRaw ?? "";

    return {
      ruleName: rule.name,
      eventType: rule.conditions.eventType,
      targetEvent: rule.targetEvent,
      selector: rule.conditions.selector?.selector || "",
      attributes: attributes,
      titleAlias: titleAlias,
      titleContains: titleContains,
      titleMatchMode: rule.conditions.text?.matchMode || "contains",
      urlMatchType: rule.scope.type,
      urlMatchValue: rule.scope.value,
      dedupStrategy: rule.dedup?.oncePerSession ? "session" : "window",
      dedupWindow: rule.dedup?.windowSeconds || 0,
      enableFlag: rule.enabled,
      sortOrder: rule.priority,
    };
  };

  /**
   * Convert backend rule to frontend EventRule format
   * 将后端规则格式转换为前端EventRule格式
   */
  const convertFromBackendRule = (backendRule: any): EventRule => {
    // Split titleAlias (comma-separated) into array
    const aliases = backendRule.titleAlias
      ? backendRule.titleAlias
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    // Split titleContains (comma-separated) into array
    const pageTitleIncludes = backendRule.titleContains
      ? backendRule.titleContains
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

    // Parse attributes string (key=value,key=value) into object
    const attributes: Record<string, string> = {};
    if (backendRule.attributes) {
      const kvPairs = backendRule.attributes
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      kvPairs.forEach((kv: string) => {
        const parts = kv.split("=");
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join("=").trim();
          if (k && v) attributes[k] = v;
        }
      });
    }

    return {
      id: `rule_${backendRule.id}`,
      backendId: backendRule.id,
      name: backendRule.ruleName || "",
      targetEvent: backendRule.targetEvent || "",
      scope: {
        type: (backendRule.urlMatchType || "prefix") as "prefix" | "regex",
        value: backendRule.urlMatchValue || "/",
      },
      conditions: {
        eventType: backendRule.eventType || "Click",
        text:
          aliases.length > 0
            ? {
                aliases: aliases,
                matchMode: (backendRule.titleMatchMode || "contains") as any,
              }
            : undefined,
        selector:
          backendRule.selector || Object.keys(attributes).length > 0
            ? {
                selector: backendRule.selector || undefined,
                attributes:
                  Object.keys(attributes).length > 0 ? attributes : undefined,
                attributesRaw: backendRule.attributes || undefined,
              }
            : undefined,
        pageTitleIncludes:
          pageTitleIncludes.length > 0 ? pageTitleIncludes : undefined,
      },
      enabled: backendRule.enableFlag !== false,
      priority: backendRule.sortOrder || 0,
      dedup: {
        windowSeconds: backendRule.dedupWindow || 0,
        oncePerSession: backendRule.dedupStrategy === "session",
      },
      createdAt: backendRule.gmtCreate || new Date().toISOString(),
      updatedAt: backendRule.gmtModified || new Date().toISOString(),
    };
  };

  /**
   * Load custom events from backend API
   */
  const loadCustomEvents = async () => {
    try {
      const types = await ruleTypeService.list();
      const eventNames = types.map((rt) => rt.eventName);
      const typeMap = new Map(types.map((rt) => [rt.eventName, rt.id]));

      setCustomEvents(eventNames);
      setRuleTypes(typeMap);
    } catch (error) {
      console.error("Failed to load custom events from backend:", error);
      toast({
        title: "加载失败",
        description: "加载自定义事件失败",
        variant: "destructive",
      });
    }
  };

  /**
   * Load result events from backend API
   * 从后端API加载结果事件列表
   */
  const loadResultEvents = async () => {
    try {
      const events = await ruleService.getRules(2);
      setResultEvents(events);
    } catch (error) {
      console.error("Failed to load result events from backend:", error);
      toast({
        title: "加载失败",
        description: "加载结果事件列表失败",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load rules from backend on component mount
    loadRulesFromBackend();
    // Load custom events from backend
    loadCustomEvents();
    // Load result events from backend
    loadResultEvents();
  }, []);

  const handleCreate = () => {
    setEditingRule({
      id: "",
      name: "",
      targetEvent: "UserLogin",
      scope: { type: "prefix", value: "/" },
      conditions: {
        eventType: "Click",
        text: { aliases: [], matchMode: "contains" },
      },
      enabled: true,
      priority: Math.max(...rules.map((r) => r.priority), 0) + 1,
      dedup: { windowSeconds: 5, oncePerSession: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setOpenEditor(true);
  };

  const handleEdit = (rule: EventRule) => {
    setEditingRule(rule);
    setOpenEditor(true);
  };

  const handleDelete = async (rule: EventRule) => {
    try {
      // Delete from backend if it has a backend ID
      if (rule.backendId) {
        await ruleService.deleteRule(rule.backendId);
      }

      toast({
        title: "成功",
        description: "规则删除成功",
      });

      loadRulesFromBackend();
    } catch (error) {
      console.error("Failed to delete rule:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "删除规则失败",
        variant: "destructive",
      });
    }
  };

  const saveRule = async () => {
    if (!editingRule) return;
    if (!editingRule.name.trim()) {
      toast({
        title: "错误",
        description: "规则名称不能为空",
        variant: "destructive",
      });
      return;
    }

    if (!editingRule.targetEvent.trim()) {
      toast({
        title: "错误",
        description: "请选择目标事件",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one identification condition is filled
    const hasTextAliases = editingRule.conditions.text?.aliases?.some(
      (alias) => alias.trim() !== "",
    );
    const hasTitleIncludes = editingRule.conditions.pageTitleIncludes?.some(
      (title) => title.trim() !== "",
    );
    const hasSelector = editingRule.conditions.selector?.selector?.trim();
    const hasAttributes =
      editingRule.conditions.selector?.attributesRaw?.trim() ||
      (editingRule.conditions.selector?.attributes &&
        Object.keys(editingRule.conditions.selector.attributes).length > 0);
    try {
      // Convert to backend format
      const backendRule = convertToBackendRule(editingRule);

      let savedRule: any;
      let updatedEditingRule = { ...editingRule };

      // Check if this is an update or create operation
      if (editingRule.backendId) {
        // Update existing rule
        await ruleService.updateRule(editingRule.backendId, backendRule);
        toast({
          title: "成功",
          description: "规则更新成功",
        });
      } else {
        // Create new rule
        await ruleService.createRule(backendRule);
        toast({
          title: "成功",
          description: "规则创建成功",
        });
      }

      // Also save to local storage for UI consistency
      setOpenEditor(false);
      setEditingRule(null);
      // 重置下拉框相关状态
      setShowInlineAddEvent(false);
      setNewEventName("");
      setSelectOpen(false);
      loadRulesFromBackend();
    } catch (error) {
      console.error("Failed to save rule:", error);
      toast({
        title: "错误",
        description: error instanceof Error ? error.message : "保存规则失败",
        variant: "destructive",
      });
    }
  };

  const updateEditing = (patch: Partial<EventRule>) => {
    setEditingRule((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const addCustomEvent = async () => {
    const name = newEventName.trim();
    if (!name) return;

    // 检查是否已存在
    if (customEvents.includes(name)) {
      toast({
        title: "事件已存在",
        description: `事件 "${name}" 已经存在`,
        variant: "destructive",
      });
      return;
    }

    try {
      // 调用后端API创建
      await ruleTypeService.create(name);

      // 重新加载列表
      await loadCustomEvents();

      // 更新编辑中的规则
      updateEditing({ targetEvent: name as NamedEvent });

      toast({
        title: "创建成功",
        description: `自定义事件 "${name}" 创建成功`,
      });
    } catch (error) {
      console.error("Failed to create custom event:", error);
      toast({
        title: "创建失败",
        description: "创建自定义事件失败，请稍后重试",
        variant: "destructive",
      });
      return;
    }

    setShowAddEvent(false);
    setShowInlineAddEvent(false);
    setNewEventName("");
  };

  const cancelAddEvent = () => {
    setShowAddEvent(false);
    setShowInlineAddEvent(false);
    setNewEventName("");
    // 保持下拉框打开状态，不调用 setSelectOpen(false)
  };

  const [outcomeDrawerOpen, setOutcomeDrawerOpen] = useState(false);
  const [editingOutcomeId, setEditingOutcomeId] = useState<string | null>(null);
  const [editingOutcomeEvent, setEditingOutcomeEvent] = useState<any>(null); // 保存正在编辑的完整事件对象
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formRemark, setFormRemark] = useState("");
  const [formErrorName, setFormErrorName] = useState<string | null>(null);
  const [formErrorCode, setFormErrorCode] = useState<string | null>(null);
  // 事件标识选项与细化标识管理
  const baseCodeOptions = [
    { value: "UserLogin", label: "登录" },
    { value: "UserRegister", label: "注册" },
    { value: "Quote", label: "询价" },
    { value: "AddToCart", label: "加购" },
    { value: "StartCheckout", label: "下单" },
    { value: "CompletePurchase", label: "结算" },
    { value: "ContactUs", label: "联系我们" },
    { value: "BoxBuildSubmit", label: "整机组装报价" },
    { value: "ClickHomeInquiry", label: "首页询价按钮点击" },
    { value: "ClickBannerInquiry", label: "首页banner询价" },
    { value: "ArticleContentClick", label: "文章内嵌点击" },
  ];

  const baseCodeMap = {
    UserLogin: "登录",
    UserRegister: "注册",
    Quote: "询价",
    AddToCart: "加购",
    StartCheckout: "下单",
    CompletePurchase: "结算",
    ContactUs: "联系我们",
    BoxBuildSubmit: "整机组装报价",
    ClickHomeInquiry: "首页询价按钮点击",
    ClickBannerInquiry: "首页banner询价",
    ArticleContentClick: "文章内嵌点击",
  };

  const toTrackMethodName = (eventCode: string) => {
    if (!eventCode) return "";
    return eventCode.charAt(0).toLowerCase() + eventCode.slice(1) + "Track";
  };
  const [detailMap, setDetailMap] = useState<
    Record<string, Array<{ key: string; value: string }>>
  >({});
  const [detailKeyInput, setDetailKeyInput] = useState("");
  const [detailValueInput, setDetailValueInput] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<{
    key: string;
    value: string;
  } | null>(null);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );
  const [detailEditKey, setDetailEditKey] = useState("");
  const [detailEditValue, setDetailEditValue] = useState("");

  const toCode = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "_");

  const openCreateOutcomeDrawer = () => {
    const seed = outcomeNewEventName.trim();
    setEditingOutcomeId(null);
    setEditingOutcomeEvent(null); // 清空编辑中的事件
    setFormName(seed);
    setFormCode(seed ? toCode(seed) : "");
    setFormCode(baseCodeOptions[0].value);
    setFormEnabled(true);
    setFormRemark("");
    setFormErrorName(null);
    setFormErrorCode(null);
    setOutcomeDrawerOpen(true);
  };

  const openEditOutcomeDrawer = (eventId: string) => {
    // 从结果事件列表中查找对应的事件数据
    const event = resultEvents.find((e) => e.id === eventId);
    if (!event) {
      toast({
        title: "错误",
        description: "未找到该结果事件",
        variant: "destructive",
      });
      return;
    }

    // 保存完整的事件对象，编辑时会用到其他字段
    setEditingOutcomeEvent(event);
    setEditingOutcomeId(eventId);
    setFormName(event.ruleName);
    setFormCode(event.eventType); // eventIdentifier -> eventType
    setFormEnabled(event.enableFlag);
    setFormRemark(event.remark || "");

    try {
      const detailArray = event.attributes // detailIdentifier -> attributes
        ? JSON.parse(event.attributes)
        : [];
      setDetailMap((prev) => ({
        ...prev,
        [event.eventType]: detailArray, // eventIdentifier -> eventType
      }));
    } catch (error) {
      console.error("Failed to parse attributes:", error); // detailIdentifier -> attributes
      setDetailMap((prev) => ({ ...prev, [event.eventType]: [] })); // eventIdentifier -> eventType
    }

    setFormErrorName(null);
    setFormErrorCode(null);
    setOutcomeDrawerOpen(true);
  };

  const validateOutcomeForm = () => {
    let valid = true;
    if (
      !formName.trim() ||
      formName.trim().length < 1 ||
      formName.trim().length > 50
    ) {
      setFormErrorName("事件名称需为1–50个字符，且不能仅空格");
      valid = false;
    } else {
      setFormErrorName(null);
    }
    // 必须选择事件标识
    if (!formCode) {
      setFormErrorCode("请选择事件标识");
      valid = false;
    } else {
      setFormErrorCode(null);
    }
    return valid;
  };

  const saveOutcomeEvent = async () => {
    if (!validateOutcomeForm()) return;
    const name = formName.trim();
    if (!editingOutcomeId) {
      // 新建：调用 ruleService.createRule 接口，传入 ruleType: 2
      try {
        const detailIdentifierArray = detailMap[formCode || ""] || [];
        const attributesStr =
          detailIdentifierArray.length > 0
            ? JSON.stringify(detailIdentifierArray)
            : "";

        // 字段映射：eventIdentifier -> eventType, detailIdentifier -> attributes
        await ruleService.createRule({
          ruleName: name,
          eventType: formCode, // eventIdentifier -> eventType
          targetEvent: name, // 结果事件的 targetEvent 设为与 eventType 相同
          attributes: attributesStr, // detailIdentifier -> attributes
          enableFlag: formEnabled,
          remark: formRemark,
          // 必填字段默认值（结果事件不需要这些字段，但接口要求）
          urlMatchType: "prefix",
          urlMatchValue: "/",
          dedupWindow: 0,
        }, 2); // ruleType: 2

        await loadCustomEvents();
        await loadResultEvents();
        toast({
          title: "已保存结果事件",
          description: `已保存结果事件"${name}"`,
        });
        setOutcomeDrawerOpen(false);
      } catch (error) {
        console.error("Failed to create result event:", error);
        toast({
          title: "保存失败",
          description:
            error instanceof Error
              ? error.message
              : "创建结果事件失败，请稍后重试",
          variant: "destructive",
        });
      }
    } else {
      const detailIdentifierArray = detailMap[formCode || ""] || [];
      const attributesStr =
        detailIdentifierArray.length > 0
          ? JSON.stringify(detailIdentifierArray)
          : "";

      try {
        // 字段映射：eventIdentifier -> eventType, detailIdentifier -> attributes
        await ruleService.updateRule(Number(editingOutcomeId), {
          ruleName: name,
          eventType: formCode, // eventIdentifier -> eventType
          targetEvent: name, // 结果事件的 targetEvent 设为与 eventType 相同
          attributes: attributesStr, // detailIdentifier -> attributes
          enableFlag: formEnabled,
          remark: formRemark,
          sortOrder: editingOutcomeEvent?.sortOrder, // 从列表数据中获取 sortOrder
          // 必填字段默认值（结果事件不需要这些字段，但接口要求）
          urlMatchType: "prefix",
          urlMatchValue: "/",
          dedupWindow: 0,
        }, 2); // ruleType: 2

        await loadCustomEvents();
        await loadResultEvents();
        toast({
          title: "已更新结果事件",
        });
        setOutcomeDrawerOpen(false);
      } catch (error) {
        console.error("Failed to update result event:", error);
        toast({
          title: "更新失败",
          description:
            error instanceof Error
              ? error.message
              : "更新结果事件失败，请稍后重试",
          variant: "destructive",
        });
      }
    }
  };

  // 删除结果事件
  const deleteResultEvent = async (eventId: string) => {
    try {
      await ruleService.deleteRule(Number(eventId));
      await loadResultEvents();
      toast({ title: "删除成功", description: "结果事件已删除" });
    } catch (error) {
      console.error("Failed to delete result event:", error);
      toast({
        title: "删除失败",
        description:
          error instanceof Error
            ? error.message
            : "删除结果事件失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  // 拖拽处理函数
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    ruleId: string,
  ) => {
    setDraggedRule(ruleId);
    if (e.currentTarget) {
      e.currentTarget.classList.add("opacity-50");
    }
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", ruleId);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedRule(null);
    if (e.currentTarget) {
      e.currentTarget.classList.remove("opacity-50");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    console.log(targetIndex);
    e.preventDefault();
    const draggedRuleId = e.dataTransfer.getData("text/plain");

    if (draggedRuleId && draggedRule) {
      const draggedIndex = rules.findIndex((rule) => rule.id === draggedRuleId);
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const sourceRule = rules[draggedIndex];
        const targetRule = rules[targetIndex];

        // Check if both rules have backend IDs
        if (sourceRule.backendId && targetRule.backendId) {
          try {
            // Call backend API to move the rule
            await ruleService.moveRule(
              sourceRule.backendId,
              targetRule.backendId,
            );

            toast({
              title: "成功",
              description: "规则顺序已更新",
            });
          } catch (error) {
            console.error("Failed to move rule:", error);
            toast({
              title: "错误",
              variant: "destructive",
            });
            setDraggedRule(null);
            return;
          }
        }

        // Update local state
        // const newRules = [...rules];
        // const [draggedItem] = newRules.splice(draggedIndex, 1);
        // newRules.splice(targetIndex, 0, draggedItem);
        // setRules(newRules);
        loadRulesFromBackend();
      }
    }

    setDraggedRule(null);
  };

  // 结果事件列表拖拽（调用后端排序）
  const handleOutcomeDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    eventId: string,
  ) => {
    setDraggedOutcome(eventId);
    if (e.currentTarget) {
      e.currentTarget.classList.add("opacity-50");
    }
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", eventId);
    }
  };

  const handleOutcomeDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedOutcome(null);
    if (e.currentTarget) {
      e.currentTarget.classList.remove("opacity-50");
    }
  };

  const handleOutcomeDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleOutcomeDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleOutcomeDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    e.preventDefault();
    const draggedEventId = e.dataTransfer.getData("text/plain");

    if (draggedEventId && draggedOutcome) {
      const draggedIndex = resultEvents.findIndex(
        (event) => event.id === draggedEventId,
      );
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const sourceEvent = resultEvents[draggedIndex];
        const targetEvent = resultEvents[targetIndex];

        // Check if both events have IDs
        if (sourceEvent.id && targetEvent.id) {
          try {
            // Call ruleService.moveRule to move the result event
            await ruleService.moveRule(Number(sourceEvent.id), Number(targetEvent.id));

            toast({
              title: "成功",
              description: "结果事件顺序已更新",
            });

            // Reload the list
            await loadResultEvents();
          } catch (error) {
            console.error("Failed to move result event:", error);
            toast({
              title: "错误",
              description:
                error instanceof Error ? error.message : "移动结果事件失败",
              variant: "destructive",
            });
            setDraggedOutcome(null);
            return;
          }
        }
      }
    }

    setDraggedOutcome(null);
  };

  const updateTextAliases = (idx: number, value: string) => {
    if (!editingRule) return;
    const aliases = editingRule.conditions.text?.aliases || [];
    const next = [...aliases];
    next[idx] = value;
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        text: {
          aliases: next,
          matchMode: editingRule.conditions.text?.matchMode || "contains",
        },
      },
    });
  };

  const addAlias = () => {
    if (!editingRule) return;
    const aliases = editingRule.conditions.text?.aliases || [];
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        text: {
          aliases: [...aliases, ""],
          matchMode: editingRule.conditions.text?.matchMode || "contains",
        },
      },
    });
  };

  const removeAlias = (idx: number) => {
    if (!editingRule) return;
    const aliases = editingRule.conditions.text?.aliases || [];
    const next = aliases.filter((_, i) => i !== idx);
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        text: {
          aliases: next,
          matchMode: editingRule.conditions.text?.matchMode || "contains",
        },
      },
    });
  };

  const updateTitleIncludes = (idx: number, value: string) => {
    if (!editingRule) return;
    const list = editingRule.conditions.pageTitleIncludes || [];
    const next = [...list];
    next[idx] = value;
    updateEditing({
      conditions: { ...editingRule.conditions, pageTitleIncludes: next },
    });
  };

  const addTitleInclude = () => {
    if (!editingRule) return;
    const list = editingRule.conditions.pageTitleIncludes || [];
    updateEditing({
      conditions: {
        ...editingRule.conditions,
        pageTitleIncludes: [...list, ""],
      },
    });
  };

  const removeTitleInclude = (idx: number) => {
    if (!editingRule) return;
    const list = editingRule.conditions.pageTitleIncludes || [];
    const next = list.filter((_, i) => i !== idx);
    updateEditing({
      conditions: { ...editingRule.conditions, pageTitleIncludes: next },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue="ruleBuilder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ruleBuilder">事件规则</TabsTrigger>
          <TabsTrigger value="outcomes">结果事件</TabsTrigger>
        </TabsList>

        <TabsContent value="ruleBuilder" className="space-y-4">
          <div className="flex justify-start">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" /> 新建规则
            </Button>
          </div>
          <Card>
            <CardContent className="space-y-3 pt-4">
              {rules.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  暂无规则，点击"新建规则"开始。
                </div>
              ) : (
                rules.map((rule, idx) => (
                  <Card
                    key={idx}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`transition-opacity ${draggedRule === rule.id ? "opacity-50" : ""}`}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, rule.id)}
                            onDragEnd={handleDragEnd}
                            className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="font-medium">{rule.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={rule.enabled ? "default" : "secondary"}
                          >
                            {rule.targetEvent}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rule)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* 编辑抽屉 */}
          <Sheet
            open={openEditor}
            onOpenChange={(open) => {
              setOpenEditor(open);
              if (!open) {
                // 关闭编辑器时重置所有状态
                setShowInlineAddEvent(false);
                setNewEventName("");
                setSelectOpen(false);
              }
            }}
          >
            <SheetContent side="right" className="w-[720px] sm:w-[840px] p-0">
              <div className="flex h-full flex-col">
                <div className="flex-none p-6">
                  <SheetHeader>
                    <SheetTitle>
                      {editingRule?.id ? "编辑规则" : "新建规则"}
                    </SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {editingRule && (
                    <div className="space-y-6">
                      {/* 基础信息卡片 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">基础信息</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-2">
                              <Label>规则名称</Label>
                              <Input
                                value={editingRule.name}
                                onChange={(e) =>
                                  updateEditing({ name: e.target.value })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                <Label>目标事件</Label>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs bg-gray-900 text-white border-gray-700"
                                  >
                                    规则匹配成功后产出业务事件名称，用于报表显示自动化策略触发；可选择内置或自定义事件。
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Select
                                value={editingRule.targetEvent}
                                open={selectOpen}
                                onOpenChange={(open) => {
                                  // 如果正在显示内联添加事件，不允许关闭下拉框
                                  if (!open && showInlineAddEvent) {
                                    return;
                                  }
                                  setSelectOpen(open);
                                  if (!open) {
                                    setShowInlineAddEvent(false);
                                    setNewEventName("");
                                  }
                                }}
                                onValueChange={(v) => {
                                  if (v === "__add_new__") {
                                    setShowInlineAddEvent(true);
                                    setNewEventName("");
                                    setSelectOpen(true); // 保持下拉框打开
                                  } else {
                                    updateEditing({
                                      targetEvent: v as NamedEvent,
                                    });
                                    setSelectOpen(false); // 选择其他选项时关闭下拉框
                                  }
                                }}
                              >
                                <SelectTrigger
                                  onKeyDown={(e) => {
                                    if (showInlineAddEvent && selectOpen) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  <SelectValue placeholder="选择事件" />
                                </SelectTrigger>
                                <SelectContent
                                  className="max-h-[300px]"
                                  onKeyDown={(e) => {
                                    // 当显示内联输入框时，禁用键盘导航
                                    if (showInlineAddEvent) {
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  <div className="max-h-[250px] overflow-y-auto">
                                    {Object.keys(eventLabels).map((k) => (
                                      <SelectItem key={k} value={k}>
                                        {eventLabels[k]}
                                      </SelectItem>
                                    ))}
                                    {customEvents.map((ev) => (
                                      <div key={ev} className="group relative">
                                        <SelectItem
                                          value={ev}
                                          className="pr-10"
                                        >
                                          {ev}
                                        </SelectItem>
                                        <button
                                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 bg-destructive/20 hover:bg-destructive hover:scale-110 rounded-md z-10"
                                          onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            const eventId = ruleTypes.get(ev);
                                            if (!eventId) {
                                              toast({
                                                title: "删除失败",
                                                variant: "destructive",
                                              });
                                              return;
                                            }

                                            try {
                                              // 调用后端API删除
                                              await ruleTypeService.delete(
                                                eventId,
                                              );

                                              // 重新加载列表
                                              await loadCustomEvents();

                                              if (
                                                editingRule?.targetEvent === ev
                                              ) {
                                                updateEditing({
                                                  targetEvent: "" as NamedEvent,
                                                });
                                              }

                                              toast({
                                                title: "删除成功",
                                                description: `自定义事件 "${ev}" 已删除`,
                                              });
                                            } catch (error) {
                                              console.error(
                                                "Failed to delete custom event:",
                                                error,
                                              );
                                              toast({
                                                title: "删除失败",
                                                variant: "destructive",
                                              });
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive group-hover:text-white transition-colors" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  {!showInlineAddEvent && (
                                    <div
                                      className="sticky bottom-0 bg-popover border-t mt-1"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      <div
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-blue-600 font-medium"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setShowInlineAddEvent(true);
                                          setNewEventName("");
                                          setSelectOpen(true);
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Plus className="h-4 w-4" />
                                          新增事件
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {showInlineAddEvent && (
                                    <div
                                      className="sticky bottom-0 bg-popover p-2 border-t mt-1"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onKeyDown={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Input
                                          className="h-8 flex-1"
                                          placeholder="AddToCart"
                                          value={newEventName}
                                          onChange={(e) =>
                                            setNewEventName(e.target.value)
                                          }
                                          onKeyDown={(e) => {
                                            e.stopPropagation();
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              addCustomEvent();
                                            } else if (e.key === "Escape") {
                                              e.preventDefault();
                                              cancelAddEvent();
                                            }
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          autoFocus
                                        />
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            addCustomEvent();
                                          }}
                                          disabled={!newEventName.trim()}
                                        >
                                          保存
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            cancelAddEvent();
                                          }}
                                        >
                                          取消
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>启用</Label>
                              <div className="flex items-center h-10 !mt-0">
                                <Switch
                                  checked={editingRule.enabled}
                                  onCheckedChange={(v) =>
                                    updateEditing({ enabled: v })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">识别条件</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 space-y-2">
                              <Label>事件类型</Label>
                              <Select
                                value={editingRule.conditions.eventType}
                                onValueChange={(v) =>
                                  updateEditing({
                                    conditions: {
                                      ...editingRule.conditions,
                                      eventType: v as EventType,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择事件类型" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(rawTypeLabels).map((k) => (
                                    <SelectItem key={k} value={k}>
                                      {rawTypeLabels[k as RawEventType]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                <Label>URL范围类型</Label>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs bg-gray-900 text-white border-gray-700"
                                  >
                                    限定规则生效的URL匹配方式：前缀匹配（简单）或正则匹配（适用于复杂路径）。
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Select
                                value={editingRule.scope.type}
                                onValueChange={(v) =>
                                  updateEditing({
                                    scope: {
                                      ...editingRule.scope,
                                      type: v as any,
                                    },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择范围类型" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="prefix">前缀</SelectItem>
                                  <SelectItem value="regex">正则</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-1">
                                <Label>URL范围值</Label>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs bg-gray-900 text-white border-gray-700"
                                  >
                                    与范围类型配合使用的规则体匹配值：如
                                    /auth、/order（前缀），或
                                    ^/checkout/(success|complete)$（正则）。
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input
                                value={editingRule.scope.value}
                                onChange={(e) =>
                                  updateEditing({
                                    scope: {
                                      ...editingRule.scope,
                                      value: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label>文本别名</Label>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs bg-gray-900 text-white border-gray-700"
                                >
                                  定义多个文本关键词，用于匹配页面中的文本内容, 识别页面中包含特定文本的元素（如按钮文字、链接文字等）。例如：设置["提交",
                                  "Submit", "Send"]，匹配包含这些文字的元素。
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {(editingRule.conditions.text?.aliases || []).map(
                              (v, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                  <Input
                                    value={v}
                                    onChange={(e) =>
                                      updateTextAliases(idx, e.target.value)
                                    }
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAlias(idx)}
                                  >
                                    删除
                                  </Button>
                                </div>
                              ),
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={addAlias}
                            >
                              添加别名
                            </Button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label>匹配模式</Label>
                                  <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-xs bg-gray-900 text-white border-gray-700"
                                    >
                                      文本别名的匹配方式。等于：全匹配；包含：部分匹配（默认）；
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <Select
                                  value={
                                    editingRule.conditions.text?.matchMode ||
                                    "contains"
                                  }
                                  onValueChange={(v) =>
                                    updateEditing({
                                      conditions: {
                                        ...editingRule.conditions,
                                        text: {
                                          aliases:
                                            editingRule.conditions.text
                                              ?.aliases || [],
                                          matchMode: v as any,
                                        },
                                      },
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="选择匹配模式" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">等于</SelectItem>
                                    <SelectItem value="contains">
                                      包含
                                    </SelectItem>
                                    {/* <SelectItem value="starts_with">
                                  前缀
                                </SelectItem>
                                <SelectItem value="ends_with">后缀</SelectItem> */}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>选择器</Label>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs bg-gray-900 text-white border-gray-700"
                                  >
                                    使用CSS选择器精确定位页面元素。通过CSS选择器语法指定要监听的具体DOM元素。例如：#login-btn、.submit-button、button[type="submit"]。
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input
                                value={
                                  editingRule.conditions.selector?.selector ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateEditing({
                                    conditions: {
                                      ...editingRule.conditions,
                                      selector: {
                                        ...(editingRule.conditions.selector ||
                                          {}),
                                        selector: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>属性（键=值，逗号分隔）</Label>
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs bg-gray-900 text-white border-gray-700"
                                  >
                                    匹配具有特定属性值的HTML元素。格式：键=值，多个逗号分隔。进一步细化元素匹配条件。例如：data-role=login,data-id=btn1
                                    匹配同时具有这两个属性的元素。
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input
                                placeholder="data-role=login,data-id=btn1"
                                value={
                                  editingRule.conditions.selector
                                    ?.attributesRaw !== undefined
                                    ? editingRule.conditions.selector
                                        .attributesRaw
                                    : Object.entries(
                                        editingRule.conditions.selector
                                          ?.attributes || {},
                                      )
                                        .map(([k, v]) => `${k}=${v}`)
                                        .join(",")
                                }
                                onChange={(e) => {
                                  const rawValue = e.target.value;
                                  const kvs = rawValue
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const attrs: Record<string, string> = {};
                                  kvs.forEach((kv) => {
                                    const parts = kv.split("=");
                                    if (parts.length >= 2) {
                                      const k = parts[0].trim();
                                      const v = parts.slice(1).join("=").trim();
                                      if (k && v) attrs[k] = v;
                                    }
                                  });
                                  updateEditing({
                                    conditions: {
                                      ...editingRule.conditions,
                                      selector: {
                                        ...(editingRule.conditions.selector ||
                                          {}),
                                        attributes: attrs,
                                        attributesRaw: rawValue,
                                      },
                                    },
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">去重策略</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <Label>去重窗口（秒）</Label>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs bg-gray-900 text-white border-gray-700"
                                >
                                  设置时间窗口内的去重机制。在指定时间内（如30秒）多次触发同一事件时，只记录第几次。可避免误操作或网络延迟导致的重复事件。
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Input
                              type="number"
                              value={editingRule.dedup?.windowSeconds || 0}
                              onChange={(e) =>
                                updateEditing({
                                  dedup: {
                                    ...(editingRule.dedup || {}),
                                    windowSeconds: Number(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <Label>会话唯一</Label>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs bg-gray-900 text-white border-gray-700"
                                >
                                  开启后，在用户整个会话期间（从进入到离开网站），同一事件只会被记录一次。适用于登录、注册等只需记录一次的事件。
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center h-10">
                              <Switch
                                checked={!!editingRule.dedup?.oncePerSession}
                                onCheckedChange={(v) =>
                                  updateEditing({
                                    dedup: {
                                      ...(editingRule.dedup || {}),
                                      oncePerSession: v,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
                <div className="flex-none p-6">
                  <SheetFooter>
                    <Button
                      onClick={() => {
                        setOpenEditor(false);
                        setEditingRule(null);
                        setShowInlineAddEvent(false);
                        setNewEventName("");
                        setSelectOpen(false);
                      }}
                    >
                      取消
                    </Button>
                    <Button onClick={saveRule}>保存</Button>
                  </SheetFooter>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <div className="flex justify-start">
            <Button onClick={openCreateOutcomeDrawer}>
              <Plus className="h-4 w-4 mr-2" /> 新增事件
            </Button>
          </div>

          <Card>
            <CardContent className="space-y-3 pt-4">
              {resultEvents.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  暂无自定义结果事件。
                </div>
              ) : (
                <div className="space-y-2">
                  {resultEvents.map((event, idx) => (
                    <Card
                      key={event.id}
                      onDragOver={handleOutcomeDragOver}
                      onDragEnter={handleOutcomeDragEnter}
                      onDrop={(e) => handleOutcomeDrop(e, idx)}
                      className={`transition-opacity ${draggedOutcome === event.id ? "opacity-50" : ""}`}
                    >
                      <CardContent className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            draggable
                            onDragStart={(e) =>
                              handleOutcomeDragStart(e, event.id)
                            }
                            onDragEnd={handleOutcomeDragEnd}
                            className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-gray-100"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{event.ruleName}</div>
                            <div className="text-xs text-muted-foreground">
                              {event.remark}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={event.enableFlag ? "default" : "secondary"}
                          >
                            { baseCodeMap[event.eventType]}
                          </Badge>
                          <Badge variant="outline">
                            {event.enableFlag ? "启用" : "禁用"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditOutcomeDrawer(event.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" /> 编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteResultEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Sheet open={outcomeDrawerOpen} onOpenChange={setOutcomeDrawerOpen}>
            <SheetContent side="right" className="w-[640px] max-w-[80vw] p-0">
              <div className="flex h-full flex-col">
                <div className="flex-none p-6">
                  <SheetTitle>
                    {editingOutcomeId ? "编辑结果事件" : "新建结果事件"}
                  </SheetTitle>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* 基础信息卡片：规则名称、启用、备注 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">基础信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label className="col-span-1">规则名称</Label>
                        <Input
                          className="col-span-3"
                          placeholder="例如 注册成功"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                        />
                        {formErrorName && (
                          <div className="col-span-4 text-xs text-destructive">
                            {formErrorName}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label className="col-span-1">状态</Label>
                        <div className="col-span-3">
                          <RadioGroup
                            value={formEnabled ? "enabled" : "disabled"}
                            onValueChange={(v) =>
                              setFormEnabled(v === "enabled")
                            }
                            className="flex items-center gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="enabled" id="enabled" />
                              <Label htmlFor="enabled">启用</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="disabled" id="disabled" />
                              <Label htmlFor="disabled">禁用</Label>
                            </div>
                          </RadioGroup>
                          <p className="text-xs text-muted-foreground mt-2">
                            禁用后，来自 SDK 的该结果事件上报将被拒绝。
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 items-start">
                        <Label className="col-span-1">备注</Label>
                        <Textarea
                          className="col-span-3"
                          rows={4}
                          placeholder="补充说明该结果事件的使用场景"
                          value={formRemark}
                          onChange={(e) => setFormRemark(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">识别信息</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-3 items-center">
                        <Label className="col-span-1">事件标识</Label>
                        <Select
                          value={formCode}
                          onValueChange={(v) => {
                            setFormCode(v);
                            setSelectedDetail(null);
                          }}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="请选择事件标识" />
                          </SelectTrigger>
                          <SelectContent>
                            {baseCodeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrorCode && (
                          <div className="col-span-4 text-xs text-destructive">
                            {formErrorCode}
                          </div>
                        )}
                      </div>

                      {/* 细化标识管理 */}
                      <div className="space-y-2">
                        <Label>细化标识（键值对）</Label>
                        <div className="text-xs text-muted-foreground">
                          选择了一个事件标识后，可新增/删除/编辑细化标识的键值对，例如"询价"下添加
                          product_type=pcb、quote_type=standard 等。值可以为空。
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          <Input
                            className="col-span-5"
                            placeholder="键，例如 product_type（必填）"
                            value={detailKeyInput}
                            onChange={(e) => setDetailKeyInput(e.target.value)}
                          />
                          <Input
                            className="col-span-5"
                            placeholder="值，例如 pcb（可选）"
                            value={detailValueInput}
                            onChange={(e) =>
                              setDetailValueInput(e.target.value)
                            }
                          />
                          <Button
                            className="col-span-2"
                            onClick={() => {
                              const code = formCode;
                              if (!code) return;
                              const key = detailKeyInput.trim();
                              const value = detailValueInput.trim();
                              if (!key) return;
                              setDetailMap((prev) => {
                                const list = prev[code] ? [...prev[code]] : [];
                                const exists = list.some(
                                  (item) =>
                                    item.key === key && item.value === value,
                                );
                                if (!exists) list.push({ key, value });
                                return { ...prev, [code]: list };
                              });
                              setSelectedDetail({ key, value });
                              setDetailKeyInput("");
                              setDetailValueInput("");
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" /> 新增
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(detailMap[formCode || ""] || []).length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                              当前事件标识下暂无细化标识。
                            </div>
                          ) : (
                            (detailMap[formCode || ""] || []).map((d, idx) => (
                              <div
                                key={`${d.key}-${d.value}-${idx}`}
                                className="flex items-center justify-between rounded border p-2"
                              >
                                {editingDetailIndex === idx ? (
                                  <div className="flex-1 flex gap-2">
                                    <Input
                                      placeholder="键"
                                      value={detailEditKey}
                                      onChange={(e) =>
                                        setDetailEditKey(e.target.value)
                                      }
                                    />
                                    <Input
                                      placeholder="值"
                                      value={detailEditValue}
                                      onChange={(e) =>
                                        setDetailEditValue(e.target.value)
                                      }
                                    />
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        const key = detailEditKey.trim();
                                        const value = detailEditValue.trim();
                                        if (!key) return;
                                        setDetailMap((prev) => {
                                          const list = [
                                            ...(prev[formCode || ""] || []),
                                          ];
                                          list[idx] = { key, value };
                                          return {
                                            ...prev,
                                            [formCode || ""]: list,
                                          };
                                        });
                                        setEditingDetailIndex(null);
                                        setSelectedDetail({ key, value });
                                      }}
                                    >
                                      <Check className="h-4 w-4 mr-1" /> 保存
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className="flex-1 cursor-pointer"
                                    onClick={() => setSelectedDetail(d)}
                                  >
                                    <div
                                      className={`font-mono text-sm ${
                                        selectedDetail?.key === d.key &&
                                        selectedDetail?.value === d.value
                                          ? "text-primary font-semibold"
                                          : ""
                                      }`}
                                    >
                                      <span className="text-blue-600">
                                        {d.key}
                                      </span>{" "}
                                      ={" "}
                                      <span className="text-green-600">
                                        {d.value || '""'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                {editingDetailIndex !== idx && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingDetailIndex(idx);
                                        setDetailEditKey(d.key);
                                        setDetailEditValue(d.value);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> 编辑
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setDetailMap((prev) => {
                                          const list = (
                                            prev[formCode || ""] || []
                                          ).filter((_, i) => i !== idx);
                                          return {
                                            ...prev,
                                            [formCode || ""]: list,
                                          };
                                        });
                                        if (
                                          selectedDetail?.key === d.key &&
                                          selectedDetail?.value === d.value
                                        )
                                          setSelectedDetail(null);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* SDK 代码展示 */}
                        <div className="space-y-2">
                          <Label>SDK 上报示例</Label>
                          <div className="text-xs text-muted-foreground mb-2">
                            根据当前选择的事件标识和细化标识自动生成 SDK
                            代码示例
                          </div>
                          <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                            {`// 引入 SDK 方法
import { ${toTrackMethodName(formCode)} } from 'xd-post';

// 结果事件上报示例
${toTrackMethodName(formCode)}({
${(detailMap[formCode || ""] || []).length > 0 ? (detailMap[formCode || ""] || []).map((d) => `  ${d.key}: "${d.value}",`).join("\n") + "\n" : "  // 添加细化标识后，会在此显示键值对\n"}  enabled: ${formEnabled ? "true" : "false"},
});
`}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex-none p-6">
                  <SheetFooter>
                    <Button onClick={() => setOutcomeDrawerOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={saveOutcomeEvent}>保存</Button>
                  </SheetFooter>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RulesPage;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Bot, ChevronDown, Sparkles, User } from "lucide-react";
import { TicketAIDrawer } from "@/components/TicketAIDrawer";

import { AnalysisWizardView } from "@/components/AnalysisWizardView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppProvider, useAppContext } from "@/hooks/AppContext";
import { request } from "@/lib/request";
import { TicketPost } from "@/types";
import { Empty } from "antd";
import { parseSerializedData } from "@/utils/utils";

interface ApiTicketDetail {
  id?: string;
  ticketId?: string;
  instanceCode?: string;
  instanceName?: string;
  gmtCreate?: string;
  gmtModified?: string;
  centerList?: unknown;
  email?: string | ApiTicketEmail[];
  keyAttributes?: Record<string, unknown> | string | null;
  evaluation?: string;
}

interface ApiTicketEmail {
  content?: string;
  htmlBody?: string;
  receivedTime?: number | string;
  senderName?: string;
  role?: string;
  subject?: string;
  ticketId?: string;
}

interface ApiTicketCenterItem extends Record<string, unknown> {
  eventTime?: number | string;
  overview?: Record<string, unknown> | null;
}

interface DetailTag {
  text: string;
  color: string;
}

interface DetailOverview {
  round: string;
  triggerTime: string;
  score: string | number;
  summary: string;
}

interface DetailViewData {
  id: string;
  customerName: string;
  updatedAt: string;
  overview: DetailOverview;
}

interface TimelineItem {
  id: string;
  role: string;
  senderName: string;
  time: string;
  timestamp: number | null;
  subject: string;
  content: string;
  msgId: string;
}

const mockDetailData: DetailViewData = {
  id: "TCK-180231",
  customerName: "A 公司",
  updatedAt: "2026-03-21 16:40",
  overview: {
    round: "Round 1",
    triggerTime: "2026-03-20 10:13",
    score: 82,
    summary: "询问报价与交期，关注批量折扣与交付周期。",
  },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown, fallback = "-") => {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const parseJson = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeTimestamp = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric < 1e12 ? numeric * 1000 : numeric;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  return null;
};

const formatDateTime = (value: unknown) => {
  const timestamp = normalizeTimestamp(value);

  if (timestamp !== null) {
    return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "-";
};

const isMatchedTimestamp = (left: unknown, right: unknown) => {
  const leftTimestamp = normalizeTimestamp(left);
  const rightTimestamp = normalizeTimestamp(right);

  if (leftTimestamp === null || rightTimestamp === null) {
    return false;
  }

  return (
    leftTimestamp === rightTimestamp ||
    Math.abs(leftTimestamp - rightTimestamp) < 1000 ||
    Math.floor(leftTimestamp / 1000) === Math.floor(rightTimestamp / 1000)
  );
};

const getEmailSource = (detail: ApiTicketDetail | null) => {
  if (!detail) {
    return [] as ApiTicketEmail[];
  }

  if (Array.isArray(detail.email)) {
    return detail.email;
  }

  const keyAttributesObject =
    detail.keyAttributes && typeof detail.keyAttributes === "object" ? detail.keyAttributes : null;
  const keyAttributesEmail = keyAttributesObject?.email;

  if (Array.isArray(keyAttributesEmail)) {
    return keyAttributesEmail as ApiTicketEmail[];
  }

  if (typeof keyAttributesEmail === "string") {
    return parseJson<ApiTicketEmail[]>(keyAttributesEmail, []);
  }

  if (typeof detail.email === "string") {
    return parseJson<ApiTicketEmail[]>(detail.email, []);
  }

  if (typeof detail.keyAttributes === "string") {
    const parsedKeyAttributes = parseJson<Record<string, unknown>>(detail.keyAttributes, {});
    const nestedEmail = parsedKeyAttributes.email;

    if (Array.isArray(nestedEmail)) {
      return nestedEmail as ApiTicketEmail[];
    }

    if (typeof nestedEmail === "string") {
      return parseJson<ApiTicketEmail[]>(nestedEmail, []);
    }
  }

  return [] as ApiTicketEmail[];
};

const normalizeCenterListValue = (value: unknown): ApiTicketCenterItem[] => {
  if (Array.isArray(value)) {
    return value.filter(isRecord) as ApiTicketCenterItem[];
  }

  if (typeof value === "string") {
    return normalizeCenterListValue(parseJson<unknown>(value, []));
  }

  if (!isRecord(value)) {
    return [];
  }

  if ("eventTime" in value) {
    return [value as ApiTicketCenterItem];
  }

  if ("centerList" in value) {
    return normalizeCenterListValue(value.centerList);
  }

  return Object.values(value).filter(isRecord) as ApiTicketCenterItem[];
};

const getCenterListSource = (detail: ApiTicketDetail | null) => {
  if (!detail) {
    return [] as ApiTicketCenterItem[];
  }

  const keyAttributesObject =
    detail.keyAttributes && typeof detail.keyAttributes === "object" ? detail.keyAttributes : null;

  const sources = [detail.centerList, keyAttributesObject?.centerList];

  if (typeof detail.keyAttributes === "string") {
    const parsedKeyAttributes = parseJson<Record<string, unknown>>(detail.keyAttributes, {});
    sources.push(parsedKeyAttributes.centerList);
  }

  for (const source of sources) {
    const centerList = normalizeCenterListValue(source);

    if (centerList.length > 0) {
      return centerList;
    }
  }

  return [] as ApiTicketCenterItem[];
};

const normalizeTimeline = (detail: ApiTicketDetail | null): TimelineItem[] => {
  const emailList = getEmailSource(detail);

  return emailList
    .map((item, index) => {
      const timestamp = normalizeTimestamp(item.receivedTime);

      return {
        id: `${item.ticketId || detail?.ticketId || detail?.id || "email"}-${index}`,
        role: toText(item.role, "UNKNOWN"),
        senderName: toText(item.senderName, "未知发送人"),
        time: formatDateTime(item.receivedTime),
        timestamp,
        subject: toText(item.subject, "无主题"),
        content: toText(item.content ?? item.htmlBody, "暂无邮件内容"),
        msgId: toText(item.ticketId, detail?.ticketId || detail?.id || `EMAIL-${index + 1}`),
      };
    })
    .sort((left, right) => {
      if (left.timestamp === null || right.timestamp === null) {
        return 0;
      }

      return left.timestamp - right.timestamp;
    });
};

const getMatchedCenterItem = (centerList: ApiTicketCenterItem[], receivedTime: number | null) => {
  if (receivedTime === null) {
    return null;
  }

  return [...centerList].reverse().find((item) => isMatchedTimestamp(item.eventTime, receivedTime)) || null;
};

const buildOverviewData = (selectedTimeline: TimelineItem | null, selectedCenterItem: ApiTicketCenterItem | null) => {
  if (!selectedCenterItem) {
    return {
      overview: {
        round: selectedTimeline ? "已选中邮件" : mockDetailData.overview.round,
        triggerTime: selectedTimeline?.time ?? mockDetailData.overview.triggerTime,
        summary: selectedTimeline ? "当前邮件暂无匹配的分析详情。" : mockDetailData.overview.summary,
      },
    };
  }

  const overviewSource = selectedCenterItem;
  const dataInference = parseSerializedData(overviewSource.dataInference);
  return {
    overview: {
      round: toText(overviewSource.round, "已匹配详情"),
      triggerTime: formatDateTime(
        overviewSource.triggerTime ?? selectedCenterItem.eventTime ?? selectedTimeline?.timestamp,
      ),
      score: toText(dataInference?.score_summary?.overall_score),
      summary: toText(overviewSource?.summary, "当前邮件已匹配到分析详情。"),
    },
  };
};

const toWizardEmail = (selectedTimeline: TimelineItem | null): TicketPost | null => {
  if (!selectedTimeline) {
    return null;
  }

  const normalizedRole = selectedTimeline.role.toUpperCase();

  return {
    id: selectedTimeline.timestamp ?? Date.now(),
    ticketId: selectedTimeline.msgId,
    subTitle: selectedTimeline.subject,
    author: selectedTimeline.senderName,
    role: normalizedRole === "STAFF" || normalizedRole === "USER" ? normalizedRole : undefined,
    content: selectedTimeline.content,
    ip: "-",
    postedOn:
      selectedTimeline.timestamp !== null ? new Date(selectedTimeline.timestamp).toISOString() : selectedTimeline.time,
  };
};

function AnalysisWizardBridge({
  selectedTimeline,
  selectedCenterItem,
}: {
  selectedTimeline: TimelineItem | null;
  selectedCenterItem: ApiTicketCenterItem | null;
}) {
  const {
    resetAnalysis,
    setHasExistingData,
    setIsCheckingStatus,
    setSelectedEmail,
    setStep2Data,
    setStep3Data,
    setViewData,
  } = useAppContext();
  const wizardEmail = useMemo(() => toWizardEmail(selectedTimeline), [selectedTimeline]);

  useEffect(() => {
    resetAnalysis();
    setStep2Data(null);
    setStep3Data(null);
    setViewData(selectedCenterItem ?? null);
    setSelectedEmail(wizardEmail);
    setHasExistingData(Boolean(selectedCenterItem));
    setIsCheckingStatus(Boolean(wizardEmail && selectedCenterItem));
  }, [
    resetAnalysis,
    selectedCenterItem,
    setHasExistingData,
    setIsCheckingStatus,
    setSelectedEmail,
    setStep2Data,
    setStep3Data,
    setViewData,
    wizardEmail,
  ]);

  return selectedCenterItem ? <AnalysisWizardView /> : <Empty></Empty>;
}

export default function TicketMonitorDetail() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("ticketId") || "TCK-180231";
  const navigate = useNavigate();

  const [detail, setDetail] = useState<ApiTicketDetail | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchTicketDetail = async () => {
      if (!ticketId) {
        return;
      }

      try {
        const response = await request.get(`/quote/api/v1/ticket/view/${encodeURIComponent(ticketId)}`);
        setDetail((response.data?.data || null) as ApiTicketDetail | null);
      } catch (error) {
        console.error("Failed to fetch ticket detail:", error);
        setDetail(null);
      }
    };

    fetchTicketDetail();
  }, [ticketId]);

  const timeline = useMemo(() => normalizeTimeline(detail), [detail]);
  const centerList = useMemo(() => getCenterListSource(detail), [detail]);

  useEffect(() => {
    setSelectedTimelineId((current) => {
      if (timeline.length === 0) {
        return null;
      }

      return timeline.some((item) => item.id === current) ? current : timeline[timeline.length - 1].id;
    });
  }, [timeline]);

  const selectedTimeline = useMemo(() => {
    if (timeline.length === 0) {
      return null;
    }

    return timeline.find((item) => item.id === selectedTimelineId) || timeline[timeline.length - 1];
  }, [selectedTimelineId, timeline]);

  const selectedCenterItem = useMemo(
    () => getMatchedCenterItem(centerList, selectedTimeline?.timestamp ?? null),
    [centerList, selectedTimeline],
  );

  const overviewData = useMemo(
    () => buildOverviewData(selectedTimeline, selectedCenterItem),
    [selectedCenterItem, selectedTimeline],
  );

  const data: any = {
    ...overviewData,
    id: toText(detail?.ticketId ?? detail?.id, mockDetailData.id),
    customerName: toText(detail?.instanceName ?? detail?.instanceCode, mockDetailData.customerName),
    updatedAt: toText(detail?.gmtModified ?? detail?.gmtCreate, mockDetailData.updatedAt),
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[#f8fafc] font-sans text-gray-800">
      <div className="z-10 shrink-0 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="px-2 text-gray-600 hover:text-gray-900"
              onClick={() => navigate("/ticket-monitor")}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> 返回列表
            </Button>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-900">{data.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsAiDrawerOpen(true)}
              variant="ghost"
              className="h-8 gap-1.5 rounded-full bg-[#f0f4ff] px-4 text-xs font-semibold text-[#5e72e4] hover:bg-[#e4e9ff] hover:text-[#4a5fdb]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              工单 AI 评分
            </Button>
            <div className="text-sm text-gray-500">更新时间: {data.updatedAt}</div>
          </div>
          <TicketAIDrawer
            ticketId={ticketId}
            initialData={detail?.evaluation}
            open={isAiDrawerOpen}
            onOpenChange={setIsAiDrawerOpen}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-0 pt-4">
        <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="custom-scrollbar h-full space-y-4 overflow-y-auto pb-8 pr-3 lg:col-span-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">工单时间线</h2>
            </div>

            <div className="space-y-4">
              {timeline.length > 0 ? (
                timeline.map((item) => {
                  const isStaff = item.role.toUpperCase() === "STAFF";
                  const isActive = item.id === selectedTimeline?.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`block w-full overflow-hidden rounded-lg border bg-white text-left transition ${
                        isActive
                          ? "border-blue-400 shadow-sm ring-1 ring-blue-100"
                          : "border-gray-200 hover:border-blue-200 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedTimelineId(item.id)}
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isStaff ? (
                            <Bot className="h-4 w-4 text-blue-600" />
                          ) : (
                            <User className="h-4 w-4 text-gray-600" />
                          )}
                          <span className="text-sm font-semibold text-gray-700">{isStaff ? "STAFF" : item.role}</span>
                          <span className="text-xs text-gray-400">{item.senderName}</span>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="rounded-sm bg-gray-100 px-2 font-normal text-gray-600 hover:bg-gray-200"
                          >
                            {item.msgId}
                          </Badge>
                          <ChevronDown className="h-4 w-4 text-transparent" />
                        </div>
                      </div>

                      <div className="space-y-2 p-4">
                        <h3 className="text-sm font-bold text-gray-900">{item.subject}</h3>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.content}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <Card className="border-gray-200 shadow-none">
                  <CardContent className="p-8 text-center text-sm text-gray-500">暂无邮件时间线数据</CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="custom-scrollbar h-full space-y-6 overflow-y-auto pb-8 pr-3 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900">本轮概览</h2>

            <div className="flex items-center gap-3 text-sm">
              {/* <span className="rounded bg-gray-100 px-2 py-1 font-semibold text-gray-700">{data.overview.round}</span>
              <span className="text-gray-500">|</span> */}
              <span className="text-gray-500">{data.overview.triggerTime}</span>
              <span className="text-gray-500">|</span>
              <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                Score <span className="text-emerald-700">{data.overview.score}</span>
              </div>
            </div>

            {/* <div className="text-sm text-gray-700">
              <span className="font-medium text-blue-600">最新动态 ({data.overview.round} Summary): </span>
              {data.overview.summary}
            </div> */}

            <Tabs defaultValue="trace" className="mt-6 w-full">
              <TabsList className="mb-4 flex w-full bg-gray-100/80 p-1">
                <TabsTrigger
                  value="trace"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  决策轨迹
                </TabsTrigger>
                <TabsTrigger
                  value="compare"
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  差异对比
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trace" className="space-y-4">
                <Card className="overflow-hidden border-gray-200 shadow-none">
                  <CardContent className="p-0">
                    {selectedTimeline ? (
                      <AppProvider>
                        <AnalysisWizardBridge
                          selectedTimeline={selectedTimeline}
                          selectedCenterItem={selectedCenterItem}
                        />
                      </AppProvider>
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-500">请先选择左侧邮件</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compare">
                <Card className="border-gray-200 shadow-none">
                  <CardContent className="p-8 text-center text-gray-500">差异对比功能开发中...</CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

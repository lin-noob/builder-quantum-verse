import { useState, useEffect } from "react";
import { ruleService } from "@/services/ruleService";
import { Search, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GripVertical, Plus, Trash2, Info } from "lucide-react";
import { DatePicker, Table, Select as AntSelect } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import { TableActionButtons } from "@/components/TableActionButtons";
import { request } from "@/lib/request";
import { toast } from "sonner";

const { RangePicker } = DatePicker;

interface PageRule {
  id: string;
  matchType: string;
  matchValue: string;
}
interface PageClassification {
  id: string;
  name: string;
  rules: PageRule[];
}

const AttributionAnalysis = () => {
  const [rules, setRules] = useState<PageClassification[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["pageType"]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<string>("all");
  const [selectedPageType, setSelectedPageType] = useState<string>("all");
  const [tableData, setTableData] = useState<any[]>([]);
  const [totalData, setTotalData] = useState<any>(null);

  const [columnsConfig, setColumnsConfig] = useState<{ key: string; label: string; mandatory?: boolean }[]>([]);
  const [titleIdToIdMap, setTitleIdToIdMap] = useState<Map<string, string>>(new Map());
  const fixedColumns = [{ key: "pageType", label: "首访页面类型", mandatory: true }];

  const refetchColumns = async () => {
    try {
      const ruleTypes = await ruleService.getColRules();
      const dynamicColumnsMap = new Map(
        ruleTypes.map((r) => [String(r.id), { key: String(r.id), label: r.ruleName, mandatory: false }]),
      );

      const savedListResponse = await request.get("/quote/api/v1/report/title/list", {
        type: "MarketingPageRule",
      });

      let orderedDynamicColumns: { key: string; label: string; mandatory?: boolean }[] = [];
      const newTitleIdToIdMap = new Map<string, string>();

      if (savedListResponse.data?.data?.length > 0) {
        savedListResponse.data.data.forEach((item: any) => {
          if (item.titleId && item.id) {
            newTitleIdToIdMap.set(String(item.titleId), String(item.id));
          }
        });
        setTitleIdToIdMap(newTitleIdToIdMap);

        orderedDynamicColumns = savedListResponse.data.data
          .map((item: any) => dynamicColumnsMap.get(String(item.titleId)))
          .filter(Boolean);

        const savedIds = new Set(savedListResponse.data.data.map((item: any) => String(item.titleId)));
        const newColumns = ruleTypes
          .filter((r) => !savedIds.has(String(r.id)))
          .map((r) => ({ key: String(r.id), label: r.ruleName, mandatory: false }));
        orderedDynamicColumns = [...orderedDynamicColumns, ...newColumns];
      } else {
        orderedDynamicColumns = Array.from(dynamicColumnsMap.values());
      }

      const allColumns = [...fixedColumns, ...orderedDynamicColumns];
      setColumnsConfig(allColumns);

      if (savedListResponse.data?.data?.length > 0) {
        const checkedIds = savedListResponse.data.data
          .filter((item: any) => item.checked === true)
          .map((item: any) => String(item.titleId));
        setVisibleColumns([...new Set(["pageType", ...checkedIds])]);
      } else {
        setVisibleColumns(allColumns.map((c) => c.key));
      }
    } catch (error) {
      console.error("Failed to fetch column configuration:", error);
    }
  };

  const saveColumns = async (newVisibleColumns: string[]) => {
    try {
      const columnsToSave = columnsConfig
        .filter((col) => !fixedColumns.some((f) => f.key === col.key))
        .map((col) => ({
          titleId: col.key,
          checked: newVisibleColumns.includes(col.key),
          type: "MarketingPageRule",
        }));

      await request.post("/quote/api/v1/report/title/save", columnsToSave);
    } catch (error) {
      console.error("Failed to save column configuration:", error);
    }
  };

  const moveColumn = async (sourceKey: string, targetKey: string) => {
    try {
      const sourceId = titleIdToIdMap.get(sourceKey);
      const targetId = titleIdToIdMap.get(targetKey);

      if (sourceId && targetId) {
        const formData = new FormData();
        formData.append("sourceId", sourceId);
        formData.append("targetId", targetId);
        await request.post("/quote/api/v1/report/title/move", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        await refetchColumns();
      }
    } catch (error) {
      console.error("Failed to move column:", error);
    }
  };

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const payload = {
        startDate: dateRange?.length ? dateRange[0]?.startOf("day").utc().toISOString() : undefined,
        endDate: dateRange?.length ? dateRange[1]?.endOf("day").utc().toISOString() : undefined,
        firstReferrer: selectedReferrer === "all" ? undefined : selectedReferrer,
        location: selectedCountry === "all" ? undefined : selectedCountry,
        fullName: selectedPageType === "all" ? undefined : selectedPageType,
      };
      const response = await request.post("/quote/api/marketing/page-rule/list", payload);
      const rawData = response.data.data || [];

      const totalItem = rawData.find((item: any) => String(item.id) === "0");
      setTotalData(totalItem);
      const listData = rawData.filter((item: any) => String(item.id) !== "0");

      if (totalItem) {
        const otherPagesMetrics: Record<string, number> = {};
        Object.keys(totalItem.metrics || {}).forEach((key) => {
          let sumValue = 0;
          listData.forEach((item: any) => {
            sumValue += Number(item.metrics?.[key] || 0);
          });
          otherPagesMetrics[key] = Math.max(0, (totalItem.metrics?.[key] || 0) - sumValue);
        });

        const otherPagesRow = {
          id: "other-pages-calculated",
          pageTypeName: "其他页面",
          matchValue: "不匹配以上规则的页面",
          metrics: otherPagesMetrics,
        };

        setTableData([...listData, otherPagesRow]);
      } else {
        setTableData(listData);
      }
    } catch (error) {
      console.error("Failed to fetch table data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCountryList = async () => {
      try {
        const response = await request.get("/quote/api/marketing/page-rule/country/list");
        if (response.data && Array.isArray(response.data.data)) {
          const sortedCountries = [...response.data.data].sort((a, b) => a.localeCompare(b));
          setCountries(sortedCountries);
        }
      } catch (error) {
        console.error("Failed to fetch country list:", error);
      }
    };

    const fetchAllPageRules = async () => {
      try {
        const response = await request.get("/quote/api/marketing/page-rule/all");
        if (response.data && Array.isArray(response.data.data)) {
          const rawData = response.data.data;
          const mappedRules = rawData.map((item: any) => {
            let parsedRules = [];
            try {
              // The backend sends matchValue as a JSON string of rules
              parsedRules = JSON.parse(item.matchValue || "[]");
            } catch (e) {
              console.error("Failed to parse matchValue JSON:", e);
            }

            return {
              id: String(item.id),
              name: item.pageTypeName || "",
              rules: Array.isArray(parsedRules)
                ? parsedRules.map((r: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    matchType: r.matchType || "contains",
                    matchValue: r.matchValue || "",
                  }))
                : [{ id: Math.random().toString(36).substr(2, 9), matchType: "contains", matchValue: "" }],
            };
          });

          setRules(mappedRules);
        }
      } catch (error) {
        console.error("Failed to fetch all page rules:", error);
      }
    };

    fetchCountryList();
    fetchTableData();
    refetchColumns();
    fetchAllPageRules();
  }, [dateRange, selectedCountry, selectedReferrer, selectedPageType]);

  const handleAddClassification = () => {
    setRules([
      ...rules,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        rules: [{ id: Math.random().toString(36).substr(2, 9), matchType: "contains", matchValue: "" }],
      },
    ]);
  };

  const handleAddRuleToClassification = (classId: string) => {
    setRules(
      rules.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            rules: [...c.rules, { id: Math.random().toString(36).substr(2, 9), matchType: "contains", matchValue: "" }],
          };
        }
        return c;
      }),
    );
  };

  const handleDeleteClassification = (id: string) => {
    setRules(rules.filter((c) => c.id !== id));
  };

  const handleDeleteRule = (classId: string, ruleId: string) => {
    setRules(
      rules.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            rules: c.rules.filter((r) => r.id !== ruleId),
          };
        }
        return c;
      }),
    );
  };

  const handleUpdateClassificationName = (id: string, name: string) => {
    setRules(rules.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleUpdateRule = (classId: string, ruleId: string, field: "matchType" | "matchValue", value: string) => {
    setRules(
      rules.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            rules: c.rules.map((r) => (r.id === ruleId ? { ...r, [field]: value } : r)),
          };
        }
        return c;
      }),
    );
  };

  const handleSavePageClassification = async () => {
    try {
      for (const c of rules) {
        if (!c.name || c.name.trim() === "") {
          toast.error("页面分类名称不能为空");
          return;
        }
        for (const r of c.rules) {
          if (!r.matchValue || r.matchValue.trim() === "") {
            toast.error(`分类 "${c.name}" 的 URL 匹配值不能为空`);
            return;
          }
        }
      }

      const payload = rules.map((c) => ({
        pageTypeName: c.name,
        matchValue: JSON.stringify(
          c.rules.map((r) => ({
            matchValue: r.matchValue,
            matchType: r.matchType,
          })),
        ),
      }));

      await request.post("/quote/api/marketing/page-rule/save", payload);
      toast.success("保存成功");
      setIsConfigOpen(false);
      fetchTableData();
    } catch (error) {
      console.error("Failed to save page classification:", error);
      toast.error("保存失败");
    }
  };

  const columns: ColumnsType<any> = columnsConfig
    .filter((col) => visibleColumns.includes(col.key))
    .map((colConfig) => {
      if (colConfig.key === "pageType") {
        return {
          title: "首访页面类型",
          dataIndex: "pageType",
          key: "pageType",
          minWidth: 350,
          render: (_: any, record: any) => {
            let parsedRules = [];
            try {
              parsedRules = JSON.parse(record.matchValue || "[]");
            } catch (e) {
              parsedRules = [];
            }

            return (
              <div className="flex flex-col gap-1.5 py-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900">{record.pageTypeName}</span>
                </div>
                <div className="text-xs text-slate-400">
                  匹配规则:{" "}
                  {Array.isArray(parsedRules)
                    ? parsedRules
                        .map((r) => `${r.matchType === "equals" ? "=" : "contains"} "${r.matchValue}"`)
                        .join(" 或 ")
                    : record.matchValue}
                </div>
              </div>
            );
          },
        };
      }

      return {
        title: colConfig.label,
        dataIndex: colConfig.key,
        key: colConfig.key,
        minWidth: 200,
        ellipsis: true,
        sorter: (a: any, b: any) => {
          const valA = a.metrics?.[colConfig.key] || 0;
          const valB = b.metrics?.[colConfig.key] || 0;
          return valA - valB;
        },
        render: (val: any, record: any) => {
          const displayVal = record.metrics?.[colConfig.key] ?? 0;
          return <span className="text-slate-600">{(displayVal || 0).toLocaleString()}</span>;
        },
      };
    });

  const renderTableSummary = (pageData: any[]) => {
    const totals: Record<string, number> = {};

    columns.forEach((col) => {
      if ((col as any).key !== "pageType" && (col as any).key !== "matchRule") {
        totals[(col as any).key] = 0;
      }
    });

    if (totalData) {
      Object.keys(totals).forEach((key) => {
        totals[key] = totalData.metrics?.[key] || 0;
      });
    } else {
      pageData.forEach((record) => {
        Object.keys(totals).forEach((key) => {
          const val = record.metrics?.[key] ?? 0;
          totals[key] += Number(val) || 0;
        });
      });
    }

    return (
      <Table.Summary.Row className="bg-slate-50 font-medium">
        <Table.Summary.Cell index={0} className="pl-6 font-semibold text-slate-900">
          总计
        </Table.Summary.Cell>
        {columns.map((col, idx) => {
          if (idx === 0) return null;
          const key = (col as any).key;
          if (key === "matchRule") {
            return <Table.Summary.Cell key={key} index={idx}></Table.Summary.Cell>;
          }
          return (
            <Table.Summary.Cell key={key} index={idx} className="font-bold text-slate-900">
              {(totals[key] || 0).toLocaleString()}
            </Table.Summary.Cell>
          );
        })}
      </Table.Summary.Row>
    );
  };

  const handleExport = async ({ columns }: { columns: string[]; scope: "current" | "all" }) => {
    const columnLabels: Record<string, string> = {
      pageType: "页面类型",
    };
    columnsConfig.forEach((col) => {
      columnLabels[col.key] = col.label;
    });

    const header = columns.map((key) => columnLabels[key] || key).join(",");

    const rows = tableData.map((item) => {
      return columns
        .map((key) => {
          let val;
          if (key === "pageType") {
            val = `${item.pageTypeName} (${item.matchValue})`;
          } else {
            val = item.metrics?.[key] ?? 0;
          }
          return typeof val === "string" ? `"${val}"` : val || 0;
        })
        .join(",");
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([`\ufeff${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attribution_analysis_${dayjs().format("YYYYMMDD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 h-full">
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">时间范围</label>
              <RangePicker
                size="middle"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as any)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">渠道来源</label>
              <Select value={selectedReferrer} onValueChange={setSelectedReferrer}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="全部渠道" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部渠道</SelectItem>
                  <SelectItem value="付费广告">付费广告</SelectItem>
                  <SelectItem value="自然搜索">自然搜索</SelectItem>
                  <SelectItem value="其他渠道">其他渠道</SelectItem>
                  <SelectItem value="直接访问">直接访问</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">页面类型</label>
              <Select value={selectedPageType} onValueChange={setSelectedPageType}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {rules
                    .filter((c) => c.name && c.name.trim() !== "")
                    .map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">来源国家/地区</label>
              <AntSelect
                showSearch
                className="w-full h-8"
                placeholder="全部地区"
                value={selectedCountry}
                onChange={setSelectedCountry}
                optionFilterProp="children"
                allowClear
              >
                <AntSelect.Option value="all">全部地区</AntSelect.Option>
                {countries.map((country) => (
                  <AntSelect.Option key={country} value={country}>
                    {country}
                  </AntSelect.Option>
                ))}
              </AntSelect>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8" onClick={fetchTableData}>
                <Search className="h-3.5 w-3.5 mr-2" />
                搜索
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => {
                  setDateRange([dayjs().subtract(7, "day"), dayjs()]);
                  setSelectedCountry("all");
                  setSelectedReferrer("all");
                  setSelectedPageType("all");
                  fetchTableData();
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center my-6 gap-4">
        <div className="flex items-center gap-2 text-sm  px-3 py-2 rounded-md">
          <Button size="sm" onClick={() => setIsConfigOpen(true)} variant="outline">
            <Settings className="h-3 w-3" /> 页面分类配置
          </Button>
        </div>
        <TableActionButtons
          columns={columnsConfig}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={(newCols) => {
            setVisibleColumns(newCols);
            saveColumns(newCols);
          }}
          onSaveColumns={() => saveColumns(visibleColumns)}
          onMoveColumn={moveColumn}
          onExport={handleExport}
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="id"
          loading={loading}
          pagination={false}
          summary={renderTableSummary}
          scroll={{ x: "max-content", y: 600 }}
        />
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>页面分类配置</DialogTitle>
            <DialogDescription>设置 URL 匹配规则，系统自动将访客首访页面归类</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-orange-50 border-orange-200 text-orange-800">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900 font-medium ml-2">匹配逻辑说明</AlertTitle>
              <AlertDescription className="ml-2 mt-2 text-orange-800/90 text-xs leading-5">
                系统按页面类型顺序匹配。 <br />
                同一类型内规则为 OR 关系，命中任意一条即归类; <br />
                命中后停止匹配;未命中则归入"其他"。 <br />
                支持"等于"和"包含"两种匹配模式。
              </AlertDescription>
            </Alert>

            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {rules.map((classification) => (
                <div key={classification.id} className="p-4 rounded-lg border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center gap-3">
                    {/* <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" /> */}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-red-500">*</span>
                        <span className="text-xs text-slate-500 font-medium">页面分类名称</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={classification.name}
                          onChange={(e) => handleUpdateClassificationName(classification.id, e.target.value)}
                          className="h-9 font-medium bg-slate-50 focus-visible:ring-1 focus-visible:ring-blue-500"
                          placeholder="页面分类名称 (例如：产品页)"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteClassification(classification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {classification.rules.map((rule, index) => (
                      <div key={rule.id} className="flex items-center gap-2 group">
                        <div className="w-32">
                          <Select
                            value={rule.matchType}
                            onValueChange={(val) => handleUpdateRule(classification.id, rule.id, "matchType", val)}
                          >
                            <SelectTrigger className="h-8 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">包含</SelectItem>
                              <SelectItem value="equals">等于</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          value={rule.matchValue}
                          onChange={(e) => handleUpdateRule(classification.id, rule.id, "matchValue", e.target.value)}
                          className="h-8 bg-white flex-1"
                          placeholder="/example (必填)"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteRule(classification.id, rule.id)}
                          disabled={classification.rules.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleAddRuleToClassification(classification.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> 添加匹配规则
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 opacity-60">
                <div className="w-4" /> {/* Spacer for Grip handle */}
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <Input value="其他页面" disabled className="h-8 bg-slate-100" />
                  <Input value="-" disabled className="h-8 bg-slate-100 text-center" />
                  <Input value="(未匹配以上规则)" disabled className="h-8 bg-slate-100" />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
              onClick={handleAddClassification}
            >
              <Plus className="h-4 w-4 mr-2" /> 添加新分类
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
              取消
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSavePageClassification}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttributionAnalysis;

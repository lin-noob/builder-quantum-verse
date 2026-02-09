import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getUserEventList, type ApiEvent, type ApiEventListResponse } from "@/lib/profile";

// Parsed order data structure
interface ParsedOrderData {
  orderId: string;
  orderTime: string;
  status: string;
  itemCount: number;
  totalAmount: number;
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmout: number;
  currency: string;
  paymentMethod: string;
  lineItems: Array<{
    name: string;
    price: number;
    count: number;
    totalPrice: number;
    sn: string;
  }>;
  shippingAddress: string;
  consignee: string;
  phone: string;
  sn: string;
  userName: string;
  matched_attribute_key?: Array<{ key: string; value: string }>;
  properties?: any;
}

export default function OrderHistory({ cdpUserId, sessionId }: { cdpUserId: string; sessionId: string }) {
  const { t } = useTranslation();
  const { cdpId } = useParams<{ cdpId: string }>();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<ApiEventListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<ParsedOrderData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parse properties JSON string to extract order details
  const parseOrderProperties = (propertiesStr: string): any => {
    try {
      return JSON.parse(propertiesStr);
    } catch (error) {
      console.error("Failed to parse order properties:", error);
      return {};
    }
  };

  // Convert API event to parsed order data
  const convertEventToOrder = (event: ApiEvent): ParsedOrderData => {
    const properties = parseOrderProperties(event.properties);

    // 解析 matched_attribute_key (same logic as SessionTimeline)
    let matchedAttributeKey: Array<{ key: string; value: string }> | undefined;
    if (properties.matched_attribute_key) {
      try {
        matchedAttributeKey = JSON.parse(properties.matched_attribute_key);
      } catch (error) {
        console.error("Failed to parse matched_attribute_key:", error);
      }
    }

    return {
      orderId: properties.sn || event.id,
      orderTime: event.gmtCreate,
      status: getStatusText(properties.status),
      itemCount: properties.line_items?.length || 0,
      totalAmount: properties.total_amount || event.price,
      currency: event.currency,
      paymentMethod: properties.payment_method || "",
      lineItems: properties.line_items || [],
      shippingAddress: properties.shipping_address || "",
      consignee: properties.consignee || "",
      phone: properties.phone || "",
      sn: properties.sn || "",
      subtotalAmount: properties.subtotal_amount || "",
      taxAmount: properties.tax_amount || "",
      shippingAmount: properties.shipping_amount || "",
      discountAmout: properties.discount_amount || "",
      userName: event.userName || "",
      matched_attribute_key: matchedAttributeKey,
      properties: properties,
    };
  };

  // Get status text based on status code
  const getStatusText = (status: string): string => {
    switch (status) {
      case "unconfirmed":
        return t("orderHistory.status.unconfirmed");
      case "confirmed":
        return t("orderHistory.status.confirmed");
      case "completed":
        return t("orderHistory.status.completed");
      case "cancelled":
        return t("orderHistory.status.cancelled");
      default:
        return t("orderHistory.status.unknown");
    }
  };

  // Fetch event data
  const fetchEventData = useCallback(
    async (page: number) => {
      if (!cdpUserId) return;

      setLoading(true);
      try {
        // Use eventType: 2 (behavior data) and filter by eventName "结账 Checkout"
        const data = await getUserEventList(cdpUserId, sessionId, page, pageSize, 2, {
          eventName: "结账 Checkout",
        });

        if (data) {
          // Flatten session-based data: extract all events from all sessions
          const flattenedEvents: ApiEvent[] = [];
          data.records.forEach((session) => {
            if (session.eventList && Array.isArray(session.eventList)) {
              flattenedEvents.push(...session.eventList);
            }
          });

          // Create a modified response with flattened events
          const flattenedData: ApiEventListResponse = {
            records: flattenedEvents as any, // Type assertion needed due to structure difference
            total: data.total,
            size: data.size,
            current: data.current,
            orders: data.orders,
            optimizeCountSql: data.optimizeCountSql,
            searchCount: data.searchCount,
            countId: data.countId,
            maxLimit: data.maxLimit,
            pages: data.pages,
          };

          setEventData(flattenedData);
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setLoading(false);
      }
    },
    [cdpUserId, pageSize, sessionId],
  );

  // Load data on component mount and page change
  useEffect(() => {
    fetchEventData(currentPage);
  }, [fetchEventData, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle row click to show order details
  const handleRowClick = (event: ApiEvent) => {
    const orderData = convertEventToOrder(event);
    setSelectedOrder(orderData);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Format currency with symbol
  const formatCurrency = (amount: number, currency: string) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${currency}${formatted}`;
  };

  // 动态生成表格列 - 基于 matched_attribute_key
  const columns = useMemo((): ColumnsType<any> => {
    if (!eventData || eventData.records.length === 0) return [];

    // 收集所有事件的 matched_attribute_key
    const allKeys = new Set<string>();
    (eventData.records as any[]).forEach((event: ApiEvent) => {
      const orderData = convertEventToOrder(event);
      if (orderData.matched_attribute_key) {
        orderData.matched_attribute_key.forEach((attr) => {
          allKeys.add(attr.key);
        });
      }
    });

    // 生成动态列
    const dynamicColumns: ColumnsType<any> = Array.from(allKeys).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
      render: (_: any, record: ApiEvent) => {
        const orderData = convertEventToOrder(record);
        return orderData.properties?.[key] || "-";
      },
    }));

    return dynamicColumns;
  }, [eventData]);

  // Get status badge component
  const getStatusBadge = (status: string) => {
    let bgColor = "bg-slate-100";
    let textColor = "text-slate-800";

    switch (status) {
      case t("orderHistory.status.completed"):
        bgColor = "bg-success-light";
        textColor = "text-success";
        break;
      case t("orderHistory.status.cancelled"):
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      case t("orderHistory.status.paid"):
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case t("orderHistory.status.pending"):
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case t("orderHistory.status.shipped"):
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
    }

    return <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>{status}</span>;
  };

  // Calculate pagination info
  const totalPages = eventData ? Math.ceil(eventData.total / pageSize) : 0;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, eventData?.total || 0);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t("orderHistory.title")}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">{t("orderHistory.loading")}</div>
        </div>
      </div>
    );
  }

  if (!eventData || eventData.records.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t("orderHistory.title")}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">{t("orderHistory.noData")}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Order History Component */}
      <div className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{t("orderHistory.title")}</h3>
          <div className="text-sm text-slate-500">
            {t("orderHistory.recordsInfo", { total: eventData.total, start: startItem, end: endItem })}
          </div>
        </div>

        {/* Order List Table - Ant Design */}
        <Table
          columns={columns}
          dataSource={eventData.records}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: eventData.total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          onRow={(record) => ({
            // onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
        />
      </div>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">{t("orderHistory.modal.title")}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Information */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">{t("orderHistory.modal.orderInfo")}</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.orderNumber")}:</dt>
                      <dd className="text-slate-900 font-medium">{selectedOrder.sn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.orderTime")}:</dt>
                      <dd className="text-slate-900">{selectedOrder.orderTime}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.orderStatus")}:</dt>
                      <dd className="text-slate-900">{getStatusBadge(selectedOrder.status)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.paymentMethod")}:</dt>
                      <dd className="text-slate-900">
                        {selectedOrder.paymentMethod || t("orderHistory.modal.unknown")}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.consignee")}:</dt>
                      <dd className="text-slate-900">{selectedOrder.consignee || t("orderHistory.modal.unknown")}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.phone")}:</dt>
                      <dd className="text-slate-900">{selectedOrder.phone || t("orderHistory.modal.unknown")}</dd>
                    </div>
                  </dl>
                </div>

                {/* Amount Details */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">{t("orderHistory.modal.amountDetails")}</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between  border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.subtotalAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(selectedOrder.subtotalAmount, selectedOrder.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between  border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.shippingAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(selectedOrder.shippingAmount, selectedOrder.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between  border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.taxAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(selectedOrder.taxAmount, selectedOrder.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.totalAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">{t("orderHistory.modal.orderItems")}</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left font-medium text-slate-500">
                          {t("orderHistory.modal.fields.productSn")}
                        </th>
                        <th className="p-3 text-right font-medium text-slate-500">
                          {t("orderHistory.modal.fields.unitPrice")}
                        </th>
                        <th className="p-3 text-center font-medium text-slate-500">
                          {t("orderHistory.modal.fields.quantity")}
                        </th>
                        <th className="p-3 text-right font-medium text-slate-500">
                          {t("orderHistory.modal.fields.totalPrice")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedOrder.lineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="p-3 text-slate-900">{item.sn}</td>
                          <td className="p-3 text-right text-slate-600">
                            {formatCurrency(item.price, selectedOrder.currency)}
                          </td>
                          <td className="p-3 text-center text-slate-600">{item.count}</td>
                          <td className="p-3 text-right font-medium text-slate-900">
                            {formatCurrency(item.totalPrice, selectedOrder.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">{t("orderHistory.modal.shippingAddress")}</h4>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.userName || ""} {"  "}
                    {selectedOrder.phone || ""}
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedOrder.consignee || ""}
                    {selectedOrder.shippingAddress || ""}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">{t("orderHistory.modal.billingAddress")}</h4>
                  <p className="text-sm text-slate-600">{t("orderHistory.modal.sameAsShipping")}</p>
                </div>
              </div>

              {/* Matched Attribute Key - 显示匹配的属性字段 (same as SessionTimeline) */}
              {selectedOrder.matched_attribute_key && selectedOrder.matched_attribute_key.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">匹配属性</h4>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    {selectedOrder.matched_attribute_key.map((attr, index) => (
                      <div key={index} className="mb-2 last:mb-0 text-sm">
                        <span className="text-slate-500">{attr.key}:</span>{" "}
                        <span className="font-medium text-slate-900">
                          {selectedOrder.properties?.[attr.key] || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

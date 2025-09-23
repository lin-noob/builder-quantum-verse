import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getUserEventList,
  type ApiEvent,
  type ApiEventListResponse,
} from "@/lib/profile";

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
}

export default function OrderHistory({
  cdpUserId,
  sessionId,
}: {
  cdpUserId: string;
  sessionId: string;
}) {
  const { t } = useTranslation();
  const { cdpId } = useParams<{ cdpId: string }>();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<ApiEventListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ParsedOrderData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

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
    };
  };

  // Get status text based on status code
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return t("orderHistory.status.unconfirmed");
      case 1:
        return t("orderHistory.status.confirmed");
      case 2:
        return t("orderHistory.status.completed");
      case 3:
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
        const data = await getUserEventList(
          cdpUserId,
          sessionId,
          page,
          pageSize,
          1,
        ); // 0 for order data
        setEventData(data);
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

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}
      >
        {status}
      </span>
    );
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

        {/* Order List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 font-medium">{t("orderHistory.table.orderNumber")}</th>
                <th className="p-3 font-medium">{t("orderHistory.table.orderTime")}</th>
                <th className="p-3 font-medium">{t("orderHistory.table.status")}</th>
                <th className="p-3 font-medium text-center">{t("orderHistory.table.itemCount")}</th>
                <th className="p-3 font-medium text-right">{t("orderHistory.table.orderAmount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {eventData.records.map((event) => {
                const orderData = convertEventToOrder(event);
                return (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleRowClick(event)}
                  >
                    <td className="p-3 font-medium text-slate-900">
                      {orderData.sn}
                    </td>
                    <td className="p-3 text-slate-600">
                      {orderData.orderTime}
                    </td>
                    <td className="p-3">{getStatusBadge(orderData.status)}</td>
                    <td className="p-3 text-center text-slate-600">
                      {orderData.itemCount}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-900">
                      {formatCurrency(
                        orderData.totalAmount,
                        orderData.currency,
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              {t("orderHistory.pagination.page", { current: currentPage, total: totalPages })}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("orderHistory.pagination.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                {t("orderHistory.pagination.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Order Information */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">
                    {t("orderHistory.modal.orderInfo")}
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.orderNumber")}:</dt>
                      <dd className="text-slate-900 font-medium">
                        {selectedOrder.sn}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.orderTime")}:</dt>
                      <dd className="text-slate-900">
                        {selectedOrder.orderTime}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.orderStatus")}:</dt>
                      <dd className="text-slate-900">
                        {getStatusBadge(selectedOrder.status)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.paymentMethod")}:</dt>
                      <dd className="text-slate-900">
                        {selectedOrder.paymentMethod || t("orderHistory.modal.unknown")}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.consignee")}:</dt>
                      <dd className="text-slate-900">
                        {selectedOrder.consignee || t("orderHistory.modal.unknown")}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">{t("orderHistory.modal.fields.phone")}:</dt>
                      <dd className="text-slate-900">
                        {selectedOrder.phone || t("orderHistory.modal.unknown")}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Amount Details */}
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">
                    {t("orderHistory.modal.amountDetails")}
                  </h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between  border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.subtotalAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(
                          selectedOrder.subtotalAmount,
                          selectedOrder.currency,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between  border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.shippingAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(
                          selectedOrder.shippingAmount,
                          selectedOrder.currency,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between  border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.taxAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(
                          selectedOrder.taxAmount,
                          selectedOrder.currency,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 font-medium">
                      <dt className="text-slate-900">{t("orderHistory.modal.fields.totalAmount")}:</dt>
                      <dd className="text-slate-900">
                        {formatCurrency(
                          selectedOrder.totalAmount,
                          selectedOrder.currency,
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  {t("orderHistory.modal.orderItems")}
                </h4>
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
                          <td className="p-3 text-center text-slate-600">
                            {item.count}
                          </td>
                          <td className="p-3 text-right font-medium text-slate-900">
                            {formatCurrency(
                              item.totalPrice,
                              selectedOrder.currency,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-3">
                    {t("orderHistory.modal.shippingAddress")}
                  </h4>
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
                  <h4 className="text-sm font-medium text-slate-900 mb-3">
                    {t("orderHistory.modal.billingAddress")}
                  </h4>
                  <p className="text-sm text-slate-600">{t("orderHistory.modal.sameAsShipping")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

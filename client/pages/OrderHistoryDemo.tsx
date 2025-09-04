import OrderHistory from "@/components/OrderHistory";

export default function OrderHistoryDemo() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">订单历史系统演示</h1>
          <p className="text-gray-600 mt-1">完整的订单列表和详情弹窗功能演示</p>
        </div>

        <OrderHistory />
      </div>
    </div>
  );
}

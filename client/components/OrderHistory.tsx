import { useEffect } from 'react';

// Order data according to specifications
const ordersData = [
  {
    orderId: 'ORD-20250801-001',
    order_time: '2025-08-01 10:15:30',
    status: '已完成',
    item_count: 2,
    subtotal_amount: 1899.00,
    shipping_amount: 0.00,
    tax_amount: 0.00,
    discount_amount: 189.90,
    total_amount: 1709.10,
    currency: 'CNY',
    payment_method: '支付宝',
    discount_code: 'NEWUSER10',
    line_items: [
      { name: 'ProBook X1 笔记本电脑', price: 1599.00, qty: 1, total: 1599.00 },
      { name: '无线鼠标 G-Pro', price: 300.00, qty: 1, total: 300.00 },
    ],
    shipping_address: '李四, 138****1234<br>上海市黄浦区人民路100号, 200001',
    billing_address: '同收货地址'
  },
  {
    orderId: 'ORD-20250615-005',
    order_time: '2025-06-15 20:45:10',
    status: '已完成',
    item_count: 2,
    subtotal_amount: 250.00,
    shipping_amount: 10.00,
    tax_amount: 0.00,
    discount_amount: 0.00,
    total_amount: 260.00,
    currency: 'CNY',
    payment_method: '微信支付',
    discount_code: null,
    line_items: [
      { name: '键盘膜', price: 50.00, qty: 1, total: 50.00 },
      { name: 'USB-C扩展坞', price: 200.00, qty: 1, total: 200.00 },
    ],
    shipping_address: '李四, 138****1234<br>上海市黄浦区人民路100号, 200001',
    billing_address: '同收货地址'
  },
  {
    orderId: 'ORD-20250401-012',
    order_time: '2025-04-01 12:05:00',
    status: '已取消',
    item_count: 1,
    subtotal_amount: 3500.00,
    shipping_amount: 0.00,
    tax_amount: 0.00,
    discount_amount: 0.00,
    total_amount: 3500.00,
    currency: 'CNY',
    payment_method: '银行卡',
    discount_code: null,
    line_items: [
      { name: '高端单反相机 EOS-R5', price: 3500.00, qty: 1, total: 3500.00 },
    ],
    shipping_address: '李四, 138****1234<br>上海市黄浦区人民路100号, 200001',
    billing_address: '同收货地址'
  }
];

export default function OrderHistory() {
  useEffect(() => {
    // Initialize order list
    renderOrderList();
    
    // Add event listeners
    setupEventListeners();
    
    return () => {
      // Cleanup event listeners
      const tbody = document.getElementById('order-list-body');
      const closeBtn = document.getElementById('close-modal-btn');
      const modal = document.getElementById('order-detail-modal');
      
      if (tbody) {
        tbody.removeEventListener('click', handleRowClick);
      }
      if (closeBtn) {
        closeBtn.removeEventListener('click', closeModal);
      }
      if (modal) {
        modal.removeEventListener('click', handleModalBackgroundClick);
      }
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === '已完成') {
      return `<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">${status}</span>`;
    } else if (status === '已取消') {
      return `<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">${status}</span>`;
    }
    return `<span class="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-800">${status}</span>`;
  };

  const renderOrderList = () => {
    const tbody = document.getElementById('order-list-body');
    if (!tbody) return;

    tbody.innerHTML = ordersData.map(order => `
      <tr class="hover:bg-slate-50 cursor-pointer" data-order-id="${order.orderId}">
        <td class="p-3 font-medium text-slate-900">${order.orderId}</td>
        <td class="p-3 text-slate-600">${order.order_time}</td>
        <td class="p-3">${getStatusBadge(order.status)}</td>
        <td class="p-3 text-center text-slate-600">${order.item_count}</td>
        <td class="p-3 text-right font-medium text-slate-900">${formatCurrency(order.total_amount)}</td>
      </tr>
    `).join('');
  };

  const handleRowClick = (e: Event) => {
    const row = (e.target as Element).closest('tr');
    if (!row) return;

    const orderId = row.getAttribute('data-order-id');
    if (!orderId) return;

    const orderData = ordersData.find(order => order.orderId === orderId);
    if (!orderData) return;

    populateModal(orderData);
    openModal();
  };

  const populateModal = (order: any) => {
    // Populate order information
    const modalOrderId = document.getElementById('modal-order-id');
    const modalOrderTime = document.getElementById('modal-order-time');
    const modalOrderStatus = document.getElementById('modal-order-status');
    const modalPaymentMethod = document.getElementById('modal-payment-method');
    const modalDiscountCode = document.getElementById('modal-discount-code');

    if (modalOrderId) modalOrderId.textContent = order.orderId;
    if (modalOrderTime) modalOrderTime.textContent = order.order_time;
    if (modalOrderStatus) modalOrderStatus.innerHTML = getStatusBadge(order.status);
    if (modalPaymentMethod) modalPaymentMethod.textContent = order.payment_method;
    if (modalDiscountCode) modalDiscountCode.textContent = order.discount_code || '无';

    // Populate amount details
    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalShipping = document.getElementById('modal-shipping');
    const modalTax = document.getElementById('modal-tax');
    const modalDiscount = document.getElementById('modal-discount');
    const modalTotal = document.getElementById('modal-total');

    if (modalSubtotal) modalSubtotal.textContent = formatCurrency(order.subtotal_amount);
    if (modalShipping) modalShipping.textContent = formatCurrency(order.shipping_amount);
    if (modalTax) modalTax.textContent = formatCurrency(order.tax_amount);
    if (modalDiscount) modalDiscount.textContent = order.discount_amount > 0 ? `-${formatCurrency(order.discount_amount)}` : formatCurrency(0);
    if (modalTotal) modalTotal.textContent = formatCurrency(order.total_amount);

    // Populate line items
    const modalLineItems = document.getElementById('modal-line-items');
    if (modalLineItems) {
      modalLineItems.innerHTML = order.line_items.map((item: any) => `
        <tr>
          <td class="p-3 text-slate-900">${item.name}</td>
          <td class="p-3 text-right text-slate-600">${formatCurrency(item.price)}</td>
          <td class="p-3 text-center text-slate-600">${item.qty}</td>
          <td class="p-3 text-right font-medium text-slate-900">${formatCurrency(item.total)}</td>
        </tr>
      `).join('');
    }

    // Populate addresses
    const modalShippingAddress = document.getElementById('modal-shipping-address');
    const modalBillingAddress = document.getElementById('modal-billing-address');

    if (modalShippingAddress) modalShippingAddress.innerHTML = order.shipping_address;
    if (modalBillingAddress) modalBillingAddress.innerHTML = order.billing_address;
  };

  const openModal = () => {
    const modal = document.getElementById('order-detail-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    const modal = document.getElementById('order-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  const handleModalBackgroundClick = (e: Event) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const setupEventListeners = () => {
    const tbody = document.getElementById('order-list-body');
    const closeBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('order-detail-modal');

    if (tbody) {
      tbody.addEventListener('click', handleRowClick);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', handleModalBackgroundClick);
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });
  };

  return (
    <>
      {/* Order History Component */}
      <div className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">订单历史</h3>
        
        {/* Order List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 font-medium">订单号</th>
                <th className="p-3 font-medium">下单时间</th>
                <th className="p-3 font-medium">状态</th>
                <th className="p-3 font-medium text-center">商品件数</th>
                <th className="p-3 font-medium text-right">订单总金额</th>
              </tr>
            </thead>
            <tbody id="order-list-body" className="divide-y divide-slate-200">
              {/* Order rows will be rendered here by JavaScript */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <div 
        id="order-detail-modal" 
        className="fixed inset-0 z-50 flex items-center justify-center hidden"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">订单详情</h3>
            <button id="close-modal-btn" className="text-slate-400 hover:text-slate-600">
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
                <h4 className="text-sm font-medium text-slate-900 mb-3">订单信息</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">订单号:</dt>
                    <dd id="modal-order-id" className="text-slate-900 font-medium"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">下单时间:</dt>
                    <dd id="modal-order-time" className="text-slate-900"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">订单状态:</dt>
                    <dd id="modal-order-status" className="text-slate-900"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">支付方式:</dt>
                    <dd id="modal-payment-method" className="text-slate-900"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">优惠码:</dt>
                    <dd id="modal-discount-code" className="text-slate-900"></dd>
                  </div>
                </dl>
              </div>

              {/* Amount Details */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3">金额明细</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">商品总价:</dt>
                    <dd id="modal-subtotal" className="text-slate-900"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">运费:</dt>
                    <dd id="modal-shipping" className="text-slate-900"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">税费:</dt>
                    <dd id="modal-tax" className="text-slate-900"></dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">优惠金额:</dt>
                    <dd id="modal-discount" className="text-green-600"></dd>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-medium">
                    <dt className="text-slate-900">订单总金额:</dt>
                    <dd id="modal-total" className="text-slate-900"></dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-900 mb-3">订单明细</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left font-medium text-slate-500">商品名称</th>
                      <th className="p-3 text-right font-medium text-slate-500">单价</th>
                      <th className="p-3 text-center font-medium text-slate-500">数量</th>
                      <th className="p-3 text-right font-medium text-slate-500">总价</th>
                    </tr>
                  </thead>
                  <tbody id="modal-line-items" className="divide-y divide-slate-200">
                    {/* Line items will be populated by JavaScript */}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3">收货地址</h4>
                <p id="modal-shipping-address" className="text-sm text-slate-600"></p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3">账单地址</h4>
                <p id="modal-billing-address" className="text-sm text-slate-600"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect } from "react";

// 会话数据结构
const sessionsData = [
  {
    sessionId: "session-1",
    session_start_time: "2025-08-05 14:30:15",
    source_info: "Google搜索",
    device_type: "桌面端",
    os: "macOS",
    browser: "Chrome",
    location: "上海市",
    ip_address: "116.228.***.***",
    session_duration: "25分钟",
    event_count: 3,
    events: [
      {
        event_time: "14:30:15",
        event_type: "page_view",
        page_title: "首页 - 我们的网站",
        page_url: "/",
        page_dwell_time: "1分20秒",
        page_scroll_depth: "85%",
      },
      {
        event_time: "14:31:35",
        event_type: "page_view",
        page_title: "产品列表 - 电子产品",
        page_url: "/products",
        page_dwell_time: "5分10秒",
        page_scroll_depth: "100%",
      },
      {
        event_time: "14:36:45",
        event_type: "add_to_cart",
        page_title: '将"ProBook X1"加入购物车',
        page_url: "/products/probook-x1",
        page_dwell_time: "N/A",
        page_scroll_depth: "N/A",
      },
    ],
  },
  {
    sessionId: "session-2",
    session_start_time: "2025-08-01 10:05:30",
    source_info: "直接访问",
    device_type: "移动端",
    os: "iOS",
    browser: "Safari",
    location: "上海市",
    ip_address: "116.228.***.***",
    session_duration: "13分钟",
    event_count: 4,
    events: [
      {
        event_time: "10:05:30",
        event_type: "page_view",
        page_title: "购物车",
        page_url: "/cart",
        page_dwell_time: "3分",
        page_scroll_depth: "60%",
      },
      {
        event_time: "10:08:30",
        event_type: "start_checkout",
        page_title: "开始结账流程",
        page_url: "/checkout",
        page_dwell_time: "N/A",
        page_scroll_depth: "N/A",
      },
      {
        event_time: "10:12:00",
        event_type: "page_view",
        page_title: "支付页面",
        page_url: "/checkout/pay",
        page_dwell_time: "3分",
        page_scroll_depth: "100%",
      },
      {
        event_time: "10:15:00",
        event_type: "purchase",
        page_title: "完成订单 ORD-20250801-001",
        page_url: "/thank-you",
        page_dwell_time: "N/A",
        page_scroll_depth: "N/A",
      },
    ],
  },
  {
    sessionId: "session-3",
    session_start_time: "2025-07-20 09:15:00",
    source_info: "邮件营销",
    device_type: "桌面端",
    os: "Windows",
    browser: "Edge",
    location: "北京市",
    ip_address: "220.181.***.***",
    session_duration: "5分钟",
    event_count: 1,
    events: [
      {
        event_time: "09:15:00",
        event_type: "page_view",
        page_title: "夏季促销活动页",
        page_url: "/promo/summer-sale",
        page_dwell_time: "5分钟",
        page_scroll_depth: "95%",
      },
    ],
  },
];

export default function SessionTimeline() {
  useEffect(() => {
    // 初始化会话列表
    renderSessionList();

    // 添加事件监听器
    setupEventListeners();

    return () => {
      // 清理事件监听器
      const tbody = document.getElementById("session-list-body");
      const closeBtn = document.getElementById("close-modal-btn");
      const modal = document.getElementById("session-detail-modal");

      if (tbody) {
        tbody.removeEventListener("click", handleRowClick);
      }
      if (closeBtn) {
        closeBtn.removeEventListener("click", closeModal);
      }
      if (modal) {
        modal.removeEventListener("click", handleModalBackgroundClick);
      }
    };
  }, []);

  const getEventTypeBadge = (eventType: string) => {
    const badgeClass =
      "px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded-full";
    const typeMap: { [key: string]: string } = {
      page_view: "页面浏览",
      add_to_cart: "加入购物车",
      start_checkout: "开始结账",
      purchase: "完成购买",
    };
    return `<span class="${badgeClass}">${typeMap[eventType] || eventType}</span>`;
  };

  const renderSessionList = () => {
    const tbody = document.getElementById("session-list-body");
    if (!tbody) return;

    tbody.innerHTML = sessionsData
      .map(
        (session) => `
      <tr class="hover:bg-slate-50 cursor-pointer" data-session-id="${session.sessionId}">
        <td class="p-3 text-slate-900 font-medium">${session.session_start_time}</td>
        <td class="p-3 text-slate-600">${session.source_info}</td>
        <td class="p-3 text-slate-600">${session.device_type}</td>
        <td class="p-3 text-slate-600">${session.session_duration}</td>
        <td class="p-3 text-center text-slate-600">${session.event_count}</td>
        <td class="p-3 text-slate-600">${session.location}</td>
      </tr>
    `,
      )
      .join("");
  };

  const handleRowClick = (e: Event) => {
    const row = (e.target as Element).closest("tr");
    if (!row) return;

    const sessionId = row.getAttribute("data-session-id");
    if (!sessionId) return;

    const sessionData = sessionsData.find(
      (session) => session.sessionId === sessionId,
    );
    if (!sessionData) return;

    populateModal(sessionData);
    openModal();
  };

  const populateModal = (session: any) => {
    // 填充访问概览
    const modalSessionSummary = document.getElementById(
      "modal-session-summary",
    );
    if (modalSessionSummary) {
      modalSessionSummary.innerHTML = `
        <div>
          <div class="text-xs text-slate-500">会话开始时间</div>
          <div class="font-medium text-slate-900">${session.session_start_time}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">访问来源</div>
          <div class="font-medium text-slate-900">${session.source_info}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">设备信息</div>
          <div class="font-medium text-slate-900">${session.device_type} (${session.os}, ${session.browser})</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">位置 & IP</div>
          <div class="font-medium text-slate-900">${session.location}, ${session.ip_address}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">会话时长</div>
          <div class="font-medium text-slate-900">${session.session_duration}</div>
        </div>
        <div>
          <div class="text-xs text-slate-500">事件总数</div>
          <div class="font-medium text-slate-900">${session.event_count} 个事件</div>
        </div>
      `;
    }

    // 填充事件时间线
    const modalEventTimeline = document.getElementById("modal-event-timeline");
    if (modalEventTimeline) {
      modalEventTimeline.innerHTML = session.events
        .map(
          (event: any) => `
        <tr>
          <td class="p-3 text-slate-900 font-medium">${event.event_time}</td>
          <td class="p-3">${getEventTypeBadge(event.event_type)}</td>
          <td class="p-3 text-slate-900">
            <div class="font-medium">${event.page_title}</div>
            <div class="text-xs text-slate-500 mt-1">${event.page_url}</div>
          </td>
          <td class="p-3 text-slate-600">${event.page_dwell_time}</td>
          <td class="p-3 text-slate-600">${event.page_scroll_depth}</td>
        </tr>
      `,
        )
        .join("");
    }
  };

  const openModal = () => {
    const modal = document.getElementById("session-detail-modal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    const modal = document.getElementById("session-detail-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  };

  const handleModalBackgroundClick = (e: Event) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const setupEventListeners = () => {
    const tbody = document.getElementById("session-list-body");
    const closeBtn = document.getElementById("close-modal-btn");
    const modal = document.getElementById("session-detail-modal");

    if (tbody) {
      tbody.addEventListener("click", handleRowClick);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
      modal.addEventListener("click", handleModalBackgroundClick);
    }

    // ESC键关闭模态框
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
  };

  return (
    <>
      {/* 会话概览列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          访问与行为时间线
        </h3>

        {/* 数据表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 font-medium">访问时间</th>
                <th className="p-3 font-medium">来源</th>
                <th className="p-3 font-medium">设备</th>
                <th className="p-3 font-medium">会话时长</th>
                <th className="p-3 font-medium text-center">事件数</th>
                <th className="p-3 font-medium">位置</th>
              </tr>
            </thead>
            <tbody id="session-list-body" className="divide-y divide-slate-200">
              {/* 会话行将由 JavaScript 渲染 */}
            </tbody>
          </table>
        </div>
      </div>

      {/* 会话详情弹窗 */}
      <div
        id="session-detail-modal"
        className="fixed inset-0 z-50 flex items-center justify-center hidden"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* 弹窗头部 */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">会话详情</h3>
            <button
              id="close-modal-btn"
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

          {/* 弹窗主体 */}
          <div className="p-6 overflow-y-auto">
            {/* 访问概览区 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-900 mb-3">
                访问概览
              </h4>
              <div
                id="modal-session-summary"
                className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-4 bg-slate-50 rounded-lg"
              >
                {/* 概览信息将由 JavaScript 填充 */}
              </div>
            </div>

            {/* 事件时间线区 */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">
                事件时间线
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 text-left font-medium text-slate-500">
                        事件时间
                      </th>
                      <th className="p-3 text-left font-medium text-slate-500">
                        事件类型
                      </th>
                      <th className="p-3 text-left font-medium text-slate-500">
                        页面/事件描述
                      </th>
                      <th className="p-3 text-left font-medium text-slate-500">
                        停留时长
                      </th>
                      <th className="p-3 text-left font-medium text-slate-500">
                        滚动深度
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    id="modal-event-timeline"
                    className="divide-y divide-slate-200"
                  >
                    {/* 事件行将由 JavaScript 填充 */}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

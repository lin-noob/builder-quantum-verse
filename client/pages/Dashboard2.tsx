import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BubbleController,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BubbleController
);

export default function Dashboard2() {
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const rfmChartRef = useRef<HTMLCanvasElement>(null);

  // Performance Trend Chart
  useEffect(() => {
    const ctx = performanceChartRef.current?.getContext('2d');
    if (!ctx) return;

    try {
      const chart = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日', '1月8日', '1月9日', '1月10日'],
          datasets: [
            {
              label: '总消费金额',
              data: [50000, 62000, 68000, 65000, 72000, 75000, 82000, 78000, 90000, 95000],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              yAxisID: 'y',
            },
            {
              label: '总订单数',
              data: [180, 220, 240, 230, 250, 260, 290, 270, 320, 340],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              yAxisID: 'y1',
            },
            {
              label: '总用户数',
              data: [350, 355, 360, 362, 368, 370, 375, 372, 380, 385],
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              yAxisID: 'y1',
            },
            {
              label: '平均客单价',
              data: [277.8, 281.8, 283.3, 282.6, 288.0, 288.5, 282.8, 288.9, 281.3, 279.4],
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              yAxisID: 'y',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index' as const,
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'bottom' as const,
            },
          },
          scales: {
            y: {
              type: 'linear' as const,
              display: true,
              position: 'left' as const,
              title: {
                display: true,
                text: '金额 (元)',
              },
            },
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              title: {
                display: true,
                text: '数量',
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      });

      return () => chart.destroy();
    } catch (error) {
      console.error('Performance chart error:', error);
    }
  }, []);

  // RFM Matrix Chart
  useEffect(() => {
    const ctx = rfmChartRef.current?.getContext('2d');
    if (!ctx) return;

    try {
      const chart = new ChartJS(ctx, {
        type: 'bubble',
        data: {
          datasets: [
            {
              label: 'RFM 价值矩阵',
              data: [
                { x: 4.5, y: 4.8, r: 30 },
                { x: 4.2, y: 2.5, r: 15 },
                { x: 2.1, y: 4.5, r: 10 },
                { x: 2.5, y: 2.2, r: 8 },
                { x: 1.5, y: 1.8, r: 5 },
              ],
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
              borderColor: 'rgba(59, 130, 246, 1)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'R - 近度分数',
              },
            },
            y: {
              title: {
                display: true,
                text: 'F - 频度分数',
              },
            },
          },
        },
      });

      return () => chart.destroy();
    } catch (error) {
      console.error('RFM chart error:', error);
    }
  }, []);

  // Activity Heatmap Data
  const heatmapData = [
    [5, 10, 30, 45, 60, 20],
    [8, 12, 35, 50, 70, 25],
    [10, 15, 40, 60, 80, 30],
    [12, 18, 45, 65, 85, 35],
    [20, 25, 60, 80, 100, 50],
    [18, 22, 50, 70, 90, 45],
    [15, 18, 40, 55, 75, 30],
  ];

  const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const hourLabels = ['0-4时', '4-8时', '8-12时', '12-16时', '16-20时', '20-24时'];

  // Keyword Cloud Data
  const keywordData = [
    { text: '笔记本电脑', size: 40 },
    { text: '户外徒步鞋', size: 32 },
    { text: '咖啡豆', size: 28 },
    { text: '无线耳机', size: 25 },
    { text: '机械键盘', size: 22 },
    { text: '无人机', size: 20 },
    { text: '摄影入门', size: 18 },
    { text: '帐篷', size: 16 },
    { text: '瑜伽垫', size: 14 },
  ];

  // Lifecycle Funnel Data
  const lifecycleData = [
    { stage: '认知', count: 3456, conversion: 0 },
    { stage: '考虑', count: 1890, conversion: 54.7 },
    { stage: '首次购买', count: 1120, conversion: 59.3 },
    { stage: '忠诚', count: 756, conversion: 67.5 },
    { stage: '流失', count: 210, conversion: 0 },
  ];

  // Acquisition Channels Data
  const acquisitionData = [
    { source: '付费搜索', value: 1024, percentage: 45 },
    { source: '自然搜索', value: 680, percentage: 30 },
    { source: '社交媒体', value: 340, percentage: 15 },
    { source: '直接访问', value: 113, percentage: 5 },
    { source: '引荐', value: 101, percentage: 5 },
  ];

  // Top Categories Data
  const categoriesData = [
    { name: '电子产品', value: 350000, percentage: 40 },
    { name: '户外运动', value: 280000, percentage: 32 },
    { name: '图书音像', value: 150000, percentage: 17 },
    { name: '家居生活', value: 80000, percentage: 9 },
    { name: '服饰鞋包', value: 20000, percentage: 2 },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-[Inter]">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">战略业务洞察</h1>
            <p className="text-slate-500 mt-1">从宏观业绩到微观洞察，全面掌握您的用户与业务脉搏。</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              type="text"
              value="2025-07-11 - 2025-08-09"
              readOnly
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full sm:w-64 p-2.5"
            />
          </div>
        </div>

        {/* Core Performance Overview */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">核心业绩概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">总消费金额</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">¥1,254,680</p>
              <p className="text-green-600 text-sm mt-1">+5.2%</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">总订单数</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">8,247</p>
              <p className="text-green-600 text-sm mt-1">+12.8%</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">平均客单价</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">¥152.3</p>
              <p className="text-green-600 text-sm mt-1">+8.9%</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">总用户数</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">3,456</p>
              <p className="text-red-600 text-sm mt-1">-2.1%</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">新用户数</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">402</p>
              <p className="text-green-600 text-sm mt-1">+15.0%</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-slate-500">复购率</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">35.4%</p>
              <p className="text-green-600 text-sm mt-1">+2.1 pts</p>
            </div>
          </div>
        </section>

        {/* Performance Trend Analysis */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">业绩走势</h3>
            <div className="chart-container h-96">
              <canvas ref={performanceChartRef} id="performance-trend-chart"></canvas>
            </div>
          </div>
        </section>

        {/* User Value & Lifecycle */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">用户价值与生命周期</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RFM Value Matrix */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">RFM 价值矩阵</h3>
              <p className="text-slate-500 text-sm mb-4">洞察不同价值分群的用户分布与消费贡献。气泡大小代表消费总额。</p>
              <div className="chart-container h-96">
                <canvas ref={rfmChartRef} id="rfm-matrix-chart"></canvas>
              </div>
            </div>

            {/* User Lifecycle Funnel */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">用户生命周期漏斗</h3>
              <p className="text-slate-500 text-sm mb-4">观察用户从认知到忠诚的转化与流失情况。</p>
              <div className="flex flex-col space-y-4" id="lifecycle-funnel">
                {lifecycleData.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center">
                    <div
                      className="flex-1 flex items-center justify-between p-4 rounded-lg"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${0.8 - index * 0.15})`,
                        width: `${100 - index * 15}%`,
                      }}
                    >
                      <span className="text-white font-medium">{stage.stage}</span>
                      <span className="text-white font-bold">{stage.count.toLocaleString()}</span>
                    </div>
                    {index < lifecycleData.length - 1 && stage.conversion > 0 && (
                      <div className="ml-4 text-slate-600 text-sm">
                        {stage.conversion}%
                        <svg className="w-4 h-4 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* User Behavior Insights */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">用户行为偏好洞察</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Heatmap */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">用户活跃度热力图</h3>
              <p className="text-slate-500 text-sm mb-4">发现用户最活跃的星期与时段，颜色越深代表活跃度越高。</p>
              <table className="w-full" id="activity-heatmap">
                <thead>
                  <tr>
                    <th className="text-xs text-slate-500 p-1"></th>
                    {hourLabels.map((hour) => (
                      <th key={hour} className="text-xs text-slate-500 p-1">{hour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, dayIndex) => (
                    <tr key={dayIndex}>
                      <td className="text-xs text-slate-500 p-1">{dayLabels[dayIndex]}</td>
                      {row.map((value, hourIndex) => (
                        <td
                          key={hourIndex}
                          className="p-1"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${value / 100})`,
                            borderRadius: '4px',
                            margin: '1px',
                          }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center text-xs text-white font-medium">
                            {value}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Keyword Cloud */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">热门搜索词云</h3>
              <p className="text-slate-500 text-sm mb-4">直观了解用户的核心关注点与需求。</p>
              <div className="flex flex-wrap justify-center items-center gap-4 h-80" id="keyword-cloud">
                {keywordData.map((keyword, index) => (
                  <span
                    key={keyword.text}
                    className="font-medium text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                    style={{
                      fontSize: `${keyword.size}px`,
                      opacity: 0.7 + (keyword.size / 40) * 0.3,
                    }}
                  >
                    {keyword.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Channel & Category Insights */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">渠道与品类洞察</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Top 5 Acquisition Channels */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 首次触点来源</h3>
              <div className="space-y-4" id="acquisition-channels">
                {acquisitionData.map((channel) => (
                  <div key={channel.source}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{channel.source}</span>
                      <span className="text-sm text-slate-500">{channel.value}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-sky-600 h-2 rounded-full"
                        style={{ width: `${channel.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Categories */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 热销品类</h3>
              <div className="space-y-4" id="top-categories">
                {categoriesData.map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{category.name}</span>
                      <span className="text-sm text-slate-500">¥{(category.value / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopping Cart Insights */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">购物车洞察</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-slate-500 mb-1">历史购物车放弃率</div>
                  <div className="text-2xl font-bold text-red-600">18.5%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">当前购物车总金额</div>
                  <div className="text-2xl font-bold text-slate-900">¥12,480</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

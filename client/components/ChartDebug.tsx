import { getDashboardData } from "@shared/dashboardData";

export default function ChartDebug() {
  const dashboardData = getDashboardData();
  const { performanceMetrics } = dashboardData;

  console.log("Debug - Dashboard data:", dashboardData);
  console.log("Debug - Performance metrics:", performanceMetrics);
  console.log("Debug - First metric data:", performanceMetrics[0]?.data);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">图表数据调试</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>性能指标数量:</strong> {performanceMetrics.length}
        </p>
        <p>
          <strong>指标ID列表:</strong>{" "}
          {performanceMetrics.map((m) => m.id).join(", ")}
        </p>
        {performanceMetrics.map((metric) => (
          <div key={metric.id} className="border-l-2 border-blue-400 pl-3">
            <p>
              <strong>
                {metric.label} ({metric.id}):
              </strong>
            </p>
            <p>数据点数量: {metric.data.length}</p>
            <p>示例数据: {JSON.stringify(metric.data.slice(0, 2), null, 2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

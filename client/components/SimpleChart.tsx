import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const testData = [
  { name: "Jan", value: 100 },
  { name: "Feb", value: 200 },
  { name: "Mar", value: 150 },
  { name: "Apr", value: 300 },
  { name: "May", value: 250 },
];

export default function SimpleChart() {
  return (
    <div className="w-full h-64 bg-white border rounded p-4">
      <h3 className="text-lg font-semibold mb-4">测试图表</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={testData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

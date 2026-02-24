import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

export default function SuperAdminAdvancedAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/api/superadmin/analytics/advanced");

      // 🔥 Convert storage to MB
      const storageInMB = res.data.storageData.map((dept) => ({
        ...dept,
        usedStorageMB: (dept.usedStorage / (1024 * 1024)).toFixed(2),
        storageLimitMB: (dept.storageLimit / (1024 * 1024)).toFixed(2)
      }));

      setData({
        ...res.data,
        storageData: storageInMB
      });

    } catch (err) {
      console.error(err);
    }
  };

  if (!data)
    return <div className="text-gray-500">Loading analytics...</div>;

  const COLORS = ["#0F172A", "#334155", "#64748B", "#94A3B8"];

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold text-gray-800">
        Advanced Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Documents Per Department */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Documents Per Department
          </h2>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.docsPerDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="departmentName" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Bar dataKey="totalDocuments" fill="#0F172A" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Storage Usage Comparison (NOW IN MB) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Storage Comparison (MB)
          </h2>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.storageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="departmentName" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip
                formatter={(value) => `${value} MB`}
              />
              <Legend />
              <Bar
                dataKey="usedStorageMB"
                fill="#0F172A"
                name="Used (MB)"
                radius={[6,6,0,0]}
              />
              <Bar
                dataKey="storageLimitMB"
                fill="#94A3B8"
                name="Limit (MB)"
                radius={[6,6,0,0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trend */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Activity Trend (30 Days)
          </h2>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#121a24" />
              <XAxis dataKey="date" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0F172A"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Action Distribution */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-md">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Action Distribution
          </h2>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.actionDistribution}
                dataKey="total"
                nameKey="actionType"
                outerRadius={80}
                label
              >
                {data.actionDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
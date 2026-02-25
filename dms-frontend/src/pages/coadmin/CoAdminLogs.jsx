import { useEffect, useState } from "react";
import api from "../../services/api";
import { Activity } from "lucide-react";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/api/logs");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString();

return (
  <div className="min-h-[85vh]">

    <h1 className="text-2xl font-semibold text-gray-800 mb-8 flex items-center gap-2">
      <Activity size={20} />
      Activity Logs
    </h1>

    <div className="bg-white border border-gray-200 rounded-2xl p-6">

      {logs.length === 0 ? (
        <p className="text-gray-500">No activity logs found.</p>
      ) : (
        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log.logID}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-700">
                  {log.fullName}
                </td>

                <td className="p-3">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                    {log.actionType}
                  </span>
                </td>

                <td className="p-3 text-gray-600">
                  {log.targetType} #{log.targetID}
                </td>

                <td className="p-3 text-gray-600">
                  {log.description}
                </td>

                <td className="p-3 text-gray-500">
                  {formatDate(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
}